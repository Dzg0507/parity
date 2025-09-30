// DATA VALIDATION SYSTEM
// This is going to make the app BULLETPROOF! ✅

// 1. VALIDATION TYPES
export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  EMAIL: 'email',
  URL: 'url',
  PHONE: 'phone',
  DATE: 'date',
  ARRAY: 'array',
  OBJECT: 'object',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  MIN_VALUE: 'minValue',
  MAX_VALUE: 'maxValue',
  PATTERN: 'pattern',
  CUSTOM: 'custom',
};

// 2. VALIDATION RULES
export const VALIDATION_RULES = {
  // Required validation
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return { valid: false, message: 'This field is required' };
    }
    return { valid: true };
  },

  // String validation
  string: (value) => {
    if (typeof value !== 'string') {
      return { valid: false, message: 'Value must be a string' };
    }
    return { valid: true };
  },

  // Number validation
  number: (value) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return { valid: false, message: 'Value must be a number' };
    }
    return { valid: true };
  },

  // Boolean validation
  boolean: (value) => {
    if (typeof value !== 'boolean') {
      return { valid: false, message: 'Value must be a boolean' };
    }
    return { valid: true };
  },

  // Email validation
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    return { valid: true };
  },

  // URL validation
  url: (value) => {
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, message: 'Please enter a valid URL' };
    }
  },

  // Phone validation
  phone: (value) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(value)) {
      return { valid: false, message: 'Please enter a valid phone number' };
    }
    return { valid: true };
  },

  // Date validation
  date: (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { valid: false, message: 'Please enter a valid date' };
    }
    return { valid: true };
  },

  // Array validation
  array: (value) => {
    if (!Array.isArray(value)) {
      return { valid: false, message: 'Value must be an array' };
    }
    return { valid: true };
  },

  // Object validation
  object: (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { valid: false, message: 'Value must be an object' };
    }
    return { valid: true };
  },

  // Min length validation
  minLength: (value, min) => {
    if (value.length < min) {
      return { valid: false, message: `Minimum length is ${min} characters` };
    }
    return { valid: true };
  },

  // Max length validation
  maxLength: (value, max) => {
    if (value.length > max) {
      return { valid: false, message: `Maximum length is ${max} characters` };
    }
    return { valid: true };
  },

  // Min value validation
  minValue: (value, min) => {
    if (value < min) {
      return { valid: false, message: `Minimum value is ${min}` };
    }
    return { valid: true };
  },

  // Max value validation
  maxValue: (value, max) => {
    if (value > max) {
      return { valid: false, message: `Maximum value is ${max}` };
    }
    return { valid: true };
  },

  // Pattern validation
  pattern: (value, regex) => {
    if (!regex.test(value)) {
      return { valid: false, message: 'Value does not match required pattern' };
    }
    return { valid: true };
  },
};

// 3. VALIDATOR
export class Validator {
  constructor() {
    this.rules = new Map();
    this.customRules = new Map();
    this.messages = new Map();
  }

  // Add rule
  addRule(name, rule, message = null) {
    this.rules.set(name, rule);
    if (message) {
      this.messages.set(name, message);
    }
  }

  // Add custom rule
  addCustomRule(name, rule, message = null) {
    this.customRules.set(name, rule);
    if (message) {
      this.messages.set(name, message);
    }
  }

