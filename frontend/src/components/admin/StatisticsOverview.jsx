/**
 * StatisticsOverview.jsx
 * Dashboard con analytics sui profili bambini ASD
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Alert, AlertDescription } from '../ui/Alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Heart,
  MessageSquare,
  Target,
  Calendar,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import childrenService from '../../services/childrenService';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

const SUPPORT_LEVEL_COLORS = {
  1: '#10b981', // green
  2: '#f59e0b', // yellow  
  3: '#ef4444'  // red
};

const StatisticsOverview = ({ childrenData = [], onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  useEffect(() => {
    loadAnalytics();
  }, [childrenData, selectedTimeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const childrenIds = childrenData.map(child => child.id);
      if (childrenIds.length > 0) {
        const data = await childrenService.getChildrenAnalytics(childrenIds, {
          timeRange: selectedTimeRange
        });
        setAnalyticsData(data);
      } else {
        setAnalyticsData(generateMockAnalytics());
      }
    } catch (err) {
      setError(`Errore nel caricamento delle analytics: ${err.message}`);
      setAnalyticsData(generateMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalytics = () => {
    return {
      overview: {
        totalChildren: childrenData.length,
        averageAge: childrenData.length > 0 ? 
          Math.round(childrenData.reduce((sum, child) => sum + (child.age || 8), 0) / childrenData.length) : 8,
        averageLevel: childrenData.length > 0 ? 
          Math.round(childrenData.reduce((sum, child) => sum + (child.level || 5), 0) / childrenData.length) : 5,
        totalSessions: Math.floor(childrenData.length * 24),
        completionRate: 78
      },
      levelDistribution: [
        { level: 'Livello 1-2', count: Math.floor(childrenData.length * 0.15), percentage: 15 },
        { level: 'Livello 3-4', count: Math.floor(childrenData.length * 0.25), percentage: 25 },
        { level: 'Livello 5-6', count: Math.floor(childrenData.length * 0.35), percentage: 35 },
        { level: 'Livello 7-8', count: Math.floor(childrenData.length * 0.20), percentage: 20 },
        { level: 'Livello 9-10', count: Math.floor(childrenData.length * 0.05), percentage: 5 }
      ],
      supportLevelDistribution: [
        { level: 1, label: 'Supporto Richiesto', count: Math.floor(childrenData.length * 0.4), color: SUPPORT_LEVEL_COLORS[1] },
        { level: 2, label: 'Supporto Sostanziale', count: Math.floor(childrenData.length * 0.45), color: SUPPORT_LEVEL_COLORS[2] },
        { level: 3, label: 'Supporto Molto Sostanziale', count: Math.floor(childrenData.length * 0.15), color: SUPPORT_LEVEL_COLORS[3] }
      ],
      ageDistribution: [
        { ageGroup: '3-6 anni', count: Math.floor(childrenData.length * 0.3) },
        { ageGroup: '7-10 anni', count: Math.floor(childrenData.length * 0.4) },
        { ageGroup: '11-14 anni', count: Math.floor(childrenData.length * 0.25) },
        { ageGroup: '15-18 anni', count: Math.floor(childrenData.length * 0.05) }
      ],
      communicationStyles: [
        { style: 'Verbale', count: Math.floor(childrenData.length * 0.35) },
        { style: 'Non Verbale', count: Math.floor(childrenData.length * 0.25) },
        { style: 'Misto', count: Math.floor(childrenData.length * 0.30) },
        { style: 'Assistito', count: Math.floor(childrenData.length * 0.10) }
      ],
      progressTrend: [
        { month: 'Gen', avgLevel: 4.2, sessions: 120 },
        { month: 'Feb', avgLevel: 4.5, sessions: 135 },
        { month: 'Mar', avgLevel: 4.8, sessions: 150 },
        { month: 'Apr', avgLevel: 5.1, sessions: 165 },
        { month: 'Mag', avgLevel: 5.4, sessions: 180 },
        { month: 'Giu', avgLevel: 5.7, sessions: 195 }
      ],
      topPerformers: childrenData.slice(0, 5).map((child, index) => ({
        id: child.id,
        name: child.name,
        level: child.level || (10 - index),
        points: (10 - index) * 150,
        improvement: Math.floor(Math.random() * 30) + 10
      }))
    };
  };

  const exportAnalytics = async () => {
    try {
      setLoading(true);
      const result = await childrenService.exportAnalytics(
        children.map(c => c.id), 
        { format: 'pdf', timeRange: selectedTimeRange }
      );
      
      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename || `analytics_${Date.now()}.pdf`;
        link.click();
      }
    } catch (err) {
      setError(`Errore nell'export: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <RefreshCw className={`w-8 h-8 mx-auto mb-4 ${loading ? 'animate-spin' : ''} text-gray-400`} />
            <p className="text-gray-500">
              {loading ? 'Caricamento analytics...' : 'Nessun dato disponibile'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analytics Bambini ASD</h3>
          <p className="text-sm text-gray-600">
            Analisi dati per {analyticsData.overview.totalChildren} bambini
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="7">Ultimi 7 giorni</option>
            <option value="30">Ultimi 30 giorni</option>
            <option value="90">Ultimi 3 mesi</option>
            <option value="365">Ultimo anno</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAnalytics}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-1" />
            Esporta
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totale Bambini</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalChildren}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Età Media</p>
                <p className="text-2xl font-bold">{analyticsData.overview.averageAge} anni</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Livello Medio</p>
                <p className="text-2xl font-bold">{analyticsData.overview.averageLevel}/10</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasso Completamento</p>
                <p className="text-2xl font-bold">{analyticsData.overview.completionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="levels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Livelli
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Supporto
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Progresso
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Comunicazione
          </TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuzione per Livelli di Gioco</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.levelDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuzione per Età</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.ageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ ageGroup, count }) => `${ageGroup}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >                      {analyticsData.ageDistribution.map((entry) => (
                        <Cell key={`cell-${entry.ageGroup}`} fill={COLORS[analyticsData.ageDistribution.indexOf(entry) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione Livelli di Supporto DSM-5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.supportLevelDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ label, count }) => `${label}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >                      {analyticsData.supportLevelDistribution.map((entry) => (
                        <Cell key={`cell-${entry.level}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-4">                  {analyticsData.supportLevelDistribution.map((item) => (
                    <div key={`support-${item.level}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <Badge variant="secondary">{item.count} bambini</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trend Progresso Livelli</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.progressTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgLevel" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topPerformers.map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={index < 3 ? 'default' : 'secondary'}>#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-sm text-gray-600">Livello {performer.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{performer.points} pt</p>
                        <p className="text-sm text-green-600">+{performer.improvement}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stili di Comunicazione</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.communicationStyles}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="style" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

StatisticsOverview.propTypes = {
  childrenData: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    age: PropTypes.number,
    level: PropTypes.number
  })),
  onRefresh: PropTypes.func
};

StatisticsOverview.defaultProps = {
  childrenData: [],
  onRefresh: () => {}
};

export default StatisticsOverview;
