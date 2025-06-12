import React from 'react';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

/**
 * 404 Not Found Page Component
 * Shows when user tries to access a route that doesn't exist
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>
        
        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pagina Non Trovata
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Ops! La pagina che stai cercando non esiste.
          </p>
          <p className="text-gray-500">
            Potrebbe essere stata spostata, eliminata o hai digitato l'URL sbagliato.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Torna Indietro
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Vai alla Home
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Potrebbero interessarti:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a 
              href="/" 
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Homepage
            </a>
            <a 
              href="/login" 
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Accedi
            </a>
            <a 
              href="/register" 
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Registrati
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
