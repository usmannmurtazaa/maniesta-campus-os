import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireOrg({ children }) {
  const { user } = useAuth();

  if (!user || !user.orgId) {
    return <Navigate to="/org-setup" replace />;
  }

  const params = useParams();
  const urlOrgId = params.orgId;

  if (urlOrgId && urlOrgId !== user.orgId) {
    return <Navigate to={`/${user.orgId}/dashboard`} replace />;
  }

  return children;
}