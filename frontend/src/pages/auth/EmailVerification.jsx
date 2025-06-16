/**
 * EmailVerification.jsx
 * Pagina per la verifica dell'indirizzo email dell'utente
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import authService from '../../services/authService';

const EmailVerification = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading, success, error, expired
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (userId && token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Link di verifica non valido. Parametri mancanti.');
    }
  }, [userId, token]);

  const verifyEmail = async () => {
    try {
      setStatus('loading');
      const response = await authService.verifyEmail(userId, token);
      
      if (response.verified) {
        setStatus('success');
        setMessage(response.message || 'Email verificata con successo!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Email verificata! Ora puoi effettuare il login.' }
          });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.message || 'Verifica email fallita.');
      }
    } catch (error) {
      setStatus('error');
      if (error.response?.status === 400) {
        setMessage('Token di verifica non valido o scaduto.');
      } else if (error.response?.status === 404) {
        setMessage('Utente non trovato.');
      } else {
        setMessage('Errore durante la verifica. Riprova più tardi.');
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      await authService.resendVerificationEmail(userId);
      setMessage('Email di verifica rinviata! Controlla la tua casella di posta.');    } catch (error) {
      console.error('Error resending verification email:', error);
      setMessage('Errore durante l\'invio dell\'email. Riprova più tardi.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-600" />;
      default:
        return <Mail className="h-16 w-16 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verifica Email
          </h1>
          <p className="text-gray-600">
            Stiamo verificando il tuo indirizzo email...
          </p>
        </div>

        <Card className={`${getStatusColor()}`}>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {getStatusIcon()}
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {status === 'loading' && 'Verifica in corso...'}
                  {status === 'success' && 'Email Verificata!'}
                  {status === 'error' && 'Verifica Fallita'}
                </h3>
                
                {message && (
                  <Alert className={status === 'error' ? 'border-red-200' : 'border-green-200'}>
                    <AlertDescription>
                      {message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {status === 'success' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Verrai reindirizzato al login automaticamente...
                  </p>
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    Vai al Login
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-3">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Invio in corso...
                      </>
                    ) : (
                      'Rinvia Email di Verifica'
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/login')}
                    variant="ghost"
                    className="w-full"
                  >
                    Torna al Login
                  </Button>
                </div>
              )}

              {status === 'loading' && (
                <p className="text-sm text-gray-500">
                  Attendere, non chiudere questa pagina...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Problemi con la verifica?{' '}
            <a 
              href="/support" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Contatta il supporto
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
