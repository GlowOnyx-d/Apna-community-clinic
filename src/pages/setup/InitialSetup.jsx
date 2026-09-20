import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake,
  ShieldCheck,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function InitialSetup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { createInitialAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await createInitialAdmin({ name, email, password });
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Failed to initialize clinic administrator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-[#FAF7F2] dark:bg-[#151915]">
      <div className="w-full max-w-lg">

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2D6A4F]/15 dark:bg-[#357A5B]/20 border border-[#2D6A4F]/30 dark:border-[#52B788]/30 text-[#2D6A4F] dark:text-[#52B788] shadow-sm mb-4">
            <HeartHandshake className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C97B4A]/15 border border-[#C97B4A]/30 dark:border-[#E58A54]/30 dark:bg-[#E58A54]/15 text-[#B35F2B] dark:text-[#E58A54] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clinic Setup Mode • Database Currently Empty</span>
          </div>

          <h1 className="text-3xl font-extrabold text-[#22291F] dark:text-[#FAF7F2] tracking-tight font-heading">
            Register Master Administrator
          </h1>
          <p className="text-sm text-[#6B6B63] dark:text-[#C4CFC3] mt-1 max-w-sm mx-auto">
            Initialize your secure clinic workspace on Cloud Firestore. Create the primary clinic administrator account below to activate the system.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1C221C] rounded-3xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 p-3.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] rounded-2xl mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#22291F] dark:text-[#FAF7F2]">You Are Registering the Primary Admin</p>
              <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3]">
                This account will manage specialist doctors, configure queues, and oversee clinic operations. Once registered, doctors and patients can sign in.
              </p>
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
                Administrator Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                Admin Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@communityclinic.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Password * (8+ chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-[#2D6A4F] hover:bg-[#245740] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Creating Administrator...' : 'Register Master Administrator & Open Admin Hub'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
