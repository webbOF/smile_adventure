# SMILE ADVENTURE - DOCUMENTAZIONE COMPLETA SISTEMA

## OVERVIEW ARCHITETTURALE

**Smile Adventure** è una piattaforma di apprendimento gamificata per bambini con ASD (Autism Spectrum Disorder), che offre supporto per visite dentali, sessioni terapeutiche e scenari sociali attraverso un'interfaccia interattiva e accessibile.

### Missione del Progetto
Fornire uno strumento digitale specializzato che permetta a bambini con disturbi dello spettro autistico di:
- **Preparazione Visite Dentali**: Familiarizzazione con ambienti e procedure mediche
- **Sessioni Terapeutiche**: Supporto per terapisti e genitori con tracking comportamentale
- **Scenari Sociali**: Simulazioni interattive per migliorare le competenze sociali
- **Progress Tracking**: Monitoraggio progressi per genitori e professionisti sanitari

### Stack Tecnologico Completo
- **Backend**: FastAPI 0.104.1 + Python 3.12
- **Frontend**: React 18.2.0 + Create React App
- **Database**: PostgreSQL 15 con SQLAlchemy 2.0.23
- **Autenticazione**: JWT con python-jose e bcrypt  
- **ORM**: SQLAlchemy con Alembic per migrations
- **Deployment**: Docker + Docker Compose
- **Cache**: Redis 7 (configurato, non implementato)
- **Testing**: Pytest + Jest (configurati)

---

## STRUTTURA COMPLETA DEL PROGETTO

```
smile_adventure/
├── backend/                    # Backend FastAPI Application
│   ├── main.py                # Entry point applicazione
│   ├── requirements.txt       # Dipendenze Python
│   ├── Dockerfile            # Container configuration
│   ├── docker-compose.yml    # Multi-service orchestration
│   ├── alembic.ini           # Database migration config
│   ├── alembic/              # Database migrations
│   │   ├── env.py            # Migration environment
│   │   └── versions/         # Migration files
│   ├── init-scripts/         # Database initialization
│   └── app/                  # Core application
│       ├── core/             # Configurazione e database core
│       ├── auth/             # Sistema autenticazione e autorizzazione
│       ├── users/            # Gestione utenti e bambini ASD
│       ├── reports/          # Analytics e reporting clinico
│       ├── professional/     # Funzionalità professionisti sanitari
│       └── api/              # API Gateway e versioning
│
├── frontend/                   # Frontend React Application
│   ├── public/               # Static assets
│   ├── build/                # Production build
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── pages/            # Route components
│   │   ├── services/         # API communication
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utility functions
│   │   └── styles/           # Styling
│   ├── package.json          # Dependencies e scripts
│   └── tests/                # Test files
│
└── docs/                      # Documentazione progetto
```

---

## CONFIGURAZIONE CORE (backend/app/core/)

### Settings e Configurazione (config.py)

La configurazione utilizza **Pydantic Settings** per gestire variabili ambiente con validazione automatica e type safety:

```python
class Settings(BaseSettings):
    # Application Configuration  
    APP_NAME: str = "Smile Adventure"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Sensory Learning Platform for Children"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
```

**Configurazioni Database (Ottimizzate per Performance ASD Platform)**:
- `DATABASE_POOL_SIZE: 20` - Pool connessioni aumentato per concurrent users
- `DATABASE_MAX_OVERFLOW: 30` - Overflow massimo per picchi di traffico terapeutico
- `DATABASE_POOL_TIMEOUT: 20s` - Timeout ridotto per sessioni interattive
- `DATABASE_POOL_RECYCLE: 1800s` - Riciclo connessioni ogni 30min per stabilità
- `DATABASE_POOL_PRE_PING: True` - Validazione connessioni automatica

**Sicurezza JWT Multi-Role**:
- `SECRET_KEY` - Chiave segreta per firma JWT (min 32 caratteri)
- `ACCESS_TOKEN_EXPIRE_MINUTES: 30` - Scadenza token per security
- `ALGORITHM: HS256` - Algoritmo firma JWT standard

**Configurazioni Sviluppo ASD-Friendly**:
- `AUTO_VERIFY_EMAIL: True` - Auto-verifica email in development per testing rapido
- `REQUIRE_EMAIL_VERIFICATION: False` - Bypass per testing ASD features
- `ALLOWED_HOSTS` - CORS permissivo per development cross-origin

### Database Layer (database.py)

**Engine SQLAlchemy con Configurazione Avanzata**:
```python
engine = create_engine(
    settings.DATABASE_URL,
    # Connection pooling per performance ASD platform
    poolclass=QueuePool,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_timeout=settings.DATABASE_POOL_TIMEOUT,
    pool_recycle=settings.DATABASE_POOL_RECYCLE,
    pool_pre_ping=settings.DATABASE_POOL_PRE_PING,
    # Performance ottimizzazioni
    isolation_level="READ_COMMITTED",
    echo=settings.DATABASE_ECHO,
    future=True  # SQLAlchemy 2.0 style
)
```

