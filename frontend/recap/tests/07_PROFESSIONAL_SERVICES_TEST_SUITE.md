# 07 - PROFESSIONAL SERVICES TEST SUITE

## OVERVIEW
Questa suite testa completamente i servizi professionali, inclusi ricerca professionisti, booking appuntamenti, gestione sessioni, comunicazione e integrazione con sistema sanitario.

## STRUMENTI UTILIZZATI
- **Jest** + **React Testing Library** per unit/integration test
- **Cypress** per end-to-end test  
- **MSW (Mock Service Worker)** per mocking API
- **Real-time testing** per chat/comunicazione
- **Calendar integration testing** per booking

---

## TASK 1: RICERCA E DISCOVERY PROFESSIONISTI

### Cosa Testare
- Ricerca professionisti per specialità
- Filtri geografici e disponibilità
- Visualizzazione profili professionisti
- Sistema di rating e recensioni
- Preferenze utente e matching

### Come Testare
**Unit Test (Jest + RTL)**:
```javascript
test('should search professionals by specialty', async () => {
  const mockProfessionals = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'OCCUPATIONAL_THERAPY',
      location: 'Milano',
      rating: 4.8,
      available: true
    },
    {
      id: 2,
      name: 'Dr. Marco Rossi',
      specialty: 'SPEECH_THERAPY',
      location: 'Roma',
      rating: 4.6,
      available: false
    }
  ];
  
  server.use(
    rest.get('/api/v1/professionals/search', (req, res, ctx) => {
      const specialty = req.url.searchParams.get('specialty');
      const filtered = mockProfessionals.filter(p => 
        specialty ? p.specialty === specialty : true
      );
      return res(ctx.json(filtered));
    })
  );
  
  render(<ProfessionalSearch />);
  
  // Search by specialty
  const specialtySelect = screen.getByLabelText(/specialty/i);
  fireEvent.change(specialtySelect, { target: { value: 'OCCUPATIONAL_THERAPY' } });
  
  fireEvent.click(screen.getByText(/search/i));
  
  await waitFor(() => {
    expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Marco Rossi')).not.toBeInTheDocument();
  });
});

test('should filter professionals by location and availability', async () => {
  render(<ProfessionalSearch />);
  
  // Set location filter
  const locationInput = screen.getByLabelText(/location/i);
  fireEvent.change(locationInput, { target: { value: 'Milano' } });
  
  // Set availability filter
  const availableOnlyCheckbox = screen.getByLabelText(/available only/i);
  fireEvent.click(availableOnlyCheckbox);
  
  fireEvent.click(screen.getByText(/search/i));
  
  await waitFor(() => {
    expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });
});

test('should display professional profile details', async () => {
  const mockProfessional = {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'OCCUPATIONAL_THERAPY',
    bio: 'Experienced occupational therapist',
    qualifications: ['Master in OT', 'Sensory Integration Certified'],
    experience: 10,
    languages: ['Italian', 'English']
  };
  
  render(<ProfessionalProfile professional={mockProfessional} />);
  
  expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
  expect(screen.getByText('Experienced occupational therapist')).toBeInTheDocument();
  expect(screen.getByText('10 years experience')).toBeInTheDocument();
  expect(screen.getByText('Italian, English')).toBeInTheDocument();
});
```

**E2E Test (Cypress)**:
```javascript
it('should search and book professional services', () => {
  cy.visit('/professionals');
  
  // Search professionals
  cy.get('[data-testid="specialty-select"]').select('Occupational Therapy');
  cy.get('[data-testid="location-input"]').type('Milano');
  cy.get('[data-testid="search-radius"]').select('10 km');
  cy.get('[data-testid="search-btn"]').click();
  
  // View search results
  cy.get('[data-testid="professional-card"]').should('have.length.at.least', 1);
  cy.get('[data-testid="professional-card"]').first().within(() => {
    cy.get('[data-testid="professional-name"]').should('be.visible');
    cy.get('[data-testid="professional-rating"]').should('be.visible');
    cy.get('[data-testid="professional-location"]').should('contain', 'Milano');
  });
  
  // View professional profile
  cy.get('[data-testid="view-profile-btn"]').first().click();
  cy.get('[data-testid="professional-profile"]').should('be.visible');
  
  // Check profile sections
  cy.get('[data-testid="professional-bio"]').should('be.visible');
  cy.get('[data-testid="qualifications-section"]').should('be.visible');
  cy.get('[data-testid="reviews-section"]').should('be.visible');
  cy.get('[data-testid="availability-calendar"]').should('be.visible');
});

it('should filter and sort professional results', () => {
  cy.visit('/professionals');
  cy.get('[data-testid="search-btn"]').click();
  
  // Apply filters
  cy.get('[data-testid="filters-panel"]').within(() => {
    cy.get('[data-testid="rating-filter"]').select('4+ stars');
    cy.get('[data-testid="experience-filter"]').select('5+ years');
    cy.get('[data-testid="language-filter"]').select('English');
  });
  
  // Sort results
  cy.get('[data-testid="sort-select"]').select('Rating (High to Low)');
  
  // Verify filtered and sorted results
  cy.get('[data-testid="professional-card"]').each(($card) => {
    cy.wrap($card).within(() => {
      cy.get('[data-testid="rating"]').should('contain', '4');
    });
  });
});
```

