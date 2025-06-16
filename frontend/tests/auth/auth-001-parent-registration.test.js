/**
 * AUTH-001: Parent Registration Test
 * 
 * Test della registrazione di un nuovo genitore con validazione
 * completa dei dati e verifiche di sicurezza.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import RegisterPage from '../../src/pages/RegisterPage';
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

describe('AUTH-001: Parent Registration', () => {
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

  test('dovrebbe mostrare il form di registrazione per parent', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    // Verifica presenza elementi form
    expect(screen.getByRole('combobox', { name: /ruolo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/conferma password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cognome/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrati/i })).toBeInTheDocument();
  });

  test('dovrebbe registrare con successo un parent con dati validi', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    // Compilazione form
    await user.selectOptions(screen.getByRole('combobox', { name: /ruolo/i }), 'parent');
    await user.type(screen.getByLabelText(/email/i), 'parent.test@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Test123!');
    await user.type(screen.getByLabelText(/conferma password/i), 'Test123!');
    await user.type(screen.getByLabelText(/nome/i), 'Mario');
    await user.type(screen.getByLabelText(/cognome/i), 'Rossi');

    // Submit form
    await user.click(screen.getByRole('button', { name: /registrati/i }));

    // Verifiche post-registrazione
    await waitFor(() => {
      // Token salvato in localStorage
      expect(localStorage.getItem('token')).toBe('mock-jwt-token-parent');
      
      // Messaggio di successo
      expect(screen.getByText(/registrazione completata/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe mostrare errori per dati non validi', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    // Submit form vuoto
    await user.click(screen.getByRole('button', { name: /registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/email è richiesta/i)).toBeInTheDocument();
      expect(screen.getByText(/password è richiesta/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe validare il formato email', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText(/email/i), 'email-non-valida');
    await user.click(screen.getByRole('button', { name: /registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/formato email non valido/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe validare la corrispondenza delle password', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText(/^password/i), 'Test123!');
    await user.type(screen.getByLabelText(/conferma password/i), 'DiversaPassword!');
    await user.click(screen.getByRole('button', { name: /registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/password non corrispondono/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe gestire errore email già esistente', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    // Email già esistente (mock configurato per fallire)
    await user.selectOptions(screen.getByRole('combobox', { name: /ruolo/i }), 'parent');
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Test123!');
    await user.type(screen.getByLabelText(/conferma password/i), 'Test123!');
    await user.type(screen.getByLabelText(/nome/i), 'Mario');
    await user.type(screen.getByLabelText(/cognome/i), 'Rossi');

    await user.click(screen.getByRole('button', { name: /registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/email già registrata/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe disabilitare il pulsante durante il caricamento', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    await user.selectOptions(screen.getByRole('combobox', { name: /ruolo/i }), 'parent');
    await user.type(screen.getByLabelText(/email/i), 'parent.test@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Test123!');
    await user.type(screen.getByLabelText(/conferma password/i), 'Test123!');
    await user.type(screen.getByLabelText(/nome/i), 'Mario');
    await user.type(screen.getByLabelText(/cognome/i), 'Rossi');

    const submitButton = screen.getByRole('button', { name: /registrati/i });
    
    await user.click(submitButton);

    // Il pulsante dovrebbe essere disabilitato durante la richiesta
    expect(submitButton).toBeDisabled();
  });
});
