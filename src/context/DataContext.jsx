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
  getSampleAppointments,
  SAMPLE_LAB_REPORTS,
  SAMPLE_PHARMACY_STOCK
} from '../data/sampleClinicData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [labReports, setLabReports] = useState(SAMPLE_LAB_REPORTS);
  const [pharmacyStock, setPharmacyStock] = useState(SAMPLE_PHARMACY_STOCK);
  const [clinicStaff, setClinicStaff] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_clinic_staff_members');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'staff_cmo_admin',
        name: 'Dr. Neha Verma',
        email: 'admin@communityclinic.org',
        role: 'admin',
        department: 'Chief Medical Officer & Clinic Director',
        phone: '+91 98765 43210',
        status: 'Active',
        isSuperAdmin: true,
        createdAt: '2026-09-01T08:00:00.000Z'
      },
      {
        id: 'staff_opd_lead',
        name: 'Anjali Sharma',
        email: 'anjali.reception@communityclinic.org',
        role: 'admin',
        department: 'Lead Receptionist & Triage Registrar',
        phone: '+91 98765 11223',
        status: 'Active',
        createdAt: '2026-09-10T10:30:00.000Z'
      }
    ];
  });
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
        const list = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
          docId: d.id,
          authUid: d.data().id || d.id
        }));
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

    const unsubLabReports = onSnapshot(
      collection(db, 'labReports'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => new Date(b.testDate || b.createdAt || 0) - new Date(a.testDate || a.createdAt || 0));
          setLabReports(list);
        }
      },
      (err) => {
        console.warn('[Firestore] labReports snapshot listener notice:', err);
      }
    );

    const unsubStock = onSnapshot(
      collection(db, 'pharmacyStock'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setPharmacyStock(list);
        }
      },
      (err) => {
        console.warn('[Firestore] pharmacyStock snapshot listener notice:', err);
      }
    );

    const unsubStaff = onSnapshot(
      collection(db, 'staff'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setClinicStaff(list);
          try {
            localStorage.setItem('apna_clinic_staff_members', JSON.stringify(list));
          } catch (e) {}
        }
      },
      (err) => {
        console.warn('[Firestore] staff snapshot listener notice:', err);
      }
    );

    return () => {
      unsubDoctors();
      unsubAnnouncements();
      unsubLabReports();
      unsubStock();
      unsubStaff();
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
    // 1. Optimistic local update so UI reacts instantly
    setDoctors(prev => prev.map(d => 
      (d.id === doctorId || d.docId === doctorId || d.authUid === doctorId || d.legacyId === doctorId)
        ? { ...d, ...updatedFields }
        : d
    ));

    const target = doctors.find(d => 
      d.id === doctorId || d.docId === doctorId || d.authUid === doctorId || d.legacyId === doctorId
    );
    const key = target?.docId || target?.id || doctorId;

    await updateDoc(doc(db, 'doctors', key), updatedFields);
    showToast('Doctor schedule and profile updated successfully.', 'success');
  };

  // 5. Add / Merge Doctor -> Persists to Firestore 'doctors'
  const addDoctor = async (doctorData) => {
    const id = doctorData.id || `doc_${Date.now()}`;
    const newDoc = { ...doctorData, id, docId: id, authUid: doctorData.id || id };

    // 1. Optimistic local update
    setDoctors(prev => {
      const filtered = prev.filter(d => d.id !== id && d.email !== doctorData.email);
      return [...filtered, newDoc];
    });

    const docRef = doc(db, 'doctors', id);
    await setDoc(docRef, newDoc, { merge: true });
    showToast(`Dr. ${doctorData.name.replace(/^Dr\.\s*/i, '')} profile saved.`, 'success');
    return id;
  };

  // 6. Delete Doctor -> Deletes from Firestore 'doctors'
  const deleteDoctor = async (doctorId) => {
    // 1. Instantly update local state optimistically so UI updates without page reload
    setDoctors(prev => prev.filter(d => 
      d.id !== doctorId && 
      d.docId !== doctorId && 
      d.authUid !== doctorId && 
      d.legacyId !== doctorId
    ));

    // 2. Identify all possible Firestore document keys for this doctor
    const target = doctors.find(d => 
      d.id === doctorId || 
      d.docId === doctorId || 
      d.authUid === doctorId || 
      d.legacyId === doctorId
    );

    const keysToDelete = new Set([doctorId]);
    if (target) {
      if (target.id) keysToDelete.add(target.id);
      if (target.docId) keysToDelete.add(target.docId);
      if (target.legacyId) keysToDelete.add(target.legacyId);
      if (target.authUid) keysToDelete.add(target.authUid);
    }

    try {
      await Promise.all(
        Array.from(keysToDelete).map(async (key) => {
          try {
            await deleteDoc(doc(db, 'doctors', key));
          } catch (e) {
            // Ignore if key doc doesn't exist
          }
        })
      );
      showToast('Doctor profile removed.', 'info');
    } catch (err) {
      console.error('Failed to delete doctor document:', err);
      showToast('Failed to remove doctor: ' + err.message, 'error');
    }
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
    if (role !== 'admin') {
      showToast('Please sign in as Clinic Administrator (admin@communityclinic.org) to load sample data into Firestore.', 'error');
      return;
    }

    try {
      const batch = writeBatch(db);

      SAMPLE_DOCTORS.forEach((docData) => {
        batch.set(doc(db, 'doctors', docData.id), docData);
        if (docData.legacyId) {
          batch.set(doc(db, 'doctors', docData.legacyId), { ...docData, id: docData.id });
        }
      });

      const sampleApts = getSampleAppointments();
      sampleApts.forEach((apt) => {
        batch.set(doc(db, 'appointments', apt.id), apt);
      });

      SAMPLE_ANNOUNCEMENTS.forEach((ann) => {
        batch.set(doc(db, 'announcements', ann.id), ann);
      });

      SAMPLE_LAB_REPORTS.forEach((rep) => {
        batch.set(doc(db, 'labReports', rep.id), rep);
      });

      SAMPLE_PHARMACY_STOCK.forEach((med) => {
        batch.set(doc(db, 'pharmacyStock', med.id), med);
      });

      await batch.commit();
      showToast('Complete starter clinic dataset saved to Cloud Firestore!', 'success');
    } catch (err) {
      console.error('Seed error:', err);
      showToast('Failed to seed clinic data: ' + (err.message || 'Please check permissions'), 'error');
    }
  };

  // 10. Reset Clinic Data in Firestore
  const resetClinicData = async () => {
    try {
      const batch = writeBatch(db);
      doctors.forEach((d) => batch.delete(doc(db, 'doctors', d.id)));
      appointments.forEach((a) => batch.delete(doc(db, 'appointments', a.id)));
      announcements.forEach((ann) => batch.delete(doc(db, 'announcements', ann.id)));
      labReports.forEach((r) => batch.delete(doc(db, 'labReports', r.id)));
      pharmacyStock.forEach((m) => batch.delete(doc(db, 'pharmacyStock', m.id)));
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
          announcements,
          labReports,
          pharmacyStock
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

    const { doctors: bDocs, appointments: bApts, announcements: bAnns, labReports: bLabs, pharmacyStock: bStock } = backupJson.data;
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
    if (Array.isArray(bLabs)) {
      bLabs.forEach((rep) => batch.set(doc(db, 'labReports', rep.id || `rep_${Date.now()}`), rep));
    }
    if (Array.isArray(bStock)) {
      bStock.forEach((med) => batch.set(doc(db, 'pharmacyStock', med.id || `med_${Date.now()}`), med));
    }

    await batch.commit();
    showToast('Clinic backup successfully restored to Cloud Firestore!', 'success');
  };

  // 12. Record Patient Vitals (Nurse / Receptionist Pre-Consultation Triage)
  const recordVitals = async (appointmentId, vitals) => {
    const updateData = {
      vitals: {
        ...vitals,
        recordedAt: new Date().toISOString()
      }
    };
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, ...updateData } : a));
    await updateDoc(doc(db, 'appointments', appointmentId), updateData);
    showToast('Patient vitals recorded and attached to consultation.', 'success');
  };

  // 13. Pharmacy / Dispensary Dispatch
  const dispensePrescription = async (appointmentId, dispensaryNotes = '') => {
    const updateData = {
      dispensaryStatus: 'dispensed',
      dispensedAt: new Date().toISOString(),
      dispensaryNotes: dispensaryNotes || 'Dispensed with dosage instructions to patient.'
    };
    // Optimistic local state update
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, ...updateData } : a));
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), updateData);
    } catch (e) {
      console.warn('Firestore updateDoc appointments error:', e);
    }
    showToast('Prescription marked as dispensed by pharmacy desk!', 'success');
  };

  // 14. Walk-in Instant Token Generation
  const bookWalkInAppointment = async (walkInData) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newAppointmentId = `apt_walkin_${Date.now()}`;
    const tokenNumber = generateTokenNumber(walkInData.doctorId, todayStr);

    const newAppointment = {
      id: newAppointmentId,
      patientId: `walkin_${Date.now()}`,
      patientName: walkInData.patientName || 'Walk-In Patient',
      patientEmail: walkInData.patientEmail || '',
      patientPhone: walkInData.patientPhone || '',
      patientAge: Number(walkInData.patientAge) || 30,
      patientGender: walkInData.patientGender || 'Unspecified',
      doctorId: walkInData.doctorId,
      doctorName: walkInData.doctorName,
      specialization: walkInData.specialization || 'General Medicine',
      date: todayStr,
      time: walkInData.time || 'Walk-in / Immediate',
      status: 'pending',
      tokenNumber,
      reason: walkInData.reason || 'Walk-in Community Consultation',
      notes: '',
      diagnosis: '',
      prescription: '',
      isWalkIn: true,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'appointments', newAppointmentId), newAppointment);
    showToast(`Walk-in Token ${tokenNumber} issued successfully!`, 'success');
    return newAppointment;
  };

  // 15. Toggle Doctor On-Leave status
  const toggleDoctorLeave = async (doctorId, isOnLeave) => {
    // 1. Optimistic local update
    setDoctors(prev => prev.map(d => 
      (d.id === doctorId || d.docId === doctorId || d.authUid === doctorId || d.legacyId === doctorId)
        ? { ...d, isOnLeave: !!isOnLeave }
        : d
    ));

    const target = doctors.find(d => 
      d.id === doctorId || d.docId === doctorId || d.authUid === doctorId || d.legacyId === doctorId
    );
    const key = target?.docId || target?.id || doctorId;

    await updateDoc(doc(db, 'doctors', key), { isOnLeave: !!isOnLeave });
    showToast(`Doctor marked as ${isOnLeave ? 'on leave' : 'active'}.`, 'info');
  };

  // 16. Patient Diagnostic Lab Reports Management
  const addLabReport = async (reportData) => {
    const id = reportData.id || `rep_${Date.now()}`;
    const newReport = {
      id,
      ...reportData,
      createdAt: reportData.createdAt || new Date().toISOString()
    };
    // Optimistic local state update
    setLabReports(prev => [newReport, ...prev.filter(r => r.id !== id)]);
    try {
      await setDoc(doc(db, 'labReports', id), newReport);
    } catch (e) {
      console.warn('Firestore setDoc labReports error:', e);
    }
    showToast('Diagnostic lab report added to patient record.', 'success');
    return id;
  };

  const deleteLabReport = async (reportId) => {
    setLabReports(prev => prev.filter(r => r.id !== reportId));
    try {
      await deleteDoc(doc(db, 'labReports', reportId));
    } catch (e) {
      console.warn('Firestore deleteDoc labReports error:', e);
    }
    showToast('Lab report record deleted.', 'info');
  };

  const updatePharmacyStock = async (medicineId, newStockQty) => {
    setPharmacyStock(prev => prev.map(m => m.id === medicineId ? { ...m, stock: newStockQty, status: newStockQty <= (m.minAlert || 50) ? 'Low Stock' : 'Good' } : m));
    try {
      await updateDoc(doc(db, 'pharmacyStock', medicineId), { stock: newStockQty });
    } catch (e) {
      console.warn('Firestore update pharmacyStock error:', e);
    }
    showToast('Pharmacy medicine stock updated.', 'success');
  };

  const addStaffMember = async (staffData) => {
    const id = staffData.id || `staff_${Date.now()}`;
    const newEntry = {
      ...staffData,
      id,
      role: 'admin',
      status: staffData.status || 'Active',
      createdAt: staffData.createdAt || new Date().toISOString()
    };

    setClinicStaff(prev => {
      const filtered = prev.filter(s => s.email !== staffData.email);
      const next = [newEntry, ...filtered];
      try {
        localStorage.setItem('apna_clinic_staff_members', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await setDoc(doc(db, 'staff', id), newEntry);
    } catch (err) {
      console.warn('[Firestore] Storing staff document notice:', err);
    }
    showToast(`Staff access for ${staffData.name} granted successfully!`, 'success');
    return newEntry;
  };

  const deleteStaffMember = async (staffId) => {
    setClinicStaff(prev => {
      const next = prev.filter(s => s.id !== staffId);
      try {
        localStorage.setItem('apna_clinic_staff_members', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await deleteDoc(doc(db, 'staff', staffId));
    } catch (err) {
      console.warn('[Firestore] Delete staff document error:', err);
    }
    showToast('Staff credentials revoked.', 'info');
  };

  const reloadDataFromStorage = useCallback(() => {
    // With onSnapshot, data is always live and automatically synchronized.
  }, []);

  const value = {
    doctors,
    appointments,
    announcements,
    labReports,
    pharmacyStock,
    clinicStaff,
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
    restoreBackup,
    recordVitals,
    dispensePrescription,
    bookWalkInAppointment,
    toggleDoctorLeave,
    addLabReport,
    deleteLabReport,
    updatePharmacyStock,
    addStaffMember,
    deleteStaffMember
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
