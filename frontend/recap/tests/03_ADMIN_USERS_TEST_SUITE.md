# 03 - ADMIN USERS MANAGEMENT TEST SUITE

## OVERVIEW
Questa suite testa completamente la gestione degli utenti da parte degli amministratori, inclusi CRUD operations, ricerca, filtri, bulk operations e gestione permessi.

## STRUMENTI UTILIZZATI
- **Jest** + **React Testing Library** per unit/integration test
- **Cypress** per end-to-end test  
- **MSW (Mock Service Worker)** per mocking API
- **Axe** per test accessibilità
- **Coverage reports** per verifica copertura codice

---

## TASK 1: ACCESSO ADMIN PANEL

### Cosa Testare
- Verifica che solo utenti con ruolo ADMIN possano accedere
- Controllo redirect per utenti non autorizzati
- Loading state durante verifica permessi

### Come Testare
**Unit Test (Jest + RTL)**:
```javascript
// Test role-based access control
test('should redirect non-admin users', async () => {
  const mockUser = { role: 'PARENT' };
  render(<UsersManagement />, { 
    wrapper: ({ children }) => (
      <AuthContext.Provider value={{ user: mockUser }}>
        {children}
      </AuthContext.Provider>
    )
  });
  
  expect(screen.getByText(/access denied/i)).toBeInTheDocument();
});
```

**E2E Test (Cypress)**:
```javascript
// Cypress test per accesso admin
it('should allow admin access to users management', () => {
  cy.loginAsAdmin();
  cy.visit('/admin/users');
  cy.get('[data-testid="users-table"]').should('be.visible');
  cy.get('[data-testid="user-filters"]').should('be.visible');
});
```

### Strumento
- **Jest + RTL** per logic test
- **Cypress** per flow completo
- **MSW** per mock auth API

### Risultato Atteso
- ✅ Solo admin possono accedere alla pagina
- ✅ Altri ruoli vengono reindirizzati con messaggio errore
- ✅ Loading spinner durante verifica permessi

---

## TASK 2: VISUALIZZAZIONE LISTA UTENTI

### Cosa Testare
- Caricamento completo lista utenti
- Rendering corretto delle informazioni utente
- Gestione stati loading/error/empty
- Paginazione funzionante

### Come Testare
**Unit Test**:
```javascript
test('should display users list correctly', async () => {
  const mockUsers = [
    { id: 1, email: 'user1@test.com', role: 'PARENT', status: 'ACTIVE' },
    { id: 2, email: 'user2@test.com', role: 'PROFESSIONAL', status: 'PENDING' }
  ];
  
  server.use(
    rest.get('/api/v1/admin/users', (req, res, ctx) => {
      return res(ctx.json(mockUsers));
    })
  );
  
  render(<UsersManagement />);
  
  await waitFor(() => {
    expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    expect(screen.getByText('PARENT')).toBeInTheDocument();
  });
});
```

**E2E Test**:
```javascript
it('should load and display users list', () => {
  cy.intercept('GET', '/api/v1/admin/users*', { fixture: 'users-list.json' });
  cy.visit('/admin/users');
  
  cy.get('[data-testid="users-table"]').should('be.visible');
  cy.get('[data-testid="user-row"]').should('have.length.at.least', 1);
  cy.get('[data-testid="pagination"]').should('be.visible');
});
```

### Strumento
- **React Testing Library** per rendering test
- **Cypress** per interaction test
- **MSW** per mock API responses

### Risultato Atteso
- ✅ Lista utenti caricata correttamente
- ✅ Informazioni utente visualizzate (email, ruolo, stato)
- ✅ Paginazione funzionante
- ✅ Loading states gestiti correttamente

---

## TASK 3: FILTRI E RICERCA UTENTI

### Cosa Testare
- Filtro per ruolo utente (PARENT, PROFESSIONAL, ADMIN)
- Filtro per stato (ACTIVE, INACTIVE, PENDING, SUSPENDED)
- Ricerca per email/nome
- Combinazione multipla filtri
- Reset filtri

