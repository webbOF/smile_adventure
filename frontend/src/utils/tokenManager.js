/**
 * Token Management Utilities
 * Gestisce autenticazione e autorizzazione per Smile Adventure
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

/**
 * Memorizza il token di autenticazione
 */
export const setAuthToken = (token, refreshToken = null, userData = null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  
  if (userData) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }
};

/**
 * Recupera il token di autenticazione
 */
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Recupera il refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Recupera i dati utente
 */
export const getUserData = () => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Rimuove il token e i dati associati
 */
export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

/**
 * Verifica se il token è valido (non scaduto)
 */
export const isTokenValid = (token = null) => {
  const authToken = token || getAuthToken();
  
  if (!authToken) {
    return false;
  }
  
  try {
    // Decodifica il payload del JWT (senza verificare la firma)
    const payload = JSON.parse(atob(authToken.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

/**
 * Rinnova automaticamente il token se necessario
 */
export const autoRefreshToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    setAuthToken(data.access_token, data.refresh_token, data.user);
    
    return data.access_token;
  } catch (error) {
    removeAuthToken();
    throw error;
  }
};

/**
 * Configura l'header Authorization per le richieste
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
};

/**
 * Verifica se l'utente ha un ruolo specifico
 */
export const hasRole = (role) => {
  const userData = getUserData();
  return userData?.role === role;
};

/**
 * Verifica se l'utente è un genitore
 */
export const isParent = () => hasRole('parent');

/**
 * Verifica se l'utente è un professionista
 */
export const isProfessional = () => hasRole('professional');

/**
 * Verifica se l'utente è un admin
 */
export const isAdmin = () => hasRole('admin');
