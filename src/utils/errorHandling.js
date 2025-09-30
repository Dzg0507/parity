// ERROR HANDLING AND MONITORING SYSTEM
// This is going to make the app BULLETPROOF! 🚨

import { storage } from './storage';
import { analyticsManager } from './analytics';

// 1. ERROR TYPES
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  STORAGE: 'storage',
  API: 'api',
  UI: 'ui',
  BUSINESS_LOGIC: 'business_logic',
  UNKNOWN: 'unknown',
};

// 2. ERROR SEVERITY LEVELS
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// 3. ERROR MANAGER
export class ErrorManager {
  constructor() {
    this.errors = new Map();
    this.errorHandlers = new Map();
    this.retryStrategies = new Map();
    this.circuitBreakers = new Map();
  }

  // Register error handler
  registerErrorHandler(errorType, handler) {
    if (!this.errorHandlers.has(errorType)) {
      this.errorHandlers.set(errorType, []);
    }
    this.errorHandlers.get(errorType).push(handler);
  }

  // Handle error
  async handleError(error, context = {}) {
    const errorInfo = this.analyzeError(error, context);
    
    // Store error
    await this.storeError(errorInfo);
    
    // Execute error handlers
    await this.executeErrorHandlers(errorInfo);
    
    // Check for retry
    if (this.shouldRetry(errorInfo)) {
      await this.retryOperation(errorInfo);
    }
    
    // Check circuit breaker
    if (this.isCircuitOpen(errorInfo)) {
      throw new Error('Circuit breaker is open');
    }
    
    return errorInfo;
  }

  // Analyze error
  analyzeError(error, context) {
    const errorInfo = {
      id: this.generateErrorId(),
      type: this.classifyError(error),
      severity: this.assessSeverity(error, context),
      message: error.message || 'Unknown error',
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userId: context.userId || 'unknown',
      sessionId: context.sessionId || 'unknown',
      userAgent: context.userAgent || 'unknown',
      url: context.url || 'unknown',
    };

    return errorInfo;
  }

