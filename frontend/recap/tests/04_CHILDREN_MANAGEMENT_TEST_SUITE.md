# 04 - CHILDREN MANAGEMENT TEST SUITE

## OVERVIEW
Questa suite testa completamente la gestione dei bambini nel sistema, inclusi CRUD operations, associazioni parent-child, profili, sensory profiles e gestione documenti.

## STRUMENTI UTILIZZATI
- **Jest** + **React Testing Library** per unit/integration test
- **Cypress** per end-to-end test  
- **MSW (Mock Service Worker)** per mocking API
- **Axe** per test accessibilità
- **File upload testing** per gestione documenti

---

## TASK 1: VISUALIZZAZIONE LISTA BAMBINI

### Cosa Testare
- Caricamento lista bambini associati al parent
- Visualizzazione informazioni base (nome, età, foto)
- Gestione stati loading/error/empty
- Filtri per età e stato
- Paginazione se necessaria

### Come Testare
**Unit Test (Jest + RTL)**:
```javascript
test('should display children list for parent', async () => {
  const mockChildren = [
    {
      id: 1,
      first_name: 'Alice',
      last_name: 'Smith',
      birth_date: '2018-05-15',
      profile_picture: '/images/alice.jpg'
    },
    {
      id: 2,
      first_name: 'Bob',
      last_name: 'Smith',
      birth_date: '2020-03-10',
      profile_picture: null
    }
  ];
  
  server.use(
    rest.get('/api/v1/children', (req, res, ctx) => {
      return res(ctx.json(mockChildren));
    })
  );
  
  render(<ChildrenList />);
  
  await waitFor(() => {
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });
  
  // Test age calculation
  expect(screen.getByText(/6 years old/i)).toBeInTheDocument();
  expect(screen.getByText(/3 years old/i)).toBeInTheDocument();
});
```

**E2E Test (Cypress)**:
```javascript
it('should load and display children list', () => {
  cy.loginAsParent();
  cy.intercept('GET', '/api/v1/children*', { fixture: 'children-list.json' });
  
  cy.visit('/children');
  cy.get('[data-testid="children-grid"]').should('be.visible');
  cy.get('[data-testid="child-card"]').should('have.length.at.least', 1);
  
  // Test child information display
  cy.get('[data-testid="child-card"]').first().within(() => {
    cy.get('[data-testid="child-name"]').should('be.visible');
    cy.get('[data-testid="child-age"]').should('be.visible');
    cy.get('[data-testid="child-photo"]').should('be.visible');
  });
});
```

### Strumento
- **React Testing Library** per component rendering
- **Cypress** per user interaction
- **MSW** per mock children API

### Risultato Atteso
- ✅ Lista bambini caricata correttamente
- ✅ Informazioni base visualizzate (nome, età, foto)
- ✅ Calcolo età automatico
- ✅ Gestione foto mancanti
- ✅ Loading/error states gestiti

---

## TASK 2: CREAZIONE NUOVO BAMBINO

### Cosa Testare
- Form creazione bambino completo
- Validazione campi obbligatori
- Upload foto profilo
- Associazione automatica al parent
- Gestione errori server
- Success feedback

### Come Testare
**Unit Test**:
```javascript
test('should create new child successfully', async () => {
  const mockNewChild = {
    first_name: 'Charlie',
    last_name: 'Johnson',
    birth_date: '2019-08-22',
    gender: 'M'
  };
  
  server.use(
    rest.post('/api/v1/children', (req, res, ctx) => {
      return res(ctx.json({ id: 3, ...mockNewChild }));
    })
  );
  
  render(<AddChildForm onChildAdded={mockOnChildAdded} />);
  
  // Fill form
  fireEvent.change(screen.getByLabelText(/first name/i), {
    target: { value: 'Charlie' }
  });
  fireEvent.change(screen.getByLabelText(/last name/i), {
    target: { value: 'Johnson' }
  });
  fireEvent.change(screen.getByLabelText(/birth date/i), {
    target: { value: '2019-08-22' }
  });
  fireEvent.change(screen.getByLabelText(/gender/i), {
    target: { value: 'M' }
  });
  
  // Submit form
  fireEvent.click(screen.getByText(/add child/i));
  
  await waitFor(() => {
    expect(mockOnChildAdded).toHaveBeenCalledWith({ id: 3, ...mockNewChild });
  });
});

test('should validate required fields', async () => {
  render(<AddChildForm />);
  
  // Submit without filling required fields
  fireEvent.click(screen.getByText(/add child/i));
  
  await waitFor(() => {
    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/birth date is required/i)).toBeInTheDocument();
  });
});
```

