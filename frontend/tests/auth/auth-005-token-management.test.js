/**
 * AUTH-005: Token Management Test
 * 
 * Test della gestione completa dei JWT token:
 * creazione, validazione, refresh, scadenza e cleanup.
 */

import { 
  setAuthToken, 
  getAuthToken, 
  removeAuthToken,
  isTokenValid,
  refreshToken,
  getTokenClaims,
  setupTokenRefresh
} from '../../src/utils/tokenManager';

// Mock JWT tokens per test
const mockTokens = {
  valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Lzm0gYrm_9IM_Jc0Kkm2ZZzLW6OjvFoeFcPZ5ZG0VGE',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3bW0nL5fSKzFJa9KN3E7CfGtV5B2O8VjMcZ1nk',
  invalid: 'invalid.token.format',
  malformed: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed'
};

describe('AUTH-005: Token Management', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    // Reset axios default headers
    delete require('axios').defaults.headers.common['Authorization'];
  });

  describe('setAuthToken', () => {
    test('dovrebbe salvare token valido in localStorage', () => {
      setAuthToken(mockTokens.valid);
      
      expect(localStorage.getItem('authToken')).toBe(mockTokens.valid);
      expect(require('axios').defaults.headers.common['Authorization']).toBe(`Bearer ${mockTokens.valid}`);
    });

    test('dovrebbe salvare token in sessionStorage se rememberMe è false', () => {
      setAuthToken(mockTokens.valid, false);
      
      expect(sessionStorage.getItem('authToken')).toBe(mockTokens.valid);
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    test('dovrebbe gestire token null', () => {
      setAuthToken(null);
      
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(require('axios').defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('getAuthToken', () => {
    test('dovrebbe recuperare token da localStorage', () => {
      localStorage.setItem('authToken', mockTokens.valid);
      
      expect(getAuthToken()).toBe(mockTokens.valid);
    });

    test('dovrebbe recuperare token da sessionStorage se non in localStorage', () => {
      sessionStorage.setItem('authToken', mockTokens.valid);
      
      expect(getAuthToken()).toBe(mockTokens.valid);
    });

    test('dovrebbe restituire null se nessun token presente', () => {
      expect(getAuthToken()).toBeNull();
    });

    test('dovrebbe dare priorità a localStorage', () => {
      localStorage.setItem('authToken', 'localStorage-token');
      sessionStorage.setItem('authToken', 'sessionStorage-token');
      
      expect(getAuthToken()).toBe('localStorage-token');
    });
  });

  describe('removeAuthToken', () => {
    test('dovrebbe rimuovere token da entrambi gli storage', () => {
      localStorage.setItem('authToken', mockTokens.valid);
      sessionStorage.setItem('authToken', mockTokens.valid);
      
      removeAuthToken();
      
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(require('axios').defaults.headers.common['Authorization']).toBeUndefined();
    });

    test('dovrebbe rimuovere dati utente correlati', () => {
      localStorage.setItem('authToken', mockTokens.valid);
      localStorage.setItem('userRole', 'parent');
      localStorage.setItem('userId', '123');
      
      removeAuthToken();
      
      expect(localStorage.getItem('userRole')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
    });
  });

  describe('isTokenValid', () => {
    test('dovrebbe validare token valido', () => {
      expect(isTokenValid(mockTokens.valid)).toBe(true);
    });

    test('dovrebbe invalidare token scaduto', () => {
      expect(isTokenValid(mockTokens.expired)).toBe(false);
    });

    test('dovrebbe invalidare token malformato', () => {
      expect(isTokenValid(mockTokens.malformed)).toBe(false);
    });

    test('dovrebbe invalidare token null/undefined', () => {
      expect(isTokenValid(null)).toBe(false);
      expect(isTokenValid(undefined)).toBe(false);
      expect(isTokenValid('')).toBe(false);
    });

    test('dovrebbe invalidare token con formato non valido', () => {
      expect(isTokenValid(mockTokens.invalid)).toBe(false);
    });
  });

  describe('getTokenClaims', () => {
    test('dovrebbe estrarre claims da token valido', () => {
      const claims = getTokenClaims(mockTokens.valid);
      
      expect(claims).toHaveProperty('sub', '1234567890');
      expect(claims).toHaveProperty('name', 'John Doe');
      expect(claims).toHaveProperty('iat');
      expect(claims).toHaveProperty('exp');
    });

    test('dovrebbe restituire null per token non valido', () => {
      expect(getTokenClaims(mockTokens.invalid)).toBeNull();
      expect(getTokenClaims(null)).toBeNull();
    });

    test('dovrebbe gestire token malformato', () => {
      expect(getTokenClaims(mockTokens.malformed)).toBeNull();
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      // Mock fetch per refresh token API
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('dovrebbe aggiornare token con successo', async () => {
      const newToken = 'new.jwt.token';
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: newToken,
          token_type: 'bearer'
        })
      });

      localStorage.setItem('authToken', mockTokens.valid);
      
      const result = await refreshToken();
      
      expect(result).toEqual({
        success: true,
        token: newToken
      });
      expect(localStorage.getItem('authToken')).toBe(newToken);
    });

    test('dovrebbe gestire errore refresh token', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      localStorage.setItem('authToken', mockTokens.expired);
      
      const result = await refreshToken();
      
      expect(result).toEqual({
        success: false,
        error: 'Refresh token failed'
      });
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    test('dovrebbe gestire errore di rete', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      localStorage.setItem('authToken', mockTokens.valid);
      
      const result = await refreshToken();
      
      expect(result).toEqual({
        success: false,
        error: 'Network error'
      });
    });
  });

  describe('setupTokenRefresh', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    test('dovrebbe configurare refresh automatico', () => {
      const mockRefresh = jest.fn();
      setupTokenRefresh(mockRefresh);
      
      // Simula scadenza imminente
      jest.advanceTimersByTime(30 * 60 * 1000); // 30 minuti
      
      expect(mockRefresh).toHaveBeenCalled();
    });

    test('dovrebbe fermare refresh se token rimosso', () => {
      const mockRefresh = jest.fn();
      const cleanup = setupTokenRefresh(mockRefresh);
      
      cleanup();
      
      jest.advanceTimersByTime(30 * 60 * 1000);
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    test('dovrebbe gestire localStorage non disponibile', () => {
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;
      
      expect(() => setAuthToken(mockTokens.valid)).not.toThrow();
      expect(() => getAuthToken()).not.toThrow();
      expect(() => removeAuthToken()).not.toThrow();
      
      global.localStorage = originalLocalStorage;
    });

    test('dovrebbe gestire token con caratteri speciali', () => {
      const specialToken = 'token.with.special+chars/=';
      
      setAuthToken(specialToken);
      expect(getAuthToken()).toBe(specialToken);
    });

    test('dovrebbe validare token length massima', () => {
      const longToken = 'a'.repeat(10000);
      
      expect(() => setAuthToken(longToken)).not.toThrow();
      expect(isTokenValid(longToken)).toBe(false);
    });
  });
});
