import React from 'react';
import PropTypes from 'prop-types';
import './Layout.css';

const Layout = ({
  children,
  header,
  sidebar,
  footer,
  variant = 'default',
  sidebarCollapsed = false,
  className = '',
  ...props
}) => {
  const layoutClasses = [
    'layout',
    `layout--${variant}`,
    sidebar ? 'layout--with-sidebar' : '',
    sidebarCollapsed ? 'layout--sidebar-collapsed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses} {...props}>
      {header && (
        <header className="layout-header">
          {header}
        </header>
      )}
      
      <div className="layout-body">
        {sidebar && (
          <aside className="layout-sidebar">
            {sidebar}
          </aside>
        )}
        
        <main className="layout-main">
          {children}
        </main>
      </div>
      
      {footer && (
        <footer className="layout-footer">
          {footer}
        </footer>
      )}
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.node,
  sidebar: PropTypes.node,
  footer: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'centered', 'fullwidth']),
  sidebarCollapsed: PropTypes.bool,
  className: PropTypes.string
};

export default Layout;
