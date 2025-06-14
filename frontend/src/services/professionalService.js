/**
 * Professional Service - Gestione profili e ricerca professionisti
 * Servizio per gestire profili professionali, ricerca e funzionalità cliniche
 */

import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';
import notificationService from './notificationService';

/**
 * @typedef {Object} ProfessionalProfile
 * @property {number} id
 * @property {string} email
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} phone
 * @property {string} license_number
 * @property {string} specialization
 * @property {string} clinic_name
 * @property {string} clinic_address
 * @property {boolean} accepting_patients
 * @property {string} bio
 * @property {string} website
 * @property {Array<string>} certifications
 * @property {Object} availability
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ProfessionalSearchFilters
 * @property {string} specialty - Filtro per specializzazione
 * @property {string} location - Filtro geografico
 * @property {boolean} accepting_patients - Solo professionisti che accettano pazienti
 * @property {number} limit - Numero massimo risultati
 * @property {number} offset - Offset per paginazione
 */

export const professionalService = {
  /**
   * Get professional profile
   * @returns {Promise<ProfessionalProfile>}
   */
  async getProfessionalProfile() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PROFESSIONAL_PROFILE);
      return response.data;
    } catch (error) {
      console.error('Error fetching professional profile:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        notificationService.showError('Profilo professionale non trovato');
      } else {
        notificationService.showError('Errore nel caricamento del profilo professionale');
      }
      throw error;
    }
  },

  /**
   * Create professional profile
   * @param {Object} profileData - Professional profile data
   * @returns {Promise<ProfessionalProfile>}
   */
  async createProfessionalProfile(profileData) {
    try {
      const backendData = this.transformToBackendFormat(profileData);
      const response = await axiosInstance.post(API_ENDPOINTS.PROFESSIONAL_PROFILE, backendData);
      
      notificationService.showSuccess('Profilo professionale creato con successo');
      return response.data;
    } catch (error) {
      console.error('Error creating professional profile:', error.response?.data || error.message);
      
      if (error.response?.status === 422 && error.response.data?.detail) {
        const validationErrors = error.response.data.detail;
        if (Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map(err => {
            const field = err.loc ? err.loc.join('.') : 'field';
            return `${field}: ${err.msg}`;
          }).join(', ');
          notificationService.showError(`Errori di validazione: ${errorMessages}`);
        }
      } else if (error.response?.status === 409) {
        notificationService.showError('Profilo professionale già esistente');
      } else {
        notificationService.showError('Errore nella creazione del profilo professionale');
      }
      
      throw error;
    }
  },

  /**
   * Update professional profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<ProfessionalProfile>}
   */
  async updateProfessionalProfile(profileData) {
    try {
      const backendData = this.transformToBackendFormat(profileData);
      const response = await axiosInstance.put(API_ENDPOINTS.PROFESSIONAL_PROFILE, backendData);
      
      notificationService.showSuccess('Profilo professionale aggiornato con successo');
      return response.data;
    } catch (error) {
      console.error('Error updating professional profile:', error.response?.data || error.message);
      
      if (error.response?.status === 422 && error.response.data?.detail) {
        const validationErrors = error.response.data.detail;
        if (Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map(err => {
            const field = err.loc ? err.loc.join('.') : 'field';
            return `${field}: ${err.msg}`;
          }).join(', ');
          notificationService.showError(`Errori di validazione: ${errorMessages}`);
        }
      } else if (error.response?.status === 404) {
        notificationService.showError('Profilo professionale non trovato');
      } else {
        notificationService.showError('Errore nell\'aggiornamento del profilo professionale');
      }
      
      throw error;
    }
  },

  /**
   * Search professionals
   * @param {ProfessionalSearchFilters} filters - Search filters
   * @returns {Promise<Array<ProfessionalProfile>>}
   */
  async searchProfessionals(filters = {}) {
    try {
      const params = {
        specialty: filters.specialty || undefined,
        location: filters.location || undefined,
        accepting_patients: filters.accepting_patients || undefined,
        limit: filters.limit || 50,
        offset: filters.offset || 0
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axiosInstance.get(API_ENDPOINTS.PROFESSIONAL_SEARCH, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching professionals:', error.response?.data || error.message);
      notificationService.showError('Errore nella ricerca dei professionisti');
      throw error;
    }
  },

  /**
   * Get professional specializations list
   * @returns {Array<string>}
   */
  getSpecializations() {
    return [
      'Pediatria',
      'Ortodonzia',
      'Endodonzia',
      'Parodontologia',
      'Chirurgia Orale',
      'Protesi Dentaria',
      'Igiene Dentale',
      'Odontoiatria Estetica',
      'Implantologia',
      'Gnatologia',
      'Patologia Orale',
      'Radiologia Orale',
      'Anestesiologia',
      'Medicina Orale',
      'Odontoiatria Preventiva'
    ];
  },

  /**
   * Transform frontend data to backend format
   * @param {Object} frontendData - Frontend profile data
   * @returns {Object} Backend formatted data
   */
  transformToBackendFormat(frontendData) {
    return {
      license_number: frontendData.licenseNumber || frontendData.license_number,
      specialization: frontendData.specialization,
      clinic_name: frontendData.clinicName || frontendData.clinic_name,
      clinic_address: frontendData.clinicAddress || frontendData.clinic_address,
      accepting_patients: frontendData.acceptingPatients || frontendData.accepting_patients || false,
      bio: frontendData.bio,
      website: frontendData.website,
      certifications: frontendData.certifications || [],
      availability: frontendData.availability || {},
      phone: frontendData.phone,
      first_name: frontendData.firstName || frontendData.first_name,
      last_name: frontendData.lastName || frontendData.last_name
    };
  },

  /**
   * Transform backend data to frontend format
   * @param {Object} backendData - Backend profile data
   * @returns {Object} Frontend formatted data
   */
  transformToFrontendFormat(backendData) {
    return {
      id: backendData.id,
      email: backendData.email,
      firstName: backendData.first_name,
      lastName: backendData.last_name,
      fullName: backendData.full_name || `${backendData.first_name} ${backendData.last_name}`,
      phone: backendData.phone,
      licenseNumber: backendData.license_number,
      specialization: backendData.specialization,
      clinicName: backendData.clinic_name,
      clinicAddress: backendData.clinic_address,
      acceptingPatients: backendData.accepting_patients,
      bio: backendData.bio,
      website: backendData.website,
      certifications: backendData.certifications || [],
      availability: backendData.availability || {},
      createdAt: backendData.created_at,
      updatedAt: backendData.updated_at
    };
  },

  /**
   * Validate professional profile data
   * @param {Object} profileData - Profile data to validate
   * @returns {Object} Validation result
   */
  validateProfileData(profileData) {
    const errors = [];

    if (!profileData.licenseNumber || profileData.licenseNumber.trim().length < 3) {
      errors.push('Numero licenza deve avere almeno 3 caratteri');
    }

    if (!profileData.specialization || profileData.specialization.trim().length < 2) {
      errors.push('Specializzazione è obbligatoria');
    }

    if (profileData.website && !this.isValidUrl(profileData.website)) {
      errors.push('URL del sito web non valido');
    }

    if (profileData.bio && profileData.bio.length > 1000) {
      errors.push('La biografia non può superare i 1000 caratteri');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Check if URL is valid
   * @param {string} url - URL to validate
   * @returns {boolean}
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get availability time slots
   * @returns {Array<Object>}
   */
  getAvailabilitySlots() {
    return [
      { value: 'morning', label: 'Mattina (8:00-12:00)' },
      { value: 'afternoon', label: 'Pomeriggio (14:00-18:00)' },
      { value: 'evening', label: 'Sera (18:00-21:00)' },
      { value: 'weekend', label: 'Weekend' },
      { value: 'emergency', label: 'Emergenze' }
    ];
  },

  /**
   * Get days of week
   * @returns {Array<Object>}
   */
  getDaysOfWeek() {
    return [
      { value: 'monday', label: 'Lunedì' },
      { value: 'tuesday', label: 'Martedì' },
      { value: 'wednesday', label: 'Mercoledì' },
      { value: 'thursday', label: 'Giovedì' },
      { value: 'friday', label: 'Venerdì' },
      { value: 'saturday', label: 'Sabato' },
      { value: 'sunday', label: 'Domenica' }
    ];
  }
};

export default professionalService;
