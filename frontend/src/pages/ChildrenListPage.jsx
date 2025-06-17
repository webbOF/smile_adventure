import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Layout, Button, Spinner, Alert, Header } from '../components/UI';
import BulkActionToolbar from '../components/BulkActionToolbar';
import AdvancedSearchFilter from '../components/AdvancedSearchFilter';
import { BulkSelectionProvider, useBulkSelection } from '../contexts/BulkSelectionContext';
import childrenService from '../services/childrenService';
import { ROUTES } from '../utils/constants';
import './ChildrenListPage.css';

const ChildrenListPage = () => {
  return (
    <BulkSelectionProvider>
      <ChildrenListContent />
    </BulkSelectionProvider>
  );
};

const ChildrenListContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectionMode, toggleSelectionMode } = useBulkSelection();
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const fetchChildren = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await childrenService.getChildren(includeInactive);
      setChildren(data);
      setSearchResults(null);
      setIsSearchMode(false);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError('Errore nel caricamento dei bambini. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchChildren();
    
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from history
      window.history.replaceState({}, document.title);
    }
  }, [fetchChildren, location.state]);

  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
    setIsSearchMode(true);
    setError(null);
  }, []);

  const handleSearchError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  const handleSearchLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  const currentChildren = isSearchMode && searchResults ? searchResults.children || [] : children;
  
  const getChildrenCountText = () => {
    const count = currentChildren.length;
    const plural = count !== 1 ? 'i' : '';
    const baseText = `${count} bambino${plural}`;
    
    if (isSearchMode) {
      return `${baseText} (filtrati)`;
    }
    return `${baseText} trovato${plural}`;
  };
  const handleDeleteChild = async (childId) => {
    const child = currentChildren.find(c => c.id === childId);
    if (!child) return;

    if (!window.confirm(`Sei sicuro di voler eliminare il profilo di ${child.name}? Questa azione non può essere annullata.`)) {
      return;
    }

    try {
      await childrenService.deleteChild(childId);
      if (isSearchMode) {
        // Refresh search results
        handleSearchResults({
          ...searchResults,
          children: searchResults.children.filter(c => c.id !== childId)
        });
      } else {
        setChildren(children.filter(c => c.id !== childId));
      }
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

  const handleViewProgress = (childId) => {
    navigate(`/children/${childId}/progress`);
  };

  const handleViewActivities = (childId) => {
    navigate(`/children/${childId}/activities`);
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
      header={<Header title="Smile Adventure" showUserInfo={true} showLogout={true} />}
    >
      <div className="children-page-container">
        {/* Success Message */}
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
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
              variant={selectionMode ? 'outline' : 'secondary'} 
              size="medium"
              onClick={toggleSelectionMode}
            >
              {selectionMode ? '✖️ Annulla Selezione' : '☑️ Selezione Multipla'}
            </Button>
            <Button 
              variant="primary" 
              size="large"
              onClick={handleCreateChild}
            >
              ➕ Aggiungi Bambino
            </Button>
          </div>
        </div>

        {/* Advanced Search */}
        <div className="children-search-section">
          <AdvancedSearchFilter
            onSearchResults={handleSearchResults}
            onLoading={handleSearchLoading}
            onError={handleSearchError}
          />
        </div>        {/* Bulk Action Toolbar */}
        <BulkActionToolbar 
          childrenData={currentChildren}
          onRefresh={fetchChildren}
        />

        {/* Filtri e opzioni */}
        <div className="children-filters-section">
          <div className="children-filter-item">
            <label className="children-checkbox-label">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="children-checkbox"
              />
              {' '}Mostra profili inattivi
            </label>
          </div>          <div className="children-stats">
            <span className="children-count">
              {getChildrenCountText()}
            </span>
            {isSearchMode && searchResults?.total && (
              <span className="children-search-info">
                {' '}su {searchResults.total} totali
              </span>
            )}
          </div>
        </div>

        {/* Lista bambini */}
        {currentChildren.length === 0 ? (
          <div className="children-empty-state">
            <div className="children-empty-icon">👶</div>
            <div className="children-empty-title">
              {isSearchMode ? 'Nessun bambino trovato' : 'Nessun bambino registrato'}
            </div>
            <div className="children-empty-description">
              {isSearchMode ? (
                'Prova a modificare i filtri di ricerca per trovare i bambini che stai cercando.'
              ) : (
                'Inizia registrando il profilo del tuo primo bambino per accedere alle funzionalità della piattaforma Smile Adventure.'
              )}
            </div>
            {!isSearchMode && (
              <Button 
                variant="primary" 
                size="large"
                onClick={handleCreateChild}
              >
                Registra il Primo Bambino
              </Button>
            )}
          </div>
        ) : (
          <div className="children-grid">
            {currentChildren.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                selectionMode={selectionMode}
                onDelete={() => handleDeleteChild(child.id)}
                onEdit={() => handleEditChild(child.id)}
                onView={() => handleViewChild(child.id)}
                onViewProgress={() => handleViewProgress(child.id)}
                onViewActivities={() => handleViewActivities(child.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

// Child Card Component
const ChildCard = ({ child, selectionMode, onDelete, onEdit, onView, onViewProgress, onViewActivities }) => {
  const { isSelected, toggleSelection } = useBulkSelection();
  const selected = isSelected(child.id);

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
    <div className={`child-card ${selected ? 'selected' : ''} ${selectionMode ? 'selection-mode' : ''}`}>
      {selectionMode && (
        <div className="child-selection-checkbox">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => toggleSelection(child.id)}
            className="selection-checkbox"
          />
        </div>
      )}
      
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
      </div>      <div className="child-card-actions">
        {!selectionMode && (
          <>
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
              onClick={onViewProgress}
              className="child-action-btn"
            >
              📈 Progressi
            </Button>
            <Button 
              variant="outline" 
              size="small"
              onClick={onViewActivities}
              className="child-action-btn"
            >
              🎯 Attività
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
          </>
        )}
        {selectionMode && (
          <div className="selection-info">
            <span className="selection-text">
              {selected ? 'Selezionato' : 'Clicca per selezionare'}
            </span>
          </div>
        )}
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
  selectionMode: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onViewProgress: PropTypes.func.isRequired,
  onViewActivities: PropTypes.func.isRequired
};

export default ChildrenListPage;
