# 🚨 ERROR HANDLING TEST SUITE
## Suite di test per gestione errori e resilienza del sistema

**Suite ID**: 11  
**Nome**: Error Handling Test Suite  
**Descrizione**: Verifica la gestione degli errori, recovery automatico e user experience in caso di fallimenti  
**Strumenti**: Jest + React Testing Library + Mock Service Worker + Cypress + Axe-core  
**Priorità**: ALTA ⭐ (Essenziale per esame)

---

## 📋 OBIETTIVI DI TEST

### **Target di Test**
- ✅ Gestione errori di rete (timeout, connection refused, 500 errors)
- ✅ Gestione errori API (400, 401, 403, 404, 422, 500)
- ✅ Validazione form e feedback errori
- ✅ Error boundaries React
- ✅ Recovery automatico e retry logic
- ✅ User feedback e notification system

### **Coverage Atteso**
- **Unit Tests**: 15 test cases
- **Integration Tests**: 8 test cases  
- **E2E Tests**: 5 scenarios
- **Total**: 28 test cases

---

## 🧪 TEST CASES DETTAGLIATI

### **TC-11.1: NETWORK ERRORS**

#### **TC-11.1.1: Timeout Handling**
- **Task**: Verificare gestione timeout di rete
- **Cosa testare**: Comportamento sistema con richieste lente
- **Come testare**: Mock axios con delay + timeout simulation
- **Strumento**: Jest + MSW + React Testing Library
- **Setup**:
  ```javascript
  // tests/errors/network-timeout.test.js
  import { rest } from 'msw';
  import { server } from '../mocks/server';
  
  server.use(
    rest.get('/api/children', (req, res, ctx) => {
      return res(ctx.delay(10000)); // 10s delay
    })
  );
  ```
- **Risultato atteso**: 
  - Loading state attivo per 5s
  - Timeout error dopo 5s
  - Retry button disponibile
  - User notification "Request timeout. Please try again."

#### **TC-11.1.2: Connection Failed**
- **Task**: Testare comportamento offline/connection refused
- **Cosa testare**: Gestione perdita connessione
- **Come testare**: Mock network error + offline detection
- **Strumento**: Jest + MSW + navigator.onLine
- **Setup**:
  ```javascript
  // Simulate network error
  server.use(
    rest.get('/api/*', (req, res, ctx) => {
      return res.networkError('Failed to connect');
    })
  );
  ```
- **Risultato atteso**:
  - Error boundary cattura errore
  - Offline indicator visibile
  - Cache data mostrata se disponibile
  - "You are offline" message

#### **TC-11.1.3: Intermittent Network Issues**
- **Task**: Testare retry automatico con successo
- **Cosa testare**: Recovery automatico dopo fallimento temporaneo
- **Come testare**: Mock sequence fail->success
- **Strumento**: Jest + MSW + retry logic
- **Setup**:
  ```javascript
  let attemptCount = 0;
  server.use(
    rest.get('/api/children', (req, res, ctx) => {
      attemptCount++;
      if (attemptCount < 3) {
        return res(ctx.status(500));
      }
      return res(ctx.json([{id: 1, name: 'Test'}]));
    })
  );
  ```
- **Resultado atteso**:
  - Primo tentativo fallisce
  - Retry automatico after 1s
  - Secondo retry dopo 2s
  - Terzo tentativo con successo
  - Data visualizzata correttamente

### **TC-11.2: API ERRORS**

#### **TC-11.2.1: 400 Bad Request Handling**
- **Task**: Verificare gestione errori di validazione server
- **Cosa testare**: Form submission con dati invalidi
- **Come testare**: Mock 400 response con field errors
- **Strumento**: Jest + React Testing Library + MSW
- **Setup**:
  ```javascript
  server.use(
    rest.post('/api/children', (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({
          detail: [
            { field: 'name', message: 'Name is required' },
            { field: 'birth_date', message: 'Invalid date format' }
          ]
        })
      );
    })
  );
  ```
- **Risultato atteso**:
  - Form errors mostrati per campi specifici
  - Submit button disabilitato
  - Error summary in alert
  - Focus su primo campo con errore

#### **TC-11.2.2: 401 Unauthorized Handling**
- **Task**: Testare redirect su token scaduto
- **Cosa testare**: Automatic logout e redirect a login
- **Come testare**: Mock 401 response + localStorage clear
- **Strumento**: Jest + React Testing Library + React Router
- **Setup**:
  ```javascript
  server.use(
    rest.get('/api/children', (req, res, ctx) => {
      return res(
        ctx.status(401),
        ctx.json({ detail: 'Token has expired' })
      );
    })
  );
  ```
