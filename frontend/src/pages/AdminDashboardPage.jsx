/**
 * Admin Dashboard Page - Platform-wide statistics and management
 * Comprehensive admin interface for Smile Adventure platform
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/adminService';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);      const [dashboardResponse, analyticsResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getPlatformAnalytics(parseInt(selectedTimeRange))
      ]);

      setDashboardData(dashboardResponse);
      setAnalytics(analyticsResponse);

      // Generate insights
      const platformInsights = await adminService.getPlatformInsights();
      setInsights(platformInsights.insights || []);

    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleExportData = async (format) => {
    try {
      const blob = await adminService.exportData(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smile_adventure_data_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const platformStats = dashboardData?.platform_stats || {};
  
  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.first_name}! Here&apos;s your platform overview.</p>
        </div>
        <div className="header-actions">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button 
            onClick={handleRefresh} 
            className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            {refreshing ? '↻' : '⟳'} Refresh
          </button>
        </div>
      </div>

      {/* Platform Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <div className="stat-value">{platformStats.total_users?.toLocaleString() || 0}</div>
            <div className="stat-change positive">
              +{analytics?.new_users_month || 0} this month
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Active Users</h3>
            <div className="stat-value">{platformStats.active_users?.toLocaleString() || 0}</div>
            <div className="stat-subtext">
              {((platformStats.active_users / platformStats.total_users) * 100 || 0).toFixed(1)}% of total
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">👶</div>
          <div className="stat-content">
            <h3>Children Profiles</h3>
            <div className="stat-value">{platformStats.total_children?.toLocaleString() || 0}</div>
            <div className="stat-change positive">
              +{analytics?.new_children_month || 0} this month
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Total Activities</h3>
            <div className="stat-value">{platformStats.total_activities?.toLocaleString() || 0}</div>
            <div className="stat-change positive">
              +{analytics?.activities_week || 0} this week
            </div>
          </div>
        </div>
      </div>

      {/* User Breakdown */}
      <div className="dashboard-row">
        <div className="card">
          <div className="card-header">
            <h3>User Distribution</h3>
          </div>
          <div className="card-content">
            <div className="user-breakdown">
              <div className="breakdown-item">
                <div className="breakdown-label">Parents</div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill parent" 
                    style={{
                      width: `${(platformStats.parent_users / platformStats.total_users) * 100 || 0}%`
                    }}
                  ></div>
                </div>
                <div className="breakdown-value">{platformStats.parent_users || 0}</div>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">Professionals</div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill professional" 
                    style={{
                      width: `${(platformStats.professional_users / platformStats.total_users) * 100 || 0}%`
                    }}
                  ></div>
                </div>
                <div className="breakdown-value">{platformStats.professional_users || 0}</div>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">Admins</div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill admin" 
                    style={{
                      width: `${((platformStats.total_users - platformStats.parent_users - platformStats.professional_users) / platformStats.total_users) * 100 || 0}%`
                    }}
                  ></div>
                </div>
                <div className="breakdown-value">
                  {platformStats.total_users - platformStats.parent_users - platformStats.professional_users || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Top Performing Children</h3>
          </div>
          <div className="card-content">
            <div className="top-children-list">
              {dashboardData?.top_children?.map((child, index) => (
                <div key={child.id} className="top-child-item">
                  <div className="child-rank">#{index + 1}</div>
                  <div className="child-info">
                    <div className="child-name">{child.name}</div>
                    <div className="child-stats">
                      Level {child.level} • {child.points} points
                    </div>
                  </div>
                  <div className="child-activities">
                    {child.activities_count} activities
                  </div>
                </div>
              )) || (
                <div className="no-data">No children data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Platform Insights */}
      {insights.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Platform Insights</h3>
          </div>
          <div className="card-content">            <div className="insights-grid">
              {insights.map((insight) => (
                <div key={`${insight.type}-${insight.title}`} className={`insight-card ${insight.priority}`}>
                  <div className="insight-header">
                    <h4>{insight.title}</h4>
                    <span className={`insight-priority ${insight.priority}`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="insight-message">{insight.message}</p>
                  {insight.action && (
                    <div className="insight-action">
                      <strong>Recommended Action:</strong> {insight.action}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="card-content">
          <div className="quick-actions">
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="action-button primary"
            >
              👥 Manage Users
            </button>
            <button 
              onClick={() => window.location.href = '/admin/analytics'}
              className="action-button info"
            >
              📊 View Analytics
            </button>
            <button 
              onClick={() => handleExportData('csv')}
              className="action-button success"
            >
              📁 Export Data
            </button>
            <button 
              onClick={() => window.location.href = '/admin/settings'}
              className="action-button warning"
            >
              ⚙️ System Settings
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p>Smile Adventure Admin Panel v1.0</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
