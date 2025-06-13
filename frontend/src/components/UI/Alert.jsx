import React from 'react';
import PropTypes from 'prop-types';
import './Alert.css';

const Alert = ({
  children,
  variant = 'info',
  size = 'medium',
  dismissible = false,
  onDismiss,
  title,
  icon,
  className = '',
  ...props
}) => {
  const alertClasses = [
    'alert',
    `alert--${variant}`,
    `alert--${size}`,
    dismissible ? 'alert--dismissible' : '',
    className
  ].filter(Boolean).join(' ');

  const handleDismiss = () => {
    if (dismissible && onDismiss) {
      onDismiss();
    }
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const displayIcon = icon !== null ? (icon || getDefaultIcon()) : null;

  return (
    <div
      className={alertClasses}
      role="alert"
      aria-live="polite"
      {...props}
    >
      {displayIcon && (
        <span className="alert-icon" aria-hidden="true">
          {displayIcon}
        </span>
      )}
      
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>
      
      {dismissible && (
        <button
          type="button"
          className="alert-dismiss"
          onClick={handleDismiss}
          aria-label="Chiudi avviso"
        >
          ✕
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  title: PropTypes.string,
  icon: PropTypes.node,
  className: PropTypes.string
};

export default Alert;
