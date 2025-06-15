import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Layout, Button, Spinner } from '../components/UI';
import ProgressCharts from '../components/ProgressCharts';
import SessionTracker from '../components/SessionTracker';
import ASDAssessmentTool from '../components/ASDAssessmentTool';
import { getChild, deleteChild } from '../services/childrenService';
import { ROUTES } from '../utils/constants';
import './ChildDetailPage.css';

/**
 * Helper function to get gender label
 * @param {string} gender - Gender code
 * @returns {string} Gender label
 */
const getGenderLabel = (gender) => {
  switch(gender) {
    case 'M': return 'Maschio';
    case 'F': return 'Femmina';
    default: return 'Non specificato';
  }
};

/**
 * Tab Navigation Component
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.onTabChange - Tab change handler
 */
const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'profile', label: 'Profilo', icon: '👤' },
    { id: 'progress', label: 'Progressi', icon: '📈' },
    { id: 'sessions', label: 'Sessioni', icon: '🎮' },
    { id: 'analytics', label: 'Analisi', icon: '📊' }
  ];

  return (
    <div className="tab-navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

TabNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired
};

/**
 * Profile Tab Content
 * @param {Object} props - Component props
 * @param {Object} props.child - Child data
 */
const ProfileTab = ({ child }) => (
  <div className="profile-tab">
    <div className="profile-header">
      <div className="avatar-section">
        <div className="child-avatar">
          {child.photo_url ? (
            <img src={child.photo_url} alt={child.name} />
          ) : (
            <div className="avatar-placeholder">
              {child.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="avatar-info">
          <h2>{child.name}</h2>
          <p className="age">Età: {child.age} anni</p>
          <p className="birth-date">Nato il: {new Date(child.birth_date).toLocaleDateString('it-IT')}</p>
        </div>
      </div>
    </div>

    <div className="profile-sections">
      <div className="info-section">
        <h3>📋 Informazioni Generali</h3>        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Genere:</span>
            <span>{getGenderLabel(child.gender)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Data di nascita:</span>
            <span>{new Date(child.birth_date).toLocaleDateString('it-IT')}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Creato il:</span>
            <span>{new Date(child.created_at).toLocaleDateString('it-IT')}</span>
          </div>
        </div>
      </div>

      {child.asd_diagnosis && (
        <div className="info-section">
          <h3>🧠 Diagnosi ASD</h3>
          <div className="diagnosis-info">
            <div className="diagnosis-badge">
              Diagnosi confermata
            </div>
            {child.diagnosis_notes && (              <div className="diagnosis-notes">
                <span className="info-label">Note aggiuntive:</span>
                <p>{child.diagnosis_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {child.sensory_profile && (
        <div className="info-section">
          <h3>🌈 Profilo Sensoriale</h3>
          <div className="sensory-profile">
            <div className="sensory-grid">
              {Object.entries(child.sensory_profile).map(([key, value]) => (
                <div key={key} className="sensory-item">
                  <label>{key.replace(/_/g, ' ').toUpperCase()}:</label>
                  <span className={`sensory-value level-${value}`}>
                    {value}/5
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {child.special_notes && (
        <div className="info-section">
          <h3>📝 Note Speciali</h3>
          <div className="special-notes">
            <p>{child.special_notes}</p>
          </div>
        </div>
      )}
    </div>
  </div>
);

ProfileTab.propTypes = {
  child: PropTypes.shape({
    name: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
    birth_date: PropTypes.string.isRequired,
    gender: PropTypes.string,
    photo_url: PropTypes.string,
    created_at: PropTypes.string.isRequired,
    asd_diagnosis: PropTypes.bool,
    diagnosis_notes: PropTypes.string,
    sensory_profile: PropTypes.object,
    special_notes: PropTypes.string
  }).isRequired
};

/**
 * Progress Tab Content
 * @param {Object} props - Component props
 * @param {Object} props.child - Child data
 */
const ProgressTab = ({ child }) => (
  <div className="progress-tab">
    <div className="progress-overview">
      <h3>📈 Panoramica Progressi</h3>
      <div className="progress-cards">
        <div className="progress-card">
          <div className="progress-icon">🎯</div>
          <div className="progress-info">
            <h4>Obiettivi Raggiunti</h4>
            <div className="progress-value">8/12</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '67%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="progress-card">
          <div className="progress-icon">⭐</div>
          <div className="progress-info">
            <h4>Punti Totali</h4>
            <div className="progress-value">2,340</div>
            <div className="progress-trend positive">+120 questa settimana</div>
          </div>
        </div>
        
        <div className="progress-card">
          <div className="progress-icon">🏆</div>
          <div className="progress-info">
            <h4>Achievement</h4>
            <div className="progress-value">15</div>
            <div className="progress-trend positive">+2 questo mese</div>
          </div>
        </div>
      </div>
    </div>

    <div className="progress-charts-section">
      <ProgressCharts 
        childId={child.id} 
        period={30}        chartType="line"
      />
    </div>
  </div>
);

ProgressTab.propTypes = {
  child: PropTypes.object.isRequired
};

/**
 * Sessions Tab Content
 * @param {Object} props - Component props
 * @param {Object} props.child - Child data
 */
const SessionsTab = ({ child }) => (
  <div className="sessions-tab">
    <div className="sessions-header">
      <h3>🎮 Sessioni di Gioco</h3>
      <Button variant="primary" size="small">
        Nuova Sessione
      </Button>
    </div>

    <div className="session-tracker-section">
      <SessionTracker 
        childId={child.id}
        childName={child.name}
      />
    </div>
  </div>
);

SessionsTab.propTypes = {
  child: PropTypes.object.isRequired
};

/**
 * Analytics Tab Content
 * @param {Object} props - Component props
 * @param {Object} props.child - Child data
 */
const AnalyticsTab = ({ child }) => {
  const [assessment, setAssessment] = useState(child.assessment || null);

  const handleAssessmentChange = (newAssessment) => {
    setAssessment(newAssessment);
    // Here you would typically save to backend
    console.log('Assessment updated:', newAssessment);
  };

  return (
    <div className="analytics-tab">
      <div className="analytics-header">
        <h3>📊 Analisi Comportamentali</h3>
        <div className="analytics-actions">
          <Button variant="outline" size="small">
            Esporta PDF
          </Button>
          <Button variant="primary" size="small">
            Genera Report
          </Button>
        </div>
      </div>

      <div className="assessment-section">
        <ASDAssessmentTool
          childId={child.id}
          currentAssessment={assessment}
          onAssessmentChange={handleAssessmentChange}
          readOnly={false}
        />
      </div>
    </div>
  );
};

AnalyticsTab.propTypes = {
  child: PropTypes.object.isRequired
};

/**
 * Child Detail Page Component
 */
const ChildDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchChild = async () => {
      try {
        setLoading(true);
        setError(null);
        const childData = await getChild(id);
        setChild(childData);
      } catch (err) {
        console.error('Error fetching child:', err);
        setError('Impossibile caricare i dati del bambino');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChild();
    }
  }, [id]);

  const handleEdit = () => {
    navigate(ROUTES.CHILDREN_EDIT(id));
  };

  const handleDelete = async () => {
    if (!window.confirm(`Sei sicuro di voler eliminare il profilo di ${child.name}? Questa azione non può essere annullata.`)) {
      return;
    }

    try {
      setDeleting(true);
      await deleteChild(id);
      navigate(ROUTES.CHILDREN, { 
        state: { message: `Profilo di ${child.name} eliminato con successo` }
      });
    } catch (err) {
      console.error('Error deleting child:', err);
      setError('Impossibile eliminare il profilo del bambino');
    } finally {
      setDeleting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab child={child} />;
      case 'progress':
        return <ProgressTab child={child} />;
      case 'sessions':
        return <SessionsTab child={child} />;
      case 'analytics':
        return <AnalyticsTab child={child} />;
      default:
        return <ProfileTab child={child} />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="child-detail-loading">
          <Spinner size="large" />
          <p>Caricamento profilo bambino...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="child-detail-error">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>Errore</h2>
            <p>{error}</p>
            <div className="error-actions">
              <Button variant="outline" onClick={() => navigate(ROUTES.CHILDREN)}>
                Torna alla Lista
              </Button>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Riprova
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!child) {
    return (
      <Layout>
        <div className="child-detail-error">
          <div className="error-content">
            <div className="error-icon">👶</div>
            <h2>Bambino non trovato</h2>
            <p>Il profilo del bambino richiesto non esiste o non hai i permessi per visualizzarlo.</p>
            <Button variant="primary" onClick={() => navigate(ROUTES.CHILDREN)}>
              Torna alla Lista
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="child-detail-page">
        {/* Header with actions */}
        <div className="page-header">
          <div className="header-left">
            <Link to={ROUTES.CHILDREN} className="back-link">
              ← Torna alla lista
            </Link>
            <h1>{child.name}</h1>
          </div>          <div className="header-actions">
            <Button 
              as={Link}
              to={`/children/${child.id}/progress`}
              variant="outline"
              title="Visualizza progressi dettagliati"
            >
              📈 Progressi
            </Button>
            <Button 
              as={Link}
              to={`/children/${child.id}/activities`}
              variant="outline"
              title="Visualizza attività del bambino"
            >
              🎯 Attività
            </Button>
            <Button 
              variant="outline" 
              onClick={handleEdit}
              disabled={deleting}
            >
              ✏️ Modifica
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              disabled={deleting}
              loading={deleting}
            >
              🗑️ {deleting ? 'Eliminazione...' : 'Elimina'}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Tab Content */}
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
};

export default ChildDetailPage;