### Strumento
- **React Testing Library** per search logic
- **Cypress** per search workflow
- **MSW** per mock professional APIs

### Risultato Atteso
- ✅ Ricerca professionisti funzionante
- ✅ Filtri geografici e specialità
- ✅ Profili dettagliati visualizzati
- ✅ Sistema rating visibile
- ✅ Ordinamento risultati

---

## TASK 2: BOOKING E GESTIONE APPUNTAMENTI

### Cosa Testare
- Visualizzazione calendario disponibilità
- Prenotazione slot temporali
- Gestione conflitti orari
- Conferma e modifica appuntamenti
- Sistema notifiche e reminder

### Come Testare
**Unit Test**:
```javascript
test('should display professional availability calendar', async () => {
  const mockAvailability = [
    {
      date: '2024-03-15',
      slots: [
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true }
      ]
    }
  ];
  
  server.use(
    rest.get('/api/v1/professionals/1/availability', (req, res, ctx) => {
      return res(ctx.json(mockAvailability));
    })
  );
  
  render(<AvailabilityCalendar professionalId={1} />);
  
  await waitFor(() => {
    expect(screen.getByText('March 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });
  
  // Available slots should be clickable
  const availableSlot = screen.getByTestId('slot-09:00');
  expect(availableSlot).not.toBeDisabled();
  
  // Unavailable slots should be disabled
  const unavailableSlot = screen.getByTestId('slot-10:00');
  expect(unavailableSlot).toBeDisabled();
});

test('should book appointment successfully', async () => {
  server.use(
    rest.post('/api/v1/appointments/book', (req, res, ctx) => {
      return res(ctx.json({ 
        id: 'apt_123',
        confirmed: true,
        reminderSent: true
      }));
    })
  );
  
  render(<AppointmentBooking professionalId={1} />);
  
  // Select date and time
  const dateInput = screen.getByLabelText(/appointment date/i);
  fireEvent.change(dateInput, { target: { value: '2024-03-15' } });
  
  const timeSlot = screen.getByTestId('slot-09:00');
  fireEvent.click(timeSlot);
  
  // Fill appointment details
  const serviceSelect = screen.getByLabelText(/service type/i);
  fireEvent.change(serviceSelect, { target: { value: 'EVALUATION' } });
  
  const notesInput = screen.getByLabelText(/notes/i);
  fireEvent.change(notesInput, { target: { value: 'First evaluation session' } });
  
  // Book appointment
  fireEvent.click(screen.getByText(/book appointment/i));
  
  await waitFor(() => {
    expect(screen.getByText(/appointment booked successfully/i)).toBeInTheDocument();
  });
});

test('should handle booking conflicts', async () => {
  server.use(
    rest.post('/api/v1/appointments/book', (req, res, ctx) => {
      return res(ctx.status(409), ctx.json({ 
        error: 'Time slot no longer available'
      }));
    })
  );
  
  render(<AppointmentBooking professionalId={1} />);
  
  // Try to book conflicting slot
  fireEvent.click(screen.getByText(/book appointment/i));
  
  await waitFor(() => {
    expect(screen.getByText(/time slot no longer available/i)).toBeInTheDocument();
  });
  
  // Should suggest alternative times
  expect(screen.getByText(/suggested alternative times/i)).toBeInTheDocument();
});
```

