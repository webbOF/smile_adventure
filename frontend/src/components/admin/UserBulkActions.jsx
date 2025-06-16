/**
 * UserBulkActions.jsx
 * Componente per operazioni multiple avanzate sugli utenti
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Alert, AlertDescription } from '../ui/Alert';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Textarea';
import { 
  Users, 
  Mail, 
  UserCheck, 
  UserX, 
  Shield, 
  AlertTriangle,
  Send,
  Download,
  CheckCircle2,
  X
} from 'lucide-react';
import adminService from '../../services/adminService';

const BULK_ACTIONS = {
  UPDATE_ROLE: 'update_role',
  UPDATE_STATUS: 'update_status',
  SEND_EMAIL: 'send_email',
  EXPORT_DATA: 'export_data',
  DELETE_USERS: 'delete_users'
};

const USER_ROLES = [
  { value: 'admin', label: 'Amministratore' },
  { value: 'professional', label: 'Professionista' },
  { value: 'parent', label: 'Genitore' }
];

const USER_STATUSES = [
  { value: 'active', label: 'Attivo' },
  { value: 'inactive', label: 'Inattivo' },
  { value: 'suspended', label: 'Sospeso' },
  { value: 'pending', label: 'In attesa' }
];

const EMAIL_TEMPLATES = [
  { value: 'welcome', label: 'Messaggio di benvenuto' },
  { value: 'verification', label: 'Verifica email' },
  { value: 'notification', label: 'Notifica generale' },
  { value: 'custom', label: 'Messaggio personalizzato' }
];

const UserBulkActions = ({ selectedUsers, onActionComplete, onClearSelection }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Action-specific state
  const [bulkRole, setBulkRole] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailMessage, setCustomEmailMessage] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');

  const selectedCount = selectedUsers.length;

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setError('');
    setSuccess('');
    
    // Reset action-specific state
    setBulkRole('');
    setBulkStatus('');
    setEmailTemplate('');
    setCustomEmailSubject('');
    setCustomEmailMessage('');
    setExportFormat('csv');
  };

  const validateAction = () => {
    switch (selectedAction) {
      case BULK_ACTIONS.UPDATE_ROLE:
        return bulkRole !== '';
      case BULK_ACTIONS.UPDATE_STATUS:
        return bulkStatus !== '';
      case BULK_ACTIONS.SEND_EMAIL:
        if (emailTemplate === 'custom') {
          return customEmailSubject.trim() !== '' && customEmailMessage.trim() !== '';
        }
        return emailTemplate !== '';
      case BULK_ACTIONS.EXPORT_DATA:
      case BULK_ACTIONS.DELETE_USERS:
        return true;
      default:
        return false;
    }
  };

  const getActionDescription = () => {
    switch (selectedAction) {
      case BULK_ACTIONS.UPDATE_ROLE:
        return `Aggiornare il ruolo di ${selectedCount} utenti a "${USER_ROLES.find(r => r.value === bulkRole)?.label}"`;
      case BULK_ACTIONS.UPDATE_STATUS:
        return `Aggiornare lo status di ${selectedCount} utenti a "${USER_STATUSES.find(s => s.value === bulkStatus)?.label}"`;      case BULK_ACTIONS.SEND_EMAIL: {
        const templateLabel = EMAIL_TEMPLATES.find(t => t.value === emailTemplate)?.label;
        return `Inviare email "${templateLabel}" a ${selectedCount} utenti`;
      }
      case BULK_ACTIONS.EXPORT_DATA:
        return `Esportare i dati di ${selectedCount} utenti in formato ${exportFormat.toUpperCase()}`;
      case BULK_ACTIONS.DELETE_USERS:
        return `ELIMINARE definitivamente ${selectedCount} utenti`;
      default:
        return '';
    }
  };

  const executeAction = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userIds = selectedUsers.map(user => user.id);
      let result;

      switch (selectedAction) {
        case BULK_ACTIONS.UPDATE_ROLE:
          result = await adminService.bulkUpdateUserRole(userIds, bulkRole);
          break;
          
        case BULK_ACTIONS.UPDATE_STATUS:
          result = await adminService.bulkUpdateUserStatus(userIds, bulkStatus);
          break;
            case BULK_ACTIONS.SEND_EMAIL: {
          const emailData = {
            template: emailTemplate,
            subject: emailTemplate === 'custom' ? customEmailSubject : undefined,
            message: emailTemplate === 'custom' ? customEmailMessage : undefined
          };
          result = await adminService.bulkSendEmail(userIds, emailData);
          break;
        }
          
        case BULK_ACTIONS.EXPORT_DATA:
          result = await adminService.exportUserData(userIds, exportFormat);
          // Trigger download
          if (result.downloadUrl) {
            const link = document.createElement('a');
            link.href = result.downloadUrl;
            link.download = result.filename || `users_export_${Date.now()}.${exportFormat}`;
            link.click();
          }
          break;
          
        case BULK_ACTIONS.DELETE_USERS:
          result = await adminService.bulkDeleteUsers(userIds);
          break;
          
        default:
          throw new Error('Azione non supportata');
      }

      setSuccess(`Operazione completata con successo: ${result.message || 'OK'}`);
      setShowConfirmModal(false);
      onActionComplete();
      onClearSelection();
      
    } catch (err) {
      setError(`Errore durante l'operazione: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!validateAction()) {
      setError('Configurazione dell\'azione incompleta');
      return;
    }
    setShowConfirmModal(true);
  };

  if (selectedCount === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-gray-500">
            <Users className="w-5 h-5 mr-2" />
            <span>Seleziona utenti per abilitare le operazioni multiple</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Operazioni Multiple ({selectedCount} utenti selezionati)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">            {/* Action Selection */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Seleziona Azione</div>
              <Select onValueChange={handleActionSelect} value={selectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Scegli un'azione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BULK_ACTIONS.UPDATE_ROLE}>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Aggiorna Ruolo
                    </div>
                  </SelectItem>
                  <SelectItem value={BULK_ACTIONS.UPDATE_STATUS}>
                    <div className="flex items-center">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Aggiorna Status
                    </div>
                  </SelectItem>
                  <SelectItem value={BULK_ACTIONS.SEND_EMAIL}>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Invia Email
                    </div>
                  </SelectItem>
                  <SelectItem value={BULK_ACTIONS.EXPORT_DATA}>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Esporta Dati
                    </div>
                  </SelectItem>
                  <SelectItem value={BULK_ACTIONS.DELETE_USERS}>
                    <div className="flex items-center">
                      <UserX className="w-4 h-4 mr-2 text-red-500" />
                      Elimina Utenti
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Configuration */}
            <div className="space-y-2">              {selectedAction === BULK_ACTIONS.UPDATE_ROLE && (
                <>
                  <div className="text-sm font-medium">Nuovo Ruolo</div>
                  <Select onValueChange={setBulkRole} value={bulkRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona ruolo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {selectedAction === BULK_ACTIONS.UPDATE_STATUS && (
                <>
                  <div className="text-sm font-medium">Nuovo Status</div>
                  <Select onValueChange={setBulkStatus} value={bulkStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {selectedAction === BULK_ACTIONS.SEND_EMAIL && (
                <>
                  <div className="text-sm font-medium">Template Email</div>
                  <Select onValueChange={setEmailTemplate} value={emailTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TEMPLATES.map(template => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {selectedAction === BULK_ACTIONS.EXPORT_DATA && (
                <>
                  <div className="text-sm font-medium">Formato Export</div>
                  <Select onValueChange={setExportFormat} value={exportFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona formato..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>

          {/* Custom Email Fields */}
          {selectedAction === BULK_ACTIONS.SEND_EMAIL && emailTemplate === 'custom' && (
            <div className="space-y-4 border-t pt-4">              <div>
                <label htmlFor="customEmailSubject" className="text-sm font-medium">Oggetto Email</label>
                <Input
                  id="customEmailSubject"
                  value={customEmailSubject}
                  onChange={(e) => setCustomEmailSubject(e.target.value)}
                  placeholder="Inserisci l'oggetto dell'email..."
                />
              </div>
              <div>
                <label htmlFor="customEmailMessage" className="text-sm font-medium">Messaggio</label>
                <Textarea
                  id="customEmailMessage"
                  value={customEmailMessage}
                  onChange={(e) => setCustomEmailMessage(e.target.value)}
                  placeholder="Inserisci il messaggio dell'email..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClearSelection}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Deseleziona Tutto
            </Button>

            <Button
              onClick={handleConfirm}
              disabled={!selectedAction || loading}
              variant={selectedAction === BULK_ACTIONS.DELETE_USERS ? "destructive" : "default"}
            >
              {loading ? (
                'Elaborazione...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Esegui Azione
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Conferma Operazione"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <div>
              <p className="font-medium">Confermi di voler procedere?</p>
              <p className="text-sm text-gray-600 mt-1">
                {getActionDescription()}
              </p>
            </div>
          </div>

          {selectedAction === BULK_ACTIONS.DELETE_USERS && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Attenzione:</strong> Questa operazione eliminerà definitivamente gli utenti selezionati e non può essere annullata.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              onClick={executeAction}
              disabled={loading}
              variant={selectedAction === BULK_ACTIONS.DELETE_USERS ? "destructive" : "default"}
            >
              {loading ? 'Elaborazione...' : 'Conferma'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

UserBulkActions.propTypes = {
  selectedUsers: PropTypes.array.isRequired,
  onActionComplete: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired
};

export default UserBulkActions;
