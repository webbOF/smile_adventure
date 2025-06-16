/**
 * ChildrenManagement.jsx
 * Pagina principale per la gestione bambini ASD con operazioni bulk e analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Alert, AlertDescription } from '../components/ui/Alert';
import BulkManagement from '../components/admin/BulkManagement';
import StatisticsOverview from '../components/admin/StatisticsOverview';
import ProfileCompletion from '../components/admin/ProfileCompletion';
import { 
  Users, 
  BarChart3, 
  Settings, 
  CheckCircle2,
  Plus,
  RefreshCw,
  Filter
} from 'lucide-react';
import childrenService from '../services/childrenService';

const ChildrenManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [children, setChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await childrenService.getChildren();
      setChildren(response.children || response);
    } catch (err) {
      setError(`Errore nel caricamento dei bambini: ${err.message}`);
      // Mock data for development
      setChildren(generateMockChildren());
    } finally {
      setLoading(false);
    }
  };

  const generateMockChildren = () => {
    return [
      {
        id: 1,
        name: 'Marco Rossi',
        age: 8,
        level: 5,
        points: 450,
        diagnosis: 'ASD Livello 1',
        supportLevel: 1,
        communicationStyle: 'verbal',
        lastActivity: '2025-06-15'
      },
      {
        id: 2,
        name: 'Sofia Bianchi',
        age: 6,
        level: 3,
        points: 280,
        diagnosis: 'ASD Livello 2',
        supportLevel: 2,
        communicationStyle: 'mixed',
        lastActivity: '2025-06-14'
      },
      {
        id: 3,
        name: 'Luca Verdi',
        age: 10,
        level: 7,
        points: 650,
        diagnosis: 'ASD Livello 1',
        supportLevel: 1,
        communicationStyle: 'verbal',
        lastActivity: '2025-06-16'
      },
      {
        id: 4,
        name: 'Giulia Neri',
        age: 5,
        level: 2,
        points: 150,
        diagnosis: 'ASD Livello 3',
        supportLevel: 3,
        communicationStyle: 'device_assisted',
        lastActivity: '2025-06-13'
      },
      {
        id: 5,
        name: 'Alessandro Blu',
        age: 9,
        level: 6,
        points: 520,
        diagnosis: 'ASD Livello 1',
        supportLevel: 1,
        communicationStyle: 'verbal',
        lastActivity: '2025-06-15'
      }
    ];
  };

  const handleChildSelection = (childId, selected) => {
    if (selected) {
      setSelectedChildren(prev => [...prev, children.find(c => c.id === childId)]);
    } else {
      setSelectedChildren(prev => prev.filter(c => c.id !== childId));
    }
  };

  const handleSelectAll = () => {
    setSelectedChildren([...children]);
  };

  const handleClearSelection = () => {
    setSelectedChildren([]);
  };

  const handleBulkActionComplete = () => {
    // Ricarica i dati dopo un'operazione bulk
    loadChildren();
    setSelectedChildren([]);
  };

  const getSupportLevelBadge = (level) => {
    const variants = {
      1: { variant: 'default', color: 'green' },
      2: { variant: 'secondary', color: 'yellow' },
      3: { variant: 'destructive', color: 'red' }
    };
    return variants[level] || variants[1];
  };

  const getSelectedCount = () => selectedChildren.length;
  const getTotalCount = () => children.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestione Bambini ASD</h1>
          <p className="text-gray-600">
            Operazioni multiple, analytics e monitoraggio profili
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filtri
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadChildren}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            Nuovo Bambino
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totale Bambini</p>
                <p className="text-2xl font-bold">{getTotalCount()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selezionati</p>
                <p className="text-2xl font-bold text-green-600">{getSelectedCount()}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Età Media</p>
                <p className="text-2xl font-bold">
                  {children.length > 0 ? 
                    Math.round(children.reduce((sum, child) => sum + child.age, 0) / children.length) : 0
                  } anni
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Livello Medio</p>
                <p className="text-2xl font-bold">
                  {children.length > 0 ? 
                    Math.round(children.reduce((sum, child) => sum + child.level, 0) / children.length) : 0
                  }/10
                </p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children List with Selection */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Lista Bambini</CardTitle>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                Seleziona Tutti
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
              >
                Deseleziona Tutti
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">              {children.map(child => (
                <button
                  key={child.id}
                  type="button"
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    selectedChildren.find(c => c.id === child.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleChildSelection(
                    child.id, 
                    !selectedChildren.find(c => c.id === child.id)
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!selectedChildren.find(c => c.id === child.id)}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-gray-600">
                          {child.age} anni • Livello {child.level} • {child.points} punti
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge {...getSupportLevelBadge(child.supportLevel)}>
                        Supporto {child.supportLevel}
                      </Badge>
                      <Badge variant="outline">
                        {child.communicationStyle}
                      </Badge>                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Operazioni Multiple
          </TabsTrigger>
          <TabsTrigger value="completion" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completamento Profili
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gestione
          </TabsTrigger>
        </TabsList>        <TabsContent value="overview" className="space-y-4">
          <StatisticsOverview 
            childrenData={children}
            onRefresh={loadChildren}
          />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <BulkManagement
            selectedChildren={selectedChildren}
            onActionComplete={handleBulkActionComplete}
            onClearSelection={handleClearSelection}
          />
        </TabsContent>

        <TabsContent value="completion" className="space-y-4">
          <ProfileCompletion
            childrenData={children}
            onProfileUpdate={loadChildren}
            onSendReminder={(childId) => {
              console.log(`Promemoria inviato per bambino ${childId}`);
            }}
          />
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Gestione bambini tradizionale</p>
                <p className="text-sm">CRUD singolo, dettagli, modifica profili</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChildrenManagement;