**Naming Convention Automatiche**:
- Primary Keys: `pk_%(table_name)s`
- Foreign Keys: `fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s`
- Unique Constraints: `uq_%(table_name)s_%(column_0_name)s`
- Check Constraints: `ck_%(table_name)s_%(constraint_name)s`

**Event Listeners per ASD Data Management**:
- `first_connect` - Log prima connessione database
- `before_commit` - Hook pre-commit per validazioni ASD-specific
- `after_commit` - Post-processing per session tracking

**Session Configuration**:
```python
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False  # Mantiene oggetti accessibili post-commit
)
```

---

## API GATEWAY E VERSIONING (backend/app/api/)

### Struttura API Versioning per ASD Platform

**API Gateway Centralizzato**:
- `main.py` - Router principale con prefisso `/api/v1`
- `v1/api.py` - Router v1 con gestione errori globale ASD-aware

### Endpoint Structure Specializzata

```
/api/v1/
├── auth/*              # Autenticazione multi-ruolo
│   ├── register        # Registrazione parent/professional
│   ├── login          # Login con failed attempts protection
│   ├── refresh        # Token refresh flow
│   └── verify         # Email verification
├── users/*            # Gestione utenti e profili
│   ├── dashboard      # Dashboard role-specific
│   ├── profile        # Profile management
│   └── children/      # Children management (ASD-specific)
│       ├── create     # Child profile creation
│       ├── list       # Children listing con ownership
│       ├── {id}/      # Individual child management
│       ├── sensory    # Sensory profiles management
│       └── progress   # Progress tracking
├── reports/*          # Analytics e reporting clinico
│   ├── dashboard      # Statistics dashboard
│   ├── sessions       # Game session analytics
│   ├── progress       # Child progress reports
│   └── clinical       # Professional clinical reports
├── professional/*     # Funzionalità professionisti sanitari
│   ├── profile        # Professional profile management
│   ├── search         # Professional search
│   ├── patients       # Patient assignment (future)
│   └── analytics      # Clinical analytics
└── games/*           # Game integration endpoints (future)
    ├── sessions       # Game session management
    ├── scenarios      # Scenario management
    └── achievements   # Achievement tracking
```

### Global Exception Handling ASD-Aware

**Gestori Errori Centralizzati** con logging appropriato per ambiente clinico:
```python
# Error handlers specializzati
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": "HTTPException",
                "status_code": exc.status_code,
                "message": exc.detail,
                "path": request.url.path,
                "method": request.method,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "request_id": getattr(request.state, "request_id", None)
            }
        }
    )
```

**Error Types Gestiti**:
- `HTTPException` - Errori HTTP standardizzati
- `RequestValidationError` - Validazione Pydantic con details
- `AuthenticationError` - Errori autenticazione (401)
- `AuthorizationError` - Errori autorizzazione (403) 
- `NotFoundError` - Risorse non trovate (404)
- `ASDDataValidationError` - Validazione dati ASD-specific

---

## SISTEMA AUTENTICAZIONE (backend/app/auth/)

### User Model Multi-Role (models.py)

**Modello User Centralizzato** che supporta diversi ruoli nel contesto ASD:

```python
class UserRole(enum.Enum):
    PARENT = "parent"              # Genitore/tutore di bambini ASD
    PROFESSIONAL = "professional"  # Professionista sanitario specializzato
    ADMIN = "admin"               # Amministratore sistema
    SUPER_ADMIN = "super_admin"   # Super amministratore con accesso completo

class UserStatus(enum.Enum):
    ACTIVE = "active"             # Account attivo
    INACTIVE = "inactive"         # Temporaneamente inattivo
    SUSPENDED = "suspended"       # Account sospeso per violazioni
    PENDING = "pending"           # In attesa di attivazione
    DELETED = "deleted"           # Soft delete per compliance GDPR
```

