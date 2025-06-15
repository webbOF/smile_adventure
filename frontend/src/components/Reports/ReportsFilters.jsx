import React, { useState } from 'react';

/**
 * Filters Component for Reports
 */
const ReportsFilters = ({ 
  childrenList = [], 
  onFiltersChange,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState({
    childId: initialFilters.childId || '',
    period: initialFilters.period || 'last_30_days',
    sessionType: initialFilters.sessionType || '',
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
    ...initialFilters
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Se viene cambiato il periodo, reset delle date custom
    if (key === 'period' && value !== 'custom') {
      newFilters.startDate = '';
      newFilters.endDate = '';
      setFilters(newFilters);
    }
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      childId: '',
      period: 'last_30_days',
      sessionType: '',
      startDate: '',
      endDate: ''
    };
    setFilters(resetFilters);
    
    if (onFiltersChange) {
      onFiltersChange(resetFilters);
    }
  };

  const periodOptions = [
    { value: 'last_7_days', label: 'Ultimi 7 giorni' },
    { value: 'last_30_days', label: 'Ultimi 30 giorni' },
    { value: 'last_3_months', label: 'Ultimi 3 mesi' },
    { value: 'last_6_months', label: 'Ultimi 6 mesi' },
    { value: 'last_year', label: 'Ultimo anno' },
    { value: 'custom', label: 'Periodo personalizzato' }
  ];

  const sessionTypeOptions = [
    { value: '', label: 'Tutti i tipi' },
    { value: 'dental_care', label: 'Cura dentale' },
    { value: 'therapy_session', label: 'Sessione terapeutica' },
    { value: 'social_interaction', label: 'Interazione sociale' }
  ];

  return (
    <div className="reports-filters">
      <div className="filters-grid">
        {/* Child Selection */}
        <div className="filter-group">
          <label htmlFor="child-select">Bambino</label>
          <select
            id="child-select"
            value={filters.childId}
            onChange={(e) => handleFilterChange('childId', e.target.value)}
          >            <option value="">Tutti i bambini</option>
            {childrenList.map(child => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
        </div>

        {/* Period Selection */}
        <div className="filter-group">
          <label htmlFor="period-select">Periodo</label>
          <select
            id="period-select"
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Session Type Selection */}
        <div className="filter-group">
          <label htmlFor="session-type-select">Tipo di sessione</label>
          <select
            id="session-type-select"
            value={filters.sessionType}
            onChange={(e) => handleFilterChange('sessionType', e.target.value)}
          >
            {sessionTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range - Visible only when period is 'custom' */}
        {filters.period === 'custom' && (
          <>
            <div className="filter-group">
              <label htmlFor="start-date">Data inizio</label>
              <input
                type="date"
                id="start-date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label htmlFor="end-date">Data fine</label>
              <input
                type="date"
                id="end-date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                min={filters.startDate}
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="filter-actions">          <button 
            type="button" 
            className="btn-filter"
            onClick={() => onFiltersChange?.(filters)}
          >
            Applica Filtri
          </button>
          <button 
            type="button" 
            className="btn-reset"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilters;
