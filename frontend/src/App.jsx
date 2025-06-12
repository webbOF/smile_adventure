import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import PropTypes from 'prop-types';

// Import core components
import Layout from './components/common/Layout.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { LoadingSpinner, PageLoading, RouteLoading } from './components/common/Loading.jsx';
import { SmartRedirect, RoleGuard } from './components/common/RoleGuard.jsx';
import NotFoundPage from './components/common/NotFoundPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Lazy load components for better performance
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const LoginPage = lazy(() => import('./components/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./components/auth/RegisterPage.jsx'));

// Parent components
const ParentDashboard = lazy(() => import('./components/parent/ParentDashboard.jsx'));
const ChildProfile = lazy(() => import('./components/parent/ChildProfile.jsx'));
const GameSession = lazy(() => import('./components/parent/GameSession.jsx'));
const ProgressDashboard = lazy(() => import('./components/parent/ProgressDashboard.jsx'));

// Professional components  
const ProfessionalDashboard = lazy(() => import('./components/professional/ProfessionalDashboard.jsx'));
const PatientList = lazy(() => import('./components/professional/PatientList.jsx'));
const PatientProfile = lazy(() => import('./components/professional/PatientProfile.jsx'));
const ClinicalAnalytics = lazy(() => import('./components/professional/ClinicalAnalytics.jsx'));

// Admin dashboard placeholder component
const AdminDashboard = () => (
  <div className="p-8 text-center">
    <p className="text-gray-600">Admin Dashboard - In sviluppo</p>
  </div>
);

// Initialize React Query client with advanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Route Configuration
 * Centralized route definitions for better maintainability
 */
const routeConfig = {
  public: [
    { path: '/', component: HomePage, exact: true },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
  ],  parent: [
    { path: '', component: ParentDashboard, exact: true },
    { path: 'child/:childId', component: ChildProfile },
    { path: 'game/:childId', component: GameSession },
    { path: 'progress', component: ProgressDashboard },
    { path: 'profile', component: () => (
      <div className="p-8 text-center">
        <p className="text-gray-600">Profilo Genitore - In sviluppo</p>
      </div>
    ) },
    { path: 'settings', component: () => (
      <div className="p-8 text-center">
        <p className="text-gray-600">Impostazioni - In sviluppo</p>
      </div>
    ) },
  ],  professional: [
    { path: '', component: ProfessionalDashboard, exact: true },
    { path: 'patients', component: PatientList, exact: true },
    { path: 'patients/:id', component: PatientProfile },
    { path: 'patients/new', component: () => (
      <div className="p-8 text-center">
        <p className="text-gray-600">Nuovo Paziente - In sviluppo</p>
      </div>
    ) },
    { path: 'analytics', component: ClinicalAnalytics, exact: true },
    { path: 'reports', component: () => (
      <div className="p-8 text-center">
        <p className="text-gray-600">Report - In sviluppo</p>
      </div>
    ) },
    { path: 'profile', component: () => (
      <div className="p-8 text-center">
        <p className="text-gray-600">Profilo Professionale - In sviluppo</p>
      </div>
    ) },
  ],
  admin: [
    { path: '', component: AdminDashboard, exact: true },
    { path: 'users', component: () => (
      <div className="p-8 text-center">
        <p className="text-gray-600">Gestione Utenti - In sviluppo</p>
      </div>
    ) },
    { path: 'system', component: () => (
      <div className="p-8 text-center">
        <p className="text-gray-600">Impostazioni Sistema - In sviluppo</p>
      </div>
    ) },
  ],
};

/**
 * Route Group Component
 * Renders a group of routes with consistent layout and protection
 */
const RouteGroup = ({ routes, basePath, allowedRoles, layout: LayoutComponent = Layout }) => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={`${basePath}-${route.path}`}
          path={route.path}
          element={
            <ErrorBoundary>
              <LayoutComponent>
                <Suspense fallback={<RouteLoading />}>
                  <route.component />
                </Suspense>
              </LayoutComponent>
            </ErrorBoundary>
          }
        />
      ))}
    </Routes>
  );
};

RouteGroup.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  basePath: PropTypes.string,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  layout: PropTypes.elementType,
};

/**
 * Main App Component with Advanced Routing
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Enhanced Toast Notifications */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  fontSize: '14px',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                },
                success: {
                  style: {
                    background: '#22c55e',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#22c55e',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#ef4444',
                  },
                },
                loading: {
                  style: {
                    background: '#3b82f6',
                  },
                },
              }}
            />
            {/* Suspense con messaggio personalizzato */}
            <Suspense fallback={<PageLoading message="Inizializzazione applicazione..." />}> 
              <Routes>
                {/* Smart Dashboard Redirect */}
                <Route path="/dashboard" element={<SmartRedirect />} />
                  {/* Public Routes */}
                {routeConfig.public.map((route) => (
                  <Route
                    key={`public-${route.path}`}
                    path={route.path}
                    element={
                      <ErrorBoundary>
                        <Layout>
                          <Suspense fallback={route.path === '/login' ? <LoadingSpinner size="large" /> : <RouteLoading />}>
                            <route.component />
                          </Suspense>
                        </Layout>
                      </ErrorBoundary>
                    }
                  />
                ))}

                {/* Protected Parent Routes */}
                <Route 
                  path="/parent/*" 
                  element={
                    <ProtectedRoute roles={['parent']}>
                      <RoleGuard allowedRoles={['parent']}>
                        <RouteGroup 
                          routes={routeConfig.parent}
                          basePath="/parent"
                          allowedRoles={['parent']}
                        />
                      </RoleGuard>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected Professional Routes */}
                <Route 
                  path="/professional/*" 
                  element={
                    <ProtectedRoute roles={['professional']}>
                      <RoleGuard allowedRoles={['professional']}>
                        <RouteGroup 
                          routes={routeConfig.professional}
                          basePath="/professional"
                          allowedRoles={['professional']}
                        />
                      </RoleGuard>
                    </ProtectedRoute>
                  } 
                />

                {/* Protected Admin Routes */}
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <RoleGuard allowedRoles={['admin']}>
                        <RouteGroup 
                          routes={routeConfig.admin}
                          basePath="/admin"
                          allowedRoles={['admin']}
                        />
                      </RoleGuard>
                    </ProtectedRoute>
                  } 
                />

                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
