import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, TrophyIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const ChildProfile = () => {
  const { childId } = useParams();
  
  // Mock data - this will be replaced with real API calls
  const child = {
    id: childId,
    name: 'Sofia',
    age: 6,
    avatar: '👧',
    level: 5,
    points: 320,
    streak: 7,
    totalSessions: 45,
    completedActivities: 123,
    favoriteActivity: 'Quiz sui Denti',
    joinDate: '2025-03-15',
  };

  const recentActivities = [
    {
      id: 1,
      date: '2025-06-11',
      activity: 'Routine mattutina completata',
      points: 50,
      duration: '5 min',
    },
    {
      id: 2,
      date: '2025-06-10',
      activity: 'Quiz sui denti superato',
      points: 30,
      duration: '3 min',
    },
    {
      id: 3,
      date: '2025-06-10',
      activity: 'Routine serale completata',
      points: 50,
      duration: '5 min',
    },
  ];

  const achievements = [
    { id: 1, name: 'Prima Vittoria', icon: '🏆', earned: true },
    { id: 2, name: 'Streak di 7 giorni', icon: '🔥', earned: true },
    { id: 3, name: 'Esperto del Filo', icon: '🦷', earned: true },
    { id: 4, name: 'Super Spazzolino', icon: '⭐', earned: false },
    { id: 5, name: 'Campione del Mese', icon: '👑', earned: false },
    { id: 6, name: 'Denti Perfetti', icon: '✨', earned: false },
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
            <div className="w-20 h-20 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-3xl mr-6">
              {child.avatar}
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Profilo di {child.name}
              </h1>
              <p className="text-gray-600">{child.age} anni • Livello {child.level}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="dental-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Punti Totali</h3>
                  <TrophyIcon className="h-6 w-6 text-secondary-500" />
                </div>
                <p className="text-3xl font-bold text-primary-600 mb-2">{child.points}</p>
                <p className="text-sm text-gray-600">+50 punti oggi</p>
              </div>

              <div className="dental-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Giorni Consecutivi</h3>
                  <span className="text-2xl">🔥</span>
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-2">{child.streak}</p>
                <p className="text-sm text-gray-600">Record personale!</p>
              </div>

              <div className="dental-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sessioni Totali</h3>
                  <CalendarIcon className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">{child.totalSessions}</p>
                <p className="text-sm text-gray-600">Dal {new Date(child.joinDate).toLocaleDateString('it-IT')}</p>
              </div>

              <div className="dental-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Attività Completate</h3>
                  <ChartBarIcon className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-2">{child.completedActivities}</p>
                <p className="text-sm text-gray-600">Attività preferita: {child.favoriteActivity}</p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Attività Recenti</h3>
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
            <div className="card p-6">
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
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
              <div className="space-y-3">
                <Link 
                  to={`/parent/game/${child.id}`}
                  className="w-full game-button text-center block"
                >
                  🎮 Inizia una Sessione
                </Link>
                <button className="w-full btn-outline">
                  📊 Vedi Report Completo
                </button>
                <button className="w-full btn-outline">
                  ⚙️ Modifica Profilo
                </button>
              </div>
            </div>

            {/* Achievements */}
            <div className="card p-6">
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
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso di Livello</h3>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary-600">Livello {child.level}</div>
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
      </div>
    </div>
  );
};

export default ChildProfile;
