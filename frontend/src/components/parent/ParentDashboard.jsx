import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useChildren, useChildActivities } from '../../hooks/useApiServices';
import { 
  PlusIcon, 
  UserIcon, 
  TrophyIcon,
  ChartBarIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// Import Common Components
import {
  DataTable,
  ConfirmationModal,
  FormModal,
  LoadingSpinner,
  ErrorBoundary,
  tableActions
} from '../common';
import { DashboardLayout } from '../layout';

const ParentDashboard = () => {  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { children, isLoading: childrenLoading, createChild, updateChild, deleteChild, isCreating } = useChildren();
  
  // Modal states
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showEditChildModal, setShowEditChildModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childToDelete, setChildToDelete] = useState(null);
    // Get activities for the first child (or selected child)
  const firstChildId = children.length > 0 ? children[0].id : null;
  const { activities: recentActivities = [] } = useChildActivities(
    firstChildId, 
    { limit: 5, status: 'completed' }
  );

  // Calculate quick stats
  const quickStats = {
    totalChildren: children.length,
    totalPoints: children.reduce((sum, child) => sum + (child.totalPoints || 0), 0),
    completedActivities: recentActivities.length,
    averageProgress: children.length > 0 
      ? Math.round(children.reduce((sum, child) => sum + (child.progress || 0), 0) / children.length) 
      : 0
  };

  // Table configuration for children
  const columns = [
    { 
      accessor: 'name', 
      header: 'Nome', 
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {value.charAt(0)}
            </span>
          </div>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { 
      accessor: 'age', 
      header: 'Età', 
      sortable: true,
      render: (value) => `${value} anni`
    },
    { 
      accessor: 'totalPoints', 
      header: 'Punti Totali', 
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value || 0} punti
        </span>
      )
    },
    { 
      accessor: 'lastActivity', 
      header: 'Ultima Attività', 
      type: 'date',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('it-IT') : 'Nessuna'
    },
    { 
      accessor: 'progress', 
      header: 'Progressi',
      render: (value) => (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${value || 0}%` }}
          />
        </div>
      )
    }
  ];

  // Table actions
  const actions = [
    tableActions.view((child) => {
      navigate(`/parent/children/${child.id}`);
    }),
    tableActions.edit((child) => {
      setSelectedChild(child);
      setShowEditChildModal(true);
    }),
    tableActions.delete((child) => {
      setChildToDelete(child);
      setShowDeleteModal(true);
    })
  ];

  // Handlers
  const handleAddChild = useCallback(async (formData) => {
    try {
      await createChild(formData);
      setShowAddChildModal(false);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Errore nella creazione del bambino' 
      };
    }
  }, [createChild]);

  const handleEditChild = useCallback(async (formData) => {
    try {
      await updateChild(selectedChild.id, formData);
      setShowEditChildModal(false);
      setSelectedChild(null);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Errore nella modifica del bambino' 
      };
    }
  }, [updateChild, selectedChild]);
  const handleDeleteChild = useCallback(async () => {
    try {
      await deleteChild(childToDelete.id);
      setShowDeleteModal(false);
      setChildToDelete(null);
      return { success: true };
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      return { 
        success: false, 
        error: error.message || 'Errore nell\'eliminazione del bambino' 
      };
    }
  }, [deleteChild, childToDelete]);

  // Quick actions
  const quickActions = [
    {
      title: 'Aggiungi Bambino',
      description: 'Registra un nuovo bambino',
      icon: PlusIcon,
      color: 'primary',
      onClick: () => setShowAddChildModal(true)
    },
    {
      title: 'Visualizza Progressi',
      description: 'Controlla i progressi dei tuoi bambini',
      icon: ChartBarIcon,
      color: 'secondary',
      onClick: () => navigate('/parent/progress')
    },
    {
      title: 'Attività Recenti',
      description: 'Vedi le ultime attività completate',
      icon: CalendarIcon,
      color: 'accent',
      onClick: () => navigate('/parent/activities')
    }
  ];

  // Form fields for child management
  const childFormFields = [
    {
      name: 'name',
      label: 'Nome',
      type: 'text',
      required: true,
      validation: {
        required: 'Il nome è obbligatorio',
        minLength: { value: 2, message: 'Il nome deve avere almeno 2 caratteri' }
      }
    },
    {
      name: 'age',
      label: 'Età',
      type: 'number',
      required: true,
      validation: {
        required: 'L\'età è obbligatoria',
        min: { value: 3, message: 'L\'età minima è 3 anni' },
        max: { value: 18, message: 'L\'età massima è 18 anni' }
      }
    },
    {
      name: 'birthDate',
      label: 'Data di Nascita',
      type: 'date',
      required: true,
      validation: {
        required: 'La data di nascita è obbligatoria'
      }
    },
    {
      name: 'notes',
      label: 'Note',
      type: 'textarea',
      required: false,
      placeholder: 'Aggiungi note, allergie o informazioni importanti...'
    }
  ];
  if (childrenLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" text="Caricamento dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              Benvenuto, {user?.firstName || 'Genitore'}! 👋
            </h1>
            <p className="text-primary-100">
              Ecco un riepilogo delle attività dei tuoi bambini
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bambini Registrati</p>
                  <p className="text-2xl font-semibold text-gray-900">{quickStats.totalChildren}</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{quickStats.totalPoints}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <StarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Attività Completate</p>
                  <p className="text-2xl font-semibold text-gray-900">{quickStats.completedActivities}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progresso Medio</p>
                  <p className="text-2xl font-semibold text-gray-900">{quickStats.averageProgress}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.title}
                    onClick={action.onClick}
                    className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                        <Icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Children Management */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Gestione Bambini</h2>
                <button
                  onClick={() => setShowAddChildModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Aggiungi Bambino
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {children.length === 0 ? (
                <div className="text-center py-12">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun bambino registrato</h3>
                  <p className="text-gray-500 mb-4">
                    Inizia aggiungendo il tuo primo bambino per tracciare i suoi progressi
                  </p>
                  <button
                    onClick={() => setShowAddChildModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Aggiungi il Primo Bambino
                  </button>
                </div>
              ) : (
                <DataTable
                  data={children}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  sortable={true}
                  pagination={true}
                  emptyMessage="Nessun bambino trovato"
                />
              )}
            </div>
          </div>

          {/* Recent Activities */}
          {recentActivities.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Attività Recenti</h2>
                <button
                  onClick={() => navigate('/parent/activities')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Vedi tutte →
                </button>
              </div>
                <div className="space-y-3">
                {recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id || activity.title} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <StarIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {activity.completedAt ? new Date(activity.completedAt).toLocaleDateString('it-IT') : 'Oggi'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +{activity.points || 10} punti
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>        {/* Add Child Modal */}
        <FormModal
          isOpen={showAddChildModal}
          onClose={() => setShowAddChildModal(false)}
          title="Aggiungi Nuovo Bambino"
          fields={childFormFields}
          onSubmit={handleAddChild}
          isSubmitting={isCreating}
          submitText="Aggiungi Bambino"
        />        {/* Edit Child Modal */}
        <FormModal
          isOpen={showEditChildModal}
          onClose={() => {
            setShowEditChildModal(false);
            setSelectedChild(null);
          }}
          title="Modifica Bambino"
          fields={childFormFields}
          initialData={selectedChild}
          onSubmit={handleEditChild}
          isSubmitting={isCreating}
          submitText="Salva Modifiche"
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setChildToDelete(null);
          }}
          title="Elimina Bambino"
          message={`Sei sicuro di voler eliminare ${childToDelete?.name}? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          onConfirm={handleDeleteChild}
          variant="danger"
        />
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default ParentDashboard;
