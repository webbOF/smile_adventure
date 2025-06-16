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
  AUTH_ME: '/auth/me',
  VERIFY_EMAIL: '/auth/verify-email/{user_id}',
  
  // Password reset endpoints
  PASSWORD_RESET_REQUEST: '/auth/request-password-reset',
  PASSWORD_RESET_CONFIRM: '/auth/reset-password',
  PASSWORD_CHANGE: '/auth/change-password',

  // Admin endpoints  
  AUTH: {
    USERS: '/auth/users',
    STATS: '/auth/stats'
  },

  // User endpoints
  USERS: {
    PROFILE: '/users/profile',
    DASHBOARD: '/users/dashboard',
    AVATAR: '/users/profile/avatar',
    PREFERENCES: '/users/preferences',
    PROFILE_COMPLETION: '/users/profile/completion',
    ANALYTICS: '/users/analytics/platform',
    
    // Admin user management endpoints
    LIST: '/users/users',
    DETAIL: '/users',
    BULK_UPDATE_ROLE: '/users/bulk/update-role',
    BULK_UPDATE_STATUS: '/users/bulk/update-status',
    BULK_SEND_EMAIL: '/users/bulk/send-email',
    EXPORT: '/users/export',
    BULK_DELETE: '/users/bulk/delete'
  },

  // Children endpoints  
  CHILDREN: {
    LIST: '/users/children',
    BY_ID: (id) => `/users/children/${id}`,
    SEARCH: '/users/children/search'
  },

  // Children enhanced features
  CHILD_ACTIVITIES: (id) => `/users/children/${id}/activities`,
  CHILD_SESSIONS: (id) => `/users/children/${id}/sessions`,
  CHILD_PROGRESS_DATA: (id) => `/users/children/${id}/progress`,
  CHILD_ACHIEVEMENTS: (id) => `/users/children/${id}/achievements`,
  CHILD_POINTS: (id) => `/users/children/${id}/points`,
  CHILD_PROGRESS_NOTES: (id) => `/users/children/${id}/progress-notes`,
  CHILD_SENSORY_PROFILE: (id) => `/users/children/${id}/sensory-profile`,
  CHILD_ACTIVITY_VERIFY: (childId, activityId) => `/users/children/${childId}/activities/${activityId}/verify`,
  CHILD_UPLOAD_PHOTO: (id) => `/users/children/${id}/upload-photo`,
  
  // Professional endpoints
  PROFESSIONAL_PROFILE: '/professional/professional-profile',
  PROFESSIONAL_SEARCH: '/professional/professionals/search',
    // Reports endpoints
  REPORTS_DASHBOARD: '/reports/dashboard',
  CHILD_PROGRESS_REPORT: (childId) => `/reports/child/${childId}/progress`,
  CLINICAL_ANALYTICS: '/professional/clinical/analytics',
  
  // Game Sessions endpoints
  GAME_SESSION_CREATE: '/reports/sessions',
  GAME_SESSION_BY_ID: (id) => `/reports/sessions/${id}`,
  GAME_SESSION_UPDATE: (id) => `/reports/sessions/${id}`,
  GAME_SESSION_COMPLETE: (id) => `/reports/sessions/${id}/complete`,
  GAME_SESSION_ANALYTICS: (id) => `/reports/sessions/${id}/analytics`,
  GAME_SESSION_PAUSE: (id) => `/reports/sessions/${id}/pause`,
  GAME_SESSION_RESUME: (id) => `/reports/sessions/${id}/resume`,
  GAME_SESSION_PARENT_FEEDBACK: (id) => `/reports/sessions/${id}/parent-feedback`,
    // Alternative game sessions endpoints (for backend compatibility)
  GAME_SESSIONS_ALT_CREATE: '/reports/game-sessions',
  GAME_SESSIONS_ALT_BY_ID: (id) => `/reports/game-sessions/${id}`,
  
  // Children sessions and stats
  CHILD_SESSION_STATS: (id) => `/users/children/${id}/session-stats`,
  CHILD_GAME_SESSIONS: (id) => `/users/children/${id}/game-sessions`,

  // =====================================================================
  // REPORTS MODULE - Complete Backend Integration
  // =====================================================================
  
  REPORTS: {
    // Dashboard & Core Reports
    DASHBOARD: '/reports/dashboard',
    CHILD_PROGRESS: (id) => `/reports/child/${id}/progress`,
    CHILD_SUMMARY: (id) => `/reports/child/${id}/summary`,
    CHILD_ANALYTICS: (id) => `/reports/child/${id}/analytics`,
    
    // Game Sessions Management
    SESSIONS: '/reports/sessions',
    SESSION_BY_ID: (id) => `/reports/sessions/${id}`,
    SESSION_COMPLETE: (id) => `/reports/sessions/${id}/complete`,
    SESSION_END: (id) => `/reports/game-sessions/${id}/end`,
    SESSION_ANALYTICS: (id) => `/reports/sessions/${id}/analytics`,
    SESSION_TRENDS: (id) => `/reports/children/${id}/sessions/trends`,
    CHILD_SESSIONS: (id) => `/reports/game-sessions/child/${id}`,
    
    // Reports Management
    REPORTS: '/reports/reports',
    REPORT_BY_ID: (id) => `/reports/reports/${id}`,
    GENERATE_REPORT: (id) => `/reports/reports/${id}/generate`,
    REPORT_STATUS: (id) => `/reports/reports/${id}/status`,
    REPORT_EXPORT: (id) => `/reports/reports/${id}/export`,
    REPORT_SHARE: (id) => `/reports/reports/${id}/share`,
    REPORT_PERMISSIONS: (id) => `/reports/reports/${id}/permissions`,
    GENERATE_CHILD_REPORT: (id) => `/reports/child/${id}/generate-report`,
      // Analytics & Clinical (Professional Features)
    POPULATION_ANALYTICS: '/reports/analytics/population',
    COHORT_COMPARISON: '/reports/analytics/cohort-comparison',
    CLINICAL_INSIGHTS: '/reports/analytics/insights',
    TREATMENT_EFFECTIVENESS: '/reports/analytics/treatment-effectiveness',
    EXPORT_ANALYTICS: '/reports/analytics/export',
    CLINICAL_POPULATION: '/reports/clinical-analytics/population',
    CLINICAL_INSIGHTS_ADVANCED: '/reports/clinical-analytics/insights',
    TEST_DATA: '/reports/analytics/test-data',
    
    // Export Functions
    EXPORT_CHILD: (id) => `/reports/child/${id}/export`,
    EXPORT: '/reports/export',
    EXPORT_DASHBOARD: '/reports/export/dashboard',
    EXPORT_CHILD_PROGRESS: (id) => `/reports/export/child/${id}/progress`,
    EXPORT_SESSION: (id) => `/reports/export/session/${id}`
  },
  
  // Admin endpoints (ipotizzati)
  ADMIN: {
    USERS: '/admin/users',
    STATS: '/admin/stats',
    ANALYTICS: '/admin/analytics'
  }
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
