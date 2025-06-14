import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout, Button, Card } from '../components/UI';
import profileService from '../services/profileService';
import notificationService from '../services/notificationService';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    timezone: 'UTC',
    language: 'en',
    role: 'parent'
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    privacy_settings: {
      profile_visibility: 'private',
      share_progress: false,
      allow_contact: false
    }
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(null);

  useEffect(() => {
    loadProfileData();
    loadPreferences();
    loadProfileCompletion();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        timezone: user.timezone || 'UTC',
        language: user.language || 'en',
        role: user.role || 'parent',
        licenseNumber: user.license_number || '',
        specialization: user.specialization || '',
        clinicName: user.clinic_name || '',
        clinicAddress: user.clinic_address || ''
      });
      setAvatarPreview(user.avatar_url);
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      const profile = await profileService.getProfile();
      const transformedData = profileService.transformUserData(profile);
      setProfileData(transformedData);
      setAvatarPreview(transformedData.avatarUrl);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await profileService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadProfileCompletion = async () => {
    try {
      const completion = await profileService.getProfileCompletion();
      setProfileCompletion(completion);
    } catch (error) {
      console.error('Error loading profile completion:', error);
    }
  };
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = await profileService.updateProfile(profileData);
      const transformedData = profileService.transformUserData(updatedProfile);
      updateUser(transformedData);
      await loadProfileCompletion();
      notificationService.showSuccess('Profilo aggiornato con successo');
    } catch (error) {
      console.error('Error updating profile:', error);
      notificationService.showError('Errore nell\'aggiornamento del profilo');
    } finally {
      setLoading(false);
    }
  };
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profileService.updatePreferences(preferences);
      notificationService.showSuccess('Preferenze aggiornate con successo');
    } catch (error) {
      console.error('Error updating preferences:', error);
      notificationService.showError('Errore nell\'aggiornamento delle preferenze');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const handleAvatarUpload = async () => {
    if (!avatar) return;

    setLoading(true);
    try {
      const response = await profileService.uploadAvatar(avatar);
      setAvatarPreview(response.avatar_url);
      updateUser({ ...user, avatar_url: response.avatar_url });
      setAvatar(null);
      notificationService.showSuccess('Avatar caricato con successo');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      notificationService.showError('Errore nel caricamento dell\'avatar');
    } finally {
      setLoading(false);
    }
  };
  const handleAvatarDelete = async () => {
    setLoading(true);
    try {
      await profileService.deleteAvatar();
      setAvatarPreview(null);
      updateUser({ ...user, avatar_url: null });
      notificationService.showSuccess('Avatar rimosso con successo');
    } catch (error) {
      console.error('Error deleting avatar:', error);
      notificationService.showError('Errore nella rimozione dell\'avatar');
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralTab = () => (
    <Card>
      <div className="profile-section">
        <h3>Informazioni Generali</h3>
        
        {profileCompletion && (
          <div className="profile-completion">
            <div className="completion-header">
              <span>Completamento Profilo</span>
              <span className="completion-percentage">{profileCompletion.completion_percentage}%</span>
            </div>
            <div className="completion-bar">
              <div 
                className="completion-progress" 
                style={{ width: `${profileCompletion.completion_percentage}%` }}
              />
            </div>
            {profileCompletion.missing_fields.length > 0 && (
              <div className="missing-fields">
                <p>Campi mancanti:</p>                <ul>
                  {profileCompletion.missing_fields.map((field, index) => (
                    <li key={`missing-field-${index}-${field}`}>{field}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="profile-form">          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Nome *</label>
              <input
                id="firstName"
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Cognome *</label>
              <input
                id="lastName"
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                required
              />
            </div>
          </div>          <div className="form-group">
            <label htmlFor="userEmail">Email</label>
            <input
              id="userEmail"
              type="email"
              value={profileData.email}
              disabled
              className="disabled-field"
            />
            <small>L&apos;email non può essere modificata</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="userPhone">Telefono</label>
              <input
                id="userPhone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+39 123 456 7890"
              />
            </div>
            <div className="form-group">
              <label htmlFor="userTimezone">Timezone</label>
              <select
                id="userTimezone"
                value={profileData.timezone}
                onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
              >
                <option value="UTC">UTC</option>
                <option value="Europe/Rome">Europe/Rome</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="userLanguage">Lingua</label>
            <select
              id="userLanguage"
              value={profileData.language}
              onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
            >
              <option value="en">English</option>
              <option value="it">Italiano</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          {profileData.role === 'professional' && (
            <>
              <h4>Informazioni Professionali</h4>              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="licenseNumber">Numero Licenza *</label>
                  <input
                    id="licenseNumber"
                    type="text"
                    value={profileData.licenseNumber}
                    onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="specialization">Specializzazione</label>
                  <input
                    id="specialization"
                    type="text"
                    value={profileData.specialization}
                    onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                    placeholder="es. Pediatria, Ortodonzia"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="clinicName">Nome Clinica/Studio</label>
                <input
                  id="clinicName"
                  type="text"
                  value={profileData.clinicName}
                  onChange={(e) => setProfileData({ ...profileData, clinicName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="clinicAddress">Indirizzo Clinica</label>
                <textarea
                  id="clinicAddress"
                  value={profileData.clinicAddress}
                  onChange={(e) => setProfileData({ ...profileData, clinicAddress: e.target.value })}
                  rows="3"
                  placeholder="Via, Città, CAP"
                />
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="primary">
            {loading ? 'Salvando...' : 'Salva Profilo'}
          </Button>
        </form>
      </div>
    </Card>
  );

  const renderAvatarTab = () => (
    <Card>
      <div className="profile-section">
        <h3>Avatar</h3>
        
        <div className="avatar-section">
          <div className="avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                <span>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
              </div>
            )}
          </div>

          <div className="avatar-controls">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="file-input"
              id="avatar-upload"
            />
            <label htmlFor="avatar-upload" className="file-label">
              Scegli Immagine
            </label>

            {avatar && (
              <Button onClick={handleAvatarUpload} disabled={loading} className="primary">
                {loading ? 'Caricando...' : 'Carica Avatar'}
              </Button>
            )}

            {avatarPreview && (
              <Button onClick={handleAvatarDelete} disabled={loading} className="danger">
                Rimuovi Avatar
              </Button>
            )}
          </div>

          <div className="avatar-requirements">
            <h4>Requisiti Avatar:</h4>
            <ul>
              <li>Formato: JPG, PNG, GIF</li>
              <li>Dimensione massima: 5MB</li>
              <li>Dimensioni consigliate: 200x200px</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderPreferencesTab = () => (
    <Card>
      <div className="profile-section">
        <h3>Preferenze</h3>
        
        <form onSubmit={handlePreferencesSubmit} className="preferences-form">
          <div className="preference-group">
            <h4>Aspetto</h4>            <div className="form-group">
              <label htmlFor="themeSelect">Tema</label>
              <select
                id="themeSelect"
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
              >
                <option value="light">Chiaro</option>
                <option value="dark">Scuro</option>
                <option value="auto">Automatico</option>
              </select>
            </div>
          </div>

          <div className="preference-group">
            <h4>Notifiche</h4>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.email_notifications}
                  onChange={(e) => setPreferences({ 
                    ...preferences, 
                    email_notifications: e.target.checked 
                  })}
                />
                <span>Notifiche Email</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.push_notifications}
                  onChange={(e) => setPreferences({ 
                    ...preferences, 
                    push_notifications: e.target.checked 
                  })}
                />
                <span>Notifiche Push</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.sms_notifications}
                  onChange={(e) => setPreferences({ 
                    ...preferences, 
                    sms_notifications: e.target.checked 
                  })}
                />
                <span>Notifiche SMS</span>
              </label>
            </div>
          </div>

          <div className="preference-group">
            <h4>Privacy</h4>            <div className="form-group">
              <label htmlFor="profileVisibility">Visibilità Profilo</label>
              <select
                id="profileVisibility"
                value={preferences.privacy_settings.profile_visibility}
                onChange={(e) => setPreferences({ 
                  ...preferences, 
                  privacy_settings: {
                    ...preferences.privacy_settings,
                    profile_visibility: e.target.value
                  }
                })}
              >
                <option value="private">Privato</option>
                <option value="public">Pubblico</option>
                <option value="professionals">Solo Professionisti</option>
              </select>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.privacy_settings.share_progress}
                  onChange={(e) => setPreferences({ 
                    ...preferences, 
                    privacy_settings: {
                      ...preferences.privacy_settings,
                      share_progress: e.target.checked
                    }
                  })}
                />
                <span>Condividi Progressi</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.privacy_settings.allow_contact}
                  onChange={(e) => setPreferences({ 
                    ...preferences, 
                    privacy_settings: {
                      ...preferences.privacy_settings,
                      allow_contact: e.target.checked
                    }
                  })}
                />
                <span>Permetti Contatto da Altri Utenti</span>
              </label>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="primary">
            {loading ? 'Salvando...' : 'Salva Preferenze'}
          </Button>
        </form>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-header">
          <h1>Il Mio Profilo</h1>
          <p>Gestisci le tue informazioni personali e preferenze</p>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            Generale
          </button>
          <button
            className={`tab-button ${activeTab === 'avatar' ? 'active' : ''}`}
            onClick={() => setActiveTab('avatar')}
          >
            Avatar
          </button>
          <button
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferenze
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'avatar' && renderAvatarTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
