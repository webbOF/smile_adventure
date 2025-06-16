# 06 - SENSORY PROFILE TEST SUITE

## OVERVIEW
Questa suite testa completamente il sistema di profili sensoriali, inclusi questionari, valutazioni, analisi dati, grafici, report e integrazione con professionisti.

## STRUMENTI UTILIZZATI
- **Jest** + **React Testing Library** per unit/integration test
- **Cypress** per end-to-end test  
- **MSW (Mock Service Worker)** per mocking API
- **Chart.js testing** per visualizzazioni grafiche
- **Accessibility testing** per questionari

---

## TASK 1: QUESTIONARIO SENSORY PROFILE

### Cosa Testare
- Caricamento domande questionario
- Navigazione tra sezioni
- Salvataggio risposte progressive
- Validazione risposte obbligatorie
- Timer sessioni questionario
- Ripresa questionario interrotto

### Come Testare
**Unit Test (Jest + RTL)**:
```javascript
test('should load sensory profile questions', async () => {
  const mockQuestions = [
    {
      id: 1,
      text: 'How does your child react to loud noises?',
      category: 'AUDITORY',
      type: 'SCALE_1_5',
      required: true
    },
    {
      id: 2,
      text: 'Does your child enjoy different food textures?',
      category: 'TACTILE',
      type: 'SCALE_1_5',
      required: true
    }
  ];
  
  server.use(
    rest.get('/api/v1/sensory-profile/questions', (req, res, ctx) => {
      return res(ctx.json(mockQuestions));
    })
  );
  
  render(<SensoryProfileQuestionnaire childId={1} />);
  
  await waitFor(() => {
    expect(screen.getByText(/loud noises/i)).toBeInTheDocument();
    expect(screen.getByText(/food textures/i)).toBeInTheDocument();
  });
  
  // Test question navigation
  const nextButton = screen.getByText(/next/i);
  expect(nextButton).toBeInTheDocument();
});

test('should save answers progressively', async () => {
  server.use(
    rest.post('/api/v1/sensory-profile/answers/save', (req, res, ctx) => {
      return res(ctx.json({ success: true, saved: true }));
    })
  );
  
  render(<SensoryProfileQuestionnaire childId={1} />);
  
  // Answer first question
  const scale3Button = screen.getByLabelText(/scale 3/i);
  fireEvent.click(scale3Button);
  
  // Auto-save should trigger
  await waitFor(() => {
    expect(screen.getByText(/answer saved/i)).toBeInTheDocument();
  });
});

test('should validate required questions', async () => {
  render(<SensoryProfileQuestionnaire childId={1} />);
  
  // Try to proceed without answering required question
  const nextButton = screen.getByText(/next/i);
  fireEvent.click(nextButton);
  
  await waitFor(() => {
    expect(screen.getByText(/please answer this question/i)).toBeInTheDocument();
  });
});
```

**E2E Test (Cypress)**:
```javascript
it('should complete sensory profile questionnaire', () => {
  cy.visit('/children/1/sensory-profile');
  cy.get('[data-testid="start-questionnaire-btn"]').click();
  
  // Test question navigation and answering
  cy.get('[data-testid="question-container"]').should('be.visible');
  cy.get('[data-testid="question-text"]').should('contain', 'loud noises');
  
  // Answer question with scale
  cy.get('[data-testid="scale-option-3"]').click();
  cy.get('[data-testid="auto-save-indicator"]').should('be.visible');
  
  // Navigate to next question
  cy.get('[data-testid="next-question-btn"]').click();
  cy.get('[data-testid="question-text"]').should('contain', 'food textures');
  
  // Test previous navigation
  cy.get('[data-testid="prev-question-btn"]').click();
  cy.get('[data-testid="scale-option-3"]').should('be.checked');
  
  // Complete all questions
  cy.get('[data-testid="question-progress"]').should('contain', '1 of');
  
  // Test questionnaire completion
  for (let i = 0; i < 5; i++) {
    cy.get('[data-testid="scale-option-3"]').click();
    cy.get('[data-testid="next-question-btn"]').click();
  }
  
  // Submit completed questionnaire
  cy.get('[data-testid="submit-questionnaire-btn"]').click();
  cy.get('[data-testid="completion-message"]').should('be.visible');
});

it('should resume interrupted questionnaire', () => {
  // Start questionnaire
  cy.visit('/children/1/sensory-profile');
  cy.get('[data-testid="start-questionnaire-btn"]').click();
  
  // Answer some questions
  cy.get('[data-testid="scale-option-4"]').click();
  cy.get('[data-testid="next-question-btn"]').click();
  cy.get('[data-testid="scale-option-2"]').click();
  
  // Leave and return
  cy.visit('/children');
  cy.visit('/children/1/sensory-profile');
  
  // Should show resume option
  cy.get('[data-testid="resume-questionnaire-btn"]').should('be.visible');
  cy.get('[data-testid="progress-indicator"]').should('contain', '2 of');
  
  // Resume questionnaire
  cy.get('[data-testid="resume-questionnaire-btn"]').click();
  cy.get('[data-testid="question-text"]').should('be.visible');
});
```

