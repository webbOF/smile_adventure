# 09 - SECURITY E PRIVACY TEST SUITE

## OVERVIEW
Questa suite testa completamente gli aspetti di sicurezza e privacy dell'applicazione, inclusi autenticazione, autorizzazione, crittografia dati, compliance GDPR, audit trail e protezione da vulnerabilità.

## STRUMENTI UTILIZZATI
- **Jest** + **React Testing Library** per unit/integration test
- **Cypress** per end-to-end test  
- **OWASP ZAP** per vulnerability testing
- **Security testing tools** per penetration testing
- **Privacy compliance validators**

---

## TASK 1: AUTENTICAZIONE E GESTIONE SESSIONI

### Cosa Testare
- Login sicuro con hashing password
- Multi-factor authentication (MFA)
- Gestione sessioni e timeout
- Password policy enforcement
- Account lockout per tentativi falliti

### Come Testare
**Unit Test (Jest + RTL)**:
```javascript
test('should enforce strong password policy', () => {
  const weakPasswords = [
    '123456',
    'password',
    'abc123',
    'qwerty',
    'Pass1' // Too short
  ];
  
  const strongPasswords = [
    'MyStr0ngP@ssw0rd!',
    'C0mpl3x&S3cur3P@ss',
    'Un1qu3$ecur1tyKey!'
  ];
  
  weakPasswords.forEach(password => {
    expect(validatePasswordStrength(password).isValid).toBe(false);
  });
  
  strongPasswords.forEach(password => {
    expect(validatePasswordStrength(password).isValid).toBe(true);
  });
});

test('should handle secure login process', async () => {
  const credentials = {
    email: 'user@test.com',
    password: 'SecurePassword123!'
  };
  
  server.use(
    rest.post('/api/v1/auth/login', (req, res, ctx) => {
      const { email, password } = req.body;
      
      // Simulate secure authentication
      if (email === credentials.email) {
        return res(ctx.json({
          success: true,
          token: 'secure_jwt_token',
          user: { id: 1, email, role: 'PARENT' },
          mfaRequired: true
        }));
      }
      
      return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }));
    })
  );
  
  render(<LoginForm />);
  
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  
  fireEvent.change(emailInput, { target: { value: credentials.email } });
  fireEvent.change(passwordInput, { target: { value: credentials.password } });
  
  fireEvent.click(screen.getByText(/sign in/i));
  
  await waitFor(() => {
    expect(screen.getByText(/mfa verification required/i)).toBeInTheDocument();
  });
});

test('should implement account lockout after failed attempts', async () => {
  let attemptCount = 0;
  
  server.use(
    rest.post('/api/v1/auth/login', (req, res, ctx) => {
      attemptCount++;
      
      if (attemptCount <= 3) {
        return res(ctx.status(401), ctx.json({ 
          error: 'Invalid credentials',
          attemptsRemaining: 3 - attemptCount
        }));
      }
      
      return res(ctx.status(429), ctx.json({ 
        error: 'Account temporarily locked',
        lockoutUntil: '2024-03-15T12:00:00Z'
      }));
    })
  );
  
  render(<LoginForm />);
  
  // Simulate multiple failed attempts
  for (let i = 0; i < 4; i++) {
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'wrongpassword' } 
    });
    fireEvent.click(screen.getByText(/sign in/i));
    
    await waitFor(() => {
      if (i < 3) {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      } else {
        expect(screen.getByText(/account temporarily locked/i)).toBeInTheDocument();
      }
    });
  }
});

test('should handle session timeout', async () => {
  const mockSessionExpiry = jest.fn();
  
  render(<AuthProvider onSessionExpiry={mockSessionExpiry} />);
  
  // Simulate session timeout
  act(() => {
    jest.advanceTimersByTime(30 * 60 * 1000); // 30 minutes
  });
  
  expect(mockSessionExpiry).toHaveBeenCalled();
});
```