**E2E Test**:
```javascript
it('should complete appointment booking flow', () => {
  cy.visit('/professionals/1');
  
  // Open booking calendar
  cy.get('[data-testid="book-appointment-btn"]').click();
  
  // Navigate calendar
  cy.get('[data-testid="calendar-next-btn"]').click();
  cy.get('[data-testid="calendar-date-15"]').click();
  
  // Select available time slot
  cy.get('[data-testid="time-slots"]').within(() => {
    cy.get('[data-testid="slot-09:00"]').click();
  });
  
  // Fill booking form
  cy.get('[data-testid="service-type"]').select('Initial Evaluation');
  cy.get('[data-testid="child-select"]').select('Alice Smith');
  cy.get('[data-testid="appointment-notes"]').type('First time visit for sensory evaluation');
  
  // Review booking details
  cy.get('[data-testid="booking-summary"]').should('contain', 'March 15, 2024');
  cy.get('[data-testid="booking-summary"]').should('contain', '09:00 AM');
  
  // Confirm booking
  cy.get('[data-testid="confirm-booking-btn"]').click();
  
  // Payment if required
  cy.get('[data-testid="payment-section"]').within(() => {
    cy.get('[data-testid="payment-method"]').select('Credit Card');
    cy.get('[data-testid="card-number"]').type('4111111111111111');
    cy.get('[data-testid="expiry"]').type('12/25');
    cy.get('[data-testid="cvv"]').type('123');
  });
  
  cy.get('[data-testid="complete-booking-btn"]').click();
  
  // Verify confirmation
  cy.get('[data-testid="booking-confirmation"]').should('be.visible');
  cy.get('[data-testid="appointment-id"]').should('be.visible');
  cy.get('[data-testid="calendar-invite"]').should('be.visible');
});

it('should manage existing appointments', () => {
  cy.loginAsParent();
  cy.visit('/appointments');
  
  // View upcoming appointments
  cy.get('[data-testid="upcoming-appointments"]').should('be.visible');
  cy.get('[data-testid="appointment-card"]').should('have.length.at.least', 1);
  
  // Reschedule appointment
  cy.get('[data-testid="reschedule-btn"]').first().click();
  cy.get('[data-testid="new-date-picker"]').should('be.visible');
  cy.get('[data-testid="calendar-date-20"]').click();
  cy.get('[data-testid="slot-14:00"]').click();
  cy.get('[data-testid="confirm-reschedule"]').click();
  
  // Cancel appointment
  cy.get('[data-testid="cancel-btn"]').first().click();
  cy.get('[data-testid="cancellation-reason"]').select('Schedule conflict');
  cy.get('[data-testid="confirm-cancel"]').click();
  
  // Verify appointment status
  cy.get('[data-testid="appointment-status"]').should('contain', 'Cancelled');
});
```

### Strumento
- **React Testing Library** per booking logic
- **Cypress** per booking workflow
- **Calendar libraries** per date/time handling

### Risultato Atteso
- ✅ Calendario disponibilità funzionante
- ✅ Booking appuntamenti completato
- ✅ Gestione conflitti orari
- ✅ Modifica/cancellazione appuntamenti
- ✅ Sistema reminder attivo

---

## TASK 3: COMUNICAZIONE E CHAT

### Cosa Testare
- Sistema chat in tempo reale
- Invio messaggi e allegati
- Videochiamate integrate
- Storico conversazioni
- Notifiche push

### Come Testare
**Unit Test**:
```javascript
test('should send and receive chat messages', async () => {
  const mockMessages = [
    {
      id: 1,
      sender: 'parent',
      content: 'Hello, I have a question about my child',
      timestamp: '2024-03-15T10:00:00Z'
    },
    {
      id: 2,
      sender: 'professional',
      content: 'Of course, how can I help you?',
      timestamp: '2024-03-15T10:05:00Z'
    }
  ];
  
  server.use(
    rest.get('/api/v1/conversations/1/messages', (req, res, ctx) => {
      return res(ctx.json(mockMessages));
    }),
    rest.post('/api/v1/conversations/1/messages', (req, res, ctx) => {
      return res(ctx.json({
        id: 3,
        sender: 'parent',
        content: req.body.content,
        timestamp: new Date().toISOString()
      }));
    })
  );
  
  render(<ChatConversation conversationId={1} />);
  
  // Display existing messages
  await waitFor(() => {
    expect(screen.getByText('Hello, I have a question about my child')).toBeInTheDocument();
    expect(screen.getByText('Of course, how can I help you?')).toBeInTheDocument();
  });
  
  // Send new message
  const messageInput = screen.getByLabelText(/type your message/i);
  fireEvent.change(messageInput, { target: { value: 'Thank you for your help!' } });
  
  fireEvent.click(screen.getByText(/send/i));
  
  await waitFor(() => {
    expect(screen.getByText('Thank you for your help!')).toBeInTheDocument();
  });
});

test('should handle file attachments in chat', async () => {
  const mockFile = new File(['test content'], 'document.pdf', { type: 'application/pdf' });
  
  server.use(
    rest.post('/api/v1/conversations/1/attachments', (req, res, ctx) => {
      return res(ctx.json({
        id: 'file_123',
        filename: 'document.pdf',
        url: '/files/document.pdf'
      }));
    })
  );
  
  render(<ChatConversation conversationId={1} />);
  
  // Upload file
  const fileInput = screen.getByLabelText(/attach file/i);
  fireEvent.change(fileInput, { target: { files: [mockFile] } });
  
  await waitFor(() => {
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });
  
  fireEvent.click(screen.getByText(/send/i));
  
  await waitFor(() => {
    expect(screen.getByText(/file sent successfully/i)).toBeInTheDocument();
  });
});

test('should initiate video call', () => {
  const mockInitiateCall = jest.fn();
  
  render(<ChatConversation onInitiateVideoCall={mockInitiateCall} />);
  
  const videoCallButton = screen.getByLabelText(/start video call/i);
  fireEvent.click(videoCallButton);
  
  expect(mockInitiateCall).toHaveBeenCalled();
});
```