  // Validate single value
  validateValue(value, rules) {
    const errors = [];
    
    for (const rule of rules) {
      const result = this.applyRule(value, rule);
      if (!result.valid) {
        errors.push({
          rule: rule.type,
          message: result.message,
          value: rule.value,
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Apply rule
  applyRule(value, rule) {
    const { type, value: ruleValue, message } = rule;
    
    // Check custom rules first
    if (this.customRules.has(type)) {
      const customRule = this.customRules.get(type);
      const result = customRule(value, ruleValue);
      return {
        valid: result.valid,
        message: result.message || message || this.messages.get(type) || 'Validation failed',
      };
    }
    
    // Check built-in rules
    if (this.rules.has(type)) {
      const builtInRule = this.rules.get(type);
      const result = builtInRule(value, ruleValue);
      return {
        valid: result.valid,
        message: result.message || message || this.messages.get(type) || 'Validation failed',
      };
    }
    
    return { valid: false, message: `Unknown validation rule: ${type}` };
  }

  // Validate object
  validateObject(obj, schema) {
    const errors = {};
    let isValid = true;
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = obj[field];
      const result = this.validateValue(value, rules);
      
      if (!result.valid) {
        errors[field] = result.errors;
        isValid = false;
      }
    }
    
    return {
      valid: isValid,
      errors,
    };
  }

  // Validate array
  validateArray(arr, rules) {
    const errors = [];
    let isValid = true;
    
    for (let i = 0; i < arr.length; i++) {
      const result = this.validateValue(arr[i], rules);
      if (!result.valid) {
        errors[i] = result.errors;
        isValid = false;
      }
    }
    
    return {
      valid: isValid,
      errors,
    };
  }

  // Create validation schema
  createSchema(fields) {
    const schema = {};
    
    for (const [field, rules] of Object.entries(fields)) {
      schema[field] = this.parseRules(rules);
    }
    
    return schema;
  }

  // Parse rules
  parseRules(rules) {
    if (typeof rules === 'string') {
      return [{ type: rules }];
    }
    
    if (Array.isArray(rules)) {
      return rules.map(rule => {
        if (typeof rule === 'string') {
          return { type: rule };
        }
        return rule;
      });
    }
    
    return [{ type: rules.type, value: rules.value, message: rules.message }];
  }
}

export const validator = new Validator();

// 4. FORM VALIDATOR
export class FormValidator {
  constructor() {
    this.validator = validator;
    this.schemas = new Map();
    this.errors = new Map();
  }

  // Set schema
  setSchema(formName, schema) {
    this.schemas.set(formName, schema);
  }

  // Get schema
  getSchema(formName) {
    return this.schemas.get(formName);
  }

  // Validate form
  validateForm(formName, data) {
    const schema = this.getSchema(formName);
    if (!schema) {
      throw new Error(`Schema not found for form: ${formName}`);
    }
    
    const result = this.validator.validateObject(data, schema);
    this.errors.set(formName, result.errors);
    
    return result;
  }

  // Validate field
  validateField(formName, field, value) {
    const schema = this.getSchema(formName);
    if (!schema || !schema[field]) {
      return { valid: true };
    }
    
    const result = this.validator.validateValue(value, schema[field]);
    
    // Update errors
    const formErrors = this.errors.get(formName) || {};
    if (result.valid) {
      delete formErrors[field];
    } else {
      formErrors[field] = result.errors;
    }
    this.errors.set(formName, formErrors);
    
    return result;
  }

  // Get field errors
  getFieldErrors(formName, field) {
    const formErrors = this.errors.get(formName) || {};
    return formErrors[field] || [];
  }

  // Get form errors
  getFormErrors(formName) {
    return this.errors.get(formName) || {};
  }

  // Clear errors
  clearErrors(formName, field = null) {
    if (field) {
      const formErrors = this.errors.get(formName) || {};
      delete formErrors[field];
      this.errors.set(formName, formErrors);
    } else {
      this.errors.delete(formName);
    }
  }

  // Check if form is valid
  isFormValid(formName) {
    const formErrors = this.errors.get(formName) || {};
    return Object.keys(formErrors).length === 0;
  }

  // Check if field is valid
  isFieldValid(formName, field) {
    const fieldErrors = this.getFieldErrors(formName, field);
    return fieldErrors.length === 0;
  }
}

export const formValidator = new FormValidator();

// 5. API VALIDATOR
export class APIValidator {
  constructor() {
    this.validator = validator;
    this.schemas = new Map();
  }

  // Set request schema
  setRequestSchema(endpoint, method, schema) {
    const key = `${endpoint}_${method}`;
    this.schemas.set(key, schema);
  }

  // Get request schema
  getRequestSchema(endpoint, method) {
    const key = `${endpoint}_${method}`;
    return this.schemas.get(key);
  }

  // Validate request
  validateRequest(endpoint, method, data) {
    const schema = this.getRequestSchema(endpoint, method);
    if (!schema) {
      return { valid: true };
    }
    
    return this.validator.validateObject(data, schema);
  }

  // Validate response
  validateResponse(endpoint, method, data) {
    const schema = this.getResponseSchema(endpoint, method);
    if (!schema) {
      return { valid: true };
    }
    
    return this.validator.validateObject(data, schema);
  }

  // Set response schema
  setResponseSchema(endpoint, method, schema) {
    const key = `${endpoint}_${method}_response`;
    this.schemas.set(key, schema);
  }

  // Get response schema
  getResponseSchema(endpoint, method) {
    const key = `${endpoint}_${method}_response`;
    return this.schemas.get(key);
  }
}

export const apiValidator = new APIValidator();

// 6. VALIDATION HELPERS
export class ValidationHelpers {
  // Sanitize string
  static sanitizeString(value) {
    if (typeof value !== 'string') return value;
    
    return value
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  // Sanitize HTML
  static sanitizeHTML(value) {
    if (typeof value !== 'string') return value;
    
    // In a real implementation, you would use a proper HTML sanitization library
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/javascript:/gi, ''); // Remove javascript: protocol
  }

  // Normalize email
  static normalizeEmail(value) {
    if (typeof value !== 'string') return value;
    
    return value.toLowerCase().trim();
  }

  // Normalize phone
  static normalizePhone(value) {
    if (typeof value !== 'string') return value;
    
    return value.replace(/\D/g, ''); // Remove non-digits
  }

  // Normalize date
  static normalizeDate(value) {
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toISOString();
    }
    
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    return value;
  }

  // Validate password strength
  static validatePasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    
    return {
      score,
      strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
      checks,
    };
  }

  // Validate credit card
  static validateCreditCard(number) {
    // Remove spaces and dashes
    const cleaned = number.replace(/[\s-]/g, '');
    
    // Check if it's all digits
    if (!/^\d+$/.test(cleaned)) {
      return { valid: false, message: 'Credit card number must contain only digits' };
    }
    
    // Check length
    if (cleaned.length < 13 || cleaned.length > 19) {
      return { valid: false, message: 'Credit card number must be between 13 and 19 digits' };
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
      return { valid: false, message: 'Invalid credit card number' };
    }
    
    return { valid: true };
  }

  // Validate IBAN
  static validateIBAN(iban) {
    // Remove spaces and convert to uppercase
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    
    // Check format
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleaned)) {
      return { valid: false, message: 'Invalid IBAN format' };
    }
    
    // Check length
    if (cleaned.length < 15 || cleaned.length > 34) {
      return { valid: false, message: 'IBAN must be between 15 and 34 characters' };
    }
    
    // Move first 4 characters to end
    const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
    
    // Convert letters to numbers
    const numeric = rearranged.replace(/[A-Z]/g, (char) => {
      return (char.charCodeAt(0) - 55).toString();
    });
    
    // Calculate mod 97
    let remainder = 0;
    for (let i = 0; i < numeric.length; i++) {
      remainder = (remainder * 10 + parseInt(numeric[i])) % 97;
    }
    
    if (remainder !== 1) {
      return { valid: false, message: 'Invalid IBAN' };
    }
    
    return { valid: true };
  }
}

