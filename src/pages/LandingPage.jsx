import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ClinicPulseTicker from '../components/common/ClinicPulseTicker';
import BookAppointmentModal from '../components/patient/BookAppointmentModal';
import TokenSlipModal from '../components/patient/TokenSlipModal';
import {
  Stethoscope,
  Ticket,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Quote,
  HeartHandshake,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import QRCodeImage from '../components/common/QRCodeImage';
import { getMobileReachableUrl } from '../utils/networkUrl';

export default function LandingPage() {
  const { currentUser, role } = useAuth();
  const { doctors } = useData();

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'doctor') return '/doctor';
    return '/patient';
  };

  // Booking & Slip Modals State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [slipAppointment, setSlipAppointment] = useState(null);

  const openBookingModal = (doctor = null) => {
    setSelectedDoctorForBooking(doctor);
    setBookingModalOpen(true);
  };

  // Instant Queue Estimator State
  const departments = [
    {
      id: 'general',
      name: 'General Medicine',
      doctor: 'Dr. Sarah Jenkins, MD',
      cabin: 'Cabin 101',
      servingToken: 'TK-14',
      nextToken: 'TK-15',
      estWait: '~8 mins',
      slotsLeft: 6,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100'
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics & Child Care',
      doctor: 'Dr. Priya Nair, DCH',
      cabin: 'Cabin 102',
      servingToken: 'TK-09',
      nextToken: 'TK-10',
      estWait: '~12 mins',
      slotsLeft: 4,
      avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=100'
    },
    {
      id: 'dental',
      name: 'Community Dental Care',
      doctor: 'Dr. Amitav Roy, BDS',
      cabin: 'Cabin 103',
      servingToken: 'TK-06',
      nextToken: 'TK-07',
      estWait: '~15 mins',
      slotsLeft: 3,
      avatar: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=100'
    },
    {
      id: 'diagnostic',
      name: 'Preventive Diagnostics',
      doctor: 'Dr. Meera Iyer, MBBS',
      cabin: 'Cabin 104',
      servingToken: 'TK-21',
      nextToken: 'TK-22',
      estWait: '~5 mins',
      slotsLeft: 8,
      avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100'
    }
  ];

  const [selectedDeptId, setSelectedDeptId] = useState('general');
  const activeDept = departments.find(d => d.id === selectedDeptId) || departments[0];

  // Default doctor showcase items if database is empty
  const defaultDoctors = [
    {
      id: 'doc_1',
      name: 'Dr. Sarah Jenkins',
      specialization: 'General Medicine & Family Practice',
      cabin: 'Cabin 101',
      experience: '12+ yrs',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100'
    },
    {
      id: 'doc_2',
      name: 'Dr. Priya Nair',
      specialization: 'Pediatrics & Child Health',
      cabin: 'Cabin 102',
      experience: '9+ yrs',
      days: ['Mon', 'Wed', 'Fri', 'Sat'],
      avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=100'
    },
    {
      id: 'doc_3',
      name: 'Dr. Amitav Roy',
      specialization: 'Community Dental Hygiene & Care',
      cabin: 'Cabin 103',
      experience: '8+ yrs',
      days: ['Tue', 'Thu', 'Sat'],
      avatar: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=100'
    }
  ];

  const displayDoctors = doctors.length > 0 ? doctors.slice(0, 3) : defaultDoctors;

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-300">

      {/* 1. Live Clinic Pulse Ticker Bar */}
      <ClinicPulseTicker />

      {/* 2. Hero Section with Floating Live Token Mockup */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 overflow-hidden">
        {/* Warm Ambient Radial Glow for Dark Mode */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#52B788]/10 via-transparent to-[#E58A54]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Subtle Botanical Motif Watermark - Hidden on mobile to avoid slicing through text */}
        <div className="hidden md:block absolute -top-6 right-0 lg:right-12 w-72 sm:w-96 h-72 sm:h-96 pointer-events-none opacity-20 dark:opacity-10 select-none">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#2D6A4F] dark:text-[#52B788]">
            <path d="M50 160 C 50 120, 80 80, 140 40 C 140 80, 120 130, 70 160 Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
            <path d="M140 40 C 120 90, 80 130, 50 160" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
            <circle cx="140" cy="40" r="3" fill="#C97B4A" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">

            {/* SDG 3 Terracotta Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#C97B4A]/12 border border-[#C97B4A]/30 dark:border-[#E58A54]/40 dark:bg-[#E58A54]/15 text-[#B35F2B] dark:text-[#E58A54] text-[11px] sm:text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C97B4A] dark:text-[#E58A54] shrink-0" />
              <span>UN SDG 3 • Good Health &amp; Well-Being</span>
            </div>

            {/* Headline - beautifully proportioned on mobile and desktop */}
            <h1 className="text-2xl sm:text-4xl lg:text-[50px] font-extrabold text-[#22291F] dark:text-[#FAF7F2] tracking-tight leading-[1.2] font-heading">
              Universal Community Care &amp; <span className="text-[#2D6A4F] dark:text-[#52B788]">Digital Queue Scheduling</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base lg:text-lg text-[#6B6B63] dark:text-[#C4CFC3] leading-relaxed max-w-xl mx-auto lg:mx-0 font-sans">
              A trusted primary healthcare portal that replaces crowded clinic waiting rooms with real-time digital token allocation, specialist queues, and free community health camps.
            </p>

            {/* Action Buttons - Clean Mobile Grid & Touch Targets */}
            <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 w-full max-w-md mx-auto lg:mx-0">
              <button
                onClick={() => openBookingModal(null)}
                className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#40916C] text-[#FAF7F2] font-bold text-sm shadow-md shadow-[#2D6A4F]/20 dark:border dark:border-[#52B788]/40 hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
              >
                <span>Book Free Queue Token</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
                {currentUser ? (
                  <Link
                    to={getDashboardPath()}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl border-2 border-[#2D6A4F] text-[#FAF7F2] bg-[#2D6A4F] hover:bg-[#23543E] font-bold text-xs sm:text-sm transition-all dark:border-[#52B788] dark:bg-[#357A5B] dark:hover:bg-[#40916C] text-center shadow-xs cursor-pointer"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center justify-center py-2.5 px-4 rounded-2xl border-2 border-[#2D6A4F] text-[#2D6A4F] bg-[#FAF7F2] hover:bg-[#2D6A4F]/8 font-bold text-xs sm:text-sm transition-all dark:bg-[#1C221C] dark:text-[#52B788] dark:border-[#52B788]/50 dark:hover:bg-[#2D6A4F]/20 text-center"
                  >
                    <span>Sign In</span>
                  </Link>
                )}

                <Link
                  to="/announcements"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl border border-[#D8CEB3] dark:border-[#2F3B2F] bg-white dark:bg-[#1C221C] text-[#2D6A4F] dark:text-[#52B788] font-bold text-xs sm:text-sm transition-all text-center shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                  <span>Health Drives</span>
                </Link>
              </div>
            </div>

            {/* Trust Badges - Balanced Compact Flow */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                <span>Secure Cloud Sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                <span>Encrypted Firestore Storage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                <span>Instant Digital Token Slips</span>
              </div>
            </div>

          </div>

          {/* Right Hero Column: Floating Live Token Ticket Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md animate-gentle-float">

              {/* Ticket Container with Perforated Cutouts */}
              <div className="relative bg-white dark:bg-[#1C221C] rounded-3xl border-2 border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-6 sm:p-7 overflow-hidden text-[#22291F] dark:text-[#FAF7F2]">

                {/* Left & Right Perforated Notches */}
                <div className="absolute top-1/2 -left-3.5 w-7 h-7 rounded-full bg-[#FAF7F2] dark:bg-[#151915] border border-[#E6DFC6] dark:border-[#2F3B2F]"></div>
                <div className="absolute top-1/2 -right-3.5 w-7 h-7 rounded-full bg-[#FAF7F2] dark:bg-[#151915] border border-[#E6DFC6] dark:border-[#2F3B2F]"></div>

                {/* Ticket Top Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] text-[#FAF7F2] flex items-center justify-center shadow-xs">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm font-heading">Apna Community Clinic</h3>
                      <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3]">Digital Queue Allocation</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2D6A4F]/15 text-[#2D6A4F] dark:bg-[#2D6A4F]/25 dark:text-[#52B788] border border-[#2D6A4F]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse"></span>
                    Now Serving
                  </span>
                </div>

                {/* Main Queue Numbers Badge */}
                <div className="my-5 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#151915] border border-[#E6DFC6] dark:border-[#2F3B2F] text-center relative">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B63] dark:text-[#C4CFC3]">
                    Currently In Cabin 101
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-[#2D6A4F] dark:text-[#52B788] font-heading my-1 tracking-tight">
                    TK-14
                  </div>
                  <p className="text-xs font-semibold text-[#22291F] dark:text-[#FAF7F2]">
                    General Medicine • Dr. Sarah Jenkins
                  </p>
                </div>

                {/* Live Estimator Preview Row */}
                <div className="space-y-2.5 text-xs py-2 border-t border-dashed border-[#E6DFC6] dark:border-[#2F3B2F]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Next Token in Line:</span>
                    <span className="font-bold text-sm text-[#C97B4A] dark:text-[#E58A54]">TK-15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Estimated Queue Wait:</span>
                    <span className="font-bold text-[#22291F] dark:text-[#FAF7F2]">~8 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Consultation Fee:</span>
                    <span className="font-bold text-[#2D6A4F] dark:text-[#52B788]">100% Free (Community Care)</span>
                  </div>
                </div>

                {/* Queue Progress Bar */}
                <div className="mt-4 pt-3 border-t border-[#E6DFC6] dark:border-[#2F3B2F]">
                  <div className="flex justify-between text-[11px] mb-1.5 font-medium">
                    <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Today's Consultations</span>
                    <span className="text-[#2D6A4F] dark:text-[#52B788] font-bold">14 / 20 Completed</span>
                  </div>
                  <div className="w-full h-2 bg-[#FAF7F2] dark:bg-[#151915] rounded-full overflow-hidden border border-[#E6DFC6] dark:border-[#2F3B2F]">
                    <div className="h-full bg-[#2D6A4F] dark:bg-[#52B788] rounded-full transition-all duration-500" style={{ width: '70%' }}></div>
                  </div>
                </div>

                {/* Quick Link Button */}
                <button
                  onClick={() => openBookingModal(null)}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#40916C] dark:border dark:border-[#52B788]/40 text-[#FAF7F2] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Reserve Your Token Slip Now</span>
                </button>

                {/* Mobile Express QR Scan */}
                <div className="mt-3.5 pt-3 border-t border-dashed border-[#E6DFC6] dark:border-[#2F3B2F] flex items-center gap-3">
                  <div className="p-1 bg-white rounded-lg border border-[#E6DFC6] shrink-0 shadow-2xs">
                    <QRCodeImage 
                      value={getMobileReachableUrl()} 
                      size={44} 
                      darkColor="#2D6A4F" 
                      alt="Mobile Check-in QR"
                    />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] font-bold text-[#22291F] dark:text-[#FAF7F2] uppercase tracking-wider flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" /> Mobile Express Token
                    </p>
                    <p className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3]">Scan with smartphone camera to book and track from your phone</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Interactive Instant Queue Estimator Live Demo Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-lg p-6 sm:p-10">

          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/12 text-[#2D6A4F] dark:bg-[#2D6A4F]/20 dark:text-[#52B788] text-xs font-bold border border-[#2D6A4F]/25">
              <Clock className="w-3.5 h-3.5" />
              <span>Interactive Queue Demo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#22291F] dark:text-[#FAF7F2]">
              Check Wait Time &amp; Reserve Live Token
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B63] dark:text-[#C4CFC3]">
              Choose a medical department below to check real-time queue capacity, available slots, and estimated consultation wait times.
            </p>
          </div>

          {/* Department Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
            {departments.map((dept) => {
              const isSelected = dept.id === selectedDeptId;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${isSelected
                    ? 'bg-[#2D6A4F] text-[#FAF7F2] border-[#2D6A4F] dark:bg-[#357A5B] dark:border-[#52B788]/60 shadow-md -translate-y-0.5'
                    : 'bg-[#FAF7F2] dark:bg-[#151915] border-[#E6DFC6] dark:border-[#2F3B2F] text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#22291F] dark:hover:text-[#FAF7F2] hover:border-[#D8CEB3]'
                    }`}
                >
                  <p className="text-xs font-bold truncate">{dept.name}</p>
                  <span className={`text-[11px] font-semibold mt-1 block ${isSelected ? 'text-[#FAF7F2]/90' : 'text-[#2D6A4F] dark:text-[#52B788]'}`}>
                    {dept.cabin}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Queue Output Box */}
          <div className="bg-[#FAF7F2] dark:bg-[#151915] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">

              {/* Doctor on Duty */}
              <div className="flex items-center gap-3.5">
                <img
                  src={activeDept.avatar}
                  alt={activeDept.doctor}
                  className="w-13 h-13 rounded-2xl object-cover border border-[#E6DFC6] dark:border-[#2F3B2F] shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B63] dark:text-[#C4CFC3]">Specialist on Duty</span>
                  <h4 className="font-bold text-sm text-[#22291F] dark:text-[#FAF7F2] font-heading">{activeDept.doctor}</h4>
                  <p className="text-xs text-[#2D6A4F] dark:text-[#52B788] font-medium">{activeDept.cabin}</p>
                </div>
              </div>

              {/* Currently Serving Token */}
              <div className="text-center p-3.5 rounded-xl bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B63] dark:text-[#C4CFC3]">In Cabin Now</span>
                <div className="text-2xl font-black text-[#22291F] dark:text-[#FAF7F2] font-heading mt-0.5">
                  {activeDept.servingToken}
                </div>
                <span className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] font-medium">Consultation in progress</span>
              </div>

              {/* Your Token & Estimated Wait */}
              <div className="text-center p-3.5 rounded-xl bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C97B4A] dark:text-[#E58A54]">Next Token Available</span>
                <div className="text-2xl font-black text-[#2D6A4F] dark:text-[#52B788] font-heading mt-0.5">
                  {activeDept.nextToken}
                </div>
                <span className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3]">Est. Wait: <strong>{activeDept.estWait}</strong></span>
              </div>

              {/* 1-Click CTA */}
              <div>
                <button
                  onClick={() => {
                    const matchedDoc = doctors.find(d =>
                      d.name?.toLowerCase().includes(activeDept.doctor.split(',')[0].replace(/^dr\.\s*/i, '').trim().toLowerCase()) ||
                      d.specialization?.toLowerCase().includes(activeDept.name.toLowerCase().split('&')[0].trim())
                    ) || doctors[0] || null;
                    openBookingModal(matchedDoc);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#40916C] dark:border dark:border-[#52B788]/40 text-[#FAF7F2] font-semibold text-xs rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Reserve {activeDept.nextToken} Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-[#8E8E84] dark:text-[#94A493] mt-2">
                  {activeDept.slotsLeft} consultation slots left today
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4. Three Core Functional Portals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#22291F] dark:text-[#FAF7F2]">
            One Integrated Platform for Clinic Operations
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B63] dark:text-[#C4CFC3]">
            Designed for compassionate patient experience, smooth doctor workflows, and transparent clinic oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Patient Hub */}
          <div className="bg-[#F7F3EB] dark:bg-[#1C221C] rounded-3xl border border-[#E8DFD1] dark:border-[#2F3B2F] hover:border-[#D5C9B3] dark:hover:border-[#445644] p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(34,41,31,0.05)] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] text-[#FAF7F2] flex items-center justify-center shadow-sm">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-[#52B788]">
                  Patient Services
                </span>
                <h3 className="text-xl font-bold text-[#22291F] dark:text-[#FAF7F2] mt-1 font-heading">
                  Patient Hub
                </h3>
                <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-1.5 leading-relaxed">
                  Book sequential doctor consultations with live slot capacity checks, download digital token slips, and access past diagnoses.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-[#6B6B63] dark:text-[#C4CFC3] pt-2 border-t border-[#E8DFD1]/80 dark:border-[#2F3B2F]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                  <span>Sequential token allocation (TK-01, TK-02)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                  <span>Downloadable &amp; printable PDF token slips</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                  <span>Archived doctor notes &amp; digital prescriptions</span>
                </li>
              </ul>
            </div>
            <Link
              to="/patient"
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#40916C] dark:border dark:border-[#52B788]/40 text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <span>Access Patient Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Doctor Queue */}
          <div className="bg-[#EEF5F0] dark:bg-[#1C221C] rounded-3xl border border-[#D5E5D8] dark:border-[#2F3B2F] hover:border-[#BED6C3] dark:hover:border-[#445644] p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(45,106,79,0.06)] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] text-[#FAF7F2] flex items-center justify-center shadow-sm">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-[#52B788]">
                  Clinical Consultation
                </span>
                <h3 className="text-xl font-bold text-[#22291F] dark:text-[#FAF7F2] mt-1 font-heading">
                  Doctor Queue
                </h3>
                <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-1.5 leading-relaxed">
                  Real-time chronologically sorted queue of daily patients, quick consultation completion, and immediate clinical record archiving.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-[#6B6B63] dark:text-[#C4CFC3] pt-2 border-t border-[#D5E5D8]/80 dark:border-[#2F3B2F]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                  <span>Chronological live daily patient queue stream</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                  <span>Clinical notes, diagnosis &amp; Rx issuance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                  <span>Instant patient consultation history lookup</span>
                </li>
              </ul>
            </div>
            <Link
              to="/doctor"
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#40916C] dark:border dark:border-[#52B788]/40 text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <span>Access Doctor Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Operations Hub (Warm Terracotta Card) */}
          <div className="bg-[#FAF1E8] dark:bg-[#201D1A] rounded-3xl border border-[#ECD8C9] dark:border-[#E58A54]/30 hover:border-[#DFC1AC] dark:hover:border-[#E58A54]/60 p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(201,123,74,0.06)] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C97B4A] dark:bg-[#E58A54] text-[#FAF7F2] flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B35F2B] dark:text-[#E58A54]">
                  Clinic Operations
                </span>
                <h3 className="text-xl font-bold text-[#22291F] dark:text-[#FAF7F2] mt-1 font-heading">
                  Operations Hub
                </h3>
                <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-1.5 leading-relaxed">
                  Doctor scheduling and cabin allocations, master appointment ledger, UN SDG 3 health camp announcements, and encrypted cloud backups.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-[#6B6B63] dark:text-[#C4CFC3] pt-2 border-t border-[#ECD8C9]/80 dark:border-[#2F3B2F]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C97B4A] dark:text-[#E58A54] shrink-0" />
                  <span>Cabin suite &amp; consultation hours manager</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C97B4A] dark:text-[#E58A54] shrink-0" />
                  <span>Master queue ledger with CSV export</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C97B4A] dark:text-[#E58A54] shrink-0" />
                  <span>Community health drive &amp; camp publisher</span>
                </li>
              </ul>
            </div>
            <Link
              to="/admin"
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#40916C] dark:border dark:border-[#52B788]/40 text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <span>Access Admin Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. Featured Specialists Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/12 text-[#2D6A4F] dark:bg-[#2D6A4F]/20 dark:text-[#52B788] text-xs font-bold border border-[#2D6A4F]/25 mb-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Compassionate Care Providers</span>
            </div>
            <h2 className="text-2xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
              Our Community Medical Specialists
            </h2>
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
              Experienced physicians dedicated to community primary health and wellness
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] hover:underline self-start sm:self-center"
          >
            <span>Reserve Token With a Doctor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {displayDoctors.map((doc) => (
            <div
              key={doc.id || doc.name}
              className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3.5">
                  <img
                    src={doc.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100"}
                    alt={doc.name}
                    className="w-13 h-13 rounded-2xl object-cover border border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#FAF7F2] dark:bg-[#151915]"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-[#22291F] dark:text-[#FAF7F2] font-heading">{doc.name}</h3>
                    <p className="text-xs font-medium text-[#2D6A4F] dark:text-[#52B788]">{doc.specialization}</p>
                    <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3] mt-0.5">{doc.cabin || 'Cabin 101'}</p>
                  </div>
                </div>

                <div className="py-2.5 border-y border-[#E6DFC6] dark:border-[#2F3B2F] space-y-1.5 my-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Experience:</span>
                    <span className="font-medium text-[#22291F] dark:text-[#FAF7F2]">{doc.experience || '10+ yrs'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Consultation:</span>
                    <span className="font-bold text-[#2D6A4F] dark:text-[#52B788]">Free (Community Care)</span>
                  </div>
                </div>

                {/* Available Days */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {(doc.availableDays || doc.days || ["Mon", "Tue", "Wed", "Thu", "Fri"]).slice(0, 4).map(day => (
                    <span key={day} className="px-2 py-0.5 bg-[#FAF7F2] dark:bg-[#151915] text-[#6B6B63] dark:text-[#C4CFC3] border border-[#E6DFC6] dark:border-[#2F3B2F] rounded-md text-[10px] font-medium">
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => openBookingModal(doc)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#FAF7F2] hover:bg-[#E6DFC6]/60 dark:bg-[#151915] dark:hover:bg-[#2D6A4F]/20 text-[#22291F] dark:text-[#FAF7F2] text-xs font-bold rounded-xl border border-[#D8CEB3] dark:border-[#2F3B2F] transition-colors cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                <span>Book Token with Specialist</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Community Voices & Social Proof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E58A54] dark:border-[#E58A54]/40 dark:bg-[#E58A54]/15 text-xs font-bold border border-[#C97B4A]/30">
            <Quote className="w-3.5 h-3.5 text-[#C97B4A] dark:text-[#E58A54]" />
            <span>Community Stories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#22291F] dark:text-[#FAF7F2]">
            Real Impact for Everyday Families
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B63] dark:text-[#C4CFC3]">
            How zero-cost digital tokens and community drives transform local primary healthcare access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="p-6 rounded-2xl bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm flex flex-col justify-between">
            <p className="text-xs text-[#22291F] dark:text-[#FAF7F2] italic leading-relaxed">
              "Previously, bringing my 3-year-old for fever checks meant sitting in a packed corridor for 2 hours. With Apna's digital token, we walked in exactly 5 minutes before our slot."
            </p>
            <div className="flex items-center gap-3 pt-4 mt-4 border-t border-[#E6DFC6] dark:border-[#2F3B2F]">
              <div className="w-9 h-9 rounded-full bg-[#2D6A4F] text-[#FAF7F2] font-bold text-xs flex items-center justify-center">
                AS
              </div>
              <div>
                <p className="text-xs font-bold text-[#22291F] dark:text-[#FAF7F2]">Ananya Sharma</p>
                <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3]">Mother of two • East Block</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm flex flex-col justify-between">
            <p className="text-xs text-[#22291F] dark:text-[#FAF7F2] italic leading-relaxed">
              "The free Sunday health screening camp identified my father's hypertension early. Having doctors explain medications clearly without rushed visits saved our family immense distress."
            </p>
            <div className="flex items-center gap-3 pt-4 mt-4 border-t border-[#E6DFC6] dark:border-[#2F3B2F]">
              <div className="w-9 h-9 rounded-full bg-[#C97B4A] dark:bg-[#E58A54] text-[#FAF7F2] font-bold text-xs flex items-center justify-center">
                RK
              </div>
              <div>
                <p className="text-xs font-bold text-[#22291F] dark:text-[#FAF7F2]">Rajesh Kumar</p>
                <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3]">Community Member • Sector 4</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm flex flex-col justify-between">
            <p className="text-xs text-[#22291F] dark:text-[#FAF7F2] italic leading-relaxed">
              "As a consulting doctor, the digital queue brings order and calmness to my cabin. Patient history and prescriptions are right on screen so I can focus 100% on the patient."
            </p>
            <div className="flex items-center gap-3 pt-4 mt-4 border-t border-[#E6DFC6] dark:border-[#2F3B2F]">
              <div className="w-9 h-9 rounded-full bg-[#2D6A4F] text-[#FAF7F2] font-bold text-xs flex items-center justify-center">
                SJ
              </div>
              <div>
                <p className="text-xs font-bold text-[#22291F] dark:text-[#FAF7F2]">Dr. Sarah Jenkins</p>
                <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3]">Senior Consulting Physician</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. SDG 3 Impact Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#F0EBE1] dark:bg-[#1C221C] border border-[#E4DCCE] dark:border-[#2F3B2F] p-8 sm:p-10 shadow-sm transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E58A54] dark:border-[#E58A54]/40 dark:bg-[#E58A54]/15 text-xs font-semibold border border-[#C97B4A]/30">
                <Award className="w-4 h-4 text-[#C97B4A] dark:text-[#E58A54]" />
                <span>UN Sustainable Development Goals • Target 3.8</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#22291F] dark:text-[#FAF7F2] tracking-tight">
                Bridging Essential Healthcare Access in Community Clinics
              </h2>
              <p className="text-sm text-[#6B6B63] dark:text-[#C4CFC3] leading-relaxed font-sans">
                Target 3.8 of the United Nations SDGs calls for universal health coverage, financial risk protection, access to quality essential health services, and affordable essential medicines. Apna Clinic directly supports this mission through zero-barrier digital queue scheduling, compassionate local care, and regular community diagnostic drives.
              </p>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#151915] border border-[#E4DCCE] dark:border-[#2F3B2F] text-center shadow-xs">
                <span className="block text-2xl font-black text-[#2D6A4F] dark:text-[#52B788] font-heading">100%</span>
                <span className="text-[11px] font-medium text-[#6B6B63] dark:text-[#C4CFC3] mt-1 block">Free Queue Access</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#151915] border border-[#E4DCCE] dark:border-[#2F3B2F] text-center shadow-xs">
                <span className="block text-2xl font-black text-[#C97B4A] dark:text-[#E58A54] font-heading">SDG 3</span>
                <span className="text-[11px] font-medium text-[#6B6B63] dark:text-[#C4CFC3] mt-1 block">Good Health Focus</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#151915] border border-[#E4DCCE] dark:border-[#2F3B2F] text-center shadow-xs">
                <span className="block text-2xl font-black text-[#2D6A4F] dark:text-[#52B788] font-heading">0 sec</span>
                <span className="text-[11px] font-medium text-[#6B6B63] dark:text-[#C4CFC3] mt-1 block">Token Wait Delay</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#151915] border border-[#E4DCCE] dark:border-[#2F3B2F] text-center shadow-xs">
                <span className="block text-2xl font-black text-[#22291F] dark:text-[#FAF7F2] font-heading">Cloud</span>
                <span className="text-[11px] font-medium text-[#6B6B63] dark:text-[#C4CFC3] mt-1 block">Real-Time Sync</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Direct Booking Modal */}
      {bookingModalOpen && (
        <BookAppointmentModal
          initialDoctor={selectedDoctorForBooking}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={(booked) => {
            setBookingModalOpen(false);
            setSlipAppointment(booked);
          }}
        />
      )}

      {/* Printable / Downloadable Token Slip Modal */}
      {slipAppointment && (
        <TokenSlipModal
          appointment={slipAppointment}
          onClose={() => setSlipAppointment(null)}
        />
      )}

    </div>
  );
}
