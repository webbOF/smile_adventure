/**
 * ArticlesPage Component
 * Pagina degli articoli con contenuti informativi su Smile Adventure
 */

import React, { useState } from 'react';
import { Card, Button, Badge, Header } from '../components/UI';
import Layout from '../components/UI/Layout';
import './ArticlesPage.css';

const ArticlesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dati mock degli articoli
  const articles = [
    {
      id: 1,
      title: "Come Preparare il Bambino alla Prima Visita Dentistica",
      excerpt: "Consigli pratici per rendere la prima esperienza dal dentista un momento positivo e sereno per il tuo bambino.",
      content: "La prima visita dentistica è un momento importante nella vita di un bambino. Con i giusti preparativi e approccio, può diventare un'esperienza positiva che getta le basi per una buona salute orale...",
      category: "salute-orale",
      author: "Dr.ssa Maria Rossi",
      publishDate: "2024-12-15",
      readTime: "5 min",
      image: "/api/placeholder/400/250",
      tags: ["prima visita", "bambini", "dentista", "ansia"]
    },
    {
      id: 2,
      title: "L'Importanza del Gioco nella Terapia Infantile",
      excerpt: "Scopri come il gioco digitale può essere utilizzato come strumento terapeutico efficace per i bambini.",
      content: "Il gioco è il linguaggio naturale dei bambini. Attraverso attività ludiche mirate, è possibile raggiungere obiettivi terapeutici importanti...",
      category: "terapia",
      author: "Prof. Luigi Bianchi",
      publishDate: "2024-12-10",
      readTime: "7 min",
      image: "/api/placeholder/400/250",
      tags: ["gioco", "terapia", "sviluppo", "psicologia"]
    },
    {
      id: 3,
      title: "Tecnologia e Innovazione nella Cura Pediatrica",
      excerpt: "Le nuove tecnologie digitali stanno rivoluzionando l'approccio alla cura e al benessere dei bambini.",
      content: "L'integrazione di tecnologie innovative nella pratica pediatrica apre nuove possibilità per il trattamento e la prevenzione...",
      category: "tecnologia",
      author: "Dr. Francesco Verde",
      publishDate: "2024-12-05",
      readTime: "6 min",
      image: "/api/placeholder/400/250",
      tags: ["tecnologia", "innovazione", "pediatria", "digitale"]
    },
    {
      id: 4,
      title: "Alimentazione e Salute Dentale nei Bambini",
      excerpt: "Una guida completa su come l'alimentazione influisce sulla salute dei denti nei più piccoli.",
      content: "L'alimentazione gioca un ruolo fondamentale nello sviluppo e mantenimento di denti sani nei bambini...",
      category: "salute-orale",
      author: "Dr.ssa Anna Gialli",
      publishDate: "2024-11-28",
      readTime: "8 min",
      image: "/api/placeholder/400/250",
      tags: ["alimentazione", "prevenzione", "carie", "nutrizione"]
    },
    {
      id: 5,
      title: "Gestire l'Ansia del Bambino Durante le Cure Mediche",
      excerpt: "Strategie efficaci per aiutare i bambini a superare la paura delle visite mediche e dentistiche.",
      content: "L'ansia medica nei bambini è un fenomeno comune che può essere gestito con le giuste strategie...",
      category: "psicologia",
      author: "Dr.ssa Elena Azzurri",
      publishDate: "2024-11-20",
      readTime: "6 min",
      image: "/api/placeholder/400/250",
      tags: ["ansia", "paura", "supporto", "genitori"]
    }
  ];

  const categories = [
    { id: 'all', label: 'Tutti gli Articoli', icon: '📚' },
    { id: 'salute-orale', label: 'Salute Orale', icon: '🦷' },
    { id: 'terapia', label: 'Terapia', icon: '🎯' },
    { id: 'tecnologia', label: 'Tecnologia', icon: '💻' },
    { id: 'psicologia', label: 'Psicologia', icon: '🧠' }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'salute-orale': 'success',
      'terapia': 'primary',
      'tecnologia': 'info',
      'psicologia': 'warning'
    };
    return colors[category] || 'secondary';
  };

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);
  return (
    <Layout header={<Header />}>
      <div className="articles-page">
        <div className="articles-header">
          <div className="articles-hero">
            <h1>📚 Centro Risorse</h1>
            <p className="articles-subtitle">
              Articoli, guide e consigli per il benessere dei tuoi bambini
            </p>
          </div>
        </div>

        <div className="articles-content">
          {/* Filtri per categoria */}
          <div className="articles-filters">
            <h3>Categorie</h3>
            <div className="category-filters">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => setSelectedCategory(category.id)}
                  className="category-filter"
                >
                  <span className="category-icon">{category.icon}</span>
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Lista articoli */}
          <div className="articles-grid">
            {filteredArticles.map(article => (
              <Card
                key={article.id}
                className="article-card"
                hover={true}
                clickable={true}
                onClick={() => {
                  // In futuro, navigare alla pagina dell'articolo
                  console.log('Apri articolo:', article.id);
                }}
              >
                <div className="article-image">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTAwSDIyNVYxNTBIMTc1VjEwMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTE1MCAyMDBIMjUwVjIyNUgxNTBWMjAwWiIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K';
                    }}
                  />
                  <div className="article-category-badge">
                    <Badge variant={getCategoryColor(article.category)}>
                      {categories.find(cat => cat.id === article.category)?.label}
                    </Badge>
                  </div>
                </div>
                
                <div className="article-content">
                  <h3 className="article-title">{article.title}</h3>
                  <p className="article-excerpt">{article.excerpt}</p>
                  
                  <div className="article-meta">
                    <div className="article-author">
                      <span className="author-icon">👨‍⚕️</span>
                      <span>{article.author}</span>
                    </div>
                    <div className="article-info">
                      <span className="publish-date">
                        📅 {new Date(article.publishDate).toLocaleDateString('it-IT')}
                      </span>
                      <span className="read-time">
                        ⏱️ {article.readTime}
                      </span>
                    </div>
                  </div>

                  <div className="article-tags">
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="no-articles">
              <div className="no-articles-icon">📖</div>
              <h3>Nessun articolo trovato</h3>
              <p>Non ci sono articoli in questa categoria al momento.</p>
            </div>
          )}
        </div>

        {/* Newsletter signup */}
        <div className="newsletter-section">
          <Card className="newsletter-card" variant="primary">
            <div className="newsletter-content">
              <h3>📧 Resta aggiornato</h3>
              <p>Iscriviti alla nostra newsletter per ricevere i nuovi articoli e consigli utili.</p>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="La tua email"
                  className="newsletter-input"
                />
                <Button variant="secondary">
                  Iscriviti
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ArticlesPage;
