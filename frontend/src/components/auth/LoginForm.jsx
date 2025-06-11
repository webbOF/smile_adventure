import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente form di login
 * Utilizza react-hook-form per la gestione del form e delle validazioni
 */
const LoginForm = () => {
  const { login, isLoading, error, resetError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  
  // Recupera il percorso da cui l'utente è stato reindirizzato (se disponibile)
  const from = location.state?.from || '/';
  
  // Inizializza react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();
  
  // Reset eventuali errori quando il componente viene montato
  React.useEffect(() => {
    resetError();
  }, [resetError]);
  
  // Gestisce l'invio del form
  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success('Login effettuato con successo!');
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || 'Errore durante il login');
      }
    } catch (err) {
      toast.error('Si è verificato un errore. Riprova più tardi.');
    }
  };
  
  // Toggle per mostrare/nascondere la password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Accedi al tuo account
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo Email */}
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
        
        {/* Campo Password */}
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
                  value: 6,
                  message: 'La password deve contenere almeno 6 caratteri'
                }
              })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary 
                ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="La tua password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showPassword ? (
                <span className="text-gray-500">Nascondi</span>
              ) : (
                <span className="text-gray-500">Mostra</span>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        {/* Link Password dimenticata */}
        <div className="flex justify-end">
          <Link to="/password-reset" className="text-sm text-primary hover:underline">
            Password dimenticata?
          </Link>
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
              Accesso in corso...
            </span>
          ) : 'Accedi'}
        </button>
      </form>
      
      {/* Link Registrazione */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Non hai ancora un account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
