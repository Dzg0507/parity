// LOGGING SYSTEM
// This is going to make the app FULLY OBSERVABLE! 📝

import { storage } from './storage';

// 1. LOG LEVELS
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
};

// 2. LOG CATEGORIES
export const LOG_CATEGORIES = {
  AUTH: 'auth',
  API: 'api',
  UI: 'ui',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  BUSINESS: 'business',
  SYSTEM: 'system',
};

// 3. LOGGER
export class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 10000;
    this.level = LOG_LEVELS.INFO;
    this.categories = new Set(Object.values(LOG_CATEGORIES));
    this.transports = [];
    this.filters = [];
    this.formatters = [];
  }

  // Set log level
  setLevel(level) {
    this.level = level;
  }

  // Add transport
  addTransport(transport) {
    this.transports.push(transport);
  }

  // Add filter
  addFilter(filter) {
    this.filters.push(filter);
  }

  // Add formatter
  addFormatter(formatter) {
    this.formatters.push(formatter);
  }

  // Log message
  log(level, message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
    const logEntry = {
      id: this.generateLogId(),
      level,
      message,
      category,
      data,
      timestamp: Date.now(),
      stack: this.getStack(),
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
    };

    // Apply filters
    if (!this.shouldLog(logEntry)) {
      return;
    }

    // Apply formatters
    const formattedEntry = this.formatLogEntry(logEntry);

    // Store log
    this.storeLog(formattedEntry);

    // Send to transports
    this.sendToTransports(formattedEntry);

    // Console output
    this.consoleOutput(formattedEntry);
  }

  // Error log
  error(message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
    this.log(LOG_LEVELS.ERROR, message, category, data);
  }

  // Warn log
  warn(message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
    this.log(LOG_LEVELS.WARN, message, category, data);
  }

  // Info log
  info(message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
    this.log(LOG_LEVELS.INFO, message, category, data);
  }

  // Debug log
  debug(message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
    this.log(LOG_LEVELS.DEBUG, message, category, data);
  }

  // Trace log
  trace(message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
    this.log(LOG_LEVELS.TRACE, message, category, data);
  }

  // Check if should log
  shouldLog(logEntry) {
    // Check level
    const levelOrder = {
      [LOG_LEVELS.ERROR]: 5,
      [LOG_LEVELS.WARN]: 4,
      [LOG_LEVELS.INFO]: 3,
      [LOG_LEVELS.DEBUG]: 2,
      [LOG_LEVELS.TRACE]: 1,
    };

    if (levelOrder[logEntry.level] > levelOrder[this.level]) {
      return false;
    }

    // Check category
    if (!this.categories.has(logEntry.category)) {
      return false;
    }

    // Apply filters
    for (const filter of this.filters) {
      if (!filter(logEntry)) {
        return false;
      }
    }

    return true;
  }

  // Format log entry
  formatLogEntry(logEntry) {
    let formatted = { ...logEntry };

    for (const formatter of this.formatters) {
      formatted = formatter(formatted);
    }

    return formatted;
  }

  // Store log
  storeLog(logEntry) {
    this.logs.push(logEntry);

    // Keep only max logs
    if (this.logs.length > this.maxLogs) {
      this.logs.splice(0, this.logs.length - this.maxLogs);
    }
  }

  // Send to transports
  sendToTransports(logEntry) {
    for (const transport of this.transports) {
      try {
        transport.send(logEntry);
      } catch (error) {
        console.error('Transport error:', error);
      }
    }
  }

  // Console output
  consoleOutput(logEntry) {
    const { level, message, category, data, timestamp } = logEntry;
    const time = new Date(timestamp).toISOString();
    const prefix = `[${time}] [${level.toUpperCase()}] [${category}]`;

    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(prefix, message, data);
        break;
      case LOG_LEVELS.WARN:
        console.warn(prefix, message, data);
        break;
      case LOG_LEVELS.INFO:
        console.info(prefix, message, data);
        break;
      case LOG_LEVELS.DEBUG:
        console.debug(prefix, message, data);
        break;
      case LOG_LEVELS.TRACE:
        console.trace(prefix, message, data);
        break;
    }
  }

  // Generate log ID
  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get stack trace
  getStack() {
    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(2) : [];
  }

  // Get current user ID
  getCurrentUserId() {
    // In a real implementation, this would get the actual user ID
    return 'anonymous';
  }

  // Get current session ID
  getCurrentSessionId() {
    // In a real implementation, this would get the actual session ID
    return 'session_' + Date.now();
  }

  // Get logs
  getLogs(filters = {}) {
    let filteredLogs = [...this.logs];

    if (filters.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category);
    }

    if (filters.startTime) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startTime);
    }

    if (filters.endTime) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endTime);
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters.sessionId) {
      filteredLogs = filteredLogs.filter(log => log.sessionId === filters.sessionId);
    }

    return filteredLogs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Get log statistics
  getLogStatistics() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byCategory: {},
      byUser: {},
      bySession: {},
      errors: 0,
      warnings: 0,
      info: 0,
      debug: 0,
      trace: 0,
    };

    for (const log of this.logs) {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats[log.level]++;

      // Count by category
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;

      // Count by user
      stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;

      // Count by session
      stats.bySession[log.sessionId] = (stats.bySession[log.sessionId] || 0) + 1;
    }

    return stats;
  }
}

