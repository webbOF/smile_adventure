/**
 * Textarea component
 * A reusable textarea component with consistent styling
 */

import React from 'react';
import PropTypes from 'prop-types';

const Textarea = ({ 
  value, 
  onChange, 
  placeholder, 
  rows = 4, 
  className = '', 
  disabled = false,
  id,
  name,
  ...props 
}) => {
  const baseClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-md
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    resize-vertical
  `;

  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`${baseClasses} ${className}`.trim()}
      disabled={disabled}
      {...props}
    />
  );
};

Textarea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string
};

export default Textarea;
