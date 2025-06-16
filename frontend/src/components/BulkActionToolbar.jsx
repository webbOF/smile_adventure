/**
 * Bulk Action Toolbar Component
 * Toolbar per operazioni bulk sui bambini selezionati
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Alert } from './UI';
import { useBulkSelection } from '../contexts/BulkSelectionContext';
import bulkOperationsService from '../services/bulkOperationsService';
import './BulkActionToolbar.css';

const BulkActionToolbar = ({ childrenData, onRefresh }) => {
  const { selectedItems, selectedCount, clearSelection, hasSelection } = useBulkSelection();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states for different operations
  const [bulkUpdateForm, setBulkUpdateForm] = useState({
    is_active: '',
    notes: ''
  });
  
  const [exportOptions, setExportOptions] = useState({
    format: 'json',
    includeProgress: true,
    includeSessions: true,
    includeNotes: true
  });

  const [archiveOptions, setArchiveOptions] = useState({
    reason: '',
    notifyParents: false,
    retainData: true
  });

  const [shareOptions, setShareOptions] = useState({
    shareWith: '',
    permissions: ['read'],
    message: '',
    includeProgress: true,
    includeSessions: true
  });

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleBulkUpdate = useCallback(async () => {
    if (!hasSelection) return;
    
    try {
      setIsLoading(true);
      clearMessages();
      
      const updates = {};
      if (bulkUpdateForm.is_active !== '') {
        updates.is_active = bulkUpdateForm.is_active === 'true';
      }
      if (bulkUpdateForm.notes.trim()) {
        updates.notes = bulkUpdateForm.notes.trim();
      }

      if (Object.keys(updates).length === 0) {
        setError('Seleziona almeno un campo da aggiornare');
        return;
      }

      await bulkOperationsService.bulkUpdateChildren(selectedItems, updates);
      setSuccess(`${selectedCount} bambini aggiornati con successo`);
      clearSelection();
      onRefresh?.();
      setShowModal(null);
    } catch (error) {
      console.error('Bulk update error:', error);
      setError('Errore durante l\'aggiornamento dei bambini');
    } finally {
      setIsLoading(false);
    }
  }, [hasSelection, selectedItems, selectedCount, bulkUpdateForm, clearSelection, onRefresh, clearMessages]);

  const handleBulkExport = useCallback(async () => {
    if (!hasSelection) return;
    
    try {
      setIsLoading(true);
      clearMessages();
      
      const result = await bulkOperationsService.bulkExportChildren(
        selectedItems,
        exportOptions.format,
        {
          include_progress: exportOptions.includeProgress,
          include_sessions: exportOptions.includeSessions,
          include_notes: exportOptions.includeNotes
        }
      );

      // Handle download link if provided
      if (result.download_url) {
        const link = document.createElement('a');
        link.href = result.download_url;
        link.download = result.filename || `children_export.${exportOptions.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setSuccess(`Export di ${selectedCount} bambini completato`);
      setShowModal(null);
    } catch (error) {
      console.error('Bulk export error:', error);
      setError('Errore durante l\'export dei bambini');
    } finally {
      setIsLoading(false);
    }
  }, [hasSelection, selectedItems, selectedCount, exportOptions, clearMessages]);

  const handleBulkArchive = useCallback(async () => {
    if (!hasSelection) return;
    
    try {
      setIsLoading(true);
      clearMessages();
      
      await bulkOperationsService.bulkArchiveChildren(selectedItems, {
        reason: archiveOptions.reason || 'bulk_operation',
        notifyParents: archiveOptions.notifyParents,
        retainData: archiveOptions.retainData
      });

      setSuccess(`${selectedCount} bambini archiviati con successo`);
      clearSelection();
      onRefresh?.();
      setShowModal(null);
    } catch (error) {
      console.error('Bulk archive error:', error);
      setError('Errore durante l\'archiviazione dei bambini');
    } finally {
      setIsLoading(false);
    }
  }, [hasSelection, selectedItems, selectedCount, archiveOptions, clearSelection, onRefresh, clearMessages]);

  const handleBulkShare = useCallback(async () => {
    if (!hasSelection) return;
    
    if (!shareOptions.shareWith.trim()) {
      setError('Inserisci l\'email o ID utente con cui condividere');
      return;
    }
    
    try {
      setIsLoading(true);
      clearMessages();
      
      await bulkOperationsService.bulkShareChildren(selectedItems, shareOptions);
      
      setSuccess(`${selectedCount} bambini condivisi con successo`);
      setShowModal(null);
    } catch (error) {
      console.error('Bulk share error:', error);
      setError('Errore durante la condivisione dei bambini');
    } finally {
      setIsLoading(false);
    }
  }, [hasSelection, selectedItems, selectedCount, shareOptions, clearMessages]);

  if (!hasSelection) {
    return null;
  }

  return (
    <>
      <div className="bulk-action-toolbar">
        <div className="bulk-toolbar-info">
          <span className="bulk-selected-count">
            {selectedCount} bambino{selectedCount !== 1 ? 'i' : ''} selezionato{selectedCount !== 1 ? 'i' : ''}
          </span>
        </div>
        
        <div className="bulk-toolbar-actions">
          <Button
            variant="outline"
            size="small"
            onClick={() => setShowModal('update')}
            disabled={isLoading}
          >
            ✏️ Aggiorna
          </Button>
          
          <Button
            variant="outline"
            size="small"
            onClick={() => setShowModal('export')}
            disabled={isLoading}
          >
            📥 Esporta
          </Button>
          
          <Button
            variant="outline"
            size="small"
            onClick={() => setShowModal('archive')}
            disabled={isLoading}
          >
            📦 Archivia
          </Button>
          
          <Button
            variant="outline"
            size="small"
            onClick={() => setShowModal('share')}
            disabled={isLoading}
          >
            📤 Condividi
          </Button>
          
          <Button
            variant="outline"
            size="small"
            onClick={clearSelection}
            disabled={isLoading}
          >
            ✖️ Annulla
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="error" onClose={clearMessages}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={clearMessages}>
          {success}
        </Alert>
      )}

      {/* Bulk Update Modal */}
      <Modal
        isOpen={showModal === 'update'}
        onClose={() => setShowModal(null)}
        title={`Aggiorna ${selectedCount} bambini`}
      >
        <div className="bulk-modal-content">
          <div className="form-group">
            <label htmlFor="bulk-status">Stato</label>
            <select
              id="bulk-status"
              value={bulkUpdateForm.is_active}
              onChange={(e) => setBulkUpdateForm(prev => ({
                ...prev,
                is_active: e.target.value
              }))}
              className="form-control"
            >
              <option value="">Non modificare</option>
              <option value="true">Attivo</option>
              <option value="false">Inattivo</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="bulk-notes">Note aggiuntive</label>
            <textarea
              id="bulk-notes"
              value={bulkUpdateForm.notes}
              onChange={(e) => setBulkUpdateForm(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              className="form-control"
              rows="3"
              placeholder="Aggiungi note per questi bambini..."
            />
          </div>
        </div>
        
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setShowModal(null)}>
            Annulla
          </Button>
          <Button
            variant="primary"
            onClick={handleBulkUpdate}
            disabled={isLoading}
          >
            {isLoading ? 'Aggiornamento...' : 'Aggiorna'}
          </Button>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showModal === 'export'}
        onClose={() => setShowModal(null)}
        title={`Esporta ${selectedCount} bambini`}
      >
        <div className="bulk-modal-content">
          <div className="form-group">
            <label htmlFor="export-format">Formato</label>
            <select
              id="export-format"
              value={exportOptions.format}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                format: e.target.value
              }))}
              className="form-control"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
            <div className="form-group">
            <fieldset>
              <legend>Dati da includere</legend>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeProgress}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeProgress: e.target.checked
                    }))}
                  />
                  {' '}Progressi
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSessions}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeSessions: e.target.checked
                    }))}
                  />
                  {' '}Sessioni
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeNotes}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeNotes: e.target.checked
                    }))}
                  />
                  {' '}Note
                </label>
              </div>
            </fieldset>
          </div>
        </div>
        
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setShowModal(null)}>
            Annulla
          </Button>
          <Button
            variant="primary"
            onClick={handleBulkExport}
            disabled={isLoading}
          >
            {isLoading ? 'Esportazione...' : 'Esporta'}
          </Button>
        </div>
      </Modal>

      {/* Archive Modal */}
      <Modal
        isOpen={showModal === 'archive'}
        onClose={() => setShowModal(null)}
        title={`Archivia ${selectedCount} bambini`}
      >
        <div className="bulk-modal-content">
          <div className="form-group">
            <label htmlFor="archive-reason">Motivo archiviazione</label>
            <input
              type="text"
              id="archive-reason"
              value={archiveOptions.reason}
              onChange={(e) => setArchiveOptions(prev => ({
                ...prev,
                reason: e.target.value
              }))}
              className="form-control"
              placeholder="Motivo dell'archiviazione..."
            />
          </div>
            <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={archiveOptions.notifyParents}
                  onChange={(e) => setArchiveOptions(prev => ({
                    ...prev,
                    notifyParents: e.target.checked
                  }))}
                />
                {' '}Notifica ai genitori
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={archiveOptions.retainData}
                  onChange={(e) => setArchiveOptions(prev => ({
                    ...prev,
                    retainData: e.target.checked
                  }))}
                />
                {' '}Mantieni dati
              </label>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setShowModal(null)}>
            Annulla
          </Button>
          <Button
            variant="danger"
            onClick={handleBulkArchive}
            disabled={isLoading}
          >
            {isLoading ? 'Archiviazione...' : 'Archivia'}
          </Button>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showModal === 'share'}
        onClose={() => setShowModal(null)}
        title={`Condividi ${selectedCount} bambini`}
      >
        <div className="bulk-modal-content">
          <div className="form-group">
            <label htmlFor="share-with">Condividi con (email o ID utente)</label>
            <input
              type="text"
              id="share-with"
              value={shareOptions.shareWith}
              onChange={(e) => setShareOptions(prev => ({
                ...prev,
                shareWith: e.target.value
              }))}
              className="form-control"
              placeholder="user@example.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="share-message">Messaggio</label>
            <textarea
              id="share-message"
              value={shareOptions.message}
              onChange={(e) => setShareOptions(prev => ({
                ...prev,
                message: e.target.value
              }))}
              className="form-control"
              rows="2"
              placeholder="Messaggio opzionale..."
            />
          </div>
            <div className="form-group">
            <fieldset>
              <legend>Dati da condividere</legend>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={shareOptions.includeProgress}
                    onChange={(e) => setShareOptions(prev => ({
                      ...prev,
                      includeProgress: e.target.checked
                    }))}
                  />
                  {' '}Progressi
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={shareOptions.includeSessions}
                    onChange={(e) => setShareOptions(prev => ({
                      ...prev,
                      includeSessions: e.target.checked
                    }))}
                  />
                  {' '}Sessioni
                </label>
              </div>
            </fieldset>
          </div>
        </div>
        
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setShowModal(null)}>
            Annulla
          </Button>
          <Button
            variant="primary"
            onClick={handleBulkShare}
            disabled={isLoading}
          >
            {isLoading ? 'Condivisione...' : 'Condividi'}
          </Button>
        </div>
      </Modal>
    </>
  );
};

BulkActionToolbar.propTypes = {
  childrenData: PropTypes.array,
  onRefresh: PropTypes.func
};

export default BulkActionToolbar;
