/**
 * AUTH-004: Multi-Role Login Test
 * 
 * Test del sistema di login per tutti i ruoli utente
 * con verifica RBAC e redirect appropriati.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import LoginPage from '../../src/pages/LoginPage';
import { server } from './setup';

// Test wrapper con provider necessari
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

// Aggiunta PropTypes per validazione
TestWrapper.propTypes = {
  children: require('prop-types').node.isRequired
};

describe('AUTH-004: Multi-Role Login', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterAll(() => {
    server.close();
  });

  test('dovrebbe mostrare il form di login', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accedi/i })).toBeInTheDocument();
    expect(screen.getByText(/password dimenticata/i)).toBeInTheDocument();
  });

  test('dovrebbe effettuare login parent con successo', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Login parent
    await user.type(screen.getByLabelText(/email/i), 'parent.test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');
    await user.click(screen.getByRole('button', { name: /accedi/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-jwt-token-parent');
      expect(localStorage.getItem('userRole')).toBe('parent');
    });
  });

  test('dovrebbe effettuare login professional con successo', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Login professional
    await user.type(screen.getByLabelText(/email/i), 'dr.smith@clinic.com');
    await user.type(screen.getByLabelText(/password/i), 'SecureProf123!');
    await user.click(screen.getByRole('button', { name: /accedi/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-jwt-token-professional');
      expect(localStorage.getItem('userRole')).toBe('professional');
    });
  });

  test('dovrebbe effettuare login admin con successo', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Login admin
    await user.type(screen.getByLabelText(/email/i), 'admin@smileadventure.com');
    await user.type(screen.getByLabelText(/password/i), 'AdminSecure123!');
    await user.click(screen.getByRole('button', { name: /accedi/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-jwt-token-admin');
      expect(localStorage.getItem('userRole')).toBe('admin');
    });
  });

  test('dovrebbe mostrare errore per credenziali non valide', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText(/email/i), 'wrong@email.com');
    await user.type(screen.getByLabelText(/password/i), 'WrongPassword');
    await user.click(screen.getByRole('button', { name: /accedi/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenziali non valide/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe gestire account bloccato', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText(/email/i), 'blocked@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');
    await user.click(screen.getByRole('button', { name: /accedi/i }));

    await waitFor(() => {
      expect(screen.getByText(/account bloccato/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe gestire account non verificato', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText(/email/i), 'unverified@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');
    await user.click(screen.getByRole('button', { name: /accedi/i }));

    await waitFor(() => {
      expect(screen.getByText(/account non verificato/i)).toBeInTheDocument();
      expect(screen.getByText(/reinvia email verifica/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe validare formato email', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText(/email/i), 'email-non-valida');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');
    await user.click(screen.getByRole('button', { name: /accedi/i }));

    await waitFor(() => {
      expect(screen.getByText(/formato email non valido/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe richiedere tutti i campi', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Submit form vuoto
    await user.click(screen.getByRole('button', { name: /accedi/i }));

    await waitFor(() => {
      expect(screen.getByText(/email è richiesta/i)).toBeInTheDocument();
      expect(screen.getByText(/password è richiesta/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe disabilitare il pulsante durante il caricamento', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText(/email/i), 'parent.test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');

    const submitButton = screen.getByRole('button', { name: /accedi/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/accesso in corso/i)).toBeInTheDocument();
  });

  test('dovrebbe gestire errore di rete', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText(/email/i), 'network.error@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');
    await user.click(screen.getByRole('button', { name: /accedi/i }));

    await waitFor(() => {
      expect(screen.getByText(/errore di connessione/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe salvare "Ricordami" preference', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText(/email/i), 'parent.test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');
    await user.click(screen.getByLabelText(/ricordami/i));
    await user.click(screen.getByRole('button', { name: /accedi/i }));

    await waitFor(() => {
      expect(localStorage.getItem('rememberMe')).toBe('true');
    });
  });
});
