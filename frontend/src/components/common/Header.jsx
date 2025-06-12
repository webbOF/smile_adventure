import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon,
  PowerIcon,
  BellIcon,
  CogIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Header = ({ 
  onToggleSidebar,
  showSidebarToggle = false,
  transparent = false,
  className = ''
}) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout effettuato con successo!');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Errore durante il logout');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Determine if we're in a dashboard context
  const isDashboard = location.pathname.includes('/parent') || 
                     location.pathname.includes('/professional') || 
                     location.pathname.includes('/admin');

  const headerClasses = `
    ${transparent ? 'bg-transparent' : 'bg-white shadow-lg border-b border-gray-200'}
    transition-all duration-300 ${className}
  `;

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle (Dashboard only) */}
            {showSidebarToggle && isDashboard && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors lg:hidden"
                aria-label="Toggle sidebar"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text">
                Smile Adventure
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Accedi
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Registrati
                </Link>
              </>
            ) : (
              <>
                {/* Quick Navigation for authenticated users */}
                {!isDashboard && (
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Home
                  </Link>
                )}

                {/* Dashboard Link */}
                {user?.role === 'parent' ? (
                  <Link 
                    to="/parent" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : user?.role === 'professional' ? (
                  <Link 
                    to="/professional" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : user?.role === 'admin' ? (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Admin
                  </Link>
                ) : null}

                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <BellIcon className="h-5 w-5" />
                  {/* Notification badge */}
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium">
                      {user?.first_name} {user?.last_name}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user?.role === 'professional' ? 'Dentista' : user?.role}
                        </p>
                      </div>
                      
                      <Link 
                        to={`/${user?.role}/profile`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 mr-3" />
                        Profilo
                      </Link>
                      
                      <Link 
                        to={`/${user?.role}/settings`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <CogIcon className="h-4 w-4 mr-3" />
                        Impostazioni
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <PowerIcon className="h-4 w-4 mr-3" />
                          Esci
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-4 pt-4">
            <div className="flex flex-col space-y-4">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Accedi
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrati
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3 py-2 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {user?.role === 'professional' ? 'Dentista' : user?.role}
                      </p>
                    </div>
                  </div>
                  
                  {!isDashboard && (
                    <Link 
                      to="/" 
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                  )}
                  
                  {user?.role === 'parent' ? (
                    <Link 
                      to="/parent" 
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : user?.role === 'professional' ? (
                    <Link 
                      to="/professional" 
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : user?.role === 'admin' ? (
                    <Link 
                      to="/admin" 
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  ) : null}

                  <Link 
                    to={`/${user?.role}/profile`}
                    className="flex items-center text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserIcon className="h-5 w-5 mr-2" />
                    Profilo
                  </Link>

                  <Link 
                    to={`/${user?.role}/settings`}
                    className="flex items-center text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <CogIcon className="h-5 w-5 mr-2" />
                    Impostazioni
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center text-red-600 hover:text-red-700 font-medium transition-colors text-left"
                  >
                    <PowerIcon className="h-5 w-5 mr-2" />
                    Esci
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>      {/* Click outside handler for profile dropdown */}
      {isProfileOpen && (
        <button
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setIsProfileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsProfileOpen(false);
            }
          }}
          aria-label="Close profile menu"
          tabIndex={-1}
        />
      )}
    </header>
  );
};

Header.propTypes = {
  onToggleSidebar: PropTypes.func,
  showSidebarToggle: PropTypes.bool,
  transparent: PropTypes.bool,
  className: PropTypes.string
};
export default Header;
