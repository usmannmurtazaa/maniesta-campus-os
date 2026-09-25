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
    {
      path: '/dashboard',
      icon: <FaHome />,
      label: 'Dashboard',
      roles: ['admin', 'teacher', 'student'],
    },
    {
      path: '/students',
      icon: <FaUsers />,
      label: 'Students',
      roles: ['admin', 'teacher'],
    },
    { path: '/courses', icon: <FaBook />, label: 'Courses', roles: ['admin'] },
    {
      path: '/attendance',
      icon: <FaCalendarCheck />,
      label: 'Attendance',
      roles: ['admin', 'teacher'],
    },
    {
      path: '/marks',
      icon: <FaChartBar />,
      label: 'Marks',
      roles: ['admin', 'teacher'],
    },
    { path: '/admin', icon: <FaCog />, label: 'Admin', roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(item => !item.roles || item.roles.includes(role));

  // Shared brand mark — used in both desktop and mobile sidebars.
  const BrandMark = () => (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary text-white font-bold text-sm ring-1 ring-primary-500/20 shadow-sm flex-shrink-0">
      M
    </span>
  );

  // Desktop sidebar (static, width transition)
  const desktopSidebar = (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } hidden md:flex bg-surface border-r border-border shadow-card transition-all duration-300 flex-col`}
      aria-label="Main navigation"
    >
      {/* Branding */}
      <div className="h-16 flex items-center border-b border-border px-4 gap-3">
        <BrandMark />
        {sidebarOpen && (
          <h1 className="font-semibold text-content-primary text-sm tracking-tight truncate">
            Maniesta Campus
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 overflow-y-auto" aria-label="Primary">
        {sidebarOpen && (
          <p className="px-3 mb-2 text-2xs font-semibold uppercase tracking-widest text-content-muted">
            Menu
          </p>
        )}
        <div className="space-y-1.5">
          {visibleItems.map(item => (
            <NavLink
              key={item.path}
              to={`/${orgId}${item.path}`}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link relative ${isActive ? 'active' : ''} ${
                  sidebarOpen ? 'justify-start' : 'justify-center'
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-white/70"
                    />
                  )}
                  <span className="text-lg" aria-hidden="true">
                    {item.icon}
                  </span>
                  {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={logout}
          className={`sidebar-link w-full ${
            sidebarOpen ? 'justify-start' : 'justify-center'
          } text-content-muted hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2`}
          aria-label="Sign out"
        >
          <span className="text-lg" aria-hidden="true">
            <FaSignOutAlt />
          </span>
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
          className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-2xl flex flex-col border-r border-border"
          variants={sidebarVariants}
          initial="closed"
          animate="open"
          exit="closed"
          aria-label="Main navigation"
        >
          {/* Header with close */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-border">
            <div className="flex items-center gap-3">
              <BrandMark />
              <h1 className="font-semibold text-content-primary text-sm tracking-tight">
                Maniesta Campus
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-content-muted hover:bg-surface-muted hover:text-content-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              aria-label="Close sidebar"
            >
              <FaTimes className="text-lg" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-5 px-4 overflow-y-auto" aria-label="Primary">
            <p className="px-3 mb-2 text-2xs font-semibold uppercase tracking-widest text-content-muted">
              Menu
            </p>
            <div className="space-y-1.5">
              {visibleItems.map(item => (
                <NavLink
                  key={item.path}
                  to={`/${orgId}${item.path}`}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-link relative justify-start ${
                      isActive ? 'active' : ''
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-white/70"
                        />
                      )}
                      <span className="text-lg" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Logout */}
          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={logout}
              className="sidebar-link w-full justify-start text-content-muted hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2"
              aria-label="Sign out"
            >
              <span className="text-lg" aria-hidden="true">
                <FaSignOutAlt />
              </span>
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
