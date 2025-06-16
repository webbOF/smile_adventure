/**
 * EmailVerificationStatus.jsx
 * Indicatore dello status di verifica email dell'utente
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertDescription } from '../ui/Alert';
import { Button } from '../ui/Button';
import { CheckCircle, AlertCircle, Mail, Loader2 } from 'lucide-react';
import authService from '../../services/authService';

const EmailVerificationStatus = ({ user, showActions = true, className = '' }) => {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  const isVerified = user?.email_verified || false;

  const handleResendVerification = async () => {
    if (!user?.id) return;

    try {
      setIsResending(true);
      setMessage('');
      
      await authService.resendVerificationEmail(user.id);
      setMessage('Email di verifica inviata! Controlla la tua casella di posta.');
    } catch (error) {
      console.error('Error resending verification email:', error);
      setMessage('Errore durante l\'invio. Riprova più tardi.');
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Email verificata con successo
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">Email non verificata</p>
              <p className="text-sm mt-1">
                Verifica il tuo indirizzo email per accedere a tutte le funzionalità.
              </p>
            </div>
            {showActions && (
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                size="sm"
                variant="outline"
                className="ml-3 flex-shrink-0 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Invio...
                  </>
                ) : (
                  <>
                    <Mail className="mr-1 h-3 w-3" />
                    Reinvia
                  </>
                )}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {message && (
        <Alert className={message.includes('Errore') ? 'border-red-200' : 'border-blue-200'}>
          <AlertDescription className={message.includes('Errore') ? 'text-red-800' : 'text-blue-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

EmailVerificationStatus.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    email: PropTypes.string,
    email_verified: PropTypes.bool
  }),
  showActions: PropTypes.bool,
  className: PropTypes.string
};

EmailVerificationStatus.defaultProps = {
  user: null,
  showActions: true,
  className: ''
};

export default EmailVerificationStatus;
