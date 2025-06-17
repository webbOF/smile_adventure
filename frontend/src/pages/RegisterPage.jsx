import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateForm } from '../utils/validation';
import notificationService from '../services/notificationService';
import { USER_ROLES, ROUTES } from '../utils/constants';
import { Header, Footer } from '../components/UI';
import './RegisterPage.css';

const RegisterPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') === 'professional' ? USER_ROLES.PROFESSIONAL : USER_ROLES.PARENT;
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: initialRole,
    license_number: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();

  // Reindirizza se già autenticato
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for role change
    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Clear license_number if switching away from professional
        license_number: value === USER_ROLES.PROFESSIONAL ? prev.license_number : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear license_number error when switching roles
    if (name === 'role' && errors.license_number) {
      setErrors(prev => ({
        ...prev,
        license_number: ''
      }));
    }
  };

  // Form validation schema
  const getValidationSchema = () => {
    const baseSchema = {
      email: { required: true, email: true },
      password: { required: true, password: true },
      confirmPassword: { required: true, confirmPassword: formData.password },
      firstName: { required: true, name: true },
      lastName: { required: true, name: true },
      phone: { phone: true }, // Optional
      role: { required: true }
    };

    // Add license number validation for professionals
    if (formData.role === USER_ROLES.PROFESSIONAL) {
      baseSchema.license_number = { 
        required: true,
        customValidator: (value) => {
          if (!value) return false;
          return value.trim().length >= 3 && value.trim().length <= 100;
        }
      };
    }

    return baseSchema;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationSchema = getValidationSchema();
    const formErrors = validateForm(formData, validationSchema);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      console.log('RegisterPage: Starting registration process');
      await register(formData);
      console.log('RegisterPage: Registration completed, waiting for redirect');
      notificationService.success('Registrazione completata con successo!');
      // Navigation handled by useEffect when isAuthenticated changes
    } catch (error) {
      console.error('RegisterPage: Registration error:', error);
      notificationService.error(error.message || 'Errore durante la registrazione. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const roleOptions = [
    { value: USER_ROLES.PARENT, label: 'Genitore/Tutore' },
    { value: USER_ROLES.PROFESSIONAL, label: 'Professionista Sanitario' }
  ];
  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="floating-particles">
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
            <h1 className="auth-title">Benvenuto!</h1>
            <p className="auth-subtitle">Crea il tuo account per iniziare l&apos;avventura del sorriso</p>
          </div>

          {authError && (
            <div className="error-alert">
              <div className="error-icon">⚠️</div>
              <span>{authError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Role Selection */}
            <div className="form-group">
              <label htmlFor="role" className="form-label">Tipo di Account</label>
              <div className="select-wrapper">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`form-select ${errors.role ? 'error' : ''}`}
                  required
                  disabled={isSubmitting}
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="select-icon">👥</div>
              </div>
              {errors.role && <span className="error-message">{errors.role}</span>}
            </div>

            {/* Personal Information */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">Nome</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Mario"
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="input-icon">👤</div>
                </div>
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Cognome</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Rossi"
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="input-icon">👤</div>
                </div>
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="mario.rossi@email.com"
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
              <label htmlFor="phone" className="form-label">Telefono (opzionale)</label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+39 123 456 7890"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  disabled={isSubmitting}
                  autoComplete="tel"
                />
                <div className="input-icon">📞</div>
              </div>
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            {/* License Number - Only for professionals */}
            {formData.role === USER_ROLES.PROFESSIONAL && (
              <div className="form-group">
                <label htmlFor="license_number" className="form-label">Numero di Licenza Professionale</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="license_number"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="Es. AB123456"
                    className={`form-input ${errors.license_number ? 'error' : ''}`}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="input-icon">🏥</div>
                </div>
                <small className="helper-text">Inserisci il numero della tua licenza professionale sanitaria</small>
                {errors.license_number && <span className="error-message">{errors.license_number}</span>}
              </div>
            )}

            {/* Password Fields */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 caratteri"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  required
                  disabled={isSubmitting}
                  autoComplete="new-password"
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
              <small className="helper-text">La password deve contenere almeno 8 caratteri</small>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Conferma Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ripeti la password"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  required
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <div className="input-icon">🔒</div>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
            
            <button 
              type="submit" 
              className={`auth-button ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              <span className="button-text">
                {isSubmitting ? 'Registrazione in corso...' : 'Registrati'}
              </span>
              {isSubmitting && <div className="button-spinner"></div>}
            </button>          </form>
          
          <div className="auth-footer">
            <p className="auth-footer-text">
              Hai già un account?{' '}
              <Link to={ROUTES.LOGIN} className="auth-link">
                Accedi qui
              </Link>
            </p>          </div>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
};

export default RegisterPage;
