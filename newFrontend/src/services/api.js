/**
 * 🚀 SmileAdventure Base API Client
 * Complete integration with all 103 backend routes
 * Features: JWT auth, token refresh, error handling, request/response interceptors
 */

import axios from 'axios';

// 📊 API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// 🔧 Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 🛡️ Token Management
const TokenManager = {
  getToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};

// 📤 Request Interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token && !TokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 📥 Response Interceptor - Handle responses and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
    
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      duration: `${duration}ms`,
      data: response.data
    });
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          
          const { access_token, refresh_token } = response.data.data;
          TokenManager.setTokens(access_token, refresh_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Enhanced error logging
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.error?.code,
      details: error.response?.data?.error?.details
    };
    
    console.error('❌ API Error:', errorInfo);
    
    return Promise.reject(createApiError(error));
  }
);

// 🔧 Enhanced Error Handler
const createApiError = (error) => {
  const apiError = {
    message: 'An unexpected error occurred',
    status: 0,
    code: 'UNKNOWN_ERROR',
    details: null,
    timestamp: new Date().toISOString()
  };

  if (error.response) {
    // Server responded with error status
    apiError.status = error.response.status;
    apiError.message = error.response.data?.message || `HTTP ${error.response.status}`;
    apiError.code = error.response.data?.error?.code || `HTTP_${error.response.status}`;
    apiError.details = error.response.data?.error?.details;
  } else if (error.request) {
    // Network error
    apiError.message = 'Network error - please check your connection';
    apiError.code = 'NETWORK_ERROR';
  } else {
    // Other error
    apiError.message = error.message;
    apiError.code = 'REQUEST_ERROR';
  }

  return apiError;
};

// 🔄 Retry Logic for failed requests
const retryRequest = async (fn, retries = API_CONFIG.RETRY_ATTEMPTS) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.status >= 500) {
      console.log(`🔄 Retrying request... (${API_CONFIG.RETRY_ATTEMPTS - retries + 1}/${API_CONFIG.RETRY_ATTEMPTS})`);
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

// 📊 API Status Check
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return {
      status: 'healthy',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: createApiError(error),
      timestamp: new Date().toISOString()
    };
  }
};

// 📋 Get API Info
export const getApiInfo = async () => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
};

// 📝 Get Available Endpoints
export const getApiEndpoints = async () => {
  try {
    const response = await apiClient.get('/endpoints');
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
};

// 📤 HTTP Methods with retry logic
export const api = {
  // GET request
  get: async (url, config = {}) => {
    return retryRequest(async () => {
      const response = await apiClient.get(url, config);
      return response.data;
    });
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    return retryRequest(async () => {
      const response = await apiClient.post(url, data, config);
      return response.data;
    });
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    return retryRequest(async () => {
      const response = await apiClient.put(url, data, config);
      return response.data;
    });
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    return retryRequest(async () => {
      const response = await apiClient.patch(url, data, config);
      return response.data;
    });
  },

  // DELETE request
  delete: async (url, config = {}) => {
    return retryRequest(async () => {
      const response = await apiClient.delete(url, config);
      return response.data;
    });
  },

  // File upload
  upload: async (url, formData, onProgress = null) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    const response = await apiClient.post(url, formData, config);
    return response.data;
  },

  // Download file
  download: async (url, filename = null) => {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return response.data;
  }
};

// 🔧 Utility functions
export const ApiUtils = {
  // Build query string from object
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });
    return searchParams.toString();
  },

  // Format API URL with parameters
  formatUrl: (template, params) => {
    let url = template;
    Object.keys(params).forEach(key => {
      url = url.replace(`{${key}}`, params[key]);
    });
    return url;
  },

  // Check if response is successful
  isSuccess: (response) => {
    return response && response.success === true;
  },

  // Extract data from API response
  extractData: (response, defaultValue = null) => {
    return ApiUtils.isSuccess(response) ? response.data : defaultValue;
  }
};

// 🚀 Export configured client and utilities
export { apiClient, TokenManager, API_CONFIG };
export default api;
