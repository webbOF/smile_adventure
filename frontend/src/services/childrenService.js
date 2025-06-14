/**
 * Children Service - API calls per gestione bambini ASD
 * Servizio completo per CRUD bambini con integrazione backend FastAPI
 */

import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';
import notificationService from './notificationService';

/**
 * @typedef {Object} Child
 * @property {number} id
 * @property {string} name
 * @property {number} age
 * @property {string} date_of_birth - ISO date string
 * @property {string} gender - 'M' | 'F' | 'Other'
 * @property {string} avatar_url
 * @property {number} parent_id
 * @property {number} points
 * @property {number} level
 * @property {Array} achievements
 * @property {string} diagnosis
 * @property {number} support_level - 1-3 based on DSM-5
 * @property {string} diagnosis_date
 * @property {string} diagnosing_professional
 * @property {Object} sensory_profile - JSON structure
 * @property {string} behavioral_notes
 * @property {string} communication_style
 * @property {string} communication_notes
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ChildCreateRequest
 * @property {string} name
 * @property {number} age
 * @property {string} date_of_birth
 * @property {string} gender
 * @property {string} [avatar_url]
 * @property {string} [diagnosis]
 * @property {number} [support_level]
 * @property {string} [diagnosis_date]
 * @property {string} [diagnosing_professional]
 * @property {Object} [sensory_profile]
 * @property {string} [behavioral_notes]
 * @property {string} [communication_style]
 * @property {string} [communication_notes]
 */

/**
 * @typedef {Object} ChildUpdateRequest
 * @property {string} [name]
 * @property {number} [age]
 * @property {string} [date_of_birth]
 * @property {string} [gender]
 * @property {string} [avatar_url]
 * @property {string} [diagnosis]
 * @property {number} [support_level]
 * @property {string} [diagnosis_date]
 * @property {string} [diagnosing_professional]
 * @property {Object} [sensory_profile]
 * @property {string} [behavioral_notes]
 * @property {string} [communication_style]
 * @property {string} [communication_notes]
 */

/**
 * Children Service
 */
