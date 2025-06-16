/**
 * ProfileCompletion.jsx
 * Sistema di gestione e monitoraggio completamento profili bambini ASD
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert, AlertDescription } from '../ui/Alert';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Textarea';
import { Progress } from '../ui/Progress';
import { 
  CheckCircle, 
  Circle, 
  AlertTriangle, 
  Clock,
  User,
  Heart,
  Brain,
  MessageSquare,
  Activity,
  FileText,
  UserCheck,
  Send,
  RefreshCw,
  Target
} from 'lucide-react';
import childrenService from '../../services/childrenService';

const PROFILE_SECTIONS = [
  {
    id: 'basic_info',
    name: 'Informazioni di Base',
    icon: User,
    fields: ['name', 'birthDate', 'gender', 'diagnosis'],
    weight: 20
  },
  {
    id: 'support_level',
    name: 'Livello Supporto DSM-5',
    icon: Heart,
    fields: ['supportLevel', 'supportNotes'],
    weight: 15
  },
  {
    id: 'cognitive_profile',
    name: 'Profilo Cognitivo',
    icon: Brain,
    fields: ['cognitiveLevel', 'attentionSpan', 'memorySkills'],
    weight: 20
  },
  {
    id: 'communication',
    name: 'Comunicazione',
    icon: MessageSquare,
    fields: ['communicationStyle', 'languageLevel', 'communicationNotes'],
    weight: 15
  },
  {
    id: 'sensory_profile',
    name: 'Profilo Sensoriale',
    icon: Activity,
    fields: ['sensoryProcessing', 'sensoryPreferences', 'sensoryAversions'],
    weight: 15
  },
  {
    id: 'professional_notes',
    name: 'Note Professionali',
    icon: FileText,
    fields: ['assessmentDate', 'professionalNotes', 'recommendations'],
    weight: 15
  }
];

const getCompletionLevel = (percentage) => {
  if (percentage >= 90) return { level: 'Completo', color: 'green', variant: 'default' };
  if (percentage >= 70) return { level: 'Quasi Completo', color: 'blue', variant: 'secondary' };
  if (percentage >= 50) return { level: 'Parziale', color: 'yellow', variant: 'outline' };
  return { level: 'Incompleto', color: 'red', variant: 'destructive' };
};

const ProfileCompletion = ({ childrenData = [], onProfileUpdate, onSendReminder }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [completionData, setCompletionData] = useState([]);
  const [filter, setFilter] = useState('all'); // all, incomplete, partial, complete
  useEffect(() => {
    loadCompletionData();
  }, [childrenData]);

  const loadCompletionData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (childrenData.length > 0) {
        const childrenIds = childrenData.map(child => child.id);
        const data = await childrenService.getProfileCompletion(childrenIds);
        setCompletionData(data);
      } else {
        setCompletionData(generateMockCompletionData());
      }
    } catch (err) {
      setError(`Errore nel caricamento dei dati: ${err.message}`);
      setCompletionData(generateMockCompletionData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockCompletionData = () => {
    return childrenData.map(child => {
      const completedSections = Math.floor(Math.random() * PROFILE_SECTIONS.length);
      const totalWeight = PROFILE_SECTIONS.reduce((sum, section) => sum + section.weight, 0);
      const completedWeight = PROFILE_SECTIONS.slice(0, completedSections).reduce((sum, section) => sum + section.weight, 0);      const percentage = Math.floor((completedWeight / totalWeight) * 100);
      
      let priorityLevel = 'low';
      if (percentage < 50) {
        priorityLevel = 'high';
      } else if (percentage < 80) {
        priorityLevel = 'medium';
      }
      
      return {
        childId: child.id,
        childName: child.name,
        overallCompletion: percentage,
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        sections: PROFILE_SECTIONS.map((section, index) => ({
          ...section,
          completed: index < completedSections,
          missingFields: index >= completedSections ? section.fields.slice(0, Math.floor(Math.random() * section.fields.length) + 1) : []
        })),
        assignedProfessional: `Dr. ${['Rossi', 'Bianchi', 'Verdi', 'Neri'][Math.floor(Math.random() * 4)]}`,
        priorityLevel
      };
    });
  };

  const getFilteredChildren = () => {
    switch (filter) {
      case 'incomplete':
        return completionData.filter(item => item.overallCompletion < 50);
      case 'partial':
        return completionData.filter(item => item.overallCompletion >= 50 && item.overallCompletion < 90);
      case 'complete':
        return completionData.filter(item => item.overallCompletion >= 90);
      default:
        return completionData;
    }
  };

  const handleSendReminder = async () => {
    try {
      setLoading(true);
      
      await childrenService.sendProfileCompletionReminder(selectedChild.childId, {
        message: reminderMessage,
        professionalId: selectedChild.assignedProfessional
      });
      
      setShowReminderModal(false);
      setReminderMessage('');
      setSelectedChild(null);
      
      if (onSendReminder) {
        onSendReminder(selectedChild.childId);
      }
    } catch (err) {
      setError(`Errore nell'invio del promemoria: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionStats = () => {
    const total = completionData.length;
    const complete = completionData.filter(item => item.overallCompletion >= 90).length;
    const partial = completionData.filter(item => item.overallCompletion >= 50 && item.overallCompletion < 90).length;
    const incomplete = completionData.filter(item => item.overallCompletion < 50).length;
    
    return { total, complete, partial, incomplete };
  };

  const stats = getCompletionStats();
  const filteredChildren = getFilteredChildren();

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Completamento Profili</h3>
          <p className="text-sm text-gray-600">
            Monitoraggio completezza profili bambini ASD
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadCompletionData}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totale Profili</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completi</p>
                <p className="text-2xl font-bold text-green-600">{stats.complete}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Parziali</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.partial}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Incompleti</p>
                <p className="text-2xl font-bold text-red-600">{stats.incomplete}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filtra per:</span>
        {[
          { key: 'all', label: 'Tutti', count: stats.total },
          { key: 'incomplete', label: 'Incompleti', count: stats.incomplete },
          { key: 'partial', label: 'Parziali', count: stats.partial },
          { key: 'complete', label: 'Completi', count: stats.complete }
        ].map(filterOption => (
          <Button
            key={filterOption.key}
            variant={filter === filterOption.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterOption.key)}
          >
            {filterOption.label} ({filterOption.count})
          </Button>
        ))}
      </div>

      {/* Profile Completion List */}
      <div className="space-y-4">
        {filteredChildren.map(childData => {
          const completion = getCompletionLevel(childData.overallCompletion);
          
          return (
            <Card key={childData.childId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{childData.childName}</CardTitle>
                    <Badge variant={completion.variant}>
                      {completion.level}
                    </Badge>
                    {childData.priorityLevel === 'high' && (
                      <Badge variant="destructive">Alta Priorità</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Aggiornato: {new Date(childData.lastUpdated).toLocaleDateString()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedChild(childData);
                        setShowReminderModal(true);
                        setReminderMessage(`Ciao, il profilo di ${childData.childName} necessita di aggiornamenti. Sezioni mancanti: ${childData.sections.filter(s => !s.completed).map(s => s.name).join(', ')}.`);
                      }}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Promemoria
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Completamento</span>
                      <span className="text-sm font-medium">{childData.overallCompletion}%</span>
                    </div>
                    <Progress value={childData.overallCompletion} className="h-2" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    {childData.assignedProfessional}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {childData.sections.map(section => {
                    const IconComponent = section.icon;
                    
                    return (
                      <div
                        key={section.id}
                        className={`p-3 rounded-lg border ${
                          section.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <span className="text-sm font-medium">{section.name}</span>
                          </div>
                          {section.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        
                        {!section.completed && section.missingFields.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <p className="font-medium mb-1">Campi mancanti:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {section.missingFields.map(field => (
                                <li key={field}>{field}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredChildren.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessun profilo trovato per i filtri selezionati</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminder Modal */}
      <Modal
        isOpen={showReminderModal}
        onClose={() => {
          setShowReminderModal(false);
          setSelectedChild(null);
          setReminderMessage('');
        }}
        title={`Invia Promemoria - ${selectedChild?.childName}`}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="reminder-message" className="text-sm font-medium">Messaggio Promemoria</label>
            <Textarea
              id="reminder-message"
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              placeholder="Inserisci il messaggio del promemoria..."
              rows={4}
            />
          </div>
          
          {selectedChild && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Il promemoria verrà inviato a {selectedChild.assignedProfessional} 
                per il completamento del profilo di {selectedChild.childName} 
                ({selectedChild.overallCompletion}% completato).
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowReminderModal(false);
                setSelectedChild(null);
                setReminderMessage('');
              }}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              onClick={handleSendReminder}
              disabled={loading || !reminderMessage.trim()}
            >
              {loading ? 'Invio...' : 'Invia Promemoria'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

ProfileCompletion.propTypes = {
  childrenData: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired
  })),
  onProfileUpdate: PropTypes.func,
  onSendReminder: PropTypes.func
};

ProfileCompletion.defaultProps = {
  childrenData: [],
  onProfileUpdate: () => {},
  onSendReminder: () => {}
};

export default ProfileCompletion;