**E2E Test**:
```javascript
it('should create new child with photo upload', () => {
  cy.visit('/children');
  cy.get('[data-testid="add-child-btn"]').click();
  
  // Fill child information
  cy.get('[data-testid="first-name-input"]').type('Emma');
  cy.get('[data-testid="last-name-input"]').type('Wilson');
  cy.get('[data-testid="birth-date-input"]').type('2017-12-03');
  cy.get('[data-testid="gender-select"]').select('F');
  
  // Upload photo
  cy.get('[data-testid="photo-upload"]').selectFile('cypress/fixtures/child-photo.jpg');
  cy.get('[data-testid="photo-preview"]').should('be.visible');
  
  // Submit form
  cy.get('[data-testid="submit-child-form"]').click();
  
  // Verify success
  cy.get('[data-testid="success-toast"]').should('contain', 'Child added successfully');
  cy.url().should('include', '/children');
  cy.get('[data-testid="child-card"]').should('contain', 'Emma Wilson');
});
```

### Strumento
- **React Testing Library** per form validation
- **Cypress** per file upload testing
- **MSW** per mock create API

### Risultato Atteso
- ✅ Form validazione funzionante
- ✅ Upload foto profilo
- ✅ Child creato e associato al parent
- ✅ Feedback successo/errore
- ✅ Redirect alla lista aggiornata

---

## TASK 3: MODIFICA PROFILO BAMBINO

### Cosa Testare
- Caricamento dati esistenti nel form
- Modifica informazioni base
- Aggiornamento foto profilo
- Validazione modifiche
- Salvataggio cambiamenti
- Preview modifiche

### Come Testare
**Unit Test**:
```javascript
test('should load existing child data in edit form', async () => {
  const existingChild = {
    id: 1,
    first_name: 'Alice',
    last_name: 'Smith',
    birth_date: '2018-05-15',
    gender: 'F',
    profile_picture: '/images/alice.jpg'
  };
  
  render(<EditChildForm child={existingChild} />);
  
  expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2018-05-15')).toBeInTheDocument();
  expect(screen.getByDisplayValue('F')).toBeInTheDocument();
});

test('should update child information', async () => {
  server.use(
    rest.put('/api/v1/children/1', (req, res, ctx) => {
      return res(ctx.json({ success: true }));
    })
  );
  
  render(<EditChildForm child={mockChild} onChildUpdated={mockOnUpdated} />);
  
  // Modify first name
  const firstNameInput = screen.getByLabelText(/first name/i);
  fireEvent.change(firstNameInput, { target: { value: 'Alicia' } });
  
  // Save changes
  fireEvent.click(screen.getByText(/save changes/i));
  
  await waitFor(() => {
    expect(mockOnUpdated).toHaveBeenCalled();
  });
});
```

**E2E Test**:
```javascript
it('should edit child profile successfully', () => {
  cy.visit('/children');
  cy.get('[data-testid="child-card"]').first().click();
  cy.get('[data-testid="edit-child-btn"]').click();
  
  // Modify child information
  cy.get('[data-testid="first-name-input"]').clear().type('Alexandra');
  cy.get('[data-testid="notes-textarea"]').type('Additional notes about the child');
  
  // Change photo
  cy.get('[data-testid="change-photo-btn"]').click();
  cy.get('[data-testid="photo-upload"]').selectFile('cypress/fixtures/new-photo.jpg');
  
  // Save changes
  cy.get('[data-testid="save-changes-btn"]').click();
  
  // Verify update
  cy.get('[data-testid="success-toast"]').should('contain', 'Child updated successfully');
  cy.get('[data-testid="child-name"]').should('contain', 'Alexandra');
});
```

### Strumento
- **React Testing Library** per form logic
- **Cypress** per complete edit flow
- **MSW** for mock update API

