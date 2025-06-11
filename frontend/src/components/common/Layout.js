import React, { useEffect } from 'react';
import { useAuthStore } from '../../hooks/useAuthStore';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app load
    initializeAuth();
  }, [initializeAuth]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
