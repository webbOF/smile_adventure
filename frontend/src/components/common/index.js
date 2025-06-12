/**
 * Common Components Index
 * Centralized exports for all common components
 */

// Layout Components
export { default as Header } from './Header';
export { default as Footer } from './Footer';

// UI Components
export { default as Modal } from './Modal';
export { ConfirmationModal, FormModal, ImageModal } from './Modal';

export { default as DataTable } from './DataTable';
export { tableActions } from './DataTable';

// Loading Components
export { 
  LoadingSpinner,
  PageLoading,
  RouteLoading,
  ComponentLoading,
  ButtonLoading,
  DotsLoader,
  PulseLoader,
  SkeletonLoader
} from './Loading';

// Error Handling
export { default as ErrorBoundary } from './ErrorBoundary';
export { 
  SimpleErrorBoundary, 
  withErrorBoundary, 
  useErrorHandler 
} from './ErrorBoundary';

// Utility Components
export { default as NotFoundPage } from './NotFoundPage';
