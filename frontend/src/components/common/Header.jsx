import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout effettuato con successo!');
      navigate('/');
    } catch (error) {
      toast.error('Errore durante il logout');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">😊</span>
            </div>
            <span className="text-2xl font-display font-bold gradient-text">
              Smile Adventure
            </span>
          </Link>          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Home
                </Link>
                {user?.role === 'parent' ? (
                  <Link 
                    to="/parent" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/professional" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700 font-medium">
                      {user?.first_name} {user?.last_name}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Esci</span>
                  </button>
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
        </div>        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
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
                  <div className="flex items-center space-x-2 py-2">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700 font-medium">
                      {user?.first_name} {user?.last_name}
                    </span>
                  </div>
                  
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  
                  {user?.role === 'parent' ? (
                    <Link 
                      to="/parent" 
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link 
                      to="/professional" 
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors text-left"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Esci</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
