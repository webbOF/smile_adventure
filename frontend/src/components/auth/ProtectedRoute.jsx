import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente per proteggere le route che richiedono autenticazione
 * Reindirizza l'utente alla pagina di login se non è autenticato
 *
 * @param {object} props - Proprietà del componente
 * @param {React.ReactNode} props.children - Componenti da rendere se l'utente è autenticato
 * @param {string[]} [props.roles] - Array di ruoli autorizzati ad accedere alla route (opzionale)
 * @param {string} [props.redirectTo='/login'] - Percorso di redirect se l'utente non è autenticato
 */
const ProtectedRoute = ({ 
  children, 
  roles = [], 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user, checkAuthStatus, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Controlla lo stato dell'autenticazione quando il componente viene montato
    const verifyAuth = async () => {
      await checkAuthStatus();
      setIsChecking(false);
    };

    verifyAuth();
  }, [checkAuthStatus]);

  // Mostra un indicatore di caricamento mentre verifichiamo l'autenticazione
  if (isLoading || isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se l'utente non è autenticato, reindirizza alla pagina di login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // Se sono specificati ruoli richiesti e l'utente non ha uno di questi ruoli
  if (roles.length > 0 && (!user.role || !roles.includes(user.role))) {
    // Reindirizza alla home o a una pagina di "accesso negato"
    return <Navigate to="/" replace />;
  }

  // Se l'utente è autenticato e ha il ruolo richiesto, mostra il contenuto della route
  return children;
};

export default ProtectedRoute;
