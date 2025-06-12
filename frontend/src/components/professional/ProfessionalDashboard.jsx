import React from 'react';
import { useAuthStore } from '../../hooks/useAuthStore';
import { 
  UserGroupIcon, 
  ChartBarIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon 
} from '@heroicons/react/24/outline';

const ProfessionalDashboard = () => {
  const { user } = useAuthStore();

  // Mock data - this will be replaced with real API calls
  const stats = {
    totalPatients: 45,
    activeChildren: 28,
    completedSessions: 156,
    averageScore: 87,
    thisWeekSessions: 12,
    improvementRate: 23,
  };

  const recentPatients = [
    {
      id: 1,
      childName: 'Sofia Rossi',
      age: 6,
      parentName: 'Maria Rossi',
      lastSession: '2025-06-11',
      score: 92,
      improvement: '+15%',
      status: 'excellent',
    },
    {
      id: 2,
      childName: 'Marco Bianchi',
      age: 8,
      parentName: 'Giuseppe Bianchi',
      lastSession: '2025-06-10',
      score: 78,
      improvement: '+8%',
      status: 'good',
    },
    {
      id: 3,
      childName: 'Giulia Verdi',
      age: 5,
      parentName: 'Anna Verdi',
      lastSession: '2025-06-09',
      score: 65,
      improvement: '+3%',
      status: 'needs_attention',
    },
  ];

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Benvenuto Dr. {user?.last_name}! 🦷
          </h1>
          <p className="text-gray-600 mt-2">
            Dashboard professionale per il monitoraggio dei pazienti pediatrici
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pazienti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bambini Attivi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeChildren}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessioni Completate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <StarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Punteggio Medio</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessioni Questa Settimana</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisWeekSessions}</p>
              </div>
            </div>
          </div>          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasso di Miglioramento</p>
                <p className="text-2xl font-bold text-gray-900">+{stats.improvementRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Patients */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-900">
                Pazienti Recenti
              </h2>
              <button className="btn-primary">
                Vedi Tutti
              </button>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paziente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ultima Sessione
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punteggio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miglioramento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stato
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient.childName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.age} anni • {patient.parentName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(patient.lastSession).toLocaleDateString('it-IT')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.score}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-600">
                            {patient.improvement}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                            {getStatusText(patient.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Reports & Tasks */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pending Reports */}
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                Report in Sospeso
              </h2>

              <div className="space-y-4">
                {pendingReports.map((report) => (
                  <div key={report.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{report.childName}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                        {report.priority === 'high' ? 'Alta' : report.priority === 'medium' ? 'Media' : 'Bassa'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.type}</p>
                    <p className="text-xs text-gray-500">
                      Scadenza: {new Date(report.dueDate).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                ))}

                <button className="w-full btn-outline">
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                  Vedi Tutti i Report
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                Azioni Rapide
              </h2>

              <div className="space-y-3">
                <button className="w-full btn-primary">
                  📊 Genera Report Settimanale
                </button>
                <button className="w-full btn-outline">
                  👥 Gestisci Pazienti
                </button>
                <button className="w-full btn-outline">
                  📈 Analisi Avanzate
                </button>
                <button className="w-full btn-outline">
                  ⚙️ Impostazioni Account
                </button>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Riepilogo Performance
              </h3>
              
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
    </div>
  );
};

export default ProfessionalDashboard;
