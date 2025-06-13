import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import './Select.css';

const Select = forwardRef(({
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  options = [],
  placeholder = 'Seleziona...',
  error,
  disabled = false,
  required = false,
  size = 'medium',
  variant = 'default',
  className = '',
  id,
  name,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined;

  const selectClasses = [
    'select',
    `select--${size}`,
    `select--${variant}`,
    error ? 'select--error' : '',
    disabled ? 'select--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="select-wrapper">
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="select-required" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="select-container">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          className={selectClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <span className="select-arrow" aria-hidden="true">
          ▼
        </span>
      </div>
      
      {error && (
        <span id={errorId} className="select-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool
    })
  ),
  placeholder: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'outline', 'filled']),
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  'aria-describedby': PropTypes.string
};

export default Select;
