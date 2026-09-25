import React from 'react';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

/**
 * Header – displays the current user's info and a logout action.
 * The `orgId` prop is available for future organisation-aware features
 * (e.g., org name, quick switch) but is not required for rendering.
 */
const Header = ({ sidebarOpen, setSidebarOpen, orgId }) => {
  const { user, logout } = useAuth();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const role = user?.role || 'unknown';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border shadow-card px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Sidebar toggle */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg text-content-secondary hover:bg-surface-muted hover:text-content-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={sidebarOpen}
      >
        <FaBars className="text-lg" aria-hidden="true" />
      </button>

      {/* User section */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center font-semibold text-sm ring-1 ring-primary-500/20 shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-content-primary">{displayName}</span>
            <span className="text-xs text-content-muted uppercase tracking-wider font-medium">
              {role}
            </span>
          </div>
        </div>

        <div className="w-px h-6 bg-border hidden sm:block" aria-hidden="true" />

        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg text-content-muted hover:text-danger-600 hover:bg-danger-50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2"
          title="Sign out"
          aria-label="Sign out"
        >
          <FaSignOutAlt className="text-lg" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

export default Header;
