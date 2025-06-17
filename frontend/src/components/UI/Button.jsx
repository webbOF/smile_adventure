/**
 * Button Component
 * Componente button riutilizzabile con varianti e stati
 */

import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

/**
 * @typedef {Object} ButtonProps
 * @property {React.ReactNode} children - Contenuto del button
 * @property {'primary'|'secondary'|'outline'|'outline-light'|'danger'|'ghost'} [variant='primary'] - Variante stilistica
 * @property {'small'|'medium'|'large'} [size='medium'] - Dimensione del button
 * @property {boolean} [loading=false] - Stato di loading
 * @property {boolean} [disabled=false] - Stato disabilitato
 * @property {boolean} [fullWidth=false] - Larghezza completa
 * @property {'button'|'submit'|'reset'} [type='button'] - Tipo HTML del button
 * @property {string} [className] - Classi CSS aggiuntive
 * @property {Function} [onClick] - Handler click
 * @property {Object} [rest] - Altri props HTML
 */

/**
 * Button Component
 * @param {ButtonProps} props
 * @returns {JSX.Element}
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  onClick,
  href, // Added href prop
  target, // Added target prop
  rel, // Added rel prop
  ...rest
}) => {  // Costruisci le classi CSS
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    loading && 'button--loading',
    disabled && 'button--disabled',
    fullWidth && 'button--fullwidth',
    className
  ].filter(Boolean).join(' ');

  // Handler click con protezione per loading/disabled
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        onClick={handleClick} // Retain onClick for potential analytics or other actions
        target={target}
        rel={rel}
        aria-disabled={disabled || loading}
        {...rest}
      >
        {loading && (
          <span className="button-spinner" aria-hidden="true">
            <svg
              className="button-spinner-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="button-spinner-circle"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="button-spinner-path"
                fill="currentColor"
                d="m12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6z"
              />
            </svg>
          </span>
        )}
        <span className={`button-content ${loading ? 'button-content--loading' : ''}`}>
          {children}
        </span>
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="button-spinner" aria-hidden="true">
          <svg
            className="button-spinner-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="button-spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="button-spinner-path"
              fill="currentColor"
              d="m12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6z"
            />
          </svg>
        </span>
      )}
      <span className={`button-content ${loading ? 'button-content--loading' : ''}`}>
        {children}
      </span>
    </button>
  );
};

export default Button;

// PropTypes validation
Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'outline-light', 'danger', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  onClick: PropTypes.func,
  href: PropTypes.string, // Added href proptype
  target: PropTypes.string, // Added target proptype
  rel: PropTypes.string // Added rel proptype
};
