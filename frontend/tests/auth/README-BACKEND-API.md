# 🔧 Authentication Backend API Tests

**Test Suite**: Backend API Integration Tests  
**Framework**: Pytest + FastAPI TestClient  
**Target**: `/api/v1/auth/*` endpoints  
**Coverage**: Registration, Login, Token Management, RBAC  

---

## 📚 API Endpoints Testati

### Authentication Core
- `POST /api/v1/auth/register` - User registration (parent/professional)
- `POST /api/v1/auth/login` - User login with JWT token
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Current user info

### Password Management  
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset confirmation

### Role-Based Access
- `GET /api/v1/auth/parent-only` - Parent restricted endpoint
- `GET /api/v1/auth/professional-only` - Professional restricted endpoint  
- `GET /api/v1/auth/admin-only` - Admin restricted endpoint

---

## 🧪 Test Cases Implementati

### Registration Tests
```python
def test_register_parent_success()
def test_register_professional_success()  
def test_register_duplicate_email()
def test_register_invalid_email()
def test_register_weak_password()
```

### Login Tests
```python
def test_login_parent_success()
def test_login_professional_success()
def test_login_invalid_credentials()
```

### Token Management Tests
```python
def test_get_current_user()
def test_protected_endpoint_without_token()
def test_protected_endpoint_invalid_token()
def test_refresh_token_success()
```

### RBAC Tests
```python
def test_parent_only_endpoint_access()
def test_professional_only_endpoint_access()
def test_cross_role_access_denied()
```

### Security Tests
```python
def test_password_reset_request()
def test_password_reset_invalid_email()
def test_rate_limiting_login_attempts()
def test_logout_success()
```

---

## 🚀 Esecuzione Test Backend

### Setup Environment
```bash
# 1. Installa Python dependencies
pip install -r requirements-backend.txt

# 2. Setup database di test (SQLite in-memory)
# Automatico durante test execution

# 3. Esegui i test
python -m pytest auth-api-001-backend-endpoints.test.py -v
```

### Comando Completo con Coverage
```bash
python -m pytest auth-api-001-backend-endpoints.test.py \
  --cov=app \
  --cov-report=html \
  --cov-report=term \
  -v
```

### Esecuzione Singoli Test
```bash
# Singolo test method
python -m pytest auth-api-001-backend-endpoints.test.py::TestAuthenticationAPI::test_register_parent_success -v

# Categoria di test
python -m pytest auth-api-001-backend-endpoints.test.py -k "registration" -v
```

---

## 🔧 Configurazione Test

### Database Test Setup
```python
# Database in-memory SQLite per isolamento test
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Dependency override per FastAPI TestClient
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
```

### Test Client Configuration
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Setup/teardown automatico per ogni test
@pytest.fixture(autouse=True)
def setup_database(self):
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
```

---

## 📋 Test Data Constants

### API Endpoints
```python
REGISTER_ENDPOINT = "/api/v1/auth/register"
LOGIN_ENDPOINT = "/api/v1/auth/login"  
REFRESH_ENDPOINT = "/api/v1/auth/refresh"
ME_ENDPOINT = "/api/v1/auth/me"
LOGOUT_ENDPOINT = "/api/v1/auth/logout"
```

### Test Passwords (da refactorizzare in constants)
```python
PARENT_PASSWORD = "Test123!"
PROFESSIONAL_PASSWORD = "SecureProf123!"
ADMIN_PASSWORD = "AdminSecure123!"
```

### User Roles
```python
PARENT_ROLE = "parent"
PROFESSIONAL_ROLE = "professional"
ADMIN_ROLE = "admin"
```

---

## 📊 Expected API Responses

### Successful Registration
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "parent.test@example.com",
    "first_name": "Mario",
    "last_name": "Rossi", 
    "role": "parent",
    "is_active": true,
    "is_verified": true
  }
}
```

### Successful Login
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Error Response Format
```json
{
  "detail": "Credenziali non valide",
  "error_code": "INVALID_CREDENTIALS"
}
```