### Come Testare
**Unit Test**:
```javascript
test('should filter users by role', async () => {
  render(<UserFilters onFiltersChange={mockOnFiltersChange} />);
  
  const roleSelect = screen.getByLabelText(/role/i);
  fireEvent.change(roleSelect, { target: { value: 'PROFESSIONAL' } });
  
  expect(mockOnFiltersChange).toHaveBeenCalledWith({
    role: 'PROFESSIONAL'
  });
});

test('should search users by email', async () => {
  render(<UserFilters onFiltersChange={mockOnFiltersChange} />);
  
  const searchInput = screen.getByPlaceholderText(/search by email/i);
  fireEvent.change(searchInput, { target: { value: 'doctor@test.com' } });
  
  await waitFor(() => {
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      search: 'doctor@test.com'
    });
  });
});
```

**E2E Test**:
```javascript
it('should filter users by role and status', () => {
  cy.visit('/admin/users');
  
  // Test role filter
  cy.get('[data-testid="role-filter"]').select('PROFESSIONAL');
  cy.get('[data-testid="user-row"]').should('contain', 'PROFESSIONAL');
  
  // Test status filter
  cy.get('[data-testid="status-filter"]').select('PENDING');
  cy.get('[data-testid="user-row"]').should('contain', 'PENDING');
  
  // Test search
  cy.get('[data-testid="search-input"]').type('doctor@test.com');
  cy.get('[data-testid="user-row"]').should('have.length', 1);
  
  // Test reset filters
  cy.get('[data-testid="reset-filters"]').click();
  cy.get('[data-testid="user-row"]').should('have.length.greaterThan', 1);
});
```

### Strumento
- **React Testing Library** per component logic
- **Cypress** per user interactions
- **MSW** per mock filtered responses

### Risultato Atteso
- ✅ Filtri per ruolo funzionanti
- ✅ Filtri per stato funzionanti
- ✅ Ricerca per email/nome funzionante
- ✅ Combinazione filtri multipli
- ✅ Reset filtri ripristina vista completa

---

## TASK 4: DETTAGLI UTENTE E MODIFICA

### Cosa Testare
- Apertura modal dettagli utente
- Visualizzazione informazioni complete
- Modifica campi editabili
- Cambio ruolo utente
- Cambio stato utente
- Validazione form

### Come Testare
**Unit Test**:
```javascript
test('should open user details modal', async () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'PARENT',
    status: 'ACTIVE'
  };
  
  render(<UserDetailModal user={mockUser} isOpen={true} onClose={mockOnClose} />);
  
  expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  expect(screen.getByDisplayValue('John')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
});

test('should validate user update form', async () => {
  render(<UserDetailModal user={mockUser} isOpen={true} />);
  
  const emailInput = screen.getByLabelText(/email/i);
  fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
  
  const saveButton = screen.getByText(/save/i);
  fireEvent.click(saveButton);
  
  await waitFor(() => {
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });
});
```

**E2E Test**:
```javascript
it('should edit user details successfully', () => {
  cy.visit('/admin/users');
  
  // Open user details
  cy.get('[data-testid="user-row"]').first().click();
  cy.get('[data-testid="user-detail-modal"]').should('be.visible');
  
  // Edit user information
  cy.get('[data-testid="first-name-input"]').clear().type('Updated Name');
  cy.get('[data-testid="role-select"]').select('PROFESSIONAL');
  cy.get('[data-testid="status-select"]').select('ACTIVE');
  
  // Save changes
  cy.get('[data-testid="save-user-btn"]').click();
  
  // Verify success
  cy.get('[data-testid="success-toast"]').should('contain', 'User updated successfully');
  cy.get('[data-testid="user-detail-modal"]').should('not.exist');
});
```

### Strumento
- **React Testing Library** per form validation
- **Cypress** per complete user flow
- **MSW** per mock update API

