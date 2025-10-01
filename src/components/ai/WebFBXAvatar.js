import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getFBXPath } from '../../utils/assetLoader';

// Web-only FBX Avatar using regular Three.js (like the test file)
const WebFBXAvatar = ({ 
  size = 100,
  text = "Hello! I'm your AI communication coach.",
  onPress = null,
  style = {},
  modelPath = 'Walking1.fbx',
  enableRotation = false,
  rotationSpeed = 0.01,
  onLoad = null,
  onError = null
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationIdRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(null);
  const actionRef = useRef(null);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false); // Start idle
  const [isLooping, setIsLooping] = useState(false); // Start with no looping
  const [walkingDirection, setWalkingDirection] = useState(0); // 0 = forward, 90 = right, 180 = back, 270 = left
  const [isIdle, setIsIdle] = useState(true); // Track idle state
  const [isWalking, setIsWalking] = useState(false); // Track walking state
  const bonesRef = useRef({}); // Store bone references for manual control
  const walkIntervalRef = useRef(null); // Store walking interval

  useEffect(() => {
    console.log('WebFBXAvatar component mounted');
    
    // Add keyboard event listeners for WASD movement
    const handleKeyDown = (event) => {
      switch(event.key.toLowerCase()) {
        case 'w':
          // Start walking forward if not already walking
          if (!isWalking) {
            startContinuousWalking();
          }
          break;
        case 'a':
          // Turn left and start walking if not already
          if (!isWalking) {
            startContinuousWalking();
          }
          turnLeft();
          break;
        case 's':
          // Turn around and start walking if not already
          if (!isWalking) {
            startContinuousWalking();
          }
          turnAround();
          break;
        case 'd':
          // Turn right and start walking if not already
          if (!isWalking) {
            startContinuousWalking();
          }
          turnRight();
          break;
        case ' ':
          // Spacebar to stop walking
          event.preventDefault();
          stopContinuousWalking();
          break;
      }
    };
    
    // Add keyboard event listeners
    window.addEventListener('keydown', handleKeyDown);
    
    // Add keyup listener to stop walking when keys are released
    const handleKeyUp = (event) => {
      switch(event.key.toLowerCase()) {
        case 'w':
        case 'a':
        case 's':
        case 'd':
          // Stop walking when movement keys are released
          if (isWalking) {
            stopContinuousWalking();
          }
          break;
      }
    };
    
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (walkIntervalRef.current) {
        clearInterval(walkIntervalRef.current);
      }
      if (rendererRef.current && rendererRef.current.domElement && containerRef.current) {
        try {
          if (containerRef.current.contains(rendererRef.current.domElement)) {
            containerRef.current.removeChild(rendererRef.current.domElement);
          }
        } catch (error) {
          console.warn('Error removing renderer DOM element:', error);
        }
      }
      // Remove keyboard event listeners
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isWalking]);

  const handleLoad = () => {
    console.log('WebFBXAvatar: handleLoad called');
    setIsLoading(false);
    setHasLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = (error) => {
    console.log('WebFBXAvatar: handleError called', error);
    setIsLoading(false);
    console.error('Avatar loading error:', error);
    if (onError) {
      onError(error);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  // ========================================
  // ANIMATION CONTROL FUNCTIONS
  // ========================================
  
  // Set animation speed (0.5 = half speed, 2.0 = double speed, etc.)
  const setSpeed = (speed) => {
    setAnimationSpeed(speed);
    if (actionRef.current) {
      actionRef.current.setEffectiveTimeScale(speed);
    }
  };

  // Start playing the animation
  const playAnimation = () => {
    setIsPlaying(true);
    setIsIdle(false);
    if (actionRef.current) {
      console.log('🎬 Playing animation...');
      console.log('Animation action:', actionRef.current);
      console.log('Animation mixer:', mixerRef.current);
      actionRef.current.play();
      console.log('🚶‍♂️ Started walking animation');
    } else {
      console.log('❌ No animation action available');
    }
  };

  // Pause the animation (can be resumed with play)
  const pauseAnimation = () => {
    setIsPlaying(false);
    setIsIdle(true);
    if (actionRef.current) {
      actionRef.current.paused = true;
    }
    // Set idle pose when pausing
    setIdlePose();
    console.log('⏸️ Animation paused - set to idle pose');
  };

  // Stop the animation completely (resets to beginning)
  const stopAnimation = () => {
    setIsPlaying(false);
    setIsIdle(true);
    if (actionRef.current) {
      actionRef.current.stop();
    }
    // Set idle pose when stopping
    setIdlePose();
    console.log('🛑 Animation stopped - set to idle pose');
  };

  // Reset animation to the beginning (doesn't change play state)
  const resetAnimation = () => {
    if (actionRef.current) {
      actionRef.current.reset();
    }
  };

  // ========================================
  // WALKING AND TURNING CONTROLS
  // ========================================
  
  // Toggle between looping and continuous walking
  const toggleLooping = () => {
    setIsLooping(!isLooping);
    if (actionRef.current) {
      actionRef.current.loop = isLooping ? THREE.LoopOnce : THREE.LoopRepeat;
      console.log(`🔄 Looping ${isLooping ? 'disabled' : 'enabled'}`);
    }
  };

  // Turn the avatar to face a specific direction
  const turnTo = (direction) => {
    setWalkingDirection(direction);
    if (sceneRef.current) {
      const avatar = sceneRef.current.getObjectByName('avatar') || sceneRef.current.children.find(child => child.type === 'Group');
      if (avatar) {
        avatar.rotation.y = (direction * Math.PI) / 180; // Convert degrees to radians
        console.log(`🔄 Turned to ${direction} degrees`);
      }
    }
  };

  // Turn left (90 degrees counter-clockwise)
  const turnLeft = () => {
    const newDirection = (walkingDirection - 90 + 360) % 360;
    turnTo(newDirection);
  };

  // Turn right (90 degrees clockwise)
  const turnRight = () => {
    const newDirection = (walkingDirection + 90) % 360;
    turnTo(newDirection);
  };

  // Turn around (180 degrees)
  const turnAround = () => {
    const newDirection = (walkingDirection + 180) % 360;
    turnTo(newDirection);
  };

  // Move the avatar forward in the current direction
  const moveForward = (distance = 1) => {
    if (sceneRef.current) {
      const avatar = sceneRef.current.getObjectByName('avatar') || sceneRef.current.children.find(child => child.type === 'Group');
      if (avatar) {
        const radians = (walkingDirection * Math.PI) / 180;
        avatar.position.x += Math.sin(radians) * distance;
        avatar.position.z += Math.cos(radians) * distance;
        
        // Update camera to follow the avatar
        if (cameraRef.current) {
          cameraRef.current.position.x = avatar.position.x;
          cameraRef.current.position.z = avatar.position.z + 20; // Keep camera behind avatar
          cameraRef.current.lookAt(avatar.position);
        }
        
        console.log(`🚶‍♂️ Moved forward ${distance} units. Position: (${avatar.position.x.toFixed(2)}, ${avatar.position.y.toFixed(2)}, ${avatar.position.z.toFixed(2)})`);
      }
    }
  };

  // ========================================
  // CONTINUOUS WALKING SYSTEM
  // ========================================
  
  // Start continuous walking
  const startContinuousWalking = () => {
    if (isWalking) return; // Already walking
    
    setIsWalking(true);
    setIsIdle(false);
    setIsPlaying(true);
    
    // Start the walking animation with proper looping
    if (actionRef.current) {
      actionRef.current.loop = THREE.LoopRepeat; // Loop the animation
      actionRef.current.timeScale = 1.0; // Normal speed
      actionRef.current.play();
    }
    
    // Start moving forward continuously with smaller steps
    walkIntervalRef.current = setInterval(() => {
      moveForward(0.1); // Smaller steps to prevent disappearing
    }, 150); // Move every 150ms for smoother movement
    
    console.log('🚶‍♂️ Started continuous walking - will move across screen');
  };

  // Stop continuous walking
  const stopContinuousWalking = () => {
    if (!isWalking) return; // Not walking
    
    setIsWalking(false);
    setIsIdle(true);
    setIsPlaying(false);
    
    // Stop the walking animation
    if (actionRef.current) {
      actionRef.current.stop();
    }
    
    // Stop moving forward
    if (walkIntervalRef.current) {
      clearInterval(walkIntervalRef.current);
      walkIntervalRef.current = null;
    }
    
    // Set idle pose
    setIdlePose();
    
    console.log('🛑 Stopped continuous walking');
  };

  // Toggle continuous walking
  const toggleContinuousWalking = () => {
    if (isWalking) {
      stopContinuousWalking();
    } else {
      startContinuousWalking();
    }
  };

  // Reset avatar position to center
  const resetPosition = () => {
    if (sceneRef.current) {
      const avatar = sceneRef.current.getObjectByName('avatar') || sceneRef.current.children.find(child => child.type === 'Group');
      if (avatar) {
        avatar.position.set(0, 0, 0);
        
        // Reset camera position as well
        if (cameraRef.current) {
          cameraRef.current.position.set(0, 20, 30);
          cameraRef.current.lookAt(0, 0, 0);
        }
        
        console.log('🔄 Reset avatar and camera position to center');
      }
    }
  };

  // ========================================
  // IDLE POSE CONTROL
  // ========================================
  
  // Set idle pose with arms at sides
  const setIdlePose = () => {
    if (bonesRef.current.leftArm && bonesRef.current.rightArm) {
      // Arms at sides (slight bend at elbow)
      bonesRef.current.leftArm.rotation.x = 0.2;  // Slight forward bend
      bonesRef.current.leftArm.rotation.z = 0.1;  // Slight outward
      bonesRef.current.rightArm.rotation.x = 0.2; // Slight forward bend
      bonesRef.current.rightArm.rotation.z = -0.1; // Slight outward
      
      console.log('🛑 Set idle pose - arms at sides');
    } else {
      console.log('⚠️ Arm bones not found - cannot set idle pose');
      console.log('Available bones:', Object.keys(bonesRef.current));
    }
  };

  // Find and store bone references
  const findBones = (fbx) => {
    console.log('🔍 Searching for bones in FBX model...');
    fbx.traverse((object) => {
      if (object.isSkinnedMesh) {
        const skeleton = object.skeleton;
        console.log('🔍 Available bones:', skeleton.bones.map(b => b.name));
        
        // Try multiple naming conventions for arm bones
        const leftArmNames = [
          'mixamorigLeftArm', 'mixamorig:LeftArm', 'LeftArm',
          'LeftShoulder', 'mixamorigLeftShoulder', 'mixamorig:LeftShoulder',
          'LeftUpperArm', 'mixamorigLeftUpperArm', 'mixamorig:LeftUpperArm'
        ];
        
        const rightArmNames = [
          'mixamorigRightArm', 'mixamorig:RightArm', 'RightArm',
          'RightShoulder', 'mixamorigRightShoulder', 'mixamorig:RightShoulder',
          'RightUpperArm', 'mixamorigRightUpperArm', 'mixamorig:RightUpperArm'
        ];
        
        // Find left arm bone
        for (const name of leftArmNames) {
          const bone = skeleton.getBoneByName(name);
          if (bone) {
            bonesRef.current.leftArm = bone;
            console.log(`✅ Found left arm bone: ${name}`);
            break;
          }
        }
        
        // Find right arm bone
        for (const name of rightArmNames) {
          const bone = skeleton.getBoneByName(name);
          if (bone) {
            bonesRef.current.rightArm = bone;
            console.log(`✅ Found right arm bone: ${name}`);
            break;
          }
        }
        
        console.log('🦴 Bone search results:', {
          leftArm: !!bonesRef.current.leftArm,
          rightArm: !!bonesRef.current.rightArm,
          totalBones: skeleton.bones.length
        });
      }
    });
  };

  // ========================================
  // EXPOSE CONTROLS GLOBALLY
  // ========================================
  // Makes animation controls available in browser console
  // Usage: window.avatarAnimation.setSpeed(0.5)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.avatarAnimation = {
        // Animation controls
        setSpeed,           // Change animation speed (0.5 = half, 2.0 = double)
        play: playAnimation,    // Start playing animation
        pause: pauseAnimation,  // Pause animation (can resume)
        stop: stopAnimation,    // Stop animation completely
        reset: resetAnimation,  // Reset to beginning
        getSpeed: () => animationSpeed,  // Get current speed
        isPlaying: () => isPlaying,       // Check if currently playing
        
        // Walking and turning controls
        toggleLooping,      // Toggle between looping and continuous walking
        turnTo,             // Turn to specific direction (0-360 degrees)
        turnLeft,           // Turn left 90 degrees
        turnRight,          // Turn right 90 degrees
        turnAround,         // Turn around 180 degrees
        moveForward,        // Move forward in current direction
        setIdlePose,        // Set idle pose with arms at sides
        
        // Continuous walking controls
        startContinuousWalking,  // Start continuous walking
        stopContinuousWalking,   // Stop continuous walking
        toggleContinuousWalking, // Toggle continuous walking
        resetPosition,           // Reset avatar position to center
        
        getDirection: () => walkingDirection,  // Get current facing direction
        isLooping: () => isLooping,           // Check if currently looping
        isIdle: () => isIdle,                 // Check if currently idle
        isWalking: () => isWalking            // Check if currently walking
      };
    }
  }, [animationSpeed, isPlaying]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Three.js dynamically
    const loadThreeJS = async () => {
      try {
        // Load Three.js core
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });

        // Load fflate (required for FBXLoader)
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/fflate@0.8.0/umd/index.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });

        // Load FBX Loader
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });

        initThreeJS();
      } catch (error) {
        console.error('Failed to load Three.js:', error);
        handleError(error);
      }
    };

    loadThreeJS();
  }, []);

  const initThreeJS = () => {
    console.log('🎯 Initializing Three.js scene...');
    
    // Create scene (exactly like test file)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1f2937);
    sceneRef.current = scene;

    // Create camera (exactly like test file)
    const camera = new THREE.PerspectiveCamera(75, size / size, 0.1, 1000);
    camera.position.set(0, 20, 30);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;

    // Create renderer (exactly like test file)
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    rendererRef.current = renderer;

    // Add renderer to container
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Add lighting (exactly like test file)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 10, 5);
    scene.add(directionalLight);

    // Create clock (exactly like test file)
    clockRef.current = new THREE.Clock();

    // Load FBX model (exactly like test file)
    loadWalkingFBX(scene, renderer, camera);

    // Start animation loop (exactly like test file)
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const delta = clockRef.current.getDelta();

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      renderer.render(scene, camera);
    };

    animate();
  };

  // Auto-load Walking.fbx from server (exactly like test file)
  const loadWalkingFBX = (scene, renderer, camera) => {
    console.log('🎯 Loading Walking.fbx...');
    
    const modelAsset = getFBXPath(modelPath);
    console.log('🎯 Model asset:', modelAsset);
    
    if (!modelAsset) {
      console.error('❌ No model asset found');
      handleError('No model asset found');
      return;
    }

    const fbxLoader = new THREE.FBXLoader();
    
    fbxLoader.load(modelAsset, (fbx) => {
      loadFBXModel(fbx, 'Walking.fbx', scene);
    }, undefined, (error) => {
      console.error('❌ Error loading Walking.fbx:', error);
      handleError(error);
    });
  };

  // Load FBX model (exactly like test file)
  const loadFBXModel = (fbx, fileName, scene) => {
    console.log('FBX model loaded successfully!');
    
    // Add the loaded model to the scene
    fbx.name = 'avatar'; // Set name for easy finding
    scene.add(fbx);
    
    // Simple positioning (exactly like test file)
    fbx.position.set(0, 0, 0);
    fbx.scale.setScalar(0.1); // Make it MUCH smaller (exactly like test file)
    
    // Center it (exactly like test file)
    const box = new THREE.Box3().setFromObject(fbx);
    const center = box.getCenter(new THREE.Vector3());
    fbx.position.sub(center);
    fbx.position.y = -box.min.y;

    console.log(`FBX Model "${fileName}" loaded successfully.`);

    // FBX animations are handled differently (exactly like test file)
    if (fbx.animations && fbx.animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(fbx);
      
      const clip = fbx.animations[0];
      const action = mixerRef.current.clipAction(clip);
      action.loop = THREE.LoopRepeat; // Loop the animation for continuous walking
      action.timeScale = 1.0; // Normal speed
      // Don't start playing automatically - start idle
      // action.play(); // Commented out to start idle
      
      // Store action reference for control
      actionRef.current = action;
      
      // Find bones for manual control
      findBones(fbx);
      
      // Set initial idle pose
      setTimeout(() => {
        setIdlePose();
      }, 100); // Small delay to ensure bones are loaded
      
      console.log(`Found ${fbx.animations.length} animation(s). Ready to play: "${clip.name || 'Untitled'}".`);
      console.log('🛑 Avatar starts in IDLE state - use Start Walk button for continuous walking');
    } else {
      console.log(`No animations found.`);
    }

    handleLoad();
  };

  if (typeof window === 'undefined') {
    return (
      <View style={[{ width: size, height: size, backgroundColor: '#1f2937', justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ color: 'white' }}>Web only</Text>
      </View>
    );
  }

  return (
    <View style={[{ width: size, height: size }, style]}>
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={0.8}
        style={{ width: '100%', height: '100%' }}
      >
        <div 
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1f2937'
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default WebFBXAvatar;
