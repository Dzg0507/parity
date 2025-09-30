// MONITORING AND OBSERVABILITY SYSTEM
// This is going to make the app FULLY OBSERVABLE! 📊

import { storage } from './storage';
import { logger } from './logging';

// 1. METRICS TYPES
export const METRICS_TYPES = {
  COUNTER: 'counter',
  GAUGE: 'gauge',
  HISTOGRAM: 'histogram',
  SUMMARY: 'summary',
};

// 2. METRICS MANAGER
export class MetricsManager {
  constructor() {
    this.metrics = new Map();
    this.collectors = new Map();
    this.exporters = [];
  }

  // Create metric
  createMetric(name, type, help = '', labels = []) {
    const metric = {
      name,
      type,
      help,
      labels,
      values: new Map(),
      createdAt: Date.now(),
    };

    this.metrics.set(name, metric);
    return metric;
  }

  // Increment counter
  incrementCounter(name, value = 1, labels = {}) {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== METRICS_TYPES.COUNTER) {
      throw new Error(`Counter metric ${name} not found`);
    }

    const key = this.getMetricKey(labels);
    const currentValue = metric.values.get(key) || 0;
    metric.values.set(key, currentValue + value);
  }

  // Set gauge
  setGauge(name, value, labels = {}) {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== METRICS_TYPES.GAUGE) {
      throw new Error(`Gauge metric ${name} not found`);
    }

    const key = this.getMetricKey(labels);
    metric.values.set(key, value);
  }

  // Observe histogram
  observeHistogram(name, value, labels = {}) {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== METRICS_TYPES.HISTOGRAM) {
      throw new Error(`Histogram metric ${name} not found`);
    }

    const key = this.getMetricKey(labels);
    if (!metric.values.has(key)) {
      metric.values.set(key, {
        count: 0,
        sum: 0,
        buckets: new Map(),
      });
    }

    const histogram = metric.values.get(key);
    histogram.count++;
    histogram.sum += value;

    // Update buckets
    for (const [bucket, threshold] of Object.entries(metric.buckets || {})) {
      if (value <= threshold) {
        histogram.buckets.set(bucket, (histogram.buckets.get(bucket) || 0) + 1);
      }
    }
  }

  // Observe summary
  observeSummary(name, value, labels = {}) {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== METRICS_TYPES.SUMMARY) {
      throw new Error(`Summary metric ${name} not found`);
    }

    const key = this.getMetricKey(labels);
    if (!metric.values.has(key)) {
      metric.values.set(key, {
        count: 0,
        sum: 0,
        quantiles: new Map(),
      });
    }

    const summary = metric.values.get(key);
    summary.count++;
    summary.sum += value;

    // Update quantiles
    for (const [quantile, threshold] of Object.entries(metric.quantiles || {})) {
      if (value <= threshold) {
        summary.quantiles.set(quantile, (summary.quantiles.get(quantile) || 0) + 1);
      }
    }
  }

  // Get metric key
  getMetricKey(labels) {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
  }

  // Get metric value
  getMetricValue(name, labels = {}) {
    const metric = this.metrics.get(name);
    if (!metric) return null;

    const key = this.getMetricKey(labels);
    return metric.values.get(key);
  }

  // Get all metrics
  getAllMetrics() {
    return Array.from(this.metrics.values());
  }

  // Clear metric
  clearMetric(name) {
    this.metrics.delete(name);
  }

  // Clear all metrics
  clearAllMetrics() {
    this.metrics.clear();
  }
}

export const metricsManager = new MetricsManager();

// 3. PERFORMANCE MONITORING
export class PerformanceMonitoring {
  constructor() {
    this.metricsManager = metricsManager;
    this.performanceEntries = [];
    this.observers = new Map();
  }

  // Initialize performance monitoring
  initializePerformanceMonitoring() {
    // Monitor navigation timing
    this.observeNavigationTiming();
    
    // Monitor resource timing
    this.observeResourceTiming();
    
    // Monitor user timing
    this.observeUserTiming();
    
    // Monitor long tasks
    this.observeLongTasks();
    
    // Monitor memory usage
    this.observeMemoryUsage();
  }