export const logger = new Logger();

// 4. LOG TRANSPORTS
export class ConsoleTransport {
  send(logEntry) {
    console.log('Console Transport:', logEntry);
  }
}

export class LocalStorageTransport {
  async send(logEntry) {
    const logs = await storage.getItem('app_logs') || [];
    logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    await storage.setItem('app_logs', logs);
  }
}

export class RemoteTransport {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.queue = [];
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds
    this.startFlushTimer();
  }

  send(logEntry) {
    this.queue.push(logEntry);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const logs = [...this.queue];
    this.queue = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });
    } catch (error) {
      console.error('Remote transport error:', error);
      // Re-queue logs on failure
      this.queue.unshift(...logs);
    }
  }

  startFlushTimer() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
}

// 5. LOG FILTERS
export class LogFilters {
  // Level filter
  static levelFilter(minLevel) {
    const levelOrder = {
      [LOG_LEVELS.ERROR]: 5,
      [LOG_LEVELS.WARN]: 4,
      [LOG_LEVELS.INFO]: 3,
      [LOG_LEVELS.DEBUG]: 2,
      [LOG_LEVELS.TRACE]: 1,
    };

    return (logEntry) => {
      return levelOrder[logEntry.level] >= levelOrder[minLevel];
    };
  }

  // Category filter
  static categoryFilter(categories) {
    return (logEntry) => {
      return categories.includes(logEntry.category);
    };
  }

  // User filter
  static userFilter(userIds) {
    return (logEntry) => {
      return userIds.includes(logEntry.userId);
    };
  }

  // Time range filter
  static timeRangeFilter(startTime, endTime) {
    return (logEntry) => {
      return logEntry.timestamp >= startTime && logEntry.timestamp <= endTime;
    };
  }

  // Message pattern filter
  static messagePatternFilter(pattern) {
    return (logEntry) => {
      return new RegExp(pattern).test(logEntry.message);
    };
  }
}

// 6. LOG FORMATTERS
export class LogFormatters {
  // Timestamp formatter
  static timestampFormatter(logEntry) {
    return {
      ...logEntry,
      timestamp: new Date(logEntry.timestamp).toISOString(),
    };
  }

  // Pretty formatter
  static prettyFormatter(logEntry) {
    return {
      ...logEntry,
      formatted: `[${new Date(logEntry.timestamp).toISOString()}] [${logEntry.level.toUpperCase()}] [${logEntry.category}] ${logEntry.message}`,
    };
  }

  // JSON formatter
  static jsonFormatter(logEntry) {
    return {
      ...logEntry,
      formatted: JSON.stringify(logEntry),
    };
  }

  // Compact formatter
  static compactFormatter(logEntry) {
    return {
      ...logEntry,
      formatted: `${logEntry.level}: ${logEntry.message}`,
    };
  }
}

// 7. LOG ANALYZER
export class LogAnalyzer {
  constructor() {
    this.logger = logger;
  }

  // Analyze error patterns
  analyzeErrorPatterns() {
    const errors = this.logger.getLogs({ level: LOG_LEVELS.ERROR });
    const patterns = {};

    for (const error of errors) {
      const message = error.message;
      const pattern = this.extractPattern(message);
      
      if (!patterns[pattern]) {
        patterns[pattern] = {
          pattern,
          count: 0,
          firstOccurrence: error.timestamp,
          lastOccurrence: error.timestamp,
          examples: [],
        };
      }

      patterns[pattern].count++;
      patterns[pattern].lastOccurrence = error.timestamp;
      
      if (patterns[pattern].examples.length < 5) {
        patterns[pattern].examples.push({
          message: error.message,
          timestamp: error.timestamp,
          data: error.data,
        });
      }
    }

    return patterns;
  }

  // Extract pattern from message
  extractPattern(message) {
    // Simple pattern extraction - in a real implementation, this would be more sophisticated
    return message.replace(/\d+/g, 'N').replace(/[a-f0-9-]{8,}/g, 'UUID');
  }

