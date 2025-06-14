import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import notificationService from '../../services/notificationService';
import './Toast.css';

/**
 * Toast Notification Component
 * Componente per visualizzare notifiche toast
 */
const Toast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animazione di entrata
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    return () => clearTimeout(showTimer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Durata animazione uscita
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div 
      className={`toast toast-${notification.type} ${isVisible ? 'toast-visible' : ''} ${isLeaving ? 'toast-leaving' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-content">
        <div className="toast-title">{notification.title}</div>
        <div className="toast-message">{notification.message}</div>
      </div>
      <button 
        className="toast-close"
        onClick={handleClose}
        aria-label="Chiudi notifica"
        type="button"
      >
        ×
      </button>
    </div>
  );
};

Toast.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    duration: PropTypes.number,
    persistent: PropTypes.bool
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

/**
 * Toast Container Component
 * Container per gestire multiple notifiche toast
 */
const ToastContainer = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listener per cambiamenti nelle notifiche
    const unsubscribe = notificationService.addListener((newNotifications) => {
      setNotifications(newNotifications);
    });

    // Carica notifiche esistenti
    setNotifications(notificationService.getAll());

    return unsubscribe;
  }, []);

  const handleClose = (id) => {
    notificationService.remove(id);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" aria-label="Notifiche">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
export { Toast };
