// Mock implementation for ReactDevToolsSettingsManager
// This is used to prevent Metro bundler errors when React DevTools modules are missing

const ReactDevToolsSettingsManager = {
  // Mock methods that might be called
  get: () => null,
  set: () => {},
  clear: () => {},
  // Add any other methods that might be expected
};

module.exports = ReactDevToolsSettingsManager;
