/**
 * Authentication Service for Smile Adventure
 * Handles login, registration, token management, and user profile operations
 */

import api, { ApiUtils } from './api';
import { API_ENDPOINTS } from '../types/api';

/**
 * Authentication Service
 * @typedef {import('../types/api').AuthResponse} AuthResponse
 * @typedef {import('../types/api').LoginCredentials} LoginCredentials
 * @typedef {import('../types/api').RegisterUserData} RegisterUserData
 * @typedef {import('../types/api').AuthUser} AuthUser
 */
class AuthService {
    /**
   * Login user with credentials
   * @param {LoginCredentials} credentials - User credentials
   * @returns {Promise<AuthResponse>} Authentication response
   */
  async login(credentials) {
    try {
      // Create FormData for login request as backend expects form data
      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);
      
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const { user, token, refresh_token } = response.data;
      
      // Store refresh token separately for security
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }
      
      return { user, token, refresh_token };
    } catch (error) {
      throw this.handleError(error, 'Login fallito');
    }
  }

  /**
   * Register new user
   * @param {RegisterUserData} userData - User registration data
   * @returns {Promise<AuthResponse>} Authentication response
   */  async register(userData) {
    try {
      // Validate password confirmation - check both possible field names
      const confirmPassword = userData.confirmPassword || userData.password_confirm;
      if (userData.password !== confirmPassword) {
        console.error('AuthService Error: Password mismatch', {
          password: userData.password,
          confirmPassword: confirmPassword,
          userData: userData
        });
        throw new Error('Le password non coincidono');      }
      
      // Remove only the confirmPassword field, keep password_confirm for backend
      const { confirmPassword: removeConfirm, ...registrationData } = userData;
      
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, registrationData);
      const { user, token, refresh_token } = response.data;
      
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }
      
      return { user, token, refresh_token };
    } catch (error) {
      console.error('AuthService Error:', error);
      throw this.handleError(error, 'Registrazione fallita');
    }
  }

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Attempt to notify server of logout
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Server logout failed:', error.message);
    } finally {
      // Always clear local storage
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('smile-adventure-auth');
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<AuthUser>} Current user data
   */
  async getCurrentUser() {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      return response.data.user || response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare i dati utente');
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<AuthResponse>} New authentication data
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('Nessun token di refresh disponibile');
      }
      
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken,
      });
      
      const { user, token, refresh_token: newRefreshToken } = response.data;
      
      // Update refresh token if provided
      if (newRefreshToken && newRefreshToken !== refreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }
      
      return { user, token, refresh_token: newRefreshToken };
    } catch (error) {
      // Clear invalid refresh token
      localStorage.removeItem('refresh_token');
      throw this.handleError(error, 'Impossibile aggiornare il token');
    }
  }

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<AuthUser>} Updated user data
   */
  async updateProfile(userData) {
    try {
      const response = await api.put(API_ENDPOINTS.AUTH.PROFILE, userData);
      return response.data.user || response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile aggiornare il profilo');
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @param {string} passwordData.confirmPassword - Password confirmation
   * @returns {Promise<Object>} Success response
   */
  async changePassword(passwordData) {
    try {
      // Validate password confirmation
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Le nuove password non coincidono');
      }
      
      const response = await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile cambiare la password');
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Success response
   */
  async requestPasswordReset(email) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile inviare email di reset');
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Password confirmation
   * @returns {Promise<Object>} Success response
   */
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Le password non coincidono');
      }
      
      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        new_password: newPassword,
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile resettare la password');
    }
  }

  /**
   * Upload user avatar
   * @param {File} avatarFile - Avatar image file
   * @returns {Promise<Object>} Updated user data with new avatar URL
   */
  async uploadAvatar(avatarFile) {
    try {
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
   * Update user preferences
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await api.put(API_ENDPOINTS.USERS.PREFERENCES, preferences);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile aggiornare le preferenze');
    }
  }

  /**
   * Check if user has valid session
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated() {
    try {
      const authData = localStorage.getItem('smile-adventure-auth');
      if (!authData) return false;
      
      const parsed = JSON.parse(authData);
      return !!(parsed.state?.token && parsed.state?.isAuthenticated);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user from localStorage
   * @returns {AuthUser|null} Current user or null
   */
  getCurrentUserFromStorage() {
    try {
      const authData = localStorage.getItem('smile-adventure-auth');
      if (!authData) return null;
      
      const parsed = JSON.parse(authData);
      return parsed.state?.user || null;
    } catch (error) {
      return null;
    }
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
    console.error('AuthService Error:', {
      message,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error.message,
    });
    
    return new Error(message);
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if email is valid
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with errors
   */
  validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('La password deve contenere almeno 8 caratteri');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La password deve contenere almeno una lettera maiuscola');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La password deve contenere almeno una lettera minuscola');
    }
    
    if (!/\d/.test(password)) {
      errors.push('La password deve contenere almeno un numero');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Create and export singleton instance
const authService = new AuthService();

export default authService;
export { authService, AuthService };
