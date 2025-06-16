/**
 * Progress.jsx
 * Componente UI per barre di progresso
 */

import React from 'react';
import PropTypes from 'prop-types';

const Progress = ({ value = 0, max = 100, className = '', ...props }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div 
      className={`w-full bg-gray-200 rounded-full h-2 ${className}`}
      {...props}
    >
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

Progress.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  className: PropTypes.string
};

export { Progress };
