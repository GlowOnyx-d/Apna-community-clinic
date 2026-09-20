/**
 * Comprehensive Firestore Migration Script
 * 
 * 1. Users Migration:
 *    Migrates legacy user docs (e.g. 'admin_sarah', 'doc_patel', 'patient_maya')
 *    to real Firebase Auth UIDs ('users/{realAuthUID}').
 * 
 * 2. Doctors Collection Migration:
 *    Migrates doctor directory profiles (e.g. 'doc_patel') to use the doctor's
 *    real Auth UID so that future bookings made through BookAppointmentModal
 *    automatically record the doctor's real Auth UID.
 * 
 * 3. Appointments Collection Migration:
 *    Generically scans all appointment documents and replaces any legacy doctorId
 *    or patientId with the corresponding real Auth UID.
 * 
 * Future Doctor Migration (e.g., Dr. Khan, Dr. Sharma):
 *    When you create Firebase Auth accounts in the Firebase Console for
 *    'tariq.khan@communityclinic.org' or 'anita.sharma@communityclinic.org',
 *    simply run this script again (`node migrate.js`). The script will:
 *      a) Detect the new Auth user by email via admin.auth().getUserByEmail()
 *      b) Migrate 'doctors/doc_khan' or 'doctors/doc_sharma' to their new Auth UID
 *      c) Update all appointments matching doc_khan / doc_sharma to the new UID
 *    No manual code changes will be required!
 * 
 * Usage:
 *   node migrate.js [optional-path-to-serviceAccountKey.json]
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Potential paths for the service account key
const possibleKeyPaths = [
  process.argv[2],
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  path.join(__dirname, 'serviceAccountKey.json'),
  path.join(__dirname, 'service-account.json'),
  path.join(__dirname, 'credentials.json')
].filter(Boolean);

const keyPath = possibleKeyPaths.find(p => fs.existsSync(p));

if (!keyPath) {
  console.error('\n' + '='.repeat(75));
  console.error(' [ERROR] Firebase Service Account Key Not Found!');
  console.error('='.repeat(75));
  console.error('\nPlace your service account JSON file in this directory as:');
  console.error(`   ${path.join(__dirname, 'serviceAccountKey.json')}`);
  console.error('Then run: node migrate.js\n');
  process.exit(1);
}

console.log(`\n🔑 Using service account key: ${keyPath}`);

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);
const auth = getAuth(app);

// Registry of known legacy IDs mapped to emails
// Note: When you create Auth accounts for Dr. Khan or Dr. Sharma,
// this script will automatically look them up and link them!
const KNOWN_LEGACY_MAP = {
  // Admins
  'admin_sarah': 'admin@communityclinic.org',
  'admin_master_1': 'admin@communityclinic.org',

  // Doctors
  'doc_patel': 'rajesh.patel@communityclinic.org',
  'doc_khan': 'tariq.khan@communityclinic.org',
  'doc_sharma': 'anita.sharma@communityclinic.org',
  'doc_sarah_jenkins': 'doctor.sarah@communityclinic.org',

  // Patients
  'patient_maya': 'maya.sharma@example.com',
  'usr_patient_maya': 'maya.sharma@example.com',
  'patient_vikram': 'vikram.m@example.com',
  'patient_priya': 'priya.sundaram@example.com'
};

/**
 * Builds an active mapping of legacyId -> realAuthUID
 * by querying Firebase Auth for registered emails.
 */
async function buildLegacyToRealUidMap() {
  console.log('\n📡 Resolving Firebase Auth UIDs for known accounts...');
  const legacyToRealUid = {};

  for (const [legacyId, email] of Object.entries(KNOWN_LEGACY_MAP)) {
    try {
      const authUser = await auth.getUserByEmail(email);
      legacyToRealUid[legacyId] = authUser.uid;
      // Also map email directly in case some records stored email as ID
      legacyToRealUid[email.toLowerCase()] = authUser.uid;
      console.log(`   ✓ Mapped '${legacyId}' (${email}) -> Auth UID: ${authUser.uid}`);
    } catch {
      // Auth user doesn't exist yet for this email (e.g. unmigrated or not yet created)
    }
  }

  // Also discover any previously migrated user docs with 'migratedFrom' tag
  try {
    const usersSnap = await db.collection('users').get();
    for (const doc of usersSnap.docs) {
      const data = doc.data();
      if (data.migratedFrom && !legacyToRealUid[data.migratedFrom]) {
        legacyToRealUid[data.migratedFrom] = doc.id;
        console.log(`   ✓ Discovered migration record: '${data.migratedFrom}' -> '${doc.id}'`);
      }
      if (data.email) {
        legacyToRealUid[data.email.toLowerCase()] = doc.id;
      }
    }
  } catch (err) {
    console.warn('   Could not read users collection for dynamic mapping:', err.message);
  }

  return legacyToRealUid;
}

