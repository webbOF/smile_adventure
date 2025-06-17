import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import notificationService from '../services/notificationService';
import Button from '../components/UI/Button';
import { Header } from '../components/UI';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validazione
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email è richiesta';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Formato email non valido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.requestPasswordReset(email.trim().toLowerCase());
      
      setIsSubmitted(true);
      notificationService.showSuccess(
        'Email inviata! Controlla la tua casella di posta per le istruzioni.'
      );
    } catch (error) {
      console.error('Errore richiesta reset password:', error);
      
      // Per sicurezza, mostriamo sempre un messaggio generico
      notificationService.showInfo(
        'Se un account con questa email esiste, riceverai le istruzioni per il reset.'
      );
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };
  if (isSubmitted) {
    return (
      <>
        <Header />
        <div className="forgot-password-page">
          <div className="forgot-password-container">
            <div className="forgot-password-success">
              <div className="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
              
              <h1>Email Inviata!</h1>
            
            <p className="success-message">
              Se un account con l&apos;indirizzo <strong>{email}</strong> esiste, 
              riceverai un&apos;email con le istruzioni per reimpostare la password.
            </p>
            
            <div className="success-instructions">
              <h3>Cosa fare ora:</h3>
              <ol>
                <li>Controlla la tua casella di posta elettronica</li>
                <li>Cerca un&apos;email da Smile Adventure</li>
                <li>Clicca sul link nell&apos;email per reimpostare la password</li>
                <li>Se non vedi l&apos;email, controlla la cartella spam</li>
              </ol>
            </div>
            
            <div className="success-actions">
              <Link to="/login">
                <Button variant="primary" size="large">
                  Torna al Login
                </Button>
              </Link>
              
              <button 
                type="button" 
                className="resend-link"
                onClick={() => {
                  setIsSubmitted(false);                  setEmail('');
                }}
              >
                Non hai ricevuto l&apos;email? Riprova
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }
  return (
    <>
      <Header />
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="forgot-password-header">
            <h1>Password Dimenticata?</h1>
            <p>
              Inserisci il tuo indirizzo email e ti invieremo un link per 
              reimpostare la password.
            </p>
          </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Indirizzo Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Inserisci la tua email"
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Invio in corso...' : 'Invia Link di Reset'}
          </Button>
        </form>

        <div className="forgot-password-footer">
          <p>
            Ti sei ricordato della password?{' '}
            <Link to="/login" className="auth-link">
              Torna al Login
            </Link>
          </p>
          
          <p>
            Non hai un account?{' '}
            <Link to="/register" className="auth-link">
              Registrati
            </Link>
          </p>
        </div>

        <div className="forgot-password-help">
          <details>
            <summary>Hai ancora problemi?</summary>
            <div className="help-content">
              <p>Se continui ad avere difficoltà:</p>
              <ul>
                <li>Verifica che l&apos;indirizzo email sia corretto</li>                <li>Controlla la cartella spam/junk</li>
                <li>Assicurati che l&apos;account sia stato registrato con questa email</li>
                <li>Contatta il supporto se il problema persiste</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
    </>
  );
};

export default ForgotPasswordPage;
