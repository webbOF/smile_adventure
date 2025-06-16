/**
 * AUTH-007: Error Handling Test
 * 
 * Test della gestione errori nel sistema di autenticazione:
 * errori di rete, validazione, sicurezza e recovery.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import LoginPage from '../../src/pages/LoginPage';
import RegisterPage from '../../src/pages/RegisterPage';
import { server, errorHandlers } from './setup';

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

describe('AUTH-007: Error Handling', () => {
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

  describe('Network Errors', () => {
    test('dovrebbe gestire errore 500 del server', async () => {
      server.use(...errorHandlers.server500);
      
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Test123!');
      await user.click(screen.getByRole('button', { name: /accedi/i }));

      await waitFor(() => {
        expect(screen.getByText(/errore del server/i)).toBeInTheDocument();
        expect(screen.getByText(/riprova tra qualche minuto/i)).toBeInTheDocument();
      });
    });

    test('dovrebbe gestire timeout di rete', async () => {
      server.use(...errorHandlers.networkTimeout);
      
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Test123!');
      await user.click(screen.getByRole('button', { name: /accedi/i }));

      await waitFor(() => {
        expect(screen.getByText(/timeout di connessione/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /riprova/i })).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    test('dovrebbe gestire errore di connessione', async () => {
      server.use(...errorHandlers.networkError);
      
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Test123!');
      await user.click(screen.getByRole('button', { name: /accedi/i }));

      await waitFor(() => {
        expect(screen.getByText(/errore di connessione/i)).toBeInTheDocument();
        expect(screen.getByText(/verifica la connessione internet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Validation Errors', () => {
    test('dovrebbe gestire errori di validazione multipli', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      // Submit form con errori multipli
      await user.click(screen.getByRole('button', { name: /registrati/i }));

      await waitFor(() => {
        expect(screen.getByText(/email è richiesta/i)).toBeInTheDocument();
        expect(screen.getByText(/password è richiesta/i)).toBeInTheDocument();
        expect(screen.getByText(/nome è richiesto/i)).toBeInTheDocument();
        expect(screen.getByText(/cognome è richiesto/i)).toBeInTheDocument();
      });
    });

    test('dovrebbe gestire errore formato email', async () => {
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

    test('dovrebbe gestire password troppo debole', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), '123');
      await user.type(screen.getByLabelText(/conferma password/i), '123');
      await user.click(screen.getByRole('button', { name: /registrati/i }));

      await waitFor(() => {
        expect(screen.getByText(/password troppo debole/i)).toBeInTheDocument();
        expect(screen.getByText(/almeno 8 caratteri/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Errors', () => {
    test('dovrebbe gestire credenziali non valide', async () => {
      server.use(...errorHandlers.invalidCredentials);
      
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/password/i), 'WrongPassword');
      await user.click(screen.getByRole('button', { name: /accedi/i }));

      await waitFor(() => {
        expect(screen.getByText(/credenziali non valide/i)).toBeInTheDocument();
        expect(screen.getByText(/email o password errati/i)).toBeInTheDocument();
      });
    });

    test('dovrebbe gestire account bloccato', async () => {
      server.use(...errorHandlers.accountBlocked);
      
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
        expect(screen.getByText(/contatta il supporto/i)).toBeInTheDocument();
      });
    });

    test('dovrebbe gestire tentativo di registrazione con email esistente', async () => {
      server.use(...errorHandlers.emailExists);
      
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      await user.selectOptions(screen.getByRole('combobox', { name: /ruolo/i }), 'parent');
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'Test123!');
      await user.type(screen.getByLabelText(/conferma password/i), 'Test123!');
      await user.type(screen.getByLabelText(/nome/i), 'Mario');
      await user.type(screen.getByLabelText(/cognome/i), 'Rossi');
      await user.click(screen.getByRole('button', { name: /registrati/i }));

      await waitFor(() => {
        expect(screen.getByText(/email già registrata/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /vai al login/i })).toBeInTheDocument();
      });
    });
  });

  describe('Session Management Errors', () => {    test('dovrebbe gestire token scaduto', async () => {
      server.use(...errorHandlers.tokenExpired);
      
      // Simula token scaduto in localStorage
      localStorage.setItem('authToken', 'expired-token');
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/sessione scaduta/i)).toBeInTheDocument();
        expect(screen.getByText(/effettua nuovamente il login/i)).toBeInTheDocument();
        expect(localStorage.getItem('authToken')).toBeNull();
      });
    });    test('dovrebbe gestire token non valido', async () => {
      server.use(...errorHandlers.invalidToken);
      
      localStorage.setItem('authToken', 'invalid-token');
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/token non valido/i)).toBeInTheDocument();
        expect(localStorage.getItem('authToken')).toBeNull();
      });
    });
  });

  describe('Rate Limiting Errors', () => {
    test('dovrebbe gestire troppi tentativi di login', async () => {
      server.use(...errorHandlers.rateLimited);
      
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'WrongPassword');
      await user.click(screen.getByRole('button', { name: /accedi/i }));

      await waitFor(() => {
        expect(screen.getByText(/troppi tentativi/i)).toBeInTheDocument();
        expect(screen.getByText(/riprova tra 15 minuti/i)).toBeInTheDocument();
      });
    });
  });

  describe('Recovery Actions', () => {
    test('dovrebbe fornire pulsante retry per errori di rete', async () => {
      server.use(...errorHandlers.networkError);
      
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Test123!');
      await user.click(screen.getByRole('button', { name: /accedi/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /riprova/i })).toBeInTheDocument();
      });

      // Test retry
      server.resetHandlers(); // Rimuove l'errore
      await user.click(screen.getByRole('button', { name: /riprova/i }));

      await waitFor(() => {
        expect(screen.queryByText(/errore di connessione/i)).not.toBeInTheDocument();
      });
    });

    test('dovrebbe fornire link al supporto per errori critici', async () => {
      server.use(...errorHandlers.accountBlocked);
      
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
        expect(screen.getByRole('link', { name: /contatta supporto/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Display', () => {
    test('dovrebbe mostrare errori con icone appropriate', async () => {
      server.use(...errorHandlers.invalidCredentials);
      
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Wrong');
      await user.click(screen.getByRole('button', { name: /accedi/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-icon')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toHaveClass('error-message');
      });
    });

    test('dovrebbe auto-nascondere messaggi di errore temporanei', async () => {
      server.use(...errorHandlers.networkError);
      
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Test123!');
      await user.click(screen.getByRole('button', { name: /accedi/i }));

      await waitFor(() => {
        expect(screen.getByText(/errore di connessione/i)).toBeInTheDocument();
      });

      // Verifica auto-dismiss dopo 5 secondi
      await waitFor(() => {
        expect(screen.queryByText(/errore di connessione/i)).not.toBeInTheDocument();
      }, { timeout: 6000 });
    });
  });
});
