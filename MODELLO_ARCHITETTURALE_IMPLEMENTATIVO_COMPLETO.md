# SMILE ADVENTURE - MODELLO ARCHITETTURALE E ASPETTI IMPLEMENTATIVI

## 6. MODELLO ARCHITETTURALE

### 6.1 Architettura Hardware

#### 6.1.1 Sistemi Hardware Connessi a Internet

**1. Server di Produzione:**
- **Tipo**: Server dedicato o VPS (Virtual Private Server)
- **Specifiche Hardware Raccomandate**:
  - CPU: Multi-core (minimo 4 core, raccomandato 8+ core)
  - RAM: Minimo 8 GB, raccomandato 16+ GB per gestire connection pool PostgreSQL
  - Storage: SSD NVMe per prestazioni database ottimali
  - Network: Connessione gigabit per latenza ridotta
- **Connettività**: Accessibile tramite protocollo HTTPS con certificati SSL
- **Containerization**: Docker containers orchestrati con Docker Compose

**2. Client Devices (Dispositivi Utente):**
- **Desktop/Laptop**: Windows, macOS, Linux con browser moderni
- **Tablet**: iPad, Android tablet per interfaccia touch-friendly ASD
- **Smartphone**: iOS/Android per accesso mobile (responsive design)
- **Browser Supportati**: 
  - Google Chrome 90+
  - Mozilla Firefox 88+
  - Microsoft Edge 90+
  - Safari 14+
- **Requisiti Minimi Client**:
  - JavaScript abilitato
  - Connessione internet stabile
  - Minimo 2 GB RAM per sessioni di gioco fluide

**3. Database Server:**
- **Hardware Dedicato**: Server PostgreSQL 15
- **Configuration**: Connection pooling (20 connessioni base + 30 overflow)
- **Storage**: PostgreSQL data volume persistente su SSD
- **Backup**: Automated backup system con retention policy

**4. Cache Layer:**
- **Redis Server**: Container dedicato per caching (configurato ma non implementato)
- **Memory**: Minimo 1 GB RAM dedicata per Redis
- **Persistence**: AOF (Append Only File) per durabilità dati

**5. Network Infrastructure:**
- **Load Balancer**: Per distribuzione traffico (configurazione futura)
- **CDN**: Content Delivery Network per assets statici
- **Monitoring**: Health checks automatici per tutti i servizi

### 6.2 Architettura Software

#### 6.2.1 Moduli Software Sviluppati per l'Esame

**BACKEND MODULES (FastAPI + Python 3.12)**

**1. Core System (`/backend/app/core/`)**
- **`config.py`**: Configurazione centralizzata con Pydantic Settings
  - Database connection pooling ottimizzato
  - JWT security configuration
  - Environment-specific settings (development/production)
- **`database.py`**: SQLAlchemy engine e session management
  - Connection pool: 20 base + 30 overflow
  - Event listeners per logging e validazioni
  - Naming conventions automatiche per constraints
- **`security.py`**: Utilità JWT e password hashing

**2. Authentication System (`/backend/app/auth/`)**
- **`models.py`**: User model unificato multi-ruolo
  - UserRole enum: PARENT, PROFESSIONAL, ADMIN, SUPER_ADMIN
  - UserStatus enum: ACTIVE, INACTIVE, SUSPENDED, PENDING, DELETED
  - Security tracking: failed_login_attempts, locked_until
- **`routes.py`**: Endpoint autenticazione
  - POST /auth/register (registrazione con validazione email)
  - POST /auth/login (login con failed attempts tracking)
  - POST /auth/refresh (refresh token flow)
- **`schemas.py`**: Pydantic validation completa
  - Password strength validation (8+ chars, complexity)
  - Professional fields validation
  - Custom validators per names, phone, timezone
- **`services.py`**: Business logic autenticazione
  - Account locking dopo 5 tentativi falliti
  - Auto-verification in development mode
  - Bcrypt password hashing
