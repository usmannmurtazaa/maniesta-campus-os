import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrgProvider } from './context/OrgContext';

// Lazy‑loaded pages
const Login = lazy(() => import('./pages/Login'));
const OrgSetup = lazy(() => import('./pages/OrgSetup'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Courses = lazy(() => import('./pages/Courses'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Marks = lazy(() => import('./pages/Marks'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const RoleManagement = lazy(() => import('./pages/RoleManagement'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));

// Guards
import { RequireAuth } from './components/RequireAuth';
import { RequireOrg } from './components/RequireOrg';
import { RequireRole } from './components/RequireRole';

// Layouts
import OrgLayout from './layouts/OrgLayout';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// ------------------------------------------------------------------
// 1. ScrollToTop – resets scroll position on every navigation
// ------------------------------------------------------------------
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ------------------------------------------------------------------
// 2. PublicRoute – redirects authenticated users to their dashboard
// ------------------------------------------------------------------
function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user && user.orgId) {
    return <Navigate to={`/${user.orgId}/dashboard`} replace />;
  }
  return children;
}

// ------------------------------------------------------------------
// 3. PageLoader – premium spinner using the design system
// ------------------------------------------------------------------
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50">
    <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-200 border-t-primary-600" />
  </div>
);

// ------------------------------------------------------------------
// 4. Toast options – aligned with the premium design system
// ------------------------------------------------------------------
const toastOptions = {
  style: {
    background: '#ffffff',
    color: '#1a1a2e',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '0.75rem',
    border: '1px solid #e4e7ee',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
  },
  success: {
    iconTheme: {
      primary: '#059669',
      secondary: '#ecfdf5',
    },
  },
  error: {
    iconTheme: {
      primary: '#dc2626',
      secondary: '#fef2f2',
    },
  },
};

// ------------------------------------------------------------------
// 5. Future flags – suppress React Router v7 deprecation warnings
// ------------------------------------------------------------------
const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

// ------------------------------------------------------------------
// App
// ------------------------------------------------------------------
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={routerFuture}>
        <AuthProvider>
          <OrgProvider>
            <Toaster position="top-right" toastOptions={toastOptions} />
            <ScrollToTop />

            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public pages */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Org onboarding */}
                <Route
                  path="/org-setup"
                  element={
                    <RequireAuth>
                      <OrgSetup />
                    </RequireAuth>
                  }
                />

                {/* Org‑scoped portal */}
                <Route
                  path="/:orgId"
                  element={
                    <RequireAuth>
                      <RequireOrg>
                        <OrgLayout />
                      </RequireOrg>
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route
                    path="students"
                    element={
                      <RequireRole allowedRoles={['admin', 'teacher']}>
                        <Students />
                      </RequireRole>
                    }
                  />
                  <Route
                    path="courses"
                    element={
                      <RequireRole allowedRoles={['admin']}>
                        <Courses />
                      </RequireRole>
                    }
                  />
                  <Route
                    path="attendance"
                    element={
                      <RequireRole allowedRoles={['admin', 'teacher']}>
                        <Attendance />
                      </RequireRole>
                    }
                  />
                  <Route
                    path="marks"
                    element={
                      <RequireRole allowedRoles={['admin', 'teacher']}>
                        <Marks />
                      </RequireRole>
                    }
                  />
                  <Route path="admin" element={<Navigate to="settings" replace />} />
                  <Route
                    path="admin/settings"
                    element={
                      <RequireRole allowedRoles={['admin']}>
                        <AdminSettings />
                      </RequireRole>
                    }
                  />
                  <Route
                    path="admin/roles"
                    element={
                      <RequireRole allowedRoles={['admin']}>
                        <RoleManagement />
                      </RequireRole>
                    }
                  />
                  <Route
                    path="admin/audit-logs"
                    element={
                      <RequireRole allowedRoles={['admin']}>
                        <AuditLogs />
                      </RequireRole>
                    }
                  />
                </Route>

                {/* Catch‑all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>

            <Footer />
          </OrgProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;