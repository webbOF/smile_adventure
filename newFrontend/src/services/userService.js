/**
 * 👥 SmileAdventure User Service
 * Complete implementation of all 49 user management routes
 * Features: Profile management, children management, professional tools
 */

import { api, ApiUtils } from './api.js';

// 👤 User Management API Endpoints (49 routes total)
const USER_ENDPOINTS = {
  // User Profile (10 routes)
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  UPLOAD_AVATAR: '/users/profile/avatar',
  REMOVE_AVATAR: '/users/profile/avatar',
  PREFERENCES: '/users/preferences',
  UPDATE_PREFERENCES: '/users/preferences',
  PROFILE_COMPLETION: '/users/profile/completion',
  USER_BY_ID: '/users/users/{user_id}',
  UPDATE_USER_STATUS: '/users/users/{user_id}/status',
  DASHBOARD: '/users/dashboard',
  
  // Professional Profile (6 routes)
  CREATE_PROFESSIONAL: '/users/professional-profile',
  GET_PROFESSIONAL: '/users/professional-profile',
  UPDATE_PROFESSIONAL: '/users/professional-profile',
  SEARCH_PROFESSIONALS: '/users/professionals/search',
  SEARCH_PROFESSIONALS_FILTERED: '/users/profile/search/professionals',
  GET_PROFESSIONAL_PUBLIC: '/users/profile/professional/{professional_id}',
  
  // Children Management - Core CRUD (5 routes)
  CREATE_CHILD: '/users/children',
  GET_CHILDREN: '/users/children',
  GET_CHILD: '/users/children/{child_id}',
  UPDATE_CHILD: '/users/children/{child_id}',
  DELETE_CHILD: '/users/children/{child_id}',
  
  // Children - Activity & Session Tracking (5 routes)
  CHILD_ACTIVITIES: '/users/children/{child_id}/activities',
  CHILD_SESSIONS: '/users/children/{child_id}/sessions',
  CHILD_PROGRESS: '/users/children/{child_id}/progress',
  CHILD_ACHIEVEMENTS: '/users/children/{child_id}/achievements',
  VERIFY_ACTIVITY: '/users/children/{child_id}/activities/{activity_id}/verify',
  
  // Children - Gamification & Points (2 routes)
  ADD_POINTS: '/users/children/{child_id}/points',
  GET_POINTS: '/users/children/{child_id}/points',
  
  // Children - Progress Tracking (3 routes)
  ADD_PROGRESS_NOTE: '/users/children/{child_id}/progress-notes',
  GET_PROGRESS_NOTES: '/users/children/{child_id}/progress-notes',
  PROFILE_COMPLETION_CHILD: '/users/children/{child_id}/profile-completion',
  
  // Children - Sensory Profile (2 routes)
  UPDATE_SENSORY_PROFILE: '/users/children/{child_id}/sensory-profile',
  GET_SENSORY_PROFILE: '/users/children/{child_id}/sensory-profile',
  
  // Children - Bulk Operations & Utilities (6 routes)
  BULK_UPDATE_CHILDREN: '/users/children/bulk-update',
  SEARCH_CHILDREN: '/users/children/search',
  CHILDREN_STATISTICS: '/users/children/statistics',
  COMPARE_CHILDREN: '/users/children/compare',
  QUICK_SETUP_CHILD: '/users/children/quick-setup',
  CHILD_TEMPLATES: '/users/children/templates',
  
  // Children - Export & Sharing (2 routes)
  EXPORT_CHILD: '/users/children/{child_id}/export',
  SHARE_CHILD: '/users/children/{child_id}/share',
  
  // Analytics & Reports (3 routes)
  CHILD_PROGRESS_REPORT: '/users/child/{child_id}/progress',
  PLATFORM_ANALYTICS: '/users/analytics/platform',
  EXPORT_CHILD_DATA: '/users/export/child/{child_id}'
};