### Risultato Atteso
- ✅ Modal dettagli si apre correttamente
- ✅ Informazioni utente visualizzate
- ✅ Campi modificabili funzionanti
- ✅ Validazione form corretta
- ✅ Aggiornamento utente salvato
- ✅ Feedback successo/errore

---

## TASK 5: BULK OPERATIONS

### Cosa Testare
- Selezione multipla utenti
- Selezione tutti/nessuno
- Operazioni bulk disponibili
- Cambio stato in massa
- Cancellazione multipla
- Conferma operazioni pericolose

### Come Testare
**Unit Test**:
```javascript
test('should handle bulk user selection', () => {
  const mockUsers = [
    { id: 1, email: 'user1@test.com' },
    { id: 2, email: 'user2@test.com' }
  ];
  
  render(<UserBulkActions users={mockUsers} onBulkAction={mockOnBulkAction} />);
  
  // Select individual users
  const checkbox1 = screen.getByTestId('user-checkbox-1');
  const checkbox2 = screen.getByTestId('user-checkbox-2');
  
  fireEvent.click(checkbox1);
  fireEvent.click(checkbox2);
  
  expect(screen.getByText(/2 users selected/i)).toBeInTheDocument();
});

test('should perform bulk status change', async () => {
  render(<UserBulkActions selectedUsers={[1, 2]} onBulkAction={mockOnBulkAction} />);
  
  const statusSelect = screen.getByLabelText(/bulk status change/i);
  fireEvent.change(statusSelect, { target: { value: 'SUSPENDED' } });
  
  const applyButton = screen.getByText(/apply to selected/i);
  fireEvent.click(applyButton);
  
  expect(mockOnBulkAction).toHaveBeenCalledWith('changeStatus', 'SUSPENDED');
});
```

**E2E Test**:
```javascript
it('should perform bulk operations on users', () => {
  cy.visit('/admin/users');
  
  // Select multiple users
  cy.get('[data-testid="user-checkbox"]').first().click();
  cy.get('[data-testid="user-checkbox"]').eq(1).click();
  
  // Verify selection count
  cy.get('[data-testid="selected-count"]').should('contain', '2 users selected');
  
  // Perform bulk status change
  cy.get('[data-testid="bulk-status-select"]').select('SUSPENDED');
  cy.get('[data-testid="apply-bulk-action"]').click();
  
  // Confirm action
  cy.get('[data-testid="confirm-modal"]').should('be.visible');
  cy.get('[data-testid="confirm-btn"]').click();
  
  // Verify success
  cy.get('[data-testid="success-toast"]').should('contain', 'Users updated successfully');
});
```

### Strumento
- **React Testing Library** per component logic
- **Cypress** per bulk operations flow
- **MSW** per mock bulk API endpoints

### Risultato Atteso
- ✅ Selezione multipla utenti funzionante
- ✅ Select all/none funzionante
- ✅ Operazioni bulk disponibili
- ✅ Cambio stato in massa
- ✅ Conferma per operazioni pericolose
- ✅ Feedback operazioni completate

---

## TASK 6: GESTIONE PERMESSI E SICUREZZA

### Cosa Testare
- Verifica permessi per ogni operazione
- Prevenzione escalation privilegi
- Audit trail operazioni admin
- Gestione sessioni admin
- Timeout sicurezza

### Come Testare
**Unit Test**:
```javascript
test('should prevent privilege escalation', () => {
  const regularAdmin = { role: 'ADMIN' };
  const superAdmin = { role: 'SUPER_ADMIN' };
  
  render(<UserDetailModal user={superAdmin} currentUser={regularAdmin} />);
  
  // Regular admin shouldn't edit super admin
  const roleSelect = screen.getByLabelText(/role/i);
  expect(roleSelect).toBeDisabled();
});

test('should track admin operations', async () => {
  const mockAuditLog = jest.fn();
  
  render(<UsersManagement onAuditLog={mockAuditLog} />);
  
  // Perform admin action
  const deleteButton = screen.getByTestId('delete-user-btn');
  fireEvent.click(deleteButton);
  
  expect(mockAuditLog).toHaveBeenCalledWith({
    action: 'DELETE_USER',
    userId: 1,
    timestamp: expect.any(Date)
  });
});
```

