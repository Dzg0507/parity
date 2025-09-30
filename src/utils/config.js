// CONFIGURATION MANAGEMENT SYSTEM
// This is going to make the app HIGHLY CONFIGURABLE! ⚙️

import { storage } from './storage';

// 1. CONFIG TYPES
export const CONFIG_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array',
  FUNCTION: 'function',
};

// 2. CONFIG MANAGER
export class ConfigManager {
  constructor() {
    this.configs = new Map();
    this.schemas = new Map();
    this.validators = new Map();
    this.watchers = new Map();
    this.defaults = new Map();
  }

  // Set configuration
  async setConfig(key, value, options = {}) {
    const config = {
      key,
      value,
      type: options.type || this.inferType(value),
      description: options.description || '',
      required: options.required || false,
      sensitive: options.sensitive || false,
      readonly: options.readonly || false,
      environment: options.environment || 'all',
      version: options.version || '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Validate configuration
    if (!this.validateConfig(config)) {
      throw new Error(`Invalid configuration for key: ${key}`);
    }

    this.configs.set(key, config);
    await this.storeConfig(config);
    
    // Notify watchers
    this.notifyWatchers(key, value);
    
    return config;
  }

  // Get configuration
  getConfig(key, defaultValue = null) {
    const config = this.configs.get(key);
    if (!config) {
      return defaultValue;
    }

    return config.value;
  }

  // Get all configurations
  getAllConfigs() {
    return Array.from(this.configs.values());
  }

  // Get configurations by environment
  getConfigsByEnvironment(environment) {
    return Array.from(this.configs.values()).filter(config => 
      config.environment === environment || config.environment === 'all'
    );
  }

  // Update configuration
  async updateConfig(key, updates) {
    const config = this.configs.get(key);
    if (!config) {
      throw new Error(`Configuration ${key} not found`);
    }

    if (config.readonly) {
      throw new Error(`Configuration ${key} is readonly`);
    }

    const updatedConfig = {
      ...config,
      ...updates,
      updatedAt: Date.now(),
    };

    // Validate updated configuration
    if (!this.validateConfig(updatedConfig)) {
      throw new Error(`Invalid configuration for key: ${key}`);
    }

    this.configs.set(key, updatedConfig);
    await this.storeConfig(updatedConfig);
    
    // Notify watchers
    this.notifyWatchers(key, updatedConfig.value);
    
    return updatedConfig;
  }

  // Delete configuration
  async deleteConfig(key) {
    this.configs.delete(key);
    await storage.removeItem(`config_${key}`);
  }

  // Set schema
  setSchema(key, schema) {
    this.schemas.set(key, schema);
  }

  // Get schema
  getSchema(key) {
    return this.schemas.get(key);
  }

  // Set validator
  setValidator(key, validator) {
    this.validators.set(key, validator);
  }

  // Get validator
  getValidator(key) {
    return this.validators.get(key);
  }

  // Validate configuration
  validateConfig(config) {
    const schema = this.schemas.get(config.key);
    if (schema) {
      return this.validateWithSchema(config, schema);
    }

    const validator = this.validators.get(config.key);
    if (validator) {
      return validator(config.value);
    }

    return this.validateByType(config);
  }

  // Validate with schema
  validateWithSchema(config, schema) {
    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && !config[field]) {
        return false;
      }

      if (config[field] && rules.type && typeof config[field] !== rules.type) {
        return false;
      }

      if (config[field] && rules.min && config[field] < rules.min) {
        return false;
      }

      if (config[field] && rules.max && config[field] > rules.max) {
        return false;
      }

      if (config[field] && rules.pattern && !rules.pattern.test(config[field])) {
        return false;
      }

      if (config[field] && rules.enum && !rules.enum.includes(config[field])) {
        return false;
      }
    }

