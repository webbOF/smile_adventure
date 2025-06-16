/**
 * Authentication Test Suite Setup - Smile Adventure
 * 
 * MSW (Mock Service Worker) configuration per test unitari
 * Helper functions per test comuni
 * Test data e fixtures
 */

import { setupServer } from 'msw/node';
import { rest } from 'msw';
require('@testing-library/jest-dom');

// Mock responses per API authentication
const authHandlers = [
  // Successful parent registration
  rest.post('/api/v1/auth/register', (req, res, ctx) => {
    const { email, role } = req.body;
    
    if (email === 'parent.test@example.com' && role === 'parent') {
      return res(
        ctx.status(201),
        ctx.json({
          access_token: 'mock-jwt-token-parent',
          token_type: 'bearer',
          user: {
            id: 1,
            email: 'parent.test@example.com',
            first_name: 'Mario',
            last_name: 'Rossi',
            role: 'parent',
            is_active: true,
            is_verified: true
          }
        })
      );
    }
    
    // Successful professional registration
    if (email === 'dr.smith@clinic.com' && role === 'professional') {
      return res(
        ctx.status(201),
        ctx.json({
          access_token: 'mock-jwt-token-professional',
          token_type: 'bearer',
          user: {
            id: 2,
            email: 'dr.smith@clinic.com',
            first_name: 'Dr. John',
            last_name: 'Smith',
            role: 'professional',
            license_number: 'MD123456',
            specialization: 'Pediatric Dentistry',
            clinic_name: 'Smile Clinic',
            is_active: true,
            is_verified: true
          }
        })
      );
    }
    
    // Email already exists
    if (email === 'existing@example.com') {
      return res(
        ctx.status(409),
        ctx.json({ detail: 'Email already registered' })
      );
    }
    
    // Default success for other valid registrations
    return res(
      ctx.status(201),
      ctx.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        user: {
          id: 3,
          email: email,
          role: role || 'parent',
          is_active: true,
          is_verified: true
        }
      })
    );
  }),

  // Successful login
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    // Valid parent login
    if (email === 'parent@test.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'mock-jwt-token-parent',
          token_type: 'bearer',
          user: {
            id: 1,
            email: 'parent@test.com',
            first_name: 'Mario',
            last_name: 'Rossi',
            role: 'parent'
          }
        })
      );
    }
    
    // Valid professional login
    if (email === 'professional@test.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'mock-jwt-token-professional',
          token_type: 'bearer',
          user: {
            id: 2,
            email: 'professional@test.com',
            first_name: 'Dr. Smith',
            last_name: 'Johnson',
            role: 'professional'
          }
        })
      );
    }
    
    // Valid admin login
    if (email === 'admin@test.com' && password === 'admin123') {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'mock-jwt-token-admin',
          token_type: 'bearer',
          user: {
            id: 3,
            email: 'admin@test.com',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin'
          }
        })
      );
    }
    
    // Invalid credentials
    return res(
      ctx.status(401),
      ctx.json({ detail: 'Invalid credentials' })
    );
  }),
  // Token validation
  rest.get('/api/v1/auth/me', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader?.includes('valid-jwt-token')) {
      return res(
        ctx.status(200),
        ctx.json({
          id: 1,
          email: 'user@test.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'parent',
          is_active: true,
          is_verified: true
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ detail: 'Token invalid or expired' })
    );
  }),

  // Password reset
  rest.post('/api/v1/auth/forgot-password', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'Reset email sent successfully' })
    );
  }),

  rest.post('/api/v1/auth/reset-password', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'Password reset successfully' })
    );
  })
];

// Setup MSW server
export const server = setupServer(...authHandlers);

// Test utilities
export const createTestUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'parent',
  is_active: true,
  is_verified: true,
  ...overrides
});

export const createMockToken = (user = {}) => {
  const userData = createTestUser(user);
  return {
    access_token: `mock-jwt-${userData.role}`,
    token_type: 'bearer',
    user: userData
  };
};

// Setup and teardown
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(() => {
  server.close();
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = {
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn()
};
