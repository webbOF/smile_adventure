/**
 * UserDetailModal.jsx
 * Modal dettagliato per visualizzazione e gestione utente singolo
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Alert, AlertDescription } from '../ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Activity,
  Edit,
  Save,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  History
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import adminService from '../../services/adminService';

const UserDetailModal = ({ isOpen, onClose, user, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [activityLogs, setActivityLogs] = useState([]);
  
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
    status: '',
    specialization: '',
    clinic_name: '',
    clinic_address: ''
  });

  useEffect(() => {
    if (user && isOpen) {
      setEditData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        role: user.role || '',
        status: user.status || '',
        specialization: user.specialization || '',
        clinic_name: user.clinic_name || '',
        clinic_address: user.clinic_address || ''
      });
      setError('');
      setSuccess('');
      setIsEditing(false);
      
      // Load activity logs if tab is active
      if (activeTab === 'activity') {
        loadActivityLogs();
      }
    }
  }, [user, isOpen, activeTab]);

  const loadActivityLogs = async () => {
    if (!user?.id) return;
    
    try {
      const logs = await adminService.getUserActivityLogs(user.id, 30);
      setActivityLogs(logs);
    } catch (err) {
      console.error('Error loading activity logs:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate required fields
      if (!editData.first_name.trim() || !editData.last_name.trim()) {
        setError('Nome e cognome sono obbligatori');
        return;
      }
      
      // Update user via admin service
      const updatedUser = await adminService.updateUserProfile(user.id, editData);
      
      setSuccess('Utente aggiornato con successo!');
      setIsEditing(false);
      
      // Notify parent component
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Errore durante l\'aggiornamento. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await adminService.updateUserStatus(user.id, newStatus);
      setSuccess(`Status utente aggiornato a ${newStatus}`);
      
      if (onUserUpdate) {
        onUserUpdate({ ...user, status: newStatus });
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Errore durante l\'aggiornamento dello status.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: it 
      });
    } catch {
      return 'Data non valida';
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      ADMIN: 'destructive',
      PROFESSIONAL: 'default',
      PARENT: 'secondary'
    };
    
    const labels = {
      ADMIN: 'Admin',
      PROFESSIONAL: 'Professionista',
      PARENT: 'Genitore'
    };

    return (
      <Badge variant={variants[role] || 'outline'}>
        {labels[role] || role}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      suspended: 'destructive',
      pending: 'warning'
    };

    const labels = {
      active: 'Attivo',
      inactive: 'Inattivo', 
      suspended: 'Sospeso',
      pending: 'In attesa'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (!user) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Dettagli Utente - ${user.first_name} ${user.last_name}`}
      size="large"
    >
      <div className="space-y-6">
        {/* Alerts */}
        {error && (
          <Alert className="border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Header with Avatar and Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifica
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salva
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annulla
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profilo</TabsTrigger>
            <TabsTrigger value="professional">Professionale</TabsTrigger>
            <TabsTrigger value="activity">Attività</TabsTrigger>
            <TabsTrigger value="actions">Azioni</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="inline w-4 h-4 mr-1" />
                  Nome
                </label>
                {isEditing ? (
                  <Input
                    value={editData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Nome"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{user.first_name}</p>
                )}
              </div>

              {/* Cognome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="inline w-4 h-4 mr-1" />
                  Cognome
                </label>
                {isEditing ? (
                  <Input
                    value={editData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Cognome"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{user.last_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email
                </label>
                <p className="p-2 bg-gray-50 rounded">{user.email}</p>
                <span className="text-xs text-gray-500">Email non modificabile</span>
              </div>

              {/* Telefono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Telefono
                </label>
                {isEditing ? (
                  <Input
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Telefono"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{user.phone || 'Non specificato'}</p>
                )}
              </div>

              {/* Ruolo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Shield className="inline w-4 h-4 mr-1" />
                  Ruolo
                </label>
                {isEditing ? (
                  <select
                    value={editData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PARENT">Genitore</option>
                    <option value="PROFESSIONAL">Professionista</option>
                    <option value="ADMIN">Amministratore</option>
                  </select>
                ) : (
                  <div className="p-2">{getRoleBadge(user.role)}</div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Activity className="inline w-4 h-4 mr-1" />
                  Status
                </label>
                <div className="p-2">{getStatusBadge(user.status)}</div>
              </div>
            </div>

            {/* Date info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Registrato
                </label>
                <p className="text-sm text-gray-600">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Ultimo accesso
                </label>
                <p className="text-sm text-gray-600">
                  {user.last_login ? formatDate(user.last_login) : 'Mai'}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional" className="space-y-4">
            {user.role === 'PROFESSIONAL' ? (
              <div className="grid grid-cols-1 gap-4">
                {/* Specializzazione */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specializzazione
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      placeholder="Specializzazione medica"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded">
                      {user.specialization || 'Non specificata'}
                    </p>
                  )}
                </div>

                {/* Clinica */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Clinica
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.clinic_name}
                      onChange={(e) => handleInputChange('clinic_name', e.target.value)}
                      placeholder="Nome della clinica"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded">
                      {user.clinic_name || 'Non specificata'}
                    </p>
                  )}
                </div>

                {/* Indirizzo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Indirizzo Clinica
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.clinic_address}
                      onChange={(e) => handleInputChange('clinic_address', e.target.value)}
                      placeholder="Indirizzo completo della clinica"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded">
                      {user.clinic_address || 'Non specificato'}
                    </p>
                  )}
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numero Licenza
                  </label>
                  <p className="p-2 bg-gray-50 rounded">
                    {user.license_number || 'Non specificato'}
                  </p>
                  <span className="text-xs text-gray-500">
                    Numero licenza non modificabile
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Informazioni professionali disponibili solo per utenti professionisti</p>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <History className="w-4 h-4 mr-2" />
                Attività Recenti (ultimi 30 giorni)
              </h4>
              
              {activityLogs.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activityLogs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-gray-500">{log.details}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nessuna attività registrata di recente</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Azioni Account</h4>
              
              <div className="space-y-3">
                {user.status === 'active' ? (
                  <>
                    <Button
                      onClick={() => handleStatusChange('suspended')}
                      variant="outline"
                      className="w-full justify-start border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      disabled={loading}
                    >
                      Sospendi Account
                    </Button>
                    <Button
                      onClick={() => handleStatusChange('inactive')}
                      variant="outline"
                      className="w-full justify-start border-gray-300"
                      disabled={loading}
                    >
                      Disattiva Account
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleStatusChange('active')}
                    variant="outline"
                    className="w-full justify-start border-green-300 text-green-700 hover:bg-green-50"
                    disabled={loading}
                  >
                    Attiva Account
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50"                  onClick={() => {
                    // Implement password reset
                    alert('Password reset functionality would be implemented here');
                  }}
                  disabled={loading}
                >
                  Reset Password
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
};

UserDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string,
    role: PropTypes.string.isRequired,
    status: PropTypes.string,
    created_at: PropTypes.string,
    last_login: PropTypes.string,
    specialization: PropTypes.string,
    clinic_name: PropTypes.string,
    clinic_address: PropTypes.string,
    license_number: PropTypes.string
  }),
  onUserUpdate: PropTypes.func
};

UserDetailModal.defaultProps = {
  user: null,
  onUserUpdate: null
};

export default UserDetailModal;