**E2E Test (Cypress)**:
```javascript
it('should complete secure authentication flow', () => {
  cy.visit('/login');
  
  // Test invalid credentials
  cy.get('[data-testid="email-input"]').type('user@test.com');
  cy.get('[data-testid="password-input"]').type('wrongpassword');
  cy.get('[data-testid="login-btn"]').click();
  
  cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
  
  // Test successful login
  cy.get('[data-testid="password-input"]').clear().type('CorrectPassword123!');
  cy.get('[data-testid="login-btn"]').click();
  
  // Handle MFA if required
  cy.get('[data-testid="mfa-modal"]').should('be.visible');
  cy.get('[data-testid="mfa-code-input"]').type('123456');
  cy.get('[data-testid="verify-mfa-btn"]').click();
  
  // Verify successful authentication
  cy.url().should('include', '/dashboard');
  cy.get('[data-testid="user-menu"]').should('be.visible');
});

it('should enforce password policy', () => {
  cy.visit('/register');
  
  // Test weak passwords
  const weakPasswords = ['123', 'password', 'abc123'];
  
  weakPasswords.forEach(password => {
    cy.get('[data-testid="password-input"]').clear().type(password);
    cy.get('[data-testid="password-strength"]').should('contain', 'Weak');
    cy.get('[data-testid="register-btn"]').should('be.disabled');
  });
  
  // Test strong password
  cy.get('[data-testid="password-input"]').clear().type('MyStr0ngP@ssw0rd!');
  cy.get('[data-testid="password-strength"]').should('contain', 'Strong');
  cy.get('[data-testid="register-btn"]').should('not.be.disabled');
});

it('should handle session management', () => {
  cy.login();
  cy.visit('/dashboard');
  
  // Test session extension on activity
  cy.get('[data-testid="dashboard-content"]').click();
  cy.get('[data-testid="session-warning"]').should('not.exist');
  
  // Test session timeout warning
  cy.clock();
  cy.tick(25 * 60 * 1000); // 25 minutes
  
  cy.get('[data-testid="session-warning"]').should('be.visible');
  cy.get('[data-testid="extend-session-btn"]').click();
  
  // Test logout on timeout
  cy.tick(30 * 60 * 1000); // 30 minutes
  cy.url().should('include', '/login');
  cy.get('[data-testid="session-expired-message"]').should('be.visible');
});
```

### Strumento
- **React Testing Library** per authentication logic
- **Cypress** per complete auth flow
- **Security libraries** per password hashing

### Risultato Atteso
- ✅ Password policy enforced
- ✅ Login sicuro implementato
- ✅ MFA funzionante
- ✅ Account lockout attivo
- ✅ Session timeout gestito

---

## TASK 2: AUTORIZZAZIONE E CONTROLLO ACCESSI

### Cosa Testare
- Role-based access control (RBAC)
- Permessi granulari per risorse
- Controllo accesso endpoints API
- Privilege escalation prevention
- Resource ownership validation

### Come Testare
**Unit Test**:
```javascript
test('should enforce role-based access control', () => {
  const permissions = {
    ADMIN: ['create_user', 'delete_user', 'view_analytics', 'manage_system'],
    PROFESSIONAL: ['view_children', 'create_sessions', 'view_sensory_profiles'],
    PARENT: ['view_own_children', 'create_sensory_profile', 'book_appointments']
  };
  
  // Test admin permissions
  expect(hasPermission('ADMIN', 'delete_user')).toBe(true);
  expect(hasPermission('ADMIN', 'view_analytics')).toBe(true);
  
  // Test professional permissions
  expect(hasPermission('PROFESSIONAL', 'view_children')).toBe(true);
  expect(hasPermission('PROFESSIONAL', 'delete_user')).toBe(false);
  
  // Test parent permissions
  expect(hasPermission('PARENT', 'view_own_children')).toBe(true);
  expect(hasPermission('PARENT', 'view_analytics')).toBe(false);
});

test('should validate resource ownership', () => {
  const user = { id: 1, role: 'PARENT' };
  const child = { id: 10, parentId: 1 };
  const otherChild = { id: 11, parentId: 2 };
  
  expect(canAccessResource(user, 'child', child)).toBe(true);
  expect(canAccessResource(user, 'child', otherChild)).toBe(false);
});

test('should prevent privilege escalation', () => {
  const parentUser = { id: 1, role: 'PARENT' };
  const adminRole = 'ADMIN';
  
  expect(canAssignRole(parentUser, adminRole)).toBe(false);
  
  const adminUser = { id: 2, role: 'ADMIN' };
  expect(canAssignRole(adminUser, 'PROFESSIONAL')).toBe(true);
});

test('should validate API endpoint access', () => {
  const endpoints = [
    { path: '/api/v1/admin/users', requiredRole: 'ADMIN' },
    { path: '/api/v1/children/:id', requiredRole: 'PARENT', ownershipCheck: true },
    { path: '/api/v1/professionals/search', requiredRole: 'ANY' }
  ];
  
  const parentUser = { id: 1, role: 'PARENT' };
  
  expect(canAccessEndpoint(parentUser, '/api/v1/admin/users')).toBe(false);
  expect(canAccessEndpoint(parentUser, '/api/v1/professionals/search')).toBe(true);
});
```