  // Classify error
  classifyError(error) {
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return ERROR_TYPES.NETWORK;
    }
    if (error.name === 'AuthenticationError' || error.message.includes('auth')) {
      return ERROR_TYPES.AUTHENTICATION;
    }
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      return ERROR_TYPES.VALIDATION;
    }
    if (error.name === 'PermissionError' || error.message.includes('permission')) {
      return ERROR_TYPES.PERMISSION;
    }
    if (error.name === 'StorageError' || error.message.includes('storage')) {
      return ERROR_TYPES.STORAGE;
    }
    if (error.name === 'APIError' || error.message.includes('api')) {
      return ERROR_TYPES.API;
    }
    if (error.name === 'UIError' || error.message.includes('ui')) {
      return ERROR_TYPES.UI;
    }
    if (error.name === 'BusinessLogicError' || error.message.includes('business')) {
      return ERROR_TYPES.BUSINESS_LOGIC;
    }
    return ERROR_TYPES.UNKNOWN;
  }

  // Assess severity
  assessSeverity(error, context) {
    // Critical errors
    if (error.name === 'CriticalError' || error.message.includes('critical')) {
      return ERROR_SEVERITY.CRITICAL;
    }
    
    // High severity errors
    if (error.name === 'AuthenticationError' || error.name === 'PermissionError') {
      return ERROR_SEVERITY.HIGH;
    }
    
    // Medium severity errors
    if (error.name === 'APIError' || error.name === 'ValidationError') {
      return ERROR_SEVERITY.MEDIUM;
    }
    
    // Low severity errors
    if (error.name === 'UIError' || error.message.includes('ui')) {
      return ERROR_SEVERITY.LOW;
    }
    
    return ERROR_SEVERITY.MEDIUM;
  }

  // Store error
  async storeError(errorInfo) {
    this.errors.set(errorInfo.id, errorInfo);
    
    // Store in persistent storage
    const userId = errorInfo.userId;
    const userErrors = await this.getUserErrors(userId);
    userErrors.push(errorInfo);
    
    // Keep only last 100 errors per user
    if (userErrors.length > 100) {
      userErrors.splice(0, userErrors.length - 100);
    }
    
    await storage.setItem(`errors_${userId}`, JSON.stringify(userErrors));
  }

  // Get user errors
  async getUserErrors(userId) {
    const stored = await storage.getItem(`errors_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  // Execute error handlers
  async executeErrorHandlers(errorInfo) {
    const handlers = this.errorHandlers.get(errorInfo.type) || [];
    
    for (const handler of handlers) {
      try {
        await handler(errorInfo);
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    }
  }

  // Check if should retry
  shouldRetry(errorInfo) {
    const retryStrategy = this.retryStrategies.get(errorInfo.type);
    if (!retryStrategy) return false;
    
    const retryCount = errorInfo.retryCount || 0;
    return retryCount < retryStrategy.maxRetries;
  }

  // Retry operation
  async retryOperation(errorInfo) {
    const retryStrategy = this.retryStrategies.get(errorInfo.type);
    if (!retryStrategy) return;
    
    const retryCount = (errorInfo.retryCount || 0) + 1;
    const delay = retryStrategy.delay * Math.pow(2, retryCount - 1); // Exponential backoff
    
    setTimeout(async () => {
      try {
        await retryStrategy.operation();
        console.log(`Retry ${retryCount} successful for error ${errorInfo.id}`);
      } catch (retryError) {
        errorInfo.retryCount = retryCount;
        await this.handleError(retryError, errorInfo.context);
      }
    }, delay);
  }

  // Check circuit breaker
  isCircuitOpen(errorInfo) {
    const circuitBreaker = this.circuitBreakers.get(errorInfo.type);
    if (!circuitBreaker) return false;
    
    const now = Date.now();
    if (circuitBreaker.state === 'open' && (now - circuitBreaker.lastFailure) < circuitBreaker.timeout) {
      return true;
    }
    
    if (circuitBreaker.state === 'open' && (now - circuitBreaker.lastFailure) >= circuitBreaker.timeout) {
      circuitBreaker.state = 'half-open';
    }
    
    return false;
  }

  // Update circuit breaker
  updateCircuitBreaker(errorInfo, success) {
    const circuitBreaker = this.circuitBreakers.get(errorInfo.type);
    if (!circuitBreaker) return;
    
    if (success) {
      circuitBreaker.failureCount = 0;
      circuitBreaker.state = 'closed';
    } else {
      circuitBreaker.failureCount++;
      circuitBreaker.lastFailure = Date.now();
      
      if (circuitBreaker.failureCount >= circuitBreaker.threshold) {
        circuitBreaker.state = 'open';
      }
    }
  }

  // Generate error ID
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get error statistics
  async getErrorStatistics(userId) {
    const errors = await this.getUserErrors(userId);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const recentErrors = errors.filter(error => (now - error.timestamp) < oneDay);
    
    const statistics = {
      total: errors.length,
      recent: recentErrors.length,
      byType: {},
      bySeverity: {},
      trends: this.calculateErrorTrends(errors),
    };
    
    // Count by type
    errors.forEach(error => {
      statistics.byType[error.type] = (statistics.byType[error.type] || 0) + 1;
    });
    
    // Count by severity
    errors.forEach(error => {
      statistics.bySeverity[error.severity] = (statistics.bySeverity[error.severity] || 0) + 1;
    });
    
    return statistics;
  }

  // Calculate error trends
  calculateErrorTrends(errors) {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    
    const weekErrors = errors.filter(error => (now - error.timestamp) < oneWeek);
    const monthErrors = errors.filter(error => (now - error.timestamp) < oneMonth);
    
    return {
      week: weekErrors.length,
      month: monthErrors.length,
      trend: weekErrors.length > monthErrors.length / 4 ? 'increasing' : 'decreasing',
    };
  }
}

export const errorManager = new ErrorManager();

// 4. ERROR BOUNDARY COMPONENT
export class ErrorBoundary {
  constructor() {
    this.errorManager = errorManager;
  }

  // Wrap function with error handling
  wrapFunction(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        await this.errorManager.handleError(error, context);
        throw error;
      }
    };
  }

  // Wrap async function with error handling
  wrapAsyncFunction(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        await this.errorManager.handleError(error, context);
        throw error;
      }
    };
  }

  // Wrap promise with error handling
  wrapPromise(promise, context = {}) {
    return promise.catch(async (error) => {
      await this.errorManager.handleError(error, context);
      throw error;
    });
  }
}

export const errorBoundary = new ErrorBoundary();

// 5. ERROR RECOVERY STRATEGIES
export class ErrorRecoveryStrategies {
  constructor() {
    this.strategies = new Map();
  }

  // Register recovery strategy
  registerRecoveryStrategy(errorType, strategy) {
    this.strategies.set(errorType, strategy);
  }

  // Execute recovery strategy
  async executeRecoveryStrategy(errorType, errorInfo) {
    const strategy = this.strategies.get(errorType);
    if (!strategy) return false;
    
    try {
      await strategy(errorInfo);
      return true;
    } catch (recoveryError) {
      console.error('Recovery strategy failed:', recoveryError);
      return false;
    }
  }

  // Network error recovery
  async networkErrorRecovery(errorInfo) {
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check network connectivity
    const isOnline = navigator.onLine;
    if (!isOnline) {
      throw new Error('Network is offline');
    }
    
    // Retry the operation
    if (errorInfo.context.retryFunction) {
      await errorInfo.context.retryFunction();
    }
  }

  // Authentication error recovery
  async authenticationErrorRecovery(errorInfo) {
    // Clear invalid tokens
    await storage.removeItem('authToken');
    await storage.removeItem('refreshToken');
    
    // Redirect to login
    if (errorInfo.context.navigation) {
      errorInfo.context.navigation.navigate('Login');
    }
  }

  // Storage error recovery
  async storageErrorRecovery(errorInfo) {
    // Clear corrupted data
    await storage.clear();
    
    // Reinitialize storage
    if (errorInfo.context.initializeStorage) {
      await errorInfo.context.initializeStorage();
    }
  }

  // API error recovery
  async apiErrorRecovery(errorInfo) {
    // Check if it's a rate limit error
    if (errorInfo.message.includes('rate limit')) {
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, 5000));
      return;
    }
    
    // Check if it's a server error
    if (errorInfo.message.includes('500')) {
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      return;
    }
    
    // For other API errors, show user-friendly message
    throw new Error('Service temporarily unavailable. Please try again later.');
  }
}

export const errorRecoveryStrategies = new ErrorRecoveryStrategies();

// 6. ERROR MONITORING
export class ErrorMonitoring {
  constructor() {
    this.errorManager = errorManager;
    this.analyticsManager = analyticsManager;
  }

  // Monitor error rates
  async monitorErrorRates() {
    const userId = await this.getCurrentUserId();
    const statistics = await this.errorManager.getErrorStatistics(userId);
    
    // Check for high error rates
    if (statistics.recent > 10) {
      await this.analyticsManager.trackEvent('high_error_rate', {
        errorCount: statistics.recent,
        errorTypes: statistics.byType,
        severity: statistics.bySeverity,
      }, userId);
    }
    
    // Check for critical errors
    const criticalErrors = statistics.bySeverity[ERROR_SEVERITY.CRITICAL] || 0;
    if (criticalErrors > 0) {
      await this.analyticsManager.trackEvent('critical_errors', {
        count: criticalErrors,
      }, userId);
    }
    
    return statistics;
  }

  // Get current user ID
  async getCurrentUserId() {
    const user = await storage.getItem('currentUser');
    return user ? JSON.parse(user).id : 'anonymous';
  }

  // Generate error report
  async generateErrorReport(userId) {
    const statistics = await this.errorManager.getErrorStatistics(userId);
    const errors = await this.errorManager.getUserErrors(userId);
    
    const report = {
      summary: statistics,
      recentErrors: errors.slice(-10),
      recommendations: this.generateRecommendations(statistics),
      generatedAt: new Date().toISOString(),
    };
    
    return report;
  }

  // Generate recommendations
  generateRecommendations(statistics) {
    const recommendations = [];
    
    // High error rate recommendation
    if (statistics.recent > 10) {
      recommendations.push({
        type: 'error_rate',
        title: 'High Error Rate',
        message: 'You\'re experiencing many errors. Consider checking your network connection.',
        priority: 'high',
      });
    }
    
    // Network error recommendation
    if (statistics.byType[ERROR_TYPES.NETWORK] > 5) {
      recommendations.push({
        type: 'network',
        title: 'Network Issues',
        message: 'Network errors are frequent. Check your internet connection.',
        priority: 'medium',
      });
    }
    
    // Authentication error recommendation
    if (statistics.byType[ERROR_TYPES.AUTHENTICATION] > 0) {
      recommendations.push({
        type: 'authentication',
        title: 'Authentication Issues',
        message: 'Authentication errors detected. Try logging out and back in.',
        priority: 'high',
      });
    }
    
    return recommendations;
  }
}

export const errorMonitoring = new ErrorMonitoring();

// 7. ERROR HANDLING MIDDLEWARE
export class ErrorHandlingMiddleware {
  constructor() {
    this.errorManager = errorManager;
    this.errorRecoveryStrategies = errorRecoveryStrategies;
  }

  // API error handling middleware
  async apiErrorMiddleware(error, req, res, next) {
    const errorInfo = await this.errorManager.handleError(error, {
      userId: req.user?.id,
      sessionId: req.session?.id,
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });
    
    // Try to recover
    const recovered = await this.errorRecoveryStrategies.executeRecoveryStrategy(
      errorInfo.type,
      errorInfo
    );
    
    if (recovered) {
      return next();
    }
    
    // Send error response
    res.status(this.getStatusCode(errorInfo)).json({
      error: {
        type: errorInfo.type,
        message: this.getUserFriendlyMessage(errorInfo),
        code: errorInfo.id,
      },
    });
  }

  // Get status code for error
  getStatusCode(errorInfo) {
    switch (errorInfo.type) {
      case ERROR_TYPES.AUTHENTICATION:
        return 401;
      case ERROR_TYPES.PERMISSION:
        return 403;
      case ERROR_TYPES.VALIDATION:
        return 400;
      case ERROR_TYPES.NOT_FOUND:
        return 404;
      case ERROR_TYPES.NETWORK:
        return 503;
      default:
        return 500;
    }
  }

  // Get user-friendly error message
  getUserFriendlyMessage(errorInfo) {
    const messages = {
      [ERROR_TYPES.NETWORK]: 'Network connection issue. Please check your internet connection.',
      [ERROR_TYPES.AUTHENTICATION]: 'Authentication failed. Please log in again.',
      [ERROR_TYPES.VALIDATION]: 'Invalid input. Please check your data and try again.',
      [ERROR_TYPES.PERMISSION]: 'You don\'t have permission to perform this action.',
      [ERROR_TYPES.STORAGE]: 'Storage error. Please try again.',
      [ERROR_TYPES.API]: 'Service temporarily unavailable. Please try again later.',
      [ERROR_TYPES.UI]: 'Interface error. Please refresh the page.',
      [ERROR_TYPES.BUSINESS_LOGIC]: 'Operation failed. Please try again.',
      [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };
    
    return messages[errorInfo.type] || messages[ERROR_TYPES.UNKNOWN];
  }
}

export const errorHandlingMiddleware = new ErrorHandlingMiddleware();

// 8. ERROR UTILITIES
export class ErrorUtils {
  // Create custom error
  static createError(type, message, context = {}) {
    const error = new Error(message);
    error.type = type;
    error.context = context;
    error.timestamp = Date.now();
    return error;
  }

  // Create network error
  static createNetworkError(message, context = {}) {
    return this.createError(ERROR_TYPES.NETWORK, message, context);
  }

  // Create authentication error
  static createAuthenticationError(message, context = {}) {
    return this.createError(ERROR_TYPES.AUTHENTICATION, message, context);
  }

  // Create validation error
  static createValidationError(message, context = {}) {
    return this.createError(ERROR_TYPES.VALIDATION, message, context);
  }

  // Create permission error
  static createPermissionError(message, context = {}) {
    return this.createError(ERROR_TYPES.PERMISSION, message, context);
  }

  // Create storage error
  static createStorageError(message, context = {}) {
    return this.createError(ERROR_TYPES.STORAGE, message, context);
  }

  // Create API error
  static createAPIError(message, context = {}) {
    return this.createError(ERROR_TYPES.API, message, context);
  }

  // Create UI error
  static createUIError(message, context = {}) {
    return this.createError(ERROR_TYPES.UI, message, context);
  }

  // Create business logic error
  static createBusinessLogicError(message, context = {}) {
    return this.createError(ERROR_TYPES.BUSINESS_LOGIC, message, context);
  }

  // Check if error is retryable
  static isRetryable(error) {
    const retryableTypes = [
      ERROR_TYPES.NETWORK,
      ERROR_TYPES.API,
      ERROR_TYPES.STORAGE,
    ];
    
    return retryableTypes.includes(error.type);
  }

  // Check if error is critical
  static isCritical(error) {
    return error.severity === ERROR_SEVERITY.CRITICAL;
  }
}

export default {
  errorManager,
  errorBoundary,
  errorRecoveryStrategies,
  errorMonitoring,
  errorHandlingMiddleware,
  ErrorUtils,
  ERROR_TYPES,
  ERROR_SEVERITY,
};
