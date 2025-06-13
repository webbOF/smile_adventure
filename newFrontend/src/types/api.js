/**
 * 🎯 SmileAdventure API Types & Constants
 * JavaScript type definitions and constants for all 103 API routes
 * Provides TypeScript-like structure for better code maintainability
 */

// 🔧 API Configuration Constants
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf', 'text/csv', 'application/vnd.ms-excel']
};

// 🎮 User Roles & Permissions
export const USER_ROLES = {
  PARENT: 'parent',
  PROFESSIONAL: 'professional',
  ADMIN: 'admin'
};

export const PERMISSIONS = {
  READ_OWN_DATA: 'read_own_data',
  WRITE_OWN_DATA: 'write_own_data',
  READ_CHILDREN_DATA: 'read_children_data',
  WRITE_CHILDREN_DATA: 'write_children_data',
  READ_ALL_DATA: 'read_all_data',
  WRITE_ALL_DATA: 'write_all_data',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data'
};

// 🎯 Game Types & Categories
export const GAME_TYPES = {
  SENSORY_INTEGRATION: 'sensory_integration',
  COGNITIVE_TRAINING: 'cognitive_training',
  MOTOR_SKILLS: 'motor_skills',
  SOCIAL_SKILLS: 'social_skills',
  COMMUNICATION: 'communication',
  EMOTIONAL_REGULATION: 'emotional_regulation'
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

// 📊 Progress & Achievement Types
export const PROGRESS_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  MASTERED: 'mastered'
};

export const ACHIEVEMENT_TYPES = {
  MILESTONE: 'milestone',
  STREAK: 'streak',
  PERFECT_SCORE: 'perfect_score',
  TIME_BASED: 'time_based',
  SKILL_MASTERY: 'skill_mastery'
};

// 🔍 Sensory Profile Types
export const SENSORY_CATEGORIES = {
  AUDITORY: 'auditory',
  VISUAL: 'visual',
  TACTILE: 'tactile',
  VESTIBULAR: 'vestibular',
  PROPRIOCEPTIVE: 'proprioceptive',
  OLFACTORY: 'olfactory',
  GUSTATORY: 'gustatory'
};

export const SENSORY_RESPONSES = {
  UNDER_RESPONSIVE: 'under_responsive',
  TYPICAL: 'typical',
  OVER_RESPONSIVE: 'over_responsive'
};

// 📈 Report & Analytics Types
export const REPORT_TYPES = {
  PROGRESS_SUMMARY: 'progress_summary',
  DETAILED_ANALYSIS: 'detailed_analysis',
  COMPARATIVE: 'comparative',
  CLINICAL: 'clinical',
  PARENT_FRIENDLY: 'parent_friendly'
};

export const EXPORT_FORMATS = {
  PDF: 'pdf',
  CSV: 'csv',
  EXCEL: 'excel',
  JSON: 'json'
};

// 🚨 Error Types & HTTP Status Codes
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'validation_error',
  AUTHENTICATION_ERROR: 'authentication_error',
  AUTHORIZATION_ERROR: 'authorization_error',
  NOT_FOUND_ERROR: 'not_found_error',
  SERVER_ERROR: 'server_error',
  NETWORK_ERROR: 'network_error',
  TIMEOUT_ERROR: 'timeout_error'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// 👤 User & Profile Types
/**
 * @typedef {Object} User
 * @property {string} id - User unique identifier
 * @property {string} email - User email address
 * @property {string} first_name - User first name
 * @property {string} last_name - User last name
 * @property {string} role - User role (parent|professional|admin)
 * @property {string} phone - User phone number
 * @property {string} date_of_birth - User date of birth
 * @property {string} avatar_url - User avatar image URL
 * @property {boolean} email_verified - Email verification status
 * @property {boolean} is_active - Account active status
 * @property {string} created_at - Account creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} UserProfile
 * @property {User} user - User basic information
 * @property {Object} preferences - User preferences
 * @property {Array<Child>} children - User's children (for parents)
 * @property {ProfessionalProfile} professional_profile - Professional details (for professionals)
 * @property {Object} statistics - User statistics and achievements
 */

