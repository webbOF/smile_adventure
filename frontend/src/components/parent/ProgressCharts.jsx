// src/components/parent/ProgressCharts.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  HeartIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Import Services
import { reportService } from '../../services';

// Helper functions for status determination
const getTrendStatus = (trend) => {
  if (trend > 0.05) return 'positive';
  if (trend < -0.05) return 'negative';
  return 'neutral';
};

const getEngagementStatusColor = (status) => {
  if (status === 'positive') return 'bg-green-100 text-green-800';
  if (status === 'negative') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
};

const getEngagementStatusText = (status) => {
  if (status === 'positive') return 'In crescita';
  if (status === 'negative') return 'In calo';
  return 'Stabile';
};

const getChartColor = (status, chartConfig) => {
  if (status === 'positive') return chartConfig.colors.primary;
  if (status === 'negative') return chartConfig.colors.warning;
  return chartConfig.colors.purple;
};

const formatTooltipValue = (name, value) => {
  if (name.includes('Engagement')) return `${value}%`;
  if (name.includes('Durata')) return `${value} min`;
  return value;
};

// Trend icon helper
const getTrendIcon = (trend) => {
  if (trend > 0) return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
  if (trend < 0) return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
  return <MinusIcon className="h-5 w-5 text-gray-500" />;
};

// Engagement icon helper
const getEngagementIcon = (status) => {
  if (status === 'positive') return <ArrowTrendingUpIcon className="h-4 w-4" />;
  if (status === 'negative') return <ArrowTrendingDownIcon className="h-4 w-4" />;
  return <MinusIcon className="h-4 w-4" />;
};

// Safe calculation helpers
const calculateAverage = (values, fallback = 0) => {
  return values.length > 0 ? Math.round(values.reduce((sum, val) => sum + (val || 0), 0) / values.length) : fallback;
};

const getChildDisplayName = (child) => {
  return child?.name || 'Bambino';
};

const getImprovementText = (status) => {
  return status === 'positive' ? 'migliorato' : 'rimasto stabile';
};

// Helper for calculating engagement average
const calculateEngagementAverage = (sessions, totalEngagement) => {
  return sessions.length ? Math.round((totalEngagement / sessions.length) * 100) : 0;
};

// Helper for calculating trend
const calculateTrendValue = (recentAvg, olderAvg) => {
  return olderAvg ? (recentAvg - olderAvg) / olderAvg : 0;
};

// Helper for conditional styling
const getFilterButtonClass = (showFilters) => {
  return `btn-outline flex items-center space-x-2 ${showFilters ? 'bg-primary-50 border-primary-300' : ''}`;
};

// Helper for container class
const getContainerClass = (embedded) => {
  return `space-y-6 ${!embedded ? 'p-6' : ''}`;
};

// Helper for game performance text
const getGamePerformanceText = (gameTypePerformance) => {
  return gameTypePerformance.length > 0 
    ? `"${gameTypePerformance[0].gameType}" è il tipo di gioco con le migliori performance.`
    : 'Nessun pattern di gioco dominante identificato.';
};

// Helper for emotional state text
const getEmotionalStateText = (emotionalStateData) => {
  return emotionalStateData.length > 0 
    ? `Lo stato emotivo più frequente è "${emotionalStateData[0].label}".`
    : 'Analisi dello stato emotivo in corso.';
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((entry, entryIndex) => (
        <div key={`tooltip-${entry.dataKey}-${entryIndex}`} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-sm text-gray-600">{entry.name}:</span>
          <span className="text-sm font-medium text-gray-900">
            {formatTooltipValue(entry.name, entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    color: PropTypes.string,
    dataKey: PropTypes.string
  })),
  label: PropTypes.string
};

// Mock data generator
const generateMockSessionData = (selectedPeriod) => {
  const today = new Date();
  const daysToGenerate = parseInt(selectedPeriod);
  const data = [];

  for (let i = daysToGenerate - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate 0-3 sessions per day
    const sessionsCount = Math.floor(Math.random() * 4);
    for (let j = 0; j < sessionsCount; j++) {
      const sessionTime = new Date(date);
      sessionTime.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));

      data.push({
        id: `${i}-${j}`,
        date: sessionTime.toISOString(),
        score: 60 + Math.floor(Math.random() * 40), // 60-100
        duration: 300 + Math.floor(Math.random() * 900), // 5-20 minutes
        emotionalState: ['happy', 'excited', 'calm', 'focused', 'frustrated'][Math.floor(Math.random() * 5)],
        engagement: 0.4 + Math.random() * 0.6, // 40-100%
        correctAnswers: Math.floor(Math.random() * 20) + 5,
        totalQuestions: 25,
        gameType: ['Routine Igiene', 'Quiz Denti', 'Memory Game', 'Puzzle Spazzolino'][Math.floor(Math.random() * 4)],
        completionRate: 0.6 + Math.random() * 0.4,
        pointsEarned: Math.floor(Math.random() * 50) + 10,
        helpRequests: Math.floor(Math.random() * 5),
        achievements: Math.floor(Math.random() * 3)
      });
    }
  }

  return data.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Data processing helper
