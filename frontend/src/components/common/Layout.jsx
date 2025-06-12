import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuthStore } from '../../hooks/useAuthStore';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Breadcrumb from './Breadcrumb.jsx';

const Layout = ({ children, showBreadcrumb = true }) => {
  const { initializeAuth, isAuthenticated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Initialize auth state on app load
    initializeAuth();
  }, [initializeAuth]);

  // Don't show breadcrumb on public pages
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);
  const shouldShowBreadcrumb = showBreadcrumb && isAuthenticated && !isPublicPage;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Breadcrumb Navigation */}
      {shouldShowBreadcrumb && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb />
          </div>
        </div>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  showBreadcrumb: PropTypes.bool,
};

export default Layout;
