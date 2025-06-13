# Smile Adventure - Piano di Sviluppo Frontend

## 1. Introduzione

Questo documento delinea il piano di sviluppo per l'interfaccia frontend dell'applicazione Smile Adventure. L'obiettivo è creare un'applicazione React intuitiva, performante e facile da mantenere, che interagisca con il backend FastAPI documentato.

**Stack Tecnologico Proposto:**

*   **Libreria UI:** React (v18+) con Hooks
*   **Routing:** `react-router-dom` (v6+)
*   **Gestione dello Stato:** React Context API (per stato globale come autenticazione e dati utente), stato locale dei componenti (`useState`, `useReducer`).
*   **Chiamate API:** `axios` (per la sua facilità d'uso con interceptors per token JWT e gestione errori).
*   **Styling:** CSS Modules o Styled Components (per manutenibilità e scoping degli stili). Inizialmente si può partire con CSS semplice.
*   **Type Checking (JavaScript):** JSDoc per documentare tipi e interfacce, garantendo chiarezza e manutenibilità del codice.
*   **Linting/Formatting:** ESLint, Prettier.

## 2. Struttura del Progetto Frontend

Si propone una struttura di progetto semplice e organizzata per funzionalità/tipo di file:

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
│   └── ... (altre risorse statiche)
├── src/
│   ├── App.js                     # Componente principale, setup del routing
│   ├── index.js                   # Entry point dell'applicazione React
│   ├── assets/                    # Immagini, font, icone SVG, etc.
│   ├── components/                # Componenti UI riutilizzabili e specifici
│   │   ├── Auth/                  # Componenti per Login, Register forms
│   │   ├── UI/                    # Componenti generici: Button, Input, Modal, Card, Spinner, Layout
│   │   ├── Dashboard/             # Componenti per le diverse viste della dashboard (Parent, Professional, Admin)
│   │   ├── Children/              # Componenti per CRUD e visualizzazione bambini (es. ChildForm, ChildCard, ChildDetails)
│   │   ├── Professional/          # Componenti per il profilo e la ricerca dei professionisti
│   │   └── Reports/               # Componenti per la visualizzazione di report e analytics
│   ├── contexts/                  # React Contexts per la gestione dello stato globale
│   │   ├── AuthContext.js         # Gestione autenticazione, utente corrente, token, ruoli
│   │   └── ... (altri contesti se necessari, es. ThemeContext)
│   ├── hooks/                     # Custom React hooks riutilizzabili
│   │   ├── useAuth.js             # Hook per accedere facilmente all'AuthContext
│   │   ├── useApi.js              # Hook wrapper per le chiamate API (opzionale, per gestione loading/error state)
│   │   └── ... (altri hooks custom)
│   ├── pages/                     # Componenti che rappresentano le viste/pagine complete dell'applicazione
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── PasswordResetRequestPage.js
│   │   ├── PasswordResetConfirmPage.js
│   │   ├── DashboardPage.js         # Pagina dinamica che renderizza la dashboard corretta in base al ruolo
│   │   ├── UserProfilePage.js       # Pagina per visualizzare e modificare il profilo utente
│   │   ├── ChildrenListPage.js      # Lista bambini (per Parent)
│   │   ├── ChildDetailPage.js       # Dettaglio, attività e progressi di un bambino (per Parent)
│   │   ├── ChildCreateEditPage.js   # Form per creare o modificare un bambino (per Parent)
│   │   ├── ProfessionalProfilePage.js # Pagina per gestire il profilo professionale (per Professional)
│   │   ├── ProfessionalSearchPage.js # Pagina per la ricerca di professionisti
│   │   ├── ReportsOverviewPage.js   # Pagina principale per i report (potrebbe differire per ruolo)
│   │   ├── ChildProgressReportPage.js # Report specifico sui progressi di un bambino
│   │   ├── ClinicalAnalyticsPage.js # Pagina per le analytics cliniche (per Professional)
│   │   ├── AdminDashboardPage.js    # Dashboard specifica per Admin (se necessaria)
│   │   ├── AdminUserManagementPage.js # Pagina per la gestione utenti (per Admin)
│   │   └── NotFoundPage.js          # Pagina 404
│   ├── services/                  # Moduli per la logica delle chiamate API al backend
│   │   ├── axiosInstance.js       # Istanza Axios configurata (baseURL, interceptors)
│   │   ├── authService.js         # API per login, register, refresh token, password reset
│   │   ├── userService.js         # API per profilo utente, dashboard data
│   │   ├── childrenService.js     # API per CRUD bambini
│   │   ├── professionalService.js # API per profilo professionale, ricerca
│   │   ├── reportService.js       # API per report e analytics
│   │   └── adminService.js        # API per funzionalità admin (se necessarie)
│   ├── utils/                     # Funzioni di utilità, costanti, helpers
│   │   ├── constants.js           # Costanti (es. ruoli utente, tipi di status)
│   │   ├── helpers.js             # Funzioni helper generiche (formattazione date, validatori client-side)
│   │   └── protectedRoute.js      # Componente HOC per gestire le route protette
│   ├── config/                    # File di configurazione
│   │   └── apiConfig.js           # Configurazione URL base API e altri settaggi API
│   └── styles/                    # Stili globali, variabili CSS, reset CSS
│       ├── global.css
│       └── theme.css
├── .env                           # Variabili d'ambiente (es. REACT_APP_API_BASE_URL)
├── .gitignore
├── package.json
└── README.md
```

## 3. Funzionalità Principali e Schermate

Di seguito, le principali funzionalità e le relative schermate, con riferimenti agli endpoint API del backend e ai tipi di dati coinvolti.

### 3.1. Autenticazione

*   **`LoginPage.js`**
    *   **Descrizione:** Form per l'accesso degli utenti.
    *   **Campi:** Email, Password, "Ricordami".
    *   **API Endpoint:** `POST /auth/login`
    *   **Tipi Dati (JSDoc):**
        *   Request: `UserLogin` (email, password, remember_me)
        *   Response: `LoginResponse` (access_token, refresh_token, user: `User`)
*   **`RegisterPage.js`**
    *   **Descrizione:** Form per la registrazione di nuovi utenti (Parent/Professional).
    *   **Campi:** Dati `UserBase` (email, nome, cognome, telefono opzionale, timezone, lingua), password, conferma password, ruolo. Campi professionali (`license_number`, `specialization`, etc.) condizionali se ruolo = PROFESSIONAL.
    *   **API Endpoint:** `POST /auth/register`
    *   **Tipi Dati (JSDoc):**
        *   Request: `UserRegister`
        *   Response: `RegisterResponse` (user: `User`)
*   **`PasswordResetRequestPage.js` & `PasswordResetConfirmPage.js`**
    *   **Descrizione:** Flusso per il recupero password.
    *   **Fase 1 (`PasswordResetRequestPage.js`):** Input email per richiedere il token di reset.
        *   API Endpoint: (Backend ha `auth_password_reset_tokens` table, ipotizziamo) `POST /auth/request-password-reset`
        *   Request: `{ email: string }`
    *   **Fase 2 (`PasswordResetConfirmPage.js`):** Form per inserire nuova password e token (ricevuto via email).
        *   API Endpoint: (Ipotizziamo) `POST /auth/reset-password`
        *   Request: `{ token: string, new_password: string, new_password_confirm: string }` (simile a `PasswordChange` ma con token)
*   **Logout:**
    *   **Descrizione:** Funzione per disconnettere l'utente, invalidare il token JWT e pulire lo stato di autenticazione.
    *   **API Endpoint:** (Ipotizziamo) `POST /auth/logout` (se il backend supporta la revoca server-side del token/sessione) o gestione client-side.

### 3.2. Dashboard Utente

*   **`DashboardPage.js`**
    *   **Descrizione:** Pagina principale post-login, il cui contenuto varia in base al ruolo dell'utente (`PARENT`, `PROFESSIONAL`, `ADMIN`).
    *   **API Endpoint:** `GET /users/dashboard`
    *   **Tipi Dati (JSDoc):**
        *   Response (Parent): `ParentDashboardData` (total_children, total_activities, total_points, children_stats, recent_activities, weekly_progress)
        *   Response (Professional): `ProfessionalDashboardData` (assigned_patients, active_sessions, completed_assessments, clinical_insights, patient_progress)
        *   Response (Admin): `AdminDashboardData` (statistiche piattaforma, utenti, etc. - da definire in base alle necessità)
    *   **Componenti Interni:** `ParentDashboard.js`, `ProfessionalDashboard.js`, `AdminDashboard.js` (renderizzati condizionalmente).

### 3.3. Gestione Profilo Utente

*   **`UserProfilePage.js`**
    *   **Descrizione:** Visualizzazione e modifica dei dati del profilo dell'utente loggato.
    *   **API Endpoints:**
        *   Lettura: `GET /users/me` (ipotizzato, endpoint comune per ottenere dati utente loggato)
        *   Aggiornamento: `PUT /users/me` (ipotizzato)
    *   **Tipi Dati (JSDoc):**
        *   Lettura: `User`
        *   Aggiornamento (Request): `UserUpdate` (sottoinsieme di `UserBase` con campi modificabili)
    *   **Funzionalità Aggiuntiva:** Cambio Password.
        *   API Endpoint: `POST /auth/change-password` (ipotizzato, o parte di `PUT /users/me`)
        *   Request: `PasswordChange` (current_password, new_password, new_password_confirm)

### 3.4. Gestione Bambini (Ruolo: PARENT)

*   **`ChildrenListPage.js`**
    *   **Descrizione:** Lista dei bambini associati al genitore loggato.
    *   **API Endpoint:** `GET /children` (parametri: `include_inactive`)
    *   **Tipi Dati (JSDoc):** Response: `ChildResponse[]`
    *   **Azioni:** Link per creare nuovo bambino, visualizzare dettaglio, modificare, eliminare (soft delete).
*   **`ChildCreateEditPage.js`**
    *   **Descrizione:** Form per la creazione o la modifica dei dati di un bambino.
    *   **API Endpoints:**
        *   Creazione: `POST /children`
        *   Modifica: `PUT /children/{child_id}`
    *   **Tipi Dati (JSDoc):**
        *   Request (Creazione): `ChildCreate`
        *   Request (Modifica): `ChildUpdate`
        *   Response: `ChildResponse`
*   **`ChildDetailPage.js`**
    *   **Descrizione:** Vista dettagliata del profilo di un bambino, inclusi attività e progressi.
    *   **API Endpoint:** `GET /children/{child_id}`
    *   **Tipi Dati (JSDoc):** Response: `ChildResponse`
    *   **Contenuto:** Dati anagrafici, profili sensoriali, informazioni cliniche, storico sessioni di gioco, report progressi.

### 3.5. Gestione Profilo Professionale (Ruolo: PROFESSIONAL)

*   **`ProfessionalProfilePage.js`**
    *   **Descrizione:** Creazione, visualizzazione e modifica del profilo professionale.
    *   **API Endpoints:**
        *   Creazione: `POST /professional/professional-profile`
        *   Lettura: `GET /professional/professional-profile`
        *   Aggiornamento: `PUT /professional/professional-profile`
    *   **Tipi Dati (JSDoc):**
        *   Request (Creazione): `ProfessionalProfileCreate`
        *   Request (Modifica): `ProfessionalProfileUpdate`
        *   Response: `ProfessionalProfileResponse`

### 3.6. Ricerca Professionisti

*   **`ProfessionalSearchPage.js`**
    *   **Descrizione:** Pagina per cercare professionisti sanitari. Accessibile agli utenti verificati.
    *   **API Endpoint:** `GET /professional/professionals/search`
    *   **Parametri Query:** `specialty`, `location`, `accepting_patients`, `limit`.
    *   **Tipi Dati (JSDoc):** Response: `ProfessionalSearchResultItem[]` (da definire, probabilmente un sottoinsieme di `ProfessionalProfileResponse`).

### 3.7. Report e Analytics

*   **`ReportsOverviewPage.js`** (potrebbe essere integrata nella `DashboardPage` o essere una sezione a sé)
    *   **Descrizione:** Hub centrale per accedere ai vari report, differenziato per ruolo.
*   **`ChildProgressReportPage.js` (Ruolo: PARENT)**
    *   **Descrizione:** Visualizzazione dei report di progresso per un bambino specifico.
    *   **API Endpoint:** `GET /reports/child/{child_id}/progress` (parametro: `days`)
    *   **Tipi Dati (JSDoc):** Response: `ChildProgressResponse` (child info, period, activities_by_type, daily_points).
*   **`ClinicalAnalyticsPage.js` (Ruolo: PROFESSIONAL)**
    *   **Descrizione:** Visualizzazione delle analytics cliniche.
    *   **API Endpoint:** `GET /professional/clinical/analytics` (basato su `professional/routes.py` e `ClinicalAnalyticsService`).
    *   **Tipi Dati (JSDoc):** Strutture dati come `ClinicalMetrics`, `PatientCohort`, `ClinicalInsight` per visualizzare i dati ricevuti. La risposta API potrebbe aggregare queste informazioni.

### 3.8. Integrazione Sessioni di Gioco

*   **Descrizione:** Il frontend non implementa il gioco, ma visualizza i dati delle sessioni di gioco registrate dal backend.
*   **Visualizzazione:** I dati delle `GameSession` (descritti in `reports/models.py` del backend) saranno parte dei report di progresso del bambino e potenzialmente nelle analytics cliniche.
*   **Tipi Dati (JSDoc):** `GameSession` (per interpretare i campi `emotional_data`, `interaction_patterns`, etc.).

### 3.9. Funzionalità Admin (Ruolo: ADMIN)

*   **`AdminDashboardPage.js`**
    *   **Descrizione:** Dashboard per amministratori con statistiche e link a funzionalità di gestione.
    *   **API Endpoint:** Parte di `GET /users/dashboard` o endpoint dedicato `GET /admin/dashboard-data`.
*   **`AdminUserManagementPage.js`**
    *   **Descrizione:** Interfaccia per visualizzare, modificare (ruolo, stato) e gestire gli utenti della piattaforma.
    *   **API Endpoints:** (Ipotizzati)
        *   Lista Utenti: `GET /admin/users`
        *   Modifica Utente: `PUT /admin/users/{user_id}`
        *   Elimina Utente: `DELETE /admin/users/{user_id}`
    *   **Tipi Dati (JSDoc):** `User[]`, `UserUpdateByAdmin`.

## 4. Gestione dello Stato (React Context API)

*   **`AuthContext.js`:**
    *   **Stato:** `currentUser` (oggetto `User`), `token` (JWT), `isAuthenticated` (boolean), `userRole` (`UserRole` enum), `isLoading` (boolean).
    *   **Azioni:** `login(credentials)`, `register(userData)`, `logout()`, `loadUserFromToken()`, `refreshToken()`.
    *   Fornirà questi dati e funzioni ai componenti figli tramite un `AuthProvider`.
*   **Stato Locale:** `useState` e `useReducer` saranno usati per gestire lo stato dei form, UI temporanea, dati specifici di pagina non globali.

## 5. Chiamate API (`services/` con `axios`)

*   **`axiosInstance.js`:** Configurazione centrale di Axios.
    *   `baseURL`: `process.env.REACT_APP_API_BASE_URL` (es. `http://localhost:8000/api/v1`).
    *   **Interceptors:**
        *   Request Interceptor: Per allegare automaticamente il token JWT (`Authorization: Bearer <token>`) alle richieste protette.
        *   Response Interceptor: Per la gestione globale degli errori API (es. 401 per token scaduto -> tentativo di refresh o logout; 403 -> redirect a pagina non autorizzato; 5xx -> messaggio di errore generico). E per il refresh automatico del token.
*   **Moduli di Servizio (es. `authService.js`, `childrenService.js`):**
    *   Ogni modulo esporrà funzioni asincrone che incapsulano le chiamate API per una specifica risorsa.
    *   Esempio (`authService.js`):
        ```javascript
        // import axiosInstance from './axiosInstance';
        // import { API_ENDPOINTS } from '../config/apiConfig';

        /**
         * @param {UserLoginRequest} credentials
         * @returns {Promise<LoginResponse>}
         */
        // export const login = async (credentials) => {
        //   const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, credentials);
        //   return response.data;
        // };
        ```

## 6. Routing (`react-router-dom`)

*   **`App.js`:** Configurazione principale delle `Routes`.
*   **`ProtectedRoute.js` (o `PrivateRoute`):** Componente HOC o wrapper per proteggere le route che richiedono autenticazione e/o ruoli specifici.
    *   Verifica `isAuthenticated` e `userRole` da `AuthContext`.
    *   Redirect a `/login` se non autenticato, o a una pagina "Non Autorizzato" se il ruolo non corrisponde.
*   **Definizione Route Esempio:**
    ```javascript
    // <Routes>
    //   {/* Public Routes */}
    //   <Route path="/login" element={<LoginPage />} />
    //   <Route path="/register" element={<RegisterPage />} />

    //   {/* Protected Routes */}
    //   <Route path="/dashboard" element={<ProtectedRoute roles={[UserRole.PARENT, UserRole.PROFESSIONAL, UserRole.ADMIN]}><DashboardPage /></ProtectedRoute>} />
    //   <Route path="/children" element={<ProtectedRoute roles={[UserRole.PARENT]}><ChildrenListPage /></ProtectedRoute>} />
    //   <Route path="/children/new" element={<ProtectedRoute roles={[UserRole.PARENT]}><ChildCreateEditPage mode="create" /></ProtectedRoute>} />
    //   {/* ... altre routes */}
    //   <Route path="*" element={<NotFoundPage />} />
    // </Routes>
    ```

## 7. Componenti UI Riutilizzabili (`components/UI/`)

Sarà sviluppata una libreria di componenti UI generici per mantenere consistenza e accelerare lo sviluppo:

*   `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioButton`
*   `Modal`, `Card`, `Spinner` (o `Loader`), `Alert` (o `Notification`)
*   `Layout` (componente per la struttura base della pagina, es. con Navbar, Sidebar se necessaria)
*   `FormWrapper` (componente per gestire la logica comune dei form, opzionale)
*   `Table`, `Pagination`
*   `DatePicker`

## 8. Tipi e Interfacce (JSDoc)

Si utilizzerà JSDoc per definire i tipi di dati basati sugli schemi Pydantic del backend. Questo migliorerà la leggibilità e la manutenibilità del codice JavaScript.

**Esempi di Tipi Chiave da Definire:**

*   `UserRole`: `'PARENT' | 'PROFESSIONAL' | 'ADMIN' | 'SUPER_ADMIN'`
*   `UserStatus`: `'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'DELETED'`
*   `UserBase`: `{ email: string, first_name: string, last_name: string, phone?: string, timezone: string, language: string }`
*   `UserRegister`: `UserBase & { password: string, password_confirm: string, role: UserRole, license_number?: string, ... }`
*   `UserLoginRequest`: `{ email: string, password: string, remember_me?: boolean }`
*   `User`: `UserBase & { id: number, role: UserRole, status: UserStatus, is_active: boolean, is_verified: boolean, ... }` (modello completo)
*   `LoginResponse`: `{ access_token: string, token_type: string, refresh_token: string, user: User }`
*   `ChildBase`, `ChildCreate`, `ChildUpdate`, `ChildResponse`
*   `GameSession` (struttura dettagliata come da backend)
*   `ProfessionalProfileCreate`, `ProfessionalProfileUpdate`, `ProfessionalProfileResponse`
*   `ClinicalMetrics`, `PatientCohort`, `ClinicalInsight`
*   `PasswordChange`: `{ current_password: string, new_password: string, new_password_confirm: string }`

Questi tipi saranno usati nei commenti JSDoc per parametri di funzione, valori di ritorno e props dei componenti.

## 9. Considerazioni Aggiuntive

*   **Gestione Errori:** Oltre agli interceptor Axios, i componenti mostreranno messaggi di errore specifici all'utente (es. validazione form, errori di rete).
*   **Performance:** Ottimizzazione dei render (es. `React.memo`), code splitting per route, lazy loading di componenti/immagini pesanti.
*   **Accessibilità (a11y):** Aderenza agli standard WCAG (uso di HTML semantico, attributi ARIA, navigazione da tastiera).
*   **Internazionalizzazione (i18n):** Inizialmente non prioritario, ma la struttura dovrebbe permettere una facile integrazione futura (es. con `i18next`).
*   **Testing:**
    *   **Unit Tests:** Per funzioni helper, custom hooks e logica di business nei services (con Jest).
    *   **Component Tests:** Per componenti UI isolati (con React Testing Library e Jest).
    *   **Integration Tests:** Per flussi utente chiave (React Testing Library).

## 10. Piano di Implementazione (Fasi Suggerite)

1.  **Fase 1: Setup e Autenticazione di Base**
    *   Setup del progetto React (CRA o Vite), installazione dipendenze.
    *   Struttura base delle cartelle.
    *   Implementazione `AuthContext`.
    *   Implementazione `axiosInstance` con interceptors per token.
    *   Creazione pagine `LoginPage`, `RegisterPage`.
    *   Integrazione API per login e registrazione (`authService.js`).
    *   Setup routing di base e `ProtectedRoute`.
2.  **Fase 2: Dashboard e Profilo Utente**
    *   Creazione `DashboardPage` con logica per visualizzazione condizionale basata sul ruolo.
    *   Integrazione API per `GET /users/dashboard`.
    *   Creazione `UserProfilePage`.
    *   Integrazione API per lettura/aggiornamento profilo utente e cambio password.
3.  **Fase 3: Flusso PARENT - Gestione Bambini**
    *   Creazione pagine: `ChildrenListPage`, `ChildCreateEditPage`, `ChildDetailPage`.
    *   Implementazione `childrenService.js` per CRUD bambini.
    *   Sviluppo componenti UI per form e visualizzazione dati bambino.
4.  **Fase 4: Flusso PARENT - Report Bambini**
    *   Creazione `ChildProgressReportPage`.
    *   Implementazione `reportService.js` per API report progressi.
    *   Visualizzazione dati `GameSession` all'interno dei report.
5.  **Fase 5: Flusso PROFESSIONAL**
    *   Creazione `ProfessionalProfilePage` (CRUD profilo professionale).
    *   Implementazione `professionalService.js`.
    *   Creazione `ProfessionalSearchPage`.
    *   Creazione `ClinicalAnalyticsPage` e integrazione API.
6.  **Fase 6: Flusso ADMIN (se prioritario)**
    *   Sviluppo `AdminDashboardPage` e `AdminUserManagementPage`.
    *   Implementazione `adminService.js`.
7.  **Fase 7: Styling e UI/UX Refinement**
    *   Applicazione consistente dello styling scelto.
    *   Miglioramento dell'esperienza utente e della responsività.
    *   Revisione accessibilità.
8.  **Fase 8: Testing Approfondito**
    *   Scrittura di unit, component e integration test per coprire le funzionalità chiave.
9.  **Fase 9: Build e Preparazione al Deploy**
    *   Configurazione build di produzione.
    *   Verifiche finali.

Questo piano fornisce una roadmap per lo sviluppo del frontend. Sarà soggetto a revisioni e adattamenti man mano che il progetto avanza e emergono nuove necessità o chiarimenti.
