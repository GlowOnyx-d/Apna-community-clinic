import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import {
  SAMPLE_DOCTORS,
  SAMPLE_ANNOUNCEMENTS,
  getSampleAppointments
} from '../data/sampleClinicData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const { currentUser, role } = useAuth() || {};
  const location = useLocation();
  const isDisplayPage = location.pathname === '/display';

  const initialReadLoggedRef = useRef(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Realtime Firestore onSnapshot Subscriptions for Public collections (Doctors, Announcements)
  useEffect(() => {
    const unsubDoctors = onSnapshot(
      collection(db, 'doctors'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setDoctors(list);
      },
      (err) => {
        console.error('[Firestore] doctors snapshot error:', err);
      }
    );

    const unsubAnnouncements = onSnapshot(
      collection(db, 'announcements'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setAnnouncements(list);
      },
      (err) => {
        console.error('[Firestore] announcements snapshot error:', err);
      }
    );

    return () => {
      unsubDoctors();
      unsubAnnouncements();
    };
  }, []);

  // 2. Realtime Appointments Subscription (Split by Role to satisfy Firestore Security Rules)
  useEffect(() => {
    if (!currentUser && !isDisplayPage) {
      return;
    }

    let aptsQuery;

    if (role === 'admin' || isDisplayPage) {
      // Admins & TV Kiosk: Unfiltered query across all clinic appointments
      aptsQuery = collection(db, 'appointments');
    } else if (role === 'doctor' && currentUser?.uid) {
      // Doctor: Query strictly filtered to doctorId == currentUser.uid
      aptsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', currentUser.uid)
      );
    } else if (role === 'patient' && currentUser?.uid) {
      // Patient: Query strictly filtered to patientId == currentUser.uid
      aptsQuery = query(
        collection(db, 'appointments'),
        where('patientId', '==', currentUser.uid)
      );
    } else {
      return;
    }

    const unsubAppointments = onSnapshot(
      aptsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setAppointments(list);

        if (!initialReadLoggedRef.current) {
          initialReadLoggedRef.current = true;
          console.log(
            '%c[Firestore Realtime Connected] Appointments loaded for role:',
            'color: #2D6A4F; font-weight: bold; font-size: 13px;',
            role || 'display',
            `(${list.length} appointments)`
          );
        }
      },
      (err) => {
        console.error('[Firestore] appointments snapshot error:', err);
      }
    );

    return () => {
      unsubAppointments();
      setAppointments([]);
    };
  }, [currentUser, role, isDisplayPage]);

  // Generate unique daily sequential token for (Doctor + Date)
  const generateTokenNumber = (doctorId, date) => {
    const doctorDayApts = appointments.filter(
      (apt) => apt.doctorId === doctorId && apt.date === date
    );
    let maxSeq = 0;
    doctorDayApts.forEach((apt) => {
      if (apt.tokenNumber) {
        const match = apt.tokenNumber.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });
    const nextNum = maxSeq + 1;
    return `TK-${String(nextNum).padStart(2, '0')}`;
  };

  // 1. Book Appointment -> Persists to Firestore 'appointments'
  const bookAppointment = async (bookingDetails) => {
    const {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      patientAge,
      patientGender,
      doctorId,
      doctorName,
      specialization,
      date,
      time,
      reason
    } = bookingDetails;

    const newAppointmentId = `apt_${Date.now()}`;
    const tokenNumber = generateTokenNumber(doctorId, date);

    const newAppointment = {
      id: newAppointmentId,
      patientId: patientId || 'guest_patient',
      patientName: patientName || 'Community Patient',
      patientEmail: patientEmail || '',
      patientPhone: patientPhone || '',
      patientAge: Number(patientAge) || 28,
      patientGender: patientGender || 'Unspecified',
      doctorId,
      doctorName,
      specialization,
      date,
      time,
      status: 'pending',
      tokenNumber,
      reason: reason || 'General Consultation',
      notes: '',
      diagnosis: '',
      prescription: '',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'appointments', newAppointmentId), newAppointment);
    showToast(`Appointment booked! Your Token is ${tokenNumber}`, 'success');
    return newAppointment;
  };

  // 2. Cancel Appointment -> Updates Firestore 'appointments'
  const cancelAppointment = async (appointmentId) => {
    await updateDoc(doc(db, 'appointments', appointmentId), { status: 'cancelled' });
    showToast('Appointment cancelled successfully.', 'info');
  };

  // 3. Complete Consultation & Add Clinical Notes -> Updates Firestore 'appointments'
  const completeConsultation = async (appointmentId, { diagnosis, notes, prescription }) => {
    const updateData = {
      status: 'done',
      diagnosis: diagnosis || '',
      notes: notes || '',
      prescription: prescription || '',
      completedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'appointments', appointmentId), updateData);
    showToast('Consultation completed and clinical notes saved!', 'success');
  };

  // 4. Update Doctor Slots & Details -> Updates Firestore 'doctors'
  const updateDoctorSlots = async (doctorId, updatedFields) => {
    await updateDoc(doc(db, 'doctors', doctorId), updatedFields);
    showToast('Doctor schedule and profile updated successfully.', 'success');
  };

  // 5. Add / Merge Doctor -> Persists to Firestore 'doctors'
  const addDoctor = async (doctorData) => {
    const id = doctorData.id || `doc_${Date.now()}`;
    const docRef = doc(db, 'doctors', id);
    await setDoc(docRef, { id, ...doctorData }, { merge: true });
    showToast(`Dr. ${doctorData.name.replace(/^Dr\.\s*/i, '')} profile saved.`, 'success');
    return id;
  };

  // 6. Delete Doctor -> Deletes from Firestore 'doctors'
  const deleteDoctor = async (doctorId) => {
    await deleteDoc(doc(db, 'doctors', doctorId));
    showToast('Doctor profile removed.', 'info');
  };

  // 7. Announcements -> Persists to Firestore 'announcements'
  const addAnnouncement = async (announcementData) => {
    const id = `ann_${Date.now()}`;
    const newAnn = {
      id,
      ...announcementData,
      registeredCount: 0,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'announcements', id), newAnn);
    showToast('New community health announcement published!', 'success');
    return id;
  };

  const deleteAnnouncement = async (announcementId) => {
    await deleteDoc(doc(db, 'announcements', announcementId));
    showToast('Announcement removed.', 'info');
  };

  // 8. RSVP for Community Health Camp using atomic Firestore increment()
  const rsvpAnnouncement = async (announcementId) => {
    const rsvpKey = `Apna_rsvp_${announcementId}`;
    const alreadyRsvpd = typeof window !== 'undefined' && localStorage.getItem(rsvpKey) === 'true';

    // Atomic increment/decrement to prevent concurrency race conditions
    const step = alreadyRsvpd ? -1 : 1;
    await updateDoc(doc(db, 'announcements', announcementId), {
      registeredCount: increment(step)
    });

    if (alreadyRsvpd) {
      localStorage.removeItem(rsvpKey);
      showToast('Registration cancelled for this health camp.', 'info');
    } else {
      localStorage.setItem(rsvpKey, 'true');
      showToast('Successfully registered for the health camp! See you there.', 'success');
    }

    return !alreadyRsvpd;
  };

  // 9. Seed Sample Clinic Data into Firestore
  const seedSampleClinicData = async () => {
    try {
      const batch = writeBatch(db);

      SAMPLE_DOCTORS.forEach((docData) => {
        batch.set(doc(db, 'doctors', docData.id), docData);
      });

      const sampleApts = getSampleAppointments();
      sampleApts.forEach((apt) => {
        batch.set(doc(db, 'appointments', apt.id), apt);
      });

      SAMPLE_ANNOUNCEMENTS.forEach((ann) => {
        batch.set(doc(db, 'announcements', ann.id), ann);
      });

      await batch.commit();
      showToast('Starter clinic dataset saved to Cloud Firestore!', 'success');
    } catch (err) {
      console.error('Seed error:', err);
      showToast('Failed to seed clinic data into Firestore.', 'error');
    }
  };

  // 10. Reset Clinic Data in Firestore
  const resetClinicData = async () => {
    try {
      const batch = writeBatch(db);
      doctors.forEach((d) => batch.delete(doc(db, 'doctors', d.id)));
      appointments.forEach((a) => batch.delete(doc(db, 'appointments', a.id)));
      announcements.forEach((ann) => batch.delete(doc(db, 'announcements', ann.id)));
      await batch.commit();
      showToast('Clinic Firestore collections reset.', 'info');
    } catch (err) {
      console.error('Reset error:', err);
      showToast('Failed to reset clinic data in Firestore.', 'error');
    }
  };

  // 11. Full Clinic Data Backup & Restore
  const exportBackup = async () => {
    try {
      const bundle = {
        version: '2.0-firestore',
        exportedAt: new Date().toISOString(),
        clinicName: 'Apna Community Health Clinic',
        data: {
          doctors,
          appointments,
          announcements
        }
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `Apna_clinic_firestore_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Clinic data backup downloaded successfully!', 'success');
    } catch (err) {
      console.error('Backup export failed:', err);
      showToast('Failed to export clinic backup.', 'error');
    }
  };

  const restoreBackup = async (backupJson) => {
    if (!backupJson || !backupJson.data) {
      throw new Error('Invalid backup file format. Missing "data" container.');
    }

    const { doctors: bDocs, appointments: bApts, announcements: bAnns } = backupJson.data;
    const batch = writeBatch(db);

    if (Array.isArray(bDocs)) {
      bDocs.forEach((d) => batch.set(doc(db, 'doctors', d.id || `doc_${Date.now()}`), d));
    }
    if (Array.isArray(bApts)) {
      bApts.forEach((a) => batch.set(doc(db, 'appointments', a.id || `apt_${Date.now()}`), a));
    }
    if (Array.isArray(bAnns)) {
      bAnns.forEach((ann) => batch.set(doc(db, 'announcements', ann.id || `ann_${Date.now()}`), ann));
    }

    await batch.commit();
    showToast('Clinic backup successfully restored to Cloud Firestore!', 'success');
  };

  const reloadDataFromStorage = useCallback(() => {
    // With onSnapshot, data is always live and automatically synchronized.
  }, []);

  const value = {
    doctors,
    appointments,
    announcements,
    toastMessage,
    showToast,
    bookAppointment,
    cancelAppointment,
    completeConsultation,
    updateDoctorSlots,
    addDoctor,
    deleteDoctor,
    addAnnouncement,
    deleteAnnouncement,
    rsvpAnnouncement,
    generateTokenNumber,
    reloadDataFromStorage,
    seedSampleClinicData,
    resetClinicData,
    exportBackup,
    restoreBackup
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
