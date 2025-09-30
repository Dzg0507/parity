// ADVANCED PERFORMANCE OPTIMIZATION UTILITIES
// This is going to make the app FLY! 🚀

import { Platform } from 'react-native';

// 1. MEMOIZATION UTILITIES
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// 2. DEBOUNCING FOR SEARCH AND INPUT
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 3. THROTTLING FOR SCROLL EVENTS
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 4. IMAGE OPTIMIZATION
export const optimizeImage = (uri, width = 300, quality = 80) => {
  if (Platform.OS === 'web') {
    return uri; // Web doesn't need optimization
  }
  
  // For React Native, you'd use react-native-image-resizer
  // This is a placeholder for the actual implementation
  return {
    uri,
    width,
    height: width * 0.75, // 4:3 aspect ratio
    quality,
  };
};

// 5. CACHING SYSTEM
class AdvancedCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  set(key, value, ttl = 300000) { // 5 minutes default TTL
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.accessOrder.shift();
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
    this.accessOrder.push(key);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      const index = this.accessOrder.indexOf(key);
      if (index > -1) this.accessOrder.splice(index, 1);
      return null;
    }

    // Move to end (most recently used)
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(key);
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  size() {
    return this.cache.size;
  }
}

export const cache = new AdvancedCache();

// 6. API RESPONSE CACHING
export const cachedApiCall = async (apiCall, cacheKey, ttl = 300000) => {
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = await apiCall();
    cache.set(cacheKey, result, ttl);
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// 7. LAZY LOADING UTILITIES
export const lazyLoad = (importFunction) => {
  let component = null;
  let promise = null;

  return () => {
    if (component) return component;
    if (promise) return promise;

    promise = importFunction().then(module => {
      component = module.default;
      return component;
    });

    return promise;
  };
};

// 8. PERFORMANCE MONITORING
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
  }

  start(label) {
    this.startTimes.set(label, performance.now());
  }

  end(label) {
    const startTime = this.startTimes.get(label);
    if (!startTime) return null;

    const duration = performance.now() - startTime;
    this.metrics.set(label, duration);
    this.startTimes.delete(label);
    
    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  clear() {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

export const perfMonitor = new PerformanceMonitor();

// 9. BATCH PROCESSING
export const batchProcess = (items, processor, batchSize = 10) => {
  return new Promise((resolve) => {
    const results = [];
    let index = 0;

    const processBatch = () => {
      const batch = items.slice(index, index + batchSize);
      if (batch.length === 0) {
        resolve(results);
        return;
      }

      const batchResults = batch.map(processor);
      results.push(...batchResults);
      index += batchSize;

      // Use setTimeout to prevent blocking the main thread
      setTimeout(processBatch, 0);
    };

    processBatch();
  });
};

// 10. MEMORY MANAGEMENT
export const cleanupMemory = () => {
  // Clear caches
  cache.clear();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  console.log('Memory cleanup completed');
};

// 11. NETWORK OPTIMIZATION
export const optimizeNetworkRequest = (url, options = {}) => {
  const optimizedOptions = {
    ...options,
    headers: {
      'Accept-Encoding': 'gzip, deflate',
      'Cache-Control': 'max-age=300', // 5 minutes
      ...options.headers,
    },
  };

  // Add compression for large requests
  if (options.body && JSON.stringify(options.body).length > 1000) {
    optimizedOptions.headers['Content-Encoding'] = 'gzip';
  }

  return { url, options: optimizedOptions };
};

// 12. RENDER OPTIMIZATION
export const shouldRender = (prevProps, nextProps, keys = []) => {
  if (keys.length === 0) {
    return JSON.stringify(prevProps) !== JSON.stringify(nextProps);
  }

  return keys.some(key => prevProps[key] !== nextProps[key]);
};

// 13. ANIMATION OPTIMIZATION
export const optimizedAnimation = (value, config) => {
  return {
    ...config,
    useNativeDriver: true, // Always use native driver when possible
    ...(Platform.OS === 'android' && {
      // Android-specific optimizations
      duration: config.duration * 0.8, // Slightly faster on Android
    }),
  };
};

// 14. BUNDLE SIZE OPTIMIZATION
export const conditionalImport = (condition, importFunction) => {
  if (condition) {
    return importFunction();
  }
  return Promise.resolve(null);
};

// 15. PERFORMANCE BUDGET
export const PERFORMANCE_BUDGET = {
  API_RESPONSE_TIME: 2000, // 2 seconds
  ANIMATION_DURATION: 300, // 300ms
  RENDER_TIME: 16, // 16ms (60fps)
  MEMORY_LIMIT: 50 * 1024 * 1024, // 50MB
};

export const checkPerformanceBudget = (metric, value) => {
  const budget = PERFORMANCE_BUDGET[metric];
  if (!budget) return true;
  
  const withinBudget = value <= budget;
  if (!withinBudget) {
    console.warn(`Performance budget exceeded: ${metric} (${value}ms > ${budget}ms)`);
  }
  
  return withinBudget;
};

// 16. SMART PRELOADING
export const preloadData = async (dataLoader, priority = 'low') => {
  const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 500;
  
  setTimeout(async () => {
    try {
      await dataLoader();
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  }, delay);
};

// 17. ADAPTIVE LOADING
export const getAdaptiveConfig = () => {
  const isLowEnd = Platform.OS === 'android' && Platform.Version < 26;
  const isSlowConnection = navigator?.connection?.effectiveType === 'slow-2g' || 
                          navigator?.connection?.effectiveType === '2g';
  
  return {
    enableAnimations: !isLowEnd,
    enableComplexUI: !isLowEnd,
    enablePreloading: !isSlowConnection,
    batchSize: isLowEnd ? 5 : 10,
    cacheSize: isLowEnd ? 50 : 100,
  };
};

export default {
  memoize,
  debounce,
  throttle,
  optimizeImage,
  cache,
  cachedApiCall,
  lazyLoad,
  PerformanceMonitor,
  perfMonitor,
  batchProcess,
  cleanupMemory,
  optimizeNetworkRequest,
  shouldRender,
  optimizedAnimation,
  conditionalImport,
  PERFORMANCE_BUDGET,
  checkPerformanceBudget,
  preloadData,
  getAdaptiveConfig,
};
