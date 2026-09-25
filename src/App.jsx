import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import HealthcareBackground from './components/common/HealthcareBackground';

import InitialSetup from './pages/setup/InitialSetup';
import LandingPage from './pages/LandingPage';

// Lazy-loaded routes for code splitting and fast initial bundle load
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const LiveQueueDisplay = lazy(() => import('./pages/display/LiveQueueDisplay'));

// Patient Pages
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const MyAppointments = lazy(() => import('./pages/patient/MyAppointments'));
const CommunityAnnouncements = lazy(() => import('./pages/patient/CommunityAnnouncements'));

// Doctor Pages
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const PatientRecords = lazy(() => import('./pages/doctor/PatientRecords'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const DoctorManagement = lazy(() => import('./pages/admin/DoctorManagement'));
const AppointmentsMaster = lazy(() => import('./pages/admin/AppointmentsMaster'));
const AnnouncementManager = lazy(() => import('./pages/admin/AnnouncementManager'));

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#2D6A4F] border-t-transparent animate-spin" />
      <span className="text-xs font-medium text-[#6B6B63] dark:text-[#C4CFC3]">Loading clinic portal...</span>
    </div>
  );
}

function AppRoutes() {
  const { needsSetup } = useAuth();
  const location = useLocation();
  const isDisplayMode = location.pathname === '/display';

  if (needsSetup) {
    return <InitialSetup />;
  }

  // Full-screen Waiting Room TV kiosk mode without standard website headers/footers
  if (isDisplayMode) {
    return (
      <div className="relative min-h-screen">
        <HealthcareBackground />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/display" element={<LiveQueueDisplay />} />
          </Routes>
          <Toast />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1] text-[#22291F] dark:bg-[#131713] dark:text-[#FAF7F2] font-sans selection:bg-[#2D6A4F] selection:text-[#FAF7F2] transition-colors duration-200 relative overflow-x-hidden">
      <HealthcareBackground />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/display" element={<LiveQueueDisplay />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/announcements" element={<CommunityAnnouncements />} />

            {/* Patient Portal Routes */}
            <Route 
              path="/patient" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/appointments" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <MyAppointments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/announcements" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <CommunityAnnouncements />
                </ProtectedRoute>
              } 
            />

            {/* Doctor Portal Routes */}
            <Route 
              path="/doctor" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor/patients" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <PatientRecords />
                </ProtectedRoute>
              } 
            />

            {/* Admin Portal Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/doctors" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DoctorManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/appointments" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppointmentsMaster />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/announcements" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AnnouncementManager />
                </ProtectedRoute>
              } 
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
