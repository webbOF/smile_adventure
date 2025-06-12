import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Enhanced Loading Spinner Component
 * Advanced loading component with different variants, animations, and styles
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'primary', 
  text = null,
  fullScreen = false,
  className = '',
  style = 'spinner' // spinner, dots, pulse, skeleton
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'h-3 w-3',
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  // Color variants
  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    secondary: 'border-secondary-200 border-t-secondary-600',
    white: 'border-gray-200 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
    success: 'border-green-200 border-t-green-600',
    error: 'border-red-200 border-t-red-600'
  };

  // Different loading styles
  const renderLoadingStyle = () => {
    switch (style) {
      case 'dots':
        return <DotsLoader size={size} variant={variant} />;
      case 'pulse':
        return <PulseLoader size={size} variant={variant} />;
      case 'skeleton':
        return <SkeletonLoader size={size} />;
      default:
        return (
          <div className={`
            animate-spin rounded-full border-4 
            ${sizeClasses[size]} 
            ${colorClasses[variant]}
            ${className}
          `} />
        );    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderLoadingStyle()}
      </motion.div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-gray-600 text-center text-sm"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Page Loading Component
 * Shows a full-page loading state with brand elements
 */
export const PageLoading = ({ message = "Caricamento in corso..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          {/* Logo placeholder - replace with actual logo */}
          <div className="mx-auto w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">SA</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Smile Adventure</h2>
        </motion.div>
        
        <LoadingSpinner 
          size="large" 
          variant="primary" 
          text={message}
        />
      </div>
    </div>
  );
};

/**
 * Route Loading Component
 * Shows loading state for route transitions
 */
export const RouteLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner 
        size="large" 
        variant="primary" 
        text="Caricamento pagina..."
      />
    </div>
  );
};

/**
 * Component Loading Wrapper
 * Wraps components with loading state
 */
export const ComponentLoading = ({ isLoading, children, loadingText = "Caricamento..." }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner 
          size="medium" 
          variant="primary" 
          text={loadingText}
        />
      </div>
    );
  }

  return children;
};

/**
 * Button Loading State
 * For buttons with loading states
 */
export const ButtonLoading = ({ size = 'small', variant = 'white' }) => {
  return (
    <LoadingSpinner 
      size={size} 
      variant={variant}
      className="mr-2"
    />
  );
};

/**
 * Dots Loading Animation
 */
const DotsLoader = ({ size, variant }) => {
  const dotSize = {
    xs: 'w-1 h-1',
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
    xlarge: 'w-6 h-6'
  };

  const dotColors = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
    success: 'bg-green-600',
    error: 'bg-red-600'
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${dotSize[size]} ${dotColors[variant]} rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
};

/**
 * Pulse Loading Animation
 */
const PulseLoader = ({ size, variant }) => {
  const pulseSize = {
    xs: 'w-6 h-6',
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  const pulseColors = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
    success: 'bg-green-600',
    error: 'bg-red-600'
  };

  return (
    <motion.div
      className={`${pulseSize[size]} ${pulseColors[variant]} rounded-full`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1]
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

/**
 * Skeleton Loading Animation
 */
const SkeletonLoader = ({ size }) => {
  const skeletonSize = {
    xs: 'h-3',
    small: 'h-4',
    medium: 'h-6',
    large: 'h-8',
    xlarge: 'h-12'
  };

  return (
    <div className="animate-pulse space-y-2 w-48">
      <div className={`bg-gray-300 rounded ${skeletonSize[size]}`}></div>
      <div className={`bg-gray-300 rounded ${skeletonSize[size]} w-3/4`}></div>
      <div className={`bg-gray-300 rounded ${skeletonSize[size]} w-1/2`}></div>
    </div>
  );
};

// Named exports for all loading components
export { 
  LoadingSpinner,
  DotsLoader,
  PulseLoader, 
  SkeletonLoader
};

// PropTypes for LoadingSpinner
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'white', 'gray', 'success', 'error']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.oneOf(['spinner', 'dots', 'pulse', 'skeleton'])
};

// PropTypes for other components
PageLoading.propTypes = {
  message: PropTypes.string
};

ComponentLoading.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  loadingText: PropTypes.string
};

ButtonLoading.propTypes = {
  size: PropTypes.oneOf(['xs', 'small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'white', 'gray', 'success', 'error'])
};

DotsLoader.propTypes = {
  size: PropTypes.oneOf(['xs', 'small', 'medium', 'large', 'xlarge']).isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'white', 'gray', 'success', 'error']).isRequired
};

PulseLoader.propTypes = {
  size: PropTypes.oneOf(['xs', 'small', 'medium', 'large', 'xlarge']).isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'white', 'gray', 'success', 'error']).isRequired
};

SkeletonLoader.propTypes = {
  size: PropTypes.oneOf(['xs', 'small', 'medium', 'large', 'xlarge']).isRequired
};
