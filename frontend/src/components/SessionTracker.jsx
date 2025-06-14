import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button } from './UI';
import {
  startGameSession,
  endGameSession,
  pauseGameSession,
  resumeGameSession,
  calculateSessionDuration,
  formatSessionDuration
} from '../services/gameSessionService';
import './SessionTracker.css';

/**
 * SessionTracker Component
 * Componente per il tracking in tempo reale delle sessioni di gioco
 */
const SessionTracker = ({
  child,
  sessionType,
  scenarioName,
  scenarioId,
  onSessionStart,
  onSessionEnd,
  onSessionUpdate,
  autoStart = false,
  showControls = true,
  showStats = true
}) => {
  const [session, setSession] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [stats, setStats] = useState({
    score: 0,
    levelsCompleted: 0,
    maxLevelReached: 0,
    interactionsCount: 0,
    correctResponses: 0,
    helpRequests: 0,
    achievementsUnlocked: [],
    progressMarkersHit: []
  });

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pauseTimeRef = useRef(0);

  // Auto-start session se richiesto
  useEffect(() => {
    if (autoStart && !session) {
      handleStartSession();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoStart]);

  // Timer per aggiornare la durata corrente
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = calculateSessionDuration(startTimeRef.current) - pauseTimeRef.current;
          setCurrentTime(elapsed);
        }
      }, 1000);    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  /**
   * Avvia una nuova sessione di gioco
   */
  const handleStartSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const sessionData = {
        child_id: child.id,
        session_type: sessionType,
        scenario_name: scenarioName,
        scenario_id: scenarioId,
        device_type: 'web',
        environment_type: 'home',
        support_person_present: true
      };

      const newSession = await startGameSession(sessionData);
      setSession(newSession);
      setIsActive(true);
      setIsPaused(false);
      startTimeRef.current = newSession.started_at;
      setCurrentTime(0);
      pauseTimeRef.current = 0;

      if (onSessionStart) {
        onSessionStart(newSession);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Termina la sessione corrente
   */
  const handleEndSession = async (exitReason = 'normal_completion') => {
    if (!session) return;

    try {
      setIsLoading(true);
      setError(null);

      const endData = {
        completion_status: exitReason === 'normal_completion' ? 'completed' : 'interrupted',
        exit_reason: exitReason,
        ...stats,
        duration_seconds: currentTime,
        emotional_data: {
          engagement_level: 'high',
          frustration_events: 0,
          joy_moments: stats.achievementsUnlocked.length
        },
        interaction_patterns: {
          preferred_interaction_type: 'touch',
          response_time_avg: 2.5,
          attention_span: currentTime
        }
      };

      const endedSession = await endGameSession(session.id, endData);
      
      setSession(null);
      setIsActive(false);
      setIsPaused(false);
      setCurrentTime(0);
      setStats({
        score: 0,
        levelsCompleted: 0,
        maxLevelReached: 0,
        interactionsCount: 0,
        correctResponses: 0,
        helpRequests: 0,
        achievementsUnlocked: [],
        progressMarkersHit: []
      });

      if (onSessionEnd) {
        onSessionEnd(endedSession);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Pausa/riprende la sessione
   */
  const handleTogglePause = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      setError(null);

      if (isPaused) {
        await resumeGameSession(session.id);
        setIsPaused(false);
      } else {
        await pauseGameSession(session.id);
        setIsPaused(true);
        pauseTimeRef.current += Date.now() - new Date(startTimeRef.current).getTime();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Aggiorna le statistiche della sessione
   */
  const updateStats = (newStats) => {
    setStats(prev => ({ ...prev, ...newStats }));
    
    if (session && onSessionUpdate) {
      onSessionUpdate(session.id, newStats);
    }
  };

  /**
   * Aggiunge punti al punteggio
   */
  const addScore = (points) => {
    updateStats({ score: stats.score + points });
  };

  /**
   * Completa un livello
   */
  const completeLevel = (level) => {
    updateStats({
      levelsCompleted: stats.levelsCompleted + 1,
      maxLevelReached: Math.max(stats.maxLevelReached, level)
    });
  };

  /**
   * Registra un'interazione
   */
  const recordInteraction = (isCorrect = true) => {
    updateStats({
      interactionsCount: stats.interactionsCount + 1,
      correctResponses: isCorrect ? stats.correctResponses + 1 : stats.correctResponses
    });
  };

  /**
   * Registra una richiesta di aiuto
   */
  const recordHelpRequest = () => {
    updateStats({ helpRequests: stats.helpRequests + 1 });
  };

  /**
   * Sblocca un achievement
   */
  const unlockAchievement = (achievement) => {
    if (!stats.achievementsUnlocked.includes(achievement)) {
      updateStats({
        achievementsUnlocked: [...stats.achievementsUnlocked, achievement]
      });
    }
  };

  /**
   * Registra un progress marker
   */
  const hitProgressMarker = (marker) => {
    if (!stats.progressMarkersHit.includes(marker)) {
      updateStats({
        progressMarkersHit: [...stats.progressMarkersHit, marker]
      });
    }
  };

  // Espone le funzioni al componente parent tramite ref
  React.useImperativeHandle(child.ref, () => ({
    startSession: handleStartSession,
    endSession: handleEndSession,
    togglePause: handleTogglePause,
    addScore,
    completeLevel,
    recordInteraction,
    recordHelpRequest,
    unlockAchievement,
    hitProgressMarker,
    getCurrentStats: () => stats,
    getCurrentTime: () => currentTime,
    isSessionActive: () => isActive,
    isSessionPaused: () => isPaused
  }));

  return (
    <div className="session-tracker">
      {error && (
        <div className="session-tracker-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {showControls && (
        <div className="session-tracker-controls">
          {!isActive ? (
            <Button
              onClick={handleStartSession}
              disabled={isLoading}
              variant="primary"
              className="session-start-btn"
            >
              {isLoading ? 'Avvio...' : '🎮 Inizia Sessione'}
            </Button>
          ) : (
            <div className="session-control-group">
              <Button
                onClick={handleTogglePause}
                disabled={isLoading}
                variant="secondary"
                className="session-pause-btn"
              >
                {isPaused ? '▶️ Riprendi' : '⏸️ Pausa'}
              </Button>
              <Button
                onClick={() => handleEndSession('manual_end')}
                disabled={isLoading}
                variant="danger"
                className="session-end-btn"
              >
                🏁 Termina
              </Button>
            </div>
          )}
        </div>
      )}

      {isActive && showStats && (
        <div className="session-tracker-stats">
          <div className="session-header">
            <div className="session-status">
              <span className={`status-indicator ${isPaused ? 'paused' : 'active'}`}>
                {isPaused ? '⏸️ In Pausa' : '🎮 In Corso'}
              </span>
              <span className="session-time">
                ⏱️ {formatSessionDuration(currentTime)}
              </span>
            </div>
            <div className="session-info">
              <span className="child-name">👶 {child.name}</span>
              <span className="scenario-name">🎯 {scenarioName}</span>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">{stats.score}</span>
              <span className="stat-label">Punti</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏆</span>
              <span className="stat-value">{stats.levelsCompleted}</span>
              <span className="stat-label">Livelli</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <span className="stat-value">{stats.interactionsCount}</span>
              <span className="stat-label">Interazioni</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">✅</span>
              <span className="stat-value">
                {stats.interactionsCount > 0 
                  ? Math.round((stats.correctResponses / stats.interactionsCount) * 100)
                  : 0}%
              </span>
              <span className="stat-label">Precisione</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🆘</span>
              <span className="stat-value">{stats.helpRequests}</span>
              <span className="stat-label">Aiuti</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏅</span>
              <span className="stat-value">{stats.achievementsUnlocked.length}</span>
              <span className="stat-label">Achievement</span>
            </div>
          </div>

          {stats.achievementsUnlocked.length > 0 && (
            <div className="achievements-section">
              <h4>🏅 Achievement Sbloccati:</h4>
              <div className="achievements-list">                {stats.achievementsUnlocked.map((achievement) => (
                  <span key={`achievement-${achievement}`} className="achievement-badge">
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

SessionTracker.propTypes = {
  child: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    ref: PropTypes.object
  }).isRequired,
  sessionType: PropTypes.string.isRequired,
  scenarioName: PropTypes.string.isRequired,
  scenarioId: PropTypes.string.isRequired,
  onSessionStart: PropTypes.func,
  onSessionEnd: PropTypes.func,
  onSessionUpdate: PropTypes.func,
  autoStart: PropTypes.bool,
  showControls: PropTypes.bool,
  showStats: PropTypes.bool
};

export default SessionTracker;