/**
 * PHASE 1: User Documents Migration
 */
async function migrateUsers(legacyToRealUid) {
  console.log('\n' + '='.repeat(75));
  console.log(' PHASE 1: User Profile Document Migration');
  console.log('='.repeat(75));

  const targetLegacyUserDocs = ['admin_sarah', 'doc_patel', 'patient_maya'];
  const results = [];

  for (const legacyId of targetLegacyUserDocs) {
    const legacyDocRef = db.collection('users').doc(legacyId);
    const legacySnap = await legacyDocRef.get();

    if (!legacySnap.exists) {
      console.log(`   ℹ️ Legacy users/${legacyId} already cleaned up or does not exist.`);
      continue;
    }

    const legacyData = legacySnap.data();
    const email = (legacyData.email || KNOWN_LEGACY_MAP[legacyId] || '').trim().toLowerCase();
    const realAuthUid = legacyToRealUid[legacyId];

    if (!realAuthUid) {
      console.warn(`   ⚠️ No Firebase Auth account found for legacy doc '${legacyId}' (${email}). Skipping.`);
      continue;
    }

    const newDocRef = db.collection('users').doc(realAuthUid);
    const migratedData = {
      ...legacyData,
      uid: realAuthUid,
      email: email,
      updatedAt: new Date().toISOString(),
      migratedFrom: legacyId
    };

    await newDocRef.set(migratedData, { merge: true });
    const verify = await newDocRef.get();
    if (verify.exists) {
      await legacyDocRef.delete();
      console.log(`   ✅ users/${legacyId} successfully migrated to users/${realAuthUid}`);
      results.push({ legacyId, realUid: realAuthUid, email, status: 'MIGRATED' });
    }
  }

  if (results.length > 0) {
    console.table(results);
  } else {
    console.log('   ✓ All legacy user profiles are already migrated.');
  }
}

/**
 * PHASE 2: Doctors Collection Migration
 * 
 * When a doctor has a Firebase Auth account, their document in 'doctors'
 * should use their real Auth UID as its doc ID and 'id' field.
 * This ensures that when patients book appointments with this doctor,
 * BookAppointmentModal automatically writes the real Auth UID into doctorId.
 */
async function migrateDoctors(legacyToRealUid) {
  console.log('\n' + '='.repeat(75));
  console.log(' PHASE 2: Doctors Collection Migration');
  console.log('='.repeat(75));

  const doctorsSnap = await db.collection('doctors').get();
  const results = [];

  for (const docSnap of doctorsSnap.docs) {
    const doctorId = docSnap.id;
    const doctorData = docSnap.data();
    const doctorEmail = (doctorData.email || '').trim().toLowerCase();

    // Check if this doctor matches a real Auth UID
    const realAuthUid = legacyToRealUid[doctorId] || legacyToRealUid[doctorEmail];

    if (realAuthUid && doctorId !== realAuthUid) {
      console.log(`\n   🔄 Migrating doctor '${doctorData.name}' from ID '${doctorId}' -> '${realAuthUid}'...`);
      const newDocRef = db.collection('doctors').doc(realAuthUid);

      const updatedDoctorData = {
        ...doctorData,
        id: realAuthUid, // Real Auth UID
        updatedAt: new Date().toISOString(),
        legacyDoctorId: doctorId
      };

      // Write to new doctor ID
      await newDocRef.set(updatedDoctorData, { merge: true });

      // Verify
      const verify = await newDocRef.get();
      if (verify.exists && verify.data().id === realAuthUid) {
        // Delete legacy doc
        await db.collection('doctors').doc(doctorId).delete();
        console.log(`   ✅ Doctor document migrated to doctors/${realAuthUid} and legacy doc deleted.`);
        results.push({
          name: doctorData.name,
          legacyDocId: doctorId,
          realAuthUid,
          email: doctorEmail,
          status: 'MIGRATED'
        });
      }
    } else if (realAuthUid && doctorId === realAuthUid) {
      console.log(`   ✓ Doctor '${doctorData.name}' already keyed to Auth UID: ${realAuthUid}`);
    } else {
      console.log(`   ℹ️ Doctor '${doctorData.name}' (ID: ${doctorId}) has no Auth account yet. Kept as directory listing.`);
    }
  }

  if (results.length > 0) {
    console.table(results);
  }
}

