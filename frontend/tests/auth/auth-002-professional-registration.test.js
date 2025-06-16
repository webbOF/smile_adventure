/**
 * AUTH-002: Professional Registration Test
 * 
 * Test della registrazione di un nuovo professionista con validazione
 * credenziali professionali e verifiche specifiche del ruolo.
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

describe('AUTH-002: Professional Registration', () => {
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

  test('dovrebbe mostrare campi aggiuntivi per professional', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    // Seleziona ruolo professional
    await user.selectOptions(screen.getByRole('combobox', { name: /ruolo/i }), 'professional');

    // Verifica campi specifici professional
    await waitFor(() => {
      expect(screen.getByLabelText(/numero albo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/specializzazione/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/telefono/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe registrare con successo un professional con dati validi', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    // Compilazione form professional
    await user.selectOptions(screen.getByRole('combobox', { name: /ruolo/i }), 'professional');
    await user.type(screen.getByLabelText(/email/i), 'dr.smith@clinic.com');
    await user.type(screen.getByLabelText(/^password/i), 'SecureProf123!');
    await user.type(screen.getByLabelText(/conferma password/i), 'SecureProf123!');
    await user.type(screen.getByLabelText(/nome/i), 'Dr. John');
    await user.type(screen.getByLabelText(/cognome/i), 'Smith');
    await user.type(screen.getByLabelText(/numero albo/i), 'ALBO123456');
    await user.selectOptions(screen.getByLabelText(/specializzazione/i), 'Neuropsichiatria Infantile');
    await user.type(screen.getByLabelText(/telefono/i), '+39 123 456 7890');

    // Submit form
    await user.click(screen.getByRole('button', { name: /registrati/i }));

    // Verifiche post-registrazione
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-jwt-token-professional');
      expect(screen.getByText(/registrazione completata/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe validare numero albo professionale', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    await user.selectOptions(screen.getByRole('combobox', { name: /ruolo/i }), 'professional');
    await user.type(screen.getByLabelText(/numero albo/i), '123'); // Troppo corto

    await user.click(screen.getByRole('button', { name: /registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/numero albo deve essere almeno 6 caratteri/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe validare formato telefono', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    await user.selectOptions(screen.getByRole('combobox', { name: /ruolo/i }), 'professional');
    await user.type(screen.getByLabelText(/telefono/i), '123abc'); // Formato non valido

    await user.click(screen.getByRole('button', { name: /registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/formato telefono non valido/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe richiedere specializzazione', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    await user.selectOptions(screen.getByRole('combobox', { name: /ruolo/i }), 'professional');
    // Non seleziona specializzazione
    
    await user.click(screen.getByRole('button', { name: /registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/specializzazione è richiesta/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe gestire errore numero albo già esistente', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    await user.selectOptions(screen.getByRole('combobox', { name: /ruolo/i }), 'professional');
    await user.type(screen.getByLabelText(/email/i), 'new.professional@clinic.com');
    await user.type(screen.getByLabelText(/^password/i), 'SecureProf123!');
    await user.type(screen.getByLabelText(/conferma password/i), 'SecureProf123!');
    await user.type(screen.getByLabelText(/nome/i), 'Dr. Jane');
    await user.type(screen.getByLabelText(/cognome/i), 'Doe');
    await user.type(screen.getByLabelText(/numero albo/i), 'EXISTING123'); // Numero già esistente
    await user.selectOptions(screen.getByLabelText(/specializzazione/i), 'Psicologia');
    await user.type(screen.getByLabelText(/telefono/i), '+39 123 456 7890');

    await user.click(screen.getByRole('button', { name: /registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/numero albo già registrato/i)).toBeInTheDocument();
    });
  });

  test('dovrebbe mostrare termini specifici per professional', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    await user.selectOptions(screen.getByRole('combobox', { name: /ruolo/i }), 'professional');

    await waitFor(() => {
      expect(screen.getByText(/codice deontologico/i)).toBeInTheDocument();
      expect(screen.getByText(/privacy dati pazienti/i)).toBeInTheDocument();
    });
  });
});
