/**
 * Game Session Service
 * Gestisce le chiamate API per il tracking delle sessioni di gioco
 */

import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * Avvia una nuova sessione di gioco
 * @param {Object} sessionData - Dati della sessione
 * @param {number} sessionData.child_id - ID del bambino
 * @param {string} sessionData.session_type - Tipo di sessione
 * @param {string} sessionData.scenario_name - Nome dello scenario
 * @param {string} sessionData.scenario_id - ID dello scenario
 * @param {string} sessionData.device_type - Tipo di dispositivo
 * @param {string} sessionData.environment_type - Tipo di ambiente (home|clinic|school)
 * @param {boolean} sessionData.support_person_present - Presenza di supporto
 * @returns {Promise<Object>} Dati della sessione creata
 */
export const startGameSession = async (sessionData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.GAME_SESSION_CREATE, {
      child_id: sessionData.child_id,
      session_type: sessionData.session_type,
      scenario_name: sessionData.scenario_name,
      scenario_id: sessionData.scenario_id,
      device_type: sessionData.device_type || 'web',
      device_model: sessionData.device_model || navigator.userAgent,
      app_version: sessionData.app_version || '1.0.0',
      environment_type: sessionData.environment_type || 'home',
      support_person_present: sessionData.support_person_present || false,
      session_data_quality: 'good'
    });
    return response.data;
  } catch (error) {
    console.error('Error starting game session:', error);
    throw new Error(error.response?.data?.detail || 'Errore nell\'avvio della sessione');
  }
};

/**
 * Aggiorna una sessione di gioco in corso
 * @param {number} sessionId - ID della sessione
 * @param {Object} updateData - Dati di aggiornamento
 * @returns {Promise<Object>} Dati della sessione aggiornata
 */
export const updateGameSession = async (sessionId, updateData) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.GAME_SESSION_UPDATE(sessionId), updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating game session:', error);
    throw new Error(error.response?.data?.detail || 'Errore nell\'aggiornamento della sessione');
  }
};

/**
 * Termina una sessione di gioco
 * @param {number} sessionId - ID della sessione
 * @param {Object} endData - Dati di fine sessione
 * @param {string} endData.completion_status - Stato di completamento
 * @param {string} endData.exit_reason - Motivo di uscita
 * @param {number} endData.score - Punteggio finale
 * @param {number} endData.levels_completed - Livelli completati
 * @param {number} endData.max_level_reached - Livello massimo raggiunto
 * @param {number} endData.interactions_count - Numero di interazioni
 * @param {number} endData.correct_responses - Risposte corrette
 * @param {number} endData.help_requests - Richieste di aiuto
 * @param {Array} endData.achievement_unlocked - Achievement sbloccati
 * @param {Array} endData.progress_markers_hit - Milestone raggiunti
 * @param {Object} endData.emotional_data - Dati emotivi
 * @param {Object} endData.interaction_patterns - Pattern di interazione
 * @returns {Promise<Object>} Dati della sessione terminata
 */
export const endGameSession = async (sessionId, endData) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.GAME_SESSION_COMPLETE(sessionId), {
      ended_at: new Date().toISOString(),
      completion_status: endData.completion_status || 'completed',
      exit_reason: endData.exit_reason || 'normal_completion',
      score: endData.score || 0,
      levels_completed: endData.levels_completed || 0,
      max_level_reached: endData.max_level_reached || 0,
      interactions_count: endData.interactions_count || 0,
      correct_responses: endData.correct_responses || 0,
      incorrect_responses: (endData.interactions_count || 0) - (endData.correct_responses || 0),
      help_requests: endData.help_requests || 0,
      hint_usage_count: endData.hint_usage_count || 0,
      achievement_unlocked: endData.achievement_unlocked || [],
      progress_markers_hit: endData.progress_markers_hit || [],
      emotional_data: endData.emotional_data || {},
      interaction_patterns: endData.interaction_patterns || {}
    });
    return response.data;
  } catch (error) {
    console.error('Error ending game session:', error);
    throw new Error(error.response?.data?.detail || 'Errore nella terminazione della sessione');
  }
};

/**
 * Aggiunge note del genitore a una sessione
 * @param {number} sessionId - ID della sessione
 * @param {Object} parentData - Dati del genitore
 * @param {string} parentData.parent_notes - Note del genitore
 * @param {number} parentData.parent_rating - Rating del genitore (1-10)
 * @param {Object} parentData.parent_observed_behavior - Comportamenti osservati
 * @returns {Promise<Object>} Dati della sessione aggiornata
 */
export const addParentFeedback = async (sessionId, parentData) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.GAME_SESSION_PARENT_FEEDBACK(sessionId), {
      parent_notes: parentData.parent_notes,
      parent_rating: parentData.parent_rating,
      parent_observed_behavior: parentData.parent_observed_behavior || {}
    });
    return response.data;
  } catch (error) {
    console.error('Error adding parent feedback:', error);
    throw new Error(error.response?.data?.detail || 'Errore nell\'aggiunta del feedback');
  }
};

/**
 * Ottiene le sessioni di gioco di un bambino
 * @param {number} childId - ID del bambino
 * @param {Object} options - Opzioni di query
 * @param {number} options.limit - Limite risultati
 * @param {number} options.offset - Offset per paginazione
 * @param {string} options.session_type - Filtro per tipo sessione
 * @param {string} options.date_from - Data inizio filtro
 * @param {string} options.date_to - Data fine filtro
 * @returns {Promise<Object>} Lista delle sessioni
 */