/**
 * @typedef {Object} Child
 * @property {string} id - Child unique identifier
 * @property {string} parent_id - Parent user ID
 * @property {string} first_name - Child first name
 * @property {string} last_name - Child last name
 * @property {string} date_of_birth - Child date of birth
 * @property {string} gender - Child gender
 * @property {string} avatar_url - Child avatar image URL
 * @property {Object} sensory_profile - Child sensory preferences
 * @property {Array<string>} conditions - Child conditions/diagnoses
 * @property {Object} preferences - Child game preferences
 * @property {boolean} is_active - Child account status
 * @property {string} created_at - Profile creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} ProfessionalProfile
 * @property {string} id - Professional profile ID
 * @property {string} user_id - Associated user ID
 * @property {string} license_number - Professional license number
 * @property {string} specialty - Professional specialty
 * @property {Array<string>} certifications - Professional certifications
 * @property {string} institution - Workplace/institution
 * @property {string} bio - Professional biography
 * @property {Array<string>} specialties - Areas of expertise
 * @property {boolean} verified - Verification status
 * @property {Object} contact_info - Professional contact information
 */

// 🎮 Game Session & Progress Types
/**
 * @typedef {Object} GameSession
 * @property {string} id - Session unique identifier
 * @property {string} child_id - Child who played the session
 * @property {string} game_type - Type of game played
 * @property {string} game_level - Difficulty level
 * @property {number} duration - Session duration in seconds
 * @property {number} score - Session score
 * @property {number} max_score - Maximum possible score
 * @property {Object} performance_data - Detailed performance metrics
 * @property {Object} sensory_data - Sensory-related data collected
 * @property {string} status - Session status (completed|abandoned|in_progress)
 * @property {string} started_at - Session start timestamp
 * @property {string} completed_at - Session completion timestamp
 */

/**
 * @typedef {Object} ProgressData
 * @property {string} child_id - Child identifier
 * @property {string} skill_area - Skill area being tracked
 * @property {number} current_level - Current skill level
 * @property {number} progress_percentage - Progress percentage
 * @property {Array<Object>} milestones - Achieved milestones
 * @property {Object} strengths - Identified strengths
 * @property {Object} areas_for_improvement - Areas needing work
 * @property {string} last_assessed - Last assessment timestamp
 */

// 📊 Analytics & Report Types
/**
 * @typedef {Object} DashboardData
 * @property {Object} overview - High-level statistics
 * @property {Array<Object>} recent_sessions - Recent game sessions
 * @property {Object} progress_summary - Progress across skill areas
 * @property {Array<Object>} achievements - Recent achievements
 * @property {Object} recommendations - Personalized recommendations
 */

/**
 * @typedef {Object} AnalyticsData
 * @property {Object} performance_metrics - Performance statistics
 * @property {Object} progress_trends - Progress over time
 * @property {Object} engagement_data - Engagement metrics
 * @property {Object} skill_development - Skill development tracking
 * @property {Array<Object>} session_analytics - Detailed session data
 */

/**
 * @typedef {Object} ReportData
 * @property {string} report_id - Report identifier
 * @property {string} report_type - Type of report
 * @property {string} child_id - Child the report is for
 * @property {Object} summary - Report summary
 * @property {Object} detailed_findings - Detailed analysis
 * @property {Array<Object>} recommendations - Professional recommendations
 * @property {Object} charts_data - Data for visualizations
 * @property {string} generated_at - Report generation timestamp
 */

// 🔐 Authentication & API Response Types
/**
 * @typedef {Object} AuthTokens
 * @property {string} access_token - JWT access token
 * @property {string} refresh_token - JWT refresh token
 * @property {number} expires_in - Token expiration time in seconds
 * @property {string} token_type - Token type (usually "Bearer")
 */