- **`dependencies.py`**: RBAC (Role-Based Access Control)
  - Progressive authorization chain
  - Factory pattern per role requirements

**3. User Management (`/backend/app/users/`)**
- **`models.py`**: User e Child models con specializzazione ASD
- **`routes.py`**: Router modulare con sub-routing
- **`profile_routes.py`**: Profile management endpoints
- **`children_routes.py`**: CRUD completo bambini con security
- **`schemas.py`**: Validation schemas per users e children
- **`services.py`**: Business logic layer

**4. Reports & Analytics (`/backend/app/reports/`)**
- **`models.py`**: GameSession model per tracking ASD
  - Timing e durata sessioni
  - Metriche performance (score, interactions, help_requests)
  - Tracking comportamentale (emotional_data, interaction_patterns)
  - Input genitori/caregiver (parent_notes, parent_rating)
- **`routes.py`**: Analytics endpoints
- **`clinical_analytics.py`**: Professional analytics service
- **`schemas.py`**: Report validation schemas

**5. Professional Features (`/backend/app/professional/`)**
- **`routes.py`**: Endpoint professionisti sanitari
- Professional profile management
- Patient search e assignment capabilities

**6. API Gateway (`/backend/app/api/`)**
- **`main.py`**: Router principale con versioning `/api/v1`
- **`v1/api.py`**: Global exception handling
- Gestori errori centralizzati per tutte le API

**FRONTEND MODULES (React 18.2.0 + Create React App)**

**1. Application Core (`/frontend/src/`)**
- **`App.jsx`**: Componente principale con routing
- **`index.js`**: Entry point React DOM
- **`App.css`**: Global styling

**2. Pages (`/frontend/src/pages/`)**
- **Authentication Pages**:
  - `LoginPage.jsx`: Form login con validation
  - `RegisterPage.jsx`: Registrazione multi-ruolo (parent/professional)
  - `ForgotPasswordPage.jsx`: Password reset flow
  - `ResetPasswordPage.jsx`: Password reset confirmation
- **Dashboard Pages**:
  - `DashboardPage.jsx`: Dashboard contestuale per ruolo utente
  - `AdminDashboardPage.jsx`: Dashboard amministratore
- **User Management Pages**:
  - `ProfilePage.jsx`: Gestione profilo utente
  - `ProfessionalProfilePage.jsx`: Profilo professionista sanitario
  - `ProfessionalSearchPage.jsx`: Ricerca professionisti
- **Children Management Pages**:
  - `ChildrenListPage.jsx`: Lista bambini con filtering
  - `ChildDetailPage.jsx`: Dettaglio profilo bambino
  - `ChildCreatePage.jsx`: Creazione nuovo profilo bambino
  - `ChildEditPage.jsx`: Modifica profilo bambino
  - `ChildProgressPage.jsx`: Visualizzazione progressi
  - `ChildActivitiesPage.jsx`: Gestione attività bambino
- **Reports Pages**:
  - `ReportsPage.jsx`: Analytics e reporting
  - `ReportsPageNew.jsx`: Enhanced reporting interface
- **Utility Pages**:
  - `UnauthorizedPage.jsx`: 403 error page
  - `NotFoundPage.jsx`: 404 error page

**3. Components (`/frontend/src/components/`)**

**Authentication Components (`/components/Auth/`)**
- **`AuthProfileModal.jsx`**: Modal per gestione profilo auth
- **`EmailVerificationStatus.jsx`**: Status verifica email
- **`ProtectedRoute.jsx`**: Route protection per autorizzazione

**Children Management Components (`/components/Children/`)**
- Componenti specializzati per gestione profili bambini ASD

**Admin Components (`/components/admin/`)**
- Componenti per funzionalità amministrative

**Common Components (`/components/common/`)**
- Componenti UI riutilizzabili

**Profile Components (`/components/Profile/`)**
- Gestione profili utente

**Reports Components (`/components/Reports/`)**
- Visualizzazione analytics e report

