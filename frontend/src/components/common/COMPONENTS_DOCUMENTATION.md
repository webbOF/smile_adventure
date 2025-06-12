# Common Components Documentation

Questo documento descrive i componenti comuni riutilizzabili implementati nel Task 32.

## 📦 Componenti Implementati

### 1. **Sidebar.jsx** ✅
Navigation sidebar dinamica basata sui ruoli utente.

#### Caratteristiche:
- **Role-based navigation**: Menu differenti per parent, professional, admin
- **Collapsible**: Supporto per collapse/expand con animazioni
- **Responsive**: Design responsive con supporto mobile
- **Active states**: Indicatori visivi per la route attiva
- **Expandable groups**: Menu con sottosezioni espandibili

#### Utilizzo:
```jsx
import Sidebar from '../components/common/Sidebar';

<Sidebar 
  isCollapsed={false}
  onToggleCollapse={handleToggle}
  className="custom-sidebar"
/>
```

#### Props:
- `isCollapsed` (boolean): Stato collapsed della sidebar
- `onToggleCollapse` (function): Callback per toggle collapse
- `className` (string): Classi CSS aggiuntive

### 2. **Modal.jsx** ✅
Sistema modale completo con varianti specializzate.

#### Componenti Disponibili:
- **Modal**: Modal base riutilizzabile
- **ConfirmationModal**: Modal per conferme
- **FormModal**: Modal ottimizzato per forms
- **ImageModal**: Modal per visualizzazione immagini

#### Caratteristiche:
- **Portal rendering**: Rendering tramite React Portal
- **Multiple sizes**: xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, full
- **Keyboard support**: Chiusura con ESC key
- **Overlay interaction**: Chiusura cliccando overlay
- **Animations**: Animazioni smooth con framer-motion
- **Accessibility**: ARIA labels e focus management

#### Utilizzo:
```jsx
import Modal, { ConfirmationModal, FormModal } from '../components/common/Modal';

// Modal base
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Titolo Modal"
  size="lg"
>
  Contenuto modal
</Modal>

// Confirmation Modal
<ConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Conferma eliminazione"
  message="Sei sicuro di voler eliminare questo elemento?"
  variant="danger"
/>

// Form Modal
<FormModal
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={handleSubmit}
  title="Modifica Profilo"
  isValid={isFormValid}
>
  <form>...</form>
</FormModal>
```

### 3. **DataTable.jsx** ✅
Tabella dati avanzata con funzionalità enterprise.

#### Caratteristiche:
- **Sorting**: Ordinamento per colonne
- **Filtering**: Filtri personalizzabili
- **Pagination**: Paginazione con controlli
- **Search**: Ricerca globale con highlighting
- **Row selection**: Selezione multipla con checkbox
- **Actions**: Azioni personalizzabili per riga
- **Data types**: Supporto boolean, date, currency
- **Export**: Funzionalità di esportazione
- **Loading states**: Stati di caricamento
- **Empty states**: Stati vuoti personalizzabili
- **Responsive**: Design responsive

#### Utilizzo:
```jsx
import DataTable, { tableActions } from '../components/common/DataTable';

const columns = [
  { accessor: 'name', header: 'Nome', sortable: true },
  { accessor: 'email', header: 'Email', sortable: true },
  { accessor: 'active', header: 'Attivo', type: 'boolean' },
  { accessor: 'createdAt', header: 'Data Creazione', type: 'date' }
];

const actions = [
  tableActions.view((row) => console.log('View:', row)),
  tableActions.edit((row) => console.log('Edit:', row)),
  tableActions.delete((row) => console.log('Delete:', row))
];

<DataTable
  data={users}
  columns={columns}
  actions={actions}
  searchable
  sortable
  pagination
  selectable
  onSelectionChange={(selected) => console.log(selected)}
/>
```

### 4. **Loading.jsx** ✅
Sistema di loading avanzato con stili multipli.