### Risultato Atteso
- ✅ Dati esistenti caricati correttamente
- ✅ Modifiche salvate con successo
- ✅ Validazione campi modificati
- ✅ Preview foto aggiornata
- ✅ Feedback operazione completata

---

## TASK 4: SENSORY PROFILE MANAGEMENT

### Cosa Testare
- Creazione sensory profile per bambino
- Questionario sensory profile
- Salvataggio risposte parziali
- Completamento questionario
- Visualizzazione risultati
- Aggiornamento profili esistenti

### Come Testare
**Unit Test**:
```javascript
test('should create sensory profile for child', async () => {
  const mockQuestions = [
    {
      id: 1,
      text: 'How does your child react to loud noises?',
      category: 'AUDITORY',
      type: 'SCALE_1_5'
    },
    {
      id: 2,
      text: 'Does your child enjoy different textures?',
      category: 'TACTILE',
      type: 'SCALE_1_5'
    }
  ];
  
  server.use(
    rest.get('/api/v1/sensory-profile/questions', (req, res, ctx) => {
      return res(ctx.json(mockQuestions));
    })
  );
  
  render(<SensoryProfileForm childId={1} />);
  
  await waitFor(() => {
    expect(screen.getByText(/loud noises/i)).toBeInTheDocument();
    expect(screen.getByText(/different textures/i)).toBeInTheDocument();
  });
});

test('should save partial responses', async () => {
  render(<SensoryProfileForm childId={1} />);
  
  // Answer first question
  const scale1 = screen.getByLabelText(/question 1.*scale 3/i);
  fireEvent.click(scale1);
  
  // Save progress
  fireEvent.click(screen.getByText(/save progress/i));
  
  await waitFor(() => {
    expect(screen.getByText(/progress saved/i)).toBeInTheDocument();
  });
});
```

**E2E Test**:
```javascript
it('should complete sensory profile questionnaire', () => {
  cy.visit('/children/1');
  cy.get('[data-testid="sensory-profile-tab"]').click();
  cy.get('[data-testid="start-questionnaire-btn"]').click();
  
  // Fill questionnaire
  cy.get('[data-testid="question-1"]').within(() => {
    cy.get('[data-testid="scale-4"]').click();
  });
  
  cy.get('[data-testid="question-2"]').within(() => {
    cy.get('[data-testid="scale-3"]').click();
  });
  
  // Continue through all questions
  cy.get('[data-testid="next-question-btn"]').click();
  
  // Complete questionnaire
  cy.get('[data-testid="submit-questionnaire-btn"]').click();
  
  // Verify completion
  cy.get('[data-testid="questionnaire-complete"]').should('be.visible');
  cy.get('[data-testid="view-results-btn"]').should('be.visible');
});
```

### Strumento
- **React Testing Library** per questionnaire logic
- **Cypress** per complete questionnaire flow
- **MSW** per mock sensory profile APIs

### Risultato Atteso
- ✅ Questionario caricato correttamente
- ✅ Risposte salvate progressivamente
- ✅ Validazione completamento
- ✅ Risultati generati automaticamente
- ✅ Profilo sensory salvato

---

## TASK 5: DOCUMENTI E ALLEGATI

### Cosa Testare
- Upload documenti bambino
- Gestione tipi file supportati
- Categorizzazione documenti
- Download documenti
- Eliminazione documenti
- Condivisione con professionisti

### Come Testare
**Unit Test**:
```javascript
test('should upload child document', async () => {
  const mockFile = new File(['document content'], 'medical-report.pdf', {
    type: 'application/pdf'
  });
  
  server.use(
    rest.post('/api/v1/children/1/documents', (req, res, ctx) => {
      return res(ctx.json({ id: 1, filename: 'medical-report.pdf' }));
    })
  );
  
  render(<DocumentUpload childId={1} />);
  
  const fileInput = screen.getByLabelText(/upload document/i);
  fireEvent.change(fileInput, { target: { files: [mockFile] } });
  
  const categorySelect = screen.getByLabelText(/document category/i);
  fireEvent.change(categorySelect, { target: { value: 'MEDICAL' } });
  
  fireEvent.click(screen.getByText(/upload/i));
  
  await waitFor(() => {
    expect(screen.getByText(/document uploaded successfully/i)).toBeInTheDocument();
  });
});

test('should validate file types', () => {
  const invalidFile = new File(['content'], 'virus.exe', {
    type: 'application/exe'
  });
  
  render(<DocumentUpload childId={1} />);
  
  const fileInput = screen.getByLabelText(/upload document/i);
  fireEvent.change(fileInput, { target: { files: [invalidFile] } });
  
  expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
});
```

