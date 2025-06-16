/**
 * Password Validation Utilities
 * Validazione sicurezza password per Smile Adventure
 */

/**
 * Regole di validazione password
 */
const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigits: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Valida la forza della password
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return {
      isValid: false,
      errors: ['La password è obbligatoria'],
      strength: 'very-weak'
    };
  }
  
  // Lunghezza minima
  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`La password deve essere di almeno ${PASSWORD_RULES.minLength} caratteri`);
  }
  
  // Lunghezza massima
  if (password.length > PASSWORD_RULES.maxLength) {
    errors.push(`La password non può superare i ${PASSWORD_RULES.maxLength} caratteri`);
  }
  
  // Lettera maiuscola
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('La password deve contenere almeno una lettera maiuscola');
  }
  
  // Lettera minuscola
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('La password deve contenere almeno una lettera minuscola');
  }
  
  // Numero
  if (PASSWORD_RULES.requireDigits && !/\d/.test(password)) {
    errors.push('La password deve contenere almeno un numero');
  }
  
  // Carattere speciale
  if (PASSWORD_RULES.requireSpecialChars) {
    const specialCharRegex = new RegExp(`[${PASSWORD_RULES.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharRegex.test(password)) {
      errors.push('La password deve contenere almeno un carattere speciale (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }
  }
  
  // Pattern comuni da evitare
  const commonPatterns = [
    /password/i,
    /123456/,
    /qwerty/i,
    /admin/i,
    /smile/i
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('La password non può contenere pattern comuni o riferimenti al sito');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: getPasswordStrength(password)
  };
};

/**
 * Calcola la forza della password
 */
export const getPasswordStrength = (password) => {
  if (!password) return 'very-weak';
  
  let score = 0;
  
  // Lunghezza
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Varietà di caratteri
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Complessità aggiuntiva
  if (password.length >= 20) score += 1;
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/.test(password)) score += 1;
  
  // Entropy check - caratteri unici
  const uniqueChars = new Set(password).size;
  if (uniqueChars / password.length > 0.7) score += 1;
  
  // Mapping score a etichette
  if (score <= 2) return 'very-weak';
  if (score <= 4) return 'weak';
  if (score <= 6) return 'medium';
  if (score <= 8) return 'strong';
  return 'very-strong';
};

/**
 * Verifica che le password corrispondano
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return {
      isValid: false,
      errors: ['La conferma password è obbligatoria']
    };
  }
  
  if (password !== confirmPassword) {
    return {
      isValid: false,
      errors: ['Le password non corrispondono']
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
};

/**
 * Genera suggerimenti per migliorare la password
 */
export const getPasswordSuggestions = (password) => {
  const suggestions = [];
  
  if (!password || password.length < PASSWORD_RULES.minLength) {
    suggestions.push(`Usa almeno ${PASSWORD_RULES.minLength} caratteri`);
  }
  
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Aggiungi lettere maiuscole');
  }
  
  if (!/[a-z]/.test(password)) {
    suggestions.push('Aggiungi lettere minuscole');
  }
  
  if (!/\d/.test(password)) {
    suggestions.push('Aggiungi numeri');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    suggestions.push('Aggiungi caratteri speciali');
  }
  
  if (password && password.length >= PASSWORD_RULES.minLength && suggestions.length === 0) {
    suggestions.push('Considera di aumentare la lunghezza per maggiore sicurezza');
  }
  
  return suggestions;
};

/**
 * Verifica se la password è stata compromessa (placeholder per API)
 */
export const checkPasswordBreach = async (password) => {
  // In un'implementazione reale, questo dovrebbe chiamare un'API come HaveIBeenPwned
  // Per ora, restituiamo sempre false per non fallire i test
  return false;
};
