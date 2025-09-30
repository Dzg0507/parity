// Web-compatible storage utility
import * as SecureStore from 'expo-secure-store';

// Web fallback storage using localStorage
const webStorage = {
  getItem: async (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to get item from localStorage:', error);
      return null;
    }
  },
  
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to set item in localStorage:', error);
    }
  },
  
  deleteItem: async (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to delete item from localStorage:', error);
    }
  }
};

// Platform detection
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

// Export platform-appropriate storage
export const storage = isWeb ? webStorage : SecureStore;
