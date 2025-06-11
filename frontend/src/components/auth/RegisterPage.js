import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../hooks/useAuthStore';
import { EyeIcon, EyeSlashIcon, UserIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole, setUserRole] = useState('parent');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }

    try {
      const userData = {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        role: userRole,
        phone_number: data.phoneNumber || null,
        date_of_birth: data.dateOfBirth || null,
      };

      await registerUser(userData);
      toast.success('Registrazione completata con successo!');
      
      // Redirect based on user role
      if (userRole === 'parent') {
        navigate('/parent');
      } else {
        navigate('/professional');
      }
    } catch (error) {
      toast.error(error.message || 'Errore durante la registrazione');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-glow">
              <span className="text-white text-4xl">😊</span>
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-900">
            Unisciti a Smile Adventure!
          </h2>
          <p className="mt-2 text-gray-600">
            Crea il tuo account e inizia l'avventura verso sorrisi più sani
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* User Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Seleziona il tipo di account
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                  userRole === 'parent'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setUserRole('parent')}
              >
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-primary-500" />
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Genitore</h3>
                    <p className="text-sm text-gray-500">
                      Monitora i progressi dei tuoi bambini
                    </p>
                  </div>
                </div>
                {userRole === 'parent' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                  </div>
                )}
              </div>

              <div
                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                  userRole === 'professional'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setUserRole('professional')}
              >
                <div className="flex items-center">
                  <UserIcon className="h-8 w-8 text-primary-500" />
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Professionista</h3>
                    <p className="text-sm text-gray-500">
                      Dentista o igienista dentale
                    </p>
                  </div>
                </div>
                {userRole === 'professional' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                {...register('firstName', {
                  required: 'Nome è richiesto',
                  minLength: {
                    value: 2,
                    message: 'Nome deve essere di almeno 2 caratteri',
                  },
                })}
                type="text"
                className="input-field"
                placeholder="Il tuo nome"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Cognome *
              </label>
              <input
                {...register('lastName', {
                  required: 'Cognome è richiesto',
                  minLength: {
                    value: 2,
                    message: 'Cognome deve essere di almeno 2 caratteri',
                  },
                })}
                type="text"
                className="input-field"
                placeholder="Il tuo cognome"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              {...register('email', {
                required: 'Email è richiesta',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Email non valida',
                },
              })}
              type="email"
              className="input-field"
              placeholder="la-tua-email@esempio.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Telefono
              </label>
              <input
                {...register('phoneNumber')}
                type="tel"
                className="input-field"
                placeholder="+39 123 456 7890"
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Data di nascita
              </label>
              <input
                {...register('dateOfBirth')}
                type="date"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password è richiesta',
                    minLength: {
                      value: 8,
                      message: 'Password deve essere di almeno 8 caratteri',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password deve contenere almeno una maiuscola, una minuscola e un numero',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Crea una password sicura"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Conferma Password *
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Conferma password è richiesta',
                    validate: value => value === password || 'Le password non coincidono',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Ripeti la password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              {...register('acceptTerms', {
                required: 'Devi accettare i termini e condizioni',
              })}
              id="accept-terms"
              name="acceptTerms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-700">
              Accetto i{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Termini e Condizioni
              </a>{' '}
              e la{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Registrazione in corso...
                </div>
              ) : (
                'Crea Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Hai già un account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                Accedi qui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