**E2E Test**:
```javascript
it('should manage child documents', () => {
  cy.visit('/children/1');
  cy.get('[data-testid="documents-tab"]').click();
  
  // Upload new document
  cy.get('[data-testid="upload-document-btn"]').click();
  cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/report.pdf');
  cy.get('[data-testid="category-select"]').select('MEDICAL');
  cy.get('[data-testid="description-input"]').type('Annual medical checkup');
  cy.get('[data-testid="upload-btn"]').click();
  
  // Verify upload
  cy.get('[data-testid="document-list"]').should('contain', 'report.pdf');
  
  // Test download
  cy.get('[data-testid="download-document-btn"]').first().click();
  cy.readFile('cypress/downloads/report.pdf').should('exist');
  
  // Test delete
  cy.get('[data-testid="delete-document-btn"]').first().click();
  cy.get('[data-testid="confirm-delete"]').click();
  cy.get('[data-testid="document-list"]').should('not.contain', 'report.pdf');
});
```

### Strumento
- **React Testing Library** per file validation
- **Cypress** per file operations
- **MSW** per mock document APIs

### Risultato Atteso
- ✅ Upload documenti funzionante
- ✅ Validazione tipi file
- ✅ Categorizzazione corretta
- ✅ Download documenti
- ✅ Eliminazione sicura
- ✅ Gestione permessi condivisione

---

## TASK 6: ASSOCIAZIONI PARENT-CHILD

### Cosa Testare
- Visualizzazione bambini associati
- Richiesta accesso a bambino esistente
- Approvazione/rifiuto richieste
- Gestione accessi multipli parent
- Rimozione associazioni

### Come Testare
**Unit Test**:
```javascript
test('should display associated children for parent', async () => {
  const mockAssociations = [
    {
      child_id: 1,
      child: { first_name: 'Alice', last_name: 'Smith' },
      relationship: 'PARENT',
      status: 'ACTIVE'
    },
    {
      child_id: 2,
      child: { first_name: 'Bob', last_name: 'Smith' },
      relationship: 'GUARDIAN',
      status: 'PENDING'
    }
  ];
  
  server.use(
    rest.get('/api/v1/parent-child-associations', (req, res, ctx) => {
      return res(ctx.json(mockAssociations));
    })
  );
  
  render(<ParentChildAssociations />);
  
  await waitFor(() => {
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });
});

test('should request access to existing child', async () => {
  server.use(
    rest.post('/api/v1/parent-child-associations/request', (req, res, ctx) => {
      return res(ctx.json({ success: true }));
    })
  );
  
  render(<RequestChildAccess />);
  
  const codeInput = screen.getByLabelText(/child code/i);
  fireEvent.change(codeInput, { target: { value: 'CHD12345' } });
  
  fireEvent.click(screen.getByText(/request access/i));
  
  await waitFor(() => {
    expect(screen.getByText(/access request sent/i)).toBeInTheDocument();
  });
});
```

**E2E Test**:
```javascript
it('should manage parent-child associations', () => {
  cy.loginAsParent();
  cy.visit('/children/associations');
  
  // Request access to existing child
  cy.get('[data-testid="request-access-btn"]').click();
  cy.get('[data-testid="child-code-input"]').type('CHD12345');
  cy.get('[data-testid="relationship-select"]').select('PARENT');
  cy.get('[data-testid="submit-request-btn"]').click();
  
  // Verify request sent
  cy.get('[data-testid="success-toast"]').should('contain', 'Access request sent');
  
  // View pending requests
  cy.get('[data-testid="pending-requests-tab"]').click();
  cy.get('[data-testid="request-item"]').should('be.visible');
  
  // Test as receiving parent - approve request
  cy.loginAsReceivingParent();
  cy.visit('/children/requests');
  cy.get('[data-testid="approve-request-btn"]').first().click();
  cy.get('[data-testid="confirm-approve"]').click();
  
  // Verify approval
  cy.get('[data-testid="success-toast"]').should('contain', 'Request approved');
});
```

