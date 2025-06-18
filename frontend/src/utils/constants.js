/**
 * Application Constants
 * Costanti utilizzate nell'applicazione
 */

/**
 * User Roles - Deve corrispondere agli enum del backend
 * @type {Object}
 */
export const USER_ROLES = {
  PARENT: 'parent',
  PROFESSIONAL: 'professional', 
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

/**
 * User Status - Deve corrispondere agli enum del backend
 * @type {Object}
 */
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  DELETED: 'deleted'
};

/**
 * Session Types per GameSession
 * @type {Object}
 */
export const SESSION_TYPES = {
  DENTAL_CARE: 'dental_care',
  THERAPY_SESSION: 'therapy_session',
  SOCIAL_INTERACTION: 'social_interaction'
};

/**
 * Environment Types
 * @type {Object}
 */
export const ENVIRONMENT_TYPES = {
  HOME: 'home',
  CLINIC: 'clinic',
  SCHOOL: 'school'
};

/**
 * Routes paths
 * @type {Object}
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
    // Children routes (for PARENT role)
  CHILDREN: '/children',
  CHILDREN_NEW: '/children/new',
  CHILDREN_DETAIL: '/children/:id',
  CHILDREN_EDIT: '/children/:id/edit',
  CHILD_PROGRESS: '/children/:childId/progress',
  CHILD_ACTIVITIES: '/children/:childId/activities',
    // Professional routes
  PROFESSIONAL_PROFILE: '/professional/professional-profile',
  PROFESSIONAL_SEARCH: '/professional/search',
  CLINICAL_ANALYTICS: '/professional/analytics',
  
  // Reports routes
  REPORTS: '/reports',
  CHILD_PROGRESS_REPORT: (childId) => `/reports/child/${childId}/progress`,
    // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SYSTEM: '/admin/system',
  
  // Password reset
  PASSWORD_RESET_REQUEST: '/password-reset',
  PASSWORD_RESET_CONFIRM: '/password-reset/confirm',
    // Public content pages
  ARTICLES: '/articles',
  ABOUT_US: '/about-us',
  FEEDBACK: '/feedback', // Added feedback route
  
  // Error pages
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized'
};

/**
 * Local Storage Keys
 * @type {Object}
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'smile_access_token',
  REFRESH_TOKEN: 'smile_refresh_token',
  USER_DATA: 'smile_user_data',
  REMEMBER_ME: 'smile_remember_me'
};

/**
 * HTTP Status Codes
 * @type {Object}
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

/**
 * Form validation messages
 * @type {Object}
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Campo obbligatorio',
  EMAIL_INVALID: 'Formato email non valido',
  PASSWORD_MIN_LENGTH: 'Password deve avere almeno 8 caratteri',
  PASSWORD_MISMATCH: 'Le password non corrispondono',
  PHONE_INVALID: 'Formato telefono non valido'
};

/**
 * Default values
 * @type {Object}
 */
export const DEFAULTS = {
  TIMEZONE: 'UTC',
  LANGUAGE: 'en',
  PAGINATION_LIMIT: 20,
  PROGRESS_REPORT_DAYS: 30
};

/**
 * Helper functions for generating dynamic routes
 */
export const generateChildRoute = (childId, type = 'detail') => {
  switch (type) {
    case 'detail':
      return `/children/${childId}`;
    case 'edit':
      return `/children/${childId}/edit`;
    case 'progress':
      return `/children/${childId}/progress`;
    case 'activities':
      return `/children/${childId}/activities`;
    default:
      return `/children/${childId}`;
  }
};