**UI Components (`/components/UI/`)**
- Libreria componenti UI personalizzati

**Specialized ASD Components**:
- **`ASDAssessmentTool.jsx`**: Tool valutazione ASD
- **`SensoryProfileEditor.jsx`**: Editor profilo sensoriale
- **`SessionTracker.jsx`**: Tracking sessioni di gioco
- **`ProgressCharts.jsx`**: Visualizzazione progressi
- **`PhotoUpload.jsx`**: Upload foto profilo
- **`AdvancedSearchFilter.jsx`**: Filtri ricerca avanzati
- **`BulkActionToolbar.jsx`**: Azioni bulk per amministratori

**4. Services (`/frontend/src/services/`)**
- API communication layer con axios
- Theme service per UI customization

**5. Contexts (`/frontend/src/contexts/`)**
- **`AuthContext.jsx`**: Context per stato autenticazione globale

**6. Hooks (`/frontend/src/hooks/`)**
- **`useAuth.js`**: Custom hook per gestione autenticazione

**7. Utils (`/frontend/src/utils/`)**
- Utility functions condivise

**8. Styles (`/frontend/src/styles/`)**
- Styling modules e temi

**9. Config (`/frontend/src/config/`)**
- Configurazione frontend

#### 6.2.2 Altri Sistemi Software Necessari

**1. Database Management System:**
- **PostgreSQL 15-alpine**: Database relazionale principale
- **SQLAlchemy 2.0.23**: ORM Python con async support
- **Alembic 1.13.1**: Database migrations management
- **psycopg2-binary 2.9.9**: PostgreSQL adapter per Python

**2. Web Application Framework:**
- **FastAPI 0.104.1**: Backend API framework
- **Uvicorn 0.24.0**: ASGI server per production
- **Pydantic 2.5.0**: Data validation e serialization

**3. Frontend Framework:**
- **React 18.2.0**: Frontend library
- **React DOM 18.2.0**: DOM rendering
- **React Router DOM 6.30.1**: Client-side routing
- **Create React App (react-scripts 5.0.1)**: Build tooling

**4. Authentication & Security:**
- **python-jose 3.3.0**: JWT token management
- **passlib 1.7.4**: Password hashing library
- **bcrypt 4.1.2**: Secure password hashing

**5. HTTP Client & Communication:**
- **axios 1.10.0**: HTTP client per frontend-backend communication
- **httpx 0.25.2**: Async HTTP client per backend

**6. Data Visualization:**
- **recharts 2.15.3**: Charts library per analytics dashboard

**7. Development Tools:**
- **eslint 9.28.0**: Code quality linting
- **prettier 3.5.3**: Code formatting
- **pytest 7.4.3**: Testing framework
- **black 23.11.0**: Python code formatting

**8. Containerization & Deployment:**
- **Docker**: Container platform
- **Docker Compose**: Multi-service orchestration
- **Redis 7-alpine**: Cache layer (configurato, non implementato)

**9. Environment Management:**
- **python-dotenv 1.0.0**: Environment variables loading
- **pydantic-settings 2.1.0**: Settings management

**10. CORS & Middleware:**
- **fastapi-cors 0.0.6**: Cross-Origin Resource Sharing

---

## ASPETTI IMPLEMENTATIVI

### Architettura Component-Based React

#### Struttura Gerarchica Componenti

**1. App Level Components:**

**`/src/App.jsx`** - **Componente Radice**
- **Descrizione**: Componente principale che gestisce routing globale, theme initialization e context providers
- **Responsabilità**: Router setup, AuthProvider wrapping, theme service initialization
- **Integra**: BrowserRouter, Routes, AuthContext, themeService

**`/src/index.js`** - **Entry Point**
- **Descrizione**: Punto di ingresso applicazione React, monta App component nel DOM
- **Responsabilità**: ReactDOM.render, StrictMode setup

#### Page Components (Route-Level)

**Authentication Flow:**

