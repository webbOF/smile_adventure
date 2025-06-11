import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Import components
import Layout from './components/common/Layout';
import HomePage from './components/common/HomePage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ParentDashboard from './components/parent/ParentDashboard';
import ProfessionalDashboard from './components/professional/ProfessionalDashboard';
import ChildProfile from './components/parent/ChildProfile';
import GameSession from './components/parent/GameSession';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import hooks and services
import { useAuthStore } from './hooks/useAuthStore';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to={user?.role === 'parent' ? '/parent' : '/professional'} replace /> :
                  <Layout><LoginPage /></Layout>
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? 
                  <Navigate to={user?.role === 'parent' ? '/parent' : '/professional'} replace /> :
                  <Layout><RegisterPage /></Layout>
              } 
            />
            
            {/* Protected Parent Routes */}
            <Route 
              path="/parent/*" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <Layout>
                    <Routes>
                      <Route index element={<ParentDashboard />} />
                      <Route path="child/:childId" element={<ChildProfile />} />
                      <Route path="game/:childId" element={<GameSession />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Professional Routes */}
            <Route 
              path="/professional/*" 
              element={
                <ProtectedRoute allowedRoles={['professional']}>
                  <Layout>
                    <Routes>
                      <Route index element={<ProfessionalDashboard />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
