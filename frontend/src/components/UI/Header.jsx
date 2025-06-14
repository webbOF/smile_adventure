/**
 * Header Component
 * Navigation header con menu context-aware per diversi stati utente
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES, USER_ROLES } from '../../utils/constants';
import Button from './Button';
import './Header.css';

const Header = ({ 
  title = 'Smile Adventure',
  showUserInfo = true,
  showLogout = true,
  className = '',
  ...props 
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.full_name || `${user.first_name} ${user.last_name}` || user.email;
  };

  const getRoleDisplayName = () => {
    if (!user?.role) return '';
    switch (user.role) {
      case 'parent':
        return 'Genitore';
      case 'professional':
        return 'Professionista';
      case 'admin':
        return 'Amministratore';
      default:
        return user.role;
    }
  };

  // Navigation items per utenti non autenticati
  const getPublicNavItems = () => [
    { label: 'Home', path: ROUTES.HOME, icon: '🏠' },
    { label: 'Accedi', path: ROUTES.LOGIN, icon: '🔐' },
    { label: 'Registrati', path: ROUTES.REGISTER, icon: '📝' },
    { label: 'Info', path: '/info', icon: 'ℹ️' }
  ];

  // Navigation items per genitori autenticati
  const getParentNavItems = () => [
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'I Miei Bambini', path: ROUTES.CHILDREN, icon: '👶' },
    { label: 'Profilo', path: ROUTES.PROFILE, icon: '👤' }
  ];

  // Navigation items per professionisti autenticati
  const getProfessionalNavItems = () => [
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Pazienti', path: '/clinical/patients', icon: '👥' },
    { label: 'Analytics', path: '/clinical/analytics', icon: '📈' },
    { label: 'Profilo', path: ROUTES.PROFESSIONAL_PROFILE, icon: '👤' }
  ];

  // Navigation items per admin
  const getAdminNavItems = () => [
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Utenti', path: ROUTES.ADMIN_USERS, icon: '👥' },
    { label: 'Sistema', path: '/admin/system', icon: '⚙️' },
    { label: 'Profilo', path: ROUTES.PROFILE, icon: '👤' }
  ];

  // Determina i navigation items in base al ruolo
  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return getPublicNavItems();
    }

    switch (user?.role) {
      case USER_ROLES.PARENT:
        return getParentNavItems();
      case USER_ROLES.PROFESSIONAL:
        return getProfessionalNavItems();
      case USER_ROLES.ADMIN:
      case USER_ROLES.SUPER_ADMIN:
        return getAdminNavItems();
      default:
        return getParentNavItems();
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const headerClasses = [
    'header',
    isAuthenticated ? 'header-authenticated' : 'header-public',
    className
  ].filter(Boolean).join(' ');

  const navigationItems = getNavigationItems();

  return (
    <header className={headerClasses} {...props}>
      <div className="header-content">        {/* Logo/Title */}
        <div className="header-brand">
          <Link 
            to={ROUTES.HOME}
            className="header-logo-link"
            onClick={(e) => {
              // Previene eventuali conflitti con altri event handlers
              e.stopPropagation();
            }}
          >
            <div className="header-logo">
              <span className="logo-icon">😊</span>
              <h1 className="header-title">{title}</h1>
            </div>
          </Link>
        </div>{/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          <ul className="nav-list">
            {navigationItems.map((item, index) => (
              <li key={`desktop-${item.path}-${index}`} className="nav-item">                <Link 
                  to={item.path} 
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="header-user">
          {isAuthenticated && showUserInfo && user && (
            <div className="header-user-info">
              <Link to={ROUTES.PROFILE} className="user-info-link">
                <div className="user-avatar">
                  {user.first_name ? user.first_name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div className="user-details">
                  <span className="header-user-name">{getUserDisplayName()}</span>
                  <span className="header-user-role">{getRoleDisplayName()}</span>
                </div>
              </Link>
            </div>
          )}
          
          {isAuthenticated && showLogout && (
            <Button
              variant="secondary"
              size="small"
              onClick={handleLogout}
              loading={isLoggingOut}
              className="header-logout-btn"
              aria-label="Logout"
            >
              {isLoggingOut ? '⏳' : '🚪'}
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            type="button"
          >
            <span className="hamburger-icon">
              {mobileMenuOpen ? '✖️' : '☰'}
            </span>
          </button>
        </div>
      </div>      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="header-nav mobile-nav">
          <ul className="nav-list">            {navigationItems.map((item, index) => (
              <li key={`mobile-${item.path}-${index}`} className="nav-item">
                <Link 
                  to={item.path} 
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
            
            {/* Mobile-only logout */}
            {isAuthenticated && (
              <li className="nav-item mobile-logout">
                <button 
                  className="nav-link logout-link"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <span className="nav-icon">{isLoggingOut ? '⏳' : '🚪'}</span>
                  <span className="nav-label">
                    {isLoggingOut ? 'Disconnessione...' : 'Logout'}
                  </span>
                </button>
              </li>            )}
          </ul>
        </nav>
      )}
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  showUserInfo: PropTypes.bool,
  showLogout: PropTypes.bool,
  className: PropTypes.string
};

export default Header;
