// Frontend service for Report Generation API calls
// This service connects to the backend ReportService

import api from './api';

class ReportGenerationService {  /**
   * Generate progress report for a child
   * @param {number} childId - Child ID
   * @param {string} period - Period (7d, 30d, 90d, 6m, 1y)
   * @returns {Promise<Object>} Progress report data
   */
  async generateProgressReport(childId, period = '30d') {
    try {      // Extract numeric value from period (e.g., "30d" -> 30)
      const periodDays = parseInt(period.replace(/\D/g, ''), 10);
      
      const response = await api.post(`/reports/child/${childId}/generate-report`, {
        report_type: 'progress',
        period_days: periodDays,
        include_recommendations: true,
        include_analytics: true
      });
      return response.data;
    } catch (error) {
      console.error('Error generating progress report:', error);
      throw new Error(`Errore nella generazione del report di progresso: ${error.response?.data?.detail || error.message}`);
    }
  }
  /**
   * Generate summary report for a child
   * @param {number} childId - Child ID
   * @returns {Promise<Object>} Summary report data
   */
  async generateSummaryReport(childId) {
    try {
      const response = await api.post(`/reports/child/${childId}/generate-report`, {
        report_type: 'summary',
        period_days: 30,
        include_recommendations: true,
        include_analytics: true
      });
      return response.data;
    } catch (error) {
      console.error('Error generating summary report:', error);
      throw new Error(`Errore nella generazione del riassunto esecutivo: ${error.response?.data?.detail || error.message}`);
    }
  }
  /**
   * Generate professional report for a child
   * @param {number} childId - Child ID
   * @param {number} professionalId - Professional ID (optional - defaults to current user)
   * @returns {Promise<Object>} Professional report data
   */
  async generateProfessionalReport(childId, professionalId) {
    try {
      const response = await api.post(`/reports/child/${childId}/generate-report`, {
        report_type: 'clinical',
        period_days: 90,
        include_recommendations: true,
        include_analytics: true
      });
      return response.data;
    } catch (error) {
      console.error('Error generating professional report:', error);
      throw new Error(`Errore nella generazione del report professionale: ${error.response?.data?.detail || error.message}`);
    }
  }
  /**
   * Export data for a child
   * @param {number} childId - Child ID
   * @param {string} format - Export format (json, csv)
   * @param {boolean} includeRawData - Include detailed analytics data
   * @returns {Promise<Object>} Export data
   */
  async exportData(childId, format = 'json', includeRawData = false) {
    try {
      const response = await api.get(`/reports/child/${childId}/export`, {
        params: {
          format: format,
          include_analytics: includeRawData,
          include_reports: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error(`Errore nell'esportazione dei dati: ${error.response?.data?.detail || error.message}`);
    }
  }
  /**
   * Get list of available children for reports
   * @returns {Promise<Array>} List of children
   */
  async getAvailableChildren() {
    try {
      const response = await api.get('/users/children');
      return response.data;
    } catch (error) {
      console.error('Error fetching children:', error);
      throw new Error(`Errore nel recupero dei pazienti: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Get current user information for professional reports
   * @returns {Promise<Object>} User information
   */  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new Error(`Errore nel recupero informazioni utente: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Get report generation status
   * @param {string} taskId - Task ID from async report generation
   * @returns {Promise<Object>} Status information
   */
  async getReportStatus(taskId) {
    try {
      const response = await api.get(`/api/reports/status/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking report status:', error);
      throw new Error(`Errore nel controllo stato report: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Download generated report
   * @param {string} reportId - Report ID
   * @param {string} format - Download format
   * @returns {Promise<Blob>} Report file
   */
  async downloadReport(reportId, format = 'pdf') {
    try {
      const response = await api.get(`/api/reports/download/${reportId}`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw new Error(`Errore nel download del report: ${error.response?.data?.detail || error.message}`);
    }
  }
}

export default new ReportGenerationService();
