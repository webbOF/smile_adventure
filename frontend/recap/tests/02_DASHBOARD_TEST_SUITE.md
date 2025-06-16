# 📊 DASHBOARD MULTI-ROLE TEST SUITE - SMILE ADVENTURE

**Suite ID**: DASH-002  
**Priorità**: ALTA ⭐⭐  
**Strumenti**: Jest + React Testing Library, Recharts Testing, Cypress  
**Tempo Stimato**: 6-8 ore  

---

## 📋 OVERVIEW SUITE

**Obiettivo**: Verificare il corretto funzionamento delle dashboard specifiche per ogni ruolo utente e la visualizzazione corretta delle statistiche.

**Componenti Testati**:
- `DashboardPage.jsx`
- `StatisticsCards.jsx`
- `ProgressCharts.jsx`
- `dashboardService.js`
- Charts e visualizzazioni Recharts

**Coverage Target**: >90% per dashboard components

---

## 🎯 TASK DETTAGLIATI

### **TASK DASH-001: Parent Dashboard Loading**
**Cosa Testare**: Caricamento dashboard genitore con statistiche bambini  
**Come**: Unit test + E2E test  
**Strumento**: Jest/RTL + Cypress  

**Steps**:
1. Login come parent (`parent@test.com`)
2. Navigare a `/dashboard`
3. Verificare caricamento dati dashboard

**Dati Test da Visualizzare**:
```json
{
  "total_children": 2,
  "total_activities": 45,
  "total_points": 1250,
  "total_sessions": 28,
  "children_stats": [
    {
      "child_id": 1,
      "name": "Marco",
      "age": 6,
      "points": 650,
      "level": 3,
      "activities_this_week": 8
    },
    {
      "child_id": 2,
      "name": "Sofia",
      "age": 4,
      "points": 600,
      "level": 2,
      "activities_this_week": 6
    }
  ]
}
```

**Risultato Atteso**:
- ✅ Cards statistiche visualizzate correttamente
- ✅ Numero bambini: "2"
- ✅ Punti totali: "1250"
- ✅ Attività completate: "45"
- ✅ Cards individuali per ogni bambino

**Test Code (Jest)**:
```javascript
describe('Parent Dashboard', () => {
  beforeEach(() => {
    // Mock API response
    jest.spyOn(dashboardService, 'getDashboardData').mockResolvedValue({
      total_children: 2,
      total_activities: 45,
      total_points: 1250,
      total_sessions: 28,
      children_stats: [
        { child_id: 1, name: "Marco", points: 650, level: 3, activities_this_week: 8 },
        { child_id: 2, name: "Sofia", points: 600, level: 2, activities_this_week: 6 }
      ]
    });
  });

  test('should display parent dashboard statistics', async () => {
    render(
      <AuthContext.Provider value={{ user: { role: 'parent' } }}>
        <DashboardPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // total children
      expect(screen.getByText('1250')).toBeInTheDocument(); // total points
      expect(screen.getByText('45')).toBeInTheDocument(); // total activities
    });

    // Verify children cards
    expect(screen.getByText('Marco')).toBeInTheDocument();
    expect(screen.getByText('Sofia')).toBeInTheDocument();
    expect(screen.getByText('Livello 3')).toBeInTheDocument();
    expect(screen.getByText('650 punti')).toBeInTheDocument();
  });
});
```

---

### **TASK DASH-002: Admin Dashboard Overview**
**Cosa Testare**: Dashboard amministratore con statistiche platform-wide  
**Come**: Unit test + Mock data  
**Strumento**: Jest/RTL  

**Dati Test Admin**:
```json
{
  "user_type": "admin",
  "total_users": 150,
  "total_children": 89,
  "active_sessions": 25,
  "total_professionals": 12,
  "platform_stats": {
    "new_registrations_today": 5,
    "active_users_today": 67,
    "completed_activities_today": 124,
    "avg_session_duration": "12.5 min"
  }
}
```

**Risultato Atteso**:
- ✅ Statistics cards admin-specific
- ✅ User management shortcuts
- ✅ Platform health indicators
- ✅ Quick action buttons

