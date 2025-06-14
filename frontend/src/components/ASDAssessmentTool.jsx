import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ASDAssessmentTool.css';

/**
 * ASDAssessmentTool Component
 * Strumento completo per assessment ASD con domande strutturate
 */
const ASDAssessmentTool = ({ 
  childId, 
  currentAssessment = null, 
  onAssessmentChange, 
  readOnly = false 
}) => {
  const [assessment, setAssessment] = useState({
    communication: {
      verbal_communication: 0,
      non_verbal_communication: 0,
      social_communication: 0,
      pragmatic_language: 0
    },
    social_interaction: {
      eye_contact: 0,
      social_engagement: 0,
      peer_relationships: 0,
      emotional_reciprocity: 0
    },
    behavior_patterns: {
      repetitive_behaviors: 0,
      restricted_interests: 0,
      sensory_sensitivity: 0,
      routine_adherence: 0
    },
    adaptive_skills: {
      daily_living: 0,
      independence: 0,
      problem_solving: 0,
      flexibility: 0
    },
    notes: '',
    assessment_date: new Date().toISOString().split('T')[0],
    assessor_notes: ''
  });

  const [currentSection, setCurrentSection] = useState('communication');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (currentAssessment) {
      setAssessment(currentAssessment);
      checkCompleteness(currentAssessment);
    }
  }, [currentAssessment]);

  const assessmentSections = {
    communication: {
      title: '💬 Comunicazione',
      icon: '💬',
      description: 'Valutazione delle abilità comunicative',
      questions: {
        verbal_communication: {
          label: 'Comunicazione verbale',
          description: 'Capacità di utilizzare il linguaggio parlato per comunicare',
          scale: {
            0: 'Non verbale o comunicazione molto limitata',
            1: 'Poche parole, comunicazione frammentaria',
            2: 'Frasi semplici, vocabolario limitato',
            3: 'Comunicazione funzionale, alcune difficoltà',
            4: 'Comunicazione appropriata per l\'età'
          }
        },
        non_verbal_communication: {
          label: 'Comunicazione non verbale',
          description: 'Uso di gesti, espressioni facciali, linguaggio del corpo',
          scale: {
            0: 'Assente o molto limitata',
            1: 'Gesti di base, limitata espressività',
            2: 'Alcuni gesti e espressioni',
            3: 'Buona gamma di comunicazione non verbale',
            4: 'Comunicazione non verbale ricca e appropriata'
          }
        },
        social_communication: {
          label: 'Comunicazione sociale',
          description: 'Capacità di comunicare in contesti sociali',
          scale: {
            0: 'Non inizia o mantiene conversazioni',
            1: 'Difficoltà significative nella conversazione',
            2: 'Conversazioni brevi e semplici',
            3: 'Partecipa alle conversazioni con supporto',
            4: 'Comunicazione sociale fluida'
          }
        },
        pragmatic_language: {
          label: 'Linguaggio pragmatico',
          description: 'Uso appropriato del linguaggio nel contesto',
          scale: {
            0: 'Non comprende il contesto comunicativo',
            1: 'Difficoltà marcate nell\'uso contestuale',
            2: 'Uso del linguaggio spesso inappropriato',
            3: 'Generalmente appropriato con alcune difficoltà',
            4: 'Uso del linguaggio sempre appropriato'
          }
        }
      }
    },
    social_interaction: {
      title: '🤝 Interazione Sociale',
      icon: '🤝',
      description: 'Valutazione delle competenze sociali',
      questions: {
        eye_contact: {
          label: 'Contatto oculare',
          description: 'Capacità di stabilire e mantenere il contatto visivo',
          scale: {
            0: 'Evita completamente il contatto oculare',
            1: 'Contatto oculare molto limitato',
            2: 'Contatto oculare occasionale',
            3: 'Contatto oculare appropriato la maggior parte delle volte',
            4: 'Contatto oculare naturale e appropriato'
          }
        },
        social_engagement: {
          label: 'Coinvolgimento sociale',
          description: 'Interesse e partecipazione alle attività sociali',
          scale: {
            0: 'Evita le interazioni sociali',
            1: 'Partecipazione molto limitata',
            2: 'Partecipa se incoraggiato',
            3: 'Partecipa attivamente con supporto',
            4: 'Cerca spontaneamente l\'interazione sociale'
          }
        },
        peer_relationships: {
          label: 'Relazioni con i pari',
          description: 'Capacità di formare e mantenere amicizie',
          scale: {
            0: 'Nessuna relazione con i pari',
            1: 'Difficoltà marcate nelle relazioni',
            2: 'Relazioni superficiali o limitate',
            3: 'Alcune amicizie con supporto',
            4: 'Relazioni positive e durature'
          }
        },
        emotional_reciprocity: {
          label: 'Reciprocità emotiva',
          description: 'Capacità di condividere emozioni e stati d\'animo',
          scale: {
            0: 'Non dimostra reciprocità emotiva',
            1: 'Reciprocità molto limitata',
            2: 'Condivisione emotiva occasionale',
            3: 'Buona reciprocità nella maggior parte dei casi',
            4: 'Reciprocità emotiva spontanea e appropriata'
          }
        }
      }
    },
    behavior_patterns: {
      title: '🔄 Schemi Comportamentali',
      icon: '🔄',
      description: 'Valutazione di comportamenti ripetitivi e interessi',
      questions: {
        repetitive_behaviors: {
          label: 'Comportamenti ripetitivi',
          description: 'Presenza di stereotipie e comportamenti ripetitivi',
          scale: {
            0: 'Comportamenti ripetitivi costanti e interferenti',
            1: 'Comportamenti ripetitivi frequenti',
            2: 'Comportamenti ripetitivi occasionali',
            3: 'Comportamenti ripetitivi minimi',
            4: 'Nessun comportamento ripetitivo significativo'
          }
        },
        restricted_interests: {
          label: 'Interessi ristretti',
          description: 'Intensità e rigidità degli interessi specifici',
          scale: {
            0: 'Interessi molto ristretti e ossessivi',
            1: 'Interessi limitati e intensi',
            2: 'Alcuni interessi specifici pronunciati',
            3: 'Interessi vari con alcune preferenze marcate',
            4: 'Gamma appropriata di interessi'
          }
        },
        sensory_sensitivity: {
          label: 'Sensibilità sensoriale',
          description: 'Reazioni agli stimoli sensoriali',
          scale: {
            0: 'Sensibilità sensoriale estrema',
            1: 'Sensibilità sensoriale significativa',
            2: 'Alcune sensibilità sensoriali',
            3: 'Sensibilità sensoriali gestibili',
            4: 'Nessuna sensibilità sensoriale particolare'
          }
        },
        routine_adherence: {
          label: 'Aderenza alle routine',
          description: 'Necessità di routine e resistenza ai cambiamenti',
          scale: {
            0: 'Necessità estrema di routine invariabili',
            1: 'Forte necessità di routine',
            2: 'Preferenza per routine ma qualche flessibilità',
            3: 'Routine preferite ma accetta cambiamenti',
            4: 'Flessibile, routine non essenziali'
          }
        }
      }
    },
    adaptive_skills: {
      title: '🛠️ Abilità Adattive',
      icon: '🛠️',
      description: 'Valutazione delle competenze per la vita quotidiana',
      questions: {
        daily_living: {
          label: 'Vita quotidiana',
          description: 'Autonomia nelle attività quotidiane',
          scale: {
            0: 'Dipendenza totale nelle attività quotidiane',
            1: 'Dipendenza significativa',
            2: 'Autonomia parziale con supervisione',
            3: 'Buona autonomia con supporto occasionale',
            4: 'Autonomia completa nelle attività quotidiane'
          }
        },
        independence: {
          label: 'Indipendenza',
          description: 'Capacità di funzionare autonomamente',
          scale: {
            0: 'Nessuna indipendenza',
            1: 'Indipendenza molto limitata',
            2: 'Indipendenza in alcune aree',
            3: 'Buona indipendenza con supporto',
            4: 'Indipendenza appropriata per l\'età'
          }
        },
        problem_solving: {
          label: 'Risoluzione problemi',
          description: 'Capacità di affrontare e risolvere problemi',
          scale: {
            0: 'Non risolve problemi autonomamente',
            1: 'Risolve solo problemi molto semplici',
            2: 'Risolve problemi con significativo supporto',
            3: 'Risolve problemi con supporto minimo',
            4: 'Risolve problemi autonomamente'
          }
        },
        flexibility: {
          label: 'Flessibilità',
          description: 'Capacità di adattarsi a situazioni nuove',
          scale: {
            0: 'Estrema rigidità, nessuna flessibilità',
            1: 'Flessibilità molto limitata',
            2: 'Qualche flessibilità con supporto',
            3: 'Buona flessibilità nella maggior parte delle situazioni',
            4: 'Flessibilità appropriata per l\'età'
          }
        }
      }
    }
  };

  const handleScoreChange = (section, question, score) => {
    const newAssessment = {
      ...assessment,
      [section]: {
        ...assessment[section],
        [question]: parseInt(score)
      }
    };
    
    setAssessment(newAssessment);
    checkCompleteness(newAssessment);
    
    if (onAssessmentChange) {
      onAssessmentChange(newAssessment);
    }
  };

  const handleNotesChange = (field, value) => {
    const newAssessment = {
      ...assessment,
      [field]: value
    };
    
    setAssessment(newAssessment);
    
    if (onAssessmentChange) {
      onAssessmentChange(newAssessment);
    }
  };

  const checkCompleteness = (assessmentData) => {
    const sections = Object.keys(assessmentSections);
    let totalQuestions = 0;
    let answeredQuestions = 0;

    sections.forEach(section => {
      const questions = Object.keys(assessmentSections[section].questions);
      totalQuestions += questions.length;
      
      questions.forEach(question => {
        if (assessmentData[section] && assessmentData[section][question] > 0) {
          answeredQuestions++;
        }
      });
    });

    setIsCompleted(answeredQuestions === totalQuestions);
  };

  const calculateSectionScore = (sectionKey) => {
    const sectionData = assessment[sectionKey];
    if (!sectionData) return 0;
    
    const scores = Object.values(sectionData);
    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = total / scores.length;
    
    return Math.round(average * 10) / 10; // Round to 1 decimal
  };

  const calculateTotalScore = () => {
    const sections = Object.keys(assessmentSections);
    const sectionScores = sections.map(section => calculateSectionScore(section));
    const total = sectionScores.reduce((sum, score) => sum + score, 0);
    
    return Math.round((total / sections.length) * 10) / 10;
  };

  const getScoreColor = (score) => {
    if (score <= 1) return '#ef4444'; // Red - Severe challenges
    if (score <= 2) return '#f97316'; // Orange - Significant challenges
    if (score <= 3) return '#eab308'; // Yellow - Moderate challenges
    if (score <= 3.5) return '#10b981'; // Green - Mild challenges
    return '#3b82f6'; // Blue - Typical development
  };

  const getScoreLabel = (score) => {
    if (score <= 1) return 'Difficoltà Severe';
    if (score <= 2) return 'Difficoltà Significative';
    if (score <= 3) return 'Difficoltà Moderate';
    if (score <= 3.5) return 'Difficoltà Lievi';
    return 'Sviluppo Tipico';
  };

  const renderQuestion = (sectionKey, questionKey, questionData) => {
    const currentScore = assessment[sectionKey]?.[questionKey] || 0;
    
    return (
      <div key={questionKey} className="assessment-question">
        <div className="question-header">
          <h4 className="question-title">{questionData.label}</h4>
          <span 
            className="question-score"
            style={{ backgroundColor: getScoreColor(currentScore) }}
          >
            {currentScore}/4
          </span>
        </div>
        
        <p className="question-description">{questionData.description}</p>
        
        <div className="score-options">
          {Object.entries(questionData.scale).map(([score, description]) => (            <label 
              key={score} 
              className="score-option"
              htmlFor={`${sectionKey}_${questionKey}_${score}`}
              aria-label={`Punteggio ${score}: ${description}`}
            >
              <input
                id={`${sectionKey}_${questionKey}_${score}`}
                type="radio"
                name={`${sectionKey}_${questionKey}`}
                value={score}
                checked={currentScore === parseInt(score)}
                onChange={(e) => handleScoreChange(sectionKey, questionKey, e.target.value)}
                disabled={readOnly}
              />
              <div className="score-content">
                <span className="score-number">{score}</span>
                <span className="score-description">{description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderSection = (sectionKey) => {
    const section = assessmentSections[sectionKey];
    const sectionScore = calculateSectionScore(sectionKey);
    
    return (
      <div className="assessment-section">
        <div className="section-header">
          <div className="section-title">
            <span className="section-icon">{section.icon}</span>
            <h3>{section.title}</h3>
            <span 
              className="section-score"
              style={{ backgroundColor: getScoreColor(sectionScore) }}
            >
              {sectionScore}/4
            </span>
          </div>
          <p className="section-description">{section.description}</p>
        </div>
        
        <div className="section-questions">
          {Object.entries(section.questions).map(([questionKey, questionData]) =>
            renderQuestion(sectionKey, questionKey, questionData)
          )}
        </div>
      </div>
    );
  };

  const totalScore = calculateTotalScore();

  return (
    <div className="asd-assessment-tool">
      <div className="assessment-header">
        <div className="header-content">
          <h2>🧩 Assessment ASD Completo</h2>
          <p>Strumento strutturato per la valutazione delle caratteristiche ASD</p>
        </div>
        
        <div className="assessment-summary">
          <div className="total-score">
            <span className="score-label">Punteggio Totale</span>
            <span 
              className="score-value"
              style={{ backgroundColor: getScoreColor(totalScore) }}
            >
              {totalScore}/4
            </span>
            <span className="score-description">{getScoreLabel(totalScore)}</span>
          </div>
          
          <div className="completion-status">
            <span className={`status-indicator ${isCompleted ? 'completed' : 'incomplete'}`}>
              {isCompleted ? '✅ Completato' : '⏳ In corso'}
            </span>
          </div>
        </div>
      </div>

      <div className="assessment-navigation">
        {Object.keys(assessmentSections).map((sectionKey) => {
          const section = assessmentSections[sectionKey];
          const sectionScore = calculateSectionScore(sectionKey);
          
          return (
            <button
              key={sectionKey}
              className={`nav-button ${currentSection === sectionKey ? 'active' : ''}`}
              onClick={() => setCurrentSection(sectionKey)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-title">{section.title}</span>
              <span 
                className="nav-score"
                style={{ backgroundColor: getScoreColor(sectionScore) }}
              >
                {sectionScore}
              </span>
            </button>
          );
        })}
      </div>

      <div className="assessment-content">
        {renderSection(currentSection)}
      </div>

      <div className="assessment-notes">
        <div className="notes-section">
          <h3>📝 Note Generali</h3>
          <textarea
            value={assessment.notes}
            onChange={(e) => handleNotesChange('notes', e.target.value)}
            placeholder="Aggiungi note generali sull'assessment..."
            className="notes-textarea"
            rows="4"
            disabled={readOnly}
          />
        </div>
        
        <div className="notes-section">
          <h3>👩‍⚕️ Note dell&apos;Assessore</h3>
          <textarea
            value={assessment.assessor_notes}
            onChange={(e) => handleNotesChange('assessor_notes', e.target.value)}
            placeholder="Note professionali e raccomandazioni..."
            className="notes-textarea"
            rows="4"
            disabled={readOnly}
          />
        </div>
        
        <div className="assessment-date">
          <label htmlFor="assessment-date">Data Assessment:</label>
          <input
            id="assessment-date"
            type="date"
            value={assessment.assessment_date}
            onChange={(e) => handleNotesChange('assessment_date', e.target.value)}
            disabled={readOnly}
          />
        </div>
      </div>

      {isCompleted && (
        <div className="assessment-completion">
          <div className="completion-banner">
            <span className="completion-icon">🎉</span>
            <div className="completion-text">
              <h3>Assessment Completato!</h3>
              <p>Tutte le sezioni sono state valutate. Punteggio totale: {totalScore}/4</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ASDAssessmentTool.propTypes = {
  childId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentAssessment: PropTypes.object,
  onAssessmentChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
};

export default ASDAssessmentTool;
