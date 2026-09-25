import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HeartHandshake,
  Stethoscope,
  Calendar,
  FileText,
  Megaphone,
  BarChart3,
  LogOut,
  Menu,
  X,
  Users,
  Sun,
  Moon,
  Tv,
  QrCode,
  Cloud
} from 'lucide-react';
import MobileQrModal from './MobileQrModal';
import ConfirmModal from './ConfirmModal';

export default function Navbar() {
  const {
    currentUser,
    userProfile,
    role,
    logout
  } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Dynamic Navigation Links based on role
  const getNavLinks = () => {
    if (!currentUser) {
      return [
        { name: 'Community Camps', path: '/announcements', icon: Megaphone }
      ];
    }
    if (role === 'patient') {
      return [
        { name: 'Dashboard', path: '/patient', icon: Calendar },
        { name: 'My Appointments', path: '/patient/appointments', icon: FileText },
        { name: 'Health Camps & SDG', path: '/patient/announcements', icon: Megaphone }
      ];
    }
    if (role === 'doctor') {
      return [
        { name: 'Today\'s Queue', path: '/doctor', icon: Stethoscope },
        { name: 'Patient History', path: '/doctor/patients', icon: Users }
      ];
    }
    if (role === 'admin') {
      return [
        { name: 'Admin Hub', path: '/admin', icon: BarChart3 },
        { name: 'Doctor Slots', path: '/admin/doctors', icon: Stethoscope },
        { name: 'Master Appointments', path: '/admin/appointments', icon: Calendar },
        { name: 'SDG Announcements', path: '/admin/announcements', icon: Megaphone }
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  const roleColors = {
    patient: 'bg-[#2D6A4F]/10 text-[#2D6A4F] border-[#2D6A4F]/25 dark:bg-[#2D6A4F]/20 dark:text-[#52B788] dark:border-[#2D6A4F]/30',
    doctor: 'bg-[#2D6A4F]/15 text-[#2D6A4F] border-[#2D6A4F]/30 dark:bg-[#2D6A4F]/25 dark:text-[#52B788] dark:border-[#2D6A4F]/40',
    admin: 'bg-[#C97B4A]/12 text-[#B35F2B] border-[#C97B4A]/25 dark:bg-[#E58A54]/20 dark:text-[#E58A54] dark:border-[#E58A54]/40'
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F1]/85 dark:bg-[#131713]/90 backdrop-blur-md border-b border-[#E6DFC6] dark:border-[#2F3B2F] transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">

          {/* Left: Logo + Brand Block pinned firmly to far left edge */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] flex items-center justify-center text-[#FAF7F2] shadow-sm group-hover:bg-[#23543E] transition-colors">
                <HeartHandshake className="w-5 h-5 text-[#FAF7F2]" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-[#22291F] dark:text-[#FAF7F2] block leading-tight font-heading">
                  Apna Clinic
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C97B4A] dark:bg-[#E58A54]"></span>
                  <span className="text-[10px] font-semibold text-[#6B6B63] dark:text-[#C4CFC3] tracking-wider uppercase">
                    Community Health
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links grouped together */}
          <nav className="hidden md:flex items-center justify-center gap-1.5 lg:gap-2 flex-1 px-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-xl text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${isActive
                    ? 'bg-[#2D6A4F]/10 text-[#2D6A4F] font-semibold border border-[#2D6A4F]/20 dark:bg-[#2D6A4F]/20 dark:text-[#52B788] dark:border-[#2D6A4F]/40'
                    : 'text-[#6B6B63] hover:text-[#22291F] hover:bg-[#2D6A4F]/5 dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] dark:hover:bg-[#2D6A4F]/10'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2D6A4F] dark:text-[#52B788]' : 'text-[#6B6B63] dark:text-[#94A493]'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Cluster pinned firmly to far right edge */}
          <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0 justify-end ml-auto">
            {/* Live OPD TV Waiting Hall Board Link */}
            <Link
              to="/display"
              target="_blank"
              rel="noopener noreferrer"
              title="Open OPD Live TV Waiting Hall Call Board"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#2D6A4F]/25 bg-[#2D6A4F]/10 dark:border-[#52B788]/30 dark:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#2D6A4F]/15 text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse"></span>
              <Tv className="w-3.5 h-3.5" />
              <span>OPD TV</span>
            </Link>

            {/* Cloud Firestore Status Badge */}
            <div
              title="Connected to Cloud Firestore (Real-time Live Sync Active)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#2D6A4F]/20 dark:border-[#52B788]/20 bg-[#2D6A4F]/5 dark:bg-[#2D6A4F]/10 text-xs font-medium text-[#2D6A4F] dark:text-[#52B788] transition-colors whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse"></span>
              <Cloud className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
              <span className="text-[11px] hidden xl:inline font-semibold">
                Cloud Sync
              </span>
            </div>

            {/* QR Code Quick Scan Button */}
            <button
              onClick={() => setShowQrModal(true)}
              title="Scan QR to open clinic portal on mobile"
              className="p-2 rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F] text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#2D6A4F] dark:hover:text-[#52B788] hover:bg-[#2D6A4F]/8 dark:hover:bg-[#2D6A4F]/20 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Warm Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle visual theme"
              className="p-2 rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F] text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#2D6A4F] dark:hover:text-[#FAF7F2] hover:bg-[#2D6A4F]/8 dark:hover:bg-[#2D6A4F]/20 transition-all cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#E58A54]" /> : <Moon className="w-4 h-4 text-[#2D6A4F]" />}
            </button>

            {/* User Profile / Logout or Sign In / Register */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E6DFC6] dark:border-[#2F3B2F]">
                <span className="text-xs font-medium text-[#6B6B63] dark:text-[#C4CFC3] max-w-[140px] truncate" title={userProfile?.name || currentUser.email}>
                  {userProfile?.name || currentUser.email}
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border uppercase tracking-wider shrink-0 ${roleColors[role] || 'bg-[#2D6A4F]/10 text-[#2D6A4F]'}`}>
                  {role}
                </span>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Sign out"
                  className="p-2 text-[#6B6B63] hover:text-[#C97B4A] hover:bg-[#C97B4A]/10 rounded-xl transition-colors dark:text-[#94A493] dark:hover:text-[#FAF7F2] cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : !isAuthPage ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E6DFC6] dark:border-[#2F3B2F]">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#2D6A4F] hover:bg-[#2D6A4F]/10 rounded-xl transition-colors dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-[#FAF7F2] bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#40916C] rounded-xl shadow-xs transition-colors whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile Actions (Theme Toggle + Hamburger) */}
          <div className="flex items-center gap-2 md:hidden shrink-0">
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Warm Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F] text-[#6B6B63] dark:text-[#C4CFC3] hover:bg-[#2D6A4F]/10 cursor-pointer shadow-2xs"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#E58A54]" /> : <Moon className="w-4 h-4 text-[#2D6A4F]" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] rounded-xl hover:bg-[#2D6A4F]/10 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#FAF7F2] dark:bg-[#151915] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          
          {/* Cloud Firestore status inside mobile drawer */}
          <div
            className="w-full flex items-center justify-between p-3 rounded-xl border border-[#2D6A4F]/20 dark:border-[#52B788]/20 bg-[#2D6A4F]/5 dark:bg-[#2D6A4F]/15 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788]"
          >
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
              <span>Database:</span>
              <span className="font-semibold text-[#22291F] dark:text-[#FAF7F2]">
                Cloud Firestore (Live)
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse"></span>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                    ? 'bg-[#2D6A4F]/10 text-[#2D6A4F] font-semibold dark:bg-[#2D6A4F]/20 dark:text-[#52B788]'
                    : 'text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2]'
                    }`}
                >
                  <Icon className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                  {link.name}
                </Link>
              );
            })}

            {/* Mobile OPD TV Link */}
            <Link
              to="/display"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl border border-[#2D6A4F]/25 bg-[#2D6A4F]/10 dark:border-[#52B788]/30 dark:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] font-bold text-sm"
            >
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4" />
                <span>Live OPD TV Call Board</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse"></span>
            </Link>
          </div>

          {currentUser ? (
            <div className="pt-3 border-t border-[#E6DFC6] dark:border-[#2F3B2F] space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-[#6B6B63] dark:text-[#C4CFC3]">
                  {userProfile?.name || currentUser.email}
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border uppercase tracking-wider ${roleColors[role] || 'bg-[#2D6A4F]/10 text-[#2D6A4F]'}`}>
                  {role}
                </span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 text-sm font-semibold text-[#A85222] dark:text-[#E58A54] bg-[#A85222]/10 dark:bg-[#E58A54]/15 border border-[#A85222]/20 dark:border-[#E58A54]/30 rounded-xl cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : !isAuthPage ? (
            <div className="flex gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-sm font-semibold text-[#2D6A4F] dark:text-[#C4CFC3] bg-[#F0EBE1] dark:bg-[#1C221C] rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-sm font-semibold text-[#FAF7F2] bg-[#2D6A4F] dark:bg-[#357A5B] rounded-xl"
              >
                Register
              </Link>
            </div>
          ) : null}
        </div>
      )}

      {/* Robust, Viewport-Centered Mobile QR Modal */}
      <MobileQrModal 
        isOpen={showQrModal} 
        onClose={() => setShowQrModal(false)} 
      />

      {/* Viewport-Centered Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out of Apna Community Clinic? You will need to sign in again to access your dashboard."
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        type="logout"
        loading={isLoggingOut}
      />
    </header>
  );
}

