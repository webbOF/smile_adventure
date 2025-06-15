/**
 * Reports Service
 * Gestisce tutte le chiamate API relative ai reports e analytics
 */

import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * @typedef {Object} ReportsDashboard
 * @property {number} total_children
 * @property {number} total_activities
 * @property {number} total_points
 * @property {number} total_sessions
 * @property {Array} children_stats
 * @property {Array} recent_activities
 * @property {Object} weekly_progress
 */

/**
 * @typedef {Object} ChildProgress
 * @property {Object} child
 * @property {Object} period
 * @property {Object} activities_by_type
 * @property {Object} daily_points
 * @property {Array} sessions
 * @property {Array} achievements
 */

/**
 * @typedef {Object} GameSession
 * @property {number} id
 * @property {number} child_id
 * @property {string} session_type
 * @property {string} scenario_name
 * @property {string} started_at
 * @property {string} ended_at
 * @property {number} duration_seconds
 * @property {number} score
 * @property {string} completion_status
 */

/**
 * Reports Service Object
 */
export const reportsService = {
  /**
   * Get reports dashboard overview
   * @returns {Promise<ReportsDashboard>}
   */
  async getDashboard() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.DASHBOARD);
      return response.data;
    } catch (error) {
      console.error('Reports dashboard error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get child progress report
   * @param {number} childId - ID del bambino
   * @param {Object} params - Parametri opzionali
   * @param {number} params.days - Numero di giorni (default: 30)
   * @param {string} params.start_date - Data inizio periodo
   * @param {string} params.end_date - Data fine periodo
   * @returns {Promise<ChildProgress>}
   */
  async getChildProgress(childId, params = {}) {
    try {
      const defaultParams = {
        days: 30,
        ...params
      };
      
      const response = await axiosInstance.get(
        API_ENDPOINTS.REPORTS.CHILD_PROGRESS(childId),
        { params: defaultParams }
      );
      return response.data;
    } catch (error) {
      console.error('Child progress error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get child summary report
   * @param {number} childId - ID del bambino
   * @returns {Promise<Object>}
   */
  async getChildSummary(childId) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.CHILD_SUMMARY(childId));
      return response.data;
    } catch (error) {
      console.error('Child summary error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get child analytics
   * @param {number} childId - ID del bambino
   * @param {Object} params - Parametri opzionali
   * @returns {Promise<Object>}
   */
  async getChildAnalytics(childId, params = {}) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.REPORTS.CHILD_ANALYTICS(childId),
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Child analytics error:', error.response?.data || error.message);
      throw error;
    }
  },

  // =====================================================================
  // GAME SESSIONS MANAGEMENT
  // =====================================================================

  /**
   * Create new game session
   * @param {Object} sessionData - Dati della sessione
   * @param {number} sessionData.child_id - ID del bambino
   * @param {string} sessionData.session_type - Tipo sessione
   * @param {string} sessionData.scenario_name - Nome scenario
   * @param {string} sessionData.scenario_id - ID scenario
   * @returns {Promise<GameSession>}
   */
  async createGameSession(sessionData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.REPORTS.SESSIONS, sessionData);
      return response.data;
    } catch (error) {
      console.error('Create game session error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get game session by ID
   * @param {number} sessionId - ID della sessione
   * @returns {Promise<GameSession>}
   */
  async getGameSession(sessionId) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.SESSION_BY_ID(sessionId));
      return response.data;
    } catch (error) {
      console.error('Get game session error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update game session
   * @param {number} sessionId - ID della sessione
   * @param {Object} updateData - Dati da aggiornare
   * @returns {Promise<GameSession>}
   */
  async updateGameSession(sessionId, updateData) {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.REPORTS.SESSION_BY_ID(sessionId),
        updateData
      );
      return response.data;
    } catch (error) {
      console.error('Update game session error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Complete game session
   * @param {number} sessionId - ID della sessione
   * @param {Object} completionData - Dati di completamento
   * @param {number} completionData.score - Punteggio finale
   * @param {number} completionData.levels_completed - Livelli completati
   * @param {string} completionData.completion_status - Stato completamento
   * @returns {Promise<GameSession>}
   */
  async completeGameSession(sessionId, completionData) {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.REPORTS.SESSION_COMPLETE(sessionId),
        completionData
      );
      return response.data;
    } catch (error) {
      console.error('Complete game session error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * End game session
   * @param {number} sessionId - ID della sessione
   * @returns {Promise<GameSession>}
   */
  async endGameSession(sessionId) {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.REPORTS.SESSION_END(sessionId));
      return response.data;
    } catch (error) {
      console.error('End game session error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get game sessions for child
   * @param {number} childId - ID del bambino
   * @param {Object} params - Parametri opzionali
   * @param {number} params.limit - Limite risultati
   * @param {number} params.offset - Offset paginazione
   * @param {string} params.status - Filtro per status
   * @returns {Promise<Array<GameSession>>}
   */
  async getChildGameSessions(childId, params = {}) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.REPORTS.CHILD_SESSIONS(childId),
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Get child game sessions error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get session analytics
   * @param {number} sessionId - ID della sessione
   * @returns {Promise<Object>}
   */
  async getSessionAnalytics(sessionId) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.SESSION_ANALYTICS(sessionId));
      return response.data;
    } catch (error) {
      console.error('Session analytics error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get session trends for child
   * @param {number} childId - ID del bambino
   * @param {Object} params - Parametri opzionali
   * @returns {Promise<Object>}
   */
  async getSessionTrends(childId, params = {}) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.REPORTS.SESSION_TRENDS(childId),
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Session trends error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete game session
   * @param {number} sessionId - ID della sessione
   * @returns {Promise<void>}
   */
  async deleteGameSession(sessionId) {
    try {
      await axiosInstance.delete(API_ENDPOINTS.REPORTS.SESSION_BY_ID(sessionId));
    } catch (error) {
      console.error('Delete game session error:', error.response?.data || error.message);
      throw error;
    }
  },

  // =====================================================================
  // REPORTS MANAGEMENT
  // =====================================================================

  /**
   * Create new report
   * @param {Object} reportData - Dati del report
   * @returns {Promise<Object>}
   */
  async createReport(reportData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.REPORTS.REPORTS, reportData);
      return response.data;
    } catch (error) {
      console.error('Create report error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get report by ID
   * @param {number} reportId - ID del report
   * @returns {Promise<Object>}
   */
  async getReport(reportId) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.REPORT_BY_ID(reportId));
      return response.data;
    } catch (error) {
      console.error('Get report error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get all reports for user
   * @param {Object} params - Parametri opzionali
   * @returns {Promise<Array>}
   */
  async getReports(params = {}) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.REPORTS, { params });
      return response.data;
    } catch (error) {
      console.error('Get reports error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update report
   * @param {number} reportId - ID del report
   * @param {Object} updateData - Dati da aggiornare
   * @returns {Promise<Object>}
   */
  async updateReport(reportId, updateData) {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.REPORTS.REPORT_BY_ID(reportId),
        updateData
      );
      return response.data;
    } catch (error) {
      console.error('Update report error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Generate report for child
   * @param {number} childId - ID del bambino
   * @param {Object} reportConfig - Configurazione report
   * @returns {Promise<Object>}
   */
  async generateChildReport(childId, reportConfig = {}) {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.REPORTS.GENERATE_CHILD_REPORT(childId),
        reportConfig
      );
      return response.data;
    } catch (error) {
      console.error('Generate child report error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Export child data
   * @param {number} childId - ID del bambino
   * @param {Object} params - Parametri export
   * @returns {Promise<Blob>}
   */
  async exportChildData(childId, params = {}) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.REPORTS.EXPORT_CHILD(childId),
        { 
          params,
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Export child data error:', error.response?.data || error.message);
      throw error;
    }
  },

  // =====================================================================
  // ANALYTICS (Professional Features)
  // =====================================================================

  /**
   * Get population analytics (Professional only)
   * @param {Object} params - Parametri opzionali
   * @returns {Promise<Object>}
   */
  async getPopulationAnalytics(params = {}) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.POPULATION_ANALYTICS, { params });
      return response.data;
    } catch (error) {
      console.error('Population analytics error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get clinical insights (Professional only)
   * @param {Object} params - Parametri opzionali
   * @returns {Promise<Object>}
   */
  async getClinicalInsights(params = {}) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.CLINICAL_INSIGHTS, { params });
      return response.data;
    } catch (error) {
      console.error('Clinical insights error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get treatment effectiveness analytics (Professional only)
   * @param {Object} params - Parametri opzionali
   * @returns {Promise<Object>}
   */
  async getTreatmentEffectiveness(params = {}) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.TREATMENT_EFFECTIVENESS, { params });
      return response.data;
    } catch (error) {
      console.error('Treatment effectiveness error:', error.response?.data || error.message);
      throw error;
    }
  },
  /**
   * Export analytics data (Professional only)
   * @param {Object} params - Parametri export
   * @returns {Promise<Blob>}
   */
  async exportAnalytics(params = {}) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.REPORTS.EXPORT_ANALYTICS,
        { 
          params,
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Export analytics error:', error.response?.data || error.message);
      throw error;
    }
  },

  // =====================================================================
  // EXPORT FUNCTIONS
  // =====================================================================

  /**
   * Export report data in specified format
   * @param {Object} exportData - Dati per l'export
   * @param {string} exportData.type - Formato export (pdf, excel, csv)
   * @param {Object} exportData.filters - Filtri applicati
   * @param {Object} exportData.data - Dati da esportare
   * @param {string} exportData.user_role - Ruolo utente
   * @returns {Promise<Blob>}
   */
  async exportReport(exportData) {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.REPORTS.EXPORT,
        exportData,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Export report error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Export dashboard data
   * @param {string} format - Formato export (pdf, excel, csv)
   * @param {Object} filters - Filtri applicati
   * @returns {Promise<Blob>}
   */
  async exportDashboard(format = 'pdf', filters = {}) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.REPORTS.EXPORT_DASHBOARD,
        { 
          params: { format, ...filters },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Export dashboard error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Export child progress data
   * @param {number} childId - ID del bambino
   * @param {string} format - Formato export (pdf, excel, csv)
   * @param {Object} filters - Filtri applicati
   * @returns {Promise<Blob>}
   */
  async exportChildProgress(childId, format = 'pdf', filters = {}) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.REPORTS.EXPORT_CHILD_PROGRESS(childId),
        { 
          params: { format, ...filters },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Export child progress error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Export session data
   * @param {number} sessionId - ID della sessione
   * @param {string} format - Formato export (pdf, excel, csv)
   * @returns {Promise<Blob>}
   */
  async exportSession(sessionId, format = 'pdf') {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.REPORTS.EXPORT_SESSION(sessionId),
        { 
          params: { format },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Export session error:', error.response?.data || error.message);
      throw error;
    }
  },

  // =====================================================================
  // UTILITY FUNCTIONS
  // =====================================================================

  /**
   * Generate download link for blob data
   * @param {Blob} blob - Blob data
   * @param {string} filename - Nome file
   * @param {string} mimeType - Tipo MIME
   */
  downloadFile(blob, filename, mimeType = 'application/octet-stream') {
    const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Format date for filename
   * @param {Date} date - Data da formattare
   * @returns {string}
   */
  formatDateForFilename(date = new Date()) {
    return date.toISOString().split('T')[0];
  },

  /**
   * Generate filename for export
   * @param {string} type - Tipo export
   * @param {string} format - Formato file
   * @param {string} suffix - Suffisso opzionale
   * @returns {string}
   */
  generateFilename(type = 'report', format = 'pdf', suffix = '') {
    const date = this.formatDateForFilename();
    const suffixPart = suffix ? `_${suffix}` : '';
    return `smile_adventure_${type}${suffixPart}_${date}.${format}`;
  }
};

export default reportsService;
