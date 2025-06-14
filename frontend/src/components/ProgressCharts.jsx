import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
  ResponsiveContainer
} from 'recharts';
import { Button, Spinner, Alert } from './UI';
import { getChildProgressAnalysis, getChildSessionStats } from '../services/gameSessionService';
import './ProgressCharts.css';

/**
 * ProgressCharts Component
 * Componente per la visualizzazione dei progressi del bambino tramite grafici
 */
const ProgressCharts = ({ childId, period = 30, chartType = 'line' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('score');  const [selectedChart, setSelectedChart] = useState(chartType);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Helper function per determinare il periodo
  const getPeriodForStats = (days) => {
    if (days <= 7) return 'week';
    if (days <= 30) return 'month';
    return 'quarter';
  };

  useEffect(() => {
    loadProgressData();
  }, [childId, selectedPeriod, selectedMetric]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [progressResponse, statsResponse] = await Promise.all([
        getChildProgressAnalysis(childId, {
          days: selectedPeriod,
          metric_type: selectedMetric
        }),        getChildSessionStats(childId, {
          period: getPeriodForStats(selectedPeriod)
        })
      ]);

      setProgressData(progressResponse);
      setSessionStats(statsResponse);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const formatProgressData = () => {
    if (!progressData?.daily_points) return [];

    return Object.entries(progressData.daily_points).map(([date, points]) => ({
      date: new Date(date).toLocaleDateString('it-IT', { 
        month: 'short', 
        day: 'numeric' 
      }),
      points: points,
      score: Math.floor(points * 1.2), // Mock score calculation
      sessions: Math.floor(points / 10), // Mock sessions calculation
      engagement: Math.min(100, points * 2), // Mock engagement percentage
    })).slice(-14); // Last 14 days
  };
  const formatSessionTypeData = () => {
    if (!sessionStats?.session_types) return [];

    return Object.entries(sessionStats.session_types).map(([type, count]) => ({
      name: type.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase()),
      value: count,
      percentage: sessionStats.total_sessions > 0 
        ? Math.round((count / sessionStats.total_sessions) * 100) 
        : 0    }));
  };

  const chartColors = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  };

  const pieColors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const renderChart = () => {
    const data = formatProgressData();
    
    if (!data || data.length === 0) {
      return (
        <div className="chart-empty">
          <p>📊 Nessun dato disponibile per il periodo selezionato</p>
        </div>
      );
    }

    switch (selectedChart) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chartColors.primary, strokeWidth: 2 }}
                name="Punti Giornalieri"
              />
              {selectedMetric === 'engagement' && (
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke={chartColors.success}
                  strokeWidth={2}
                  dot={{ fill: chartColors.success, strokeWidth: 2, r: 3 }}
                  name="Coinvolgimento %"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="points" 
                stroke={chartColors.primary}
                fillOpacity={1}
                fill="url(#colorPoints)"
                strokeWidth={2}
                name="Punti Giornalieri"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="points" 
                fill={chartColors.primary}
                name="Punti"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="sessions" 
                fill={chartColors.success}
                name="Sessioni"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );      case 'pie': {
        const pieData = formatSessionTypeData();
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, entryIndex) => (
                  <Cell 
                    key={entry.name} 
                    fill={pieColors[entryIndex % pieColors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} sessioni`, 'Totale']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="progress-charts-container">
        <div className="progress-charts-loading">
          <Spinner size="large" />
          <p>Caricamento grafici progressi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-charts-container">
        <Alert variant="error" title="Errore nel caricamento">
          {error}
        </Alert>
        <Button onClick={loadProgressData} variant="secondary">
          Riprova
        </Button>
      </div>
    );
  }

  return (
    <div className="progress-charts-container">
      <div className="progress-charts-header">
        <h3 className="progress-charts-title">
          📊 Analisi Progressi
        </h3>        <div className="progress-charts-controls">
          <div className="control-group">
            <label htmlFor="period-select">Periodo:</label>
            <select 
              id="period-select"
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="control-select"
            >
              <option value={7}>Ultima settimana</option>
              <option value={14}>Ultime 2 settimane</option>
              <option value={30}>Ultimo mese</option>
              <option value={90}>Ultimi 3 mesi</option>
            </select>
          </div>
          
          <div className="control-group">
            <label htmlFor="metric-select">Metrica:</label>
            <select 
              id="metric-select"
              value={selectedMetric} 
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="control-select"
            >
              <option value="score">Punteggio</option>
              <option value="engagement">Coinvolgimento</option>
              <option value="improvement">Miglioramento</option>
            </select>
          </div>
          
          <div className="control-group">
            <label htmlFor="chart-type-select">Tipo grafico:</label>
            <select 
              id="chart-type-select"
              value={selectedChart} 
              onChange={(e) => setSelectedChart(e.target.value)}
              className="control-select"
            >
              <option value="line">Linea</option>
              <option value="area">Area</option>
              <option value="bar">Barre</option>
              <option value="pie">Torta (Tipi Sessione)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="progress-chart-wrapper">
        {renderChart()}
      </div>

      {sessionStats && (
        <div className="progress-stats-summary">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">📈</span>
              <span className="stat-value">{sessionStats.total_sessions || 0}</span>
              <span className="stat-label">Sessioni Totali</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">{sessionStats.average_score || 0}</span>
              <span className="stat-label">Punteggio Medio</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <span className="stat-value">
                {sessionStats.completion_rate ? `${Math.round(sessionStats.completion_rate)}%` : '0%'}
              </span>
              <span className="stat-label">Tasso Completamento</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📊</span>
              <span className="stat-value">
                {sessionStats.improvement_rate ? `+${Math.round(sessionStats.improvement_rate)}%` : '0%'}
              </span>
              <span className="stat-label">Miglioramento</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProgressCharts.propTypes = {
  childId: PropTypes.number.isRequired,
  period: PropTypes.number,
  chartType: PropTypes.oneOf(['line', 'area', 'bar', 'pie'])
};

export default ProgressCharts;
