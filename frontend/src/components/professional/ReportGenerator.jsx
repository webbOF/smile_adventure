// src/components/professional/ReportGenerator.jsx
// Custom report builder interface for speech therapy professionals
// Frontend UI that delegates report generation to backend services

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

// Import services and components
import DashboardLayout from '../layout/DashboardLayout';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ui/ErrorBoundary';
import reportGenerationService from '../../services/reportGenerationService';

const ReportGenerator = () => {
  const navigate = useNavigate();
  
  // State Management
  const [activeStep, setActiveStep] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [reportConfig, setReportConfig] = useState({
    title: '',
    period: '30d',
    includeRawData: false,
    format: 'json'
  });
  
  // Data state
  const [patients, setPatients] = useState([]);
  const [generatedReports, setGeneratedReports] = useState([]);
    // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  // Load patients from API
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const patientsData = await reportGenerationService.getAvailableChildren();
        setPatients(patientsData);
      } catch (error) {
        console.error('Error loading patients:', error);
        // Fallback to mock data for demo purposes
        setPatients([
          {
            id: 1,
            name: 'Sofia Rossi',
            age: 6,
            status: 'active'
          },
          {
            id: 2,
            name: 'Marco Bianchi',
            age: 8,
            status: 'active'
          },
          {
            id: 3,
            name: 'Giulia Verdi',
            age: 5,
            status: 'active'
          },
          {
            id: 4,
            name: 'Luca Ferrari',
            age: 7,
            status: 'active'
          }
        ]);
      }
    };

    loadPatients();
  }, []);

  // Report Templates Configuration (UI only - backend has the logic)
  const reportTemplates = [
    {
      id: 'progress_report',
      title: 'Report di Progresso',
      description: 'Report dettagliato sui progressi del paziente nel periodo selezionato',
      icon: ChartBarIcon,
      color: 'blue',
      backendType: 'progress',
      estimatedTime: '2-3 minuti',
      bestFor: 'Sessioni di follow-up regolari'
    },
    {
      id: 'summary_report',
      title: 'Riassunto Esecutivo',
      description: 'Sintesi concisa per comunicazioni rapide',
      icon: ClipboardDocumentListIcon,
      color: 'orange',
      backendType: 'summary',
      estimatedTime: '1-2 minuti',
      bestFor: 'Comunicazioni con famiglie e colleghi'
    },
    {
      id: 'professional_report',
      title: 'Report Professionale',
      description: 'Analisi clinica approfondita per uso professionale',
      icon: AcademicCapIcon,
      color: 'purple',
      backendType: 'professional',
      estimatedTime: '3-5 minuti',
      bestFor: 'Documentazione clinica e referti'
    },
    {
      id: 'data_export',
      title: 'Esportazione Dati',
      description: 'Export completo dei dati in formato strutturato',
      icon: ArrowDownTrayIcon,
      color: 'green',
      backendType: 'export',
      estimatedTime: '1 minuto',
      bestFor: 'Analisi esterne e backup dati'
    }
  ];

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setReportConfig(prev => ({
      ...prev,
      title: template.title,
      format: template.backendType === 'export' ? 'json' : 'pdf'
    }));
    setActiveStep('patients');
  };

  // Handle patient selection
  const handlePatientToggle = (patient) => {
    setSelectedPatients(prev => {
      const isSelected = prev.some(p => p.id === patient.id);
      if (isSelected) {
        return prev.filter(p => p.id !== patient.id);
      } else {
        return [...prev, patient];
      }
    });
  };
  // Handle report generation - delegates to backend
  const handleGenerateReport = useCallback(async () => {
    if (!selectedTemplate || selectedPatients.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Get current user for professional reports
      let currentUser = null;
      if (selectedTemplate.backendType === 'professional') {
        try {
          currentUser = await reportGenerationService.getCurrentUser();
        } catch (error) {
          console.warn('Could not get current user, proceeding without professional ID');
          setError('Attenzione: Impossibile ottenere informazioni utente professionale');
        }
      }

      let reportPromises = [];

      // Generate reports for each selected patient
      for (const patient of selectedPatients) {
        let reportPromise;

        switch (selectedTemplate.backendType) {
          case 'progress':
            reportPromise = reportGenerationService.generateProgressReport(patient.id, reportConfig.period);
            break;
          case 'summary':
            reportPromise = reportGenerationService.generateSummaryReport(patient.id);
            break;
          case 'professional':
            reportPromise = reportGenerationService.generateProfessionalReport(patient.id, currentUser?.id);
            break;
          case 'export':
            reportPromise = reportGenerationService.exportData(patient.id, reportConfig.format, reportConfig.includeRawData);
            break;
          default:
            throw new Error(`Unknown report type: ${selectedTemplate.backendType}`);
        }

        reportPromises.push(reportPromise.then(response => ({
          patient,
          report: response,
          success: true
        })).catch(error => ({
          patient,
          error: error.message,
          success: false
        })));
      }

      // Wait for all reports to complete
      const results = await Promise.all(reportPromises);
      
      // Process results
      const successfulReports = results.filter(r => r.success);
      const failedReports = results.filter(r => !r.success);

      if (successfulReports.length > 0) {
        setGeneratedReports(prev => [...successfulReports.map(r => ({
          id: Date.now() + Math.random(),
          title: `${selectedTemplate.title} - ${r.patient.name}`,
          template: selectedTemplate.title,
          patient: r.patient,
          reportData: r.report,
          createdAt: new Date().toISOString(),
          status: 'completed',
          format: reportConfig.format
        })), ...prev]);
      }

      if (failedReports.length > 0) {
        console.error('Failed reports:', failedReports);
        setError(`Errore nella generazione di ${failedReports.length} report`);
      }

      setActiveStep('export');
      
    } catch (error) {
      console.error('Error generating reports:', error);
      setError('Errore nella generazione dei report: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, selectedPatients, reportConfig]);
  // Download generated report
  const handleDownloadReport = useCallback(async (report) => {
    try {
      const blob = new Blob([JSON.stringify(report.reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Errore nel download del report');
    }
  }, []);
  // Print report
  const handlePrintReport = useCallback((report) => {
    const printWindow = window.open('', '_blank');
    const reportContent = JSON.stringify(report.reportData, null, 2);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          pre { background: #f3f4f6; padding: 15px; border-radius: 8px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>${report.title}</h1>
        <p><strong>Paziente:</strong> ${report.patient.name}</p>
        <p><strong>Generato il:</strong> ${new Date(report.createdAt).toLocaleDateString('it-IT')}</p>
        <pre>${reportContent}</pre>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>    `;
    
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.body.innerHTML = printContent;
      printWindow.document.close();
    }
  }, []);

  // Share report
  const handleShareReport = useCallback(async (report) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: report.title,
          text: `Report logopedia: ${report.title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiato negli appunti!');
      }
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  }, []);

  // Steps navigation
  const steps = [
    { id: 'template', label: 'Template', icon: DocumentTextIcon },
    { id: 'patients', label: 'Pazienti', icon: UserIcon },
    { id: 'configuration', label: 'Configurazione', icon: CogIcon },
    { id: 'preview', label: 'Anteprima', icon: EyeIcon },
    { id: 'export', label: 'Risultati', icon: ArrowDownTrayIcon }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === activeStep);

  // Get status color for patients
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 'template':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleziona Template Report</h2>
              <p className="text-gray-600">Scegli il tipo di report da generare (processato dal backend)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate?.id === template.id
                        ? `border-${template.color}-500 bg-${template.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-${template.color}-100`}>
                        <Icon className={`h-6 w-6 text-${template.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {template.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {template.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {template.estimatedTime}
                          </div>
                          <div className="text-xs text-gray-500">
                            <strong>Ideale per:</strong> {template.bestFor}
                          </div>
                          <div className="text-xs text-blue-600">
                            <strong>Backend API:</strong> {template.backendType}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircleIcon className={`h-6 w-6 text-${template.color}-600`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'patients':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleziona Pazienti</h2>
                <p className="text-gray-600">Scegli i pazienti per cui generare il report</p>
              </div>
              <div className="text-sm text-gray-600">
                {selectedPatients.length} paziente{selectedPatients.length !== 1 ? 'i' : ''} selezionat{selectedPatients.length !== 1 ? 'i' : 'o'}
              </div>
            </div>

            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca pazienti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient) => {
                const isSelected = selectedPatients.some(p => p.id === patient.id);
                return (
                  <div
                    key={patient.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePatientToggle(patient)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                          <p className="text-sm text-gray-600">{patient.age} anni</p>
                        </div>
                      </div>
                      {isSelected && <CheckCircleIcon className="h-5 w-5 text-blue-600" />}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status || 'active')}`}>
                          {patient.status === 'active' ? 'Attivo' : 'Inattivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nessun paziente trovato</p>
              </div>
            )}
          </div>
        );

      case 'configuration':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurazione Report</h2>
              <p className="text-gray-600">Personalizza le impostazioni che verranno inviate al backend</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">                <div>
                  <label htmlFor="reportTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Titolo Report
                  </label>
                  <input
                    id="reportTitle"
                    type="text"
                    value={reportConfig.title}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Inserisci titolo personalizzato..."
                  />
                </div>

                {selectedTemplate?.backendType === 'progress' && (
                  <div>
                    <label htmlFor="reportPeriod" className="block text-sm font-medium text-gray-700 mb-2">
                      Periodo di Analisi
                    </label>
                    <select
                      id="reportPeriod"
                      value={reportConfig.period}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, period: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="7d">Ultima settimana</option>
                      <option value="30d">Ultimo mese</option>
                      <option value="90d">Ultimi 3 mesi</option>
                      <option value="6m">Ultimi 6 mesi</option>
                      <option value="1y">Ultimo anno</option>
                    </select>
                  </div>
                )}                {selectedTemplate?.backendType === 'export' && (
                  <>
                    <div>
                      <label htmlFor="exportFormat" className="block text-sm font-medium text-gray-700 mb-2">
                        Formato Export
                      </label>
                      <select
                        id="exportFormat"
                        value={reportConfig.format}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="includeRawData"
                        checked={reportConfig.includeRawData}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, includeRawData: e.target.checked }))}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label htmlFor="includeRawData" className="text-sm font-medium text-gray-900 cursor-pointer">
                          Includi Dati Dettagliati
                        </label>
                        <p className="text-xs text-gray-600">Include metriche complete e dati delle sessioni</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Configurazione</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Template:</dt>
                    <dd className="text-sm text-gray-900">{selectedTemplate?.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Tipo Backend:</dt>
                    <dd className="text-sm text-gray-900">{selectedTemplate?.backendType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Pazienti:</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedPatients.map(p => p.name).join(', ')}
                    </dd>
                  </div>
                  {selectedTemplate?.backendType === 'progress' && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Periodo:</dt>
                      <dd className="text-sm text-gray-900">{reportConfig.period}</dd>
                    </div>
                  )}
                  {selectedTemplate?.backendType === 'export' && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Formato:</dt>
                        <dd className="text-sm text-gray-900 uppercase">{reportConfig.format}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Dati dettagliati:</dt>
                        <dd className="text-sm text-gray-900">
                          {reportConfig.includeRawData ? 'Sì' : 'No'}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Anteprima Generazione</h2>
              <p className="text-gray-600">Verifica le impostazioni prima di chiamare i servizi backend</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurazione</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Template:</dt>
                      <dd className="text-sm text-gray-900">{selectedTemplate?.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Servizio Backend:</dt>
                      <dd className="text-sm text-gray-900">{selectedTemplate?.backendType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Titolo:</dt>
                      <dd className="text-sm text-gray-900">{reportConfig.title || 'Titolo predefinito'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pazienti Selezionati</h3>
                  <div className="space-y-2">
                    {selectedPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">{patient.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="small" variant="white" />
                    <span>Chiamata Backend in corso...</span>
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>Genera Report (Backend)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Generati dal Backend!</h2>
              <p className="text-gray-600">I report sono stati processati dal servizio backend</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Report Generati</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {generatedReports.map((report) => (
                  <div key={report.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                          <span>Template: {report.template}</span>
                          <span>•</span>
                          <span>Paziente: {report.patient.name}</span>
                          <span>•</span>
                          <span>Processato dal backend: {new Date(report.createdAt).toLocaleDateString('it-IT')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                          Completato
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleDownloadReport(report)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Scarica JSON"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePrintReport(report)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Stampa"
                          >
                            <PrinterIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleShareReport(report)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Condividi"
                          >
                            <ShareIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setActiveStep('template');
                  setSelectedTemplate(null);
                  setSelectedPatients([]);
                  setGeneratedReports([]);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Nuovo Report
              </button>
              <button
                onClick={() => navigate('/professional/reports')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Vai ai Report
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => navigate('/professional')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Generatore Report</h1>
                <p className="text-gray-600">Interfaccia UI che delega la generazione ai servizi backend</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === activeStep;
                const isCompleted = index < currentStepIndex;
                const isClickable = index <= currentStepIndex;                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => isClickable && setActiveStep(step.id)}
                      disabled={!isClickable}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        (() => {
                          if (isActive) return 'bg-blue-100 text-blue-700';
                          if (isCompleted) return 'bg-green-100 text-green-700 hover:bg-green-200';
                          return 'bg-gray-100 text-gray-500';
                        })()
                      } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                      <span className="font-medium">{step.label}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className={`h-px w-8 mx-2 ${isCompleted ? 'bg-green-300' : 'bg-gray-300'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-700">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          {activeStep !== 'template' && activeStep !== 'export' && (
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => {
                  const currentIndex = steps.findIndex(s => s.id === activeStep);
                  if (currentIndex > 0) {
                    setActiveStep(steps[currentIndex - 1].id);
                  }
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Indietro
              </button>
              
              <button
                onClick={() => {
                  const currentIndex = steps.findIndex(s => s.id === activeStep);
                  if (activeStep === 'patients' && selectedPatients.length === 0) return;
                  if (currentIndex < steps.length - 1) {
                    setActiveStep(steps[currentIndex + 1].id);
                  }
                }}
                disabled={(activeStep === 'patients' && selectedPatients.length === 0)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Avanti
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default ReportGenerator;
