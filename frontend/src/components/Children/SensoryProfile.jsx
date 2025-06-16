/**
 * SensoryProfile Component - Gestione profilo sensoriale ASD del bambino
 * Features: Valutazione sensoriale completa, visualizzazione radar chart, aggiornamenti
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import childrenService from '../../services/childrenService';
import './SensoryProfile.css';

const SensoryProfile = ({ childId, childName }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Definizione dei domini sensoriali con scale ASD-specifiche
  const sensoryDomains = [
    {
      key: 'visual',
      name: 'Visivo',
      icon: '👁️',
      description: 'Sensibilità alla luce, colori, pattern visivi',
      aspects: [
        { key: 'light_sensitivity', label: 'Sensibilità alla luce', range: [1, 5] },
        { key: 'color_sensitivity', label: 'Sensibilità ai colori', range: [1, 5] },
        { key: 'movement_sensitivity', label: 'Sensibilità al movimento', range: [1, 5] },
        { key: 'pattern_preference', label: 'Preferenza per pattern', range: [1, 5] }
      ]
    },
    {
      key: 'auditory',
      name: 'Uditivo',
      icon: '👂',
      description: 'Sensibilità ai suoni, rumori, musica',
      aspects: [
        { key: 'noise_sensitivity', label: 'Sensibilità ai rumori', range: [1, 5] },
        { key: 'frequency_sensitivity', label: 'Sensibilità alle frequenze', range: [1, 5] },
        { key: 'speech_processing', label: 'Elaborazione del parlato', range: [1, 5] },
        { key: 'background_noise', label: 'Tolleranza rumori di fondo', range: [1, 5] }
      ]
    },
    {
      key: 'tactile',
      name: 'Tattile',
      icon: '✋',
      description: 'Sensibilità al tocco, texture, temperature',
      aspects: [
        { key: 'touch_sensitivity', label: 'Sensibilità al tocco', range: [1, 5] },
        { key: 'texture_preference', label: 'Preferenza texture', range: [1, 5] },
        { key: 'temperature_sensitivity', label: 'Sensibilità temperatura', range: [1, 5] },
        { key: 'pressure_preference', label: 'Preferenza pressione', range: [1, 5] }
      ]
    },
    {
      key: 'vestibular',
      name: 'Vestibolare',
      icon: '🌀',
      description: 'Equilibrio, movimento, orientamento spaziale',
      aspects: [
        { key: 'movement_seeking', label: 'Ricerca del movimento', range: [1, 5] },
        { key: 'balance_stability', label: 'Stabilità equilibrio', range: [1, 5] },
        { key: 'motion_sensitivity', label: 'Sensibilità al movimento', range: [1, 5] },
        { key: 'spatial_awareness', label: 'Consapevolezza spaziale', range: [1, 5] }
      ]
    },
    {
      key: 'proprioceptive',
      name: 'Propriocettivo',
      icon: '💪',
      description: 'Consapevolezza corporea, posizione, forza',
      aspects: [
        { key: 'body_awareness', label: 'Consapevolezza corporea', range: [1, 5] },
        { key: 'force_regulation', label: 'Regolazione della forza', range: [1, 5] },
        { key: 'position_awareness', label: 'Consapevolezza posizione', range: [1, 5] },
        { key: 'heavy_work_seeking', label: 'Ricerca lavoro pesante', range: [1, 5] }
      ]
    },
    {
      key: 'gustatory',
      name: 'Gustativo',
      icon: '👅',
      description: 'Gusto, sapori, preferenze alimentari',
      aspects: [
        { key: 'taste_sensitivity', label: 'Sensibilità ai sapori', range: [1, 5] },
        { key: 'texture_food', label: 'Sensibilità texture cibo', range: [1, 5] },
        { key: 'temperature_food', label: 'Preferenza temperatura', range: [1, 5] },
        { key: 'food_variety', label: 'Varietà alimentare', range: [1, 5] }
      ]
    },
    {
      key: 'olfactory',
      name: 'Olfattivo',
      icon: '👃',
      description: 'Odori, profumi, sensibilità olfattiva',
      aspects: [
        { key: 'smell_sensitivity', label: 'Sensibilità agli odori', range: [1, 5] },
        { key: 'scent_seeking', label: 'Ricerca di profumi', range: [1, 5] },
        { key: 'scent_avoidance', label: 'Evitamento odori', range: [1, 5] },
        { key: 'food_smell', label: 'Sensibilità odori cibo', range: [1, 5] }
      ]
    }
  ];

  const scaleLabels = {
    1: 'Molto Basso',
    2: 'Basso', 
    3: 'Medio',
    4: 'Alto',
    5: 'Molto Alto'
  };

  useEffect(() => {
    loadSensoryProfile();
  }, [childId]);

  const loadSensoryProfile = async () => {
    setLoading(true);
    try {
      const data = await childrenService.getChildSensoryProfile(childId);
      setProfile(data || {});
      
      // Inizializza form data con valori esistenti o default
      const initialData = {};
      sensoryDomains.forEach(domain => {
        initialData[domain.key] = {};
        domain.aspects.forEach(aspect => {
          initialData[domain.key][aspect.key] = data?.[domain.key]?.[aspect.key] || 3;
        });
      });      setFormData(initialData);
    } catch (error) {
      // Error logging for production monitoring
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading sensory profile:', error);
      }
      // Inizializza con valori default in caso di errore
      const defaultData = {};
      sensoryDomains.forEach(domain => {
        defaultData[domain.key] = {};
        domain.aspects.forEach(aspect => {
          defaultData[domain.key][aspect.key] = 3;
        });
      });
      setFormData(defaultData);
      setProfile({});
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedProfile = await childrenService.updateChildSensoryProfile(childId, formData);
      setProfile(updatedProfile);      setEditing(false);
    } catch (error) {
      // Error logging for production monitoring
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating sensory profile:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (domain, aspect, value) => {
    setFormData(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        [aspect]: parseInt(value)
      }
    }));
  };

  const getDomainAverage = (domainKey) => {
    const domain = sensoryDomains.find(d => d.key === domainKey);
    if (!domain || !formData[domainKey]) return 3;
    
    const sum = domain.aspects.reduce((acc, aspect) => {
      return acc + (formData[domainKey][aspect.key] || 3);
    }, 0);
    
    return (sum / domain.aspects.length).toFixed(1);
  };

  const getOverallProfile = () => {
    const averages = sensoryDomains.map(domain => ({
      domain: domain.name,
      average: parseFloat(getDomainAverage(domain.key))
    }));
    
    const overall = averages.reduce((sum, item) => sum + item.average, 0) / averages.length;
    return overall.toFixed(1);
  };

  const getSensoryInsights = () => {
    const insights = [];
    
    sensoryDomains.forEach(domain => {
      const avg = parseFloat(getDomainAverage(domain.key));
      if (avg >= 4) {
        insights.push({
          type: 'high',
          domain: domain.name,
          icon: domain.icon,
          message: `Alta sensibilità ${domain.name.toLowerCase()}: potrebbero essere necessarie strategie di regolazione`
        });
      } else if (avg <= 2) {
        insights.push({
          type: 'low',
          domain: domain.name,
          icon: domain.icon,
          message: `Bassa responsività ${domain.name.toLowerCase()}: potrebbe beneficiare di stimolazione aggiuntiva`
        });
      }
    });
    
    return insights;
  };

  if (loading && !profile) {
    return (
      <div className="sensory-profile loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>⏳ Caricamento profilo sensoriale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sensory-profile">
      <div className="sensory-profile-header">
        <h3>🌈 Profilo Sensoriale - {childName}</h3>
        <div className="header-actions">
          <div className="overall-score">
            <span className="score-label">Punteggio Generale:</span>
            <span className="score-value">{getOverallProfile()}/5</span>
          </div>
          {!editing ? (
            <button 
              className="btn btn-primary"
              onClick={() => setEditing(true)}
              disabled={loading}
            >
              ✏️ Modifica Profilo
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="btn btn-success"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? '⏳ Salvando...' : '💾 Salva'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setEditing(false);
                  loadSensoryProfile(); // Reset form data
                }}
                disabled={loading}
              >
                ❌ Annulla
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Insights e Raccomandazioni */}
      {!editing && (
        <div className="sensory-insights">
          <h4>💡 Insights e Raccomandazioni</h4>
          {getSensoryInsights().length > 0 ? (
            <div className="insights-list">
              {getSensoryInsights().map((insight, index) => (
                <div key={index} className={`insight-card ${insight.type}`}>
                  <span className="insight-icon">{insight.icon}</span>
                  <span className="insight-message">{insight.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-insights">
              <p>✅ Profilo sensoriale equilibrato - nessuna area critica identificata</p>
            </div>
          )}
        </div>
      )}

      {/* Domini Sensoriali */}
      <div className="sensory-domains">
        {sensoryDomains.map((domain) => (
          <div key={domain.key} className="domain-card">
            <div className="domain-header">
              <div className="domain-info">
                <span className="domain-icon">{domain.icon}</span>
                <div>
                  <h4>{domain.name}</h4>
                  <p className="domain-description">{domain.description}</p>
                </div>
              </div>
              <div className="domain-average">
                <span className="average-label">Media:</span>
                <span className="average-value">{getDomainAverage(domain.key)}</span>
              </div>
            </div>

            <div className="domain-aspects">
              {domain.aspects.map((aspect) => (
                <div key={aspect.key} className="aspect-row">
                  <label className="aspect-label">{aspect.label}</label>
                  {editing ? (
                    <div className="aspect-input">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={formData[domain.key]?.[aspect.key] || 3}
                        onChange={(e) => handleInputChange(domain.key, aspect.key, e.target.value)}
                        className="range-input"
                      />
                      <span className="range-value">
                        {formData[domain.key]?.[aspect.key] || 3} - {scaleLabels[formData[domain.key]?.[aspect.key] || 3]}
                      </span>
                    </div>
                  ) : (
                    <div className="aspect-display">
                      <div className="scale-visual">
                        {[1, 2, 3, 4, 5].map(level => (
                          <div 
                            key={level}
                            className={`scale-dot ${(profile[domain.key]?.[aspect.key] || 3) >= level ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="scale-label">
                        {profile[domain.key]?.[aspect.key] || 3} - {scaleLabels[profile[domain.key]?.[aspect.key] || 3]}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="editing-info">
          <div className="scale-legend">
            <h5>📊 Legenda Scala Valutazione:</h5>
            <div className="legend-items">
              {Object.entries(scaleLabels).map(([value, label]) => (
                <div key={value} className="legend-item">
                  <span className="legend-number">{value}</span>
                  <span className="legend-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>  );
};

// PropTypes for type checking
SensoryProfile.propTypes = {
  childId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  childName: PropTypes.string.isRequired
};

export default SensoryProfile;
