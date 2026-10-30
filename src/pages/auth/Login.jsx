import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
        <div className="w-full max-w-md bg-white/95 dark:bg-[#121C21]/95 backdrop-blur-xl rounded-3xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl p-7 sm:p-9 text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-[#F4F7F6] flex items-center justify-center mx-auto shadow-lg shadow-[#0F766E]/25 animate-gentle-float">
            <UserCheck className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 text-[#0F766E] dark:text-[#2DD4BF] text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF] animate-pulse" />
              Active Session Detected
            </div>
            <h2 className="text-2xl font-black text-[#132226] dark:text-[#F4F7F6] font-heading tracking-tight">
              You're Already Signed In
            </h2>
            <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-1.5">
              Continue to your designated portal or switch accounts below.
            </p>

            <div className="mt-4 p-4 bg-[#F4F7F6] dark:bg-[#19272D] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0F766E]/15 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center font-bold text-sm">
                  {(userProfile?.name || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#132226] dark:text-[#F4F7F6] truncate">
                    {userProfile?.name || currentUser.email}
                  </p>
                  <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] truncate">
                    {currentUser.email}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#0F766E]/15 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] text-[11px] font-bold uppercase tracking-wider">
                  {role}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate(getDashboardPath())}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:from-[#115E59] hover:to-[#1C4231] dark:from-[#0D9488] dark:to-[#0F766E] text-[#F4F7F6] text-sm font-bold rounded-2xl shadow-lg shadow-[#0F766E]/20 hover:shadow-xl hover:shadow-[#0F766E]/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span>Go to {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={async () => {
                await logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#F4F7F6] hover:bg-[#E0E7E5]/50 dark:bg-[#19272D] dark:hover:bg-[#121C21] text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] text-xs font-semibold rounded-2xl border border-[#CFDAD6] dark:border-[#2C444E] transition-all cursor-pointer"
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
      <div className="w-full max-w-5xl bg-white/80 dark:bg-[#121C21]/90 backdrop-blur-xl rounded-3xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* LEFT COLUMN: Visual Showcase & Brand Highlights (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F766E] via-[#115E59] to-[#1C3E2F] dark:from-[#1E3E2F] dark:via-[#162C21] dark:to-[#0F1E16] p-6 sm:p-8 text-[#F4F7F6] flex flex-col justify-between relative overflow-hidden">

          {/* Decorative geometric circles */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute right-12 top-28 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />

          {/* Top Brand & Mission */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
              <span>Apna Community Health Network</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading leading-tight text-white">
                Dignified, Zero-Wait Healthcare for All
              </h2>
              <p className="text-xs sm:text-sm text-[#F4F7F6]/80 mt-2 font-normal leading-relaxed">
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
              <div className="absolute -bottom-3 left-3 right-3 bg-white/95 dark:bg-[#121C21]/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-white/40 dark:border-white/10 flex items-center justify-between text-[#132226] dark:text-[#F4F7F6]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold leading-tight">Live OPD Status</p>
                    <p className="text-[10px] text-[#455A60] dark:text-[#9DB4BA]">Avg wait: 8 mins</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF] animate-ping" />
                  Live TV Sync
                </span>
              </div>
            </div>
          </div>

          {/* Key Feature Perks */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/15 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-[#F4F7F6]/90">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0" />
              <span>Real-time OPD Token Display on Mobile &amp; Kiosk</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#F4F7F6]/90">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0" />
              <span>Offline-ready prescriptions with QR code verification</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#F4F7F6]/90">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0" />
              <span>100% Free Community OPD &amp; Diagnostic Camps</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Sign In Form (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between">
          <div>
            {/* Header Tabs: Switch between Login & Register */}
            <div className="flex items-center justify-between pb-5 border-b border-[#E0E7E5] dark:border-[#21333A] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center shadow-xs">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#132226] dark:text-[#F4F7F6] font-heading tracking-tight">
                    Portal Sign In
                  </h1>
                  <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                    Apna Community Clinic
                  </p>
                </div>
              </div>

              {/* Navigation Pill */}
              <div className="flex bg-[#F4F7F6] dark:bg-[#19272D] p-1 rounded-xl border border-[#CFDAD6] dark:border-[#2C444E]">
                <span className="px-3 py-1 rounded-lg bg-white dark:bg-[#121C21] text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] shadow-xs">
                  Sign In
                </span>
                <Link
                  to="/register"
                  className="px-3 py-1 rounded-lg text-xs font-medium text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="mb-6 bg-[#F4F7F6]/80 dark:bg-[#19272D]/60 rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-3.5">
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A7178] dark:text-[#9DB4BA] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#EA580C] dark:text-[#FB923C]" />
                  1-Click Instant Demo Access
                </span>
                {demoFeedback && (
                  <span className="text-[11px] font-semibold text-[#0F766E] dark:text-[#2DD4BF] animate-fade-in flex items-center gap-1">
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
                    ? 'bg-white dark:bg-[#121C21] border-[#0F766E] dark:border-[#2DD4BF] ring-2 ring-[#0F766E]/20 dark:ring-[#2DD4BF]/20 shadow-xs'
                    : 'bg-white/60 dark:bg-[#121C21]/60 border-[#E0E7E5] dark:border-[#2C444E] hover:border-[#0F766E]/50 dark:hover:border-[#2DD4BF]/50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#EA580C] dark:text-[#FB923C]" />
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#EA580C]/10 text-[#EA580C] dark:bg-[#FB923C]/20 dark:text-[#FB923C]">
                      CMO
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#132226] dark:text-[#F4F7F6] truncate">Admin</p>
                  <p className="text-[10px] text-[#5A7178] dark:text-[#9DB4BA] truncate">Clinic Ops</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('doctor', 'rajesh.patel@communityclinic.org', 'wasd@121')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${activeDemoRole === 'doctor'
                    ? 'bg-white dark:bg-[#121C21] border-[#0F766E] dark:border-[#2DD4BF] ring-2 ring-[#0F766E]/20 dark:ring-[#2DD4BF]/20 shadow-xs'
                    : 'bg-white/60 dark:bg-[#121C21]/60 border-[#E0E7E5] dark:border-[#2C444E] hover:border-[#0F766E]/50 dark:hover:border-[#2DD4BF]/50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Stethoscope className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF]">
                      MD
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#132226] dark:text-[#F4F7F6] truncate">Doctor</p>
                  <p className="text-[10px] text-[#5A7178] dark:text-[#9DB4BA] truncate">Dr. Patel</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('patient', 'maya.sharma@example.com', 'wasd@121')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${activeDemoRole === 'patient'
                    ? 'bg-white dark:bg-[#121C21] border-[#0F766E] dark:border-[#2DD4BF] ring-2 ring-[#0F766E]/20 dark:ring-[#2DD4BF]/20 shadow-xs'
                    : 'bg-white/60 dark:bg-[#121C21]/60 border-[#E0E7E5] dark:border-[#2C444E] hover:border-[#0F766E]/50 dark:hover:border-[#2DD4BF]/50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <User className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF]">
                      User
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#132226] dark:text-[#F4F7F6] truncate">Patient</p>
                  <p className="text-[10px] text-[#5A7178] dark:text-[#9DB4BA] truncate">Maya Sharma</p>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-[#F97316]/10 dark:bg-[#FB923C]/10 border border-[#F97316]/30 dark:border-[#FB923C]/30 rounded-2xl text-xs font-medium text-[#EA580C] dark:text-[#FB923C]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* The Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (activeDemoRole) setActiveDemoRole(null);
                    }}
                    placeholder="name@communityclinic.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#0F766E]/20 dark:focus:ring-[#2DD4BF]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-medium text-[#0F766E] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (activeDemoRole) setActiveDemoRole(null);
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#0F766E]/20 dark:focus:ring-[#2DD4BF]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#758D94] hover:text-[#132226] dark:text-[#79949B] dark:hover:text-[#F4F7F6] transition-colors p-0.5 rounded cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#455A60] dark:text-[#9DB4BA]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#CFDAD6] dark:border-[#2C444E] text-[#0F766E] focus:ring-[#0F766E] cursor-pointer accent-[#0F766E]"
                  />
                  <span>Remember this device for 30 days</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:from-[#115E59] hover:to-[#1C4231] dark:from-[#0D9488] dark:to-[#0F766E] text-[#F4F7F6] text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer group"
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
          <div className="mt-6 pt-5 border-t border-[#E0E7E5] dark:border-[#21333A] text-center">
            <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
              First time visiting Apna Clinic?{' '}
              <Link
                to="/register"
                className="font-bold text-[#0F766E] dark:text-[#2DD4BF] hover:underline inline-flex items-center gap-1"
              >
                <span>Create an Account</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121C21] rounded-3xl border border-[#E0E7E5] dark:border-[#21333A] max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#EA580C]/10 dark:bg-[#FB923C]/20 text-[#EA580C] dark:text-[#FB923C] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">
                Reset Password
              </h3>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-1.5 leading-relaxed">
                For demo access, simply use the <strong>1-Click Demo Access</strong> buttons at the top of the sign-in form. For official staff password resets, contact the Clinic CMO.
              </p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 px-4 bg-[#0F766E] dark:bg-[#0D9488] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