const processSessionsToTimeSeriesData = (sessions) => {
  if (!sessions.length) return [];

  const dailyData = {};
  
  sessions.forEach(session => {
    const date = new Date(session.date || session.startedAt).toISOString().split('T')[0];
    
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        sessions: [],
        totalScore: 0,
        totalDuration: 0,
        totalEngagement: 0,
        emotionalStates: {},
        gameTypes: {},
        achievements: 0,
        helpRequests: 0
      };
    }

    const day = dailyData[date];
    day.sessions.push(session);
    day.totalScore += session.score || 0;
    day.totalDuration += session.duration || 0;
    day.totalEngagement += session.engagement || 0;
    day.achievements += session.achievements || 0;
    day.helpRequests += session.helpRequests || 0;

    // Track emotional states
    const emotionalState = session.emotionalState || 'neutral';
    day.emotionalStates[emotionalState] = (day.emotionalStates[emotionalState] || 0) + 1;

    // Track game types
    const gameType = session.gameType || 'unknown';
    day.gameTypes[gameType] = (day.gameTypes[gameType] || 0) + 1;
  });

  return Object.values(dailyData).map(day => ({
    date: day.date,
    formattedDate: new Date(day.date).toLocaleDateString('it-IT', { 
      month: 'short', 
      day: 'numeric' 
    }),
    rawDate: day.date,    averageScore: calculateAverage(day.sessions.map(s => s.score)),
    totalDuration: Math.round(day.totalDuration / 60),
    averageEngagement: calculateEngagementAverage(day.sessions, day.totalEngagement),
    sessionsCount: day.sessions.length,
    achievements: day.achievements,
    helpRequests: day.helpRequests,
    sessions: day.sessions,
    emotionalStates: day.emotionalStates,
    gameTypes: day.gameTypes
  })).sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
};

// Calculate engagement metrics
const calculateEngagementMetrics = (sessions) => {
  if (!sessions.length) return { current: 0, trend: 0, status: 'neutral' };

  const avgEngagement = sessions.reduce((sum, s) => sum + (s.engagement || 0), 0) / sessions.length;
  const currentEngagement = avgEngagement;

  // Calculate trend (last week vs previous week)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentSessions = sessions.filter(s => new Date(s.date || s.startedAt) >= oneWeekAgo);
  const olderSessions = sessions.filter(s => new Date(s.date || s.startedAt) < oneWeekAgo);

  const recentAvg = recentSessions.length ? 
    recentSessions.reduce((sum, s) => sum + (s.engagement || 0), 0) / recentSessions.length : 0;
  const olderAvg = olderSessions.length ? 
    olderSessions.reduce((sum, s) => sum + (s.engagement || 0), 0) / olderSessions.length : 0;

  const trend = calculateTrendValue(recentAvg, olderAvg);
  const trendPercentage = trend * 100;
  const trendStatus = getTrendStatus(trend);

  return {
    current: Math.round(currentEngagement * 100),
    trend: Math.round(trendPercentage),
    status: trendStatus  };
};

