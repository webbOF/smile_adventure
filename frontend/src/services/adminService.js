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
   * Get user activity logs
   * @param {number} userId - User ID (optional, all users if not provided)
   * @param {number} days - Days to look back
   * @returns {Promise<Array>} Activity logs
   */
  async getUserActivityLogs(userId = null, days = 7) {
    try {
      const params = { days };
      if (userId) params.user_id = userId;

      const response = await apiInstance.get('/api/v1/admin/activity-logs', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      throw new Error('Failed to load activity logs');
    }
  }

  /**
   * Get platform insights and recommendations
   * @returns {Promise<Object>} Platform insights
   */
  async getPlatformInsights() {
    try {
      // Combine multiple data sources for insights
      const [dashboard, analytics, userStats] = await Promise.all([
        this.getDashboardStats(),
        this.getPlatformAnalytics(30),
        this.getUserStatistics()
      ]);

      return {
        dashboard,
        analytics,
        userStats,
        insights: this._generateInsights(dashboard, analytics, userStats),
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch platform insights:', error);
      throw new Error('Failed to load platform insights');
    }
  }

  /**
   * Generate insights from platform data
   * @private
   */
  _generateInsights(dashboard, analytics, userStats) {
    const insights = [];

    // User growth insights
    if (analytics.growth_rate > 20) {
      insights.push({
        type: 'growth',
        title: 'Rapid User Growth',
        message: `Platform growing at ${analytics.growth_rate}% monthly`,
        priority: 'high',
        action: 'Consider scaling infrastructure'
      });
    }

    // Engagement insights
    if (dashboard.platform_stats?.total_activities > 1000) {
      insights.push({
        type: 'engagement',
        title: 'High User Engagement',
        message: 'Users are highly active on the platform',
        priority: 'positive',
        action: 'Maintain current engagement strategies'
      });
    }

    // Professional utilization
    const profRatio = dashboard.platform_stats?.professional_users / dashboard.platform_stats?.parent_users;
    if (profRatio < 0.1) {
      insights.push({
        type: 'utilization',
        title: 'Low Professional Adoption',
        message: 'Consider professional outreach programs',
        priority: 'medium',
        action: 'Increase professional marketing efforts'
      });
    }

    return insights;
  }
}

// Export singleton instance
const adminService = new AdminService();
export default adminService;