### Strumento
- **React Testing Library** per questionnaire logic
- **Cypress** per complete questionnaire flow
- **MSW** per mock questionnaire APIs

### Risultato Atteso
- ✅ Domande caricate correttamente
- ✅ Navigazione tra domande funzionante
- ✅ Salvataggio automatico risposte
- ✅ Validazione domande obbligatorie
- ✅ Ripresa questionario possibile

---

## TASK 2: ANALISI E SCORING

### Cosa Testare
- Calcolo punteggi per categoria
- Algoritmi di scoring
- Interpretazione risultati
- Confronto con norme standard
- Generazione insights automatici

### Come Testare
**Unit Test**:
```javascript
test('should calculate category scores correctly', () => {
  const answers = [
    { questionId: 1, category: 'AUDITORY', value: 3 },
    { questionId: 2, category: 'AUDITORY', value: 4 },
    { questionId: 3, category: 'TACTILE', value: 2 },
    { questionId: 4, category: 'TACTILE', value: 5 }
  ];
  
  const expectedScores = {
    AUDITORY: { raw: 7, scaled: 3.5, percentile: 65 },
    TACTILE: { raw: 7, scaled: 3.5, percentile: 45 }
  };
  
  const scores = calculateCategoryScores(answers);
  expect(scores).toEqual(expectedScores);
});

test('should interpret scores correctly', () => {
  const scores = {
    AUDITORY: { percentile: 85 },
    TACTILE: { percentile: 25 },
    VISUAL: { percentile: 50 }
  };
  
  const interpretation = interpretSensoryProfile(scores);
  
  expect(interpretation.AUDITORY.level).toBe('HIGH_SENSITIVITY');
  expect(interpretation.TACTILE.level).toBe('LOW_SENSITIVITY');
  expect(interpretation.VISUAL.level).toBe('TYPICAL');
});

test('should generate recommendations based on profile', () => {
  const profile = {
    categories: {
      AUDITORY: { level: 'HIGH_SENSITIVITY', score: 85 },
      TACTILE: { level: 'LOW_SENSITIVITY', score: 25 }
    }
  };
  
  const recommendations = generateRecommendations(profile);
  
  expect(recommendations.AUDITORY).toContain('noise-canceling headphones');
  expect(recommendations.TACTILE).toContain('sensory seeking activities');
});
```

**E2E Test**:
```javascript
it('should generate and display sensory profile analysis', () => {
  // Complete questionnaire first
  cy.visit('/children/1/sensory-profile');
  cy.completeQuestionnaire(); // Custom command
  
  // View analysis
  cy.get('[data-testid="view-analysis-btn"]').click();
  
  // Verify score display
  cy.get('[data-testid="category-scores"]').should('be.visible');
  cy.get('[data-testid="auditory-score"]').should('contain', 'High Sensitivity');
  cy.get('[data-testid="tactile-score"]').should('contain', 'Low Sensitivity');
  
  // Check percentile charts
  cy.get('[data-testid="percentile-chart"]').should('be.visible');
  cy.get('[data-testid="score-breakdown"]').should('be.visible');
  
  // Verify recommendations
  cy.get('[data-testid="recommendations-section"]').should('be.visible');
  cy.get('[data-testid="auditory-recommendations"]').should('contain', 'strategies');
  
  // Test score comparison
  cy.get('[data-testid="compare-norms-btn"]').click();
  cy.get('[data-testid="norm-comparison"]').should('be.visible');
});
```

### Strumento
- **Jest** per scoring algorithms
- **React Testing Library** per score display
- **Cypress** per analysis workflow

### Risultato Atteso
- ✅ Punteggi calcolati correttamente
- ✅ Interpretazione accurata
- ✅ Confronto con norme
- ✅ Raccomandazioni generate
- ✅ Insights automatici

