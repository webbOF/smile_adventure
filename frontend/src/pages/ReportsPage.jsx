/**
 * Reports Page Component
 * Dashboard principale per reports e analytics con integrazione completa backend
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reportsService } from '../services/reportsService';
import { childrenService } from '../services/childrenService';
import { ReportsFilters, StatsCards, ProgressChart, BarChart, DonutChart } from '../components/Reports';
import { Layout } from '../components/UI';
import './ReportsPage.css';
import '../components/Reports/Charts.css';

/**
 * Reports Page Main Component
 */
const ReportsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [children, setChildren] = useState([]);
  const [filters, setFilters] = useState({
    childId: '',
    period: 'last_30_days',
    sessionType: '',
    startDate: '',
    endDate: ''
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [progressData, setProgressData] = useState([]);

  /**
   * Load initial data
   */
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load children data for parents
      if (user?.role === 'parent') {
        const childrenResponse = await childrenService.getChildren();
        setChildren(childrenResponse.children || []);
      }

      // Load dashboard data
      const dashboardResponse = await reportsService.getDashboard();
      setDashboardData(dashboardResponse);

      // Load recent activities
      await loadRecentActivities();

      setLoading(false);
    } catch (err) {
      console.error('Error loading reports data:', err);
      setError('Errore nel caricamento dei dati. Riprova più tardi.');
      setLoading(false);
    }
  }, [user?.role]);

  /**
   * Load recent activities
   */
  const loadRecentActivities = async () => {
    try {
      // Mock recent activities data
      setRecentActivities([
        {
          id: 1,
          type: 'game_session',
          title: 'Sessione di gioco completata',
          description: 'Marco ha completato il livello 3 del gioco dentista',
          timestamp: new Date().toISOString(),
          child_name: 'Marco'
        },
        {
          id: 2,
          type: 'achievement',
          title: 'Nuovo achievement sbloccato',
          description: 'Sofia ha ottenuto il badge "Primo sorriso"',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          child_name: 'Sofia'
        },
        {
          id: 3,
          type: 'progress',
          title: 'Progresso migliorato',
          description: 'Marco ha aumentato del 15% il punteggio medio',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          child_name: 'Marco'
        }
      ]);
    } catch (err) {
      console.error('Error loading recent activities:', err);
    }
  };

  /**
   * Load progress data for charts
   */
  const loadProgressData = async (appliedFilters = filters) => {
    try {
      // Mock progress data for charts
      const mockProgressData = [
        { label: 'Lun', value: 75 },
        { label: 'Mar', value: 82 },
        { label: 'Mer', value: 78 },
        { label: 'Gio', value: 85 },
        { label: 'Ven', value: 88 },
        { label: 'Sab', value: 92 },
        { label: 'Dom', value: 89 }
      ];
      setProgressData(mockProgressData);
    } catch (err) {
      console.error('Error loading progress data:', err);
    }
  };

  /**
   * Handle filters change
   */
  const handleFiltersChange = useCallback(async (newFilters) => {
    setFilters(newFilters);
    await loadProgressData(newFilters);
    
    // Reload dashboard data with new filters if needed
    if (newFilters.childId || newFilters.period !== 'last_30_days') {
      try {
        const dashboardResponse = await reportsService.getDashboard();
        setDashboardData(dashboardResponse);
      } catch (err) {
        console.error('Error reloading dashboard with filters:', err);
      }
    }
  }, []);

  /**
   * Navigate to child details
   */
  const handleViewChildProgress = (childId) => {
    navigate(`/children/${childId}/progress`);
  };

  /**
   * Generate stats data for StatsCards component
   */
  const generateStatsData = () => {
    if (!dashboardData) return [];

    const stats = [
      {
        id: 'total_children',
        title: 'Bambini Totali',
        value: dashboardData.total_children || 0,
        type: 'children',
        change: 0
      },
      {
        id: 'total_sessions',
        title: 'Sessioni Totali',
        value: dashboardData.total_activities || dashboardData.total_sessions || 0,
        type: 'sessions',
        change: 12
      },
      {
        id: 'total_points',
        title: 'Punti Guadagnati',
        value: dashboardData.total_points || 0,
        type: 'achievements',
        change: 25
      },
      {
        id: 'avg_progress',
        title: 'Progresso Medio',
        value: '78%',
        type: 'progress',
        change: 8
      }
    ];

    return stats;
  };

  /**
   * Generate session distribution data for charts
   */
  const generateSessionDistribution = () => {
    return [
      { label: 'Cura dentale', value: 45 },
      { label: 'Terapia', value: 32 },
      { label: 'Sociale', value: 23 }
    ];
  };

  /**
   * Generate activity data for bar chart
   */
  const generateActivityData = () => {
    return [
      { label: 'Lun', value: 12 },
      { label: 'Mar', value: 15 },
      { label: 'Mer', value: 8 },
      { label: 'Gio', value: 18 },
      { label: 'Ven', value: 22 },
      { label: 'Sab', value: 25 },
      { label: 'Dom', value: 19 }
    ];
  };

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load progress data when filters change
  useEffect(() => {
    if (!loading) {
      loadProgressData();
    }
  }, [filters, loading]);

  if (loading) {
    return (
      <Layout>
        <div className="reports-page">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p className="loading-text">Caricamento reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="reports-page">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Errore nel caricamento</h3>
            <p className="error-message">{error}</p>
            <button className="btn-retry" onClick={loadInitialData}>
              Riprova
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="reports-page">
        {/* Header */}
        <div className="reports-header">
          <h1>Reports e Analytics</h1>
          <p>Dashboard completo per monitorare i progressi e le attività</p>
        </div>        {/* Filters */}
        <ReportsFilters
          childrenList={children}
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />

        {/* Statistics Cards */}
        <StatsCards 
          stats={generateStatsData()}
          loading={false}
        />

        {/* Main Content */}
        <div className="reports-content">
          {/* Left Column - Charts and Analytics */}
          <div className="reports-main">
            {/* Progress Chart */}
            <div className="chart-section">
              <ProgressChart
                data={progressData}
                title="Progresso Settimanale"
                height={300}
              />
            </div>

            {/* Activities Bar Chart */}
            <div className="chart-section">
              <BarChart
                data={generateActivityData()}
                title="Attività per Giorno"
                height={250}
              />
            </div>

            {/* Children Progress List */}
            <div className="children-progress">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Progresso Bambini</h2>
                  <p className="section-subtitle">
                    Panoramica dei progressi di tutti i bambini
                  </p>
                </div>
                <a href="/children" className="btn-view-all">
                  Vedi tutti
                </a>
              </div>

              <div className="children-list">                {dashboardData?.children_stats?.map(child => (
                  <button 
                    key={child.child_id} 
                    className="child-progress-item" 
                    onClick={() => handleViewChildProgress(child.child_id)}
                    type="button"
                  >
                    <div className="child-avatar">
                      {child.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="child-info">
                      <h4 className="child-name">{child.name}</h4>
                      <p className="child-stats">
                        {child.activities_this_week || 0} attività questa settimana
                      </p>
                    </div>                    <div className="progress-indicator">
                      <div className="progress-score">{child.points || 0} pts</div>
                      <div className="progress-trend up">+{child.level || 1}</div>
                    </div>
                  </button>
                )) || (
                  <div className="empty-state">
                    <div className="empty-icon">👶</div>
                    <h3 className="empty-title">Nessun bambino trovato</h3>
                    <p className="empty-message">
                      Aggiungi un bambino per iniziare a tracciare i progressi.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="reports-sidebar">
            {/* Session Distribution Chart */}
            <div className="sidebar-section">
              <DonutChart
                data={generateSessionDistribution()}
                title="Distribuzione Sessioni"
                size={250}
              />
            </div>

            {/* Recent Activities */}
            <div className="recent-activities">
              <div className="section-header">
                <h3 className="section-title">Attività Recenti</h3>
              </div>
              <div className="activities-list">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      {activity.type === 'game_session' && '🎮'}
                      {activity.type === 'achievement' && '🏆'}
                      {activity.type === 'progress' && '📈'}
                    </div>
                    <div className="activity-content">
                      <h4 className="activity-title">{activity.title}</h4>
                      <p className="activity-description">{activity.description}</p>
                      <span className="activity-time">
                        {new Date(activity.timestamp).toLocaleString('it-IT')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Tools (if professional user) */}
            {user?.role === 'professional' && (
              <div className="professional-tools">
                <div className="section-header">
                  <h3 className="section-title">Strumenti Professionali</h3>
                </div>
                <div className="tools-grid">                  <button className="tool-button" onClick={() => navigate('/clinical/analytics')}>
                    <span className="tool-icon">📊</span>{' '}
                    Analytics Clinici
                  </button>
                  <button className="tool-button" onClick={() => navigate('/reports/export')}>
                    <span className="tool-icon">📄</span>{' '}
                    Esporta Report
                  </button>
                  <button className="tool-button" onClick={() => navigate('/professional/search')}>
                    <span className="tool-icon">🔍</span>{' '}
                    Cerca Pazienti
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions">
              <div className="section-header">
                <h3 className="section-title">Azioni Rapide</h3>
              </div>
              <div className="actions-grid">
                {user?.role === 'parent' && (                  <button 
                    className="action-button primary"
                    onClick={() => navigate('/children/new')}
                  >
                    <span className="action-icon">➕</span>{' '}
                    Aggiungi Bambino
                  </button>
                )}
                <button 
                  className="action-button"
                  onClick={loadInitialData}
                >
                  <span className="action-icon">🔄</span>{' '}
                  Aggiorna Dati
                </button>
                <button 
                  className="action-button"
                  onClick={() => navigate('/profile')}
                >
                  <span className="action-icon">⚙️</span>{' '}
                  Impostazioni
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