#### Componenti Disponibili:
- **LoadingSpinner**: Spinner principale con stili multipli
- **PageLoading**: Loading per pagine complete
- **RouteLoading**: Loading per transizioni route
- **ComponentLoading**: Wrapper per componenti
- **ButtonLoading**: Loading per bottoni
- **DotsLoader**: Animazione dots
- **PulseLoader**: Animazione pulse
- **SkeletonLoader**: Skeleton placeholders

#### Caratteristiche:
- **Multiple styles**: spinner, dots, pulse, skeleton
- **Size variants**: xs, small, medium, large, xlarge
- **Color variants**: primary, secondary, white, gray, success, error
- **Animations**: Framer Motion animations
- **Full screen**: Supporto fullscreen loading
- **Customizable**: Altamente personalizzabile

#### Utilizzo:
```jsx
import { 
  LoadingSpinner, 
  PageLoading, 
  ComponentLoading,
  DotsLoader,
  PulseLoader 
} from '../components/common/Loading';

// Spinner base
<LoadingSpinner 
  size="large" 
  variant="primary" 
  style="spinner"
  text="Caricamento..."
/>

// Page loading
<PageLoading message="Inizializzazione..." />

// Component wrapper
<ComponentLoading isLoading={loading} loadingText="Caricamento dati...">
  <MyComponent />
</ComponentLoading>

// Stili alternativi
<DotsLoader size="medium" variant="primary" />
<PulseLoader size="large" variant="secondary" />
```

### 5. **ErrorBoundary.jsx** ✅
Error Boundary avanzato con error reporting.

#### Caratteristiche:
- **Error catching**: Cattura errori JavaScript
- **Error reporting**: Integrazione servizi di reporting
- **Retry mechanism**: Sistema di retry automatico
- **Custom fallbacks**: Fallback personalizzabili
- **Development mode**: Dettagli errore in sviluppo
- **Error ID**: ID univoco per supporto tecnico
- **Multiple actions**: Azioni personalizzabili
- **HOC Pattern**: Higher Order Component disponibile

#### Componenti Disponibili:
- **ErrorBoundary**: Error boundary principale
- **SimpleErrorBoundary**: Versione semplificata
- **withErrorBoundary**: HOC wrapper
- **useErrorHandler**: Hook per error handling

#### Utilizzo:
```jsx
import ErrorBoundary, { 
  SimpleErrorBoundary, 
  withErrorBoundary 
} from '../components/common/ErrorBoundary';

// Error Boundary completo
<ErrorBoundary
  fallback={(error, errorInfo, retry) => <CustomErrorUI />}
  onReset={() => console.log('Reset')}
  showReload
  showHome
  customActions={[
    { label: 'Contatta Supporto', onClick: () => {}, className: 'btn-primary' }
  ]}
>
  <MyComponent />
</ErrorBoundary>

// Error Boundary semplice
<SimpleErrorBoundary fallback={<div>Errore!</div>}>
  <MyComponent />
</SimpleErrorBoundary>

// HOC Pattern
const SafeComponent = withErrorBoundary(MyComponent, {
  fallback: () => <div>Errore nel componente</div>
});
```

### 6. **Header.jsx** ✅
Header migliorato con supporto sidebar e navigazione avanzata.

#### Caratteristiche:
- **Sidebar integration**: Supporto toggle sidebar
- **User profile**: Dropdown profilo utente
- **Notifications**: Sistema notifiche
- **Role-based navigation**: Menu basato su ruolo
- **Mobile responsive**: Design responsive
- **Profile dropdown**: Menu profilo completo
- **Transparent mode**: Supporto header trasparente

#### Utilizzo:
```jsx
import Header from '../components/common/Header';

<Header
  onToggleSidebar={handleToggleSidebar}
  showSidebarToggle
  transparent={false}
  className="custom-header"
/>
```

### 7. **DashboardLayout.jsx** ✅
Layout completo per dashboard con Header e Sidebar integrati.

