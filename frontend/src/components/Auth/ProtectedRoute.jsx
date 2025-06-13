import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../UI';
import { USER_ROLES } from '../../utils/constants';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Se stiamo ancora caricando lo stato di autenticazione
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spinner size="large" />
      </div>
    );
  }

  // Se la rotta richiede autenticazione ma l'utente non è autenticato
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se ci sono ruoli richiesti, verificali
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role => 
      user.roles?.includes(role) || user.role === role
    );
    
    if (!hasRequiredRole) {
      // Reindirizza a una pagina di accesso negato o alla home
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Se tutto è ok, renderizza i children
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoles: PropTypes.arrayOf(
    PropTypes.oneOf(Object.values(USER_ROLES))
  ),
  requireAuth: PropTypes.bool,
  redirectTo: PropTypes.string
};

export default ProtectedRoute;