---

## TASK 3: VISUALIZZAZIONI E GRAFICI

### Cosa Testare
- Grafici radar per profilo sensoriale
- Grafici a barre per categorie
- Grafici temporali per progressi
- Interattività grafici
- Export grafici come immagini

### Come Testare
**Unit Test**:
```javascript
test('should render sensory profile radar chart', () => {
  const profileData = {
    categories: [
      { name: 'Auditory', score: 85, percentile: 85 },
      { name: 'Tactile', score: 25, percentile: 25 },
      { name: 'Visual', score: 60, percentile: 60 },
      { name: 'Vestibular', score: 70, percentile: 70 }
    ]
  };
  
  render(<SensoryRadarChart data={profileData} />);
  
  // Check if chart canvas is rendered
  expect(screen.getByRole('img', { name: /radar chart/i })).toBeInTheDocument();
  
  // Test chart legend
  expect(screen.getByText('Auditory')).toBeInTheDocument();
  expect(screen.getByText('Tactile')).toBeInTheDocument();
});

test('should handle chart interactions', () => {
  const mockOnCategoryClick = jest.fn();
  
  render(<SensoryRadarChart onCategoryClick={mockOnCategoryClick} />);
  
  const chartCanvas = screen.getByRole('img');
  fireEvent.click(chartCanvas);
  
  // Chart library specific interaction testing
  expect(mockOnCategoryClick).toHaveBeenCalled();
});

test('should render progress timeline chart', () => {
  const progressData = [
    { date: '2024-01-01', auditoryScore: 75 },
    { date: '2024-02-01', auditoryScore: 80 },
    { date: '2024-03-01', auditoryScore: 85 }
  ];
  
  render(<ProgressTimelineChart data={progressData} />);
  
  expect(screen.getByText(/progress over time/i)).toBeInTheDocument();
});
```

**E2E Test**:
```javascript
it('should display interactive sensory profile charts', () => {
  cy.visit('/children/1/sensory-profile/analysis');
  
  // Test radar chart
  cy.get('[data-testid="radar-chart"]').should('be.visible');
  cy.get('[data-testid="chart-legend"]').should('contain', 'Auditory');
  
  // Test chart interactivity
  cy.get('[data-testid="radar-chart"] canvas').click(100, 100);
  cy.get('[data-testid="category-detail-popup"]').should('be.visible');
  
  // Test chart switching
  cy.get('[data-testid="chart-type-select"]').select('Bar Chart');
  cy.get('[data-testid="bar-chart"]').should('be.visible');
  
  // Test progress timeline
  cy.get('[data-testid="progress-tab"]').click();
  cy.get('[data-testid="timeline-chart"]').should('be.visible');
  cy.get('[data-testid="date-range-picker"]').should('be.visible');
  
  // Test chart export
  cy.get('[data-testid="export-chart-btn"]').click();
  cy.get('[data-testid="export-format-select"]').select('PNG');
  cy.get('[data-testid="download-chart-btn"]').click();
  
  // Verify download
  cy.readFile('cypress/downloads/sensory-profile-chart.png').should('exist');
});

it('should show detailed category analysis', () => {
  cy.visit('/children/1/sensory-profile/analysis');
  
  // Click on specific category
  cy.get('[data-testid="auditory-category"]').click();
  
  // Category detail view
  cy.get('[data-testid="category-detail-modal"]').should('be.visible');
  cy.get('[data-testid="category-questions"]').should('be.visible');
  cy.get('[data-testid="category-scores"]').should('be.visible');
  cy.get('[data-testid="category-recommendations"]').should('be.visible');
  
  // Sub-category breakdown
  cy.get('[data-testid="subcategory-chart"]').should('be.visible');
});
```

### Strumento
- **Chart.js** per rendering grafici
- **React Testing Library** per chart components
- **Cypress** per chart interactions

### Risultato Atteso
- ✅ Grafici radar renderizzati correttamente
- ✅ Interattività grafici funzionante
- ✅ Timeline progressi visualizzata
- ✅ Export grafici possibile
- ✅ Dettagli categorie accessibili

---

## TASK 4: CONFRONTI E BENCHMARK

### Cosa Testare
- Confronto con profili precedenti
- Benchmark con gruppi età
- Analisi cambiamenti nel tempo
- Statistiche comparative
- Alert per cambiamenti significativi

