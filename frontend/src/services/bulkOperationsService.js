/**
 * Bulk Operations Service
 * Servizio per operazioni bulk sui bambini
 */

import axiosInstance from './axiosInstance';

class BulkOperationsService {
  /**
   * Aggiornamento bulk di bambini
   * @param {Array} childrenIds - Array di ID bambini
   * @param {Object} updates - Oggetto con gli aggiornamenti da applicare
   */
  async bulkUpdateChildren(childrenIds, updates) {
    try {
      const response = await axiosInstance.put('/api/v1/users/children/bulk-update', {
        child_ids: childrenIds,
        updates
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Bulk update completed:', response.data);
      }
      
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in bulk update:', error);
      }
      throw error;
    }
  }

  /**
   * Export bulk di bambini
   * @param {Array} childrenIds - Array di ID bambini
   * @param {string} format - Formato export (json, csv, pdf)
   * @param {Object} options - Opzioni aggiuntive per l'export
   */
  async bulkExportChildren(childrenIds, format = 'json', options = {}) {
    try {
      const response = await axiosInstance.post('/api/v1/users/children/bulk-export', {
        child_ids: childrenIds,
        format,
        options: {
          include_progress: true,
          include_sessions: true,
          include_notes: true,
          date_range: 'all',
          ...options
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Bulk export initiated:', response.data);
      }

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in bulk export:', error);
      }
      throw error;
    }
  }

  /**
   * Archiviazione bulk di bambini
   * @param {Array} childrenIds - Array di ID bambini
   * @param {Object} options - Opzioni per l'archiviazione
   */
  async bulkArchiveChildren(childrenIds, options = {}) {
    try {
      const response = await axiosInstance.put('/api/v1/users/children/bulk-archive', {
        child_ids: childrenIds,
        archive_reason: options.reason || 'bulk_operation',
        notify_parents: options.notifyParents || false,
        retain_data: options.retainData !== false // default true
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Bulk archive completed:', response.data);
      }

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in bulk archive:', error);
      }
      throw error;
    }
  }

  /**
   * Applicazione template bulk
   * @param {Array} childrenIds - Array di ID bambini
   * @param {string} templateId - ID del template da applicare
   * @param {Object} options - Opzioni per l'applicazione template
   */
  async bulkApplyTemplate(childrenIds, templateId, options = {}) {
    try {
      const response = await axiosInstance.post('/api/v1/users/children/bulk-apply-template', {
        child_ids: childrenIds,
        template_id: templateId,
        overwrite_existing: options.overwriteExisting || false,
        preserve_custom_data: options.preserveCustomData !== false, // default true
        apply_to: options.applyTo || ['sensory_profile', 'goals', 'preferences']
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Bulk template application completed:', response.data);
      }

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in bulk template application:', error);
      }
      throw error;
    }
  }

  /**
   * Condivisione bulk di bambini
   * @param {Array} childrenIds - Array di ID bambini
   * @param {Object} shareOptions - Opzioni di condivisione
   */
  async bulkShareChildren(childrenIds, shareOptions) {
    try {
      const response = await axiosInstance.post('/api/v1/users/children/bulk-share', {
        child_ids: childrenIds,
        share_with: shareOptions.shareWith, // email or user_id
        permissions: shareOptions.permissions || ['read'],
        expiry_date: shareOptions.expiryDate,
        message: shareOptions.message || '',
        include_progress: shareOptions.includeProgress !== false,
        include_sessions: shareOptions.includeSessions !== false
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Bulk share completed:', response.data);
      }

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in bulk share:', error);
      }
      throw error;
    }
  }

  /**
   * Ricerca avanzata bambini
   * @param {Object} filters - Filtri di ricerca
   * @param {Object} pagination - Opzioni di paginazione
   */
  async searchChildren(filters = {}, pagination = {}) {
    try {
      const params = new URLSearchParams();
      
      // Age range filters
      if (filters.minAge) params.append('min_age', filters.minAge);
      if (filters.maxAge) params.append('max_age', filters.maxAge);
      
      // Diagnosis filters
      if (filters.diagnosis) params.append('diagnosis', filters.diagnosis);
      if (filters.severityLevel) params.append('severity_level', filters.severityLevel);
      
      // Progress level filters
      if (filters.minProgressLevel) params.append('min_progress_level', filters.minProgressLevel);
      if (filters.maxProgressLevel) params.append('max_progress_level', filters.maxProgressLevel);
      
      // Date filters
      if (filters.createdAfter) params.append('created_after', filters.createdAfter);
      if (filters.createdBefore) params.append('created_before', filters.createdBefore);
      if (filters.lastActivityAfter) params.append('last_activity_after', filters.lastActivityAfter);
      
      // Activity filters
      if (filters.hasActiveSessions !== undefined) params.append('has_active_sessions', filters.hasActiveSessions);
      if (filters.completedActivities !== undefined) params.append('min_completed_activities', filters.completedActivities);
      
      // Custom field filters
      if (filters.customFields) {
        Object.entries(filters.customFields).forEach(([key, value]) => {
          params.append(`custom_${key}`, value);
        });
      }
      
      // Pagination
      params.append('page', pagination.page || 1);
      params.append('per_page', pagination.perPage || 20);
      params.append('sort_by', pagination.sortBy || 'created_at');
      params.append('sort_order', pagination.sortOrder || 'desc');

      const response = await axiosInstance.get(`/api/v1/users/children/search?${params}`);

      if (process.env.NODE_ENV === 'development') {
        console.log('Advanced search completed:', response.data);
      }

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in advanced search:', error);
      }
      throw error;
    }
  }

  /**
   * Ottieni statistiche per operazioni bulk
   * @param {Array} childrenIds - Array di ID bambini
   */
  async getBulkStatistics(childrenIds) {
    try {
      const response = await axiosInstance.post('/api/v1/users/children/bulk-statistics', {
        child_ids: childrenIds
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Bulk statistics retrieved:', response.data);
      }

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error retrieving bulk statistics:', error);
      }
      throw error;
    }
  }
}

const bulkOperationsService = new BulkOperationsService();
export default bulkOperationsService;