**Test Code**:
```javascript
test('should display admin dashboard with platform stats', async () => {
  const mockAdminData = {
    user_type: "admin",
    total_users: 150,
    total_children: 89,
    active_sessions: 25,
    total_professionals: 12,
    platform_stats: {
      new_registrations_today: 5,
      active_users_today: 67,
      completed_activities_today: 124
    }
  };

  jest.spyOn(dashboardService, 'getDashboardData').mockResolvedValue(mockAdminData);

  render(
    <AuthContext.Provider value={{ user: { role: 'admin' } }}>
      <DashboardPage />
    </AuthContext.Provider>
  );

  await waitFor(() => {
    expect(screen.getByText('150')).toBeInTheDocument(); // total users
    expect(screen.getByText('89')).toBeInTheDocument(); // total children
    expect(screen.getByText('25')).toBeInTheDocument(); // active sessions
    expect(screen.getByText('12')).toBeInTheDocument(); // professionals
  });

  // Verify admin-specific elements
  expect(screen.getByText('Gestione Utenti')).toBeInTheDocument();
  expect(screen.getByText('Nuove Registrazioni Oggi: 5')).toBeInTheDocument();
});
```

---

### **TASK DASH-003: Progress Charts Rendering**
**Cosa Testare**: Rendering corretto dei grafici di progresso  
**Come**: Unit test con Mock Canvas  
**Strumento**: Jest + jest-canvas-mock + Recharts Testing  

**Chart Types da Testare**:
1. **LineChart**: Progresso settimanale punti
2. **BarChart**: Attività per tipo 
3. **PieChart**: Distribuzione livelli bambini

**Setup Test**:
```javascript
import 'jest-canvas-mock';

const mockChartData = {
  weekly_progress: [
    { day: 'Lun', points: 45 },
    { day: 'Mar', points: 52 },
    { day: 'Mer', points: 38 },
    { day: 'Gio', points: 61 },
    { day: 'Ven', points: 49 },
    { day: 'Sab', points: 72 },
    { day: 'Dom', points: 58 }
  ],
  activities_by_type: {
    "dental_care": 15,
    "therapy_session": 20,
    "social_interaction": 10
  }
};
```

**Risultato Atteso**:
- ✅ Charts renderizzati senza errori
- ✅ Dati visualizzati correttamente
- ✅ Tooltips funzionanti
- ✅ Responsive behavior

**Test Code**:
```javascript
describe('Progress Charts', () => {
  test('should render weekly progress line chart', () => {
    render(<ProgressCharts data={mockChartData} />);
    
    // Verify chart container
    expect(screen.getByTestId('weekly-progress-chart')).toBeInTheDocument();
    
    // Verify data points
    expect(screen.getByText('45')).toBeInTheDocument(); // Monday points
    expect(screen.getByText('72')).toBeInTheDocument(); // Saturday points (max)
  });

  test('should render activities bar chart', () => {
    render(<ProgressCharts data={mockChartData} />);
    
    expect(screen.getByTestId('activities-bar-chart')).toBeInTheDocument();
    expect(screen.getByText('dental_care')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // dental care count
  });
});
```

---

### **TASK DASH-004: Real-time Data Updates**
**Cosa Testare**: Aggiornamento automatico dati dashboard  
**Come**: Integration test con timer  
**Strumento**: Jest + Fake Timers  

**Scenario**:
1. Dashboard caricata
2. Simulare aggiornamento dati ogni 30 secondi
3. Verificare re-fetch automatico

**Risultato Atteso**:
- ✅ Auto-refresh ogni 30 secondi
- ✅ Loading state durante refresh
- ✅ Dati aggiornati visualizzati

**Test Code**:
```javascript
describe('Real-time Updates', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should auto-refresh dashboard data every 30 seconds', async () => {
    const mockGetData = jest.spyOn(dashboardService, 'getDashboardData')
      .mockResolvedValue({ total_children: 2, total_points: 1250 });

    render(<DashboardPage />);

    // Initial call
    expect(mockGetData).toHaveBeenCalledTimes(1);

    // Fast-forward 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Should trigger another call
    await waitFor(() => {
      expect(mockGetData).toHaveBeenCalledTimes(2);
    });
  });
});
```

---

### **TASK DASH-005: Dashboard Navigation**
**Cosa Testare**: Navigazione tra sezioni dashboard  
**Como**: E2E test  
**Strumento**: Cypress  

**Navigation Flows**:
1. Dashboard → Children List
2. Dashboard → Reports
3. Dashboard → Profile
4. Quick Actions buttons

