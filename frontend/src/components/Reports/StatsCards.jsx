import React from 'react';
import PropTypes from 'prop-types';

/**
 * Statistics Cards Component
 */
const StatsCards = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="stats-section">
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card loading-card">
              <div className="loading-spinner"></div>
              <p className="loading-text">Caricamento...</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="stats-section">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3 className="empty-title">Nessuna statistica disponibile</h3>
          <p className="empty-message">Non ci sono dati sufficienti per mostrare le statistiche.</p>
        </div>
      </div>
    );
  }

  const getStatIcon = (type) => {
    const icons = {
      sessions: '🎮',
      progress: '📈',
      time: '⏱️',
      achievements: '🏆',
      dental_care: '🦷',
      therapy: '💬',
      social: '👥'
    };
    return icons[type] || '📊';
  };

  const getChangeClass = (change) => {
    if (!change) return 'neutral';
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const formatChange = (change) => {
    if (!change) return 'Nessun cambiamento';
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change}%`;
  };

  return (
    <div className="stats-section">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={stat.id || index} className="stat-card">
            <div className="stat-card-header">
              <h3 className="stat-card-title">{stat.title}</h3>
              <span className="stat-card-icon">
                {getStatIcon(stat.type)}
              </span>
            </div>
            <div className="stat-card-value">{stat.value}</div>
            {stat.change !== undefined && (
              <div className={`stat-card-change ${getChangeClass(stat.change)}`}>
                {formatChange(stat.change)} rispetto al periodo precedente
              </div>
            )}
            {stat.description && (
              <div className="stat-card-description">
                {stat.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// PropTypes validation
StatsCards.propTypes = {
  stats: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    change: PropTypes.number,
    description: PropTypes.string
  })),
  loading: PropTypes.bool
};

export default StatsCards;