**E2E Test**:
```javascript
it('should enforce role-based access control', () => {
  // Test as parent user
  cy.loginAsParent();
  
  // Should access parent features
  cy.visit('/children');
  cy.get('[data-testid="children-list"]').should('be.visible');
  
  // Should not access admin features
  cy.visit('/admin/users');
  cy.get('[data-testid="access-denied"]').should('be.visible');
  cy.url().should('include', '/unauthorized');
  
  // Test as professional
  cy.loginAsProfessional();
  
  // Should access professional features
  cy.visit('/appointments');
  cy.get('[data-testid="appointments-calendar"]').should('be.visible');
  
  // Should not access admin features
  cy.visit('/admin/analytics');
  cy.get('[data-testid="access-denied"]').should('be.visible');
  
  // Test as admin
  cy.loginAsAdmin();
  
  // Should access all features
  cy.visit('/admin/users');
  cy.get('[data-testid="users-management"]').should('be.visible');
  
  cy.visit('/admin/analytics');
  cy.get('[data-testid="analytics-dashboard"]').should('be.visible');
});

it('should validate resource ownership', () => {
  cy.loginAsParent('parent1@test.com');
  
  // Should access own child
  cy.visit('/children/1'); // Child belongs to parent1
  cy.get('[data-testid="child-profile"]').should('be.visible');
  
  // Should not access other parent's child
  cy.visit('/children/2'); // Child belongs to parent2
  cy.get('[data-testid="access-denied"]').should('be.visible');
  
  // Test API calls with ownership validation
  cy.intercept('GET', '/api/v1/children/2', { statusCode: 403 });
  cy.request({
    url: '/api/v1/children/2',
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(403);
  });
});

it('should prevent privilege escalation attempts', () => {
  cy.loginAsParent();
  
  // Attempt to access admin API directly
  cy.request({
    method: 'POST',
    url: '/api/v1/admin/users',
    body: { role: 'ADMIN' },
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(403);
  });
  
  // Attempt to modify own role
  cy.request({
    method: 'PUT',
    url: '/api/v1/users/profile',
    body: { role: 'ADMIN' },
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(403);
  });
});
```

### Strumento
- **RBAC libraries** per access control
- **Cypress** per authorization testing
- **API security testing** per endpoint protection

### Risultato Atteso
- ✅ RBAC correttamente implementato
- ✅ Permessi granulari enforced
- ✅ Resource ownership validato
- ✅ Privilege escalation prevenuto
- ✅ API endpoints protetti

---

## TASK 3: CRITTOGRAFIA E PROTEZIONE DATI

### Cosa Testare
- Crittografia dati sensibili
- Hashing password sicuro
- Comunicazioni HTTPS/TLS
- Encryption at rest e in transit
- Key management sicuro

### Come Testare
**Unit Test**:
```javascript
test('should encrypt sensitive data', () => {
  const sensitiveData = {
    ssn: '123-45-6789',
    medicalNotes: 'Confidential therapy notes',
    creditCard: '4111-1111-1111-1111'
  };
  
  const encryptedData = encryptSensitiveFields(sensitiveData);
  
  // Data should be encrypted
  expect(encryptedData.ssn).not.toBe(sensitiveData.ssn);
  expect(encryptedData.medicalNotes).not.toBe(sensitiveData.medicalNotes);
  expect(encryptedData.creditCard).not.toBe(sensitiveData.creditCard);
  
  // Should be able to decrypt
  const decryptedData = decryptSensitiveFields(encryptedData);
  expect(decryptedData.ssn).toBe(sensitiveData.ssn);
  expect(decryptedData.medicalNotes).toBe(sensitiveData.medicalNotes);
});

test('should use secure password hashing', () => {
  const password = 'SecurePassword123!';
  
  const hashedPassword = hashPassword(password);
  
  // Should not store plain text
  expect(hashedPassword).not.toBe(password);
  
  // Should use secure algorithm (bcrypt, argon2, etc.)
  expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt format
  
  // Should verify correctly
  expect(verifyPassword(password, hashedPassword)).toBe(true);
  expect(verifyPassword('wrongpassword', hashedPassword)).toBe(false);
});

test('should implement secure key derivation', () => {
  const userPassword = 'UserPassword123!';
  const salt = generateSalt();
  
  const derivedKey = deriveKey(userPassword, salt);
  
  expect(derivedKey).toHaveLength(64); // 256-bit key
  expect(salt).toHaveLength(32); // 128-bit salt
  
  // Same password and salt should generate same key
  const sameKey = deriveKey(userPassword, salt);
  expect(sameKey).toBe(derivedKey);
  
  // Different salt should generate different key
  const differentSalt = generateSalt();
  const differentKey = deriveKey(userPassword, differentSalt);
  expect(differentKey).not.toBe(derivedKey);
});

test('should validate HTTPS enforcement', () => {
  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: { protocol: 'http:' },
    writable: true
  });
  
  const httpsCheck = enforceHTTPS();
  expect(httpsCheck.shouldRedirect).toBe(true);
  
  window.location.protocol = 'https:';
  const httpsValid = enforceHTTPS();
  expect(httpsValid.shouldRedirect).toBe(false);
});
```

