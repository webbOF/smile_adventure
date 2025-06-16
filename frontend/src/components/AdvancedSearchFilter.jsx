/**
 * Advanced Search Filter Component
 * Componente per filtri di ricerca avanzata sui bambini
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from './UI';
import bulkOperationsService from '../services/bulkOperationsService';
import './AdvancedSearchFilter.css';

const AdvancedSearchFilter = ({ onSearchResults, onLoading, onError }) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    // Age filters
    minAge: '',
    maxAge: '',
    
    // Diagnosis filters
    diagnosis: '',
    severityLevel: '',
    
    // Progress filters
    minProgressLevel: '',
    maxProgressLevel: '',
    
    // Date filters
    createdAfter: '',
    createdBefore: '',
    lastActivityAfter: '',
    
    // Activity filters
    hasActiveSessions: '',
    completedActivities: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const resetFilters = useCallback(() => {
    setFilters({
      minAge: '',
      maxAge: '',
      diagnosis: '',
      severityLevel: '',
      minProgressLevel: '',
      maxProgressLevel: '',
      createdAfter: '',
      createdBefore: '',
      lastActivityAfter: '',
      hasActiveSessions: '',
      completedActivities: ''
    });
    setPagination({
      page: 1,
      perPage: 20,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  }, []);

  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(value => value !== '');
  }, [filters]);

  const handleSearch = useCallback(async () => {
    try {
      setIsLoading(true);
      onLoading?.(true);
      
      // Create clean filters object (remove empty values)
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          // Convert string booleans and numbers
          if (key === 'hasActiveSessions') {
            acc[key] = value === 'true';
          } else if (['minAge', 'maxAge', 'minProgressLevel', 'maxProgressLevel', 'completedActivities'].includes(key)) {
            acc[key] = parseInt(value, 10);
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {});

      const results = await bulkOperationsService.searchChildren(cleanFilters, pagination);
      onSearchResults?.(results);
      setShowModal(false);
    } catch (error) {
      console.error('Search error:', error);
      onError?.('Errore durante la ricerca. Riprova più tardi.');
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  }, [filters, pagination, onSearchResults, onLoading, onError]);

  const handleClearAndSearch = useCallback(async () => {
    resetFilters();
    // Search with empty filters (show all)
    try {
      setIsLoading(true);
      onLoading?.(true);
      
      const results = await bulkOperationsService.searchChildren({}, {
        page: 1,
        perPage: 20,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
      onSearchResults?.(results);
      setShowModal(false);
    } catch (error) {
      console.error('Clear search error:', error);
      onError?.('Errore durante la ricerca. Riprova più tardi.');
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  }, [resetFilters, onSearchResults, onLoading, onError]);

  return (
    <>
      <div className="advanced-search-controls">
        <Button
          variant="outline"
          onClick={() => setShowModal(true)}
          className="search-button"
        >
          🔍 Ricerca Avanzata
        </Button>
        
        {hasActiveFilters() && (
          <Button
            variant="outline"
            onClick={handleClearAndSearch}
            className="clear-filters-button"
            disabled={isLoading}
          >
            ✖️ Rimuovi Filtri
          </Button>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Ricerca Avanzata Bambini"
        size="large"
      >
        <div className="advanced-search-content">
          {/* Age Filters */}
          <div className="filter-section">
            <h4 className="filter-section-title">Età</h4>
            <div className="filter-row">
              <div className="form-group">
                <label htmlFor="min-age">Età minima (mesi)</label>
                <input
                  type="number"
                  id="min-age"
                  value={filters.minAge}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    minAge: e.target.value
                  }))}
                  className="form-control"
                  min="0"
                  max="300"
                />
              </div>
              <div className="form-group">
                <label htmlFor="max-age">Età massima (mesi)</label>
                <input
                  type="number"
                  id="max-age"
                  value={filters.maxAge}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    maxAge: e.target.value
                  }))}
                  className="form-control"
                  min="0"
                  max="300"
                />
              </div>
            </div>
          </div>

          {/* Diagnosis Filters */}
          <div className="filter-section">
            <h4 className="filter-section-title">Diagnosi</h4>
            <div className="filter-row">
              <div className="form-group">
                <label htmlFor="diagnosis">Tipo di diagnosi</label>
                <select
                  id="diagnosis"
                  value={filters.diagnosis}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    diagnosis: e.target.value
                  }))}
                  className="form-control"
                >
                  <option value="">Qualsiasi</option>
                  <option value="autism">Autismo</option>
                  <option value="adhd">ADHD</option>
                  <option value="sensory_processing">Disturbi Sensoriali</option>
                  <option value="developmental_delay">Ritardo dello Sviluppo</option>
                  <option value="other">Altro</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="severity">Livello di severità</label>
                <select
                  id="severity"
                  value={filters.severityLevel}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    severityLevel: e.target.value
                  }))}
                  className="form-control"
                >
                  <option value="">Qualsiasi</option>
                  <option value="mild">Lieve</option>
                  <option value="moderate">Moderato</option>
                  <option value="severe">Severo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progress Filters */}
          <div className="filter-section">
            <h4 className="filter-section-title">Livello di Progresso</h4>
            <div className="filter-row">
              <div className="form-group">
                <label htmlFor="min-progress">Livello minimo</label>
                <input
                  type="number"
                  id="min-progress"
                  value={filters.minProgressLevel}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    minProgressLevel: e.target.value
                  }))}
                  className="form-control"
                  min="1"
                  max="10"
                />
              </div>
              <div className="form-group">
                <label htmlFor="max-progress">Livello massimo</label>
                <input
                  type="number"
                  id="max-progress"
                  value={filters.maxProgressLevel}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    maxProgressLevel: e.target.value
                  }))}
                  className="form-control"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Date Filters */}
          <div className="filter-section">
            <h4 className="filter-section-title">Date</h4>
            <div className="filter-row">
              <div className="form-group">
                <label htmlFor="created-after">Registrato dopo</label>
                <input
                  type="date"
                  id="created-after"
                  value={filters.createdAfter}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    createdAfter: e.target.value
                  }))}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="created-before">Registrato prima</label>
                <input
                  type="date"
                  id="created-before"
                  value={filters.createdBefore}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    createdBefore: e.target.value
                  }))}
                  className="form-control"
                />
              </div>
            </div>
            <div className="filter-row">
              <div className="form-group">
                <label htmlFor="last-activity">Ultima attività dopo</label>
                <input
                  type="date"
                  id="last-activity"
                  value={filters.lastActivityAfter}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    lastActivityAfter: e.target.value
                  }))}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* Activity Filters */}
          <div className="filter-section">
            <h4 className="filter-section-title">Attività</h4>
            <div className="filter-row">
              <div className="form-group">
                <label htmlFor="active-sessions">Sessioni attive</label>
                <select
                  id="active-sessions"
                  value={filters.hasActiveSessions}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    hasActiveSessions: e.target.value
                  }))}
                  className="form-control"
                >
                  <option value="">Qualsiasi</option>
                  <option value="true">Con sessioni attive</option>
                  <option value="false">Senza sessioni attive</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="completed-activities">Attività completate (min)</label>
                <input
                  type="number"
                  id="completed-activities"
                  value={filters.completedActivities}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    completedActivities: e.target.value
                  }))}
                  className="form-control"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="filter-section">
            <h4 className="filter-section-title">Ordinamento</h4>
            <div className="filter-row">
              <div className="form-group">
                <label htmlFor="sort-by">Ordina per</label>
                <select
                  id="sort-by"
                  value={pagination.sortBy}
                  onChange={(e) => setPagination(prev => ({
                    ...prev,
                    sortBy: e.target.value
                  }))}
                  className="form-control"
                >
                  <option value="created_at">Data registrazione</option>
                  <option value="name">Nome</option>
                  <option value="birth_date">Data di nascita</option>
                  <option value="last_activity">Ultima attività</option>
                  <option value="progress_level">Livello progresso</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="sort-order">Direzione</label>
                <select
                  id="sort-order"
                  value={pagination.sortOrder}
                  onChange={(e) => setPagination(prev => ({
                    ...prev,
                    sortOrder: e.target.value
                  }))}
                  className="form-control"
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <Button
            variant="outline"
            onClick={resetFilters}
            disabled={isLoading}
          >
            Azzera Filtri
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowModal(false)}
            disabled={isLoading}
          >
            Annulla
          </Button>
          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? 'Ricerca...' : 'Cerca'}
          </Button>
        </div>
      </Modal>
    </>
  );
};

AdvancedSearchFilter.propTypes = {
  onSearchResults: PropTypes.func,
  onLoading: PropTypes.func,
  onError: PropTypes.func
};

export default AdvancedSearchFilter;