### Strumento
- **React Testing Library** per association logic
- **Cypress** per approval workflow
- **MSW** per mock association APIs

### Risultato Atteso
- ✅ Associazioni visualizzate correttamente
- ✅ Richieste accesso funzionanti
- ✅ Workflow approvazione completo
- ✅ Gestione accessi multipli
- ✅ Stati associazioni aggiornati

---

## TASK 7: INTEGRAZIONE CON PROFESSIONISTI

### Cosa Testare
- Condivisione profilo bambino con professionista
- Gestione permessi visualizzazione
- Storico condivisioni
- Revoca accessi
- Notifiche condivisione

### Come Testare
**Unit Test**:
```javascript
test('should share child profile with professional', async () => {
  server.use(
    rest.post('/api/v1/children/1/share', (req, res, ctx) => {
      return res(ctx.json({ success: true }));
    })
  );
  
  render(<ShareChildProfile childId={1} />);
  
  const professionalSelect = screen.getByLabelText(/professional/i);
  fireEvent.change(professionalSelect, { target: { value: 'prof_123' } });
  
  const permissionsCheckbox = screen.getByLabelText(/view sensory profile/i);
  fireEvent.click(permissionsCheckbox);
  
  fireEvent.click(screen.getByText(/share profile/i));
  
  await waitFor(() => {
    expect(screen.getByText(/profile shared successfully/i)).toBeInTheDocument();
  });
});
```

**E2E Test**:
```javascript
it('should share child profile with professional', () => {
  cy.visit('/children/1');
  cy.get('[data-testid="share-profile-btn"]').click();
  
  // Select professional
  cy.get('[data-testid="professional-select"]').select('Dr. Smith');
  
  // Set permissions
  cy.get('[data-testid="permission-sensory"]').check();
  cy.get('[data-testid="permission-documents"]').check();
  
  // Add expiry date
  cy.get('[data-testid="expiry-date"]').type('2024-12-31');
  
  // Share profile
  cy.get('[data-testid="share-btn"]').click();
  
  // Verify sharing
  cy.get('[data-testid="success-toast"]').should('contain', 'Profile shared');
  cy.get('[data-testid="shared-professionals"]').should('contain', 'Dr. Smith');
});
```

### Strumento
- **React Testing Library** per sharing logic
- **Cypress** per permission workflow
- **MSW** per mock sharing APIs

### Risultato Atteso
- ✅ Condivisione profilo funzionante
- ✅ Permessi granulari impostabili
- ✅ Storico condivisioni visibile
- ✅ Revoca accessi possibile
- ✅ Notifiche inviate correttamente

---

## CONFIGURAZIONE TEST

### Setup File Upload Testing
```javascript
// setupTests.js
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  }
});

// Mock FileReader
global.FileReader = class {
  readAsDataURL = jest.fn(() => {
    this.onload({ target: { result: 'data:image/jpeg;base64,mock' } });
  });
};
```

### Cypress File Upload Setup
```javascript
// cypress/support/commands.js
Cypress.Commands.add('uploadFile', (selector, fileName) => {
  cy.get(selector).selectFile(`cypress/fixtures/${fileName}`, { force: true });
});
```

### MSW Handlers for Children
```javascript
// mocks/childrenHandlers.js
export const childrenHandlers = [
  rest.get('/api/v1/children', (req, res, ctx) => {
    return res(ctx.json(mockChildren));
  }),
  rest.post('/api/v1/children', (req, res, ctx) => {
    return res(ctx.json({ id: Date.now(), ...req.body }));
  }),
  rest.post('/api/v1/children/:id/documents', (req, res, ctx) => {
    return res(ctx.json({ id: Date.now(), filename: 'uploaded.pdf' }));
  })
];
```

## COVERAGE TARGET
- **Line Coverage**: > 90%
- **Branch Coverage**: > 85%
- **Function Coverage**: > 95%
- **Statement Coverage**: > 90%

## ESECUZIONE TEST
```bash
# Unit tests
npm test src/pages/children/ChildrenManagement.test.jsx

# E2E tests
npx cypress run --spec "cypress/e2e/children-management.cy.js"

# Coverage con file upload
npm test -- --coverage --setupFilesAfterEnv=setupTests.js
```
