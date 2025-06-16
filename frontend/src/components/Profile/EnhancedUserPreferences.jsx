import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from '../UI';
import notificationService from '../../services/notificationService';
import themeService from '../../services/themeService';
import dataExportService from '../../services/dataExportService';
import './EnhancedUserPreferences.css';

/**
 * Enhanced checkbox component with proper accessibility
 */
const AccessibleCheckbox = ({ 
  checked, 
  onChange, 
  title, 
  description, 
  name 
}) => (
  <div className="checkbox-item enhanced">
    <label className="checkbox-label" htmlFor={name}>
      <input
        id={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-describedby={`${name}-desc`}
      />
      <span className="checkmark"></span>
      <div className="label-content">
        <span className="label-title">{title}</span>
        <span className="label-description" id={`${name}-desc`}>{description}</span>
      </div>
    </label>
  </div>
);

AccessibleCheckbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

/**
 * EnhancedUserPreferences Component
 * Advanced user preferences management with detailed sections
 */
const EnhancedUserPreferences = ({ 
  initialPreferences = {}, 
  onSave, 
  loading = false 
}) => {
  const [preferences, setPreferences] = useState({
    // Appearance preferences
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    
    // Notification preferences
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    activity_reminders: true,
    progress_reports: true,
    marketing_emails: false,
    
    // Privacy settings
    profile_visibility: 'private',
    share_progress: false,
    allow_contact: false,
    data_sharing_consent: false,
    marketing_consent: false,
    
    // Accessibility settings
    high_contrast: false,
    large_text: false,
    screen_reader: false,
    reduce_animations: false,
    
    // Data & Export preferences
    export_format: 'json',
    auto_backup: false,
    data_retention: '2_years',
    preferred_communication_time: 'any',
    
    ...initialPreferences  });

  const [activeSection, setActiveSection] = useState('appearance');
  const [hasChanges, setHasChanges] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      ...initialPreferences
    }));
  }, [initialPreferences]);const handlePreferenceChange = (key, value) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [key]: value };
      setHasChanges(true);
      
      // Apply theme and accessibility changes immediately
      if (key === 'theme' || ['high_contrast', 'large_text', 'reduce_animations', 'screen_reader'].includes(key)) {
        const accessibilityOptions = {
          high_contrast: newPrefs.high_contrast,
          large_text: newPrefs.large_text,
          reduce_animations: newPrefs.reduce_animations,
          screen_reader: newPrefs.screen_reader
        };
        
        themeService.applyTheme(newPrefs.theme, accessibilityOptions);
      }
      
      return newPrefs;
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(preferences);
      setHasChanges(false);
      
      // Ensure theme service has the latest preferences saved
      const accessibilityOptions = {
        high_contrast: preferences.high_contrast,
        large_text: preferences.large_text,
        reduce_animations: preferences.reduce_animations,
        screen_reader: preferences.screen_reader
      };
      themeService.applyTheme(preferences.theme, accessibilityOptions);
      
      notificationService.showSuccess('Preferenze salvate con successo');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Errore nel salvataggio delle preferenze:', error);
      }
      notificationService.showError('Errore nel salvataggio delle preferenze');
    }
  };
  const resetToDefaults = () => {
    setPreferences({
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      activity_reminders: true,
      progress_reports: true,
      marketing_emails: false,
      profile_visibility: 'private',
      share_progress: false,
      allow_contact: false,
      data_sharing_consent: false,
      marketing_consent: false,
      high_contrast: false,
      large_text: false,
      screen_reader: false,
      reduce_animations: false,
      export_format: 'json',
      auto_backup: false,
      data_retention: '2_years',
      preferred_communication_time: 'any'
    });
    setHasChanges(true);
    notificationService.showInfo('Preferenze ripristinate ai valori predefiniti');
  };

  const handleDataExport = async () => {
    setIsExporting(true);
    try {
      const exportRequest = await dataExportService.requestExport(preferences.export_format);
      notificationService.showSuccess('Richiesta di export inviata. Ti invieremo una email quando sarà pronto.');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Export request:', exportRequest);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error requesting export:', error);
      }
      notificationService.showError('Errore durante la richiesta di export dei dati');
    } finally {
      setIsExporting(false);
    }
  };

  const sections = [
    { id: 'appearance', label: 'Aspetto', icon: '🎨' },
    { id: 'notifications', label: 'Notifiche', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'accessibility', label: 'Accessibilità', icon: '♿' },
    { id: 'data', label: 'Dati & Export', icon: '📊' }
  ];

  const renderAppearanceSection = () => (
    <div className="preference-section">
      <h4>🎨 Aspetto e Personalizzazione</h4>
      
      <div className="form-group">
        <label htmlFor="theme">Tema Interfaccia</label>
        <select
          id="theme"
          value={preferences.theme}
          onChange={(e) => handlePreferenceChange('theme', e.target.value)}
          className="preference-select"
        >
          <option value="light">☀️ Chiaro</option>
          <option value="dark">🌙 Scuro</option>
          <option value="auto">🌗 Automatico (Sistema)</option>
          <option value="high_contrast">⚫ Alto Contrasto</option>
        </select>
        <small>Il tema scuro riduce l&apos;affaticamento degli occhi in ambienti poco illuminati</small>
      </div>

      <div className="form-group">
        <label htmlFor="language">Lingua Interfaccia</label>
        <select
          id="language"
          value={preferences.language}
          onChange={(e) => handlePreferenceChange('language', e.target.value)}
          className="preference-select"
        >
          <option value="en">🇺🇸 English</option>
          <option value="it">🇮🇹 Italiano</option>
          <option value="es">🇪🇸 Español</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="de">🇩🇪 Deutsch</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="timezone">Fuso Orario</label>
        <select
          id="timezone"
          value={preferences.timezone}
          onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
          className="preference-select"
        >
          <option value="UTC">🌍 UTC (Coordinato Universale)</option>
          <option value="Europe/Rome">🇮🇹 Europa/Roma (GMT+1)</option>
          <option value="Europe/London">🇬🇧 Europa/Londra (GMT+0)</option>
          <option value="America/New_York">🇺🇸 America/New York (GMT-5)</option>
          <option value="America/Los_Angeles">🇺🇸 America/Los Angeles (GMT-8)</option>
          <option value="Asia/Tokyo">🇯🇵 Asia/Tokyo (GMT+9)</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="preference-section">
      <h4>🔔 Notifiche e Comunicazioni</h4>
      
      <div className="preference-category">
        <h5>Canali di Notifica</h5>        <div className="checkbox-group">
          <div className="checkbox-item enhanced">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                aria-describedby="email-desc"
              />
              <span className="checkmark"></span>
              <div className="label-content">
                <span className="label-title">📧 Notifiche Email</span>
                <span className="label-description" id="email-desc">Ricevi aggiornamenti importanti via email</span>
              </div>
            </label>
          </div>

          <div className="checkbox-item enhanced">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.push_notifications}
                onChange={(e) => handlePreferenceChange('push_notifications', e.target.checked)}
                aria-describedby="push-desc"
              />
              <span className="checkmark"></span>
              <div className="label-content">
                <span className="label-title">🔔 Notifiche Push</span>
                <span className="label-description" id="push-desc">Notifiche istantanee sul dispositivo</span>
              </div>
            </label>
          </div>

          <div className="checkbox-item enhanced">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.sms_notifications}
                onChange={(e) => handlePreferenceChange('sms_notifications', e.target.checked)}
                aria-describedby="sms-desc"
              />
              <span className="checkmark"></span>
              <div className="label-content">
                <span className="label-title">📱 Notifiche SMS</span>
                <span className="label-description" id="sms-desc">Messaggi di testo per eventi critici</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="preference-category">
        <h5>Tipi di Notifica</h5>
        <div className="checkbox-group">
          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.activity_reminders}
              onChange={(e) => handlePreferenceChange('activity_reminders', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">⏰ Promemoria Attività</span>
              <span className="label-description">Ricorda sessioni di gioco e attività programmate</span>
            </div>
          </label>

          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.progress_reports}
              onChange={(e) => handlePreferenceChange('progress_reports', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">📊 Report di Progresso</span>
              <span className="label-description">Riepiloghi periodici sui progressi del bambino</span>
            </div>
          </label>

          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.marketing_emails}
              onChange={(e) => handlePreferenceChange('marketing_emails', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">📰 Newsletter e Aggiornamenti</span>
              <span className="label-description">Novità, consigli e contenuti educativi</span>
            </div>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="communication_time">Orario Preferito per Comunicazioni</label>
        <select
          id="communication_time"
          value={preferences.preferred_communication_time}
          onChange={(e) => handlePreferenceChange('preferred_communication_time', e.target.value)}
          className="preference-select"
        >
          <option value="any">🕐 Qualsiasi Orario</option>
          <option value="morning">🌅 Mattina (8:00 - 12:00)</option>
          <option value="afternoon">☀️ Pomeriggio (12:00 - 18:00)</option>
          <option value="evening">🌆 Sera (18:00 - 22:00)</option>
          <option value="business_hours">💼 Orario Lavorativo (9:00 - 17:00)</option>
        </select>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="preference-section">
      <h4>🔒 Privacy e Sicurezza</h4>
      
      <div className="preference-category">
        <h5>Visibilità Profilo</h5>
        <div className="form-group">
          <label htmlFor="profile_visibility">Chi può vedere il tuo profilo</label>
          <select
            id="profile_visibility"
            value={preferences.profile_visibility}
            onChange={(e) => handlePreferenceChange('profile_visibility', e.target.value)}
            className="preference-select"
          >
            <option value="private">🔒 Privato (Solo tu)</option>
            <option value="professionals">👩‍⚕️ Solo Professionisti Autorizzati</option>
            <option value="network">👥 Rete di Contatti</option>
            <option value="public">🌍 Pubblico (con limitazioni)</option>
          </select>
        </div>
      </div>

      <div className="preference-category">
        <h5>Condivisione Dati</h5>
        <div className="checkbox-group">
          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.share_progress}
              onChange={(e) => handlePreferenceChange('share_progress', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">📈 Condividi Progressi</span>
              <span className="label-description">Permetti ai professionisti di vedere i progressi</span>
            </div>
          </label>

          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.allow_contact}
              onChange={(e) => handlePreferenceChange('allow_contact', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">💬 Permetti Contatto</span>
              <span className="label-description">Altri utenti possono inviarti messaggi</span>
            </div>
          </label>

          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.data_sharing_consent}
              onChange={(e) => handlePreferenceChange('data_sharing_consent', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">🔬 Ricerca Scientifica</span>
              <span className="label-description">Contribuisci alla ricerca con dati anonimi</span>
            </div>
          </label>

          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.marketing_consent}
              onChange={(e) => handlePreferenceChange('marketing_consent', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">📢 Marketing Personalizzato</span>
              <span className="label-description">Ricevi contenuti personalizzati sui tuoi interessi</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAccessibilitySection = () => (
    <div className="preference-section">
      <h4>♿ Accessibilità e Usabilità</h4>
      
      <div className="preference-category">
        <h5>Supporto Visivo</h5>
        <div className="checkbox-group">
          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.high_contrast}
              onChange={(e) => handlePreferenceChange('high_contrast', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">⚫ Alto Contrasto</span>
              <span className="label-description">Aumenta il contrasto per una migliore leggibilità</span>
            </div>
          </label>

          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.large_text}
              onChange={(e) => handlePreferenceChange('large_text', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">🔍 Testo Ingrandito</span>
              <span className="label-description">Dimensioni del testo più grandi</span>
            </div>
          </label>

          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.reduce_animations}
              onChange={(e) => handlePreferenceChange('reduce_animations', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">🎭 Riduci Animazioni</span>
              <span className="label-description">Limita movimenti e transizioni per sensibilità visive</span>
            </div>
          </label>
        </div>
      </div>

      <div className="preference-category">
        <h5>Supporto Tecnologie Assistive</h5>
        <div className="checkbox-group">
          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.screen_reader}
              onChange={(e) => handlePreferenceChange('screen_reader', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">🗣️ Ottimizzazione Screen Reader</span>
              <span className="label-description">Migliora compatibilità con lettori di schermo</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="preference-section">
      <h4>📊 Gestione Dati e Export</h4>
      
      <div className="preference-category">
        <h5>Formato Export</h5>
        <div className="form-group">
          <label htmlFor="export_format">Formato Predefinito per Export</label>
          <select
            id="export_format"
            value={preferences.export_format}
            onChange={(e) => handlePreferenceChange('export_format', e.target.value)}
            className="preference-select"
          >
            <option value="json">📄 JSON (Strutturato)</option>
            <option value="csv">📊 CSV (Excel compatibile)</option>
            <option value="pdf">📑 PDF (Report visuali)</option>
            <option value="xml">🗂️ XML (Standard)</option>
          </select>
        </div>
      </div>

      <div className="preference-category">
        <h5>Backup e Conservazione</h5>
        <div className="checkbox-group">
          <label className="checkbox-label enhanced">
            <input
              type="checkbox"
              checked={preferences.auto_backup}
              onChange={(e) => handlePreferenceChange('auto_backup', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="label-content">
              <span className="label-title">☁️ Backup Automatico</span>
              <span className="label-description">Backup periodici dei dati su cloud sicuro</span>
            </div>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="data_retention">Periodo di Conservazione Dati</label>
          <select
            id="data_retention"
            value={preferences.data_retention}
            onChange={(e) => handlePreferenceChange('data_retention', e.target.value)}
            className="preference-select"
          >
            <option value="1_year">📅 1 Anno</option>
            <option value="2_years">📅 2 Anni</option>
            <option value="5_years">📅 5 Anni</option>
            <option value="permanent">♾️ Permanente</option>          </select>
          <small>I dati vengono eliminati automaticamente dopo il periodo selezionato</small>
        </div>
      </div>

      <div className="preference-category">
        <h5>Export Dati</h5>
        <p>Richiedi un export completo dei tuoi dati nel formato selezionato</p>
        <Button
          variant="outline"
          onClick={handleDataExport}
          disabled={isExporting}
          className="export-button"
        >
          {isExporting ? '⏳ Elaborazione...' : '📤 Richiedi Export Dati'}
        </Button>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'appearance':
        return renderAppearanceSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'privacy':
        return renderPrivacySection();
      case 'accessibility':
        return renderAccessibilitySection();
      case 'data':
        return renderDataSection();
      default:
        return renderAppearanceSection();
    }
  };

  return (
    <Card className="enhanced-user-preferences">
      <div className="preferences-header">
        <h3>⚙️ Preferenze Avanzate</h3>
        <p>Personalizza la tua esperienza Smile Adventure</p>
      </div>

      <div className="preferences-layout">
        <div className="preferences-sidebar">
          <nav className="preferences-nav">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="preferences-content">
          <form onSubmit={handleSubmit} className="preferences-form">
            {renderCurrentSection()}
            
            <div className="preferences-actions">
              <div className="action-buttons">
                <Button
                  type="button"
                  onClick={resetToDefaults}
                  className="secondary"
                  disabled={loading}
                >
                  🔄 Ripristina Default
                </Button>
                
                <Button
                  type="submit"
                  disabled={loading || !hasChanges}
                  className="primary"
                >
                  {loading ? '💾 Salvando...' : '💾 Salva Preferenze'}
                </Button>
              </div>
              
              {hasChanges && (
                <div className="changes-indicator">
                  ⚠️ Hai modifiche non salvate
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
};

EnhancedUserPreferences.propTypes = {
  initialPreferences: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default EnhancedUserPreferences;
