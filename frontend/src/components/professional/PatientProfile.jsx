// filepath: c:\Users\arman\Desktop\WebSimpl\smile_adventure\frontend\src\components\professional\PatientProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,  HeartIcon,
  TrophyIcon,
  PrinterIcon,
  ShareIcon,
  EyeIcon,
  PlusIcon,
  PlayIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Mock patient data - this would come from an API call based on patientId
  const [patient, setPatient] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState([]);

  useEffect(() => {
    // Mock API call to fetch patient data
    const fetchPatientData = () => {
      // This would be replaced with actual API calls
      const mockPatient = {
        id: parseInt(patientId),
        childName: 'Sofia Rossi',
        age: 6,
        birthDate: '2019-03-15',
        parentName: 'Maria Rossi',
        parentPhone: '+39 333 1234567',
        parentEmail: 'maria.rossi@email.com',
        emergencyContact: 'Giuseppe Rossi - +39 333 1234568',
        address: 'Via Roma 123, Milano, MI 20100',
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
        sessionFrequency: 'Bi-weekly',
        therapyGoals: ['Pronuncia R', 'Fluidità discorso', 'Confidenza'],
        parentSatisfaction: 5,
        medicalNotes: 'Nessuna allergia nota. Sviluppo normale.',
        insuranceInfo: 'SSN + Assicurazione privata XYZ',
        referredBy: 'Dr. Pediatra Giovanni Bianchi',
        initialDiagnosis: 'Dislalia evolutiva - difficoltà pronuncia R',
        currentDiagnosis: 'Miglioramento significativo, mantenimento',
        therapyStartDate: '2025-01-20',
        estimatedEndDate: '2025-08-15',
        weeklyGoals: 'Consolidare pronuncia R in frasi complesse',
        monthlyGoals: 'Autonomia completa nella pronuncia',
        longTermGoals: 'Dimissioni con follow-up sporadico'
      };

      const mockSessions = [
        {
          id: 1,
          date: '2025-06-11',
          duration: 45,
          type: 'Terapia individuale',
          therapist: 'Dr. Rossi',
          score: 95,
          engagement: 90,
          goals: ['Pronuncia R', 'Fluidità'],
          activities: ['Esercizi articolatori', 'Giochi di parole', 'Lettura guidata'],
          notes: 'Eccellente sessione. Sofia ha mostrato grandi progressi nella pronuncia della R in posizione iniziale.',
          homework: 'Esercizi quotidiani con specchio, 10 minuti al giorno',
          nextGoals: 'R in posizione intermedia',
          parentFeedback: 'Sofia molto entusiasta, sta praticando a casa',
          behaviorNotes: 'Collaborativa, attenta, motivata',
          technicalNotes: 'Utilizzati strumenti multimediali, apps interattive'
        },
        {
          id: 2,
          date: '2025-06-04',
          duration: 45,
          type: 'Terapia individuale',
          therapist: 'Dr. Rossi',
          score: 88,
          engagement: 85,
          goals: ['Pronuncia R', 'Autostima'],
          activities: ['Esercizi respiratori', 'Giochi fonetici', 'Storytelling'],
          notes: 'Buoni progressi. Necessario rafforzare la fiducia nelle proprie capacità.',
          homework: 'Registrare se stessa mentre legge favole',
          nextGoals: 'Aumentare sicurezza nell\'espressione orale',
          parentFeedback: 'Miglioramenti evidenti a casa',
          behaviorNotes: 'Inizialmente timida, poi più partecipe',
          technicalNotes: 'Introdotte tecniche di biofeedback'
        },
        {
          id: 3,
          date: '2025-05-28',
          duration: 45,
          type: 'Terapia individuale',
          therapist: 'Dr. Rossi',
          score: 82,
          engagement: 80,
          goals: ['Pronuncia R', 'Coordinazione'],
          activities: ['Esercizi oro-motori', 'Canzoni terapeutiche', 'Giochi motori'],
          notes: 'Progressi costanti. Sofia sta acquisendo maggiore controllo articolatorio.',
          homework: 'Canzoni con R, pratica quotidiana',
          nextGoals: 'R in sillabe dirette',
          parentFeedback: 'Famiglia molto collaborativa',
          behaviorNotes: 'Energica, curiosa, impegnata',
          technicalNotes: 'Utilizzato software di analisi vocale'
        }
      ];

      const mockProgress = [
        { date: '2025-01', score: 45, pronunciation: 40, fluency: 35, confidence: 50 },
        { date: '2025-02', score: 55, pronunciation: 50, fluency: 45, confidence: 60 },
        { date: '2025-03', score: 68, pronunciation: 65, fluency: 60, confidence: 70 },
        { date: '2025-04', score: 75, pronunciation: 72, fluency: 70, confidence: 78 },
        { date: '2025-05', score: 85, pronunciation: 82, fluency: 80, confidence: 85 },
        { date: '2025-06', score: 92, pronunciation: 90, fluency: 88, confidence: 92 }
      ];

      const mockNotes = [
        {
          id: 1,
          date: '2025-06-11',
          author: 'Dr. Rossi',
          type: 'Sessione',
          priority: 'normal',
          title: 'Progressi significativi nella pronuncia R',
          content: 'Sofia ha dimostrato eccellenti progressi oggi. La pronuncia della R in posizione iniziale è ora stabile al 90%. Raccomando di continuare con esercizi di consolidamento.',
          tags: ['pronuncia', 'progressi', 'R'],
          attachments: []
        },
        {
          id: 2,
          date: '2025-06-08',
          author: 'Dr. Rossi',
          type: 'Valutazione',
          priority: 'high',
          title: 'Valutazione trimestrale - Risultati eccellenti',
          content: 'Valutazione trimestrale completata. Sofia ha raggiunto tutti gli obiettivi prefissati per questo periodo. Score complessivo: 92%. Raccomando di procedere con il programma avanzato.',
          tags: ['valutazione', 'obiettivi', 'trimestre'],
          attachments: ['valutazione_Q2_2025.pdf']
        },
        {
          id: 3,
          date: '2025-05-30',
          author: 'Dr. Rossi',
          type: 'Famiglia',
          priority: 'normal',
          title: 'Colloquio con i genitori',
          content: 'Incontro positivo con i genitori. Famiglia molto collaborativa e supportiva. Madre riferisce miglioramenti evidenti anche in ambiente domestico e scolastico.',
          tags: ['famiglia', 'colloquio', 'supporto'],
          attachments: []
        },
        {
          id: 4,
          date: '2025-05-15',
          author: 'Dr. Rossi',
          type: 'Medico',
          priority: 'normal',
          title: 'Aggiornamento piano terapeutico',
          content: 'Aggiornato il piano terapeutico in base ai progressi. Obiettivi rivisti al rialzo. Prevista conclusione del percorso per Agosto 2025 con follow-up.',
          tags: ['piano', 'obiettivi', 'aggiornamento'],
          attachments: ['piano_terapeutico_v2.pdf']
        }
      ];

      setPatient(mockPatient);
      setSessionHistory(mockSessions);
      setProgressData(mockProgress);
      setClinicalNotes(mockNotes);
    };

    fetchPatientData();
  }, [patientId]);

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
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'good':
        return <StarIcon className="h-5 w-5" />;
      case 'needs_attention':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getNoteTypeColor = (type) => {
    switch (type) {
      case 'Sessione':
        return 'bg-blue-100 text-blue-800';
      case 'Valutazione':
        return 'bg-purple-100 text-purple-800';
      case 'Famiglia':
        return 'bg-green-100 text-green-800';
      case 'Medico':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case 'normal':
        return <CheckCircleIcon className="h-4 w-4 text-blue-600" />;
      case 'low':
        return <MinusIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note = {
        id: clinicalNotes.length + 1,
        date: new Date().toISOString().split('T')[0],
        author: 'Dr. Corrente',
        type: 'Sessione',
        priority: 'normal',
        title: 'Nota aggiunta',
        content: newNote,
        tags: [],
        attachments: []
      };
      setClinicalNotes([note, ...clinicalNotes]);
      setNewNote('');
      setShowAddNote(false);
    }
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid="patient-profile-loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento profilo paziente...</p>
        </div>
      </div>
    );
  }

  const progressChartData = progressData;
  const pieChartData = [
    { name: 'Pronuncia', value: 90, color: '#10B981' },
    { name: 'Fluidità', value: 88, color: '#3B82F6' },
    { name: 'Confidenza', value: 92, color: '#8B5CF6' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="patient-profile-container">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200" data-testid="patient-profile-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/professional/patients')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                data-testid="back-to-patients-button"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{patient.profileImage}</div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{patient.childName}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{calculateAge(patient.birthDate)} anni</span>
                    <span>•</span>
                    <span>Paziente dal {new Date(patient.registrationDate).toLocaleDateString('it-IT')}</span>
                    <span>•</span>
                    <span>{patient.completedSessions}/{patient.totalSessions} sessioni completate</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(patient.status)}`}>
                {getStatusIcon(patient.status)}
                <span>{getStatusText(patient.status)}</span>
              </div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-outline flex items-center space-x-2"
                data-testid="edit-patient-button"
              >
                <PencilIcon className="h-4 w-4" />
                <span>{isEditing ? 'Annulla' : 'Modifica'}</span>
              </button>
              
              <button className="btn-primary flex items-center space-x-2" data-testid="schedule-session-button">
                <CalendarDaysIcon className="h-4 w-4" />
                <span>Prenota Sessione</span>
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4 flex items-center space-x-4" data-testid="patient-quick-actions">
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
              <PhoneIcon className="h-4 w-4" />
              <span>{patient.parentPhone}</span>
            </button>
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
              <EnvelopeIcon className="h-4 w-4" />
              <span>{patient.parentEmail}</span>
            </button>
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
              <PrinterIcon className="h-4 w-4" />
              <span>Stampa Report</span>
            </button>
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
              <ShareIcon className="h-4 w-4" />
              <span>Condividi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200" data-testid="patient-profile-tabs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Panoramica', icon: EyeIcon },
              { id: 'sessions', label: 'Storico Sessioni', icon: CalendarDaysIcon },
              { id: 'progress', label: 'Progressi', icon: ChartBarIcon },
              { id: 'notes', label: 'Note Cliniche', icon: DocumentTextIcon },
              { id: 'goals', label: 'Obiettivi', icon: TrophyIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="patient-profile-content">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-testid="overview-tab">
            {/* Patient Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Informazioni Paziente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                  <div>
                    <span className="block text-sm font-medium text-gray-700">Nome Completo</span>
                    <p className="mt-1 text-sm text-gray-900">{patient.childName}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Data di Nascita</span>
                    <p className="mt-1 text-sm text-gray-900">{new Date(patient.birthDate).toLocaleDateString('it-IT')}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Genitore/Tutore</span>
                    <p className="mt-1 text-sm text-gray-900">{patient.parentName}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Contatto Emergenza</span>
                    <p className="mt-1 text-sm text-gray-900">{patient.emergencyContact}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="block text-sm font-medium text-gray-700">Indirizzo</span>
                    <p className="mt-1 text-sm text-gray-900">{patient.address}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HeartIcon className="h-5 w-5 mr-2" />
                  Informazioni Mediche
                </h3>
                <div className="space-y-4">                  <div>
                    <span className="block text-sm font-medium text-gray-700">Diagnosi Iniziale</span>
                    <p className="mt-1 text-sm text-gray-900">{patient.initialDiagnosis}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Diagnosi Attuale</span>
                    <p className="mt-1 text-sm text-gray-900">{patient.currentDiagnosis}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Note Mediche</span>
                    <p className="mt-1 text-sm text-gray-900">{patient.medicalNotes}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Inviato da</span>
                    <p className="mt-1 text-sm text-gray-900">{patient.referredBy}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              {/* Current Status */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Attuale</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">{patient.score}%</div>
                    <div className="text-sm text-gray-600">Punteggio Generale</div>
                    <div className="text-sm text-green-600 font-medium">{patient.improvement} miglioramento</div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Pronuncia</span>
                      <span className="text-sm font-medium">90%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Fluidità</span>
                      <span className="text-sm font-medium">88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Confidenza</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessioni</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completate</span>
                    <span className="text-sm font-medium">{patient.completedSessions}/{patient.totalSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frequenza</span>
                    <span className="text-sm font-medium">{patient.sessionFrequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ultima</span>
                    <span className="text-sm font-medium">{new Date(patient.lastSession).toLocaleDateString('it-IT')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Prossima</span>
                    <span className="text-sm font-medium">{new Date(patient.nextAppointment).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
              </div>

              {/* Parent Satisfaction */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Soddisfazione Famiglia</h3>
                <div className="text-center">
                  <div className="flex justify-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-6 w-6 ${
                          star <= patient.parentSatisfaction 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{patient.parentSatisfaction}/5</div>
                  <div className="text-sm text-gray-600">Valutazione media</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6" data-testid="sessions-tab">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Storico Sessioni</h3>
              <button className="btn-primary flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Nuova Sessione</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {sessionHistory.map((session) => (
                <div key={session.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{session.type}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString('it-IT')} • {session.duration} minuti • {session.therapist}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">{session.score}%</div>
                      <div className="text-sm text-gray-600">Punteggio</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Obiettivi Sessione</h5>                      <ul className="text-sm text-gray-600 space-y-1">
                        {session.goals.map((goal) => (
                          <li key={`goal-${session.id}-${goal}`} className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Attività Svolte</h5>                      <ul className="text-sm text-gray-600 space-y-1">
                        {session.activities.map((activity) => (
                          <li key={`activity-${session.id}-${activity}`} className="flex items-center">
                            <PlayIcon className="h-4 w-4 text-blue-500 mr-2" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Note della Sessione</h5>
                    <p className="text-sm text-gray-600 mb-3">{session.notes}</p>
                    
                    {session.homework && (
                      <div className="mb-3">
                        <h6 className="font-medium text-gray-700 text-sm">Compiti per Casa</h6>
                        <p className="text-sm text-gray-600">{session.homework}</p>
                      </div>
                    )}
                    
                    {session.parentFeedback && (
                      <div>
                        <h6 className="font-medium text-gray-700 text-sm">Feedback Famiglia</h6>
                        <p className="text-sm text-gray-600">{session.parentFeedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6" data-testid="progress-tab">
            <h3 className="text-lg font-semibold text-gray-900">Analisi Progressi</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Progressi nel Tempo</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} name="Punteggio Generale" />
                    <Line type="monotone" dataKey="pronunciation" stroke="#10B981" strokeWidth={2} name="Pronuncia" />
                    <Line type="monotone" dataKey="fluency" stroke="#8B5CF6" strokeWidth={2} name="Fluidità" />
                    <Line type="monotone" dataKey="confidence" stroke="#F59E0B" strokeWidth={2} name="Confidenza" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Skill Distribution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Distribuzione Competenze</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>                <div className="mt-4 space-y-2">
                  {pieChartData.map((item) => (
                    <div key={`legend-${item.name}`} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6" data-testid="notes-tab">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Note Cliniche</h3>
              <button
                onClick={() => setShowAddNote(true)}
                className="btn-primary flex items-center space-x-2"
                data-testid="add-note-button"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Aggiungi Nota</span>
              </button>
            </div>

            {showAddNote && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-testid="add-note-form">
                <h4 className="font-medium text-gray-900 mb-4">Nuova Nota Clinica</h4>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Scrivi qui la tua nota..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="flex items-center justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowAddNote(false)}
                    className="btn-outline"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleAddNote}
                    className="btn-primary"
                  >
                    Salva Nota
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {clinicalNotes.map((note) => (
                <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getNoteTypeColor(note.type)}`}>
                        {note.type}
                      </span>
                      {getPriorityIcon(note.priority)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(note.date).toLocaleDateString('it-IT')} • {note.author}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{note.title}</h4>
                  <p className="text-gray-600 mb-3">{note.content}</p>
                    {note.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      {note.tags.map((tag) => (
                        <span key={`tag-${note.id}-${tag}`} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {note.attachments.length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Allegati</h6>                      <div className="space-y-1">
                        {note.attachments.map((attachment) => (
                          <div key={`attachment-${note.id}-${attachment}`} className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                            <DocumentTextIcon className="h-4 w-4 mr-2" />
                            <span className="cursor-pointer">{attachment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6" data-testid="goals-tab">
            <h3 className="text-lg font-semibold text-gray-900">Obiettivi Terapeutici</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Short Term Goals */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Obiettivi Settimanali
                </h4>
                <p className="text-gray-600 text-sm mb-4">{patient.weeklyGoals}</p>                <div className="space-y-2">
                  {patient.therapyGoals.map((goal) => (
                    <div key={`therapy-goal-${goal}`} className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medium Term Goals */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Obiettivi Mensili
                </h4>
                <p className="text-gray-600 text-sm">{patient.monthlyGoals}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>

              {/* Long Term Goals */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrophyIcon className="h-5 w-5 mr-2 text-yellow-600" />
                  Obiettivi a Lungo Termine
                </h4>
                <p className="text-gray-600 text-sm">{patient.longTermGoals}</p>
                <div className="mt-4 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Data inizio:</span>
                    <span className="ml-2 font-medium">{new Date(patient.therapyStartDate).toLocaleDateString('it-IT')}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Data prevista fine:</span>
                    <span className="ml-2 font-medium">{new Date(patient.estimatedEndDate).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
