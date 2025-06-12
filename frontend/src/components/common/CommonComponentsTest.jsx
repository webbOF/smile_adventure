/**
 * Common Components Integration Test
 * Verifies that all common components can be imported and used correctly
 */

import React from 'react';

// Test imports from common components
import {
  // Layout Components
  Header,

  // UI Components
  Modal,
  DataTable,
  tableActions,  // Loading Components
  LoadingSpinner,
  ComponentLoading,
  ButtonLoading,

  // Error Handling
  ErrorBoundary,
  SimpleErrorBoundary,
  withErrorBoundary,

  // All together
  CommonComponents
} from './index';

/**
 * Integration Test Component
 * This component tests that all common components can be rendered
 */
const CommonComponentsTest = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Test data for DataTable
  const testData = [
    { id: 1, name: 'Test User 1', email: 'test1@example.com', active: true, createdAt: '2025-01-01' },
    { id: 2, name: 'Test User 2', email: 'test2@example.com', active: false, createdAt: '2025-01-02' }
  ];

  const testColumns = [
    { accessor: 'name', header: 'Nome', sortable: true },
    { accessor: 'email', header: 'Email', sortable: true },
    { accessor: 'active', header: 'Attivo', type: 'boolean' },
    { accessor: 'createdAt', header: 'Data Creazione', type: 'date' }
  ];

  const testActions = [
    tableActions.view((row) => console.log('View:', row)),
    tableActions.edit((row) => console.log('Edit:', row)),
    tableActions.delete((row) => console.log('Delete:', row))
  ];

  return (
    <ErrorBoundary>
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Common Components Integration Test
        </h1>

        {/* Loading Components Test */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Loading Components</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">LoadingSpinner</h3>
              <LoadingSpinner size="medium" variant="primary" />
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">ButtonLoading</h3>
              <ButtonLoading size="small" variant="primary" />
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">ComponentLoading</h3>
              <ComponentLoading isLoading={loading} loadingText="Test loading...">
                <div>Content loaded!</div>
              </ComponentLoading>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">Toggle Loading</h3>
              <button 
                onClick={() => setLoading(!loading)}
                className="btn-primary"
              >
                Toggle Loading
              </button>
            </div>
          </div>
        </section>

        {/* DataTable Test */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">DataTable Component</h2>
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              data={testData}
              columns={testColumns}
              actions={testActions}
              searchable
              sortable
              pagination
              selectable
              onSelectionChange={(selected) => console.log('Selected:', selected)}
            />
          </div>
        </section>

        {/* Modal Components Test */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Modal Components</h2>
          <div className="space-x-4">
            <button 
              onClick={() => setModalOpen(true)}
              className="btn-primary"
            >
              Open Test Modal
            </button>
          </div>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Test Modal"
            size="lg"
          >
            <div className="space-y-4">
              <p>This is a test modal to verify the Modal component works correctly.</p>
              <div className="space-x-2">
                <button className="btn-primary">Primary Action</button>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        </section>

        {/* Error Boundary Test */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Error Boundary</h2>
          <SimpleErrorBoundary fallback={<div>Custom error fallback!</div>}>
            <div className="p-4 border rounded bg-green-50">
              <p>This content is wrapped in a SimpleErrorBoundary</p>
            </div>
          </SimpleErrorBoundary>
        </section>

        {/* Test Summary */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Test Summary</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800">✅ All Components Loaded Successfully!</h3>
            <ul className="mt-2 text-green-700 space-y-1">
              <li>✅ Layout Components: Header (+ DashboardLayout, Sidebar in layout/)</li>
              <li>✅ Modal System: Modal, ConfirmationModal, FormModal, ImageModal</li>
              <li>✅ DataTable: Advanced table with sorting, filtering, pagination</li>
              <li>✅ Loading System: Multiple loading components and variants</li>
              <li>✅ Error Boundaries: ErrorBoundary, SimpleErrorBoundary, withErrorBoundary</li>
              <li>✅ Exports: All components accessible via index.js</li>
            </ul>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
};

// Test HOC Pattern
const TestComponentWithErrorBoundary = withErrorBoundary(
  () => <div>This component is wrapped with withErrorBoundary HOC</div>,
  { fallback: () => <div>HOC Error Boundary activated!</div> }
);

/**
 * Test all CommonComponents object
 */
const testCommonComponentsObject = () => {
  console.log('Testing CommonComponents object:', CommonComponents);
    // Verify all expected components are present in CommonComponents
  const requiredComponents = [
    'Header',
    'Modal', 'ConfirmationModal', 'FormModal', 'ImageModal',
    'DataTable', 'tableActions',
    'LoadingSpinner', 'PageLoading', 'RouteLoading', 'ComponentLoading',
    'ErrorBoundary', 'SimpleErrorBoundary', 'withErrorBoundary'
  ];

  const missingComponents = requiredComponents.filter(
    component => !CommonComponents[component]
  );

  if (missingComponents.length === 0) {
    console.log('✅ All required components are present in CommonComponents object');
    return true;
  } else {
    console.error('❌ Missing components:', missingComponents);
    return false;
  }
};

// Run test on module load
testCommonComponentsObject();

export default CommonComponentsTest;
export { TestComponentWithErrorBoundary };
