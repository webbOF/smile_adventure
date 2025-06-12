/**
 * Example Integration: Parent Dashboard with Common Components
 * This file shows how to integrate the new common components
 * into existing dashboard components
 */

import React, { useState, useCallback } from 'react';
import { 
  DataTable,
  Modal,
  ConfirmationModal,
  FormModal,
  LoadingSpinner,
  ErrorBoundary,
  tableActions
} from '../index';
import { DashboardLayout } from '../../layout';

const ParentDashboardExample = () => {
  // State management
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [childToDelete, setChildToDelete] = useState(null);

  // Table configuration
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
      sortable: true 
    },
    { 
      accessor: 'progress', 
      header: 'Progressi',
      render: (value) => (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full" 
            style={{ width: `${value || 0}%` }}
          />
        </div>
      )
    }
  ];

  // Table actions
  const actions = [
    tableActions.view((child) => {
      setSelectedChild(child);
      // Navigate to child details
      // navigate(`/parent/children/${child.id}`);
    }),
    tableActions.edit((child) => {
      setSelectedChild(child);
      setShowAddModal(true);
    }),
    tableActions.delete((child) => {
      setChildToDelete(child);
      setShowDeleteModal(true);
    })
  ];

  // Handlers
  const handleAddChild = useCallback(async (formData) => {
    setLoading(true);
    try {
      // API call to add child
      // const newChild = await api.addChild(formData);
      // setChildren(prev => [...prev, newChild]);
      console.log('Adding child:', formData);
      setShowAddModal(false);
      setSelectedChild(null);
    } catch (error) {
      console.error('Error adding child:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteChild = useCallback(async () => {
    if (!childToDelete) return;
    
    setLoading(true);
    try {
      // API call to delete child
      // await api.deleteChild(childToDelete.id);
      // setChildren(prev => prev.filter(c => c.id !== childToDelete.id));
      console.log('Deleting child:', childToDelete);
      setShowDeleteModal(false);
      setChildToDelete(null);
    } catch (error) {
      console.error('Error deleting child:', error);
    } finally {
      setLoading(false);
    }
  }, [childToDelete]);

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">I Tuoi Bambini</h1>
              <p className="text-gray-600 mt-1">
                Gestisci i profili e monitora i progressi dei tuoi bambini
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="small" variant="white" className="mr-2" />
              ) : null}
              Aggiungi Bambino
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👶</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bambini Registrati</p>
                  <p className="text-2xl font-bold text-gray-900">{children.length}</p>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Punti Totali</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {children.reduce((total, child) => total + (child.totalPoints || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Attività Completate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {children.reduce((total, child) => total + (child.completedActivities || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progresso Medio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {children.length > 0 
                      ? Math.round(children.reduce((total, child) => total + (child.progress || 0), 0) / children.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Children Data Table */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Lista Bambini
              </h2>
            </div>

            <DataTable
              data={children}
              columns={columns}
              actions={actions}
              loading={loading}
              searchable
              sortable
              pagination
              emptyMessage="Nessun bambino registrato. Aggiungi il primo bambino per iniziare!"
              searchPlaceholder="Cerca bambini..."
            />
          </div>

          {/* Add/Edit Child Modal */}
          <FormModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setSelectedChild(null);
            }}
            onSubmit={handleAddChild}
            title={selectedChild ? 'Modifica Bambino' : 'Aggiungi Nuovo Bambino'}
            isLoading={loading}
            size="lg"
          >
            <ChildForm 
              initialData={selectedChild}
              onValidation={(isValid) => setIsFormValid(isValid)}
            />
          </FormModal>

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setChildToDelete(null);
            }}
            onConfirm={handleDeleteChild}
            title="Elimina Bambino"
            message={`Sei sicuro di voler eliminare il profilo di ${childToDelete?.name}? Questa azione non può essere annullata.`}
            confirmText="Elimina"
            cancelText="Annulla"
            variant="danger"
            isLoading={loading}
          />
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

/**
 * Child Form Component
 * Example form component for the FormModal
 */
const ChildForm = ({ initialData, onValidation }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    age: '',
    birthDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Il nome è obbligatorio';
    }
    
    if (!formData.age || formData.age < 1 || formData.age > 18) {
      newErrors.age = 'Inserisci un\'età valida (1-18 anni)';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'La data di nascita è obbligatoria';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidation?.(isValid);
    return isValid;
  }, [formData, onValidation]);

  React.useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome Completo *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`input ${errors.name ? 'border-red-300' : ''}`}
          placeholder="Inserisci il nome del bambino"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Età *
          </label>
          <input
            type="number"
            min="1"
            max="18"
            value={formData.age}
            onChange={(e) => handleChange('age', parseInt(e.target.value))}
            className={`input ${errors.age ? 'border-red-300' : ''}`}
            placeholder="Età"
          />
          {errors.age && (
            <p className="mt-1 text-sm text-red-600">{errors.age}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data di Nascita *
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            className={`input ${errors.birthDate ? 'border-red-300' : ''}`}
          />
          {errors.birthDate && (
            <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note (Opzionale)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="input"
          rows="3"
          placeholder="Note aggiuntive sul bambino..."
        />
      </div>
    </div>
  );
};

export default ParentDashboardExample;
