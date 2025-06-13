/**
 * API Types and Interfaces for Smile Adventure
 * JavaScript definitions for API request/response structures
 */

// ================================
// AUTHENTICATION TYPES
// ================================

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * @typedef {Object} RegisterUserData
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} confirmPassword - Password confirmation
 * @property {string} role - User role ('parent' | 'professional')
 * @property {string} firstName - User first name
 * @property {string} lastName - User last name
 * @property {string} [phone] - Optional phone number
 */

/**
 * @typedef {Object} AuthUser
 * @property {number} id - User ID
 * @property {string} email - User email
 * @property {string} firstName - User first name
 * @property {string} lastName - User last name
 * @property {string} role - User role
 * @property {string} [phone] - Phone number
 * @property {boolean} isActive - Account status
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * @typedef {Object} AuthResponse
 * @property {AuthUser} user - Authenticated user
 * @property {string} token - JWT access token
 * @property {string} refreshToken - JWT refresh token
 */

// ================================
// USER TYPES
// ================================

/**
 * @typedef {Object} UserProfile
 * @property {number} id - User ID
 * @property {string} email - User email
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} role - User role
 * @property {string} [phone] - Phone number
 * @property {string} [avatar] - Avatar URL
 * @property {UserPreferences} preferences - User preferences
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} language - User language ('it' | 'en')
 * @property {string} theme - UI theme ('light' | 'dark')
 * @property {boolean} emailNotifications - Email notifications enabled
 * @property {boolean} pushNotifications - Push notifications enabled
 * @property {string} timezone - User timezone
 */

/**
 * @typedef {Object} UpdateUserProfile
 * @property {string} [firstName] - First name
 * @property {string} [lastName] - Last name
 * @property {string} [phone] - Phone number
 * @property {File} [avatar] - Avatar file
 * @property {UserPreferences} [preferences] - User preferences
 */

// ================================
// CHILDREN TYPES
// ================================

/**
 * @typedef {Object} Child
 * @property {number} id - Child ID
 * @property {string} name - Child name
 * @property {string} dateOfBirth - Birth date (YYYY-MM-DD)
 * @property {number} age - Calculated age
 * @property {string} [avatar] - Avatar emoji or URL
 * @property {number} parentId - Parent user ID
 * @property {number} level - Current game level
 * @property {number} totalPoints - Total points earned
 * @property {number} currentStreak - Current daily streak
 * @property {number} bestStreak - Best streak achieved
 * @property {string} [lastActivityDate] - Last activity date
 * @property {ChildStats} stats - Child statistics
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * @typedef {Object} ChildStats
 * @property {number} totalSessions - Total game sessions
 * @property {number} completedActivities - Completed activities
 * @property {number} averageScore - Average game score
 * @property {number} hoursPlayed - Total hours played
 * @property {Object} weeklyProgress - Weekly progress data
 */

/**
 * @typedef {Object} CreateChildData
 * @property {string} name - Child name
 * @property {string} dateOfBirth - Birth date (YYYY-MM-DD)
 * @property {string} [avatar] - Avatar emoji
 */

/**
 * @typedef {Object} UpdateChildData
 * @property {string} [name] - Child name
 * @property {string} [dateOfBirth] - Birth date
 * @property {string} [avatar] - Avatar emoji
 */

// ================================
// GAME SESSION TYPES
// ================================

/**
 * @typedef {Object} GameSession
 * @property {number} id - Session ID
 * @property {number} childId - Child ID
 * @property {string} gameType - Type of game played
 * @property {number} duration - Session duration in seconds
 * @property {number} score - Final score
 * @property {number} pointsEarned - Points earned in session
 * @property {boolean} completed - Session completed
 * @property {Object} gameData - Game-specific data
 * @property {string} startedAt - Session start timestamp
 * @property {string} [completedAt] - Session completion timestamp
 */

/**
 * @typedef {Object} GameSessionQuery
 * @property {number} [childId] - Filter by child ID
 * @property {string} [gameType] - Filter by game type
 * @property {string} [startDate] - Start date filter (YYYY-MM-DD)
 * @property {string} [endDate] - End date filter (YYYY-MM-DD)
 * @property {number} [page] - Page number
 * @property {number} [limit] - Items per page
 */