  // Observe navigation timing
  observeNavigationTiming() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.recordNavigationMetrics(navigation);
      }
    });
  }

  // Record navigation metrics
  recordNavigationMetrics(navigation) {
    const metrics = {
      'page_load_time': navigation.loadEventEnd - navigation.loadEventStart,
      'dom_content_loaded': navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      'first_paint': navigation.loadEventEnd - navigation.navigationStart,
      'dns_lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
      'tcp_connection': navigation.connectEnd - navigation.connectStart,
      'ssl_handshake': navigation.secureConnectionStart ? navigation.connectEnd - navigation.secureConnectionStart : 0,
      'request_time': navigation.responseEnd - navigation.requestStart,
      'response_time': navigation.responseEnd - navigation.responseStart,
    };

    for (const [name, value] of Object.entries(metrics)) {
      this.metricsManager.observeHistogram(name, value);
    }
  }

  // Observe resource timing
  observeResourceTiming() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordResourceMetrics(entry);
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  // Record resource metrics
  recordResourceMetrics(entry) {
    const metrics = {
      'resource_load_time': entry.duration,
      'resource_size': entry.transferSize || 0,
      'resource_dns': entry.domainLookupEnd - entry.domainLookupStart,
      'resource_tcp': entry.connectEnd - entry.connectStart,
      'resource_request': entry.responseEnd - entry.requestStart,
    };

    for (const [name, value] of Object.entries(metrics)) {
      this.metricsManager.observeHistogram(name, value, {
        resource_type: entry.initiatorType,
        resource_name: entry.name,
      });
    }
  }

  // Observe user timing
  observeUserTiming() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordUserTimingMetrics(entry);
      }
    });

    observer.observe({ entryTypes: ['measure', 'mark'] });
    this.observers.set('user_timing', observer);
  }

  // Record user timing metrics
  recordUserTimingMetrics(entry) {
    if (entry.entryType === 'measure') {
      this.metricsManager.observeHistogram('user_timing_measure', entry.duration, {
        measure_name: entry.name,
      });
    } else if (entry.entryType === 'mark') {
      this.metricsManager.observeHistogram('user_timing_mark', 0, {
        mark_name: entry.name,
      });
    }
  }

  // Observe long tasks
  observeLongTasks() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordLongTaskMetrics(entry);
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    this.observers.set('longtask', observer);
  }

  // Record long task metrics
  recordLongTaskMetrics(entry) {
    this.metricsManager.observeHistogram('long_task_duration', entry.duration);
    this.metricsManager.incrementCounter('long_task_count');
  }

  // Observe memory usage
  observeMemoryUsage() {
    if (typeof window === 'undefined' || !window.performance.memory) return;

    setInterval(() => {
      const memory = window.performance.memory;
      this.metricsManager.setGauge('memory_used', memory.usedJSHeapSize);
      this.metricsManager.setGauge('memory_total', memory.totalJSHeapSize);
      this.metricsManager.setGauge('memory_limit', memory.jsHeapSizeLimit);
    }, 5000);
  }

  // Start timing
  startTiming(name) {
    if (typeof window === 'undefined') return;
    performance.mark(`${name}_start`);
  }

  // End timing
  endTiming(name) {
    if (typeof window === 'undefined') return;
    performance.mark(`${name}_end`);
    performance.measure(name, `${name}_start`, `${name}_end`);
  }

  // Get performance summary
  getPerformanceSummary() {
    const metrics = this.metricsManager.getAllMetrics();
    const summary = {};

    for (const metric of metrics) {
      if (metric.type === METRICS_TYPES.HISTOGRAM) {
        summary[metric.name] = this.calculateHistogramSummary(metric);
      } else if (metric.type === METRICS_TYPES.GAUGE) {
        summary[metric.name] = this.calculateGaugeSummary(metric);
      } else if (metric.type === METRICS_TYPES.COUNTER) {
        summary[metric.name] = this.calculateCounterSummary(metric);
      }
    }

    return summary;
  }

  // Calculate histogram summary
  calculateHistogramSummary(metric) {
    const values = Array.from(metric.values.values());
    if (values.length === 0) return { count: 0, sum: 0, average: 0 };

    const totalCount = values.reduce((sum, val) => sum + val.count, 0);
    const totalSum = values.reduce((sum, val) => sum + val.sum, 0);

    return {
      count: totalCount,
      sum: totalSum,
      average: totalCount > 0 ? totalSum / totalCount : 0,
    };
  }

  // Calculate gauge summary
  calculateGaugeSummary(metric) {
    const values = Array.from(metric.values.values());
    if (values.length === 0) return { count: 0, min: 0, max: 0, average: 0 };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    return {
      count: values.length,
      min,
      max,
      average,
    };
  }

  // Calculate counter summary
  calculateCounterSummary(metric) {
    const values = Array.from(metric.values.values());
    const total = values.reduce((sum, val) => sum + val, 0);

    return {
      count: values.length,
      total,
    };
  }
}

