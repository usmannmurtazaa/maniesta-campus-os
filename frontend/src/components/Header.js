import React from 'react';
import { FaBars, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

/**
 * Header – displays the current user’s info and a logout action.
 * The `orgId` prop is available for future organisation‑aware features
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
        <header className="h-16 bg-white border-b border-neutral-200 shadow-sm shadow-neutral-200/20 px-4 sm:px-6 flex items-center justify-between">
            {/* Sidebar toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition"
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                <FaBars className="text-lg" />
            </button>

            {/* User section */}
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-800 leading-tight">{displayName}</span>
                        <span className="text-xs text-neutral-400 capitalize">{role}</span>
                    </div>
                </div>

                <div className="w-px h-6 bg-neutral-200 hidden sm:block" />

                <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition"
                    title="Sign out"
                    aria-label="Sign out"
                >
                    <FaSignOutAlt className="text-lg" />
                </button>
            </div>
        </header>
    );
};

export default Header;