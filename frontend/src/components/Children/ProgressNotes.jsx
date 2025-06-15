/**
 * ProgressNotes Component - Gestione note sui progressi del bambino
 * Features: Visualizzazione, aggiunta, filtri per categoria, milestone tracking
 */

import React, { useState, useEffect } from 'react';
import childrenService from '../../services/childrenService';
import './ProgressNotes.css';

const ProgressNotes = ({ childId, childName }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({
    content: '',
    category: 'behavior',
    tags: [],
    milestone: false
  });
  const [filters, setFilters] = useState({
    category: 'all',
    period: '30'
  });

  const categories = [
    { value: 'behavior', label: 'Comportamento', icon: '🎭' },
    { value: 'communication', label: 'Comunicazione', icon: '💬' },
    { value: 'social', label: 'Sociale', icon: '👥' },
    { value: 'learning', label: 'Apprendimento', icon: '📚' },
    { value: 'motor', label: 'Motorio', icon: '🏃' },
    { value: 'sensory', label: 'Sensoriale', icon: '👂' },
    { value: 'emotional', label: 'Emotivo', icon: '❤️' },
    { value: 'other', label: 'Altro', icon: '📝' }
  ];

  const periods = [
    { value: '7', label: 'Ultima settimana' },
    { value: '30', label: 'Ultimo mese' },
    { value: '90', label: 'Ultimi 3 mesi' },
    { value: 'all', label: 'Tutte le note' }
  ];

  useEffect(() => {
    loadProgressNotes();
  }, [childId, filters]);

  const loadProgressNotes = async () => {
    setLoading(true);
    try {
      const options = {
        limit: 50,
        period: filters.period !== 'all' ? filters.period : undefined
      };
      const data = await childrenService.getChildProgressNotes(childId, options);
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading progress notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;

    try {
      setLoading(true);
      const noteData = {
        ...newNote,
        tags: newNote.tags.length > 0 ? newNote.tags : []
      };
      
      await childrenService.addChildProgressNote(childId, noteData);
      await loadProgressNotes();
      
      // Reset form
      setNewNote({
        content: '',
        category: 'behavior',
        tags: [],
        milestone: false
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag) => {
    if (tag && !newNote.tags.includes(tag)) {
      setNewNote(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredNotes = filters.category === 'all' 
    ? notes 
    : notes.filter(note => note.category === filters.category);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryInfo = (category) => {
    return categories.find(cat => cat.value === category) || categories[0];
  };

  return (
    <div className="progress-notes">
      <div className="progress-notes-header">
        <h3>📝 Note sui Progressi - {childName}</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
        >
          {showAddForm ? '❌ Annulla' : '➕ Aggiungi Nota'}
        </button>
      </div>

      {/* Filtri */}
      <div className="progress-filters">
        <div className="filter-group">
          <label>Categoria:</label>
          <select 
            value={filters.category} 
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="all">🔍 Tutte le categorie</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Periodo:</label>
          <select 
            value={filters.period} 
            onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Aggiunta Nota */}
      {showAddForm && (
        <div className="add-note-form">
          <h4>✨ Nuova Nota sui Progressi</h4>
          <form onSubmit={handleAddNote}>
            <div className="form-group">
              <label>Categoria *</label>
              <select 
                value={newNote.category} 
                onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Contenuto della Nota *</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Descrivi i progressi, comportamenti osservati, miglioramenti..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={newNote.milestone}
                  onChange={(e) => setNewNote(prev => ({ ...prev, milestone: e.target.checked }))}
                />
                🏆 Questa è una milestone importante
              </label>
            </div>

            <div className="form-group">
              <label>Tag (opzionali)</label>
              <div className="tags-input">
                <input
                  type="text"
                  placeholder="Aggiungi tag e premi Invio"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
                <div className="tags-list">
                  {newNote.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        aria-label={`Rimuovi tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Salvando...' : '💾 Salva Nota'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista Note */}
      <div className="notes-list">
        {loading && <div className="loading">⏳ Caricamento note...</div>}
        
        {!loading && filteredNotes.length === 0 && (
          <div className="no-notes">
            <p>📝 Nessuna nota trovata per i filtri selezionati.</p>
            <p>Inizia ad aggiungere note sui progressi di {childName}!</p>
          </div>
        )}

        {filteredNotes.map((note) => {
          const categoryInfo = getCategoryInfo(note.category);
          return (
            <div key={note.id} className={`note-card ${note.milestone ? 'milestone' : ''}`}>
              <div className="note-header">
                <div className="note-category">
                  <span className="category-icon">{categoryInfo.icon}</span>
                  <span className="category-label">{categoryInfo.label}</span>
                  {note.milestone && <span className="milestone-badge">🏆 Milestone</span>}
                </div>
                <div className="note-date">{formatDate(note.created_at)}</div>
              </div>
              
              <div className="note-content">
                {note.content}
              </div>
              
              {note.tags && note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressNotes;