/**
 * @typedef {Object} CreateGameSessionData
 * @property {number} childId - Child ID
 * @property {string} gameType - Game type
 * @property {Object} [gameData] - Initial game data
 */

// ================================
// ACTIVITY TYPES
// ================================

/**
 * @typedef {Object} Activity
 * @property {number} id - Activity ID
 * @property {number} childId - Child ID
 * @property {string} type - Activity type
 * @property {string} title - Activity title
 * @property {string} description - Activity description
 * @property {string} status - Activity status
 * @property {number} [pointsReward] - Points reward
 * @property {string} [dueDate] - Due date
 * @property {string} createdAt - Creation timestamp
 * @property {string} [completedAt] - Completion timestamp
 */

/**
 * @typedef {Object} CreateActivityData
 * @property {number} childId - Child ID
 * @property {string} type - Activity type
 * @property {string} title - Activity title
 * @property {string} description - Activity description
 * @property {number} [pointsReward] - Points reward
 * @property {string} [dueDate] - Due date
 */

// ================================
// ASSESSMENT TYPES
// ================================

/**
 * @typedef {Object} Assessment
 * @property {number} id - Assessment ID
 * @property {number} childId - Child ID
 * @property {number} professionalId - Professional ID
 * @property {string} type - Assessment type
 * @property {Object} data - Assessment data
 * @property {number} score - Assessment score
 * @property {string} notes - Professional notes
 * @property {string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} CreateAssessmentData
 * @property {number} childId - Child ID
 * @property {string} type - Assessment type
 * @property {Object} data - Assessment data
 * @property {number} score - Assessment score
 * @property {string} [notes] - Professional notes
 */

// ================================
// PROFESSIONAL TYPES
// ================================

/**
 * @typedef {Object} ProfessionalProfile
 * @property {number} id - Profile ID
 * @property {number} userId - User ID
 * @property {string} specialization - Professional specialization
 * @property {string} licenseNumber - License number
 * @property {string} [clinicName] - Clinic name
 * @property {string} [clinicAddress] - Clinic address
 * @property {string} [bio] - Professional bio
 * @property {number} rating - Average rating
 * @property {number} reviewCount - Number of reviews
 * @property {boolean} isVerified - Verification status
 * @property {string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} ProfessionalReview
 * @property {number} id - Review ID
 * @property {number} professionalId - Professional ID
 * @property {number} parentId - Parent ID
 * @property {number} rating - Rating (1-5)
 * @property {string} comment - Review comment
 * @property {string} createdAt - Creation timestamp
 */

// ================================
// REPORT TYPES
// ================================

/**
 * @typedef {Object} ChildProgressReport
 * @property {number} childId - Child ID
 * @property {string} period - Report period
 * @property {Object} gameStats - Game statistics
 * @property {Object} activityStats - Activity statistics
 * @property {Object} progressChart - Progress chart data
 * @property {Array} achievements - Achievements earned
 */

/**
 * @typedef {Object} ProfessionalAnalytics
 * @property {number} totalPatients - Total patients
 * @property {number} activePatients - Active patients
 * @property {number} completedSessions - Completed sessions
 * @property {number} averageImprovement - Average improvement
 * @property {Object} monthlyStats - Monthly statistics
 * @property {Array} topPerformers - Top performing children
 */

// ================================
// API RESPONSE TYPES
// ================================

/**
 * @typedef {Object} ApiSuccess
 * @property {boolean} success - Success status (true)
 * @property {*} data - Response data
 * @property {string} [message] - Success message
 * @property {Object} [meta] - Metadata (pagination, etc.)
 */

/**
 * @typedef {Object} ApiError
 * @property {boolean} success - Success status (false)
 * @property {string} message - Error message
 * @property {Array} [errors] - Validation errors
 * @property {number} [code] - Error code
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} items - Data items
 * @property {number} total - Total items count
 * @property {number} page - Current page
 * @property {number} limit - Items per page
 * @property {number} totalPages - Total pages
 * @property {boolean} hasNext - Has next page
 * @property {boolean} hasPrev - Has previous page
 */

// ================================
// VALIDATION TYPES
// ================================

