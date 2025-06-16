/**
 * AUTHENTICATION TEST SUITE - Entry Point
 * 
 * This file imports and re-exports all authentication tests
 * from the centralized location: ../../tests/auth/
 * 
 * This approach allows Jest (via react-scripts) to find the tests
 * while keeping them organized in a centralized location.
 */

// Setup MSW and test environment
require('../tests/auth/setup-commonjs.js');

// Import test modules from centralized location
describe('🔐 Authentication Test Suite (Centralized)', () => {
  describe('Parent Registration Tests', () => {
    require('../tests/auth/auth-001-parent-registration.test.js');
  });

  describe('Professional Registration Tests', () => {
    require('../tests/auth/auth-002-professional-registration.test.js');
  });

  describe('Password Validation Tests', () => {
    require('../tests/auth/auth-003-password-validation.test.js');
  });

  describe('Multi-Role Login Tests', () => {
    require('../tests/auth/auth-004-multi-role-login.test.js');
  });

  describe('Token Management Tests', () => {
    require('../tests/auth/auth-005-token-management.test.js');
  });

  describe('Error Handling Tests', () => {
    require('../tests/auth/auth-007-error-handling.test.js');
  });
});
