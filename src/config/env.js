// Environment configuration for web compatibility
const getEnvVar = (key, defaultValue = null) => {
  if (typeof window !== 'undefined' && window.process?.env) {
    // Web environment
    return window.process.env[key] || defaultValue;
  }
  
  // Native environment - try to access from process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  return defaultValue;
};

// For development, use localhost. For production, this should be set via environment variables
export const API_BASE_URL = 'http://localhost:5000';
export const JWT_SECRET = getEnvVar('JWT_SECRET', 'fallback-secret');
export const JWT_EXPIRES_IN = getEnvVar('JWT_EXPIRES_IN', '7d');
export const RESET_TOKEN_SECRET = getEnvVar('RESET_TOKEN_SECRET', 'reset-secret');
export const RESET_TOKEN_EXPIRES_IN = getEnvVar('RESET_TOKEN_EXPIRES_IN', '1h');
export const INVITE_TOKEN_EXPIRES_IN_HOURS = getEnvVar('INVITE_TOKEN_EXPIRES_IN_HOURS', '24');

// Metro-safe environment mode detection
export const ENV_MODE = getEnvVar('NODE_ENV', 'development');