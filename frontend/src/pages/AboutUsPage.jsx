/**
 * AboutUsPage Component
 * Pagina "Chi Siamo" di Smile Adventure
 */

import React from 'react';
import { Card, Button, Header } from '../components/UI';
import Layout from '../components/UI/Layout';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import './AboutUsPage.css';

const AboutUsPage = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Dr.ssa Maria Rossi",
      role: "Fondatrice & Direttrice Clinica",
      specialization: "Odontoiatria Pediatrica",
      bio: "Specialista in odontoiatria pediatrica con oltre 15 anni di esperienza. Pioniera nell'uso di tecnologie innovative per il benessere dei bambini.",
      image: "/api/placeholder/200/200"
    },
    {
      id: 2,
      name: "Prof. Luigi Bianchi",
      role: "Direttore Sviluppo Tecnologico",
      specialization: "Psicologia Infantile & Gaming",
      bio: "Ricercatore universitario specializzato nell'applicazione del gioco digitale in ambito terapeutico e educativo.",
      image: "/api/placeholder/200/200"
    },
    {
      id: 3,
      name: "Dr. Francesco Verde",
      role: "Lead Developer",
      specialization: "Tecnologie Sanitarie Digitali",
      bio: "Ingegnere biomedico con esperienza nello sviluppo di soluzioni digitali per la sanità pediatrica.",
      image: "/api/placeholder/200/200"
    },
    {
      id: 4,
      name: "Dr.ssa Elena Azzurri",
      role: "Psicologa Clinica",
      specialization: "Terapia Comportamentale Infantile",
      bio: "Specialista nel supporto psicologico per bambini con disturbi del comportamento e dell'apprendimento.",
      image: "/api/placeholder/200/200"
    }
  ];

  const values = [
    {
      icon: "🎯",
      title: "Innovazione",
      description: "Utilizziamo le tecnologie più avanzate per creare esperienze coinvolgenti e efficaci."
    },
    {
      icon: "❤️",
      title: "Cura",
      description: "Ogni bambino riceve attenzione personalizzata in un ambiente sicuro e accogliente."
    },
    {
      icon: "🤝",
      title: "Collaborazione",
      description: "Lavoriamo insieme a genitori e professionisti per il benessere di ogni bambino."
    },
    {
      icon: "🌟",
      title: "Eccellenza",
      description: "Puntiamo sempre alla massima qualità in ogni aspetto del nostro servizio."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Fondazione",
      description: "Nasce l'idea di Smile Adventure dalla collaborazione tra professionisti sanitari e tecnologi."
    },
    {
      year: "2021",
      title: "Primo Prototipo",
      description: "Sviluppo del primo prototipo della piattaforma con feedback da cliniche pediatriche."
    },
    {
      year: "2022",
      title: "Lancio Beta",
      description: "Lancio della versione beta con 50 famiglie pilota e 10 professionisti."
    },
    {
      year: "2023",
      title: "Espansione",
      description: "Espansione a livello nazionale con oltre 500 famiglie e 100 professionisti."
    },
    {
      year: "2024",
      title: "Riconoscimenti",
      description: "Riconoscimento come migliore innovazione in ambito sanitario pediatrico."
    }
  ];
  return (
    <Layout header={<Header />}>
      <div className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-content">
            <h1>Chi Siamo</h1>
            <p className="hero-subtitle">
              Siamo un team di professionisti appassionati che crede nel potere della tecnologia 
              per migliorare il benessere dei bambini e supportare le famiglie.
            </p>
          </div>
          <div className="hero-image">
            <div className="hero-illustration">
              <span className="hero-emoji">😊🦷👨‍⚕️👩‍⚕️👶</span>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="section-content">
            <h2>La Nostra Missione</h2>
            <div className="mission-cards">
              <Card className="mission-card" variant="primary">
                <div className="mission-icon">🎮</div>                <h3>Trasformare la Cura in Gioco</h3>
                <p>
                  Rendiamo ogni visita medica un&apos;avventura divertente, riducendo l&apos;ansia 
                  e aumentando la collaborazione dei bambini durante le cure.
                </p>
              </Card>
              
              <Card className="mission-card" variant="success">
                <div className="mission-icon">👨‍👩‍👧‍👦</div>
                <h3>Supportare le Famiglie</h3>
                <p>
                  Forniamo strumenti e risorse per aiutare i genitori a prendersi cura 
                  del benessere dei loro bambini con fiducia e serenità.
                </p>
              </Card>
              
              <Card className="mission-card" variant="info">
                <div className="mission-icon">🔬</div>
                <h3>Innovazione Continua</h3>                <p>
                  Investiamo costantemente in ricerca e sviluppo per creare soluzioni 
                  sempre più efficaci e all&apos;avanguardia.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <div className="section-content">
            <h2>I Nostri Valori</h2>
            <div className="values-grid">            {values.map((value) => (
                <div key={value.title} className="value-item">
                  <div className="value-icon">{value.icon}</div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <div className="section-content">
            <h2>Il Nostro Team</h2>
            <p className="team-intro">
              Un gruppo multidisciplinare di esperti uniti dalla passione per il benessere infantile.
            </p>
            <div className="team-grid">
              {teamMembers.map(member => (
                <Card key={member.id} className="team-card">
                  <div className="member-image">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0QxRDVEQiIvPgo8cGF0aCBkPSJNNTAgMTcwQzUwIDEzNS44MTcgNzUuODE3IDExMCAxMTAgMTEwQzE0NC4xODMgMTEwIDE3MCAEzNS44MTcgMTcwIDE3MEg1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+Cg==';
                      }}
                    />
                  </div>
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <p className="member-role">{member.role}</p>
                    <p className="member-specialization">{member.specialization}</p>
                    <p className="member-bio">{member.bio}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="timeline-section">
          <div className="section-content">
            <h2>La Nostra Storia</h2>
            <div className="timeline">            {milestones.map((milestone) => (
                <div key={milestone.year} className="timeline-item">
                  <div className="timeline-marker">
                    <span className="year">{milestone.year}</span>
                  </div>
                  <div className="timeline-content">
                    <h3>{milestone.title}</h3>
                    <p>{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="section-content">
            <h2>I Nostri Numeri</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Bambini Felici</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">200+</div>
                <div className="stat-label">Professionisti Partner</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Città Raggiunte</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Soddisfazione Famiglie</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <Card className="cta-card" variant="primary">
            <div className="cta-content">
              <h2>Inizia la Tua Avventura</h2>
              <p>
                Unisciti alla famiglia Smile Adventure e scopri come possiamo aiutare 
                te e il tuo bambino in questo viaggio verso il benessere.
              </p>
              <div className="cta-buttons">
                <Button 
                  as={Link} 
                  to={ROUTES.REGISTER} 
                  variant="secondary" 
                  size="large"
                >
                  Registrati Ora
                </Button>
                <Button 
                  as={Link} 
                  to={ROUTES.ARTICLES} 
                  variant="outline" 
                  size="large"
                >
                  Scopri le Risorse
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default AboutUsPage;