### Come Testare
**Unit Test**:
```javascript
test('should compare profiles across time periods', () => {
  const previousProfile = {
    date: '2024-01-01',
    scores: { AUDITORY: 75, TACTILE: 30 }
  };
  
  const currentProfile = {
    date: '2024-03-01',
    scores: { AUDITORY: 85, TACTILE: 25 }
  };
  
  const comparison = compareProfiles(previousProfile, currentProfile);
  
  expect(comparison.AUDITORY.change).toBe(10);
  expect(comparison.AUDITORY.trend).toBe('INCREASING');
  expect(comparison.TACTILE.change).toBe(-5);
  expect(comparison.TACTILE.trend).toBe('DECREASING');
});

test('should benchmark against age group norms', () => {
  const childProfile = {
    age: 6,
    scores: { AUDITORY: 85, TACTILE: 25, VISUAL: 60 }
  };
  
  const ageGroupNorms = {
    6: { AUDITORY: 70, TACTILE: 65, VISUAL: 55 }
  };
  
  const benchmark = benchmarkAgainstPeers(childProfile, ageGroupNorms);
  
  expect(benchmark.AUDITORY.percentile).toBeGreaterThan(75);
  expect(benchmark.TACTILE.percentile).toBeLessThan(25);
});

test('should detect significant changes', () => {
  const profiles = [
    { date: '2024-01-01', AUDITORY: 70 },
    { date: '2024-02-01', AUDITORY: 75 },
    { date: '2024-03-01', AUDITORY: 90 } // Significant jump
  ];
  
  const alerts = detectSignificantChanges(profiles);
  
  expect(alerts).toContainEqual(
    expect.objectContaining({
      category: 'AUDITORY',
      type: 'SIGNIFICANT_INCREASE',
      magnitude: 15
    })
  );
});
```

**E2E Test**:
```javascript
it('should display profile comparisons and benchmarks', () => {
  cy.visit('/children/1/sensory-profile/compare');
  
  // Select comparison periods
  cy.get('[data-testid="comparison-start-date"]').type('2024-01-01');
  cy.get('[data-testid="comparison-end-date"]').type('2024-03-01');
  cy.get('[data-testid="generate-comparison-btn"]').click();
  
  // View comparison results
  cy.get('[data-testid="comparison-chart"]').should('be.visible');
  cy.get('[data-testid="change-indicators"]').should('be.visible');
  
  // Check improvement/decline indicators
  cy.get('[data-testid="auditory-trend"]').should('contain', 'Improved');
  cy.get('[data-testid="tactile-trend"]').should('contain', 'Declined');
  
  // Test peer comparison
  cy.get('[data-testid="peer-comparison-tab"]').click();
  cy.get('[data-testid="age-group-select"]').select('6 years');
  cy.get('[data-testid="peer-benchmark-chart"]').should('be.visible');
  
  // View percentile rankings
  cy.get('[data-testid="percentile-table"]').should('be.visible');
  cy.get('[data-testid="auditory-percentile"]').should('contain', '85th');
  
  // Check alerts for significant changes
  cy.get('[data-testid="alerts-panel"]').should('be.visible');
  cy.get('[data-testid="significant-change-alert"]').should('be.visible');
});
```

### Strumento
- **Jest** per comparison algorithms
- **React Testing Library** per comparison UI
- **Cypress** per comparison workflows

### Risultato Atteso
- ✅ Confronti temporali accurati
- ✅ Benchmark con gruppi età
- ✅ Trend analysis funzionante
- ✅ Alert per cambiamenti significativi
- ✅ Statistiche comparative

---

## TASK 5: REPORT E CONDIVISIONE

### Cosa Testare
- Generazione report PDF
- Condivisione con professionisti
- Report personalizzabili
- Email report automatici
- Privacy e permessi condivisione

