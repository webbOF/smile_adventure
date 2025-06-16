# 🔧 SMILE ADVENTURE - BACKEND

FastAPI backend con autenticazione JWT, gestione utenti multi-ruolo e analytics per bambini con ASD.

## 🚀 Quick Start

### 1. Installazione

```bash
# Clone e naviga
git clone <repo-url>
cd smile_adventure/backend

# Installa dipendenze
pip install -r requirements.txt

# Setup environment
cp .env.example .env
```

### 2. Database Setup

```bash
# Database migrations
alembic upgrade head

# Avvia il server
python main.py
```

Il backend sarà disponibile su: **http://localhost:8000**

## 📊 API Endpoints

### Core Endpoints

- **Health Check**: `GET /health`
- **Swagger UI**: `GET /docs`
- **OpenAPI Spec**: `GET /openapi.json`

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login (form-urlencoded)
- `POST /api/v1/auth/refresh` - Token refresh

### User Management

- `GET /api/v1/users/dashboard` - Role-based dashboard
- `GET /api/v1/users/profile` - User profile
- `GET /api/v1/users/children` - Children management (parents)

### Professional Features

- `GET /api/v1/professional/profile` - Professional profile
- `GET /api/v1/professional/search` - Search professionals

### Reports & Analytics

- `GET /api/v1/reports/dashboard` - Reports dashboard
- `GET /api/v1/reports/child/{id}/progress` - Child progress

## 🧪 **API Testing - PowerShell Suite**

### ✅ **Status Test**: 39/39 PASSED (100%)

Abbiamo sviluppato un **test suite completo in PowerShell** per la validazione diretta delle API backend. Questo approccio offre:

- ✅ **Zero dependency issues** 
- ✅ **Real HTTP testing** (no mocking)
- ✅ **Production confidence**
- ✅ **CI/CD ready**

### 🚀 **Eseguire i Test**

```powershell
# Vai alla directory frontend (dove sono i test)
cd ../frontend

# Test completo (RACCOMANDATO)
.\run-all-backend-tests.ps1

# Test individuali
.\complete-api-test.ps1          # Main API tests (16 test)
.\test-specific-endpoints.ps1    # Advanced scenarios (23 test)
```

### 📋 **Test Coverage**

**Main API Suite (16 test)**:
- Backend health check
- Parent/Professional registration
- JWT authentication & login
- Role-based dashboard access
- Profile management
- Error handling (401, 404, 422)

**Advanced Security Suite (23 test)**:
- Password validation (7 scenari)
- Role-based access control (6 test)
- Token security (4 test JWT)
- SQL injection protection (2 test)
- XSS prevention (2 test)
- Boundary testing (2 test)

### 📝 **Test Output Esempio**

```
================================================================
SMILE ADVENTURE - MASTER TEST RUNNER
================================================================
Backend is running!

✅ Backend Health Check [200]
✅ Register New Parent [201] - genitore.test.123@famiglia.com
✅ Register New Professional [201] - dottore.specialista.456@clinica.com  
✅ Parent Login [200] - Token: eyJhbGciOiJIUzI1NiIs...
✅ Professional Login [200] - Token: eyJhbGciOiJIUzI1NiIs...
✅ Parent Dashboard [200] - {"user_type":"parent","total_children":0...}
✅ Professional Dashboard [200] - {"user_type":"professional"...}
✅ All Security Tests [422/401/404] - SQL injection blocked, XSS prevented

================================================================
🎯 TOTAL: 39/39 PASSED (100%) | Execution time: 6.48 seconds
================================================================
```

## 🔐 Authentication System

### User Roles

```python
class UserRole(str, Enum):
    PARENT = "parent"           # Genitore/tutore bambini
    PROFESSIONAL = "professional"  # Professionista sanitario
    ADMIN = "admin"             # Amministratore sistema
    SUPER_ADMIN = "super_admin" # Super amministratore
```

### JWT Token Flow

1. **Registration**: `POST /auth/register`
2. **Login**: `POST /auth/login` (application/x-www-form-urlencoded)
3. **Access Token**: Bearer token (30 min expiry)
4. **Refresh Token**: Long-lived token per renewal

