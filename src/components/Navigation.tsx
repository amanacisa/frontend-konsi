import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Newspaper, FileText, Menu, X, LogOut, Shield, User, Home,Users, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

   const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/chat', label: 'LexTalk', icon: MessageCircle },
    { path: '/news', label: 'Berita', icon: Newspaper },
    { path: '/report', label: 'Lapor', icon: FileText },
    { path: '/forum', label: 'Forum', icon: Users },
    { path: '/friends', label: 'Teman', icon: UserCircle },
  ];

  // Tambahkan dashboard untuk admin
  if (user?.role === 'admin') {
    navItems.push({ path: '/dashboard', label: 'Dashboard', icon: Shield });
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
return (
  <nav className="bg-white shadow-lg sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="flex justify-between items-center h-14 sm:h-16">
        {/* Logo */}
        <Link to="/chat" className="flex items-center space-x-2">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary-900 truncate">
            KONSI-TECH
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
          {/* Navigation Links */}
          <div className="flex space-x-4 xl:space-x-6">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
             
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-2 xl:px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 font-medium shadow-sm'
                        : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm xl:text-base whitespace-nowrap">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 px-2 xl:px-3 py-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 transition-all duration-300"
            >
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium hidden xl:block max-w-24 truncate">
                {user?.name || 'User'}
              </span>
              {user?.role === 'admin' && (
                <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full whitespace-nowrap">
                  Admin
                </span>
              )}
            </motion.button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
              >
                <div className="px-4 py-2 border-b border-neutral-200">
                  <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                </div>
                
                <motion.button
                  whileHover={{ backgroundColor: 'rgb(249 250 251)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Tablet Navigation (md to lg) */}
        <div className="hidden md:flex lg:hidden items-center space-x-3">
          <div className="flex items-center space-x-2">
            {navItems.slice(0, 3).map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
             
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 shadow-sm'
                        : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-1 px-2 py-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 transition-all duration-300"
            >
              <User className="w-5 h-5" />
              {user?.role === 'admin' && (
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              )}
            </motion.button>

            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
              >
                <div className="px-4 py-2 border-b border-neutral-200">
                  <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-neutral-600 hover:text-primary-600 p-2 rounded-lg hover:bg-neutral-50 transition-all duration-300"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </motion.button>
        </div>
      </div>
    </div>

    {/* Mobile Navigation */}
    <motion.div
      initial={false}
      animate={{
        opacity: isMenuOpen ? 1 : 0,
        height: isMenuOpen ? 'auto' : 0,
        paddingTop: isMenuOpen ? '0.5rem' : 0,
        paddingBottom: isMenuOpen ? '0.75rem' : 0
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="md:hidden bg-white border-t border-neutral-200 overflow-hidden"
    >
      <div className="px-3 space-y-1">
        {/* Mobile Navigation Links */}
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
         
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : -20 }}
              transition={{ delay: isMenuOpen ? index * 0.1 : 0, duration: 0.2 }}
            >
              <Link
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 font-medium shadow-sm'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}

        {/* Mobile User Info & Logout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isMenuOpen ? 1 : 0, y: isMenuOpen ? 0 : 10 }}
          transition={{ delay: isMenuOpen ? navItems.length * 0.1 : 0, duration: 0.2 }}
          className="border-t border-neutral-200 mt-2 pt-2"
        >
          <div className="px-3 py-2">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <span className="text-sm font-medium text-neutral-900 truncate flex-1">
                {user?.name}
              </span>
              {user?.role === 'admin' && (
                <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 ml-6 truncate">{user?.email}</p>
          </div>
          
          <motion.button
            whileHover={{ backgroundColor: 'rgb(254 242 242)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Keluar</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  </nav>
);
}