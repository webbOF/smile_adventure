/**
 * Authentication Test Suite Setup - Smile Adventure (CommonJS version for Jest)
 * 
 * MSW (Mock Service Worker) configuration per test unitari
 * Helper functions per test comuni  
 * Test data e fixtures
 */

const { setupServer } = require('msw/node');
const { rest } = require('msw');
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
          success: true,
          message: 'User registered successfully',
          user: {
            id: 1,
            email: 'parent.test@example.com',
            first_name: 'Test',
            last_name: 'Parent',
            role: 'parent',
            is_verified: false,
            status: 'pending'
          },
          verification_required: true
        })
      );
    }
    
    // Professional registration success
    if (email === 'professional.test@example.com' && role === 'professional') {
      return res(
        ctx.status(201),
        ctx.json({
          success: true,
          message: 'Professional registered successfully',
          user: {
            id: 2,
            email: 'professional.test@example.com',
            first_name: 'Dr.',
            last_name: 'Smith',
            role: 'professional',
            license_number: 'MD123456',
            specialization: 'Pediatric Dentistry',
            clinic_name: 'Happy Smiles Clinic',
            is_verified: true,
            status: 'active'
          }
        })
      );
    }
    
    // Email already exists error
    if (email === 'existing@example.com') {
      return res(
        ctx.status(400),
        ctx.json({
          error: {
            type: 'EmailAlreadyExistsError',
            message: 'Email already registered'
          }
        })
      );
    }
    
    // Default error for invalid data
    return res(
      ctx.status(400),
      ctx.json({
        error: {
          type: 'ValidationError',
          message: 'Invalid registration data'
        }
      })
    );
  }),

  // Login endpoint
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    // Successful login scenarios
    const validCredentials = {
      'parent.test@example.com': 'Password123!',
      'professional.test@example.com': 'SecurePass456!',
      'admin.test@example.com': 'AdminPass789!'
    };
    
    if (validCredentials[email] === password) {
      const role = email.includes('parent') ? 'parent' : 
                   email.includes('professional') ? 'professional' : 'admin';
                   
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'Login successful',
          access_token: 'mock-jwt-token-' + role,
          refresh_token: 'mock-refresh-token-' + role,
          token_type: 'bearer',
          expires_in: 1800,
          user: {
            id: role === 'parent' ? 1 : role === 'professional' ? 2 : 3,
            email: email,
            role: role,
            is_verified: true,
            status: 'active'
          }
        })
      );
    }
    
    // Invalid credentials
    return res(
      ctx.status(401),
      ctx.json({
        error: {
          type: 'AuthenticationError',
          message: 'Invalid email or password'
        }
      })
    );
  }),

  // Token refresh endpoint
  rest.post('/api/v1/auth/refresh', (req, res, ctx) => {
    const authHeader = req.headers.get('authorization');
    
    if (authHeader && authHeader.includes('mock-refresh-token')) {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'new-mock-jwt-token',
          token_type: 'bearer',
          expires_in: 1800
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        error: {
          type: 'InvalidTokenError',
          message: 'Invalid refresh token'
        }
      })
    );
  }),

  // Password reset request
  rest.post('/api/v1/auth/password-reset-request', (req, res, ctx) => {
    const { email } = req.body;
    
    if (email === 'user@example.com') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'Password reset email sent'
        })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({
        error: {
          type: 'UserNotFoundError',
          message: 'User not found'
        }
      })
    );
  }),

  // Password reset confirm
  rest.post('/api/v1/auth/password-reset-confirm', (req, res, ctx) => {
    const { token, new_password } = req.body;
    
    if (token === 'valid-reset-token' && new_password) {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'Password reset successful'
        })
      );
    }
    
    return res(
      ctx.status(400),
      ctx.json({
        error: {
          type: 'InvalidTokenError',
          message: 'Invalid or expired reset token'
        }
      })
    );
  })
];

// Create mock server
const server = setupServer(...authHandlers);

// Global test setup
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// Export server for additional handlers in specific tests
module.exports = {
  server,
  authHandlers,
  rest
};

// Console override per ridurre noise nei test
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
