/**
 * useAuth Hook
 * Custom hook per accedere facilmente al contesto di autenticazione
 */

import { useAuth as useAuthContext } from '../contexts/AuthContext';

/**
 * Hook personalizzato per l'autenticazione
 * Wrapper per il context di autenticazione con utility aggiuntive
 * 
 * @returns {Object} Auth context con metodi helper
 */
export const useAuth = () => {
  const auth = useAuthContext();
  return {
    // Spread tutti i valori del context
    ...auth,
    
    // Alias per compatibilità
    user: auth.currentUser,

    // Metodi helper aggiuntivi per comodità
    /**
     * Check if user is authenticated and verified
     * @returns {boolean}
     */
    isAuthenticatedAndVerified: () => {
      return auth.isAuthenticated && auth.currentUser?.is_verified;
    },

    /**
     * Check if user is authenticated and active
     * @returns {boolean}
     */
    isAuthenticatedAndActive: () => {
      return auth.isAuthenticated && 
             auth.currentUser?.is_active && 
             auth.currentUser?.status === 'ACTIVE';
    },

    /**
     * Get user display name
     * @returns {string}
     */
    getUserDisplayName: () => {
      if (!auth.currentUser) return '';
      return auth.currentUser.full_name || 
             `${auth.currentUser.first_name} ${auth.currentUser.last_name}`;
    },

    /**
     * Get user initials for avatar
     * @returns {string}
     */
    getUserInitials: () => {
      if (!auth.currentUser) return '';
      const { first_name, last_name } = auth.currentUser;
      return `${first_name?.[0] || ''}${last_name?.[0] || ''}`.toUpperCase();
    },

    /**
     * Check if current user can access children features
     * @returns {boolean}
     */
    canAccessChildren: () => {
      return auth.isParent() && auth.isAuthenticatedAndVerified();
    },

    /**
     * Check if current user can access professional features
     * @returns {boolean}
     */
    canAccessProfessionalFeatures: () => {
      return auth.isProfessional() && auth.isAuthenticatedAndVerified();
    },

    /**
     * Check if current user can access admin features
     * @returns {boolean}
     */
    canAccessAdminFeatures: () => {
      return auth.isAdmin() && auth.isAuthenticatedAndVerified();
    }
  };
};

export default useAuth;
