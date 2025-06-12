// filepath: c:\Users\arman\Desktop\WebSimpl\smile_adventure\frontend\src\components\professional\PatientList.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,  ArrowUpIcon,  ArrowDownIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Mock patient data - this will be replaced with real API calls
  const allPatients = [
    {
      id: 1,
      childName: 'Sofia Rossi',
      age: 6,
      parentName: 'Maria Rossi',
      parentPhone: '+39 333 1234567',
      parentEmail: 'maria.rossi@email.com',
      registrationDate: '2025-01-15',
      lastSession: '2025-06-11',
      nextAppointment: '2025-06-18',
      totalSessions: 12,
      completedSessions: 10,
      score: 92,
      improvement: '+15%',
      status: 'excellent',
      priority: 'normal',
      profileImage: '👧',
      notes: 'Ottimi progressi nella pronuncia delle consonanti',
      sessionFrequency: 'Bi-weekly',
      therapyGoals: ['Pronuncia R', 'Fluidità discorso', 'Confidenza'],
      parentSatisfaction: 5,
      lastSessionNotes: 'Eccellente partecipazione, continua miglioramento',
      upcomingGoals: 'Focus su consonanti complesse',
      medicalNotes: 'Nessuna allergia nota',
      emergencyContact: 'Giuseppe Rossi - +39 333 1234568'
    },
    {
      id: 2,
      childName: 'Marco Bianchi',
      age: 8,
      parentName: 'Giuseppe Bianchi',
      parentPhone: '+39 334 2345678',
      parentEmail: 'giuseppe.bianchi@email.com',
      registrationDate: '2025-02-20',
      lastSession: '2025-06-10',
      nextAppointment: '2025-06-17',
      totalSessions: 8,
      completedSessions: 7,
      score: 78,
      improvement: '+8%',
      status: 'good',
      priority: 'normal',
      profileImage: '👦',
      notes: 'Miglioramento costante, continuare con esercizi current',
      sessionFrequency: 'Weekly',
      therapyGoals: ['Articolazione S', 'Riduzione balbuzie', 'Autostima'],
      parentSatisfaction: 4,
      lastSessionNotes: 'Buona collaborazione, progressi regolari',
      upcomingGoals: 'Rafforzare esercizi articolatori',
      medicalNotes: 'Allergia ai latticini',
      emergencyContact: 'Anna Bianchi - +39 334 2345679'
    },
    {
      id: 3,
      childName: 'Giulia Verdi',
      age: 5,
      parentName: 'Anna Verdi',
      parentPhone: '+39 335 3456789',
      parentEmail: 'anna.verdi@email.com',
      registrationDate: '2024-11-10',
      lastSession: '2025-06-09',
      nextAppointment: '2025-06-16',
      totalSessions: 15,
      completedSessions: 12,
      score: 65,
      improvement: '+3%',
      status: 'needs_attention',
      priority: 'high',
      profileImage: '👧',
      notes: 'Richiede maggiore attenzione per la motivazione',
      sessionFrequency: 'Bi-weekly',
      therapyGoals: ['Motivazione', 'Pronuncia L', 'Partecipazione attiva'],
      parentSatisfaction: 3,
      lastSessionNotes: 'Difficoltà di concentrazione, serve approccio ludico',
      upcomingGoals: 'Aumentare engagement con giochi interattivi',
      medicalNotes: 'ADHD diagnosticato',
      emergencyContact: 'Roberto Verdi - +39 335 3456790'
    },
    {
      id: 4,
      childName: 'Luca Ferrari',
      age: 7,
      parentName: 'Roberto Ferrari',
      parentPhone: '+39 336 4567890',
      parentEmail: 'roberto.ferrari@email.com',
      registrationDate: '2025-03-05',
      lastSession: '2025-06-08',
      nextAppointment: '2025-06-15',
      totalSessions: 10,
      completedSessions: 9,
      score: 89,
      improvement: '+12%',
      status: 'excellent',
      priority: 'normal',
      profileImage: '👦',
      notes: 'Eccellente partecipazione e risultati',
      sessionFrequency: 'Weekly',
      therapyGoals: ['Perfezionamento R', 'Velocità eloquio', 'Sicurezza'],
      parentSatisfaction: 5,
      lastSessionNotes: 'Prestazioni eccellenti, quasi completato il percorso',
      upcomingGoals: 'Finalizzazione obiettivi principali',
      medicalNotes: 'Nessuna condizione particolare',
      emergencyContact: 'Lucia Ferrari - +39 336 4567891'
    },
    {
      id: 5,
      childName: 'Chiara Romano',
      age: 6,
      parentName: 'Francesca Romano',
      parentPhone: '+39 337 5678901',
      parentEmail: 'francesca.romano@email.com',
      registrationDate: '2025-01-30',
      lastSession: '2025-06-07',
      nextAppointment: '2025-06-14',
      totalSessions: 9,
      completedSessions: 8,
      score: 71,
      improvement: '+5%',
      status: 'good',
      priority: 'normal',
      profileImage: '👧',
      notes: 'Progressi regolari, buona collaborazione famiglia',
      sessionFrequency: 'Bi-weekly',
      therapyGoals: ['Pronuncia TH', 'Fluidità lettura', 'Comprensione'],
      parentSatisfaction: 4,
      lastSessionNotes: 'Progressi costanti, famiglia molto collaborativa',
      upcomingGoals: 'Consolidamento delle competenze acquisite',
      medicalNotes: 'Lieve ipovisione corretta con occhiali',
      emergencyContact: 'Marco Romano - +39 337 5678902'
    },
    {
      id: 6,
      childName: 'Alessandro Conti',
      age: 9,
      parentName: 'Paola Conti',
      parentPhone: '+39 338 6789012',
      parentEmail: 'paola.conti@email.com',
      registrationDate: '2024-09-15',
      lastSession: '2025-06-06',
      nextAppointment: '2025-06-13',
      totalSessions: 20,
      completedSessions: 18,
      score: 95,
      improvement: '+25%',
      status: 'excellent',
      priority: 'low',
      profileImage: '👦',
      notes: 'Caso di successo, quasi pronto per dimissioni',
      sessionFrequency: 'Monthly',
      therapyGoals: ['Mantenimento', 'Sicurezza sociale', 'Autonomia'],
      parentSatisfaction: 5,
      lastSessionNotes: 'Eccellenti risultati, follow-up mensile sufficiente',
      upcomingGoals: 'Preparazione dimissioni e follow-up sporadico',
      medicalNotes: 'Nessuna condizione particolare',
      emergencyContact: 'Andrea Conti - +39 338 6789013'
    }
  ];

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'needs_attention':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'good':
        return <StarIcon className="h-4 w-4" />;
      case 'needs_attention':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority) => {
    if (priority === 'high') return 'Alta';
    if (priority === 'normal') return 'Normale';
    return 'Bassa';
  };

  const getAgeGroup = (age) => {
    if (age <= 5) return 'early_childhood';
    if (age <= 8) return 'school_age';
    return 'pre_teen';
  };

  // Filtered and sorted patients
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = allPatients.filter(patient => {
      // Search filter
      const matchesSearch = 
        patient.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.parentEmail.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;

      // Age filter
      const matchesAge = ageFilter === 'all' || getAgeGroup(patient.age) === ageFilter;

      return matchesSearch && matchesStatus && matchesAge;
    });

    // Sort patients
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.childName.toLowerCase();
          bValue = b.childName.toLowerCase();
          break;
        case 'age':
          aValue = a.age;
          bValue = b.age;
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'lastSession':
          aValue = new Date(a.lastSession);
          bValue = new Date(b.lastSession);
          break;
        case 'nextAppointment':
          aValue = new Date(a.nextAppointment);
          bValue = new Date(b.nextAppointment);
          break;        case 'sessions':
          aValue = a.completedSessions;
          bValue = b.completedSessions;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchTerm, statusFilter, ageFilter, sortBy, sortOrder]);
  // Event handlers
  const handlePatientClick = (patientId) => {
    navigate(`/professional/patients/${patientId}`);
  };

  const handleQuickAction = (action, patient, event) => {
    event.stopPropagation();
    
    switch (action) {
      case 'view':
        navigate(`/professional/patients/${patient.id}`);
        break;
      case 'edit':
        navigate(`/professional/patients/${patient.id}/edit`);
        break;
      case 'call':
        window.open(`tel:${patient.parentPhone}`);
        break;
      case 'email':
        window.open(`mailto:${patient.parentEmail}`);
        break;
      case 'schedule':
        navigate(`/professional/schedule?patient=${patient.id}`);
        break;
      default:
        console.log(`Action ${action} for patient ${patient.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="patient-list-container">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200" data-testid="patient-list-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <UserGroupIcon className="h-8 w-8 mr-3 text-primary-600" />
                Gestione Pazienti
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredAndSortedPatients.length} di {allPatients.length} pazienti
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/professional/patients/new')}
                className="btn-primary flex items-center space-x-2"
                data-testid="add-patient-button"
              >
                <UserIcon className="h-5 w-5" />
                <span>Nuovo Paziente</span>
              </button>
              
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  data-testid="grid-view-button"
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  data-testid="list-view-button"
                >
                  <div className="w-4 h-4 flex flex-col gap-0.5">
                    <div className="bg-current h-0.5 rounded-sm"></div>
                    <div className="bg-current h-0.5 rounded-sm"></div>
                    <div className="bg-current h-0.5 rounded-sm"></div>
                    <div className="bg-current h-0.5 rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-testid="patient-filters">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700 mb-2">
                Cerca Pazienti
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="patient-search"
                  type="text"
                  placeholder="Nome bambino, genitore o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  data-testid="patient-search-input"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Stato
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                data-testid="status-filter-select"
              >
                <option value="all">Tutti gli stati</option>
                <option value="excellent">Eccellente</option>
                <option value="good">Buono</option>
                <option value="needs_attention">Attenzione</option>
              </select>
            </div>

            {/* Age Filter */}
            <div>
              <label htmlFor="age-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Età
              </label>
              <select
                id="age-filter"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                data-testid="age-filter-select"
              >
                <option value="all">Tutte le età</option>
                <option value="early_childhood">Prima infanzia (≤5)</option>
                <option value="school_age">Età scolare (6-8)</option>
                <option value="pre_teen">Pre-adolescenza (9+)</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
                Ordina per
              </label>
              <div className="flex space-x-2">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  data-testid="sort-select"
                >
                  <option value="name">Nome</option>
                  <option value="age">Età</option>
                  <option value="score">Punteggio</option>
                  <option value="lastSession">Ultima sessione</option>
                  <option value="nextAppointment">Prossimo app.</option>
                  <option value="sessions">Sessioni</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500"
                  data-testid="sort-order-button"
                >
                  {sortOrder === 'asc' ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8" data-testid="patient-list-content">
        {filteredAndSortedPatients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center" data-testid="no-patients-message">
            <UserGroupIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun paziente trovato</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' || ageFilter !== 'all' 
                ? 'Prova a modificare i filtri di ricerca'
                : 'Inizia aggiungendo il tuo primo paziente'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && ageFilter === 'all' && (
              <button 
                onClick={() => navigate('/professional/patients/new')}
                className="btn-primary"
              >
                Aggiungi Primo Paziente
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          } data-testid="patients-grid">
            {filteredAndSortedPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handlePatientClick(patient.id)}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer ${
                  viewMode === 'list' ? 'p-4' : 'p-6'
                }`}
                data-testid={`patient-card-${patient.id}`}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{patient.profileImage}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{patient.childName}</h3>
                          <p className="text-sm text-gray-500">{patient.age} anni</p>
                        </div>
                      </div>                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(patient.priority)}`}>
                        {getPriorityText(patient.priority)}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>{patient.parentName}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarDaysIcon className="h-4 w-4 mr-2" />
                        <span>Ultimo: {new Date(patient.lastSession).toLocaleDateString('it-IT')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ChartBarIcon className="h-4 w-4 mr-2" />
                        <span>{patient.completedSessions}/{patient.totalSessions} sessioni</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">{patient.score}%</span>
                        <span className="text-sm text-green-600 font-medium">{patient.improvement}</span>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                        {getStatusIcon(patient.status)}
                        <span>{getStatusText(patient.status)}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => handleQuickAction('view', patient, e)}
                          className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>Dettagli</span>
                        </button>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleQuickAction('call', patient, e)}
                            className="p-1 text-gray-400 hover:text-green-600 rounded"
                            title="Chiama"
                          >
                            <PhoneIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickAction('email', patient, e)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            title="Email"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickAction('schedule', patient, e)}
                            className="p-1 text-gray-400 hover:text-purple-600 rounded"
                            title="Prenota"
                          >
                            <CalendarDaysIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickAction('edit', patient, e)}
                            className="p-1 text-gray-400 hover:text-orange-600 rounded"
                            title="Modifica"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{patient.profileImage}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{patient.childName}</h3>
                        <p className="text-sm text-gray-500">{patient.age} anni • {patient.parentName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{patient.score}%</p>
                        <p className="text-xs text-gray-500">Punteggio</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{patient.completedSessions}/{patient.totalSessions}</p>
                        <p className="text-xs text-gray-500">Sessioni</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(patient.nextAppointment).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                        </p>
                        <p className="text-xs text-gray-500">Prossimo</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                        {getStatusText(patient.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleQuickAction('view', patient, e)}
                          className="p-1 text-gray-400 hover:text-primary-600 rounded"
                          title="Visualizza"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleQuickAction('edit', patient, e)}
                          className="p-1 text-gray-400 hover:text-orange-600 rounded"
                          title="Modifica"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