// 7. VALIDATION MIDDLEWARE
export class ValidationMiddleware {
  constructor() {
    this.validator = validator;
    this.apiValidator = apiValidator;
  }

  // Express middleware
  expressMiddleware(schema) {
    return (req, res, next) => {
      const result = this.validator.validateObject(req.body, schema);
      
      if (!result.valid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: result.errors,
        });
      }
      
      next();
    };
  }

  // React Native middleware
  reactNativeMiddleware(schema) {
    return (data) => {
      return this.validator.validateObject(data, schema);
    };
  }
}

export const validationMiddleware = new ValidationMiddleware();

// 8. VALIDATION UTILITIES
export class ValidationUtils {
  // Create validation rule
  static createRule(type, value = null, message = null) {
    return { type, value, message };
  }

  // Create validation schema
  static createSchema(fields) {
    const schema = {};
    
    for (const [field, rules] of Object.entries(fields)) {
      schema[field] = Array.isArray(rules) ? rules : [rules];
    }
    
    return schema;
  }

  // Merge validation schemas
  static mergeSchemas(...schemas) {
    const merged = {};
    
    for (const schema of schemas) {
      for (const [field, rules] of Object.entries(schema)) {
        if (merged[field]) {
          merged[field] = [...merged[field], ...rules];
        } else {
          merged[field] = rules;
        }
      }
    }
    
    return merged;
  }

  // Get validation message
  static getValidationMessage(rule, value) {
    const messages = {
      required: 'This field is required',
      string: 'Value must be a string',
      number: 'Value must be a number',
      boolean: 'Value must be a boolean',
      email: 'Please enter a valid email address',
      url: 'Please enter a valid URL',
      phone: 'Please enter a valid phone number',
      date: 'Please enter a valid date',
      array: 'Value must be an array',
      object: 'Value must be an object',
      minLength: `Minimum length is ${value} characters`,
      maxLength: `Maximum length is ${value} characters`,
      minValue: `Minimum value is ${value}`,
      maxValue: `Maximum value is ${value}`,
      pattern: 'Value does not match required pattern',
    };
    
    return messages[rule] || 'Validation failed';
  }
}

export default {
  validator,
  formValidator,
  apiValidator,
  validationMiddleware,
  ValidationHelpers,
  ValidationUtils,
  VALIDATION_TYPES,
  VALIDATION_RULES,
};
