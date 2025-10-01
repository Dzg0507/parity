// Performance Optimization System for 3D Rendering and App Performance
import { Platform, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Performance monitoring and optimization
class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      frameRate: 60,
      memoryUsage: 0,
      renderTime: 0,
      loadTime: 0
    };
    
    this.optimizationLevel = this.detectOptimalLevel();
    this.isLowEndDevice = this.detectLowEndDevice();
    this.memoryThreshold = this.isLowEndDevice ? 0.7 : 0.8;
    
    this.startMonitoring();
  }

  // Detect device capabilities and set optimization level
  detectOptimalLevel() {
    const deviceInfo = {
      platform: Platform.OS,
      screenSize: screenWidth * screenHeight,
      pixelRatio: Platform.OS === 'web' ? window.devicePixelRatio || 1 : 1
    };

    // Web platform optimization
    if (Platform.OS === 'web') {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        return 'minimal'; // No WebGL support
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
      
      // Detect low-end GPUs
      const lowEndGPUs = ['intel', 'mali', 'adreno 3', 'powervr'];
      const isLowEndGPU = lowEndGPUs.some(gpu => renderer.toLowerCase().includes(gpu));
      
      if (isLowEndGPU || deviceInfo.screenSize < 1000000) {
        return 'low';
      } else if (deviceInfo.screenSize < 2000000) {
        return 'medium';
      } else {
        return 'high';
      }
    }

    // React Native platform optimization
    if (deviceInfo.screenSize < 1000000) {
      return 'low';
    } else if (deviceInfo.screenSize < 2000000) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  // Detect if device is low-end
  detectLowEndDevice() {
    return this.optimizationLevel === 'minimal' || this.optimizationLevel === 'low';
  }

  // Get 3D rendering configuration based on optimization level
  get3DConfig() {
    const configs = {
      minimal: {
        antialias: false,
        shadowMapEnabled: false,
        shadowMapSize: 512,
        maxLights: 2,
        maxTextures: 4,
        geometryDetail: 'low',
        animationQuality: 'low',
        particleCount: 0,
        postProcessing: false
      },
      low: {
        antialias: false,
        shadowMapEnabled: true,
        shadowMapSize: 1024,
        maxLights: 3,
        maxTextures: 8,
        geometryDetail: 'medium',
        animationQuality: 'medium',
        particleCount: 50,
        postProcessing: false
      },
      medium: {
        antialias: true,
        shadowMapEnabled: true,
        shadowMapSize: 2048,
        maxLights: 4,
        maxTextures: 16,
        geometryDetail: 'high',
        animationQuality: 'high',
        particleCount: 100,
        postProcessing: true
      },
      high: {
        antialias: true,
        shadowMapEnabled: true,
        shadowMapSize: 4096,
        maxLights: 6,
        maxTextures: 32,
        geometryDetail: 'ultra',
        animationQuality: 'ultra',
        particleCount: 200,
        postProcessing: true
      }
    };

    return configs[this.optimizationLevel] || configs.medium;
  }

  // Get animation configuration
  getAnimationConfig() {
    const configs = {
      minimal: {
        frameRate: 30,
        interpolationSteps: 10,
        easingQuality: 'low',
        physicsSteps: 1,
        boneUpdateFrequency: 0.5
      },
      low: {
        frameRate: 45,
        interpolationSteps: 20,
        easingQuality: 'medium',
        physicsSteps: 2,
        boneUpdateFrequency: 0.7
      },
      medium: {
        frameRate: 60,
        interpolationSteps: 30,
        easingQuality: 'high',
        physicsSteps: 3,
        boneUpdateFrequency: 1.0
      },
      high: {
        frameRate: 60,
        interpolationSteps: 60,
        easingQuality: 'ultra',
        physicsSteps: 4,
        boneUpdateFrequency: 1.0
      }
    };

    return configs[this.optimizationLevel] || configs.medium;
  }

  // Optimize 3D scene based on performance
  optimizeScene(scene, renderer, camera) {
    const config = this.get3DConfig();
    
    // Configure renderer
    renderer.antialias = config.antialias;
    renderer.shadowMap.enabled = config.shadowMapEnabled;
    renderer.shadowMap.size.width = config.shadowMapSize;
    renderer.shadowMap.size.height = config.shadowMapSize;
    
    // Limit lights
    const lights = scene.children.filter(child => child.isLight);
    if (lights.length > config.maxLights) {
      lights.slice(config.maxLights).forEach(light => {
        scene.remove(light);
      });
    }
    
    // Optimize materials
    scene.traverse((object) => {
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => this.optimizeMaterial(mat, config));
        } else {
          this.optimizeMaterial(object.material, config);
        }
      }
    });
    
    // Optimize geometries
    scene.traverse((object) => {
      if (object.geometry) {
        this.optimizeGeometry(object.geometry, config);
      }
    });
  }

  // Optimize material based on performance level
  optimizeMaterial(material, config) {
    if (this.isLowEndDevice) {
      // Reduce material complexity
      material.shininess = Math.min(material.shininess || 30, 30);
      material.transparent = false;
      material.opacity = 1.0;
      
      // Disable expensive features
      if (material.normalMap) material.normalMap = null;
      if (material.bumpMap) material.bumpMap = null;
      if (material.displacementMap) material.displacementMap = null;
    }
  }

  // Optimize geometry based on performance level
  optimizeGeometry(geometry, config) {
    if (this.isLowEndDevice && geometry.attributes.position) {
      const position = geometry.attributes.position;
      const vertexCount = position.count;
      
      // Reduce vertex count for low-end devices
      if (vertexCount > 10000) {
        const step = Math.ceil(vertexCount / 5000);
        const newCount = Math.floor(vertexCount / step);
        
        // This is a simplified example - in practice, you'd use proper decimation
        console.log(`Reducing geometry from ${vertexCount} to ${newCount} vertices`);
      }
    }
  }

  // Memory management
  manageMemory() {
    if (Platform.OS === 'web') {
      // Web memory management
      if (performance.memory) {
        const memoryInfo = performance.memory;
        const usageRatio = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;
        
        if (usageRatio > this.memoryThreshold) {
          this.triggerGarbageCollection();
        }
      }
    }
  }

  // Trigger garbage collection
  triggerGarbageCollection() {
    if (Platform.OS === 'web') {
      // Force garbage collection in development
      if (window.gc) {
        window.gc();
      }
    }
    
    // Clear caches
    this.clearCaches();
  }

  // Clear various caches
  clearCaches() {
    // Clear texture cache
    if (window.THREE && window.THREE.Cache) {
      window.THREE.Cache.clear();
    }
    
    // Clear any custom caches
    if (this.textureCache) {
      this.textureCache.clear();
    }
  }

  // Start performance monitoring
  startMonitoring() {
    if (Platform.OS === 'web') {
      this.monitorWebPerformance();
    } else {
      this.monitorNativePerformance();
    }
  }

  // Monitor web performance
  monitorWebPerformance() {
    let lastTime = performance.now();
    let frameCount = 0;
    
    const monitor = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      frameCount++;
      
      if (deltaTime >= 1000) {
        this.metrics.frameRate = Math.round((frameCount * 1000) / deltaTime);
        frameCount = 0;
        lastTime = currentTime;
        
        // Check memory usage
        if (performance.memory) {
          this.metrics.memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024); // MB
        }
        
        // Adjust optimization level based on performance
        this.adjustOptimizationLevel();
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }

  // Monitor native performance (simplified)
  monitorNativePerformance() {
    // In React Native, you'd use performance monitoring libraries
    // This is a simplified version
    setInterval(() => {
      this.metrics.frameRate = 60; // Assume 60fps for now
      this.adjustOptimizationLevel();
    }, 1000);
  }

  // Adjust optimization level based on performance
  adjustOptimizationLevel() {
    const { frameRate, memoryUsage } = this.metrics;
    
    if (frameRate < 30 || memoryUsage > 200) {
      if (this.optimizationLevel !== 'minimal') {
        this.optimizationLevel = 'minimal';
        this.onOptimizationChange('minimal');
      }
    } else if (frameRate < 45 || memoryUsage > 150) {
      if (this.optimizationLevel !== 'low') {
        this.optimizationLevel = 'low';
        this.onOptimizationChange('low');
      }
    } else if (frameRate < 55 || memoryUsage > 100) {
      if (this.optimizationLevel !== 'medium') {
        this.optimizationLevel = 'medium';
        this.onOptimizationChange('medium');
      }
    } else {
      if (this.optimizationLevel !== 'high') {
        this.optimizationLevel = 'high';
        this.onOptimizationChange('high');
      }
    }
  }

  // Callback for optimization level changes
  onOptimizationChange(newLevel) {
    console.log(`Performance optimization level changed to: ${newLevel}`);
    
    // Notify components about the change
    if (this.onOptimizationChangeCallback) {
      this.onOptimizationChangeCallback(newLevel);
    }
  }

  // Set callback for optimization changes
  setOptimizationChangeCallback(callback) {
    this.onOptimizationChangeCallback = callback;
  }

  // Get current performance metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Get optimization recommendations
  getOptimizationRecommendations() {
    const { frameRate, memoryUsage } = this.metrics;
    const recommendations = [];
    
    if (frameRate < 30) {
      recommendations.push('Consider reducing 3D model complexity');
      recommendations.push('Disable shadows and post-processing effects');
      recommendations.push('Lower texture resolution');
    }
    
    if (memoryUsage > 150) {
      recommendations.push('Clear unused textures and models');
      recommendations.push('Reduce particle count');
      recommendations.push('Enable texture compression');
    }
    
    if (frameRate < 45 && memoryUsage > 100) {
      recommendations.push('Switch to low-poly models');
      recommendations.push('Disable real-time lighting');
      recommendations.push('Use simpler materials');
    }
    
    return recommendations;
  }

  // Preload and optimize assets
  async preloadAssets(assets) {
    const config = this.get3DConfig();
    const optimizedAssets = [];
    
    for (const asset of assets) {
      try {
        const optimizedAsset = await this.optimizeAsset(asset, config);
        optimizedAssets.push(optimizedAsset);
      } catch (error) {
        console.warn('Failed to optimize asset:', asset, error);
        optimizedAssets.push(asset);
      }
    }
    
    return optimizedAssets;
  }

  // Optimize individual asset
  async optimizeAsset(asset, config) {
    // This would contain asset-specific optimization logic
    // For now, return the asset as-is
    return asset;
  }

  // Cleanup resources
  cleanup() {
    this.clearCaches();
    this.metrics = {
      frameRate: 60,
      memoryUsage: 0,
      renderTime: 0,
      loadTime: 0
    };
  }
}

// Create singleton instance
const performanceOptimizer = new PerformanceOptimizer();

// Export convenience functions
export const get3DConfig = () => performanceOptimizer.get3DConfig();
export const getAnimationConfig = () => performanceOptimizer.getAnimationConfig();
export const optimizeScene = (scene, renderer, camera) => performanceOptimizer.optimizeScene(scene, renderer, camera);
export const getPerformanceMetrics = () => performanceOptimizer.getMetrics();
export const getOptimizationRecommendations = () => performanceOptimizer.getOptimizationRecommendations();
export const preloadAssets = (assets) => performanceOptimizer.preloadAssets(assets);
export const setOptimizationCallback = (callback) => performanceOptimizer.setOptimizationChangeCallback(callback);
export const cleanup = () => performanceOptimizer.cleanup();

export default performanceOptimizer;