export const childrenService = {
  /**
   * Get all children for current user
   * @param {boolean} [includeInactive=false] - Include inactive children
   * @returns {Promise<Child[]>}
   */
  async getChildren(includeInactive = false) {
    try {      const params = new URLSearchParams();
      if (includeInactive) {
        params.append('include_inactive', 'true');
      }
      
      const queryString = params.toString();
      const url = queryString ? `${API_ENDPOINTS.CHILDREN}?${queryString}` : API_ENDPOINTS.CHILDREN;
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching children:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get child by ID
   * @param {number} childId
   * @returns {Promise<Child>}
   */
  async getChild(childId) {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.CHILDREN}/${childId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching child:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Create new child
   * @param {ChildCreateRequest} childData
   * @returns {Promise<Child>}
   */
  async createChild(childData) {
    try {
      // Transform frontend data to backend format
      const backendData = {
        name: childData.name,
        age: parseInt(childData.age),
        date_of_birth: childData.dateOfBirth || childData.date_of_birth,
        gender: childData.gender,
        avatar_url: childData.avatarUrl || childData.avatar_url,
        diagnosis: childData.diagnosis || '',
        support_level: childData.supportLevel ? parseInt(childData.supportLevel) : null,
        diagnosis_date: childData.diagnosisDate || childData.diagnosis_date,
        diagnosing_professional: childData.diagnosingProfessional || childData.diagnosing_professional,
        sensory_profile: childData.sensoryProfile || childData.sensory_profile || {},
        behavioral_notes: childData.behavioralNotes || childData.behavioral_notes || '',
        communication_style: childData.communicationStyle || childData.communication_style || 'verbal',
        communication_notes: childData.communicationNotes || childData.communication_notes || ''
      };      const response = await axiosInstance.post(API_ENDPOINTS.CHILDREN, backendData);
      
      // Notifica di successo
      notificationService.childCreated(backendData.name);
      
      return response.data;
    } catch (error) {
      console.error('Error creating child:', error.response?.data || error.message);
      throw error;
    }
  },
  /**
   * Transform frontend data to backend format for updates
   * @param {ChildUpdateRequest} childData
   * @returns {Object} Backend formatted data
   */
  _transformUpdateData(childData) {
    const backendData = {};
    
    // Mapping object for field transformations
    const fieldMappings = {
      name: 'name',
      age: (val) => parseInt(val),
      dateOfBirth: 'date_of_birth',
      date_of_birth: 'date_of_birth',
      gender: 'gender',
      avatarUrl: 'avatar_url',
      avatar_url: 'avatar_url',
      diagnosis: 'diagnosis',
      supportLevel: (val) => parseInt(val),
      support_level: 'support_level',
      diagnosisDate: 'diagnosis_date',
      diagnosis_date: 'diagnosis_date',
      diagnosingProfessional: 'diagnosing_professional',
      diagnosing_professional: 'diagnosing_professional',
      sensoryProfile: 'sensory_profile',
      sensory_profile: 'sensory_profile',
      behavioralNotes: 'behavioral_notes',
      behavioral_notes: 'behavioral_notes',
      communicationStyle: 'communication_style',
      communication_style: 'communication_style',
      communicationNotes: 'communication_notes',
      communication_notes: 'communication_notes'
    };

    Object.keys(childData).forEach(key => {
      if (childData[key] !== undefined && fieldMappings[key]) {
        const mapping = fieldMappings[key];
        if (typeof mapping === 'function') {
          backendData[key] = mapping(childData[key]);
        } else if (typeof mapping === 'string') {
          backendData[mapping] = childData[key];
        } else {
          backendData[key] = childData[key];
        }
      }
    });

    return backendData;
  },

  /**
   * Update child
   * @param {number} childId
   * @param {ChildUpdateRequest} childData
   * @returns {Promise<Child>}
   */
  async updateChild(childId, childData) {
    try {
      const backendData = this._transformUpdateData(childData);

      const response = await axiosInstance.put(`${API_ENDPOINTS.CHILDREN}/${childId}`, backendData);
      
      // Notifica di successo
      const childName = backendData.name || childData.name || 'Bambino';
      notificationService.childUpdated(childName);
      
      return response.data;
    } catch (error) {
      console.error('Error updating child:', error.response?.data || error.message);
      throw error;
    }
  },
  /**
   * Delete child
   * @param {number} childId
   * @param {string} [childName] - Nome del bambino per notifica (opzionale)
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async deleteChild(childId, childName = null) {
    try {
      const response = await axiosInstance.delete(`${API_ENDPOINTS.CHILDREN}/${childId}`);
      
      // Notifica di successo
      const name = childName || 'Bambino';
      notificationService.childDeleted(name);
      
      return response.data;
    } catch (error) {
      console.error('Error deleting child:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get child activities
   * @param {number} childId
   * @param {number} [days=30] - Number of days to look back
   * @returns {Promise<Object>}
   */
  async getChildActivities(childId, days = 30) {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.CHILDREN}/${childId}/activities?days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching child activities:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get child progress report
   * @param {number} childId
   * @param {number} [days=30] - Number of days to look back
   * @returns {Promise<Object>}
   */
  async getChildProgress(childId, days = 30) {
    try {
      const response = await axiosInstance.get(`/reports/child/${childId}/progress?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching child progress:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get child game sessions
   * @param {number} childId
   * @param {number} [limit=20] - Number of sessions to fetch
   * @returns {Promise<Object[]>}
   */
  async getChildSessions(childId, limit = 20) {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.CHILDREN}/${childId}/sessions?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching child sessions:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Upload child photo/avatar
   * @param {number} childId
   * @param {File} file
   * @returns {Promise<{avatar_url: string}>}
   */
  async uploadChildPhoto(childId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(
        `${API_ENDPOINTS.CHILDREN}/${childId}/upload-photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading child photo:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Search children with filters
   * @param {Object} filters
   * @param {string} [filters.search] - Search in name
   * @param {string} [filters.gender] - Filter by gender
   * @param {number} [filters.minAge] - Minimum age
   * @param {number} [filters.maxAge] - Maximum age
   * @param {number} [filters.supportLevel] - Support level filter
   * @param {number} [filters.page=1] - Page number
   * @param {number} [filters.limit=20] - Items per page
   * @returns {Promise<{children: Child[], total: number, page: number, pages: number}>}
   */
  async searchChildren(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.minAge) params.append('min_age', filters.minAge.toString());
      if (filters.maxAge) params.append('max_age', filters.maxAge.toString());
      if (filters.supportLevel) params.append('support_level', filters.supportLevel.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.CHILDREN}/search?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching children:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Named exports for individual functions
export const {
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
  getChildActivities,
  getChildProgress,
  getChildSessions,
  uploadChildPhoto,
  searchChildren
} = childrenService;

// Default export
export default childrenService;
