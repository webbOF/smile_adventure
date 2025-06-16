/**
 * Theme Service - Gestione tema e preferenze UI
 * Servizio per applicare le preferenze di tema e accessibilità
 */

class ThemeService {
  constructor() {
    this.themeClassName = 'smile-theme';
    this.init();
  }

  /**
   * Inizializza il servizio tema
   */
  init() {
    // Carica il tema salvato nelle preferences o usa quello di sistema
    this.loadSavedTheme();
    
    // Ascolta i cambiamenti delle preferenze di sistema
    this.watchSystemTheme();
  }

  /**
   * Applica un tema
   * @param {string} theme - Tema da applicare (light, dark, auto, high_contrast)
   * @param {Object} accessibility - Opzioni di accessibilità
   */
  applyTheme(theme = 'light', accessibility = {}) {
    const body = document.body;
    const html = document.documentElement;
    
    // Rimuovi classi tema precedenti
    this.removeThemeClasses();
    
    // Applica il nuovo tema
    switch (theme) {
      case 'dark':
        body.classList.add(`${this.themeClassName}-dark`);
        break;
      case 'auto':
        this.applyAutoTheme();
        break;
      case 'high_contrast':
        body.classList.add(`${this.themeClassName}-high-contrast`);
        break;
      default:
        body.classList.add(`${this.themeClassName}-light`);
    }
    
    // Applica opzioni di accessibilità
    this.applyAccessibilityOptions(accessibility);
    
    // Salva le preferenze
    this.saveThemePreference(theme, accessibility);
    
    // Emetti evento per componenti che devono reagire al cambio tema
    this.emitThemeChange(theme, accessibility);
  }

  /**
   * Applica tema automatico basato sulle preferenze di sistema
   */
  applyAutoTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const body = document.body;
    
    if (prefersDark) {
      body.classList.add(`${this.themeClassName}-dark`);
      body.classList.add(`${this.themeClassName}-auto`);
    } else {
      body.classList.add(`${this.themeClassName}-light`);
      body.classList.add(`${this.themeClassName}-auto`);
    }
  }

  /**
   * Applica opzioni di accessibilità
   * @param {Object} accessibility - Opzioni di accessibilità
   */
  applyAccessibilityOptions(accessibility = {}) {
    const body = document.body;
    
    // Alto contrasto
    if (accessibility.high_contrast) {
      body.classList.add(`${this.themeClassName}-high-contrast`);
    } else {
      body.classList.remove(`${this.themeClassName}-high-contrast`);
    }
    
    // Testo ingrandito
    if (accessibility.large_text) {
      body.classList.add(`${this.themeClassName}-large-text`);
    } else {
      body.classList.remove(`${this.themeClassName}-large-text`);
    }
    
    // Riduzione animazioni
    if (accessibility.reduce_animations) {
      body.classList.add(`${this.themeClassName}-reduce-motion`);
    } else {
      body.classList.remove(`${this.themeClassName}-reduce-motion`);
    }
    
    // Ottimizzazione screen reader
    if (accessibility.screen_reader) {
      body.classList.add(`${this.themeClassName}-screen-reader`);
      body.setAttribute('aria-live', 'polite');
    } else {
      body.classList.remove(`${this.themeClassName}-screen-reader`);
      body.removeAttribute('aria-live');
    }
  }

  /**
   * Rimuove tutte le classi tema
   */
  removeThemeClasses() {
    const body = document.body;
    const themeClasses = [
      `${this.themeClassName}-light`,
      `${this.themeClassName}-dark`,
      `${this.themeClassName}-auto`,
      `${this.themeClassName}-high-contrast`,
      `${this.themeClassName}-large-text`,
      `${this.themeClassName}-reduce-motion`,
      `${this.themeClassName}-screen-reader`
    ];
    
    body.classList.remove(...themeClasses);
  }

  /**
   * Carica il tema salvato dalle preferenze
   */
  loadSavedTheme() {
    try {
      const savedPrefs = localStorage.getItem('smile_theme_preferences');
      if (savedPrefs) {
        const { theme, accessibility } = JSON.parse(savedPrefs);
        this.applyTheme(theme, accessibility);
      } else {
        // Usa tema automatico di default
        this.applyTheme('auto');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading saved theme:', error);
      }
      this.applyTheme('light');
    }
  }

  /**
   * Salva le preferenze tema
   * @param {string} theme - Tema selezionato
   * @param {Object} accessibility - Opzioni accessibilità
   */
  saveThemePreference(theme, accessibility) {
    try {
      const preferences = {
        theme,
        accessibility,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('smile_theme_preferences', JSON.stringify(preferences));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving theme preferences:', error);
      }
    }
  }

  /**
   * Ascolta i cambiamenti delle preferenze di sistema
   */
  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // Solo se il tema è impostato su 'auto'
      if (document.body.classList.contains(`${this.themeClassName}-auto`)) {
        this.applyAutoTheme();
      }
    });
    
    // Ascolta anche i cambiamenti delle preferenze di riduzione movimento
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        document.body.classList.add(`${this.themeClassName}-reduce-motion`);
      } else {
        document.body.classList.remove(`${this.themeClassName}-reduce-motion`);
      }
    });
  }

  /**
   * Emette evento di cambio tema
   * @param {string} theme - Tema applicato
   * @param {Object} accessibility - Opzioni accessibilità
   */
  emitThemeChange(theme, accessibility) {
    const event = new CustomEvent('themeChange', {
      detail: { theme, accessibility }
    });
    window.dispatchEvent(event);
  }

  /**
   * Ottieni il tema corrente
   * @returns {string} Tema corrente
   */
  getCurrentTheme() {
    const body = document.body;
    
    if (body.classList.contains(`${this.themeClassName}-dark`)) {
      return body.classList.contains(`${this.themeClassName}-auto`) ? 'auto' : 'dark';
    }
    if (body.classList.contains(`${this.themeClassName}-high-contrast`)) {
      return 'high_contrast';
    }
    if (body.classList.contains(`${this.themeClassName}-light`)) {
      return body.classList.contains(`${this.themeClassName}-auto`) ? 'auto' : 'light';
    }
    
    return 'light';
  }

  /**
   * Ottieni le opzioni di accessibilità correnti
   * @returns {Object} Opzioni accessibilità
   */
  getCurrentAccessibility() {
    const body = document.body;
    
    return {
      high_contrast: body.classList.contains(`${this.themeClassName}-high-contrast`),
      large_text: body.classList.contains(`${this.themeClassName}-large-text`),
      reduce_animations: body.classList.contains(`${this.themeClassName}-reduce-motion`),
      screen_reader: body.classList.contains(`${this.themeClassName}-screen-reader`)
    };
  }

  /**
   * Applica le preferenze da un oggetto preferences
   * @param {Object} preferences - Oggetto preferences completo
   */
  applyFromPreferences(preferences) {
    const theme = preferences.theme || 'light';
    const accessibility = {
      high_contrast: preferences.high_contrast || false,
      large_text: preferences.large_text || false,
      reduce_animations: preferences.reduce_animations || false,
      screen_reader: preferences.screen_reader || false
    };
    
    this.applyTheme(theme, accessibility);
  }

  /**
   * Reset alle impostazioni predefinite
   */
  resetToDefaults() {
    this.removeThemeClasses();
    this.applyTheme('light', {
      high_contrast: false,
      large_text: false,
      reduce_animations: false,
      screen_reader: false
    });
  }
}

// Crea un'istanza singleton
const themeService = new ThemeService();

export default themeService;