/**
 * PHASE 3: Generic Appointments Collection Migration
 * 
 * Iterates through all appointments in Firestore.
 * If doctorId or patientId matches any known legacy ID or email,
 * it replaces them with the real Auth UID.
 */
async function migrateAppointments(legacyToRealUid) {
  console.log('\n' + '='.repeat(75));
  console.log(' PHASE 3: Appointments Collection Migration (Generic)');
  console.log('='.repeat(75));

  const aptsSnap = await db.collection('appointments').get();
  console.log(`   Found ${aptsSnap.size} appointments to check...`);

  const updatedAppointments = [];

  for (const docSnap of aptsSnap.docs) {
    const apt = docSnap.data();
    const aptId = docSnap.id;
    let needsUpdate = false;
    const updates = {};

    // 1. Check doctorId
    const currentDoctorId = apt.doctorId;
    const targetDoctorUid = legacyToRealUid[currentDoctorId] || legacyToRealUid[apt.doctorEmail?.toLowerCase()];
    if (targetDoctorUid && currentDoctorId !== targetDoctorUid) {
      updates.doctorId = targetDoctorUid;
      needsUpdate = true;
    }

    // 2. Check patientId
    const currentPatientId = apt.patientId;
    const targetPatientUid = legacyToRealUid[currentPatientId] || legacyToRealUid[apt.patientEmail?.toLowerCase()];
    if (targetPatientUid && currentPatientId !== targetPatientUid) {
      updates.patientId = targetPatientUid;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.updatedAt = new Date().toISOString();
      await db.collection('appointments').doc(aptId).update(updates);
      console.log(`   ✏️ Updated ${aptId}:`);
      if (updates.doctorId) {
        console.log(`      doctorId: "${currentDoctorId}" -> "${updates.doctorId}"`);
      }
      if (updates.patientId) {
        console.log(`      patientId: "${currentPatientId}" -> "${updates.patientId}"`);
      }
      updatedAppointments.push({
        appointmentId: aptId,
        patientName: apt.patientName,
        doctorName: apt.doctorName,
        oldDoctorId: currentDoctorId,
        newDoctorId: updates.doctorId || currentDoctorId,
        oldPatientId: currentPatientId,
        newPatientId: updates.patientId || currentPatientId
      });
    } else {
      console.log(`   ✓ ${aptId} already has valid UIDs (doctorId: ${currentDoctorId}, patientId: ${currentPatientId})`);
    }
  }

  console.log('\n' + '='.repeat(75));
  console.log(` APPOINTMENT UPDATES SUMMARY (${updatedAppointments.length} updated)`);
  console.log('='.repeat(75));
  if (updatedAppointments.length > 0) {
    console.table(updatedAppointments);
  } else {
    console.log('   ✓ All appointments already match current real Auth UIDs!');
  }
}

/**
 * PHASE 4: Verification of Specific Target Appointments (apt_101 - apt_104)
 */
async function verifyTargetAppointments() {
  console.log('\n' + '='.repeat(75));
  console.log(' VERIFICATION: apt_101 through apt_104');
  console.log('='.repeat(75));

  const targetIds = ['apt_101', 'apt_102', 'apt_103', 'apt_104'];
  const verificationList = [];

  for (const id of targetIds) {
    const snap = await db.collection('appointments').doc(id).get();
    if (snap.exists) {
      const data = snap.data();
      verificationList.push({
        id,
        doctorName: data.doctorName,
        doctorId: data.doctorId,
        patientName: data.patientName,
        patientId: data.patientId,
        status: data.status,
        date: data.date
      });
    } else {
      verificationList.push({ id, status: 'NOT_FOUND' });
    }
  }

  console.table(verificationList);
}

async function run() {
  console.log('\n🚀 Community Clinic Complete Database Migration');
  console.log('='.repeat(75));

  const legacyToRealUid = await buildLegacyToRealUidMap();
  console.log('\nActive UID Mapping Table:');
  console.table(legacyToRealUid);

  await migrateUsers(legacyToRealUid);
  await migrateDoctors(legacyToRealUid);
  await migrateAppointments(legacyToRealUid);
  await verifyTargetAppointments();

  console.log('\n' + '='.repeat(75));
  console.log('🎉 All migrations completed successfully!');
  console.log('='.repeat(75) + '\n');
  process.exit(0);
}

run().catch(err => {
  console.error('\n❌ Unhandled Migration Error:', err);
  process.exit(1);
});
