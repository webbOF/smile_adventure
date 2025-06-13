import React from 'react';
import PropTypes from 'prop-types';
import Input from './Input';
import './FormField.css';

const FormField = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  leftIcon,
  rightIcon,
  size = 'medium',
  variant = 'default',
  className = '',
  inputProps = {},
  ...props
}) => {
  const fieldClasses = [
    'form-field',
    error ? 'form-field--error' : '',
    disabled ? 'form-field--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={fieldClasses} {...props}>
      <Input
        id={name}
        name={name}
        type={type}
        label={label}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        size={size}
        variant={variant}
        {...inputProps}
      />
      
      {helperText && !error && (
        <p className="form-field-helper" id={`${name}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'outline', 'filled']),
  className: PropTypes.string,
  inputProps: PropTypes.object
};

export default FormField;
