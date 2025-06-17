import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { Layout, Button, Spinner, Alert, Header, Footer } from '../components/UI';
import { USER_ROLES, ROUTES } from '../utils/constants';
import dashboardService from '../services/dashboardService';
import './DashboardPage.css';

// Dashboard components for different roles
const ParentDashboard = ({ user, dashboardData, navigate }) => (
  <div className="dashboard-content">
    {/* Stats Grid */}
    <div className="dashboard-stats-grid">
      <div className="dashboard-stat-card">
        <div className="dashboard-stat-header">
          <div className="dashboard-stat-icon dashboard-stat-icon--children">
            👶
          </div>
        </div>
        <div className="dashboard-stat-value">
          {dashboardData?.total_children || 0}
        </div>
        <div className="dashboard-stat-label">Bambini Registrati</div>
        <div className="dashboard-stat-description">
          Profili bambino attivi
        </div>
      </div>

      <div className="dashboard-stat-card">
        <div className="dashboard-stat-header">
          <div className="dashboard-stat-icon dashboard-stat-icon--activities">
            🎯
          </div>
        </div>
        <div className="dashboard-stat-value">
          {dashboardData?.total_activities || 0}
        </div>
        <div className="dashboard-stat-label">Attività Completate</div>
        <div className="dashboard-stat-description">
          Attività totali
        </div>
      </div>

      <div className="dashboard-stat-card">
        <div className="dashboard-stat-header">
          <div className="dashboard-stat-icon dashboard-stat-icon--points">
            ⭐
          </div>
        </div>
        <div className="dashboard-stat-value">
          {dashboardData?.total_points || 0}
        </div>
        <div className="dashboard-stat-label">Punti Guadagnati</div>
        <div className="dashboard-stat-description">
          Punti complessivi
        </div>
      </div>

      <div className="dashboard-stat-card">
        <div className="dashboard-stat-header">
          <div className="dashboard-stat-icon dashboard-stat-icon--sessions">
            🎮
          </div>
        </div>
        <div className="dashboard-stat-value">
          {dashboardData?.total_sessions || 0}
        </div>
        <div className="dashboard-stat-label">Sessioni di Gioco</div>
        <div className="dashboard-stat-description">
          Sessioni completate
        </div>
      </div>
    </div>

    {/* Main Content Grid */}
    <div className="dashboard-main-grid">
      <div className="dashboard-children-card">        <div className="dashboard-children-header">
          <h3 className="dashboard-children-title">I Miei Bambini</h3>
          <div className="dashboard-children-actions">
            <Button 
              variant="outline" 
              size="small"
              onClick={() => navigate(ROUTES.CHILDREN)}
            >
              Visualizza Tutti
            </Button>
            <Button 
              variant="primary" 
              size="small"
              onClick={() => navigate(ROUTES.CHILDREN_NEW)}
            >
              Aggiungi Bambino
            </Button>
          </div>
        </div>
        
        {dashboardData?.children_stats?.length > 0 ? (
          <div className="dashboard-children-list">            {dashboardData.children_stats.map((child, index) => (
              <div key={child.name || `child-${index}`} className="dashboard-child-item">
                <div className="dashboard-child-info">
                  <h4>{child.name}</h4>
                  <p>
                    <span className="dashboard-child-level">Livello {child.level}</span>
                    {child.points} punti • {child.activities_this_week || 0} attività questa settimana
                  </p>
                </div>                <Button 
                  variant="outline" 
                  size="small"
                  onClick={() => navigate(ROUTES.CHILDREN_DETAIL(child.id))}
                >
                  Visualizza
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-icon">👶</div>
            <div className="dashboard-empty-title">Nessun bambino registrato</div>
            <div className="dashboard-empty-description">
              Inizia registrando il profilo del tuo primo bambino per accedere alle funzionalità della piattaforma.
            </div>            <Button 
              variant="primary"
              onClick={() => navigate(ROUTES.CHILDREN_NEW)}
            >
              Registra il Primo Bambino
            </Button>
          </div>
        )}
      </div>

      <div className="dashboard-activities-card">
        <h3 className="dashboard-activities-title">Attività Recenti</h3>
        {dashboardData?.recent_activities?.length > 0 ? (
          <div className="dashboard-activities-list">            {dashboardData.recent_activities.slice(0, 5).map((activity, index) => (
              <div key={activity.type + activity.date || `activity-${index}`} className="dashboard-activity-item">
                <div className="dashboard-activity-type">
                  {activity.type}
                </div>
                <div className="dashboard-activity-date">
                  {activity.date}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-icon">📊</div>
            <p className="dashboard-empty-description">
              Nessuna attività recente
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

ParentDashboard.propTypes = {
  user: PropTypes.shape({
    first_name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string
  }).isRequired,
  dashboardData: PropTypes.shape({
    total_children: PropTypes.number,
    total_activities: PropTypes.number,
    total_points: PropTypes.number,
    total_sessions: PropTypes.number,
    children_stats: PropTypes.arrayOf(PropTypes.object),
    recent_activities: PropTypes.arrayOf(PropTypes.object)
  }),
  navigate: PropTypes.func.isRequired
};

const ProfessionalDashboard = ({ user, dashboardData }) => (
  <div className="dashboard-container">
    <div className="dashboard-header">      <div className="dashboard-welcome">
        <h2 className="dashboard-title">
          Dashboard Professionale
        </h2>
      </div>
    </div>

    <div className="dashboard-stats-grid">
      <div className="dashboard-stat-card primary">
        <div className="dashboard-stat-icon">
          <span>👥</span>
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-number">
            {dashboardData?.assigned_patients || 0}
          </div>
          <div className="dashboard-stat-label">Pazienti Assegnati</div>
          <div className="dashboard-stat-description">Bambini in cura attiva</div>
        </div>
      </div>

      <div className="dashboard-stat-card success">
        <div className="dashboard-stat-icon">
          <span>🎯</span>
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-number">
            {dashboardData?.active_sessions || 0}
          </div>
          <div className="dashboard-stat-label">Sessioni Attive</div>
          <div className="dashboard-stat-description">In corso questa settimana</div>
        </div>
      </div>

      <div className="dashboard-stat-card warning">
        <div className="dashboard-stat-icon">
          <span>📋</span>
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-number">
            {dashboardData?.completed_assessments || 0}
          </div>
          <div className="dashboard-stat-label">Assessment Completati</div>
          <div className="dashboard-stat-description">Questo mese</div>
        </div>
      </div>

      <div className="dashboard-stat-card info">
        <div className="dashboard-stat-icon">
          <span>📈</span>
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-number">
            {dashboardData?.avg_improvement || '94%'}
          </div>
          <div className="dashboard-stat-label">Miglioramento Medio</div>
          <div className="dashboard-stat-description">Dei pazienti seguiti</div>
        </div>
      </div>
    </div>

    <div className="dashboard-main-content">
      <div className="dashboard-actions-card">
        <h3 className="dashboard-actions-title">Accesso Rapido</h3>
        <div className="dashboard-actions-grid">
          <Button variant="primary" size="large">
            📊 Analytics Clinici
          </Button>
          <Button variant="outline" size="large">
            🔍 Cerca Pazienti
          </Button>
          <Button variant="outline" size="large">
            👤 Gestisci Profilo
          </Button>
          <Button variant="outline" size="large">
            📄 Report Clinici
          </Button>
        </div>
      </div>

      <div className="dashboard-activities-card">
        <h3 className="dashboard-activities-title">Prossimi Appuntamenti</h3>
        {dashboardData?.upcoming_appointments?.length > 0 ? (
          <div className="dashboard-activities-list">            {dashboardData.upcoming_appointments.slice(0, 5).map((appointment, index) => (
              <div key={appointment.patient_name + appointment.date || `appointment-${index}`} className="dashboard-activity-item">
                <div className="dashboard-activity-type">
                  {appointment.patient_name}
                </div>
                <div className="dashboard-activity-date">
                  {appointment.date} - {appointment.time}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-icon">📅</div>
            <p className="dashboard-empty-description">
              Nessun appuntamento programmato
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

ProfessionalDashboard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string
  }).isRequired,
  dashboardData: PropTypes.shape({
    assigned_patients: PropTypes.number,
    active_sessions: PropTypes.number,
    completed_assessments: PropTypes.number,
    avg_improvement: PropTypes.string,
    upcoming_appointments: PropTypes.arrayOf(PropTypes.object)
  })
};

const AdminDashboard = ({ user, dashboardData }) => (
  <div className="dashboard-container">
    <div className="dashboard-header">
      <div className="dashboard-welcome">
        <h2 className="dashboard-title">
          Dashboard Amministratore
        </h2>
        <p className="dashboard-subtitle">
          Benvenuto/a {user.name || user.email}, gestisci l&apos;intera piattaforma Smile Adventure.
        </p>
      </div>
    </div>

    <div className="dashboard-stats-grid">
      <div className="dashboard-stat-card primary">
        <div className="dashboard-stat-icon">
          <span>👥</span>
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-number">
            {dashboardData?.total_users || 0}
          </div>
          <div className="dashboard-stat-label">Utenti Totali</div>
          <div className="dashboard-stat-description">Registrati sulla piattaforma</div>
        </div>
      </div>

      <div className="dashboard-stat-card success">
        <div className="dashboard-stat-icon">
          <span>📊</span>
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-number">
            {dashboardData?.sessions_today || 0}
          </div>
          <div className="dashboard-stat-label">Sessioni Oggi</div>
          <div className="dashboard-stat-description">Attività utenti oggi</div>
        </div>
      </div>

      <div className="dashboard-stat-card warning">
        <div className="dashboard-stat-icon">
          <span>🔧</span>
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-number">
            {dashboardData?.system_status || 'OK'}
          </div>
          <div className="dashboard-stat-label">Stato Sistema</div>
          <div className="dashboard-stat-description">Tutti i servizi operativi</div>
        </div>
      </div>

      <div className="dashboard-stat-card info">
        <div className="dashboard-stat-icon">
          <span>💾</span>
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-number">
            {dashboardData?.storage_usage || '78%'}
          </div>
          <div className="dashboard-stat-label">Utilizzo Storage</div>
          <div className="dashboard-stat-description">Spazio disco utilizzato</div>
        </div>
      </div>
    </div>

    <div className="dashboard-main-content">
      <div className="dashboard-actions-card">
        <h3 className="dashboard-actions-title">Gestione Sistema</h3>
        <div className="dashboard-actions-grid">
          <Button variant="primary" size="large">
            👤 Gestione Utenti
          </Button>
          <Button variant="outline" size="large">
            📈 Statistiche Sistema
          </Button>
          <Button variant="outline" size="large">
            ⚙️ Configurazioni
          </Button>
          <Button variant="outline" size="large">
            📋 Log Sistema
          </Button>
        </div>
      </div>

      <div className="dashboard-activities-card">
        <h3 className="dashboard-activities-title">Attività Sistema Recenti</h3>
        {dashboardData?.system_logs?.length > 0 ? (
          <div className="dashboard-activities-list">            {dashboardData.system_logs.slice(0, 5).map((log, index) => (
              <div key={log.action + log.timestamp || `log-${index}`} className="dashboard-activity-item">
                <div className="dashboard-activity-type">
                  {log.action}
                </div>
                <div className="dashboard-activity-date">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-icon">📊</div>
            <p className="dashboard-empty-description">
              Nessuna attività di sistema recente
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

AdminDashboard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string
  }).isRequired,
  dashboardData: PropTypes.shape({
    total_users: PropTypes.number,
    sessions_today: PropTypes.number,
    system_status: PropTypes.string,
    storage_usage: PropTypes.string,
    system_logs: PropTypes.arrayOf(PropTypes.object)
  })
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Real API integration with dashboard service
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
        setIsLoading(false);      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching dashboard data:', err);
        }
        setError('Errore nel caricamento dei dati del dashboard');
        
        // Fallback to mock data in case of API error
        const mockData = {
          [USER_ROLES.PARENT]: {
            total_children: 2,
            total_activities: 45,
            total_points: 1250,
            total_sessions: 28,
            children_stats: [
              { name: 'Marco', level: 3, points: 650, activities_this_week: 5 },
              { name: 'Sofia', level: 2, points: 600, activities_this_week: 3 }
            ],
            recent_activities: [
              { type: 'Dental Care Session', date: '2025-06-13' },
              { type: 'Social Interaction', date: '2025-06-12' },
              { type: 'Motor Skills Exercise', date: '2025-06-11' }
            ]
          },
          [USER_ROLES.PROFESSIONAL]: {
            assigned_patients: 15,
            active_sessions: 8,
            completed_assessments: 12,
            avg_improvement: '94%',
            upcoming_appointments: [
              { patient_name: 'Marco Rossi', date: '2025-06-14', time: '09:00' },
              { patient_name: 'Sofia Bianchi', date: '2025-06-14', time: '10:30' },
              { patient_name: 'Luca Verdi', date: '2025-06-15', time: '14:00' }
            ]
          },
          [USER_ROLES.ADMIN]: {
            total_users: 350,
            sessions_today: 42,
            system_status: 'OK',
            storage_usage: '78%',
            system_logs: [
              { action: 'User registration', timestamp: '2025-06-13 15:30' },
              { action: 'Database backup completed', timestamp: '2025-06-13 14:00' },
              { action: 'System update applied', timestamp: '2025-06-13 09:15' }
            ]
          }
        };
        
        setDashboardData(mockData[user.role] || {});
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  if (isLoading) {
    return (
      <Layout>
        <div className="dashboard-loading-container">
          <Spinner size="large" />
          <p className="dashboard-loading-text">Caricamento dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert variant="error">
          {error}
        </Alert>
      </Layout>
    );
  }
  const getDashboardComponent = () => {
    switch (user.role) {
      case USER_ROLES.PARENT:
        return <ParentDashboard user={user} dashboardData={dashboardData} navigate={navigate} />;
      case USER_ROLES.PROFESSIONAL:
        return <ProfessionalDashboard user={user} dashboardData={dashboardData} />;
      case USER_ROLES.ADMIN:
      case USER_ROLES.SUPER_ADMIN:
        return <AdminDashboard user={user} dashboardData={dashboardData} />;
      default:
        return (
          <Alert variant="warning">
            Dashboard non disponibile per il ruolo: {user.role}
          </Alert>
        );
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      [USER_ROLES.PARENT]: 'Genitore',
      [USER_ROLES.PROFESSIONAL]: 'Professionista',
      [USER_ROLES.ADMIN]: 'Amministratore',
      [USER_ROLES.SUPER_ADMIN]: 'Super Amministratore'
    };
    return roleNames[role] || role;
  };  return (
    <Layout
      header={<Header title="Smile Adventure" showUserInfo={true} showLogout={true} />}
    >
      <div className="dashboard-main-container">
        <div className="dashboard-welcome-section">
          <h1 className="dashboard-main-title">
            Benvenuto, {user.first_name}!
          </h1>
          <p className="dashboard-main-subtitle">
            Dashboard {getRoleDisplayName(user.role)} • Gestisci le tue attività
          </p>
        </div>        {getDashboardComponent()}
      </div>
      <Footer />
    </Layout>
  );
};

export default DashboardPage;
