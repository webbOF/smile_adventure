import React from 'react';
import PropTypes from 'prop-types';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon, BugAntIcon } from '@heroicons/react/24/outline';

/**
 * Advanced Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the application
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Math.random().toString(36).substring(2, 9)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to service in production
    this.reportError(error, errorInfo);
  }

  reportError = async (error, errorInfo) => {
    try {
      // Only report in production
      if (process.env.NODE_ENV === 'production') {
        // Here you would integrate with your error reporting service
        // Example: Sentry, LogRocket, Bugsnag, etc.
        
        const errorReport = {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          errorId: this.state.errorId,
          userId: this.props.userId || 'anonymous'
        };

        // Mock error reporting - replace with actual service
        console.log('Error reported:', errorReport);
        
        // Example integration:
        // await fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorReport)
        // });
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };
  handleReset = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
    
    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  renderFallbackUI = () => {
    const { 
      fallback, 
      showReload = true, 
      showHome = true, 
      showErrorDetails = true,
      customActions = []
    } = this.props;

    // Use custom fallback if provided
    if (fallback && typeof fallback === 'function') {
      return fallback(this.state.error, this.state.errorInfo, this.handleReset);
    }

    // Determine error severity
    const isCritical = this.state.retryCount >= 3 || 
                      this.state.error?.message?.includes('ChunkLoadError') ||
                      this.state.error?.name === 'ChunkLoadError';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 text-center border border-red-100">
          <div className="flex justify-center mb-6">
            {isCritical ? (
              <BugAntIcon className="h-20 w-20 text-red-500" />
            ) : (
              <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isCritical ? 'Errore Critico' : 'Oops! Qualcosa è andato storto'}
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {isCritical ? (
              'Si è verificato un errore critico che richiede il ricaricamento della pagina. I nostri tecnici sono stati notificati.'
            ) : (
              'Si è verificato un errore imprevisto. Il nostro team è stato notificato e stiamo lavorando per risolvere il problema.'
            )}
          </p>

          {/* Error ID for support */}
          {this.state.errorId && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">
                ID Errore: <span className="font-mono font-medium text-gray-700">{this.state.errorId}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Fornisci questo ID al supporto tecnico se necessario
              </p>
            </div>
          )}

          <div className="space-y-3">
            {/* Primary actions */}
            {!isCritical && (
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Riprova ({this.state.retryCount + 1}/3)
              </button>
            )}
            
            {showReload && (
              <button
                onClick={this.handleReload}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  isCritical 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Ricarica Pagina
              </button>
            )}
            
            {showHome && (
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Torna alla Home
              </button>
            )}            {/* Custom actions */}
            {customActions.map((action, index) => (
              <button
                key={`action-${action.label}-${index}`}
                onClick={action.onClick}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${action.className || 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Development mode: show detailed error */}
          {showErrorDetails && process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium">
                🐛 Dettagli errore (sviluppo)
              </summary>
              <div className="mt-4 p-4 bg-gray-900 rounded-lg text-xs text-green-400 overflow-auto max-h-64">
                <div className="mb-3">
                  <strong className="text-red-400">Error:</strong>
                  <p className="text-white">{this.state.error.toString()}</p>
                </div>
                <div className="mb-3">
                  <strong className="text-blue-400">Component Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-gray-300 text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
                {this.state.error.stack && (
                  <div>
                    <strong className="text-yellow-400">Stack Trace:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-gray-300 text-xs">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Support contact */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Problemi persistenti? Contatta il{' '}
              <a 
                href="mailto:support@smileadventure.it" 
                className="text-primary-600 hover:text-primary-700 underline"
              >
                supporto tecnico
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  };
  render() {
    if (this.state.hasError) {
      return this.renderFallbackUI();
    }

    return this.props.children;
  }
}

/**
 * Higher Order Component for Error Boundaries
 * Wraps components with error boundary functionality
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Hook for error boundary integration (React 18+)
 * Allows functional components to trigger error boundaries
 */
export const useErrorHandler = () => {
  return (error, errorInfo) => {
    // This will trigger the nearest error boundary
    throw error;
  };
};

/**
 * Simple Error Boundary for specific components
 */
const ErrorFallback = ({ fallback }) => {
  return fallback || (
    <div className="p-4 text-center text-gray-500">
      <p>Si è verificato un errore nel caricamento di questo componente.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-2 text-primary-600 hover:text-primary-700 underline"
      >
        Ricarica pagina
      </button>
    </div>
  );
};

export const SimpleErrorBoundary = ({ children, fallback = null }) => (
  <ErrorBoundary 
    fallback={() => <ErrorFallback fallback={fallback} />}
    showReload={false}
    showHome={false}
    showErrorDetails={false}
  >
    {children}
  </ErrorBoundary>
);

// PropTypes
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  onReset: PropTypes.func,
  showReload: PropTypes.bool,
  showHome: PropTypes.bool,
  showErrorDetails: PropTypes.bool,
  customActions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string
  })),
  userId: PropTypes.string
};

SimpleErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
};

export default ErrorBoundary;