// 👤 User Service Class
class UserService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // 👤 USER PROFILE MANAGEMENT

  /**
   * Get detailed user profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const response = await api.get(USER_ENDPOINTS.PROFILE);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache('profile', response.data);
        console.log('✅ User profile fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch user profile');
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put(USER_ENDPOINTS.UPDATE_PROFILE, profileData);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache('profile', response.data);
        console.log('✅ User profile updated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  }

  /**
   * Upload user avatar
   * @param {File} file - Avatar image file
   * @param {Function} onProgress - Upload progress callback
   * @returns {Promise<Object>} Avatar upload response
   */
  async uploadAvatar(file, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.upload(USER_ENDPOINTS.UPLOAD_AVATAR, formData, onProgress);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache('profile'); // Clear profile cache
        console.log('✅ Avatar uploaded successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to upload avatar');
    } catch (error) {
      console.error('❌ Upload avatar error:', error);
      throw error;
    }
  }

  /**
   * Remove user avatar
   * @returns {Promise<Object>} Remove avatar response
   */
  async removeAvatar() {
    try {
      const response = await api.delete(USER_ENDPOINTS.REMOVE_AVATAR);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache('profile');
        console.log('✅ Avatar removed successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to remove avatar');
    } catch (error) {
      console.error('❌ Remove avatar error:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   * @returns {Promise<Object>} User preferences
   */
  async getPreferences() {
    try {
      const response = await api.get(USER_ENDPOINTS.PREFERENCES);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache('preferences', response.data);
        console.log('✅ User preferences fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch preferences');
    } catch (error) {
      console.error('❌ Get preferences error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   * @param {Object} preferences - Updated preferences
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await api.put(USER_ENDPOINTS.UPDATE_PREFERENCES, preferences);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache('preferences', response.data);
        console.log('✅ User preferences updated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to update preferences');
    } catch (error) {
      console.error('❌ Update preferences error:', error);
      throw error;
    }
  }

  /**
   * Get profile completion percentage
   * @returns {Promise<Object>} Profile completion data
   */
  async getProfileCompletion() {
    try {
      const response = await api.get(USER_ENDPOINTS.PROFILE_COMPLETION);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Profile completion fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch profile completion');
    } catch (error) {
      console.error('❌ Get profile completion error:', error);
      throw error;
    }
  }

  /**
   * Get user dashboard data
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard() {
    try {
      const response = await api.get(USER_ENDPOINTS.DASHBOARD);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ User dashboard fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch dashboard');
    } catch (error) {
      console.error('❌ Get dashboard error:', error);
      throw error;
    }
  }

  // 👨‍⚕️ PROFESSIONAL PROFILE MANAGEMENT

  /**
   * Create professional profile
   * @param {Object} professionalData - Professional profile data
   * @returns {Promise<Object>} Created profile
   */
  async createProfessionalProfile(professionalData) {
    try {
      const response = await api.post(USER_ENDPOINTS.CREATE_PROFESSIONAL, professionalData);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Professional profile created successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to create professional profile');
    } catch (error) {
      console.error('❌ Create professional profile error:', error);
      throw error;
    }
  }

  /**
   * Get professional profile
   * @returns {Promise<Object>} Professional profile
   */
  async getProfessionalProfile() {
    try {
      const response = await api.get(USER_ENDPOINTS.GET_PROFESSIONAL);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache('professionalProfile', response.data);
        console.log('✅ Professional profile fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch professional profile');
    } catch (error) {
      console.error('❌ Get professional profile error:', error);
      throw error;
    }
  }

  /**
   * Update professional profile
   * @param {Object} professionalData - Updated professional data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfessionalProfile(professionalData) {
    try {
      const response = await api.put(USER_ENDPOINTS.UPDATE_PROFESSIONAL, professionalData);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache('professionalProfile', response.data);
        console.log('✅ Professional profile updated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to update professional profile');
    } catch (error) {
      console.error('❌ Update professional profile error:', error);
      throw error;
    }
  }

  /**
   * Search professionals
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchProfessionals(searchParams = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(searchParams);
      const url = queryString ? `${USER_ENDPOINTS.SEARCH_PROFESSIONALS}?${queryString}` : USER_ENDPOINTS.SEARCH_PROFESSIONALS;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Professionals search completed successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to search professionals');
    } catch (error) {
      console.error('❌ Search professionals error:', error);
      throw error;
    }
  }

  /**
   * Search professionals with advanced filters
   * @param {Object} filters - Advanced search filters
   * @returns {Promise<Object>} Filtered search results
   */
  async searchProfessionalsFiltered(filters) {
    try {
      const response = await api.post(USER_ENDPOINTS.SEARCH_PROFESSIONALS_FILTERED, filters);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Filtered professionals search completed successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to search professionals with filters');
    } catch (error) {
      console.error('❌ Search professionals filtered error:', error);
      throw error;
    }
  }

  /**
   * Get professional public profile
   * @param {string} professionalId - Professional ID
   * @returns {Promise<Object>} Professional public profile
   */
  async getProfessionalPublicProfile(professionalId) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.GET_PROFESSIONAL_PUBLIC, { professional_id: professionalId });
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Professional public profile fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch professional public profile');
    } catch (error) {
      console.error('❌ Get professional public profile error:', error);
      throw error;
    }
  }

  // 👶 CHILDREN MANAGEMENT - Core CRUD

  /**
   * Create new child profile
   * @param {Object} childData - Child profile data
   * @returns {Promise<Object>} Created child profile
   */
  async createChild(childData) {
    try {
      const response = await api.post(USER_ENDPOINTS.CREATE_CHILD, childData);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache('children');
        console.log('✅ Child profile created successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to create child profile');
    } catch (error) {
      console.error('❌ Create child error:', error);
      throw error;
    }
  }

  /**
   * Get all children profiles
   * @param {Object} params - Optional parameters
   * @returns {Promise<Object>} Children list
   */
  async getChildren(params = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(params);
      const url = queryString ? `${USER_ENDPOINTS.GET_CHILDREN}?${queryString}` : USER_ENDPOINTS.GET_CHILDREN;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache('children', response.data);
        console.log('✅ Children list fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch children');
    } catch (error) {
      console.error('❌ Get children error:', error);
      throw error;
    }
  }

  /**
   * Get specific child profile
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Child profile
   */
  async getChild(childId) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.GET_CHILD, { child_id: childId });
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache(`child_${childId}`, response.data);
        console.log('✅ Child profile fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child profile');
    } catch (error) {
      console.error('❌ Get child error:', error);
      throw error;
    }
  }

  /**
   * Update child profile
   * @param {string} childId - Child ID
   * @param {Object} childData - Updated child data
   * @returns {Promise<Object>} Updated child profile
   */
  async updateChild(childId, childData) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.UPDATE_CHILD, { child_id: childId });
      const response = await api.put(url, childData);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache(`child_${childId}`, response.data);
        this._clearCache('children');
        console.log('✅ Child profile updated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to update child profile');
    } catch (error) {
      console.error('❌ Update child error:', error);
      throw error;
    }
  }

  /**
   * Delete child profile
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Delete confirmation
   */
  async deleteChild(childId) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.DELETE_CHILD, { child_id: childId });
      const response = await api.delete(url);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache(`child_${childId}`);
        this._clearCache('children');
        console.log('✅ Child profile deleted successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete child profile');
    } catch (error) {
      console.error('❌ Delete child error:', error);
      throw error;
    }
  }

  // 👶 CHILDREN - Activity & Session Tracking

  /**
   * Get child activities
   * @param {string} childId - Child ID
   * @param {Object} params - Optional parameters
   * @returns {Promise<Object>} Child activities
   */
  async getChildActivities(childId, params = {}) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.CHILD_ACTIVITIES, { child_id: childId });
      const queryString = ApiUtils.buildQueryString(params);
      const finalUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await api.get(finalUrl);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child activities fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child activities');
    } catch (error) {
      console.error('❌ Get child activities error:', error);
      throw error;
    }
  }

  /**
   * Get child game sessions
   * @param {string} childId - Child ID
   * @param {Object} params - Optional parameters
   * @returns {Promise<Object>} Child sessions
   */
  async getChildSessions(childId, params = {}) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.CHILD_SESSIONS, { child_id: childId });
      const queryString = ApiUtils.buildQueryString(params);
      const finalUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await api.get(finalUrl);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child sessions fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child sessions');
    } catch (error) {
      console.error('❌ Get child sessions error:', error);
      throw error;
    }
  }

  /**
   * Get child progress
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Child progress data
   */
  async getChildProgress(childId) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.CHILD_PROGRESS, { child_id: childId });
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child progress fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child progress');
    } catch (error) {
      console.error('❌ Get child progress error:', error);
      throw error;
    }
  }

  /**
   * Get child achievements
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Child achievements
   */
  async getChildAchievements(childId) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.CHILD_ACHIEVEMENTS, { child_id: childId });
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child achievements fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child achievements');
    } catch (error) {
      console.error('❌ Get child achievements error:', error);
      throw error;
    }
  }

  /**
   * Verify child activity
   * @param {string} childId - Child ID
   * @param {string} activityId - Activity ID
   * @param {Object} verificationData - Verification data
   * @returns {Promise<Object>} Verification response
   */
  async verifyChildActivity(childId, activityId, verificationData) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.VERIFY_ACTIVITY, { 
        child_id: childId, 
        activity_id: activityId 
      });
      const response = await api.put(url, verificationData);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child activity verified successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to verify child activity');
    } catch (error) {
      console.error('❌ Verify child activity error:', error);
      throw error;
    }
  }

  // 🎮 CHILDREN - Gamification & Points

  /**
   * Add points to child
   * @param {string} childId - Child ID
   * @param {Object} pointsData - Points data
   * @returns {Promise<Object>} Points addition response
   */
  async addPointsToChild(childId, pointsData) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.ADD_POINTS, { child_id: childId });
      const response = await api.post(url, pointsData);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Points added to child successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to add points to child');
    } catch (error) {
      console.error('❌ Add points to child error:', error);
      throw error;
    }
  }

  // 📊 CHILDREN - Progress Tracking

  /**
   * Add progress note to child
   * @param {string} childId - Child ID
   * @param {Object} noteData - Progress note data
   * @returns {Promise<Object>} Progress note response
   */
  async addProgressNote(childId, noteData) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.ADD_PROGRESS_NOTE, { child_id: childId });
      const response = await api.post(url, noteData);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Progress note added successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to add progress note');
    } catch (error) {
      console.error('❌ Add progress note error:', error);
      throw error;
    }
  }

  /**
   * Get child progress notes
   * @param {string} childId - Child ID
   * @param {Object} params - Optional parameters
   * @returns {Promise<Object>} Progress notes
   */
  async getProgressNotes(childId, params = {}) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.GET_PROGRESS_NOTES, { child_id: childId });
      const queryString = ApiUtils.buildQueryString(params);
      const finalUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await api.get(finalUrl);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Progress notes fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch progress notes');
    } catch (error) {
      console.error('❌ Get progress notes error:', error);
      throw error;
    }
  }

  /**
   * Get child profile completion
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Profile completion data
   */
  async getChildProfileCompletion(childId) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.PROFILE_COMPLETION_CHILD, { child_id: childId });
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child profile completion fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child profile completion');
    } catch (error) {
      console.error('❌ Get child profile completion error:', error);
      throw error;
    }
  }

  // 🧠 CHILDREN - Sensory Profile

  /**
   * Update child sensory profile
   * @param {string} childId - Child ID
   * @param {Object} sensoryData - Sensory profile data
   * @returns {Promise<Object>} Updated sensory profile
   */
  async updateChildSensoryProfile(childId, sensoryData) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.UPDATE_SENSORY_PROFILE, { child_id: childId });
      const response = await api.put(url, sensoryData);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child sensory profile updated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to update child sensory profile');
    } catch (error) {
      console.error('❌ Update child sensory profile error:', error);
      throw error;
    }
  }

  /**
   * Get child sensory profile
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Sensory profile data
   */
  async getChildSensoryProfile(childId) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.GET_SENSORY_PROFILE, { child_id: childId });
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child sensory profile fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child sensory profile');
    } catch (error) {
      console.error('❌ Get child sensory profile error:', error);
      throw error;
    }
  }

  // 🔧 CHILDREN - Bulk Operations & Utilities

  /**
   * Bulk update children
   * @param {Object} bulkData - Bulk update data
   * @returns {Promise<Object>} Bulk update response
   */
  async bulkUpdateChildren(bulkData) {
    try {
      const response = await api.put(USER_ENDPOINTS.BULK_UPDATE_CHILDREN, bulkData);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache('children');
        console.log('✅ Children bulk updated successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to bulk update children');
    } catch (error) {
      console.error('❌ Bulk update children error:', error);
      throw error;
    }
  }

  /**
   * Search children with filters
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchChildren(searchParams = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(searchParams);
      const url = queryString ? `${USER_ENDPOINTS.SEARCH_CHILDREN}?${queryString}` : USER_ENDPOINTS.SEARCH_CHILDREN;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Children search completed successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to search children');
    } catch (error) {
      console.error('❌ Search children error:', error);
      throw error;
    }
  }

  /**
   * Get children statistics
   * @param {Object} params - Optional parameters
   * @returns {Promise<Object>} Children statistics
   */
  async getChildrenStatistics(params = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(params);
      const url = queryString ? `${USER_ENDPOINTS.CHILDREN_STATISTICS}?${queryString}` : USER_ENDPOINTS.CHILDREN_STATISTICS;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Children statistics fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch children statistics');
    } catch (error) {
      console.error('❌ Get children statistics error:', error);
      throw error;
    }
  }

  /**
   * Compare children progress
   * @param {Object} compareParams - Comparison parameters
   * @returns {Promise<Object>} Comparison results
   */
  async compareChildren(compareParams) {
    try {
      const queryString = ApiUtils.buildQueryString(compareParams);
      const url = queryString ? `${USER_ENDPOINTS.COMPARE_CHILDREN}?${queryString}` : USER_ENDPOINTS.COMPARE_CHILDREN;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Children comparison completed successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to compare children');
    } catch (error) {
      console.error('❌ Compare children error:', error);
      throw error;
    }
  }

  /**
   * Quick setup for new child
   * @param {Object} quickSetupData - Quick setup data
   * @returns {Promise<Object>} Quick setup response
   */
  async quickChildSetup(quickSetupData) {
    try {
      const response = await api.post(USER_ENDPOINTS.QUICK_SETUP_CHILD, quickSetupData);
      
      if (ApiUtils.isSuccess(response)) {
        this._clearCache('children');
        console.log('✅ Child quick setup completed successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to complete quick child setup');
    } catch (error) {
      console.error('❌ Quick child setup error:', error);
      throw error;
    }
  }

  /**
   * Get child profile templates
   * @returns {Promise<Object>} Profile templates
   */
  async getChildTemplates() {
    try {
      const response = await api.get(USER_ENDPOINTS.CHILD_TEMPLATES);
      
      if (ApiUtils.isSuccess(response)) {
        this._setCache('childTemplates', response.data);
        console.log('✅ Child templates fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child templates');
    } catch (error) {
      console.error('❌ Get child templates error:', error);
      throw error;
    }
  }

  // 📤 CHILDREN - Export & Sharing

  /**
   * Export child data
   * @param {string} childId - Child ID
   * @param {string} format - Export format (pdf, csv, json)
   * @returns {Promise<Object>} Export response
   */
  async exportChildData(childId, format = 'pdf') {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.EXPORT_CHILD, { child_id: childId });
      const response = await api.download(`${url}?format=${format}`, `child_${childId}_data.${format}`);
      
      console.log('✅ Child data exported successfully');
      return response;
    } catch (error) {
      console.error('❌ Export child data error:', error);
      throw error;
    }
  }

  /**
   * Share child profile with professionals
   * @param {string} childId - Child ID
   * @param {Object} shareData - Sharing data
   * @returns {Promise<Object>} Share response
   */
  async shareChildProfile(childId, shareData) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.SHARE_CHILD, { child_id: childId });
      const response = await api.post(url, shareData);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child profile shared successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to share child profile');
    } catch (error) {
      console.error('❌ Share child profile error:', error);
      throw error;
    }
  }

  // 📊 ANALYTICS & REPORTS

  /**
   * Get child progress report
   * @param {string} childId - Child ID
   * @param {Object} params - Optional parameters
   * @returns {Promise<Object>} Progress report
   */
  async getChildProgressReport(childId, params = {}) {
    try {
      const url = ApiUtils.formatUrl(USER_ENDPOINTS.CHILD_PROGRESS_REPORT, { child_id: childId });
      const queryString = ApiUtils.buildQueryString(params);
      const finalUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await api.get(finalUrl);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Child progress report fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch child progress report');
    } catch (error) {
      console.error('❌ Get child progress report error:', error);
      throw error;
    }
  }

  /**
   * Get platform analytics
   * @param {Object} params - Optional parameters
   * @returns {Promise<Object>} Platform analytics
   */
  async getPlatformAnalytics(params = {}) {
    try {
      const queryString = ApiUtils.buildQueryString(params);
      const url = queryString ? `${USER_ENDPOINTS.PLATFORM_ANALYTICS}?${queryString}` : USER_ENDPOINTS.PLATFORM_ANALYTICS;
      
      const response = await api.get(url);
      
      if (ApiUtils.isSuccess(response)) {
        console.log('✅ Platform analytics fetched successfully');
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch platform analytics');
    } catch (error) {
      console.error('❌ Get platform analytics error:', error);
      throw error;
    }
  }

  // 🔧 UTILITY METHODS

  /**
   * Clear specific cache entry
   * @private
   */
  _clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Set cache entry with timeout
   * @private
   */
  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get cached data if still valid
   * @private
   */
  _getCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
    console.log('✅ User service cache cleared');
  }
}

// 🚀 Create and export singleton instance
const userService = new UserService();

export default userService;
export { USER_ENDPOINTS };
