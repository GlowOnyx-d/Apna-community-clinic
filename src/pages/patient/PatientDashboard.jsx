import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';
import TokenSlipModal from '../../components/patient/TokenSlipModal';
import LabReportsSection from '../../components/patient/LabReportsSection';
import { 
  Calendar, 
  Ticket, 
  Stethoscope, 
  PlusCircle, 
  Award, 
  ChevronRight, 
  Sparkles,
  FileCheck,
  Megaphone,
  MapPin,
  Clock,
  Activity,
  CheckCircle2,
  Tv,
  ShieldCheck
} from 'lucide-react';
import { 
  getDoctorAvatar, 
  getDoctorFallbackAvatar, 
  getSpecialtyConfig 
} from '../../utils/doctorVisuals';

export default function PatientDashboard() {
  const { userProfile } = useAuth();
  const { doctors, appointments, announcements } = useData();
  const { t, language } = useLanguage();
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [activeSlipAppointment, setActiveSlipAppointment] = useState(null);
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter appointments for current patient
  const myAppointments = appointments.filter(
    a => a.patientId === userProfile?.uid || a.patientEmail === userProfile?.email
  );

  const pendingAppointments = myAppointments.filter(a => a.status === 'pending');
  const nextAppointment = pendingAppointments[0] || null;
  const completedAppointments = myAppointments.filter(a => a.status === 'done');

  // Calculate live queue wait time and patients ahead for active consultation
  const aheadAppointments = useMemo(() => {
    if (!nextAppointment) return [];
    return appointments.filter(a => 
      a.date === nextAppointment.date && 
      (a.doctorId === nextAppointment.doctorId || a.doctorName === nextAppointment.doctorName) && 
      a.status === 'pending' &&
      new Date(a.createdAt || 0) < new Date(nextAppointment.createdAt || 0)
    );
  }, [appointments, nextAppointment]);

  const estimatedWaitMins = (aheadAppointments.length + 1) * 12;

  // Compute live availability and highlight doctor(s) with highest remaining daily capacity
  const doctorsWithAvailability = useMemo(() => {
    const list = doctors.map(doc => {
      const bookedToday = appointments.filter(a => {
        if (a.date !== todayStr || a.status === 'cancelled') return false;
        if (a.doctorId && doc.id && a.doctorId === doc.id) return true;
        if (a.doctorEmail && doc.email && a.doctorEmail.toLowerCase() === doc.email.toLowerCase()) return true;
        if (a.doctorName && doc.name) {
          const aName = a.doctorName.replace(/^Dr\.\s*/i, '').trim().toLowerCase();
          const dName = doc.name.replace(/^Dr\.\s*/i, '').trim().toLowerCase();
          return aName === dName;
        }
        return false;
      }).length;

      const totalSlots = doc.availableSlots?.length || 4;
      const remainingToday = Math.max(0, totalSlots - bookedToday);

      return {
        ...doc,
        bookedToday,
        totalSlots,
        remainingToday
      };
    });

    const maxRemaining = Math.max(0, ...list.map(d => d.remainingToday));

    return list.map(doc => ({
      ...doc,
      hasMoreAvailability: doc.remainingToday === maxRemaining && maxRemaining > 0
    }));
  }, [doctors, appointments, todayStr]);

  // Filtered doctors by specialty tab
  const filteredDoctors = useMemo(() => {
    if (specialtyFilter === 'all') return doctorsWithAvailability;
    return doctorsWithAvailability.filter(doc => {
      const spec = (doc.specialization || '').toLowerCase();
      if (specialtyFilter === 'general') return spec.includes('general') || spec.includes('family') || spec.includes('internal');
      if (specialtyFilter === 'pediatrics') return spec.includes('pediatric') || spec.includes('child');
      if (specialtyFilter === 'dental') return spec.includes('dental');
      if (specialtyFilter === 'diagnostics') return spec.includes('diagnostic') || spec.includes('pathology') || spec.includes('screening');
      return true;
    });
  }, [doctorsWithAvailability, specialtyFilter]);

  const handleOpenBooking = (doc = null) => {
    setSelectedDoctorForBooking(doc);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (bookedAppointment) => {
    setBookingModalOpen(false);
    setActiveSlipAppointment(bookedAppointment);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#F0EBE1] dark:bg-[#1C221C] border border-[#E4DCCE] dark:border-[#2F3B2F] text-[#22291F] dark:text-[#FAF7F2] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E58A54] text-xs font-semibold border border-[#C97B4A]/30 dark:border-[#E58A54]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#B35F2B] dark:text-[#E58A54]" />
              <span>{t('patientPortalTitle', 'Community Primary Health Portal')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[#22291F] dark:text-[#FAF7F2]">
              {t('hello', 'Hello')}, {userProfile?.name || t('communityMember', 'Community Member')}
            </h1>
            <p className="text-sm text-[#6B6B63] dark:text-[#C4CFC3] leading-relaxed font-sans">
              {t('patientHeroSubtitle', 'Book consultations with clinic specialists, access digital queue tokens in real-time, and explore free community health camps under SDG 3.')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleOpenBooking()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] font-semibold text-sm transition-transform active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#FAF7F2]" />
              <span>{t('bookAppointment', 'Book Appointment')}</span>
            </button>
            <Link
              to="/patient/appointments"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8CEB3] dark:border-[#2F3B2F] bg-[#FAF7F2] dark:bg-[#242C24] hover:bg-[#E6DFC6]/60 dark:hover:bg-[#2F3B2F] text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] font-medium text-sm transition-colors"
            >
              <FileCheck className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
              <span>{t('visitHistory', 'Visit History')} ({completedAppointments.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Queue / Next Appointment Tracker - Digital Boarding Pass Treatment */}
      {nextAppointment && (
        <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-[#1C221C]/95 backdrop-blur-xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-lg shadow-[#2D6A4F]/5 transition-all">
          
          {/* Decorative Ticket Punchout Notches on the sides */}
          <div className="ticket-notch-left hidden sm:block" />
          <div className="ticket-notch-right hidden sm:block" />

          {/* Top Bar: Live Status & Token Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#2D6A4F]/8 via-[#52B788]/5 to-transparent dark:from-[#52B788]/15 dark:to-transparent border-b border-dashed border-[#E6DFC6] dark:border-[#2F3B2F] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-[#52B788] font-heading">
                {t('activeInQueue', 'Active Clinic Priority Pass')}
              </span>
              <span className="text-[11px] text-[#8E8E84] dark:text-[#94A493]">
                • {nextAppointment.date}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {aheadAppointments.length === 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 animate-pulse">
                  🟢 {language === 'hi' ? `आपकी बारी है! (${nextAppointment.cabin || 'केबिन 101'})` : `You are next! Near ${nextAppointment.cabin || 'Cabin 101'}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E58A54] border border-[#C97B4A]/25">
                  <Clock className="w-3.5 h-3.5" />
                  ~{estimatedWaitMins} mins wait ({aheadAppointments.length} patients ahead)
                </span>
              )}
            </div>
          </div>

          {/* Main Boarding Pass Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Segment: Huge Token Number & Slot Box */}
            <div className="md:col-span-3 flex md:flex-col items-center justify-between md:justify-center p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] text-center shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8E8E84] dark:text-[#94A493]">
                  {language === 'hi' ? 'दैनिक टोकन संख्या' : 'Daily Token No.'}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#2D6A4F] dark:text-[#52B788] tracking-tight font-heading mt-0.5">
                  {nextAppointment.tokenNumber}
                </div>
              </div>
              <div className="md:mt-3 pt-0 md:pt-3 border-l md:border-l-0 md:border-t border-[#E6DFC6] dark:border-[#2F3B2F] pl-4 md:pl-0 flex flex-col items-center">
                <span className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3] font-mono">
                  SLOT: {nextAppointment.time}
                </span>
                <span className="text-[10px] font-bold text-[#22291F] dark:text-[#FAF7F2] mt-0.5">
                  {nextAppointment.cabin || 'Cabin 101'}
                </span>
              </div>
            </div>

            {/* Center Segment: Doctor, Specialty & Patient Journey Milestone Tracker */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <div className="text-xs font-semibold text-[#8E8E84] dark:text-[#94A493] uppercase tracking-wider">
                  Consulting Specialist
                </div>
                <h3 className="text-lg font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading mt-0.5">
                  {nextAppointment.doctorName}
                </h3>
                <p className="text-xs text-[#2D6A4F] dark:text-[#52B788] font-medium">
                  {nextAppointment.specialization}
                </p>
                {nextAppointment.reason && (
                  <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-1.5 italic line-clamp-1">
                    "{nextAppointment.reason}"
                  </p>
                )}
              </div>

              {/* 3-Step Patient Progress Journey */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Consultation Flow</span>
                  <span className="text-[#2D6A4F] dark:text-[#52B788] font-mono">
                    {aheadAppointments.length === 0 ? 'Step 3 of 3' : 'Step 2 of 3'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  {/* Step 1 */}
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-semibold flex flex-col items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Token Reserved</span>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-2 rounded-xl border font-semibold flex flex-col items-center gap-1 transition-all ${
                    aheadAppointments.length > 0 
                      ? 'bg-[#C97B4A]/10 border-[#C97B4A]/30 text-[#C97B4A] dark:text-[#E58A54] ring-1 ring-[#C97B4A]/20'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    <Activity className="w-3.5 h-3.5" />
                    <span>{nextAppointment.vitals ? 'Vitals Logged' : 'Waiting in Queue'}</span>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-2 rounded-xl border font-semibold flex flex-col items-center gap-1 transition-all ${
                    aheadAppointments.length === 0
                      ? 'bg-emerald-500 text-white dark:bg-emerald-600 shadow-sm animate-pulse'
                      : 'bg-[#FAF7F2] dark:bg-[#242C24] border-[#E6DFC6] dark:border-[#2F3B2F] text-[#8E8E84] dark:text-[#94A493]'
                  }`}>
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Enter Cabin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Segment: Action Buttons */}
            <div className="md:col-span-3 flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center md:border-l md:border-dashed md:border-[#E6DFC6] md:dark:border-[#2F3B2F] md:pl-6">
              <button
                onClick={() => setActiveSlipAppointment(nextAppointment)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] font-semibold text-xs rounded-xl shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>{t('viewDigitalToken', 'View Digital Slip')}</span>
              </button>

              <Link
                to="/display"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#FAF7F2] dark:bg-[#242C24] hover:bg-[#E6DFC6]/60 dark:hover:bg-[#2F3B2F] border border-[#D8CEB3] dark:border-[#2F3B2F] text-[#22291F] dark:text-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors text-center"
              >
                <Tv className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                <span>Track on OPD TV</span>
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#C97B4A]/12 dark:bg-[#E58A54]/18 text-[#C97B4A] dark:text-[#E58A54] border border-[#C97B4A]/25 dark:border-[#E58A54]/30 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">{t('pendingVisits', 'Pending Visits')}</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{pendingAppointments.length}</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/12 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/25 dark:border-[#52B788]/30 flex items-center justify-center shrink-0">
            <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">{t('completed', 'Completed')}</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{completedAppointments.length}</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#C97B4A]/12 dark:bg-[#E58A54]/18 text-[#C97B4A] dark:text-[#E58A54] border border-[#C97B4A]/25 dark:border-[#E58A54]/30 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">{t('freeHealthCamps', 'Health Camps')}</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{announcements.length}</p>
          </div>
        </div>
      </div>

      {/* Available Doctors Directory */}
      <div id="specialists" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{t('clinicSpecialists', 'Clinic Specialists & Availability')}</h2>
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">{t('chooseSpecialist', 'Choose a department specialist and reserve your daily token')}</p>
          </div>

          {/* Specialty Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: language === 'hi' ? 'सभी विशेषज्ञ' : 'All Specialists', count: doctorsWithAvailability.length },
              { id: 'general', label: language === 'hi' ? 'सामान्य चिकित्सा' : 'General & Internal', count: doctorsWithAvailability.filter(d => (d.specialization || '').toLowerCase().match(/general|family|internal/)).length },
              { id: 'pediatrics', label: language === 'hi' ? 'बाल रोग' : 'Pediatrics', count: doctorsWithAvailability.filter(d => (d.specialization || '').toLowerCase().match(/pediatric|child/)).length },
              { id: 'dental', label: language === 'hi' ? 'दंत चिकित्सा' : 'Dental Care', count: doctorsWithAvailability.filter(d => (d.specialization || '').toLowerCase().match(/dental/)).length },
              { id: 'diagnostics', label: language === 'hi' ? 'जाँच एवं निदान' : 'Diagnostics', count: doctorsWithAvailability.filter(d => (d.specialization || '').toLowerCase().match(/diagnostic|pathology|screening/)).length }
            ].map(pill => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSpecialtyFilter(pill.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  specialtyFilter === pill.id
                    ? 'bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] shadow-xs scale-[1.02]'
                    : 'bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] text-[#6B6B63] dark:text-[#C4CFC3] hover:border-[#2D6A4F]/40 hover:text-[#22291F] dark:hover:text-[#FAF7F2]'
                }`}
              >
                <span>{pill.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  specialtyFilter === pill.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-[#FAF7F2] dark:bg-[#242C24] text-[#8E8E84] dark:text-[#94A493]'
                }`}>
                  {pill.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="bg-white dark:bg-[#1C221C] rounded-2xl border border-dashed border-[#D8CEB3] dark:border-[#2F3B2F] p-8 text-center space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#2D6A4F]/15 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#22291F] dark:text-[#FAF7F2] font-heading">
              {language === 'hi' ? 'इस श्रेणी में कोई डॉक्टर नहीं' : 'No Doctors in this Specialty'}
            </h3>
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] max-w-sm mx-auto">
              {language === 'hi' ? 'कृपया अन्य विशेषज्ञता श्रेणी चुनें या सभी डॉक्टर देखें।' : 'Please choose another specialty category or view all registered clinic specialists.'}
            </p>
            <button
              onClick={() => setSpecialtyFilter('all')}
              className="text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] underline cursor-pointer"
            >
              Show all doctors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredDoctors.map((doctor) => {
              const specialty = getSpecialtyConfig(doctor.specialization);
              return (
                <div 
                  key={doctor.id}
                  className={`bg-white dark:bg-[#1C221C] rounded-2xl border transition-all flex flex-col justify-between shadow-sm p-5 relative hover:-translate-y-1 hover:shadow-md ${
                    doctor.hasMoreAvailability
                      ? 'border-[#2D6A4F]/35 dark:border-[#52B788]/35 hover:border-[#2D6A4F]/60 dark:hover:border-[#52B788]/60 shadow-xs'
                      : 'border-[#E6DFC6] dark:border-[#2F3B2F] hover:border-[#2D6A4F]/40 dark:hover:border-[#445644]'
                  }`}
                >
                  <div>
                    {/* Top Row: Specialty Badge & Subtle Availability Tag */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide border ${specialty.badgeClass}`}>
                        {specialty.label}
                      </span>
                      {doctor.isOnLeave ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          {t('onLeave', 'On Leave Today')}
                        </span>
                      ) : doctor.hasMoreAvailability && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52B788]/15 dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#52B788]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] dark:bg-[#52B788]"></span>
                          {t('moreAvailability', 'More Availability')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-3 mb-3.5">
                      <img 
                        src={getDoctorAvatar(doctor)} 
                        alt={doctor.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getDoctorFallbackAvatar(doctor.name);
                        }}
                        className="w-12 h-12 rounded-xl object-cover border border-[#E6DFC6] dark:border-[#2F3B2F] shrink-0 bg-[#FAF7F2] dark:bg-[#242C24]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-[#22291F] dark:text-[#FAF7F2] text-sm font-heading">{doctor.name}</h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788] shrink-0" title="Verified Specialist" />
                        </div>
                        <p className="text-xs font-medium text-[#2D6A4F] dark:text-[#52B788] truncate">{doctor.specialization}</p>
                        <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3] mt-0.5">{doctor.cabin || 'Cabin 101'}</p>
                      </div>
                    </div>

                    <div className="py-2.5 border-y border-[#E6DFC6] dark:border-[#2F3B2F] space-y-1.5 my-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B6B63] dark:text-[#C4CFC3]">{t('availableSlots', 'Available Slots')}:</span>
                        <span className="font-medium text-[#22291F] dark:text-[#FAF7F2]">
                          {doctor.isOnLeave ? (language === 'hi' ? 'आज अनुपलब्ध' : 'Unavailable today') : `${doctor.remainingToday} ${t('slotsOpenToday', 'open today')}`} <span className="text-[#8E8E84] dark:text-[#94A493]">({doctor.totalSlots} / {language === 'hi' ? 'दिन' : 'day'})</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B6B63] dark:text-[#C4CFC3]">{t('experience', 'Experience')}:</span>
                        <span className="font-medium text-[#22291F] dark:text-[#FAF7F2]">{doctor.experience || '10+ yrs'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B6B63] dark:text-[#C4CFC3]">{t('consultationFee', 'Consultation')}:</span>
                        <span className="font-semibold text-[#2D6A4F] dark:text-[#52B788]">{t('freeCommunityCare', 'Free (Community Care)')}</span>
                      </div>
                    </div>

                    {/* Available Days Tags & Next Slot Chip */}
                    <div className="flex items-center justify-between gap-1 mb-4 flex-wrap">
                      <div className="flex flex-wrap gap-1">
                        {(doctor.availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri"]).slice(0, 4).map(day => (
                          <span key={day} className="px-2 py-0.5 bg-[#FAF7F2] dark:bg-[#242C24] text-[#6B6B63] dark:text-[#C4CFC3] border border-[#E6DFC6] dark:border-[#2F3B2F] rounded-md text-[10px] font-medium">
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                      {doctor.availableSlots && doctor.availableSlots[0] && (
                        <span className="text-[10px] font-semibold text-[#2D6A4F] dark:text-[#52B788] bg-[#2D6A4F]/8 dark:bg-[#52B788]/15 px-2 py-0.5 rounded-md">
                          Slot: {doctor.availableSlots[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => !doctor.isOnLeave && handleOpenBooking(doctor)}
                    disabled={doctor.isOnLeave}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 font-semibold text-xs rounded-xl transition-all shadow-xs active:scale-[0.98] ${
                      doctor.isOnLeave
                        ? 'bg-[#E6DFC6]/50 dark:bg-[#2F3B2F]/60 text-[#8E8E84] dark:text-[#94A493] cursor-not-allowed'
                        : 'bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] cursor-pointer'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{doctor.isOnLeave ? (language === 'hi' ? 'डॉक्टर आज अवकाश पर हैं' : 'Doctor on Leave Today') : t('bookToken', 'Book Appointment & Token')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Diagnostic Lab Reports & Pathology Tests */}
      <div className="bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] rounded-3xl p-6 sm:p-8 shadow-xs">
        <LabReportsSection />
      </div>

      {/* Community Health Camp Highlights */}
      <div className="bg-[#F0EBE1] dark:bg-[#1C221C] border border-[#E4DCCE] dark:border-[#2F3B2F] text-[#22291F] dark:text-[#FAF7F2] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E58A54] text-xs font-semibold border border-[#C97B4A]/30 dark:border-[#E58A54]/30 mb-2">
              <Award className="w-3.5 h-3.5 text-[#B35F2B] dark:text-[#E58A54]" />
              <span>{t('sdg3Title', 'UN Sustainable Development Goal 3')}</span>
            </div>
            <h2 className="text-xl font-bold font-heading">{t('communityHealthDrives', 'Free Community Health Camps')}</h2>
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">{t('communityHealthDrivesSubtitle', 'Neighborhood screenings, maternal wellness, and zero-cost specialist checkups')}</p>
          </div>
          <Link
            to="/announcements"
            className="flex items-center gap-1 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] hover:underline"
          >
            <span>{t('viewAllEvents', 'View All 3 Community Drives')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.slice(0, 3).map((ann) => (
            <div 
              key={ann.id} 
              className="bg-white dark:bg-[#242C24] p-5 rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-xs flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
            >
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C97B4A]/10 text-[#C97B4A] dark:text-[#E58A54] border border-[#C97B4A]/20">
                  {ann.category || 'Health Camp'}
                </span>
                <h3 className="font-bold text-[#22291F] dark:text-[#FAF7F2] text-sm line-clamp-2 font-heading">{ann.title}</h3>
                <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] line-clamp-3 leading-relaxed">{ann.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E6DFC6] dark:border-[#2F3B2F] flex items-center justify-between text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                  {ann.date}
                </span>
                <span className="flex items-center gap-1 truncate max-w-[130px]">
                  <MapPin className="w-3.5 h-3.5 text-[#C97B4A]" />
                  {ann.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Booking Modal */}
      {bookingModalOpen && (
        <BookAppointmentModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          selectedDoctor={selectedDoctorForBooking}
          initialDoctor={selectedDoctorForBooking}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Digital Token Slip Modal */}
      {activeSlipAppointment && (
        <TokenSlipModal
          appointment={activeSlipAppointment}
          onClose={() => setActiveSlipAppointment(null)}
        />
      )}

    </div>
  );
}
