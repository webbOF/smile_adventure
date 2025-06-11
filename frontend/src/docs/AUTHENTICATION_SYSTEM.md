# Authentication System Implementation

## Overview

This document provides an overview of the authentication system implemented for the Smile Adventure application. The system includes form-based login/registration, JWT token management, protected routes, and integration with the backend API.

## Components

### 1. Token Manager (`tokenManager.js`)

The Token Manager handles all operations related to JWT tokens:
- Storage and retrieval of tokens in localStorage
- Token validation and expiration checking
- Automatic header generation for authenticated API requests

Key functions:
- `setToken(token, user)`: Stores token and user data
- `getToken()`: Retrieves the current token
- `removeToken()`: Clears token (logout)
- `isTokenExpired()`: Checks if token is valid
- `getAuthHeader()`: Gets authorization header for API requests

### 2. Authentication Hook (`useAuth.js`)

A Zustand-based state management solution for authentication that provides:
- Centralized authentication state
- Login, registration and logout functionality
- Token refresh handling
- User session management

Key functions:
- `login(email, password)`: Authenticates user and stores session
- `register(userData)`: Creates a new user account
- `logout()`: Ends user session
- `checkAuthStatus()`: Verifies current authentication state

### 3. Protected Routes (`ProtectedRoute.jsx`)

A component that secures routes requiring authentication:
- Redirects unauthenticated users to login
- Supports role-based access control
- Shows loading indicator during authentication check

### 4. Login Form (`LoginForm.jsx`)

A form component for user login with:
- Form validation using react-hook-form
- Error handling and visual feedback
- Password visibility toggle
- Redirection after successful login

### 5. Registration Form (`RegisterForm.jsx`)

A form component for user registration with:
- Advanced form validation
- Password strength requirements
- Real-time error feedback
- Terms and conditions acceptance

## Integration Points

1. **API Integration**: The auth system integrates with the backend API through:
   - `authService.js`: Handles API calls for authentication operations
   - Token-based request/response interceptors

2. **Application Routing**: The system integrates with React Router through:
   - Protected route wrappers in App.js
   - Role-based access control
   - Redirection after login/logout

3. **Component Integration**: The forms are used in:
   - `LoginPage.js`: Container for the login form
   - `RegisterPage.js`: Container for the registration form

## Usage

### Protecting Routes
```jsx
<Route
  path="/protected-path"
  element={
    <ProtectedRoute roles={['role1', 'role2']}>
      <ProtectedComponent />
    </ProtectedRoute>
  }
/>
```

### Using Authentication in Components
```jsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Use auth state and functions as needed
}
```

### Making Authenticated API Requests
All API requests automatically include authentication headers when a valid token exists.

## Security Considerations

- JWT tokens are validated on both client and server
- Expired tokens trigger automatic logout
- Refresh token mechanism for extended sessions
- Password validation enforces strong security requirements
- XSS protection through proper token storage
