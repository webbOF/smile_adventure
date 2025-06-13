/**
 * 🚀 SmileAdventure Main App Component
 * React Router setup with authentication and user context providers
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import AuthGuard from './components/auth/AuthGuard.jsx';
import Layout from './components/common/Layout.jsx';

// Page imports
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import ChildrenPage from './pages/children/ChildrenPage.jsx';
import ReportsPage from './pages/reports/ReportsPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import ProfessionalPage from './pages/professional/ProfessionalPage.jsx';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <AuthGuard>
                  <Layout>
                    <Navigate to="/dashboard" replace />
                  </Layout>
                </AuthGuard>
              } />
              
              <Route path="/dashboard" element={
                <AuthGuard>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </AuthGuard>
              } />
              
              <Route path="/children" element={
                <AuthGuard requiredRole="parent">
                  <Layout>
                    <ChildrenPage />
                  </Layout>
                </AuthGuard>
              } />
              
              <Route path="/reports" element={
                <AuthGuard>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </AuthGuard>
              } />
              
              <Route path="/profile" element={
                <AuthGuard>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </AuthGuard>
              } />
              
              <Route path="/professional" element={
                <AuthGuard requiredRole="professional">
                  <Layout>
                    <ProfessionalPage />
                  </Layout>
                </AuthGuard>
              } />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
