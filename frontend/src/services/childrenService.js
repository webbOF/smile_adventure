/**
 * Children API Service
 * Handles all API calls related to children management for ASD platform
 */

import axiosInstance from './axiosInstance';

/**
 * Children Service - Complete CRUD operations for child management
 */
class ChildrenService {
  /**
   * Get all children for current user (parent)
   * @param {boolean} includeInactive - Include soft-deleted children
   * @returns {Promise<Array>} List of children
   */
  async getChildren(includeInactive = false) {
    try {
      const response = await axiosInstance.get('/users/children', {
        params: { include_inactive: includeInactive }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching children:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific child
   * @param {number} childId - Child ID
   * @returns {Promise<Object>} Child details with activities and progress
   */
  async getChildDetail(childId) {
    try {
      const response = await axiosInstance.get(`/users/children/${childId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching child detail for ID ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new child profile
   * @param {Object} childData - Child creation data
   * @returns {Promise<Object>} Created child
   */
  async createChild(childData) {
    try {
      const response = await axiosInstance.post('/users/children', childData);
      return response.data;
    } catch (error) {
      console.error('Error creating child:', error);
      throw error;
    }
  }

  /**
   * Update existing child profile
   * @param {number} childId - Child ID
   * @param {Object} updateData - Updated child data
   * @returns {Promise<Object>} Updated child
   */
  async updateChild(childId, updateData) {
    try {
      const response = await axiosInstance.put(`/users/children/${childId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating child ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Delete child profile (soft delete for parents, hard delete for admins)
   * @param {number} childId - Child ID
   * @param {boolean} permanent - Permanent deletion (admin only)
   * @returns {Promise<Object>} Success message
   */
  async deleteChild(childId, permanent = false) {
    try {
      const response = await axiosInstance.delete(`/users/children/${childId}`, {
        params: { permanent }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting child ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Get child's activities
   * @param {number} childId - Child ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of activities
   */
  async getChildActivities(childId, options = {}) {
    try {
      const response = await axiosInstance.get(`/users/children/${childId}/activities`, {
        params: {
          limit: options.limit || 50,
          activity_type: options.activityType,
          verified_only: options.verifiedOnly || false
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching activities for child ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Get child's game sessions
   * @param {number} childId - Child ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of game sessions
   */
  async getChildSessions(childId, options = {}) {
    try {
      const response = await axiosInstance.get(`/users/children/${childId}/sessions`, {
        params: {
          limit: options.limit || 20,
          session_type: options.sessionType
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for child ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Get child's progress analytics
   * @param {number} childId - Child ID
   * @param {number} days - Number of days to analyze (default: 30)
   * @returns {Promise<Object>} Progress analytics
   */
  async getChildProgress(childId, days = 30) {
    try {
      const response = await axiosInstance.get(`/users/children/${childId}/progress`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching progress for child ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Add points to child
   * @param {number} childId - Child ID
   * @param {Object} pointsData - Points data (points, activity_type, reason)
   * @returns {Promise<Object>} Points addition result
   */
  async addPoints(childId, pointsData) {
    try {
      const response = await axiosInstance.post(`/users/children/${childId}/points`, pointsData);
      return response.data;
    } catch (error) {
      console.error(`Error adding points to child ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Add progress note to child
   * @param {number} childId - Child ID
   * @param {Object} noteData - Note data (note_text, category)
   * @returns {Promise<Object>} Success response
   */
  async addProgressNote(childId, noteData) {
    try {
      const response = await axiosInstance.post(`/users/children/${childId}/progress-notes`, noteData);
      return response.data;
    } catch (error) {
      console.error(`Error adding progress note to child ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Get child's progress notes
   * @param {number} childId - Child ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Progress notes
   */
  async getProgressNotes(childId, options = {}) {
    try {
      const response = await axiosInstance.get(`/users/children/${childId}/progress-notes`, {
        params: {
          category: options.category,
          limit: options.limit || 50
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching progress notes for child ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Search children with filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Filtered children list
   */
  async searchChildren(filters = {}) {
    try {
      const response = await axiosInstance.get('/users/children/search', {
        params: {
          search_term: filters.searchTerm,
          age_min: filters.ageMin,
          age_max: filters.ageMax,
          support_level: filters.supportLevel,
          diagnosis_keyword: filters.diagnosisKeyword,
          limit: filters.limit || 50
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching children:', error);
      throw error;
    }
  }

  /**
   * Export child data
   * @param {number} childId - Child ID
   * @param {Object} options - Export options
   * @returns {Promise<Blob|Object>} Export data
   */
  async exportChildData(childId, options = {}) {
    try {
      const response = await axiosInstance.get(`/users/children/${childId}/export`, {
        params: {
          format: options.format || 'json',
          include_activities: options.includeActivities !== false,
          include_sessions: options.includeSessions !== false,
          include_notes: options.includeNotes !== false,
          date_from: options.dateFrom,
          date_to: options.dateTo
        },
        responseType: options.format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      console.error(`Error exporting data for child ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Get child profile templates
   * @returns {Promise<Object>} Available templates
   */
  async getProfileTemplates() {
    try {
      const response = await axiosInstance.get('/users/children/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile templates:', error);
      throw error;
    }
  }

  /**
   * Quick child setup (minimal data)
   * @param {Object} basicInfo - Basic child information
   * @returns {Promise<Object>} Created child
   */
  async quickSetup(basicInfo) {
    try {
      const response = await axiosInstance.post('/users/children/quick-setup', basicInfo);
      return response.data;
    } catch (error) {
      console.error('Error in quick child setup:', error);
      throw error;
    }
  }

  /**
   * Get children statistics for current user
   * @returns {Promise<Object>} Children statistics
   */
  async getStatistics() {
    try {
      const response = await axiosInstance.get('/users/children/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching children statistics:', error);
      throw error;
    }
  }

  /**
   * Update child's sensory profile
   * @param {number} childId - Child ID
   * @param {Object} sensoryData - Sensory profile data
   * @returns {Promise<Object>} Success response
   */
  async updateSensoryProfile(childId, sensoryData) {
    try {
      const response = await axiosInstance.put(`/users/children/${childId}/sensory-profile`, sensoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating sensory profile for child ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Get child's sensory profile
   * @param {number} childId - Child ID
   * @param {string} domain - Specific sensory domain (optional)
   * @returns {Promise<Object>} Sensory profile
   */
  async getSensoryProfile(childId, domain = null) {
    try {
      const response = await axiosInstance.get(`/users/children/${childId}/sensory-profile`, {
        params: { domain }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching sensory profile for child ${childId}:`, error);
      throw error;
    }
  }
}

// Create and export singleton instance
const childrenService = new ChildrenService();
export default childrenService;
