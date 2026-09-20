import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HeartHandshake,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
  Stethoscope,
  ArrowLeft,
  Bell,
  Sparkles,
  Sun,
  Moon,
  QrCode
} from 'lucide-react';
import MobileQrModal from '../../components/common/MobileQrModal';

export default function LiveQueueDisplay() {
  const { doctors, appointments, announcements } = useData();
  const { isDark, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [showQrModal, setShowQrModal] = useState(false);

  // AudioContext instance reference & unlock state
  const audioCtxRef = useRef(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Safely get or initialize AudioContext
  const getAudioContext = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  // Resume / Unlock AudioContext upon user gesture
  const unlockAudio = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          setAudioUnlocked(true);
        }).catch(() => {
          setAudioUnlocked(true);
        });
      } else {
        setAudioUnlocked(true);
      }
    } catch {
      setAudioUnlocked(true);
    }
  }, [getAudioContext]);

  // Global one-time listener: tapping anywhere on unattended kiosk resumes audio
  useEffect(() => {
    const handleGesture = () => {
      unlockAudio();
    };
    window.addEventListener('click', handleGesture, { once: true });
    window.addEventListener('touchstart', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, [unlockAudio]);

  // Clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API Chime generator (only plays when unlocked to avoid browser autoplay warnings)
  const playCallChime = useCallback(() => {
    if (!soundEnabled || !audioUnlocked) return;
    try {
      const ctx = getAudioContext();
      if (!ctx || ctx.state !== 'running') return;

      // Note 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      // Note 2: E5 (659.25 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.25);
      gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 1.1);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }, [soundEnabled, audioUnlocked, getAudioContext]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
      setIsFullscreen(false);
    }
  };

  const todayStr = currentTime.toISOString().split('T')[0];

  // Active appointments for today
  const todayAppointments = useMemo(() => {
    return appointments.filter(a => a.date === todayStr);
  }, [appointments, todayStr]);

  // Pending queue
  const pendingAppointments = useMemo(() => {
    return todayAppointments.filter(a => a.status === 'pending');
  }, [todayAppointments]);

  // Lead calling appointment (highest priority or currently consulting)
  const currentCalling = useMemo(() => {
    if (selectedDoctorId !== 'all') {
      return pendingAppointments.find(a => a.doctorId === selectedDoctorId) || null;
    }
    return pendingAppointments[0] || null;
  }, [pendingAppointments, selectedDoctorId]);

  // Trigger chime when the lead calling token changes
  useEffect(() => {
    if (audioUnlocked && currentCalling?.tokenNumber) {
      playCallChime();
    }
  }, [currentCalling?.tokenNumber, playCallChime, audioUnlocked]);

  // Group queue by doctor
  const doctorQueues = useMemo(() => {
    return doctors.map(doc => {
      const docApts = pendingAppointments.filter(a => a.doctorId === doc.id);
      const active = docApts[0] || null;
      const upcoming = docApts.slice(1, 4);
      return {
        doctor: doc,
        active,
        upcoming,
        totalInQueue: docApts.length
      };
    });
  }, [doctors, pendingAppointments]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#22291F] dark:bg-[#141714] dark:text-[#F5F1EA] flex flex-col justify-between selection:bg-[#2D6A4F] selection:text-[#FAF7F2] font-sans overflow-x-hidden transition-colors duration-200">

      {/* Top Header Bar */}
      <header className="border-b border-[#E6DFC6] dark:border-[#242C23] bg-white/95 dark:bg-[#1A1E1A]/95 px-3 sm:px-6 py-3 sm:py-4 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">

          {/* Logo & Clinic Branding + Exit on mobile */}
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#2D6A4F] text-[#FAF7F2] flex items-center justify-center shadow-md shrink-0">
                <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-base sm:text-xl font-black font-heading tracking-tight text-[#22291F] dark:text-[#F5F1EA] truncate">
                    Arogya Community Clinic
                  </h1>
                  <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#6B6B63] dark:text-[#9EAA9A] font-medium tracking-wide uppercase truncate">
                  OPD Waiting Hall • Real-Time Token Call Board
                </p>
              </div>
            </Link>

            {/* Exit TV Mode Link - on mobile right side of logo */}
            <Link
              to="/"
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 bg-[#2D6A4F] hover:bg-[#23543E] text-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors shadow-xs shrink-0"
              title="Exit TV Display Mode"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit</span>
            </Link>
          </div>

          {/* Clock & Controls */}
          <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3">
            {/* Live Clock Display */}
            <div className="flex items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-[#F0EBE1] dark:bg-[#222722] border border-[#E4DCCE] dark:border-[#2D352C] rounded-xl sm:rounded-2xl shadow-2xs">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-black font-mono tracking-wider text-[#22291F] dark:text-[#F5F1EA] leading-tight">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="text-[9px] sm:text-[10px] text-[#6B6B63] dark:text-[#9EAA9A] font-medium leading-tight">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Mobile QR Scan Button */}
              <button
                onClick={() => setShowQrModal(true)}
                className="p-2 sm:px-3 sm:py-2 bg-white dark:bg-[#222722] hover:bg-[#2D6A4F]/10 dark:hover:bg-[#2D6A4F]/20 border border-[#E6DFC6] dark:border-[#2D352C] hover:border-[#2D6A4F]/40 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Scan QR Code to open on mobile"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile QR</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 rounded-xl border border-[#E6DFC6] dark:border-[#2D352C] bg-white dark:bg-[#222722] hover:bg-[#FAF7F2] dark:hover:bg-[#2D6A4F]/20 text-[#6B6B63] dark:text-[#9EAA9A] hover:text-[#22291F] dark:hover:text-[#F5F1EA] transition-all cursor-pointer shadow-xs"
                title={isDark ? "Switch to Warm Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle visual theme"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C97B4A]" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2D6A4F]" />}
              </button>

              {/* Sound Toggle Button */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer shadow-xs ${soundEnabled
                  ? 'bg-[#2D6A4F]/15 dark:bg-[#2D6A4F]/20 border-[#2D6A4F]/40 text-[#2D6A4F] dark:text-[#52B788]'
                  : 'bg-white dark:bg-[#222722] border-[#E6DFC6] dark:border-[#2D352C] text-[#8E8E84] dark:text-[#71806F]'
                  }`}
                title={soundEnabled ? "Chime Sound Enabled (Click to Mute)" : "Muted (Click to Enable Chime)"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>

              {/* Audio Chime Test Button */}
              <button
                onClick={() => {
                  unlockAudio();
                  playCallChime();
                }}
                className="p-2 sm:px-3 sm:py-2 bg-white dark:bg-[#222722] hover:bg-[#2D6A4F]/10 dark:hover:bg-[#2D6A4F]/20 border border-[#E6DFC6] dark:border-[#2D352C] hover:border-[#2D6A4F]/40 text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] hover:text-[#22291F] dark:hover:text-[#F5F1EA] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Test Waiting Hall Audio Chime"
              >
                <Bell className="w-3.5 h-3.5 text-[#C97B4A]" />
                <span className="hidden sm:inline">Chime</span>
              </button>

              {/* Fullscreen Mode Button */}
              <button
                onClick={toggleFullscreen}
                className="hidden sm:inline-flex p-2.5 bg-white dark:bg-[#222722] hover:bg-[#2D6A4F]/10 dark:hover:bg-[#2D6A4F]/20 border border-[#E6DFC6] dark:border-[#2D352C] hover:border-[#2D6A4F]/40 rounded-xl text-[#6B6B63] dark:text-[#9EAA9A] hover:text-[#22291F] dark:hover:text-[#F5F1EA] transition-colors cursor-pointer shadow-xs"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Exit TV Mode Link (Desktop) */}
              <Link
                to="/"
                className="hidden md:flex items-center gap-1 px-3.5 py-2 bg-[#2D6A4F] hover:bg-[#23543E] text-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors shadow-xs"
                title="Exit TV Display Mode"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit</span>
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* Main Display Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 relative">

        {/* Non-blocking One-Time Audio Unlock Banner for Unattended TV / Kiosk Display */}
        {!audioUnlocked && (
          <div 
            onClick={unlockAudio}
            className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-[#2D6A4F]/95 dark:bg-[#1E251E]/95 text-[#FAF7F2] border border-[#52B788]/40 shadow-2xl backdrop-blur-md cursor-pointer animate-bounce select-none transition-all max-w-[92vw]"
            title="Click or tap anywhere to enable sound alerts"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold font-heading">Tap anywhere to enable sound</p>
              <p className="text-[10px] sm:text-[11px] text-[#A3C9B8] truncate">Browser requires a user interaction to allow OPD audio chime</p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-lg bg-white/25 text-white text-[10px] font-bold uppercase tracking-wider">
              Enable
            </span>
          </div>
        )}

        {/* Doctor Cabin Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[#6B6B63] dark:text-[#9EAA9A] font-semibold text-[11px] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
            Filter Cabin:
          </span>
          <button
            onClick={() => setSelectedDoctorId('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
              selectedDoctorId === 'all'
                ? 'bg-[#2D6A4F] text-[#FAF7F2] shadow-xs'
                : 'bg-white dark:bg-[#1E231E] border border-[#E6DFC6] dark:border-[#2D352C] text-[#6B6B63] dark:text-[#9EAA9A] hover:text-[#22291F] dark:hover:text-[#F5F1EA]'
            }`}
          >
            All Cabins
          </button>
          {doctors.map(doc => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoctorId(doc.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer shrink-0 ${
                selectedDoctorId === doc.id
                  ? 'bg-[#2D6A4F] text-[#FAF7F2] shadow-xs'
                  : 'bg-white dark:bg-[#1E231E] border border-[#E6DFC6] dark:border-[#2D352C] text-[#6B6B63] dark:text-[#9EAA9A] hover:text-[#22291F] dark:hover:text-[#F5F1EA]'
              }`}
            >
              {doc.name} • {doc.cabin || 'Cabin'}
            </button>
          ))}
        </div>

        {/* NOW CALLING HERO BOARD */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FAF5EC] via-[#F4ECE0] to-[#ECE3D2] dark:from-[#1E251E] dark:via-[#222A22] dark:to-[#181E18] border-2 border-[#2D6A4F]/40 shadow-xl dark:shadow-2xl p-4 sm:p-6 lg:p-8 transition-colors">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">

            {/* Left Col: Giant Token Callout */}
            <div className="lg:col-span-5 text-center lg:text-left space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-[#2D6A4F]/15 dark:bg-[#2D6A4F]/20 border border-[#2D6A4F]/30 dark:border-[#2D6A4F]/40 text-[#2D6A4F] dark:text-[#52B788] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Now Calling / Proceed to Cabin</span>
              </div>

              {currentCalling ? (
                <div>
                  <div className="text-5xl sm:text-7xl lg:text-8xl font-black text-[#2D6A4F] dark:text-[#52B788] font-heading tracking-tight animate-pulse">
                    {currentCalling.tokenNumber}
                  </div>
                  <p className="text-base sm:text-lg font-bold text-[#22291F] dark:text-[#F5F1EA] mt-0.5 sm:mt-1 font-heading">
                    Patient: {currentCalling.patientName}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-[#8E8E84] dark:text-[#71806F] font-heading">
                    All Clear
                  </div>
                  <p className="text-xs sm:text-sm text-[#6B6B63] dark:text-[#9EAA9A] mt-1">
                    No patients currently waiting in queue.
                  </p>
                </div>
              )}
            </div>

            {/* Middle Col: Assigned Doctor & Cabin Indicator */}
            {currentCalling ? (
              <div className="lg:col-span-7 bg-white/90 dark:bg-[#161A16]/80 rounded-xl sm:rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] p-3.5 sm:p-6 space-y-2.5 sm:space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-3 pb-2.5 sm:pb-3 border-b border-[#E6DFC6] dark:border-[#2D352C]">
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C97B4A] block">Assigned Specialist</span>
                    <h3 className="text-base sm:text-xl font-black text-[#22291F] dark:text-[#F5F1EA] font-heading mt-0.5 truncate">
                      {currentCalling.doctorName}
                    </h3>
                    <p className="text-xs text-[#2D6A4F] dark:text-[#52B788] font-semibold truncate">{currentCalling.specialization}</p>
                  </div>

                  <div className="px-3.5 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#2D6A4F] text-[#FAF7F2] text-center shrink-0 shadow-md">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#A3C9B8] block">Please Report To</span>
                    <span className="text-sm sm:text-xl font-black font-heading">
                      {doctors.find(d => d.id === currentCalling.doctorId)?.cabin || 'Cabin 101'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs pt-0.5 sm:pt-1 text-[#6B6B63] dark:text-[#9EAA9A]">
                  <div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#8E8E84] dark:text-[#71806F] block">Scheduled Slot</span>
                    <span className="font-semibold text-[#22291F] dark:text-[#F5F1EA] text-xs">{currentCalling.time}</span>
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#8E8E84] dark:text-[#71806F] block">Consultation Reason</span>
                    <span className="font-medium text-[#22291F] dark:text-[#F5F1EA] text-xs truncate block">{currentCalling.reason || 'Routine Consultation'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-7 text-center p-6 sm:p-8 bg-white/70 dark:bg-[#161A16]/50 rounded-xl sm:rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] text-xs text-[#6B6B63] dark:text-[#9EAA9A]">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D6A4F] dark:text-[#52B788] mx-auto mb-2" />
                <span>New consultations booked from reception or mobile devices will appear on this screen automatically.</span>
              </div>
            )}

          </div>
        </div>

        {/* CABIN ROSTER & QUEUE STATUS GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#22291F] dark:text-[#F5F1EA] flex items-center gap-2 font-heading">
              <Stethoscope className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
              <span>Specialist Cabins &amp; Upcoming Queue ({pendingAppointments.length} Waiting)</span>
            </h2>
            <span className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] font-mono">
              Auto-sync active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {doctorQueues.map(({ doctor, active, upcoming, totalInQueue }) => (
              <div
                key={doctor.id}
                className="bg-white dark:bg-[#1C211C] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] p-4 sm:p-5 shadow-sm space-y-2.5 sm:space-y-3 flex flex-col justify-between transition-colors"
              >
                <div>
                  {/* Doctor Info */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E6DFC6] dark:border-[#2D352C]">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-[#C97B4A] uppercase tracking-wider block truncate">
                        {doctor.cabin || 'Cabin 101'}
                      </span>
                      <h3 className="font-bold text-sm text-[#22291F] dark:text-[#F5F1EA] font-heading truncate">{doctor.name}</h3>
                      <p className="text-[11px] text-[#2D6A4F] dark:text-[#52B788] truncate">{doctor.specialization.split('(')[0]}</p>
                    </div>
                    <span className="w-8 h-8 rounded-xl bg-[#FAF7F2] dark:bg-[#222722] border border-[#E6DFC6] dark:border-[#2D352C] text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center font-bold text-xs shrink-0">
                      {totalInQueue}
                    </span>
                  </div>

                  {/* Active In Cabin */}
                  <div className="my-2.5 sm:my-3 p-2.5 sm:p-3 bg-[#FAF7F2] dark:bg-[#161916] rounded-xl border border-[#E6DFC6] dark:border-[#2D352C] text-center">
                    <span className="text-[10px] font-bold text-[#8E8E84] dark:text-[#71806F] uppercase tracking-wider block">In Cabin</span>
                    {active ? (
                      <div className="text-xl sm:text-2xl font-black text-[#2D6A4F] dark:text-[#52B788] font-heading my-0.5">
                        {active.tokenNumber}
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm font-bold text-[#8E8E84] dark:text-[#71806F] my-0.5 sm:my-1">
                        Ready
                      </div>
                    )}
                    <span className="text-[10px] text-[#6B6B63] dark:text-[#9EAA9A] truncate block">
                      {active ? active.patientName : 'Awaiting next patient'}
                    </span>
                  </div>

                  {/* Next in Line Tokens */}
                  <div>
                    <span className="text-[10px] font-bold text-[#8E8E84] dark:text-[#71806F] uppercase tracking-wider block mb-1">
                      Next in Line
                    </span>
                    {upcoming.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {upcoming.map((u) => (
                          <span
                            key={u.id}
                            className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#F0EBE1] dark:bg-[#222722] text-[#22291F] dark:text-[#F5F1EA] text-xs font-bold rounded-lg border border-[#E6DFC6] dark:border-[#2D352C]"
                          >
                            {u.tokenNumber}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#8E8E84] dark:text-[#71806F] italic">Queue clear</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E6DFC6] dark:border-[#2D352C] text-[10px] text-[#8E8E84] dark:text-[#71806F] flex justify-between items-center">
                  <span>Slots: {doctor.availableSlots?.length || 4}/day</span>
                  <span className="text-emerald-600 dark:text-emerald-500 font-semibold">● Consulting</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Bottom Health Camp & Awareness Marquee Ticker */}
      <footer className="border-t border-[#E6DFC6] dark:border-[#242C23] bg-white dark:bg-[#161916] py-2.5 sm:py-3 px-3.5 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-xs text-[#6B6B63] dark:text-[#9EAA9A]">

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full bg-[#C97B4A]/15 dark:bg-[#C97B4A]/20 text-[#B35F2B] dark:text-[#C97B4A] border border-[#C97B4A]/30 text-[10px] font-bold uppercase tracking-wider">
              Free SDG 3 Drives
            </span>
          </div>

          <div className="flex-1 overflow-hidden min-w-0 text-center sm:text-left">
            <p className="truncate text-xs font-medium text-[#22291F] dark:text-[#F5F1EA]">
              {announcements.length > 0
                ? announcements.map(a => `${a.title} (${a.date} at ${a.location})`).join('  •  ')
                : 'Free maternal screening, child vaccinations, and chronic disease diagnostic camps active this week.'
              }
            </p>
          </div>

          <div className="shrink-0 text-[11px] text-[#8E8E84] dark:text-[#71806F]">
            Emergency: <strong className="text-rose-600 dark:text-rose-400">108</strong> • Reception: <strong className="text-[#22291F] dark:text-[#F5F1EA]">+91 (011) 2345-6789</strong>
          </div>

        </div>
      </footer>

      {/* Viewport-Centered Mobile QR Modal */}
      <MobileQrModal 
        isOpen={showQrModal} 
        onClose={() => setShowQrModal(false)} 
      />

    </div>
  );
}
