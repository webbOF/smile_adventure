import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Card, Button } from '../components/UI';
import { ROUTES } from '../utils/constants';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
              fontSize: '6rem', 
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#e5e7eb'
            }}>
              404
            </div>
            
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#111827'
            }}>
              Pagina Non Trovata
            </h1>
            
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              La pagina che stai cercando non esiste o è stata spostata.
              <br />
              <code style={{ 
                backgroundColor: '#f3f4f6', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem',
                fontSize: '0.875rem'
              }}>
                {location.pathname}
              </code>
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Button 
                variant="primary" 
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                Vai al Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                Torna Indietro
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => navigate(ROUTES.HOME)}
              >
                Home
              </Button>
            </div>
            
            <div style={{ 
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#9ca3af',
                marginBottom: '1rem'
              }}>
                Hai bisogno di aiuto?
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button 
                  variant="ghost" 
                  size="small"
                  onClick={() => {
                    // TODO: Implementare contatto supporto
                    console.log('Contact support');
                  }}
                >
                  Contatta il Supporto
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="small"
                  onClick={() => {
                    // TODO: Implementare feedback
                    console.log('Report issue');
                  }}
                >
                  Segnala Problema
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