**E2E Test**:
```javascript
it('should enforce HTTPS communications', () => {
  // Verify all requests use HTTPS
  cy.intercept('**', (req) => {
    expect(req.url).to.include('https://');
  });
  
  cy.visit('https://localhost:3000/login');
  
  // Check security headers
  cy.request('/api/v1/health').then((response) => {
    expect(response.headers).to.have.property('strict-transport-security');
    expect(response.headers).to.have.property('x-content-type-options', 'nosniff');
    expect(response.headers).to.have.property('x-frame-options', 'DENY');
  });
});

it('should protect sensitive data in forms', () => {
  cy.visit('/profile/edit');
  
  // Test password field security
  cy.get('[data-testid="password-input"]')
    .should('have.attr', 'type', 'password')
    .should('have.attr', 'autocomplete', 'new-password');
  
  // Test credit card field security
  cy.get('[data-testid="credit-card-input"]')
    .should('have.attr', 'autocomplete', 'cc-number')
    .should('have.attr', 'inputmode', 'numeric');
  
  // Verify no sensitive data in local storage after form submission
  cy.get('[data-testid="save-profile-btn"]').click();
  
  cy.window().then((win) => {
    const localStorage = win.localStorage;
    const sessionStorage = win.sessionStorage;
    
    // Check that no sensitive data is stored
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key);
      expect(value).not.to.include('password');
      expect(value).not.to.include('ssn');
      expect(value).not.to.include('credit');
    });
  });
});

it('should handle encrypted API communications', () => {
  cy.intercept('POST', '/api/v1/auth/login', (req) => {
    // Verify password is not sent in plain text
    expect(req.body.password).not.to.include('password');
    // Should be hashed or encrypted
    expect(req.body.password).to.match(/^[a-f0-9]{64}$/);
  });
  
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type('user@test.com');
  cy.get('[data-testid="password-input"]').type('SecurePassword123!');
  cy.get('[data-testid="login-btn"]').click();
});
```

### Strumento
- **Crypto libraries** per encryption testing
- **Security headers validation** per HTTPS
- **Network monitoring** per data protection

### Risultato Atteso
- ✅ Dati sensibili crittografati
- ✅ Password hasher sicuramente
- ✅ HTTPS enforced
- ✅ Encryption in transit/rest
- ✅ Key management sicuro

---

## TASK 4: COMPLIANCE GDPR E PRIVACY

### Cosa Testare
- Consenso privacy e tracking
- Diritto all'oblio (data deletion)
- Data portability
- Privacy by design
- Cookie management

### Come Testare
**Unit Test**:
```javascript
test('should handle privacy consent management', () => {
  const user = { id: 1, email: 'user@test.com' };
  
  const consentData = {
    marketing: false,
    analytics: true,
    essential: true,
    thirdParty: false
  };
  
  const consentRecord = recordConsent(user, consentData);
  
  expect(consentRecord.userId).toBe(1);
  expect(consentRecord.timestamp).toBeDefined();
  expect(consentRecord.version).toBe('1.0');
  expect(consentRecord.consents.marketing).toBe(false);
  expect(consentRecord.consents.essential).toBe(true);
});

test('should implement right to be forgotten', async () => {
  const userId = 1;
  
  const deletionRequest = {
    userId,
    requestType: 'COMPLETE_DELETION',
    reason: 'User request',
    timestamp: new Date().toISOString()
  };
  
  const deletionResult = await processDataDeletion(deletionRequest);
  
  expect(deletionResult.success).toBe(true);
  expect(deletionResult.deletedRecords).toContain('user_profile');
  expect(deletionResult.deletedRecords).toContain('sensory_profiles');
  expect(deletionResult.deletedRecords).toContain('session_notes');
  expect(deletionResult.auditTrail).toBeDefined();
});

test('should enable data portability', () => {
  const userId = 1;
  
  const exportableData = generateDataExport(userId);
  
  expect(exportableData).toHaveProperty('personalData');
  expect(exportableData).toHaveProperty('sensoryProfiles');
  expect(exportableData).toHaveProperty('sessionHistory');
  expect(exportableData.format).toBe('JSON');
  expect(exportableData.version).toBe('GDPR_2018');
});

test('should validate cookie compliance', () => {
  const cookieManager = new CookieManager();
  
  // Essential cookies should always be allowed
  expect(cookieManager.canSetCookie('session', 'essential')).toBe(true);
  
  // Marketing cookies should require consent
  expect(cookieManager.canSetCookie('tracking', 'marketing')).toBe(false);
  
  // After consent
  cookieManager.setConsent('marketing', true);
  expect(cookieManager.canSetCookie('tracking', 'marketing')).toBe(true);
});
```