**Campi User Model Completi**:
```python
class User(Base):
    __tablename__ = "auth_users"
    
    # Identificazione primaria
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Informazioni personali
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Ruolo e stato sicurezza
    role = Column(Enum(UserRole), default=UserRole.PARENT, index=True)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING, index=True)
    is_active = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=False)
    
    # Tracking sicurezza avanzato
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    
    # Campi professionali (per PROFESSIONAL role)
    license_number = Column(String(100), nullable=True, index=True)
    specialization = Column(String(200), nullable=True)
    clinic_name = Column(String(200), nullable=True)
    clinic_address = Column(Text, nullable=True)
    
    # Timestamp automatici
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**Indici Database per Performance ASD Platform**:
```python
# Indici composti per query frequenti
Index('idx_user_email_status', User.email, User.status)
Index('idx_user_role_active', User.role, User.is_active)
Index('idx_user_created_at', User.created_at)
Index('idx_user_last_login', User.last_login_at)
Index('idx_professional_license', User.license_number)
```

### Auth Routes Multi-Role (routes.py)

**Endpoint Autenticazione con Security ASD-Aware**:

**POST /auth/register - Registrazione Multi-Role**:
```python
@router.post("/register", response_model=RegisterResponse)
async def register_user(
    user_data: UserRegister,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Registrazione nuovo utente con supporto ruoli specializzati ASD
    - PARENT: Genitore di bambini ASD
    - PROFESSIONAL: Terapista, medico, psicologo specializzato ASD
    """
```
- Validazione email univoca nel sistema
- Password strength validation (8+ chars, complexity)
- Campi professionali required per PROFESSIONAL role
- Email verification automatica in development
- Logging registrazione per audit trail

**POST /auth/login - Login con Protection**:
```python
@router.post("/login", response_model=LoginResponse)
async def login_user(
    user_credentials: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Login con failed attempts tracking e account lockout
    - Failed attempts protection (5 tentativi → 30min lock)
    - Session creation automatica
    - Role-based redirect preparation
    """
```

**POST /auth/refresh - Token Refresh Flow**:
```python
@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token senza re-login
    - Verifica refresh token validity
    - Genera nuovo access token
    - Mantiene session continuity per ASD user experience
    """
```

### Auth Schemas Pydantic v2 (schemas.py)

**Validazione Completa Multi-Role**:

```python
class UserBase(BaseModel):
    email: EmailStr                          # Validazione email automatica
    first_name: str = Field(min_length=2, max_length=100)
    last_name: str = Field(min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    timezone: str = Field(default="UTC", max_length=50)
    language: str = Field(default="en", max_length=10)
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_names(cls, v: str) -> str:
        """Validate names: only letters, spaces, hyphens, apostrophes, periods"""
        if not re.match(r"^[a-zA-ZÀ-ÿ\s\-'.]+$", v):
            raise ValueError("Invalid characters in name")
        return v.strip().title()
```

**UserRegister Schema con Professional Fields**:
```python
class UserRegister(UserBase):
    password: str = Field(min_length=8, max_length=128)
    password_confirm: str
    role: UserRoleSchema = Field(default=UserRoleSchema.PARENT)
    
    # Professional fields (opzionali per PARENT)
    license_number: Optional[str] = Field(None, max_length=100)
    specialization: Optional[str] = Field(None, max_length=200)
    clinic_name: Optional[str] = Field(None, max_length=200)
    clinic_address: Optional[str] = None
    
    @model_validator(mode='after')
    def validate_passwords_match(self) -> 'UserRegister':
        if self.password != self.password_confirm:
            raise ValueError("Passwords do not match")
        return self
    
    @model_validator(mode='after')
    def validate_professional_fields(self) -> 'UserRegister':
        if self.role == UserRoleSchema.PROFESSIONAL:
            if not self.license_number:
                raise ValueError("License number required for professionals")
        return self
```

**Password Validation Rules ASD-Friendly**:
1. **Lunghezza**: min 8, max 128 caratteri
2. **Complessità**: 
   - Almeno 1 maiuscola
   - Almeno 1 minuscola
   - Almeno 1 cifra
   - Caratteri speciali opzionali (user-friendly)
3. **Blacklist**: Password comuni bloccate
4. **Conferma**: Password match validation

### Auth Services Business Logic (services.py)

**AuthService Completo per ASD Platform**:

```python
class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Autenticazione completa con security tracking
        - Account lockout dopo 5 failed attempts
        - Logging sicurezza per audit
        - Update last_login_at
        """
        user = await self.get_user_by_email(email)
        if not user:
            logger.warning(f"Login attempt with non-existent email: {email}")
            return None
            
        # Check account lock
        if user.locked_until and user.locked_until > datetime.now(timezone.utc):
            logger.warning(f"Login attempt on locked account: {email}")
            return None
            
        # Verify password
        if not self.verify_password(password, user.hashed_password):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=30)
            self.db.commit()
            return None
            
        # Successful login - reset counters
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = datetime.now(timezone.utc)
        self.db.commit()
        
        return user
```

### Authorization Dependencies (dependencies.py)

**Sistema Authorization a Livelli per ASD Platform**:

```python
# Livello 1: Base Authentication
async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Verifica JWT token e retrieval user
    - Token signature validation
    - Token expiration check
    - User existence verification
    """

# Livello 2: Active User
async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Verifica user attivo
    - is_active == True
    - status == ACTIVE
    """

