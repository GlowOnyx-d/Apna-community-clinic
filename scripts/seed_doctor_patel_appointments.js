import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seedData() {
  const drUid = 'XmMYhNw57vcRWLcvTB0j9EeFydB3';
  const todayStr = new Date().toISOString().split('T')[0]; // Current date e.g. 2026-09-24

  console.log(`Starting seed for Dr. Rajesh Patel (UID: ${drUid}) on date: ${todayStr}...`);

  // 1. Ensure doctor directory document exists in 'doctors' collection
  const doctorData = {
    id: drUid,
    name: 'Dr. Rajesh Patel',
    email: 'rajesh.patel@communityclinic.org',
    specialization: 'General Physician & Preventive Care',
    qualification: 'MBBS, MD (Internal Medicine)',
    cabin: 'Cabin 101 - Primary Care Block',
    experience: '14+ years',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:30 PM'],
    maxPatientsPerSlot: 4,
    rating: 4.9,
    consultationFee: 'Free (Community Health Funded)',
    updatedAt: new Date().toISOString()
  };

  await db.collection('doctors').doc(drUid).set(doctorData, { merge: true });
  console.log('✓ Doctor directory profile updated in `doctors/' + drUid + '`');

  // 2. Define realistic demo appointments for today
  const appointmentsToSeed = [
    {
      id: 'apt_patel_101',
      patientId: 'usr_patient_maya',
      patientName: 'Maya Sharma',
      patientEmail: 'maya.sharma@example.com',
      patientPhone: '+91 98765 01234',
      patientAge: 29,
      patientGender: 'Female',
      doctorId: drUid,
      doctorName: 'Dr. Rajesh Patel',
      doctorEmail: 'rajesh.patel@communityclinic.org',
      specialization: 'General Physician & Preventive Care',
      cabin: 'Cabin 101 - Primary Care Block',
      date: todayStr,
      time: '09:00 AM',
      status: 'done',
      tokenNumber: 'TK-01',
      reason: 'Seasonal viral fever, dry cough, and mild fatigue for 3 days',
      diagnosis: 'Acute Viral Upper Respiratory Infection (Pharyngitis)',
      notes: 'Lungs clear to auscultation. Hydration advised. Follow up in 3 days if fever persists.',
      prescription: 'Tab Paracetamol 650mg TDS x 3 days, Tab Levocetirizine 5mg HS x 5 days, Steam inhalation twice daily',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'apt_patel_102',
      patientId: 'usr_patient_ramesh',
      patientName: 'Ramesh Chandra Gupta',
      patientEmail: 'ramesh.gupta@example.org',
      patientPhone: '+91 98123 45678',
      patientAge: 56,
      patientGender: 'Male',
      doctorId: drUid,
      doctorName: 'Dr. Rajesh Patel',
      doctorEmail: 'rajesh.patel@communityclinic.org',
      specialization: 'General Physician & Preventive Care',
      cabin: 'Cabin 101 - Primary Care Block',
      date: todayStr,
      time: '09:30 AM',
      status: 'pending',
      tokenNumber: 'TK-02',
      reason: 'Type 2 Diabetes routine quarterly review and fasting blood glucose evaluation',
      notes: '',
      diagnosis: '',
      prescription: '',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'apt_patel_103',
      patientId: 'usr_patient_sunita',
      patientName: 'Sunita Verma',
      patientEmail: 'sunita.v@example.com',
      patientPhone: '+91 98711 22334',
      patientAge: 42,
      patientGender: 'Female',
      doctorId: drUid,
      doctorName: 'Dr. Rajesh Patel',
      doctorEmail: 'rajesh.patel@communityclinic.org',
      specialization: 'General Physician & Preventive Care',
      cabin: 'Cabin 101 - Primary Care Block',
      date: todayStr,
      time: '10:00 AM',
      status: 'pending',
      tokenNumber: 'TK-03',
      reason: 'Essential hypertension follow-up, occasional morning headaches, and BP check',
      notes: '',
      diagnosis: '',
      prescription: '',
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
    },
    {
      id: 'apt_patel_104',
      patientId: 'usr_patient_aarav_s',
      patientName: 'Aarav Sharma',
      patientEmail: 'aarav.sharma@example.com',
      patientPhone: '+91 98455 66778',
      patientAge: 19,
      patientGender: 'Male',
      doctorId: drUid,
      doctorName: 'Dr. Rajesh Patel',
      doctorEmail: 'rajesh.patel@communityclinic.org',
      specialization: 'General Physician & Preventive Care',
      cabin: 'Cabin 101 - Primary Care Block',
      date: todayStr,
      time: '10:30 AM',
      status: 'pending',
      tokenNumber: 'TK-04',
      reason: 'Sports strain on left ankle during badminton, swelling assessment and advice',
      notes: '',
      diagnosis: '',
      prescription: '',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ];

  // 3. Write each appointment to Firestore
  for (const apt of appointmentsToSeed) {
    await db.collection('appointments').doc(apt.id).set(apt);
    console.log(`✓ Seeded ${apt.id} (${apt.status}): ${apt.patientName} - ${apt.tokenNumber}`);
  }

  // 4. Also update local-data/appointments.json
  const localDataPath = path.join(__dirname, '..', 'local-data', 'appointments.json');
  if (fs.existsSync(localDataPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(localDataPath, 'utf8'));
      // Remove any existing with matching IDs and append
      const filtered = existing.filter(a => !appointmentsToSeed.some(seed => seed.id === a.id));
      filtered.push(...appointmentsToSeed);
      fs.writeFileSync(localDataPath, JSON.stringify(filtered, null, 2), 'utf8');
      console.log('✓ Updated local-data/appointments.json backup');
    } catch (e) {
      console.warn('Note: Could not update local-data/appointments.json:', e.message);
    }
  }

  console.log('\n--- Verification ---');
  const snap = await db.collection('appointments').where('doctorId', '==', drUid).get();
  console.log(`Found ${snap.size} total appointments for Dr. Patel in Firestore:`);
  let pendingCount = 0;
  let doneCount = 0;
  snap.forEach(doc => {
    const d = doc.data();
    if (d.status === 'pending') pendingCount++;
    if (d.status === 'done') doneCount++;
    console.log(`  [${d.tokenNumber}] ${d.patientName} (${d.status}) - ${d.date} ${d.time}: ${d.reason}`);
  });
  console.log(`\nSummary: In Queue: ${pendingCount}, Completed: ${doneCount}, Total: ${snap.size}`);
}

seedData().then(() => {
  console.log('Seeding completed successfully!');
  process.exit(0);
}).catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
