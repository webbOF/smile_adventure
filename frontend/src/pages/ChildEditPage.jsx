import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Button, Spinner } from '../components/UI';
import PhotoUpload from '../components/PhotoUpload';
import SensoryProfileEditor from '../components/SensoryProfileEditor';
import { getChild, updateChild } from '../services/childrenService';
import { ROUTES } from '../utils/constants';
import './ChildEditPage.css';

/**
 * Form validation utility
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation errors
 */
const validateForm = (formData) => {
  const errors = {};

  if (!formData.name?.trim()) {
    errors.name = 'Il nome è obbligatorio';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Il nome deve avere almeno 2 caratteri';
  }

  if (!formData.birth_date) {
    errors.birth_date = 'La data di nascita è obbligatoria';
  } else {
    const birthDate = new Date(formData.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (birthDate > today) {
      errors.birth_date = 'La data di nascita non può essere nel futuro';
    } else if (age > 18) {
      errors.birth_date = 'L\'età deve essere inferiore a 18 anni';
    } else if (age < 0) {
      errors.birth_date = 'Data di nascita non valida';
    }
  }

  if (!formData.gender) {
    errors.gender = 'Il genere è obbligatorio';
  }

  return errors;
};

/**
 * Calculate age from birth date
 * @param {string} birthDate - Birth date string
 * @returns {number} - Age in years
 */
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date
 */
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

/**
 * Convert sensory profile from object format to numeric format for the editor
 * @param {Object} sensoryProfile - Sensory profile with object format
 * @returns {Object} - Sensory profile with numeric format
 */
const convertSensoryProfileToNumeric = (sensoryProfile) => {
  if (!sensoryProfile || typeof sensoryProfile !== 'object') {
    return {
      visual: 3,
      auditory: 3,
      tactile: 3,
      proprioceptive: 3,
      vestibular: 3
    };
  }

  const sensitivityMap = {
    'low': 2,
    'moderate': 3,
    'high': 4
  };

  const result = {};
  
  // Convert each domain from object to numeric value
  Object.keys(sensoryProfile).forEach(key => {
    const value = sensoryProfile[key];
    
    if (typeof value === 'object' && value !== null && value.sensitivity) {
      // Convert object format to numeric
      result[key] = sensitivityMap[value.sensitivity] || 3;
    } else if (typeof value === 'number') {
      // Already numeric, use as is
      result[key] = value;
    } else {
      // Default value
      result[key] = 3;
    }
  });

  // Ensure all required domains exist
  const requiredDomains = ['visual', 'auditory', 'tactile', 'proprioceptive', 'vestibular'];
  requiredDomains.forEach(domain => {
    if (result[domain] === undefined) {
      result[domain] = 3;
    }
  });

  return result;
};

/**
 * Convert sensory profile from numeric format back to object format for backend
 * @param {Object} numericProfile - Sensory profile with numeric format
 * @returns {Object} - Sensory profile with object format
 */
const convertSensoryProfileToObject = (numericProfile) => {
  if (!numericProfile || typeof numericProfile !== 'object') {
    return {};
  }

  const sensitivityMap = {
    1: 'low',
    2: 'low', 
    3: 'moderate',
    4: 'high',
    5: 'high'
  };

  const result = {};
  
  Object.keys(numericProfile).forEach(key => {
    const value = numericProfile[key];
    if (typeof value === 'number') {
      result[key] = {
        sensitivity: sensitivityMap[value] || 'moderate',
        preferences: [],
        triggers: []
      };
    }
  });

  return result;
};

/**
 * Child Edit Page Component
 */
const ChildEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: '',
    asd_diagnosis: false,
    diagnosis_notes: '',
    special_notes: '',
    sensory_profile: {
      visual: 3,
      auditory: 3,
      tactile: 3,
      proprioceptive: 3,
      vestibular: 3
    }
  });

  // Load child data
  useEffect(() => {
    const fetchChild = async () => {
      try {
        setLoading(true);
        setErrors({});
        const childData = await getChild(id);
          const formattedData = {
          name: childData.name || '',
          birth_date: formatDateForInput(childData.birth_date),
          gender: childData.gender || '',
          asd_diagnosis: Boolean(childData.asd_diagnosis),
          diagnosis_notes: childData.diagnosis_notes || '',
          special_notes: childData.special_notes || '',
          sensory_profile: convertSensoryProfileToNumeric(childData.sensory_profile)
        };
        
        setFormData(formattedData);
        setOriginalData(formattedData);
      } catch (err) {
        console.error('Error fetching child:', err);
        setErrors({
          fetch: 'Impossibile caricare i dati del bambino'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChild();
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {      // Calculate age and prepare data
      const childData = {
        ...formData,
        age: calculateAge(formData.birth_date),
        name: formData.name.trim(),
        sensory_profile: convertSensoryProfileToObject(formData.sensory_profile)
      };

      // Remove empty optional fields
      if (!childData.diagnosis_notes?.trim()) {
        childData.diagnosis_notes = null;
      }
      if (!childData.special_notes?.trim()) {
        childData.special_notes = null;
      }

      const updatedChild = await updateChild(id, childData);
      
      // Navigate back to child detail page
      navigate(ROUTES.CHILDREN_DETAIL(id), {
        state: { message: `Profilo di ${updatedChild.name} aggiornato con successo!` }
      });
    } catch (err) {
      console.error('Error updating child:', err);
      setErrors({
        submit: err.response?.data?.detail || 'Errore durante l\'aggiornamento del profilo'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.CHILDREN_DETAIL(id));
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const calculatedAge = formData.birth_date ? calculateAge(formData.birth_date) : null;

  if (loading) {
    return (
      <Layout>
        <div className="child-edit-loading">
          <Spinner size="large" />
          <p>Caricamento dati bambino...</p>
        </div>
      </Layout>
    );
  }

  if (errors.fetch) {
    return (
      <Layout>
        <div className="child-edit-error">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>Errore</h2>
            <p>{errors.fetch}</p>
            <div className="error-actions">
              <Button variant="outline" onClick={() => navigate(ROUTES.CHILDREN)}>
                Torna alla Lista
              </Button>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Riprova
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="child-edit-page">
        <div className="page-header">
          <h1>✏️ Modifica Profilo: {formData.name}</h1>
          <p>Aggiorna le informazioni e le impostazioni del bambino</p>
        </div>

        <form onSubmit={handleSubmit} className="child-form">
          {/* Basic Information Section */}
          <div className="form-section">
            <h2>📋 Informazioni di Base</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nome completo *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                  placeholder="Inserisci il nome del bambino"
                  disabled={saving}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="birth_date">Data di nascita *</label>
                <input
                  type="date"
                  id="birth_date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  className={errors.birth_date ? 'error' : ''}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={saving}
                />
                {calculatedAge !== null && (
                  <span className="age-display">Età: {calculatedAge} anni</span>
                )}
                {errors.birth_date && <span className="error-message">{errors.birth_date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="gender">Genere *</label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={errors.gender ? 'error' : ''}
                  disabled={saving}
                >
                  <option value="">Seleziona genere</option>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
                  <option value="O">Altro</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender}</span>}
              </div>
            </div>          </div>

          {/* Photo Upload Section */}
          <div className="form-section">
            <h2>📷 Foto Profilo</h2>
            <PhotoUpload
              currentPhoto={formData.photo}
              onPhotoChange={(file) => handleInputChange('photo', file)}
              childName={formData.name || 'del bambino'}
            />
          </div>

          {/* ASD Diagnosis Section */}
          <div className="form-section">
            <h2>🧠 Diagnosi ASD</h2>
            
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.asd_diagnosis}
                    onChange={(e) => handleInputChange('asd_diagnosis', e.target.checked)}
                    disabled={saving}
                  />
                  <span className="checkbox-text">Il bambino ha una diagnosi confermata di Disturbo dello Spettro Autistico</span>
                </label>
              </div>
            </div>

            {formData.asd_diagnosis && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="diagnosis_notes">Note sulla diagnosi</label>
                  <textarea
                    id="diagnosis_notes"
                    value={formData.diagnosis_notes}
                    onChange={(e) => handleInputChange('diagnosis_notes', e.target.value)}
                    placeholder="Inserisci note aggiuntive sulla diagnosi, se necessarie..."
                    rows="3"
                    disabled={saving}
                  />
                </div>
              </div>
            )}
          </div>          {/* Sensory Profile Section */}
          <div className="form-section">
            <SensoryProfileEditor
              sensoryProfile={formData.sensory_profile}
              onProfileChange={(newProfile) => handleInputChange('sensory_profile', newProfile)}
              disabled={saving}
            />
          </div>

          {/* Special Notes Section */}
          <div className="form-section">
            <h2>📝 Note Speciali</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="special_notes">Note aggiuntive</label>
                <textarea
                  id="special_notes"
                  value={formData.special_notes}
                  onChange={(e) => handleInputChange('special_notes', e.target.value)}
                  placeholder="Inserisci eventuali note speciali, preferenze, comportamenti particolari..."
                  rows="4"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="submit-error">
              <span className="error-icon">⚠️</span>
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Changes Indicator */}
          {hasChanges() && (
            <div className="changes-indicator">
              <span className="changes-icon">💾</span>
              <span>Ci sono modifiche non salvate</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={saving || !hasChanges()}
            >
              {saving ? 'Salvataggio...' : '💾 Salva Modifiche'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ChildEditPage;
