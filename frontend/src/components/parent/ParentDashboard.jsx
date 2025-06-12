import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useChildren, useChildActivities } from '../../hooks/useApiServices';
import { 
  PlusIcon, 
  UserIcon, 
  TrophyIcon,
  ChartBarIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';

const ParentDashboard = () => {
  const { user } = useAuthStore();
  const { children, isLoading: childrenLoading, createChild, isCreating } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState(null);
  
  // Get activities for the first child (or selected child)
  const firstChildId = children.length > 0 ? children[0].id : null;
  const { activities: recentActivities = [] } = useChildActivities(
    selectedChildId || firstChildId, 
    { limit: 5, status: 'completed' }
  );

  // Fallback to mock data if API is not available
  const mockChildren = [
    {
      id: 1,
      name: 'Sofia',
      age: 6,
      avatar: '👧',
      level: 5,
      totalPoints: 320,
      currentStreak: 7,
      lastActivityDate: '2025-06-11',
    },
    {
      id: 2,
      name: 'Marco',
      age: 8,
      avatar: '👦',
      level: 3,
      totalPoints: 180,
      currentStreak: 3,
      lastActivityDate: '2025-06-10',
    },
  ];

  const mockActivities = [
    {
      id: 1,
      title: 'Routine mattutina completata',
      pointsReward: 50,
      completedAt: '2025-06-11T08:00:00Z',
      child: { name: 'Sofia' },
    },
    {
      id: 2,
      title: 'Quiz sui denti superato',
      pointsReward: 30,
      completedAt: '2025-06-11T10:30:00Z',
      child: { name: 'Marco' },
    },
  ];

  // Use real data if available, otherwise use mock data
  const displayChildren = children.length > 0 ? children : mockChildren;
  const displayActivities = recentActivities.length > 0 ? recentActivities : mockActivities;

  // Helper function to format activity data
  const formatActivity = (activity) => {
    if (activity.child?.name) {
      return {
        id: activity.id,
        childName: activity.child.name,
        activity: activity.title,
        points: activity.pointsReward,
        timestamp: formatTimestamp(activity.completedAt),
      };
    }
    return activity;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Pochi minuti fa';
    if (diffInHours < 24) return `${diffInHours} ore fa`;
    return `${Math.floor(diffInHours / 24)} giorni fa`;
  };
  const formattedActivities = displayActivities.map(formatActivity);

  if (childrenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Ciao {user?.firstName || user?.first_name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Ecco come stanno andando i tuoi piccoli campioni dell'igiene dentale!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bambini Registrati</p>
                <p className="text-2xl font-bold text-gray-900">{displayChildren.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <TrophyIcon className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Punti Totali</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayChildren.reduce((total, child) => total + (child.totalPoints || child.points || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Streak Massimo</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...displayChildren.map(child => child.currentStreak || child.streak || 0))} giorni
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attività Oggi</p>
                <p className="text-2xl font-bold text-gray-900">{formattedActivities.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Children Cards */}
          <div className="lg:col-span-2">            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-900">
                I Tuoi Bambini
              </h2>
              <button 
                className="btn-primary disabled:opacity-50"
                disabled={isCreating}
                onClick={() => {
                  // TODO: Open create child modal
                  console.log('Create child clicked');
                }}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {isCreating ? 'Creazione...' : 'Aggiungi Bambino'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayChildren.map((child) => (
                <div key={child.id} className="dental-card hover:shadow-dental-glow transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-2xl">
                        {child.avatar || '👶'}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold text-gray-900">{child.name}</h3>
                        <p className="text-gray-600">{child.age} anni</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="score-badge text-sm">
                        Lv. {child.level || 1}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-600">
                        {child.totalPoints || child.points || 0}
                      </p>
                      <p className="text-sm text-gray-600">Punti</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {child.currentStreak || child.streak || 0}
                      </p>
                      <p className="text-sm text-gray-600">Giorni di fila</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link 
                      to={`/parent/child/${child.id}`}
                      className="flex-1 btn-outline text-center"
                    >
                      Vedi Profilo
                    </Link>
                    <Link 
                      to={`/parent/game/${child.id}`}
                      className="flex-1 game-button text-center"
                    >
                      🎮 Gioca
                    </Link>
                  </div>
                </div>
              ))}

              {/* Add Child Card */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary-400 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <PlusIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aggiungi un nuovo bambino
                </h3>
                <p className="text-gray-500 text-sm">
                  Crea un profilo per iniziare l'avventura!
                </p>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              Attività Recenti
            </h2>            <div className="space-y-4">
              {formattedActivities.map((activity) => (
                <div key={activity.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{activity.childName}</h4>
                    <span className="score-badge text-xs">
                      +{activity.points}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{activity.activity}</p>
                  <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                </div>
              ))}

              {formattedActivities.length === 0 && (
                <div className="card p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Nessuna attività recente
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Le attività dei tuoi bambini appariranno qui!
                  </p>
                </div>
              )}

              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrophyIcon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Sfida della Settimana
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Completa 7 routine di igiene dentale per vincere un badge speciale!
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">4/7 completate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
