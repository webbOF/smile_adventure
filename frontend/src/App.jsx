import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import ChildrenListPage from './pages/ChildrenListPage';
import ChildDetailPage from './pages/ChildDetailPage';
import ChildCreatePage from './pages/ChildCreatePage';
import ChildEditPage from './pages/ChildEditPage';

// Components
import { Spinner, Layout, ToastContainer } from './components/UI';
import { HomePage } from './components/common';
import ProtectedRoute from './components/ProtectedRoute';

// Routes constants
import { ROUTES, USER_ROLES } from './utils/constants';

// Loading component for when auth is being checked
const AppLoading = () => (
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
      <p>Caricamento...</p>
    </div>
  </Layout>
);

// Main app routes
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AppLoading />;
  }
  return (
    <Routes>      {/* Homepage route - sempre accessibile */}
      <Route 
        path="/" 
        element={<HomePage />}
      />
      
      {/* Public routes */}
      <Route 
        path={ROUTES.LOGIN} 
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.DASHBOARD} replace />
          ) : (
            <LoginPage />
          )
        } 
      />
      <Route 
        path={ROUTES.REGISTER} 
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.DASHBOARD} replace />
          ) : (
            <RegisterPage />
          )
        } 
      />

      {/* Protected routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />      {/* Parent-only routes */}
      <Route
        path="/children"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PARENT]}>
            <ChildrenListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/new"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PARENT]}>
            <ChildCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/:id"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PARENT]}>
            <ChildDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/:id/edit"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PARENT]}>
            <ChildEditPage />
          </ProtectedRoute>
        }
      />

      {/* Professional-only routes */}
      <Route
        path="/clinical/*"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PROFESSIONAL]}>
            <div>Clinical routes (TODO: implement)</div>
          </ProtectedRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]}>
            <div>Admin routes (TODO: implement)</div>
          </ProtectedRoute>
        }
      />

      {/* Profile routes (available to all authenticated users) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <div>Profile page (TODO: implement)</div>
          </ProtectedRoute>
        }
      />

      {/* Error pages */}
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />

      {/* Default redirects */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to={ROUTES.DASHBOARD} replace /> : 
            <Navigate to={ROUTES.LOGIN} replace />
        } 
      />

      {/* Catch all - 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
          <ToastContainer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