// Component helpers for reducing complexity
const renderLoadingState = () => (
  <div className="space-y-6">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="h-80 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const renderKeyMetricsCards = (keyMetrics) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="dental-card p-4" data-testid="metric-total-sessions">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Sessioni Totali</p>
          <p className="text-2xl font-bold text-gray-900">{keyMetrics.totalSessions}</p>
        </div>
        <CalendarIcon className="h-8 w-8 text-blue-500" />
      </div>
    </div>

    <div className="dental-card p-4" data-testid="metric-average-score">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Punteggio Medio</p>
          <p className="text-2xl font-bold text-gray-900">{keyMetrics.averageScore}%</p>
        </div>
        <TrophyIcon className="h-8 w-8 text-yellow-500" />
      </div>
    </div>

    <div className="dental-card p-4" data-testid="metric-play-time">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Tempo di Gioco</p>
          <p className="text-2xl font-bold text-gray-900">{keyMetrics.totalPlayTime}m</p>
        </div>
        <ClockIcon className="h-8 w-8 text-green-500" />
      </div>
    </div>

    <div className="dental-card p-4" data-testid="metric-trend">
      <div className="flex items-center justify-between">        <div>
          <p className="text-sm font-medium text-gray-600">Tendenza</p>
          <div className="flex items-center space-x-1">
            <p className="text-2xl font-bold text-gray-900">{Math.abs(keyMetrics.improvementTrend)}%</p>
            {getTrendIcon(keyMetrics.improvementTrend)}
          </div>
        </div>
        <HeartIcon className="h-8 w-8 text-purple-500" />
      </div>
    </div>
  </div>
);

