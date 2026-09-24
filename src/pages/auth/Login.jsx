import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  UserCheck,
  LogOut,
  ShieldCheck,
  Stethoscope,
  User,
  Sparkles,
  CheckCircle2,
  Activity
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState(null);
  const [demoFeedback, setDemoFeedback] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login, currentUser, userProfile, role, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (targetRole) => {
    const r = targetRole || role;
    if (r === 'patient') return '/patient';
    if (r === 'doctor') return '/doctor';
    if (r === 'admin') return '/admin';
    return '/';
  };

  const handleDemoSelect = (roleKey, demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setActiveDemoRole(roleKey);
    setError('');
    setDemoFeedback(`${roleKey.charAt(0).toUpperCase() + roleKey.slice(1)} credentials loaded!`);
    setTimeout(() => setDemoFeedback(''), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter both email and password');
      return;
    }
    try {
      setError('');
      setLoading(true);
      const user = await login(cleanEmail, password);
      const userRole = user?.role || 'patient';
      if (userRole === 'patient') navigate('/patient');
      else if (userRole === 'doctor') navigate('/doctor');
      else if (userRole === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated
  if (currentUser) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 py-12 bg-[#F8F6F1] dark:bg-[#131713] relative overflow-hidden transition-colors duration-300">
        {/* Subtle sage ambient wash & soft radial glow */}
        <div 
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            background: 'radial-gradient(135% 100% at 50% 0%, rgba(233, 240, 235, 0.65) 0%, rgba(248, 246, 241, 0.95) 55%, #F8F6F1 100%)'
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[115px] opacity-60 dark:opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(58, 125, 92, 0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[115px] opacity-50 dark:opacity-25 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(186, 168, 142, 0.04) 0%, transparent 70%)' }} />

        <div className="w-full max-w-md bg-white/95 dark:bg-[#1C221C]/95 backdrop-blur-xl rounded-3xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-7 sm:p-9 text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2D6A4F] to-[#408A68] text-[#FAF7F2] flex items-center justify-center mx-auto shadow-lg shadow-[#2D6A4F]/25 animate-gentle-float">
            <UserCheck className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/10 dark:bg-[#52B788]/15 text-[#2D6A4F] dark:text-[#52B788] text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse" />
              Active Session Detected
            </div>
            <h2 className="text-2xl font-black text-[#22291F] dark:text-[#FAF7F2] font-heading tracking-tight">
              You're Already Signed In
            </h2>
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-1.5">
              Continue to your designated portal or switch accounts below.
            </p>

            <div className="mt-4 p-4 bg-[#FAF7F2] dark:bg-[#242C24] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2D6A4F]/15 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center font-bold text-sm">
                  {(userProfile?.name || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#22291F] dark:text-[#FAF7F2] truncate">
                    {userProfile?.name || currentUser.email}
                  </p>
                  <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] truncate">
                    {currentUser.email}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#2D6A4F]/15 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] text-[11px] font-bold uppercase tracking-wider">
                  {role}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate(getDashboardPath())}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#2D6A4F] to-[#245740] hover:from-[#23543E] hover:to-[#1C4231] dark:from-[#357A5B] dark:to-[#2D6A4F] text-[#FAF7F2] text-sm font-bold rounded-2xl shadow-lg shadow-[#2D6A4F]/20 hover:shadow-xl hover:shadow-[#2D6A4F]/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span>Go to {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={async () => {
                await logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FAF7F2] hover:bg-[#E6DFC6]/50 dark:bg-[#242C24] dark:hover:bg-[#1C221C] text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] text-xs font-semibold rounded-2xl border border-[#D8CEB3] dark:border-[#445644] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out to Use Another Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-[#F8F6F1] dark:bg-[#131713] relative overflow-hidden transition-colors duration-300">
      
      {/* ============================================================== */}
      {/* ATMOSPHERIC HEALTHCARE ARCHITECTURAL BACKGROUND LAYER          */}
      {/* Warm ivory base, directional sage glows, soft light halos,     */}
      {/* oversized organic circles (8-12%), and flowing curves          */}
      {/* ============================================================== */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        
        {/* 1. Base Multi-Stop Atmospheric Depth Gradient */}
        {/* Clean warm ivory top -> luminous core -> muted sage-earth cream foundation */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(135% 95% at 50% 32%, #FFFFFF 0%, #FAF8F3 34%, #F3EFE4 68%, #EAE2D0 100%)'
          }}
        />
        <div 
          className="absolute inset-0 hidden dark:block"
          style={{
            background: 'radial-gradient(135% 95% at 50% 32%, #19231A 0%, #131813 36%, #0D120E 70%, #070A07 100%)'
          }}
        />

        {/* Top Crisp Atmospheric Wash (Keeps top mostly clean ivory with subtle green atmosphere) */}
        <div 
          className="absolute top-0 left-0 right-0 h-44 sm:h-64"
          style={{
            background: 'linear-gradient(180deg, rgba(254, 253, 250, 0.95) 0%, rgba(248, 246, 240, 0.5) 50%, transparent 100%)'
          }}
        />
        <div 
          className="absolute top-0 left-0 right-0 h-44 sm:h-64 hidden dark:block"
          style={{
            background: 'linear-gradient(180deg, rgba(19, 25, 19, 0.85) 0%, rgba(16, 21, 16, 0.35) 50%, transparent 100%)'
          }}
        />

        {/* Bottom Atmospheric Grounding Gradient (Deeper green/cream atmospheric transition) */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-52 sm:h-72"
          style={{
            background: 'linear-gradient(0deg, rgba(222, 215, 199, 0.55) 0%, rgba(234, 228, 216, 0.22) 45%, transparent 100%)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-52 sm:h-72 hidden dark:block"
          style={{
            background: 'linear-gradient(0deg, rgba(8, 12, 8, 0.7) 0%, rgba(11, 15, 11, 0.25) 45%, transparent 100%)'
          }}
        />

        {/* 2. Soft Light Halos (White/Green illuminated aura behind card edges) */}
        {/* Primary Ambient Light Bed (Large diffused ellipse centered directly behind login card) */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1150px] sm:w-[1450px] lg:w-[1600px] h-[750px] sm:h-[950px] lg:h-[1050px] rounded-[100%] blur-[95px] sm:blur-[125px] opacity-95 dark:opacity-35"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.98) 0%, rgba(246, 251, 247, 0.82) 34%, rgba(232, 244, 236, 0.42) 56%, rgba(218, 235, 224, 0.16) 72%, transparent 86%)'
          }}
        />

        {/* Secondary Card-Edge Rim Halo (Tighter luminous rim illuminating card boundaries) */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1040px] h-[660px] rounded-[36px] blur-[55px] opacity-75 dark:opacity-20"
          style={{
            background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.7) 0%, rgba(230, 242, 234, 0.35) 48%, transparent 75%)'
          }}
        />

        {/* 3. Ambient Green Glows (Directional sage/emerald glows with blurred diffused edges) */}
        {/* Glow 1: Large Glow behind Left Side of Card (Muted deep emerald/sage branding anchor) */}
        <div 
          className="absolute top-1/2 left-[24%] sm:left-[26%] -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1100px] h-[850px] sm:h-[1100px] rounded-full blur-[130px] sm:blur-[150px] opacity-85 dark:opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(45, 106, 79, 0.18) 0%, rgba(64, 138, 104, 0.10) 35%, rgba(82, 183, 136, 0.035) 62%, transparent 75%)'
          }}
        />

        {/* Glow 2: Subtle Glow behind Upper-Right Area (Eucalyptus & pale mint atmosphere) */}
        <div 
          className="absolute -top-28 sm:-top-20 right-[6%] sm:right-[10%] w-[680px] sm:w-[900px] h-[680px] sm:h-[900px] rounded-full blur-[120px] sm:blur-[140px] opacity-80 dark:opacity-45"
          style={{
            background: 'radial-gradient(circle, rgba(58, 125, 92, 0.11) 0%, rgba(98, 142, 116, 0.055) 44%, rgba(138, 172, 150, 0.02) 65%, transparent 72%)'
          }}
        />

        {/* Glow 3: Smaller Glow toward Bottom-Right (Warm sage-earth transition) */}
        <div 
          className="absolute -bottom-28 sm:-bottom-20 right-[4%] sm:right-[8%] w-[580px] sm:w-[760px] h-[580px] sm:h-[760px] rounded-full blur-[110px] sm:blur-[130px] opacity-75 dark:opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(45, 106, 79, 0.10) 0%, rgba(188, 172, 142, 0.065) 44%, transparent 72%)'
          }}
        />

        {/* 4. Large Translucent Organic Circles & Network Geometry (8-12% visible & subtle) */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 1600 1000" 
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS & GRADIENTS */}
          <defs>
            <linearGradient id="curveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.04" />
              <stop offset="25%" stopColor="#2D6A4F" stopOpacity="0.12" />
              <stop offset="70%" stopColor="#408A68" stopOpacity="0.11" />
              <stop offset="100%" stopColor="#52B788" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="curveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#357A5B" stopOpacity="0.03" />
              <stop offset="35%" stopColor="#357A5B" stopOpacity="0.10" />
              <stop offset="75%" stopColor="#2D6A4F" stopOpacity="0.11" />
              <stop offset="100%" stopColor="#6B8E78" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="curveGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#408A68" stopOpacity="0.03" />
              <stop offset="40%" stopColor="#408A68" stopOpacity="0.10" />
              <stop offset="80%" stopColor="#2D6A4F" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#357A5B" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="curveGrad4" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.04" />
              <stop offset="45%" stopColor="#2D6A4F" stopOpacity="0.095" />
              <stop offset="85%" stopColor="#6B8E78" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#8A9A86" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* GROUP A: UPPER-RIGHT CELESTIAL NETWORK ORBITS (8-12% Noticeably Visible) */}
          {/* Great Outer Orbit (11% Opacity - clearly visible) */}
          <circle 
            cx="1480" 
            cy="-70" 
            r="1020" 
            stroke="#2D6A4F" 
            strokeWidth="1.2" 
            opacity="0.11" 
            className="dark:stroke-[#52B788] dark:opacity-13" 
          />
          {/* Intermediate Concentric Orbit (8.5% Opacity) */}
          <circle 
            cx="1480" 
            cy="-70" 
            r="800" 
            stroke="#408A68" 
            strokeWidth="0.95" 
            opacity="0.085" 
            className="dark:stroke-[#52B788] dark:opacity-10" 
          />
          {/* Rhythmic Segmented Network Orbit (Pulse spacing) */}
          <circle 
            cx="1480" 
            cy="-70" 
            r="670" 
            stroke="#357A5B" 
            strokeWidth="1.1" 
            strokeDasharray="6 12" 
            opacity="0.09" 
            className="dark:stroke-[#52B788] dark:opacity-11" 
          />
          {/* Inner Visible Ring (10% Opacity) */}
          <circle 
            cx="1480" 
            cy="-70" 
            r="540" 
            stroke="#2D6A4F" 
            strokeWidth="1.05" 
            opacity="0.10" 
            className="dark:stroke-[#52B788] dark:opacity-12" 
          />
          {/* Subtle Delicate Inner Orbit (5% Opacity) */}
          <circle 
            cx="1480" 
            cy="-70" 
            r="380" 
            stroke="#52B788" 
            strokeWidth="0.75" 
            opacity="0.05" 
            className="dark:stroke-[#52B788] dark:opacity-07" 
          />

          {/* Intersecting Upper-Right Eccentric Arc (Creates lens/mandorla network geometry) */}
          <circle 
            cx="1190" 
            cy="-180" 
            r="650" 
            stroke="#357A5B" 
            strokeWidth="1.1" 
            opacity="0.095" 
            className="dark:stroke-[#52B788] dark:opacity-11" 
          />
          {/* Secondary Intersecting Elliptical Arc */}
          <ellipse 
            cx="1340" 
            cy="120" 
            rx="460" 
            ry="360" 
            stroke="#408A68" 
            strokeWidth="0.85" 
            opacity="0.06" 
            className="dark:stroke-[#52B788] dark:opacity-08" 
          />

          {/* Network Intersection Node Points (Subtle abstract data/community nodes) */}
          <circle cx="1275" cy="460" r="3" fill="#2D6A4F" opacity="0.13" className="dark:fill-[#52B788] dark:opacity-15" />
          <circle cx="1470" cy="598" r="3.5" fill="#357A5B" opacity="0.12" className="dark:fill-[#52B788] dark:opacity-14" />
          <circle cx="798" cy="276" r="2.5" fill="#408A68" opacity="0.11" className="dark:fill-[#52B788] dark:opacity-13" />

          {/* GROUP B: LOWER-LEFT SWEEPING PLANETARY ARCS (8-11% Noticeably Visible) */}
          {/* Great Outer Arc (11% Opacity) */}
          <circle 
            cx="-130" 
            cy="1100" 
            r="1050" 
            stroke="#2D6A4F" 
            strokeWidth="1.25" 
            opacity="0.11" 
            className="dark:stroke-[#52B788] dark:opacity-13" 
          />
          {/* Sweeping Harmonic Arc (9.5% Opacity) */}
          <circle 
            cx="-130" 
            cy="1100" 
            r="840" 
            stroke="#357A5B" 
            strokeWidth="1.0" 
            opacity="0.095" 
            className="dark:stroke-[#52B788] dark:opacity-11" 
          />
          {/* Rhythmic Segmented Arc */}
          <circle 
            cx="-130" 
            cy="1100" 
            r="730" 
            stroke="#52B788" 
            strokeWidth="0.95" 
            strokeDasharray="5 10" 
            opacity="0.08" 
            className="dark:stroke-[#52B788] dark:opacity-10" 
          />
          {/* Mid Arc (7.5% Opacity) */}
          <circle 
            cx="-130" 
            cy="1100" 
            r="630" 
            stroke="#408A68" 
            strokeWidth="0.85" 
            opacity="0.075" 
            className="dark:stroke-[#52B788] dark:opacity-09" 
          />
          {/* Earthy Warm Sage Base Arc (5.5% Opacity) */}
          <circle 
            cx="-130" 
            cy="1100" 
            r="450" 
            stroke="#8A9A86" 
            strokeWidth="0.75" 
            opacity="0.055" 
            className="dark:stroke-[#A3B18A] dark:opacity-07" 
          />

          {/* Intersecting Lower-Left Ellipse (Organic network cross-arc) */}
          <ellipse 
            cx="170" 
            cy="1160" 
            rx="740" 
            ry="580" 
            stroke="#2D6A4F" 
            strokeWidth="1.0" 
            opacity="0.09" 
            className="dark:stroke-[#52B788] dark:opacity-11" 
          />
          {/* Lower-left network nodes */}
          <circle cx="310" cy="595" r="3" fill="#2D6A4F" opacity="0.12" className="dark:fill-[#52B788] dark:opacity-14" />
          <circle cx="585" cy="740" r="2.5" fill="#357A5B" opacity="0.10" className="dark:fill-[#52B788] dark:opacity-12" />

          {/* GROUP C: UPPER-LEFT GENTLE ORBIT (Echoes left panel rounded curves) */}
          <circle 
            cx="-70" 
            cy="-70" 
            r="680" 
            stroke="#2D6A4F" 
            strokeWidth="1.0" 
            opacity="0.085" 
            className="dark:stroke-[#52B788] dark:opacity-10" 
          />

          {/* GROUP D: BOTTOM-RIGHT GROUNDING ARC (Subtle geometric arcs at bottom) */}
          <circle 
            cx="1560" 
            cy="1100" 
            r="620" 
            stroke="#5E7A67" 
            strokeWidth="1.05" 
            opacity="0.09" 
            className="dark:stroke-[#52B788] dark:opacity-11" 
          />
          <circle 
            cx="1560" 
            cy="1100" 
            r="430" 
            stroke="#8A9A86" 
            strokeWidth="0.75" 
            opacity="0.05" 
            className="dark:stroke-[#A3B18A] dark:opacity-07" 
          />

          {/* 5. FLOWING CURVES (4 Elegant, extremely thin flowing curves traveling naturally around the card) */}
          
          {/* Curve 1: Upper Atmospheric Crest (Travels gracefully across upper field above the login card) */}
          <path
            d="M -120 180 C 240 60, 520 140, 800 95 C 1080 50, 1340 125, 1720 70"
            stroke="url(#curveGrad1)"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          {/* Curve 1 Ghost Echo (Parallel precision contour line) */}
          <path
            d="M -120 196 C 240 76, 520 156, 800 111 C 1080 66, 1340 141, 1720 86"
            stroke="#408A68"
            strokeWidth="0.75"
            strokeLinecap="round"
            opacity="0.04"
            className="dark:stroke-[#52B788] dark:opacity-06"
          />

          {/* Curve 2: Lower Foundation Wave (Cradles the bottom of the card with natural buoyant sweep) */}
          <path
            d="M -90 820 C 220 885, 480 930, 820 885 C 1140 835, 1380 915, 1710 860"
            stroke="url(#curveGrad2)"
            strokeWidth="1.15"
            strokeLinecap="round"
          />
          {/* Curve 2 Ghost Echo */}
          <path
            d="M -90 834 C 220 899, 480 944, 820 899 C 1140 849, 1380 929, 1710 874"
            stroke="#6B8E78"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0.04"
            className="dark:stroke-[#52B788] dark:opacity-05"
          />

          {/* Curve 3: Right Flank Architectural Sweep (Frames right negative space with vertical movement) */}
          <path
            d="M 1360 -70 C 1500 220, 1540 500, 1460 740 C 1410 880, 1490 970, 1640 1020"
            stroke="url(#curveGrad3)"
            strokeWidth="1.0"
            strokeLinecap="round"
          />

          {/* Curve 4: Left Margin Organic Embrace (Loosely echoes curves within the green panel) */}
          <path
            d="M 240 -80 C 110 180, 60 440, 110 700 C 140 840, 80 940, -40 1010"
            stroke="url(#curveGrad4)"
            strokeWidth="1.05"
            strokeLinecap="round"
          />
        </svg>

      </div>

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-5xl bg-white/80 dark:bg-[#1C221C]/90 backdrop-blur-xl rounded-3xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* LEFT COLUMN: Visual Showcase & Brand Highlights (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#2D6A4F] via-[#23543E] to-[#1C3E2F] dark:from-[#1E3E2F] dark:via-[#162C21] dark:to-[#0F1E16] p-6 sm:p-8 text-[#FAF7F2] flex flex-col justify-between relative overflow-hidden">

          {/* Decorative geometric circles */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute right-12 top-28 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />

          {/* Top Brand & Mission */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
              <span>Apna Community Health Network</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading leading-tight text-white">
                Dignified, Zero-Wait Healthcare for All
              </h2>
              <p className="text-xs sm:text-sm text-[#FAF7F2]/80 mt-2 font-normal leading-relaxed">
                Connect seamlessly with certified doctors, view your real-time token queue on the waiting room TV, and access your health records anywhere.
              </p>
            </div>

            {/* Clinic Hero Image with floating live pill */}
            <div className="relative mt-4 group">
              <div className="overflow-hidden rounded-2xl border border-white/20 shadow-xl aspect-4/3 max-h-56 w-full">
                <img
                  src="/clinic_auth_hero.jpg"
                  alt="Apna Community Clinic Consultation"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating Live Badge */}
              <div className="absolute -bottom-3 left-3 right-3 bg-white/95 dark:bg-[#1C221C]/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-white/40 dark:border-white/10 flex items-center justify-between text-[#22291F] dark:text-[#FAF7F2]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold leading-tight">Live OPD Status</p>
                    <p className="text-[10px] text-[#52584E] dark:text-[#C4CFC3]">Avg wait: 8 mins</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788] text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-ping" />
                  Live TV Sync
                </span>
              </div>
            </div>
          </div>

          {/* Key Feature Perks */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/15 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-[#FAF7F2]/90">
              <CheckCircle2 className="w-4 h-4 text-[#52B788] shrink-0" />
              <span>Real-time OPD Token Display on Mobile &amp; Kiosk</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#FAF7F2]/90">
              <CheckCircle2 className="w-4 h-4 text-[#52B788] shrink-0" />
              <span>Offline-ready prescriptions with QR code verification</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#FAF7F2]/90">
              <CheckCircle2 className="w-4 h-4 text-[#52B788] shrink-0" />
              <span>100% Free Community OPD &amp; Diagnostic Camps</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Sign In Form (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between">
          <div>
            {/* Header Tabs: Switch between Login & Register */}
            <div className="flex items-center justify-between pb-5 border-b border-[#E6DFC6] dark:border-[#2F3B2F] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center shadow-xs">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading tracking-tight">
                    Portal Sign In
                  </h1>
                  <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
                    Apna Community Clinic
                  </p>
                </div>
              </div>

              {/* Navigation Pill */}
              <div className="flex bg-[#FAF7F2] dark:bg-[#242C24] p-1 rounded-xl border border-[#D8CEB3] dark:border-[#445644]">
                <span className="px-3 py-1 rounded-lg bg-white dark:bg-[#1C221C] text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] shadow-xs">
                  Sign In
                </span>
                <Link
                  to="/register"
                  className="px-3 py-1 rounded-lg text-xs font-medium text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="mb-6 bg-[#FAF7F2]/80 dark:bg-[#242C24]/60 rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-3.5">
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B63] dark:text-[#C4CFC3] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A85222] dark:text-[#E58A54]" />
                  1-Click Instant Demo Access
                </span>
                {demoFeedback && (
                  <span className="text-[11px] font-semibold text-[#2D6A4F] dark:text-[#52B788] animate-fade-in flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {demoFeedback}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSelect('admin', 'admin@communityclinic.org', 'wasd@121')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${activeDemoRole === 'admin'
                    ? 'bg-white dark:bg-[#1C221C] border-[#2D6A4F] dark:border-[#52B788] ring-2 ring-[#2D6A4F]/20 dark:ring-[#52B788]/20 shadow-xs'
                    : 'bg-white/60 dark:bg-[#1C221C]/60 border-[#E6DFC6] dark:border-[#445644] hover:border-[#2D6A4F]/50 dark:hover:border-[#52B788]/50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#A85222] dark:text-[#E58A54]" />
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#A85222]/10 text-[#A85222] dark:bg-[#E58A54]/20 dark:text-[#E58A54]">
                      CMO
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#22291F] dark:text-[#FAF7F2] truncate">Admin</p>
                  <p className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3] truncate">Clinic Ops</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('doctor', 'rajesh.patel@communityclinic.org', 'wasd@121')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${activeDemoRole === 'doctor'
                    ? 'bg-white dark:bg-[#1C221C] border-[#2D6A4F] dark:border-[#52B788] ring-2 ring-[#2D6A4F]/20 dark:ring-[#52B788]/20 shadow-xs'
                    : 'bg-white/60 dark:bg-[#1C221C]/60 border-[#E6DFC6] dark:border-[#445644] hover:border-[#2D6A4F]/50 dark:hover:border-[#52B788]/50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Stethoscope className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788]">
                      MD
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#22291F] dark:text-[#FAF7F2] truncate">Doctor</p>
                  <p className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3] truncate">Dr. Patel</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('patient', 'maya.sharma@example.com', 'wasd@121')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${activeDemoRole === 'patient'
                    ? 'bg-white dark:bg-[#1C221C] border-[#2D6A4F] dark:border-[#52B788] ring-2 ring-[#2D6A4F]/20 dark:ring-[#52B788]/20 shadow-xs'
                    : 'bg-white/60 dark:bg-[#1C221C]/60 border-[#E6DFC6] dark:border-[#445644] hover:border-[#2D6A4F]/50 dark:hover:border-[#52B788]/50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <User className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788]">
                      User
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#22291F] dark:text-[#FAF7F2] truncate">Patient</p>
                  <p className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3] truncate">Maya Sharma</p>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-[#C97B4A]/10 dark:bg-[#E58A54]/10 border border-[#C97B4A]/30 dark:border-[#E58A54]/30 rounded-2xl text-xs font-medium text-[#B35F2B] dark:text-[#E58A54]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* The Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (activeDemoRole) setActiveDemoRole(null);
                    }}
                    placeholder="name@communityclinic.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-2 focus:ring-[#2D6A4F]/20 dark:focus:ring-[#52B788]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (activeDemoRole) setActiveDemoRole(null);
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-2 focus:ring-[#2D6A4F]/20 dark:focus:ring-[#52B788]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#8E8E84] hover:text-[#22291F] dark:text-[#94A493] dark:hover:text-[#FAF7F2] transition-colors p-0.5 rounded cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#52584E] dark:text-[#C4CFC3]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D8CEB3] dark:border-[#445644] text-[#2D6A4F] focus:ring-[#2D6A4F] cursor-pointer accent-[#2D6A4F]"
                  />
                  <span>Remember this device for 30 days</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#2D6A4F] to-[#245740] hover:from-[#23543E] hover:to-[#1C4231] dark:from-[#357A5B] dark:to-[#2D6A4F] text-[#FAF7F2] text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer group"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Registration Prompt */}
          <div className="mt-6 pt-5 border-t border-[#E6DFC6] dark:border-[#2F3B2F] text-center">
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
              First time visiting Apna Clinic?{' '}
              <Link
                to="/register"
                className="font-bold text-[#2D6A4F] dark:text-[#52B788] hover:underline inline-flex items-center gap-1"
              >
                <span>Create an Account</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C221C] rounded-3xl border border-[#E6DFC6] dark:border-[#2F3B2F] max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#A85222]/10 dark:bg-[#E58A54]/20 text-[#A85222] dark:text-[#E58A54] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
                Reset Password
              </h3>
              <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-1.5 leading-relaxed">
                For demo access, simply use the <strong>1-Click Demo Access</strong> buttons at the top of the sign-in form. For official staff password resets, contact the Clinic CMO.
              </p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 px-4 bg-[#2D6A4F] dark:bg-[#357A5B] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
