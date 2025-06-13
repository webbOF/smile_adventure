import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Layout, Card, Button, Spinner, Alert } from '../components/UI';
import { USER_ROLES } from '../utils/constants';

// Dashboard components for different roles
const ParentDashboard = ({ user, dashboardData }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
      <Card title="Bambini Registrati" variant="elevated">
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
          {dashboardData?.total_children || 0}
        </div>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Profili bambino attivi
        </p>
      </Card>

      <Card title="Attività Completate" variant="elevated">
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
          {dashboardData?.total_activities || 0}
        </div>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Attività totali
        </p>
      </Card>

      <Card title="Punti Guadagnati" variant="elevated">
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
          {dashboardData?.total_points || 0}
        </div>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Punti complessivi
        </p>
      </Card>

      <Card title="Sessioni di Gioco" variant="elevated">
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
          {dashboardData?.total_sessions || 0}
        </div>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Sessioni completate
        </p>
      </Card>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <Card title="I Miei Bambini" headerAction={
        <Button variant="primary" size="small">
          Aggiungi Bambino
        </Button>
      }>
        {dashboardData?.children_stats?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dashboardData.children_stats.map((child, index) => (
              <div key={index} style={{ 
                padding: '1rem', 
                borderRadius: '0.5rem', 
                backgroundColor: '#f9fafb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: '600' }}>{child.name}</h4>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    Livello {child.level} • {child.points} punti
                  </p>
                </div>
                <Button variant="outline" size="small">
                  Visualizza
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>Nessun bambino registrato ancora.</p>
            <Button variant="primary" style={{ marginTop: '1rem' }}>
              Registra il Primo Bambino
            </Button>
          </div>
        )}
      </Card>

      <Card title="Attività Recenti">
        {dashboardData?.recent_activities?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dashboardData.recent_activities.slice(0, 5).map((activity, index) => (
              <div key={index} style={{
                padding: '0.75rem',
                borderLeft: '3px solid #3b82f6',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                  {activity.type}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  {activity.date}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Nessuna attività recente
          </p>
        )}
      </Card>
    </div>
  </div>
);

const ProfessionalDashboard = ({ user, dashboardData }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
      <Card title="Pazienti Assegnati" variant="elevated">
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
          {dashboardData?.assigned_patients || 0}
        </div>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Bambini in cura
        </p>
      </Card>

      <Card title="Sessioni Attive" variant="elevated">
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
          {dashboardData?.active_sessions || 0}
        </div>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          In corso questa settimana
        </p>
      </Card>

      <Card title="Assessment Completati" variant="elevated">
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
          {dashboardData?.completed_assessments || 0}
        </div>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Questo mese
        </p>
      </Card>
    </div>

    <Card title="Accesso Rapido" variant="elevated">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Button variant="primary" size="large">
          Analytics Clinici
        </Button>
        <Button variant="outline" size="large">
          Cerca Pazienti
        </Button>
        <Button variant="outline" size="large">
          Gestisci Profilo
        </Button>
        <Button variant="outline" size="large">
          Report
        </Button>
      </div>
    </Card>
  </div>
);

const AdminDashboard = ({ user, dashboardData }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
      <Card title="Utenti Totali" variant="elevated">
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
          {dashboardData?.total_users || 0}
        </div>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Registrati sulla piattaforma
        </p>
      </Card>

      <Card title="Sessioni Oggi" variant="elevated">
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
          {dashboardData?.sessions_today || 0}
        </div>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Attività utenti oggi
        </p>
      </Card>
    </div>

    <Card title="Gestione Sistema" variant="elevated">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Button variant="primary" size="large">
          Gestione Utenti
        </Button>
        <Button variant="outline" size="large">
          Statistiche Sistema
        </Button>
        <Button variant="outline" size="large">
          Configurazioni
        </Button>
        <Button variant="outline" size="large">
          Log Sistema
        </Button>
      </div>
    </Card>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // TODO: Implementare chiamata API per dashboard data
        // const data = await dashboardService.getDashboardData();
        
        // Mock data for development
        const mockData = {
          [USER_ROLES.PARENT]: {
            total_children: 2,
            total_activities: 45,
            total_points: 1250,
            total_sessions: 28,
            children_stats: [
              { name: 'Marco', level: 3, points: 650 },
              { name: 'Sofia', level: 2, points: 600 }
            ],
            recent_activities: [
              { type: 'Dental Care Session', date: '2025-06-13' },
              { type: 'Social Interaction', date: '2025-06-12' }
            ]
          },
          [USER_ROLES.PROFESSIONAL]: {
            assigned_patients: 15,
            active_sessions: 8,
            completed_assessments: 12
          },
          [USER_ROLES.ADMIN]: {
            total_users: 350,
            sessions_today: 42
          }
        };

        // Simulate API delay
        setTimeout(() => {
          setDashboardData(mockData[user.role] || {});
          setIsLoading(false);
        }, 1000);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Errore nel caricamento dei dati del dashboard');
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Spinner size="large" />
          <p>Caricamento dashboard...</p>
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
        return <ParentDashboard user={user} dashboardData={dashboardData} />;
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
  };

  return (
    <Layout
      header={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1rem 0'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
              Benvenuto, {user.first_name}!
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
              Dashboard {getRoleDisplayName(user.role)} • Smile Adventure
            </p>
          </div>
          <Button variant="outline" size="small">
            Profilo
          </Button>
        </div>
      }
    >
      {getDashboardComponent()}
    </Layout>
  );
};

export default DashboardPage;
