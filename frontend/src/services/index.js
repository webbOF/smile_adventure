/**
 * Services Index for Smile Adventure
 * Central export point for all API services
 */

// Import all services
import api, { ApiUtils, ApiResponse } from './api';
import authService, { AuthService } from './authService';
import userService, { UserService } from './userService';
import reportService, { ReportService } from './reportService';

// Import types and constants
import apiTypes, { 
  API_ENDPOINTS, 
  GAME_TYPES, 
  ACTIVITY_TYPES, 
  USER_ROLES, 
  ASSESSMENT_TYPES 
} from '../types/api';

// Export individual services
export {
  // Core API client
  api,
  ApiUtils,
  ApiResponse,
  
  // Authentication service
  authService,
  AuthService,
  
  // User management service
  userService,
  UserService,
  
  // Reports and analytics service
  reportService,
  ReportService,
  
  // Types and constants
  apiTypes,
  API_ENDPOINTS,
  GAME_TYPES,
  ACTIVITY_TYPES,
  USER_ROLES,
  ASSESSMENT_TYPES,
};

// Create services object for easy access
export const services = {
  auth: authService,
  user: userService,
  report: reportService,
};

// Default export
export default services;

/**
 * Service Factory for creating service instances with custom configuration
 */
export class ServiceFactory {
    /**
   * Create authenticated API client
   * @param {string} [baseURL] - Custom base URL
   * @param {Object} [config] - Additional axios config
   * @returns {Object} Axios instance
   */
  static createApiClient(baseURL, config = {}) {
    // Import axios here to avoid circular dependencies
    const axios = require('axios');
    return axios.create({
      baseURL: baseURL || process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...config,
    });
  }
  
  /**
   * Create service with custom API client
   * @param {Function} ServiceClass - Service class constructor
   * @param {Object} [apiClient] - Custom API client
   * @returns {Object} Service instance
   */
  static createService(ServiceClass, apiClient) {
    const service = new ServiceClass();
    if (apiClient) {
      service.api = apiClient;
    }
    return service;
  }
}

/**
 * Service Health Checker
 * Utilities for checking service health and connectivity
 */
export class ServiceHealthChecker {
    /**
   * Check if API is reachable
   * @returns {Promise<boolean>} True if API is healthy
   */
  static async checkApiHealth() {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      console.warn('API health check failed:', error.message);
      return false;
    }
  }
  
  /**
   * Check authentication status
   * @returns {Promise<boolean>} True if authenticated
   */
  static async checkAuthStatus() {
    try {
      await authService.getCurrentUser();
      return true;
    } catch (error) {
      console.warn('Auth check failed:', error.message);
      return false;
    }
  }
  
  /**
   * Run full service health check
   * @returns {Promise<Object>} Health status report
   */
  static async runHealthCheck() {
    const results = {
      timestamp: new Date().toISOString(),
      api: false,
      auth: false,
      overall: false,
    };
    
    try {
      // Check API connectivity
      results.api = await this.checkApiHealth();
      
      // Check authentication if user is supposed to be logged in
      if (authService.isAuthenticated()) {
        results.auth = await this.checkAuthStatus();
      } else {
        results.auth = true; // Not required to be authenticated
      }
      
      // Overall health
      results.overall = results.api && results.auth;
      
    } catch (error) {
      console.error('Health check failed:', error);
    }
    
    return results;
  }
}

/**
 * Service Configuration Manager
 * Handles service configuration and environment setup
 */
export class ServiceConfig {
  
  static config = {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 1000,
    enableLogging: process.env.NODE_ENV === 'development',
    enableMetrics: false,
  };
  
  /**
   * Update service configuration
   * @param {Object} newConfig - New configuration options
   */
  static updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Update API client with new config
    api.defaults.baseURL = this.config.apiUrl;
    api.defaults.timeout = this.config.timeout;
  }
  
  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  static getConfig() {
    return { ...this.config };
  }
  
  /**
   * Reset configuration to defaults
   */
  static resetConfig() {
    this.config = {
      apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
      timeout: 15000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableLogging: process.env.NODE_ENV === 'development',
      enableMetrics: false,
    };
  }
}

/**
 * Service Error Handler
 * Centralized error handling for all services
 */
export class ServiceErrorHandler {
  
  static errorCallbacks = new Set();
  
  /**
   * Register error callback
   * @param {Function} callback - Error callback function
   */
  static onError(callback) {
    this.errorCallbacks.add(callback);
  }
  
  /**
   * Unregister error callback
   * @param {Function} callback - Error callback function
   */
  static offError(callback) {
    this.errorCallbacks.delete(callback);
  }
  
  /**
   * Handle service error
   * @param {Error} error - Error object
   * @param {string} [context] - Error context
   */
  static handleError(error, context = 'Unknown') {
    const errorInfo = {
      error,
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
    
    // Log error
    if (ServiceConfig.config.enableLogging) {
      console.error(`Service Error [${context}]:`, errorInfo);
    }
    
    // Call registered error handlers
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
    
    return errorInfo;
  }
}

// Initialize default error handling
api.interceptors.response.use(
  response => response,
  error => {
    ServiceErrorHandler.handleError(error, 'API Request');
    return Promise.reject(error);
  }
);