/**
 * @typedef {Object} LoginResponse
 * @property {boolean} success - Request success status
 * @property {string} message - Response message
 * @property {User} user - Authenticated user data
 * @property {AuthTokens} tokens - Authentication tokens
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Request success status
 * @property {string} message - Response message
 * @property {*} data - Response data (varies by endpoint)
 * @property {Object} meta - Metadata (pagination, etc.)
 * @property {Array<Object>} errors - Error details (if any)
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array<*>} items - Array of data items
 * @property {number} total - Total number of items
 * @property {number} page - Current page number
 * @property {number} per_page - Items per page
 * @property {number} total_pages - Total number of pages
 * @property {boolean} has_next - Whether there's a next page
 * @property {boolean} has_prev - Whether there's a previous page
 */

/**
 * @typedef {Object} FileUploadResponse
 * @property {boolean} success - Upload success status
 * @property {string} message - Upload message
 * @property {string} file_url - Uploaded file URL
 * @property {string} file_id - File identifier
 * @property {number} file_size - File size in bytes
 * @property {string} mime_type - File MIME type
 */

// 🎯 Achievement & Gamification Types
/**
 * @typedef {Object} Achievement
 * @property {string} id - Achievement identifier
 * @property {string} name - Achievement name
 * @property {string} description - Achievement description
 * @property {string} type - Achievement type
 * @property {string} icon_url - Achievement icon URL
 * @property {number} points - Points awarded
 * @property {Object} criteria - Achievement criteria
 * @property {boolean} is_unlocked - Whether user has unlocked it
 * @property {string} unlocked_at - Unlock timestamp
 */

/**
 * @typedef {Object} GameificationStats
 * @property {number} total_points - Total points earned
 * @property {number} current_streak - Current daily streak
 * @property {number} longest_streak - Longest streak achieved
 * @property {Array<Achievement>} achievements - Unlocked achievements
 * @property {number} level - Current user level
 * @property {number} experience - Experience points
 * @property {Object} badges - Earned badges
 */

// 🔍 Search & Filter Types
/**
 * @typedef {Object} SearchParams
 * @property {string} query - Search query string
 * @property {Array<string>} filters - Applied filters
 * @property {string} sort_by - Sort field
 * @property {string} sort_order - Sort order (asc|desc)
 * @property {number} page - Page number
 * @property {number} per_page - Items per page
 * @property {Object} date_range - Date range filter
 */

/**
 * @typedef {Object} FilterOptions
 * @property {Array<string>} game_types - Available game types
 * @property {Array<string>} difficulty_levels - Available difficulty levels
 * @property {Array<string>} skill_areas - Available skill areas
 * @property {Object} date_ranges - Predefined date ranges
 * @property {Array<string>} progress_statuses - Available progress statuses
 */

// 🏥 Clinical & Professional Types
/**
 * @typedef {Object} ClinicalInsight
 * @property {string} insight_id - Insight identifier
 * @property {string} child_id - Related child
 * @property {string} insight_type - Type of clinical insight
 * @property {string} title - Insight title
 * @property {string} description - Detailed description
 * @property {Object} supporting_data - Data supporting the insight
 * @property {number} confidence_level - Confidence in insight (0-100)
 * @property {Array<string>} recommendations - Professional recommendations
 * @property {string} generated_at - Insight generation timestamp
 */

/**
 * @typedef {Object} TherapySession
 * @property {string} session_id - Session identifier
 * @property {string} child_id - Child participant
 * @property {string} professional_id - Conducting professional
 * @property {string} session_type - Type of therapy session
 * @property {number} duration - Session duration in minutes
 * @property {Object} goals - Session goals
 * @property {Object} activities - Activities conducted
 * @property {Object} outcomes - Session outcomes
 * @property {string} notes - Professional notes
 * @property {string} scheduled_at - Scheduled timestamp
 * @property {string} conducted_at - Actual timestamp
 */

