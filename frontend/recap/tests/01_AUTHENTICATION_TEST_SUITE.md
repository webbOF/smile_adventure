# 🔐 AUTHENTICATION TEST SUITE - SMILE ADVENTURE

**Suite ID**: AUTH-001  
**Priorità**: CRITICA ⭐⭐⭐  
**Strumenti**: Jest + React Testing Library, Cypress, Pytest  
**Tempo Stimato**: 8-10 ore  

---

## 📋 OVERVIEW SUITE

**Obiettivo**: Verificare il corretto funzionamento del sistema di autenticazione per tutti i ruoli utente (Parent, Professional, Admin).

**Componenti Testati**:
- `RegisterPage.jsx`
- `LoginPage.jsx` 
- `ForgotPasswordPage.jsx`
- `ResetPasswordPage.jsx`
- `authService.js`
- `AuthContext.js`

**Coverage Target**: >95% per authentication flows

---

## 🎯 TASK DETTAGLIATI

### **TASK AUTH-001: Registrazione Parent**
**Cosa Testare**: Registrazione nuovo genitore con dati validi  
**Come**: Unit test + E2E test  
**Strumento**: Jest/RTL + Cypress  

**Steps**:
1. Aprire pagina `/register`
2. Selezionare ruolo "Parent"
3. Compilare form con dati validi:
   - Email: `parent.test@example.com`
   - Password: `Test123!`
   - Conferma Password: `Test123!`
   - Nome: `Mario`
   - Cognome: `Rossi`
4. Click "Registrati"

**Risultato Atteso**:
- ✅ Redirect a `/dashboard`
- ✅ Token JWT salvato in localStorage
- ✅ User context aggiornato con ruolo PARENT
- ✅ Messaggio benvenuto visualizzato

**Test Code (Jest)**:
```javascript
test('should register parent successfully', async () => {
  render(<RegisterPage />);
  
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'parent.test@example.com' }
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'Test123!' }
  });
  fireEvent.change(screen.getByLabelText(/conferma password/i), {
    target: { value: 'Test123!' }
  });
  fireEvent.change(screen.getByLabelText(/nome/i), {
    target: { value: 'Mario' }
  });
  fireEvent.change(screen.getByLabelText(/cognome/i), {
    target: { value: 'Rossi' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /registrati/i }));
  
  await waitFor(() => {
    expect(window.location.pathname).toBe('/dashboard');
  });
});
```

---

### **TASK AUTH-002: Registrazione Professional**
**Cosa Testare**: Registrazione professionista sanitario con campi aggiuntivi  
**Come**: Unit test + E2E test  
**Strumento**: Jest/RTL + Cypress  

**Steps**:
1. Aprire pagina `/register`
2. Selezionare ruolo "Professional" 
3. Compilare form con dati validi + campi professionali:
   - Email: `dr.smith@clinic.com`
   - Password: `DrSmith123!`
   - Nome: `Dr. John`
   - Cognome: `Smith`
   - License Number: `MD123456`
   - Specialization: `Pediatric Dentistry`
   - Clinic Name: `Smile Clinic`
4. Click "Registrati"

**Risultato Atteso**:
- ✅ Redirect a `/dashboard` (professional)
- ✅ Token JWT con ruolo PROFESSIONAL
- ✅ Campi professionali validati e salvati
- ✅ Dashboard professionale visualizzata

**Test Code (Cypress)**:
```javascript
it('should register professional with license validation', () => {
  cy.visit('/register');
  cy.get('[data-testid="role-select"]').select('professional');
  cy.get('[data-testid="email-input"]').type('dr.smith@clinic.com');
  cy.get('[data-testid="password-input"]').type('DrSmith123!');
  cy.get('[data-testid="confirm-password-input"]').type('DrSmith123!');
  cy.get('[data-testid="license-input"]').type('MD123456');
  cy.get('[data-testid="specialization-input"]').type('Pediatric Dentistry');
  cy.get('[data-testid="register-button"]').click();
  
  cy.url().should('include', '/dashboard');
  cy.get('[data-testid="professional-welcome"]').should('be.visible');
});
```

---

### **TASK AUTH-003: Validazione Password Strength**
**Cosa Testare**: Validazione robustezza password durante registrazione  
**Come**: Unit test con casi edge  
**Strumento**: Jest/RTL  

**Test Cases**:
1. Password troppo corta (<8 caratteri)
2. Password senza maiuscole
3. Password senza numeri
4. Password comuni (blacklist)
5. Password non corrispondenti

**Risultato Atteso**:
- ❌ Error messages specifici per ogni tipo di errore
- ❌ Button "Registrati" disabilitato
- ❌ Nessuna chiamata API

**Test Code**:
```javascript
describe('Password Validation', () => {
  test('should show error for weak password', async () => {
    render(<RegisterPage />);
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'weak' }
    });
    fireEvent.blur(screen.getByLabelText(/password/i));
    
    expect(screen.getByText(/password deve contenere almeno 8 caratteri/i))
      .toBeInTheDocument();
  });
  
  test('should show error for mismatched passwords', async () => {
    render(<RegisterPage />);
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Test123!' }
    });
    fireEvent.change(screen.getByLabelText(/conferma password/i), {
      target: { value: 'Different123!' }
    });
    fireEvent.blur(screen.getByLabelText(/conferma password/i));
    
    expect(screen.getByText(/le password non corrispondono/i))
      .toBeInTheDocument();
  });
});
```

