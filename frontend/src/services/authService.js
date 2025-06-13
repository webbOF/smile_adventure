/**
 * Authentication Service
 * Gestisce tutte le chiamate API relative all'autenticazione
 */

import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * @typedef {Object} UserLoginRequest
 * @property {string} email
 * @property {string} password
 * @property {boolean} [remember_me=false]
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} access_token
 * @property {string} token_type
 * @property {string} refresh_token
 * @property {User} user
 */

/**
 * @typedef {Object} UserRegister
 * @property {string} email
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} [phone]
 * @property {string} [timezone='UTC']
 * @property {string} [language='en']
 * @property {string} password
 * @property {string} password_confirm
 * @property {string} [role='PARENT']
 * @property {string} [license_number] - Per role PROFESSIONAL
 * @property {string} [specialization] - Per role PROFESSIONAL
 * @property {string} [clinic_name] - Per role PROFESSIONAL
 * @property {string} [clinic_address] - Per role PROFESSIONAL
 */

/**
 * @typedef {Object} RegisterResponse
 * @property {User} user
 * @property {string} [access_token] - Se auto-login attivo
 * @property {string} [refresh_token] - Se auto-login attivo
 */

/**
 * Authentication Service
 */
export const authService = {  /**
   * Login user
   * @param {UserLoginRequest} credentials
   * @returns {Promise<LoginResponse>}
   */
  async login(credentials) {
    try {
      // FastAPI OAuth2 expects form-urlencoded format
      const formData = new URLSearchParams();
      formData.append('username', credentials.email); // FastAPI OAuth2 uses 'username' field
      formData.append('password', credentials.password);
      
      const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  /**
   * Register new user
   * @param {UserRegister} userData
   * @returns {Promise<RegisterResponse>}
   */
  async register(userData) {
    try {      // Trasforma i dati dal formato frontend al formato backend
      const backendData = {
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || '',
        password: userData.password,
        password_confirm: userData.confirmPassword,
        role: userData.role, // già in lowercase dalle costanti
        timezone: userData.timezone || 'UTC',
        language: userData.language || 'en'
      };      // Aggiungi campi professionali se il ruolo è professional
      if (userData.role === 'professional') {
        if (userData.licenseNumber) backendData.license_number = userData.licenseNumber;
        if (userData.specialization) backendData.specialization = userData.specialization;
        if (userData.clinicName) backendData.clinic_name = userData.clinicName;
        if (userData.clinicAddress) backendData.clinic_address = userData.clinicAddress;
      }

      const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, backendData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Refresh access token
   * @param {string} refreshToken
   * @returns {Promise<{access_token: string}>}
   */
  async refreshToken(refreshToken) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.REFRESH, {
        refresh_token: refreshToken
      });
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Logout user (invalidate session server-side)
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await axiosInstance.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Logout può fallire se il token è già scaduto, ma non è critico
      console.warn('Logout API call failed:', error.response?.data || error.message);
    }
  },

  /**
   * Request password reset
   * @param {string} email
   * @returns {Promise<{message: string}>}
   */
  async requestPasswordReset(email) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PASSWORD_RESET_REQUEST, {
        email
      });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Confirm password reset with token
   * @param {Object} data
   * @param {string} data.token
   * @param {string} data.new_password
   * @param {string} data.new_password_confirm
   * @returns {Promise<{message: string}>}
   */
  async confirmPasswordReset(data) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PASSWORD_RESET_CONFIRM, data);
      return response.data;
    } catch (error) {
      console.error('Password reset confirm error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Change password for authenticated user
   * @param {Object} data
   * @param {string} data.current_password
   * @param {string} data.new_password
   * @param {string} data.new_password_confirm
   * @returns {Promise<{message: string}>}
   */
  async changePassword(data) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PASSWORD_CHANGE, data);
      return response.data;
    } catch (error) {
      console.error('Password change error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default authService;