// 🔄 Export & Sharing Types
/**
 * @typedef {Object} ExportOptions
 * @property {string} format - Export format (pdf|csv|excel|json)
 * @property {Array<string>} include_fields - Fields to include
 * @property {Object} date_range - Date range for export
 * @property {boolean} include_charts - Include visualizations
 * @property {boolean} include_raw_data - Include raw session data
 * @property {string} template - Report template to use
 */

/**
 * @typedef {Object} ShareSettings
 * @property {string} share_type - Type of sharing (link|email|direct)
 * @property {Array<string>} recipients - Share recipients
 * @property {Object} permissions - Share permissions
 * @property {string} expiry_date - Share link expiry
 * @property {boolean} password_protected - Whether password protected
 * @property {string} message - Optional message
 */

// 🎨 UI & Component Types
/**
 * @typedef {Object} ChartConfig
 * @property {string} chart_type - Type of chart
 * @property {Object} data - Chart data
 * @property {Object} options - Chart configuration options
 * @property {Array<string>} colors - Color palette
 * @property {boolean} responsive - Whether chart is responsive
 */

/**
 * @typedef {Object} TableConfig
 * @property {Array<Object>} columns - Table column definitions
 * @property {Array<Object>} data - Table data
 * @property {Object} pagination - Pagination settings
 * @property {Object} sorting - Sorting configuration
 * @property {Object} filtering - Filter configuration
 */

// 🌐 API Utility Functions
export const ApiUtils = {
  /**
   * Check if API response indicates success
   * @param {ApiResponse} response - API response object
   * @returns {boolean} Success status
   */
  isSuccess: (response) => response?.success === true,

  /**
   * Extract error message from API response
   * @param {ApiResponse} response - API response object
   * @returns {string} Error message
   */
  getErrorMessage: (response) => {
    if (response?.errors?.length > 0) {
      return response.errors[0].message || 'Unknown error';
    }
    return response?.message || 'Request failed';
  },

  /**
   * Build query string from parameters object
   * @param {Object} params - Parameters object
   * @returns {string} Query string
   */
  buildQueryString: (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    return queryParams.toString();
  },

  /**
   * Format URL with path parameters
   * @param {string} url - URL template with placeholders
   * @param {Object} params - Parameters to replace in URL
   * @returns {string} Formatted URL
   */
  formatUrl: (url, params) => {
    let formattedUrl = url;
    Object.entries(params).forEach(([key, value]) => {
      formattedUrl = formattedUrl.replace(`{${key}}`, encodeURIComponent(value));
    });
    return formattedUrl;
  },

  /**
   * Validate file type and size
   * @param {File} file - File to validate
   * @param {Array<string>} allowedTypes - Allowed MIME types
   * @param {number} maxSize - Maximum file size in bytes
   * @returns {Object} Validation result
   */
  validateFile: (file, allowedTypes = [], maxSize = API_CONFIG.MAX_FILE_SIZE) => {
    const errors = [];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }
    
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// 📋 Default Values & Constants
export const DEFAULT_VALUES = {
  PAGINATION: {
    page: 1,
    per_page: 20,
    max_per_page: 100
  },
  
  CACHE_KEYS: {
    USER_PROFILE: 'user_profile',
    CHILDREN_LIST: 'children_list',
    DASHBOARD_DATA: 'dashboard_data',
    PREFERENCES: 'user_preferences'
  },
  
  TIMEOUTS: {
    SHORT: 5000,    // 5 seconds
    MEDIUM: 15000,  // 15 seconds
    LONG: 30000     // 30 seconds
  },
  
  RETRY_CONFIG: {
    attempts: 3,
    delay: 1000,
    backoff: 2
  }
};

export default {
  API_CONFIG,
  USER_ROLES,
  PERMISSIONS,
  GAME_TYPES,
  DIFFICULTY_LEVELS,
  PROGRESS_STATUS,
  ACHIEVEMENT_TYPES,
  SENSORY_CATEGORIES,
  SENSORY_RESPONSES,
  REPORT_TYPES,
  EXPORT_FORMATS,
  ERROR_TYPES,
  HTTP_STATUS,
  ApiUtils,
  DEFAULT_VALUES
};