export const performanceMonitoring = new PerformanceMonitoring();

// 4. ERROR MONITORING
export class ErrorMonitoring {
  constructor() {
    this.metricsManager = metricsManager;
    this.errorCount = 0;
    this.errorTypes = new Map();
  }

  // Initialize error monitoring
  initializeErrorMonitoring() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.recordError(event.error, {
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(event.reason, {
        type: 'promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
      });
    });
  }

  // Record error
  recordError(error, context = {}) {
    this.errorCount++;
    
    const errorType = error?.name || 'Unknown';
    this.errorTypes.set(errorType, (this.errorTypes.get(errorType) || 0) + 1);

    // Record metrics
    this.metricsManager.incrementCounter('error_count', 1, {
      type: errorType,
      ...context,
    });

    // Log error
    logger.error('Error occurred', 'ERROR_MONITORING', {
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      context,
    });
  }

  // Get error summary
  getErrorSummary() {
    return {
      totalErrors: this.errorCount,
      errorTypes: Object.fromEntries(this.errorTypes),
    };
  }
}

export const errorMonitoring = new ErrorMonitoring();

// 5. USER MONITORING
export class UserMonitoring {
  constructor() {
    this.metricsManager = metricsManager;
    this.userSessions = new Map();
    this.currentSession = null;
  }

  // Initialize user monitoring
  initializeUserMonitoring() {
    this.startSession();
    this.trackUserInteractions();
    this.trackUserNavigation();
  }

  // Start session
  startSession() {
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: 0,
      interactions: 0,
      errors: 0,
    };

    this.userSessions.set(this.currentSession.id, this.currentSession);
    this.metricsManager.incrementCounter('user_sessions');
  }

  // Track user interactions
  trackUserInteractions() {
    if (typeof window === 'undefined') return;

    const events = ['click', 'scroll', 'keydown', 'mousemove'];
    
    events.forEach(eventType => {
      window.addEventListener(eventType, () => {
        if (this.currentSession) {
          this.currentSession.interactions++;
          this.metricsManager.incrementCounter('user_interactions', 1, {
            type: eventType,
          });
        }
      });
    });
  }

  // Track user navigation
  trackUserNavigation() {
    if (typeof window === 'undefined') return;

    window.addEventListener('popstate', () => {
      this.trackPageView();
    });

    // Track initial page view
    this.trackPageView();
  }

  // Track page view
  trackPageView() {
    if (this.currentSession) {
      this.currentSession.pageViews++;
      this.metricsManager.incrementCounter('page_views', 1, {
        url: window.location.pathname,
      });
    }
  }

  // Generate session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get user summary
  getUserSummary() {
    const sessions = Array.from(this.userSessions.values());
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;

    const recentSessions = sessions.filter(s => (now - s.startTime) < oneHour);
    const dailySessions = sessions.filter(s => (now - s.startTime) < oneDay);

    return {
      totalSessions: sessions.length,
      recentSessions: recentSessions.length,
      dailySessions: dailySessions.length,
      averageSessionDuration: this.calculateAverageSessionDuration(sessions),
      averagePageViews: this.calculateAveragePageViews(sessions),
      averageInteractions: this.calculateAverageInteractions(sessions),
    };
  }

  // Calculate average session duration
  calculateAverageSessionDuration(sessions) {
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, session) => {
      const duration = session.endTime ? session.endTime - session.startTime : Date.now() - session.startTime;
      return sum + duration;
    }, 0);
    
    return totalDuration / sessions.length;
  }

  // Calculate average page views
  calculateAveragePageViews(sessions) {
    if (sessions.length === 0) return 0;
    
    const totalPageViews = sessions.reduce((sum, session) => sum + session.pageViews, 0);
    return totalPageViews / sessions.length;
  }

  // Calculate average interactions
  calculateAverageInteractions(sessions) {
    if (sessions.length === 0) return 0;
    
    const totalInteractions = sessions.reduce((sum, session) => sum + session.interactions, 0);
    return totalInteractions / sessions.length;
  }
}

export const userMonitoring = new UserMonitoring();

// 6. MONITORING DASHBOARD
export class MonitoringDashboard {
  constructor() {
    this.metricsManager = metricsManager;
    this.performanceMonitoring = performanceMonitoring;
    this.errorMonitoring = errorMonitoring;
    this.userMonitoring = userMonitoring;
  }

