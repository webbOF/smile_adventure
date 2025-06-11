/**
 * Report Service for Smile Adventure
 * Handles game sessions, analytics, reports, and activity management
 */

import api, { ApiUtils } from './api';
import { API_ENDPOINTS, GAME_TYPES, ACTIVITY_TYPES } from '../types/api';

/**
 * Report and Analytics Service
 * @typedef {import('../types/api').GameSession} GameSession
 * @typedef {import('../types/api').GameSessionQuery} GameSessionQuery
 * @typedef {import('../types/api').CreateGameSessionData} CreateGameSessionData
 * @typedef {import('../types/api').Activity} Activity
 * @typedef {import('../types/api').CreateActivityData} CreateActivityData
 * @typedef {import('../types/api').Assessment} Assessment
 * @typedef {import('../types/api').CreateAssessmentData} CreateAssessmentData
 * @typedef {import('../types/api').ChildProgressReport} ChildProgressReport
 * @typedef {import('../types/api').ProfessionalAnalytics} ProfessionalAnalytics
 * @typedef {import('../types/api').PaginatedResponse} PaginatedResponse
 */
class ReportService {

  // ================================
  // GAME SESSIONS MANAGEMENT
  // ================================

  /**
   * Get game sessions with optional filtering
   * @param {GameSessionQuery} [query] - Query parameters
   * @returns {Promise<PaginatedResponse<GameSession>>} Paginated game sessions
   */
  async getGameSessions(query = {}) {
    try {
      const params = ApiUtils.formatParams(query);
      const response = await api.get(API_ENDPOINTS.GAME_SESSIONS.LIST, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare le sessioni di gioco');
    }
  }

  /**
   * Get specific game session
   * @param {number} sessionId - Session ID
   * @returns {Promise<GameSession>} Game session data
   */
  async getGameSession(sessionId) {
    try {
      const response = await api.get(API_ENDPOINTS.GAME_SESSIONS.GET(sessionId));
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare la sessione di gioco');
    }
  }

  /**
   * Create new game session
   * @param {CreateGameSessionData} sessionData - New session data
   * @returns {Promise<GameSession>} Created session
   */
  async createGameSession(sessionData) {
    try {
      // Validate session data
      this.validateGameSessionData(sessionData);

      const response = await api.post(API_ENDPOINTS.GAME_SESSIONS.CREATE, sessionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile creare la sessione di gioco');
    }
  }

  /**
   * Update game session (for progress tracking)
   * @param {number} sessionId - Session ID
   * @param {Object} sessionData - Updated session data
   * @returns {Promise<GameSession>} Updated session
   */
  async updateGameSession(sessionId, sessionData) {
    try {
      const response = await api.put(API_ENDPOINTS.GAME_SESSIONS.UPDATE(sessionId), sessionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile aggiornare la sessione di gioco');
    }
  }

  /**
   * Complete game session
   * @param {number} sessionId - Session ID
   * @param {Object} completionData - Completion data (score, points, etc.)
   * @returns {Promise<GameSession>} Completed session
   */
  async completeGameSession(sessionId, completionData) {
    try {
      const response = await api.post(`${API_ENDPOINTS.GAME_SESSIONS.GET(sessionId)}/complete`, completionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile completare la sessione di gioco');
    }
  }

  /**
   * Get game sessions for specific child
   * @param {number} childId - Child ID
   * @param {Object} [query] - Query parameters
   * @returns {Promise<GameSession[]>} Child's game sessions
   */
  async getChildGameSessions(childId, query = {}) {
    try {
      const params = ApiUtils.formatParams(query);
      const response = await api.get(API_ENDPOINTS.GAME_SESSIONS.CHILD_SESSIONS(childId), { params });
      return response.data.sessions || response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare le sessioni del bambino');
    }
  }

  // ================================
  // ACTIVITIES MANAGEMENT
  // ================================

  /**
   * Get activities with optional filtering
   * @param {Object} [query] - Query parameters
   * @returns {Promise<PaginatedResponse<Activity>>} Paginated activities
   */
  async getActivities(query = {}) {
    try {
      const params = ApiUtils.formatParams(query);
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.LIST, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare le attività');
    }
  }

  /**
   * Get specific activity
   * @param {number} activityId - Activity ID
   * @returns {Promise<Activity>} Activity data
   */
  async getActivity(activityId) {
    try {
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.GET(activityId));
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare l\'attività');
    }
  }

  /**
   * Create new activity
   * @param {CreateActivityData} activityData - New activity data
   * @returns {Promise<Activity>} Created activity
   */
  async createActivity(activityData) {
    try {
      // Validate activity data
      this.validateActivityData(activityData);

      const response = await api.post(API_ENDPOINTS.ACTIVITIES.CREATE, activityData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile creare l\'attività');
    }
  }

  /**
   * Update activity
   * @param {number} activityId - Activity ID
   * @param {Object} activityData - Updated activity data
   * @returns {Promise<Activity>} Updated activity
   */
  async updateActivity(activityId, activityData) {
    try {
      const response = await api.put(API_ENDPOINTS.ACTIVITIES.UPDATE(activityId), activityData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile aggiornare l\'attività');
    }
  }

  /**
   * Complete activity
   * @param {number} activityId - Activity ID
   * @param {Object} [completionData] - Optional completion data
   * @returns {Promise<Activity>} Completed activity
   */
  async completeActivity(activityId, completionData = {}) {
    try {
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.COMPLETE(activityId), completionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile completare l\'attività');
    }
  }

  /**
   * Get activities for specific child
   * @param {number} childId - Child ID
   * @param {Object} [query] - Query parameters
   * @returns {Promise<Activity[]>} Child's activities
   */
  async getChildActivities(childId, query = {}) {
    try {
      const params = ApiUtils.formatParams(query);
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.CHILD_ACTIVITIES(childId), { params });
      return response.data.activities || response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare le attività del bambino');
    }
  }