**`/src/pages/auth/LoginPage.jsx`**
- **Descrizione**: Pagina login con form validation e error handling integrato
- **Features**: Auto-redirect post-login, remember me functionality, social login preparato
- **State Management**: Local form state + AuthContext integration

**`/src/pages/auth/RegisterPage.jsx`**
- **Descrizione**: Registrazione multi-ruolo con wizard step-by-step per professionisti
- **Features**: Role selection (PARENT/PROFESSIONAL), conditional fields, email verification trigger
- **Validation**: Real-time password strength, professional license validation

**`/src/pages/auth/ForgotPasswordPage.jsx`**
- **Descrizione**: Password reset request con email validation
- **Flow**: Email input → API call → confirmation message

**`/src/pages/auth/ResetPasswordPage.jsx`**
- **Descrizione**: Password reset completion con token validation
- **Security**: Token expiration handling, password strength requirements

**Dashboard Components:**

**`/src/pages/DashboardPage.jsx`**
- **Descrizione**: Dashboard principale context-aware basato su ruolo utente (parent/professional/admin)
- **Dynamic Content**: Conditional rendering basato su user.role
- **Data Sources**: Multiple API endpoints per statistics

**`/src/pages/AdminDashboardPage.jsx`**
- **Descrizione**: Dashboard amministrativo con metrics system-wide e user management
- **Features**: User statistics, system health, bulk operations
- **Access Control**: Require ADMIN role

**User Management:**

**`/src/pages/ProfilePage.jsx`**
- **Descrizione**: Gestione profilo utente con photo upload e settings personali
- **Editable Fields**: Personal info, preferences, security settings
- **Integration**: PhotoUpload component, theme preferences

**`/src/pages/ProfessionalProfilePage.jsx`**
- **Descrizione**: Profilo specializzato per professionisti sanitari con license management
- **Professional Fields**: License number, specialization, clinic info, patient capacity
- **Verification**: License validation, certification upload

**`/src/pages/ProfessionalSearchPage.jsx`**
- **Descrizione**: Ricerca e filtro professionisti con geolocation e specialization filters
- **Search Features**: Advanced filtering, location-based search, availability status
- **Components Used**: AdvancedSearchFilter, pagination

**Children Management (ASD-Specialized):**

**`/src/pages/ChildrenListPage.jsx`**
- **Descrizione**: Lista bambini con filtering, sorting e bulk actions per genitori
- **Features**: Quick stats per child, activity summary, progress indicators
- **Bulk Operations**: BulkActionToolbar integration per multiple selections

**`/src/pages/ChildDetailPage.jsx`**
- **Descrizione**: Vista dettagliata profilo bambino con comprehensive ASD information
- **Sections**: Basic info, sensory profile, medical history, game preferences
- **Navigation**: Quick access a activities, progress, sessions

**`/src/pages/ChildCreatePage.jsx`**
- **Descrizione**: Wizard creazione nuovo profilo bambino con ASD-specific fields
- **Multi-Step Form**: Basic info → Medical history → Sensory preferences → Game settings
- **Validation**: Age-appropriate settings, required medical fields

**`/src/pages/ChildEditPage.jsx`**
- **Descrizione**: Modifica profilo bambino con change tracking e approval workflow
- **Change Management**: Field-level change tracking, parent approval per medical changes
- **Integration**: SensoryProfileEditor per detailed sensory customization

**`/src/pages/ChildProgressPage.jsx`**
- **Descrizione**: Visualizzazione progressi bambino con charts interattivi e timeline
- **Visualization**: ProgressCharts component, milestone tracking, comparative analytics
- **Time Ranges**: Daily, weekly, monthly progress views

**`/src/pages/ChildActivitiesPage.jsx`**
- **Descrizione**: Gestione attività bambino con scheduling e progress tracking
- **Activity Management**: Assign activities, schedule sessions, track completion
- **Integration**: Calendar view, activity recommendations

**Analytics & Reporting:**

