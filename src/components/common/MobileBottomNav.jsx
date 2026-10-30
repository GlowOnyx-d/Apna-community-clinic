import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Home, 
  Ticket, 
  Stethoscope, 
  Tv, 
  User,
  ShieldCheck
} from 'lucide-react';

export default function MobileBottomNav() {
  const { currentUser, role } = useAuth();
  const { appointments } = useData();
  const { t } = useLanguage();
  const location = useLocation();

  // If on TV display mode, don't show the bottom nav
  if (location.pathname === '/display') {
    return null;
  }

  // Check if active patient has a pending token
  const hasActiveToken = currentUser && role === 'patient' && appointments.some(
    a => (a.patientId === currentUser.uid || a.patientEmail === currentUser.email) && a.status === 'pending'
  );

  const getPortalPath = () => {
    if (!currentUser) return '/login';
    if (role === 'admin') return '/admin';
    if (role === 'doctor') return '/doctor';
    return '/patient';
  };

  const getPortalLabel = () => {
    if (!currentUser) return t('signIn', 'Sign In');
    if (role === 'admin') return 'Admin';
    if (role === 'doctor') return 'Doctor';
    return t('myPortal', 'Portal');
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0B1114]/95 backdrop-blur-xl border-t border-[#E0E7E5] dark:border-[#21333A] shadow-[0_-8px_25px_rgba(0,0,0,0.06)] px-3 py-1.5 transition-colors duration-200"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* 1. Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => `
            flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative
            ${isActive 
              ? 'text-[#0F766E] dark:text-[#2DD4BF] font-bold' 
              : 'text-[#5A7178] dark:text-[#79949B] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
            }
          `}
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Home className="w-5 h-5 transition-transform duration-200" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF]" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{t('home', 'Home')}</span>
            </>
          )}
        </NavLink>

        {/* 2. Token / Queue */}
        <NavLink
          to={role === 'doctor' ? '/doctor' : (role === 'admin' ? '/admin/appointments' : '/patient')}
          className={({ isActive }) => `
            flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative
            ${isActive 
              ? 'text-[#0F766E] dark:text-[#2DD4BF] font-bold' 
              : 'text-[#5A7178] dark:text-[#79949B] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
            }
          `}
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Ticket className="w-5 h-5 transition-transform duration-200" />
                {hasActiveToken && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F97316] dark:bg-[#FB923C] ring-2 ring-white dark:ring-[#0B1114] animate-pulse" />
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF]" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">
                {role === 'doctor' ? 'Queue' : t('myToken', 'Token')}
              </span>
            </>
          )}
        </NavLink>

        {/* 3. Specialists */}
        <NavLink
          to="/patient"
          className={({ isActive }) => `
            flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative
            ${isActive && location.hash === '#specialists'
              ? 'text-[#0F766E] dark:text-[#2DD4BF] font-bold' 
              : 'text-[#5A7178] dark:text-[#79949B] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
            }
          `}
        >
          <div className="relative">
            <Stethoscope className="w-5 h-5 transition-transform duration-200" />
          </div>
          <span className="text-[10px] mt-1 font-medium">{t('doctors', 'Doctors')}</span>
        </NavLink>

        {/* 4. OPD TV Live Kiosk */}
        <NavLink
          to="/display"
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all text-[#5A7178] dark:text-[#79949B] hover:text-[#0F766E] dark:hover:text-[#2DD4BF]"
        >
          <div className="relative">
            <Tv className="w-5 h-5 transition-transform duration-200" />
          </div>
          <span className="text-[10px] mt-1 font-medium">OPD TV</span>
        </NavLink>

        {/* 5. Portal / Profile */}
        <NavLink
          to={getPortalPath()}
          className={({ isActive }) => `
            flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative
            ${isActive 
              ? 'text-[#0F766E] dark:text-[#2DD4BF] font-bold' 
              : 'text-[#5A7178] dark:text-[#79949B] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
            }
          `}
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                {role === 'admin' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF]" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium truncate max-w-[50px]">
                {getPortalLabel()}
              </span>
            </>
          )}
        </NavLink>

      </div>
    </nav>
  );
}
