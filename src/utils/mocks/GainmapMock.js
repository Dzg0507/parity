// Mock implementation for @monogrid/gainmap-js to avoid import.meta.url issues
// This provides a minimal implementation that won't break the app

export const GainMap = {
  // Mock methods that might be called
  dispose: () => {},
  update: () => {},
  // Add other methods as needed
};

export default GainMap;
