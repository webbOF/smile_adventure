import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Card, Button, Alert } from '../components/UI';
import { ROUTES } from '../utils/constants';

const UnauthorizedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { reason, requiredRoles, userRole } = location.state || {};

  const getErrorMessage = () => {
    switch (reason) {
      case 'Account not active':
        return {
          title: 'Account Non Attivo',
          message: 'Il tuo account non è attualmente attivo. Contatta il supporto per assistenza.',
          variant: 'warning'
        };
      case 'Email verification required':
        return {
          title: 'Verifica Email Richiesta',
          message: 'Devi verificare il tuo indirizzo email prima di accedere a questa sezione.',
          variant: 'info'
        };
      case 'Insufficient permissions':
        return {
          title: 'Permessi Insufficienti',
          message: `Non hai i permessi necessari per accedere a questa sezione. ${
            requiredRoles ? `Ruoli richiesti: ${requiredRoles.join(', ')}. Il tuo ruolo: ${userRole}.` : ''
          }`,
          variant: 'error'
        };
      default:
        return {
          title: 'Accesso Negato',
          message: 'Non hai i permessi necessari per accedere a questa pagina.',
          variant: 'error'
        };
    }
  };

  const errorInfo = getErrorMessage();

  const handleGoBack = () => {
    if (location.state?.from) {
      navigate(-1);
    } else {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <Layout variant="centered">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '2rem 0'
      }}>
        <Card style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ padding: '2rem' }}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '1rem',
              opacity: 0.6
            }}>
              🚫
            </div>
            
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#111827'
            }}>
              {errorInfo.title}
            </h1>
            
            <Alert variant={errorInfo.variant} style={{ marginBottom: '2rem' }}>
              {errorInfo.message}
            </Alert>
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Button 
                variant="primary" 
                onClick={handleGoBack}
              >
                Torna Indietro
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                Vai al Dashboard
              </Button>
              
              {reason === 'Email verification required' && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    // TODO: Implementare resend verification email
                    console.log('Resend verification email');
                  }}
                >
                  Reinvia Email
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default UnauthorizedPage;
