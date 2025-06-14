/**
 * Authentication Context
 * Gestione dello stato globale di autenticazione
 */

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { STORAGE_KEYS, USER_ROLES } from '../utils/constants';
import { authService } from '../services/authService';
import notificationService from '../services/notificationService';

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} full_name
 * @property {string} role - USER_ROLES enum value
 * @property {string} status
 * @property {boolean} is_active
 * @property {boolean} is_verified
 * @property {string|null} phone
 * @property {string} timezone
 * @property {string} language
 * @property {string|null} license_number - Solo per PROFESSIONAL
 * @property {string|null} specialization - Solo per PROFESSIONAL
 * @property {string|null} clinic_name - Solo per PROFESSIONAL
 * @property {string|null} clinic_address - Solo per PROFESSIONAL
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} currentUser
 * @property {string|null} token
 * @property {boolean} isAuthenticated
 * @property {string|null} userRole
 * @property {boolean} isLoading
 * @property {string|null} error
 */

// Initial state
const initialState = {
  currentUser: null,
  token: null,
  isAuthenticated: false,
  userRole: null,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

/**
 * Auth Reducer
 * @param {AuthState} state 
 * @param {Object} action 
 * @returns {AuthState}
 */
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null
      };
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        currentUser: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        userRole: action.payload.user.role,
        isLoading: false,
        error: null
      };
      
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };
      
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        currentUser: { ...state.currentUser, ...action.payload }
      };
      
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);  /**
   * Carica i dati utente dal localStorage all'avvio
   */
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        console.log('🔍 AuthContext: Loading user from storage...');
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        
        console.log('🔍 AuthContext: Storage check:', { 
          hasToken: !!token, 
          hasUserData: !!userData,
          tokenPreview: token?.substring(0, 20) + '...',
          userDataPreview: userData?.substring(0, 100) + '...'
        });
        
        if (token && userData) {
          const user = JSON.parse(userData);
          console.log('✅ AuthContext: Successfully loaded user from storage:', user);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token }
          });
        } else {
          console.log('❌ AuthContext: No valid auth data found in storage');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('❌ AuthContext: Error loading user from storage:', error);
        // Pulisce dati corrotti
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadUserFromStorage();
  }, []);

  /**
   * Login function
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @param {boolean} [credentials.remember_me=false]
   * @returns {Promise<void>}
   */
  const login = async (credentials) => {
    try {      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.login(credentials);
      
      // Backend response structure: { user: {...}, token: { access_token, refresh_token, ... } }
      const { user, token } = response;
      const { access_token, refresh_token } = token;

      // Salva i dati nel localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      if (credentials.remember_me) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      }      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token: access_token }
      });

      // Notifica di successo
      notificationService.authSuccess(user.full_name || user.first_name || user.email);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Errore durante il login';
      
      // Notifica di errore
      notificationService.authError();
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  };
  /**
   * Register function
   * @param {Object} userData - UserRegister data
   * @returns {Promise<void>}
   */
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      console.log('AuthContext: Starting registration for:', userData.email);
      const response = await authService.register(userData);
      console.log('AuthContext: Registration response:', response);
      
      // Backend response structure for register: { user: {...} } 
      // In development mode with AUTO_VERIFY_EMAIL=True, user is immediately verified
      const { user } = response;
      
      // In development, user is auto-verified and active
      if (user?.is_verified) {
        console.log('AuthContext: User is verified, performing auto-login');
          // Perform login directly without calling the login function to avoid conflicts
        const loginResponse = await authService.login({ 
          email: userData.email, 
          password: userData.password 
        });
        
        console.log('AuthContext: Auto-login response:', loginResponse);
        
        const { user: loginUser, token } = loginResponse;
        const { access_token, refresh_token } = token;

        console.log('✅ AuthContext: Auto-login tokens received:', { hasToken: !!access_token });

        // Save data to localStorage
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(loginUser));

        // Update state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: loginUser, token: access_token }
        });
        
        console.log('AuthContext: Registration and auto-login completed successfully');
      } else {
        // Registration successful but requires email verification
        console.log('AuthContext: Registration successful, email verification required');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }

    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Errore durante la registrazione';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    }
  };
  /**
   * Logout function
   */
  const logout = async () => {
    const userName = state.currentUser?.full_name || state.currentUser?.first_name || 'Utente';
    
    try {
      // Chiamata al backend per invalidare la sessione (se supportato)
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Pulisce sempre i dati locali
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      // Notifica di logout
      notificationService.success('Logout effettuato', `Arrivederci, ${userName}!`);
    }
  };

  /**
   * Update user data
   * @param {Partial<User>} userData 
   */
  const updateUser = (userData) => {
    const updatedUser = { ...state.currentUser, ...userData };
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
  };

  /**
   * Clear error
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  /**
   * Check if user has specific role
   * @param {string|string[]} roles 
   * @returns {boolean}
   */
  const hasRole = (roles) => {
    if (!state.currentUser) return false;
    
    const userRole = state.currentUser.role;
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    
    return userRole === roles;
  };

  /**
   * Check if user is parent
   * @returns {boolean}
   */
  const isParent = () => hasRole(USER_ROLES.PARENT);

  /**
   * Check if user is professional
   * @returns {boolean}
   */
  const isProfessional = () => hasRole(USER_ROLES.PROFESSIONAL);

  /**
   * Check if user is admin
   * @returns {boolean}
   */  const isAdmin = () => hasRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    clearError,
    
    // Helpers
    hasRole,
    isParent,
    isProfessional,
    isAdmin
  }), [state, login, register, logout, updateUser, clearError, hasRole, isParent, isProfessional, isAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;
