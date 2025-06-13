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
  ...props
}) => {
  const cardClasses = [
    'card',
    `card--${variant}`,
    `card--${size}`,
    `card--${padding}`,
    hover ? 'card--hover' : '',
    clickable ? 'card--clickable' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (clickable && onClick) {
      onClick(e);
    }
  };
  const handleKeyDown = (e) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  const CardElement = clickable ? 'button' : 'div';

  return (
    <CardElement
      className={cardClasses}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      type={clickable ? 'button' : undefined}
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
  headerAction: PropTypes.node
};

export default Card;
