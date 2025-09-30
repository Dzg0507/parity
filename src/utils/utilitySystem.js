// UTILITY SYSTEM
// This is going to make the app ULTRA EFFICIENT! 🛠️

// 1. STRING UTILITIES
export class StringUtils {
  // Capitalize first letter
  static capitalize(str) {
    if (typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Capitalize all words
  static capitalizeWords(str) {
    if (typeof str !== 'string') return str;
    return str.split(' ').map(word => this.capitalize(word)).join(' ');
  }

  // Convert to camelCase
  static toCamelCase(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  // Convert to kebab-case
  static toKebabCase(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  // Convert to snake_case
  static toSnakeCase(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }

  // Convert to PascalCase
  static toPascalCase(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/(?:^|[-_])([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  // Truncate string
  static truncate(str, length, suffix = '...') {
    if (typeof str !== 'string') return str;
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  // Remove HTML tags
  static stripHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '');
  }

  // Escape HTML
  static escapeHtml(str) {
    if (typeof str !== 'string') return str;
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return str.replace(/[&<>"']/g, (char) => map[char]);
  }

  // Unescape HTML
  static unescapeHtml(str) {
    if (typeof str !== 'string') return str;
    const map = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
    };
    return str.replace(/&(amp|lt|gt|quot|#39);/g, (match) => map[match]);
  }

  // Generate random string
  static randomString(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  // Generate UUID
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Slugify string
  static slugify(str) {
    if (typeof str !== 'string') return str;
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Check if string is empty
  static isEmpty(str) {
    return !str || str.trim().length === 0;
  }

  // Check if string is not empty
  static isNotEmpty(str) {
    return !this.isEmpty(str);
  }

  // Count words
  static countWords(str) {
    if (typeof str !== 'string') return 0;
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  // Count characters
  static countCharacters(str) {
    if (typeof str !== 'string') return 0;
    return str.length;
  }

  // Reverse string
  static reverse(str) {
    if (typeof str !== 'string') return str;
    return str.split('').reverse().join('');
  }

  // Check if string is palindrome
  static isPalindrome(str) {
    if (typeof str !== 'string') return false;
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === this.reverse(cleaned);
  }
}

// 2. NUMBER UTILITIES
export class NumberUtils {
  // Format number with commas
  static formatNumber(num, decimals = 0) {
    if (typeof num !== 'number') return num;
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Format currency
  static formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    if (typeof amount !== 'number') return amount;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Format percentage
  static formatPercentage(value, decimals = 1) {
    if (typeof value !== 'number') return value;
    return `${(value * 100).toFixed(decimals)}%`;
  }

  // Round to decimal places
  static round(num, decimals = 0) {
    if (typeof num !== 'number') return num;
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  // Clamp number between min and max
  static clamp(num, min, max) {
    if (typeof num !== 'number') return num;
    return Math.min(Math.max(num, min), max);
  }

  // Check if number is even
  static isEven(num) {
    return typeof num === 'number' && num % 2 === 0;
  }

  // Check if number is odd
  static isOdd(num) {
    return typeof num === 'number' && num % 2 !== 0;
  }

  // Check if number is prime
  static isPrime(num) {
    if (typeof num !== 'number' || num < 2) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false;
    }
    
    return true;
  }

  // Generate random number
  static random(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
  }

  // Generate random integer
  static randomInt(min = 0, max = 10) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Calculate percentage
  static percentage(value, total) {
    if (typeof value !== 'number' || typeof total !== 'number' || total === 0) return 0;
    return (value / total) * 100;
  }

  // Calculate average
  static average(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
  }

  // Calculate median
  static median(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  // Calculate mode
  static mode(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    const frequency = {};
    let maxFreq = 0;
    let mode = numbers[0];
    
    for (const num of numbers) {
      frequency[num] = (frequency[num] || 0) + 1;
      if (frequency[num] > maxFreq) {
        maxFreq = frequency[num];
        mode = num;
      }
    }
    
    return mode;
  }

  // Calculate standard deviation
  static standardDeviation(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    const avg = this.average(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
    const avgSquaredDiff = this.average(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
  }
}

// 3. ARRAY UTILITIES
export class ArrayUtils {
  // Remove duplicates
  static unique(arr) {
    if (!Array.isArray(arr)) return arr;
    return [...new Set(arr)];
  }

  // Shuffle array
  static shuffle(arr) {
    if (!Array.isArray(arr)) return arr;
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Chunk array
  static chunk(arr, size) {
    if (!Array.isArray(arr) || size <= 0) return arr;
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  // Flatten array
  static flatten(arr) {
    if (!Array.isArray(arr)) return arr;
    return arr.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
    }, []);
  }

  // Group by key
  static groupBy(arr, key) {
    if (!Array.isArray(arr)) return arr;
    return arr.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  // Sort by key
  static sortBy(arr, key, order = 'asc') {
    if (!Array.isArray(arr)) return arr;
    return [...arr].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (order === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
  }

  // Find intersection
  static intersection(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
    return arr1.filter(item => arr2.includes(item));
  }

  // Find union
  static union(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return arr1 || arr2;
    return [...new Set([...arr1, ...arr2])];
  }

  // Find difference
  static difference(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return arr1 || [];
    return arr1.filter(item => !arr2.includes(item));
  }

  // Sample array
  static sample(arr, count = 1) {
    if (!Array.isArray(arr) || count <= 0) return [];
    const shuffled = this.shuffle(arr);
    return shuffled.slice(0, count);
  }

  // Check if array is empty
  static isEmpty(arr) {
    return !Array.isArray(arr) || arr.length === 0;
  }

  // Check if array is not empty
  static isNotEmpty(arr) {
    return !this.isEmpty(arr);
  }

  // Get last element
  static last(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    return arr[arr.length - 1];
  }

  // Get first element
  static first(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    return arr[0];
  }

  // Remove element
  static remove(arr, element) {
    if (!Array.isArray(arr)) return arr;
    return arr.filter(item => item !== element);
  }

  // Remove element at index
  static removeAt(arr, index) {
    if (!Array.isArray(arr) || index < 0 || index >= arr.length) return arr;
    return arr.filter((_, i) => i !== index);
  }

  // Insert element at index
  static insertAt(arr, index, element) {
    if (!Array.isArray(arr) || index < 0) return arr;
    const result = [...arr];
    result.splice(index, 0, element);
    return result;
  }
}

// 4. OBJECT UTILITIES
export class ObjectUtils {
  // Deep clone object
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  }

  // Deep merge objects
  static deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  // Get nested property
  static get(obj, path, defaultValue = undefined) {
    if (!obj || typeof obj !== 'object') return defaultValue;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || !current.hasOwnProperty(key)) {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current;
  }

  // Set nested property
  static set(obj, path, value) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
    return obj;
  }

  // Check if object is empty
  static isEmpty(obj) {
    if (!obj || typeof obj !== 'object') return true;
    return Object.keys(obj).length === 0;
  }

  // Check if object is not empty
  static isNotEmpty(obj) {
    return !this.isEmpty(obj);
  }

  // Pick properties
  static pick(obj, keys) {
    if (!obj || typeof obj !== 'object') return {};
    const result = {};
    for (const key of keys) {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  // Omit properties
  static omit(obj, keys) {
    if (!obj || typeof obj !== 'object') return {};
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }

  // Check if objects are equal
  static isEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      
      if (keys1.length !== keys2.length) return false;
      
      for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!this.isEqual(obj1[key], obj2[key])) return false;
      }
      
      return true;
    }
    
    return false;
  }

  // Get object size
  static size(obj) {
    if (!obj || typeof obj !== 'object') return 0;
    return Object.keys(obj).length;
  }

  // Invert object
  static invert(obj) {
    if (!obj || typeof obj !== 'object') return {};
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[obj[key]] = key;
      }
    }
    return result;
  }

  // Map object values
  static mapValues(obj, fn) {
    if (!obj || typeof obj !== 'object') return {};
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = fn(obj[key], key);
      }
    }
    return result;
  }

  // Map object keys
  static mapKeys(obj, fn) {
    if (!obj || typeof obj !== 'object') return {};
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[fn(key, obj[key])] = obj[key];
      }
    }
    return result;
  }
}

// 5. DATE UTILITIES
export class DateUtils {
  // Format date
  static format(date, format = 'YYYY-MM-DD') {
    if (!(date instanceof Date)) return date;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  // Parse date
  static parse(dateString, format = 'YYYY-MM-DD') {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  // Add days
  static addDays(date, days) {
    if (!(date instanceof Date)) return date;
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Add months
  static addMonths(date, months) {
    if (!(date instanceof Date)) return date;
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  // Add years
  static addYears(date, years) {
    if (!(date instanceof Date)) return date;
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  // Get difference in days
  static diffInDays(date1, date2) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) return 0;
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get difference in hours
  static diffInHours(date1, date2) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) return 0;
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  // Get difference in minutes
  static diffInMinutes(date1, date2) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) return 0;
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60));
  }

  // Check if date is today
  static isToday(date) {
    if (!(date instanceof Date)) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // Check if date is yesterday
  static isYesterday(date) {
    if (!(date instanceof Date)) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }

  // Check if date is tomorrow
  static isTomorrow(date) {
    if (!(date instanceof Date)) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  }

  // Get start of day
  static startOfDay(date) {
    if (!(date instanceof Date)) return date;
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  // Get end of day
  static endOfDay(date) {
    if (!(date instanceof Date)) return date;
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  // Get start of week
  static startOfWeek(date, startDay = 0) {
    if (!(date instanceof Date)) return date;
    const result = new Date(date);
    const day = result.getDay();
    const diff = day - startDay;
    result.setDate(result.getDate() - diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  // Get end of week
  static endOfWeek(date, startDay = 0) {
    if (!(date instanceof Date)) return date;
    const result = this.startOfWeek(date, startDay);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  // Get start of month
  static startOfMonth(date) {
    if (!(date instanceof Date)) return date;
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  // Get end of month
  static endOfMonth(date) {
    if (!(date instanceof Date)) return date;
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  // Get start of year
  static startOfYear(date) {
    if (!(date instanceof Date)) return date;
    const result = new Date(date);
    result.setMonth(0, 1);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  // Get end of year
  static endOfYear(date) {
    if (!(date instanceof Date)) return date;
    const result = new Date(date);
    result.setMonth(11, 31);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  // Check if date is weekend
  static isWeekend(date) {
    if (!(date instanceof Date)) return false;
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  // Check if date is weekday
  static isWeekday(date) {
    return !this.isWeekend(date);
  }

  // Get relative time string
  static getRelativeTime(date) {
    if (!(date instanceof Date)) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }

  // Check if year is leap year
  static isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  // Get days in month
  static getDaysInMonth(date) {
    if (!(date instanceof Date)) return 0;
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  // Get week number
  static getWeekNumber(date) {
    if (!(date instanceof Date)) return 0;
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}

// 6. FUNCTION UTILITIES
export class FunctionUtils {
  // Debounce function
  static debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  // Throttle function
  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Memoize function
  static memoize(func, keyGenerator = null) {
    const cache = new Map();
    return function memoizedFunction(...args) {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func.apply(this, args);
      cache.set(key, result);
      return result;
    };
  }

  // Retry function
  static async retry(func, maxAttempts = 3, delay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await func();
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    throw lastError;
  }

  // Timeout function
  static timeout(func, ms) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Function timeout'));
      }, ms);
      
      func()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}

// 7. STORAGE UTILITIES
export class StorageUtils {
  // Set item with expiration
  static setItem(key, value, expirationMinutes = null) {
    const item = {
      value,
      timestamp: Date.now(),
      expiration: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : null
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  // Get item with expiration check
  static getItem(key) {
    try {
      const item = JSON.parse(localStorage.getItem(key));
      if (!item) return null;
      
      if (item.expiration && Date.now() > item.expiration) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch {
      return null;
    }
  }

  // Remove item
  static removeItem(key) {
    localStorage.removeItem(key);
  }

  // Clear all items
  static clear() {
    localStorage.clear();
  }

  // Get all keys
  static getKeys() {
    return Object.keys(localStorage);
  }

  // Check if key exists
  static hasKey(key) {
    return localStorage.getItem(key) !== null;
  }

  // Get storage size
  static getSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
}

// 8. URL UTILITIES
export class URLUtils {
  // Parse URL
  static parseURL(url) {
    try {
      const urlObj = new URL(url);
      return {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        searchParams: Object.fromEntries(urlObj.searchParams)
      };
    } catch {
      return null;
    }
  }

  // Build URL
  static buildURL(base, params = {}) {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  // Get query parameter
  static getQueryParam(url, param) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(param);
  }

  // Set query parameter
  static setQueryParam(url, param, value) {
    const urlObj = new URL(url);
    urlObj.searchParams.set(param, value);
    return urlObj.toString();
  }

  // Remove query parameter
  static removeQueryParam(url, param) {
    const urlObj = new URL(url);
    urlObj.searchParams.delete(param);
    return urlObj.toString();
  }

  // Check if URL is valid
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Get domain from URL
  static getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }

  // Get path from URL
  static getPath(url) {
    try {
      return new URL(url).pathname;
    } catch {
      return null;
    }
  }
}

// 9. COLOR UTILITIES
export class ColorUtils {
  // Convert hex to RGB
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Convert RGB to hex
  static rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Convert hex to HSL
  static hexToHsl(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;
    return this.rgbToHsl(rgb.r, rgb.g, rgb.b);
  }

  // Convert RGB to HSL
  static rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  // Generate random color
  static randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  // Lighten color
  static lighten(hex, percent) {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return hex;
    
    hsl.l = Math.min(100, hsl.l + percent);
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  // Darken color
  static darken(hex, percent) {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return hex;
    
    hsl.l = Math.max(0, hsl.l - percent);
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  // Convert HSL to hex
  static hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return this.rgbToHex(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    );
  }
}

// 10. FILE UTILITIES
export class FileUtils {
  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file extension
  static getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  // Get filename without extension
  static getFilenameWithoutExtension(filename) {
    return filename.replace(/\.[^/.]+$/, '');
  }

  // Check if file is image
  static isImage(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = this.getFileExtension(filename).toLowerCase();
    return imageExtensions.includes(extension);
  }

  // Check if file is video
  static isVideo(filename) {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const extension = this.getFileExtension(filename).toLowerCase();
    return videoExtensions.includes(extension);
  }

  // Check if file is audio
  static isAudio(filename) {
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];
    const extension = this.getFileExtension(filename).toLowerCase();
    return audioExtensions.includes(extension);
  }

  // Check if file is document
  static isDocument(filename) {
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    const extension = this.getFileExtension(filename).toLowerCase();
    return documentExtensions.includes(extension);
  }
}

// Default export with all utilities
export default {
  StringUtils,
  NumberUtils,
  ArrayUtils,
  ObjectUtils,
  DateUtils,
  FunctionUtils,
  StorageUtils,
  URLUtils,
  ColorUtils,
  FileUtils,
};
