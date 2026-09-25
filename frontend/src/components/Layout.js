import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

// ------------------------------------------------------------------
// 1. Simple media-query hook
// ------------------------------------------------------------------
function useMediaQuery(query) {
  // Initial value is resolved synchronously so the first paint is
  // already correct (avoids a flash of "not mobile" on phone load).
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = e => setMatches(e.matches);
    setMatches(mql.matches);

    // Safari < 14 does not support addEventListener on MediaQueryList.
    // Fall back to the legacy addListener API for compatibility.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, [query]);

  return matches;
}

// ------------------------------------------------------------------
// 2. Page transition animation variants
// ------------------------------------------------------------------
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ------------------------------------------------------------------
// 3. Layout component
// ------------------------------------------------------------------
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Safety: guards haven't run yet
  if (!user || !user.orgId) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-subtle">
        <div
          className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-primary-600"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-subtle overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar
        orgId={user.orgId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header orgId={user.orgId} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" aria-label="Main content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
