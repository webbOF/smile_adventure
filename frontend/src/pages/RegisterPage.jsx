import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, FormField, Card, Alert, Layout, Select } from '../components/UI';
import { validateForm } from '../utils/validation';
import { USER_ROLES } from '../utils/constants';

const RegisterPage = () => {  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: USER_ROLES.PARENT
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
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

    return baseSchema;  };

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
      // Navigation handled by useEffect when isAuthenticated changes
    } catch (error) {
      console.error('RegisterPage: Registration error:', error);
      // Error displayed by authError from context
    } finally {
      setIsSubmitting(false);
    }
  };
  const roleOptions = [
    { value: USER_ROLES.PARENT, label: 'Genitore/Tutore' },
    { value: USER_ROLES.PROFESSIONAL, label: 'Professionista Sanitario' }
  ];

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
          title="Registrati a Smile Adventure"
          subtitle="Crea il tuo account per iniziare il viaggio di apprendimento"
          style={{ width: '100%', maxWidth: '500px' }}
        >
          {authError && (
            <Alert variant="error" style={{ marginBottom: '1rem' }}>
              {authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Role Selection */}
              <Select
                name="role"
                label="Tipo di Account"
                value={formData.role}
                onChange={handleChange}
                options={roleOptions}
                error={errors.role}
                required
              />

              {/* Personal Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormField
                  name="firstName"
                  type="text"
                  label="Nome"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                  placeholder="Mario"
                />

                <FormField
                  name="lastName"
                  type="text"
                  label="Cognome"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                  placeholder="Rossi"
                />
              </div>

              <FormField
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="mario.rossi@email.com"
                autoComplete="email"
              />

              <FormField
                name="phone"
                type="tel"
                label="Telefono (opzionale)"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+39 123 456 7890"
                autoComplete="tel"
              />

              {/* Password Fields */}
              <FormField
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                placeholder="Minimum 8 caratteri"
                autoComplete="new-password"
                helperText="La password deve contenere almeno 8 caratteri"
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
              />              <FormField
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                label="Conferma Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                placeholder="Ripeti la password"
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrazione in corso...' : 'Registrati'}
              </Button>
            </div>
          </form>

          <div style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            Hai già un account?{' '}
            <Link 
              to="/login" 
              style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
            >
              Accedi
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default RegisterPage;