# Livello 3: Verified User  
async def get_current_verified_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Verifica email verificata
    - is_verified == True
    - Required per operazioni sensibili ASD
    """

# RBAC Factory Pattern
def require_role(allowed_roles: List[UserRole]) -> Callable:
    """Factory per role-based access control"""
    async def role_checker(current_user: User = Depends(get_current_verified_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Access denied")
        return current_user
    return role_checker

# Pre-defined Role Dependencies
require_parent = require_role([UserRole.PARENT])
require_professional = require_role([UserRole.PROFESSIONAL])
require_admin = require_role([UserRole.ADMIN])
require_super_admin = require_role([UserRole.SUPER_ADMIN])
```

---

## GESTIONE UTENTI E BAMBINI ASD (backend/app/users/)

### User Models ASD-Specialized (models.py)

**Child Model per Bambini ASD**:
```python
class Child(Base):
    """
    Modello bambino specializzato per ASD con campi clinici e sensoriali
    """
    __tablename__ = "children"
    
    # Identificazione
    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("auth_users.id"), nullable=False, index=True)
    
    # Informazioni base
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(20), nullable=True)
    
    # Informazioni ASD-specific
    autism_level = Column(String(50), nullable=True)  # Livello supporto ASD
    diagnosis_date = Column(Date, nullable=True)
    communication_method = Column(String(100), nullable=True)
    
    # Profilo sensoriale (JSON per flessibilità)
    sensory_preferences = Column(JSON, nullable=True)
    triggers_to_avoid = Column(JSON, nullable=True)
    calming_strategies = Column(JSON, nullable=True)
    
    # Preferenze educative e gioco
    preferred_activities = Column(JSON, nullable=True)
    learning_style = Column(String(100), nullable=True)
    attention_span_minutes = Column(Integer, nullable=True)
    
    # Gamification
    total_points = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    achievements = Column(JSON, nullable=True)
    
    # Medical/Clinical
    medical_notes = Column(Text, nullable=True)
    medications = Column(JSON, nullable=True)
    allergies = Column(JSON, nullable=True)
    
    # Status e timestamps
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### Children Routes CRUD (children_routes.py)

**CRUD Completo con Security ASD-Aware**:

**POST /children - Child Creation**:
```python
@router.post("/children", response_model=ChildResponse)
async def create_child(
    child_data: ChildCreate,
    current_user: User = Depends(require_parent),
    db: Session = Depends(get_db)
):
    """
    Creazione profilo bambino ASD
    - Solo genitori possono creare
    - Validazione dati ASD completa
    - Sensory profile initialization
    """
```

**GET /children - Children Listing**:
```python
@router.get("/children", response_model=List[ChildResponse])
async def get_children_list(
    include_inactive: bool = Query(default=False),
    current_user: User = Depends(get_current_verified_user)
):
    """
    Lista bambini con ownership verification
    - PARENT: Solo propri bambini
    - PROFESSIONAL: Bambini assegnati (future feature)
    - ADMIN: Tutti con filtri appropriati
    """
```

### Sensory Profile Management

**Specialized Endpoints per Sensory Profiles**:
```python
@router.put("/children/{child_id}/sensory-profile")
async def update_sensory_profile(
    child_id: int,
    sensory_data: SensoryProfileUpdate,
    current_user: User = Depends(require_parent),
    db: Session = Depends(get_db)
):
    """
    Aggiornamento profilo sensoriale ASD
    - Validazione ownership bambino
    - Sensory domains validation
    - Change tracking per clinical use
    """
```

---

## FRONTEND REACT ARCHITECTURE (frontend/src/)

### Application Structure

**App.jsx - Main Application Component**:
```jsx
function App() {
  useEffect(() => {
    // Initialize theme service per ASD-friendly UI
    themeService.initializeTheme();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes con Role-based Access */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            {/* Children Management Routes */}
            <Route path="/children" element={
              <ProtectedRoute requiredRole="parent">
                <ChildrenListPage />
              </ProtectedRoute>
            } />
            
            {/* Professional Routes */}
            <Route path="/professional/*" element={
              <ProtectedRoute requiredRole="professional">
                <ProfessionalRoutes />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
```

### ASD-Specialized Components

**SensoryProfile Component (components/Children/SensoryProfile.jsx)**:
```jsx
const SensoryProfile = ({ childId, childName }) => {
  const [profile, setProfile] = useState(null);
  
  // Definizione domini sensoriali ASD-specific
  const sensoryDomains = [
    {
      key: 'visual',
      name: 'Visivo',
      icon: '👁️',
      description: 'Sensibilità alla luce, colori, pattern visivi',
      aspects: [
        { key: 'light_sensitivity', label: 'Sensibilità alla luce', range: [1, 5] },
        { key: 'color_sensitivity', label: 'Sensibilità ai colori', range: [1, 5] },
        { key: 'movement_sensitivity', label: 'Sensibilità al movimento', range: [1, 5] }
      ]
    },
    {
      key: 'auditory',
      name: 'Uditivo', 
      icon: '👂',
      description: 'Sensibilità ai suoni, rumori, musica',
      aspects: [
        { key: 'noise_sensitivity', label: 'Sensibilità ai rumori', range: [1, 5] },
        { key: 'music_preference', label: 'Preferenza musicale', range: [1, 5] }
      ]
    }
    // ... altri domini sensoriali
  ];
```

**ProgressCharts Component per Visualizzazione ASD**:
```jsx
const ProgressCharts = ({ childId, timeRange }) => {
  return (
    <div className="progress-charts">
      {/* Line Chart - Progress over time */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={progressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="points" 
            stroke="#8884d8" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Radar Chart - Skill areas */}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={skillsData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis />
          <Radar 
            name="Current Level" 
            dataKey="level" 
            stroke="#82ca9d" 
            fill="#82ca9d" 
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### Authentication Context (contexts/AuthContext.jsx)

**Global State Management per Multi-Role Auth**:
```jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { user, access_token, refresh_token } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Set user and permissions
      setUser(user);
      setPermissions(getUserPermissions(user.role));
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const value = {
    user,
    login,
    logout,
    hasRole,
    hasPermission,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## REPORTS E ANALYTICS ASD (backend/app/reports/)

### GameSession Model (models.py)

**Tracking Completo Sessioni ASD**:
```python
class GameSession(Base):
    """
    Modello per tracking sessioni di gioco ASD con behavioral analytics
    """
    __tablename__ = "game_sessions"
    
    # Identificazione sessione
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    session_type = Column(String(100), nullable=False, index=True)
    scenario_name = Column(String(200), nullable=False)
    scenario_id = Column(String(100), nullable=False, index=True)
    
    # Timing e durata
    started_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    pause_count = Column(Integer, default=0)
    total_pause_duration = Column(Integer, default=0)
    
    # Metriche performance
    levels_completed = Column(Integer, default=0)
    max_level_reached = Column(Integer, default=0) 
    score = Column(Integer, default=0)
    interactions_count = Column(Integer, default=0)
    correct_responses = Column(Integer, default=0)
    incorrect_responses = Column(Integer, default=0)
    help_requests = Column(Integer, default=0)
    hint_usage_count = Column(Integer, default=0)
    
    # Behavioral tracking ASD-specific
    emotional_data = Column(JSON, nullable=True)          # Stati emotivi
    interaction_patterns = Column(JSON, nullable=True)    # Pattern interazione
    completion_status = Column(String(50), default='in_progress', index=True)
    exit_reason = Column(String(100), nullable=True)
    achievement_unlocked = Column(JSON, nullable=True)
    progress_markers_hit = Column(JSON, nullable=True)
    
    # Input genitori/caregiver
    parent_notes = Column(Text, nullable=True)
    parent_rating = Column(Integer, nullable=True)        # 1-10 scale
    parent_observed_behavior = Column(JSON, nullable=True)
    
    # Contesto tecnico
    device_type = Column(String(50), nullable=True)
    device_model = Column(String(100), nullable=True) 
    app_version = Column(String(20), nullable=True)
    environment_type = Column(String(50), nullable=True)  # home|clinic|school
    support_person_present = Column(Boolean, default=False)
    session_data_quality = Column(String(20), default='good')
```

### Clinical Analytics Service (clinical_analytics.py)

**Analytics Completo per Professionisti ASD**:
```python
@dataclass
class ClinicalMetrics:
    """Metriche cliniche aggregate per ASD analytics"""
    patient_count: int
    total_sessions: int
    average_engagement: float
    improvement_rate: float
    completion_rate: float
    assessment_scores: Dict[str, float]
    behavioral_trends: Dict[str, Any]
    sensory_profile_changes: Dict[str, Any]
    social_skills_progression: Dict[str, Any]

@dataclass
class ASDInsight:
    """Clinical insight specifico per ASD"""
    insight_type: str  # behavioral|sensory|social|communication
    title: str
    description: str
    confidence_score: float
    supporting_data: Dict[str, Any]
    recommendations: List[str]
    priority: str  # high|medium|low
    intervention_suggestions: List[str]

class ClinicalAnalyticsService:
    
    async def get_asd_population_overview(
        self, 
        professional_id: int,
        date_range: Optional[Dict[str, date]] = None
    ) -> Dict[str, Any]:
        """
        Overview popolazione ASD per professionista
        - Demografia pazienti ASD
        - Outcomes clinici per spectrum level  
        - Trend comportamentali
        - Effectiveness interventions
        """
        
    async def analyze_sensory_patterns(
        self,
        child_id: int,
        time_period: int = 30
    ) -> Dict[str, Any]:
        """
        Analisi pattern sensoriali bambino ASD
        - Changes in sensory preferences
        - Trigger identification
        - Calming strategy effectiveness
        """
        
    async def generate_progress_report(
        self,
        child_id: int,
        report_type: str = "comprehensive"
    ) -> Dict[str, Any]:
        """
        Report progresso completo ASD
        - Social skills development
        - Communication improvements  
        - Behavioral changes
        - Academic/learning progress
        """
```

---

## DEPLOYMENT E CONTAINERIZATION

### Docker Configuration Multi-Service

**docker-compose.yml - Complete Setup**:
```yaml
version: '3.8'

services:
  # PostgreSQL Database Service
  postgres:
    image: postgres:15-alpine
    container_name: smile_adventure_db
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5434:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - smile_network

  # FastAPI Application Service  
  app:
    build: .
    container_name: smile_adventure_app
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    volumes:
      - ./app:/app/app
      - ./alembic:/app/alembic
    ports:
      - "8000:8000"
    command: >
      sh -c "sleep 5 &&
             alembic upgrade head &&
             uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
    networks:
      - smile_network

  # Redis Cache Service (Configured but not implemented)
  redis:
    image: redis:7-alpine
    container_name: smile_adventure_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - smile_network

volumes:
  postgres_data:
  redis_data:

networks:
  smile_network:
    driver: bridge
```

### Environment Configuration

**Production .env Template**:
```env
# Application
APP_NAME=Smile Adventure
APP_VERSION=1.0.0
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-super-secure-production-key-32-chars-minimum

# Database
DATABASE_URL=postgresql://smile_user:secure_password@postgres:5432/smile_adventure
POSTGRES_DB=smile_adventure
POSTGRES_USER=smile_user
POSTGRES_PASSWORD=secure_production_password

# Database Performance
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30
DATABASE_POOL_TIMEOUT=20
DATABASE_POOL_RECYCLE=1800
DATABASE_POOL_PRE_PING=true

# Security
AUTO_VERIFY_EMAIL=false
REQUIRE_EMAIL_VERIFICATION=true
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_HOSTS=["https://yourdomain.com"]

# Optional integrations
OPENAI_API_KEY=sk-your-openai-key-for-ai-features
SENDGRID_API_KEY=your-sendgrid-key-for-emails
```

---

## DATABASE MIGRATIONS (ALEMBIC)

### Schema Evolution per ASD Platform

**Initial Migration Structure**:
```python
# alembic/versions/001_initial_asd_schema.py

def upgrade():
    # Create auth_users table
    op.create_table(
        'auth_users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.Enum(UserRole), nullable=False),
        sa.Column('status', sa.Enum(UserStatus), nullable=False),
        # ... other columns
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    
    # Create children table con campi ASD-specific
    op.create_table(
        'children',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('autism_level', sa.String(50), nullable=True),
        sa.Column('sensory_preferences', sa.JSON(), nullable=True),
        sa.Column('triggers_to_avoid', sa.JSON(), nullable=True),
        # ... other ASD-specific columns
        sa.ForeignKeyConstraint(['parent_id'], ['auth_users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create game_sessions table per behavioral tracking
    op.create_table(
        'game_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('child_id', sa.Integer(), nullable=False),
        sa.Column('emotional_data', sa.JSON(), nullable=True),
        sa.Column('interaction_patterns', sa.JSON(), nullable=True),
        # ... other session tracking columns
        sa.ForeignKeyConstraint(['child_id'], ['children.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create performance indexes
    op.create_index('idx_user_email_status', 'auth_users', ['email', 'status'])
    op.create_index('idx_child_parent_active', 'children', ['parent_id', 'is_active'])
    op.create_index('idx_session_child_date', 'game_sessions', ['child_id', 'started_at'])
```

---

## TESTING STRATEGY

### Backend Testing (Pytest)

**Test Structure**:
```python
# tests/test_auth.py
class TestAuthentication:
    
    async def test_parent_registration(self, client, db_session):
        """Test registrazione genitore ASD"""
        user_data = {
            "email": "parent@example.com",
            "password": "SecurePass123",
            "password_confirm": "SecurePass123",
            "first_name": "Marco",
            "last_name": "Rossi",
            "role": "parent"
        }
        response = await client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 201
        
    async def test_professional_registration_with_license(self, client, db_session):
        """Test registrazione professionista con license"""
        professional_data = {
            "email": "dr.smith@clinic.com", 
            "password": "SecurePass123",
            "password_confirm": "SecurePass123",
            "first_name": "Dr. John",
            "last_name": "Smith",
            "role": "professional",
            "license_number": "MD123456",
            "specialization": "Pediatric Psychology"
        }
        response = await client.post("/api/v1/auth/register", json=professional_data)
        assert response.status_code == 201

# tests/test_children.py  
class TestChildrenManagement:
    
    async def test_create_child_asd_profile(self, client, parent_user, db_session):
        """Test creazione profilo bambino ASD"""
        child_data = {
            "first_name": "Sofia",
            "last_name": "Rossi", 
            "date_of_birth": "2018-05-15",
            "autism_level": "Level 1 - Requiring Support",
            "sensory_preferences": {
                "visual": {"light_sensitivity": 3, "color_preference": "soft"},
                "auditory": {"noise_sensitivity": 4, "music_preference": "classical"}
            },
            "triggers_to_avoid": ["loud_noises", "bright_lights", "crowded_spaces"],
            "calming_strategies": ["deep_pressure", "music", "quiet_space"]
        }
        headers = {"Authorization": f"Bearer {parent_user.access_token}"}
        response = await client.post("/api/v1/users/children", json=child_data, headers=headers)
        assert response.status_code == 201
```

### Frontend Testing (Jest + React Testing Library)

**Component Testing**:
```jsx
// tests/components/SensoryProfile.test.jsx
describe('SensoryProfile Component', () => {
  
  test('renders sensory domains correctly', () => {
    render(
      <SensoryProfile 
        childId={1} 
        childName="Sofia" 
        sensoryData={mockSensoryData}
      />
    );
    
    expect(screen.getByText('Profilo Sensoriale - Sofia')).toBeInTheDocument();
    expect(screen.getByText('Visivo')).toBeInTheDocument();
    expect(screen.getByText('Uditivo')).toBeInTheDocument();
    expect(screen.getByText('Tattile')).toBeInTheDocument();
  });
  
  test('updates sensory preferences on user input', async () => {
    const mockUpdateSensory = jest.fn();
    render(
      <SensoryProfile 
        childId={1}
        onUpdateSensory={mockUpdateSensory}
      />
    );
    
    const lightSensitivitySlider = screen.getByLabelText('Sensibilità alla luce');
    fireEvent.change(lightSensitivitySlider, { target: { value: '4' } });
    
    await waitFor(() => {
      expect(mockUpdateSensory).toHaveBeenCalledWith({
        visual: { light_sensitivity: 4 }
      });
    });
  });
});
```

---

## PERFORMANCE OPTIMIZATION

### Database Optimization

**Index Strategy per ASD Platform**:
```sql
-- User queries optimization
CREATE INDEX CONCURRENTLY idx_user_email_status ON auth_users(email, status);
CREATE INDEX CONCURRENTLY idx_user_role_active ON auth_users(role, is_active);
CREATE INDEX CONCURRENTLY idx_user_last_login ON auth_users(last_login_at);

-- Children queries optimization  
CREATE INDEX CONCURRENTLY idx_child_parent_active ON children(parent_id, is_active);
CREATE INDEX CONCURRENTLY idx_child_age_level ON children(date_of_birth, autism_level);

-- Session analytics optimization
CREATE INDEX CONCURRENTLY idx_session_child_date ON game_sessions(child_id, started_at);
CREATE INDEX CONCURRENTLY idx_session_type_status ON game_sessions(session_type, completion_status);

-- Composite indexes per report queries
CREATE INDEX CONCURRENTLY idx_session_analytics ON game_sessions(child_id, started_at, completion_status);
```

**Query Optimization Examples**:
```python
# Efficient children listing con sensory profile
def get_children_with_sensory_data(parent_id: int):
    return session.query(Child)\
        .options(
            selectinload(Child.sensory_preferences),
            selectinload(Child.recent_sessions)
        )\
        .filter(
            Child.parent_id == parent_id,
            Child.is_active == True
        )\
        .order_by(Child.first_name)\
        .all()

# Efficient session analytics
def get_child_progress_metrics(child_id: int, days: int = 30):
    cutoff_date = datetime.now() - timedelta(days=days)
    return session.query(
        func.date(GameSession.started_at).label('date'),
        func.avg(GameSession.score).label('avg_score'),
        func.sum(GameSession.interactions_count).label('total_interactions')
    )\
    .filter(
        GameSession.child_id == child_id,
        GameSession.started_at >= cutoff_date,
        GameSession.completion_status == 'completed'
    )\
    .group_by(func.date(GameSession.started_at))\
    .order_by('date')\
    .all()
```

### Frontend Performance

**React Optimization per ASD UI**:
```jsx
// Memoization per heavy ASD components
const SensoryProfileChart = React.memo(({ sensoryData, childId }) => {
  const chartData = useMemo(() => {
    return processSensoryDataForChart(sensoryData);
  }, [sensoryData]);
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        {/* Chart configuration */}
      </RadarChart>
    </ResponsiveContainer>
  );
});

// Debounced updates per sensory sliders
const useDebouncedSensoryUpdate = (updateFunction, delay = 500) => {
  const debouncedUpdate = useCallback(
    debounce(updateFunction, delay),
    [updateFunction, delay]
  );
  
  return debouncedUpdate;
};

// Virtual scrolling per large children lists
const ChildrenVirtualList = ({ children, onChildSelect }) => {
  const listRef = useRef();
  
  const Row = ({ index, style }) => (
    <div style={style}>
      <ChildCard 
        child={children[index]}
        onClick={() => onChildSelect(children[index])}
      />
    </div>
  );
  
  return (
    <FixedSizeList
      ref={listRef}
      height={600}
      itemCount={children.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

---

## SECURITY IMPLEMENTATION

### Data Protection per ASD Platform

**GDPR Compliance per Dati Minori**:
```python
class DataProtectionMixin:
    """Mixin per GDPR compliance su dati bambini ASD"""
    
    def anonymize_child_data(self, child_id: int):
        """Anonymization dati bambino per compliance"""
        child = session.query(Child).filter(Child.id == child_id).first()
        if child:
            child.first_name = f"Child_{child.id}"
            child.last_name = "Anonymous"
            child.medical_notes = "[ANONYMIZED]"
            # Keep only essential ASD data for research
            child.sensory_preferences = self.anonymize_sensory_data(child.sensory_preferences)
    
    def audit_data_access(self, user_id: int, resource_type: str, resource_id: int):
        """Audit trail per accesso dati sensibili"""
        audit_log = DataAccessLog(
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            accessed_at=datetime.now(timezone.utc),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        session.add(audit_log)
        session.commit()
```

**Input Validation & Sanitization**:
```python
class ASDDataValidator:
    """Validator specializzato per dati ASD"""
    
    @staticmethod
    def validate_sensory_scale(value: int, domain: str) -> bool:
        """Validazione scale sensoriali (1-5)"""
        return 1 <= value <= 5
    
    @staticmethod
    def sanitize_medical_notes(notes: str) -> str:
        """Sanitizzazione note mediche"""
        # Remove potential PII
        sanitized = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN]', notes)  # SSN
        sanitized = re.sub(r'\b\d{10,}\b', '[PHONE]', sanitized)      # Phone numbers
        return sanitized
    
    @staticmethod
    def validate_autism_level(level: str) -> bool:
        """Validazione livello autismo DSM-5"""
        valid_levels = [
            "Level 1 - Requiring Support",
            "Level 2 - Requiring Substantial Support", 
            "Level 3 - Requiring Very Substantial Support"
        ]
        return level in valid_levels
```

---

## MONITORING E OBSERVABILITY

### Application Monitoring

**Health Checks per ASD Platform**:
```python
@app.get("/health")
async def health_check():
    """Health check completo sistema ASD"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": settings.APP_VERSION,
        "services": {}
    }
    
    # Database health
    try:
        await db_health_check()
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        health_status["services"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Redis health (quando implementato)
    try:
        await redis_health_check()
        health_status["services"]["redis"] = "healthy"
    except Exception as e:
        health_status["services"]["redis"] = f"unhealthy: {str(e)}"
    
    return health_status

@app.get("/metrics")
async def get_metrics():
    """Metriche specifiche piattaforma ASD"""
    return {
        "active_sessions": await get_active_game_sessions_count(),
        "total_children": await get_total_children_count(),
        "daily_assessments": await get_daily_assessments_count(),
        "professional_users": await get_professional_users_count(),
        "sensory_profiles_updated": await get_recent_sensory_updates_count()
    }
```

### Error Tracking & Logging

**Structured Logging per Clinical Environment**:
```python
import structlog

logger = structlog.get_logger()

class ASDEventLogger:
    """Logger specializzato per eventi ASD platform"""
    
    @staticmethod
    def log_child_profile_access(user_id: int, child_id: int, action: str):
        logger.info(
            "child_profile_access",
            user_id=user_id,
            child_id=child_id,
            action=action,
            timestamp=datetime.now(timezone.utc).isoformat(),
            compliance_required=True
        )
    
    @staticmethod
    def log_sensory_profile_update(child_id: int, updated_domains: List[str]):
        logger.info(
            "sensory_profile_update",
            child_id=child_id,
            updated_domains=updated_domains,
            clinical_significance=True,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
    
    @staticmethod
    def log_game_session_completion(session_id: int, metrics: Dict):
        logger.info(
            "game_session_completed",
            session_id=session_id,
            duration_minutes=metrics.get('duration_seconds', 0) // 60,
            interactions_count=metrics.get('interactions_count', 0),
            completion_rate=metrics.get('completion_rate', 0),
            behavioral_notes=bool(metrics.get('parent_notes')),
            clinical_data=True
        )
```

---

## FUTURE ROADMAP

### Phase 1: Core ASD Features Completion
- **Game Integration**: Unity WebGL games embedding
- **Real-time Session Tracking**: WebSocket per live behavioral monitoring  
- **Advanced Sensory Profiles**: More granular sensory assessments
- **Parent-Professional Communication**: Secure messaging system

### Phase 2: Advanced Clinical Features
- **AI-Powered Insights**: Machine learning per behavioral pattern recognition
- **Telehealth Integration**: Video sessions con session recording
- **Progress Prediction**: Predictive analytics per treatment outcomes
- **Multi-language Support**: Internationalization per global accessibility

### Phase 3: Research & Innovation
- **Research Data Export**: Anonymized data export per ASD research
- **VR/AR Integration**: Immersive scenarios per advanced therapy
- **IoT Sensor Integration**: Wearable devices per physiological monitoring
- **Collaborative Care Plans**: Multi-professional treatment planning

### Technical Debt & Improvements
- **Redis Implementation**: Complete caching layer implementation
- **Microservices Migration**: Gradual decomposition per scalability
- **Advanced Testing**: End-to-end testing con Playwright
- **Performance Monitoring**: APM integration con New Relic/DataDog
- **CI/CD Pipeline**: GitHub Actions per automated deployment

---

## CONCLUSIONI

Smile Adventure rappresenta una piattaforma innovativa specializzata per il supporto di bambini con ASD, costruita con tecnologie moderne e best practices di sviluppo. L'architettura modulare permette scalabilità e manutenibilità a lungo termine, mentre le specializzazioni ASD garantiscono un'esperienza utente ottimizzata per le esigenze specifiche del target.

La separazione tra backend API-first e frontend React SPA offre flessibilità per future espansioni mobile e integrazione con altri sistemi clinici, posizionando la piattaforma come soluzione completa per il supporto digitale nell'ecosistema ASD.

**Punti di Forza Architetturali**:
- ✅ **Security-First Design**: Multi-level authorization e GDPR compliance
- ✅ **ASD-Specialized Models**: Database schema ottimizzato per dati clinici
- ✅ **Scalable Foundation**: Connection pooling e performance optimization
- ✅ **Modern Stack**: FastAPI + React per developer experience ottimale
- ✅ **Clinical Focus**: Analytics e reporting per professionisti sanitari

**Ready for Production**: Il sistema è architettato per deployment production-ready con Docker, monitoring, logging e security hardening appropriate per ambiente clinico.