**E2E Test**:
```javascript
it('should handle real-time communication', () => {
  // Mock WebSocket connection
  cy.mockWebSocket('/ws/chat');
  
  cy.loginAsParent();
  cy.visit('/conversations/1');
  
  // Send message
  cy.get('[data-testid="message-input"]').type('Hello, Dr. Johnson!');
  cy.get('[data-testid="send-btn"]').click();
  
  // Verify message appears
  cy.get('[data-testid="message-list"]').should('contain', 'Hello, Dr. Johnson!');
  
  // Simulate incoming message
  cy.triggerWebSocketMessage({
    type: 'new_message',
    sender: 'professional',
    content: 'Hello! How can I help you today?'
  });
  
  // Verify incoming message appears
  cy.get('[data-testid="message-list"]').should('contain', 'Hello! How can I help you today?');
  
  // Test file attachment
  cy.get('[data-testid="attach-file-btn"]').click();
  cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/test-report.pdf');
  
  cy.get('[data-testid="file-preview"]').should('contain', 'test-report.pdf');
  cy.get('[data-testid="send-attachment-btn"]').click();
  
  // Test video call
  cy.get('[data-testid="video-call-btn"]').click();
  cy.get('[data-testid="video-call-modal"]').should('be.visible');
  cy.get('[data-testid="call-status"]').should('contain', 'Connecting...');
});

it('should manage conversation history', () => {
  cy.visit('/conversations');
  
  // View conversation list
  cy.get('[data-testid="conversation-list"]').should('be.visible');
  cy.get('[data-testid="conversation-item"]').should('have.length.at.least', 1);
  
  // Search conversations
  cy.get('[data-testid="search-conversations"]').type('Dr. Johnson');
  cy.get('[data-testid="filtered-conversations"]').should('be.visible');
  
  // View conversation details
  cy.get('[data-testid="conversation-item"]').first().click();
  cy.get('[data-testid="conversation-header"]').should('be.visible');
  cy.get('[data-testid="message-history"]').should('be.visible');
  
  // Archive conversation
  cy.get('[data-testid="conversation-menu"]').click();
  cy.get('[data-testid="archive-conversation"]').click();
  cy.get('[data-testid="archived-indicator"]').should('be.visible');
});
```

### Strumento
- **WebSocket testing** per real-time chat
- **React Testing Library** per chat UI
- **Cypress** per communication workflow

### Risultato Atteso
- ✅ Chat tempo reale funzionante
- ✅ Invio messaggi e allegati
- ✅ Videochiamate integrate
- ✅ Storico conversazioni
- ✅ Notifiche push attive

---

## TASK 4: SESSIONI E FOLLOW-UP

### Cosa Testare
- Gestione sessioni terapeutiche
- Note e progress tracking
- Homework assignments
- Follow-up scheduling
- Report sessioni