export const getChildGameSessions = async (childId, options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    if (options.session_type) params.append('session_type', options.session_type);
    if (options.date_from) params.append('date_from', options.date_from);
    if (options.date_to) params.append('date_to', options.date_to);

    const response = await axiosInstance.get(`${API_ENDPOINTS.CHILD_GAME_SESSIONS(childId)}?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching child game sessions:', error);
    throw new Error(error.response?.data?.detail || 'Errore nel caricamento delle sessioni');
  }
};

/**
 * Ottiene i dettagli di una sessione specifica
 * @param {number} sessionId - ID della sessione
 * @returns {Promise<Object>} Dettagli della sessione
 */
export const getGameSession = async (sessionId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.GAME_SESSION_BY_ID(sessionId));
    return response.data;
  } catch (error) {
    console.error('Error fetching game session:', error);
    throw new Error(error.response?.data?.detail || 'Errore nel caricamento della sessione');
  }
};

/**
 * Ottiene le statistiche delle sessioni di un bambino
 * @param {number} childId - ID del bambino
 * @param {Object} options - Opzioni di query
 * @param {string} options.period - Periodo di analisi (week|month|quarter|year)
 * @param {string} options.date_from - Data inizio
 * @param {string} options.date_to - Data fine
 * @returns {Promise<Object>} Statistiche delle sessioni
 */
export const getChildSessionStats = async (childId, options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.period) params.append('period', options.period);
    if (options.date_from) params.append('date_from', options.date_from);
    if (options.date_to) params.append('date_to', options.date_to);

    const response = await axiosInstance.get(`${API_ENDPOINTS.CHILD_SESSION_STATS(childId)}?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching child session stats:', error);
    throw new Error(error.response?.data?.detail || 'Errore nel caricamento delle statistiche');
  }
};

/**
 * Ottiene l'analisi dei progressi di un bambino
 * @param {number} childId - ID del bambino
 * @param {Object} options - Opzioni di analisi
 * @param {number} options.days - Giorni di analisi (default: 30)
 * @param {string} options.metric_type - Tipo di metrica (score|engagement|improvement)
 * @returns {Promise<Object>} Analisi dei progressi
 */
export const getChildProgressAnalysis = async (childId, options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.days) params.append('days', options.days);
    if (options.metric_type) params.append('metric_type', options.metric_type);

    const response = await axiosInstance.get(`${API_ENDPOINTS.CHILD_PROGRESS_REPORT(childId)}?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching child progress analysis:', error);
    throw new Error(error.response?.data?.detail || 'Errore nell\'analisi dei progressi');
  }
};

/**
 * Pausa una sessione di gioco
 * @param {number} sessionId - ID della sessione
 * @returns {Promise<Object>} Dati della sessione aggiornata
 */
export const pauseGameSession = async (sessionId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.GAME_SESSION_PAUSE(sessionId));
    return response.data;
  } catch (error) {
    console.error('Error pausing game session:', error);
    throw new Error(error.response?.data?.detail || 'Errore nella pausa della sessione');
  }
};

/**
 * Riprende una sessione di gioco in pausa
 * @param {number} sessionId - ID della sessione
 * @returns {Promise<Object>} Dati della sessione aggiornata
 */
export const resumeGameSession = async (sessionId) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINTS.GAME_SESSION_RESUME(sessionId));
    return response.data;
  } catch (error) {
    console.error('Error resuming game session:', error);
    throw new Error(error.response?.data?.detail || 'Errore nella ripresa della sessione');
  }
};

/**
 * Utilità per calcolare la durata di una sessione
 * @param {string} startedAt - Data/ora di inizio
 * @param {string} endedAt - Data/ora di fine (opzionale, default: ora corrente)
 * @returns {number} Durata in secondi
 */
export const calculateSessionDuration = (startedAt, endedAt = null) => {
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : new Date();
  return Math.floor((end - start) / 1000);
};

/**
 * Utilità per formattare la durata in formato leggibile
 * @param {number} durationSeconds - Durata in secondi
 * @returns {string} Durata formattata (es. "2m 30s")
 */
export const formatSessionDuration = (durationSeconds) => {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Utilità per validare i dati di una sessione
 * @param {Object} sessionData - Dati della sessione
 * @returns {Object} Risultato della validazione
 */
export const validateSessionData = (sessionData) => {
  const errors = [];
  
  if (!sessionData.child_id) {
    errors.push('ID bambino richiesto');
  }
  
  if (!sessionData.session_type) {
    errors.push('Tipo sessione richiesto');
  }
  
  if (!sessionData.scenario_name) {
    errors.push('Nome scenario richiesto');
  }
  
  if (!sessionData.scenario_id) {
    errors.push('ID scenario richiesto');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  startGameSession,
  updateGameSession,
  endGameSession,
  addParentFeedback,
  getChildGameSessions,
  getGameSession,
  getChildSessionStats,
  getChildProgressAnalysis,
  pauseGameSession,
  resumeGameSession,
  calculateSessionDuration,
  formatSessionDuration,
  validateSessionData
};