    return true;
  }

  // Validate by type
  validateByType(config) {
    switch (config.type) {
      case CONFIG_TYPES.STRING:
        return typeof config.value === 'string';
      case CONFIG_TYPES.NUMBER:
        return typeof config.value === 'number' && !isNaN(config.value);
      case CONFIG_TYPES.BOOLEAN:
        return typeof config.value === 'boolean';
      case CONFIG_TYPES.OBJECT:
        return typeof config.value === 'object' && config.value !== null && !Array.isArray(config.value);
      case CONFIG_TYPES.ARRAY:
        return Array.isArray(config.value);
      case CONFIG_TYPES.FUNCTION:
        return typeof config.value === 'function';
      default:
        return true;
    }
  }

  // Infer type
  inferType(value) {
    if (typeof value === 'string') return CONFIG_TYPES.STRING;
    if (typeof value === 'number') return CONFIG_TYPES.NUMBER;
    if (typeof value === 'boolean') return CONFIG_TYPES.BOOLEAN;
    if (Array.isArray(value)) return CONFIG_TYPES.ARRAY;
    if (typeof value === 'function') return CONFIG_TYPES.FUNCTION;
    if (typeof value === 'object' && value !== null) return CONFIG_TYPES.OBJECT;
    return CONFIG_TYPES.STRING;
  }

  // Store configuration
  async storeConfig(config) {
    const key = `config_${config.key}`;
    const value = config.sensitive ? this.maskSensitiveValue(config.value) : config.value;
    await storage.setItem(key, JSON.stringify({ ...config, value }));
  }

  // Mask sensitive value
  maskSensitiveValue(value) {
    if (typeof value === 'string') {
      return '*'.repeat(Math.min(value.length, 8));
    }
    return '[SENSITIVE]';
  }

  // Watch configuration changes
  watchConfig(key, callback) {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, []);
    }
    this.watchers.get(key).push(callback);
  }

  // Unwatch configuration
  unwatchConfig(key, callback) {
    const watchers = this.watchers.get(key);
    if (watchers) {
      const index = watchers.indexOf(callback);
      if (index > -1) {
        watchers.splice(index, 1);
      }
    }
  }

  // Notify watchers
  notifyWatchers(key, value) {
    const watchers = this.watchers.get(key);
    if (watchers) {
      watchers.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error('Config watcher error:', error);
        }
      });
    }
  }

  // Load configurations
  async loadConfigurations() {
    const keys = await storage.getAllKeys();
    const configKeys = keys.filter(key => key.startsWith('config_'));
    
    for (const key of configKeys) {
      const stored = await storage.getItem(key);
      if (stored) {
        const config = JSON.parse(stored);
        this.configs.set(config.key, config);
      }
    }
  }

  // Export configurations
  exportConfigurations(includeSensitive = false) {
    const configs = Array.from(this.configs.values());
    const exported = configs.map(config => ({
      key: config.key,
      value: config.sensitive && !includeSensitive ? '[SENSITIVE]' : config.value,
      type: config.type,
      description: config.description,
      environment: config.environment,
      version: config.version,
    }));
    
    return exported;
  }

  // Import configurations
  async importConfigurations(configs, options = {}) {
    const { overwrite = false, validate = true } = options;
    
    for (const config of configs) {
      const existing = this.configs.get(config.key);
      
      if (existing && !overwrite) {
        continue;
      }
      
      if (validate && !this.validateConfig(config)) {
        throw new Error(`Invalid configuration for key: ${config.key}`);
      }
      
      await this.setConfig(config.key, config.value, {
        type: config.type,
        description: config.description,
        environment: config.environment,
        version: config.version,
      });
    }
  }
}

export const configManager = new ConfigManager();

// 3. ENVIRONMENT CONFIG
export class EnvironmentConfig {
  constructor() {
    this.configManager = configManager;
    this.environment = this.detectEnvironment();
  }

  // Detect environment
  detectEnvironment() {
    if (typeof window === 'undefined') {
      return process.env.NODE_ENV || 'development';
    }
    
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('staging')) {
      return 'staging';
    } else if (hostname.includes('test')) {
      return 'testing';
    } else {
      return 'production';
    }
  }

  // Get environment
  getEnvironment() {
    return this.environment;
  }

  // Set environment
  setEnvironment(environment) {
    this.environment = environment;
  }

  // Get environment-specific config
  getEnvironmentConfig(key) {
    const config = this.configManager.getConfig(key);
    if (!config) return null;
    
    // Check if config is environment-specific
    if (config.environment && config.environment !== 'all' && config.environment !== this.environment) {
      return null;
    }
    
    return config;
  }

  // Load environment configurations
  async loadEnvironmentConfigurations() {
    const environmentConfigs = {
      development: {
        debug: true,
        logLevel: 'debug',
        apiUrl: 'http://localhost:3000/api',
        enableAnalytics: false,
        enableErrorReporting: false,
      },
      staging: {
        debug: true,
        logLevel: 'info',
        apiUrl: 'https://staging-api.example.com/api',
        enableAnalytics: true,
        enableErrorReporting: true,
      },
      testing: {
        debug: false,
        logLevel: 'error',
        apiUrl: 'https://test-api.example.com/api',
        enableAnalytics: false,
        enableErrorReporting: false,
      },
      production: {
        debug: false,
        logLevel: 'error',
        apiUrl: 'https://api.example.com/api',
        enableAnalytics: true,
        enableErrorReporting: true,
      },
    };
    
    const configs = environmentConfigs[this.environment] || environmentConfigs.development;
    
    for (const [key, value] of Object.entries(configs)) {
      await this.configManager.setConfig(key, value, {
        type: this.configManager.inferType(value),
        environment: this.environment,
      });
    }
  }
}

