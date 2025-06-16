/**
 * AUTH-006: Password Reset Flow (E2E Test)
 * 
 * Test end-to-end del flusso completo di reset password:
 * richiesta, verifica email, reset, conferma.
 */

describe('AUTH-006: Password Reset Flow', () => {
  beforeEach(() => {
    // Reset del database e stato
    cy.task('resetDatabase');
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('dovrebbe completare il flusso di reset password per parent', () => {
    // Step 1: Vai alla pagina di login
    cy.visit('/login');
    cy.get('[data-testid="login-form"]').should('be.visible');
    
    // Step 2: Click su "Password dimenticata"
    cy.get('[data-testid="forgot-password-link"]').click();
    
    // Step 3: Compila form di richiesta reset
    cy.url().should('include', '/forgot-password');
    cy.get('[data-testid="email-input"]').type('parent.test@example.com');
    cy.get('[data-testid="send-reset-button"]').click();
    
    // Step 4: Verifica messaggio di conferma
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Email di reset inviata');
    
    // Step 5: Simula click su link email (usando token mock)
    const resetToken = 'mock-reset-token-123';
    cy.visit(`/reset-password?token=${resetToken}`);
    
    // Step 6: Compila nuovo password
    cy.get('[data-testid="new-password-input"]').type('NewSecure123!');
    cy.get('[data-testid="confirm-password-input"]').type('NewSecure123!');
    cy.get('[data-testid="reset-password-button"]').click();
    
    // Step 7: Verifica successo e redirect
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Password aggiornata con successo');
    
    cy.url().should('include', '/login');
    
    // Step 8: Verifica login con nuova password
    cy.get('[data-testid="email-input"]').type('parent.test@example.com');
    cy.get('[data-testid="password-input"]').type('NewSecure123!');
    cy.get('[data-testid="login-button"]').click();
    
    // Step 9: Verifica accesso riuscito
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('contain', 'parent.test@example.com');
  });

  it('dovrebbe completare il flusso di reset password per professional', () => {
    cy.visit('/login');
    
    // Richiesta reset per professional
    cy.get('[data-testid="forgot-password-link"]').click();
    cy.get('[data-testid="email-input"]').type('dr.smith@clinic.com');
    cy.get('[data-testid="send-reset-button"]').click();
    
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // Reset con token professional
    const resetToken = 'mock-reset-token-prof-456';
    cy.visit(`/reset-password?token=${resetToken}`);
    
    cy.get('[data-testid="new-password-input"]').type('NewProfSecure789@');
    cy.get('[data-testid="confirm-password-input"]').type('NewProfSecure789@');
    cy.get('[data-testid="reset-password-button"]').click();
    
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // Test login professional
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('dr.smith@clinic.com');
    cy.get('[data-testid="password-input"]').type('NewProfSecure789@');
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/professional-dashboard');
  });

  it('dovrebbe mostrare errore per email non registrata', () => {
    cy.visit('/forgot-password');
    
    cy.get('[data-testid="email-input"]').type('nonexistent@example.com');
    cy.get('[data-testid="send-reset-button"]').click();
    
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Email non trovata');
  });

  it('dovrebbe validare formato email', () => {
    cy.visit('/forgot-password');
    
    cy.get('[data-testid="email-input"]').type('email-non-valida');
    cy.get('[data-testid="send-reset-button"]').click();
    
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Formato email non valido');
  });

  it('dovrebbe gestire token scaduto', () => {
    const expiredToken = 'expired-reset-token';
    cy.visit(`/reset-password?token=${expiredToken}`);
    
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Token scaduto o non valido');
    
    cy.get('[data-testid="back-to-login-button"]').click();
    cy.url().should('include', '/login');
  });

  it('dovrebbe gestire token non valido', () => {
    const invalidToken = 'invalid-token-format';
    cy.visit(`/reset-password?token=${invalidToken}`);
    
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Token non valido');
  });

  it('dovrebbe validare password requirements nel reset', () => {
    const resetToken = 'mock-reset-token-123';
    cy.visit(`/reset-password?token=${resetToken}`);
    
    // Test password troppo debole
    cy.get('[data-testid="new-password-input"]').type('123');
    cy.get('[data-testid="confirm-password-input"]').type('123');
    cy.get('[data-testid="reset-password-button"]').click();
    
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Password deve essere almeno 8 caratteri');
  });

  it('dovrebbe verificare che le password corrispondano', () => {
    const resetToken = 'mock-reset-token-123';
    cy.visit(`/reset-password?token=${resetToken}`);
    
    cy.get('[data-testid="new-password-input"]').type('NewSecure123!');
    cy.get('[data-testid="confirm-password-input"]').type('DifferentPassword!');
    cy.get('[data-testid="reset-password-button"]').click();
    
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Password non corrispondono');
  });

  it('dovrebbe limitare i tentativi di richiesta reset', () => {
    cy.visit('/forgot-password');
    
    // Primo tentativo
    cy.get('[data-testid="email-input"]').type('parent.test@example.com');
    cy.get('[data-testid="send-reset-button"]').click();
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // Secondo tentativo immediato
    cy.get('[data-testid="email-input"]').clear().type('parent.test@example.com');
    cy.get('[data-testid="send-reset-button"]').click();
    
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Attendi prima di richiedere un nuovo reset');
  });

  it('dovrebbe mostrare indicatori di loading', () => {
    cy.visit('/forgot-password');
    
    cy.get('[data-testid="email-input"]').type('parent.test@example.com');
    cy.get('[data-testid="send-reset-button"]').click();
    
    // Verifica loading state
    cy.get('[data-testid="send-reset-button"]')
      .should('be.disabled')
      .and('contain', 'Invio in corso...');
    
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
  });

  it('dovrebbe gestire errori di rete', () => {
    // Simula errore di rete
    cy.intercept('POST', '/api/v1/auth/forgot-password', {
      forceNetworkError: true
    }).as('networkError');
    
    cy.visit('/forgot-password');
    cy.get('[data-testid="email-input"]').type('parent.test@example.com');
    cy.get('[data-testid="send-reset-button"]').click();
    
    cy.wait('@networkError');
    
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Errore di connessione');
  });

  it('dovrebbe permettere di tornare al login', () => {
    cy.visit('/forgot-password');
    
    cy.get('[data-testid="back-to-login-link"]').click();
    cy.url().should('include', '/login');
  });

  it('dovrebbe invalidare il vecchio token dopo reset riuscito', () => {
    const resetToken = 'mock-reset-token-123';
    
    // Primo reset
    cy.visit(`/reset-password?token=${resetToken}`);
    cy.get('[data-testid="new-password-input"]').type('NewSecure123!');
    cy.get('[data-testid="confirm-password-input"]').type('NewSecure123!');
    cy.get('[data-testid="reset-password-button"]').click();
    
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // Tentativo di riuso dello stesso token
    cy.visit(`/reset-password?token=${resetToken}`);
    
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Token già utilizzato');
  });
});
