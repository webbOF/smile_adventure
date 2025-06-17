import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import notificationService from '../services/notificationService';
import Button from '../components/UI/Button';
import { Header, Footer } from '../components/UI';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Verifica che il token sia presente
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Almeno ${minLength} caratteri`);
    }
    if (!hasUpperCase) {
      errors.push('Almeno una lettera maiuscola');
    }
    if (!hasLowerCase) {
      errors.push('Almeno una lettera minuscola');
    }
    if (!hasNumbers) {
      errors.push('Almeno un numero');
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Rimuovi errore quando l'utente inizia a digitare
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validazione
    const newErrors = {};
    
    // Validazione password
    const passwordErrors = validatePassword(formData.new_password);
    if (passwordErrors.length > 0) {
      newErrors.new_password = passwordErrors.join(', ');
    }
    
    // Validazione conferma password
    if (!formData.new_password_confirm) {
      newErrors.new_password_confirm = 'Conferma password è richiesta';
    } else if (formData.new_password !== formData.new_password_confirm) {
      newErrors.new_password_confirm = 'Le password non corrispondono';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.confirmPasswordReset({
        token: token,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm
      });
      
      setIsSuccess(true);
      notificationService.showSuccess(
        'Password reimpostata con successo! Ora puoi effettuare il login.'
      );
      
      // Redirect dopo 3 secondi
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Errore reset password:', error);
      
      if (error.response?.status === 400) {
        setErrors({
          general: 'Token non valido o scaduto. Richiedi un nuovo link di reset.'
        });
        setTokenValid(false);
      } else {
        setErrors({
          general: 'Errore durante il reset della password. Riprova.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };  if (!tokenValid) {
    return (
      <>
        <Header />
        <div className="reset-password-page">
          <div className="reset-password-container">
            <div className="reset-error">
              <div className="error-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              
              <h1>Link non valido</h1>
              <p>
                Il link per il reset della password non è valido o è scaduto.
              </p>
              
              <div className="error-actions">
                <Link to="/forgot-password">
                  <Button variant="primary" size="large">
                    Richiedi nuovo link
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button variant="outline" size="large">
                    Torna al Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>        <Footer />
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <Header />
        <div className="reset-password-page">
          <div className="reset-password-container">
            <div className="reset-success">
              <div className="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
              
              <h1>Password Reimpostata!</h1>
              <p>
                La tua password è stata reimpostata con successo. 
                Ora puoi effettuare il login con la nuova password.
              </p>
              
              <div className="success-message">
                <p>Verrai reindirizzato automaticamente alla pagina di login...</p>
              </div>
              
              <Link to="/login">
                <Button variant="primary" size="large">
                  Vai al Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />      </>
    );
  }  return (
    <>
      <Header />
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-header">
            <h1>Imposta Nuova Password</h1>
            <p>
              Scegli una nuova password sicura per il tuo account.
            </p>
          </div>

          {errors.general && (
            <div className="alert alert-error">
              {errors.general}
            </div>
          )}

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="new_password" className="form-label">
              Nuova Password
            </label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleInputChange}
              className={`form-input ${errors.new_password ? 'error' : ''}`}
              placeholder="Inserisci la nuova password"
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.new_password && (
              <span className="error-message">{errors.new_password}</span>
            )}
            
            <div className="password-requirements">
              <p>La password deve contenere:</p>
              <ul>
                <li>Almeno 8 caratteri</li>
                <li>Una lettera maiuscola</li>
                <li>Una lettera minuscola</li>
                <li>Un numero</li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="new_password_confirm" className="form-label">
              Conferma Nuova Password
            </label>
            <input
              type="password"
              id="new_password_confirm"
              name="new_password_confirm"
              value={formData.new_password_confirm}
              onChange={handleInputChange}
              className={`form-input ${errors.new_password_confirm ? 'error' : ''}`}
              placeholder="Conferma la nuova password"
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.new_password_confirm && (
              <span className="error-message">{errors.new_password_confirm}</span>
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
            {isLoading ? 'Reimpostazione...' : 'Reimposta Password'}
          </Button>        </form>          <div className="reset-password-footer">
            <p>
              Ti sei ricordato della password?{' '}
              <Link to="/login" className="auth-link">
                Torna al Login
              </Link>
            </p>
          </div>        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPasswordPage;