- **Risultato atteso**:
  - Token rimosso da localStorage
  - User context cleared
  - Redirect a /login
  - Toast notification "Session expired. Please login again."

#### **TC-11.2.3: 403 Forbidden Handling**
- **Task**: Gestione accesso negato per ruolo
- **Cosa testare**: Professional access denied to admin routes
- **Come testare**: Mock 403 + role-based navigation
- **Strumento**: Cypress + intercept
- **Setup**:
  ```javascript
  cy.intercept('GET', '/api/admin/users', {
    statusCode: 403,
    body: { detail: 'Insufficient permissions' }
  });
  ```
- **Risultato atteso**:
  - Error page 403 mostrata
  - "Access Denied" message
  - Back to dashboard link
  - No sensitive data exposure

#### **TC-11.2.4: 404 Not Found Handling**
- **Task**: Gestione risorsa non trovata
- **Cosa testare**: Child profile inesistente
- **Come testare**: Mock 404 response + error boundary
- **Strumento**: Jest + React Testing Library
- **Setup**:
  ```javascript
  server.use(
    rest.get('/api/children/999', (req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json({ detail: 'Child not found' })
      );
    })
  );
  ```
- **Risultato atteso**:
  - 404 error page
  - "Resource not found" message
  - Navigation breadcrumb working
  - Search suggestions se applicabile

#### **TC-11.2.5: 500 Server Error Handling**
- **Task**: Gestione errori server interni
- **Cosa testare**: Database connection error
- **Come testare**: Mock 500 + error reporting
- **Strumento**: Jest + MSW + error tracking
- **Setup**:
  ```javascript
  server.use(
    rest.post('/api/children', (req, res, ctx) => {
      return res(
        ctx.status(500),
        ctx.json({ detail: 'Internal server error' })
      );
    })
  );
  ```
- **Risultato atteso**:
  - Generic error message
  - Error ID generato
  - Retry option disponibile
  - Technical details nascosti da user

### **TC-11.3: FORM VALIDATION ERRORS**

#### **TC-11.3.1: Client-side Validation**
- **Task**: Testare validazione form lato client
- **Cosa testare**: Campi obbligatori e format validation
- **Come testare**: User interaction + form state testing
- **Strumento**: React Testing Library + userEvent
- **Setup**:
  ```javascript
  // Test email field validation
  const emailInput = screen.getByLabelText(/email/i);
  await userEvent.type(emailInput, 'invalid-email');
  await userEvent.tab(); // Trigger blur
  ```
- **Risultato atteso**:
  - Error message sotto il campo
  - Campo highlighted in rosso
  - Submit button disabilitato
  - Error message "Please enter a valid email"

#### **TC-11.3.2: Real-time Validation**
- **Task**: Verificare validazione durante typing
- **Cosa testare**: Password strength indicator
- **Come testare**: Progressive typing + state changes
- **Strumento**: React Testing Library + timer mocks
- **Setup**:
  ```javascript
  const passwordInput = screen.getByLabelText(/password/i);
  await userEvent.type(passwordInput, 'weak');
  // Check strength indicator
  expect(screen.getByText(/weak/i)).toBeInTheDocument();
  ```
- **Risultato atteso**:
  - Strength indicator aggiornato real-time
  - Color feedback (red->yellow->green)
  - Requirements checklist aggiornata
  - Submit enabled solo con strong password

#### **TC-11.3.3: Cross-field Validation**
- **Task**: Testare validazione tra campi correlati
- **Cosa testare**: Password confirmation match
- **Come testare**: Multiple field interaction
- **Strumento**: React Testing Library + form testing
- **Setup**:
  ```javascript
  await userEvent.type(passwordInput, 'password123');
  await userEvent.type(confirmInput, 'different');
  fireEvent.blur(confirmInput);
  ```
- **Risultato atteso**:
  - "Passwords do not match" error
  - Entrambi i campi highlighted
  - Submit disabled
  - Error cleared quando match

### **TC-11.4: ERROR BOUNDARIES**

#### **TC-11.4.1: Component Error Boundary**
- **Task**: Testare fallback UI per errori React
- **Cosa testare**: Component crash handling
- **Come testare**: Throw error in component + boundary testing
- **Strumento**: Jest + React Testing Library + Error Boundary
- **Setup**:
  ```javascript
  const ThrowError = () => {
    throw new Error('Component crashed');
  };
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  ```
- **Risultato atteso**:
  - Error boundary fallback UI
  - "Something went wrong" message
  - Reload page button
  - Error logged to console/service

