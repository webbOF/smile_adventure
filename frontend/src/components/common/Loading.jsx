import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading Spinner Component
 * Advanced loading component with different variants and animations
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'primary', 
  text = null,
  fullScreen = false,
  className = ''
}) => {
  // Size configurations
  const sizeClasses = {
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
    gray: 'border-gray-200 border-t-gray-600'
  };

  const spinnerClass = `
    animate-spin rounded-full border-4 
    ${sizeClasses[size]} 
    ${colorClasses[variant]}
    ${className}
  `;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={spinnerClass}
      />
      
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-gray-600 text-center"
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

export default LoadingSpinner;

// Named exports for all loading components
export { LoadingSpinner };
