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
    return { score: 100, text: 'Strong', color: 'bg-[#0F766E] dark:bg-[#2DD4BF]' };
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

    if (role === 'admin') {
      setError('Administrative accounts cannot be self-registered publicly. They must be provisioned directly by the Clinic Administrator.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const safeRole = role === 'doctor' ? 'doctor' : 'patient';
      const user = await signup(cleanEmail, password, {
        name: safeRole === 'doctor' && !cleanName.toLowerCase().startsWith('dr.') ? `Dr. ${cleanName}` : cleanName,
        role: safeRole,
        phone: phone.trim() || '+91 98765 00000',
        age: Number(age) || 28,
        gender,
        bloodGroup: safeRole === 'patient' ? bloodGroup : '',
        specialization: safeRole === 'doctor' ? (specialization.trim() || 'General Physician') : '',
        cabin: safeRole === 'doctor' ? (cabin.trim() || 'Cabin 101') : ''
      });

      if (user.role === 'patient') navigate('/patient');
      else if (user.role === 'doctor') navigate('/doctor');
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
        <div className="w-full max-w-md bg-white/95 dark:bg-[#121C21]/95 backdrop-blur-xl rounded-3xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl p-7 sm:p-9 text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-[#F4F7F6] flex items-center justify-center mx-auto shadow-lg shadow-[#0F766E]/25 animate-gentle-float">
            <UserCheck className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 text-[#0F766E] dark:text-[#2DD4BF] text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF] animate-pulse" />
              Active Session
            </div>
            <h2 className="text-2xl font-black text-[#132226] dark:text-[#F4F7F6] font-heading tracking-tight">
              You're Already Signed In
            </h2>
            <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-1.5">
              You are signed in as:
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
                  {authRole}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate(getDashboardPath())}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:from-[#115E59] hover:to-[#1C4231] dark:from-[#0D9488] dark:to-[#0F766E] text-[#F4F7F6] text-sm font-bold rounded-2xl shadow-lg shadow-[#0F766E]/20 hover:shadow-xl hover:shadow-[#0F766E]/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span>Go to {authRole.charAt(0).toUpperCase() + authRole.slice(1)} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={async () => {
                await logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#F4F7F6] hover:bg-[#E0E7E5]/50 dark:bg-[#19272D] dark:hover:bg-[#121C21] text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] text-xs font-semibold rounded-2xl border border-[#CFDAD6] dark:border-[#2C444E] transition-all cursor-pointer"
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
      <div className="w-full max-w-5xl bg-white/80 dark:bg-[#121C21]/90 backdrop-blur-xl rounded-3xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* LEFT COLUMN: Showcase & Mission (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F766E] via-[#115E59] to-[#1C3E2F] dark:from-[#1E3E2F] dark:via-[#162C21] dark:to-[#0F1E16] p-6 sm:p-8 text-[#F4F7F6] flex flex-col justify-between relative overflow-hidden">
          
          {/* Decorative geometric rings */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute right-12 top-28 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />

          {/* Top Mission */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
              <span>Universal Free Healthcare</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading leading-tight text-white">
                Join the Apna Community Network
              </h2>
              <p className="text-xs sm:text-sm text-[#F4F7F6]/80 mt-2 font-normal leading-relaxed">
                Whether you are seeking consultations, booking doctor appointments, or accessing health camp care, Apna Clinic connects you in seconds.
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
              <div className="absolute -bottom-3 left-3 right-3 bg-white/95 dark:bg-[#121C21]/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-white/40 dark:border-white/10 flex items-center justify-between text-[#132226] dark:text-[#F4F7F6]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold leading-tight">Zero Registration Fee</p>
                    <p className="text-[10px] text-[#455A60] dark:text-[#9DB4BA]">100% Free Public Health</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] text-[10px] font-bold">
                  Instant Activation
                </span>
              </div>
            </div>
          </div>

          {/* Perks list */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/15 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-[#F4F7F6]/90">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0" />
              <span>Smart Token Queue with direct email receipts &amp; OPD TV</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#F4F7F6]/90">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0" />
              <span>Digital prescriptions stored permanently with QR verification</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#F4F7F6]/90">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0" />
              <span>Early access to free specialized medical camps</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Registration Form (7 Cols) */}
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
                    Create Account
                  </h1>
                  <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                    Join the Apna Community Health Network
                  </p>
                </div>
              </div>

              {/* Navigation Pill */}
              <div className="flex bg-[#F4F7F6] dark:bg-[#19272D] p-1 rounded-xl border border-[#CFDAD6] dark:border-[#2C444E]">
                <Link
                  to="/login"
                  className="px-3 py-1 rounded-lg text-xs font-medium text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] transition-colors"
                >
                  Sign In
                </Link>
                <span className="px-3 py-1 rounded-lg bg-white dark:bg-[#121C21] text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] shadow-xs">
                  Register
                </span>
              </div>
            </div>

            {/* Role Picker Tiles (Only Patient & Doctor are publicly registerable) */}
            <div className="mb-6 space-y-2.5">
              <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider">
                1. Select Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    role === 'patient'
                      ? 'bg-gradient-to-b from-[#0F766E] to-[#115E59] dark:from-[#0D9488] dark:to-[#0F766E] text-[#F4F7F6] border-[#0F766E] dark:border-[#2DD4BF] shadow-md ring-2 ring-[#0F766E]/20'
                      : 'bg-[#F4F7F6] dark:bg-[#19272D] border-[#E0E7E5] dark:border-[#2C444E] text-[#455A60] dark:text-[#9DB4BA] hover:border-[#0F766E]/40'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs font-bold">Patient</span>
                  <span className={`text-[10px] ${role === 'patient' ? 'text-white/80' : 'text-[#5A7178] dark:text-[#79949B]'}`}>
                    Book OPD Tokens &amp; Records
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    role === 'doctor'
                      ? 'bg-gradient-to-b from-[#0F766E] to-[#115E59] dark:from-[#0D9488] dark:to-[#0F766E] text-[#F4F7F6] border-[#0F766E] dark:border-[#2DD4BF] shadow-md ring-2 ring-[#0F766E]/20'
                      : 'bg-[#F4F7F6] dark:bg-[#19272D] border-[#E0E7E5] dark:border-[#2C444E] text-[#455A60] dark:text-[#9DB4BA] hover:border-[#0F766E]/40'
                  }`}
                >
                  <Stethoscope className="w-5 h-5" />
                  <span className="text-xs font-bold">Doctor</span>
                  <span className={`text-[10px] ${role === 'doctor' ? 'text-white/80' : 'text-[#5A7178] dark:text-[#79949B]'}`}>
                    Consult &amp; Prescribe
                  </span>
                </button>
              </div>

              {/* Informative Security Notice about Admin / Staff Accounts */}
              <div className="flex items-center gap-2 p-2.5 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] text-[11px] text-[#5A7178] dark:text-[#9DB4BA]">
                <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />
                <span>Admin &amp; Staff accounts are private and issued directly by the Clinic Administrator.</span>
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

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'doctor' ? 'Dr. Sarah Jenkins' : 'Maya Sharma'}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#0F766E]/20 dark:focus:ring-[#2DD4BF]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#0F766E]/20 dark:focus:ring-[#2DD4BF]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#0F766E]/20 dark:focus:ring-[#2DD4BF]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Role Fields */}
              {role === 'patient' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#F4F7F6]/80 dark:bg-[#19272D]/60 rounded-2xl border border-[#E0E7E5] dark:border-[#21333A]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="28"
                      min="1"
                      max="120"
                      className="w-full px-3 py-2 bg-white dark:bg-[#121C21] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#121C21] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#121C21] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#F4F7F6]/80 dark:bg-[#19272D]/60 rounded-2xl border border-[#E0E7E5] dark:border-[#21333A]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1">
                      Specialization
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#121C21] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
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
                    <label className="block text-[11px] font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1">
                      Assigned Cabin
                    </label>
                    <input
                      type="text"
                      value={cabin}
                      onChange={(e) => setCabin(e.target.value)}
                      placeholder="Cabin 101 - Primary Block"
                      className="w-full px-3 py-2 bg-white dark:bg-[#121C21] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                </div>
              )}

              {/* Password & Strength Meter */}
              <div>
                <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Password * (Min. 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-10 pr-11 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#0F766E]/20 dark:focus:ring-[#2DD4BF]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#758D94] hover:text-[#132226] dark:text-[#79949B] dark:hover:text-[#F4F7F6] transition-colors p-0.5 rounded cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Progress Bar */}
                {password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#5A7178] dark:text-[#9DB4BA]">Password strength:</span>
                      <span className="font-bold text-[#132226] dark:text-[#F4F7F6]">{passwordStrength.text}</span>
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
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#455A60] dark:text-[#9DB4BA]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[#CFDAD6] dark:border-[#2C444E] text-[#0F766E] focus:ring-[#0F766E] cursor-pointer accent-[#0F766E]"
                  />
                  <span>
                    I confirm my information is accurate and agree to Apna Clinic's{' '}
                    <span className="text-[#0F766E] dark:text-[#2DD4BF] font-semibold underline">
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
                className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:from-[#115E59] hover:to-[#1C4231] dark:from-[#0D9488] dark:to-[#0F766E] text-[#F4F7F6] text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer group"
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
          <div className="mt-6 pt-5 border-t border-[#E0E7E5] dark:border-[#21333A] text-center">
            <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
              Already have an account registered?{' '}
              <Link
                to="/login"
                className="font-bold text-[#0F766E] dark:text-[#2DD4BF] hover:underline inline-flex items-center gap-1"
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