**`/src/pages/ReportsPage.jsx`**
- **Descrizione**: Sistema reporting con charts interattivi e export functionality
- **Report Types**: Progress reports, behavioral analysis, clinical summaries
- **Export**: PDF generation, data export per professional use

**`/src/pages/ReportsPageNew.jsx`**
- **Descrizione**: Enhanced reporting interface con real-time analytics
- **Advanced Features**: Custom date ranges, comparative analysis, trend detection
- **Professional Tools**: Clinical insights, treatment recommendations

#### Specialized Components

**ASD-Specific UI Components:**

**`/src/components/ASDAssessmentTool.jsx`**
- **Descrizione**: Tool interattivo per assessment ASD con scoring automatico e recommendations
- **Assessment Areas**: Communication, social interaction, repetitive behaviors
- **Output**: Structured assessment results, progress tracking

**`/src/components/SensoryProfileEditor.jsx`**
- **Descrizione**: Editor avanzato per profilo sensoriale con visual preferences e triggers
- **Sensory Categories**: Visual, auditory, tactile, vestibular, proprioceptive
- **Customization**: Individual sensitivity levels, trigger identification, coping strategies

**`/src/components/SessionTracker.jsx`**
- **Descrizione**: Real-time tracking sessioni di gioco con behavioral observations
- **Tracking Features**: Duration, interactions, emotional states, help requests
- **Parent Input**: Real-time notes, behavior observations, session rating

**`/src/components/ProgressCharts.jsx`**
- **Descrizione**: Visualizzazione progressi con multiple chart types e comparative analysis
- **Chart Types**: Line charts (progress over time), bar charts (activity completion), radar charts (skill areas)
- **Interactivity**: Zoom, filter, export, drill-down capabilities

**Authentication & Security Components:**

**`/src/components/Auth/ProtectedRoute.jsx`**
- **Descrizione**: Route wrapper per authorization con role-based access control
- **Access Control**: Role verification, active user check, email verification status
- **Redirect Logic**: Automatic redirect a login o unauthorized pages

**`/src/components/Auth/AuthProfileModal.jsx`**
- **Descrizione**: Modal per quick profile actions senza full page navigation
- **Quick Actions**: Profile summary, quick edit, logout, role switching

**`/src/components/Auth/EmailVerificationStatus.jsx`**
- **Descrizione**: Status indicator per email verification con resend functionality
- **States**: Pending, verified, expired, failed
- **Actions**: Resend verification, manual verification check

**Utility & Common Components:**

**`/src/components/PhotoUpload.jsx`**
- **Descrizione**: Component upload foto con crop, resize e preview functionality
- **Features**: Drag & drop, image preview, automatic resize, format validation
- **Security**: File type validation, size limits, virus scanning preparation

**`/src/components/AdvancedSearchFilter.jsx`**
- **Descrizione**: Sistema filtri avanzati con dynamic field generation e saved searches
- **Filter Types**: Text search, date ranges, multi-select, location-based
- **Persistence**: Save filter presets, recent searches, quick filters

**`/src/components/BulkActionToolbar.jsx`**
- **Descrizione**: Toolbar per operazioni bulk con confirmation dialogs e progress tracking
- **Operations**: Bulk edit, delete, export, assign, status change
- **Safety**: Confirmation dialogs, undo functionality, operation logging

**`/src/components/UI/`** - **UI Component Library**
- **Descrizione**: Libreria componenti UI custom per consistency design
- **Components**: Buttons, modals, forms, inputs, cards, navigation
- **Theming**: ASD-friendly color schemes, accessibility features

#### Services & Utilities

**`/src/services/`** - **API Communication Layer**
- **Descrizione**: Centralizzazione chiamate API con error handling e caching
- **Features**: Axios interceptors, token management, retry logic
- **Modules**: authService, userService, childrenService, reportsService

**`/src/contexts/AuthContext.jsx`**
- **Descrizione**: Global state management per autenticazione con persistence
- **State**: Current user, login status, permissions, preferences
- **Actions**: Login, logout, refresh token, update profile