export const environmentConfig = new EnvironmentConfig();

// 4. FEATURE CONFIG
export class FeatureConfig {
  constructor() {
    this.configManager = configManager;
    this.features = new Map();
  }

  // Enable feature
  async enableFeature(featureName, options = {}) {
    await this.configManager.setConfig(`feature_${featureName}`, true, {
      type: CONFIG_TYPES.BOOLEAN,
      description: `Feature flag for ${featureName}`,
      environment: options.environment || 'all',
    });
    
    this.features.set(featureName, {
      enabled: true,
      options,
      enabledAt: Date.now(),
    });
  }

  // Disable feature
  async disableFeature(featureName) {
    await this.configManager.setConfig(`feature_${featureName}`, false, {
      type: CONFIG_TYPES.BOOLEAN,
      description: `Feature flag for ${featureName}`,
    });
    
    this.features.set(featureName, {
      enabled: false,
      disabledAt: Date.now(),
    });
  }

  // Check if feature is enabled
  isFeatureEnabled(featureName) {
    return this.configManager.getConfig(`feature_${featureName}`, false);
  }

  // Get feature options
  getFeatureOptions(featureName) {
    const feature = this.features.get(featureName);
    return feature ? feature.options : {};
  }

  // Get all features
  getAllFeatures() {
    return Array.from(this.features.entries()).map(([name, feature]) => ({
      name,
      ...feature,
    }));
  }

  // Get enabled features
  getEnabledFeatures() {
    return this.getAllFeatures().filter(feature => feature.enabled);
  }

  // Get disabled features
  getDisabledFeatures() {
    return this.getAllFeatures().filter(feature => !feature.enabled);
  }
}

export const featureConfig = new FeatureConfig();

// 5. THEME CONFIG
export class ThemeConfig {
  constructor() {
    this.configManager = configManager;
    this.themes = new Map();
    this.currentTheme = 'default';
  }

  // Set theme
  async setTheme(themeName, themeConfig) {
    await this.configManager.setConfig(`theme_${themeName}`, themeConfig, {
      type: CONFIG_TYPES.OBJECT,
      description: `Theme configuration for ${themeName}`,
    });
    
    this.themes.set(themeName, themeConfig);
  }

  // Get theme
  getTheme(themeName) {
    return this.configManager.getConfig(`theme_${themeName}`, {});
  }

  // Set current theme
  async setCurrentTheme(themeName) {
    this.currentTheme = themeName;
    await this.configManager.setConfig('current_theme', themeName, {
      type: CONFIG_TYPES.STRING,
      description: 'Current active theme',
    });
  }

  // Get current theme
  getCurrentTheme() {
    return this.configManager.getConfig('current_theme', this.currentTheme);
  }

  // Get current theme config
  getCurrentThemeConfig() {
    const themeName = this.getCurrentTheme();
    return this.getTheme(themeName);
  }

  // Apply theme
  applyTheme(themeName) {
    const theme = this.getTheme(themeName);
    if (!theme) return;
    
    // Apply CSS variables
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      for (const [key, value] of Object.entries(theme)) {
        if (typeof value === 'string' || typeof value === 'number') {
          root.style.setProperty(`--${key}`, value);
        }
      }
    }
  }

  // Get all themes
  getAllThemes() {
    return Array.from(this.themes.keys());
  }
}

export const themeConfig = new ThemeConfig();

// 6. API CONFIG
export class APIConfig {
  constructor() {
    this.configManager = configManager;
    this.endpoints = new Map();
  }

