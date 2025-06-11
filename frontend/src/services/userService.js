/**
 * User Service for Smile Adventure
 * Handles user profile management, children management, and user preferences
 */

import api, { ApiUtils } from './api';
import { API_ENDPOINTS } from '../types/api';

/**
 * User Management Service
 * @typedef {import('../types/api').UserProfile} UserProfile
 * @typedef {import('../types/api').UpdateUserProfile} UpdateUserProfile
 * @typedef {import('../types/api').Child} Child
 * @typedef {import('../types/api').CreateChildData} CreateChildData
 * @typedef {import('../types/api').UpdateChildData} UpdateChildData
 * @typedef {import('../types/api').UserPreferences} UserPreferences
 */
class UserService {

  // ================================
  // USER PROFILE MANAGEMENT
  // ================================

  /**
   * Get current user profile
   * @returns {Promise<UserProfile>} User profile data
   */
  async getProfile() {
    try {
      const response = await api.get(API_ENDPOINTS.USERS.PROFILE);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare il profilo utente');
    }
  }

  /**
   * Update user profile
   * @param {UpdateUserProfile} profileData - Updated profile data
   * @returns {Promise<UserProfile>} Updated user profile
   */
  async updateProfile(profileData) {
    try {
      // Handle file upload if avatar is included
      if (profileData.avatar instanceof File) {
        const avatarData = await this.uploadAvatar(profileData.avatar);
        profileData = { ...profileData, avatar: avatarData.avatar_url };
      }

      const response = await api.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile aggiornare il profilo');
    }
  }

  /**
   * Upload user avatar
   * @param {File} avatarFile - Avatar image file
   * @returns {Promise<Object>} Upload result with avatar URL
   */
  async uploadAvatar(avatarFile) {
    try {
      // Validate file type
      if (!this.isValidImageFile(avatarFile)) {
        throw new Error('Il file deve essere un\'immagine (JPG, PNG, GIF)');
      }

      // Validate file size (max 5MB)
      if (avatarFile.size > 5 * 1024 * 1024) {
        throw new Error('Il file deve essere inferiore a 5MB');
      }

      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await api.post(API_ENDPOINTS.USERS.AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile caricare l\'avatar');
    }
  }

  /**
   * Get user preferences
   * @returns {Promise<UserPreferences>} User preferences
   */
  async getPreferences() {
    try {
      const response = await api.get(API_ENDPOINTS.USERS.PREFERENCES);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare le preferenze');
    }
  }

  /**
   * Update user preferences
   * @param {UserPreferences} preferences - Updated preferences
   * @returns {Promise<UserPreferences>} Updated preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await api.put(API_ENDPOINTS.USERS.PREFERENCES, preferences);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile aggiornare le preferenze');
    }
  }

  // ================================
  // CHILDREN MANAGEMENT
  // ================================

  /**
   * Get all children for current user
   * @returns {Promise<Child[]>} List of children
   */
  async getChildren() {
    try {
      const response = await api.get(API_ENDPOINTS.CHILDREN.LIST);
      return response.data.children || response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare la lista dei bambini');
    }
  }

  /**
   * Get specific child by ID
   * @param {number} childId - Child ID
   * @returns {Promise<Child>} Child data
   */
  async getChild(childId) {
    try {
      const response = await api.get(API_ENDPOINTS.CHILDREN.GET(childId));
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare i dati del bambino');
    }
  }

