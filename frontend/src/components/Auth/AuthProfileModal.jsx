/**
 * AuthProfileModal.jsx
 * Modal per aggiornamento profilo utente tramite endpoint auth
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert, AlertDescription } from '../ui/Alert';
import { Loader2, User, Mail, Phone, Globe, Clock } from 'lucide-react';
import authService from '../../services/authService';

const AuthProfileModal = ({ isOpen, onClose, currentUser, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    timezone: 'UTC',
    language: 'it'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser && isOpen) {
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        phone: currentUser.phone || '',
        timezone: currentUser.timezone || 'UTC',
        language: currentUser.language || 'it'
      });
      setError('');
      setSuccess('');
    }
  }, [currentUser, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('Il nome è obbligatorio');
      return false;
    }
    if (!formData.last_name.trim()) {
      setError('Il cognome è obbligatorio');
      return false;
    }
    if (formData.phone && !/^[+]?[0-9\s-()]+$/.test(formData.phone)) {
      setError('Formato telefono non valido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Prepare data excluding empty values
      const updateData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value && value.trim() !== '') {
          acc[key] = value.trim();
        }
        return acc;
      }, {});
      
      const updatedUser = await authService.updateProfileViaAuth(updateData);
      
      setSuccess('Profilo aggiornato con successo!');
      
      // Call success callback with updated user data
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedUser);
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
      
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response?.status === 400) {
        setError(error.response.data.detail || 'Dati non validi');
      } else if (error.response?.status === 401) {
        setError('Sessione scaduta. Effettua nuovamente il login.');
      } else {
        setError('Errore durante l\'aggiornamento. Riprova più tardi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      setSuccess('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Aggiorna Profilo">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert className="border-red-200">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="inline w-4 h-4 mr-1" />
              Nome *
            </label>
            <Input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              placeholder="Inserisci il tuo nome"
              required
              disabled={isLoading}
            />
          </div>

          {/* Cognome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="inline w-4 h-4 mr-1" />
              Cognome *
            </label>
            <Input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              placeholder="Inserisci il tuo cognome"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="inline w-4 h-4 mr-1" />
            Email
          </label>
          <Input
            type="email"
            value={currentUser?.email || ''}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            L'email non può essere modificata da qui
          </p>
        </div>

        {/* Telefono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="inline w-4 h-4 mr-1" />
            Telefono
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+39 123 456 7890"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="inline w-4 h-4 mr-1" />
              Fuso Orario
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="Europe/Rome">Europa/Roma</option>
              <option value="Europe/London">Europa/Londra</option>
              <option value="America/New_York">America/New York</option>
              <option value="America/Los_Angeles">America/Los Angeles</option>
            </select>
          </div>

          {/* Lingua */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe className="inline w-4 h-4 mr-1" />
              Lingua
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aggiornamento...
              </>
            ) : (
              'Aggiorna Profilo'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

AuthProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    email: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    phone: PropTypes.string,
    timezone: PropTypes.string,
    language: PropTypes.string
  }),
  onUpdateSuccess: PropTypes.func
};

AuthProfileModal.defaultProps = {
  currentUser: null,
  onUpdateSuccess: null
};

export default AuthProfileModal;
