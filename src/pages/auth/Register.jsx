import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  ArrowRight,
  AlertCircle,
  Stethoscope,
  UserCheck,
  ShieldCheck,
  LogOut
} from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [specialization, setSpecialization] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, currentUser, userProfile, role: authRole, logout } = useAuth();
  const navigate = useNavigate();

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
    try {
      setError('');
      setLoading(true);
      const user = await signup(cleanEmail, password, {
        name: cleanName,
        role,
        phone: phone.trim(),
        age: Number(age) || 28,
        gender,
        specialization: role === 'doctor' ? specialization.trim() || 'General Physician' : ''
      });

      if (user.role === 'patient') navigate('/patient');
      else if (user.role === 'doctor') navigate('/doctor');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, allow user to jump to dashboard or sign out to register another
  if (currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 bg-[#FAF7F2] dark:bg-[#151915]">
        <div className="w-full max-w-md bg-white dark:bg-[#1C221C] rounded-3xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F]/15 dark:bg-[#357A5B]/20 border border-[#2D6A4F]/30 dark:border-[#52B788]/30 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto shadow-xs">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">Already Signed In</h2>
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-1">
              You are currently authenticated as:
            </p>
            <div className="mt-2 p-3 bg-[#FAF7F2] dark:bg-[#242C24] rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F]">
              <p className="text-sm font-bold text-[#22291F] dark:text-[#FAF7F2]">{userProfile?.name || currentUser.email}</p>
              <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">{currentUser.email}</p>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-md bg-[#2D6A4F]/15 dark:bg-[#357A5B]/20 border border-[#2D6A4F]/30 dark:border-[#52B788]/30 text-[#2D6A4F] dark:text-[#52B788] text-[11px] font-bold uppercase tracking-wider">
                Role: {authRole}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => navigate(getDashboardPath())}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2D6A4F] hover:bg-[#245740] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <span>Go to {authRole.charAt(0).toUpperCase() + authRole.slice(1)} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={async () => {
                await logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FAF7F2] hover:bg-[#E6DFC6]/60 dark:bg-[#242C24] dark:hover:bg-[#1C221C] text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] text-xs font-semibold rounded-xl border border-[#D8CEB3] dark:border-[#445644] transition-colors cursor-pointer"
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 bg-[#FAF7F2] dark:bg-[#151915]">
      <div className="w-full max-w-lg">

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2D6A4F]/15 dark:bg-[#357A5B]/20 border border-[#2D6A4F]/30 dark:border-[#52B788]/30 text-[#2D6A4F] dark:text-[#52B788] shadow-sm mb-3">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#22291F] dark:text-[#FAF7F2] tracking-tight font-heading">
            Create Your Account
          </h1>
          <p className="text-sm text-[#6B6B63] dark:text-[#C4CFC3] mt-1">
            Join the Apna Community Health Network
          </p>
        </div>

        <div className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-6 sm:p-8">

          {/* Role Picker */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${role === 'patient'
                  ? 'bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] border-[#2D6A4F] dark:border-[#52B788] shadow-xs'
                  : 'bg-[#FAF7F2] border-[#E6DFC6] text-[#6B6B63] hover:text-[#22291F] hover:border-[#D8CEB3] dark:bg-[#242C24] dark:border-[#445644] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] dark:hover:border-[#52B788]/50'
                  }`}
              >
                <UserCheck className="w-5 h-5 mb-1" />
                <span>Patient</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${role === 'doctor'
                  ? 'bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] border-[#2D6A4F] dark:border-[#52B788] shadow-xs'
                  : 'bg-[#FAF7F2] border-[#E6DFC6] text-[#6B6B63] hover:text-[#22291F] hover:border-[#D8CEB3] dark:bg-[#242C24] dark:border-[#445644] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] dark:hover:border-[#52B788]/50'
                  }`}
              >
                <Stethoscope className="w-5 h-5 mb-1" />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${role === 'admin'
                  ? 'bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] border-[#2D6A4F] dark:border-[#52B788] shadow-xs'
                  : 'bg-[#FAF7F2] border-[#E6DFC6] text-[#6B6B63] hover:text-[#22291F] hover:border-[#D8CEB3] dark:bg-[#242C24] dark:border-[#445644] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] dark:hover:border-[#52B788]/50'
                  }`}
              >
                <ShieldCheck className="w-5 h-5 mb-1" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#C97B4A]/10 dark:bg-[#E58A54]/10 border border-[#C97B4A]/30 dark:border-[#E58A54]/30 rounded-xl text-xs font-medium text-[#B35F2B] dark:text-[#E58A54]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'doctor' ? 'Dr. Sarah Connor' : 'Maya Sharma'}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                  />
                </div>
              </div>
            </div>

            {role === 'patient' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="28"
                    min="1"
                    max="120"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                  >
                    <option value="Female" className="bg-white dark:bg-[#242C24] text-[#22291F] dark:text-[#FAF7F2]">Female</option>
                    <option value="Male" className="bg-white dark:bg-[#242C24] text-[#22291F] dark:text-[#FAF7F2]">Male</option>
                    <option value="Other" className="bg-white dark:bg-[#242C24] text-[#22291F] dark:text-[#FAF7F2]">Other</option>
                  </select>
                </div>
              </div>
            )}

            {role === 'doctor' && (
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Medical Specialization
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Pediatrics, Cardiology, General Physician"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                Password * (minimum 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password (8+ chars)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-[#2D6A4F] hover:bg-[#245740] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E6DFC6] dark:border-[#2F3B2F] text-center">
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#2D6A4F] dark:text-[#52B788] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
