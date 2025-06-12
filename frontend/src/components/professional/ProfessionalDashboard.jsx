import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { 
  UserGroupIcon, 
  ChartBarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  HeartIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  XMarkIcon,
  FunnelIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';

const ProfessionalDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientFilter, setSelectedPatientFilter] = useState('all');

  // Mock data - this will be replaced with real API calls
  const stats = {
    totalPatients: 45,
    activeChildren: 28,
    completedSessions: 156,
    averageScore: 87,
    thisWeekSessions: 12,
    improvementRate: 23,
  };

  const allPatients = [
    {
      id: 1,
      childName: 'Sofia Rossi',
      age: 6,
      parentName: 'Maria Rossi',
      parentPhone: '+39 333 1234567',
      parentEmail: 'maria.rossi@email.com',
      lastSession: '2025-06-11',
      nextAppointment: '2025-06-18',
      score: 92,
      improvement: '+15%',
      status: 'excellent',
      totalSessions: 12,
      profileImage: '👧',
      notes: 'Ottimi progressi nella pronuncia delle consonanti',
      priority: 'normal'
    },
    {
      id: 2,
      childName: 'Marco Bianchi',
      age: 8,
      parentName: 'Giuseppe Bianchi',
      parentPhone: '+39 334 2345678',
      parentEmail: 'giuseppe.bianchi@email.com',
      lastSession: '2025-06-10',
      nextAppointment: '2025-06-17',
      score: 78,
      improvement: '+8%',
      status: 'good',
      totalSessions: 8,
      profileImage: '👦',
      notes: 'Miglioramento costante, continuare con esercizi current',
      priority: 'normal'
    },
    {
      id: 3,
      childName: 'Giulia Verdi',
      age: 5,
      parentName: 'Anna Verdi',
      parentPhone: '+39 335 3456789',
      parentEmail: 'anna.verdi@email.com',
      lastSession: '2025-06-09',
      nextAppointment: '2025-06-16',
      score: 65,
      improvement: '+3%',
      status: 'needs_attention',
      totalSessions: 15,
      profileImage: '👧',
      notes: 'Richiede maggiore attenzione per la motivazione',
      priority: 'high'
    },
    {
      id: 4,
      childName: 'Luca Ferrari',
      age: 7,
      parentName: 'Roberto Ferrari',
      parentPhone: '+39 336 4567890',
      parentEmail: 'roberto.ferrari@email.com',
      lastSession: '2025-06-08',
      nextAppointment: '2025-06-15',
      score: 89,
      improvement: '+12%',
      status: 'excellent',
      totalSessions: 10,
      profileImage: '👦',
      notes: 'Eccellente partecipazione e risultati',
      priority: 'normal'
    },
    {
      id: 5,
      childName: 'Chiara Romano',
      age: 6,
      parentName: 'Francesca Romano',
      parentPhone: '+39 337 5678901',
      parentEmail: 'francesca.romano@email.com',
      lastSession: '2025-06-07',
      nextAppointment: '2025-06-14',
      score: 71,
      improvement: '+5%',
      status: 'good',
      totalSessions: 9,
      profileImage: '👧',
      notes: 'Progressi regolari, buona collaborazione famiglia',
      priority: 'normal'
    }
  ];

  const recentPatients = allPatients.slice(0, 3);

  const pendingReports = [
    {
      id: 1,
      childName: 'Sofia Rossi',
      type: 'Valutazione Mensile',
      dueDate: '2025-06-15',
      priority: 'medium',
    },
    {
      id: 2,
      childName: 'Luca Ferrari',
      type: 'Report di Progresso',
      dueDate: '2025-06-12',
      priority: 'high',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'needs_attention':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'excellent':
        return 'Eccellente';
      case 'good':
        return 'Buono';
      case 'needs_attention':
        return 'Attenzione';
      default:
        return 'Non definito';
    }
  };
  const getPriorityText = (priority) => {
    if (priority === 'high') return 'Alta';
    if (priority === 'medium') return 'Media';
    return 'Bassa';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'normal':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'medium':
        return <ClockIcon className="h-4 w-4" />;
      case 'low':
      case 'normal':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const filteredPatients = allPatients.filter(patient => {
    const matchesSearch = patient.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedPatientFilter === 'all' || patient.status === selectedPatientFilter;
    return matchesSearch && matchesFilter;  });

  // quickActions with analytics integration for verification
  const quickActions = [
    { 
      id: 1, 
      label: 'Nuovo Paziente', 
      icon: <UserGroupIcon className="h-5 w-5" />, 
      color: 'bg-primary-600 hover:bg-primary-700',
      action: () => navigate('/professional/patients/new')
    },
    { 
      id: 2, 
      label: 'Gestione Pazienti', 
      icon: <EyeIcon className="h-5 w-5" />, 
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => navigate('/professional/patients')
    },
    { 
      id: 3, 
      label: 'Analytics Cliniche', 
      icon: <ChartBarIcon className="h-5 w-5" />, 
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => navigate('/professional/analytics')
    },
    { 
      id: 4, 
      label: 'Genera Report', 
      icon: <DocumentTextIcon className="h-5 w-5" />, 
      color: 'bg-secondary-600 hover:bg-secondary-700',
      action: () => navigate('/professional/reports')
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50" data-testid="professional-dashboard">      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          role="button"
          tabIndex={0}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSidebarOpen(false);
            }
          }}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} data-testid="patients-sidebar">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista Pazienti</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-200" data-testid="patients-search-filter">
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca pazienti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              data-testid="patient-search-input"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <select
              value={selectedPatientFilter}
              onChange={(e) => setSelectedPatientFilter(e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              data-testid="patient-filter-select"
            >
              <option value="all">Tutti i pazienti</option>
              <option value="excellent">Eccellenti</option>
              <option value="good">Buoni</option>
              <option value="needs_attention">Attenzione richiesta</option>
            </select>
          </div>
        </div>

        {/* Patients List */}
        <div className="flex-1 overflow-y-auto" data-testid="patients-list">
          <div className="p-4 space-y-3">
            {filteredPatients.map((patient) => (
              <div 
                key={patient.id} 
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                data-testid={`patient-card-${patient.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{patient.profileImage}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{patient.childName}</h4>
                      <p className="text-xs text-gray-500">{patient.age} anni</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(patient.priority)}`}>
                    {getPriorityIcon(patient.priority)}
                  </div>
                </div>
                
                <div className="space-y-1 text-xs">
                  <p className="text-gray-600">
                    <span className="font-medium">Genitore:</span> {patient.parentName}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Ultima sessione:</span> {new Date(patient.lastSession).toLocaleDateString('it-IT')}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Prossimo:</span> {new Date(patient.nextAppointment).toLocaleDateString('it-IT')}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                    {getStatusText(patient.status)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-bold text-gray-900">{patient.score}%</span>
                    <span className="text-xs text-green-600 font-medium">{patient.improvement}</span>
                  </div>
                </div>                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                  <button 
                    onClick={() => navigate(`/professional/patients/${patient.id}`)}
                    className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700"
                  >
                    <EyeIcon className="h-3 w-3" />
                    <span>Dettagli</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => window.open(`mailto:${patient.parentEmail}`)}
                      className="p-1 text-gray-400 hover:text-primary-600 rounded"
                      title="Invia Email"
                    >
                      <EnvelopeIcon className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => window.open(`tel:${patient.parentPhone}`)}
                      className="p-1 text-gray-400 hover:text-primary-600 rounded"
                      title="Chiama"
                    >
                      <PhoneIcon className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => navigate(`/professional/patients/${patient.id}`)}
                      className="p-1 text-gray-400 hover:text-primary-600 rounded"
                      title="Chat"
                    >
                      <ChatBubbleLeftRightIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <UserGroupIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Nessun paziente trovato</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-80" data-testid="main-content">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40" data-testid="dashboard-header">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <Bars3Icon className="h-5 w-5" />
                </button>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Benvenuto Dr. {user?.last_name}! 🦷
                  </h1>
                  <p className="text-sm text-gray-600">
                    Dashboard professionale - {new Date().toLocaleDateString('it-IT', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <Cog6ToothIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6" data-testid="dashboard-main">
          {/* Quick Actions Section */}
          <div className="mb-8" data-testid="quick-actions-section">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg`}
                  data-testid={`quick-action-${action.id}`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {action.icon}
                    <span className="text-sm font-medium text-center">{action.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>          {/* Multi-Patient Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-testid="stats-overview">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pazienti Totali</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                  <p className="text-xs text-gray-500 mt-1">+3 questo mese</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bambini Attivi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeChildren}</p>
                  <p className="text-xs text-green-600 mt-1">+{stats.improvementRate}% miglioramento</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sessioni Completate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.thisWeekSessions} questa settimana</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <StarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Punteggio Medio</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                  <p className="text-xs text-blue-600 mt-1">+5% vs scorso mese</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasso Successo</p>
                  <p className="text-2xl font-bold text-gray-900">94%</p>
                  <p className="text-xs text-purple-600 mt-1">Obiettivi raggiunti</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <HeartIcon className="h-6 w-6 text-pink-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Soddisfazione</p>
                  <p className="text-2xl font-bold text-gray-900">4.8/5</p>
                  <p className="text-xs text-pink-600 mt-1">Feedback famiglie</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-testid="activity-reports-section">
            {/* Recent Patients Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Pazienti Recenti</h3>                  <button 
                    onClick={() => navigate('/professional/patients')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                  >
                    <span>Vedi Tutti</span>
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200" data-testid="recent-patients-list">
                {recentPatients.map((patient) => (
                  <div 
                    key={patient.id} 
                    onClick={() => navigate(`/professional/patients/${patient.id}`)}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{patient.profileImage}</div>
                        <div>
                          <h4 className="font-medium text-gray-900">{patient.childName}</h4>
                          <p className="text-sm text-gray-500">{patient.age} anni • {patient.parentName}</p>
                          <p className="text-xs text-gray-400">
                            Ultima: {new Date(patient.lastSession).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg font-bold text-gray-900">{patient.score}%</span>
                          <span className="text-sm text-green-600 font-medium">{patient.improvement}</span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                          {getStatusText(patient.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reports & Tasks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Report e Attività</h3>
              </div>
              
              <div className="p-6" data-testid="pending-reports">
                <div className="space-y-4">
                  {pendingReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{report.childName}</h4>                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                          {getPriorityText(report.priority)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{report.type}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Scadenza: {new Date(report.dueDate).toLocaleDateString('it-IT')}
                        </p>
                        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                          Completa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Riepilogo</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Soddisfazione Pazienti</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Engagement Medio</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Obiettivi Raggiunti</span>
                        <span className="font-medium">76%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-secondary-600 h-2 rounded-full" style={{ width: '76%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
