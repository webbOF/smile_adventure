import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  TrophyIcon, 
  CalendarIcon, 
  ChartBarIcon,  PencilIcon,
  CameraIcon,
  DocumentTextIcon,
  EyeIcon,
  CogIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
  InformationCircleIcon,
  PlusIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

// Import Common Components
import {
  LoadingSpinner,
  FormModal
} from '../common';

// Import Services
import { userService } from '../../services';
import SessionManager from './SessionManager';

const ChildProfile = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showSensoryModal, setShowSensoryModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [newNote, setNewNote] = useState({ category: 'general', note: '' });
  // Form setup
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  
  // Fetch child data
  useEffect(() => {
    const fetchChildData = async () => {
      try {
        setLoading(true);
        const childData = await userService.getChild(childId);
        setChild(childData);
        reset(childData); // Initialize form with existing data
      } catch (error) {
        console.error('Error fetching child data:', error);
        toast.error('Errore nel caricamento del profilo bambino');
        navigate('/parent');
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      fetchChildData();
    }
  }, [childId, navigate, reset]);

  // Handle photo upload
  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Il file deve essere inferiore a 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Seleziona un file immagine valido');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setShowPhotoModal(true);
    }
  }, []);

  // Save photo
  const handleSavePhoto = useCallback(async () => {
    if (!photoFile) return;
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', photoFile);
      
      await userService.uploadAvatar(formData);
      const updatedChild = await userService.getChild(childId);
      setChild(updatedChild);
      setShowPhotoModal(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      toast.success('Foto profilo aggiornata con successo!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Errore nel caricamento della foto');
    } finally {
      setLoading(false);
    }
  }, [photoFile, childId]);

  // Update child profile
  const onSubmit = useCallback(async (data) => {
    try {
      const updatedChild = await userService.updateChild(childId, data);
      setChild(updatedChild);
      setEditMode(false);
      toast.success('Profilo aggiornato con successo!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Errore nell\'aggiornamento del profilo');
    }
  }, [childId]);

  // Save sensory profile
  const handleSaveSensoryProfile = useCallback(async (sensoryData) => {
    try {
      const updatedChild = await userService.updateChildSensoryProfile(childId, sensoryData);
      setChild(updatedChild);
      setShowSensoryModal(false);
      toast.success('Profilo sensoriale aggiornato con successo!');
    } catch (error) {
      console.error('Error updating sensory profile:', error);
      toast.error('Errore nell\'aggiornamento del profilo sensoriale');
    }
  }, [childId]);

  // Add behavioral note
  const handleAddNote = useCallback(async () => {
    if (!newNote.note.trim()) return;
    
    try {
      const noteData = {
        ...newNote,
        date: new Date().toISOString(),
        author: 'Genitore'
      };
      
      const updatedChild = await userService.addBehavioralNote(childId, noteData);
      setChild(updatedChild);
      setNewNote({ category: 'general', note: '' });
      setShowNotesModal(false);
      toast.success('Nota aggiunta con successo!');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Errore nell\'aggiunta della nota');
    }
  }, [childId, newNote]);
  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Non specificata';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anni`;
  };

  // Helper functions for translations
  const getDomainDisplayName = (domain) => {
    const translations = {
      auditory: 'Uditivo',
      visual: 'Visivo',
      tactile: 'Tattile',
      vestibular: 'Vestibolare',
      proprioceptive: 'Propriocettivo'
    };
    return translations[domain] || domain;
  };

  const getSensitivityDisplayName = (sensitivity) => {
    const translations = {
      high: 'Alta',
      moderate: 'Moderata',
      low: 'Bassa'
    };
    return translations[sensitivity] || sensitivity;
  };

  const getSensitivityClassName = (sensitivity) => {
    const classNames = {
      high: 'bg-red-100 text-red-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return classNames[sensitivity] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryDisplayName = (category) => {
    const translations = {
      social_interaction: 'Interazione Sociale',
      sensory: 'Sensoriale',
      communication: 'Comunicazione',
      behavioral: 'Comportamentale',
      general: 'Generale'
    };
    return translations[category] || 'Generale';
  };

  const getCategoryClassName = (category) => {
    const classNames = {
      social_interaction: 'bg-blue-100 text-blue-800',
      sensory: 'bg-purple-100 text-purple-800',
      communication: 'bg-green-100 text-green-800',
      behavioral: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return classNames[category] || 'bg-gray-100 text-gray-800';
  };

  const getTherapyDisplayName = (therapyType) => {
    const translations = {
      speech_therapy: 'Logopedia',
      occupational_therapy: 'Terapia Occupazionale',
      behavioral_therapy: 'Terapia Comportamentale'
    };
    return translations[therapyType] || therapyType;
  };

  const getSensoryDomainDisplayName = (domain) => {
    const translations = {
      auditory: 'Sensibilità Uditiva',
      visual: 'Sensibilità Visiva',
      tactile: 'Sensibilità Tattile',
      vestibular: 'Sensibilità Vestibolare',
      proprioceptive: 'Sensibilità Propriocettiva'
    };
    return translations[domain] || domain;
  };

  const getFrequencyDisplayName = (frequency) => {
    const translations = {
      weekly: 'Settimanale',
      '2x_weekly': '2x Settimanale',
      biweekly: 'Bisettimanale'
    };
    return translations[frequency] || frequency;
  };

  // Mock data for development (will be replaced with real API data)
  const mockChild = {
    id: childId,
    name: 'Sofia Rossi',
    age: 6,
    dateOfBirth: '2018-03-15',
    avatar: '👧',
    avatarUrl: null,
    level: 5,
    points: 320,
    streak: 7,
    totalSessions: 45,
    completedActivities: 123,
    favoriteActivity: 'Quiz sui Denti',
    joinDate: '2025-03-15',
    // ASD specific data
    diagnosis: 'Disturbo dello Spettro Autistico - Livello 1',
    supportLevel: 1,
    diagnosisDate: '2023-01-15',
    diagnosingProfessional: 'Dr. Mario Bianchi - Neuropsichiatra Infantile',
    communicationStyle: 'verbal',
    communicationNotes: 'Buone capacità verbali, difficoltà nelle conversazioni sociali',
    behavioralNotes: [
      {
        date: '2025-06-10',
        category: 'social_interaction',
        note: 'Buon miglioramento nell\'interazione durante il gioco strutturato',
        author: 'Genitore'
      },
      {
        date: '2025-06-08',
        category: 'sensory',
        note: 'Sensibilità ridotta ai rumori forti con l\'uso delle cuffie',
        author: 'Terapista'
      }
    ],
    sensoryProfile: {
      auditory: {
        sensitivity: 'high',
        triggers: ['loud_noises', 'sudden_sounds', 'background_music'],
        accommodations: ['noise_cancelling_headphones', 'quiet_spaces', 'warning_before_loud_sounds'],
        preferences: ['soft_music', 'nature_sounds']
      },
      visual: {
        sensitivity: 'moderate',
        triggers: ['bright_lights', 'flashing_lights'],
        accommodations: ['dim_lighting', 'sunglasses_indoors'],
        preferences: ['natural_light', 'soft_colors']
      },
      tactile: {
        sensitivity: 'low',
        triggers: [],
        accommodations: [],
        preferences: ['soft_textures', 'weighted_blanket']
      },
      vestibular: {
        sensitivity: 'low',
        triggers: [],
        accommodations: [],
        preferences: ['swinging', 'spinning_chair']
      },
      proprioceptive: {
        sensitivity: 'moderate',
        triggers: [],
        accommodations: ['heavy_work_activities'],
        preferences: ['jumping', 'carrying_heavy_objects']
      }
    },
    currentTherapies: [
      {
        type: 'speech_therapy',
        provider: 'Centro Terapie Milano',
        frequency: 'weekly',
        startDate: '2023-02-01',
        goals: ['Miglioramento conversazione sociale', 'Comprensione pragmatica']
      },
      {
        type: 'occupational_therapy',
        provider: 'Studio OT Bambini',
        frequency: '2x_weekly',
        startDate: '2023-01-20',
        goals: ['Integrazione sensoriale', 'Autonomie quotidiane']
      }
    ],
    emergencyContacts: [
      {
        name: 'Anna Rossi',
        relationship: 'mother',
        phone: '+39 333 123 4567',
        isPrimary: true
      },
      {
        name: 'Marco Rossi',
        relationship: 'father', 
        phone: '+39 334 123 4567',
        isPrimary: false
      }
    ],
    safetyProtocols: {
      elopementRisk: 'low',
      medicalConditions: [],
      medications: [],
      emergencyProcedures: ['Stay calm', 'Use visual schedule', 'Offer sensory break'],
      calmingStrategies: ['Deep breathing', 'Counting to 10', 'Favorite toy', 'Quiet space']
    }
  };

  // Use mock data if real data not available
  const displayChild = child || mockChild;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  // Tab navigation
  const tabs = [
    { id: 'overview', name: 'Panoramica', icon: EyeIcon },
    { id: 'sessions', name: 'Sessioni', icon: PlayIcon },
    { id: 'asd', name: 'Info ASD', icon: InformationCircleIcon },
    { id: 'sensory', name: 'Profilo Sensoriale', icon: AdjustmentsHorizontalIcon },
    { id: 'behavioral', name: 'Note Comportamentali', icon: DocumentTextIcon },
    { id: 'therapies', name: 'Terapie', icon: HeartIcon }
  ];

  // Render overview tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="dental-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Informazioni Personali</h3>
          <button 
            onClick={() => setEditMode(!editMode)}
            className="btn-outline flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>{editMode ? 'Annulla' : 'Modifica'}</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="child-name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              {editMode ? (
                <input
                  id="child-name"
                  {...register('name', { required: 'Nome richiesto' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  defaultValue={displayChild.name}
                />
              ) : (
                <p className="text-gray-900">{displayChild.name}</p>
              )}
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            
            <div>
              <label htmlFor="child-birth-date" className="block text-sm font-medium text-gray-700 mb-1">Data di Nascita</label>
              {editMode ? (
                <input
                  id="child-birth-date"
                  {...register('dateOfBirth')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  defaultValue={displayChild.dateOfBirth}
                />
              ) : (
                <p className="text-gray-900">{calculateAge(displayChild.dateOfBirth)}</p>
              )}
            </div>
          </div>

          {editMode && (
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="btn-outline"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="game-button"
              >
                {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="dental-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Punti Totali</h3>
            <TrophyIcon className="h-6 w-6 text-secondary-500" />
          </div>
          <p className="text-3xl font-bold text-primary-600 mb-2">{displayChild.points}</p>
          <p className="text-sm text-gray-600">+50 punti oggi</p>
        </div>

        <div className="dental-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Giorni Consecutivi</h3>
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-3xl font-bold text-orange-600 mb-2">{displayChild.streak}</p>
          <p className="text-sm text-gray-600">Record personale!</p>
        </div>

        <div className="dental-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sessioni Totali</h3>
            <CalendarIcon className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">{displayChild.totalSessions}</p>
          <p className="text-sm text-gray-600">Dal {new Date(displayChild.joinDate).toLocaleDateString('it-IT')}</p>
        </div>

        <div className="dental-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Attività Completate</h3>
            <ChartBarIcon className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600 mb-2">{displayChild.completedActivities}</p>
          <p className="text-sm text-gray-600">Attività preferita: {displayChild.favoriteActivity}</p>
        </div>
      </div>
    </div>
  );

  // Render ASD info tab
  const renderASDTab = () => (
    <div className="space-y-6">
      <div className="dental-card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Informazioni ASD</h3>        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Diagnosi</span>
            <p className="text-gray-900">{displayChild.diagnosis}</p>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Livello di Supporto</span>
            <p className="text-gray-900">Livello {displayChild.supportLevel}</p>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Data Diagnosi</span>
            <p className="text-gray-900">{new Date(displayChild.diagnosisDate).toLocaleDateString('it-IT')}</p>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Professionista</span>
            <p className="text-gray-900">{displayChild.diagnosingProfessional}</p>
          </div>
          <div className="md:col-span-2">
            <span className="block text-sm font-medium text-gray-700 mb-1">Stile di Comunicazione</span>
            <p className="text-gray-900">{displayChild.communicationNotes}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render sensory profile tab
  const renderSensoryTab = () => (
    <div className="space-y-6">
      <div className="dental-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Profilo Sensoriale</h3>
          <button 
            onClick={() => setShowSensoryModal(true)}
            className="btn-outline flex items-center space-x-2"
          >
            <CogIcon className="h-4 w-4" />
            <span>Modifica</span>
          </button>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(displayChild.sensoryProfile).map(([domain, data]) => (
            <div key={domain} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                {getDomainDisplayName(domain)}
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Sensibilità: </span>
                  <span className={`text-sm px-2 py-1 rounded ${getSensitivityClassName(data.sensitivity)}`}>
                    {getSensitivityDisplayName(data.sensitivity)}
                  </span>
                </div>
                {data.triggers.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Trigger: </span>
                    <span className="text-sm text-gray-700">{data.triggers.join(', ')}</span>
                  </div>
                )}
                {data.preferences.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Preferenze: </span>
                    <span className="text-sm text-gray-700">{data.preferences.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render behavioral notes tab
  const renderBehavioralTab = () => (
    <div className="space-y-6">
      <div className="dental-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Note Comportamentali</h3>
          <button 
            onClick={() => setShowNotesModal(true)}
            className="btn-outline flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Aggiungi Nota</span>
          </button>
        </div>
          <div className="space-y-4">
          {displayChild.behavioralNotes.map((note, index) => (
            <div key={`note-${note.date}-${index}`} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded ${getCategoryClassName(note.category)}`}>
                  {getCategoryDisplayName(note.category)}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(note.date).toLocaleDateString('it-IT')} • {note.author}
                </span>
              </div>
              <p className="text-gray-700">{note.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render therapies tab
  const renderTherapiesTab = () => (
    <div className="space-y-6">
      <div className="dental-card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Terapie Attuali</h3>        <div className="space-y-4">
          {displayChild.currentTherapies.map((therapy, index) => (
            <div key={`therapy-${therapy.type}-${index}`} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">
                  {getTherapyDisplayName(therapy.type)}
                </h4>
                <span className="text-sm text-gray-500">
                  {getFrequencyDisplayName(therapy.frequency)}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{therapy.provider}</p>
              <div>
                <span className="text-sm font-medium text-gray-600">Obiettivi: </span>
                <span className="text-sm text-gray-700">{therapy.goals.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const achievements = [
    { id: 1, name: 'Prima Vittoria', icon: '🏆', earned: true },
    { id: 2, name: 'Streak di 7 giorni', icon: '🔥', earned: true },
    { id: 3, name: 'Esperto del Filo', icon: '🦷', earned: true },
    { id: 4, name: 'Super Spazzolino', icon: '⭐', earned: false },
    { id: 5, name: 'Campione del Mese', icon: '👑', earned: false },
    { id: 6, name: 'Denti Perfetti', icon: '✨', earned: false },
  ];

  const recentActivities = [
    { id: 1, activity: 'Spazzolatura Mattutina', date: '2025-01-25', duration: '3 min', points: 15 },
    { id: 2, activity: 'Quiz sul Filo Dentale', date: '2025-01-24', duration: '5 min', points: 25 },
    { id: 3, activity: 'Gioco Memory Denti', date: '2025-01-23', duration: '8 min', points: 30 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            to="/parent" 
            className="mr-4 p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </Link>
          <div className="flex items-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-3xl mr-6">
                {displayChild.avatarUrl ? (
                  <img 
                    src={displayChild.avatarUrl} 
                    alt={displayChild.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  displayChild.avatar
                )}
              </div>
              <button
                onClick={() => document.getElementById('photo-input').click()}
                className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <CameraIcon className="h-4 w-4 text-gray-600" />
              </button>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Profilo di {displayChild.name}
              </h1>
              <p className="text-gray-600">{displayChild.age} anni • Livello {displayChild.level}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'sessions' && (
            <div className="session-manager-embedded">
              <SessionManager />
            </div>
          )}
          {activeTab === 'asd' && renderASDTab()}
          {activeTab === 'sensory' && renderSensoryTab()}
          {activeTab === 'behavioral' && renderBehavioralTab()}
          {activeTab === 'therapies' && renderTherapiesTab()}
        </div>

        {/* Sidebar for Overview Tab */}
        {activeTab === 'overview' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">              {/* Recent Activities */}
              <div className="dental-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Attività Recenti</h3>
                  <button 
                    onClick={() => setActiveTab('sessions')}
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Vedi tutte le sessioni →
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.activity}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(activity.date).toLocaleDateString('it-IT')} • {activity.duration}
                        </p>
                      </div>
                      <div className="score-badge">
                        +{activity.points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Chart Placeholder */}
              <div className="dental-card p-6 mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Progresso Settimanale</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Grafico dei progressi</p>
                    <p className="text-sm">(Implementazione in corso)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">              {/* Quick Actions */}
              <div className="dental-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
                <div className="space-y-3">
                  <Link 
                    to={`/parent/game/${displayChild.id}`}
                    className="w-full game-button text-center block"
                  >
                    🎮 Inizia una Sessione
                  </Link>
                  <button 
                    onClick={() => setActiveTab('sessions')}
                    className="w-full btn-outline"
                  >
                    📊 Gestisci Sessioni
                  </button>
                  <button 
                    onClick={() => setActiveTab('asd')}
                    className="w-full btn-outline"
                  >
                    ⚙️ Gestisci Profilo ASD
                  </button>
                </div>
              </div>

              {/* Achievements */}
              <div className="dental-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Obiettivi e Badge</h3>
                <div className="grid grid-cols-3 gap-3">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`text-center p-3 rounded-lg transition-all ${
                        achievement.earned 
                          ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300' 
                          : 'bg-gray-100 opacity-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <p className="text-xs font-medium text-gray-700">{achievement.name}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full btn-outline mt-4 text-sm">
                  Vedi Tutti gli Obiettivi
                </button>
              </div>

              {/* Level Progress */}
              <div className="dental-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso di Livello</h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary-600">Livello {displayChild.level}</div>
                  <p className="text-sm text-gray-600">80/100 punti per il livello successivo</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Ancora 20 punti per il Livello 6!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <FormModal
          isOpen={showPhotoModal}
          onClose={() => {
            setShowPhotoModal(false);
            setPhotoFile(null);
            setPhotoPreview(null);
          }}
          title="Aggiorna Foto Profilo"
          onSubmit={handleSavePhoto}
        >
          <div className="space-y-4">
            {photoPreview && (
              <div className="text-center">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary-200"
                />
              </div>
            )}
            <div className="text-center">
              <p className="text-gray-600">Anteprima della nuova foto profilo</p>
            </div>
          </div>
        </FormModal>
      )}

      {/* Sensory Profile Modal */}
      {showSensoryModal && (
        <FormModal
          isOpen={showSensoryModal}
          onClose={() => setShowSensoryModal(false)}
          title="Modifica Profilo Sensoriale"
          onSubmit={() => handleSaveSensoryProfile(displayChild.sensoryProfile)}
        >
          <div className="space-y-6">
            <p className="text-gray-600">
              Configura le sensibilità sensoriali di {displayChild.name} per personalizzare l'esperienza di gioco.
            </p>            {Object.entries(displayChild.sensoryProfile).map(([domain, data]) => (
              <div key={domain} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                  {getSensoryDomainDisplayName(domain)}
                </h4><div className="space-y-3">
                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">
                      Livello di Sensibilità
                    </span>
                    <div className="flex space-x-3">
                      {['low', 'moderate', 'high'].map((level) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="radio"
                            name={`${domain}-sensitivity`}
                            value={level}
                            defaultChecked={data.sensitivity === level}
                            className="mr-2"
                          />
                          <span className="text-sm">
                            {getSensitivityDisplayName(level)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FormModal>
      )}

      {/* Behavioral Notes Modal */}
      {showNotesModal && (
        <FormModal
          isOpen={showNotesModal}
          onClose={() => {
            setShowNotesModal(false);
            setNewNote({ category: 'general', note: '' });
          }}
          title="Aggiungi Nota Comportamentale"
          onSubmit={handleAddNote}
        >          <div className="space-y-4">
            <div>
              <label htmlFor="note-category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                id="note-category"
                value={newNote.category}
                onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="general">Generale</option>
                <option value="social_interaction">Interazione Sociale</option>
                <option value="sensory">Sensoriale</option>
                <option value="communication">Comunicazione</option>
                <option value="behavioral">Comportamentale</option>
              </select>
            </div>
            <div>
              <label htmlFor="note-text" className="block text-sm font-medium text-gray-700 mb-2">
                Nota
              </label>
              <textarea
                id="note-text"
                value={newNote.note}
                onChange={(e) => setNewNote({...newNote, note: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descrivi il comportamento osservato, i progressi o le sfide..."
              />
            </div>
          </div>
        </FormModal>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

// Custom styles for embedded SessionManager
const sessionManagerStyles = `
  .session-manager-embedded .header-navigation {
    display: none !important;
  }
  .session-manager-embedded .min-h-screen {
    min-height: auto !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = sessionManagerStyles;
  if (!document.head.querySelector('style[data-session-manager-embedded]')) {
    styleElement.setAttribute('data-session-manager-embedded', 'true');
    document.head.appendChild(styleElement);
  }
}

export default ChildProfile;
