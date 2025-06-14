import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './PhotoUpload.css';

/**
 * PhotoUpload Component
 * Componente per l'upload di foto/avatar bambino con preview e validazione
 */
const PhotoUpload = ({ 
  currentPhoto, 
  onPhotoChange, 
  childName = 'bambino',
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [preview, setPreview] = useState(currentPhoto);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      throw new Error(`Tipo file non supportato. Usa: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`);
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw new Error(`File troppo grande. Dimensione massima: ${maxSizeMB}MB`);
    }

    return true;
  };

  const processFile = async (file) => {
    try {
      setError(null);
      setIsUploading(true);

      validateFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Call parent callback with file
      if (onPhotoChange) {
        await onPhotoChange(file);
      }

    } catch (err) {
      setError(err.message);
      setPreview(currentPhoto); // Reset to current photo on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onPhotoChange) {
      onPhotoChange(null);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="photo-upload-container">
      <div className="photo-upload-label">
        📷 Foto di {childName}
      </div>      <button
        type="button"
        className={`photo-upload-area ${dragActive ? 'drag-active' : ''} ${error ? 'error' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClickUpload}
        aria-label={`Carica foto di ${childName}`}
      >
        {preview ? (
          <div className="photo-preview-container">
            <img 
              src={preview} 
              alt={`Foto di ${childName}`}
              className="photo-preview"
            />
            <div className="photo-overlay">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto();
                }}
                className="photo-remove-btn"
                title="Rimuovi foto"
              >
                🗑️
              </button>
              <button
                type="button"
                onClick={handleClickUpload}
                className="photo-change-btn"
                title="Cambia foto"
              >
                📷
              </button>
            </div>
          </div>
        ) : (
          <div className="photo-upload-placeholder">
            {isUploading ? (
              <div className="upload-spinner">
                <div className="spinner"></div>
                <span>Caricamento...</span>
              </div>
            ) : (
              <>
                <div className="upload-icon">📷</div>
                <div className="upload-text">
                  <div className="upload-primary">Clicca o trascina qui</div>
                  <div className="upload-secondary">
                    per aggiungere una foto di {childName}
                  </div>
                </div>
                <div className="upload-formats">
                  Formati supportati: JPG, PNG, GIF, WebP (max {Math.round(maxSize / (1024 * 1024))}MB)
                </div>
              </>
            )}          </div>
        )}
      </button>

      {error && (
        <div className="photo-upload-error">
          ⚠️ {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="photo-upload-input"
        style={{ display: 'none' }}
      />

      <div className="photo-upload-tips">
        💡 <strong>Suggerimenti:</strong>
        <ul>
          <li>Usa una foto chiara e ben illuminata</li>
          <li>Il volto dovrebbe essere ben visibile</li>
          <li>Evita sfondi troppo distraenti</li>
          <li>La foto aiuta i professionisti a personalizzare l&apos;esperienza</li>
        </ul>
      </div>
    </div>
  );
};

PhotoUpload.propTypes = {
  currentPhoto: PropTypes.string,
  onPhotoChange: PropTypes.func.isRequired,
  childName: PropTypes.string,
  maxSize: PropTypes.number,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string)
};

export default PhotoUpload;
