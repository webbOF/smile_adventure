/**
 * Base API Client for Smile Adventure
 * Provides centralized HTTP client configuration with axios
 */

import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create base API instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from Zustand store (localStorage)
    const authData = localStorage.getItem('smile-adventure-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const token = parsed.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to parse auth data:', error);
      }
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common responses and errors
api.interceptors.response.use(
  (response) => {
    // Calculate request duration for performance monitoring
    const duration = new Date() - response.config.metadata.startTime;
    console.debug(`API Request completed in ${duration}ms:`, {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      duration
    });
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - try to refresh token
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              const refreshToken = localStorage.getItem('refresh_token');
              if (refreshToken) {
                const response = await axios.post(
                  `${api.defaults.baseURL}/auth/refresh`,
                  { refresh_token: refreshToken }
                );
                
                const { token } = response.data;
                
                // Update token in localStorage
                const authData = JSON.parse(localStorage.getItem('smile-adventure-auth') || '{}');
                if (authData.state) {
                  authData.state.token = token;
                  localStorage.setItem('smile-adventure-auth', JSON.stringify(authData));
                }
                
                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed - logout user
              localStorage.removeItem('smile-adventure-auth');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          }
          break;
          
        case 403:
          toast.error('Non hai i permessi per eseguire questa azione');
          break;
          
        case 404:
          if (!originalRequest.url?.includes('/auth/')) {
            toast.error('Risorsa non trovata');
          }
          break;
          
        case 422:
          // Validation errors
          const validationErrors = data.errors || data.detail || [];
          if (Array.isArray(validationErrors)) {
            validationErrors.forEach(err => {
              toast.error(err.msg || err.message || 'Errore di validazione');
            });
          }
          break;
          
        case 429:
          toast.error('Troppe richieste. Riprova tra poco.');
          break;
          
        case 500:
          toast.error('Errore interno del server. Riprova più tardi.');
          break;
          
        default:
          if (status >= 400) {
            const message = data.message || data.detail || 'Si è verificato un errore';
            toast.error(message);
          }
      }
    } else if (error.request) {
      // Network error
      toast.error('Errore di connessione. Controlla la tua connessione internet.');
    } else {
      // Other errors
      toast.error('Si è verificato un errore imprevisto');
    }
    
    return Promise.reject(error);
  }
);

// API Response types and utilities
export const ApiResponse = {
  success: (data, message = 'Operazione completata') => ({
    success: true,
    data,
    message
  }),
  
  error: (message, errors = null) => ({
    success: false,
    message,
    errors
  })
};

// Common API utilities
export const ApiUtils = {
  // Extract error message from API response
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.message) {
      return error.message;
    }
    return 'Si è verificato un errore imprevisto';
  },
  
  // Format query parameters
  formatParams: (params) => {
    const filtered = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    return filtered;
  },
  
  // Handle file upload
  createFormData: (data, fileField = 'file') => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(fileField, value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, JSON.stringify(value));
      }
    });
    
    return formData;
  }
};

// Export configured API instance
export default api;