  // Get dashboard data
  getDashboardData() {
    return {
      performance: this.performanceMonitoring.getPerformanceSummary(),
      errors: this.errorMonitoring.getErrorSummary(),
      users: this.userMonitoring.getUserSummary(),
      metrics: this.metricsManager.getAllMetrics(),
      timestamp: Date.now(),
    };
  }

  // Get real-time metrics
  getRealTimeMetrics() {
    const metrics = this.metricsManager.getAllMetrics();
    const realTime = {};

    for (const metric of metrics) {
      if (metric.type === METRICS_TYPES.COUNTER) {
        realTime[metric.name] = this.getCounterValue(metric);
      } else if (metric.type === METRICS_TYPES.GAUGE) {
        realTime[metric.name] = this.getGaugeValue(metric);
      }
    }

    return realTime;
  }

  // Get counter value
  getCounterValue(metric) {
    const values = Array.from(metric.values.values());
    return values.reduce((sum, val) => sum + val, 0);
  }

  // Get gauge value
  getGaugeValue(metric) {
    const values = Array.from(metric.values.values());
    return values.length > 0 ? values[values.length - 1] : 0;
  }

  // Export metrics
  exportMetrics(format = 'json') {
    const data = this.getDashboardData();
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.exportToCSV(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  // Export to CSV
  exportToCSV(data) {
    const rows = [];
    
    // Performance metrics
    for (const [name, value] of Object.entries(data.performance)) {
      rows.push(['performance', name, value.average || value.total || 0]);
    }
    
    // Error metrics
    for (const [name, value] of Object.entries(data.errors)) {
      rows.push(['error', name, value]);
    }
    
    // User metrics
    for (const [name, value] of Object.entries(data.users)) {
      rows.push(['user', name, value]);
    }
    
    return rows.map(row => row.join(',')).join('\n');
  }
}

export const monitoringDashboard = new MonitoringDashboard();

// 7. MONITORING MANAGER
export class MonitoringManager {
  constructor() {
    this.metricsManager = metricsManager;
    this.performanceMonitoring = performanceMonitoring;
    this.errorMonitoring = errorMonitoring;
    this.userMonitoring = userMonitoring;
    this.dashboard = monitoringDashboard;
  }

  // Initialize monitoring
  initializeMonitoring() {
    this.performanceMonitoring.initializePerformanceMonitoring();
    this.errorMonitoring.initializeErrorMonitoring();
    this.userMonitoring.initializeUserMonitoring();
    
    // Create default metrics
    this.createDefaultMetrics();
  }

  // Create default metrics
  createDefaultMetrics() {
    // Performance metrics
    this.metricsManager.createMetric('page_load_time', METRICS_TYPES.HISTOGRAM, 'Page load time in milliseconds');
    this.metricsManager.createMetric('resource_load_time', METRICS_TYPES.HISTOGRAM, 'Resource load time in milliseconds');
    this.metricsManager.createMetric('user_timing_measure', METRICS_TYPES.HISTOGRAM, 'User timing measurements');
    
    // Error metrics
    this.metricsManager.createMetric('error_count', METRICS_TYPES.COUNTER, 'Total number of errors');
    
    // User metrics
    this.metricsManager.createMetric('user_sessions', METRICS_TYPES.COUNTER, 'Total number of user sessions');
    this.metricsManager.createMetric('page_views', METRICS_TYPES.COUNTER, 'Total number of page views');
    this.metricsManager.createMetric('user_interactions', METRICS_TYPES.COUNTER, 'Total number of user interactions');
    
    // Memory metrics
    this.metricsManager.createMetric('memory_used', METRICS_TYPES.GAUGE, 'Used JavaScript heap size');
    this.metricsManager.createMetric('memory_total', METRICS_TYPES.GAUGE, 'Total JavaScript heap size');
    this.metricsManager.createMetric('memory_limit', METRICS_TYPES.GAUGE, 'JavaScript heap size limit');
  }

  // Get monitoring status
  getMonitoringStatus() {
    return {
      initialized: true,
      metricsCount: this.metricsManager.getAllMetrics().length,
      performanceMonitoring: true,
      errorMonitoring: true,
      userMonitoring: true,
    };
  }
}

export const monitoringManager = new MonitoringManager();

export default {
  metricsManager,
  performanceMonitoring,
  errorMonitoring,
  userMonitoring,
  monitoringDashboard,
  monitoringManager,
  METRICS_TYPES,
};
