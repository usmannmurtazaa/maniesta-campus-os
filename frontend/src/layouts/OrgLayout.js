import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// ------------------------------------------------------------------
// 1. Simple media‑query hook
// ------------------------------------------------------------------
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ------------------------------------------------------------------
// 2. Page transition animation variants
// ------------------------------------------------------------------
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ------------------------------------------------------------------
// 3. Layout component
// ------------------------------------------------------------------
const OrgLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Safety fallback – should never trigger because of guards
  if (!user || !user.orgId) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div
          className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-200 border-t-primary-600"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Mobile overlay backdrop */}
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

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          orgId={user.orgId}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          aria-label="Main content"
        >
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

export default OrgLayout;