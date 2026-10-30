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
import HealthCampCard from '../../components/common/HealthCampCard';

export default function PatientDashboard() {
  const { userProfile } = useAuth();
  const { doctors, appointments, announcements, rsvpAnnouncement } = useData();
  const { t, language } = useLanguage();
  const [rsvpSync, setRsvpSync] = useState(0);

  const handleRsvp = async (annId) => {
    if (rsvpAnnouncement) {
      await rsvpAnnouncement(annId);
      setRsvpSync(prev => prev + 1);
    }
  };
  
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
      <div className="relative overflow-hidden rounded-3xl bg-[#E8F0EE] dark:bg-[#121C21] border border-[#DCE5E2] dark:border-[#21333A] text-[#132226] dark:text-[#F4F7F6] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/15 text-[#EA580C] dark:text-[#FB923C] text-xs font-semibold border border-[#F97316]/30 dark:border-[#FB923C]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C] dark:text-[#FB923C]" />
              <span>{t('patientPortalTitle', 'Community Primary Health Portal')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[#132226] dark:text-[#F4F7F6]">
              {t('hello', 'Hello')}, {userProfile?.name || t('communityMember', 'Community Member')}
            </h1>
            <p className="text-sm text-[#5A7178] dark:text-[#9DB4BA] leading-relaxed font-sans">
              {t('patientHeroSubtitle', 'Book consultations with clinic specialists, access digital queue tokens in real-time, and explore free community health camps under SDG 3.')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleOpenBooking()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] font-semibold text-sm transition-transform active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#F4F7F6]" />
              <span>{t('bookAppointment', 'Book Appointment')}</span>
            </button>
            <Link
              to="/patient/appointments"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#CFDAD6] dark:border-[#21333A] bg-[#F4F7F6] dark:bg-[#19272D] hover:bg-[#E0E7E5]/60 dark:hover:bg-[#21333A] text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] font-medium text-sm transition-colors"
            >
              <FileCheck className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
              <span>{t('visitHistory', 'Visit History')} ({completedAppointments.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Queue / Next Appointment Tracker - Digital Boarding Pass Treatment */}
      {nextAppointment && (
        <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-[#121C21]/95 backdrop-blur-xl border border-[#E0E7E5] dark:border-[#21333A] shadow-lg shadow-[#0F766E]/5 transition-all">
          
          {/* Decorative Ticket Punchout Notches on the sides */}
          <div className="ticket-notch-left hidden sm:block" />
          <div className="ticket-notch-right hidden sm:block" />

          {/* Top Bar: Live Status & Token Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#0F766E]/8 via-[#2DD4BF]/5 to-transparent dark:from-[#2DD4BF]/15 dark:to-transparent border-b border-dashed border-[#E0E7E5] dark:border-[#21333A] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF] font-heading">
                {t('activeInQueue', 'Active Clinic Priority Pass')}
              </span>
              <span className="text-[11px] text-[#758D94] dark:text-[#79949B]">
                • {nextAppointment.date}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {aheadAppointments.length === 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 animate-pulse">
                  🟢 {language === 'hi' ? `आपकी बारी है! (${nextAppointment.cabin || 'केबिन 101'})` : `You are next! Near ${nextAppointment.cabin || 'Cabin 101'}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F97316]/15 text-[#EA580C] dark:text-[#FB923C] border border-[#F97316]/25">
                  <Clock className="w-3.5 h-3.5" />
                  ~{estimatedWaitMins} mins wait ({aheadAppointments.length} patients ahead)
                </span>
              )}
            </div>
          </div>

          {/* Main Boarding Pass Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Segment: Huge Token Number & Slot Box */}
            <div className="md:col-span-3 flex md:flex-col items-center justify-between md:justify-center p-4 rounded-2xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#E0E7E5] dark:border-[#21333A] text-center shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#758D94] dark:text-[#79949B]">
                  {language === 'hi' ? 'दैनिक टोकन संख्या' : 'Daily Token No.'}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#0F766E] dark:text-[#2DD4BF] tracking-tight font-heading mt-0.5">
                  {nextAppointment.tokenNumber}
                </div>
              </div>
              <div className="md:mt-3 pt-0 md:pt-3 border-l md:border-l-0 md:border-t border-[#E0E7E5] dark:border-[#21333A] pl-4 md:pl-0 flex flex-col items-center">
                <span className="text-[10px] text-[#5A7178] dark:text-[#9DB4BA] font-mono">
                  SLOT: {nextAppointment.time}
                </span>
                <span className="text-[10px] font-bold text-[#132226] dark:text-[#F4F7F6] mt-0.5">
                  {nextAppointment.cabin || 'Cabin 101'}
                </span>
              </div>
            </div>

            {/* Center Segment: Doctor, Specialty & Patient Journey Milestone Tracker */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <div className="text-xs font-semibold text-[#758D94] dark:text-[#79949B] uppercase tracking-wider">
                  Consulting Specialist
                </div>
                <h3 className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading mt-0.5">
                  {nextAppointment.doctorName}
                </h3>
                <p className="text-xs text-[#0F766E] dark:text-[#2DD4BF] font-medium">
                  {nextAppointment.specialization}
                </p>
                {nextAppointment.reason && (
                  <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-1.5 italic line-clamp-1">
                    "{nextAppointment.reason}"
                  </p>
                )}
              </div>

              {/* 3-Step Patient Progress Journey */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Consultation Flow</span>
                  <span className="text-[#0F766E] dark:text-[#2DD4BF] font-mono">
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
                      ? 'bg-[#F97316]/10 border-[#F97316]/30 text-[#F97316] dark:text-[#FB923C] ring-1 ring-[#F97316]/20'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    <Activity className="w-3.5 h-3.5" />
                    <span>{nextAppointment.vitals ? 'Vitals Logged' : 'Waiting in Queue'}</span>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-2 rounded-xl border font-semibold flex flex-col items-center gap-1 transition-all ${
                    aheadAppointments.length === 0
                      ? 'bg-emerald-500 text-white dark:bg-emerald-600 shadow-sm animate-pulse'
                      : 'bg-[#F4F7F6] dark:bg-[#19272D] border-[#E0E7E5] dark:border-[#21333A] text-[#758D94] dark:text-[#79949B]'
                  }`}>
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Enter Cabin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Segment: Action Buttons */}
            <div className="md:col-span-3 flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center md:border-l md:border-dashed md:border-[#E0E7E5] md:dark:border-[#21333A] md:pl-6">
              <button
                onClick={() => setActiveSlipAppointment(nextAppointment)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] font-semibold text-xs rounded-xl shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>{t('viewDigitalToken', 'View Digital Slip')}</span>
              </button>

              <Link
                to="/display"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#F4F7F6] dark:bg-[#19272D] hover:bg-[#E0E7E5]/60 dark:hover:bg-[#21333A] border border-[#CFDAD6] dark:border-[#21333A] text-[#132226] dark:text-[#F4F7F6] text-xs font-semibold rounded-xl transition-colors text-center"
              >
                <Tv className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
                <span>Track on OPD TV</span>
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#121C21] border border-[#E0E7E5] dark:border-[#21333A] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#F97316]/12 dark:bg-[#FB923C]/18 text-[#F97316] dark:text-[#FB923C] border border-[#F97316]/25 dark:border-[#FB923C]/30 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider">{t('pendingVisits', 'Pending Visits')}</p>
            <p className="text-xl sm:text-2xl font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{pendingAppointments.length}</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#121C21] border border-[#E0E7E5] dark:border-[#21333A] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#0F766E]/12 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0F766E]/25 dark:border-[#2DD4BF]/30 flex items-center justify-center shrink-0">
            <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider">{t('completed', 'Completed')}</p>
            <p className="text-xl sm:text-2xl font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{completedAppointments.length}</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#121C21] border border-[#E0E7E5] dark:border-[#21333A] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#F97316]/12 dark:bg-[#FB923C]/18 text-[#F97316] dark:text-[#FB923C] border border-[#F97316]/25 dark:border-[#FB923C]/30 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider">{t('freeHealthCamps', 'Health Camps')}</p>
            <p className="text-xl sm:text-2xl font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{announcements.length}</p>
          </div>
        </div>
      </div>

      {/* Available Doctors Directory */}
      <div id="specialists" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{t('clinicSpecialists', 'Clinic Specialists & Availability')}</h2>
            <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">{t('chooseSpecialist', 'Choose a department specialist and reserve your daily token')}</p>
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
                    ? 'bg-[#0F766E] dark:bg-[#0D9488] text-[#F4F7F6] shadow-xs scale-[1.02]'
                    : 'bg-white dark:bg-[#121C21] border border-[#E0E7E5] dark:border-[#21333A] text-[#5A7178] dark:text-[#9DB4BA] hover:border-[#0F766E]/40 hover:text-[#132226] dark:hover:text-[#F4F7F6]'
                }`}
              >
                <span>{pill.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  specialtyFilter === pill.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-[#F4F7F6] dark:bg-[#19272D] text-[#758D94] dark:text-[#79949B]'
                }`}>
                  {pill.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="bg-white dark:bg-[#121C21] rounded-2xl border border-dashed border-[#CFDAD6] dark:border-[#21333A] p-8 text-center space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#0F766E]/15 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center mx-auto">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#132226] dark:text-[#F4F7F6] font-heading">
              {language === 'hi' ? 'इस श्रेणी में कोई डॉक्टर नहीं' : 'No Doctors in this Specialty'}
            </h3>
            <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] max-w-sm mx-auto">
              {language === 'hi' ? 'कृपया अन्य विशेषज्ञता श्रेणी चुनें या सभी डॉक्टर देखें।' : 'Please choose another specialty category or view all registered clinic specialists.'}
            </p>
            <button
              onClick={() => setSpecialtyFilter('all')}
              className="text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF] underline cursor-pointer"
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
                  className={`bg-white dark:bg-[#121C21] rounded-2xl border transition-all flex flex-col justify-between shadow-sm p-5 relative hover:-translate-y-1 hover:shadow-md ${
                    doctor.hasMoreAvailability
                      ? 'border-[#0F766E]/35 dark:border-[#2DD4BF]/35 hover:border-[#0F766E]/60 dark:hover:border-[#2DD4BF]/60 shadow-xs'
                      : 'border-[#E0E7E5] dark:border-[#21333A] hover:border-[#0F766E]/40 dark:hover:border-[#2C444E]'
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
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/15 dark:text-[#2DD4BF] border border-[#0F766E]/20 dark:border-[#2DD4BF]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF]"></span>
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
                        className="w-12 h-12 rounded-xl object-cover border border-[#E0E7E5] dark:border-[#21333A] shrink-0 bg-[#F4F7F6] dark:bg-[#19272D]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-[#132226] dark:text-[#F4F7F6] text-sm font-heading">{doctor.name}</h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" title="Verified Specialist" />
                        </div>
                        <p className="text-xs font-medium text-[#0F766E] dark:text-[#2DD4BF] truncate">{doctor.specialization}</p>
                        <p className="text-[11px] text-[#5A7178] dark:text-[#9DB4BA] mt-0.5">{doctor.cabin || 'Cabin 101'}</p>
                      </div>
                    </div>

                    <div className="py-2.5 border-y border-[#E0E7E5] dark:border-[#21333A] space-y-1.5 my-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5A7178] dark:text-[#9DB4BA]">{t('availableSlots', 'Available Slots')}:</span>
                        <span className="font-medium text-[#132226] dark:text-[#F4F7F6]">
                          {doctor.isOnLeave ? (language === 'hi' ? 'आज अनुपलब्ध' : 'Unavailable today') : `${doctor.remainingToday} ${t('slotsOpenToday', 'open today')}`} <span className="text-[#758D94] dark:text-[#79949B]">({doctor.totalSlots} / {language === 'hi' ? 'दिन' : 'day'})</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5A7178] dark:text-[#9DB4BA]">{t('experience', 'Experience')}:</span>
                        <span className="font-medium text-[#132226] dark:text-[#F4F7F6]">{doctor.experience || '10+ yrs'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5A7178] dark:text-[#9DB4BA]">{t('consultationFee', 'Consultation')}:</span>
                        <span className="font-semibold text-[#0F766E] dark:text-[#2DD4BF]">{t('freeCommunityCare', 'Free (Community Care)')}</span>
                      </div>
                    </div>

                    {/* Available Days Tags & Next Slot Chip */}
                    <div className="flex items-center justify-between gap-1 mb-4 flex-wrap">
                      <div className="flex flex-wrap gap-1">
                        {(doctor.availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri"]).slice(0, 4).map(day => (
                          <span key={day} className="px-2 py-0.5 bg-[#F4F7F6] dark:bg-[#19272D] text-[#5A7178] dark:text-[#9DB4BA] border border-[#E0E7E5] dark:border-[#21333A] rounded-md text-[10px] font-medium">
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                      {doctor.availableSlots && doctor.availableSlots[0] && (
                        <span className="text-[10px] font-semibold text-[#0F766E] dark:text-[#2DD4BF] bg-[#0F766E]/8 dark:bg-[#2DD4BF]/15 px-2 py-0.5 rounded-md">
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
                        ? 'bg-[#E0E7E5]/50 dark:bg-[#21333A]/60 text-[#758D94] dark:text-[#79949B] cursor-not-allowed'
                        : 'bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] cursor-pointer'
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
      <div className="bg-white dark:bg-[#121C21] border border-[#E0E7E5] dark:border-[#21333A] rounded-3xl p-6 sm:p-8 shadow-xs">
        <LabReportsSection />
      </div>

      {/* Community Health Camp Highlights */}
      <div className="bg-[#E8F0EE] dark:bg-[#121C21] border border-[#DCE5E2] dark:border-[#21333A] text-[#132226] dark:text-[#F4F7F6] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F97316]/15 text-[#EA580C] dark:text-[#FB923C] text-xs font-semibold border border-[#F97316]/30 dark:border-[#FB923C]/30 mb-2">
              <Award className="w-3.5 h-3.5 text-[#EA580C] dark:text-[#FB923C]" />
              <span>{t('sdg3Title', 'UN Sustainable Development Goal 3')}</span>
            </div>
            <h2 className="text-xl font-bold font-heading">{t('communityHealthDrives', 'Free Community Health Camps')}</h2>
            <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">{t('communityHealthDrivesSubtitle', 'Neighborhood screenings, maternal wellness, and zero-cost specialist checkups')}</p>
          </div>
          <Link
            to="/announcements"
            className="flex items-center gap-1 text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF] hover:underline"
          >
            <span>{t('viewAllEvents', 'View All 3 Community Drives')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.slice(0, 3).map((ann) => {
            const isRsvpd = typeof window !== 'undefined' && localStorage.getItem(`Apna_rsvp_${ann.id}`) === 'true';
            return (
              <HealthCampCard
                key={`${ann.id}_${rsvpSync}`}
                ann={ann}
                role="patient"
                onRsvp={handleRsvp}
                isRsvpd={isRsvpd}
              />
            );
          })}
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