  // Analyze performance
  analyzePerformance() {
    const performanceLogs = this.logger.getLogs({ category: LOG_CATEGORIES.PERFORMANCE });
    const metrics = {
      total: performanceLogs.length,
      average: 0,
      min: Infinity,
      max: -Infinity,
      percentiles: {},
    };

    if (performanceLogs.length === 0) {
      return metrics;
    }

    const values = performanceLogs.map(log => log.data.duration || 0);
    values.sort((a, b) => a - b);

    metrics.average = values.reduce((sum, val) => sum + val, 0) / values.length;
    metrics.min = values[0];
    metrics.max = values[values.length - 1];

    // Calculate percentiles
    metrics.percentiles = {
      p50: values[Math.floor(values.length * 0.5)],
      p90: values[Math.floor(values.length * 0.9)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
    };

    return metrics;
  }

  // Analyze user behavior
  analyzeUserBehavior() {
    const userLogs = this.logger.getLogs({ category: LOG_CATEGORIES.BUSINESS });
    const behavior = {
      totalActions: userLogs.length,
      uniqueUsers: new Set(userLogs.map(log => log.userId)).size,
      actionsByUser: {},
      actionsByHour: {},
      actionsByDay: {},
    };

    for (const log of userLogs) {
      // Actions by user
      if (!behavior.actionsByUser[log.userId]) {
        behavior.actionsByUser[log.userId] = 0;
      }
      behavior.actionsByUser[log.userId]++;

      // Actions by hour
      const hour = new Date(log.timestamp).getHours();
      behavior.actionsByHour[hour] = (behavior.actionsByHour[hour] || 0) + 1;

      // Actions by day
      const day = new Date(log.timestamp).toDateString();
      behavior.actionsByDay[day] = (behavior.actionsByDay[day] || 0) + 1;
    }

    return behavior;
  }

  // Generate report
  generateReport() {
    const errorPatterns = this.analyzeErrorPatterns();
    const performance = this.analyzePerformance();
    const userBehavior = this.analyzeUserBehavior();
    const statistics = this.logger.getLogStatistics();

    return {
      timestamp: new Date().toISOString(),
      statistics,
      errorPatterns,
      performance,
      userBehavior,
      recommendations: this.generateRecommendations(errorPatterns, performance, userBehavior),
    };
  }

  // Generate recommendations
  generateRecommendations(errorPatterns, performance, userBehavior) {
    const recommendations = [];

    // Error recommendations
    const topErrors = Object.values(errorPatterns)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    for (const error of topErrors) {
      if (error.count > 10) {
        recommendations.push({
          type: 'error',
          priority: 'high',
          message: `Fix recurring error: ${error.pattern} (${error.count} occurrences)`,
        });
      }
    }

    // Performance recommendations
    if (performance.average > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `Average response time is ${performance.average.toFixed(2)}ms, consider optimization`,
      });
    }

    if (performance.percentiles.p95 > 5000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `95th percentile response time is ${performance.percentiles.p95}ms, critical optimization needed`,
      });
    }

    // User behavior recommendations
    const activeUsers = Object.values(userBehavior.actionsByUser).filter(count => count > 10).length;
    if (activeUsers < userBehavior.uniqueUsers * 0.1) {
      recommendations.push({
        type: 'engagement',
        priority: 'low',
        message: 'Low user engagement, consider improving user experience',
      });
    }

    return recommendations;
  }
}

export const logAnalyzer = new LogAnalyzer();

// 8. LOG MANAGER
export class LogManager {
  constructor() {
    this.logger = logger;
    this.analyzer = logAnalyzer;
  }

  // Initialize logging
  initializeLogging() {
    // Add default transports
    this.logger.addTransport(new ConsoleTransport());
    this.logger.addTransport(new LocalStorageTransport());

    // Add default formatters
    this.logger.addFormatter(LogFormatters.timestampFormatter);
    this.logger.addFormatter(LogFormatters.prettyFormatter);

    // Add default filters
    this.logger.addFilter(LogFilters.levelFilter(LOG_LEVELS.INFO));
  }

  // Get logs with pagination
  getLogs(page = 1, pageSize = 50, filters = {}) {
    const allLogs = this.logger.getLogs(filters);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      logs: allLogs.slice(startIndex, endIndex),
      total: allLogs.length,
      page,
      pageSize,
      totalPages: Math.ceil(allLogs.length / pageSize),
    };
  }

  // Export logs
  exportLogs(format = 'json', filters = {}) {
    const logs = this.logger.getLogs(filters);
    
    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);
      case 'csv':
        return this.exportToCSV(logs);
      case 'txt':
        return this.exportToText(logs);
      default:
        return JSON.stringify(logs, null, 2);
    }
  }

  // Export to CSV
  exportToCSV(logs) {
    if (logs.length === 0) return '';
    
    const headers = ['timestamp', 'level', 'category', 'message', 'userId', 'sessionId'];
    const csvRows = [headers.join(',')];
    
    for (const log of logs) {
      const row = headers.map(header => {
        const value = log[header] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
  }

  // Export to text
  exportToText(logs) {
    return logs.map(log => {
      const time = new Date(log.timestamp).toISOString();
      return `[${time}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}`;
    }).join('\n');
  }

  // Clear old logs
  clearOldLogs(olderThanDays = 7) {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const logs = this.logger.getLogs();
    const filteredLogs = logs.filter(log => log.timestamp > cutoffTime);
    
    this.logger.logs = filteredLogs;
  }
}

export const logManager = new LogManager();

export default {
  logger,
  logManager,
  logAnalyzer,
  LogFilters,
  LogFormatters,
  ConsoleTransport,
  LocalStorageTransport,
  RemoteTransport,
  LOG_LEVELS,
  LOG_CATEGORIES,
};
