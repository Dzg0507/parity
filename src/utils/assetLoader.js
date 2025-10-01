// Asset loader utility for React Native/Expo
import { Asset } from 'expo-asset';

export const loadFBXModel = async (modelPath) => {
  try {
    console.log('Loading FBX model from:', modelPath);
    
    // For FBX files, we'll use a direct path approach
    // Since require() doesn't work with FBX in React Native
    const localUri = modelPath;
    console.log('FBX model path:', localUri);
    
    return localUri;
  } catch (error) {
    console.error('Failed to load FBX asset:', error);
    throw new Error(`Failed to load 3D model: ${error.message}`);
  }
};

// Helper to get the correct path for FBX files
export const getFBXPath = (filename) => {
  console.log('🔍 getFBXPath called with:', filename);
  
  // For web, use the public folder - much simpler!
  const modelPaths = {
    'Walking1.fbx': '/models/Walking1.fbx'
  };
  
  const modelPath = modelPaths[filename];
  console.log('🔍 Model path for', filename, ':', modelPath);
  
  if (modelPath) {
    return modelPath;
  }
  
  console.warn(`❌ Could not find FBX file: ${filename}`);
  return null;
};

// Preload FBX models for better performance
export const preloadFBXModels = async () => {
  const models = [
    'Walking1.fbx'
  ];
  
  const preloadedModels = {};
  
  for (const model of models) {
    try {
      const asset = Asset.fromModule(getFBXPath(model));
      await asset.downloadAsync();
      preloadedModels[model] = asset.localUri || asset.uri;
    } catch (error) {
      console.warn(`Failed to preload model ${model}:`, error);
    }
  }
  
  return preloadedModels;
};
