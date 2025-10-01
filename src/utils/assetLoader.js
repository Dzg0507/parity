// Asset loader utility for React Native/Expo
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

export const loadFBXModel = async (modelPath) => {
  try {
    console.log('Loading FBX model from:', modelPath);
    
    if (Platform.OS === 'web') {
      // For web, use direct path
      return modelPath;
    } else {
      // For React Native, use Asset API
      const asset = Asset.fromModule(modelPath);
      await asset.downloadAsync();
      return asset.localUri || asset.uri;
    }
  } catch (error) {
    console.error('Failed to load FBX asset:', error);
    throw new Error(`Failed to load 3D model: ${error.message}`);
  }
};

// Helper to get the correct path for FBX files
export const getFBXPath = (filename) => {
  console.log('🔍 getFBXPath called with:', filename);
  
  if (Platform.OS === 'web') {
    // For web, use the public folder
    const modelPaths = {
      'Walking1.fbx': '/models/Walking1.fbx'
    };
    
    const modelPath = modelPaths[filename];
    console.log('🔍 Web model path for', filename, ':', modelPath);
    return modelPath;
  } else {
    // For React Native, use require() with asset
    const modelPaths = {
      'Walking1.fbx': require('../../../assets/models/Walking1.fbx')
    };
    
    const modelPath = modelPaths[filename];
    console.log('🔍 RN model path for', filename, ':', modelPath);
    return modelPath;
  }
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
