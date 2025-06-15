import React, { useState } from 'react';

/**
 * Export Component for Reports
 * Handles exporting reports to various formats
 */
const ExportComponent = ({ 
  data,
  children = [],
  currentFilters = {},
  userRole = 'parent' 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const exportFormats = [
    { value: 'pdf', label: 'PDF Report', icon: '📄' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: '📊' },
    { value: 'csv', label: 'CSV Data', icon: '📋' }
  ];

  const handleExport = async (format) => {
    setIsExporting(true);
    
    try {
      // Preparazione dati per l'export
      const exportData = {
        type: format,
        filters: currentFilters,
        data: data,
        timestamp: new Date().toISOString(),
        user_role: userRole
      };

      // Simulazione chiamata API (da implementare con reportsService)
      console.log('Exporting data:', exportData);
      
      // TODO: Implementare chiamata a reportsService.exportReport(exportData)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulazione
      
      // Per ora, creiamo un file di esempio
      if (format === 'csv') {
        downloadCSV(data);
      } else if (format === 'excel') {
        downloadExcel(data);
      } else {
        downloadPDF(data);
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Errore durante l\'esportazione. Riprova più tardi.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCSV = (data) => {
    // Implementazione semplice per CSV
    const csvContent = generateCSVContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `smile_adventure_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = (data) => {
    // Placeholder per Excel export
    alert('Export Excel sarà implementato nella prossima versione');
  };

  const downloadPDF = (data) => {
    // Placeholder per PDF export
    alert('Export PDF sarà implementato nella prossima versione');
  };

  const generateCSVContent = (data) => {
    if (!data || !data.children_stats) return '';
    
    const headers = ['Bambino', 'Punti', 'Livello', 'Attività Questa Settimana', 'Ultimo Accesso'];
    const rows = data.children_stats.map(child => [
      child.name,
      child.points,
      child.level,
      child.activities_this_week,
      child.last_activity_date || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  };

  return (
    <div className="export-component">
      <div className="export-header">
        <h3>Esporta Report</h3>
        <p>Scarica i dati in diversi formati</p>
      </div>

      <div className="export-options">
        {exportFormats.map(format => (
          <div 
            key={format.value}
            className={`export-option ${exportFormat === format.value ? 'selected' : ''}`}
            onClick={() => setExportFormat(format.value)}
          >
            <span className="export-icon">{format.icon}</span>
            <span className="export-label">{format.label}</span>
          </div>
        ))}
      </div>

      <div className="export-actions">
        <button
          className="btn-export"
          onClick={() => handleExport(exportFormat)}
          disabled={isExporting || !data}
        >
          {isExporting ? (
            <>
              <span className="loading-spinner"></span>
              Esportazione...
            </>
          ) : (
            <>
              <span className="export-icon">⬇️</span>
              Esporta {exportFormats.find(f => f.value === exportFormat)?.label}
            </>
          )}
        </button>
      </div>

      {/* Export preview/summary */}
      {data && (
        <div className="export-summary">
          <h4>Contenuto del Report</h4>
          <ul>
            <li>📊 Statistiche generali: {data.total_children || 0} bambini</li>
            <li>🎯 Punti totali: {data.total_points || 0}</li>
            <li>🎮 Attività completate: {data.total_activities || 0}</li>
            <li>📅 Periodo: {currentFilters.period || 'Ultimi 30 giorni'}</li>
            {currentFilters.childId && (
              <li>👶 Bambino selezionato: {children.find(c => c.id === parseInt(currentFilters.childId))?.name || 'Sconosciuto'}</li>
            )}
          </ul>
        </div>
      )}

      {/* Professional features */}
      {userRole === 'professional' && (
        <div className="professional-export-options">
          <h4>Opzioni Professionali</h4>
          <div className="professional-checkboxes">
            <label>
              <input type="checkbox" defaultChecked />
              Includi dati clinici
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              Aggiungi raccomandazioni
            </label>
            <label>
              <input type="checkbox" />
              Dati anonimi (rimuovi nomi)
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportComponent;
