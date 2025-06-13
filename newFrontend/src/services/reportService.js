/**
 * 📊 SmileAdventure Report Service
 * Complete implementation of all 36 reports & analytics routes
 * Features: Dashboard, game sessions, advanced reports, analytics
 */

import { api, ApiUtils } from './api.js';

// 📊 Reports & Analytics API Endpoints (36 routes total)
const REPORT_ENDPOINTS = {
  // Dashboard & Overview (1 route)
  DASHBOARD: '/reports/dashboard',
  
  // Game Sessions Management - Session CRUD (6 routes)
  CREATE_SESSION: '/reports/sessions',
  LIST_SESSIONS: '/reports/sessions',
  GET_SESSION: '/reports/sessions/{session_id}',
  UPDATE_SESSION: '/reports/sessions/{session_id}',
  DELETE_SESSION: '/reports/sessions/{session_id}',
  COMPLETE_SESSION: '/reports/sessions/{session_id}/complete',
  
  // Game Sessions - Session Analytics (2 routes)
  SESSION_ANALYTICS: '/reports/sessions/{session_id}/analytics',
  CHILD_SESSION_TRENDS: '/reports/children/{child_id}/sessions/trends',
  
  // Game Session Alternative API (4 routes)
  CREATE_GAME_SESSION: '/reports/game-sessions',
  END_GAME_SESSION: '/reports/game-sessions/{session_id}/end',
  GET_CHILD_SESSIONS: '/reports/game-sessions/child/{child_id}',
  GET_GAME_SESSION: '/reports/game-sessions/{session_id}',
  
  // Advanced Reports - Report Management (6 routes)
  CREATE_REPORT: '/reports/reports',
  LIST_REPORTS: '/reports/reports',
  GET_REPORT: '/reports/reports/{report_id}',
  UPDATE_REPORT: '/reports/reports/{report_id}',
  DELETE_REPORT: '/reports/reports/{report_id}',
  UPDATE_REPORT_STATUS: '/reports/reports/{report_id}/status',
  
  // Advanced Reports - Generation & Export (5 routes)
  GENERATE_REPORT: '/reports/reports/{report_id}/generate',
  EXPORT_REPORT: '/reports/reports/{report_id}/export',
  SHARE_REPORT: '/reports/reports/{report_id}/share',
  GET_REPORT_PERMISSIONS: '/reports/reports/{report_id}/permissions',
  UPDATE_REPORT_PERMISSIONS: '/reports/reports/{report_id}/permissions',
  
  // Child-Specific Analytics (6 routes)
  CHILD_PROGRESS: '/reports/child/{child_id}/progress',
  CHILD_SUMMARY: '/reports/child/{child_id}/summary',
  CHILD_ANALYTICS: '/reports/child/{child_id}/analytics',
  CHILD_EXPORT: '/reports/child/{child_id}/export',
  GENERATE_CHILD_REPORT: '/reports/child/{child_id}/generate-report',
  CHILD_PROGRESS_ALT: '/reports/children/{child_id}/progress',
  
  // Advanced Analytics - Population & Clinical (6 routes)
  POPULATION_ANALYTICS: '/reports/analytics/population',
  CLINICAL_INSIGHTS: '/reports/analytics/insights',
  TREATMENT_EFFECTIVENESS: '/reports/analytics/treatment-effectiveness',
  COHORT_COMPARISON: '/reports/analytics/cohort-comparison',
  EXPORT_ANALYTICS: '/reports/analytics/export',
  TEST_DATA: '/reports/analytics/test-data',
  
  // Clinical Research Tools (2 routes)
  CLINICAL_POPULATION: '/reports/clinical-analytics/population',
  CLINICAL_INSIGHTS_ADV: '/reports/clinical-analytics/insights'
};

