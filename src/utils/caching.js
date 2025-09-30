// CACHING SYSTEM
// This is going to make the app LIGHTNING FAST! 💾

import { storage } from './storage';

// 1. CACHE TYPES
export const CACHE_TYPES = {
  MEMORY: 'memory',
  PERSISTENT: 'persistent',
  INDEXED_DB: 'indexed_db',
  LOCAL_STORAGE: 'local_storage',
  SESSION_STORAGE: 'session_storage',
};

// 2. CACHE STRATEGIES
export const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache_first',
  NETWORK_FIRST: 'network_first',
  CACHE_ONLY: 'cache_only',
  NETWORK_ONLY: 'network_only',
  STALE_WHILE_REVALIDATE: 'stale_while_revalidate',
};

// 3. CACHE MANAGER
export class CacheManager {
  constructor() {
    this.caches = new Map();
    this.strategies = new Map();
    this.ttl = new Map();
    this.maxSize = 1000; // Maximum number of items per cache
  }

  // Create cache
  createCache(name, type = CACHE_TYPES.MEMORY, options = {}) {
    const cache = {
      name,
      type,
      maxSize: options.maxSize || this.maxSize,
      ttl: options.ttl || 0, // Time to live in milliseconds
      strategy: options.strategy || CACHE_STRATEGIES.CACHE_FIRST,
      compression: options.compression || false,
      encryption: options.encryption || false,
    };

    this.caches.set(name, cache);
    return cache;
  }

  // Set cache item
  async set(name, key, value, ttl = null) {
    const cache = this.caches.get(name);
    if (!cache) {
      throw new Error(`Cache ${name} not found`);
    }

    const item = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || cache.ttl,
      hits: 0,
      lastAccessed: Date.now(),
    };

    // Compress if enabled
    if (cache.compression) {
      item.value = await this.compress(item.value);
    }

    // Encrypt if enabled
    if (cache.encryption) {
      item.value = await this.encrypt(item.value);
    }

    // Store based on cache type
    switch (cache.type) {
      case CACHE_TYPES.MEMORY:
        this.setMemoryCache(name, key, item);
        break;
      case CACHE_TYPES.PERSISTENT:
        await this.setPersistentCache(name, key, item);
        break;
      case CACHE_TYPES.INDEXED_DB:
        await this.setIndexedDBCache(name, key, item);
        break;
      case CACHE_TYPES.LOCAL_STORAGE:
        await this.setLocalStorageCache(name, key, item);
        break;
      case CACHE_TYPES.SESSION_STORAGE:
        await this.setSessionStorageCache(name, key, item);
        break;
    }

