/**
 * Migration Guide: Integrating Common Components
 * This file provides step-by-step instructions for integrating
 * the new common components into existing dashboard components
 */

// =============================================================================
// STEP 1: Update Parent Dashboard to use DashboardLayout
// =============================================================================

/*
// Before (ParentDashboard.jsx)
const ParentDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        // Dashboard content
      </div>
    </div>
  );
};

// After (ParentDashboard.jsx)
import { DashboardLayout } from '../components/layout';

const ParentDashboard = () => {
  return (
    <DashboardLayout>
      // Dashboard content (remove wrapper divs)
    </DashboardLayout>
  );
};
*/

// =============================================================================
// STEP 2: Replace existing modals with new Modal components
// =============================================================================

/*
// Before: Custom modal implementation
const AddChildModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3>Add Child</h3>
          <form>...</form>
          <div>
            <button onClick={onClose}>Cancel</button>
            <button>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// After: Using FormModal
import { FormModal } from '../components/common';

const AddChildModal = ({ isOpen, onClose, onSubmit }) => {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Add Child"
      isValid={isFormValid}
      isLoading={loading}
    >
      <form>...</form>
    </FormModal>
  );
};
*/

// =============================================================================
// STEP 3: Replace tables with DataTable component
// =============================================================================

/*
// Before: Custom table implementation
const ChildrenTable = ({ children }) => {
  return (
    <table className="min-w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Points</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {children.map(child => (
          <tr key={child.id}>
            <td>{child.name}</td>
            <td>{child.age}</td>
            <td>{child.points}</td>
            <td>
              <button onClick={() => viewChild(child)}>View</button>
              <button onClick={() => editChild(child)}>Edit</button>
              <button onClick={() => deleteChild(child)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// After: Using DataTable
import { DataTable, tableActions } from '../components/common';

const ChildrenTable = ({ children, onView, onEdit, onDelete }) => {
  const columns = [
    { accessor: 'name', header: 'Name', sortable: true },
    { accessor: 'age', header: 'Age', sortable: true },
    { accessor: 'points', header: 'Points', sortable: true, type: 'number' }
  ];

  const actions = [
    tableActions.view(onView),
    tableActions.edit(onEdit),
    tableActions.delete(onDelete)
  ];

  return (
    <DataTable
      data={children}
      columns={columns}
      actions={actions}
      searchable
      sortable
      pagination
    />
  );
};
*/

// =============================================================================
// STEP 4: Replace loading spinners with new Loading components
// =============================================================================

/*
// Before: Custom loading spinner
const CustomSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// After: Using LoadingSpinner
import { LoadingSpinner } from '../components/common';

const Loading = () => (
  <LoadingSpinner 
    size="large" 
    variant="primary" 
    text="Loading children..." 
  />
);
*/

// =============================================================================
// STEP 5: Wrap components with ErrorBoundary
// =============================================================================

/*
// Before: No error handling
const Dashboard = () => {
  return (
    <div>
      <SomeComponent />
    </div>
  );
};

// After: With ErrorBoundary
import { ErrorBoundary } from '../components/common';

const Dashboard = () => {
  return (
    <ErrorBoundary>
      <div>
        <SomeComponent />
      </div>
    </ErrorBoundary>
  );
};
*/

// =============================================================================
// INTEGRATION EXAMPLES FOR SPECIFIC COMPONENTS
// =============================================================================

// Parent Dashboard Integration Example
export const ParentDashboardMigration = `
// File: src/components/parent/ParentDashboard.jsx

import React, { useState, useCallback } from 'react';
import { 
  DataTable,
  FormModal,
  ConfirmationModal,
  LoadingSpinner,
  ErrorBoundary,
  tableActions
} from '../common';
import { DashboardLayout } from '../layout';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

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
    { accessor: 'age', header: 'Età', sortable: true },
    { accessor: 'totalPoints', header: 'Punti Totali', sortable: true },
    { accessor: 'lastActivity', header: 'Ultima Attività', type: 'date', sortable: true }
  ];

  const actions = [
    tableActions.view((child) => navigate(\`/parent/children/\${child.id}\`)),
    tableActions.edit((child) => {
      setSelectedChild(child);
      setShowAddModal(true);
    }),
    tableActions.delete((child) => {
      setSelectedChild(child);
      setShowDeleteModal(true);
    })
  ];

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">I Tuoi Bambini</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              disabled={loading}
            >
              {loading && <LoadingSpinner size="small" variant="white" className="mr-2" />}
              Aggiungi Bambino
            </button>
          </div>

          {/* Children Data Table */}
          <div className="card p-6">
            <DataTable
              data={children}
              columns={columns}
              actions={actions}
              loading={loading}
              searchable
              sortable
              pagination
              emptyMessage="Nessun bambino registrato"
            />
          </div>

          {/* Add/Edit Child Modal */}
          <FormModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setSelectedChild(null);
            }}
            onSubmit={handleSaveChild}
            title={selectedChild ? 'Modifica Bambino' : 'Aggiungi Nuovo Bambino'}
            isLoading={loading}
          >
            <ChildForm initialData={selectedChild} />
          </FormModal>

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedChild(null);
            }}
            onConfirm={handleDeleteChild}
            title="Elimina Bambino"
            message={\`Sei sicuro di voler eliminare \${selectedChild?.name}?\`}
            variant="danger"
            isLoading={loading}
          />
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default ParentDashboard;
`;

