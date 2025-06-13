/**
 * Axios Instance Configuration
 * Configurazione centralizzata di Axios con interceptors
 */

import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { STORAGE_KEYS, HTTP_STATUS } from '../utils/constants';

/**
 * Crea istanza Axios configurata
 */
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

/**
 * Request Interceptor
 * Aggiunge automaticamente il token JWT alle richieste protette
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Recupera il token dal localStorage
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log della richiesta in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Gestisce le risposte e gli errori globalmente
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Log della risposta in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log dell'errore
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    // Gestione errore 401 - Token scaduto
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tenta il refresh del token
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          
          const { access_token } = response.data;
          
          // Salva il nuovo token
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
          
          // Riprova la richiesta originale con il nuovo token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Pulisce i token e redirect al login
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        
        // Redirect al login (sarà gestito dal context)
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    // Gestione altri errori
    if (error.response?.status === HTTP_STATUS.FORBIDDEN) {
      // Accesso negato - potrebbe essere reindirizzato a pagina di errore
      console.warn('Access denied to resource');
    }
    
    if (error.response?.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      // Errori server - potrebbe mostrare toast di errore globale
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