// 📊 Report Service Class
class ReportService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 3 * 60 * 1000; // 3 minutes for dynamic data
    this.realtimeListeners = new Map();
  }

  // 📈 DASHBOARD & OVERVIEW

  /**
   * Get dashboard with KPIs and overview data
   * @param {Object} params - Optional dashboard parameters
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard(params = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(params);
      const url = queryString ? `${REPORT_ENDPOINTS.DASHBOARD}?${queryString}` : REPORT_ENDPOINTS.DASHBOARD;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache('dashboard', response.data);
        console.log('✅ Dashboard data fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch dashboard data');
    } catch (error) {
      console.error('❌ Get dashboard error:', error);
      throw error;
    }
  }

  // 🎮 GAME SESSIONS MANAGEMENT - Session CRUD

  /**
   * Create new game session
   * @param {Object} sessionData - Session creation data
   * @returns {Promise<Object>} Created session
   */
  async createSession(sessionData) {
    try {
      const response = await api.post(REPORT_ENDPOINTS.CREATE_SESSION, sessionData);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache('sessions');
        console.log('✅ Game session created successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to create game session');
    } catch (error) {
      console.error('❌ Create session error:', error);
      throw error;
    }
  }

  /**
   * Get all game sessions
   * @param {Object} params - Optional parameters for filtering/pagination
   * @returns {Promise<Object>} Sessions list
   */
  async listSessions(params = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(params);
      const url = queryString ? `${REPORT_ENDPOINTS.LIST_SESSIONS}?${queryString}` : REPORT_ENDPOINTS.LIST_SESSIONS;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache('sessions', response.data);
        console.log('✅ Sessions list fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch sessions list');
    } catch (error) {
      console.error('❌ List sessions error:', error);
      throw error;
    }
  }

  /**
   * Get specific game session details
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session details
   */
  async getSession(sessionId) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.GET_SESSION, { session_id: sessionId });
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache(`session_${sessionId}`, response.data);
        console.log('✅ Session details fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch session details');
    } catch (error) {
      console.error('❌ Get session error:', error);
      throw error;
    }
  }

  /**
   * Update game session
   * @param {string} sessionId - Session ID
   * @param {Object} sessionData - Updated session data
   * @returns {Promise<Object>} Updated session
   */
  async updateSession(sessionId, sessionData) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.UPDATE_SESSION, { session_id: sessionId });
      const response = await api.put(url, sessionData);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache(`session_${sessionId}`, response.data);
        this._clearCache('sessions');
        console.log('✅ Session updated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to update session');
    } catch (error) {
      console.error('❌ Update session error:', error);
      throw error;
    }
  }

  /**
   * Delete game session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Delete confirmation
   */
  async deleteSession(sessionId) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.DELETE_SESSION, { session_id: sessionId });
      const response = await api.delete(url);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache(`session_${sessionId}`);
        this._clearCache('sessions');
        console.log('✅ Session deleted successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete session');
    } catch (error) {
      console.error('❌ Delete session error:', error);
      throw error;
    }
  }

  /**
   * Complete game session
   * @param {string} sessionId - Session ID
   * @param {Object} completionData - Session completion data
   * @returns {Promise<Object>} Completion response
   */
  async completeSession(sessionId, completionData = {}) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.COMPLETE_SESSION, { session_id: sessionId });
      const response = await api.post(url, completionData);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache(`session_${sessionId}`, response.data);
        this._clearCache('sessions');
        console.log('✅ Session completed successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to complete session');
    } catch (error) {
      console.error('❌ Complete session error:', error);
      throw error;
    }
  }

  // 📊 GAME SESSIONS - Session Analytics

  /**
   * Get session analytics
   * @param {string} sessionId - Session ID
   * @param {Object} params - Optional analytics parameters
   * @returns {Promise<Object>} Session analytics
   */
  async getSessionAnalytics(sessionId, params = {}) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.SESSION_ANALYTICS, { session_id: sessionId });
      const queryString = ApiUtils.buildQueryString(params);
      const finalUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await api.get(finalUrl);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Session analytics fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch session analytics');
    } catch (error) {
      console.error('❌ Get session analytics error:', error);
      throw error;
    }
  }

  /**
   * Get child session trends
   * @param {string} childId - Child ID
   * @param {Object} params - Optional parameters for trend analysis
   * @returns {Promise<Object>} Session trends
   */
  async getChildSessionTrends(childId, params = {}) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.CHILD_SESSION_TRENDS, { child_id: childId });
      const queryString = ApiUtils.buildQueryString(params);
      const finalUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await api.get(finalUrl);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child session trends fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child session trends');
    } catch (error) {
      console.error('❌ Get child session trends error:', error);
      throw error;
    }
  }

  // 🎮 GAME SESSION ALTERNATIVE API

  /**
   * Create game session (Task 23 alternative)
   * @param {Object} gameSessionData - Game session data
   * @returns {Promise<Object>} Created game session
   */
  async createGameSession(gameSessionData) {
    try {
      const response = await api.post(REPORT_ENDPOINTS.CREATE_GAME_SESSION, gameSessionData);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache('gameSessions');
        console.log('✅ Game session created successfully (Task 23)');
        return response;
      }
      
      throw new Error(response.message || 'Failed to create game session');
    } catch (error) {
      console.error('❌ Create game session error:', error);
      throw error;
    }
  }

  /**
   * End game session
   * @param {string} sessionId - Session ID
   * @param {Object} endData - Session end data
   * @returns {Promise<Object>} End session response
   */
  async endGameSession(sessionId, endData = {}) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.END_GAME_SESSION, { session_id: sessionId });
      const response = await api.put(url, endData);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache(`gameSession_${sessionId}`);
        console.log('✅ Game session ended successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to end game session');
    } catch (error) {
      console.error('❌ End game session error:', error);
      throw error;
    }
  }

  /**
   * Get child game sessions
   * @param {string} childId - Child ID
   * @param {Object} params - Optional parameters
   * @returns {Promise<Object>} Child game sessions
   */
  async getChildGameSessions(childId, params = {}) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.GET_CHILD_SESSIONS, { child_id: childId });
      const queryString = ApiUtils.buildQueryString(params);
      const finalUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await api.get(finalUrl);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child game sessions fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child game sessions');
    } catch (error) {
      console.error('❌ Get child game sessions error:', error);
      throw error;
    }
  }

  /**
   * Get game session details (Task 23)
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Game session details
   */
  async getGameSession(sessionId) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.GET_GAME_SESSION, { session_id: sessionId });
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache(`gameSession_${sessionId}`, response.data);
        console.log('✅ Game session details fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch game session details');
    } catch (error) {
      console.error('❌ Get game session error:', error);
      throw error;
    }
  }

  // 📋 ADVANCED REPORTS - Report Management

  /**
   * Create new report
   * @param {Object} reportData - Report creation data
   * @returns {Promise<Object>} Created report
   */
  async createReport(reportData) {
    try {
      const response = await api.post(REPORT_ENDPOINTS.CREATE_REPORT, reportData);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache('reports');
        console.log('✅ Report created successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to create report');
    } catch (error) {
      console.error('❌ Create report error:', error);
      throw error;
    }
  }

  /**
   * Get all reports
   * @param {Object} params - Optional parameters for filtering/pagination
   * @returns {Promise<Object>} Reports list
   */
  async listReports(params = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(params);
      const url = queryString ? `${REPORT_ENDPOINTS.LIST_REPORTS}?${queryString}` : REPORT_ENDPOINTS.LIST_REPORTS;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache('reports', response.data);
        console.log('✅ Reports list fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch reports list');
    } catch (error) {
      console.error('❌ List reports error:', error);
      throw error;
    }
  }

  /**
   * Get specific report details
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Report details
   */
  async getReport(reportId) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.GET_REPORT, { report_id: reportId });
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache(`report_${reportId}`, response.data);
        console.log('✅ Report details fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch report details');
    } catch (error) {
      console.error('❌ Get report error:', error);
      throw error;
    }
  }

  /**
   * Update report
   * @param {string} reportId - Report ID
   * @param {Object} reportData - Updated report data
   * @returns {Promise<Object>} Updated report
   */
  async updateReport(reportId, reportData) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.UPDATE_REPORT, { report_id: reportId });
      const response = await api.put(url, reportData);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache(`report_${reportId}`, response.data);
        this._clearCache('reports');
        console.log('✅ Report updated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to update report');
    } catch (error) {
      console.error('❌ Update report error:', error);
      throw error;
    }
  }

  /**
   * Delete report
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Delete confirmation
   */
  async deleteReport(reportId) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.DELETE_REPORT, { report_id: reportId });
      const response = await api.delete(url);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache(`report_${reportId}`);
        this._clearCache('reports');
        console.log('✅ Report deleted successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete report');
    } catch (error) {
      console.error('❌ Delete report error:', error);
      throw error;
    }
  }

  /**
   * Update report status
   * @param {string} reportId - Report ID
   * @param {Object} statusData - Status update data
   * @returns {Promise<Object>} Status update response
   */
  async updateReportStatus(reportId, statusData) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.UPDATE_REPORT_STATUS, { report_id: reportId });
      const response = await api.patch(url, statusData);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache(`report_${reportId}`, response.data);
        console.log('✅ Report status updated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to update report status');
    } catch (error) {
      console.error('❌ Update report status error:', error);
      throw error;
    }
  }

  // 📤 ADVANCED REPORTS - Generation & Export

  /**
   * Auto-generate report content
   * @param {string} reportId - Report ID
   * @param {Object} generationParams - Generation parameters
   * @returns {Promise<Object>} Generation response
   */
  async generateReport(reportId, generationParams = {}) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.GENERATE_REPORT, { report_id: reportId });
      const response = await api.post(url, generationParams);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache(`report_${reportId}`, response.data);
        console.log('✅ Report generated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to generate report');
    } catch (error) {
      console.error('❌ Generate report error:', error);
      throw error;
    }
  }

  /**
   * Export report in various formats
   * @param {string} reportId - Report ID
   * @param {string} format - Export format (pdf, csv, xlsx, json)
   * @param {string} filename - Optional custom filename
   * @returns {Promise<Object>} Export response
   */
  async exportReport(reportId, format = 'pdf', filename = null) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.EXPORT_REPORT, { report_id: reportId });
      const exportFilename = filename || `report_${reportId}.${format}`;
      
      const response = await api.download(`${url}?format=${format}`, exportFilename);
      
      console.log('✅ Report exported successfully');
      return response;
    } catch (error) {
      console.error('❌ Export report error:', error);
      throw error;
    }
  }

  /**
   * Share report with others
   * @param {string} reportId - Report ID
   * @param {Object} shareData - Sharing data
   * @returns {Promise<Object>} Share response
   */
  async shareReport(reportId, shareData) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.SHARE_REPORT, { report_id: reportId });
      const response = await api.post(url, shareData);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Report shared successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to share report');
    } catch (error) {
      console.error('❌ Share report error:', error);
      throw error;
    }
  }

  /**
   * Get report permissions
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Report permissions
   */
  async getReportPermissions(reportId) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.GET_REPORT_PERMISSIONS, { report_id: reportId });
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Report permissions fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch report permissions');
    } catch (error) {
      console.error('❌ Get report permissions error:', error);
      throw error;
    }
  }

  /**
   * Update report permissions
   * @param {string} reportId - Report ID
   * @param {Object} permissionsData - Permissions data
   * @returns {Promise<Object>} Updated permissions
   */
  async updateReportPermissions(reportId, permissionsData) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.UPDATE_REPORT_PERMISSIONS, { report_id: reportId });
      const response = await api.put(url, permissionsData);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Report permissions updated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to update report permissions');
    } catch (error) {
      console.error('❌ Update report permissions error:', error);
      throw error;
    }
  }

  // 👶 CHILD-SPECIFIC ANALYTICS

  /**
   * Get child detailed progress
   * @param {string} childId - Child ID
   * @param {Object} params - Optional parameters
   * @returns {Promise<Object>} Child progress data
   */
  async getChildProgress(childId, params = {}) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.CHILD_PROGRESS, { child_id: childId });
      const queryString = ApiUtils.buildQueryString(params);
      const finalUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await api.get(finalUrl);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child progress fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child progress');
    } catch (error) {
      console.error('❌ Get child progress error:', error);
      throw error;
    }
  }

  /**
   * Get child summary report
   * @param {string} childId - Child ID
   * @param {Object} params - Optional parameters
   * @returns {Promise<Object>} Child summary
   */
  async getChildSummary(childId, params = {}) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.CHILD_SUMMARY, { child_id: childId });
      const queryString = ApiUtils.buildQueryString(params);
      const finalUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await api.get(finalUrl);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child summary fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child summary');
    } catch (error) {
      console.error('❌ Get child summary error:', error);
      throw error;
    }
  }

  /**
   * Get child advanced analytics
   * @param {string} childId - Child ID
   * @param {Object} params - Optional parameters
   * @returns {Promise<Object>} Child analytics
   */
  async getChildAnalytics(childId, params = {}) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.CHILD_ANALYTICS, { child_id: childId });
      const queryString = ApiUtils.buildQueryString(params);
      const finalUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await api.get(finalUrl);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child analytics fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child analytics');
    } catch (error) {
      console.error('❌ Get child analytics error:', error);
      throw error;
    }
  }

  /**
   * Export child data
   * @param {string} childId - Child ID
   * @param {string} format - Export format
   * @param {string} filename - Optional custom filename
   * @returns {Promise<Object>} Export response
   */
  async exportChildData(childId, format = 'pdf', filename = null) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.CHILD_EXPORT, { child_id: childId });
      const exportFilename = filename || `child_${childId}_data.${format}`;
      
      const response = await api.download(`${url}?format=${format}`, exportFilename);
      
      console.log('✅ Child data exported successfully');
      return response;
    } catch (error) {
      console.error('❌ Export child data error:', error);
      throw error;
    }
  }

  /**
   * Generate child report automatically
   * @param {string} childId - Child ID
   * @param {Object} generationParams - Generation parameters
   * @returns {Promise<Object>} Generated report
   */
  async generateChildReport(childId, generationParams = {}) {
    try {
      const url = ApiUtils.formatUrl(REPORT_ENDPOINTS.GENERATE_CHILD_REPORT, { child_id: childId });
      const response = await api.post(url, generationParams);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child report generated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to generate child report');
    } catch (error) {
      console.error('❌ Generate child report error:', error);
      throw error;
    }
  }

  // 🔬 ADVANCED ANALYTICS - Population & Clinical

  /**
   * Get population analytics
   * @param {Object} params - Optional parameters for population analysis
   * @returns {Promise<Object>} Population analytics
   */
  async getPopulationAnalytics(params = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(params);
      const url = queryString ? `${REPORT_ENDPOINTS.POPULATION_ANALYTICS}?${queryString}` : REPORT_ENDPOINTS.POPULATION_ANALYTICS;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Population analytics fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch population analytics');
    } catch (error) {
      console.error('❌ Get population analytics error:', error);
      throw error;
    }
  }

  /**
   * Get AI-powered clinical insights
   * @param {Object} params - Optional parameters for insights
   * @returns {Promise<Object>} Clinical insights
   */
  async getClinicalInsights(params = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(params);
      const url = queryString ? `${REPORT_ENDPOINTS.CLINICAL_INSIGHTS}?${queryString}` : REPORT_ENDPOINTS.CLINICAL_INSIGHTS;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Clinical insights fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch clinical insights');
    } catch (error) {
      console.error('❌ Get clinical insights error:', error);
      throw error;
    }
  }

  /**
   * Analyze treatment effectiveness
   * @param {Object} params - Parameters for treatment analysis
   * @returns {Promise<Object>} Treatment effectiveness data
   */
  async analyzeTreatmentEffectiveness(params = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(params);
      const url = queryString ? `${REPORT_ENDPOINTS.TREATMENT_EFFECTIVENESS}?${queryString}` : REPORT_ENDPOINTS.TREATMENT_EFFECTIVENESS;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Treatment effectiveness analysis completed');
        return response;
      }
      
      throw new Error(response.message || 'Failed to analyze treatment effectiveness');
    } catch (error) {
      console.error('❌ Analyze treatment effectiveness error:', error);
      throw error;
    }
  }

  /**
   * Compare patient cohorts
   * @param {Object} cohortData - Cohort comparison data
   * @returns {Promise<Object>} Cohort comparison results
   */
  async compareCohorts(cohortData) {
    try {
      const response = await api.post(REPORT_ENDPOINTS.COHORT_COMPARISON, cohortData);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Cohort comparison completed successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to compare cohorts');
    } catch (error) {
      console.error('❌ Compare cohorts error:', error);
      throw error;
    }
  }

  /**
   * Export complete analytics
   * @param {string} format - Export format
   * @param {Object} params - Export parameters
   * @param {string} filename - Optional custom filename
   * @returns {Promise<Object>} Export response
   */
  async exportAnalytics(format = 'xlsx', params = {}, filename = null) {
    try {
      const queryString = ApiUtils.buildQueryString({ format, ...params });
      const url = `${REPORT_ENDPOINTS.EXPORT_ANALYTICS}?${queryString}`;
      const exportFilename = filename || `analytics_export.${format}`;
      
      const response = await api.download(url, exportFilename);
      
      console.log('✅ Analytics exported successfully');
      return response;
    } catch (error) {
      console.error('❌ Export analytics error:', error);
      throw error;
    }
  }

  /**
   * Generate test data for development
   * @param {Object} testParams - Test data parameters
   * @returns {Promise<Object>} Test data
   */
  async generateTestData(testParams = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(testParams);
      const url = queryString ? `${REPORT_ENDPOINTS.TEST_DATA}?${queryString}` : REPORT_ENDPOINTS.TEST_DATA;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Test data generated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to generate test data');
    } catch (error) {
      console.error('❌ Generate test data error:', error);
      throw error;
    }
  }

  // 🏥 CLINICAL RESEARCH TOOLS

  /**
   * Get clinical population data
   * @param {Object} params - Optional parameters for clinical data
   * @returns {Promise<Object>} Clinical population data
   */
  async getClinicalPopulation(params = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(params);
      const url = queryString ? `${REPORT_ENDPOINTS.CLINICAL_POPULATION}?${queryString}` : REPORT_ENDPOINTS.CLINICAL_POPULATION;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Clinical population data fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch clinical population data');
    } catch (error) {
      console.error('❌ Get clinical population error:', error);
      throw error;
    }
  }

  /**
   * Get advanced clinical insights
   * @param {Object} params - Optional parameters for clinical insights
   * @returns {Promise<Object>} Advanced clinical insights
   */
  async getAdvancedClinicalInsights(params = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(params);
      const url = queryString ? `${REPORT_ENDPOINTS.CLINICAL_INSIGHTS_ADV}?${queryString}` : REPORT_ENDPOINTS.CLINICAL_INSIGHTS_ADV;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Advanced clinical insights fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch advanced clinical insights');
    } catch (error) {
      console.error('❌ Get advanced clinical insights error:', error);
      throw error;
    }
  }

  // 🔧 UTILITY METHODS

  /**
   * Clear specific cache entry
   * @private
   */
  _clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Set cache entry with timeout
   * @private
   */
  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get cached data if still valid
   * @private
   */
  _getCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
    console.log('✅ Report service cache cleared');
  }

  /**
   * Get real-time updates for specific data
   * @param {string} type - Data type to listen for
   * @param {Function} callback - Callback function for updates
   */
  subscribeToRealtimeUpdates(type, callback) {
    if (!this.realtimeListeners.has(type)) {
      this.realtimeListeners.set(type, new Set());
    }
    this.realtimeListeners.get(type).add(callback);
    
    console.log(`✅ Subscribed to realtime updates for: ${type}`);
  }

  /**
   * Unsubscribe from real-time updates
   * @param {string} type - Data type
   * @param {Function} callback - Callback function to remove
   */
  unsubscribeFromRealtimeUpdates(type, callback) {
    if (this.realtimeListeners.has(type)) {
      this.realtimeListeners.get(type).delete(callback);
    }
    
    console.log(`✅ Unsubscribed from realtime updates for: ${type}`);
  }
}

// 🚀 Create and export singleton instance
const reportService = new ReportService();

export default reportService;
export { REPORT_ENDPOINTS };
