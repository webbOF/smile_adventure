/**
 * HomePage Component
 * Homepage per utenti non registrati con presentazione della piattaforma
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button, Card, Header } from '../UI';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const features = [
    {
      id: 'games',
      icon: '🎮',
      title: 'Giochi Interattivi',
      description: 'Attività ludiche personalizzate per bambini con ASD, progettate per supportare lo sviluppo sociale e cognitivo.'
    },
    {
      id: 'dental',
      icon: '🦷',
      title: 'Supporto Dentale',
      description: 'Scenari dedicati per preparare i bambini alle visite dentali, riducendo ansia e stress.'    },
    {
      id: 'professionals',
      icon: '👨‍⚕️',
      title: 'Area Professionisti',
      description: 'Strumenti avanzati per terapisti e professionisti sanitari per monitorare i progressi.'
    },
    {
      id: 'analytics',
      icon: '📊',
      title: 'Analytics Avanzate',
      description: 'Report dettagliati sui progressi e analytics comportamentali per genitori e professionisti.'
    },
    {
      id: 'families',
      icon: '👨‍👩‍👧‍👦',
      title: 'Per Famiglie',
      description: 'Piattaforma sicura dove i genitori possono gestire i profili dei bambini e monitorare i progressi.'
    },
    {
      id: 'personalization',
      icon: '🎯',
      title: 'Personalizzazione',
      description: 'Ogni bambino è unico: la piattaforma si adatta alle esigenze specifiche di ciascuno.'
    }
  ];
  const testimonials = [
    {
      id: 'maria',
      name: 'Maria R.',
      role: 'Genitore',
      text: 'Smile Adventure ha trasformato l\'approccio di mio figlio alle visite dentali. Ora è molto più sereno!'
    },
    {
      id: 'giuseppe',
      name: 'Dr. Giuseppe L.',
      role: 'Dentista Pediatrico',
      text: 'I bambini che utilizzano questa piattaforma arrivano nel mio studio già preparati e meno ansiosi.'
    },
    {
      id: 'anna',
      name: 'Anna S.',
      role: 'Terapista ABA',
      text: 'Gli analytics comportamentali mi permettono di personalizzare meglio le terapie per ogni bambino.'
    }
  ];
  return (
    <div className="homepage">
      {/* Utilizziamo il componente Header esistente */}
      <Header title="Smile Adventure" />

      {/* Hero Section */}
      <section className="homepage-hero">
        <div className="homepage-hero-content">
          <div className="homepage-hero-text">            <h1 className="homepage-hero-title">
              Trasforma l&apos;esperienza sanitaria dei bambini con{' '}
              <span className="highlight">ASD</span>
            </h1>
            <p className="homepage-hero-subtitle">
              Una piattaforma gamificata che aiuta i bambini con Autism Spectrum Disorder 
              a prepararsi per visite dentali e terapie attraverso esperienze interattive e divertenti.
            </p>            <div className="homepage-hero-actions">
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="primary" 
                    size="large"
                    onClick={() => navigate('/dashboard')}
                  >
                    Vai alla Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="large"
                    onClick={() => navigate('/children')}
                  >
                    Gestisci Bambini
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button variant="primary" size="large">
                      Inizia Gratuitamente
                    </Button>
                  </Link>
                  <Link to="/register?role=professional">
                    <Button variant="outline" size="large">
                      Sono un Professionista
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="homepage-hero-visual">
            <div className="homepage-hero-card">
              <div className="hero-card-icon">🎮</div>
              <h3>Gioco Interattivo</h3>
              <p>Scenari personalizzati per ogni bambino</p>
            </div>
            <div className="homepage-hero-card">
              <div className="hero-card-icon">📈</div>
              <h3>Progressi Tracciati</h3>
              <p>Analytics dettagliate per genitori e terapeuti</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="homepage-features">
        <div className="homepage-section-content">
          <h2 className="homepage-section-title">
            Funzionalità Progettate per l&apos;ASD
          </h2>
          <p className="homepage-section-subtitle">
            Ogni aspetto della piattaforma è stato pensato per supportare bambini con ASD, 
            le loro famiglie e i professionisti che li seguono.
          </p>
          <div className="homepage-features-grid">            {features.map((feature) => (
              <Card key={feature.id} className="homepage-feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="homepage-how-it-works">
        <div className="homepage-section-content">
          <h2 className="homepage-section-title">Come Funziona</h2>
          <div className="homepage-steps">
            <div className="homepage-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Registrazione</h3>
                <p>I genitori creano un account e aggiungono i profili dei loro bambini con informazioni specifiche sull&apos;ASD.</p>
              </div>
            </div>
            <div className="homepage-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Personalizzazione</h3>
                <p>Il sistema adatta le attività alle esigenze sensoriali e comportamentali di ogni bambino.</p>
              </div>
            </div>
            <div className="homepage-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Attività Interactive</h3>
                <p>I bambini partecipano a giochi e scenari che li preparano per situazioni reali come visite dentali.</p>
              </div>
            </div>
            <div className="homepage-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Monitoraggio</h3>
                <p>Genitori e professionisti monitorano i progressi attraverso report dettagliati e analytics.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="homepage-user-types">
        <div className="homepage-section-content">
          <h2 className="homepage-section-title">Per Chi è Smile Adventure</h2>
          <div className="homepage-user-types-grid">
            <Card className="homepage-user-type-card">
              <div className="user-type-icon">👨‍👩‍👧‍👦</div>
              <h3>Famiglie</h3>
              <ul>
                <li>Gestione profili bambini</li>
                <li>Monitoraggio progressi</li>
                <li>Preparazione a visite mediche</li>
                <li>Report personalizzati</li>
              </ul>
              <Link to="/register?role=parent">
                <Button variant="primary" className="user-type-button">
                  Registrati come Genitore
                </Button>
              </Link>
            </Card>
            <Card className="homepage-user-type-card">
              <div className="user-type-icon">👨‍⚕️</div>
              <h3>Professionisti</h3>
              <ul>
                <li>Analytics cliniche avanzate</li>
                <li>Gestione pazienti</li>
                <li>Report comportamentali</li>
                <li>Strumenti di assessment</li>
              </ul>
              <Link to="/register?role=professional">
                <Button variant="secondary" className="user-type-button">
                  Registrati come Professionista
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="homepage-testimonials">
        <div className="homepage-section-content">
          <h2 className="homepage-section-title">Cosa Dicono di Noi</h2>
          <div className="homepage-testimonials-grid">            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="homepage-testimonial-card">
                <p className="testimonial-text">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span className="testimonial-role">{testimonial.role}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="homepage-cta">
        <div className="homepage-section-content">
          <h2 className="homepage-cta-title">
            Inizia il Viaggio di Tuo Figlio Oggi
          </h2>
          <p className="homepage-cta-subtitle">
            Unisciti a centinaia di famiglie che hanno già migliorato l&apos;esperienza sanitaria dei loro bambini.
          </p>          <div className="homepage-cta-actions">
            <Link to="/register">
              <Button variant="primary" size="large">
                Registrati Gratuitamente
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline-light" size="large">
                Hai già un account? Accedi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="homepage-footer-content">
          <div className="homepage-footer-section">
            <h3>🌟 Smile Adventure</h3>
            <p>Trasformando l&apos;esperienza sanitaria per bambini con ASD</p>
          </div>
          <div className="homepage-footer-section">
            <h4>Per Famiglie</h4>
            <ul>
              <li><Link to="/register?role=parent">Registrati</Link></li>
              <li><Link to="/login">Accedi</Link></li>
            </ul>
          </div>          <div className="homepage-footer-section">
            <h4>Per Professionisti</h4>
            <ul>
              <li><Link to="/register?role=professional">Registrati</Link></li>
              <li><Link to="/login">Accedi</Link></li>
            </ul>
          </div>
          <div className="homepage-footer-section">
            <h4>Risorse</h4>
            <ul>
              <li><Link to="/articles">Articoli</Link></li>
              <li><Link to="/about-us">Chi Siamo</Link></li>
            </ul>
          </div>
          <div className="homepage-footer-section">
            <h4>Contatti</h4>
            <p>info@smileadventure.com</p>
            <p>+39 123 456 7890</p>
          </div>
        </div>
        <div className="homepage-footer-bottom">
          <p>&copy; 2025 Smile Adventure. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
