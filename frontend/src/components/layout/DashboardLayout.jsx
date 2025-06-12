import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../hooks/useAuthStore';

/**
 * Dashboard Layout Component
 * Provides a consistent layout for dashboard pages with Header and Sidebar
 */
const DashboardLayout = ({ 
  children, 
  className = '',
  sidebarProps = {},
  headerProps = {},
  showSidebar = true
}) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Determine if we should show sidebar based on route and user role
  const shouldShowSidebar = showSidebar && user && (
    location.pathname.includes('/parent') ||
    location.pathname.includes('/professional') ||
    location.pathname.includes('/admin')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        onToggleSidebar={handleToggleMobileSidebar}
        showSidebarToggle={shouldShowSidebar}
        {...headerProps}
      />

      <div className="flex">
        {/* Sidebar */}
        {shouldShowSidebar && (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={handleToggleSidebar}
                {...sidebarProps}
              />
            </div>            {/* Mobile Sidebar */}
            {isMobileSidebarOpen && (
              <>
                {/* Overlay */}
                <button 
                  className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden cursor-default"
                  onClick={handleToggleMobileSidebar}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      handleToggleMobileSidebar();
                    }
                  }}
                  aria-label="Close sidebar"
                  tabIndex={0}
                />
                
                {/* Sidebar */}
                <div className="fixed inset-y-0 left-0 z-30 lg:hidden">
                  <Sidebar
                    isCollapsed={false}
                    onToggleCollapse={() => {}} // No collapse on mobile
                    className="w-64"
                    {...sidebarProps}
                  />
                </div>
              </>
            )}
          </>        )}
        
        {/* Main Content */}
        {(() => {
          let mainMarginClass = '';
          if (shouldShowSidebar) {
            mainMarginClass = isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64';
          }
          
          return (
            <div className={`
              flex-1 
              ${mainMarginClass}
              transition-all duration-300
            `}>
              <main className={`p-6 ${className}`}>
                {children}
              </main>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  sidebarProps: PropTypes.object,
  headerProps: PropTypes.object,
  showSidebar: PropTypes.bool
};

export default DashboardLayout;
