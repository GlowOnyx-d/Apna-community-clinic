import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  X, 
  Calendar, 
  Sparkles, 
  Ticket, 
  ChevronRight, 
  AlertCircle,
  Clock,
  CheckCircle2,
  CalendarDays
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
  if (!isOpen) return null;

  const { userProfile, role } = useAuth();
  const { doctors, appointments, bookAppointment, generateTokenNumber } = useData();

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

  if (!doctors || doctors.length === 0) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white dark:bg-[#1C221C] w-full max-w-md rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E58A54] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">No Doctors Available to Book With Yet</h2>
          <p className="text-sm text-[#6B6B63] dark:text-[#C4CFC3]">
            No doctors have been added to the clinic system yet. Please ask the clinic administrator to add doctor profiles first.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
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

  // Calculate live preview token
  const estimatedToken = selectedDoctor ? generateTokenNumber(selectedDoctor.id, date) : 'TK-01';

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
      errors.reason = "Please describe your reason for visit / chief health concern.";
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
        colors: ['#2D6A4F', '#52B788', '#C97B4A']
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

  return createPortal(
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1C221C] rounded-2xl max-w-xl w-full border border-[#E6DFC6] dark:border-[#2F3B2F] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#FAF7F2] dark:bg-[#151915]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-[#FAF7F2] flex items-center justify-center shadow-xs">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#22291F] dark:text-[#FAF7F2] text-base font-heading">Book Clinic Appointment</h3>
              <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">Instant Token Queue Allocation</p>
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
            className="p-1.5 text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] rounded-lg hover:bg-[#E6DFC6]/50 dark:hover:bg-[#242C24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Booking Error Banner */}
          {bookingError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div>
                <p className="font-bold">{bookingError}</p>
                <p className="text-[11px] opacity-90 mt-0.5">Please adjust the highlighted options to proceed.</p>
              </div>
            </div>
          )}

          {/* 1. Doctor Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">
                1. Select Healthcare Specialist
              </label>
              <span className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] font-medium">
                {selectedDoctor?.cabin || 'Cabin 101'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                        ? 'border-[#2D6A4F] dark:border-[#52B788] bg-[#2D6A4F]/10 dark:bg-[#357A5B]/20 shadow-xs' 
                        : 'border-[#E6DFC6] dark:border-[#2F3B2F] hover:border-[#2D6A4F]/40 dark:hover:border-[#445644] bg-[#FAF7F2] dark:bg-[#242C24]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src={getDoctorAvatar(docItem)} 
                        alt={docItem.name} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getDoctorFallbackAvatar(docItem.name);
                        }}
                        className="w-8 h-8 rounded-full object-cover border border-[#E6DFC6] dark:border-[#2F3B2F] bg-white dark:bg-[#151915]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#22291F] dark:text-[#FAF7F2] truncate font-heading">{docItem.name}</p>
                        <p className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] font-medium truncate">{docItem.specialization.split('(')[0]}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8E8E84] dark:text-[#94A493] font-medium mt-auto">
                      Works: {(docItem.availableDays || docItem.days || ['All']).slice(0, 3).map(d => d.slice(0, 3)).join(', ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Date Selection with Working Days Enforcement */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">
                2. Select Date (Today or Upcoming)
              </label>
              <span className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3]">
                {selectedDoctor?.name}'s days: <strong>{doctorScheduleLabel}</strong>
              </span>
            </div>

            {/* Quick 7-Day Selector Strip */}
            <div className="grid grid-cols-7 gap-1.5 mb-3">
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
                    className={`p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                      !isWorking
                        ? 'bg-[#E6DFC6]/30 dark:bg-[#2F3B2F]/30 border border-dashed border-[#D8CEB3]/50 dark:border-[#445644]/40 text-[#8E8E84] dark:text-[#7A8A7A] cursor-not-allowed opacity-60'
                        : isSelected
                          ? 'bg-[#2D6A4F] text-[#FAF7F2] border border-[#2D6A4F] dark:border-[#52B788] shadow-xs cursor-pointer ring-2 ring-[#2D6A4F]/20'
                          : 'bg-[#FAF7F2] dark:bg-[#242C24] hover:bg-[#E6DFC6]/60 dark:hover:bg-[#2F3B2F] border border-[#D8CEB3] dark:border-[#445644] text-[#22291F] dark:text-[#FAF7F2] cursor-pointer'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-bold">
                      {item.isToday ? 'Today' : item.isTomorrow ? 'Tmrw' : item.dayShort}
                    </span>
                    <span className="text-sm font-black font-heading mt-0.5">
                      {item.dayNumber}
                    </span>
                    <span className={`text-[8px] mt-0.5 font-bold uppercase tracking-wider ${
                      !isWorking
                        ? 'text-rose-600 dark:text-rose-400'
                        : isSelected
                          ? 'text-[#A3C9B8]'
                          : 'text-[#2D6A4F] dark:text-[#52B788]'
                    }`}>
                      {!isWorking ? 'Off' : 'Open'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Manual Date Input & Live Token Estimator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      if (newDate >= todayStr) {
                        setDate(newDate);
                        setBookingError(null);
                      }
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-medium text-[#22291F] dark:text-[#FAF7F2] focus:outline-none transition-colors ${
                      !isDateWorkingDay
                        ? 'bg-rose-50/30 dark:bg-rose-950/20 border-2 border-rose-500 text-rose-800'
                        : 'bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] focus:border-[#2D6A4F] dark:focus:border-[#52B788]'
                    }`}
                  />
                </div>
              </div>

              {/* Live Token Estimator */}
              <div className="p-2.5 bg-[#FAF7F2] dark:bg-[#242C24] rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-semibold text-[#B35F2B] dark:text-[#E58A54] uppercase tracking-wider block">
                    Next Queue Token
                  </span>
                  <p className="text-lg font-black text-[#2D6A4F] dark:text-[#52B788] font-heading leading-tight">{estimatedToken}</p>
                  <p className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3]">Sequential daily OPD token</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/15 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Live Date Availability Indicator */}
            <div className="mt-2.5 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-white dark:bg-[#1C221C] border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xs">
              <div className="flex items-center gap-2.5">
                {!isDateWorkingDay ? (
                  <>
                    <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/40">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-rose-600 dark:text-rose-400 block">
                        Doctor Off Duty on {selectedDayInfo.full}
                      </span>
                      <p className="text-[11px] text-[#8E8E84] dark:text-[#94A493]">
                        Available clinic days: <strong>{doctorScheduleLabel}</strong>
                      </p>
                    </div>
                  </>
                ) : isDateFullyBooked ? (
                  <>
                    <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/40">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-rose-600 dark:text-rose-400 block">
                        Fully Booked ({bookedSlotsCount} of {totalSlotsCount} slots taken)
                      </span>
                      <p className="text-[11px] text-[#8E8E84] dark:text-[#94A493]">
                        No slots remaining on this day. Please pick another date.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900/40">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                        {availableSlotsCount} of {totalSlotsCount} slots available
                      </span>
                      <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3]">
                        {selectedDayInfo.full}, {date} • Standard OPD timings
                      </p>
                    </div>
                  </>
                )}
              </div>

              {isDateWorkingDay && (
                <div className="shrink-0 flex items-center gap-1.5 self-start sm:self-center">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                    isDateFullyBooked
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                  }`}>
                    {isDateFullyBooked ? 'Fully Booked' : `${availableSlotsCount} Slots Free`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Time Slot Picker with Booked Detection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">
                3. Available Time Slot
              </label>
              {loadingSlots && (
                <span className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] animate-pulse">
                  Checking slot availability...
                </span>
              )}
            </div>

            {!isDateWorkingDay ? (
              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-dashed border-rose-300 dark:border-rose-900/40 text-center text-xs text-rose-700 dark:text-rose-300">
                <p className="font-bold">No slots available on non-working days.</p>
                <p className="text-[11px] opacity-80 mt-0.5">Please select one of Dr. {selectedDoctor?.name}'s scheduled days ({doctorScheduleLabel}) above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      title={isBooked ? `${slot} is already booked on ${date}` : `Select ${slot}`}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isBooked
                          ? 'bg-[#E6DFC6]/40 dark:bg-[#2F3B2F]/40 border-[#D8CEB3]/50 dark:border-[#445644]/40 text-[#8E8E84] dark:text-[#7A8A7A] cursor-not-allowed opacity-75'
                          : isSelected
                            ? 'bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] border-[#2D6A4F] dark:border-[#52B788] shadow-xs cursor-pointer ring-2 ring-[#2D6A4F]/20'
                            : 'bg-[#FAF7F2] dark:bg-[#242C24] hover:bg-[#E6DFC6]/60 dark:hover:bg-[#2F3B2F] border-[#D8CEB3] dark:border-[#445644] text-[#6B6B63] dark:text-[#C4CFC3] cursor-pointer'
                      }`}
                    >
                      <span className={isBooked ? 'line-through decoration-rose-500 font-semibold' : 'font-semibold'}>
                        {slot}
                      </span>
                      {isBooked ? (
                        <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 px-1 py-0.2 rounded border border-rose-200 dark:border-rose-900/50">
                          Booked
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                          Available
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Patient Details & Reason */}
          <div className="space-y-3 pt-2 border-t border-[#E6DFC6] dark:border-[#2F3B2F]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] mb-1">
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
                  className={`w-full px-3.5 py-2 rounded-xl text-xs text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none transition-colors ${
                    fieldErrors.name
                      ? 'bg-rose-50/30 dark:bg-rose-950/20 border-2 border-rose-500 focus:border-rose-600'
                      : 'bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] focus:border-[#2D6A4F] dark:focus:border-[#52B788]'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.name}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] mb-1">
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
                  className={`w-full px-3.5 py-2 rounded-xl text-xs text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none transition-colors ${
                    fieldErrors.phone
                      ? 'bg-rose-50/30 dark:bg-rose-950/20 border-2 border-rose-500 focus:border-rose-600'
                      : 'bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] focus:border-[#2D6A4F] dark:focus:border-[#52B788]'
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3]">
                  Reason for Visit / Chief Health Concern <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[10px] text-[#8E8E84] dark:text-[#94A493]">
                  Required for doctor
                </span>
              </div>
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
                className={`w-full px-3.5 py-2 rounded-xl text-xs text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none transition-colors ${
                  fieldErrors.reason
                    ? 'bg-rose-50/30 dark:bg-rose-950/20 border-2 border-rose-500 focus:border-rose-600'
                    : 'bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] focus:border-[#2D6A4F] dark:focus:border-[#52B788]'
                }`}
              />
              {fieldErrors.reason && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.reason}</span>
                </p>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={
                loading || 
                !isDateWorkingDay || 
                isDateFullyBooked || 
                !activeSlot || 
                allBookedSlotsSet.has(activeSlot.trim().toLowerCase())
              }
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-[#FAF7F2] text-sm font-semibold rounded-xl transition-all shadow-sm ${
                loading || !isDateWorkingDay || isDateFullyBooked || !activeSlot || allBookedSlotsSet.has(activeSlot.trim().toLowerCase())
                  ? 'bg-[#E6DFC6]/50 dark:bg-[#2F3B2F]/60 text-[#8E8E84] dark:text-[#94A493] cursor-not-allowed opacity-60'
                  : 'bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] cursor-pointer'
              }`}
            >
              <span>
                {loading
                  ? 'Confirming Booking...'
                  : !isDateWorkingDay
                    ? `Doctor Off Duty on ${selectedDayInfo.full}`
                    : isDateFullyBooked
                      ? 'Fully Booked on This Date'
                      : `Confirm Booking • Token ${estimatedToken}`}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