**`/src/hooks/useAuth.js`**
- **Descrizione**: Custom hook per access AuthContext con utility functions
- **Utilities**: hasRole(), isAuthenticated(), requireAuth(), logout()
- **Integration**: Automatic token refresh, session management

### Database Architecture

#### Models Implementati

**User Model (`/backend/app/auth/models.py`)**
- **Unified Model**: Supporta multiple roles in single table
- **Security Fields**: password hashing, failed login tracking, account locking
- **Professional Fields**: license_number, specialization, clinic info per PROFESSIONAL role

**Child Model (`/backend/app/users/models.py`)**
- **ASD Specialization**: Sensory preferences, autism level, communication methods
- **Gamification**: Points, levels, achievements tracking
- **Medical Integration**: Medical history, triggers, calming strategies

**GameSession Model (`/backend/app/reports/models.py`)**
- **Comprehensive Tracking**: Duration, interactions, emotional data, parent observations
- **Behavioral Analytics**: Interaction patterns, help requests, completion status
- **Clinical Data**: Exit reasons, achievement tracking, progress markers

#### API Endpoints Structure

**Authentication Endpoints (`/api/v1/auth/`)**
- `POST /auth/register` - Multi-role registration
- `POST /auth/login` - Login con failed attempts protection
- `POST /auth/refresh` - Token refresh flow

**User Management (`/api/v1/users/`)**
- `GET /users/dashboard` - Role-specific dashboard data
- `GET /users/profile` - User profile management
- `PUT /users/profile` - Profile updates

**Children Management (`/api/v1/users/children/`)**
- `GET /children` - Lista bambini con ownership verification
- `POST /children` - Creazione profilo bambino
- `GET /children/{id}` - Dettaglio bambino
- `PUT /children/{id}` - Aggiornamento profilo

**Reports & Analytics (`/api/v1/reports/`)**
- `GET /reports/dashboard` - Statistics dashboard
- `GET /reports/child/{id}/progress` - Child progress reports
- `POST /reports/session` - Game session tracking

**Professional Features (`/api/v1/professional/`)**
- `GET /professional/search` - Professional search
- `GET /professional/profile` - Professional profile management

### Security Implementation

#### Multi-Level Authorization
1. **JWT Token Validation** - Signature e expiration check
2. **User Active Check** - Account status verification
3. **Email Verification** - Verified users requirement
4. **Role-Based Access** - Granular permissions per endpoint
5. **Resource Ownership** - Parents access only own children

#### Data Protection
- **Password Security**: Bcrypt hashing, strength validation
- **Account Protection**: Failed login tracking, automatic lockout
- **Data Privacy**: GDPR-ready data handling, soft deletes
- **Audit Trail**: Comprehensive logging per operations

### Performance Optimizations

#### Database Layer
- **Connection Pooling**: 20 base connections + 30 overflow
- **Optimized Indexes**: Strategic indexing per frequent queries
- **Query Optimization**: Efficient filtering, pagination, lazy loading

#### Frontend Performance
- **Component Optimization**: React.memo, useMemo, useCallback
- **Code Splitting**: Lazy loading per routes e components
- **Bundle Optimization**: Create React App optimizations

#### Caching Strategy (Ready for Implementation)
- **Redis Integration**: Container configurato, client da implementare
- **Session Caching**: JWT stateless attuale, Redis sessions future
- **API Response Caching**: Query result caching per analytics

### Development Workflow

#### Code Quality
- **Linting**: ESLint configurato con React rules
- **Formatting**: Prettier per code consistency
- **Testing**: Jest e React Testing Library setup

#### Deployment
- **Containerization**: Docker multi-service setup
- **Environment Management**: .env files per configuration
- **Database Migrations**: Alembic per schema evolution

Questa documentazione riflette accuratamente lo stato attuale del progetto Smile Adventure, distinguendo tra componenti implementati, configurati e pianificati per sviluppi futuri.
