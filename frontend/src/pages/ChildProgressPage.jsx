/**
 * Child Progress Page - Visualizzazione progressi bambino ASD
 * Pagina dedicata al monitoraggio dettagliato dei progressi
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Layout, Button, Spinner, Alert } from '../components/UI';
import { childrenService } from '../services/childrenService';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import './ChildProgressPage.css';

/**
 * Progress Chart Component
 */
const ProgressChart = ({ data, title, period }) => {
  if (!data || data.length === 0) {
    return (
      <div className="progress-chart-empty">
        <p>Nessun dato disponibile per il periodo selezionato</p>
      </div>
    );
  }

  return (
    <div className="progress-chart">
      <h4 className="progress-chart-title">{title}</h4>
      <div className="progress-chart-period">Periodo: {period}</div>
      <div className="progress-chart-content">
        {/* Implementazione semplificata - da sostituire con libreria charts */}
        <div className="progress-bars">
          {data.map((item, index) => (
            <div key={index} className="progress-bar-item">
              <div className="progress-bar-label">{item.label}</div>
              <div className="progress-bar-track">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${(item.value / item.max) * 100}%` }}
                />
              </div>
              <div className="progress-bar-value">{item.value}/{item.max}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

ProgressChart.propTypes = {
  data: PropTypes.array,
  title: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired
};

/**
 * Achievement Badge Component
 */
const AchievementBadge = ({ achievement }) => {
  return (
    <div className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-info">
        <div className="achievement-title">{achievement.title}</div>
        <div className="achievement-description">{achievement.description}</div>
        {achievement.unlocked && (
          <div className="achievement-date">
            Sbloccato il {new Date(achievement.unlocked_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

AchievementBadge.propTypes = {
  achievement: PropTypes.object.isRequired
};

/**
 * Progress Note Component
 */
const ProgressNote = ({ note }) => {
  return (
    <div className={`progress-note ${note.milestone ? 'milestone' : ''}`}>
      <div className="progress-note-header">
        <div className="progress-note-category">{note.category}</div>
        <div className="progress-note-date">
          {new Date(note.created_at).toLocaleDateString()}
        </div>
      </div>
      <div className="progress-note-content">{note.content}</div>
      {note.tags && note.tags.length > 0 && (
        <div className="progress-note-tags">
          {note.tags.map((tag, index) => (
            <span key={index} className="progress-note-tag">{tag}</span>
          ))}
        </div>
      )}
      {note.milestone && (
        <div className="progress-note-milestone">🎯 Milestone</div>
      )}
    </div>
  );
};

ProgressNote.propTypes = {
  note: PropTypes.object.isRequired
};

/**
 * Child Progress Page Component
 */
const ChildProgressPage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [child, setChild] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [progressNotes, setProgressNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  // Verifica autorizzazioni
  useEffect(() => {
    if (!hasRole(['parent', 'professional', 'admin'])) {
      navigate(ROUTES.UNAUTHORIZED);
      return;
    }
  }, [hasRole, navigate]);

  // Carica dati bambino e progressi
  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Carica dati bambino
        const childData = await childrenService.getChildById(childId);
        setChild(childData);

        // Carica dati progressi
        const progressData = await childrenService.getChildProgress(childId, { 
          days: parseInt(selectedPeriod) 
        });
        setProgressData(progressData);

        // Carica achievements
        const achievementsData = await childrenService.getChildAchievements(childId);
        setAchievements(achievementsData);

        // Carica note progressi
        const notesData = await childrenService.getChildProgressNotes(childId, { 
          limit: 20,
          period: selectedPeriod + 'd'
        });
        setProgressNotes(notesData);

      } catch (err) {
        console.error('Error loading progress data:', err);
        setError('Errore nel caricamento dei dati sui progressi');
      } finally {
        setIsLoading(false);
      }
    };

    if (childId) {
      loadProgressData();
    }
  }, [childId, selectedPeriod]);

  // Gestione aggiunta nota progresso
  const handleAddNote = async (noteData) => {
    try {
      await childrenService.addChildProgressNote(childId, noteData);
      
      // Ricarica note
      const notesData = await childrenService.getChildProgressNotes(childId, { 
        limit: 20,
        period: selectedPeriod + 'd'
      });
      setProgressNotes(notesData);
    } catch (err) {
      console.error('Error adding progress note:', err);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="child-progress-loading">
          <Spinner size="large" />
          <p>Caricamento progressi...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="child-progress-error">
          <Alert variant="error" title="Errore">
            {error}
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => navigate(ROUTES.CHILDREN)}
          >
            Torna alla Lista Bambini
          </Button>
        </div>
      </Layout>
    );
  }

  if (!child) {
    return (
      <Layout>
        <div className="child-progress-not-found">
          <Alert variant="warning" title="Bambino non trovato">
            Il bambino richiesto non è stato trovato.
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => navigate(ROUTES.CHILDREN)}
          >
            Torna alla Lista Bambini
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="child-progress-page">
        {/* Header */}
        <div className="child-progress-header">
          <div className="child-progress-breadcrumb">
            <Button 
              variant="ghost" 
              size="small"
              onClick={() => navigate(ROUTES.CHILDREN)}
            >
              ← I Miei Bambini
            </Button>
            <span>/</span>
            <Button 
              variant="ghost" 
              size="small"
              onClick={() => navigate(`${ROUTES.CHILDREN}/${childId}`)}
            >
              {child.name}
            </Button>
            <span>/</span>
            <span>Progressi</span>
          </div>

          <div className="child-progress-title-section">
            <h1 className="child-progress-title">
              Progressi di {child.name}
            </h1>
            <div className="child-progress-controls">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="child-progress-period-select"
              >
                <option value="7">Ultima settimana</option>
                <option value="30">Ultimo mese</option>
                <option value="90">Ultimi 3 mesi</option>
                <option value="365">Ultimo anno</option>
              </select>
              <Button
                variant="primary"
                size="small"
                onClick={() => {/* TODO: Implementa add note modal */}}
              >
                Aggiungi Nota
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="child-progress-summary">
          <div className="progress-summary-card">
            <div className="summary-card-icon">📊</div>
            <div className="summary-card-content">
              <div className="summary-card-value">{child.points}</div>
              <div className="summary-card-label">Punti Totali</div>
            </div>
          </div>
            <div className="progress-summary-card">
            <div className="summary-card-icon">🏆</div>
            <div className="summary-card-content">
              <div className="summary-card-value">
                {Array.isArray(achievements) ? achievements.filter(a => a.unlocked).length : 0}
              </div>
              <div className="summary-card-label">Achievement</div>
            </div>
          </div>
          
          <div className="progress-summary-card">
            <div className="summary-card-icon">📈</div>
            <div className="summary-card-content">
              <div className="summary-card-value">{child.level}</div>
              <div className="summary-card-label">Livello</div>
            </div>
          </div>
            <div className="progress-summary-card">
            <div className="summary-card-icon">📝</div>
            <div className="summary-card-content">
              <div className="summary-card-value">{Array.isArray(progressNotes) ? progressNotes.length : 0}</div>
              <div className="summary-card-label">Note Periodo</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="child-progress-content">
          {/* Progress Charts */}
          <div className="progress-section">
            <h2 className="progress-section-title">Metriche di Progresso</h2>
            <div className="progress-charts-grid">
              {progressData?.activities_by_type && (
                <ProgressChart
                  title="Attività per Tipo"
                  data={Object.entries(progressData.activities_by_type).map(([type, count]) => ({
                    label: type.replace('_', ' '),
                    value: count,
                    max: 20
                  }))}
                  period={`Ultimi ${selectedPeriod} giorni`}
                />
              )}
              
              {progressData?.daily_points && (
                <ProgressChart
                  title="Punti Giornalieri"
                  data={Object.entries(progressData.daily_points).slice(-7).map(([date, points]) => ({
                    label: new Date(date).toLocaleDateString(),
                    value: points,
                    max: 100
                  }))}
                  period="Ultima settimana"
                />
              )}
            </div>
          </div>          {/* Achievements */}
          <div className="progress-section">
            <h2 className="progress-section-title">Achievement</h2>            <div className="achievements-grid">
              {Array.isArray(achievements) && achievements.map((achievement) => (
                <AchievementBadge key={achievement.id || achievement.title} achievement={achievement} />
              ))}
              {(!Array.isArray(achievements) || achievements.length === 0) && (
                <p className="no-achievements">Nessun achievement disponibile per questo periodo.</p>
              )}
            </div>
          </div>

          {/* Progress Notes */}
          <div className="progress-section">
            <h2 className="progress-section-title">Note sui Progressi</h2>            <div className="progress-notes-list">
              {Array.isArray(progressNotes) && progressNotes.map((note) => (
                <ProgressNote key={note.id || note.created_at || Math.random()} note={note} />
              ))}
              {(!Array.isArray(progressNotes) || progressNotes.length === 0) && (
                <p className="no-notes">Nessuna nota disponibile per questo periodo.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChildProgressPage;