### Come Testare
**Unit Test**:
```javascript
test('should create therapy session notes', async () => {
  const sessionData = {
    appointmentId: 'apt_123',
    duration: 60,
    activities: ['Sensory play', 'Fine motor exercises'],
    progress: 'Good improvement in bilateral coordination',
    homework: 'Practice cutting with scissors daily',
    nextSessionDate: '2024-03-22'
  };
  
  server.use(
    rest.post('/api/v1/sessions', (req, res, ctx) => {
      return res(ctx.json({ id: 'session_456', ...sessionData }));
    })
  );
  
  render(<SessionNotesForm appointmentId="apt_123" />);
  
  // Fill session notes
  const activitiesInput = screen.getByLabelText(/activities performed/i);
  fireEvent.change(activitiesInput, { target: { value: 'Sensory play, Fine motor exercises' } });
  
  const progressInput = screen.getByLabelText(/progress notes/i);
  fireEvent.change(progressInput, { target: { value: 'Good improvement in bilateral coordination' } });
  
  const homeworkInput = screen.getByLabelText(/homework assignment/i);
  fireEvent.change(homeworkInput, { target: { value: 'Practice cutting with scissors daily' } });
  
  fireEvent.click(screen.getByText(/save session notes/i));
  
  await waitFor(() => {
    expect(screen.getByText(/session notes saved successfully/i)).toBeInTheDocument();
  });
});

test('should track child progress over sessions', () => {
  const progressData = [
    { date: '2024-03-01', skill: 'Fine Motor', score: 3 },
    { date: '2024-03-08', skill: 'Fine Motor', score: 4 },
    { date: '2024-03-15', skill: 'Fine Motor', score: 5 }
  ];
  
  render(<ProgressTracker data={progressData} />);
  
  expect(screen.getByText(/progress chart/i)).toBeInTheDocument();
  expect(screen.getByText(/improvement trend/i)).toBeInTheDocument();
});

test('should schedule follow-up sessions', async () => {
  server.use(
    rest.post('/api/v1/appointments/follow-up', (req, res, ctx) => {
      return res(ctx.json({ 
        id: 'apt_789',
        date: '2024-03-22',
        type: 'FOLLOW_UP'
      }));
    })
  );
  
  render(<FollowUpScheduler sessionId="session_456" />);
  
  const followUpDate = screen.getByLabelText(/follow-up date/i);
  fireEvent.change(followUpDate, { target: { value: '2024-03-22' } });
  
  const recommendedInterval = screen.getByLabelText(/recommended interval/i);
  fireEvent.change(recommendedInterval, { target: { value: '1 week' } });
  
  fireEvent.click(screen.getByText(/schedule follow-up/i));
  
  await waitFor(() => {
    expect(screen.getByText(/follow-up scheduled/i)).toBeInTheDocument();
  });
});
```

**E2E Test**:
```javascript
it('should manage therapy sessions workflow', () => {
  cy.loginAsProfessional();
  cy.visit('/appointments/today');
  
  // Start session
  cy.get('[data-testid="appointment-card"]').first().within(() => {
    cy.get('[data-testid="start-session-btn"]').click();
  });
  
  // Session in progress
  cy.get('[data-testid="session-timer"]').should('be.visible');
  cy.get('[data-testid="session-activities"]').should('be.visible');
  
  // Add session notes during session
  cy.get('[data-testid="quick-notes"]').type('Child showed great engagement today');
  cy.get('[data-testid="save-quick-note"]').click();
  
  // Complete session
  cy.get('[data-testid="complete-session-btn"]').click();
  
  // Fill comprehensive session notes
  cy.get('[data-testid="session-notes-form"]').should('be.visible');
  cy.get('[data-testid="activities-performed"]').type('Bilateral coordination exercises, sensory play with different textures');
  cy.get('[data-testid="child-response"]').select('Very Positive');
  cy.get('[data-testid="progress-rating"]').click(); // Star rating
  cy.get('[data-testid="homework-assignment"]').type('Practice fine motor skills with play dough daily');
  
  // Schedule next session
  cy.get('[data-testid="schedule-next-session"]').check();
  cy.get('[data-testid="next-session-date"]').type('2024-03-22');
  
  // Submit session report
  cy.get('[data-testid="submit-session-report"]').click();
  
  // Verify session completion
  cy.get('[data-testid="session-complete-confirmation"]').should('be.visible');
  cy.get('[data-testid="parent-notification-sent"]').should('be.visible');
});

it('should track progress across multiple sessions', () => {
  cy.visit('/children/1/progress');
  
  // View progress dashboard
  cy.get('[data-testid="progress-charts"]').should('be.visible');
  cy.get('[data-testid="skill-progress-chart"]').should('be.visible');
  
  // Filter by skill area
  cy.get('[data-testid="skill-filter"]').select('Fine Motor Skills');
  cy.get('[data-testid="filtered-progress"]').should('be.visible');
  
  // View session details
  cy.get('[data-testid="session-history"]').within(() => {
    cy.get('[data-testid="session-item"]').first().click();
  });
  
  cy.get('[data-testid="session-detail-modal"]').should('be.visible');
  cy.get('[data-testid="session-notes"]').should('be.visible');
  cy.get('[data-testid="homework-completed"]').should('be.visible');
  
  // Export progress report
  cy.get('[data-testid="export-progress-btn"]').click();
  cy.get('[data-testid="export-format"]').select('PDF');
  cy.get('[data-testid="date-range"]').select('Last 3 months');
  cy.get('[data-testid="download-report-btn"]').click();
  
  cy.readFile('cypress/downloads/progress-report.pdf').should('exist');
});
```

