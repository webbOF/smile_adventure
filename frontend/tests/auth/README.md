# 🔐 Authentication Test Suite - Smile Adventure

**Suite ID**: AUTH-001  
**Priorità**: CRITICA ⭐⭐⭐  
**Ubicazione**: `smile_adventure/tests/auth/`  
**Strumenti**: Jest + React Testing Library, Cypress, Pytest  
**Coverage Target**: >95% per authentication flows  

---

## 📁 Struttura Directory Centralizzata

```
smile_adventure/tests/auth/
├── 📄 README.md                           # Documentazione principale
├── 📄 README-BACKEND-API.md               # Documentazione API backend  
├── 📄 SUITE_COMPLETION_STATUS.md          # Stato completamento suite
├── 📄 requirements-backend.txt            # Dipendenze Python
├── 📄 run-auth-suite.js                   # Script runner principale
├── 📄 setup.js                            # Setup MSW e configurazione
├── 📄 helpers.js                          # Utilities e helper functions
├── 📄 cypress-commands.js                 # Custom commands Cypress
│
├── 🧪 UNIT TESTS (Jest + React Testing Library)
│   ├── auth-001-parent-registration.test.js
│   ├── auth-002-professional-registration.test.js  
│   ├── auth-003-password-validation.test.js
│   ├── auth-004-multi-role-login.test.js
│   ├── auth-005-token-management.test.js
│   └── auth-007-error-handling.test.js
│
├── 🌐 E2E TESTS (Cypress)
│   └── auth-006-password-reset-flow.cy.js
│
├── 🔧 BACKEND API TESTS (Pytest)
│   └── auth-api-001-backend-endpoints.test.py
│
└── 📁 fixtures/
    └── auth-data.json                      # Test data e mock responses
```

---

## 🎯 Task Implementati

| **Task ID** | **Descrizione** | **Tipo** | **File** | **Status** |
|-------------|----------------|----------|----------|------------|
| **AUTH-001** | Registrazione Parent | Unit + Mock | `auth-001-parent-registration.test.js` | ✅ COMPLETO |
| **AUTH-002** | Registrazione Professional | Unit + Mock | `auth-002-professional-registration.test.js` | ✅ COMPLETO |
| **AUTH-003** | Validazione Password | Unit | `auth-003-password-validation.test.js` | ✅ COMPLETO |
| **AUTH-004** | Login Multi-Role | Unit + Mock | `auth-004-multi-role-login.test.js` | ✅ COMPLETO |
| **AUTH-005** | Token Management | Unit + Mock | `auth-005-token-management.test.js` | ✅ COMPLETO |
| **AUTH-006** | Password Reset Flow | E2E Cypress | `auth-006-password-reset-flow.cy.js` | ✅ COMPLETO |
| **AUTH-007** | Error Handling | Unit + Mock | `auth-007-error-handling.test.js` | ✅ COMPLETO |
| **AUTH-API-001** | Backend API Endpoints | Integration | `auth-api-001-backend-endpoints.test.py` | ✅ COMPLETO |

---

## 🚀 Quick Start

### 1. Eseguire Tutti i Test
```bash
cd smile_adventure/tests/auth
node run-auth-suite.js --all
```

### 2. Solo Unit Tests
```bash
node run-auth-suite.js --unit
```

### 3. Solo E2E Tests  
```bash
node run-auth-suite.js --e2e
```

### 4. Solo Backend API Tests
```bash
node run-auth-suite.js --backend
```

### 5. Con Coverage Report
```bash
node run-auth-suite.js --all --coverage
```

### 6. Modalità Watch
```bash
node run-auth-suite.js --unit --watch
```

---

## 📋 Prerequisiti

### Frontend Tests (Jest + Cypress)
- **Node.js** 16+
- **npm** o **yarn**
- **Dependencies**: Installate automaticamente dal runner

### Backend Tests (Pytest)
- **Python** 3.8+
- **pip** per gestione pacchetti
- **Dependencies**: Auto-installate da `requirements-backend.txt`

---

## 🧪 Test Coverage

### Unit Tests (Jest + RTL)
- **AUTH-001**: Registrazione Parent completa con validazioni
- **AUTH-002**: Registrazione Professional con campi aggiuntivi
- **AUTH-003**: Validazione password con regole di sicurezza
- **AUTH-004**: Login multi-ruolo con RBAC verification
- **AUTH-005**: Token management (JWT lifecycle completo)
- **AUTH-007**: Error handling per tutti gli scenari

