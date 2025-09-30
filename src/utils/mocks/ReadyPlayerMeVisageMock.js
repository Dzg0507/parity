// Mock implementation for @readyplayerme/visage to avoid import.meta.env.MODE issues
// This provides a minimal implementation that won't break the app

export const createVisage = () => {
  console.warn('ReadyPlayerMe Visage is mocked - import.meta issues resolved');
  return {
    // Mock methods that might be called
    dispose: () => {},
    update: () => {},
    // Add other methods as needed
  };
};

export default {
  createVisage,
};
