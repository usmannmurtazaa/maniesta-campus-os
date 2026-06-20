import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ---------------------------------------------------------------------------
// RequireAuth – ensures the user is authenticated.
// Shows an accessible loading spinner while the auth state is being determined.
// ---------------------------------------------------------------------------
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ---------------------------------------------------------------------------
// RequireOrg – ensures the authenticated user has an organisation (orgId).
// If the user hasn’t joined an organisation, they are redirected to
// the onboarding page where they can create or join one.
// ---------------------------------------------------------------------------
export function RequireOrg({ children }) {
  const { user } = useAuth();

  if (!user || !user.orgId) {
    // User is authenticated but not yet associated with an org
    return <Navigate to="/org-setup" replace />;
  }

  // Validate that the orgId in the URL matches the user's orgId
  // to prevent one user from viewing another org's routes by guessing the URL.
  const params = useParams();
  const urlOrgId = params.orgId;

  if (urlOrgId && urlOrgId !== user.orgId) {
    // User is attempting to access a different org’s route
    return <Navigate to={`/${user.orgId}/dashboard`} replace />;
  }

  return children;
}

// ---------------------------------------------------------------------------
// RequireRole – restricts access to users with specific roles.
//   allowedRoles : array of role strings (e.g. ['admin','teacher'])
//   fallbackPath : optional path to redirect if the user lacks permissions
//                  defaults to the current org’s dashboard or /login if orgId missing.
// ---------------------------------------------------------------------------
export function RequireRole({ children, allowedRoles = [], fallbackPath }) {
  const { user } = useAuth();

  if (!user) {
    // Should normally be wrapped by RequireAuth, but handle gracefully
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