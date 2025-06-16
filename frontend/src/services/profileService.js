/**
 * Profile Service - Gestione profilo utente completa
 * Servizio per gestire profilo, avatar, preferenze e completamento profilo
 */

import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';
import notificationService from './notificationService';

/**
 * @typedef {Object} UserProfile
 * @property {number} id
 * @property {string} email
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} full_name
 * @property {string} phone
 * @property {string} timezone
 * @property {string} language
 * @property {string} role
 * @property {string} status
 * @property {boolean} is_active
 * @property {boolean} is_verified
 * @property {string} avatar_url
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Object} professional_info - Se role = professional
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} theme - light|dark|auto
 * @property {string} language
 * @property {string} timezone
 * @property {boolean} email_notifications
 * @property {boolean} push_notifications
 * @property {boolean} sms_notifications
 * @property {Object} privacy_settings
 */

/**
 * @typedef {Object} ProfileCompletion
 * @property {number} completion_percentage
 * @property {Array<string>} missing_fields
 * @property {Array<string>} suggestions
 * @property {boolean} is_complete
 */

export const profileService = {
  /**
   * Get detailed user profile
   * @returns {Promise<UserProfile>}
   */
  async getProfile() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER_PROFILE);
      return response.data;    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching user profile:', error.response?.data || error.message);
      }
      notificationService.showError('Errore nel caricamento del profilo');
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<UserProfile>}
   */
  async updateProfile(profileData) {
    try {
      const backendData = {
        first_name: profileData.firstName || profileData.first_name,
        last_name: profileData.lastName || profileData.last_name,
        phone: profileData.phone,
        timezone: profileData.timezone,
        language: profileData.language
      };

      // Add professional fields if role is professional
      if (profileData.role === 'professional') {
        backendData.license_number = profileData.licenseNumber || profileData.license_number;
        backendData.specialization = profileData.specialization;
        backendData.clinic_name = profileData.clinicName || profileData.clinic_name;
        backendData.clinic_address = profileData.clinicAddress || profileData.clinic_address;
      }

      const response = await axiosInstance.put(API_ENDPOINTS.USER_PROFILE, backendData);
      
      notificationService.showSuccess('Profilo aggiornato con successo');
      return response.data;    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating profile:', error.response?.data || error.message);
      }
      
      if (error.response?.status === 422 && error.response.data?.detail) {
        const validationErrors = error.response.data.detail;
        if (Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map(err => {
            const field = err.loc ? err.loc.join('.') : 'field';
            return `${field}: ${err.msg}`;
          }).join(', ');
          notificationService.showError(`Errori di validazione: ${errorMessages}`);
        }
      } else {
        notificationService.showError('Errore nell\'aggiornamento del profilo');
      }
      
      throw error;
    }
  },

  /**
   * Upload user avatar
   * @param {File} file - Avatar image file
   * @returns {Promise<Object>} Response with avatar URL
   */
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axiosInstance.post(API_ENDPOINTS.USER_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      notificationService.showSuccess('Avatar caricato con successo');
      return response.data;    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error uploading avatar:', error.response?.data || error.message);
      }
      notificationService.showError('Errore nel caricamento dell\'avatar');
      throw error;
    }
  },

  /**
   * Delete user avatar
   * @returns {Promise<Object>}
   */
  async deleteAvatar() {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.USER_AVATAR);
      notificationService.showSuccess('Avatar rimosso con successo');
      return response.data;    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting avatar:', error.response?.data || error.message);
      }
      notificationService.showError('Errore nella rimozione dell\'avatar');
      throw error;
    }
  },

  /**
   * Get user preferences
   * @returns {Promise<UserPreferences>}
   */
  async getPreferences() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER_PREFERENCES);
      return response.data;    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching preferences:', error.response?.data || error.message);
      }
      notificationService.showError('Errore nel caricamento delle preferenze');
      throw error;
    }
  },

  /**
   * Update user preferences
   * @param {UserPreferences} preferences - Preferences to update
   * @returns {Promise<UserPreferences>}
   */
  async updatePreferences(preferences) {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.USER_PREFERENCES, preferences);
      notificationService.showSuccess('Preferenze aggiornate con successo');
      return response.data;    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating preferences:', error.response?.data || error.message);
      }
      notificationService.showError('Errore nell\'aggiornamento delle preferenze');
      throw error;
    }
  },

  /**
   * Get profile completion status
   * @returns {Promise<ProfileCompletion>}
   */
  async getProfileCompletion() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER_PROFILE_COMPLETION);
      return response.data;    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching profile completion:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  /**
   * Transform backend user data to frontend format
   * @param {Object} userData - Backend user data
   * @returns {Object} Frontend formatted user data
   */
  transformUserData(userData) {
    return {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      fullName: userData.full_name,
      phone: userData.phone,
      timezone: userData.timezone,
      language: userData.language,
      role: userData.role,
      status: userData.status,
      isActive: userData.is_active,
      isVerified: userData.is_verified,
      avatarUrl: userData.avatar_url,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      
      // Professional fields
      licenseNumber: userData.license_number,
      specialization: userData.specialization,
      clinicName: userData.clinic_name,
      clinicAddress: userData.clinic_address
    };
  }
};

export default profileService;
