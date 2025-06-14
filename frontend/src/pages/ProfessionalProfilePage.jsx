/**
 * ProfessionalProfilePage - Gestione profilo professionale
 * Pagina per creare e gestire il profilo professionale
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout, Button, Card } from '../components/UI';
import professionalService from '../services/professionalService';
import notificationService from '../services/notificationService';
import './ProfessionalProfilePage.css';

const ProfessionalProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    licenseNumber: '',
    specialization: '',
    clinicName: '',
    clinicAddress: '',
    acceptingPatients: false,
    bio: '',
    website: '',
    certifications: [],
    availability: {}
  });

  const [newCertification, setNewCertification] = useState('');

  const getButtonText = () => {
    if (loading) return 'Salvando...';
    return profileExists ? 'Aggiorna Profilo' : 'Crea Profilo';
  };

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        licenseNumber: user.license_number || '',
        specialization: user.specialization || '',
        clinicName: user.clinic_name || '',
        clinicAddress: user.clinic_address || ''
      }));
    }
    loadProfessionalProfile();
  }, [user]);

  const loadProfessionalProfile = async () => {
    try {
      const profile = await professionalService.getProfessionalProfile();
      const frontendData = professionalService.transformToFrontendFormat(profile);
      setProfileData(frontendData);
      setProfileExists(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setProfileExists(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = professionalService.validateProfileData(profileData);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          notificationService.showError(error);
        });
        return;
      }

      if (profileExists) {
        await professionalService.updateProfessionalProfile(profileData);
      } else {
        await professionalService.createProfessionalProfile(profileData);
        setProfileExists(true);
      }

      await loadProfessionalProfile();
    } catch (error) {
      console.error('Error saving professional profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCertification = () => {
    if (newCertification.trim() && !profileData.certifications.includes(newCertification.trim())) {
      setProfileData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleAvailabilityChange = (day, timeSlot, checked) => {
    setProfileData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [timeSlot]: checked
        }
      }
    }));
  };

  const renderBasicTab = () => (
    <Card>
      <div className="professional-section">
        <h3>Informazioni di Base</h3>
        
        <form onSubmit={handleSubmit} className="professional-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prof-firstName">Nome *</label>
              <input
                id="prof-firstName"
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="prof-lastName">Cognome *</label>
              <input
                id="prof-lastName"
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prof-phone">Telefono</label>
              <input
                id="prof-phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+39 123 456 7890"
              />
            </div>
            <div className="form-group">
              <label htmlFor="prof-licenseNumber">Numero Licenza *</label>
              <input
                id="prof-licenseNumber"
                type="text"
                value={profileData.licenseNumber}
                onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="prof-specialization">Specializzazione *</label>
            <select
              id="prof-specialization"
              value={profileData.specialization}
              onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
              required
            >
              <option value="">Seleziona specializzazione</option>
              {professionalService.getSpecializations().map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="prof-bio">Biografia Professionale</label>
            <textarea
              id="prof-bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              rows="4"
              placeholder="Descrivi la tua esperienza professionale..."
              maxLength="1000"
            />
            <small>{profileData.bio.length}/1000 caratteri</small>
          </div>

          <div className="form-group">
            <label htmlFor="prof-website">Sito Web</label>
            <input
              id="prof-website"
              type="url"
              value={profileData.website}
              onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
              placeholder="https://www.studio-dentistico.it"
            />
          </div>
        </form>
      </div>
    </Card>
  );

  const renderClinicTab = () => (
    <Card>
      <div className="professional-section">
        <h3>Informazioni Studio/Clinica</h3>
        
        <div className="professional-form">
          <div className="form-group">
            <label htmlFor="prof-clinicName">Nome Studio/Clinica</label>
            <input
              id="prof-clinicName"
              type="text"
              value={profileData.clinicName}
              onChange={(e) => setProfileData({ ...profileData, clinicName: e.target.value })}
              placeholder="Studio Dentistico Dr. Rossi"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prof-clinicAddress">Indirizzo Completo</label>
            <textarea
              id="prof-clinicAddress"
              value={profileData.clinicAddress}
              onChange={(e) => setProfileData({ ...profileData, clinicAddress: e.target.value })}
              rows="3"
              placeholder="Via Roma 123, 00100 Roma RM, Italia"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profileData.acceptingPatients}
                onChange={(e) => setProfileData({ ...profileData, acceptingPatients: e.target.checked })}
              />
              <span>Attualmente accetto nuovi pazienti</span>
            </label>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderCertificationsTab = () => (
    <Card>
      <div className="professional-section">
        <h3>Certificazioni e Qualifiche</h3>
        
        <div className="certifications-section">
          <div className="add-certification">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="newCertification">Aggiungi Certificazione</label>
                <input
                  id="newCertification"
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="es. Master in Implantologia"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCertification()}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddCertification}
                disabled={!newCertification.trim()}
                className="secondary"
              >
                Aggiungi
              </Button>
            </div>
          </div>

          <div className="certifications-list">
            {profileData.certifications.length > 0 ? (
              <ul>                {profileData.certifications.map((cert, index) => (
                  <li key={`cert-${cert}-${index}`} className="certification-item">
                    <span>{cert}</span>
                    <Button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      className="danger small"
                      aria-label={`Rimuovi certificazione ${cert}`}
                    >
                      ✕
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-certifications">Nessuna certificazione aggiunta</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const renderAvailabilityTab = () => (
    <Card>
      <div className="professional-section">
        <h3>Disponibilità</h3>
        
        <div className="availability-grid">
          {professionalService.getDaysOfWeek().map(day => (
            <div key={day.value} className="day-availability">
              <h4>{day.label}</h4>
              <div className="time-slots">
                {professionalService.getAvailabilitySlots().map(slot => (
                  <label key={`${day.value}-${slot.value}`} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profileData.availability[day.value]?.[slot.value] || false}
                      onChange={(e) => handleAvailabilityChange(day.value, slot.value, e.target.checked)}
                    />
                    <span>{slot.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="professional-profile-page">
        <div className="professional-header">
          <h1>Profilo Professionale</h1>
          <p>
            {profileExists 
              ? 'Gestisci le tue informazioni professionali'
              : 'Crea il tuo profilo professionale per essere trovato dai pazienti'
            }
          </p>
        </div>

        <div className="professional-tabs">
          <button
            className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Informazioni Base
          </button>
          <button
            className={`tab-button ${activeTab === 'clinic' ? 'active' : ''}`}
            onClick={() => setActiveTab('clinic')}
          >
            Studio/Clinica
          </button>
          <button
            className={`tab-button ${activeTab === 'certifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('certifications')}
          >
            Certificazioni
          </button>
          <button
            className={`tab-button ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            Disponibilità
          </button>
        </div>

        <div className="professional-content">
          {activeTab === 'basic' && renderBasicTab()}
          {activeTab === 'clinic' && renderClinicTab()}
          {activeTab === 'certifications' && renderCertificationsTab()}
          {activeTab === 'availability' && renderAvailabilityTab()}
        </div>        <div className="professional-actions">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="primary large"
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProfessionalProfilePage;
