/**
 * Cypress Custom Commands per Authentication
 * 
 * Comandi personalizzati per automatizzare operazioni comuni
 * nei test E2E di autenticazione.
 */

// Comando per login automatico
Cypress.Commands.add('loginAs', (userType = 'parent') => {
  cy.fixture('auth-data').then((authData) => {
    const user = authData.users[userType];
    
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(user.email);
    cy.get('[data-testid="password-input"]').type(user.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Verifica login riuscito
    cy.url().should('not.include', '/login');
    cy.window().its('localStorage.token').should('exist');
  });
});

// Comando per registrazione automatica
Cypress.Commands.add('registerAs', (userType = 'parent') => {
  cy.fixture('auth-data').then((authData) => {
    const formData = authData.form_data[`valid_${userType}_registration`];
    
    cy.visit('/register');
    cy.get('[data-testid="role-select"]').select(formData.role);
    cy.get('[data-testid="email-input"]').type(formData.email);
    cy.get('[data-testid="password-input"]').type(formData.password);
    cy.get('[data-testid="confirm-password-input"]').type(formData.password_confirm);
    cy.get('[data-testid="first-name-input"]').type(formData.first_name);
    cy.get('[data-testid="last-name-input"]').type(formData.last_name);
    
    // Campi aggiuntivi per professional
    if (userType === 'professional') {
      cy.get('[data-testid="license-input"]').type(formData.license_number);
      cy.get('[data-testid="specialization-select"]').select(formData.specialization);
      cy.get('[data-testid="phone-input"]').type(formData.phone);
    }
    
    cy.get('[data-testid="register-button"]').click();
    
    // Verifica registrazione riuscita
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});

// Comando per logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  
  // Verifica logout riuscito
  cy.url().should('include', '/login');
  cy.window().its('localStorage.token').should('not.exist');
});

// Comando per set token direttamente
Cypress.Commands.add('setAuthToken', (userType = 'parent') => {
  cy.fixture('auth-data').then((authData) => {
    const token = authData.tokens[userType];
    const user = authData.users[userType];
    
    cy.window().then((win) => {
      win.localStorage.setItem('token', token);
      win.localStorage.setItem('userRole', user.role);
      win.localStorage.setItem('userId', '1');
    });
  });
});

// Comando per clear authentication
Cypress.Commands.add('clearAuth', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('userRole');
    win.localStorage.removeItem('userId');
    win.sessionStorage.clear();
  });
  cy.clearCookies();
});

// Comando per verificare redirect corretto per ruolo
Cypress.Commands.add('verifyRoleRedirect', (userType) => {
  const redirectMap = {
    parent: '/dashboard',
    professional: '/professional-dashboard',
    admin: '/admin'
  };
  
  cy.url().should('include', redirectMap[userType]);
});

// Comando per simulare errore di rete
Cypress.Commands.add('simulateNetworkError', (method = 'POST', url = '/api/v1/auth/login') => {
  cy.intercept(method, url, { forceNetworkError: true }).as('networkError');
});

// Comando per simulare timeout
Cypress.Commands.add('simulateTimeout', (method = 'POST', url = '/api/v1/auth/login') => {
  cy.intercept(method, url, (req) => {
    req.reply({ delay: 30000, statusCode: 408 });
  }).as('timeoutError');
});

// Comando per simulare risposta API personalizzata
Cypress.Commands.add('mockAuthAPI', (endpoint, response, statusCode = 200) => {
  cy.intercept('POST', `/api/v1/auth/${endpoint}`, {
    statusCode,
    body: response
  }).as(`mock${endpoint}`);
});

// Comando per verificare validazione form
Cypress.Commands.add('verifyFormValidation', (fieldTestId, errorMessage) => {
  cy.get(`[data-testid="${fieldTestId}"]`).should('have.class', 'error');
  cy.get('[data-testid="error-message"]').should('contain', errorMessage);
});

// Comando per fill form registration
Cypress.Commands.add('fillRegistrationForm', (userData) => {
  Object.entries(userData).forEach(([field, value]) => {
    const fieldMap = {
      email: 'email-input',
      password: 'password-input',
      password_confirm: 'confirm-password-input',
      first_name: 'first-name-input',
      last_name: 'last-name-input',
      role: 'role-select',
      license_number: 'license-input',
      specialization: 'specialization-select',
      phone: 'phone-input'
    };
    
    const testId = fieldMap[field];
    if (testId) {
      if (field === 'role' || field === 'specialization') {
        cy.get(`[data-testid="${testId}"]`).select(value);
      } else {
        cy.get(`[data-testid="${testId}"]`).type(value);
      }
    }
  });
});

// Comando per verificare loading state
Cypress.Commands.add('verifyLoadingState', (buttonTestId, loadingText = 'Caricamento...') => {
  cy.get(`[data-testid="${buttonTestId}"]`).should('be.disabled');
  cy.get(`[data-testid="${buttonTestId}"]`).should('contain', loadingText);
  cy.get('[data-testid="loading-spinner"]').should('be.visible');
});

// Comando per verificare accessibilità
Cypress.Commands.add('verifyAccessibility', () => {
  // Verifica che tutti gli input abbiano label
  cy.get('input').each(($input) => {
    const id = $input.attr('id');
    if (id) {
      cy.get(`label[for="${id}"]`).should('exist');
    }
  });
  
  // Verifica focus management
  cy.get('input:first').should('be.focused');
});

// Comando per test password strength indicator
Cypress.Commands.add('testPasswordStrength', (password, expectedStrength) => {
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="password-strength"]').should('contain', expectedStrength);
});

// Comando per verificare menu navigation per ruolo
Cypress.Commands.add('verifyRoleNavigation', (userType) => {
  const navigationMap = {
    parent: ['dashboard', 'children', 'activities', 'reports'],
    professional: ['dashboard', 'patients', 'analytics', 'clinical-tools'],
    admin: ['dashboard', 'users', 'system', 'reports']
  };
  
  const expectedItems = navigationMap[userType];
  expectedItems.forEach(item => {
    cy.get(`[data-testid="${item}-menu"]`).should('be.visible');
  });
});

// Comando per reset database (per test isolation)
Cypress.Commands.add('resetDatabase', () => {
  cy.task('resetDatabase');
});

// Comando per setup test data
Cypress.Commands.add('setupTestData', (dataType) => {
  cy.task('setupTestData', dataType);
});

// Comando per verificare RBAC
Cypress.Commands.add('verifyRoleBasedAccess', (userType, restrictedPath) => {
  cy.setAuthToken(userType);
  cy.visit(restrictedPath);
  
  if ((userType === 'parent' || userType === 'professional') && restrictedPath.includes('admin')) {
    cy.url().should('include', '/unauthorized');
  }
});

// Note: Per TypeScript support, creare un file cypress.d.ts separato con le type definitions
