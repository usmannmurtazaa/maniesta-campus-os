import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaUsers,
  FaBook,
  FaCalendarCheck,
  FaChartBar,
  FaSignOutAlt,
  FaCog,
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const sidebarVariants = {
  open: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  closed: {
    x: '-100%',
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, orgId, isMobile }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const navItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard', roles: ['admin', 'teacher', 'student'] },
    { path: '/students', icon: <FaUsers />, label: 'Students', roles: ['admin', 'teacher'] },
    { path: '/courses', icon: <FaBook />, label: 'Courses', roles: ['admin'] },
    { path: '/attendance', icon: <FaCalendarCheck />, label: 'Attendance', roles: ['admin', 'teacher'] },
    { path: '/marks', icon: <FaChartBar />, label: 'Marks', roles: ['admin', 'teacher'] },
    { path: '/admin', icon: <FaCog />, label: 'Admin', roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  // Desktop sidebar (static, width transition)
  const desktopSidebar = (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } hidden md:flex bg-white shadow-lg shadow-neutral-200/50 transition-all duration-300 flex-col border-r border-neutral-200`}
      aria-label="Main navigation"
    >
      {/* Branding */}
      <div className="h-16 flex items-center justify-center border-b border-neutral-100 px-4">
        <h1 className={`font-bold text-primary-700 truncate ${sidebarOpen ? 'text-lg' : 'text-xs'}`}>
          {sidebarOpen ? 'Maniesta Campus' : 'MCO'}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-3" aria-label="Primary">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={`/${orgId}${item.path}`}
            onClick={() => isMobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${sidebarOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <span className="text-lg" aria-hidden="true">{item.icon}</span>
            {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-neutral-100 p-3">
        <button
          onClick={logout}
          className={`sidebar-link w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} text-neutral-500 hover:text-danger-600`}
          aria-label="Sign out"
        >
          <span className="text-lg" aria-hidden="true"><FaSignOutAlt /></span>
          {sidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );

  // Mobile overlay sidebar (fixed, animated)
  const mobileSidebar = (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col border-r border-neutral-200"
          variants={sidebarVariants}
          initial="closed"
          animate="open"
          exit="closed"
          aria-label="Main navigation"
        >
          {/* Header with close */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-100">
            <h1 className="font-bold text-primary-700 text-lg">Maniesta Campus</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
              aria-label="Close sidebar"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 space-y-1 px-4" aria-label="Primary">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={`/${orgId}${item.path}`}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''} justify-start`
                }
              >
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                <span className="ml-3 text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-neutral-100 p-4">
            <button
              onClick={logout}
              className="sidebar-link w-full justify-start text-neutral-500 hover:text-danger-600"
              aria-label="Sign out"
            >
              <span className="text-lg" aria-hidden="true"><FaSignOutAlt /></span>
              <span className="ml-3 text-sm font-medium">Logout</span>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
};

export default Sidebar;