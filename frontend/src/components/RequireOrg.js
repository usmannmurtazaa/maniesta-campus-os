import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireOrg({ children }) {
  // Hooks must be called unconditionally, at the top of the component,
  // before any early returns. Both hooks run on every render regardless
  // of whether the user is authenticated.
  const { user } = useAuth();
  const params = useParams();
  const urlOrgId = params.orgId;

  if (!user || !user.orgId) {
    return <Navigate to="/org-setup" replace />;
  }

  if (urlOrgId && urlOrgId !== user.orgId) {
    return <Navigate to={`/${user.orgId}/dashboard`} replace />;
  }

  return children;
}