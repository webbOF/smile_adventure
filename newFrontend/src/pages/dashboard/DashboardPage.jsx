/**
 * 📊 Dashboard Page Component
 * Main dashboard with overview, stats, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUser } from '../../context/UserContext.jsx';
import { reportService } from '../../services/index.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import DashboardStats from '../../components/dashboard/DashboardStats.jsx';
import RecentSessions from '../../components/dashboard/RecentSessions.jsx';
import ProgressChart from '../../components/dashboard/ProgressChart.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';

const DashboardPage = () => {
  const { user } = useAuth();
  const { children } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await reportService.getDashboardData();
      
      if (response?.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good {getTimeOfDay()}, {user?.first_name}!
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'parent' 
                ? `You have ${children?.length || 0} children in your care`
                : 'Here\'s your professional dashboard overview'
              }
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats data={dashboardData} userRole={user?.role} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="lg:col-span-2">
          <ProgressChart data={dashboardData?.progressData} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions userRole={user?.role} />
        </div>
      </div>

      {/* Recent Sessions */}
      <RecentSessions sessions={dashboardData?.recentSessions} />
    </div>
  );
};

// Helper function to get time-based greeting
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export default DashboardPage;