### Come Testare
**Unit Test**:
```javascript
test('should generate PDF report', async () => {
  const profileData = {
    child: { name: 'Alice Smith', age: 6 },
    scores: { AUDITORY: 85, TACTILE: 25 },
    recommendations: ['Use noise-canceling headphones']
  };
  
  const mockPDFGenerator = jest.fn().mockResolvedValue({
    filename: 'sensory-profile-report.pdf',
    size: 12345
  });
  
  render(<ReportGenerator data={profileData} onGenerate={mockPDFGenerator} />);
  
  fireEvent.click(screen.getByText(/generate pdf report/i));
  
  await waitFor(() => {
    expect(mockPDFGenerator).toHaveBeenCalledWith(
      expect.objectContaining({
        child: expect.objectContaining({ name: 'Alice Smith' }),
        scores: expect.any(Object)
      })
    );
  });
});

test('should customize report sections', () => {
  render(<ReportCustomizer />);
  
  // Select report sections
  const scoresCheckbox = screen.getByLabelText(/include scores/i);
  const recommendationsCheckbox = screen.getByLabelText(/include recommendations/i);
  const chartsCheckbox = screen.getByLabelText(/include charts/i);
  
  fireEvent.click(scoresCheckbox);
  fireEvent.click(recommendationsCheckbox);
  fireEvent.click(chartsCheckbox);
  
  expect(scoresCheckbox).toBeChecked();
  expect(recommendationsCheckbox).toBeChecked();
  expect(chartsCheckbox).toBeChecked();
});

test('should share report with professional', async () => {
  server.use(
    rest.post('/api/v1/sensory-profile/share', (req, res, ctx) => {
      return res(ctx.json({ success: true, shareId: 'share_123' }));
    })
  );
  
  render(<ShareReport reportId="report_456" />);
  
  const professionalSelect = screen.getByLabelText(/select professional/i);
  fireEvent.change(professionalSelect, { target: { value: 'prof_789' } });
  
  const messageInput = screen.getByLabelText(/message/i);
  fireEvent.change(messageInput, { target: { value: 'Please review' } });
  
  fireEvent.click(screen.getByText(/share report/i));
  
  await waitFor(() => {
    expect(screen.getByText(/report shared successfully/i)).toBeInTheDocument();
  });
});
```

**E2E Test**:
```javascript
it('should generate and share sensory profile report', () => {
  cy.visit('/children/1/sensory-profile/report');
  
  // Customize report
  cy.get('[data-testid="customize-report-btn"]').click();
  cy.get('[data-testid="include-charts"]').check();
  cy.get('[data-testid="include-recommendations"]').check();
  cy.get('[data-testid="include-history"]').check();
  
  // Generate PDF
  cy.get('[data-testid="generate-pdf-btn"]').click();
  cy.get('[data-testid="pdf-generation-progress"]').should('be.visible');
  cy.get('[data-testid="pdf-ready"]', { timeout: 10000 }).should('be.visible');
  
  // Download PDF
  cy.get('[data-testid="download-pdf-btn"]').click();
  cy.readFile('cypress/downloads/sensory-profile-report.pdf').should('exist');
  
  // Share with professional
  cy.get('[data-testid="share-report-btn"]').click();
  cy.get('[data-testid="professional-select"]').select('Dr. Johnson');
  cy.get('[data-testid="share-permissions"]').within(() => {
    cy.get('[data-testid="view-permission"]').check();
    cy.get('[data-testid="comment-permission"]').check();
  });
  
  cy.get('[data-testid="expiry-date"]').type('2024-12-31');
  cy.get('[data-testid="share-message"]').type('Please review Alice\'s sensory profile');
  
  cy.get('[data-testid="send-share-btn"]').click();
  cy.get('[data-testid="share-success"]').should('contain', 'Report shared with Dr. Johnson');
  
  // Verify in shared reports list
  cy.visit('/reports/shared');
  cy.get('[data-testid="shared-report"]').should('contain', 'Dr. Johnson');
});

it('should schedule automatic report generation', () => {
  cy.visit('/children/1/sensory-profile/schedule');
  
  // Set up recurring report
  cy.get('[data-testid="schedule-frequency"]').select('Monthly');
  cy.get('[data-testid="recipients"]').type('parent@test.com');
  cy.get('[data-testid="report-template"]').select('Comprehensive');
  
  cy.get('[data-testid="schedule-report-btn"]').click();
  cy.get('[data-testid="schedule-success"]').should('be.visible');
  
  // Verify scheduled report
  cy.get('[data-testid="scheduled-reports"]').should('contain', 'Monthly');
});
```

### Strumento
- **PDF generation libraries** per report
- **React Testing Library** per report UI
- **Cypress** per report workflow

### Risultato Atteso
- ✅ Report PDF generati correttamente
- ✅ Condivisione con professionisti
- ✅ Customizzazione report
- ✅ Scheduling automatico
- ✅ Privacy e permessi rispettati

---

## TASK 6: INTEGRAZIONE CLINICA