  // Set endpoint
  async setEndpoint(name, config) {
    await this.configManager.setConfig(`api_${name}`, config, {
      type: CONFIG_TYPES.OBJECT,
      description: `API endpoint configuration for ${name}`,
    });
    
    this.endpoints.set(name, config);
  }

  // Get endpoint
  getEndpoint(name) {
    return this.configManager.getConfig(`api_${name}`, {});
  }

  // Get all endpoints
  getAllEndpoints() {
    return Array.from(this.endpoints.entries()).map(([name, config]) => ({
      name,
      ...config,
    }));
  }

  // Build URL
  buildURL(endpointName, path = '', params = {}) {
    const endpoint = this.getEndpoint(endpointName);
    if (!endpoint.url) return '';
    
    let url = endpoint.url + path;
    
    // Add query parameters
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    }
    
    if (queryParams.toString()) {
      url += '?' + queryParams.toString();
    }
    
    return url;
  }

  // Get headers
  getHeaders(endpointName) {
    const endpoint = this.getEndpoint(endpointName);
    return endpoint.headers || {};
  }

  // Get timeout
  getTimeout(endpointName) {
    const endpoint = this.getEndpoint(endpointName);
    return endpoint.timeout || 30000;
  }
}

export const apiConfig = new APIConfig();

// 7. CONFIG VALIDATORS
export class ConfigValidators {
  // String validator
  static string(minLength = 0, maxLength = Infinity) {
    return (value) => {
      if (typeof value !== 'string') return false;
      return value.length >= minLength && value.length <= maxLength;
    };
  }

  // Number validator
  static number(min = -Infinity, max = Infinity) {
    return (value) => {
      if (typeof value !== 'number' || isNaN(value)) return false;
      return value >= min && value <= max;
    };
  }

  // Boolean validator
  static boolean() {
    return (value) => typeof value === 'boolean';
  }

  // Array validator
  static array(minLength = 0, maxLength = Infinity) {
    return (value) => {
      if (!Array.isArray(value)) return false;
      return value.length >= minLength && value.length <= maxLength;
    };
  }

  // Object validator
  static object(requiredKeys = []) {
    return (value) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
      return requiredKeys.every(key => key in value);
    };
  }

  // URL validator
  static url() {
    return (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    };
  }

  // Email validator
  static email() {
    return (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    };
  }

  // Enum validator
  static enum(values) {
    return (value) => values.includes(value);
  }
}

// 8. CONFIG MANAGER
export class ConfigManager {
  constructor() {
    this.configManager = configManager;
    this.environmentConfig = environmentConfig;
    this.featureConfig = featureConfig;
    this.themeConfig = themeConfig;
    this.apiConfig = apiConfig;
  }

  // Initialize configuration
  async initializeConfiguration() {
    await this.configManager.loadConfigurations();
    await this.environmentConfig.loadEnvironmentConfigurations();
    
    // Set up default configurations
    await this.setupDefaultConfigurations();
  }

  // Setup default configurations
  async setupDefaultConfigurations() {
    // Default feature flags
    await this.featureConfig.enableFeature('ai_coach', { environment: 'all' });
    await this.featureConfig.enableFeature('analytics', { environment: 'production' });
    await this.featureConfig.enableFeature('error_reporting', { environment: 'production' });
    
    // Default theme
    await this.themeConfig.setTheme('default', {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      backgroundColor: '#ffffff',
      textColor: '#212529',
      fontFamily: 'Arial, sans-serif',
    });
    
    // Default API endpoints
    await this.apiConfig.setEndpoint('main', {
      url: this.environmentConfig.getEnvironmentConfig('apiUrl')?.value || 'http://localhost:3000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get configuration value
  getConfig(key, defaultValue = null) {
    return this.configManager.getConfig(key, defaultValue);
  }

  // Set configuration value
  async setConfig(key, value, options = {}) {
    return await this.configManager.setConfig(key, value, options);
  }

  // Get all configurations
  getAllConfigs() {
    return this.configManager.getAllConfigs();
  }

  // Export configurations
  exportConfigurations(includeSensitive = false) {
    return this.configManager.exportConfigurations(includeSensitive);
  }

  // Import configurations
  async importConfigurations(configs, options = {}) {
    return await this.configManager.importConfigurations(configs, options);
  }
}

export const configManager = new ConfigManager();

export default {
  configManager,
  environmentConfig,
  featureConfig,
  themeConfig,
  apiConfig,
  ConfigValidators,
  CONFIG_TYPES,
};
