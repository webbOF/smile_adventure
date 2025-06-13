import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, FormField, Card, Alert, Layout } from '../components/UI';
import { validateEmail, validatePassword } from '../utils/validation';

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
      
      // Navigation handled by useEffect above
    } catch (error) {
      console.error('Login error:', error);
      // Error displayed by authError from context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout variant="centered">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '2rem 0'
      }}>
        <Card 
          title="Accedi a Smile Adventure"
          subtitle="Benvenuto nella piattaforma di apprendimento per bambini"
          style={{ width: '100%', maxWidth: '400px' }}
        >
          {authError && (
            <Alert variant="error" style={{ marginBottom: '1rem' }}>
              {authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <FormField
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="inserisci@email.com"
                autoComplete="email"
              />

              <FormField
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                placeholder="Inserisci la password"
                autoComplete="current-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                    aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                }
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Ricordami
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </div>
          </form>

          <div style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <Link 
              to="/forgot-password" 
              style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}
            >
              Password dimenticata?
            </Link>
            
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Non hai un account?{' '}
              <Link 
                to="/register" 
                style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
              >
                Registrati
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default LoginPage;
