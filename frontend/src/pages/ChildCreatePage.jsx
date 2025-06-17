import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Header } from '../components/UI';
import PhotoUpload from '../components/PhotoUpload';
import SensoryProfileEditor from '../components/SensoryProfileEditor';
import { childrenService } from '../services/childrenService';
import { ROUTES } from '../utils/constants';
import './ChildCreatePage.css';

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
 * Child Create Page Component
 */
const ChildCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: '',
    photo: null,
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

    setLoading(true);
    setErrors({});    try {      // Calculate age and prepare data
      const childData = {
        ...formData,
        age: calculateAge(formData.birth_date),
        name: formData.name.trim(),
        // Map frontend fields to backend expected format
        diagnosis: formData.asd_diagnosis 
          ? (formData.diagnosis_notes?.trim() || 'Disturbo dello Spettro Autistico')
          : 'Non specificata',
        dateOfBirth: formData.birth_date,
        sensoryProfile: formData.sensory_profile
      };

      // Remove empty optional fields that aren't needed for backend
      const fieldsToRemove = ['asd_diagnosis', 'diagnosis_notes', 'birth_date'];
      fieldsToRemove.forEach(field => delete childData[field]);

      if (!childData.special_notes?.trim()) {
        delete childData.special_notes;
      }

      const newChild = await childrenService.createChild(childData);
      
      // Navigate to the new child's detail page
      navigate(ROUTES.CHILDREN_DETAIL(newChild.id), {
        state: { message: `Profilo di ${newChild.name} creato con successo!` }
      });
    } catch (err) {
      console.error('Error creating child:', err);
      setErrors({
        submit: err.response?.data?.detail || 'Errore durante la creazione del profilo'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.CHILDREN);
  };

  const calculatedAge = formData.birth_date ? calculateAge(formData.birth_date) : null;
  return (
    <Layout header={<Header />}>
      <div className="child-create-page">
        <div className="page-header">
          <h1>➕ Aggiungi Nuovo Bambino</h1>
          <p>Crea un nuovo profilo per monitorare i progressi e le sessioni di gioco</p>
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                >
                  <option value="">Seleziona genere</option>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
                  <option value="O">Altro</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender}</span>}
              </div>            </div>
          </div>

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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>          {/* Sensory Profile Section */}
          <div className="form-section">
            <SensoryProfileEditor
              sensoryProfile={formData.sensory_profile}
              onProfileChange={(newProfile) => handleInputChange('sensory_profile', newProfile)}
              disabled={loading}
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
                  disabled={loading}
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

          {/* Form Actions */}
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Creazione in corso...' : '✅ Crea Profilo'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ChildCreatePage;