  // ================================
  // ASSESSMENTS MANAGEMENT (for professionals)
  // ================================

  /**
   * Get assessments with optional filtering
   * @param {Object} [query] - Query parameters
   * @returns {Promise<PaginatedResponse<Assessment>>} Paginated assessments
   */
  async getAssessments(query = {}) {
    try {
      const params = ApiUtils.formatParams(query);
      const response = await api.get(API_ENDPOINTS.ASSESSMENTS.LIST, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare le valutazioni');
    }
  }

  /**
   * Create new assessment
   * @param {CreateAssessmentData} assessmentData - New assessment data
   * @returns {Promise<Assessment>} Created assessment
   */
  async createAssessment(assessmentData) {
    try {
      const response = await api.post(API_ENDPOINTS.ASSESSMENTS.CREATE, assessmentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile creare la valutazione');
    }
  }

  /**
   * Update assessment
   * @param {number} assessmentId - Assessment ID
   * @param {Object} assessmentData - Updated assessment data
   * @returns {Promise<Assessment>} Updated assessment
   */
  async updateAssessment(assessmentId, assessmentData) {
    try {
      const response = await api.put(API_ENDPOINTS.ASSESSMENTS.UPDATE(assessmentId), assessmentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile aggiornare la valutazione');
    }
  }

  /**
   * Get assessments for specific child
   * @param {number} childId - Child ID
   * @returns {Promise<Assessment[]>} Child's assessments
   */
  async getChildAssessments(childId) {
    try {
      const response = await api.get(API_ENDPOINTS.ASSESSMENTS.CHILD_ASSESSMENTS(childId));
      return response.data.assessments || response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare le valutazioni del bambino');
    }
  }

  // ================================
  // REPORTS AND ANALYTICS
  // ================================

  /**
   * Get child progress report
   * @param {number} childId - Child ID
   * @param {Object} [options] - Report options (period, etc.)
   * @returns {Promise<ChildProgressReport>} Progress report
   */
  async getChildProgressReport(childId, options = {}) {
    try {
      const params = ApiUtils.formatParams(options);
      const response = await api.get(API_ENDPOINTS.REPORTS.CHILD_PROGRESS(childId), { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile generare il report dei progressi');
    }
  }

  /**
   * Get professional analytics
   * @param {Object} [options] - Analytics options
   * @returns {Promise<ProfessionalAnalytics>} Professional analytics
   */
  async getProfessionalAnalytics(options = {}) {
    try {
      const params = ApiUtils.formatParams(options);
      const response = await api.get(API_ENDPOINTS.REPORTS.PROFESSIONAL_ANALYTICS, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile recuperare le analisi professionali');
    }
  }

  /**
   * Export report data
   * @param {Object} exportOptions - Export options (format, filters, etc.)
   * @returns {Promise<Blob>} Export file blob
   */
  async exportReport(exportOptions) {
    try {
      const response = await api.post(API_ENDPOINTS.REPORTS.EXPORT, exportOptions, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Impossibile esportare il report');
    }
  }

  // ================================
  // ANALYTICS UTILITIES
  // ================================

  /**
   * Calculate child statistics from raw data
   * @param {GameSession[]} sessions - Game sessions
   * @param {Activity[]} activities - Activities
   * @returns {Object} Calculated statistics
   */
  calculateChildStats(sessions, activities) {
    const stats = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.completed).length,
      totalActivities: activities.length,
      completedActivities: activities.filter(a => a.status === 'completed').length,
      totalScore: sessions.reduce((sum, s) => sum + (s.score || 0), 0),
      totalPoints: sessions.reduce((sum, s) => sum + (s.pointsEarned || 0), 0),
      averageScore: 0,
      hoursPlayed: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 3600, // Convert to hours
      streakCount: this.calculateCurrentStreak(activities),
      favoriteGameType: this.getFavoriteGameType(sessions),
      weeklyProgress: this.calculateWeeklyProgress(sessions),
      monthlyProgress: this.calculateMonthlyProgress(sessions),
    };

    // Calculate average score
    const completedSessions = sessions.filter(s => s.completed && s.score > 0);
    if (completedSessions.length > 0) {
      stats.averageScore = Math.round(
        completedSessions.reduce((sum, s) => sum + s.score, 0) / completedSessions.length
      );
    }

    return stats;
  }

  /**
   * Calculate current streak from activities
   * @param {Activity[]} activities - Activities to analyze
   * @returns {number} Current streak count
   */
  calculateCurrentStreak(activities) {
    const completedActivities = activities
      .filter(a => a.status === 'completed' && a.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const activity of completedActivities) {
      const activityDate = new Date(activity.completedAt);
      activityDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  /**
   * Get favorite game type from sessions
   * @param {GameSession[]} sessions - Game sessions
   * @returns {string} Most played game type
   */
  getFavoriteGameType(sessions) {
    const gameTypeCounts = sessions.reduce((counts, session) => {
      counts[session.gameType] = (counts[session.gameType] || 0) + 1;
      return counts;
    }, {});

    return Object.keys(gameTypeCounts).reduce((a, b) => 
      gameTypeCounts[a] > gameTypeCounts[b] ? a : b
    ) || null;
  }

  /**
   * Calculate weekly progress data
   * @param {GameSession[]} sessions - Game sessions
   * @returns {Object} Weekly progress data
   */
  calculateWeeklyProgress(sessions) {
    const weeklyData = {};
    const now = new Date();
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      weeklyData[dateKey] = 0;
    }

    // Count sessions per day
    sessions.forEach(session => {
      const sessionDate = session.startedAt.split('T')[0];
      if (weeklyData.hasOwnProperty(sessionDate)) {
        weeklyData[sessionDate]++;
      }
    });

    return weeklyData;
  }

  /**
   * Calculate monthly progress data
   * @param {GameSession[]} sessions - Game sessions
   * @returns {Object} Monthly progress data
   */
  calculateMonthlyProgress(sessions) {
    const monthlyData = {};
    const now = new Date();
    
    // Get last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      monthlyData[dateKey] = 0;
    }

    // Count sessions per day
    sessions.forEach(session => {
      const sessionDate = session.startedAt.split('T')[0];
      if (monthlyData.hasOwnProperty(sessionDate)) {
        monthlyData[sessionDate]++;
      }
    });

    return monthlyData;
  }

  // ================================
  // VALIDATION METHODS
  // ================================

  /**
   * Validate game session data
   * @param {CreateGameSessionData} sessionData - Session data to validate
   * @throws {Error} Validation error
   */
  validateGameSessionData(sessionData) {
    const errors = [];

    if (!sessionData.childId) {
      errors.push('ID del bambino richiesto');
    }

    if (!sessionData.gameType) {
      errors.push('Tipo di gioco richiesto');
    }

    if (sessionData.gameType && !Object.values(GAME_TYPES).includes(sessionData.gameType)) {
      errors.push('Tipo di gioco non valido');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Validate activity data
   * @param {CreateActivityData} activityData - Activity data to validate
   * @throws {Error} Validation error
   */
  validateActivityData(activityData) {
    const errors = [];

    if (!activityData.childId) {
      errors.push('ID del bambino richiesto');
    }

    if (!activityData.type) {
      errors.push('Tipo di attività richiesto');
    }

    if (activityData.type && !Object.values(ACTIVITY_TYPES).includes(activityData.type)) {
      errors.push('Tipo di attività non valido');
    }

    if (!activityData.title?.trim()) {
      errors.push('Titolo dell\'attività richiesto');
    }

    if (activityData.dueDate) {
      const dueDate = new Date(activityData.dueDate);
      if (dueDate < new Date()) {
        errors.push('La data di scadenza non può essere nel passato');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
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
    console.error('ReportService Error:', {
      message,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error.message,
    });
    
    return new Error(message);
  }

  // ================================
  // FILTERING AND SEARCH
  // ================================

  /**
   * Filter sessions by date range
   * @param {GameSession[]} sessions - Sessions to filter
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {GameSession[]} Filtered sessions
   */
  filterSessionsByDateRange(sessions, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include full end day
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.startedAt);
      return sessionDate >= start && sessionDate <= end;
    });
  }

  /**
   * Filter sessions by game type
   * @param {GameSession[]} sessions - Sessions to filter
   * @param {string} gameType - Game type to filter by
   * @returns {GameSession[]} Filtered sessions
   */
  filterSessionsByGameType(sessions, gameType) {
    return sessions.filter(session => session.gameType === gameType);
  }

  /**
   * Sort sessions by various criteria
   * @param {GameSession[]} sessions - Sessions to sort
   * @param {string} sortBy - Sort criteria ('date', 'score', 'duration')
   * @param {string} order - Sort order ('asc', 'desc')
   * @returns {GameSession[]} Sorted sessions
   */
  sortSessions(sessions, sortBy = 'date', order = 'desc') {
    const sorted = [...sessions].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case 'date':
        default:
          aValue = new Date(a.startedAt);
          bValue = new Date(b.startedAt);
          break;
      }
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }
}

// Create and export singleton instance
const reportService = new ReportService();

export default reportService;
export { reportService, ReportService };
