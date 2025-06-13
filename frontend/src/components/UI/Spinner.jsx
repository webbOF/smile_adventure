import React from 'react';
import PropTypes from 'prop-types';
import './Spinner.css';

const Spinner = ({
  size = 'medium',
  variant = 'primary',
  className = '',
  'aria-label': ariaLabel = 'Caricamento in corso...',
  ...props
}) => {
  const spinnerClasses = [
    'spinner',
    `spinner--${size}`,
    `spinner--${variant}`,
    className
  ].filter(Boolean).join(' ');  return (
    <div
      className={spinnerClasses}
      aria-label={ariaLabel}
      aria-live="polite"
      {...props}
    >
      <div className="spinner-circle" aria-hidden="true">
        <div className="spinner-path"></div>
      </div>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'white']),
  className: PropTypes.string,
  'aria-label': PropTypes.string
};

export default Spinner;
