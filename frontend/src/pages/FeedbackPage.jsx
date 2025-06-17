import React from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer, Button, Card } from '../components/UI';
import './FeedbackPage.css'; // Creeremo questo file CSS

const feedbackForms = [
  {
    id: 'platform-feedback',
    title: 'Feedback sulla Piattaforma',
    description: 'Condividi la tua opinione generale sull\'utilizzo di Smile Adventure.',
    icon: '🗣️',
    url: 'https://forms.gle/TVt1W28GtstYf3st7', // Updated URL
  },
  {
    id: 'feature-suggestions',
    title: 'Suggerimenti per Nuove Funzionalità',
    description: 'Hai idee per migliorare la piattaforma o aggiungere nuove attività?',
    icon: '💡',
    url: 'https://forms.gle/2xjwTHxZN4n3sHCg8', // Updated URL
  },
  {
    id: 'technical-issues',
    title: 'Segnalazione Problemi Tecnici',
    description: 'Hai riscontrato bug, errori o altri problemi tecnici?',
    icon: '🐞',
    url: 'https://forms.gle/placeholdertechnicalissues', // Sostituisci con il tuo URL reale
  },
  {
    id: 'ux-evaluation',
    title: 'Valutazione Esperienza Utente',
    description: 'Come valuti la facilità d\'uso e l\'esperienza generale?',
    icon: '⭐',
    url: 'https://forms.gle/placeholderuxevaluation', // Sostituisci con il tuo URL reale
  },
];

const FeedbackPage = () => {
  return (
    <>
      <Header />
      <div className="feedback-page">
        <div className="auth-background"> {/* Riutilizzo dello sfondo animato */}
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="floating-particles">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={`particle-${i}`} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>
        </div>
        
        <div className="feedback-container">
          <div className="feedback-header-content">
            <h1 className="feedback-main-title">Il Tuo Parere Conta!</h1>
            <p className="feedback-main-subtitle">
              Aiutaci a migliorare Smile Adventure fornendoci il tuo prezioso feedback.
              Seleziona uno dei moduli sottostanti per iniziare.
            </p>
          </div>
          <div className="feedback-forms-grid">
            {feedbackForms.map((form) => (
              <Card key={form.id} className="feedback-card">
                <div className="feedback-card-icon">{form.icon}</div>
                <h2 className="feedback-card-title">{form.title}</h2>
                <p className="feedback-card-description">{form.description}</p>
                <Button
                  variant="primary"
                  size="large"
                  href={form.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feedback-button"
                >
                  Vai al Modulo
                </Button>
              </Card>
            ))}
          </div>
          <div className="feedback-page-footer-link">
            <p>Grazie per il tuo contributo!</p>
            <Link to="/" className="auth-link">Torna alla Homepage</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FeedbackPage;