---

### **TASK AUTH-004: Login Multi-Role**
**Cosa Testare**: Login successful per ogni tipo di ruolo  
**Come**: E2E test con dati di test  
**Strumento**: Cypress  

**Test Cases**:
1. Login Parent → Dashboard Parent
2. Login Professional → Dashboard Professional  
3. Login Admin → Admin Panel

**Risultato Atteso**:
- ✅ Redirect corretto basato su ruolo
- ✅ Menu navigation specifico per ruolo
- ✅ Permissions corrette

**Test Code**:
```javascript
describe('Multi-Role Login', () => {
  it('should redirect parent to parent dashboard', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('parent@test.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="children-menu"]').should('be.visible');
    cy.get('[data-testid="admin-menu"]').should('not.exist');
  });
  
  it('should redirect admin to admin panel', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('admin@test.com');
    cy.get('[data-testid="password-input"]').type('admin123');
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/admin');
    cy.get('[data-testid="users-management"]').should('be.visible');
    cy.get('[data-testid="admin-panel"]').should('be.visible');
  });
});
```

---

### **TASK AUTH-005: Token Management**
**Cosa Testare**: Gestione JWT token (save, refresh, expire)  
**Come**: Unit test + Integration test  
**Strumento**: Jest + Mock API  

**Scenarios**:
1. Auto-login con token valido
2. Token refresh automatico
3. Logout e rimozione token
4. Token expired handling

**Risultato Atteso**:
- ✅ Token persistente dopo refresh pagina
- ✅ Auto-refresh prima scadenza
- ✅ Redirect a login se token invalido

**Test Code**:
```javascript
describe('Token Management', () => {
  test('should auto-login with valid token', () => {
    localStorage.setItem('authToken', 'valid-jwt-token');
    
    render(<App />);
    
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });
  
  test('should redirect to login with expired token', async () => {
    localStorage.setItem('authToken', 'expired-jwt-token');
    
    render(<App />);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });
});
```

---

### **TASK AUTH-006: Password Reset Flow**
**Cosa Testare**: Flusso completo reset password  
**Come**: E2E test simulando email  
**Strumento**: Cypress + Email Mock  

**Steps**:
1. Click "Password dimenticata?" 
2. Inserire email esistente
3. Simulare click link email
4. Inserire nuova password
5. Login con nuova password

**Risultato Atteso**:
- ✅ Email di reset inviata
- ✅ Link reset funzionante
- ✅ Password aggiornata correttamente

---

### **TASK AUTH-007: Error Handling**
**Cosa Testare**: Gestione errori authentication  
**Come**: Unit test con Mock API errors  
**Strumento**: Jest + MSW (Mock Service Worker)  

**Error Scenarios**:
1. Email già esistente (409)
2. Credenziali invalide (401)
3. Account locked (423)
4. Server error (500)
5. Network error

**Risultato Atteso**:
- ❌ Error messages user-friendly
- ❌ No crash dell'applicazione
- ❌ Log errori per debugging

---

## 📊 BACKEND API TESTS

### **TASK AUTH-API-001: Registration Endpoint**
**Cosa Testare**: `POST /api/v1/auth/register`  
**Come**: Integration test  
**Strumento**: Pytest + FastAPI TestClient  

**Test Code**:
```python
def test_register_parent_success(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "parent@test.com",
        "password": "Test123!",
        "password_confirm": "Test123!",
        "first_name": "Mario",
        "last_name": "Rossi",
        "role": "parent"
    })
    
    assert response.status_code == 201
    assert "access_token" in response.json()
    assert response.json()["user"]["role"] == "parent"

def test_register_duplicate_email(client):
    # First registration
    client.post("/api/v1/auth/register", json={
        "email": "duplicate@test.com",
        "password": "Test123!",
        "password_confirm": "Test123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "parent"
    })
    
    # Duplicate registration
    response = client.post("/api/v1/auth/register", json={
        "email": "duplicate@test.com",
        "password": "Test123!",
        "password_confirm": "Test123!",
        "first_name": "Another",
        "last_name": "User",
        "role": "parent"
    })
    
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]
```

---

## 📈 SUCCESS METRICS

**Definition of Done**:
- [ ] Tutti i 7 task completati con successo
- [ ] Coverage >95% per auth components  
- [ ] 0 errori critici in console
- [ ] Cypress videos registrati per demo
- [ ] Backend API tests passano al 100%
- [ ] Documentation test cases aggiornata

**Performance Targets**:
- Login time: <2 secondi
- Registration time: <3 secondi
- Token validation: <500ms

**Security Checklist**:
- ✅ Password hashing con bcrypt
- ✅ JWT tokens sicuri
- ✅ Input validation completa
- ✅ XSS protection
- ✅ CSRF protection

---

*Next Suite: [Dashboard Multi-Role](./02_DASHBOARD_TEST_SUITE.md)*