**E2E Test**:
```javascript
it('should handle privacy consent workflow', () => {
  cy.visit('/');
  
  // Privacy banner should appear
  cy.get('[data-testid="privacy-banner"]').should('be.visible');
  cy.get('[data-testid="accept-all-btn"]').should('be.visible');
  cy.get('[data-testid="reject-all-btn"]').should('be.visible');
  cy.get('[data-testid="customize-btn"]').should('be.visible');
  
  // Customize privacy settings
  cy.get('[data-testid="customize-btn"]').click();
  cy.get('[data-testid="privacy-preferences-modal"]').should('be.visible');
  
  // Set specific consents
  cy.get('[data-testid="essential-cookies"]').should('be.checked').and('be.disabled');
  cy.get('[data-testid="analytics-cookies"]').check();
  cy.get('[data-testid="marketing-cookies"]').uncheck();
  cy.get('[data-testid="social-media-cookies"]').check();
  
  cy.get('[data-testid="save-preferences-btn"]').click();
  
  // Verify consent is saved
  cy.getCookie('consent_analytics').should('exist');
  cy.getCookie('consent_marketing').should('not.exist');
  
  // Test privacy policy access
  cy.get('[data-testid="privacy-policy-link"]').click();
  cy.get('[data-testid="privacy-policy-content"]').should('be.visible');
});

it('should handle data deletion requests', () => {
  cy.loginAsParent();
  cy.visit('/profile/privacy');
  
  // Request data deletion
  cy.get('[data-testid="delete-account-section"]').should('be.visible');
  cy.get('[data-testid="request-deletion-btn"]').click();
  
  // Confirmation modal
  cy.get('[data-testid="deletion-confirmation-modal"]').should('be.visible');
  cy.get('[data-testid="deletion-warning"]').should('contain', 'permanent');
  
  // Select deletion scope
  cy.get('[data-testid="deletion-scope"]').select('Complete deletion');
  cy.get('[data-testid="deletion-reason"]').select('No longer need service');
  cy.get('[data-testid="confirm-deletion-checkbox"]').check();
  
  cy.get('[data-testid="submit-deletion-request"]').click();
  
  // Verify deletion request submitted
  cy.get('[data-testid="deletion-request-submitted"]').should('be.visible');
  cy.get('[data-testid="request-reference"]').should('be.visible');
  
  // Email confirmation should be sent
  cy.get('[data-testid="email-confirmation-sent"]').should('contain', 'confirmation email');
});

it('should provide data export functionality', () => {
  cy.loginAsParent();
  cy.visit('/profile/data-export');
  
  // Request data export
  cy.get('[data-testid="export-data-btn"]').click();
  
  // Select data types to export
  cy.get('[data-testid="export-options"]').within(() => {
    cy.get('[data-testid="personal-data"]').check();
    cy.get('[data-testid="children-data"]').check();
    cy.get('[data-testid="sensory-profiles"]').check();
    cy.get('[data-testid="session-history"]').check();
  });
  
  // Select export format
  cy.get('[data-testid="export-format"]').select('JSON');
  
  // Request export
  cy.get('[data-testid="generate-export-btn"]').click();
  
  // Verify export generation
  cy.get('[data-testid="export-processing"]').should('be.visible');
  cy.get('[data-testid="export-ready"]', { timeout: 30000 }).should('be.visible');
  
  // Download export
  cy.get('[data-testid="download-export-btn"]').click();
  cy.readFile('cypress/downloads/user-data-export.json').should('exist');
});
```

