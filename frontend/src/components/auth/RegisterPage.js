import React from 'react';
import RegisterForm from './RegisterForm';

const RegisterPage = () => {
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

        <RegisterForm />
        
        {/* Demo info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            ℹ️ Informazioni sulla registrazione:
          </h3>
          <div className="text-sm text-blue-700">
            <p>
              La registrazione ti consente di accedere a tutte le funzionalità di Smile Adventure.
              Per assistenza contatta il nostro team di supporto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