/**
 * @typedef {Object} ValidationError
 * @property {string} field - Field name
 * @property {string} message - Error message
 * @property {string} code - Error code
 */

/**
 * @typedef {Object} FormValidationResult
 * @property {boolean} isValid - Validation result
 * @property {Array<ValidationError>} errors - Validation errors
 */

// ================================
// EXPORT CONSTANTS
// ================================

export const API_ENDPOINTS = {  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',  // Added for Task 17 compatibility
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
    // Users
  USERS: {
    DASHBOARD: '/users/dashboard',  // Added for Task 17 compatibility
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
    AVATAR: '/users/avatar',
  },
  
  // Children
  CHILDREN: {
    LIST: '/users/children',
    CREATE: '/users/children',
    GET: (id) => `/users/children/${id}`,
    UPDATE: (id) => `/users/children/${id}`,
    DELETE: (id) => `/users/children/${id}`,
    STATS: (id) => `/users/children/${id}/stats`,
  },    // Game Sessions
  GAME_SESSIONS: {
    LIST: '/reports/game-sessions',
    CREATE: '/reports/game-sessions',
    GET: (id) => `/reports/game-sessions/${id}`,
    UPDATE: (id) => `/reports/game-sessions/${id}`,
    DELETE: (id) => `/reports/game-sessions/${id}`,
    END: (id) => `/reports/game-sessions/${id}/end`,
    CHILD_SESSIONS: (childId) => `/reports/child/${childId}/sessions`,
  },
  
  // Activities
  ACTIVITIES: {
    LIST: '/activities',
    CREATE: '/activities',
    GET: (id) => `/activities/${id}`,
    UPDATE: (id) => `/activities/${id}`,
    DELETE: (id) => `/activities/${id}`,
    CHILD_ACTIVITIES: (childId) => `/children/${childId}/activities`,
    COMPLETE: (id) => `/activities/${id}/complete`,
  },
    // Assessments
  ASSESSMENTS: {
    LIST: '/assessments',
    CREATE: '/assessments',
    GET: (id) => `/assessments/${id}`,
    UPDATE: (id) => `/assessments/${id}`,
    DELETE: (id) => `/assessments/${id}`,
    CHILD_ASSESSMENTS: (childId) => `/children/${childId}/assessments`,
  },
    // Reports  
  REPORTS: {
    DASHBOARD: '/reports/dashboard',  // Added for Task 17 compatibility
    CHILD_PROGRESS: (childId) => `/reports/child/${childId}/progress`,
    CHILD_ANALYTICS: (childId) => `/reports/child/${childId}/analytics`,
    GAME_SESSIONS: '/reports/game-sessions',
  },
  
  // Professional
  PROFESSIONAL: {
    PROFILES: '/professional/profiles',
    PROFILE: (id) => `/professional/profiles/${id}`,
    REVIEWS: '/professional/reviews',
    PATIENTS: '/professional/patients',
    ANALYTICS: '/professional/analytics',
  },};

export const GAME_TYPES = {
  BRUSHING_TUTORIAL: 'brushing_tutorial',
  DENTAL_QUIZ: 'dental_quiz',
  CAVITY_DEFENDER: 'cavity_defender',
  TOOTH_FAIRY_ADVENTURE: 'tooth_fairy_adventure',
};

export const ACTIVITY_TYPES = {
  DAILY_BRUSHING: 'daily_brushing',
  DENTAL_CHECKUP: 'dental_checkup',
  HEALTHY_EATING: 'healthy_eating',
  EDUCATIONAL_VIDEO: 'educational_video',
  CUSTOM: 'custom',
};

export const USER_ROLES = {
  PARENT: 'parent',
  PROFESSIONAL: 'professional',
  ADMIN: 'admin',
};

export const ASSESSMENT_TYPES = {
  INITIAL: 'initial',
  PROGRESS: 'progress',
  FINAL: 'final',
  BEHAVIORAL: 'behavioral',
};

// Export all types for JSDoc usage
const apiConstants = {
  API_ENDPOINTS,
  GAME_TYPES,
  ACTIVITY_TYPES,
  USER_ROLES,
  ASSESSMENT_TYPES,
};

export default apiConstants;
