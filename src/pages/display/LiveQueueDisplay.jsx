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
  QrCode,
  Eye,
  EyeOff
} from 'lucide-react';
import MobileQrModal from '../../components/common/MobileQrModal';
import HealthcareBackground from '../../components/common/HealthcareBackground';

export default function LiveQueueDisplay() {
  const { doctors, appointments, announcements } = useData();
  const { isDark, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [privacyMasked, setPrivacyMasked] = useState(false);
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
  const unlockAudio = useCallback(async () => {
    try {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
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

  // Web Audio API Chime generator with multi-harmonic hospital bell acoustics
  const playCallChime = useCallback(async () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      
      // Auto-resume audio context if suspended (unlocks browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      setAudioUnlocked(true);

      const now = ctx.currentTime;

      // Master output volume gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.85, now);
      masterGain.connect(ctx.destination);

      // --- NOTE 1: Higher Bright Bell (E5: 659.25 Hz) ---
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.7, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Note 1 Shimmer Overtone (G5: 783.99 Hz)
      const osc1b = ctx.createOscillator();
      const gain1b = ctx.createGain();
      osc1b.type = 'sine';
      osc1b.frequency.setValueAtTime(783.99, now);
      gain1b.gain.setValueAtTime(0, now);
      gain1b.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain1b.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc1b.connect(gain1b);
      gain1b.connect(masterGain);
      osc1b.start(now);
      osc1b.stop(now + 0.65);

      // --- NOTE 2: Lower Resonant Ding-Dong Resolution (C5: 523.25 Hz) ---
      const note2Start = now + 0.22;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(523.25, note2Start);
      gain2.gain.setValueAtTime(0, note2Start);
      gain2.gain.linearRampToValueAtTime(0.8, note2Start + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.0001, note2Start + 1.3);
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(note2Start);
      osc2.stop(note2Start + 1.35);

      // Note 2 Octave Bell Overtone (C6: 1046.5 Hz)
      const osc2b = ctx.createOscillator();
      const gain2b = ctx.createGain();
      osc2b.type = 'sine';
      osc2b.frequency.setValueAtTime(1046.5, note2Start);
      gain2b.gain.setValueAtTime(0, note2Start);
      gain2b.gain.linearRampToValueAtTime(0.3, note2Start + 0.02);
      gain2b.gain.exponentialRampToValueAtTime(0.0001, note2Start + 0.9);
      osc2b.connect(gain2b);
      gain2b.connect(masterGain);
      osc2b.start(note2Start);
      osc2b.stop(note2Start + 0.95);

    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }, [soundEnabled]);

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

  // Track token changes for brief pulse/glow alert animation
  const [isNewTokenAlert, setIsNewTokenAlert] = useState(false);
  const prevTokenRef = useRef(null);

  // Track token changes for attention pulse and audio chime
  useEffect(() => {
    const token = currentCalling?.tokenNumber;
    if (token) {
      if (prevTokenRef.current && prevTokenRef.current !== token) {
        setIsNewTokenAlert(true);
        playCallChime();
        const timer = setTimeout(() => {
          setIsNewTokenAlert(false);
        }, 5000); // 5-second attention-grabbing pulse & glow
        return () => clearTimeout(timer);
      }
      prevTokenRef.current = token;
    }
  }, [currentCalling?.tokenNumber, playCallChime]);

  // Privacy Masking Formatter
  const formatPatientDisplayName = (name) => {
    if (!name) return 'Community Patient';
    if (!privacyMasked) return name;
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].length > 2 ? `${parts[0].slice(0, 2)}***` : `${parts[0]}*`;
    }
    return `${parts[0]} ${parts[parts.length - 1][0]}.***`;
  };

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
    <div className="min-h-screen bg-[#F4F7F6] text-[#132226] dark:bg-[#0B1114] dark:text-[#F4F7F6] flex flex-col justify-between selection:bg-[#0F766E] selection:text-[#F4F7F6] font-sans overflow-x-hidden transition-colors duration-200 relative">
      <HealthcareBackground />

      {/* Top Header Bar */}
      <header className="border-b border-[#E0E7E5] dark:border-[#21333A] bg-white/95 dark:bg-[#121C21]/95 px-3 sm:px-6 py-3 sm:py-4 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">

          {/* Logo & Clinic Branding + Exit on mobile */}
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#0F766E] dark:bg-[#0D9488] text-[#F4F7F6] flex items-center justify-center shadow-md shrink-0">
                <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-base sm:text-xl font-black font-heading tracking-tight text-[#132226] dark:text-[#F4F7F6] truncate">
                    Arogya Community Clinic
                  </h1>
                  <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#5A7178] dark:text-[#9DB4BA] font-medium tracking-wide uppercase truncate">
                  OPD Waiting Hall • Real-Time Token Call Board
                </p>
              </div>
            </Link>

            {/* Exit TV Mode Link - on mobile right side of logo */}
            <Link
              to="/"
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-semibold rounded-xl transition-colors shadow-xs shrink-0"
              title="Exit TV Display Mode"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit</span>
            </Link>
          </div>

          {/* Clock & Controls */}
          <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3">
            {/* Live Clock Display */}
            <div className="flex items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-[#E8F0EE] dark:bg-[#19272D] border border-[#DCE5E2] dark:border-[#21333A] rounded-xl sm:rounded-2xl shadow-2xs">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-black font-mono tracking-wider text-[#132226] dark:text-[#F4F7F6] leading-tight">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="text-[9px] sm:text-[10px] text-[#5A7178] dark:text-[#9DB4BA] font-medium leading-tight">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Mobile QR Scan Button */}
              <button
                onClick={() => setShowQrModal(true)}
                className="p-2 sm:px-3 sm:py-2 bg-white dark:bg-[#19272D] hover:bg-[#0F766E]/10 dark:hover:bg-[#0D9488]/20 border border-[#E0E7E5] dark:border-[#2C444E] hover:border-[#0F766E]/40 dark:hover:border-[#2DD4BF]/40 text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Scan QR Code to open on mobile"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile QR</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 rounded-xl border border-[#E0E7E5] dark:border-[#2C444E] bg-white dark:bg-[#19272D] hover:bg-[#F4F7F6] dark:hover:bg-[#0D9488]/20 text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6] transition-all cursor-pointer shadow-xs"
                title={isDark ? "Switch to Warm Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle visual theme"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FB923C]" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F766E]" />}
              </button>

              {/* Sound Toggle Button */}
              <button
                onClick={() => {
                  const nextState = !soundEnabled;
                  setSoundEnabled(nextState);
                  if (nextState) {
                    playCallChime();
                  }
                }}
                className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer shadow-xs ${soundEnabled
                  ? 'bg-[#0F766E]/15 dark:bg-[#0D9488]/25 border-[#0F766E]/40 dark:border-[#2DD4BF]/40 text-[#0F766E] dark:text-[#2DD4BF]'
                  : 'bg-white dark:bg-[#19272D] border-[#E0E7E5] dark:border-[#2C444E] text-[#758D94] dark:text-[#79949B]'
                  }`}
                title={soundEnabled ? "Chime Sound Enabled (Click to Mute)" : "Muted (Click to Enable Chime)"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>

              {/* Patient Privacy Masking Toggle Button */}
              <button
                onClick={() => setPrivacyMasked(!privacyMasked)}
                className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 ${
                  privacyMasked
                    ? 'bg-[#0F766E]/15 dark:bg-[#0D9488]/25 border-[#0F766E]/40 dark:border-[#2DD4BF]/40 text-[#0F766E] dark:text-[#2DD4BF]'
                    : 'bg-white dark:bg-[#19272D] border-[#E0E7E5] dark:border-[#2C444E] text-[#758D94] dark:text-[#79949B]'
                }`}
                title={privacyMasked ? "Privacy Mask Enabled (Patient names partially hidden)" : "Privacy Mask Disabled (Showing full names)"}
              >
                {privacyMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span className="hidden lg:inline">Privacy</span>
              </button>

              {/* Audio Chime Test Button */}
              <button
                onClick={() => {
                  playCallChime();
                  setIsNewTokenAlert(true);
                  setTimeout(() => setIsNewTokenAlert(false), 5000);
                }}
                className="p-2 sm:px-3 sm:py-2 bg-white dark:bg-[#19272D] hover:bg-[#0F766E]/10 dark:hover:bg-[#0D9488]/20 border border-[#E0E7E5] dark:border-[#2C444E] hover:border-[#0F766E]/40 dark:hover:border-[#2DD4BF]/40 text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Test Waiting Hall Audio Chime"
              >
                <Bell className="w-3.5 h-3.5 text-[#F97316] dark:text-[#FB923C]" />
                <span className="hidden sm:inline">Chime</span>
              </button>

              {/* Fullscreen Mode Button */}
              <button
                onClick={toggleFullscreen}
                className="hidden sm:inline-flex p-2.5 bg-white dark:bg-[#19272D] hover:bg-[#0F766E]/10 dark:hover:bg-[#0D9488]/20 border border-[#E0E7E5] dark:border-[#2C444E] hover:border-[#0F766E]/40 dark:hover:border-[#2DD4BF]/40 rounded-xl text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6] transition-colors cursor-pointer shadow-xs"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Exit TV Mode Link (Desktop) */}
              <Link
                to="/"
                className="hidden md:flex items-center gap-1 px-3.5 py-2 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-semibold rounded-xl transition-colors shadow-xs"
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
            onClick={() => {
              playCallChime();
            }}
            className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-[#0F766E]/95 dark:bg-[#121C21]/95 text-[#F4F7F6] border border-[#2DD4BF]/40 shadow-2xl backdrop-blur-md cursor-pointer animate-bounce select-none transition-all max-w-[92vw]"
            title="Click or tap anywhere to enable sound alerts"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold font-heading">Tap anywhere to enable sound</p>
              <p className="text-[10px] sm:text-[11px] text-[#A3C9B8] dark:text-[#9DB4BA] truncate">Browser requires a user interaction to allow OPD audio chime</p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-lg bg-white/25 text-white text-[10px] font-bold uppercase tracking-wider">
              Enable
            </span>
          </div>
        )}

        {/* Doctor Cabin Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[#5A7178] dark:text-[#9DB4BA] font-semibold text-[11px] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
            Filter Cabin:
          </span>
          <button
            onClick={() => setSelectedDoctorId('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
              selectedDoctorId === 'all'
                ? 'bg-[#0F766E] dark:bg-[#0D9488] text-[#F4F7F6] shadow-xs'
                : 'bg-white dark:bg-[#19272D] border border-[#E0E7E5] dark:border-[#2C444E] text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
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
                  ? 'bg-[#0F766E] dark:bg-[#0D9488] text-[#F4F7F6] shadow-xs'
                  : 'bg-white dark:bg-[#19272D] border border-[#E0E7E5] dark:border-[#2C444E] text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
              }`}
            >
              {doc.name} • {doc.cabin || 'Cabin'}
            </button>
          ))}
        </div>

        {/* NOW CALLING HERO BOARD - Solid Deep Green High-Contrast Wall TV Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#134E4A] dark:bg-[#14261B] border-2 sm:border-4 border-[#0F766E] dark:border-[#0D9488] shadow-2xl p-5 sm:p-7 lg:p-9 text-[#F4F7F6] transition-all duration-300">
          
          {/* Subtle background ambient lighting effect for TV vibrancy */}
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-[#14B8A6]/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

            {/* Left Col: Giant Token Callout for Real-World Wall Display Readability */}
            <div className="lg:col-span-5 text-center lg:text-left space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-emerald-200 text-xs sm:text-sm font-black uppercase tracking-wider backdrop-blur-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Now Calling • Proceed to Cabin</span>
                {isNewTokenAlert && (
                  <span className="ml-1 px-2 py-0.5 rounded-md bg-[#FB923C] text-[#0B1114] text-[10px] font-black animate-pulse shadow-xs">
                    NEW CALL
                  </span>
                )}
              </div>

              {currentCalling ? (
                <div className="space-y-1">
                  <div 
                    className={`text-6xl sm:text-8xl md:text-9xl lg:text-[105px] xl:text-[125px] font-black text-white font-heading tracking-tight leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-all duration-300 ${
                      isNewTokenAlert ? 'animate-token-call-glow text-emerald-300' : ''
                    }`}
                  >
                    {currentCalling.tokenNumber}
                  </div>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#D8F3DC] font-heading tracking-tight">
                    Patient: <span className="text-white">{formatPatientDisplayName(currentCalling.patientName)}</span>
                  </p>
                </div>
              ) : (
                <div className="py-6">
                  <div className="text-4xl sm:text-6xl font-black text-emerald-300/80 font-heading">
                    All Clear
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200/90 mt-1.5 font-medium">
                    No patients currently waiting in queue.
                  </p>
                </div>
              )}
            </div>

            {/* Right Col: Assigned Doctor & Cabin Indicator Card (Wider 7-col allocation for natural text wrapping) */}
            {currentCalling ? (
              <div className="lg:col-span-7 bg-white dark:bg-[#121C21] text-[#132226] dark:text-[#F4F7F6] rounded-2xl border-2 border-emerald-400/40 dark:border-[#2DD4BF]/40 p-4 sm:p-5 lg:p-6 space-y-3 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E0E7E5] dark:border-[#21333A]">
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#EA580C] dark:text-[#FB923C] block">
                      Assigned Specialist
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black font-heading mt-0.5 text-[#132226] dark:text-[#F4F7F6] leading-snug">
                      {currentCalling.doctorName}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#0F766E] dark:text-[#2DD4BF] font-bold mt-1 leading-normal">
                      {currentCalling.specialization}
                    </p>
                  </div>

                  <div className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#0F766E] dark:bg-[#0D9488] text-[#F4F7F6] text-center shrink-0 shadow-md border-2 border-emerald-400/50 dark:border-[#2DD4BF]/50 self-start sm:self-center">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-200 block leading-tight">
                      Please Report To
                    </span>
                    <span className="text-base sm:text-xl font-black font-heading tracking-tight block mt-0.5 whitespace-nowrap">
                      {doctors.find(d => d.id === currentCalling.doctorId)?.cabin || 'Cabin 101'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs pt-0.5 text-[#455A60] dark:text-[#9DB4BA]">
                  <div className="p-2.5 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#E0E7E5] dark:border-[#21333A]">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#52676D] dark:text-[#79949B] block">
                      Scheduled Slot
                    </span>
                    <span className="font-bold text-[#132226] dark:text-[#F4F7F6] text-xs sm:text-sm">
                      {currentCalling.time}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#E0E7E5] dark:border-[#21333A]">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#52676D] dark:text-[#79949B] block">
                      Consultation Reason
                    </span>
                    <span className="font-bold text-[#132226] dark:text-[#F4F7F6] text-xs sm:text-sm block">
                      {currentCalling.reason || 'Routine Consultation'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-7 text-center p-6 sm:p-8 bg-white/10 dark:bg-black/20 rounded-2xl border border-white/20 text-xs text-emerald-100">
                <Sparkles className="w-6 h-6 text-emerald-300 mx-auto mb-2" />
                <span>New consultations booked from reception or mobile devices will appear on this screen automatically.</span>
              </div>
            )}

          </div>
        </div>

        {/* CABIN ROSTER & QUEUE STATUS GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] flex items-center gap-2 font-heading">
              <Stethoscope className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
              <span>Specialist Cabins &amp; Upcoming Queue ({pendingAppointments.length} Waiting)</span>
            </h2>
            <span className="text-xs text-[#5A7178] dark:text-[#9DB4BA] font-mono">
              Auto-sync active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {doctorQueues.map(({ doctor, active, upcoming, totalInQueue }) => {
              const isConsulting = Boolean(active);

              return (
                <div
                  key={doctor.id}
                  className={`rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 sm:space-y-3 flex flex-col justify-between transition-all duration-200 ${
                    isConsulting
                      ? 'bg-emerald-50/40 dark:bg-[#1B291D] border-2 border-emerald-500/60 dark:border-[#2DD4BF]/60 shadow-md shadow-emerald-500/10'
                      : 'bg-stone-50/80 dark:bg-[#121C21] border border-stone-200 dark:border-[#21333A] opacity-95'
                  }`}
                >
                  <div>
                    {/* Doctor Info */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E0E7E5] dark:border-[#21333A]">
                      <div className="min-w-0 flex-1 pr-1">
                        <span className="text-[10px] font-bold text-[#EA580C] dark:text-[#FB923C] uppercase tracking-wider block">
                          {doctor.cabin || 'Cabin 101'}
                        </span>
                        <h3 className="font-bold text-sm text-[#132226] dark:text-[#F4F7F6] font-heading leading-tight mt-0.5">
                          {doctor.name}
                        </h3>
                        <p className="text-[11px] text-[#0F766E] dark:text-[#2DD4BF] font-medium leading-tight mt-0.5">
                          {doctor.specialization.split('(')[0]}
                        </p>
                      </div>
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isConsulting
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-stone-200/70 dark:bg-[#19272D] text-stone-600 dark:text-[#9DB4BA] border-stone-300 dark:border-[#2C444E]'
                      }`}>
                        {totalInQueue}
                      </span>
                    </div>

                    {/* Active In Cabin */}
                    <div className={`my-2.5 sm:my-3 p-2.5 sm:p-3 rounded-xl border text-center transition-colors ${
                      isConsulting
                        ? 'bg-emerald-100/70 dark:bg-[#243B27] border-emerald-500/40 dark:border-[#2DD4BF]/40 text-emerald-950 dark:text-[#F4F7F6]'
                        : 'bg-stone-100/80 dark:bg-[#0B1114] border-stone-200 dark:border-[#21333A] text-stone-600 dark:text-[#9DB4BA]'
                    }`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                        isConsulting ? 'text-emerald-800 dark:text-[#2DD4BF]' : 'text-stone-500 dark:text-[#79949B]'
                      }`}>
                        In Cabin
                      </span>
                      {isConsulting ? (
                        <div className="text-2xl sm:text-3xl font-black text-[#134E4A] dark:text-[#2DD4BF] font-heading my-0.5 tracking-tight">
                          {active.tokenNumber}
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm font-bold text-stone-600 dark:text-[#9DB4BA] my-1 font-heading">
                          Ready
                        </div>
                      )}
                      <span className={`text-[10px] truncate block font-medium ${
                        isConsulting ? 'text-emerald-900 dark:text-[#F4F7F6]' : 'text-stone-500 dark:text-[#79949B]'
                      }`}>
                        {isConsulting ? active.patientName : 'Awaiting next patient'}
                      </span>
                    </div>

                    {/* Next in Line Tokens */}
                    <div>
                      <span className="text-[10px] font-bold text-[#52676D] dark:text-[#79949B] uppercase tracking-wider block mb-1">
                        Next in Line
                      </span>
                      {upcoming.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {upcoming.map((u) => (
                            <span
                              key={u.id}
                              className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#E8F0EE] dark:bg-[#19272D] text-[#132226] dark:text-[#F4F7F6] text-xs font-bold rounded-lg border border-[#E0E7E5] dark:border-[#2C444E]"
                            >
                              {u.tokenNumber}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#52676D] dark:text-[#79949B] italic">Queue clear</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Status Footer */}
                  <div className="pt-2 border-t border-[#E0E7E5] dark:border-[#21333A] text-[10px] text-[#52676D] dark:text-[#79949B] flex justify-between items-center">
                    <span>Slots: {doctor.availableSlots?.length || 4}/day</span>
                    {isConsulting ? (
                      <span className="text-emerald-600 dark:text-[#2DD4BF] font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Consulting
                      </span>
                    ) : (
                      <span className="text-stone-500 dark:text-[#9DB4BA] font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                        Ready / Awaiting
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Bottom Health Camp & Awareness Marquee Ticker */}
      <footer className="border-t border-[#E0E7E5] dark:border-[#21333A] bg-white dark:bg-[#0B1114] py-2.5 sm:py-3 px-3.5 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-xs text-[#5A7178] dark:text-[#9DB4BA]">

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F97316]/15 dark:bg-[#FB923C]/15 text-[#EA580C] dark:text-[#FB923C] border border-[#F97316]/30 dark:border-[#FB923C]/40 text-[10px] font-bold uppercase tracking-wider">
              Free SDG 3 Drives
            </span>
          </div>

          <div className="flex-1 overflow-hidden min-w-0 text-center sm:text-left">
            <p className="truncate text-xs font-medium text-[#132226] dark:text-[#F4F7F6]">
              {announcements.length > 0
                ? announcements.map(a => `${a.title} (${a.date} at ${a.location})`).join('  •  ')
                : 'Free maternal screening, child vaccinations, and chronic disease diagnostic camps active this week.'
              }
            </p>
          </div>

          <div className="shrink-0 text-[11px] text-[#758D94] dark:text-[#79949B]">
            Emergency: <strong className="text-rose-600 dark:text-rose-400">108</strong> • Reception: <strong className="text-[#132226] dark:text-[#F4F7F6]">+91 (011) 2345-6789</strong>
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