### Strumento
- **Privacy compliance libraries** per GDPR
- **Cookie management** per consent tracking
- **Data anonymization** per privacy

### Risultato Atteso
- ✅ Consenso privacy gestito
- ✅ Diritto all'oblio implementato
- ✅ Data portability funzionante
- ✅ Cookie compliance attiva
- ✅ Privacy by design rispettata

---

## TASK 5: VULNERABILITÀ E PENETRATION TESTING

### Cosa Testare
- SQL Injection protection
- XSS (Cross-Site Scripting) prevention
- CSRF (Cross-Site Request Forgery) protection
- Input validation e sanitization
- File upload security

### Come Testare
**Unit Test**:
```javascript
test('should prevent SQL injection attacks', () => {
  const maliciousInputs = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'/**/UNION/**/SELECT/**/password/**/FROM/**/users--",
    "1; DELETE FROM sessions WHERE 1=1"
  ];
  
  maliciousInputs.forEach(input => {
    const sanitizedInput = sanitizeInput(input);
    expect(sanitizedInput).not.toContain('DROP');
    expect(sanitizedInput).not.toContain('UNION');
    expect(sanitizedInput).not.toContain('DELETE');
    expect(sanitizedInput).not.toContain('--');
  });
});

test('should prevent XSS attacks', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src="x" onerror="alert(1)">',
    'javascript:alert("XSS")',
    '<svg onload="alert(1)">'
  ];
  
  xssPayloads.forEach(payload => {
    const sanitizedOutput = sanitizeHTML(payload);
    expect(sanitizedOutput).not.toContain('<script>');
    expect(sanitizedOutput).not.toContain('onerror');
    expect(sanitizedOutput).not.toContain('javascript:');
    expect(sanitizedOutput).not.toContain('onload');
  });
});

test('should validate file uploads', () => {
  const validFiles = [
    { name: 'document.pdf', type: 'application/pdf', size: 1024000 },
    { name: 'image.jpg', type: 'image/jpeg', size: 512000 }
  ];
  
  const maliciousFiles = [
    { name: 'script.exe', type: 'application/exe', size: 1024 },
    { name: 'hack.php', type: 'application/php', size: 2048 },
    { name: 'virus.bat', type: 'application/bat', size: 512 }
  ];
  
  validFiles.forEach(file => {
    expect(validateFileUpload(file).isValid).toBe(true);
  });
  
  maliciousFiles.forEach(file => {
    expect(validateFileUpload(file).isValid).toBe(false);
  });
});

test('should implement CSRF protection', () => {
  const mockRequest = {
    method: 'POST',
    headers: {
      'x-csrf-token': 'valid_token_123'
    },
    session: {
      csrfToken: 'valid_token_123'
    }
  };
  
  expect(validateCSRFToken(mockRequest)).toBe(true);
  
  // Invalid token
  mockRequest.headers['x-csrf-token'] = 'invalid_token';
  expect(validateCSRFToken(mockRequest)).toBe(false);
});
```

**E2E Test**:
```javascript
it('should protect against common web vulnerabilities', () => {
  // Test XSS protection
  cy.visit('/profile/edit');
  
  const xssPayload = '<script>alert("XSS")</script>';
  cy.get('[data-testid="name-input"]').type(xssPayload);
  cy.get('[data-testid="save-profile-btn"]').click();
  
  // Verify XSS payload is escaped
  cy.get('[data-testid="profile-name"]').should('not.contain', '<script>');
  cy.get('[data-testid="profile-name"]').should('contain', '&lt;script&gt;');
  
  // Test SQL injection in search
  cy.visit('/professionals/search');
  
  const sqlPayload = "'; DROP TABLE professionals; --";
  cy.get('[data-testid="search-input"]').type(sqlPayload);
  cy.get('[data-testid="search-btn"]').click();
  
  // Should handle gracefully without errors
  cy.get('[data-testid="search-results"]').should('be.visible');
  cy.get('[data-testid="error-message"]').should('not.exist');
});

it('should validate file upload security', () => {
  cy.visit('/profile/edit');
  
  // Test malicious file upload
  cy.get('[data-testid="photo-upload"]').selectFile({
    contents: 'malicious content',
    fileName: 'virus.exe',
    mimeType: 'application/exe'
  }, { force: true });
  
  cy.get('[data-testid="file-error"]').should('contain', 'File type not allowed');
  cy.get('[data-testid="upload-btn"]').should('be.disabled');
  
  // Test oversized file
  const largeFile = new Array(10 * 1024 * 1024).join('a'); // 10MB
  cy.get('[data-testid="photo-upload"]').selectFile({
    contents: largeFile,
    fileName: 'large.jpg',
    mimeType: 'image/jpeg'
  }, { force: true });
  
  cy.get('[data-testid="file-error"]').should('contain', 'File too large');
});

it('should implement CSRF protection', () => {
  cy.visit('/profile/edit');
  
  // Get CSRF token
  cy.get('[data-testid="csrf-token"]').should('have.attr', 'content');
  
  // Test valid request with CSRF token
  cy.intercept('POST', '/api/v1/profile/update', (req) => {
    expect(req.headers).to.have.property('x-csrf-token');
  });
  
  cy.get('[data-testid="save-profile-btn"]').click();
  
  // Test request without CSRF token (should fail)
  cy.request({
    method: 'POST',
    url: '/api/v1/profile/update',
    body: { name: 'Test' },
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(403);
  });
});
```

