import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword } from '../utils/validation';
import notificationService from '../services/notificationService';
import { ROUTES } from '../utils/constants';
import { Header } from '../components/UI';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Reindirizza se già autenticato
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email richiesta';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (!formData.password) {
      newErrors.password = 'Password richiesta';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password deve essere almeno 8 caratteri';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
        notificationService.success('Login effettuato con successo!');
      // Navigation handled by useEffect above
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      notificationService.error(error.message || 'Errore durante il login. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>          <div className="floating-particles">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={`particle-${i}`} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>
        </div>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">😊</div>
              <span className="logo-text">Smile Adventure</span>
            </div>
            <h1 className="auth-title">Bentornato!</h1>
            <p className="auth-subtitle">Accedi al tuo account per continuare l&apos;avventura</p>
          </div>

          {authError && (
            <div className="error-alert">
              <div className="error-icon">⚠️</div>
              <span>{authError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="inserisci@email.com"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />
                <div className="input-icon">📧</div>
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Inserisci la tua password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">Ricordami</span>
              </label>
              
              <Link to={ROUTES.PASSWORD_RESET_REQUEST} className="forgot-password-link">
                Password dimenticata?
              </Link>
            </div>
            
            <button 
              type="submit" 
              className={`auth-button ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              <span className="button-text">
                {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
              </span>
              {isSubmitting && <div className="button-spinner"></div>}
            </button>
          </form>
          
          <div className="auth-footer">
            <p className="auth-footer-text">
              Non hai un account?{' '}
              <Link to={ROUTES.REGISTER} className="auth-link">
                Registrati qui              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginPage;
