/**
 * BulkManagement.jsx
 * Gestione operazioni multiple sui profili bambini ASD
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Input } from '../ui/Input';
import { Alert, AlertDescription } from '../ui/Alert';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { 
  Users, 
  UserCheck, 
  Award, 
  Brain,
  Heart,
  Activity,
  BookOpen,
  MessageSquare,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Search
} from 'lucide-react';
import childrenService from '../../services/childrenService';

const BULK_OPERATIONS = {
  UPDATE_LEVEL: 'update_level',
  ASSIGN_PROFESSIONAL: 'assign_professional',
  UPDATE_SUPPORT_LEVEL: 'update_support_level',
  ADD_POINTS: 'add_points',
  UPDATE_COMMUNICATION: 'update_communication',
  EXPORT_PROFILES: 'export_profiles',
  GENERATE_REPORTS: 'generate_reports'
};

const SUPPORT_LEVELS = [
  { value: 1, label: 'Livello 1 - Supporto Richiesto', color: 'green' },
  { value: 2, label: 'Livello 2 - Supporto Sostanziale', color: 'yellow' },
  { value: 3, label: 'Livello 3 - Supporto Molto Sostanziale', color: 'red' }
];

const COMMUNICATION_STYLES = [
  { value: 'verbal', label: 'Verbale' },
  { value: 'non_verbal', label: 'Non Verbale' },
  { value: 'mixed', label: 'Misto' },
  { value: 'device_assisted', label: 'Assistito da Dispositivi' }
];

const BulkManagement = ({ selectedChildren, onActionComplete, onClearSelection }) => {
  const [selectedOperation, setSelectedOperation] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Operation-specific state
  const [newLevel, setNewLevel] = useState('');
  const [newSupportLevel, setNewSupportLevel] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [newCommunicationStyle, setNewCommunicationStyle] = useState('');
  const [communicationNotes, setCommunicationNotes] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');
  
  // Children data processing
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [ageFilter, setAgeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCount = selectedChildren.length;

  useEffect(() => {
    applyFilters();
  }, [selectedChildren, ageFilter, levelFilter, searchTerm]);

  const applyFilters = () => {
    let filtered = [...selectedChildren];

    if (ageFilter) {
      const [minAge, maxAge] = ageFilter.split('-').map(Number);
      filtered = filtered.filter(child => {
        const age = child.age;
        return age >= minAge && age <= maxAge;
      });
    }

    if (levelFilter) {
      filtered = filtered.filter(child => child.level === parseInt(levelFilter));
    }

    if (searchTerm) {
      filtered = filtered.filter(child => 
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredChildren(filtered);
  };

  const resetOperationState = () => {
    setNewLevel('');
    setNewSupportLevel('');
    setProfessionalId('');
    setPointsToAdd('');
    setPointsReason('');
    setNewCommunicationStyle('');
    setCommunicationNotes('');
    setExportFormat('pdf');
  };

  const handleOperationSelect = (operation) => {
    setSelectedOperation(operation);
    setError('');
    setSuccess('');
    resetOperationState();
  };

  const validateOperation = () => {
    switch (selectedOperation) {
      case BULK_OPERATIONS.UPDATE_LEVEL:
        return newLevel !== '' && parseInt(newLevel) >= 1 && parseInt(newLevel) <= 10;
      case BULK_OPERATIONS.UPDATE_SUPPORT_LEVEL:
        return newSupportLevel !== '';
      case BULK_OPERATIONS.ASSIGN_PROFESSIONAL:
        return professionalId !== '';
      case BULK_OPERATIONS.ADD_POINTS:
        return pointsToAdd !== '' && parseInt(pointsToAdd) > 0 && pointsReason.trim() !== '';
      case BULK_OPERATIONS.UPDATE_COMMUNICATION:
        return newCommunicationStyle !== '';
      case BULK_OPERATIONS.EXPORT_PROFILES:
      case BULK_OPERATIONS.GENERATE_REPORTS:
        return true;
      default:
        return false;
    }
  };

  const getOperationDescription = () => {
    const count = filteredChildren.length;
    switch (selectedOperation) {
      case BULK_OPERATIONS.UPDATE_LEVEL:
        return `Aggiornare il livello di ${count} bambini al livello ${newLevel}`;
      case BULK_OPERATIONS.UPDATE_SUPPORT_LEVEL: {
        const supportLabel = SUPPORT_LEVELS.find(s => s.value === parseInt(newSupportLevel))?.label;
        return `Aggiornare il livello di supporto di ${count} bambini a "${supportLabel}"`;
      }
      case BULK_OPERATIONS.ASSIGN_PROFESSIONAL:
        return `Assegnare un professionista a ${count} bambini`;
      case BULK_OPERATIONS.ADD_POINTS:
        return `Aggiungere ${pointsToAdd} punti a ${count} bambini per "${pointsReason}"`;
      case BULK_OPERATIONS.UPDATE_COMMUNICATION: {
        const commLabel = COMMUNICATION_STYLES.find(c => c.value === newCommunicationStyle)?.label;
        return `Aggiornare lo stile di comunicazione di ${count} bambini a "${commLabel}"`;
      }
      case BULK_OPERATIONS.EXPORT_PROFILES:
        return `Esportare i profili completi di ${count} bambini in formato ${exportFormat.toUpperCase()}`;
      case BULK_OPERATIONS.GENERATE_REPORTS:
        return `Generare report di progresso per ${count} bambini`;
      default:
        return '';
    }
  };

  const executeOperation = async () => {
    try {
      setLoading(true);
      setError('');
      
      const childrenIds = filteredChildren.map(child => child.id);
      let result;

      switch (selectedOperation) {
        case BULK_OPERATIONS.UPDATE_LEVEL: {
          result = await childrenService.bulkUpdateLevel(childrenIds, parseInt(newLevel));
          break;
        }
        
        case BULK_OPERATIONS.UPDATE_SUPPORT_LEVEL: {
          result = await childrenService.bulkUpdateSupportLevel(childrenIds, parseInt(newSupportLevel));
          break;
        }
        
        case BULK_OPERATIONS.ASSIGN_PROFESSIONAL: {
          result = await childrenService.bulkAssignProfessional(childrenIds, professionalId);
          break;
        }
        
        case BULK_OPERATIONS.ADD_POINTS: {
          result = await childrenService.bulkAddPoints(childrenIds, {
            points: parseInt(pointsToAdd),
            reason: pointsReason
          });
          break;
        }
        
        case BULK_OPERATIONS.UPDATE_COMMUNICATION: {
          result = await childrenService.bulkUpdateCommunication(childrenIds, {
            communication_style: newCommunicationStyle,
            communication_notes: communicationNotes
          });
          break;
        }
        
        case BULK_OPERATIONS.EXPORT_PROFILES: {
          result = await childrenService.exportChildrenProfiles(childrenIds, exportFormat);
          if (result.downloadUrl) {
            const link = document.createElement('a');
            link.href = result.downloadUrl;
            link.download = result.filename || `children_profiles_${Date.now()}.${exportFormat}`;
            link.click();
          }
          break;
        }
        
        case BULK_OPERATIONS.GENERATE_REPORTS: {
          result = await childrenService.generateProgressReports(childrenIds);
          if (result.downloadUrl) {
            const link = document.createElement('a');
            link.href = result.downloadUrl;
            link.download = result.filename || `progress_reports_${Date.now()}.pdf`;
            link.click();
          }
          break;
        }
        
        default:
          throw new Error('Operazione non supportata');
      }

      setSuccess(`Operazione completata con successo: ${result.message || 'OK'}`);
      setShowConfirmModal(false);
      onActionComplete();
      
    } catch (err) {
      setError(`Errore durante l'operazione: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getOperationIcon = (operation) => {
    switch (operation) {
      case BULK_OPERATIONS.UPDATE_LEVEL:
        return <Award className="w-4 h-4" />;
      case BULK_OPERATIONS.UPDATE_SUPPORT_LEVEL:
        return <Heart className="w-4 h-4" />;
      case BULK_OPERATIONS.ASSIGN_PROFESSIONAL:
        return <UserCheck className="w-4 h-4" />;
      case BULK_OPERATIONS.ADD_POINTS:
        return <Brain className="w-4 h-4" />;
      case BULK_OPERATIONS.UPDATE_COMMUNICATION:
        return <MessageSquare className="w-4 h-4" />;
      case BULK_OPERATIONS.EXPORT_PROFILES:
        return <Download className="w-4 h-4" />;
      case BULK_OPERATIONS.GENERATE_REPORTS:
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const renderOperationForm = () => {
    switch (selectedOperation) {
      case BULK_OPERATIONS.UPDATE_LEVEL:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="new-level" className="text-sm font-medium">Nuovo Livello Gioco (1-10)</label>
              <Input
                id="new-level"
                type="number"
                min="1"
                max="10"
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                placeholder="Inserisci nuovo livello"
              />
            </div>
          </div>
        );

      case BULK_OPERATIONS.UPDATE_SUPPORT_LEVEL:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="support-level" className="text-sm font-medium">Livello di Supporto DSM-5</label>
              <Select value={newSupportLevel} onValueChange={setNewSupportLevel}>
                <SelectTrigger id="support-level">
                  <SelectValue placeholder="Seleziona livello di supporto" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORT_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      <div className="flex items-center gap-2">
                        <Badge variant={level.color} className="w-2 h-2 rounded-full" />
                        {level.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case BULK_OPERATIONS.ASSIGN_PROFESSIONAL:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="professional-id" className="text-sm font-medium">ID Professionista</label>
              <Input
                id="professional-id"
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                placeholder="Inserisci ID del professionista"
              />
            </div>
          </div>
        );

      case BULK_OPERATIONS.ADD_POINTS:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="points-to-add" className="text-sm font-medium">Punti da Aggiungere</label>
              <Input
                id="points-to-add"
                type="number"
                min="1"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                placeholder="Numero di punti"
              />
            </div>
            <div>
              <label htmlFor="points-reason" className="text-sm font-medium">Motivo</label>
              <Textarea
                id="points-reason"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="Motivo dell'assegnazione punti"
                rows={3}
              />
            </div>
          </div>
        );

      case BULK_OPERATIONS.UPDATE_COMMUNICATION:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="communication-style" className="text-sm font-medium">Stile Comunicazione</label>
              <Select value={newCommunicationStyle} onValueChange={setNewCommunicationStyle}>
                <SelectTrigger id="communication-style">
                  <SelectValue placeholder="Seleziona stile di comunicazione" />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNICATION_STYLES.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="communication-notes" className="text-sm font-medium">Note Aggiuntive</label>
              <Textarea
                id="communication-notes"
                value={communicationNotes}
                onChange={(e) => setCommunicationNotes(e.target.value)}
                placeholder="Note sulla comunicazione"
                rows={3}
              />
            </div>
          </div>
        );

      case BULK_OPERATIONS.EXPORT_PROFILES:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="export-format" className="text-sm font-medium">Formato Export</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case BULK_OPERATIONS.GENERATE_REPORTS:
        return (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Verranno generati report di progresso dettagliati per tutti i bambini selezionati.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  if (selectedCount === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Seleziona alcuni bambini per abilitare le operazioni multiple</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestione Operazioni Multiple
            <Badge variant="secondary">{selectedCount} bambini selezionati</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search-children" className="text-sm font-medium">Cerca Bambini</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search-children"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome o diagnosi..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="age-filter" className="text-sm font-medium">Fascia Età</label>
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger id="age-filter">
                  <SelectValue placeholder="Tutte le età" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutte le età</SelectItem>
                  <SelectItem value="3-6">3-6 anni</SelectItem>
                  <SelectItem value="7-10">7-10 anni</SelectItem>
                  <SelectItem value="11-14">11-14 anni</SelectItem>
                  <SelectItem value="15-18">15-18 anni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="level-filter" className="text-sm font-medium">Livello Gioco</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger id="level-filter">
                  <SelectValue placeholder="Tutti i livelli" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutti i livelli</SelectItem>
                  {[1,2,3,4,5,6,7,8,9,10].map(level => (
                    <SelectItem key={level} value={level.toString()}>
                      Livello {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredChildren.length} di {selectedCount} bambini filtrati
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
            >
              <X className="w-4 h-4 mr-1" />
              Deseleziona Tutto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Operation Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Seleziona Operazione</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="operation-select" className="text-sm font-medium">Seleziona Operazione</label>
            <Select value={selectedOperation} onValueChange={handleOperationSelect}>
              <SelectTrigger id="operation-select">
                <SelectValue placeholder="Scegli un'operazione da eseguire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BULK_OPERATIONS.UPDATE_LEVEL}>
                  <div className="flex items-center gap-2">
                    {getOperationIcon(BULK_OPERATIONS.UPDATE_LEVEL)}
                    Aggiorna Livello Gioco
                  </div>
                </SelectItem>
                <SelectItem value={BULK_OPERATIONS.UPDATE_SUPPORT_LEVEL}>
                  <div className="flex items-center gap-2">
                    {getOperationIcon(BULK_OPERATIONS.UPDATE_SUPPORT_LEVEL)}
                    Aggiorna Livello Supporto DSM-5
                  </div>
                </SelectItem>
                <SelectItem value={BULK_OPERATIONS.ASSIGN_PROFESSIONAL}>
                  <div className="flex items-center gap-2">
                    {getOperationIcon(BULK_OPERATIONS.ASSIGN_PROFESSIONAL)}
                    Assegna Professionista
                  </div>
                </SelectItem>
                <SelectItem value={BULK_OPERATIONS.ADD_POINTS}>
                  <div className="flex items-center gap-2">
                    {getOperationIcon(BULK_OPERATIONS.ADD_POINTS)}
                    Aggiungi Punti
                  </div>
                </SelectItem>
                <SelectItem value={BULK_OPERATIONS.UPDATE_COMMUNICATION}>
                  <div className="flex items-center gap-2">
                    {getOperationIcon(BULK_OPERATIONS.UPDATE_COMMUNICATION)}
                    Aggiorna Comunicazione
                  </div>
                </SelectItem>
                <SelectItem value={BULK_OPERATIONS.EXPORT_PROFILES}>
                  <div className="flex items-center gap-2">
                    {getOperationIcon(BULK_OPERATIONS.EXPORT_PROFILES)}
                    Esporta Profili
                  </div>
                </SelectItem>
                <SelectItem value={BULK_OPERATIONS.GENERATE_REPORTS}>
                  <div className="flex items-center gap-2">
                    {getOperationIcon(BULK_OPERATIONS.GENERATE_REPORTS)}
                    Genera Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedOperation && renderOperationForm()}

          {selectedOperation && (
            <div className="pt-4">
              <Button
                onClick={() => setShowConfirmModal(true)}
                disabled={!validateOperation()}
                className="w-full"
              >
                {getOperationIcon(selectedOperation)}
                <span className="ml-2">Esegui Operazione</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Conferma Operazione"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Sei sicuro di voler procedere con questa operazione?
          </p>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getOperationDescription()}
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              onClick={executeOperation}
              disabled={loading}
            >
              {loading ? 'Eseguendo...' : 'Conferma'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

BulkManagement.propTypes = {
  selectedChildren: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    age: PropTypes.number,
    level: PropTypes.number,
    diagnosis: PropTypes.string
  })).isRequired,
  onActionComplete: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired
};

export default BulkManagement;