  /**
   * Create new child profile
   * @param {CreateChildData} childData - New child data
   * @returns {Promise<Child>} Created child
   */
  async createChild(childData) {
    try {
      // Validate child data
      this.validateChildData(childData);

      const response = await api.post(API_ENDPOINTS.CHILDREN.CREATE, childData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile creare il profilo del bambino');
    }
  }

  /**
   * Update child profile
   * @param {number} childId - Child ID
   * @param {UpdateChildData} childData - Updated child data
   * @returns {Promise<Child>} Updated child
   */
  async updateChild(childId, childData) {
    try {
      // Validate child data
      this.validateChildData(childData, false);

      const response = await api.put(API_ENDPOINTS.CHILDREN.UPDATE(childId), childData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile aggiornare il profilo del bambino');
    }
  }

  /**
   * Delete child profile
   * @param {number} childId - Child ID
   * @returns {Promise<void>}
   */
  async deleteChild(childId) {
    try {
      await api.delete(API_ENDPOINTS.CHILDREN.DELETE(childId));
    } catch (error) {
      throw this.handleError(error, 'Impossibile eliminare il profilo del bambino');
    }
  }

  /**
   * Get child statistics
   * @param {number} childId - Child ID
   * @returns {Promise<Object>} Child statistics
   */
  async getChildStats(childId) {
    try {
      const response = await api.get(API_ENDPOINTS.CHILDREN.STATS(childId));
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare le statistiche del bambino');
    }
  }

  // ================================
  // PROFESSIONAL SPECIFIC METHODS (for professionals accessing patient data)
  // ================================

  /**
   * Get patients for current professional
   * @param {Object} [filters] - Query filters
   * @returns {Promise<Child[]>} List of patients
   */
  async getPatients(filters = {}) {
    try {
      const params = ApiUtils.formatParams(filters);
      const response = await api.get(API_ENDPOINTS.PROFESSIONAL.PATIENTS, { params });
      return response.data.patients || response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare la lista dei pazienti');
    }
  }

  /**
   * Get specific patient data (for professionals)
   * @param {number} childId - Child/Patient ID
   * @returns {Promise<Child>} Patient data with clinical information
   */
  async getPatient(childId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.PROFESSIONAL.PATIENTS}/${childId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare i dati del paziente');
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Validate child data
   * @param {Object} childData - Child data to validate
   * @param {boolean} isRequired - Whether all fields are required
   * @throws {Error} Validation error
   */
  validateChildData(childData, isRequired = true) {
    const errors = [];

    if (isRequired && !childData.name?.trim()) {
      errors.push('Il nome del bambino è obbligatorio');
    }

    if (childData.name && childData.name.trim().length < 2) {
      errors.push('Il nome deve contenere almeno 2 caratteri');
    }

    if (isRequired && !childData.dateOfBirth) {
      errors.push('La data di nascita è obbligatoria');
    }

    if (childData.dateOfBirth) {
      const birthDate = new Date(childData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (birthDate > today) {
        errors.push('La data di nascita non può essere nel futuro');
      }
      
      if (age > 18) {
        errors.push('L\'età del bambino deve essere inferiore a 18 anni');
      }
      
      if (age < 0) {
        errors.push('Data di nascita non valida');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Check if file is valid image
   * @param {File} file - File to validate
   * @returns {boolean} True if valid image
   */
  isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    return validTypes.includes(file.type);
  }

  /**
   * Calculate age from birth date
   * @param {string} dateOfBirth - Birth date (YYYY-MM-DD)
   * @returns {number} Age in years
   */
  calculateAge(dateOfBirth) {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Format child display data
   * @param {Child} child - Child data
   * @returns {Child} Child with computed fields
   */
  formatChildData(child) {
    return {
      ...child,
      age: this.calculateAge(child.dateOfBirth),
      displayName: child.name,
      avatarDisplay: child.avatar || '👶',
    };
  }

  /**
   * Handle API errors with meaningful messages
   * @param {Error} error - Original error
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error
   */
  handleError(error, defaultMessage = 'Si è verificato un errore') {
    const message = ApiUtils.getErrorMessage(error) || defaultMessage;
    
    // Log error for debugging
    console.error('UserService Error:', {
      message,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error.message,
    });
    
    return new Error(message);
  }

  // ================================
  // SEARCH AND FILTERING
  // ================================

  /**
   * Search children by name
   * @param {string} query - Search query
   * @param {Child[]} children - Children to search
   * @returns {Child[]} Filtered children
   */
  searchChildren(query, children) {
    if (!query.trim()) return children;
    
    const searchTerm = query.toLowerCase().trim();
    return children.filter(child => 
      child.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Filter children by age range
   * @param {number} minAge - Minimum age
   * @param {number} maxAge - Maximum age
   * @param {Child[]} children - Children to filter
   * @returns {Child[]} Filtered children
   */
  filterChildrenByAge(minAge, maxAge, children) {
    return children.filter(child => {
      const age = this.calculateAge(child.dateOfBirth);
      return age >= minAge && age <= maxAge;
    });
  }

  /**
   * Sort children by various criteria
   * @param {Child[]} children - Children to sort
   * @param {string} sortBy - Sort criteria ('name', 'age', 'level', 'points')
   * @param {string} order - Sort order ('asc', 'desc')
   * @returns {Child[]} Sorted children
   */
  sortChildren(children, sortBy = 'name', order = 'asc') {
    const sorted = [...children].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'age':
          aValue = this.calculateAge(a.dateOfBirth);
          bValue = this.calculateAge(b.dateOfBirth);
          break;
        case 'level':
          aValue = a.level || 0;
          bValue = b.level || 0;
          break;
        case 'points':
          aValue = a.totalPoints || 0;
          bValue = b.totalPoints || 0;
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }
}

// Create and export singleton instance
const userService = new UserService();

export default userService;
export { userService, UserService };
