/**
 * Authentication Test Helpers
 * 
 * Funzioni di utilità per i test di autenticazione:
 * mock data, helper per setup/teardown, utilities comuni.
 */

// Mock JWT tokens per test
export const mockTokens = {
  parent: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InBhcmVudCIsImVtYWlsIjoicGFyZW50LnRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjk5OTk5OTk5OTl9.test',
  professional: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6InByb2Zlc3Npb25hbCIsImVtYWlsIjoiZHIuc21pdGhAY2xpbmljLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.test',
  admin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBzbWlsZWFkdmVudHVyZS5jb20iLCJleHAiOjk5OTk5OTk5OTl9.test',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0Iiwicm9sZSI6InBhcmVudCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImV4cCI6MTUxNjIzOTAyMn0.test',
  invalid: 'invalid.token.format'
};

// Mock user data per test
export const mockUsers = {
  parent: {
    id: 1,
    email: 'parent.test@example.com',
    first_name: 'Mario',
    last_name: 'Rossi',
    role: 'parent',
    is_active: true,
    is_verified: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  professional: {
    id: 2,
    email: 'dr.smith@clinic.com',
    first_name: 'Dr. John',
    last_name: 'Smith',
    role: 'professional',
    license_number: 'ALBO123456',
    specialization: 'Neuropsichiatria Infantile',
    phone: '+39 123 456 7890',
    is_active: true,
    is_verified: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  admin: {
    id: 3,
    email: 'admin@smileadventure.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    is_active: true,
    is_verified: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  blocked: {
    id: 4,
    email: 'blocked@example.com',
    first_name: 'Blocked',
    last_name: 'User',
    role: 'parent',
    is_active: false,
    is_verified: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  unverified: {
    id: 5,
    email: 'unverified@example.com',
    first_name: 'Unverified',
    last_name: 'User',
    role: 'parent',
    is_active: true,
    is_verified: false,
    created_at: '2025-01-01T00:00:00Z'
  }
};

// Form data validi per test
export const validFormData = {
  parentRegistration: {
    email: 'parent.test@example.com',
    password: 'Test123!',
    passwordConfirm: 'Test123!',
    firstName: 'Mario',
    lastName: 'Rossi',
    role: 'parent'
  },
  professionalRegistration: {
    email: 'dr.smith@clinic.com',
    password: 'SecureProf123!',
    passwordConfirm: 'SecureProf123!',
    firstName: 'Dr. John',
    lastName: 'Smith',
    role: 'professional',
    licenseNumber: 'ALBO123456',
    specialization: 'Neuropsichiatria Infantile',
    phone: '+39 123 456 7890'
  },
  login: {
    email: 'parent.test@example.com',
    password: 'Test123!'
  }
};

// Form data non validi per test errori
export const invalidFormData = {
  emailFormat: {
    email: 'email-non-valida',
    password: 'Test123!'
  },
  weakPassword: {
    email: 'test@example.com',
    password: '123'
  },
  passwordMismatch: {
    email: 'test@example.com',
    password: 'Test123!',
    passwordConfirm: 'Different123!'
  },
  missingFields: {
    email: '',
    password: ''
  },
  shortLicense: {
    licenseNumber: '123' // Troppo corto
  },
  invalidPhone: {
    phone: '123abc' // Formato non valido
  }
};

// Helper functions
export const authTestHelpers = {
  /**
   * Setup localStorage con token mock
   */
  setMockToken: (userRole = 'parent') => {
    const token = mockTokens[userRole];
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userId', mockUsers[userRole].id.toString());
  },

  /**
   * Cleanup localStorage dopo test
   */
  clearStorage: () => {
    localStorage.clear();
    sessionStorage.clear();
  },

  /**
   * Mock di authService per test unitari
   */
  mockAuthService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    getCurrentUser: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn()
  },

  /**
   * Reset di tutti i mock
   */
  resetMocks: () => {
    Object.values(authTestHelpers.mockAuthService).forEach(mock => {
      mock.mockReset();
    });
  },

  /**
   * Simula login riuscito
   */
  simulateSuccessfulLogin: (userRole = 'parent') => {
    const user = mockUsers[userRole];
    const token = mockTokens[userRole];
    
    authTestHelpers.mockAuthService.login.mockResolvedValue({
      success: true,
      user,
      token,
      message: 'Login riuscito'
    });
  },

  /**
   * Simula login fallito
   */
  simulateFailedLogin: (errorMessage = 'Credenziali non valide') => {
    authTestHelpers.mockAuthService.login.mockRejectedValue({
      response: {
        status: 401,
        data: { detail: errorMessage }
      }
    });
  },

  /**
   * Simula registrazione riuscita
   */
  simulateSuccessfulRegistration: (userRole = 'parent') => {
    const user = mockUsers[userRole];
    const token = mockTokens[userRole];
    
    authTestHelpers.mockAuthService.register.mockResolvedValue({
      success: true,
      user,
      token,
      message: 'Registrazione completata'
    });
  },

  /**
   * Simula errore di rete
   */
  simulateNetworkError: () => {
    const networkError = new Error('Network Error');
    networkError.code = 'NETWORK_ERROR';
    
    authTestHelpers.mockAuthService.login.mockRejectedValue(networkError);
    authTestHelpers.mockAuthService.register.mockRejectedValue(networkError);
  },

  /**
   * Simula timeout
   */
  simulateTimeout: () => {
    const timeoutError = new Error('Request timeout');
    timeoutError.code = 'TIMEOUT';
    
    authTestHelpers.mockAuthService.login.mockRejectedValue(timeoutError);
  },

  /**
   * Verifica che il form sia stato compilato correttamente
   */
  verifyFormFilled: (formData) => {
    Object.entries(formData).forEach(([field, value]) => {
      const input = document.querySelector(`[name="${field}"]`) || 
                   document.querySelector(`[data-testid="${field}-input"]`);
      expect(input).toHaveValue(value);
    });
  },

  /**
   * Verifica presenza errori di validazione
   */
  verifyValidationErrors: (expectedErrors) => {
    expectedErrors.forEach(error => {
      expect(document.querySelector('[data-testid="error-message"]'))
        .toHaveTextContent(error);
    });
  },

  /**
   * Simula click su elemento con retry per async rendering
   */
  clickWithRetry: async (element, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await element.click();
        break;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  },

  /**
   * Attende caricamento e verifica redirect
   */
  waitForRedirect: async (expectedPath, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const checkPath = () => {
        if (window.location.pathname.includes(expectedPath)) {
          resolve(true);
        }
      };

      const timer = setTimeout(() => {
        reject(new Error(`Redirect to ${expectedPath} not completed within ${timeout}ms`));
      }, timeout);

      const interval = setInterval(() => {
        checkPath();
        if (window.location.pathname.includes(expectedPath)) {
          clearInterval(interval);
          clearTimeout(timer);
          resolve(true);
        }
      }, 100);
    });
  },

  /**
   * Genera dati casuali per test
   */
  generateRandomTestData: () => {
    const timestamp = Date.now();
    return {
      email: `test.${timestamp}@example.com`,
      password: `Test${timestamp}!`,
      firstName: `Test${timestamp}`,
      lastName: `User${timestamp}`,
      licenseNumber: `ALBO${timestamp}`,
      phone: `+39 ${timestamp.toString().slice(-10)}`
    };
  }
};

// Specializzazioni disponibili per professional
export const professionalSpecializations = [
  'Neuropsichiatria Infantile',
  'Psicologia',
  'Logopedia',
  'Terapia Occupazionale',
  'Fisioterapia',
  'Odontoiatria Pediatrica',
  'Pediatria',
  'Neurologia'
];

// Custom matchers per test
export const customMatchers = {
  toBeValidJWT: (token) => {
    const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
    return {
      pass: jwtRegex.test(token),
      message: () => `Expected ${token} to be a valid JWT token`
    };
  },

  toHaveValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      pass: emailRegex.test(email),
      message: () => `Expected ${email} to be a valid email address`
    };
  },

  toHaveStrongPassword: (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const isStrong = hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecial;
    
    return {
      pass: isStrong,
      message: () => `Expected ${password} to be a strong password`
    };
  }
};

export default authTestHelpers;
