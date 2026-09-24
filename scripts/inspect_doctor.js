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

async function main() {
  const drUid = 'XmMYhNw57vcRWLcvTB0j9EeFydB3';
  console.log('--- Checking User Doc for Dr. Patel ---');
  const userDoc = await db.collection('users').doc(drUid).get();
  if (userDoc.exists) {
    console.log('User doc:', userDoc.data());
  } else {
    console.log('User doc does not exist!');
  }

  console.log('\n--- Checking Doctors Collection ---');
  const docSnap = await db.collection('doctors').doc(drUid).get();
  if (docSnap.exists) {
    console.log('Doctor doc by UID:', docSnap.data());
  } else {
    console.log('No doctor doc by UID, searching by email...');
    const q = await db.collection('doctors').where('email', '==', 'rajesh.patel@communityclinic.org').get();
    q.forEach(d => console.log('Doctor doc by email:', d.id, d.data()));
  }

  console.log('\n--- Checking Existing Appointments ---');
  const apts = await db.collection('appointments').get();
  console.log('Total appointments in Firestore:', apts.size);
  apts.forEach(a => {
    const data = a.data();
    console.log(`- ${a.id}: patient=${data.patientName}, doctorId=${data.doctorId}, doctor=${data.doctorName}, date=${data.date}, status=${data.status}, token=${data.tokenNumber}`);
  });
}

main().catch(console.error);
