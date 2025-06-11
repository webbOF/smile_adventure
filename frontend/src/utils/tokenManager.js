/**
 * Token Manager
 * Gestisce le operazioni relative al JWT token per autenticazione
 */

// Chiave per il localStorage
const TOKEN_KEY = 'smile_adventure_token';
const USER_KEY = 'smile_adventure_user';

/**
 * Salva il token JWT nel localStorage
 * @param {string} token - Il JWT token da salvare
 * @param {object} user - Dati utente da salvare
 */
export const setToken = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Recupera il token JWT dal localStorage
 * @returns {string|null} Il token se presente, altrimenti null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Recupera i dati utente dal localStorage
 * @returns {object|null} I dati utente se presenti, altrimenti null
 */
export const getUser = () => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    removeToken();
    return null;
  }
};

/**
 * Rimuove il token JWT dal localStorage (logout)
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Verifica se un token JWT è presente
 * @returns {boolean} true se il token è presente
 */
export const hasToken = () => {
  return !!getToken();
};

/**
 * Decodifica un token JWT per verificare la scadenza
 * @param {string} token - Il token da decodificare
 * @returns {object} Il payload decodificato
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    // Decodifica base64 del payload (seconda parte del token)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Errore nella decodifica del token:', e);
    return null;
  }
};

/**
 * Controlla se il token è scaduto
 * @returns {boolean} true se il token è scaduto o non valido
 */
export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;
  
  const decodedToken = decodeToken(token);
  if (!decodedToken || !decodedToken.exp) return true;
  
  // Controlla scadenza (exp è in secondi, Date.now() è in millisecondi)
  const expirationTime = decodedToken.exp * 1000;
  return Date.now() >= expirationTime;
};

/**
 * Recupera l'header di autorizzazione per le richieste API
 * @returns {object} Header di autorizzazione con il token
 */
export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default {
  setToken,
  getToken,
  getUser,
  removeToken,
  hasToken,
  isTokenExpired,
  getAuthHeader,
};
