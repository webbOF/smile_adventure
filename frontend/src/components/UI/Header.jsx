/**
 * Header Component
 * Header navigazione con informazioni utente e logout
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Anche se il logout fallisce, navighiamo al login
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

  const headerClasses = [
    'header',
    className
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses} {...props}>
      <div className="header-content">
        {/* Logo/Title */}
        <div className="header-brand">
          <h1 className="header-title">{title}</h1>
        </div>

        {/* User Info e Logout */}
        {isAuthenticated && (
          <div className="header-user">
            {showUserInfo && user && (
              <div className="header-user-info">
                <span className="header-user-name">{getUserDisplayName()}</span>
                <span className="header-user-role">{getRoleDisplayName()}</span>
              </div>
            )}
            
            {showLogout && (
              <Button
                variant="secondary"
                size="small"
                onClick={handleLogout}
                loading={isLoggingOut}
                className="header-logout-btn"
                aria-label="Logout"
              >
                {isLoggingOut ? 'Disconnessione...' : 'Logout'}
              </Button>
            )}
          </div>
        )}
      </div>
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
