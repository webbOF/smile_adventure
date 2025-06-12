import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

/**
 * Unauthorized Access Component
 * Shows when user tries to access a route they don't have permission for
 */
const UnauthorizedAccess = ({ requiredRole, userRole }) => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <ExclamationTriangleIcon className="h-16 w-16 text-amber-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Accesso Non Autorizzato
        </h1>
        
        <p className="text-gray-600 mb-6">
          Non hai i permessi necessari per accedere a questa pagina.
          {requiredRole && (
            <span className="block mt-2 text-sm">
              È richiesto il ruolo: <strong>{requiredRole}</strong>
            </span>
          )}
          {userRole && (
            <span className="block text-sm text-gray-500">
              Il tuo ruolo: <strong>{userRole}</strong>
            </span>
          )}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Torna Indietro
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cambia Account
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Role-based Route Guard
 * Advanced routing component with role validation and redirection logic
 */
const RoleGuard = ({ 
  children, 
  allowedRoles = [], 
  fallbackComponent = null,
  redirectTo = null 
}) => {
  const { isAuthenticated, user } = useAuthStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no roles specified, just check authentication
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  const hasRequiredRole = user?.role && allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    // If redirect specified, use it
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // If fallback component specified, use it
    if (fallbackComponent) {
      return fallbackComponent;
    }

    // Default: show unauthorized access page
    return (
      <UnauthorizedAccess 
        requiredRole={allowedRoles.join(' o ')}
        userRole={user?.role}
      />
    );
  }

  return children;
};

/**
 * Smart Redirect Component
 * Redirects users to appropriate dashboard based on their role
 */
export const SmartRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user?.role) {
    case 'parent':
      return <Navigate to="/parent" replace />;
    case 'professional':
      return <Navigate to="/professional" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export { UnauthorizedAccess, RoleGuard };
export default RoleGuard;
