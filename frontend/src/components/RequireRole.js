import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ---------------------------------------------------------------------------
// RequireRole – restricts access to users with specific roles.
//   allowedRoles : array of role strings (e.g. ['admin','teacher'])
//   fallbackPath : optional path to redirect if the user lacks permissions
//                  defaults to the current org's dashboard or /login if orgId missing.
// ---------------------------------------------------------------------------
export function RequireRole({ children, allowedRoles = [], fallbackPath }) {
  const { user } = useAuth();

  if (!user) {
    // Should normally be wrapped by RequireAuth, but handle gracefully
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const redirectTo = fallbackPath || (user.orgId ? `/${user.orgId}/dashboard` : '/login');
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
