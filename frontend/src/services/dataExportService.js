/**
 * Data Export Service
 * Handles user data export functionality
 */

import axiosInstance from './axiosInstance';

class DataExportService {
  /**
   * Request user data export
   * @param {string} format - Export format (json, csv, pdf)
   * @param {Object} options - Export options
   */
  async requestExport(format = 'json', options = {}) {
    try {
      const response = await axiosInstance.post('/api/v1/users/export', {
        format,
        ...options
      });
      
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error requesting data export:', error);
      }
      throw error;
    }
  }

  /**
   * Download exported data
   * @param {string} exportId - ID of the export request
   */
  async downloadExport(exportId) {
    try {
      const response = await axiosInstance.get(`/api/v1/users/export/${exportId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'smile_adventure_data.json';
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) {
          filename = match[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error downloading export:', error);
      }
      throw error;
    }
  }

  /**
   * Get export history
   */
  async getExportHistory() {
    try {
      const response = await axiosInstance.get('/api/v1/users/export/history');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching export history:', error);
      }
      throw error;
    }
  }

  /**
   * Cancel an export request
   * @param {string} exportId - ID of the export to cancel
   */
  async cancelExport(exportId) {
    try {
      const response = await axiosInstance.delete(`/api/v1/users/export/${exportId}`);
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error canceling export:', error);
      }
      throw error;
    }
  }

  /**
   * Export specific data types
   * @param {Array} dataTypes - Types of data to export (profile, children, activities, etc.)
   * @param {string} format - Export format
   */
  async exportSpecificData(dataTypes = [], format = 'json') {
    try {
      const response = await axiosInstance.post('/api/v1/users/export/selective', {
        data_types: dataTypes,
        format
      });
      
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error exporting specific data:', error);
      }
      throw error;
    }
  }

  /**
   * Get available export formats and data types
   */
  async getExportOptions() {
    try {
      const response = await axiosInstance.get('/api/v1/users/export/options');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching export options:', error);
      }
      // Return defaults if API not available
      return {
        formats: ['json', 'csv', 'pdf'],
        data_types: ['profile', 'children', 'activities', 'progress', 'reports']
      };
    }
  }
}

const dataExportService = new DataExportService();
export default dataExportService;
