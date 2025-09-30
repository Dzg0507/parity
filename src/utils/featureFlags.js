// FEATURE FLAG SYSTEM
// This is going to make the app DYNAMICALLY CONTROLLABLE! 🚩

import { storage } from './storage';
import { analyticsManager } from './analytics';

// 1. FEATURE FLAG TYPES
export const FEATURE_FLAG_TYPES = {
  BOOLEAN: 'boolean',
  STRING: 'string',
  NUMBER: 'number',
  JSON: 'json',
  PERCENTAGE: 'percentage',
};

// 2. FEATURE FLAG STATUS
export const FEATURE_FLAG_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  ROLLING_OUT: 'rolling_out',
  ROLLED_BACK: 'rolled_back',
};

// 3. FEATURE FLAG MANAGER
export class FeatureFlagManager {
  constructor() {
    this.flags = new Map();
    this.overrides = new Map();
    this.rollouts = new Map();
    this.analytics = new Map();
  }

  // Create feature flag
  async createFeatureFlag(flag) {
    const featureFlag = {
      id: this.generateFlagId(),
      key: flag.key,
      name: flag.name,
      description: flag.description || '',
      type: flag.type || FEATURE_FLAG_TYPES.BOOLEAN,
      status: flag.status || FEATURE_FLAG_STATUS.DISABLED,
      defaultValue: flag.defaultValue || false,
      value: flag.value || flag.defaultValue || false,
      targetUsers: flag.targetUsers || [],
      targetGroups: flag.targetGroups || [],
      targetPercentage: flag.targetPercentage || 0,
      conditions: flag.conditions || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: flag.createdBy || 'system',
      tags: flag.tags || [],
      environment: flag.environment || 'all',
      version: flag.version || '1.0.0',
    };

    this.flags.set(featureFlag.id, featureFlag);
    await this.storeFeatureFlag(featureFlag);
    
    return featureFlag;
  }

  // Get feature flag
  async getFeatureFlag(flagId) {
    if (this.flags.has(flagId)) {
      return this.flags.get(flagId);
    }

    const stored = await storage.getItem(`feature_flag_${flagId}`);
    if (stored) {
      const flag = JSON.parse(stored);
      this.flags.set(flagId, flag);
      return flag;
    }

    return null;
  }

  // Get feature flag by key
  async getFeatureFlagByKey(key) {
    for (const [id, flag] of this.flags) {
      if (flag.key === key) {
        return flag;
      }
    }

    // Check stored flags
    const storedFlags = await this.getAllStoredFlags();
    return storedFlags.find(flag => flag.key === key);
  }

  // Check feature flag
  async checkFeatureFlag(key, userId = null, context = {}) {
    const flag = await this.getFeatureFlagByKey(key);
    if (!flag) {
      return false;
    }

    // Check if flag is enabled
    if (flag.status !== FEATURE_FLAG_STATUS.ENABLED) {
      return false;
    }

    // Check user overrides
    if (userId) {
      const override = await this.getUserOverride(flag.id, userId);
      if (override !== null) {
        return override;
      }
    }

    // Check rollout percentage
    if (flag.targetPercentage > 0) {
      const isInRollout = await this.isUserInRollout(flag, userId, context);
      if (!isInRollout) {
        return false;
      }
    }

    // Check target users
    if (flag.targetUsers.length > 0 && userId) {
      if (!flag.targetUsers.includes(userId)) {
        return false;
      }
    }

    // Check target groups
    if (flag.targetGroups.length > 0 && userId) {
      const userGroups = await this.getUserGroups(userId);
      const hasMatchingGroup = flag.targetGroups.some(group => userGroups.includes(group));
      if (!hasMatchingGroup) {
        return false;
      }
    }

    // Check conditions
    if (flag.conditions.length > 0) {
      const conditionsMet = await this.evaluateConditions(flag.conditions, userId, context);
      if (!conditionsMet) {
        return false;
      }
    }

    // Track flag check
    await this.trackFlagCheck(flag, userId, context, true);

    return true;
  }

  // Get feature flag value
  async getFeatureFlagValue(key, userId = null, context = {}) {
    const flag = await this.getFeatureFlagByKey(key);
    if (!flag) {
      return null;
    }

    const isEnabled = await this.checkFeatureFlag(key, userId, context);
    if (!isEnabled) {
      return flag.defaultValue;
    }

    return flag.value;
  }

  // Set user override
  async setUserOverride(flagId, userId, value) {
    const override = {
      flagId,
      userId,
      value,
      createdAt: Date.now(),
    };

    this.overrides.set(`${flagId}_${userId}`, override);
    await this.storeUserOverride(override);
  }