    // Check cache size
    await this.checkCacheSize(name);
  }

  // Get cache item
  async get(name, key) {
    const cache = this.caches.get(name);
    if (!cache) {
      throw new Error(`Cache ${name} not found`);
    }

    let item;
    
    // Get based on cache type
    switch (cache.type) {
      case CACHE_TYPES.MEMORY:
        item = this.getMemoryCache(name, key);
        break;
      case CACHE_TYPES.PERSISTENT:
        item = await this.getPersistentCache(name, key);
        break;
      case CACHE_TYPES.INDEXED_DB:
        item = await this.getIndexedDBCache(name, key);
        break;
      case CACHE_TYPES.LOCAL_STORAGE:
        item = await this.getLocalStorageCache(name, key);
        break;
      case CACHE_TYPES.SESSION_STORAGE:
        item = await this.getSessionStorageCache(name, key);
        break;
    }

    if (!item) {
      return null;
    }

    // Check if expired
    if (this.isExpired(item)) {
      await this.delete(name, key);
      return null;
    }

    // Update access info
    item.hits++;
    item.lastAccessed = Date.now();

    // Decrypt if enabled
    if (cache.encryption) {
      item.value = await this.decrypt(item.value);
    }

    // Decompress if enabled
    if (cache.compression) {
      item.value = await this.decompress(item.value);
    }

    return item.value;
  }

  // Delete cache item
  async delete(name, key) {
    const cache = this.caches.get(name);
    if (!cache) {
      throw new Error(`Cache ${name} not found`);
    }

    switch (cache.type) {
      case CACHE_TYPES.MEMORY:
        this.deleteMemoryCache(name, key);
        break;
      case CACHE_TYPES.PERSISTENT:
        await this.deletePersistentCache(name, key);
        break;
      case CACHE_TYPES.INDEXED_DB:
        await this.deleteIndexedDBCache(name, key);
        break;
      case CACHE_TYPES.LOCAL_STORAGE:
        await this.deleteLocalStorageCache(name, key);
        break;
      case CACHE_TYPES.SESSION_STORAGE:
        await this.deleteSessionStorageCache(name, key);
        break;
    }
  }

  // Clear cache
  async clear(name) {
    const cache = this.caches.get(name);
    if (!cache) {
      throw new Error(`Cache ${name} not found`);
    }

    switch (cache.type) {
      case CACHE_TYPES.MEMORY:
        this.clearMemoryCache(name);
        break;
      case CACHE_TYPES.PERSISTENT:
        await this.clearPersistentCache(name);
        break;
      case CACHE_TYPES.INDEXED_DB:
        await this.clearIndexedDBCache(name);
        break;
      case CACHE_TYPES.LOCAL_STORAGE:
        await this.clearLocalStorageCache(name);
        break;
      case CACHE_TYPES.SESSION_STORAGE:
        await this.clearSessionStorageCache(name);
        break;
    }
  }

  // Check if item is expired
  isExpired(item) {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }

  // Check cache size
  async checkCacheSize(name) {
    const cache = this.caches.get(name);
    if (!cache) return;

    const size = await this.getCacheSize(name);
    if (size > cache.maxSize) {
      await this.evictOldestItems(name, size - cache.maxSize);
    }
  }

  // Get cache size
  async getCacheSize(name) {
    const cache = this.caches.get(name);
    if (!cache) return 0;

    switch (cache.type) {
      case CACHE_TYPES.MEMORY:
        return this.getMemoryCacheSize(name);
      case CACHE_TYPES.PERSISTENT:
        return await this.getPersistentCacheSize(name);
      case CACHE_TYPES.INDEXED_DB:
        return await this.getIndexedDBCacheSize(name);
      case CACHE_TYPES.LOCAL_STORAGE:
        return await this.getLocalStorageCacheSize(name);
      case CACHE_TYPES.SESSION_STORAGE:
        return await this.getSessionStorageCacheSize(name);
      default:
        return 0;
    }
  }

  // Evict oldest items
  async evictOldestItems(name, count) {
    const cache = this.caches.get(name);
    if (!cache) return;

    const items = await this.getAllCacheItems(name);
    items.sort((a, b) => a.lastAccessed - b.lastAccessed);
    
    for (let i = 0; i < count && i < items.length; i++) {
      await this.delete(name, items[i].key);
    }
  }

  // Get all cache items
  async getAllCacheItems(name) {
    const cache = this.caches.get(name);
    if (!cache) return [];

    switch (cache.type) {
      case CACHE_TYPES.MEMORY:
        return this.getAllMemoryCacheItems(name);
      case CACHE_TYPES.PERSISTENT:
        return await this.getAllPersistentCacheItems(name);
      case CACHE_TYPES.INDEXED_DB:
        return await this.getAllIndexedDBCacheItems(name);
      case CACHE_TYPES.LOCAL_STORAGE:
        return await this.getAllLocalStorageCacheItems(name);
      case CACHE_TYPES.SESSION_STORAGE:
        return await this.getAllSessionStorageCacheItems(name);
      default:
        return [];
    }
  }

  // Memory cache methods
  setMemoryCache(name, key, item) {
    if (!this.caches.has(name)) {
      this.caches.set(name, { items: new Map() });
    }
    this.caches.get(name).items.set(key, item);
  }

  getMemoryCache(name, key) {
    const cache = this.caches.get(name);
    if (!cache || !cache.items) return null;
    return cache.items.get(key);
  }

  deleteMemoryCache(name, key) {
    const cache = this.caches.get(name);
    if (cache && cache.items) {
      cache.items.delete(key);
    }
  }

  clearMemoryCache(name) {
    const cache = this.caches.get(name);
    if (cache && cache.items) {
      cache.items.clear();
    }
  }

  getMemoryCacheSize(name) {
    const cache = this.caches.get(name);
    return cache && cache.items ? cache.items.size : 0;
  }

  getAllMemoryCacheItems(name) {
    const cache = this.caches.get(name);
    if (!cache || !cache.items) return [];
    return Array.from(cache.items.values());
  }

  // Persistent cache methods
  async setPersistentCache(name, key, item) {
    await storage.setItem(`cache_${name}_${key}`, JSON.stringify(item));
  }

  async getPersistentCache(name, key) {
    const stored = await storage.getItem(`cache_${name}_${key}`);
    return stored ? JSON.parse(stored) : null;
  }

  async deletePersistentCache(name, key) {
    await storage.removeItem(`cache_${name}_${key}`);
  }

  async clearPersistentCache(name) {
    const keys = await storage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(`cache_${name}_`));
    for (const key of cacheKeys) {
      await storage.removeItem(key);
    }
  }

  async getPersistentCacheSize(name) {
    const keys = await storage.getAllKeys();
    return keys.filter(key => key.startsWith(`cache_${name}_`)).length;
  }

  async getAllPersistentCacheItems(name) {
    const keys = await storage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(`cache_${name}_`));
    const items = [];
    
    for (const key of cacheKeys) {
      const stored = await storage.getItem(key);
      if (stored) {
        items.push(JSON.parse(stored));
      }
    }
    
    return items;
  }

  // IndexedDB cache methods (placeholder)
  async setIndexedDBCache(name, key, item) {
    // In a real implementation, this would use IndexedDB
    console.log('IndexedDB cache set:', name, key, item);
  }

  async getIndexedDBCache(name, key) {
    // In a real implementation, this would use IndexedDB
    return null;
  }

  async deleteIndexedDBCache(name, key) {
    // In a real implementation, this would use IndexedDB
    console.log('IndexedDB cache delete:', name, key);
  }

  async clearIndexedDBCache(name) {
    // In a real implementation, this would use IndexedDB
    console.log('IndexedDB cache clear:', name);
  }

  async getIndexedDBCacheSize(name) {
    // In a real implementation, this would use IndexedDB
    return 0;
  }

  async getAllIndexedDBCacheItems(name) {
    // In a real implementation, this would use IndexedDB
    return [];
  }

  // Local storage cache methods
  async setLocalStorageCache(name, key, item) {
    localStorage.setItem(`cache_${name}_${key}`, JSON.stringify(item));
  }

  async getLocalStorageCache(name, key) {
    const stored = localStorage.getItem(`cache_${name}_${key}`);
    return stored ? JSON.parse(stored) : null;
  }

  async deleteLocalStorageCache(name, key) {
    localStorage.removeItem(`cache_${name}_${key}`);
  }

  async clearLocalStorageCache(name) {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(`cache_${name}_`));
    for (const key of cacheKeys) {
      localStorage.removeItem(key);
    }
  }

  async getLocalStorageCacheSize(name) {
    const keys = Object.keys(localStorage);
    return keys.filter(key => key.startsWith(`cache_${name}_`)).length;
  }

  async getAllLocalStorageCacheItems(name) {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(`cache_${name}_`));
    const items = [];
    
    for (const key of cacheKeys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        items.push(JSON.parse(stored));
      }
    }
    
    return items;
  }

  // Session storage cache methods
  async setSessionStorageCache(name, key, item) {
    sessionStorage.setItem(`cache_${name}_${key}`, JSON.stringify(item));
  }

  async getSessionStorageCache(name, key) {
    const stored = sessionStorage.getItem(`cache_${name}_${key}`);
    return stored ? JSON.parse(stored) : null;
  }

  async deleteSessionStorageCache(name, key) {
    sessionStorage.removeItem(`cache_${name}_${key}`);
  }

  async clearSessionStorageCache(name) {
    const keys = Object.keys(sessionStorage);
    const cacheKeys = keys.filter(key => key.startsWith(`cache_${name}_`));
    for (const key of cacheKeys) {
      sessionStorage.removeItem(key);
    }
  }

  async getSessionStorageCacheSize(name) {
    const keys = Object.keys(sessionStorage);
    return keys.filter(key => key.startsWith(`cache_${name}_`)).length;
  }

  async getAllSessionStorageCacheItems(name) {
    const keys = Object.keys(sessionStorage);
    const cacheKeys = keys.filter(key => key.startsWith(`cache_${name}_`));
    const items = [];
    
    for (const key of cacheKeys) {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        items.push(JSON.parse(stored));
      }
    }
    
    return items;
  }

  // Compression methods
  async compress(data) {
    // In a real implementation, this would use a compression library
    return data;
  }

  async decompress(data) {
    // In a real implementation, this would use a compression library
    return data;
  }

  // Encryption methods
  async encrypt(data) {
    // In a real implementation, this would use an encryption library
    return data;
  }

  async decrypt(data) {
    // In a real implementation, this would use an encryption library
    return data;
  }

  // Get cache statistics
  async getCacheStatistics(name) {
    const cache = this.caches.get(name);
    if (!cache) return null;

    const items = await this.getAllCacheItems(name);
    const now = Date.now();
    
    const statistics = {
      name,
      type: cache.type,
      totalItems: items.length,
      maxSize: cache.maxSize,
      hitRate: 0,
      averageAge: 0,
      oldestItem: null,
      newestItem: null,
      expiredItems: 0,
    };

    if (items.length > 0) {
      const totalHits = items.reduce((sum, item) => sum + item.hits, 0);
      statistics.hitRate = totalHits / items.length;
      
      const totalAge = items.reduce((sum, item) => sum + (now - item.timestamp), 0);
      statistics.averageAge = totalAge / items.length;
      
      const sortedByAge = items.sort((a, b) => a.timestamp - b.timestamp);
      statistics.oldestItem = sortedByAge[0];
      statistics.newestItem = sortedByAge[sortedByAge.length - 1];
      
      statistics.expiredItems = items.filter(item => this.isExpired(item)).length;
    }

    return statistics;
  }
}

