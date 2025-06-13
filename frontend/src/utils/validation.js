// Utility functions for form validation

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Minimum 8 characters
  return password && password.length >= 8;
};

export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  ].filter(Boolean).length;

  return {
    score,
    isValid: score >= 3,
    feedback: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};

export const validateConfirmPassword = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const validateName = (name) => {
  // Allow letters, spaces, hyphens, apostrophes, and dots
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-'.]+$/;
  return name && name.length >= 2 && name.length <= 100 && nameRegex.test(name);
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Should have between 10 and 15 digits
  return digits.length >= 10 && digits.length <= 15;
};

export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Professional-specific validations
export const validateLicenseNumber = (licenseNumber) => {
  if (!licenseNumber) return false;
  return licenseNumber.trim().length >= 3 && licenseNumber.trim().length <= 100;
};

export const validateSpecialization = (specialization) => {
  if (!specialization) return false;
  return specialization.trim().length >= 2 && specialization.trim().length <= 200;
};

// Child-specific validations
export const validateChildName = (name) => {
  return validateName(name);
};

export const validateAge = (age) => {
  const ageNum = parseInt(age, 10);
  return !isNaN(ageNum) && ageNum >= 2 && ageNum <= 18;
};

export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) return false;
  
  const date = new Date(dateOfBirth);
  const now = new Date();
  const minDate = new Date();
  minDate.setFullYear(now.getFullYear() - 18);
  const maxDate = new Date();
  maxDate.setFullYear(now.getFullYear() - 2);
  
  return date >= minDate && date <= maxDate;
};

// Form validation helpers
export const getFieldError = (fieldName, value, rules = {}) => {
  // Check required first
  if (rules.required && !validateRequired(value)) {
    return `${fieldName} è richiesto`;
  }

  // If no value and not required, skip other validations
  if (!value && !rules.required) {
    return null;
  }

  // Apply specific validations
  const validationChecks = [
    { condition: rules.email, validator: validateEmail, message: 'Email non valida' },
    { condition: rules.password, validator: validatePassword, message: 'Password deve essere almeno 8 caratteri' },
    { condition: rules.name, validator: validateName, message: 'Nome non valido' },
    { condition: rules.phone, validator: validatePhone, message: 'Numero di telefono non valido' },
    { condition: rules.age, validator: validateAge, message: 'Età deve essere tra 2 e 18 anni' }
  ];

  for (const check of validationChecks) {
    if (check.condition && value && !check.validator(value)) {
      return check.message;
    }
  }

  // Special cases
  if (rules.confirmPassword && !validateConfirmPassword(rules.confirmPassword, value)) {
    return 'Le password non corrispondono';
  }

  if (rules.customValidator && !rules.customValidator(value)) {
    return 'Valore non valido';
  }

  return null;
};

// Validate entire form
export const validateForm = (data, schema) => {
  const errors = {};
  
  Object.keys(schema).forEach(fieldName => {
    const value = data[fieldName];
    const rules = schema[fieldName];
    const error = getFieldError(fieldName, value, rules);
    
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};