// Professional Dashboard Integration Example
export const ProfessionalDashboardMigration = `
// File: src/components/professional/ProfessionalDashboard.jsx

import React, { useState } from 'react';
import { 
  DataTable,
  LoadingSpinner,
  ErrorBoundary,
  tableActions
} from '../common';
import { DashboardLayout } from '../layout';

const ProfessionalDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { accessor: 'childName', header: 'Paziente', sortable: true },
    { accessor: 'parentName', header: 'Genitore', sortable: true },
    { accessor: 'lastSession', header: 'Ultima Sessione', type: 'date', sortable: true },
    { accessor: 'totalSessions', header: 'Sessioni Totali', sortable: true },
    { 
      accessor: 'status', 
      header: 'Stato', 
      render: (value) => (
        <span className={\`inline-flex px-2 py-1 text-xs font-semibold rounded-full \${getStatusColor(value)}\`}>
          {getStatusText(value)}
        </span>
      )
    }
  ];

  const actions = [
    tableActions.view((patient) => navigate(\`/professional/patients/\${patient.id}\`)),
    {
      label: 'Nuova Sessione',
      icon: <PlusIcon className="h-4 w-4" />,
      onClick: (patient) => navigate(\`/professional/sessions/new?patient=\${patient.id}\`),
      className: 'text-primary-600 hover:text-primary-800'
    }
  ];

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Professionista</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* ... stats cards ... */}
          </div>

          {/* Patients Table */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pazienti Recenti</h2>
            <DataTable
              data={patients}
              columns={columns}
              actions={actions}
              loading={loading}
              searchable
              sortable
              pagination
              searchPlaceholder="Cerca pazienti..."
            />
          </div>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default ProfessionalDashboard;
`;

// =============================================================================
// MIGRATION CHECKLIST
// =============================================================================

export const MigrationChecklist = `
## Migration Checklist for Common Components

### Pre-Migration
- [ ] Backup existing dashboard components
- [ ] Review current modal implementations
- [ ] List all tables that need DataTable conversion
- [ ] Identify loading states to replace

### Dashboard Layout Migration
- [ ] Replace Header + manual layout with DashboardLayout
- [ ] Update ParentDashboard.jsx
- [ ] Update ProfessionalDashboard.jsx
- [ ] Update AdminDashboard.jsx (if exists)
- [ ] Test sidebar functionality
- [ ] Test mobile responsiveness

### Modal Migration
- [ ] Replace confirmation dialogs with ConfirmationModal
- [ ] Replace form modals with FormModal
- [ ] Replace image viewers with ImageModal
- [ ] Update modal trigger buttons
- [ ] Test modal accessibility

### DataTable Migration
- [ ] Convert children lists to DataTable
- [ ] Convert patient lists to DataTable
- [ ] Convert user management tables to DataTable
- [ ] Update table actions handlers
- [ ] Test sorting and filtering
- [ ] Test pagination

### Loading States Migration
- [ ] Replace custom spinners with LoadingSpinner
- [ ] Add PageLoading to route components
- [ ] Wrap async operations with ComponentLoading
- [ ] Add ButtonLoading to form submissions
- [ ] Test different loading variants

### Error Boundary Integration
- [ ] Wrap main dashboard components with ErrorBoundary
- [ ] Add SimpleErrorBoundary to critical components
- [ ] Test error scenarios
- [ ] Configure error reporting (production)

### Testing
- [ ] Test all dashboard functionality
- [ ] Test mobile responsiveness
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Performance testing with large datasets
- [ ] Cross-browser testing

### Documentation
- [ ] Update component documentation
- [ ] Create usage examples
- [ ] Document integration patterns
- [ ] Update README files
`;

export default {
  ParentDashboardMigration,
  ProfessionalDashboardMigration,
  MigrationChecklist
};