### Strumento
- **React Testing Library** per session management
- **Cypress** per therapy workflow
- **Chart libraries** per progress tracking

### Risultato Atteso
- ✅ Gestione sessioni completa
- ✅ Note e progress tracking
- ✅ Homework assignments
- ✅ Follow-up automatico
- ✅ Report sessioni generati

---

## TASK 5: PAYMENT E BILLING

### Cosa Testare
- Sistema pagamenti integrato
- Gestione tariffe professionisti
- Fatturazione automatica
- Rimborsi e dispute
- Report finanziari

### Come Testare
**Unit Test**:
```javascript
test('should calculate session fees correctly', () => {
  const sessionData = {
    duration: 90,
    professionalRate: 80, // per hour
    serviceType: 'EVALUATION',
    discounts: [{ type: 'FIRST_SESSION', amount: 20 }]
  };
  
  const totalFee = calculateSessionFee(sessionData);
  
  // 90 minutes = 1.5 hours, 80 * 1.5 = 120, minus 20 discount = 100
  expect(totalFee).toBe(100);
});

test('should process payment successfully', async () => {
  const paymentData = {
    amount: 100,
    currency: 'EUR',
    cardToken: 'card_token_123'
  };
  
  server.use(
    rest.post('/api/v1/payments/process', (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        transactionId: 'txn_456',
        receipt: 'receipt_789'
      }));
    })
  );
  
  render(<PaymentForm appointmentId="apt_123" amount={100} />);
  
  // Fill payment form
  const cardNumberInput = screen.getByLabelText(/card number/i);
  fireEvent.change(cardNumberInput, { target: { value: '4111111111111111' } });
  
  const expiryInput = screen.getByLabelText(/expiry date/i);
  fireEvent.change(expiryInput, { target: { value: '12/25' } });
  
  const cvvInput = screen.getByLabelText(/cvv/i);
  fireEvent.change(cvvInput, { target: { value: '123' } });
  
  fireEvent.click(screen.getByText(/pay now/i));
  
  await waitFor(() => {
    expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
  });
});

test('should handle payment failures', async () => {
  server.use(
    rest.post('/api/v1/payments/process', (req, res, ctx) => {
      return res(ctx.status(400), ctx.json({
        error: 'Card declined',
        code: 'CARD_DECLINED'
      }));
    })
  );
  
  render(<PaymentForm appointmentId="apt_123" amount={100} />);
  
  fireEvent.click(screen.getByText(/pay now/i));
  
  await waitFor(() => {
    expect(screen.getByText(/card declined/i)).toBeInTheDocument();
  });
  
  // Should show alternative payment methods
  expect(screen.getByText(/try different payment method/i)).toBeInTheDocument();
});
```

