/**
 * Dashboard Service - Gestione dashboard utente
 * Servizio per recuperare dati dashboard dal backend
 */

import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';
import notificationService from './notificationService';

/**
 * @typedef {Object} DashboardStats
 * @property {number} total_children
 * @property {number} total_activities
 * @property {number} total_points
 * @property {number} total_sessions
 * @property {Array<Object>} children_stats
 * @property {Array<Object>} recent_activities
 * @property {Object} progress_summary
 */

export const dashboardService = {
  /**
   * Get dashboard data for current user
   * @returns {Promise<DashboardStats>}
   */
  async getDashboardData() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER_DASHBOARD);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error.response?.data || error.message);
      notificationService.showError('Errore nel caricamento della dashboard');
      throw error;
    }
  },

  /**
   * Transform backend dashboard data to frontend format
   * @param {Object} dashboardData - Backend dashboard data
   * @returns {Object} Frontend formatted dashboard data
   */
  transformDashboardData(dashboardData) {
    return {
      totalChildren: dashboardData.total_children || 0,
      totalActivities: dashboardData.total_activities || 0,
      totalPoints: dashboardData.total_points || 0,
      totalSessions: dashboardData.total_sessions || 0,
      childrenStats: dashboardData.children_stats || [],
      recentActivities: dashboardData.recent_activities || [],
      progressSummary: dashboardData.progress_summary || {}
    };
  }
};

export default dashboardService;
