import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PlayIcon, PauseIcon, CheckIcon } from '@heroicons/react/24/outline';
import Confetti from 'react-confetti';

const GameSession = () => {
  const { childId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Mock child data
  const child = {
    id: childId,
    name: 'Sofia',
    avatar: '👧',
  };

  // Game steps for dental hygiene routine
  const gameSteps = [
    {
      id: 1,
      title: 'Preparazione',
      description: 'Prendi il tuo spazzolino e il dentifricio!',
      icon: '🦷',
      duration: 30,
      points: 10,
      instructions: 'Assicurati di avere tutto il necessario per una perfetta routine di igiene dentale.',
    },
    {
      id: 2,
      title: 'Spazzolamento',
      description: 'Spazzola tutti i denti per 2 minuti',
      icon: '🪥',
      duration: 120,
      points: 50,
      instructions: 'Muovi lo spazzolino con movimenti circolari delicati. Non dimenticare i denti posteriori!',
    },
    {
      id: 3,
      title: 'Filo Interdentale',
      description: 'Usa il filo interdentale tra tutti i denti',
      icon: '🧵',
      duration: 60,
      points: 30,
      instructions: 'Passa delicatamente il filo tra ogni dente. Questo rimuove i residui che lo spazzolino non raggiunge.',
    },
    {
      id: 4,
      title: 'Collutorio',
      description: 'Sciacqua con il collutorio per 30 secondi',
      icon: '🥤',
      duration: 30,
      points: 20,
      instructions: 'Fai degli sciacqui energici per 30 secondi, poi sputa. Non ingoiare il collutorio!',
    },
    {
      id: 5,
      title: 'Completamento',
      description: 'Perfetto! Hai completato la routine!',
      icon: '⭐',
      duration: 0,
      points: 20,
      instructions: 'Congratulazioni! I tuoi denti sono ora puliti e sani. Ottimo lavoro!',
    },
  ];

  // Timer effect
  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < gameSteps.length - 1) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          const currentStepDuration = gameSteps[currentStep].duration;
          
          if (newTime >= currentStepDuration) {
            handleStepComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const handleStepComplete = () => {
    const step = gameSteps[currentStep];
    setPointsEarned(prev => prev + step.points);
    
    if (currentStep < gameSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTimeElapsed(0);
      setIsPlaying(false);
    } else {
      setSessionComplete(true);
      setShowConfetti(true);
      setIsPlaying(false);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const skipStep = () => {
    handleStepComplete();
  };

  const resetSession = () => {
    setCurrentStep(0);
    setTimeElapsed(0);
    setPointsEarned(0);
    setSessionComplete(false);
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStepData = gameSteps[currentStep];
  const progress = currentStep / (gameSteps.length - 1) * 100;

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        {showConfetti && <Confetti />}
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="card p-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🏆</span>
            </div>
            
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Fantastico, {child.name}!
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Hai completato la tua routine di igiene dentale!
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="dental-card text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{pointsEarned}</div>
                <p className="text-gray-600">Punti Guadagnati</p>
              </div>
              <div className="dental-card text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {gameSteps.reduce((total, step) => total + step.duration, 0) / 60}
                </div>
                <p className="text-gray-600">Minuti di Cura</p>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={resetSession}
                className="w-full game-button"
              >
                🎮 Gioca Ancora
              </button>
              <Link 
                to={`/parent/child/${childId}`}
                className="w-full btn-outline block text-center"
              >
                📊 Vedi Progresso
              </Link>
              <Link 
                to="/parent"
                className="w-full btn-secondary block text-center"
              >
                🏠 Torna alla Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              to="/parent" 
              className="mr-4 p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </Link>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-xl mr-4">
                {child.avatar}
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">
                  Sessione di {child.name}
                </h1>
                <p className="text-gray-600">Routine di igiene dentale</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="score-badge text-lg">
              {pointsEarned} punti
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{currentStep + 1} di {gameSteps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Step */}
          <div className="lg:col-span-2">
            <div className="dental-card h-full">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">{currentStepData.icon}</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  {currentStepData.description}
                </p>
              </div>

              {currentStepData.duration > 0 && (
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-primary-600 mb-2">
                    {formatTime(currentStepData.duration - timeElapsed)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(timeElapsed / currentStepData.duration) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 text-center">
                  {currentStepData.instructions}
                </p>
              </div>

              <div className="flex space-x-4 justify-center">
                {currentStepData.duration > 0 ? (
                  <>
                    <button 
                      onClick={togglePlay}
                      className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                        isPlaying 
                          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                          : 'game-button'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <PauseIcon className="h-5 w-5 mr-2 inline" />
                          Pausa
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-5 w-5 mr-2 inline" />
                          Inizia
                        </>
                      )}
                    </button>
                    <button 
                      onClick={skipStep}
                      className="btn-outline"
                    >
                      <CheckIcon className="h-5 w-5 mr-2 inline" />
                      Completato
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleStepComplete}
                    className="game-button px-8 py-3"
                  >
                    <CheckIcon className="h-5 w-5 mr-2 inline" />
                    Termina Sessione
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Steps Overview */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Passaggi della Routine
              </h3>
              <div className="space-y-3">
                {gameSteps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`flex items-center p-3 rounded-lg transition-all ${
                      index === currentStep 
                        ? 'bg-primary-100 border-2 border-primary-300' 
                        : index < currentStep 
                          ? 'bg-green-100 border-2 border-green-300' 
                          : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                      {index < currentStep ? (
                        <CheckIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <span className="text-lg">{step.icon}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                      {step.duration > 0 && (
                        <p className="text-xs text-gray-600">{formatTime(step.duration)}</p>
                      )}
                    </div>
                    <div className="score-badge text-xs">
                      +{step.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Messages */}
            <div className="card p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💪 Motivazione
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>🦷 Ogni spazzolata rende i tuoi denti più forti!</p>
                <p>⭐ Stai diventando un vero campione dell'igiene!</p>
                <p>🏆 I tuoi denti ti ringraziano per le cure!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSession;
