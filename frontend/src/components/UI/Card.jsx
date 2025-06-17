import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  variant = 'default',
  size = 'medium',
  padding = 'default',
  hover = false,
  clickable = false,
  onClick,
  className = '',
  headerAction,
  href, // Added href prop
  ...props
}) => {
  const cardClasses = [
    'card',
    `card--${variant}`,
    `card--${size}`,
    `card--${padding}`,
    hover ? 'card--hover' : '',
    (clickable || href) ? 'card--clickable' : '', // Make clickable if href is present
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (href) {
      // If it's an external link, let the browser handle it.
      // onClick might be used for analytics or other purposes.
      if (onClick) onClick(e);
      return; 
    }
    if (clickable && onClick) {
      onClick(e);
    }
  };
  const handleKeyDown = (e) => {
    if (href && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      // For links, Enter/Space should trigger navigation.
      // We can simulate a click or directly navigate.
      // Simulating click is often better to respect any onClick logic.
      e.currentTarget.click(); 
      return;
    }
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  const CardElement = href ? 'a' : (clickable ? 'button' : 'div');

  return (
    <CardElement
      className={cardClasses}
      onClick={handleClick} // Always attach handleClick
      onKeyDown={handleKeyDown} // Always attach handleKeyDown
      type={(clickable && !href) ? 'button' : undefined} // Set type only if it's a button
      href={href} // Add href if present
      target={href ? '_blank' : undefined} // Open external links in new tab
      rel={href ? 'noopener noreferrer' : undefined} // Security for external links
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="card-header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      <div className="card-content">
        {children}
      </div>
        {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </CardElement>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  footer: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated', 'filled']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  padding: PropTypes.oneOf(['none', 'small', 'default', 'large']),
  hover: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  headerAction: PropTypes.node,
  href: PropTypes.string // Added href proptype
};

export default Card;
