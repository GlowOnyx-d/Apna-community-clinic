import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  Stethoscope,
  UserCheck,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [cabin, setCabin] = useState('Cabin 101');
  const [department, setDepartment] = useState('OPD Operations');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, currentUser, userProfile, role: authRole, logout } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, text: '', color: 'bg-gray-200' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 25, text: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 50, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, text: 'Good', color: 'bg-blue-500' };
    return { score: 100, text: 'Strong', color: 'bg-[#2D6A4F] dark:bg-[#52B788]' };
  }, [password]);

  const getDashboardPath = () => {
    if (authRole === 'patient') return '/patient';
    if (authRole === 'doctor') return '/doctor';
    if (authRole === 'admin') return '/admin';
    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName || !cleanEmail || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Community Health terms to proceed');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const user = await signup(cleanEmail, password, {
        name: role === 'doctor' && !cleanName.toLowerCase().startsWith('dr.') ? `Dr. ${cleanName}` : cleanName,
        role,
        phone: phone.trim() || '+91 98765 00000',
        age: Number(age) || 28,
        gender,
        bloodGroup: role === 'patient' ? bloodGroup : '',
        specialization: role === 'doctor' ? (specialization.trim() || 'General Physician') : '',
        cabin: role === 'doctor' ? (cabin.trim() || 'Cabin 101') : '',
        department: role === 'admin' ? (department.trim() || 'Clinic Operations') : ''
      });

      if (user.role === 'patient') navigate('/patient');
      else if (user.role === 'doctor') navigate('/doctor');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated
  if (currentUser) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <div className="w-full max-w-md bg-white/95 dark:bg-[#1C221C]/95 backdrop-blur-xl rounded-3xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-7 sm:p-9 text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2D6A4F] to-[#408A68] text-[#FAF7F2] flex items-center justify-center mx-auto shadow-lg shadow-[#2D6A4F]/25 animate-gentle-float">
            <UserCheck className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/10 dark:bg-[#52B788]/15 text-[#2D6A4F] dark:text-[#52B788] text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse" />
              Active Session
            </div>
            <h2 className="text-2xl font-black text-[#22291F] dark:text-[#FAF7F2] font-heading tracking-tight">
              You're Already Signed In
            </h2>
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-1.5">
              You are signed in as:
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
                  {authRole}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate(getDashboardPath())}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#2D6A4F] to-[#245740] hover:from-[#23543E] hover:to-[#1C4231] dark:from-[#357A5B] dark:to-[#2D6A4F] text-[#FAF7F2] text-sm font-bold rounded-2xl shadow-lg shadow-[#2D6A4F]/20 hover:shadow-xl hover:shadow-[#2D6A4F]/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span>Go to {authRole.charAt(0).toUpperCase() + authRole.slice(1)} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={async () => {
                await logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FAF7F2] hover:bg-[#E6DFC6]/50 dark:bg-[#242C24] dark:hover:bg-[#1C221C] text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] text-xs font-semibold rounded-2xl border border-[#D8CEB3] dark:border-[#445644] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out to Register New Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden transition-colors duration-300">
      
      {/* Main Split Container */}
      <div className="w-full max-w-5xl bg-white/80 dark:bg-[#1C221C]/90 backdrop-blur-xl rounded-3xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* LEFT COLUMN: Showcase & Mission (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#2D6A4F] via-[#23543E] to-[#1C3E2F] dark:from-[#1E3E2F] dark:via-[#162C21] dark:to-[#0F1E16] p-6 sm:p-8 text-[#FAF7F2] flex flex-col justify-between relative overflow-hidden">
          
          {/* Decorative geometric rings */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute right-12 top-28 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />

          {/* Top Mission */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
              <span>Universal Free Healthcare</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading leading-tight text-white">
                Join the Apna Community Network
              </h2>
              <p className="text-xs sm:text-sm text-[#FAF7F2]/80 mt-2 font-normal leading-relaxed">
                Whether you are seeking consultations, managing clinic visits, or volunteering as healthcare staff, Apna Clinic connects you in seconds.
              </p>
            </div>

            {/* Clinic Hero Image with floating live pill */}
            <div className="relative mt-4 group">
              <div className="overflow-hidden rounded-2xl border border-white/20 shadow-xl aspect-4/3 max-h-56 w-full">
                <img
                  src="/clinic_auth_hero.jpg"
                  alt="Apna Community Clinic Family Care"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating Live Badge */}
              <div className="absolute -bottom-3 left-3 right-3 bg-white/95 dark:bg-[#1C221C]/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-white/40 dark:border-white/10 flex items-center justify-between text-[#22291F] dark:text-[#FAF7F2]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold leading-tight">Zero Registration Fee</p>
                    <p className="text-[10px] text-[#52584E] dark:text-[#C4CFC3]">100% Free Public Health</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788] text-[10px] font-bold">
                  Instant Activation
                </span>
              </div>
            </div>
          </div>

          {/* Perks list */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/15 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-[#FAF7F2]/90">
              <CheckCircle2 className="w-4 h-4 text-[#52B788] shrink-0" />
              <span>Smart Token Queue with live SMS alerts &amp; OPD TV</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#FAF7F2]/90">
              <CheckCircle2 className="w-4 h-4 text-[#52B788] shrink-0" />
              <span>Digital prescriptions stored permanently with QR verification</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#FAF7F2]/90">
              <CheckCircle2 className="w-4 h-4 text-[#52B788] shrink-0" />
              <span>Early access to free specialized medical camps</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Registration Form (7 Cols) */}
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
                    Create Account
                  </h1>
                  <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
                    Join the Apna Community Health Network
                  </p>
                </div>
              </div>

              {/* Navigation Pill */}
              <div className="flex bg-[#FAF7F2] dark:bg-[#242C24] p-1 rounded-xl border border-[#D8CEB3] dark:border-[#445644]">
                <Link
                  to="/login"
                  className="px-3 py-1 rounded-lg text-xs font-medium text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] transition-colors"
                >
                  Sign In
                </Link>
                <span className="px-3 py-1 rounded-lg bg-white dark:bg-[#1C221C] text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] shadow-xs">
                  Register
                </span>
              </div>
            </div>

            {/* Role Picker Tiles */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-2">
                1. Select Account Type
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    role === 'patient'
                      ? 'bg-gradient-to-b from-[#2D6A4F] to-[#245740] dark:from-[#357A5B] dark:to-[#2D6A4F] text-[#FAF7F2] border-[#2D6A4F] dark:border-[#52B788] shadow-md ring-2 ring-[#2D6A4F]/20'
                      : 'bg-[#FAF7F2] dark:bg-[#242C24] border-[#E6DFC6] dark:border-[#445644] text-[#52584E] dark:text-[#C4CFC3] hover:border-[#2D6A4F]/40'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs font-bold">Patient</span>
                  <span className={`text-[10px] ${role === 'patient' ? 'text-white/80' : 'text-[#6B6B63] dark:text-[#94A493]'}`}>
                    Book OPD Tokens
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    role === 'doctor'
                      ? 'bg-gradient-to-b from-[#2D6A4F] to-[#245740] dark:from-[#357A5B] dark:to-[#2D6A4F] text-[#FAF7F2] border-[#2D6A4F] dark:border-[#52B788] shadow-md ring-2 ring-[#2D6A4F]/20'
                      : 'bg-[#FAF7F2] dark:bg-[#242C24] border-[#E6DFC6] dark:border-[#445644] text-[#52584E] dark:text-[#C4CFC3] hover:border-[#2D6A4F]/40'
                  }`}
                >
                  <Stethoscope className="w-5 h-5" />
                  <span className="text-xs font-bold">Doctor</span>
                  <span className={`text-[10px] ${role === 'doctor' ? 'text-white/80' : 'text-[#6B6B63] dark:text-[#94A493]'}`}>
                    Consult &amp; Prescribe
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    role === 'admin'
                      ? 'bg-gradient-to-b from-[#2D6A4F] to-[#245740] dark:from-[#357A5B] dark:to-[#2D6A4F] text-[#FAF7F2] border-[#2D6A4F] dark:border-[#52B788] shadow-md ring-2 ring-[#2D6A4F]/20'
                      : 'bg-[#FAF7F2] dark:bg-[#242C24] border-[#E6DFC6] dark:border-[#445644] text-[#52584E] dark:text-[#C4CFC3] hover:border-[#2D6A4F]/40'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-bold">Admin / Staff</span>
                  <span className={`text-[10px] ${role === 'admin' ? 'text-white/80' : 'text-[#6B6B63] dark:text-[#94A493]'}`}>
                    Manage Clinic Ops
                  </span>
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

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'doctor' ? 'Dr. Sarah Jenkins' : 'Maya Sharma'}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-2 focus:ring-[#2D6A4F]/20 dark:focus:ring-[#52B788]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-2 focus:ring-[#2D6A4F]/20 dark:focus:ring-[#52B788]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-2 focus:ring-[#2D6A4F]/20 dark:focus:ring-[#52B788]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Role Fields */}
              {role === 'patient' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#FAF7F2]/80 dark:bg-[#242C24]/60 rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="28"
                      min="1"
                      max="120"
                      className="w-full px-3 py-2 bg-white dark:bg-[#1C221C] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1C221C] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F]"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-1">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1C221C] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F]"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              )}

              {role === 'doctor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#FAF7F2]/80 dark:bg-[#242C24]/60 rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-1">
                      Specialization
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1C221C] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F]"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Pediatrics & Child Health">Pediatrics &amp; Child Health</option>
                      <option value="Dental Care">Dental Care</option>
                      <option value="Diagnostics & Pathology">Diagnostics &amp; Pathology</option>
                      <option value="Gynecology & Maternal Care">Gynecology &amp; Maternal Care</option>
                      <option value="Cardiology">Cardiology</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-1">
                      Assigned Cabin
                    </label>
                    <input
                      type="text"
                      value={cabin}
                      onChange={(e) => setCabin(e.target.value)}
                      placeholder="Cabin 101 - Primary Block"
                      className="w-full px-3 py-2 bg-white dark:bg-[#1C221C] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                </div>
              )}

              {role === 'admin' && (
                <div className="p-3.5 bg-[#FAF7F2]/80 dark:bg-[#242C24]/60 rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F]">
                  <label className="block text-[11px] font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-1">
                    Clinic Department / Designation
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Clinic CMO, Lead Receptionist, Camp Coordinator"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1C221C] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>
              )}

              {/* Password & Strength Meter */}
              <div>
                <label className="block text-xs font-bold text-[#52584E] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Password * (Min. 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-10 pr-11 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-2 focus:ring-[#2D6A4F]/20 dark:focus:ring-[#52B788]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#8E8E84] hover:text-[#22291F] dark:text-[#94A493] dark:hover:text-[#FAF7F2] transition-colors p-0.5 rounded cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Progress Bar */}
                {password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Password strength:</span>
                      <span className="font-bold text-[#22291F] dark:text-[#FAF7F2]">{passwordStrength.text}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Consent and Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#52584E] dark:text-[#C4CFC3]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[#D8CEB3] dark:border-[#445644] text-[#2D6A4F] focus:ring-[#2D6A4F] cursor-pointer accent-[#2D6A4F]"
                  />
                  <span>
                    I confirm my information is accurate and agree to Apna Clinic's{' '}
                    <span className="text-[#2D6A4F] dark:text-[#52B788] font-semibold underline">
                      Community Health Charter
                    </span>{' '}
                    and privacy policy.
                  </span>
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
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Free Registration</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Sign-in Prompt */}
          <div className="mt-6 pt-5 border-t border-[#E6DFC6] dark:border-[#2F3B2F] text-center">
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
              Already have an account registered?{' '}
              <Link
                to="/login"
                className="font-bold text-[#2D6A4F] dark:text-[#52B788] hover:underline inline-flex items-center gap-1"
              >
                <span>Sign In Here</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
