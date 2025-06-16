import React from 'react';
import PropTypes from 'prop-types';
import './ProfileCompletionBar.css';

/**
 * ProfileCompletionBar Component
 * Enhanced profile completion indicator with detailed breakdown
 */
const ProfileCompletionBar = ({ 
  percentage = 0, 
  missingFields = [], 
  recommendations = [],
  totalSections = 10,
  completedSections = 0,
  className = '' 
}) => {
  const getCompletionStatus = () => {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 50) return 'fair';
    return 'poor';
  };

  const getStatusMessage = () => {
    const status = getCompletionStatus();
    switch (status) {
      case 'excellent':
        return '🎉 Profilo completo! Ottimo lavoro!';
      case 'good':
        return '👍 Profilo quasi completo, ottimo progresso!';
      case 'fair':
        return '📝 Profilo parzialmente completo, continua così!';
      default:
        return '🚀 Inizia a completare il tuo profilo!';
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { id: 'basic', label: 'Info Base', completed: percentage > 20 },
      { id: 'contact', label: 'Contatti', completed: percentage > 40 },
      { id: 'preferences', label: 'Preferenze', completed: percentage > 60 },
      { id: 'professional', label: 'Professionali', completed: percentage > 80 },
      { id: 'complete', label: 'Completo', completed: percentage >= 100 }
    ];
    return steps;
  };

  const progressSteps = getProgressSteps();
  const status = getCompletionStatus();

  return (
    <div className={`profile-completion-bar ${className}`}>
      <div className="completion-header">
        <div className="completion-title">
          <h4>Completamento Profilo</h4>
          <span className={`completion-status ${status}`}>
            {percentage}%
          </span>
        </div>
        <p className="completion-message">{getStatusMessage()}</p>
      </div>

      <div className="completion-progress-container">
        <div className="completion-progress-bar">
          <div 
            className={`completion-progress-fill ${status}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            <div className="progress-shine"></div>
          </div>
        </div>
        
        <div className="completion-steps">
          {progressSteps.map((step) => (
            <div 
              key={step.id}
              className={`completion-step ${step.completed ? 'completed' : 'pending'}`}
            >
              <div className="step-indicator">
                {step.completed ? '✓' : '○'}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="completion-details">
        <div className="completion-stats">
          <div className="stat-item">
            <span className="stat-value">{completedSections}</span>
            <span className="stat-label">/ {totalSections} sezioni</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{missingFields.length}</span>
            <span className="stat-label">campi mancanti</span>
          </div>
        </div>

        {missingFields.length > 0 && (
          <div className="missing-fields-section">
            <h5>Campi da completare:</h5>            <div className="missing-fields-grid">
              {missingFields.slice(0, 6).map((field) => (
                <span key={`missing-${field}`} className="missing-field-tag">
                  {field}
                </span>
              ))}
              {missingFields.length > 6 && (
                <span className="more-fields">
                  +{missingFields.length - 6} altri
                </span>
              )}
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="recommendations-section">
            <h5>Suggerimenti:</h5>            <ul className="recommendations-list">
              {recommendations.slice(0, 3).map((rec) => (
                <li key={`rec-${rec.substring(0, 20)}`} className="recommendation-item">
                  💡 {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

ProfileCompletionBar.propTypes = {
  percentage: PropTypes.number,
  missingFields: PropTypes.arrayOf(PropTypes.string),
  recommendations: PropTypes.arrayOf(PropTypes.string),
  totalSections: PropTypes.number,
  completedSections: PropTypes.number,
  className: PropTypes.string
};

export default ProfileCompletionBar;
