/**
 * Modal Component
 * Componente modale riutilizzabile per la UI
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button } from './';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  overlayClosable = true 
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);  const handleOverlayClick = (event) => {
    if (overlayClosable && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="modal-overlay" 
        onClick={handleOverlayClick}
      >
        <dialog 
          className={`modal-container modal-${size}`}
          ref={modalRef}
          open={isOpen}
          aria-labelledby={title ? "modal-title" : undefined}
        >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h2 id="modal-title" className="modal-title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="small"
                onClick={onClose}
                className="modal-close-button"
                aria-label="Chiudi modale"
              >
                ✖️
              </Button>
            )}
          </div>
        )}        {/* Modal Content */}
        <div className="modal-content">
          {children}
        </div>      </dialog>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showCloseButton: PropTypes.bool,
  overlayClosable: PropTypes.bool
};

export default Modal;
