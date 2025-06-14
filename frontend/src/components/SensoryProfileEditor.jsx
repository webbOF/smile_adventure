import React from 'react';
import PropTypes from 'prop-types';
import './SensoryProfileEditor.css';

/**
 * SensoryProfileEditor Component
 * Editor avanzato per il profilo sensoriale ASD con slider interattivi
 */
const SensoryProfileEditor = ({ sensoryProfile, onProfileChange, disabled = false }) => {
  
  const sensoryAreas = [
    {
      key: 'visual',
      name: 'Visivo',
      icon: '👁️',
      description: 'Risposta agli stimoli visivi (luci, colori, movimento)',
      levels: {
        1: 'Molto sensibile (evita stimoli visivi intensi)',
        2: 'Sensibile (preferisce ambienti poco stimolanti)',
        3: 'Normale (equilibrato)',
        4: 'Cerca stimoli (ama colori vivaci e luci)',
        5: 'Molto ricerca stimoli (necessita stimolazione intensa)'
      }
    },
    {
      key: 'auditory',
      name: 'Uditivo', 
      icon: '👂',
      description: 'Risposta ai suoni e rumori dell\'ambiente',
      levels: {
        1: 'Molto sensibile (si copre le orecchie, evita rumori)',
        2: 'Sensibile (preferisce ambienti silenziosi)',
        3: 'Normale (tollera la maggior parte dei suoni)',
        4: 'Cerca stimoli (ama musica forte, rumori)',
        5: 'Molto ricerca stimoli (necessita suoni intensi)'
      }
    },
    {
      key: 'tactile',
      name: 'Tattile',
      icon: '✋',
      description: 'Risposta al tocco e alle diverse texture',
      levels: {
        1: 'Molto sensibile (evita il tocco, tessuti specifici)',
        2: 'Sensibile (selettivo con texture e materiali)',
        3: 'Normale (tollera la maggior parte dei tocchi)',
        4: 'Cerca stimoli (ama texture, pressione)',
        5: 'Molto ricerca stimoli (necessita input tattili forti)'
      }
    },
    {
      key: 'proprioceptive',
      name: 'Propriocettivo',
      icon: '🤸',
      description: 'Consapevolezza della posizione del corpo nello spazio',
      levels: {
        1: 'Molto sensibile (movimenti delicati, evita pressione)',
        2: 'Sensibile (preferisce attività calme)',
        3: 'Normale (equilibrio tra calma e movimento)',
        4: 'Cerca stimoli (ama spingere, tirare, saltare)',
        5: 'Molto ricerca stimoli (necessita input fisici intensi)'
      }
    },
    {
      key: 'vestibular',
      name: 'Vestibolare',
      icon: '🌀',
      description: 'Equilibrio e movimento nello spazio',
      levels: {
        1: 'Molto sensibile (evita dondoli, paura altezze)',
        2: 'Sensibile (preferisce piedi per terra)',
        3: 'Normale (equilibrio adeguato)',
        4: 'Cerca stimoli (ama dondolare, girare)',
        5: 'Molto ricerca stimoli (necessita movimento intenso)'
      }
    }
  ];

  const handleSliderChange = (sensoryType, value) => {
    const newProfile = {
      ...sensoryProfile,
      [sensoryType]: parseInt(value)
    };
    onProfileChange(newProfile);
  };

  const getSliderColor = (value) => {
    const colors = {
      1: '#ef4444', // Red - Very sensitive
      2: '#f97316', // Orange - Sensitive  
      3: '#10b981', // Green - Normal
      4: '#3b82f6', // Blue - Seeking
      5: '#8b5cf6'  // Purple - Very seeking
    };
    return colors[value] || '#6b7280';
  };

  const getSensoryDescription = (area, value) => {
    return area.levels[value] || 'Valore non valido';
  };

  return (
    <div className="sensory-profile-editor">
      <div className="sensory-header">
        <h3>🧠 Profilo Sensoriale ASD</h3>
        <p className="sensory-subtitle">
          Configura le sensibilità sensoriali per personalizzare l&apos;esperienza di gioco
        </p>
      </div>

      <div className="sensory-areas">
        {sensoryAreas.map((area) => {
          const currentValue = sensoryProfile[area.key] || 3;
          
          return (
            <div key={area.key} className="sensory-area">
              <div className="sensory-area-header">
                <div className="sensory-title">
                  <span className="sensory-icon">{area.icon}</span>
                  <span className="sensory-name">{area.name}</span>
                  <span className="sensory-value" style={{ color: getSliderColor(currentValue) }}>
                    {currentValue}/5
                  </span>
                </div>
                <p className="sensory-description">{area.description}</p>
              </div>

              <div className="sensory-slider-container">
                <div className="slider-labels">
                  <span className="label-start">Ipersensibile</span>
                  <span className="label-center">Normale</span>
                  <span className="label-end">Iposensibile</span>
                </div>
                
                <div className="slider-wrapper">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentValue}
                    onChange={(e) => handleSliderChange(area.key, e.target.value)}
                    className="sensory-slider"
                    style={{
                      background: `linear-gradient(to right, 
                        #ef4444 0%, #ef4444 20%,
                        #f97316 20%, #f97316 40%,
                        #10b981 40%, #10b981 60%,
                        #3b82f6 60%, #3b82f6 80%,
                        #8b5cf6 80%, #8b5cf6 100%)`
                    }}
                    disabled={disabled}
                  />
                  <div className="slider-track">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div 
                        key={value}
                        className={`slider-mark ${currentValue === value ? 'active' : ''}`}
                        style={{ backgroundColor: getSliderColor(value) }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="sensory-feedback">
                <div 
                  className="current-level"
                  style={{ backgroundColor: getSliderColor(currentValue) }}
                >
                  {getSensoryDescription(area, currentValue)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sensory-tips">
        <div className="tips-header">
          💡 <strong>Come utilizzare il profilo sensoriale:</strong>
        </div>
        <ul className="tips-list">
          <li><strong>Ipersensibile (1-2):</strong> Il gioco userà stimoli ridotti e ambienti calmi</li>
          <li><strong>Normale (3):</strong> Equilibrio standard tra stimoli e calma</li>
          <li><strong>Iposensibile (4-5):</strong> Il gioco fornirà stimoli più intensi e coinvolgenti</li>
          <li><strong>Personalizzazione:</strong> Ogni area può essere configurata indipendentemente</li>
        </ul>
      </div>

      <div className="sensory-summary">
        <h4>📊 Riepilogo Profilo</h4>
        <div className="summary-grid">
          {sensoryAreas.map((area) => (
            <div key={area.key} className="summary-item">
              <span className="summary-icon">{area.icon}</span>
              <span className="summary-name">{area.name}</span>
              <span 
                className="summary-value"
                style={{ color: getSliderColor(sensoryProfile[area.key] || 3) }}
              >
                {sensoryProfile[area.key] || 3}/5
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

SensoryProfileEditor.propTypes = {
  sensoryProfile: PropTypes.object.isRequired,
  onProfileChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default SensoryProfileEditor;
