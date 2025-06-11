import { create } from 'zustand';
import { authService } from '../services';
import { 
  setToken, 
  removeToken, 
  getToken, 
  getUser, 
  isTokenExpired 
} from '../utils/tokenManager';

/**
 * Hook per gestire lo stato di autenticazione
 * Implementato con Zustand per la gestione dello stato globale
 */
const useAuthStore = create((set, get) => ({
  // Stato iniziale
  user: getUser(),
  isAuthenticated: !!getToken() && !isTokenExpired(),
  isLoading: false,
  error: null,

  /**
   * Effettua il login dell'utente
   * @param {string} email - Email dell'utente
   * @param {string} password - Password dell'utente
   */
  login: async (email, password) => {
    try {
      // Imposta stato di loading
      set({ isLoading: true, error: null });
      
      // Chiama il servizio di autenticazione
      const response = await authService.login(email, password);
      
      // Gestione della risposta
      const { token, user } = response;
      
      // Salva il token e i dati utente
      setToken(token.access_token, user);
      
      // Aggiorna lo stato
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Errore durante il login:', error);
      
      // Gestione degli errori
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Errore durante il login. Riprova più tardi.';
      
      set({ 
        isLoading: false, 
        error: errorMessage,
        isAuthenticated: false,
        user: null 
      });
      
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Registra un nuovo utente
   * @param {object} userData - Dati dell'utente per la registrazione
   */
  register: async (userData) => {
    try {
      // Imposta stato di loading
      set({ isLoading: true, error: null });
      
      // Chiama il servizio di registrazione
      const response = await authService.register(userData);
      
      // Aggiorna lo stato (la registrazione non effettua login automatico)
      set({ isLoading: false });
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      
      // Gestione degli errori
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Errore durante la registrazione. Riprova più tardi.';
      
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Effettua il logout dell'utente
   */
  logout: async () => {
    try {
      // Se abbiamo un endpoint per il logout, lo chiamiamo
      if (get().isAuthenticated) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      // Rimuove il token in ogni caso
      removeToken();
      
      // Aggiorna lo stato
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null 
      });
    }
  },

  /**
   * Verifica lo stato dell'autenticazione corrente
   */
  checkAuthStatus: async () => {
    // Se non c'è un token, l'utente non è autenticato
    if (!getToken()) {
      set({ 
        isAuthenticated: false, 
        user: null 
      });
      return false;
    }
    
    // Se il token è scaduto, effettua il logout
    if (isTokenExpired()) {
      get().logout();
      return false;
    }
    
    // Se abbiamo già i dati utente e il token è valido
    if (get().user) {
      return true;
    }
    
    // Se abbiamo un token valido ma non i dati utente, li recuperiamo
    try {
      set({ isLoading: true });
      const user = await authService.getCurrentUser();
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error) {
      console.error('Errore durante la verifica autenticazione:', error);
      
      // Se c'è un errore nel recupero dei dati utente, effettua il logout
      get().logout();
      
      set({ isLoading: false });
      return false;
    }
  },

  /**
   * Resetta gli errori di autenticazione
   */
  resetError: () => {
    set({ error: null });
  },
}));

/**
 * Hook personalizzato per l'autenticazione
 */
export function useAuth() {
  const auth = useAuthStore();
  
  // Se il token esiste ma l'utente non è ancora stato recuperato
  if (getToken() && !auth.user && !auth.isLoading) {
    auth.checkAuthStatus();
  }
  
  return auth;
}

export default useAuthStore;
