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
  Languages,
  Pill
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
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
  const { language, toggleLanguage, t } = useLanguage();
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
        { name: t('navAnnouncements', 'Community Camps'), path: '/announcements', icon: Megaphone }
      ];
    }
    if (role === 'patient') {
      return [
        { name: t('navDashboard', 'Dashboard'), path: '/patient', icon: Calendar },
        { name: t('navMyAppointments', 'My Appointments'), path: '/patient/appointments', icon: FileText },
        { name: t('navHealthCamps', 'Health Camps & SDG'), path: '/patient/announcements', icon: Megaphone }
      ];
    }
    if (role === 'doctor') {
      return [
        { name: t('navDoctorQueue', "Today's Queue"), path: '/doctor', icon: Stethoscope },
        { name: t('navPatientHistory', 'Patient History'), path: '/doctor/patients', icon: Users },
        { name: 'Pharmacy Desk', path: '/pharmacy', icon: Pill },
        { name: t('navHealthCamps', 'Health Camps & SDG'), path: '/announcements', icon: Megaphone }
      ];
    }
    if (role === 'admin') {
      return [
        { name: t('navAdminHub', 'Admin Hub'), path: '/admin', icon: BarChart3 },
        { name: 'Pharmacy', path: '/pharmacy', icon: Pill },
        { name: t('navDoctorSlots', 'Doctors'), path: '/admin/doctors', icon: Stethoscope },
        { name: t('navMasterAppointments', 'Ledger'), path: '/admin/appointments', icon: Calendar },
        { name: t('navAnnouncements', 'Camps'), path: '/admin/announcements', icon: Megaphone }
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  const roleColors = {
    patient: 'bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/25 dark:bg-[#0F766E]/20 dark:text-[#2DD4BF] dark:border-[#0F766E]/30',
    doctor: 'bg-[#0F766E]/15 text-[#0F766E] border-[#0F766E]/30 dark:bg-[#0F766E]/25 dark:text-[#2DD4BF] dark:border-[#0F766E]/40',
    admin: 'bg-[#F97316]/12 text-[#EA580C] border-[#F97316]/25 dark:bg-[#FB923C]/20 dark:text-[#FB923C] dark:border-[#FB923C]/40'
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F4F7F6]/85 dark:bg-[#0B1114]/90 backdrop-blur-md border-b border-[#E0E7E5] dark:border-[#21333A] transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">

          {/* Left: Logo + Brand Block pinned firmly to far left edge */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-[#0F766E] flex items-center justify-center text-[#F4F7F6] shadow-sm group-hover:bg-[#115E59] transition-colors">
                <HeartHandshake className="w-5 h-5 text-[#F4F7F6]" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-[#132226] dark:text-[#F4F7F6] block leading-tight font-heading">
                  {t('clinicTitle', 'Apna Clinic')}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] dark:bg-[#FB923C]"></span>
                  <span className="text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] tracking-wider uppercase">
                    {t('tagline', 'Community Health')}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links grouped together */}
          <nav className="hidden xl:flex items-center justify-center gap-1.5 2xl:gap-2 flex-1 px-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-xl text-xs lg:text-sm transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0F766E]/10 dark:bg-[#0D9488]/15 text-[#0F766E] dark:text-[#2DD4BF] font-semibold'
                      : 'text-[#5A7178] hover:text-[#132226] hover:bg-[#0F766E]/5 dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] dark:hover:bg-[#0F766E]/10 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F766E] dark:text-[#2DD4BF]' : 'text-[#5A7178] dark:text-[#79949B]'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Compact Right-Side Group with icons only & tooltips */}
          <div className="hidden xl:flex items-center gap-1 shrink-0 justify-end ml-auto">
            {/* Live OPD TV Waiting Hall Board Link - Icon only */}
            <Link
              to="/display"
              target="_blank"
              rel="noopener noreferrer"
              title="OPD Live TV Waiting Hall Call Board"
              className="p-2 rounded-xl text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] hover:bg-[#0F766E]/8 dark:hover:bg-[#0F766E]/20 transition-all cursor-pointer relative"
            >
              <Tv className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF] animate-pulse" />
            </Link>

            {/* Cloud Firestore Status Badge - Small colored dot with tooltip */}
            <div
              title="Cloud Firestore Live Sync Active"
              className="p-2 flex items-center justify-center cursor-default"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* QR Code Quick Scan Button - Icon only */}
            <button
              onClick={() => setShowQrModal(true)}
              title="Scan QR to open clinic portal on mobile"
              className="p-2 rounded-xl text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] hover:bg-[#0F766E]/8 dark:hover:bg-[#0F766E]/20 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Language Switcher Button - Icon only */}
            <button
              onClick={toggleLanguage}
              title={language === 'en' ? "हिंदी में बदलें (Switch to Hindi)" : "Switch to English"}
              className="p-2 rounded-xl text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] hover:bg-[#0F766E]/8 dark:hover:bg-[#0F766E]/20 transition-all cursor-pointer"
            >
              <Languages className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button - Icon only */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Warm Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle visual theme"
              className="p-2 rounded-xl text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#F4F7F6] hover:bg-[#0F766E]/8 dark:hover:bg-[#0F766E]/20 transition-all cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#FB923C]" /> : <Moon className="w-4 h-4 text-[#0F766E]" />}
            </button>

            {/* User Profile / Logout or Sign In / Register */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-[#E0E7E5] dark:border-[#21333A]">
                <span className="text-xs font-medium text-[#5A7178] dark:text-[#9DB4BA] max-w-[140px] truncate" title={userProfile?.name || currentUser.email}>
                  {userProfile?.name || currentUser.email}
                </span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md border uppercase tracking-wider shrink-0 ${roleColors[role] || 'bg-[#0F766E]/10 text-[#0F766E]'}`}>
                  {role}
                </span>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title={t('logout', 'Sign Out')}
                  className="p-2 text-[#5A7178] hover:text-[#F97316] hover:bg-[#F97316]/10 rounded-xl transition-colors dark:text-[#79949B] dark:hover:text-[#F4F7F6] cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : !isAuthPage ? (
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-[#E0E7E5] dark:border-[#21333A]">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-[#0F766E]/10 rounded-xl transition-colors dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] whitespace-nowrap"
                >
                  {t('login', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-[#F4F7F6] bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#14B8A6] rounded-xl shadow-xs transition-colors whitespace-nowrap"
                >
                  {t('register', 'Register')}
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile Actions (Language + Theme Toggle + Hamburger) */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:hidden shrink-0">
            {/* Compact OPD TV Link on tablet/mobile header */}
            <Link
              to="/display"
              target="_blank"
              rel="noopener noreferrer"
              title="Open OPD Live TV Waiting Hall Call Board"
              className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[#0F766E]/25 bg-[#0F766E]/10 dark:border-[#2DD4BF]/30 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#2DD4BF] text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF] animate-pulse"></span>
              <Tv className="w-3.5 h-3.5" />
              <span>TV</span>
            </Link>

            <button
              onClick={toggleLanguage}
              title="Toggle Language"
              className="p-2 rounded-xl border border-[#E0E7E5] dark:border-[#21333A] text-[#0F766E] dark:text-[#2DD4BF] text-xs font-bold hover:bg-[#0F766E]/10 cursor-pointer"
            >
              {language === 'en' ? 'हिं' : 'EN'}
            </button>
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Warm Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl border border-[#E0E7E5] dark:border-[#21333A] text-[#5A7178] dark:text-[#9DB4BA] hover:bg-[#0F766E]/10 cursor-pointer shadow-2xs"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#FB923C]" /> : <Moon className="w-4 h-4 text-[#0F766E]" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] rounded-xl hover:bg-[#0F766E]/10 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#E0E7E5] dark:border-[#21333A] bg-[#F4F7F6] dark:bg-[#0B1114] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          
          {/* Cloud Firestore status inside mobile drawer */}
          <div
            className="w-full flex items-center justify-between p-3 rounded-xl border border-[#0F766E]/20 dark:border-[#2DD4BF]/20 bg-[#0F766E]/5 dark:bg-[#0F766E]/15 text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF]"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{language === 'hi' ? 'डेटाबेस:' : 'Database:'}</span>
              <span className="font-semibold text-[#132226] dark:text-[#F4F7F6]">
                {t('navCloudSync', 'Cloud Sync (Live)')}
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF] animate-pulse"></span>
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
                    ? 'bg-[#0F766E]/10 text-[#0F766E] font-semibold dark:bg-[#0F766E]/20 dark:text-[#2DD4BF]'
                    : 'text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6]'
                    }`}
                >
                  <Icon className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
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
              className="flex items-center justify-between p-3 rounded-xl border border-[#0F766E]/25 bg-[#0F766E]/10 dark:border-[#2DD4BF]/30 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#2DD4BF] font-bold text-sm"
            >
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4" />
                <span>{t('navLiveDisplay', 'Live OPD TV Call Board')}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF] animate-pulse"></span>
            </Link>
          </div>

          {currentUser ? (
            <div className="pt-3 border-t border-[#E0E7E5] dark:border-[#21333A] space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-[#5A7178] dark:text-[#9DB4BA]">
                  {userProfile?.name || currentUser.email}
                </span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md border uppercase tracking-wider ${roleColors[role] || 'bg-[#0F766E]/10 text-[#0F766E]'}`}>
                  {role}
                </span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 text-sm font-semibold text-[#EA580C] dark:text-[#FB923C] bg-[#EA580C]/10 dark:bg-[#FB923C]/15 border border-[#EA580C]/20 dark:border-[#FB923C]/30 rounded-xl cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {t('logout', 'Sign Out')}
              </button>
            </div>
          ) : !isAuthPage ? (
            <div className="flex gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-sm font-semibold text-[#0F766E] dark:text-[#9DB4BA] bg-[#E8F0EE] dark:bg-[#121C21] rounded-xl border border-[#E0E7E5] dark:border-[#21333A]"
              >
                {t('login', 'Sign In')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-sm font-semibold text-[#F4F7F6] bg-[#0F766E] dark:bg-[#0D9488] rounded-xl"
              >
                {t('register', 'Register')}
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