  // Get user override
  async getUserOverride(flagId, userId) {
    const key = `${flagId}_${userId}`;
    
    if (this.overrides.has(key)) {
      return this.overrides.get(key).value;
    }

    const stored = await storage.getItem(`override_${key}`);
    if (stored) {
      const override = JSON.parse(stored);
      this.overrides.set(key, override);
      return override.value;
    }

    return null;
  }

  // Remove user override
  async removeUserOverride(flagId, userId) {
    const key = `${flagId}_${userId}`;
    
    this.overrides.delete(key);
    await storage.removeItem(`override_${key}`);
  }

  // Check if user is in rollout
  async isUserInRollout(flag, userId, context) {
    if (!userId) return false;
    
    const rolloutKey = `${flag.id}_${userId}`;
    
    if (this.rollouts.has(rolloutKey)) {
      return this.rollouts.get(rolloutKey);
    }

    // Calculate hash-based rollout
    const hash = await this.calculateUserHash(userId, flag.id);
    const percentage = (hash % 100) + 1;
    const isInRollout = percentage <= flag.targetPercentage;
    
    this.rollouts.set(rolloutKey, isInRollout);
    return isInRollout;
  }

  // Calculate user hash
  async calculateUserHash(userId, flagId) {
    const input = `${userId}_${flagId}`;
    let hash = 0;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash);
  }

  // Get user groups
  async getUserGroups(userId) {
    const user = await storage.getItem(`user_${userId}`);
    if (!user) return [];
    
    const userData = JSON.parse(user);
    return userData.groups || [];
  }

  // Evaluate conditions
  async evaluateConditions(conditions, userId, context) {
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, userId, context);
      if (!result) {
        return false;
      }
    }
    
    return true;
  }

  // Evaluate single condition
  async evaluateCondition(condition, userId, context) {
    const { field, operator, value } = condition;
    
    let actualValue;
    
    if (field.startsWith('user.')) {
      const userField = field.substring(5);
      const user = await storage.getItem(`user_${userId}`);
      if (!user) return false;
      
      const userData = JSON.parse(user);
      actualValue = userData[userField];
    } else if (field.startsWith('context.')) {
      const contextField = field.substring(8);
      actualValue = context[contextField];
    } else {
      actualValue = context[field];
    }
    
    switch (operator) {
      case 'equals':
        return actualValue === value;
      case 'not_equals':
        return actualValue !== value;
      case 'contains':
        return actualValue && actualValue.includes(value);
      case 'not_contains':
        return !actualValue || !actualValue.includes(value);
      case 'greater_than':
        return actualValue > value;
      case 'less_than':
        return actualValue < value;
      case 'greater_than_or_equal':
        return actualValue >= value;
      case 'less_than_or_equal':
        return actualValue <= value;
      case 'in':
        return Array.isArray(value) && value.includes(actualValue);
      case 'not_in':
        return !Array.isArray(value) || !value.includes(actualValue);
      case 'exists':
        return actualValue !== undefined && actualValue !== null;
      case 'not_exists':
        return actualValue === undefined || actualValue === null;
      default:
        return false;
    }
  }

  // Track flag check
  async trackFlagCheck(flag, userId, context, result) {
    const check = {
      flagId: flag.id,
      flagKey: flag.key,
      userId,
      context,
      result,
      timestamp: Date.now(),
    };

    if (!this.analytics.has(flag.id)) {
      this.analytics.set(flag.id, []);
    }
    
    this.analytics.get(flag.id).push(check);
    
    // Keep only last 1000 checks per flag
    const checks = this.analytics.get(flag.id);
    if (checks.length > 1000) {
      checks.splice(0, checks.length - 1000);
    }
    
    // Track in analytics
    await analyticsManager.trackEvent('feature_flag_checked', {
      flagKey: flag.key,
      result,
      userId,
    }, userId);
  }

  // Update feature flag
  async updateFeatureFlag(flagId, updates) {
    const flag = await this.getFeatureFlag(flagId);
    if (!flag) {
      throw new Error('Feature flag not found');
    }

    const updatedFlag = {
      ...flag,
      ...updates,
      updatedAt: Date.now(),
    };

    this.flags.set(flagId, updatedFlag);
    await this.storeFeatureFlag(updatedFlag);
    
    return updatedFlag;
  }

  // Delete feature flag
  async deleteFeatureFlag(flagId) {
    this.flags.delete(flagId);
    await storage.removeItem(`feature_flag_${flagId}`);
  }

  // Store feature flag
  async storeFeatureFlag(flag) {
    await storage.setItem(`feature_flag_${flag.id}`, JSON.stringify(flag));
  }

  // Store user override
  async storeUserOverride(override) {
    const key = `override_${override.flagId}_${override.userId}`;
    await storage.setItem(key, JSON.stringify(override));
  }

  // Get all stored flags
  async getAllStoredFlags() {
    const flags = [];
    const keys = await storage.getAllKeys();
    
    for (const key of keys) {
      if (key.startsWith('feature_flag_')) {
        const stored = await storage.getItem(key);
        if (stored) {
          flags.push(JSON.parse(stored));
        }
      }
    }
    
    return flags;
  }

  // Generate flag ID
  generateFlagId() {
    return `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get flag analytics
  async getFlagAnalytics(flagId) {
    const checks = this.analytics.get(flagId) || [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    const recentChecks = checks.filter(c => (now - c.timestamp) < oneDay);
    const weeklyChecks = checks.filter(c => (now - c.timestamp) < oneWeek);
    
    const enabledChecks = checks.filter(c => c.result === true);
    const disabledChecks = checks.filter(c => c.result === false);
    
    return {
      total: checks.length,
      recent: recentChecks.length,
      weekly: weeklyChecks.length,
      enabled: enabledChecks.length,
      disabled: disabledChecks.length,
      enabledRate: checks.length > 0 ? (enabledChecks.length / checks.length) * 100 : 0,
      uniqueUsers: new Set(checks.map(c => c.userId)).size,
    };
  }

  // Get all flags
  async getAllFlags() {
    const storedFlags = await this.getAllStoredFlags();
    const inMemoryFlags = Array.from(this.flags.values());
    
    // Merge and deduplicate
    const allFlags = [...storedFlags];
    for (const flag of inMemoryFlags) {
      if (!allFlags.find(f => f.id === flag.id)) {
        allFlags.push(flag);
      }
    }
    
    return allFlags;
  }

  // Get flags by environment
  async getFlagsByEnvironment(environment) {
    const allFlags = await this.getAllFlags();
    return allFlags.filter(flag => 
      flag.environment === environment || flag.environment === 'all'
    );
  }

  // Get flags by status
  async getFlagsByStatus(status) {
    const allFlags = await this.getAllFlags();
    return allFlags.filter(flag => flag.status === status);
  }

  // Get flags by tag
  async getFlagsByTag(tag) {
    const allFlags = await this.getAllFlags();
    return allFlags.filter(flag => flag.tags.includes(tag));
  }
}

export const featureFlagManager = new FeatureFlagManager();

// 4. FEATURE FLAG HOOKS
export class FeatureFlagHooks {
  constructor() {
    this.hooks = new Map();
  }

  // Register hook
  registerHook(event, hook) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    
    this.hooks.get(event).push(hook);
  }

  // Execute hooks
  async executeHooks(event, data) {
    const hooks = this.hooks.get(event) || [];
    
    for (const hook of hooks) {
      try {
        await hook(data);
      } catch (error) {
        console.error(`Feature flag hook error for event ${event}:`, error);
      }
    }
  }

  // Hook events
  static EVENTS = {
    FLAG_CREATED: 'flag_created',
    FLAG_UPDATED: 'flag_updated',
    FLAG_DELETED: 'flag_deleted',
    FLAG_ENABLED: 'flag_enabled',
    FLAG_DISABLED: 'flag_disabled',
    FLAG_CHECKED: 'flag_checked',
    ROLLOUT_STARTED: 'rollout_started',
    ROLLOUT_COMPLETED: 'rollout_completed',
    ROLLOUT_ROLLED_BACK: 'rollout_rolled_back',
  };
}

export const featureFlagHooks = new FeatureFlagHooks();

// 5. FEATURE FLAG VALIDATION
export class FeatureFlagValidation {
  // Validate feature flag
  static validateFeatureFlag(flag) {
    const errors = [];
    
    if (!flag.key) {
      errors.push('Key is required');
    }
    
    if (!flag.name) {
      errors.push('Name is required');
    }
    
    if (!Object.values(FEATURE_FLAG_TYPES).includes(flag.type)) {
      errors.push('Invalid type');
    }
    
    if (!Object.values(FEATURE_FLAG_STATUS).includes(flag.status)) {
      errors.push('Invalid status');
    }
    
    if (flag.targetPercentage < 0 || flag.targetPercentage > 100) {
      errors.push('Target percentage must be between 0 and 100');
    }
    
    if (flag.conditions && !Array.isArray(flag.conditions)) {
      errors.push('Conditions must be an array');
    }
    
    if (flag.targetUsers && !Array.isArray(flag.targetUsers)) {
      errors.push('Target users must be an array');
    }
    
    if (flag.targetGroups && !Array.isArray(flag.targetGroups)) {
      errors.push('Target groups must be an array');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate condition
  static validateCondition(condition) {
    const errors = [];
    
    if (!condition.field) {
      errors.push('Field is required');
    }
    
    if (!condition.operator) {
      errors.push('Operator is required');
    }
    
    const validOperators = [
      'equals', 'not_equals', 'contains', 'not_contains',
      'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal',
      'in', 'not_in', 'exists', 'not_exists'
    ];
    
    if (!validOperators.includes(condition.operator)) {
      errors.push('Invalid operator');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// 6. FEATURE FLAG ANALYTICS
export class FeatureFlagAnalytics {
  constructor() {
    this.featureFlagManager = featureFlagManager;
  }

  // Get flag performance metrics
  async getFlagPerformanceMetrics(flagId, timeRange = 24 * 60 * 60 * 1000) {
    const checks = this.featureFlagManager.analytics.get(flagId) || [];
    const now = Date.now();
    const startTime = now - timeRange;
    
    const recentChecks = checks.filter(c => c.timestamp >= startTime);
    
    if (recentChecks.length === 0) {
      return {
        totalChecks: 0,
        enabledChecks: 0,
        disabledChecks: 0,
        enabledRate: 0,
        uniqueUsers: 0,
        averageResponseTime: 0,
      };
    }
    
    const enabledChecks = recentChecks.filter(c => c.result === true);
    const disabledChecks = recentChecks.filter(c => c.result === false);
    const uniqueUsers = new Set(recentChecks.map(c => c.userId)).size;
    
    return {
      totalChecks: recentChecks.length,
      enabledChecks: enabledChecks.length,
      disabledChecks: disabledChecks.length,
      enabledRate: (enabledChecks.length / recentChecks.length) * 100,
      uniqueUsers,
      averageResponseTime: 0, // Would be calculated from actual response times
    };
  }

  // Get flag usage trends
  async getFlagUsageTrends(flagId, timeRange = 7 * 24 * 60 * 60 * 1000) {
    const checks = this.featureFlagManager.analytics.get(flagId) || [];
    const now = Date.now();
    const startTime = now - timeRange;
    
    const recentChecks = checks.filter(c => c.timestamp >= startTime);
    
    // Group by hour
    const hourlyData = {};
    const hourMs = 60 * 60 * 1000;
    
    for (let i = 0; i < 24; i++) {
      const hourStart = startTime + (i * hourMs);
      const hourEnd = hourStart + hourMs;
      
      const hourChecks = recentChecks.filter(c => 
        c.timestamp >= hourStart && c.timestamp < hourEnd
      );
      
      hourlyData[i] = {
        hour: i,
        total: hourChecks.length,
        enabled: hourChecks.filter(c => c.result === true).length,
        disabled: hourChecks.filter(c => c.result === false).length,
      };
    }
    
    return Object.values(hourlyData);
  }

  // Get flag A/B test results
  async getFlagABTestResults(flagId, timeRange = 7 * 24 * 60 * 60 * 1000) {
    const checks = this.featureFlagManager.analytics.get(flagId) || [];
    const now = Date.now();
    const startTime = now - timeRange;
    
    const recentChecks = checks.filter(c => c.timestamp >= startTime);
    
    const enabledChecks = recentChecks.filter(c => c.result === true);
    const disabledChecks = recentChecks.filter(c => c.result === false);
    
    // Calculate conversion rates (would need actual conversion data)
    const enabledConversionRate = 0; // Would be calculated from actual data
    const disabledConversionRate = 0; // Would be calculated from actual data
    
    return {
      enabledGroup: {
        size: enabledChecks.length,
        conversionRate: enabledConversionRate,
      },
      disabledGroup: {
        size: disabledChecks.length,
        conversionRate: disabledConversionRate,
      },
      statisticalSignificance: 0, // Would be calculated
      confidenceLevel: 0, // Would be calculated
    };
  }
}

export const featureFlagAnalytics = new FeatureFlagAnalytics();

// 7. FEATURE FLAG MIDDLEWARE
export class FeatureFlagMiddleware {
  constructor() {
    this.featureFlagManager = featureFlagManager;
  }

  // Middleware for Express
  middleware() {
    return async (req, res, next) => {
      req.featureFlags = {
        check: (key, context = {}) => this.featureFlagManager.checkFeatureFlag(
          key, 
          req.user?.id, 
          { ...context, ...req.body, ...req.query }
        ),
        getValue: (key, context = {}) => this.featureFlagManager.getFeatureFlagValue(
          key, 
          req.user?.id, 
          { ...context, ...req.body, ...req.query }
        ),
      };
      
      next();
    };
  }

  // Middleware for React Native
  getReactNativeMiddleware() {
    return {
      check: (key, context = {}) => this.featureFlagManager.checkFeatureFlag(
        key, 
        null, 
        context
      ),
      getValue: (key, context = {}) => this.featureFlagManager.getFeatureFlagValue(
        key, 
        null, 
        context
      ),
    };
  }
}

export const featureFlagMiddleware = new FeatureFlagMiddleware();

export default {
  featureFlagManager,
  featureFlagHooks,
  FeatureFlagValidation,
  featureFlagAnalytics,
  featureFlagMiddleware,
  FEATURE_FLAG_TYPES,
  FEATURE_FLAG_STATUS,
};