**E2E Test**:
```javascript
it('should complete payment process', () => {
  cy.visit('/appointments/payment/apt_123');
  
  // Review appointment and fee
  cy.get('[data-testid="appointment-summary"]').should('be.visible');
  cy.get('[data-testid="professional-fee"]').should('contain', '€100');
  cy.get('[data-testid="total-amount"]').should('contain', '€100');
  
  // Fill payment details
  cy.get('[data-testid="payment-method"]').select('Credit Card');
  cy.get('[data-testid="card-number"]').type('4111111111111111');
  cy.get('[data-testid="expiry-date"]').type('1225');
  cy.get('[data-testid="cvv"]').type('123');
  cy.get('[data-testid="cardholder-name"]').type('John Doe');
  
  // Billing address
  cy.get('[data-testid="billing-address"]').type('Via Roma 123');
  cy.get('[data-testid="billing-city"]').type('Milano');
  cy.get('[data-testid="billing-zip"]').type('20100');
  
  // Process payment
  cy.get('[data-testid="pay-now-btn"]').click();
  
  // Payment processing
  cy.get('[data-testid="payment-processing"]').should('be.visible');
  
  // Payment success
  cy.get('[data-testid="payment-success"]', { timeout: 10000 }).should('be.visible');
  cy.get('[data-testid="transaction-id"]').should('be.visible');
  cy.get('[data-testid="receipt-download"]').should('be.visible');
  
  // Download receipt
  cy.get('[data-testid="download-receipt-btn"]').click();
  cy.readFile('cypress/downloads/receipt.pdf').should('exist');
});

it('should manage billing and invoices', () => {
  cy.loginAsProfessional();
  cy.visit('/billing');
  
  // View billing dashboard
  cy.get('[data-testid="earnings-summary"]').should('be.visible');
  cy.get('[data-testid="pending-payments"]').should('be.visible');
  cy.get('[data-testid="completed-sessions"]').should('be.visible');
  
  // Generate invoice
  cy.get('[data-testid="generate-invoice-btn"]').click();
  cy.get('[data-testid="invoice-period"]').select('Current Month');
  cy.get('[data-testid="create-invoice-btn"]').click();
  
  // View generated invoice
  cy.get('[data-testid="invoice-list"]').should('contain', 'March 2024');
  cy.get('[data-testid="view-invoice-btn"]').first().click();
  
  // Invoice details
  cy.get('[data-testid="invoice-details"]').should('be.visible');
  cy.get('[data-testid="sessions-list"]').should('be.visible');
  cy.get('[data-testid="total-earnings"]').should('be.visible');
  
  // Download invoice
  cy.get('[data-testid="download-invoice-btn"]').click();
});
```

### Strumento
- **Payment gateway testing** per transazioni
- **React Testing Library** per payment UI
- **Cypress** per payment workflow

### Risultato Atteso
- ✅ Calcolo tariffe corretto
- ✅ Pagamenti processati con successo
- ✅ Gestione errori pagamento
- ✅ Fatturazione automatica
- ✅ Report finanziari

---

## TASK 6: INTEGRAZIONE SISTEMA SANITARIO

### Cosa Testare
- Integrazione con cartelle cliniche
- Export dati in formato HL7/FHIR
- Sincronizzazione appuntamenti
- Compliance normative sanitarie
- Audit trail medico

### Come Testare
**Unit Test**:
```javascript
test('should export session data in HL7 format', () => {
  const sessionData = {
    patient: { id: 'pat_123', name: 'Alice Smith' },
    professional: { id: 'prof_456', name: 'Dr. Johnson' },
    date: '2024-03-15',
    diagnosis: 'Sensory Processing Disorder',
    treatment: 'Occupational Therapy',
    notes: 'Good progress in bilateral coordination'
  };
  
  const hl7Data = exportToHL7(sessionData);
  
  expect(hl7Data).toContain('MSH|^~\\&|SMILE_ADVENTURE');
  expect(hl7Data).toContain('PID|||pat_123||Smith^Alice');
  expect(hl7Data).toContain('OBX|1|ST|TREATMENT||Occupational Therapy');
});

test('should validate HIPAA compliance', () => {
  const dataToExport = {
    patient: { id: 'pat_123', ssn: '123-45-6789' },
    session: { notes: 'Confidential therapy notes' }
  };
  
  const complianceCheck = validateHIPAACompliance(dataToExport);
  
  expect(complianceCheck.isCompliant).toBe(true);
  expect(complianceCheck.encryptedFields).toContain('ssn');
  expect(complianceCheck.auditTrail).toBeDefined();
});

test('should sync appointments with EMR system', async () => {
  server.use(
    rest.post('/api/v1/emr/sync/appointments', (req, res, ctx) => {
      return res(ctx.json({
        synced: 5,
        conflicts: 1,
        errors: 0
      }));
    })
  );
  
  render(<EMRSyncManager />);
  
  fireEvent.click(screen.getByText(/sync appointments/i));
  
  await waitFor(() => {
    expect(screen.getByText(/5 appointments synced/i)).toBeInTheDocument();
    expect(screen.getByText(/1 conflict detected/i)).toBeInTheDocument();
  });
});
```