### Strumento
- **OWASP ZAP** per vulnerability scanning
- **Security linting tools** per code analysis
- **Penetration testing tools** per security assessment

### Risultato Atteso
- ✅ SQL Injection protection attiva
- ✅ XSS prevention implementata
- ✅ CSRF protection funzionante
- ✅ Input validation sicura
- ✅ File upload protetto

---

## TASK 6: AUDIT TRAIL E MONITORING

### Cosa Testare
- Logging security events
- Audit trail per azioni critiche
- Monitoring attività sospette
- Alerting per security incidents
- Compliance reporting

### Come Testare
**Unit Test**:
```javascript
test('should log security events', () => {
  const mockLogger = jest.fn();
  const securityLogger = new SecurityLogger(mockLogger);
  
  // Test login attempt logging
  securityLogger.logLoginAttempt({
    userId: 1,
    email: 'user@test.com',
    success: false,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  });
  
  expect(mockLogger).toHaveBeenCalledWith(
    expect.objectContaining({
      event: 'LOGIN_ATTEMPT',
      userId: 1,
      success: false,
      severity: 'WARNING'
    })
  );
  
  // Test privilege escalation attempt
  securityLogger.logPrivilegeEscalation({
    userId: 1,
    attemptedRole: 'ADMIN',
    currentRole: 'PARENT'
  });
  
  expect(mockLogger).toHaveBeenCalledWith(
    expect.objectContaining({
      event: 'PRIVILEGE_ESCALATION_ATTEMPT',
      severity: 'CRITICAL'
    })
  );
});

test('should detect suspicious activity patterns', () => {
  const activityLog = [
    { userId: 1, action: 'LOGIN', timestamp: '2024-03-15T10:00:00Z', ipAddress: '192.168.1.100' },
    { userId: 1, action: 'LOGIN', timestamp: '2024-03-15T10:01:00Z', ipAddress: '10.0.0.50' },
    { userId: 1, action: 'LOGIN', timestamp: '2024-03-15T10:02:00Z', ipAddress: '203.0.113.10' }
  ];
  
  const suspiciousActivity = detectSuspiciousActivity(activityLog);
  
  expect(suspiciousActivity).toHaveLength(1);
  expect(suspiciousActivity[0].type).toBe('MULTIPLE_IP_ADDRESSES');
  expect(suspiciousActivity[0].riskLevel).toBe('HIGH');
});

test('should generate compliance reports', () => {
  const auditData = {
    period: '2024-03',
    events: [
      { type: 'DATA_ACCESS', count: 1250 },
      { type: 'DATA_MODIFICATION', count: 340 },
      { type: 'FAILED_LOGIN', count: 45 },
      { type: 'PRIVILEGE_ESCALATION', count: 2 }
    ]
  };
  
  const complianceReport = generateComplianceReport(auditData);
  
  expect(complianceReport.period).toBe('2024-03');
  expect(complianceReport.totalEvents).toBe(1637);
  expect(complianceReport.securityIncidents).toBe(47);
  expect(complianceReport.complianceScore).toBeGreaterThan(0.9);
});
```