#### Caratteristiche:
- **Integrated layout**: Header + Sidebar integrati
- **Responsive**: Sidebar collapsible su desktop, overlay su mobile
- **Route-based**: Sidebar automatica basata su route
- **Customizable**: Props per personalizzazione
- **Mobile support**: Supporto mobile completo

#### Utilizzo:
```jsx
import DashboardLayout from '../components/common/DashboardLayout';

<DashboardLayout
  showSidebar
  sidebarProps={{ className: 'custom-sidebar' }}
  headerProps={{ transparent: false }}
  className="custom-main"
>
  <YourDashboardContent />
</DashboardLayout>
```

## 🎨 Styling & Theme

Tutti i componenti utilizzano:
- **Tailwind CSS**: Sistema di utilità CSS
- **Design System**: Colori e spacing consistenti
- **Dental Theme**: Palette specifico per settore dentale
- **Responsive Design**: Mobile-first approach
- **Animations**: Framer Motion per animazioni smooth

## 🚀 Integrazione

### Nel router principale:
```jsx
import { ErrorBoundary } from './components/common/ErrorBoundary';
import DashboardLayout from './components/common/DashboardLayout';

// Wrap routes con ErrorBoundary
<ErrorBoundary>
  <Routes>
    <Route path="/parent/*" element={
      <DashboardLayout>
        <ParentRoutes />
      </DashboardLayout>
    } />
  </Routes>
</ErrorBoundary>
```

### Nei dashboard esistenti:
```jsx
// Sostituire layout esistenti con DashboardLayout
import DashboardLayout from '../components/common/DashboardLayout';

const ParentDashboard = () => (
  <DashboardLayout>
    {/* Contenuto dashboard */}
  </DashboardLayout>
);
```

## 📚 Esempi Pratici

### Tabella Utenti con Azioni:
```jsx
const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { accessor: 'name', header: 'Nome', sortable: true },
    { accessor: 'email', header: 'Email', sortable: true },
    { accessor: 'role', header: 'Ruolo' },
    { accessor: 'active', header: 'Attivo', type: 'boolean' },
    { accessor: 'createdAt', header: 'Registrato', type: 'date' }
  ];

  const actions = [
    tableActions.view((user) => navigate(`/users/${user.id}`)),
    tableActions.edit((user) => setEditUser(user)),
    tableActions.delete((user) => handleDelete(user.id))
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      actions={actions}
      loading={loading}
      searchable
      sortable
      pagination
    />
  );
};
```

### Form Modal con Validazione:
```jsx
const EditUserModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(user);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Modifica Utente"
      isValid={isValid}
      isLoading={loading}
    >
      <div className="space-y-4">
        <input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Nome"
          className="input"
        />
        {/* Altri campi */}
      </div>
    </FormModal>
  );
};
```

## 🔧 Best Practices

1. **Error Boundaries**: Wrap sempre i componenti principali
2. **Loading States**: Usa loading appropriati per UX migliore  
3. **Modals**: Preferisci modali specializzati (ConfirmationModal, FormModal)
4. **Tables**: Usa DataTable per liste dati complesse
5. **Layouts**: Usa DashboardLayout per dashboard consistenti
6. **Accessibility**: Tutti i componenti sono accessibili
7. **Performance**: Componenti ottimizzati con memo e callbacks

## 🐛 Troubleshooting

### Problemi Comuni:

1. **Sidebar non appare**: Verifica che l'utente sia autenticato e la route corretta
2. **Modal non si chiude**: Controlla gli event listeners e Portal mounting  
3. **DataTable lenta**: Usa pagination e virtualizzazione per dataset grandi
4. **Loading infinito**: Verifica le condizioni di loading state
5. **Error Boundary non cattura**: Solo errori in rendering, non async

### Debug:

Tutti i componenti includono logging per debugging:
```jsx
// Abilita debug mode
localStorage.setItem('DEBUG_COMPONENTS', 'true');
```

---

**Implementazione completata con successo! ✅**
Tutti i componenti sono pronti per l'integrazione nell'applicazione Smile Adventure.
