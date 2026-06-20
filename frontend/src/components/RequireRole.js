import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireRole({ children, allowedRoles = [], fallbackPath }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const redirectTo =
      fallbackPath ||
      (user.orgId ? `/${user.orgId}/dashboard` : '/login');
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}