export const cacheManager = new CacheManager();

// 4. CACHE STRATEGY MANAGER
export class CacheStrategyManager {
  constructor() {
    this.cacheManager = cacheManager;
  }

  // Cache first strategy
  async cacheFirst(cacheName, key, fetchFunction, ttl = null) {
    // Try to get from cache first
    let value = await this.cacheManager.get(cacheName, key);
    
    if (value !== null) {
      return value;
    }
    
    // If not in cache, fetch from source
    value = await fetchFunction();
    
    // Store in cache
    await this.cacheManager.set(cacheName, key, value, ttl);
    
    return value;
  }

  // Network first strategy
  async networkFirst(cacheName, key, fetchFunction, ttl = null) {
    try {
      // Try to fetch from network first
      const value = await fetchFunction();
      
      // Store in cache
      await this.cacheManager.set(cacheName, key, value, ttl);
      
      return value;
    } catch (error) {
      // If network fails, try cache
      const value = await this.cacheManager.get(cacheName, key);
      
      if (value !== null) {
        return value;
      }
      
      throw error;
    }
  }

  // Cache only strategy
  async cacheOnly(cacheName, key) {
    return await this.cacheManager.get(cacheName, key);
  }

  // Network only strategy
  async networkOnly(fetchFunction) {
    return await fetchFunction();
  }

