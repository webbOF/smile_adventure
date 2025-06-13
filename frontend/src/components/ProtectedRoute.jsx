import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner, Layout } from './UI';
import { ROUTES, USER_ROLES, USER_STATUS } from '../utils/constants';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = null,
  requireEmailVerification = true,
  redirectTo = ROUTES.LOGIN 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Layout variant="centered">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Spinner size="large" />
          <p>Verifica autenticazione...</p>
        </div>
      </Layout>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }  // Check if user account is active
  if (!user.is_active || user.status !== USER_STATUS.ACTIVE) {
    return (
      <Navigate 
        to={ROUTES.UNAUTHORIZED} 
        state={{ 
          from: location,
          reason: 'Account not active' 
        }} 
        replace 
      />
    );
  }

  // Check email verification if required
  if (requireEmailVerification && !user.is_verified) {
    return (
      <Navigate 
        to={ROUTES.UNAUTHORIZED} 
        state={{ 
          from: location,
          reason: 'Email verification required' 
        }} 
        replace 
      />
    );
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <Navigate 
          to={ROUTES.UNAUTHORIZED} 
          state={{ 
            from: location,
            reason: 'Insufficient permissions',
            requiredRoles: allowedRoles,
            userRole: user.role
          }} 
          replace 
        />
      );
    }  }

  // All checks passed, render the protected component
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(
    PropTypes.oneOf(Object.values(USER_ROLES))
  ),
  requireEmailVerification: PropTypes.bool,
  redirectTo: PropTypes.string
};

export default ProtectedRoute;
