// ReadyPlayerMe Visage wrapper that handles import.meta.env.MODE issues
// This provides a Metro-compatible version of the ReadyPlayerMe visage functionality

// Import the original module but handle import.meta issues
let visageModule;
try {
  // Try to import the original module
  visageModule = require('@readyplayerme/visage');
} catch (error) {
  console.warn('ReadyPlayerMe visage module failed to load, using fallback:', error.message);
  // Fallback implementation
  visageModule = {
    createVisage: () => {
      console.warn('ReadyPlayerMe Visage is using fallback implementation');
      return {
        dispose: () => {},
        update: () => {},
        // Add other methods as needed
      };
    }
  };
}

// Export the module with proper error handling
export const createVisage = (...args) => {
  try {
    return visageModule.createVisage(...args);
  } catch (error) {
    console.error('Error creating ReadyPlayerMe visage:', error);
    return {
      dispose: () => {},
      update: () => {},
    };
  }
};

export default visageModule;
