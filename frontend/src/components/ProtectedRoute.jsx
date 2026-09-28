import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated, isOrganizer, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = (user.role || '').toUpperCase();
  const isPrivileged = userRole === 'ADMIN' || userRole === 'ORGANIZER' || isOrganizer || isAdmin;

  if (allowedRole) {
    const requiredRole = allowedRole.toUpperCase();

    if ((requiredRole === 'ADMIN' || requiredRole === 'ORGANIZER') && !isPrivileged) {
      // Participant tried accessing Admin route -> Redirect to user dashboard
      return <Navigate to="/dashboard" replace />;
    }

    if (requiredRole === 'PARTICIPANT' && isPrivileged) {
      // Admin tried accessing participant-only route
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
}