  // Stale while revalidate strategy
  async staleWhileRevalidate(cacheName, key, fetchFunction, ttl = null) {
    // Get from cache immediately
    const cachedValue = await this.cacheManager.get(cacheName, key);
    
    // Fetch fresh data in background
    fetchFunction().then(async (freshValue) => {
      await this.cacheManager.set(cacheName, key, freshValue, ttl);
    }).catch(error => {
      console.error('Background fetch failed:', error);
    });
    
    return cachedValue;
  }
}

export const cacheStrategyManager = new CacheStrategyManager();

// 5. CACHE PRELOADER
export class CachePreloader {
  constructor() {
    this.cacheManager = cacheManager;
    this.preloadQueue = [];
    this.isPreloading = false;
  }

  // Add to preload queue
  addToPreloadQueue(cacheName, key, fetchFunction, priority = 'normal') {
    this.preloadQueue.push({
      cacheName,
      key,
      fetchFunction,
      priority,
      addedAt: Date.now(),
    });
  }

  // Start preloading
  async startPreloading() {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    
    // Sort by priority
    this.preloadQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    // Process queue
    while (this.preloadQueue.length > 0) {
      const item = this.preloadQueue.shift();
      
      try {
        // Check if already in cache
        const cached = await this.cacheManager.get(item.cacheName, item.key);
        if (cached === null) {
          // Fetch and cache
          const value = await item.fetchFunction();
          await this.cacheManager.set(item.cacheName, item.key, value);
        }
      } catch (error) {
        console.error('Preload failed:', error);
      }
    }
    
    this.isPreloading = false;
  }

  // Clear preload queue
  clearPreloadQueue() {
    this.preloadQueue = [];
  }
}

export const cachePreloader = new CachePreloader();

export default {
  cacheManager,
  cacheStrategyManager,
  cachePreloader,
  CACHE_TYPES,
  CACHE_STRATEGIES,
};