#### **TC-11.4.2: Route Error Boundary**
- **Task**: Testare error handling a livello route
- **Cosa testare**: Errore durante navigation
- **Come testare**: Route with error + React Router error boundary
- **Strumento**: React Testing Library + React Router
- **Setup**:
  ```javascript
  const router = createMemoryRouter([
    {
      path: "/error-route",
      element: <ComponentThatThrows />,
      errorElement: <ErrorPage />
    }
  ]);
  ```
- **Risultato atteso**:
  - Error page mostrata
  - Navigation preserved
  - Back button functional
  - Error details per development

### **TC-11.5: RECOVERY MECHANISMS**

#### **TC-11.5.1: Automatic Retry Logic**
- **Task**: Testare retry automatico con exponential backoff
- **Cosa testare**: Failed request con auto-recovery
- **Come testare**: Mock intermittent failures
- **Strumento**: Jest + MSW + timer mocks
- **Setup**:
  ```javascript
  jest.useFakeTimers();
  // Mock 2 failures then success
  // Test retry intervals: 1s, 2s, 4s
  ```
- **Risultato atteso**:
  - Primo retry dopo 1s
  - Secondo retry dopo 2s
  - Success nel terzo tentativo
  - Loading states appropriate

#### **TC-11.5.2: Manual Retry UI**
- **Task**: Testare retry button user-initiated
- **Cosa testare**: User click retry after error
- **Come testare**: Error state + button interaction
- **Strumento**: React Testing Library + userEvent
- **Setup**:
  ```javascript
  // Simulate error state
  const retryButton = screen.getByRole('button', { name: /try again/i });
  await userEvent.click(retryButton);
  ```
- **Risultato atteso**:
  - Request re-triggered
  - Loading state attivato
  - Button temporaneamente disabled
  - Success data displayed

---

## 🔧 SETUP E CONFIGURAZIONE

### **Tools Installation**
```bash
# Error handling dependencies
npm install --save-dev msw @testing-library/jest-dom
npm install --save-dev @testing-library/user-event

# Error boundary setup
npm install react-error-boundary

# Network simulation
npm install --save-dev axios-mock-adapter
```

### **Mock Service Worker Setup**
```javascript
// tests/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// tests/setupTests.js
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### **Error Boundary Setup**
```javascript
// src/components/ErrorBoundary.jsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export default function CustomErrorBoundary({ children }) {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

## 🎯 EXECUTION PLAN

### **Phase 1: Unit Tests (Week 1)**
1. Network error mocking
2. API error responses  
3. Form validation logic
4. Error boundary testing
5. Retry mechanism testing

### **Phase 2: Integration Tests (Week 2)**
1. End-to-end error flows
2. Error recovery scenarios
3. User experience testing
4. Cross-component error handling

### **Phase 3: E2E Tests (Week 3)**
1. Cypress error simulation
2. Network condition testing
3. User journey with errors
4. Error reporting validation

---

## 📊 SUCCESS METRICS

### **Performance Targets**
- ✅ Error detection < 100ms
- ✅ Error display < 200ms  
- ✅ Recovery time < 3s
- ✅ User feedback immediate

### **Quality Gates**
- ✅ 100% error scenarios covered
- ✅ All error boundaries tested
- ✅ User experience maintained
- ✅ No unhandled promise rejections

### **Demo Requirements** 🎓
- ✅ Error simulation live demo
- ✅ Recovery mechanism showcase  
- ✅ User-friendly error messages
- ✅ Technical resilience proof

---

## 📁 FILE STRUCTURE

```
tests/
├── errors/
│   ├── network-errors.test.js
│   ├── api-errors.test.js  
│   ├── form-validation.test.js
│   ├── error-boundaries.test.js
│   └── recovery-mechanisms.test.js
├── mocks/
│   ├── server.js
│   ├── handlers.js
│   └── error-scenarios.js
└── fixtures/
    ├── error-responses.json
    └── validation-rules.json
```

---

## 🚀 DELIVERABLES PER ESAME

### **Documentazione**
- [ ] Error handling strategy document
- [ ] Recovery mechanism specifications
- [ ] User experience error guidelines
- [ ] Test coverage report

### **Demo Materials**
- [ ] Error simulation scripts
- [ ] Live error recovery demo
- [ ] User feedback examples
- [ ] Technical resilience proof

### **Code Artifacts**
- [ ] Error boundary implementations
- [ ] Retry logic components
- [ ] Validation schemas
- [ ] Error tracking setup

---

**Note**: Questa suite è ESSENZIALE per dimostrare la robustezza del sistema durante l'esame. Focus su user experience e recovery automatico.