**E2E Test**:
```javascript
it('should log and monitor security events', () => {
  // Test failed login attempts
  cy.visit('/login');
  
  // Multiple failed attempts
  for (let i = 0; i < 3; i++) {
    cy.get('[data-testid="email-input"]').clear().type('user@test.com');
    cy.get('[data-testid="password-input"]').clear().type('wrongpassword');
    cy.get('[data-testid="login-btn"]').click();
    
    cy.get('[data-testid="error-message"]').should('be.visible');
  }
  
  // Check audit log
  cy.loginAsAdmin();
  cy.visit('/admin/security/audit-log');
  
  cy.get('[data-testid="audit-events"]').should('be.visible');
  cy.get('[data-testid="failed-login-events"]').should('have.length.at.least', 3);
  
  // Filter by event type
  cy.get('[data-testid="event-type-filter"]').select('Failed Login');
  cy.get('[data-testid="filtered-events"]').should('be.visible');
});

it('should alert on suspicious activities', () => {
  cy.loginAsAdmin();
  cy.visit('/admin/security/monitoring');
  
  // View security dashboard
  cy.get('[data-testid="security-dashboard"]').should('be.visible');
  cy.get('[data-testid="threat-level"]').should('be.visible');
  
  // Check active alerts
  cy.get('[data-testid="security-alerts"]').should('be.visible');
  cy.get('[data-testid="alert-item"]').should('have.length.at.least', 1);
  
  // View alert details
  cy.get('[data-testid="alert-item"]').first().click();
  cy.get('[data-testid="alert-detail-modal"]').should('be.visible');
  cy.get('[data-testid="alert-description"]').should('be.visible');
  cy.get('[data-testid="recommended-actions"]').should('be.visible');
  
  // Acknowledge alert
  cy.get('[data-testid="acknowledge-alert-btn"]').click();
  cy.get('[data-testid="alert-acknowledged"]').should('be.visible');
});

it('should generate security reports', () => {
  cy.loginAsAdmin();
  cy.visit('/admin/security/reports');
  
  // Generate monthly security report
  cy.get('[data-testid="report-type"]').select('Security Summary');
  cy.get('[data-testid="report-period"]').select('Last Month');
  cy.get('[data-testid="generate-report-btn"]').click();
  
  // View generated report
  cy.get('[data-testid="report-generated"]').should('be.visible');
  cy.get('[data-testid="security-metrics"]').should('be.visible');
  cy.get('[data-testid="incident-summary"]').should('be.visible');
  cy.get('[data-testid="compliance-status"]').should('be.visible');
  
  // Export report
  cy.get('[data-testid="export-report-btn"]').click();
  cy.get('[data-testid="export-format"]').select('PDF');
  cy.get('[data-testid="download-btn"]').click();
  
  cy.readFile('cypress/downloads/security-report.pdf').should('exist');
});
```

### Strumento
- **Security logging frameworks** per audit trail
- **SIEM tools** per monitoring
- **Alerting systems** per incident response

### Risultato Atteso
- ✅ Security events logged
- ✅ Audit trail completo
- ✅ Attività sospette monitorate
- ✅ Alerting funzionante
- ✅ Compliance reporting attivo

---

## CONFIGURAZIONE TEST

### Setup Security Testing
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  collectCoverageFrom: [
    'src/security/**/*.js',
    'src/auth/**/*.js',
    'src/encryption/**/*.js'
  ]
};

// Mock security libraries
jest.mock('bcrypt');
jest.mock('crypto');
jest.mock('jsonwebtoken');
```

### OWASP ZAP Configuration
```yaml
# zap-baseline.conf
zap:
  baseline_scan:
    target: 'http://localhost:3000'
    rules:
      - id: 10021 # X-Content-Type-Options
        action: 'fail'
      - id: 10020 # X-Frame-Options
        action: 'fail'
      - id: 10016 # Web Browser XSS Protection
        action: 'fail'
```

### Cypress Security Commands
```javascript
// cypress/support/commands.js
Cypress.Commands.add('checkSecurityHeaders', (url) => {
  cy.request(url).then((response) => {
    expect(response.headers).to.have.property('x-content-type-options');
    expect(response.headers).to.have.property('x-frame-options');
    expect(response.headers).to.have.property('x-xss-protection');
  });
});

Cypress.Commands.add('testXSSPrevention', (input, selector) => {
  cy.get(selector).type(input);
  cy.get('body').should('not.contain', '<script>');
});
```

## COVERAGE TARGET
- **Security Functions**: 100%
- **Authentication Flows**: 100%
- **Authorization Checks**: 100%
- **Vulnerability Tests**: 100%

## ESECUZIONE TEST
```bash
# Unit tests di sicurezza
npm test src/security/ -- --coverage

# E2E tests di sicurezza
npx cypress run --spec "cypress/e2e/security.cy.js"

# Vulnerability scanning con OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000

# Security linting
npm run lint:security
```