### Validation Error Format
```json
{
  "detail": [
    {
      "loc": ["email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 🔍 Test Verification Points

### Registration Verification
- ✅ Status code 201 for successful registration
- ✅ JWT token presente in response
- ✅ User data correctness (role, email, names)
- ✅ Password hashing (non in plaintext)
- ✅ Professional fields validation (license, specialization)

### Login Verification  
- ✅ Status code 200 for successful login
- ✅ JWT token format validation
- ✅ Token expiration setting
- ✅ Failed login attempts tracking

### Security Verification
- ✅ Protected endpoints require valid token
- ✅ Invalid/expired tokens rejected (401)
- ✅ Cross-role access denied (403)
- ✅ Rate limiting after multiple failed attempts (429)
- ✅ Input validation prevents injection attacks

### RBAC Verification
- ✅ Parent can access parent-only endpoints
- ✅ Professional can access professional-only endpoints
- ✅ Admin can access admin-only endpoints
- ✅ Cross-role access properly denied

---

## 🐛 Common Test Issues

### Database Connection Issues
```python
# Issue: Database locked or connection refused
# Solution: Ensure test database cleanup
@pytest.fixture(autouse=True)
def setup_database(self):
    Base.metadata.drop_all(bind=engine)  # Clean first
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
```

### Import Path Issues
```python
# Issue: Cannot import app.main
# Solution: Ensure PYTHONPATH includes backend directory
import sys
sys.path.append('../backend')
from app.main import app
```

### Async/Sync Issues
```python
# Issue: RuntimeError: This event loop is already running
# Solution: Use pytest-asyncio for async tests
@pytest.mark.asyncio
async def test_async_endpoint():
    # Test implementation
```

---

## 📈 Performance Benchmarks

### Response Time Targets
- Registration: <500ms
- Login: <300ms  
- Token validation: <100ms
- Protected endpoint access: <200ms

### Load Testing (Optional)
```bash
# Usando pytest-benchmark
pip install pytest-benchmark

# Run con benchmark
python -m pytest auth-api-001-backend-endpoints.test.py --benchmark-only
```

---

## 🔐 Security Test Scenarios

### Password Security
- ✅ Weak passwords rejected
- ✅ Password strength requirements enforced
- ✅ Password hashing with bcrypt
- ✅ Password not returned in API responses

### Token Security
- ✅ JWT tokens properly signed
- ✅ Token expiration enforced
- ✅ Refresh token functionality
- ✅ Token blacklisting on logout

### Input Validation
- ✅ SQL injection prevention
- ✅ XSS prevention in input fields
- ✅ Email format validation
- ✅ Phone number format validation
- ✅ License number validation

### Rate Limiting
- ✅ Login attempt limiting (5 attempts per 15 minutes)
- ✅ Registration rate limiting
- ✅ Password reset request limiting

---

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Backend API Tests
on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies  
        run: |
          pip install -r tests/auth/requirements-backend.txt
      - name: Run API tests
        run: |
          cd tests/auth
          python -m pytest auth-api-001-backend-endpoints.test.py -v --cov=app
```

### Docker Testing
```bash
# Run tests in Docker container
docker run --rm -v $(pwd):/app python:3.9 \
  sh -c "cd /app/tests/auth && pip install -r requirements-backend.txt && python -m pytest auth-api-001-backend-endpoints.test.py -v"
```

---

## 📚 Dependencies Utilizzate

### Core Testing
- `pytest==7.4.3` - Test framework
- `pytest-asyncio==0.21.1` - Async test support
- `httpx==0.25.2` - HTTP client per FastAPI testing

### FastAPI Testing
- `fastapi[all]==0.104.1` - FastAPI framework with all dependencies
- SQLAlchemy integration per database testing

### Authentication & Security
- `python-jose[cryptography]==3.3.0` - JWT handling
- `passlib[bcrypt]==1.7.4` - Password hashing
- `bcrypt==4.1.2` - Bcrypt algorithm

### Utilities
- `faker==20.1.0` - Generate random test data
- `factory-boy==3.3.0` - Factory pattern for test objects
- `freezegun==1.2.2` - Mock datetime for testing

---

## 🎯 Next Steps

### Planned Enhancements
- [ ] Add more edge case tests
- [ ] Implement load testing with locust
- [ ] Add API documentation tests
- [ ] Integrate with OpenAPI schema validation
- [ ] Add database migration tests

### Performance Optimizations
- [ ] Parallel test execution
- [ ] Database connection pooling for tests
- [ ] Test data caching
- [ ] Selective test running based on changes

---

**📊 Current Coverage: ~85% API endpoint coverage**  
**🎯 Target: 95% coverage per authentication flows**
