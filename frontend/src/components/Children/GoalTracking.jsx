/**
 * GoalTracking Component - Gestione obiettivi e monitoraggio progressi
 * Features: Creazione obiettivi, tracking milestone, visualizzazione progressi
 */

import React, { useState, useEffect } from 'react';
import childrenService from '../../services/childrenService';
import './GoalTracking.css';

const GoalTracking = ({ childId, childName }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'behavior',
    priority: 'medium',
    target_date: '',
    milestones: []
  });
  const [filter, setFilter] = useState('active');

  const goalCategories = [
    { value: 'behavior', label: 'Comportamento', icon: '🎭', color: '#e3f2fd' },
    { value: 'communication', label: 'Comunicazione', icon: '💬', color: '#f3e5f5' },
    { value: 'social', label: 'Sociale', icon: '👥', color: '#e8f5e8' },
    { value: 'learning', label: 'Apprendimento', icon: '📚', color: '#fff3e0' },
    { value: 'motor', label: 'Motorio', icon: '🏃', color: '#fce4ec' },
    { value: 'independence', label: 'Autonomia', icon: '🌟', color: '#e0f2f1' },
    { value: 'sensory', label: 'Sensoriale', icon: '👂', color: '#f1f8e9' },
    { value: 'other', label: 'Altro', icon: '🎯', color: '#f5f5f5' }
  ];

  const priorities = [
    { value: 'low', label: 'Bassa', color: '#28a745' },
    { value: 'medium', label: 'Media', color: '#ffc107' },
    { value: 'high', label: 'Alta', color: '#dc3545' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Attivi', icon: '🎯' },
    { value: 'completed', label: 'Completati', icon: '✅' },
    { value: 'paused', label: 'In Pausa', icon: '⏸️' },
    { value: 'all', label: 'Tutti', icon: '📋' }
  ];

  useEffect(() => {
    // Simuliamo il caricamento degli obiettivi (da implementare con API reale)
    loadGoals();
  }, [childId]);
  const loadGoals = async () => {
    setLoading(true);
    try {
      // Load achievements and progress data from backend
      const achievementsData = await childrenService.getChildAchievements(childId);
      
      // Transform achievements into goal-like format
      const transformedGoals = [
        // Current achievements as completed goals
        ...achievementsData.earned_achievements.map(achievement => ({
          id: `achievement_${achievement.id}`,
          title: achievement.name,
          description: achievement.description,
          category: achievement.category || 'other',
          priority: 'medium',
          status: 'completed',
          progress: 100,
          target_date: null, // achievements don't have target dates
          created_date: '2025-01-15', // placeholder
          milestones: [{
            id: `milestone_${achievement.id}`,
            title: 'Achievement unlocked',
            completed: true,
            date: new Date().toISOString().split('T')[0]
          }]
        })),
        
        // Next achievements as active goals
        ...achievementsData.next_achievements.slice(0, 3).map(achievement => ({
          id: `next_${achievement.id}`,
          title: achievement.name,
          description: achievement.description,
          category: achievement.category || 'other',
          priority: achievement.progress_percentage > 70 ? 'high' : 'medium',
          status: 'active',
          progress: achievement.progress_percentage,
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          created_date: '2025-01-15',
          milestones: [
            {
              id: `milestone_1_${achievement.id}`,
              title: 'Progress started',
              completed: achievement.progress_percentage > 0,
              date: achievement.progress_percentage > 0 ? '2025-02-01' : null
            },
            {
              id: `milestone_2_${achievement.id}`,
              title: 'Halfway there',
              completed: achievement.progress_percentage >= 50,
              date: achievement.progress_percentage >= 50 ? '2025-03-01' : null
            },
            {
              id: `milestone_3_${achievement.id}`,
              title: 'Almost complete',
              completed: achievement.progress_percentage >= 90,
              date: achievement.progress_percentage >= 90 ? '2025-03-15' : null
            }
          ]
        }))
      ];
      
      setGoals(transformedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      // Fallback to mock data if API fails
      loadMockGoals();
    } finally {
      setLoading(false);
    }
  };

  const loadMockGoals = () => {
    // Keep existing mock data as fallback
    const mockGoals = [
      {
        id: 1,
        title: 'Migliorare la comunicazione verbale',
        description: 'Aumentare il vocabolario e la chiarezza del linguaggio',
        category: 'communication',
        priority: 'high',
        status: 'active',
        progress: 65,
        target_date: '2025-08-15',
        created_date: '2025-01-15',
        milestones: [
          { id: 1, title: 'Usare 10 nuove parole', completed: true, date: '2025-02-01' },
          { id: 2, title: 'Formare frasi di 3 parole', completed: true, date: '2025-03-01' },
          { id: 3, title: 'Rispondere a domande semplici', completed: false, date: null }
        ]
      },
      {
        id: 2,
        title: 'Ridurre episodi di crisi sensoriale',
        description: 'Sviluppare strategie di autoregolazione per situazioni sovrastimolanti',
        category: 'sensory',
        priority: 'medium',
        status: 'active',
        progress: 40,
        target_date: '2025-07-30',
        created_date: '2025-02-01',
        milestones: [
          { id: 4, title: 'Riconoscere segnali di sovrastimolazione', completed: true, date: '2025-03-15' },
          { id: 5, title: 'Usare tecniche di respirazione', completed: false, date: null },
          { id: 6, title: 'Autoregolarsi in 5 minuti', completed: false, date: null }
        ]
      }
    ];
    
    setGoals(mockGoals);
  };
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    try {
      setLoading(true);
      
      // For now, custom goals are added locally
      // In the future, this could integrate with a custom goals API
      const goalData = {
        ...newGoal,
        id: `custom_${Date.now()}`,
        status: 'active',
        progress: 0,
        created_date: new Date().toISOString().split('T')[0],
        milestones: newGoal.milestones.map((m, index) => ({
          id: `custom_milestone_${Date.now()}_${index}`,
          title: m,
          completed: false,
          date: null
        }))
      };

      setGoals(prev => [goalData, ...prev]);
      
      // Reset form
      setNewGoal({
        title: '',
        description: '',
        category: 'behavior',
        priority: 'medium',
        target_date: '',
        milestones: []
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = (goalId, milestoneId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return {
              ...milestone,
              completed: !milestone.completed,
              date: !milestone.completed ? new Date().toISOString().split('T')[0] : null
            };
          }
          return milestone;
        });
        
        // Calcola il progresso basato sui milestone completati
        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const progress = updatedMilestones.length > 0 
          ? Math.round((completedCount / updatedMilestones.length) * 100)
          : 0;
        
        return {
          ...goal,
          milestones: updatedMilestones,
          progress,
          status: progress === 100 ? 'completed' : 'active'
        };
      }
      return goal;
    }));
  };

  const addMilestone = (milestone) => {
    if (milestone && !newGoal.milestones.includes(milestone)) {
      setNewGoal(prev => ({
        ...prev,
        milestones: [...prev.milestones, milestone]
      }));
    }
  };

  const removeMilestone = (milestoneToRemove) => {
    setNewGoal(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m !== milestoneToRemove)
    }));
  };

  const getCategoryInfo = (category) => {
    return goalCategories.find(cat => cat.value === category) || goalCategories[0];
  };

  const getPriorityInfo = (priority) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const filteredGoals = filter === 'all' 
    ? goals 
    : goals.filter(goal => goal.status === filter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="goal-tracking">
      <div className="goal-tracking-header">
        <h3>🎯 Obiettivi e Progressi - {childName}</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
        >
          {showAddForm ? '❌ Annulla' : '➕ Nuovo Obiettivo'}
        </button>
      </div>

      {/* Statistiche Rapide */}
      <div className="goals-stats">
        <div className="stat-card">
          <span className="stat-number">{goals.filter(g => g.status === 'active').length}</span>
          <span className="stat-label">🎯 Attivi</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{goals.filter(g => g.status === 'completed').length}</span>
          <span className="stat-label">✅ Completati</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0}%
          </span>
          <span className="stat-label">📊 Progresso Medio</span>
        </div>
      </div>

      {/* Filtri */}
      <div className="goals-filters">
        {statusOptions.map(option => (
          <button
            key={option.value}
            className={`filter-btn ${filter === option.value ? 'active' : ''}`}
            onClick={() => setFilter(option.value)}
          >
            {option.icon} {option.label}
          </button>
        ))}
      </div>

      {/* Form Nuovo Obiettivo */}
      {showAddForm && (
        <div className="add-goal-form">
          <h4>✨ Nuovo Obiettivo</h4>
          <form onSubmit={handleAddGoal}>
            <div className="form-row">
              <div className="form-group">
                <label>Titolo Obiettivo *</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Es: Migliorare l'interazione sociale"
                  required
                />
              </div>
              <div className="form-group">
                <label>Data Target</label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descrizione</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrivi l'obiettivo e come raggiungerlo..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoria</label>
                <select 
                  value={newGoal.category} 
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                >
                  {goalCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priorità</label>
                <select 
                  value={newGoal.priority} 
                  onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value }))}
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Milestone (opzionali)</label>
              <div className="milestones-input">
                <input
                  type="text"
                  placeholder="Aggiungi milestone e premi Invio"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMilestone(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
                <div className="milestones-list">
                  {newGoal.milestones.map((milestone, index) => (
                    <span key={index} className="milestone-tag">
                      {milestone}
                      <button 
                        type="button" 
                        onClick={() => removeMilestone(milestone)}
                        aria-label={`Rimuovi milestone ${milestone}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Salvando...' : '💾 Crea Obiettivo'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista Obiettivi */}
      <div className="goals-list">
        {loading && <div className="loading">⏳ Caricamento obiettivi...</div>}
        
        {!loading && filteredGoals.length === 0 && (
          <div className="no-goals">
            <p>🎯 Nessun obiettivo trovato per il filtro selezionato.</p>
            <p>Inizia a definire obiettivi per {childName}!</p>
          </div>
        )}

        {filteredGoals.map((goal) => {
          const categoryInfo = getCategoryInfo(goal.category);
          const priorityInfo = getPriorityInfo(goal.priority);
          const daysRemaining = getDaysRemaining(goal.target_date);

          return (
            <div key={goal.id} className={`goal-card ${goal.status}`}>
              <div className="goal-header">
                <div className="goal-info">
                  <div className="goal-category" style={{ backgroundColor: categoryInfo.color }}>
                    <span className="category-icon">{categoryInfo.icon}</span>
                    <span className="category-label">{categoryInfo.label}</span>
                  </div>
                  <div className="goal-priority" style={{ color: priorityInfo.color }}>
                    ● {priorityInfo.label}
                  </div>
                </div>
                <div className="goal-dates">
                  {goal.target_date && (
                    <div className={`days-remaining ${daysRemaining < 0 ? 'overdue' : daysRemaining < 7 ? 'urgent' : ''}`}>
                      {daysRemaining < 0 ? `Scaduto da ${Math.abs(daysRemaining)} giorni` :
                       daysRemaining === 0 ? 'Scade oggi' :
                       `${daysRemaining} giorni rimanenti`}
                    </div>
                  )}
                </div>
              </div>

              <div className="goal-content">
                <h4>{goal.title}</h4>
                {goal.description && <p>{goal.description}</p>}
              </div>

              <div className="goal-progress">
                <div className="progress-header">
                  <span>Progresso</span>
                  <span className="progress-percentage">{goal.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {goal.milestones && goal.milestones.length > 0 && (
                <div className="goal-milestones">
                  <h5>🏆 Milestone</h5>
                  <div className="milestones-list">
                    {goal.milestones.map((milestone) => (
                      <div key={milestone.id} className={`milestone-item ${milestone.completed ? 'completed' : ''}`}>
                        <button
                          className="milestone-checkbox"
                          onClick={() => toggleMilestone(goal.id, milestone.id)}
                          aria-label={`${milestone.completed ? 'Marca come non completato' : 'Marca come completato'}: ${milestone.title}`}
                        >
                          {milestone.completed ? '✅' : '⭕'}
                        </button>
                        <span className="milestone-title">{milestone.title}</span>
                        {milestone.completed && milestone.date && (
                          <span className="milestone-date">({formatDate(milestone.date)})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalTracking;
