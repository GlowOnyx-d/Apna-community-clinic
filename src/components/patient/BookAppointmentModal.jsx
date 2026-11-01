import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  X,
  Calendar,
  Ticket,
  AlertCircle,
  Check
} from 'lucide-react';
import { getDoctorAvatar, getDoctorFallbackAvatar } from '../../utils/doctorVisuals';

const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Checks if a doctor is scheduled to work on a specific YYYY-MM-DD date
 */
export const isDoctorAvailableOnDate = (doctor, dateStr) => {
  if (!doctor || !dateStr) return true;
  const days = doctor.availableDays || doctor.days;
  if (!days || days.length === 0) return true;

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayIdx = dateObj.getDay();
  const full = DAYS_FULL[dayIdx].toLowerCase();
  const short = DAYS_SHORT[dayIdx].toLowerCase();

  return days.some(day => {
    const clean = (day || '').trim().toLowerCase();
    return clean === full || clean === short || full.startsWith(clean);
  });
};

/**
 * Finds the doctor's next working date starting from a given date
 */
export const getNextWorkingDate = (doctor, fromDateStr) => {
  if (!doctor || !fromDateStr) return fromDateStr;
  const [y, m, d] = fromDateStr.split('-').map(Number);
  const cursor = new Date(y, m - 1, d);

  for (let i = 0; i < 14; i++) {
    const yStr = cursor.getFullYear();
    const mStr = String(cursor.getMonth() + 1).padStart(2, '0');
    const dStr = String(cursor.getDate()).padStart(2, '0');
    const checkDate = `${yStr}-${mStr}-${dStr}`;

    if (isDoctorAvailableOnDate(doctor, checkDate)) {
      return checkDate;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return fromDateStr;
};

export default function BookAppointmentModal({
  isOpen = true,
  initialDoctor = null,
  selectedDoctor: propSelectedDoctor = null,
  onClose,
  onSuccess
}) {
  const { userProfile, role } = useAuth();
  const { doctors, appointments, bookAppointment } = useData();

  const isPatient = (role || userProfile?.role) === 'patient';

  const effectiveInitialDoc = propSelectedDoctor || initialDoctor;
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    effectiveInitialDoc ? effectiveInitialDoc.id : (doctors[0]?.id || '')
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(() => {
    const initialDoc = doctors.find(d => d.id === (effectiveInitialDoc ? effectiveInitialDoc.id : doctors[0]?.id));
    return getNextWorkingDate(initialDoc, todayStr);
  });

  const [showCustomDate, setShowCustomDate] = useState(false);
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  // Auto-fill patient details ONLY for patients booking for themselves.
  // When an admin or staff member is booking for a walk-in, leave fields blank.
  const [patientName, setPatientName] = useState(() => (isPatient ? (userProfile?.name || '') : ''));
  const [patientPhone, setPatientPhone] = useState(() => (isPatient ? (userProfile?.phone || '') : ''));

  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [estimatedToken, setEstimatedToken] = useState('TK-01');

  // Sync selected doctor if prop changes
  useEffect(() => {
    if (propSelectedDoctor?.id) {
      setSelectedDoctorId(propSelectedDoctor.id);
    } else if (initialDoctor?.id) {
      setSelectedDoctorId(initialDoctor.id);
    }
  }, [propSelectedDoctor, initialDoctor]);

  // Keep patient details pre-filled if profile loads asynchronously (patient-only)
  useEffect(() => {
    if (isPatient && userProfile) {
      if (!patientName && userProfile.name) {
        setPatientName(userProfile.name);
      }
      if (!patientPhone && userProfile.phone) {
        setPatientPhone(userProfile.phone);
      }
    }
  }, [isPatient, userProfile]);

  // Lock background scroll and listen for Escape key when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const selectedDoctor = (doctors || []).find(d => d.id === selectedDoctorId) || (doctors && doctors.length > 0 ? doctors[0] : null);
  const currentSlots = selectedDoctor?.availableSlots || ["09:00 AM", "10:00 AM", "11:00 AM"];

  // When selected doctor changes, if current date is not a working day for them,
  // automatically advance date to doctor's next working day
  useEffect(() => {
    if (selectedDoctor && date) {
      if (!isDoctorAvailableOnDate(selectedDoctor, date)) {
        const nextDay = getNextWorkingDate(selectedDoctor, todayStr);
        setDate(nextDay);
      }
    }
  }, [selectedDoctorId]);

  // 1. Query Firestore in real-time for existing appointments for (selectedDoctor + date)
  // Excludes cancelled appointments so cancelled slots immediately reopen
  useEffect(() => {
    if (!selectedDoctor?.id || !date) {
      setBookedSlots([]);
      return;
    }

    setLoadingSlots(true);
    setBookingError(null);

    const doctorIds = Array.from(new Set([
      selectedDoctor.id,
      selectedDoctor.docId,
      selectedDoctor.authUid,
      selectedDoctor.legacyId
    ].filter(Boolean)));

    const aptsRef = collection(db, 'appointments');
    const q = doctorIds.length > 1
      ? query(aptsRef, where('date', '==', date), where('doctorId', 'in', doctorIds.slice(0, 10)))
      : query(aptsRef, where('date', '==', date), where('doctorId', '==', selectedDoctor.id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const booked = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.status !== 'cancelled' && data.time) {
            booked.push(data.time.trim());
          }
        });
        setBookedSlots(booked);
        setLoadingSlots(false);
      },
      async (err) => {
        console.warn('onSnapshot booked slots listener notice, using getDocs fallback:', err);
        try {
          const snap = await getDocs(q);
          const booked = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.status !== 'cancelled' && data.time) {
              booked.push(data.time.trim());
            }
          });
          setBookedSlots(booked);
        } catch (fallbackErr) {
          console.error('Failed to get booked slots:', fallbackErr);
        } finally {
          setLoadingSlots(false);
        }
      }
    );

    return () => unsubscribe();
  }, [selectedDoctor?.id, selectedDoctor?.docId, selectedDoctor?.authUid, selectedDoctor?.legacyId, date]);

  // Merge any un-cancelled appointments from context for instant optimistic consistency
  const allBookedSlotsSet = useMemo(() => {
    const set = new Set(bookedSlots.map(s => s.trim().toLowerCase()));
    if (appointments && selectedDoctor) {
      const docIds = [
        selectedDoctor.id,
        selectedDoctor.docId,
        selectedDoctor.authUid,
        selectedDoctor.legacyId
      ].filter(Boolean);

      appointments.forEach((a) => {
        if (
          docIds.includes(a.doctorId) &&
          a.date === date &&
          a.status !== 'cancelled' &&
          a.time
        ) {
          set.add(a.time.trim().toLowerCase());
        }
      });
    }
    return set;
  }, [bookedSlots, appointments, selectedDoctor, date]);

  // Date availability metrics
  const isDateWorkingDay = isDoctorAvailableOnDate(selectedDoctor, date);
  const totalSlotsCount = currentSlots.length;
  const bookedSlotsCount = currentSlots.filter(s => allBookedSlotsSet.has(s.trim().toLowerCase())).length;
  const availableSlotsCount = Math.max(0, totalSlotsCount - bookedSlotsCount);
  const isDateFullyBooked = isDateWorkingDay && availableSlotsCount === 0;

  // Formatted date string for slots header and summary (e.g. "Mon, Nov 2")
  const formattedDate = useMemo(() => {
    if (!date) return '';
    const [y, m, d] = date.split('-').map(Number);
    const dObj = new Date(y, m - 1, d);
    return dObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }, [date]);

  // Selected date object & day name
  const selectedDayInfo = useMemo(() => {
    if (!date) return { full: 'Today', short: 'Today' };
    const [y, m, d] = date.split('-').map(Number);
    const dObj = new Date(y, m - 1, d);
    return {
      full: DAYS_FULL[dObj.getDay()] || 'Day',
      short: DAYS_SHORT[dObj.getDay()] || 'Day'
    };
  }, [date]);

  // Doctor working days formatted string (e.g. "Mon, Wed, Fri")
  const doctorScheduleLabel = useMemo(() => {
    const days = selectedDoctor?.availableDays || selectedDoctor?.days || [];
    if (days.length === 0) return 'Monday - Saturday';
    return days.map(d => (d || '').slice(0, 3)).join(', ');
  }, [selectedDoctor]);

  // Quick 7-Day Picker Options from Today
  const upcomingWeekDays = useMemo(() => {
    const list = [];
    const [y, m, d] = todayStr.split('-').map(Number);
    const cursor = new Date(y, m - 1, d);

    for (let i = 0; i < 7; i++) {
      const yStr = cursor.getFullYear();
      const mStr = String(cursor.getMonth() + 1).padStart(2, '0');
      const dStr = String(cursor.getDate()).padStart(2, '0');
      const dateString = `${yStr}-${mStr}-${dStr}`;
      const isWorking = isDoctorAvailableOnDate(selectedDoctor, dateString);

      list.push({
        dateStr: dateString,
        dayShort: DAYS_SHORT[cursor.getDay()],
        dayFull: DAYS_FULL[cursor.getDay()],
        dayNumber: cursor.getDate(),
        monthShort: cursor.toLocaleDateString(undefined, { month: 'short' }),
        isWorking,
        isToday: i === 0,
        isTomorrow: i === 1
      });

      cursor.setDate(cursor.getDate() + 1);
    }
    return list;
  }, [todayStr, selectedDoctor]);

  // Whenever doctor, date, or booked slots change, ensure activeSlot points to an unbooked slot
  useEffect(() => {
    if (!isDateWorkingDay || isDateFullyBooked) {
      setTime('');
      return;
    }

    const isCurrentSlotTaken = time && allBookedSlotsSet.has(time.trim().toLowerCase());
    const isCurrentSlotMissing = time && !currentSlots.some(s => s.trim().toLowerCase() === time.trim().toLowerCase());

    if (!time || isCurrentSlotTaken || isCurrentSlotMissing) {
      const firstFree = currentSlots.find(s => !allBookedSlotsSet.has(s.trim().toLowerCase()));
      if (firstFree) {
        setTime(firstFree);
      } else {
        setTime('');
      }
    }
  }, [allBookedSlotsSet, currentSlots, time, isDateWorkingDay, isDateFullyBooked]);

  const activeSlot = time;

  // Read estimated next queue token from Firestore tokenCounters
  useEffect(() => {
    let isMounted = true;
    const fetchEstimatedToken = async () => {
      if (!selectedDoctor?.id || !date) {
        if (isMounted) setEstimatedToken('TK-01');
        return;
      }
      try {
        const counterRef = doc(db, 'tokenCounters', `${selectedDoctor.id}_${date}`);
        const snap = await getDoc(counterRef);
        if (isMounted) {
          if (snap.exists() && typeof snap.data().last === 'number') {
            const nextNum = snap.data().last + 1;
            setEstimatedToken(`TK-${String(nextNum).padStart(2, '0')}`);
          } else {
            setEstimatedToken('TK-01');
          }
        }
      } catch (err) {
        console.warn('[BookAppointmentModal] Error fetching token counter:', err);
        if (isMounted) setEstimatedToken('TK-01');
      }
    };

    fetchEstimatedToken();
    return () => {
      isMounted = false;
    };
  }, [selectedDoctor?.id, date]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    // 1. Prevent past dates
    if (date < todayStr) {
      setBookingError("Cannot book appointments for past dates. Please pick today or a future date.");
      return;
    }

    // 2. Prevent booking on days doctor doesn't work
    if (!isDateWorkingDay) {
      setBookingError(`Dr. ${selectedDoctor.name} is off duty on ${selectedDayInfo.full}. Available days: ${doctorScheduleLabel}.`);
      return;
    }

    // 3. Prevent booking on fully booked day
    if (isDateFullyBooked) {
      setBookingError("All consultation slots for this date are fully booked. Please select another date.");
      return;
    }

    // 4. Validate patient details and required reason
    const cleanName = patientName.trim();
    const cleanPhone = patientPhone.trim();
    const cleanReason = reason.trim();

    const errors = {};
    if (!cleanName) {
      errors.name = "Please enter patient's full name.";
    }
    if (!cleanPhone) {
      errors.phone = "Please enter contact phone number.";
    } else if (cleanPhone.replace(/\D/g, '').length < 8) {
      errors.phone = "Please enter a valid phone number (at least 8 digits).";
    }
    if (!cleanReason) {
      errors.reason = "Please describe your reason for visit.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setBookingError("Please complete all required fields highlighted in red below.");
      return;
    }

    if (!activeSlot || allBookedSlotsSet.has(activeSlot.trim().toLowerCase())) {
      setBookingError("This slot was just booked, please choose another time");
      return;
    }

    try {
      setLoading(true);
      setBookingError(null);
      setFieldErrors({});
      const booked = await bookAppointment({
        patientId: isPatient ? (userProfile?.uid || 'patient_guest') : `walkin_${Date.now()}`,
        patientName: cleanName,
        patientEmail: isPatient ? (userProfile?.email || '') : '',
        patientPhone: cleanPhone,
        patientAge: isPatient ? (userProfile?.age || 29) : 30,
        patientGender: isPatient ? (userProfile?.gender || 'Female') : 'Other',
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        date,
        time: activeSlot,
        reason: cleanReason
      });

      // Subtle confetti in theme colors
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#0F766E', '#2DD4BF', '#F97316']
      });

      if (onSuccess) {
        onSuccess(booked);
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setBookingError(err.message || "This slot was just booked, please choose another time");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!doctors || doctors.length === 0) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white dark:bg-[#121C21] w-full max-w-md rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#F97316]/15 text-[#EA580C] dark:text-[#FB923C] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">No Doctors Available to Book With Yet</h2>
          <p className="text-sm text-[#5A7178] dark:text-[#9DB4BA]">
            No doctors have been added to the clinic system yet. Please ask the clinic administrator to add doctor profiles first.
          </p>
          <button
            onClick={onClose}
            className="w-full h-11 px-4 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#121C21] rounded-2xl max-w-xl w-full border border-[#E0E7E5] dark:border-[#21333A] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
      >

          {/* 1. Sticky Header */}
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#E0E7E5] dark:border-[#21333A] bg-[#F4F7F6] dark:bg-[#0B1114]">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center shadow-xs">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#132226] dark:text-[#F4F7F6] text-base font-heading">
                    Book Clinic Appointment
                  </h3>
                  <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                    Instant Token Queue Allocation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose?.();
                }}
                aria-label="Close booking modal"
                className="p-1.5 text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] rounded-lg hover:bg-[#E0E7E5]/50 dark:hover:bg-[#19272D] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

              {/* Form Container wrapping middle scrollable body + sticky footer */}
              <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">

                            {/* 2. Middle Scrollable Body */}
                            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-7">

                              {/* 1. Doctor Selection */}
                              <div>
                                <h4 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading mb-3">
                                  1. Doctor
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                                  {doctors.map((docItem) => {
                                    const isSelected = docItem.id === selectedDoctorId;
                                    return (
                    <button
                      key={docItem.id}
                      type="button"
                      onClick={() => {
                        setSelectedDoctorId(docItem.id);
                        setBookingError(null);
                        setFieldErrors({});
                      }}
                      className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#0F766E] dark:border-[#2DD4BF] bg-[#0F766E]/10 dark:bg-[#0D9488]/20 shadow-xs ring-1 ring-[#0F766E] dark:ring-[#2DD4BF]' 
                          : 'border-[#E0E7E5] dark:border-[#21333A] hover:border-[#0F766E]/40 dark:hover:border-[#2C444E] bg-[#F4F7F6] dark:bg-[#19272D]'
                      }`}
                    >
                      <img 
                        src={getDoctorAvatar(docItem)} 
                        alt={docItem.name} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getDoctorFallbackAvatar(docItem.name);
                        }}
                        className="w-12 h-12 rounded-full object-cover border border-[#E0E7E5] dark:border-[#21333A] bg-white dark:bg-[#0B1114] mb-2.5 shrink-0"
                      />
                            <p className="text-sm font-bold text-[#132226] dark:text-[#F4F7F6] font-heading leading-snug">
                              {docItem.name}
                            </p>
                            <p className="text-xs text-[#0F766E] dark:text-[#2DD4BF] font-medium leading-tight mt-1 line-clamp-2">
                              {docItem.specialization}
                            </p>
                        </button>
                      );
                    })}
                  </div>

                      {/* Selected doctor's cabin and working days in a small line below grid */}
                      {selectedDoctor && (
                        <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-2.5 flex flex-wrap items-center gap-1.5">
                          <span>Cabin: <strong className="font-semibold text-[#132226] dark:text-[#F4F7F6]">{selectedDoctor.cabin || 'Cabin 101'}</strong></span>
                          <span className="opacity-40">·</span>
                          <span>Working days: <strong className="font-semibold text-[#132226] dark:text-[#F4F7F6]">{doctorScheduleLabel}</strong></span>
                        </p>
                      )}
                    </div>

                        {/* 2. Date & Time Selection */ }
            <div>
              <h4 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading mb-3">
                2. Date &amp; time
              </h4>

              <div className="space-y-4">
                {/* 7-Day Strip + Optional Native Picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider block">
                      Select Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomDate(prev => !prev)}
                      className="text-xs text-[#0F766E] dark:text-[#2DD4BF] hover:underline font-medium cursor-pointer"
                    >
                      {showCustomDate ? 'Hide date picker' : 'Pick another date'}
                    </button>
                  </div>

                  {/* 7-Day Strip */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {upcomingWeekDays.map((item) => {
                      const isSelected = date === item.dateStr;
                      const isWorking = item.isWorking;

                      return (
                        <button
                          key={item.dateStr}
                          type="button"
                          disabled={!isWorking}
                          onClick={() => {
                            if (isWorking) {
                              setDate(item.dateStr);
                              setBookingError(null);
                            }
                          }}
                          title={!isWorking ? `Dr. ${selectedDoctor?.name} is off duty on ${item.dayFull}` : `Select ${item.dayFull} (${item.dateStr})`}
                          className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                            !isWorking
                              ? 'bg-[#E0E7E5]/30 dark:bg-[#21333A]/30 border border-[#E0E7E5] dark:border-[#21333A] text-[#758D94] dark:text-[#79949B] cursor-not-allowed opacity-50'
                              : isSelected
                                ? 'bg-[#0F766E] text-white border border-[#0F766E] dark:border-[#2DD4BF] shadow-xs cursor-pointer'
                                : 'bg-[#F4F7F6] dark:bg-[#19272D] hover:bg-[#E0E7E5]/60 dark:hover:bg-[#21333A] border border-[#CFDAD6] dark:border-[#2C444E] text-[#132226] dark:text-[#F4F7F6] cursor-pointer'
                          }`}
                        >
                          <span className="text-xs uppercase font-bold">
                            {item.isToday ? 'Today' : item.isTomorrow ? 'Tmrw' : item.dayShort}
                          </span>
                          <span className="text-sm font-black font-heading mt-0.5">
                            {item.dayNumber}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pick another date native input (revealed on click) */}
                  {showCustomDate && (
                    <div className="mt-2.5">
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="date"
                          min={todayStr}
                          value={date}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            if (newDate >= todayStr) {
                              setDate(newDate);
                              setBookingError(null);
                            }
                          }}
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl text-sm font-medium text-[#132226] dark:text-[#F4F7F6] bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Slots Grid */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider block">
                      Select Time Slot
                    </label>
                    {loadingSlots && (
                      <span className="text-xs text-[#0F766E] dark:text-[#2DD4BF] animate-pulse">
                        Checking slots...
                      </span>
                    )}
                  </div>

                  {/* Slots Free info line */}
                  <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mb-2.5 font-medium">
                    {!isDateWorkingDay ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        Doctor off duty · {formattedDate}
                      </span>
                    ) : isDateFullyBooked ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        0 slots free · {formattedDate} (Fully booked)
                      </span>
                    ) : (
                      <span>
                        <strong className="text-[#0F766E] dark:text-[#2DD4BF] font-semibold">
                          {availableSlotsCount} {availableSlotsCount === 1 ? 'slot' : 'slots'} free
                        </strong> · {formattedDate}
                      </span>
                    )}
                  </p>

                  {!isDateWorkingDay ? (
                    <div className="p-4 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] text-center text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                      Dr. {selectedDoctor?.name} is off duty on this date. Please pick another working date above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {currentSlots.map((slot) => {
                        const isBooked = allBookedSlotsSet.has(slot.trim().toLowerCase());
                        const isSelected = activeSlot === slot && !isBooked;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => {
                              if (!isBooked) {
                                setTime(slot);
                                setBookingError(null);
                              }
                            }}
                            title={isBooked ? `${slot} is already booked` : `Select ${slot}`}
                            className={`h-11 px-2 rounded-xl text-xs font-semibold border text-center transition-all flex items-center justify-center gap-1.5 ${
                              isBooked
                                ? 'bg-[#E0E7E5]/30 dark:bg-[#21333A]/30 border-[#E0E7E5] dark:border-[#21333A] text-[#758D94] dark:text-[#79949B] line-through cursor-not-allowed opacity-50'
                                : isSelected
                                  ? 'bg-[#0F766E] dark:bg-[#0D9488] text-white border-[#0F766E] dark:border-[#0D9488] shadow-xs cursor-pointer'
                                  : 'bg-[#F4F7F6] dark:bg-[#19272D] hover:bg-[#E0E7E5]/60 dark:hover:bg-[#21333A] border-[#CFDAD6] dark:border-[#2C444E] text-[#132226] dark:text-[#F4F7F6] cursor-pointer'
                            }`}
                          >
                            <span>{slot}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Patient Details & Reason */}
            <div>
              <h4 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading mb-3">
                3. Your details
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-sm font-semibold text-[#132226] dark:text-[#F4F7F6] mb-1.5">
                      Patient Full Name <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        if (fieldErrors.name && e.target.value.trim()) {
                          setFieldErrors(prev => ({ ...prev, name: null }));
                        }
                      }}
                      placeholder="e.g. Maya Sharma"
                      className={`w-full h-11 px-3.5 rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none transition-colors ${
                        fieldErrors.name
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-2 border-rose-500 focus:border-rose-600'
                          : 'bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] focus:border-[#0F766E] dark:focus:border-[#2DD4BF]'
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#132226] dark:text-[#F4F7F6] mb-1.5">
                      Contact Phone <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => {
                        setPatientPhone(e.target.value);
                        if (fieldErrors.phone && e.target.value.trim()) {
                          setFieldErrors(prev => ({ ...prev, phone: null }));
                        }
                      }}
                      placeholder="+91 98765 43210"
                      className={`w-full h-11 px-3.5 rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none transition-colors ${
                        fieldErrors.phone
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-2 border-rose-500 focus:border-rose-600'
                          : 'bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] focus:border-[#0F766E] dark:focus:border-[#2DD4BF]'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#132226] dark:text-[#F4F7F6] mb-1.5">
                    Reason for Visit <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <textarea
                    rows="2"
                    required
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (fieldErrors.reason && e.target.value.trim()) {
                        setFieldErrors(prev => ({ ...prev, reason: null }));
                      }
                    }}
                    placeholder="e.g. Mild fever, blood pressure checkup, cough for 2 days..."
                    className={`w-full min-h-[44px] p-3 rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none transition-colors resize-none ${
                      fieldErrors.reason
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-2 border-rose-500 focus:border-rose-600'
                        : 'bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] focus:border-[#0F766E] dark:focus:border-[#2DD4BF]'
                    }`}
                  />
                  <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-1.5">
                    Briefly describe your symptoms or reason for visit to help the doctor prepare.
                  </p>
                  {fieldErrors.reason && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.reason}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* 3. Sticky Footer with Error, Summary Row, and Confirm Button */}
          <div className="shrink-0 p-4 sm:p-5 border-t border-[#E0E7E5] dark:border-[#21333A] bg-[#F4F7F6] dark:bg-[#0B1114] space-y-3">
            
            {/* Error Banner if any */}
            {bookingError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <p className="font-medium">{bookingError}</p>
              </div>
            )}

            {/* Summary Row: Doctor, Date, Time, and Estimated Token */}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-[#5A7178] dark:text-[#9DB4BA] px-1">
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                <span className="font-bold text-[#132226] dark:text-[#F4F7F6]">
                  {selectedDoctor?.name || 'Doctor'}
                </span>
                <span className="opacity-40">·</span>
                <span className="font-medium text-[#132226] dark:text-[#F4F7F6]">
                  {formattedDate || date}
                </span>
                {activeSlot && (
                  <>
                    <span className="opacity-40">·</span>
                    <span className="font-semibold text-[#0F766E] dark:text-[#2DD4BF]">{activeSlot}</span>
                  </>
                )}
              </div>
              <div className="font-semibold text-[#0F766E] dark:text-[#2DD4BF] shrink-0">
                Estimated token: <span className="font-bold text-[#132226] dark:text-[#F4F7F6]">{estimatedToken}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading || 
                !isDateWorkingDay || 
                isDateFullyBooked || 
                !activeSlot || 
                allBookedSlotsSet.has(activeSlot.trim().toLowerCase())
              }
              className={`w-full h-11 flex items-center justify-center gap-2 px-4 text-white text-sm font-semibold rounded-xl transition-all shadow-sm ${
                loading || !isDateWorkingDay || isDateFullyBooked || !activeSlot || allBookedSlotsSet.has(activeSlot.trim().toLowerCase())
                  ? 'bg-[#E0E7E5]/60 dark:bg-[#21333A]/60 text-[#758D94] dark:text-[#79949B] cursor-not-allowed opacity-60'
                  : 'bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] cursor-pointer'
              }`}
            >
              <span>{loading ? 'Confirming booking...' : 'Confirm booking'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
