import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, role } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to the right dashboard based on their role
    if (role === 'patient') return <Navigate to="/patient" replace />;
    if (role === 'doctor') return <Navigate to="/doctor" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