**E2E Test**:
```javascript
it('should integrate with healthcare systems', () => {
  cy.loginAsProfessional();
  cy.visit('/integrations/healthcare');
  
  // Configure EMR integration
  cy.get('[data-testid="emr-config"]').click();
  cy.get('[data-testid="emr-endpoint"]').type('https://emr.hospital.com/api');
  cy.get('[data-testid="auth-token"]').type('secure_token_123');
  cy.get('[data-testid="test-connection-btn"]').click();
  
  cy.get('[data-testid="connection-success"]').should('be.visible');
  
  // Export patient data
  cy.get('[data-testid="export-patient-data"]').click();
  cy.get('[data-testid="patient-select"]').select('Alice Smith');
  cy.get('[data-testid="export-format"]').select('HL7 FHIR');
  cy.get('[data-testid="date-range"]').select('Last 6 months');
  
  cy.get('[data-testid="export-btn"]').click();
  cy.get('[data-testid="export-progress"]').should('be.visible');
  cy.get('[data-testid="export-complete"]').should('be.visible');
  
  // Verify audit trail
  cy.get('[data-testid="audit-trail"]').should('be.visible');
  cy.get('[data-testid="export-audit-entry"]').should('contain', 'HL7 FHIR export');
});

it('should maintain clinical documentation standards', () => {
  cy.visit('/sessions/new');
  
  // Clinical documentation requirements
  cy.get('[data-testid="clinical-template"]').select('OT Evaluation');
  
  // Required clinical fields
  cy.get('[data-testid="primary-diagnosis"]').should('have.attr', 'required');
  cy.get('[data-testid="treatment-goals"]').should('have.attr', 'required');
  cy.get('[data-testid="intervention-plan"]').should('have.attr', 'required');
  
  // Fill clinical documentation
  cy.get('[data-testid="primary-diagnosis"]').type('Sensory Processing Disorder');
  cy.get('[data-testid="treatment-goals"]').type('Improve bilateral coordination');
  cy.get('[data-testid="intervention-plan"]').type('Weekly OT sessions focusing on sensory integration');
  
  // Clinical signature
  cy.get('[data-testid="digital-signature"]').should('be.visible');
  cy.get('[data-testid="license-number"]').type('OT12345');
  
  cy.get('[data-testid="submit-clinical-notes"]').click();
  
  // Verify clinical standards compliance
  cy.get('[data-testid="compliance-check"]').should('contain', 'All clinical requirements met');
});
```

### Strumento
- **HL7/FHIR libraries** per standard compliance
- **Encryption testing** per HIPAA compliance
- **Integration testing** per EMR systems

### Risultato Atteso
- ✅ Export HL7/FHIR funzionante
- ✅ Compliance HIPAA verificata
- ✅ Sincronizzazione EMR
- ✅ Standard clinici rispettati
- ✅ Audit trail completo

---

## CONFIGURAZIONE TEST

### Setup Real-time Testing
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testTimeout: 10000
};

// Mock WebSocket for real-time features
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));
```

### MSW Professional Services Handlers
```javascript
// mocks/professionalHandlers.js
export const professionalHandlers = [
  rest.get('/api/v1/professionals/search', (req, res, ctx) => {
    return res(ctx.json(mockProfessionals));
  }),
  
  rest.get('/api/v1/professionals/:id/availability', (req, res, ctx) => {
    return res(ctx.json(mockAvailability));
  }),
  
  rest.post('/api/v1/appointments/book', (req, res, ctx) => {
    return res(ctx.json({ id: 'apt_123', confirmed: true }));
  }),
  
  rest.post('/api/v1/payments/process', (req, res, ctx) => {
    return res(ctx.json({ success: true, transactionId: 'txn_456' }));
  })
];
```

### Cypress Professional Services Commands
```javascript
// cypress/support/commands.js
Cypress.Commands.add('loginAsProfessional', () => {
  cy.visit('/login');
  cy.get('[data-testid="email"]').type('professional@test.com');
  cy.get('[data-testid="password"]').type('password123');
  cy.get('[data-testid="login-btn"]').click();
});

Cypress.Commands.add('mockWebSocket', (endpoint) => {
  cy.window().then((win) => {
    win.mockWebSocket = true;
  });
});
```

## COVERAGE TARGET
- **Line Coverage**: > 85%
- **Branch Coverage**: > 80%
- **Function Coverage**: > 90%
- **Integration Coverage**: 100% critical paths

## ESECUZIONE TEST
```bash
# Unit tests
npm test src/components/professional/ -- --coverage

# E2E tests
npx cypress run --spec "cypress/e2e/professional-services.cy.js"

# Real-time feature tests
npm test -- --testNamePattern="real-time|websocket"
```
