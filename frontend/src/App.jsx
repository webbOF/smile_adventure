import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import themeService from './services/themeService';
// Pages
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  UnauthorizedPage,
  NotFoundPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ChildrenListPage,
  ChildDetailPage,
  ChildCreatePage,
  ChildEditPage,
  ChildProgressPage,
  ChildActivitiesPage,
  ProfilePage,
  ProfessionalProfilePage,
  ProfessionalSearchPage,
  AdminDashboardPage,
  ReportsPage,
  ArticlesPage,
  AboutUsPage,
  FeedbackPage // Added FeedbackPage import
} from './pages';

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
      <Route 
        path={ROUTES.PASSWORD_RESET_REQUEST} 
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.DASHBOARD} replace />
          ) : (
            <ForgotPasswordPage />
          )
        } 
      />
      <Route 
        path={ROUTES.PASSWORD_RESET_CONFIRM} 
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.DASHBOARD} replace />
          ) : (
            <ResetPasswordPage />
          )
        }      />

      {/* Public content routes */}
      <Route 
        path={ROUTES.ARTICLES} 
        element={<ArticlesPage />}
      />
      <Route 
        path={ROUTES.ABOUT_US} 
        element={<AboutUsPage />}
      />
      <Route 
        path={ROUTES.FEEDBACK} 
        element={<FeedbackPage />} // Added FeedbackPage route
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
      />      <Route
        path="/children/:id/edit"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PARENT]}>
            <ChildEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/:childId/progress"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PARENT]}>
            <ChildProgressPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/:childId/activities"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PARENT]}>
            <ChildActivitiesPage />
          </ProtectedRoute>
        }
      />{/* Professional-only routes */}
      <Route
        path="/professional/profile"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PROFESSIONAL]}>
            <ProfessionalProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/professional/search"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PROFESSIONAL, USER_ROLES.PARENT]}>
            <ProfessionalSearchPage />
          </ProtectedRoute>
        }
      />      <Route
        path="/clinical/*"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PROFESSIONAL]}>
            <div>Clinical routes (TODO: implement)</div>
          </ProtectedRoute>
        }
      />

      {/* Reports routes - Available to Parents and Professionals */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.PARENT, USER_ROLES.PROFESSIONAL]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />{/* Profile routes (available to all authenticated users) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
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
  // Initialize theme service on app startup
  useEffect(() => {
    // Theme service automatically loads saved preferences and applies them
    themeService.init();
  }, []);

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

