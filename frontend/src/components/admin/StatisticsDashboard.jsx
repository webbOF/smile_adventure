/**
 * StatisticsDashboard.jsx
 * Dashboard admin con analytics e metriche utenti
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Alert, AlertDescription } from '../ui/Alert';
import { 
  Users, 
  UserPlus, 
  Activity, 
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  BarChart3,
  LineChart,
  Shield,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart as RechartsPieChart, 
  Cell, 
  Pie,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import adminService from '../../services/adminService';

const TIME_RANGES = [
  { value: '7d', label: 'Ultimi 7 giorni' },
  { value: '30d', label: 'Ultimi 30 giorni' },
  { value: '90d', label: 'Ultimi 3 mesi' },
  { value: '1y', label: 'Ultimo anno' }
];

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

// Extract StatCard component outside
const StatCard = ({ title, value, subtitle, icon: Icon, trend, color }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getGrowthIcon = (rate) => {
    if (rate > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (rate < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{formatNumber(value)}</p>
            {subtitle && (
              <div className="flex items-center mt-1">
                {trend !== undefined && getGrowthIcon(trend)}
                <p className="text-sm text-gray-500 ml-1">{subtitle}</p>
              </div>
            )}
          </div>
          <div className={`p-3 bg-${color}-100 rounded-full`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  trend: PropTypes.number,
  color: PropTypes.string
};

StatCard.defaultProps = {
  subtitle: null,
  trend: undefined,
  color: 'blue'
};

const StatisticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Stats data
  const [overallStats, setOverallStats] = useState({
    total_users: 0,
    active_users: 0,
    new_users_today: 0,
    new_users_week: 0,
    growth_rate: 0
  });
  
  const [usersByRole, setUsersByRole] = useState([]);
  const [usersByStatus, setUsersByStatus] = useState([]);
  const [registrationsTrend, setRegistrationsTrend] = useState([]);
  const [activityTrend, setActivityTrend] = useState([]);
  const [topMetrics, setTopMetrics] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Parallel loading of all dashboard data
      const [
        overallResponse,
        roleDistribution,
        statusDistribution,
        registrations,
        activity,
        metrics
      ] = await Promise.all([
        adminService.getOverallUserStats(timeRange),
        adminService.getUsersByRoleDistribution(),
        adminService.getUsersByStatusDistribution(), 
        adminService.getRegistrationsTrend(timeRange),
        adminService.getActivityTrend(timeRange),
        adminService.getTopUserMetrics(timeRange)
      ]);

      setOverallStats(overallResponse);
      setUsersByRole(roleDistribution);
      setUsersByStatus(statusDistribution);
      setRegistrationsTrend(registrations);
      setActivityTrend(activity);
      setTopMetrics(metrics);
      setLastUpdate(new Date());

    } catch (err) {
      setError(`Errore nel caricamento dei dati: ${err.message}`);
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const result = await adminService.exportDashboardData(timeRange);
      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename || `dashboard_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        link.click();
      }
    } catch (err) {
      setError(`Errore nell'export: ${err.message}`);
    }
  };

  const getChangeColorClass = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Dashboard Analytics</h2>
          <div className="animate-pulse">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={`loading-card-${i}`} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Dashboard Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Ultimo aggiornamento: {format(lastUpdate, 'PPpp', { locale: it })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={loadDashboardData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Esporta
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Utenti Totali"
          value={overallStats.total_users}
          subtitle={`${overallStats.active_users} attivi`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Nuovi Oggi"
          value={overallStats.new_users_today}
          subtitle={`${overallStats.new_users_week} questa settimana`}
          icon={UserPlus}
          color="green"
        />
        <StatCard
          title="Crescita"
          value={`${overallStats.growth_rate}%`}
          subtitle="rispetto al periodo precedente"
          icon={TrendingUp}
          trend={overallStats.growth_rate}
          color="purple"
        />
        <StatCard
          title="Sessioni Attive"
          value={overallStats.active_sessions || 0}
          subtitle="utenti online ora"
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2" />
              Trend Registrazioni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={registrationsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'PPP', { locale: it })}
                />
                <Line 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke={CHART_COLORS[0]} 
                  strokeWidth={2}
                  name="Registrazioni"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Attività Utenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={activityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'PPP', { locale: it })}
                />
                <Bar 
                  dataKey="logins" 
                  fill={CHART_COLORS[1]} 
                  name="Login"
                />
                <Bar 
                  dataKey="sessions" 
                  fill={CHART_COLORS[2]} 
                  name="Sessioni"
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Distribuzione per Ruolo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {usersByRole.map((entry, index) => (
                    <Cell key={`role-${entry.name || index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Distribuzione per Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={usersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {usersByStatus.map((entry, index) => (
                    <Cell key={`status-${entry.name || index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Metrics */}
      {topMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Metriche Principali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topMetrics.map((metric, index) => (
                <div key={metric.id || `metric-${index}`} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                      <p className="text-xl font-bold">{metric.value}</p>
                      {metric.change && (
                        <div className="flex items-center mt-1">
                          {metric.change > 0 && <TrendingUp className="w-4 h-4 text-green-500" />}
                          {metric.change < 0 && <TrendingDown className="w-4 h-4 text-red-500" />}
                          {metric.change === 0 && <Activity className="w-4 h-4 text-gray-500" />}
                          <span className={`text-sm ml-1 ${getChangeColorClass(metric.change)}`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </span>
                        </div>
                      )}
                    </div>
                    {metric.icon && (
                      <div className="p-2 bg-gray-100 rounded-full">
                        <metric.icon className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatisticsDashboard;
