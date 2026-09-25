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
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 py-12 relative overflow-hidden transition-colors duration-300">
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
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden transition-colors duration-300">
      
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
