/**
 * 🔐 SmileAdventure Authentication Service
 * Complete implementation of all 14 authentication routes
 * Features: Login, register, password management, role-based access
 */

import { api, TokenManager, ApiUtils } from './api.js';

// 🎯 Authentication API Endpoints (14 routes total)
const AUTH_ENDPOINTS = {
  // User Registration & Login (4 routes)
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  
  // Profile Management (2 routes)
  ME: '/auth/me',
  UPDATE_ME: '/auth/me',
  
  // Password Management (4 routes)
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email/{user_id}',
  
  // Admin & Access Control (4 routes)
  USERS_LIST: '/auth/users',
  AUTH_STATS: '/auth/stats',
  PARENT_ONLY: '/auth/parent-only',
  PROFESSIONAL_ONLY: '/auth/professional-only'
};

// 👤 User Management Class
class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    this.isAuthenticated = false;
  }

  // 🔑 User Registration & Login
  
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, {
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirmPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role || 'parent', // 'parent' | 'professional' | 'admin'
        phone: userData.phone,
        date_of_birth: userData.dateOfBirth,
        terms_accepted: userData.termsAccepted || false
      });

      if (ApiUtils.isSuccess(response)) {
        const { user, access_token, refresh_token } = response.data;
        this._setAuthenticationState(user, access_token, refresh_token);
        
        console.log('✅ User registered successfully:', user.email);
        return response;
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }

  /**
   * Login existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Keep user logged in
   * @returns {Promise<Object>} Login response
   */
  async login(email, password, rememberMe = false) {
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password,
        remember_me: rememberMe
      });

      if (ApiUtils.isSuccess(response)) {
        const { user, access_token, refresh_token } = response.data;
        this._setAuthenticationState(user, access_token, refresh_token);
        
        console.log('✅ User logged in successfully:', user.email);
        return response;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn('⚠️ Logout endpoint error (continuing anyway):', error);
    } finally {
      // Always clear local authentication state
      this._clearAuthenticationState();
      console.log('✅ User logged out successfully');
    }
  }

  /**
   * Refresh access token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken() {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post(AUTH_ENDPOINTS.REFRESH, {
        refresh_token: refreshToken
      });

      if (ApiUtils.isSuccess(response)) {
        const { access_token, refresh_token } = response.data;
        TokenManager.setTokens(access_token, refresh_token);
        
        console.log('✅ Token refreshed successfully');
        return response;
      }
      
      throw new Error(response.message || 'Token refresh failed');
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      this._clearAuthenticationState();
      throw error;
    }
  }

  // 👤 Profile Management

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    try {
      const response = await api.get(AUTH_ENDPOINTS.ME);
      
      if (ApiUtils.isSuccess(response)) {
        this.currentUser = response.data.user;
        this.userRole = response.data.user.role;
        this.isAuthenticated = true;
        
        console.log('✅ Current user fetched:', this.currentUser.email);
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch user profile');
    } catch (error) {
      console.error('❌ Get current user error:', error);
      throw error;
    }
  }

  /**
   * Update current user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated profile
   */
  async updateCurrentUser(userData) {
    try {
      const response = await api.put(AUTH_ENDPOINTS.UPDATE_ME, userData);
      
      if (ApiUtils.isSuccess(response)) {
        this.currentUser = { ...this.currentUser, ...response.data.user };
        
        console.log('✅ User profile updated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  }

  // 🔒 Password Management

  /**
   * Change password for logged-in user
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise<Object>} Change password response
   */
  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      const response = await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Password changed successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to change password');
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw error;
    }
  }

  /**
   * Request password reset via email
   * @param {string} email - User email
   * @returns {Promise<Object>} Forgot password response
   */
  async forgotPassword(email) {
    try {
      const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Password reset email sent to:', email);
        return response;
      }
      
      throw new Error(response.message || 'Failed to send password reset email');
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise<Object>} Reset password response
   */
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Password reset successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to reset password');
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  }

  /**
   * Verify user email
   * @param {string} userId - User ID
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Email verification response
   */
  async verifyEmail(userId, token = null) {
    try {
      const url = ApiUtils.formatUrl(AUTH_ENDPOINTS.VERIFY_EMAIL, { user_id: userId });
      const response = await api.post(url, token ? { token } : {});
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Email verified successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to verify email');
    } catch (error) {
      console.error('❌ Email verification error:', error);
      throw error;
    }
  }

  // 👥 Admin & Access Control

  /**
   * Get users list (admin only)
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Users list
   */
  async getUsersList(filters = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(filters);
      const url = queryString ? `${AUTH_ENDPOINTS.USERS_LIST}?${queryString}` : AUTH_ENDPOINTS.USERS_LIST;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Users list fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch users list');
    } catch (error) {
      console.error('❌ Get users list error:', error);
      throw error;
    }
  }

  /**
   * Get authentication statistics (admin only)
   * @returns {Promise<Object>} Auth statistics
   */
  async getAuthStats() {
    try {
      const response = await api.get(AUTH_ENDPOINTS.AUTH_STATS);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Auth statistics fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch auth statistics');
    } catch (error) {
      console.error('❌ Get auth stats error:', error);
      throw error;
    }
  }

  /**
   * Access parent-only endpoint
   * @returns {Promise<Object>} Parent-only data
   */
  async getParentOnlyData() {
    try {
      const response = await api.get(AUTH_ENDPOINTS.PARENT_ONLY);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Parent-only data fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch parent-only data');
    } catch (error) {
      console.error('❌ Get parent-only data error:', error);
      throw error;
    }
  }

  /**
   * Access professional-only endpoint
   * @returns {Promise<Object>} Professional-only data
   */
  async getProfessionalOnlyData() {
    try {
      const response = await api.get(AUTH_ENDPOINTS.PROFESSIONAL_ONLY);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Professional-only data fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch professional-only data');
    } catch (error) {
      console.error('❌ Get professional-only data error:', error);
      throw error;
    }
  }

  // 🔧 Utility Methods

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isUserAuthenticated() {
    const token = TokenManager.getToken();
    return token && !TokenManager.isTokenExpired(token) && this.isAuthenticated;
  }

  /**
   * Get current user role
   * @returns {string|null} User role
   */
  getUserRole() {
    return this.userRole;
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Has role
   */
  hasRole(role) {
    return this.userRole === role;
  }

  /**
   * Check if user is parent
   * @returns {boolean} Is parent
   */
  isParent() {
    return this.hasRole('parent');
  }

  /**
   * Check if user is professional
   * @returns {boolean} Is professional
   */
  isProfessional() {
    return this.hasRole('professional');
  }

  /**
   * Check if user is admin
   * @returns {boolean} Is admin
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Get current user data
   * @returns {Object|null} Current user
   */
  getCurrentUserData() {
    return this.currentUser;
  }

  // 🔒 Private Methods

  /**
   * Set authentication state
   * @private
   */
  _setAuthenticationState(user, accessToken, refreshToken) {
    this.currentUser = user;
    this.userRole = user.role;
    this.isAuthenticated = true;
    TokenManager.setTokens(accessToken, refreshToken);
    
    // Store user data for persistence
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userRole', user.role);
  }

  /**
   * Clear authentication state
   * @private
   */
  _clearAuthenticationState() {
    this.currentUser = null;
    this.userRole = null;
    this.isAuthenticated = false;
    TokenManager.clearTokens();
    
    // Clear stored user data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
  }

  /**
   * Initialize auth service from stored data
   * @public
   */
  initializeFromStorage() {
    try {
      const token = TokenManager.getToken();
      const storedUser = localStorage.getItem('currentUser');
      const storedRole = localStorage.getItem('userRole');

      if (token && !TokenManager.isTokenExpired(token) && storedUser) {
        this.currentUser = JSON.parse(storedUser);
        this.userRole = storedRole;
        this.isAuthenticated = true;
        
        console.log('✅ Auth service initialized from storage');
      } else {
        this._clearAuthenticationState();
      }
    } catch (error) {
      console.error('❌ Error initializing auth service:', error);
      this._clearAuthenticationState();
    }
  }
}

// 🚀 Create and export singleton instance
const authService = new AuthService();

// Initialize on module load
authService.initializeFromStorage();

export default authService;
export { AUTH_ENDPOINTS };
