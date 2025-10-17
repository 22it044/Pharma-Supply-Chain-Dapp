/**
 * Input Validation Utilities
 * Provides validation functions for all user inputs
 */

/**
 * Validate Medicine ID
 */
export const validateMedicineId = (id) => {
  // Convert to number
  const numId = parseInt(id);
  
  // Check if valid number
  if (isNaN(numId)) {
    throw new Error('Medicine ID must be a valid number');
  }
  
  // Check if positive
  if (numId < 1) {
    throw new Error('Medicine ID must be greater than 0');
  }
  
  // Check if within safe integer range
  if (numId > Number.MAX_SAFE_INTEGER) {
    throw new Error('Medicine ID is too large');
  }
  
  return numId;
};

/**
 * Validate Ethereum Address
 */
export const validateAddress = (address) => {
  if (!address) {
    throw new Error('Address is required');
  }
  
  // Check format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error('Invalid Ethereum address format');
  }
  
  return address.toLowerCase();
};

/**
 * Validate String Input
 */
export const validateString = (str, fieldName = 'Input', minLength = 1, maxLength = 100) => {
  if (typeof str !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  
  const trimmed = str.trim();
  
  if (trimmed.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''}`);
  }
  
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must be no more than ${maxLength} characters`);
  }
  
  // Check for potentially malicious content
  if (/<script|javascript:|onerror=/i.test(trimmed)) {
    throw new Error(`${fieldName} contains invalid characters`);
  }
  
  return trimmed;
};

/**
 * Validate Medicine Name
 */
export const validateMedicineName = (name) => {
  return validateString(name, 'Medicine name', 2, 100);
};

/**
 * Validate Medicine Description
 */
export const validateMedicineDescription = (description) => {
  return validateString(description, 'Description', 5, 500);
};

/**
 * Validate Participant Name (RMS, Manufacturer, etc.)
 */
export const validateParticipantName = (name) => {
  return validateString(name, 'Participant name', 2, 100);
};

/**
 * Validate Place/Location
 */
export const validatePlace = (place) => {
  return validateString(place, 'Place', 2, 100);
};

/**
 * Sanitize HTML to prevent XSS
 * Note: For production, use DOMPurify library
 */
export const sanitizeHTML = (html) => {
  if (!html) return '';
  
  // Basic sanitization - replace dangerous characters
  const map = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return html.replace(/[<>"'/]/g, (char) => map[char]);
};

/**
 * Validate and sanitize form data
 */
export const validateFormData = (data, schema) => {
  const errors = {};
  const sanitized = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    try {
      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field] = `${rules.label || field} is required`;
        continue;
      }
      
      if (value) {
        if (rules.type === 'string') {
          sanitized[field] = validateString(value, rules.label, rules.minLength, rules.maxLength);
        } else if (rules.type === 'number') {
          sanitized[field] = validateMedicineId(value);
        } else if (rules.type === 'address') {
          sanitized[field] = validateAddress(value);
        } else {
          sanitized[field] = value;
        }
      }
    } catch (error) {
      errors[field] = error.message;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitized
  };
};

/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Validate QR code scanned data
 */
export const validateQRData = (qrData) => {
  // QR code should contain only the medicine ID
  const medicineId = validateMedicineId(qrData);
  
  // Additional check: ensure it's reasonable
  if (medicineId > 1000000) {
    throw new Error('Invalid QR code: Medicine ID seems unrealistic');
  }
  
  return medicineId;
};

const validators = {
  validateMedicineId,
  validateAddress,
  validateString,
  validateMedicineName,
  validateMedicineDescription,
  validateParticipantName,
  validatePlace,
  sanitizeHTML,
  validateFormData,
  isEmpty,
  validateQRData
};

export default validators;
