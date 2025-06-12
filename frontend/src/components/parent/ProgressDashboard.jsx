// src/components/parent/ProgressDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChildren } from '../../hooks/useApiServices';
import { 
  ArrowLeftIcon,
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

// Import Common Components
import {
  LoadingSpinner,
  ErrorBoundary
} from '../common';
import { DashboardLayout } from '../layout';
import ProgressCharts from './ProgressCharts';

const ProgressDashboard = () => {
  const navigate = useNavigate();
  const { children, isLoading: childrenLoading } = useChildren();
  
  // State for selected child
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  // Set default selected child when children load
  React.useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    }
  }, [children, selectedChild]);

  // Period options
  const periodOptions = [
    { value: '7', label: '7 giorni' },
    { value: '14', label: '2 settimane' },
    { value: '30', label: '30 giorni' },
    { value: '60', label: '2 mesi' },
    { value: '90', label: '3 mesi' }
  ];

  if (childrenLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" text="Caricamento progressi..." />
        </div>
      </DashboardLayout>
    );
  }

  if (children.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nessun bambino registrato
          </h2>
          <p className="text-gray-600 mb-6">
            Aggiungi il primo bambino per visualizzare i progressi
          </p>
          <button
            onClick={() => navigate('/parent')}
            className="game-button"
          >
            Aggiungi Bambino
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/parent')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  Analisi Progressi
                </h1>
                <p className="text-gray-600 mt-1">
                  Monitoraggio delle performance e del coinvolgimento
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Child Selector */}
              <div>              <label htmlFor="child-selector" className="block text-sm font-medium text-gray-700 mb-1">
                Bambino
              </label>
              <select 
                id="child-selector"
                  value={selectedChild?.id || ''}
                  onChange={(e) => {
                    const child = children.find(c => c.id === parseInt(e.target.value));
                    setSelectedChild(child);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Selector */}
              <div>              <label htmlFor="period-selector" className="block text-sm font-medium text-gray-700 mb-1">
                Periodo
              </label>
              <select 
                id="period-selector"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Stats for Selected Child */}
          {selectedChild && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bambino Selezionato</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedChild.name}</p>
                    <p className="text-xs text-gray-500">{selectedChild.age} anni</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrophyIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Punti Totali</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedChild.totalPoints || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Livello</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedChild.level || 1}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Progresso</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedChild.progress || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Charts */}
          {selectedChild && (
            <div className="bg-white rounded-lg shadow-sm border">
              <ProgressCharts 
                childId={selectedChild.id}
                embedded={false}
                period={selectedPeriod}
              />
            </div>
          )}

          {/* Children Overview */}
          {children.length > 1 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Riepilogo Tutti i Bambini
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map(child => (
                  <div 
                    key={child.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedChild?.id === child.id 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedChild(child)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {child.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{child.name}</h3>
                        <p className="text-sm text-gray-600">{child.age} anni</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Punti:</span>
                        <span className="font-medium text-gray-900">{child.totalPoints || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Livello:</span>
                        <span className="font-medium text-gray-900">{child.level || 1}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Progresso:</span>
                          <span className="font-medium text-gray-900">{child.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${child.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default ProgressDashboard;
