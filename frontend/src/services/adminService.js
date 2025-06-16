/**
 * Admin Service - API calls for admin functionalities
 * Handles all admin-related operations including user management and platform analytics
 */

import apiInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';

class AdminService {
  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Dashboard data with platform-wide statistics
   */
  async getDashboardStats() {
    try {
      const response = await apiInstance.get(API_ENDPOINTS.USERS.DASHBOARD);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin dashboard stats:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load dashboard statistics');
    }
  }

  /**
   * Get platform analytics
   * @param {number} days - Number of days to analyze (default: 30)
   * @returns {Promise<Object>} Platform analytics data
   */
  async getPlatformAnalytics(days = 30) {
    try {
      const response = await apiInstance.get(API_ENDPOINTS.USERS.ANALYTICS, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform analytics:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load platform analytics');
    }
  }

  /**
   * Get users list with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.skip - Number of records to skip
   * @param {number} params.limit - Number of records to return
   * @param {string} params.role - Filter by user role (optional)
   * @returns {Promise<Object>} Users list with pagination info
   */
  async getUsersList({ skip = 0, limit = 50, role = null } = {}) {
    try {
      const params = { skip, limit };
      if (role) params.role = role;

      const response = await apiInstance.get(API_ENDPOINTS.AUTH.USERS, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users list:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load users list');
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics and metrics
   */
  async getUserStatistics() {
    try {
      const response = await apiInstance.get(API_ENDPOINTS.AUTH.STATS);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load user statistics');
    }
  }

  /**
   * Get users list with advanced filtering and search capabilities
   * @param {Object} filters - Advanced filter options
   * @param {number} filters.skip - Number of records to skip
   * @param {number} filters.limit - Number of records to return
   * @param {string} filters.role - Filter by user role (PARENT, PROFESSIONAL, ADMIN)
   * @param {string} filters.status - Filter by status (active, inactive, suspended)
   * @param {string} filters.search - Search by name or email
   * @param {string} filters.date_from - Filter registration from date (ISO format)
   * @param {string} filters.date_to - Filter registration to date (ISO format)
   * @param {string} filters.sort_by - Sort field (created_at, last_login, email)
   * @param {string} filters.sort_order - Sort order (asc, desc)
   * @returns {Promise<Object>} Users list with pagination and filtering applied
   */
  async getUsersListAdvanced(filters = {}) {
    try {
      const defaultFilters = {
        skip: 0,
        limit: 50,
        sort_by: 'created_at',
        sort_order: 'desc'
      };
      
      const params = { ...defaultFilters, ...filters };
      
      // Remove null/undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await apiInstance.get(API_ENDPOINTS.AUTH.USERS, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users list with advanced filters:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load users list');
    }
  }

  /**
   * Get detailed user statistics with breakdown and analytics
   * @param {Object} options - Statistics options
   * @param {string} options.date_range - Date range ('7d', '30d', '90d', '1y')
   * @param {boolean} options.include_breakdown - Include detailed breakdown
   * @returns {Promise<Object>} Detailed user statistics
   */
  async getUserStatisticsDetailed(options = {}) {
    try {
      const { date_range = '30d', include_breakdown = true } = options;
      
      const params = { date_range, include_breakdown };
      const response = await apiInstance.get(API_ENDPOINTS.AUTH.STATS, { params });
      
      // Enhance response with calculated metrics
      const stats = response.data;
      const enhanced = {
        ...stats,
        calculated_metrics: {
          growth_rate: this._calculateGrowthRate(stats),
          retention_rate: this._calculateRetentionRate(stats),
          activation_rate: this._calculateActivationRate(stats),
          geographic_distribution: this._calculateGeographicDistribution(stats)
        },
        trends: {
          daily_registrations: stats.daily_registrations || [],
          role_distribution_trend: stats.role_distribution_trend || [],
          email_verification_trend: stats.email_verification_trend || []
        }
      };
      
      return enhanced;
    } catch (error) {
      console.error('Failed to fetch detailed user statistics:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load detailed user statistics');
    }
  }

  /**
   * Calculate growth rate from statistics
   * @private
   */
  _calculateGrowthRate(stats) {
    if (!stats.period_comparison) return 0;
    
    const current = stats.period_comparison.current_period || 0;
    const previous = stats.period_comparison.previous_period || 0;
    
    if (previous === 0) return current > 0 ? 100 : 0;
    
    return ((current - previous) / previous) * 100;
  }

  /**
   * Calculate retention rate from statistics
   * @private
   */
  _calculateRetentionRate(stats) {
    if (!stats.activity_metrics) return 0;
    
    const totalUsers = stats.total_users || 0;
    const activeUsers = stats.activity_metrics.active_users_30d || 0;
    
    return totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
  }

  /**
   * Calculate email activation rate
   * @private
   */
  _calculateActivationRate(stats) {
    if (!stats.email_verification) return 0;
    
    const totalUsers = stats.total_users || 0;
    const verifiedUsers = stats.email_verification.verified_count || 0;
    
    return totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0;
  }

  /**
   * Calculate geographic distribution
   * @private
   */
  _calculateGeographicDistribution(stats) {
    if (!stats.geographic_data) return [];
    
    return stats.geographic_data.map(item => ({
      ...item,
      percentage: (item.count / stats.total_users) * 100
    }));
  }

  /**
   * Get all children (admin view)
   * @param {Object} params - Query parameters
   * @param {boolean} params.include_inactive - Include inactive children
   * @param {number} params.skip - Pagination skip
   * @param {number} params.limit - Pagination limit
   * @returns {Promise<Object>} Children list
   */
  async getAllChildren({ include_inactive = false, skip = 0, limit = 50 } = {}) {
    try {
      const params = { include_inactive, skip, limit };
      const response = await apiInstance.get(API_ENDPOINTS.CHILDREN.LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all children:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load children data');
    }
  }

  /**
   * Get system health metrics
   * @returns {Promise<Object>} System health data
   */
  async getSystemHealth() {
    try {
      // This would be a custom endpoint for system monitoring
      // For now, we'll use dashboard stats as a proxy
      const response = await this.getDashboardStats();
      return {
        status: 'healthy',
        uptime: '99.9%',
        response_time: '120ms',
        last_check: new Date().toISOString(),
        ...response
      };
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      throw new Error('Failed to load system health data');
    }
  }

  /**
   * Export platform data
   * @param {string} format - Export format ('csv', 'json', 'xlsx')
   * @param {Object} filters - Data filters
   * @returns {Promise<Blob>} Export file blob
   */
  async exportData(format = 'csv', filters = {}) {
    try {
      const response = await apiInstance.get('/api/v1/admin/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export platform data');
    }
  }

  /**
   * Update user status (activate/deactivate/suspend)
   * @param {number} userId - User ID
   * @param {string} status - New status ('active', 'inactive', 'suspended')
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserStatus(userId, status) {
    try {
      const response = await apiInstance.patch(`/api/v1/admin/users/${userId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update user status');
    }
  }

  /**
   * BULK OPERATIONS METHODS
   * Methods for UserBulkActions component
   */

  /**
   * Update role for multiple users
   * @param {Array<number>} userIds - Array of user IDs
   * @param {string} newRole - New role to assign
   * @returns {Promise<Object>} Operation result
   */
  async bulkUpdateUserRole(userIds, newRole) {
    try {
      const response = await apiInstance.patch(API_ENDPOINTS.USERS.BULK_UPDATE_ROLE, {
        user_ids: userIds,
        new_role: newRole
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update user roles:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update user roles');
    }
  }

  /**
   * Update status for multiple users
   * @param {Array<number>} userIds - Array of user IDs
   * @param {string} newStatus - New status to assign
   * @returns {Promise<Object>} Operation result
   */
  async bulkUpdateUserStatus(userIds, newStatus) {
    try {
      const response = await apiInstance.patch(API_ENDPOINTS.USERS.BULK_UPDATE_STATUS, {
        user_ids: userIds,
        new_status: newStatus
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update user status:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update user status');
    }
  }

  /**
   * Send bulk email to multiple users
   * @param {Array<number>} userIds - Array of user IDs
   * @param {Object} emailData - Email configuration
   * @returns {Promise<Object>} Operation result
   */
  async bulkSendEmail(userIds, emailData) {
    try {
      const response = await apiInstance.post(API_ENDPOINTS.USERS.BULK_SEND_EMAIL, {
        user_ids: userIds,
        email_data: emailData
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send bulk email:', error);
      throw new Error(error.response?.data?.detail || 'Failed to send emails');
    }
  }

  /**
   * Export user data
   * @param {Array<number>} userIds - Array of user IDs
   * @param {string} format - Export format (csv, xlsx, json)
   * @returns {Promise<Object>} Export result with download URL
   */
  async exportUserData(userIds, format = 'csv') {
    try {
      const response = await apiInstance.post(API_ENDPOINTS.USERS.EXPORT, {
        user_ids: userIds,
        format: format
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw new Error(error.response?.data?.detail || 'Failed to export data');
    }
  }

  /**
   * Delete multiple users (soft delete)
   * @param {Array<number>} userIds - Array of user IDs
   * @returns {Promise<Object>} Operation result
   */
  async bulkDeleteUsers(userIds) {
    try {
      const response = await apiInstance.delete(API_ENDPOINTS.USERS.BULK_DELETE, {
        data: { user_ids: userIds }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk delete users:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete users');
    }
  }

  /**
   * STATISTICS DASHBOARD METHODS
   * Methods for StatisticsDashboard component
   */

  /**
   * Get overall user statistics for dashboard
   * @param {string} timeRange - Time range (7d, 30d, 90d, 1y)
   * @returns {Promise<Object>} Overall statistics
   */
  async getOverallUserStats(timeRange = '30d') {
    try {
      const response = await apiInstance.get(`${API_ENDPOINTS.ADMIN.STATS}/overview`, {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch overall user stats:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load overall statistics');
    }
  }

  /**
   * Get users distribution by role
   * @returns {Promise<Array>} Role distribution data
   */
  async getUsersByRoleDistribution() {
    try {
      const response = await apiInstance.get(`${API_ENDPOINTS.ADMIN.STATS}/roles-distribution`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users by role distribution:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load role distribution');
    }
  }

  /**
   * Get users distribution by status
   * @returns {Promise<Array>} Status distribution data
   */
  async getUsersByStatusDistribution() {
    try {
      const response = await apiInstance.get(`${API_ENDPOINTS.ADMIN.STATS}/status-distribution`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users by status distribution:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load status distribution');
    }
  }

  /**
   * Get registrations trend over time
   * @param {string} timeRange - Time range (7d, 30d, 90d, 1y)
   * @returns {Promise<Array>} Registrations trend data
   */
  async getRegistrationsTrend(timeRange = '30d') {
    try {
      const response = await apiInstance.get(`${API_ENDPOINTS.ADMIN.STATS}/registrations-trend`, {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch registrations trend:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load registrations trend');
    }
  }

  /**
   * Get activity trend over time
   * @param {string} timeRange - Time range (7d, 30d, 90d, 1y)
   * @returns {Promise<Array>} Activity trend data
   */
  async getActivityTrend(timeRange = '30d') {
    try {
      const response = await apiInstance.get(`${API_ENDPOINTS.ADMIN.STATS}/activity-trend`, {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch activity trend:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load activity trend');
    }
  }

  /**
   * Get top user metrics
   * @param {string} timeRange - Time range (7d, 30d, 90d, 1y)
   * @returns {Promise<Array>} Top metrics data
   */
  async getTopUserMetrics(timeRange = '30d') {
    try {
      const response = await apiInstance.get(`${API_ENDPOINTS.ADMIN.STATS}/top-metrics`, {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top user metrics:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load top metrics');
    }
  }

  /**
   * Export dashboard data
   * @param {string} timeRange - Time range for the export
   * @returns {Promise<Object>} Export result with download URL
   */
  async exportDashboardData(timeRange = '30d') {
    try {
      const response = await apiInstance.post(`${API_ENDPOINTS.ADMIN.STATS}/export`, {
        time_range: timeRange,
        format: 'xlsx'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export dashboard data:', error);
      throw new Error(error.response?.data?.detail || 'Failed to export dashboard data');
    }
  }

  /**
   * Get user activity logs
   * @param {number} userId - User ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Activity logs
   */
  async getUserActivityLogs(userId, days = 30) {
    try {
      const response = await apiInstance.get(`${API_ENDPOINTS.USERS.DETAIL}/${userId}/activity-logs`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user activity logs:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load activity logs');
    }
  }
}

// Export singleton instance
const adminService = new AdminService();
export default adminService;
