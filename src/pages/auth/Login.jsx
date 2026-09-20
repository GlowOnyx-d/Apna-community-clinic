import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  UserCheck,
  LogOut
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser, userProfile, role, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (role === 'patient') return '/patient';
    if (role === 'doctor') return '/doctor';
    if (role === 'admin') return '/admin';
    return '/';
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
      if (user.role === 'patient') navigate('/patient');
      else if (user.role === 'doctor') navigate('/doctor');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, inform the user and allow them to jump to dashboard or sign out
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
                Role: {role}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => navigate(getDashboardPath())}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2D6A4F] hover:bg-[#245740] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <span>Go to {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={async () => {
                await logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FAF7F2] hover:bg-[#E6DFC6]/60 dark:bg-[#242C24] dark:hover:bg-[#1C221C] text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] text-xs font-semibold rounded-xl border border-[#D8CEB3] dark:border-[#445644] transition-colors cursor-pointer"
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 bg-[#FAF7F2] dark:bg-[#151915]">
      <div className="w-full max-w-md">

        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2D6A4F]/15 dark:bg-[#357A5B]/20 border border-[#2D6A4F]/30 dark:border-[#52B788]/30 text-[#2D6A4F] dark:text-[#52B788] shadow-sm mb-3">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#22291F] dark:text-[#FAF7F2] tracking-tight font-heading">
            Welcome to Apna Clinic
          </h1>
          <p className="text-sm text-[#6B6B63] dark:text-[#C4CFC3] mt-1">
            Community Health Platform &amp; Token Queue Portal
          </p>
        </div>

        {/* Quick Demo Sign-In Selector */}
        <div className="mb-4 bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B63] dark:text-[#C4CFC3] mb-2.5 text-center">
            ⚡ 1-Click Demo Access
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@communityclinic.org');
                setPassword('Admin@123');
                setError('');
              }}
              className="px-2 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#2D6A4F]/10 dark:bg-[#242C24] dark:hover:bg-[#357A5B]/20 border border-[#E6DFC6] dark:border-[#445644] text-center transition-colors cursor-pointer"
            >
              <span className="block text-xs font-bold text-[#22291F] dark:text-[#FAF7F2]">Admin</span>
              <span className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] font-medium">Clinic CMO</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('rajesh.patel@communityclinic.org');
                setPassword('wasd@121');
                setError('');
              }}
              className="px-2 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#2D6A4F]/10 dark:bg-[#242C24] dark:hover:bg-[#357A5B]/20 border border-[#E6DFC6] dark:border-[#445644] text-center transition-colors cursor-pointer"
            >
              <span className="block text-xs font-bold text-[#22291F] dark:text-[#FAF7F2]">Doctor</span>
              <span className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] font-medium">Dr. Patel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('patient.maya@example.com');
                setPassword('Patient@123');
                setError('');
              }}
              className="px-2 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#2D6A4F]/10 dark:bg-[#242C24] dark:hover:bg-[#357A5B]/20 border border-[#E6DFC6] dark:border-[#445644] text-center transition-colors cursor-pointer"
            >
              <span className="block text-xs font-bold text-[#22291F] dark:text-[#FAF7F2]">Patient</span>
              <span className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] font-medium">Maya Sharma</span>
            </button>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#C97B4A]/10 dark:bg-[#E58A54]/10 border border-[#C97B4A]/30 dark:border-[#E58A54]/30 rounded-xl text-xs font-medium text-[#B35F2B] dark:text-[#E58A54]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@communityclinic.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-[#2D6A4F] hover:bg-[#245740] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E6DFC6] dark:border-[#2F3B2F] text-center">
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-[#2D6A4F] dark:text-[#52B788] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
