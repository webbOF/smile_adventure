import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  EyeIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Import Common Components
import {
  LoadingSpinner,
  FormModal,
  DataTable,
  ConfirmationModal
} from '../common';

// Import Services
import { reportService } from '../../services';

const SessionManager = () => {
  const { childId } = useParams();
  
  // State management
  const [child, setChild] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [gameTypeFilter, setGameTypeFilter] = useState('');

  // Fetch child and sessions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Mock child data (replace with real API call)
        const childData = {
          id: childId,
          name: 'Sofia Rossi',
          age: 6,
          avatar: '👧',
          level: 5,
          totalSessions: 45,
          totalPoints: 320,
          lastSession: '2025-01-24'
        };
        setChild(childData);

        // Fetch sessions from backend
        const sessionsData = await reportService.getChildGameSessions(childId, {
          limit: 50,
          sort: 'started_at',
          order: 'desc'
        });
        
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching session data:', error);
        toast.error('Errore nel caricamento delle sessioni');
        // Use mock data on error
        setSessions(mockSessions);
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      fetchData();
    }
  }, [childId]);

  // Mock sessions data for development
  const mockSessions = [
    {
      id: 1,
      gameType: 'Routine Igiene',
      scenarioName: 'Spazzolatura Completa',
      startedAt: '2025-01-25T08:30:00Z',
      completedAt: '2025-01-25T08:45:00Z',
      duration: 900, // seconds
      score: 850,
      pointsEarned: 25,
      status: 'completed',
      completionRate: 100,
      levelsCompleted: 5,
      correctResponses: 18,
      helpRequests: 2,
      emotionalState: 'happy',
      achievements: ['Perfect Brushing', 'No Skips']
    },
    {
      id: 2,
      gameType: 'Quiz Denti',
      scenarioName: 'Conoscenza Base',
      startedAt: '2025-01-24T19:15:00Z',
      completedAt: '2025-01-24T19:30:00Z',
      duration: 720,
      score: 720,
      pointsEarned: 20,
      status: 'completed',
      completionRate: 90,
      levelsCompleted: 3,
      correctResponses: 12,
      helpRequests: 1,
      emotionalState: 'focused',
      achievements: ['Quick Learner']
    },
    {
      id: 3,
      gameType: 'Routine Igiene',
      scenarioName: 'Filo Dentale',
      startedAt: '2025-01-24T08:30:00Z',
      completedAt: null,
      duration: 450,
      score: 200,
      pointsEarned: 0,
      status: 'incomplete',
      completionRate: 40,
      levelsCompleted: 2,
      correctResponses: 6,
      helpRequests: 4,
      emotionalState: 'frustrated',
      achievements: []
    },
    {
      id: 4,
      gameType: 'Memory Game',
      scenarioName: 'Strumenti Dentali',
      startedAt: '2025-01-23T16:45:00Z',
      completedAt: '2025-01-23T17:05:00Z',
      duration: 1200,
      score: 950,
      pointsEarned: 30,
      status: 'completed',
      completionRate: 100,
      levelsCompleted: 8,
      correctResponses: 24,
      helpRequests: 0,
      emotionalState: 'excited',
      achievements: ['Memory Master', 'Perfect Score']
    },
    {
      id: 5,
      gameType: 'Routine Igiene',
      scenarioName: 'Controllo Placca',
      startedAt: '2025-01-22T09:00:00Z',
      completedAt: '2025-01-22T09:20:00Z',
      duration: 1200,
      score: 680,
      pointsEarned: 18,
      status: 'completed',
      completionRate: 85,
      levelsCompleted: 4,
      correctResponses: 15,
      helpRequests: 3,
      emotionalState: 'calm',
      achievements: ['Thorough Check']
    }
  ];

  // Session status indicators
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        icon: CheckCircleIcon,
        className: 'bg-green-100 text-green-800',
        text: 'Completata'
      },
      incomplete: {
        icon: ExclamationCircleIcon,
        className: 'bg-red-100 text-red-800',
        text: 'Incompleta'
      },
      in_progress: {
        icon: PauseIcon,
        className: 'bg-yellow-100 text-yellow-800',
        text: 'In Corso'
      }
    };

    const config = statusConfig[status] || statusConfig.incomplete;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Format duration
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle session details view
  const handleViewSession = useCallback((session) => {
    setSelectedSession(session);
    setShowSessionModal(true);
  }, []);

  // Handle session deletion
  const handleDeleteSession = useCallback((session) => {
    setSessionToDelete(session);
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteSession = useCallback(async () => {
    if (!sessionToDelete) return;    try {
      await reportService.deleteGameSession(sessionToDelete.id);
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id));
      toast.success('Sessione eliminata con successo');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Errore nell\'eliminazione della sessione');
    } finally {
      setShowDeleteModal(false);
      setSessionToDelete(null);
    }
  }, [sessionToDelete]);

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    // Status filter
    if (activeFilter !== 'all' && session.status !== activeFilter) {
      return false;
    }

    // Game type filter
    if (gameTypeFilter && session.gameType !== gameTypeFilter) {
      return false;
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      const sessionDate = new Date(session.startedAt);
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      if (sessionDate < start || sessionDate > end) {
        return false;
      }
    }

    return true;
  });

  // DataTable columns configuration
  const tableColumns = [
    {
      accessor: 'gameType',
      header: 'Tipo Gioco',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm">🎮</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{row.scenarioName}</p>
          </div>
        </div>
      )
    },
    {
      accessor: 'startedAt',
      header: 'Data/Ora',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <p className="text-gray-900">{formatDate(value)}</p>
        </div>
      )
    },
    {
      accessor: 'duration',
      header: 'Durata',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center text-sm text-gray-600">
          <ClockIcon className="h-4 w-4 mr-1" />
          {formatDuration(value)}
        </span>
      )
    },
    {
      accessor: 'score',
      header: 'Punteggio',
      sortable: true,
      render: (value, row) => (
        <div className="text-center">
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">+{row.pointsEarned} punti</p>
        </div>
      )
    },
    {
      accessor: 'completionRate',
      header: 'Completamento',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-primary-600 h-2 rounded-full" 
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{value}%</span>
        </div>
      )
    },
    {
      accessor: 'status',
      header: 'Stato',
      sortable: true,
      render: (value) => getStatusBadge(value)
    }
  ];

  // DataTable actions
  const tableActions = [
    {
      label: 'Visualizza',
      icon: <EyeIcon className="h-4 w-4" />,
      onClick: handleViewSession,
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Elimina',
      icon: <XMarkIcon className="h-4 w-4" />,
      onClick: handleDeleteSession,
      className: 'text-red-600 hover:text-red-900',
      condition: (session) => session.status !== 'in_progress'
    }
  ];

  // Quick stats calculation
  const quickStats = {
    totalSessions: filteredSessions.length,
    completedSessions: filteredSessions.filter(s => s.status === 'completed').length,
    totalPoints: filteredSessions.reduce((sum, s) => sum + s.pointsEarned, 0),
    averageScore: filteredSessions.length > 0 
      ? Math.round(filteredSessions.reduce((sum, s) => sum + s.score, 0) / filteredSessions.length)
      : 0
  };

  const gameTypes = [...new Set(sessions.map(s => s.gameType))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        {/* Header */}
        <div className="header-navigation flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              to={`/parent/child/${childId}`}
              className="mr-4 p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </Link>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-2xl mr-4">
                {child?.avatar || '👧'}
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  Sessioni di {child?.name || 'Bambino'}
                </h1>
                <p className="text-gray-600">Gestione e cronologia delle sessioni di gioco</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline flex items-center space-x-2 ${showFilters ? 'bg-primary-50 border-primary-300' : ''}`}
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filtri</span>
            </button>
            <Link 
              to={`/parent/game/${childId}`}
              className="game-button flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Nuova Sessione</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="dental-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sessioni Totali</h3>
                <p className="text-2xl font-bold text-gray-900">{quickStats.totalSessions}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="dental-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Completate</h3>
                <p className="text-2xl font-bold text-green-600">{quickStats.completedSessions}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="dental-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Punti Totali</h3>
                <p className="text-2xl font-bold text-yellow-600">{quickStats.totalPoints}</p>
              </div>
              <TrophyIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="dental-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Punteggio Medio</h3>
                <p className="text-2xl font-bold text-purple-600">{quickStats.averageScore}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="dental-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">Stato</label>
                <select
                  id="status-filter"
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Tutte</option>
                  <option value="completed">Completate</option>
                  <option value="incomplete">Incomplete</option>
                  <option value="in_progress">In Corso</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="game-type-filter" className="block text-sm font-medium text-gray-700 mb-2">Tipo Gioco</label>
                <select
                  id="game-type-filter"
                  value={gameTypeFilter}
                  onChange={(e) => setGameTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Tutti i tipi</option>
                  {gameTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="start-date-filter" className="block text-sm font-medium text-gray-700 mb-2">Data Inizio</label>
                <input
                  type="date"
                  id="start-date-filter"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="end-date-filter" className="block text-sm font-medium text-gray-700 mb-2">Data Fine</label>
                <input
                  type="date"
                  id="end-date-filter"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'all', name: 'Tutte', count: sessions.length },
                { id: 'completed', name: 'Completate', count: sessions.filter(s => s.status === 'completed').length },
                { id: 'incomplete', name: 'Incomplete', count: sessions.filter(s => s.status === 'incomplete').length },
                { id: 'in_progress', name: 'In Corso', count: sessions.filter(s => s.status === 'in_progress').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeFilter === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.name}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activeFilter === tab.id
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="dental-card">
          <DataTable
            data={filteredSessions}
            columns={tableColumns}
            actions={tableActions}
            searchable={true}
            sortable={true}
            pagination={true}
            rowsPerPage={10}
            emptyMessage="Nessuna sessione trovata"
            searchPlaceholder="Cerca per tipo gioco o scenario..."
          />
        </div>
      </div>

      {/* Session Details Modal */}
      {showSessionModal && selectedSession && (
        <FormModal
          isOpen={showSessionModal}
          onClose={() => {
            setShowSessionModal(false);
            setSelectedSession(null);
          }}
          title={`Dettagli Sessione - ${selectedSession.gameType}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Session Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Informazioni Generali</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Scenario:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedSession.scenarioName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data/Ora:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(selectedSession.startedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Durata:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDuration(selectedSession.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stato:</span>
                    {getStatusBadge(selectedSession.status)}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Punteggio:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedSession.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Punti Guadagnati:</span>
                    <span className="text-sm font-medium text-green-600">+{selectedSession.pointsEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completamento:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedSession.completionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Livelli Completati:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedSession.levelsCompleted}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction Stats */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Statistiche Interazione</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedSession.correctResponses}</p>
                  <p className="text-xs text-gray-500">Risposte Corrette</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{selectedSession.helpRequests}</p>
                  <p className="text-xs text-gray-500">Richieste Aiuto</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedSession.emotionalState}</p>
                  <p className="text-xs text-gray-500">Stato Emotivo</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {selectedSession.achievements && selectedSession.achievements.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Obiettivi Raggiunti</h4>
                <div className="flex flex-wrap gap-2">                  {selectedSession.achievements.map((achievement) => (
                    <span 
                      key={`achievement-${achievement}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                    >
                      🏆 {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FormModal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSessionToDelete(null);
          }}
          onConfirm={confirmDeleteSession}
          title="Elimina Sessione"
          message={`Sei sicuro di voler eliminare questa sessione? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          variant="danger"
        />
      )}
    </div>
  );
};

export default SessionManager;
