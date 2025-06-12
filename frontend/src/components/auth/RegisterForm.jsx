import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente form di registrazione
 * Utilizza react-hook-form per la gestione del form e delle validazioni
 */
const RegisterForm = () => {
  const { register: registerUser, isLoading, error, resetError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Inizializza react-hook-form
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm();
  
  // Ottiene il valore corrente della password per la validazione
  const password = watch('password', '');
  
  // Reset eventuali errori quando il componente viene montato
  useEffect(() => {
    resetError();
  }, [resetError]);
    // Gestisce l'invio del form
  const onSubmit = async (data) => {
    try {
      // Prepara i dati utente per la registrazione
      const userData = {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'parent' // Default role
      };
      
      const result = await registerUser(userData);
      
      if (result.success) {
        if (result.autoLogin) {
          // Se il login automatico è avvenuto, vai alla dashboard
          toast.success('Registrazione completata! Benvenuto in Smile Adventure!');
          navigate('/dashboard');
        } else {
          // Altrimenti vai al login
          toast.success('Registrazione completata! Ora puoi effettuare il login.');
          navigate('/login');
        }
      } else {
        toast.error(result.error || 'Errore durante la registrazione');
      }
    } catch (err) {
      toast.error('Si è verificato un errore. Riprova più tardi.');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Crea un nuovo account
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            id="firstName"
            type="text"
            {...register('firstName', {
              required: 'Il nome è obbligatorio',
              minLength: {
                value: 2,
                message: 'Il nome deve contenere almeno 2 caratteri'
              }
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary 
              ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Il tuo nome"
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
          )}
        </div>
        
        {/* Cognome */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Cognome
          </label>
          <input
            id="lastName"
            type="text"
            {...register('lastName', {
              required: 'Il cognome è obbligatorio',
              minLength: {
                value: 2,
                message: 'Il cognome deve contenere almeno 2 caratteri'
              }
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary 
              ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Il tuo cognome"
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
          )}
        </div>
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email è obbligatoria',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Inserisci un indirizzo email valido'
              }
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary 
              ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="La tua email"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password è obbligatoria',
                minLength: {
                  value: 8,
                  message: 'La password deve contenere almeno 8 caratteri'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: 'La password deve contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale'
                }
              })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary 
                ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="La tua password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              <span className="text-gray-500">
                {showPassword ? 'Nascondi' : 'Mostra'}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            La password deve contenere minimo 8 caratteri, una lettera maiuscola, 
            una minuscola, un numero e un carattere speciale.
          </p>
        </div>
        
        {/* Conferma Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Conferma Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword', {
                required: 'Conferma password è richiesta',
                validate: (value) => {
                  if (value === password) {
                    return true;
                  }
                  return 'Le password non coincidono';
                }
              })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary 
                ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Conferma la tua password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              <span className="text-gray-500">
                {showConfirmPassword ? 'Nascondi' : 'Mostra'}
              </span>
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        {/* Termini e Condizioni */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              {...register('terms', {
                required: 'Devi accettare i termini e le condizioni'
              })}
              className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
              disabled={isLoading}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              Accetto i <Link to="/terms" className="text-primary hover:underline">Termini e Condizioni</Link> e la <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </label>
            {errors.terms && (
              <p className="mt-1 text-xs text-red-600">{errors.terms.message}</p>
            )}
          </div>
        </div>
        
        {/* Pulsante Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrazione in corso...
            </span>
          ) : 'Registrati'}
        </button>
      </form>
      
      {/* Link Login */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Hai già un account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