**E2E Test**:
```javascript
it('should enforce admin security policies', () => {
  cy.loginAsAdmin();
  cy.visit('/admin/users');
  
  // Test session timeout
  cy.wait(30000); // Simulate timeout
  cy.get('[data-testid="user-action"]').click();
  cy.get('[data-testid="session-expired-modal"]').should('be.visible');
  
  // Test privilege limitations
  cy.get('[data-testid="super-admin-user"]').click();
  cy.get('[data-testid="edit-role-btn"]').should('be.disabled');
});
```

### Strumento
- **React Testing Library** per permission logic
- **Cypress** per security flow testing
- **MSW** per mock auth/audit APIs

### Risultato Atteso
- ✅ Permessi verificati per ogni operazione
- ✅ Escalation privilegi prevenuta
- ✅ Audit trail registrato
- ✅ Sessioni admin gestite correttamente
- ✅ Timeout sicurezza attivi

---

## TASK 7: PERFORMANCE E ACCESSIBILITÀ

### Cosa Testare
- Performance caricamento liste grandi
- Rendering virtuale per molti utenti
- Accessibilità keyboard navigation
- Screen reader compatibility
- Responsive design admin panel

### Come Testare
**Performance Test**:
```javascript
test('should handle large user lists efficiently', async () => {
  const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    email: `user${i}@test.com`,
    role: 'PARENT'
  }));
  
  const startTime = performance.now();
  render(<UsersTable users={largeUserList} />);
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(100); // < 100ms
});
```

**Accessibility Test**:
```javascript
test('should be accessible to screen readers', async () => {
  render(<UsersManagement />);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  
  // Test keyboard navigation
  const firstRow = screen.getByTestId('user-row-0');
  firstRow.focus();
  fireEvent.keyDown(firstRow, { key: 'ArrowDown' });
  
  const secondRow = screen.getByTestId('user-row-1');
  expect(secondRow).toHaveFocus();
});
```

**E2E Test**:
```javascript
it('should be responsive and accessible', () => {
  cy.visit('/admin/users');
  
  // Test responsive design
  cy.viewport('iphone-6');
  cy.get('[data-testid="mobile-users-list"]').should('be.visible');
  
  // Test keyboard navigation
  cy.get('body').tab();
  cy.focused().should('have.attr', 'data-testid', 'search-input');
  
  // Test screen reader labels
  cy.get('[data-testid="users-table"]')
    .should('have.attr', 'aria-label', 'Users management table');
});
```

### Strumento
- **Jest** per performance testing
- **Axe** per accessibility testing
- **Cypress** per responsive testing

### Risultato Atteso
- ✅ Performance ottimale con liste grandi
- ✅ Rendering virtuale funzionante
- ✅ Keyboard navigation completa
- ✅ Screen reader compatible
- ✅ Design responsive su tutti i dispositivi

---

## CONFIGURAZIONE TEST

### Setup Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Setup MSW
```javascript
// mocks/handlers.js
export const handlers = [
  rest.get('/api/v1/admin/users', (req, res, ctx) => {
    return res(ctx.json(mockUsers));
  }),
  rest.put('/api/v1/admin/users/:id', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
];
```

### Setup Cypress
```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js'
  }
};
```

## COVERAGE TARGET
- **Line Coverage**: > 90%
- **Branch Coverage**: > 85%
- **Function Coverage**: > 95%
- **Statement Coverage**: > 90%

## ESECUZIONE TEST
```bash
# Unit tests
npm test src/pages/admin/UsersManagement.test.jsx

# E2E tests
npx cypress run --spec "cypress/e2e/admin-users.cy.js"

# Coverage report
npm test -- --coverage --watchAll=false
```
