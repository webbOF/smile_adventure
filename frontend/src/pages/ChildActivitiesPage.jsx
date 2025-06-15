import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { childrenService } from '../services/childrenService';
import './ChildActivitiesPage.css';

// Simple toast replacement for now
const toast = {
  success: (message) => console.log('Success:', message),
  error: (message) => console.error('Error:', message)
};

const ChildActivitiesPage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  
  const [child, setChild] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('7'); // days
  const [verifyingActivity, setVerifyingActivity] = useState(null);

  // Activity types for filtering
  const activityTypes = [
    { value: 'all', label: 'Tutte le Attività' },
    { value: 'dental_care', label: 'Cura Dentale' },
    { value: 'therapy_session', label: 'Sessioni Terapeutiche' },
    { value: 'social_interaction', label: 'Interazioni Sociali' },
    { value: 'learning_exercise', label: 'Esercizi di Apprendimento' },
    { value: 'sensory_activity', label: 'Attività Sensoriali' }
  ];

  const periodOptions = [
    { value: '7', label: 'Ultimi 7 giorni' },
    { value: '14', label: 'Ultimi 14 giorni' },
    { value: '30', label: 'Ultimo mese' },
    { value: '90', label: 'Ultimi 3 mesi' }
  ];

  useEffect(() => {
    loadData();
  }, [childId, selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load child info and activities in parallel
      const [childData, activitiesData] = await Promise.all([
        childrenService.getChild(childId),
        childrenService.getChildActivities(childId, {
          days: parseInt(selectedPeriod),
          type: selectedType === 'all' ? undefined : selectedType
        })
      ]);

      setChild(childData);
      setActivities(activitiesData || []);
    } catch (err) {
      console.error('Error loading child activities:', err);
      setError(err.message || 'Errore nel caricamento delle attività');
      toast.error('Errore nel caricamento delle attività');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type) => {
    setSelectedType(type);
    // Reload activities with new filter
    loadFilteredActivities(type, selectedPeriod);
  };

  const loadFilteredActivities = async (type, period) => {
    try {
      const activitiesData = await childrenService.getChildActivities(childId, {
        days: parseInt(period),
        type: type === 'all' ? undefined : type
      });
      setActivities(activitiesData || []);
    } catch (err) {
      console.error('Error filtering activities:', err);
      toast.error('Errore nel filtraggio delle attività');
    }
  };

  const handleVerifyActivity = async (activityId) => {
    try {
      setVerifyingActivity(activityId);
      await childrenService.verifyChildActivity(childId, activityId);
      toast.success('Attività verificata con successo!');
      
      // Reload activities to reflect changes
      loadData();
    } catch (err) {
      console.error('Error verifying activity:', err);
      toast.error('Errore nella verifica dell\'attività');
    } finally {
      setVerifyingActivity(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityTypeLabel = (type) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.label : type;
  };

  const getActivityIcon = (type) => {
    const icons = {
      dental_care: '🦷',
      therapy_session: '🧠',
      social_interaction: '👥',
      learning_exercise: '📚',
      sensory_activity: '🎨',
      default: '🎯'
    };
    return icons[type] || icons.default;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Completata', className: 'status-completed' },
      in_progress: { label: 'In Corso', className: 'status-in-progress' },
      pending: { label: 'In Attesa', className: 'status-pending' },
      verified: { label: 'Verificata', className: 'status-verified' }
    };
    
    const config = statusConfig[status] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="child-activities-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Caricamento attività...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="child-activities-page">
        <div className="error-container">
          <h2>Errore</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Torna Indietro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="child-activities-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Indietro
          </button>
          <div className="header-info">
            <h1>Attività di {child?.name}</h1>
            <p className="header-subtitle">
              Monitora le attività e i progressi del bambino
            </p>
          </div>
        </div>
      </div>      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="activity-type-filter">Tipo di Attività:</label>
          <select 
            id="activity-type-filter"
            value={selectedType} 
            onChange={(e) => handleFilterChange(e.target.value)}
            className="filter-select"
          >
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="period-filter">Periodo:</label>
          <select 
            id="period-filter"
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="filter-select"
          >
            {periodOptions.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <h3>Totale Attività</h3>
          <p className="stat-number">{activities.length}</p>
        </div>
        <div className="stat-card">
          <h3>Completate</h3>
          <p className="stat-number">
            {activities.filter(a => a.status === 'completed' || a.status === 'verified').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Punti Guadagnati</h3>
          <p className="stat-number">
            {activities.reduce((total, a) => total + (a.points_earned || 0), 0)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Tasso Completamento</h3>
          <p className="stat-number">
            {activities.length > 0 
              ? Math.round((activities.filter(a => a.status === 'completed' || a.status === 'verified').length / activities.length) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Activities List */}
      <div className="activities-section">
        <h2>Lista Attività</h2>
        
        {activities.length === 0 ? (
          <div className="empty-state">
            <p>Nessuna attività trovata per il periodo selezionato.</p>
            <button 
              onClick={() => setSelectedPeriod('30')}
              className="btn btn-primary"
            >
              Visualizza Ultimo Mese
            </button>
          </div>
        ) : (
          <div className="activities-list">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-header">
                  <div className="activity-icon">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="activity-info">
                    <h3>{activity.activity_name || 'Attività'}</h3>
                    <p className="activity-type">
                      {getActivityTypeLabel(activity.activity_type)}
                    </p>
                  </div>
                  <div className="activity-status">
                    {getStatusBadge(activity.status)}
                  </div>
                </div>

                <div className="activity-details">
                  <div className="detail-row">
                    <span className="detail-label">Data:</span>
                    <span className="detail-value">
                      {formatDate(activity.completed_at || activity.created_at)}
                    </span>
                  </div>
                  
                  {activity.duration && (
                    <div className="detail-row">
                      <span className="detail-label">Durata:</span>
                      <span className="detail-value">{activity.duration} minuti</span>
                    </div>
                  )}

                  {activity.points_earned && (
                    <div className="detail-row">
                      <span className="detail-label">Punti:</span>
                      <span className="detail-value points">{activity.points_earned}</span>
                    </div>
                  )}

                  {activity.difficulty_level && (
                    <div className="detail-row">
                      <span className="detail-label">Difficoltà:</span>
                      <span className="detail-value">{activity.difficulty_level}</span>
                    </div>
                  )}
                </div>

                {activity.description && (
                  <div className="activity-description">
                    <p>{activity.description}</p>
                  </div>
                )}

                {activity.notes && (
                  <div className="activity-notes">
                    <strong>Note:</strong>
                    <p>{activity.notes}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="activity-actions">
                  {activity.status === 'completed' && activity.status !== 'verified' && (
                    <button
                      onClick={() => handleVerifyActivity(activity.id)}
                      disabled={verifyingActivity === activity.id}
                      className="btn btn-success btn-small"
                    >
                      {verifyingActivity === activity.id ? 'Verificando...' : 'Verifica'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildActivitiesPage;
