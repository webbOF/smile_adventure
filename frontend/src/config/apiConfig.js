/**
 * API Configuration
 * Configurazione centrale per gli endpoint API
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * API Endpoints configuration
 * @type {Object}
 */
export const API_ENDPOINTS = {
  // Authentication endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  
  // Password reset endpoints
  PASSWORD_RESET_REQUEST: '/auth/request-password-reset',
  PASSWORD_RESET_CONFIRM: '/auth/reset-password',
  PASSWORD_CHANGE: '/auth/change-password',
  
  // User endpoints
  USER_PROFILE: '/users/me',
  USER_DASHBOARD: '/users/dashboard',
  
  // Children endpoints
  CHILDREN: '/users/children',
  CHILDREN_BY_ID: (id) => `/users/children/${id}`,
  
  // Professional endpoints
  PROFESSIONAL_PROFILE: '/professional/professional-profile',
  PROFESSIONAL_SEARCH: '/professional/professionals/search',
  
  // Reports endpoints
  REPORTS_DASHBOARD: '/reports/dashboard',
  CHILD_PROGRESS: (childId) => `/reports/child/${childId}/progress`,
  CLINICAL_ANALYTICS: '/professional/clinical/analytics',
  
  // Admin endpoints (ipotizzati)
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_BY_ID: (id) => `/admin/users/${id}`
};

/**
 * API Configuration object
 * @type {Object}
 */
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000, // 10 seconds
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

export default API_CONFIG;