**Test Code (Cypress)**:
```javascript
describe('Dashboard Navigation', () => {
  beforeEach(() => {
    cy.login('parent@test.com', 'password123');
    cy.visit('/dashboard');
  });

  it('should navigate to children list from dashboard', () => {
    cy.get('[data-testid="view-children-button"]').click();
    cy.url().should('include', '/children');
    cy.get('[data-testid="children-list"]').should('be.visible');
  });

  it('should navigate to reports from dashboard', () => {
    cy.get('[data-testid="view-reports-button"]').click();
    cy.url().should('include', '/reports');
    cy.get('[data-testid="reports-dashboard"]').should('be.visible');
  });

  it('should show child details modal from dashboard card', () => {
    cy.get('[data-testid="child-card-marco"]').click();
    cy.get('[data-testid="child-details-modal"]').should('be.visible');
    cy.get('[data-testid="child-name"]').should('contain', 'Marco');
  });
});
```

---

### **TASK DASH-006: Mobile Responsive Dashboard**
**Cosa Testare**: Layout responsive su dispositivi mobile  
**Come**: E2E test con viewport mobile  
**Strumento**: Cypress  

**Viewports da Testare**:
- iPhone: 375x667
- iPad: 768x1024
- Desktop: 1920x1080

**Risultato Atteso**:
- ✅ Cards stack verticalmente su mobile
- ✅ Charts responsive e scrollabili
- ✅ Navigation menu collapsible
- ✅ Touch interactions funzionanti

**Test Code**:
```javascript
describe('Mobile Responsive Dashboard', () => {
  it('should display mobile-friendly layout on iPhone', () => {
    cy.viewport('iphone-6');
    cy.login('parent@test.com', 'password123');
    cy.visit('/dashboard');

    // Cards should stack vertically
    cy.get('[data-testid="stats-cards"]')
      .should('have.css', 'flex-direction', 'column');

    // Mobile menu should be visible
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    
    // Desktop sidebar should be hidden
    cy.get('[data-testid="desktop-sidebar"]').should('not.be.visible');
  });

  it('should have touch-friendly chart interactions', () => {
    cy.viewport('iphone-6');
    cy.visit('/dashboard');

    // Charts should be scrollable horizontally on mobile
    cy.get('[data-testid="weekly-progress-chart"]')
      .should('have.css', 'overflow-x', 'auto');
  });
});
```

---

## 📊 BACKEND API TESTS

### **TASK DASH-API-001: Dashboard Data Endpoint**
**Cosa Testare**: `GET /api/v1/users/dashboard`  
**Come**: Integration test con role-based responses  
**Strumento**: Pytest + FastAPI TestClient  

**Test Code**:
```python
def test_parent_dashboard_data(client, parent_token):
    headers = {"Authorization": f"Bearer {parent_token}"}
    response = client.get("/api/v1/users/dashboard", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "total_children" in data
    assert "total_activities" in data
    assert "children_stats" in data
    assert data["user_type"] == "parent"

def test_admin_dashboard_data(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/api/v1/users/dashboard", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "platform_stats" in data
    assert data["user_type"] == "admin"

def test_dashboard_unauthorized(client):
    response = client.get("/api/v1/users/dashboard")
    assert response.status_code == 401
```

---

## 📈 SUCCESS METRICS

**Definition of Done**:
- [ ] Tutti i 6 task completati con successo
- [ ] Coverage >90% per dashboard components  
- [ ] Charts renderizzati correttamente su tutti i dispositivi
- [ ] Performance: caricamento dashboard <2 secondi
- [ ] Mobile responsive tests passano
- [ ] Backend API tests al 100%

**Performance Targets**:
- Dashboard load time: <2 secondi
- Chart rendering: <1 secondo
- Data refresh: <500ms
- Mobile scroll performance: 60fps

**Visual Checklist**:
- ✅ Cards allineate e spaziatura consistente
- ✅ Charts colori accessibili (contrast ratio >4.5:1)
- ✅ Loading states smooth
- ✅ Animations non jarring
- ✅ Typography leggibile su tutti i device

---

*Previous: [Authentication](./01_AUTHENTICATION_TEST_SUITE.md) | Next: [Admin Users Management](./03_ADMIN_USERS_TEST_SUITE.md)*