const renderChart = (chartType, processTimeSeriesData, chartConfig) => {
  if (chartType === 'line') {
    return (
      <LineChart data={processTimeSeriesData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="formattedDate" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="averageScore" 
          stroke={chartConfig.colors.primary}
          strokeWidth={3}
          dot={{ fill: chartConfig.colors.primary, strokeWidth: 2, r: 4 }}
          name="Punteggio Medio (%)"
        />
        <Line 
          type="monotone" 
          dataKey="averageEngagement" 
          stroke={chartConfig.colors.secondary}
          strokeWidth={3}
          dot={{ fill: chartConfig.colors.secondary, strokeWidth: 2, r: 4 }}
          name="Coinvolgimento (%)"
        />
      </LineChart>
    );
  }
  
  if (chartType === 'area') {
    return (
      <AreaChart data={processTimeSeriesData}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartConfig.colors.primary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={chartConfig.colors.primary} stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartConfig.colors.secondary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={chartConfig.colors.secondary} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="formattedDate" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="averageScore" 
          stroke={chartConfig.colors.primary}
          fillOpacity={1}
          fill="url(#scoreGradient)"
          name="Punteggio Medio (%)"
        />
        <Area 
          type="monotone" 
          dataKey="averageEngagement" 
          stroke={chartConfig.colors.secondary}
          fillOpacity={1}
          fill="url(#engagementGradient)"
          name="Coinvolgimento (%)"
        />
      </AreaChart>
    );
  }
  
  return (
    <BarChart data={processTimeSeriesData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
      <XAxis dataKey="formattedDate" stroke="#6b7280" fontSize={12} />
      <YAxis stroke="#6b7280" fontSize={12} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      <Bar 
        dataKey="averageScore" 
        fill={chartConfig.colors.primary}
        name="Punteggio Medio (%)"
        radius={[2, 2, 0, 0]}
      />
      <Bar 
        dataKey="averageEngagement" 
        fill={chartConfig.colors.secondary}
        name="Coinvolgimento (%)"
        radius={[2, 2, 0, 0]}
      />
    </BarChart>
  );
};

const ProgressCharts = ({ childId: propChildId, embedded = false, period = '30' }) => {
  const { childId: paramChildId } = useParams();
  const childId = propChildId || paramChildId;

  // State management
  const [child, setChild] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [chartType, setChartType] = useState('line');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        
        // Fetch child info
        const childData = {
          id: childId,
          name: 'Sofia Rossi',
          age: 6,
          avatar: '👧'
        };
        setChild(childData);

        // Fetch session data
        const sessionsData = await reportService.getChildGameSessions(childId, {
          limit: parseInt(selectedPeriod) * 2, // Get more data for better analysis
          sort: 'started_at',
          order: 'asc'
        });
        
        setSessions(sessionsData || mockSessionData);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        toast.error('Errore nel caricamento dei dati di progresso');
        setSessions(mockSessionData);
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      fetchProgressData();
    }
  }, [childId, selectedPeriod]);
  // Mock data for development
  const mockSessionData = useMemo(() => generateMockSessionData(selectedPeriod), [selectedPeriod]);
  // Data processing functions
  const processTimeSeriesData = useMemo(() => processSessionsToTimeSeriesData(sessions), [sessions]);

  // Emotional state analysis
  const emotionalStateData = useMemo(() => {
    const emotions = {};
    sessions.forEach(session => {
      const emotion = session.emotionalState || 'neutral';
      emotions[emotion] = (emotions[emotion] || 0) + 1;
    });

    const colors = {
      happy: '#10B981',
      excited: '#F59E0B',
      calm: '#3B82F6',
      focused: '#8B5CF6',
      frustrated: '#EF4444',
      neutral: '#6B7280'
    };

    return Object.entries(emotions).map(([emotion, count]) => ({
      name: emotion,
      value: count,
      percentage: Math.round((count / sessions.length) * 100),
      color: colors[emotion] || '#6B7280',
      label: {
        happy: 'Felice',
        excited: 'Eccitato',
        calm: 'Calmo',
        focused: 'Concentrato',
        frustrated: 'Frustrato',
        neutral: 'Neutro'
      }[emotion] || emotion
    }));
  }, [sessions]);

  // Game type performance
  const gameTypePerformance = useMemo(() => {
    const gameStats = {};
    
    sessions.forEach(session => {
      const gameType = session.gameType || 'Unknown';
      if (!gameStats[gameType]) {
        gameStats[gameType] = {
          sessions: [],
          totalScore: 0,
          totalDuration: 0,
          totalEngagement: 0
        };
      }

      gameStats[gameType].sessions.push(session);
      gameStats[gameType].totalScore += session.score || 0;
      gameStats[gameType].totalDuration += session.duration || 0;
      gameStats[gameType].totalEngagement += session.engagement || 0;
    });

    return Object.entries(gameStats).map(([gameType, stats]) => ({
      gameType,
      sessionsCount: stats.sessions.length,
      averageScore: Math.round(stats.totalScore / stats.sessions.length),
      averageDuration: Math.round(stats.totalDuration / (stats.sessions.length * 60)),
      averageEngagement: Math.round((stats.totalEngagement / stats.sessions.length) * 100)
    }));  }, [sessions]);

  // Engagement metrics
  const engagementMetrics = useMemo(() => calculateEngagementMetrics(sessions), [sessions]);

  // Chart configurations
  const chartConfig = {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      warning: '#EF4444',
      purple: '#8B5CF6',
      pink: '#EC4899'
    },
    gradients: {
      score: ['#3B82F6', '#1D4ED8'],
      engagement: ['#10B981', '#059669'],
      duration: ['#F59E0B', '#D97706']
    }
  };

  // Filter options
  const periodOptions = [
    { value: '7', label: '7 giorni' },
    { value: '14', label: '2 settimane' },
    { value: '30', label: '30 giorni' },
    { value: '60', label: '2 mesi' },
    { value: '90', label: '3 mesi' }
  ];

  const metricOptions = [
    { value: 'all', label: 'Tutte le metriche', icon: ChartBarIcon },
    { value: 'score', label: 'Punteggi', icon: TrophyIcon },
    { value: 'engagement', label: 'Coinvolgimento', icon: HeartIcon },
    { value: 'duration', label: 'Durata sessioni', icon: ClockIcon },
    { value: 'emotional', label: 'Stati emotivi', icon: EyeIcon }
  ];

  const chartTypeOptions = [
    { value: 'line', label: 'Linea', icon: '📈' },
    { value: 'area', label: 'Area', icon: '📊' },
    { value: 'bar', label: 'Barre', icon: '📊' }  ];

  // Render loading state
  if (loading) {
    return renderLoadingState();
  }
  // Calculate key metrics
  const keyMetrics = {
    totalSessions: sessions.length,
    averageScore: calculateAverage(sessions.map(s => s.score)),
    totalPlayTime: Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60), // in minutes
    improvementTrend: engagementMetrics.trend
  };

  return (
    <div className={getContainerClass(embedded)} data-testid="progress-charts-container">
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>            <h1 className="text-3xl font-display font-bold text-gray-900">
              Progresso di {getChildDisplayName(child)}
            </h1>
            <p className="text-gray-600 mt-1">
              Analisi dettagliata delle performance e dell'engagement
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={getFilterButtonClass(showFilters)}
            data-testid="progress-filters-toggle"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span>Filtri</span>
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {(showFilters || embedded) && (
        <div className="dental-card p-4" data-testid="progress-filters-panel">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="period-selector" className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
              <select
                id="period-selector"
                data-testid="progress-period-selector"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="metric-select" className="block text-sm font-medium text-gray-700 mb-2">Metrica</label>
              <select
                id="metric-select"
                data-testid="progress-metric-selector"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {metricOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="chart-type-select" className="block text-sm font-medium text-gray-700 mb-2">Tipo Grafico</label>
              <select
                id="chart-type-select"
                data-testid="progress-chart-type-selector"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {chartTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}      {/* Key Metrics Cards */}
      <div data-testid="progress-key-metrics">
        {renderKeyMetricsCards(keyMetrics)}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="progress-charts-grid">
        {/* Progress Over Time - Main Chart */}
        <div className="lg:col-span-2 dental-card p-6" data-testid="progress-main-chart">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progresso nel Tempo</h3>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Punteggio
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Coinvolgimento
              </span>
            </div>
          </div>
            <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart(chartType, processTimeSeriesData, chartConfig)}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotional State Distribution */}
        <div className="dental-card p-6" data-testid="progress-emotional-chart">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stati Emotivi</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emotionalStateData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={false}                >
                  {emotionalStateData.map((entry) => (
                    <Cell key={`emotion-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {emotionalStateData.map((emotion, index) => (
              <div key={emotion.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: emotion.color }}
                  ></div>
                  <span className="text-gray-700">{emotion.label}</span>
                </div>
                <span className="font-medium text-gray-900">{emotion.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Type Performance */}
        <div className="dental-card p-6" data-testid="progress-game-performance-chart">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance per Tipo di Gioco</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gameTypePerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="gameType" 
                  stroke="#6b7280" 
                  fontSize={12}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="averageScore" 
                  fill={chartConfig.colors.accent}
                  name="Punteggio Medio"
                  radius={[0, 2, 2, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Trend */}
        <div className="dental-card p-6" data-testid="progress-engagement-chart">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendenza Coinvolgimento</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="80%"              data={[{ 
                  name: 'Coinvolgimento Attuale', 
                  value: engagementMetrics.current,
                  fill: getChartColor(engagementMetrics.status, chartConfig)
                }]}
              >
                <RadialBar 
                  dataKey="value" 
                  cornerRadius={10} 
                  fill={getChartColor(engagementMetrics.status, chartConfig)}
                />
                <text 
                  x="50%" 
                  y="50%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="text-2xl font-bold fill-gray-900"
                >
                  {engagementMetrics.current}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>          <div className="text-center mt-4">
            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getEngagementStatusColor(engagementMetrics.status)}`}>
              {getEngagementIcon(engagementMetrics.status)}
              <span>
                {getEngagementStatusText(engagementMetrics.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Activity Heatmap */}
      <div className="dental-card p-6" data-testid="progress-activity-heatmap">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Giornaliera</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processTimeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="sessionsCount" 
                fill={chartConfig.colors.purple}
                name="Sessioni per Giorno"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="dental-card p-6" data-testid="progress-insights-panel">
        <div className="flex items-center space-x-2 mb-4">
          <InformationCircleIcon className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Insights Automatici</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Modello di Utilizzo</h4>            <p className="text-sm text-blue-800">
              {getChildDisplayName(child)} è più attivo nelle sessioni mattutine con punteggi medi del {keyMetrics.averageScore}%.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">📈 Progresso</h4>            <p className="text-sm text-green-800">
              Il coinvolgimento è {getImprovementText(engagementMetrics.status)} nell'ultimo periodo analizzato.
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">🎮 Gioco Preferito</h4>            <p className="text-sm text-yellow-800">
              {getGamePerformanceText(gameTypePerformance)}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">😊 Stato Emotivo</h4>            <p className="text-sm text-purple-800">
              {getEmotionalStateText(emotionalStateData)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add PropTypes validation
ProgressCharts.propTypes = {
  childId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  embedded: PropTypes.bool,
  period: PropTypes.string
};

export default ProgressCharts;