### Dati Test Registrazione

**Parent**:
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

**Professional**:
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

## 🏗️ Architettura

### Stack Tecnologico

- **Framework**: FastAPI 0.104.1
- **Database**: PostgreSQL con SQLAlchemy 2.0.23
- **Authentication**: JWT con python-jose e bcrypt
- **ORM**: SQLAlchemy con Alembic migrations
- **Python**: 3.12

### Struttura Moduli

```
app/
├── core/              # Configurazione e database
├── auth/              # Sistema autenticazione JWT
├── users/             # Gestione utenti e bambini ASD
├── reports/           # Analytics e reporting clinico
├── professional/      # Funzionalità professionisti sanitari
└── api/               # API Gateway e versioning
```

### Database Models

**User Model** (Unificato):
- Supporto multi-ruolo (Parent/Professional/Admin)
- Campi professionali per clinici
- Security tracking (failed attempts, locks)
- Email verification system

**Child Model** (ASD-specific):
- Profili bambini con ASD
- Sensory profiles JSON
- Gamification tracking
- Progress analytics

## 🔒 Security Features

### Multi-Level Authorization

1. **Token Validation** - JWT signature & expiration
2. **User Active Check** - Account status verification
3. **Email Verification** - Verified users for sensitive ops
4. **Role-Based Access** - Granular endpoint permissions
5. **Resource Ownership** - Parents access only their children

### Input Validation

- **Password Strength**: Min 8 chars, complexity requirements
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **Rate Limiting**: Protection against brute force

### Testing-Verified Security

I nostri test PowerShell verificano:
- ✅ Password validation rules
- ✅ SQL injection attempts blocked
- ✅ XSS attempts sanitized
- ✅ Invalid token rejection
- ✅ Role-based access enforcement

## 🐳 Docker

### Quick Start

```bash
# Build e avvia
docker-compose up --build -d

# Check logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Services

- **PostgreSQL**: Port 5434
- **FastAPI App**: Port 8000  
- **Redis Cache**: Port 6379

## 📚 API Documentation

### Interactive Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Postman Collection

Importa la collection dalle API docs per testing manuale.

## 🔧 Development

### Environment Setup

```bash
# Virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Environment variables
cp .env.example .env
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Development Server

```bash
# With auto-reload
uvicorn main:app --reload

# With debug
python main.py
```

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error**:
```bash
# Check PostgreSQL status
docker-compose ps postgres

# Check connection
psql postgresql://smile_user:password@localhost:5434/smile_adventure
```

**Migration Issues**:
```bash
# Reset migrations (DANGER: loses data)
alembic downgrade base
alembic upgrade head
```

**Authentication Issues**:
```bash
# Test login endpoint directly
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@email.com&password=password123"
```

### Verificare API con PowerShell

```powershell
# Quick health check
Invoke-WebRequest -Uri "http://localhost:8000/health"

# Full test suite
cd ../frontend
.\run-all-backend-tests.ps1
```

## 📈 Performance

### Database Optimization

- **Connection Pooling**: 20 connections, 30 overflow
- **Indexes**: Strategic indexes per query frequenti
- **Query Optimization**: Lazy loading, filters
- **Cache Ready**: Redis integration preparata

### Monitoring

- **Health Endpoint**: `/health` with service status
- **Metrics**: Built-in FastAPI metrics
- **Logging**: Structured logging per audit

## 🎯 Next Steps

### Backend Roadmap

1. **Extended Professional Features**: Clinical analytics
2. **Game Session Tracking**: ASD-specific metrics
3. **Real-time Notifications**: WebSocket integration
4. **Advanced Analytics**: ML-powered insights
5. **Mobile API**: React Native endpoints

### Frontend Integration

Il backend è **production-ready** per integrazione frontend:
- ✅ **Tutti i 39 test API passano**
- ✅ **JWT authentication funzionante**
- ✅ **Role-based access implementato**
- ✅ **Error handling completo**
- ✅ **Documentation completa**

---

**🔧 Backend Status**: ✅ **PRODUCTION READY**  
**Test Coverage**: ✅ **39/39 PASSED (100%)**  
**Last Updated**: 16 Giugno 2025
