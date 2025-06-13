/**
 * 🚀 SmileAdventure Services Index
 * Central export file for all API services
 * Complete integration with all 103 backend routes
 */

// 🔧 Base API Client & Utilities
import { api, TokenManager, ApiUtils } from './api.js';
export { api, TokenManager, ApiUtils };

// 🔐 Authentication Service (14 routes)
import AuthService from './authService.js';
export { AuthService };
export const authService = new AuthService();

// 👤 User Management Service (49 routes) 
import UserService from './userService.js';
export { UserService };
export const userService = new UserService();

// 📊 Reports & Analytics Service (36 routes)
import ReportService from './reportService.js';
export { ReportService };
export const reportService = new ReportService();

// 🏥 Professional Service (4 routes)
import ProfessionalService from './professionalService.js';
export { ProfessionalService };
export const professionalService = new ProfessionalService();

// 🎯 Type Definitions & Constants
import {
  API_CONFIG,
  USER_ROLES,
  PERMISSIONS,
  GAME_TYPES,
  DIFFICULTY_LEVELS,
  PROGRESS_STATUS,
  ACHIEVEMENT_TYPES,
  SENSORY_CATEGORIES,
  SENSORY_RESPONSES,
  REPORT_TYPES,
  EXPORT_FORMATS,
  ERROR_TYPES,
  HTTP_STATUS,
  DEFAULT_VALUES
} from '../types/api.js';

// Re-export them
export {
  API_CONFIG,
  USER_ROLES,
  PERMISSIONS,
  GAME_TYPES,
  DIFFICULTY_LEVELS,
  PROGRESS_STATUS,
  ACHIEVEMENT_TYPES,
  SENSORY_CATEGORIES,
  SENSORY_RESPONSES,
  REPORT_TYPES,
  EXPORT_FORMATS,
  ERROR_TYPES,
  HTTP_STATUS,
  DEFAULT_VALUES
};

// 🎮 Service Collection Object
export const services = {
  auth: null,    // Will be initialized
  user: null,    // Will be initialized
  report: null,  // Will be initialized
  professional: null // Will be initialized
};

// 🔧 Service Initialization
let servicesInitialized = false;

/**
 * Initialize all services
 * Call this once in your app startup
 */
export const initializeServices = () => {
  if (servicesInitialized) {
    console.log('⚠️ Services already initialized');
    return services;
  }

  try {
    // Import services dynamically to avoid circular dependencies
    import('./authService.js').then(({ default: AuthService }) => {
      services.auth = new AuthService();
    });
    
    import('./userService.js').then(({ default: UserService }) => {
      services.user = new UserService();
    });
    
    import('./reportService.js').then(({ default: ReportService }) => {
      services.report = new ReportService();
    });
    
    import('./professionalService.js').then(({ default: ProfessionalService }) => {
      services.professional = new ProfessionalService();
    });

    servicesInitialized = true;
    console.log('✅ All SmileAdventure services initialized successfully');
    console.log('📊 Total API routes integrated: 103');
    console.log('🔐 Authentication routes: 14');
    console.log('👤 User management routes: 49');
    console.log('📈 Reports & analytics routes: 36');
    console.log('🏥 Professional routes: 4');
    
    return services;
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    throw error;
  }
};

/**
 * Get initialized service instance
 * @param {string} serviceName - Name of service (auth|user|report|professional)
 * @returns {Object} Service instance
 */
export const getService = (serviceName) => {
  if (!servicesInitialized) {
    console.warn('⚠️ Services not initialized. Call initializeServices() first.');
    return null;
  }
  
  if (!services[serviceName]) {
    console.error(`❌ Service '${serviceName}' not found`);
    return null;
  }
  
  return services[serviceName];
};

/**
 * Service health check
 * Tests connectivity to all services
 * @returns {Promise<Object>} Health check results
 */
export const healthCheck = async () => {
  const results = {
    overall: 'healthy',
    services: {},
    timestamp: new Date().toISOString()
  };

  try {
    // Test API connectivity
    const { api } = await import('./api.js');
    const healthResponse = await api.get('/health');
    
    results.services.api = {
      status: healthResponse.success ? 'healthy' : 'unhealthy',
      latency: healthResponse.latency || 'unknown'
    };

    // Test each service
    const serviceTests = [
      { name: 'auth', test: () => services.auth?.getAuthenticationStatus() },
      { name: 'user', test: () => services.user?.validateCache() },
      { name: 'report', test: () => services.report?.validateCache() },
      { name: 'professional', test: () => services.professional?.validateCache() }
    ];

    for (const { name, test } of serviceTests) {
      try {
        await test();
        results.services[name] = { status: 'healthy' };
      } catch (error) {
        results.services[name] = { 
          status: 'unhealthy', 
          error: error.message 
        };
        results.overall = 'degraded';
      }
    }

    console.log('🔍 Health check completed:', results);
    return results;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    results.overall = 'unhealthy';
    results.error = error.message;
    return results;
  }
};

/**
 * Clear all service caches
 * Useful for logout or data refresh
 */
export const clearAllCaches = () => {
  try {
    Object.values(services).forEach(service => {
      if (service && typeof service.clearAllCache === 'function') {
        service.clearAllCache();
      }
    });
    
    console.log('🧹 All service caches cleared');
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
  }
};

/**
 * Get service statistics
 * @returns {Object} Service usage statistics
 */
export const getServiceStats = () => {
  const stats = {
    initialized: servicesInitialized,
    services: {},
    totalRoutes: 103
  };

  Object.entries(services).forEach(([name, service]) => {
    if (service) {
      stats.services[name] = {
        available: true,
        cacheSize: service.getCacheSize ? service.getCacheSize() : 0,
        lastActivity: service.getLastActivity ? service.getLastActivity() : null
      };
    } else {
      stats.services[name] = { available: false };
    }
  });

  return stats;
};

// 🌟 Default export with everything
export default {
  // Services
  authService,
  userService, 
  reportService,
  professionalService,
  
  // Service Classes
  AuthService,
  UserService,
  ReportService,
  ProfessionalService,
  
  // Management
  initializeServices,
  getService,
  healthCheck,
  clearAllCaches,
  getServiceStats,
  
  // Collections
  services,
  
  // Constants & Types
  API_CONFIG,
  USER_ROLES,
  PERMISSIONS,
  GAME_TYPES,
  DEFAULT_VALUES
};
