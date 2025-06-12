import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  HeartIcon, 
  TrophyIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: 'Gamification Coinvolgente',
      description: 'Trasforma l\'igiene dentale in un\'avventura magica con personaggi, livelli e ricompense.',
    },
    {
      icon: TrophyIcon,
      title: 'Sistema di Ricompense',
      description: 'I bambini guadagnano punti, badge e sbloccano nuovi contenuti completando le routine.',
    },
    {
      icon: ChartBarIcon,
      title: 'Monitoraggio Progressi',
      description: 'I genitori possono seguire i progressi e ricevere report dettagliati sui miglioramenti.',
    },
    {
      icon: UserGroupIcon,
      title: 'Supporto Professionale',
      description: 'Connessione diretta con dentisti e igienisti per consigli personalizzati.',
    },
    {
      icon: HeartIcon,
      title: 'Abitudini Salutari',
      description: 'Aiuta a sviluppare routine di igiene orale che durano per tutta la vita.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Sicuro e Affidabile',
      description: 'Piattaforma sicura con contenuti educativi approvati da professionisti.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-glow">
                  <span className="text-white text-4xl">😊</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-display font-bold gradient-text">
                  Smile Adventure
                </h1>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Trasforma l'igiene dentale dei tuoi bambini in un'avventura divertente e coinvolgente. 
              Giochi, ricompense e monitoraggio dei progressi per sorrisi più sani!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register" 
                className="game-button text-lg px-8 py-4"
              >
                🚀 Inizia l'Avventura
              </Link>
              <Link 
                to="/login" 
                className="btn-outline text-lg px-8 py-4"
              >
                Accedi
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-bounce-slow">
          <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">⭐</span>
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-pulse-slow">
          <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
            <span className="text-xl">🦷</span>
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-star-twinkle">
          <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
            <span className="text-sm">✨</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Perché Scegliere Smile Adventure?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una piattaforma completa che unisce divertimento ed educazione per creare abitudini 
              di igiene orale durature nei bambini.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="dental-card hover:shadow-dental-glow transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-3">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-dental-mint to-dental-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Come Funziona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tre semplici passi per iniziare l'avventura verso sorrisi più sani
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Registrati
              </h3>
              <p className="text-gray-600">
                Crea un account per te e aggiungi i profili dei tuoi bambini. 
                È veloce, sicuro e completamente gratuito!
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Gioca e Impara
              </h3>
              <p className="text-gray-600">
                I bambini completano attività divertenti, giochi educativi e 
                routine di igiene orale guidate dai nostri personaggi.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Monitora i Progressi
              </h3>
              <p className="text-gray-600">
                Segui i miglioramenti, celebra i successi e ricevi consigli 
                personalizzati dai professionisti della salute orale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-bold text-white mb-6">
            Pronto a Iniziare l'Avventura?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Unisciti a migliaia di famiglie che hanno già trasformato l'igiene dentale 
            in un momento di gioia e apprendimento.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/register" 
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🎮 Inizia Gratis Ora
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-200"
            >
              Ho già un account
            </Link>
          </div>
          
          <p className="text-primary-200 text-sm mt-6">
            ✅ Nessuna carta di credito richiesta • ✅ Setup in 2 minuti • ✅ Sicuro al 100%
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
