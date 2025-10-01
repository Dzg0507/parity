// Comprehensive Error Handling System
import { Alert } from 'react-native';
import { Platform } from 'react-native';

// Error types and their handling strategies
const ERROR_TYPES = {
  NETWORK_ERROR: 'network',
  LOADING_ERROR: 'loading',
  RENDERING_ERROR: 'rendering',
  VOICE_ERROR: 'voice',
  AI_ERROR: 'ai',
  PERMISSION_ERROR: 'permission',
  UNKNOWN_ERROR: 'unknown'
};

// Error severity levels
const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error recovery strategies
const RECOVERY_STRATEGIES = {
  RETRY: 'retry',
  FALLBACK: 'fallback',
  SKIP: 'skip',
  RESTART: 'restart',
  MANUAL: 'manual'
};

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.recoveryAttempts = new Map();
    this.maxRetries = 3;
    this.isOnline = true;
  }

  // Main error handling method
  handleError(error, context = {}, options = {}) {
    const errorInfo = this.analyzeError(error, context);
    this.logError(errorInfo);
    
    // Determine recovery strategy
    const strategy = this.determineRecoveryStrategy(errorInfo);
    
    // Execute recovery
    this.executeRecovery(strategy, errorInfo, options);
    
    // Notify user if necessary
    if (errorInfo.severity !== SEVERITY_LEVELS.LOW) {
      this.notifyUser(errorInfo, strategy);
    }
    
    return errorInfo;
  }

  // Analyze error and determine its characteristics
  analyzeError(error, context) {
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      type: this.categorizeError(error),
      severity: this.assessSeverity(error, context),
      context: context,
      platform: Platform.OS,
      userAgent: Platform.OS === 'web' ? navigator.userAgent : 'React Native',
      isOnline: this.isOnline
    };

    return errorInfo;
  }

  // Categorize error based on message and context
  categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ERROR_TYPES.NETWORK_ERROR;
    }
    
    if (message.includes('loading') || message.includes('load') || message.includes('asset')) {
      return ERROR_TYPES.LOADING_ERROR;
    }
    
    if (message.includes('render') || message.includes('webgl') || message.includes('three')) {
      return ERROR_TYPES.RENDERING_ERROR;
    }
    
    if (message.includes('voice') || message.includes('speech') || message.includes('audio')) {
      return ERROR_TYPES.VOICE_ERROR;
    }
    
    if (message.includes('ai') || message.includes('coaching') || message.includes('response')) {
      return ERROR_TYPES.AI_ERROR;
    }
    
    if (message.includes('permission') || message.includes('access')) {
      return ERROR_TYPES.PERMISSION_ERROR;
    }
    
    return ERROR_TYPES.UNKNOWN_ERROR;
  }

  // Assess error severity
  assessSeverity(error, context) {
    const message = error.message.toLowerCase();
    
    // Critical errors that break core functionality
    if (message.includes('crash') || message.includes('fatal') || 
        context.component === 'main' || context.feature === 'core') {
      return SEVERITY_LEVELS.CRITICAL;
    }
    
    // High severity errors that affect major features
    if (message.includes('failed') || message.includes('error') ||
        context.feature === 'avatar' || context.feature === 'voice') {
      return SEVERITY_LEVELS.HIGH;
    }
    
    // Medium severity errors that affect minor features
    if (message.includes('warning') || context.feature === 'analytics' || 
        context.feature === 'social') {
      return SEVERITY_LEVELS.MEDIUM;
    }
    
    // Low severity errors that don't affect core functionality
    return SEVERITY_LEVELS.LOW;
  }

  // Determine recovery strategy based on error type and severity
  determineRecoveryStrategy(errorInfo) {
    const { type, severity, context } = errorInfo;
    
    // Critical errors need immediate attention
    if (severity === SEVERITY_LEVELS.CRITICAL) {
      return RECOVERY_STRATEGIES.RESTART;
    }
    
    // Network errors can be retried
    if (type === ERROR_TYPES.NETWORK_ERROR && this.canRetry(errorInfo)) {
      return RECOVERY_STRATEGIES.RETRY;
    }
    
    // Loading errors can use fallbacks
    if (type === ERROR_TYPES.LOADING_ERROR) {
      return RECOVERY_STRATEGIES.FALLBACK;
    }
    
    // Rendering errors can skip or use fallback
    if (type === ERROR_TYPES.RENDERING_ERROR) {
      return RECOVERY_STRATEGIES.FALLBACK;
    }
    
    // Voice errors can be skipped
    if (type === ERROR_TYPES.VOICE_ERROR) {
      return RECOVERY_STRATEGIES.SKIP;
    }
    
    // AI errors can use fallback
    if (type === ERROR_TYPES.AI_ERROR) {
      return RECOVERY_STRATEGIES.FALLBACK;
    }
    
    // Permission errors need manual intervention
    if (type === ERROR_TYPES.PERMISSION_ERROR) {
      return RECOVERY_STRATEGIES.MANUAL;
    }
    
    return RECOVERY_STRATEGIES.SKIP;
  }

  // Check if error can be retried
  canRetry(errorInfo) {
    const attempts = this.recoveryAttempts.get(errorInfo.id) || 0;
    return attempts < this.maxRetries;
  }

  // Execute recovery strategy
  executeRecovery(strategy, errorInfo, options) {
    const attempts = this.recoveryAttempts.get(errorInfo.id) || 0;
    this.recoveryAttempts.set(errorInfo.id, attempts + 1);
    
    switch (strategy) {
      case RECOVERY_STRATEGIES.RETRY:
        this.retryOperation(errorInfo, options);
        break;
        
      case RECOVERY_STRATEGIES.FALLBACK:
        this.useFallback(errorInfo, options);
        break;
        
      case RECOVERY_STRATEGIES.SKIP:
        this.skipFeature(errorInfo, options);
        break;
        
      case RECOVERY_STRATEGIES.RESTART:
        this.restartApplication(errorInfo, options);
        break;
        
      case RECOVERY_STRATEGIES.MANUAL:
        this.requestManualIntervention(errorInfo, options);
        break;
        
      default:
        console.warn('Unknown recovery strategy:', strategy);
    }
  }

  // Retry operation
  retryOperation(errorInfo, options) {
    const { retryDelay = 1000 } = options;
    
    setTimeout(() => {
      if (options.onRetry) {
        options.onRetry();
      }
    }, retryDelay);
  }

  // Use fallback functionality
  useFallback(errorInfo, options) {
    if (options.onFallback) {
      options.onFallback();
    }
  }

  // Skip feature
  skipFeature(errorInfo, options) {
    if (options.onSkip) {
      options.onSkip();
    }
  }

  // Restart application
  restartApplication(errorInfo, options) {
    if (options.onRestart) {
      options.onRestart();
    }
  }

  // Request manual intervention
  requestManualIntervention(errorInfo, options) {
    if (options.onManual) {
      options.onManual();
    }
  }

  // Notify user about error
  notifyUser(errorInfo, strategy) {
    const messages = {
      [ERROR_TYPES.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection.',
      [ERROR_TYPES.LOADING_ERROR]: 'Failed to load content. Using fallback mode.',
      [ERROR_TYPES.RENDERING_ERROR]: 'Display issue detected. Switching to simplified view.',
      [ERROR_TYPES.VOICE_ERROR]: 'Voice features temporarily unavailable.',
      [ERROR_TYPES.AI_ERROR]: 'AI coaching temporarily unavailable. Using basic mode.',
      [ERROR_TYPES.PERMISSION_ERROR]: 'Permission required. Please check your settings.',
      [ERROR_TYPES.UNKNOWN_ERROR]: 'An unexpected error occurred. The app will continue with limited functionality.'
    };

    const message = messages[errorInfo.type] || messages[ERROR_TYPES.UNKNOWN_ERROR];
    
    if (errorInfo.severity === SEVERITY_LEVELS.CRITICAL) {
      Alert.alert(
        'Critical Error',
        message,
        [
          { text: 'Restart App', onPress: () => this.restartApplication(errorInfo) },
          { text: 'Continue', style: 'cancel' }
        ]
      );
    } else if (errorInfo.severity === SEVERITY_LEVELS.HIGH) {
      Alert.alert('Error', message);
    } else {
      // For medium and low severity, just log to console
      console.warn('Error:', message);
    }
  }

  // Log error for debugging
  logError(errorInfo) {
    this.errorLog.push(errorInfo);
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
    
    // Log to console in development
    if (__DEV__) {
      console.error('Error logged:', errorInfo);
    }
  }

  // Generate unique error ID
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get error statistics
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      bySeverity: {},
      recent: this.errorLog.slice(-10)
    };
    
    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });
    
    return stats;
  }

  // Clear error log
  clearErrorLog() {
    this.errorLog = [];
    this.recoveryAttempts.clear();
  }

  // Set online status
  setOnlineStatus(isOnline) {
    this.isOnline = isOnline;
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export convenience functions
export const handleError = (error, context, options) => {
  return errorHandler.handleError(error, context, options);
};

export const getErrorStats = () => {
  return errorHandler.getErrorStats();
};

export const clearErrors = () => {
  errorHandler.clearErrorLog();
};

export const setOnlineStatus = (isOnline) => {
  errorHandler.setOnlineStatus(isOnline);
};

// Export error types and severity levels for use in components
export { ERROR_TYPES, SEVERITY_LEVELS, RECOVERY_STRATEGIES };

export default errorHandler;