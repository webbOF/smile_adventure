import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Layout, Button, Spinner, Alert, Header } from '../components/UI';
import childrenService from '../services/childrenService';
import { ROUTES } from '../utils/constants';
import './ChildrenListPage.css';

const ChildrenListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchChildren();
    
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from history
      window.history.replaceState({}, document.title);
    }
  }, [includeInactive, location.state]);

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await childrenService.getChildren(includeInactive);
      setChildren(data);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError('Errore nel caricamento dei bambini. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChild = async (childId) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    if (!window.confirm(`Sei sicuro di voler eliminare il profilo di ${child.name}? Questa azione non può essere annullata.`)) {
      return;
    }

    try {
      await childrenService.deleteChild(childId);
      setChildren(children.filter(c => c.id !== childId));
      setSuccessMessage(`Profilo di ${child.name} eliminato con successo`);
    } catch (err) {
      console.error('Error deleting child:', err);
      setError('Errore durante l\'eliminazione del bambino.');
    }
  };

  const handleCreateChild = () => {
    navigate(ROUTES.CHILDREN_NEW);
  };

  const handleViewChild = (childId) => {
    navigate(ROUTES.CHILDREN_DETAIL(childId));
  };

  const handleEditChild = (childId) => {
    navigate(ROUTES.CHILDREN_EDIT(childId));
  };
  if (isLoading) {
    return (
      <Layout>
        <div className="children-loading-container">
          <Spinner size="large" />
          <p className="children-loading-text">Caricamento bambini...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert variant="error">
          {error}
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout
      header={<Header title="I Miei Bambini" showUserInfo={true} showLogout={true} />}
    >
      <div className="children-page-container">
        {/* Success Message */}
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* Header della pagina */}
        <div className="children-page-header">
          <div className="children-page-title-section">
            <h1 className="children-page-title">
              I Miei Bambini
            </h1>
            <p className="children-page-subtitle">
              Gestisci i profili dei tuoi bambini e monitora i loro progressi
            </p>
          </div>
          <div className="children-page-actions">
            <Button 
              variant="primary" 
              size="large"
              onClick={handleCreateChild}
            >
              ➕ Aggiungi Bambino
            </Button>
          </div>
        </div>

        {/* Filtri e opzioni */}
        <div className="children-filters-section">
          <div className="children-filter-item">            <label className="children-checkbox-label">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="children-checkbox"
              />
              {' '}Mostra profili inattivi
            </label>
          </div>
          <div className="children-stats">
            <span className="children-count">
              {children.length} bambino{children.length !== 1 ? 'i' : ''} trovato{children.length !== 1 ? 'i' : ''}
            </span>
          </div>
        </div>

        {/* Lista bambini */}
        {children.length === 0 ? (
          <div className="children-empty-state">
            <div className="children-empty-icon">👶</div>
            <div className="children-empty-title">Nessun bambino registrato</div>
            <div className="children-empty-description">
              Inizia registrando il profilo del tuo primo bambino per accedere alle funzionalità della piattaforma Smile Adventure.
            </div>
            <Button 
              variant="primary" 
              size="large"
              onClick={handleCreateChild}
            >
              Registra il Primo Bambino
            </Button>
          </div>
        ) : (
          <div className="children-grid">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onDelete={() => handleDeleteChild(child.id)}
                onEdit={() => handleEditChild(child.id)}
                onView={() => handleViewChild(child.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

// Child Card Component
const ChildCard = ({ child, onDelete, onEdit, onView }) => {
  const getAgeFromBirthDate = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    
    if (ageInMonths < 12) {
      return `${ageInMonths} mesi`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years} anni, ${months} mesi` : `${years} anni`;
    }
  };

  const getLevelColor = (level) => {
    if (level >= 5) return 'high';
    if (level >= 3) return 'medium';
    return 'low';
  };

  return (
    <div className="child-card">
      <div className="child-card-header">
        <div className="child-avatar">
          {child.photo_url ? (
            <img src={child.photo_url} alt={child.name} className="child-avatar-image" />
          ) : (
            <div className="child-avatar-placeholder">
              {child.name?.charAt(0)?.toUpperCase() || '👶'}
            </div>
          )}
        </div>
        <div className="child-info">
          <h3 className="child-name">{child.name || 'Nome non disponibile'}</h3>
          <p className="child-age">{getAgeFromBirthDate(child.birth_date)}</p>
        </div>
        <div className="child-status">
          <span className={`child-status-badge ${child.is_active ? 'active' : 'inactive'}`}>
            {child.is_active ? 'Attivo' : 'Inattivo'}
          </span>
        </div>
      </div>

      <div className="child-card-stats">
        <div className="child-stat">
          <div className={`child-stat-value ${getLevelColor(child.level || 0)}`}>
            {child.level || 0}
          </div>
          <div className="child-stat-label">Livello</div>
        </div>
        <div className="child-stat">
          <div className="child-stat-value points">
            {child.points || 0}
          </div>
          <div className="child-stat-label">Punti</div>
        </div>
        <div className="child-stat">
          <div className="child-stat-value">
            {child.activities_this_week || 0}
          </div>
          <div className="child-stat-label">Attività</div>
        </div>
      </div>

      <div className="child-card-progress">
        <div className="child-progress-label">
          Progresso Settimanale
        </div>
        <div className="child-progress-bar">
          <div 
            className="child-progress-fill"
            style={{ width: `${Math.min((child.activities_this_week || 0) * 10, 100)}%` }}
          ></div>
        </div>
        <div className="child-progress-text">
          {child.activities_this_week || 0}/10 attività
        </div>
      </div>

      <div className="child-card-actions">
        <Button 
          variant="outline" 
          size="small"
          onClick={onView}
          className="child-action-btn"
        >
          📊 Visualizza
        </Button>
        <Button 
          variant="outline" 
          size="small"
          onClick={onEdit}
          className="child-action-btn"
        >
          ✏️ Modifica
        </Button>
        <Button 
          variant="outline" 
          size="small"
          onClick={onDelete}
          className="child-action-btn child-action-delete"
        >
          🗑️ Elimina
        </Button>
      </div>
    </div>
  );
};

ChildCard.propTypes = {
  child: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    birth_date: PropTypes.string,
    photo_url: PropTypes.string,
    level: PropTypes.number,
    points: PropTypes.number,
    activities_this_week: PropTypes.number,
    is_active: PropTypes.bool
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired
};

export default ChildrenListPage;
