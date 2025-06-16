# 🌟 SMILE ADVENTURE

Una piattaforma di apprendimento gamificata per bambini con ASD (Autism Spectrum Disorder), che offre supporto per visite dentali, sessioni terapeutiche e scenari sociali attraverso un'interfaccia interattiva.

## 📋 Indice

- [🏗️ Architettura](#️-architettura)
- [🚀 Quick Start](#-quick-start)
- [🔧 Sviluppo](#-sviluppo)
- [🧪 Testing](#-testing)
- [🔐 Autenticazione](#-autenticazione)
- [📊 API Endpoints](#-api-endpoints)
- [🐳 Docker](#-docker)
- [📚 Documentazione](#-documentazione)

## 🏗️ Architettura

### Stack Tecnologico

**Backend**:
- **Framework**: FastAPI 0.104.1
- **Database**: PostgreSQL con SQLAlchemy 2.0.23
- **Autenticazione**: JWT con python-jose e bcrypt
- **ORM**: SQLAlchemy con Alembic per migrations
- **Deployment**: Docker + Docker Compose
- **Python**: 3.12

**Frontend**:
- **Framework**: React 18 con Vite
- **UI Library**: Material-UI / Tailwind CSS
- **State Management**: Context API / Redux
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library

### Struttura Progetto

```
smile_adventure/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── auth/              # Sistema autenticazione
│   │   ├── users/             # Gestione utenti e bambini
│   │   ├── reports/           # Analytics e reporting
│   │   ├── professional/      # Funzionalità professionisti
│   │   └── core/              # Configurazione core
│   ├── alembic/               # Database migrations
│   └── main.py                # Entry point
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Componenti UI
│   │   ├── pages/             # Pagine principali
│   │   ├── services/          # API services
│   │   └── contexts/          # Context providers
│   └── public/
│
└── docs/                      # Documentazione
```

## 🚀 Quick Start

### Prerequisiti

- **Python 3.12+**
- **Node.js 18+**
- **PostgreSQL 15+**
- **Docker & Docker Compose** (opzionale)

### 1. Clona il Repository

```bash
git clone <repository-url>
cd smile_adventure
```

### 2. Avvia Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Il backend sarà disponibile su: http://localhost:8000

### 3. Avvia Frontend

```bash
cd frontend
npm install
npm start
```

Il frontend sarà disponibile su: http://localhost:3000

## 🔧 Sviluppo

### Backend Development

```bash
cd backend

# Installa dipendenze
pip install -r requirements.txt

# Variabili ambiente
cp .env.example .env

# Database migrations
alembic upgrade head

# Avvia con reload
uvicorn main:app --reload
```

### Frontend Development

```bash
cd frontend

# Installa dipendenze
npm install

# Avvia dev server
npm run dev

# Build per produzione
npm run build
```

### API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **OpenAPI Spec**: http://localhost:8000/openapi.json
- **Health Check**: http://localhost:8000/health

## 🧪 Testing

### 🔥 **PowerShell API Test Suite** (RACCOMANDATO)

Abbiamo sviluppato un **test suite completo in PowerShell** per la validazione diretta delle API backend, che evita le complessità di integrazione Jest/React e offre **risultati immediati e affidabili**.

#### 📊 **Risultati Attuali**: 
- ✅ **Main API Tests**: 16/16 PASSED (100%)
- ✅ **Advanced Security Tests**: 23/23 PASSED (100%)
- ✅ **Success Rate Totale**: **39/39 PASSED (100%)**

#### 🚀 **Quick Test Commands**

```powershell
# Vai alla directory frontend
cd frontend

# Test completo (RACCOMANDATO)
.\run-all-backend-tests.ps1

# Test principali
.\complete-api-test.ps1

# Test avanzati (sicurezza, edge cases)
.\test-specific-endpoints.ps1
```

#### 🎯 **Test Coverage**

**Main API Test Suite (16 test)**:
- ✅ Health check backend
- ✅ Registrazione Parent/Professional
- ✅ Login con autenticazione JWT
- ✅ Dashboard role-based
- ✅ Gestione profili utente
- ✅ Error handling completo

**Advanced Security Test Suite (23 test)**:
- ✅ Password validation (7 scenari)
- ✅ Role-based access control (6 test)
- ✅ Token security validation (4 test)
- ✅ SQL injection protection (2 test)
- ✅ XSS prevention (2 test)
- ✅ Boundary testing (2 test)

#### ⚡ **Vantaggi PowerShell Testing**

- **Zero dependency issues** (no ESM/Axios conflicts)
- **Real backend validation** (actual HTTP requests)
- **Production confidence** (no mocking required)
- **CI/CD ready** (automation compatible)
- **Immediate results** (< 7 seconds execution)

#### 📋 **Prerequisiti PowerShell Tests**

1. **Backend running**: Assicurati che il backend sia attivo su `http://localhost:8000`
   ```bash
   cd backend && python main.py
   ```

2. **PowerShell execution policy** (se necessario):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

#### 📝 **Output Esempio**

```
================================================================
SMILE ADVENTURE - MASTER TEST RUNNER
================================================================
Backend is running!

Running COMPLETE API TEST SUITE...
✅ Backend Health Check [200]
✅ Register New Parent [201] 
✅ Register New Professional [201]
✅ Parent Login [200]
✅ Professional Login [200]
✅ Parent Dashboard [200]
✅ Parent Profile [200]
✅ Parent Children List [200]
✅ Parent Reports Dashboard [200]
✅ Professional Dashboard [200]
✅ Professional Profile [200]
✅ Error Handling Tests [401/404/422]

Running ADVANCED SCENARIOS TEST SUITE...
✅ Password Validation Tests [422/201]
✅ RBAC Tests [200/404/403]  
✅ Token Security Tests [401]
✅ SQL Injection Protection [422]
✅ XSS Prevention [422]
✅ Boundary Testing [422]

================================================================
🎯 ALL TEST SUITES COMPLETED!
Total Tests: 39 | Passed: 39 | Failed: 0 | Success Rate: 100%
================================================================
```

### Traditional Testing (Jest/React)

Se preferisci i test Jest tradizionali, sono disponibili nella directory `src/__tests__/auth/`, ma **si raccomanda l'uso dei test PowerShell** per maggiore affidabilità.

```bash
cd frontend

# Jest tests
npm test

# Cypress E2E
npm run test:e2e
```

### Backend Testing

```bash
cd backend

# Unit tests
pytest tests/

# Test coverage
pytest --cov=app tests/
```

## 🔐 Autenticazione

### User Roles

- **PARENT**: Genitore/tutore di bambini
- **PROFESSIONAL**: Professionista sanitario
- **ADMIN**: Amministratore sistema  
- **SUPER_ADMIN**: Super amministratore

### Authentication Flow

1. **Registrazione**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login` (form-urlencoded)
3. **Token JWT**: Bearer token per API calls
4. **Refresh**: `POST /api/v1/auth/refresh`

### Dati Esempio Testing

**Parent Registration**:
```json
{
  "email": "genitore@famiglia.com",
  "password": "FamigliaSecura2025!",
  "password_confirm": "FamigliaSecura2025!",
  "first_name": "Laura",
  "last_name": "Verdi",
  "role": "parent"
}
```

**Professional Registration**:
```json
{
  "email": "dottore@clinica.com", 
  "password": "ClinicaForte2025!",
  "password_confirm": "ClinicaForte2025!",
  "first_name": "Dr. Alessandro",
  "last_name": "Marchetti",
  "role": "professional",
  "license_number": "MD123456",
  "specialization": "Odontoiatria Pediatrica",
  "clinic_name": "Centro Sorriso Bambini"
}
```

## 📊 API Endpoints

### Authentication

- `GET /health` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh

### User Management

- `GET /users/dashboard` - Role-based dashboard
- `GET /users/profile` - User profile
- `PUT /users/profile` - Update profile
- `GET /users/children` - Children list (parents)
- `POST /users/children` - Create child profile

### Professional

- `GET /professional/profile` - Extended professional profile
- `GET /professional/search` - Search professionals
- `GET /professional/analytics` - Clinical analytics

### Reports & Analytics

- `GET /reports/dashboard` - Reports dashboard
- `GET /reports/child/{id}/progress` - Child progress
- `GET /reports/analytics` - Advanced analytics

## 🐳 Docker

### Quick Start Docker

```bash
# Build e avvia tutti i servizi
docker-compose up --build

# Avvia in background
docker-compose up -d

# Stop services
docker-compose down
```

### Servizi Docker

- **PostgreSQL**: `localhost:5434`
- **FastAPI**: `localhost:8000`
- **Redis**: `localhost:6379`

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://smile_user:password@postgres:5432/smile_adventure
POSTGRES_DB=smile_adventure
POSTGRES_USER=smile_user
POSTGRES_PASSWORD=password

# App
DEBUG=true
ENVIRONMENT=development
SECRET_KEY=your-secret-key-here
AUTO_VERIFY_EMAIL=true
```

## 📚 Documentazione

### Documentazione Completa

- **[Backend API Documentation](./docs/backend/)**
- **[Frontend Components](./docs/frontend/)**
- **[Authentication Test Suite](./frontend/BACKEND_API_TEST_SUITE.md)**
- **[PowerShell Test Guide](./frontend/QUICK_TEST_REFERENCE.md)**

### File Documentazione Disponibili

- `MODELLO_ARCHITETTURALE_SMILE_ADVENTURE.md` - Architettura completa
- `SMILE_ADVENTURE_DOCUMENTAZIONE_COMPLETA.md` - Documentazione tecnica
- `PROJECT_COMPLETION_REPORT.md` - Report completamento progetto
- `frontend/AUTHENTICATION_TEST_COMPLETION_REPORT.md` - Report test autenticazione

### API Testing Tools

- **Swagger UI**: http://localhost:8000/docs
- **PowerShell Test Suite**: `frontend/run-all-backend-tests.ps1`
- **Postman Collection**: Disponibile per import

## 🤝 Contribuire

### Development Workflow

1. Fork il repository
2. Crea feature branch: `git checkout -b feature/amazing-feature`
3. **Esegui i test PowerShell**: `cd frontend && .\run-all-backend-tests.ps1`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push branch: `git push origin feature/amazing-feature`
6. Apri Pull Request

### Code Quality

- **Backend**: Segui PEP 8, usa type hints
- **Frontend**: Segui ESLint config, usa TypeScript
- **Testing**: Assicurati che **tutti i 39 test PowerShell passino**
- **Documentation**: Aggiorna README per nuove features

## 📞 Support

### Troubleshooting

**Backend Issues**:
```bash
# Check backend health
curl http://localhost:8000/health

# Check logs
docker-compose logs smile_adventure_app
```

**Frontend Issues**:
```bash
# Clear cache
npm run clean
npm install

# Check console errors
npm run dev
```

**Test Issues**:
```powershell
# Verify backend is running
Invoke-WebRequest -Uri "http://localhost:8000/health"

# Run specific test
.\complete-api-test.ps1
```

### Links Utili

- **Backend Health**: http://localhost:8000/health
- **API Documentation**: http://localhost:8000/docs
- **Frontend Dev**: http://localhost:3000
- **Database Admin**: http://localhost:5434 (PostgreSQL)

---

## 🎯 **Status Progetto**

### ✅ **COMPLETATO**

- **Backend API**: Fully implemented & tested (100%)
- **Authentication System**: Complete with JWT + RBAC
- **Database**: PostgreSQL with migrations
- **API Testing**: PowerShell suite (39/39 tests passing)
- **Documentation**: Complete technical docs
- **Docker**: Multi-service orchestration ready

### 🚧 **IN SVILUPPO**

- **Frontend UI**: React components
- **Game Integration**: ASD-specific features
- **Clinical Dashboard**: Professional analytics
- **Mobile App**: React Native version

### 📈 **NEXT STEPS**

1. **Frontend Development**: Implement React UI
2. **Game Engine**: ASD learning scenarios
3. **Clinical Features**: Professional analytics
4. **Mobile Version**: Cross-platform app
5. **Production Deployment**: AWS/Azure deployment

---

**🌟 Smile Adventure** - Transforming autism support through gamified learning

**Ultimo aggiornamento**: 16 Giugno 2025  
**Version**: 1.0.0  
**Test Status**: ✅ **39/39 PASSED (100%)**
