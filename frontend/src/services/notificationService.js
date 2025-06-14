/**
 * Notification Service
 * Servizio per gestire notifiche toast nell'applicazione
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} type - 'success' | 'error' | 'warning' | 'info'
 * @property {string} title
 * @property {string} message
 * @property {number} duration - Durata in millisecondi
 * @property {boolean} persistent - Se true, non si chiude automaticamente
 */

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.nextId = 1;
  }

  /**
   * Aggiunge una notifica
   * @param {Omit<Notification, 'id'>} notification
   * @returns {string} ID della notifica
   */
  add({ type, title, message, duration = 5000, persistent = false }) {
    const id = `notification-${this.nextId++}`;
    const notification = {
      id,
      type,
      title,
      message,
      duration,
      persistent,
      timestamp: Date.now()
    };

    this.notifications.push(notification);
    this.notifyListeners();

    // Auto-remove se non persistente
    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  /**
   * Rimuove una notifica
   * @param {string} id
   */
  remove(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  /**
   * Rimuove tutte le notifiche
   */
  clear() {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Ottiene tutte le notifiche
   * @returns {Notification[]}
   */
  getAll() {
    return [...this.notifications];
  }

  /**
   * Aggiunge un listener per cambiamenti
   * @param {Function} listener
   * @returns {Function} Funzione per rimuovere il listener
   */
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifica tutti i listeners
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Metodi di convenienza
  success(title, message, options = {}) {
    return this.add({ type: 'success', title, message, ...options });
  }

  error(title, message, options = {}) {
    return this.add({ 
      type: 'error', 
      title, 
      message, 
      duration: 8000, // Errori durano di più
      ...options 
    });
  }

  warning(title, message, options = {}) {
    return this.add({ type: 'warning', title, message, ...options });
  }

  info(title, message, options = {}) {
    return this.add({ type: 'info', title, message, ...options });
  }

  // Notifiche specializzate per l'app
  childCreated(childName) {
    return this.success(
      'Bambino creato',
      `Il profilo di ${childName} è stato creato con successo.`
    );
  }

  childUpdated(childName) {
    return this.success(
      'Profilo aggiornato',
      `Il profilo di ${childName} è stato aggiornato.`
    );
  }

  childDeleted(childName) {
    return this.success(
      'Profilo eliminato',
      `Il profilo di ${childName} è stato eliminato.`
    );
  }

  sessionStarted(childName, scenarioName) {
    return this.info(
      'Sessione iniziata',
      `Sessione di gioco "${scenarioName}" avviata per ${childName}.`
    );
  }

  sessionCompleted(childName, score) {
    return this.success(
      'Sessione completata',
      `${childName} ha completato la sessione con un punteggio di ${score} punti!`
    );
  }

  authSuccess(userName) {
    return this.success(
      'Accesso effettuato',
      `Benvenuto, ${userName}!`
    );
  }

  authError() {
    return this.error(
      'Errore di accesso',
      'Credenziali non valide. Riprova.'
    );
  }

  networkError() {
    return this.error(
      'Errore di connessione',
      'Verifica la connessione internet e riprova.',
      { persistent: true }
    );
  }

  uploadSuccess(fileName) {
    return this.success(
      'Upload completato',
      `Il file "${fileName}" è stato caricato con successo.`
    );
  }

  uploadError(fileName) {
    return this.error(
      'Errore upload',
      `Errore nel caricamento del file "${fileName}".`
    );
  }
}

// Istanza singleton
const notificationService = new NotificationService();

export default notificationService;