### Cosa Testare
- Integrazione con sistemi clinici
- Formato dati standard (HL7, FHIR)
- Import da altri assessment tools
- Export per sistemi esterni
- Compliance with clinical standards

### Come Testare
**Unit Test**:
```javascript
test('should export data in FHIR format', () => {
  const profileData = {
    child: { id: 'child_123', name: 'Alice Smith' },
    assessment: {
      date: '2024-03-01',
      scores: { AUDITORY: 85, TACTILE: 25 }
    }
  };
  
  const fhirData = exportToFHIR(profileData);
  
  expect(fhirData.resourceType).toBe('Observation');
  expect(fhirData.subject.reference).toBe('Patient/child_123');
  expect(fhirData.effectiveDateTime).toBe('2024-03-01');
  expect(fhirData.component).toHaveLength(2);
});

test('should import data from external assessment', () => {
  const externalData = {
    format: 'SPM-2',
    scores: {
      'Auditory Processing': 85,
      'Tactile Processing': 25
    }
  };
  
  const mappedData = importExternalAssessment(externalData);
  
  expect(mappedData.AUDITORY).toBe(85);
  expect(mappedData.TACTILE).toBe(25);
});
```

**E2E Test**:
```javascript
it('should integrate with clinical systems', () => {
  cy.visit('/children/1/sensory-profile/clinical');
  
  // Export to clinical system
  cy.get('[data-testid="export-clinical-btn"]').click();
  cy.get('[data-testid="export-format"]').select('FHIR');
  cy.get('[data-testid="target-system"]').select('EMR System');
  
  cy.get('[data-testid="export-clinical-data"]').click();
  cy.get('[data-testid="export-success"]').should('be.visible');
  
  // Import from external assessment
  cy.get('[data-testid="import-assessment-btn"]').click();
  cy.get('[data-testid="assessment-file"]').selectFile('cypress/fixtures/spm2-results.json');
  
  cy.get('[data-testid="mapping-preview"]').should('be.visible');
  cy.get('[data-testid="confirm-import"]').click();
  
  // Verify imported data
  cy.get('[data-testid="imported-scores"]').should('be.visible');
});
```

### Strumento
- **HL7/FHIR libraries** per standard compliance
- **Jest** per data transformation
- **Cypress** per integration workflow

### Risultato Atteso
- ✅ Export formato FHIR/HL7
- ✅ Import da assessment tools
- ✅ Integrazione sistemi clinici
- ✅ Compliance standard medici
- ✅ Data mapping accurato

---

## CONFIGURAZIONE TEST

### Setup Chart Testing
```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  testEnvironment: 'jsdom'
};

// setupTests.js
import 'jest-canvas-mock';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    render: jest.fn()
  })),
  registerables: []
}));
```

### MSW Sensory Profile Handlers
```javascript
// mocks/sensoryHandlers.js
export const sensoryHandlers = [
  rest.get('/api/v1/sensory-profile/questions', (req, res, ctx) => {
    return res(ctx.json(mockQuestions));
  }),
  
  rest.post('/api/v1/sensory-profile/answers/save', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
  
  rest.get('/api/v1/sensory-profile/:childId/analysis', (req, res, ctx) => {
    return res(ctx.json(mockAnalysis));
  }),
  
  rest.post('/api/v1/sensory-profile/report/generate', (req, res, ctx) => {
    return res(ctx.json({ reportId: 'report_123' }));
  })
];
```

### Cypress Commands for Sensory Profile
```javascript
// cypress/support/commands.js
Cypress.Commands.add('completeQuestionnaire', () => {
  // Helper to complete a full questionnaire
  for (let i = 1; i <= 10; i++) {
    cy.get(`[data-testid="question-${i}"]`).within(() => {
      cy.get('[data-testid="scale-option-3"]').click();
    });
    
    if (i < 10) {
      cy.get('[data-testid="next-question-btn"]').click();
    }
  }
  
  cy.get('[data-testid="submit-questionnaire-btn"]').click();
});
```

## COVERAGE TARGET
- **Line Coverage**: > 90%
- **Branch Coverage**: > 85%
- **Function Coverage**: > 95%
- **Questionnaire Completion**: 100% flow coverage

## ESECUZIONE TEST
```bash
# Unit tests
npm test src/components/sensory-profile/ -- --coverage

# E2E tests
npx cypress run --spec "cypress/e2e/sensory-profile.cy.js"

# Accessibility tests
npm run test:a11y -- --testNamePattern="sensory"
```