### E2E Tests (Cypress)
- **AUTH-006**: Flusso completo password reset end-to-end

### Backend API Tests (Pytest)
- **AUTH-API-001**: Tutti gli endpoint autenticazione backend

---

## 🔧 Configurazione Test

### Mock Service Worker (MSW)
Configurato in `setup.js` per intercettare API calls durante unit tests:
- Login/logout simulation
- Registration responses
- Error scenarios
- Token validation

### Test Data
Centralizzata in `fixtures/auth-data.json`:
- User mock data per ogni ruolo
- Form data validi/non validi
- API responses
- Error messages

### Custom Commands (Cypress)
Definiti in `cypress-commands.js`:
- `cy.loginAs(userType)`
- `cy.registerAs(userType)`
- `cy.setAuthToken(userType)`
- `cy.clearAuth()`
- `cy.verifyRoleRedirect(userType)`

---

## 📊 Esecuzione e Report

### Comandi Base
```bash
# Help completo
node run-auth-suite.js --help

# Lista file di test disponibili
node run-auth-suite.js --list

# Tutti i test con coverage
node run-auth-suite.js --all --coverage

# Unit tests in watch mode
node run-auth-suite.js --unit --watch

# E2E tests in modalità headed
node run-auth-suite.js --e2e --watch
```

### Report Coverage
- **Jest**: `coverage/auth/` (HTML + console)
- **Pytest**: `htmlcov/` (HTML coverage report)
- **Cypress**: Built-in video recordings

### CI/CD Integration
Il runner è ottimizzato per CI/CD con:
- Exit codes appropriati (0 = success, 1 = failure)
- Colored output per terminali
- Silent mode per CI environments
- Parallel execution support

---

## 🔍 Debug e Troubleshooting

### Common Issues

1. **"No test files found"**
   ```bash
   # Verifica che i file esistano
   node run-auth-suite.js --list
   ```

2. **Jest tests failing**
   ```bash
   # Run singolo test per debugging
   npm test auth-001-parent-registration.test.js
   ```

3. **Cypress non si avvia**
   ```bash
   # Installa Cypress globalmente
   npm install -g cypress
   
   # O usa npx
   npx cypress open
   ```

4. **Python tests failing**
   ```bash
   # Verifica Python version
   python --version
   
   # Installa dipendenze manualmente
   pip install -r requirements-backend.txt
   ```

### Debug Mode
```bash
# Unit tests con debug info
npm test -- --verbose auth-001-parent-registration.test.js

# Cypress con browser aperto
npx cypress open --config specPattern="auth-*.cy.js"

# Pytest con debug dettagliato
python -m pytest -v -s auth-api-001-backend-endpoints.test.py
```

---

## 📈 Success Metrics

**Definition of Done**:
- [x] Tutti gli 8 task completati con successo  
- [x] Coverage >95% per auth components
- [x] 0 errori critici in console
- [x] Cypress videos registrati per demo
- [x] Backend API tests passano al 100%
- [x] Documentation test cases aggiornata
- [x] Suite centralizzata e organizzata

**Performance Targets**:
- Login time: <2 secondi
- Registration time: <3 secondi  
- Token validation: <500ms
- E2E test suite: <5 minuti
- Unit test suite: <30 secondi

**Security Checklist**:
- ✅ Password hashing con bcrypt
- ✅ JWT tokens sicuri
- ✅ Input validation completa
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting tests
- ✅ RBAC verification

---

## 🔗 Link Utili

- **[Backend API Documentation](./README-BACKEND-API.md)** - Dettagli endpoint backend
- **[Suite Status](./SUITE_COMPLETION_STATUS.md)** - Stato dettagliato completamento
- **[Next Suite: Dashboard](../dashboard/)** - Prossima suite di test

---

## 📝 Maintenance

### Aggiornare Test Data
```bash
# Modifica fixtures/auth-data.json per nuovi scenari
vi fixtures/auth-data.json
```

### Aggiungere Nuovi Test
```bash
# Crea nuovo file test seguendo naming convention
touch auth-008-new-feature.test.js

# Aggiorna questo README
# Aggiorna SUITE_COMPLETION_STATUS.md
```

### Aggiornare Dependencies
```bash
# Frontend dependencies
cd ../../frontend && npm update

# Backend dependencies  
pip install --upgrade -r requirements-backend.txt
```

---

**🎉 AUTHENTICATION TEST SUITE: READY FOR PRODUCTION & UNIVERSITY EXAM!**
