import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GLView } from 'expo-gl'; // WebGL context for React Native
import { Renderer } from 'expo-three'; // Three.js renderer for Expo
import * as THREE from 'three'; // 3D graphics library
import { loadFBXModel, getFBXPath } from '../../utils/assetLoader'; // Asset loading utilities

// Real FBX Avatar Component using expo-three directly
const FBXAvatar = ({ 
  size = 100, // Avatar size in pixels (width and height)
  text = "Hello! I'm your AI communication coach.", // Text to display (currently unused)
  onPress = null, // Function called when avatar is pressed
  style = {}, // Additional styles for the container
  modelPath = 'Walking1.fbx', // Path to FBX model file
  enableRotation = false, // Whether to enable rotation animation
  rotationSpeed = 0.01, // Speed of rotation (higher = faster)
  onLoad = null, // Function called when avatar loads successfully
  onError = null // Function called when avatar fails to load
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [hasLoaded, setHasLoaded] = useState(false); // Loaded state
  
  // Refs for 3D objects
  const sceneRef = useRef(null); // Three.js scene reference
  const rendererRef = useRef(null); // Three.js renderer reference
  const cameraRef = useRef(null); // Three.js camera reference
  const animationIdRef = useRef(null); // Animation frame ID for cleanup
  const mixerRef = useRef(null); // Animation mixer for FBX animations
  const clockRef = useRef(new THREE.Clock()); // Clock for animation timing
  
  // Walking movement state
  const [currentTarget, setCurrentTarget] = useState({ x: 2, z: 0 }); // Current target position (closer so doesn't run off screen)
  const [isWalking, setIsWalking] = useState(false); // Whether avatar is currently walking
  const walkSpeed = useRef(0.01); // Speed of walking movement (much slower for visibility)
  
  // Walking animation state
  const walkCycle = useRef(0); // Walking cycle progress (0 to 2π) - using ref for immediate updates
  const walkCycleSpeed = useRef(0.15); // Speed of walking cycle animation (increased for more visible movement)
  
  // Bone references for efficient animation
  const bonesRef = useRef({}); // Use an object to store all bone references
  
  // Track previous walking state for efficient joint reset
  const wasWalkingRef = useRef(false);
  
  // Add event listener for walking trigger
  useEffect(() => {
    const handleStartWalking = () => {
      console.log('🎯 Walking trigger received! Starting walking animation...');
      setIsWalking(true);
    };
    
    window.addEventListener('startWalking', handleStartWalking);
    
    return () => {
      window.removeEventListener('startWalking', handleStartWalking);
    };
  }, []);

  useEffect(() => {
    console.log('FBXAvatar component mounted');
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const handleLoad = () => {
    console.log('FBXAvatar: handleLoad called');
    setIsLoading(false);
    setHasLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = (error) => {
    console.log('FBXAvatar: handleError called', error);
    setIsLoading(false);
    console.error('Avatar loading error:', error);
    if (onError) {
      onError(error);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Make avatar walk to a random position when pressed
      const randomX = (Math.random() - 0.5) * 2; // Random X between -1 and 1
      const randomZ = (Math.random() - 0.5) * 2; // Random Z between -1 and 1
      walkToPosition(randomX, randomZ);
    }
  };

  // Function to make avatar walk to a specific position
  const walkToPosition = (targetX, targetZ) => {
    console.log(`Walking to position: (${targetX}, ${targetZ})`);
    setCurrentTarget({ x: targetX, z: targetZ });
    setIsWalking(false);
  };

  // Optimized function to animate avatar joints for walking - using stored bone references
  const animateWalkingJoints = (cycle) => {
    const { leftUpLeg, rightUpLeg, leftLeg, rightLeg, leftArm, rightArm, leftShoulder, rightShoulder } = bonesRef.current;

    // If bones aren't found yet, do nothing.
    if (!leftUpLeg || !rightUpLeg) {
      if (Math.floor(cycle * 100) % 100 === 0) { // Log occasionally
        console.log('⚠️ Bones not found yet, waiting for model to load...');
      }
      return;
    }

    // --- ADJUSTED ANIMATION VALUES ---
    // Your original values (like 8.0) were huge (1 radian ≈ 57 degrees).
    // These smaller values create a more natural swing.
    const hipSwing = Math.sin(cycle) * 0.4;
    const armSwing = Math.sin(cycle) * 0.5;
    const kneeBend = Math.abs(Math.sin(cycle * 0.5 + Math.PI / 2)) * 0.6;

    // Apply rotations to stored bone references
    if (leftUpLeg) {
      leftUpLeg.rotation.x = hipSwing;
      console.log('🎯 ANIMATING LeftUpLeg!', hipSwing.toFixed(3));
    }
    if (rightUpLeg) {
      rightUpLeg.rotation.x = -hipSwing;
      console.log('🎯 ANIMATING RightUpLeg!', (-hipSwing).toFixed(3));
    }
    
    if (leftLeg) {
      leftLeg.rotation.x = kneeBend;
      console.log('🎯 ANIMATING LeftLeg!', kneeBend.toFixed(3));
    }
    if (rightLeg) {
      rightLeg.rotation.x = kneeBend;
      console.log('🎯 ANIMATING RightLeg!', kneeBend.toFixed(3));
    }

    if (leftArm) {
      leftArm.rotation.x = -armSwing;
      console.log('🎯 ANIMATING LeftArm!', (-armSwing).toFixed(3));
    }
    if (rightArm) {
      rightArm.rotation.x = armSwing;
      console.log('🎯 ANIMATING RightArm!', armSwing.toFixed(3));
    }
  };

  // Function to reset joints to idle position using stored bone references
  const resetJointsToIdle = () => {
    // Iterate over the stored bones and reset their rotation
    for (const boneName in bonesRef.current) {
      const bone = bonesRef.current[boneName];
      if (bone) {
        bone.rotation.set(0, 0, 0);
        console.log(`🔄 Reset ${boneName} to idle position`);
      }
    }
  };

  // Preset walking positions
  const walkToCenter = () => walkToPosition(0, 0);
  const walkToLeft = () => walkToPosition(-1, 0);
  const walkToRight = () => walkToPosition(1, 0);
  const walkToFront = () => walkToPosition(0, -1);
  const walkToBack = () => walkToPosition(0, 1);

  // Function to start walking in place (for testing animation)
  const startWalkingInPlace = () => {
    console.log('Starting walking in place animation');
    setIsWalking(true);
    // Set target to current position so it walks in place
    const currentModel = sceneRef.current?.getObjectByName('avatar');
    if (currentModel) {
      setCurrentTarget({ x: currentModel.position.x, z: currentModel.position.z });
    }
  };

  // Function to test animation mixer (if GLB has built-in animations)
  const testBuiltInAnimations = () => {
    if (mixerRef.current) {
      console.log('Testing built-in GLB animations...');
      // Stop all current animations
      mixerRef.current.stopAllAction();
      // Start first animation if available
      const actions = mixerRef.current._actions;
      if (actions.length > 0) {
        actions[0].reset().play();
        console.log('Playing first available animation');
      }
    } else {
      console.log('No built-in animations found, using manual joint animation');
      startWalkingInPlace();
    }
  };

  // Function to stop walking
  const stopWalking = () => {
    console.log('Stopping walking animation');
    setIsWalking(false);
    const currentModel = sceneRef.current?.getObjectByName('avatar');
    if (currentModel) {
      resetJointsToIdle(currentModel);
    }
  };

  // Expose walking functions (you can call these from outside the component)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.avatarWalkTo = {
        center: walkToCenter,
        left: walkToLeft,
        right: walkToRight,
        front: walkToFront,
        back: walkToBack,
        position: walkToPosition,
        inPlace: startWalkingInPlace,
        stop: stopWalking,
        testAnimations: testBuiltInAnimations
      };
    }
  }, []);

  const onContextCreate = async (gl) => {
    console.log('🎯 WebGL context created - FBXAvatar starting to load');
    
    // Create renderer (handles 3D rendering)
    const renderer = new Renderer({ gl }); // Pass WebGL context
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight); // Set render size
    renderer.setClearColor(0x000000, 0); // Set background color (black, transparent)
    rendererRef.current = renderer;

    // Create scene (container for all 3D objects)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

          // Create camera (defines viewpoint)
    const camera = new THREE.PerspectiveCamera(
            60, // Field of view (degrees) - good balance for full screen view
            gl.drawingBufferWidth / gl.drawingBufferHeight, // Aspect ratio
            0.1, // Near clipping plane (objects closer than this won't render)
            1000 // Far clipping plane (objects further than this won't render)
          );
          camera.position.set(0, 2, 5); // Camera position (x, y, z) - normal viewing distance
          camera.lookAt(0, 0, 0); // Camera looks at center where avatar should be
    cameraRef.current = camera;

    // Add lighting to the scene
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8); // Ambient light (overall brightness)
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Main light (brighter)
    directionalLight.position.set(2, 2, 2); // Light position (x, y, z) - (right, up, back)
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6); // Fill light (brighter)
    fillLight.position.set(-1, -1, -1); // Light position (x, y, z) - (left, down, back)
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.4); // Back light for better visibility
    backLight.position.set(0, 1, -2); // Light position (x, y, z) - (center, up, front)
    scene.add(backLight);

    // Add a ground plane for reference
    const groundGeometry = new THREE.PlaneGeometry(20, 20); // Large ground plane
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x333333, // Dark gray ground
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = -1; // Position below avatar
    ground.name = 'ground';
    scene.add(ground);

    // Add a grid for reference
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -0.99; // Slightly above ground
    scene.add(gridHelper);

    // Try to load the actual FBX model
    let avatarModel = null;
    try {
      console.log('🎯 Attempting to load FBX model...');
      console.log('🎯 Model path:', modelPath);
      const modelAsset = getFBXPath(modelPath);
      console.log('🎯 Model asset:', modelAsset);
      
      if (!modelAsset) {
        console.error('❌ No model asset returned from getFBXPath');
        createFallbackCube(scene);
        handleLoad();
        return;
      }
      
      if (modelAsset) {
        const localUri = await loadFBXModel(modelAsset);
        console.log('🎯 FBX model URI:', localUri);
        
        // Load FBX model using FBXLoader
        console.log('🎯 Loading FBXLoader...');
        const FBXLoader = require('three/examples/jsm/loaders/FBXLoader.js').FBXLoader;
        console.log('🎯 FBXLoader loaded:', FBXLoader);
        const loader = new FBXLoader();
        console.log('🎯 FBXLoader instance created');
        
        loader.load(
          localUri,
          (fbx) => {
            console.log('FBX model loaded successfully!');
            avatarModel = fbx;
            avatarModel.name = 'avatar';
            
            // Center the model properly - Scale it down to normal size
            avatarModel.scale.setScalar(0.01); // Much smaller scale - was way too big!
            avatarModel.position.set(0, 0, 0); // Center position
            avatarModel.rotation.y = 0; // Reset Y rotation
            
            // Center the model on the ground
            const box = new THREE.Box3().setFromObject(avatarModel);
            const center = box.getCenter(new THREE.Vector3());
            avatarModel.position.sub(center);
            avatarModel.position.y = -box.min.y;
            
            // --- FBX ANIMATION HANDLING ---
            if (fbx.animations && fbx.animations.length > 0) {
                console.log(`Found ${fbx.animations.length} animations in FBX file`);
                
                // Create mixer for FBX animations
                mixerRef.current = new THREE.AnimationMixer(avatarModel);
                
                // Play the first animation
                const action = mixerRef.current.clipAction(fbx.animations[0]);
                action.play();
                
                console.log(`▶️ Playing FBX animation: ${fbx.animations[0].name}`);
            } else {
                console.log("No animations found in FBX file, using manual joint animation");
                mixerRef.current = null;
            }
            
            // --- NEW OPTIMIZED BONE FINDING ---
            // Find all bones ONCE and store them for later use.
            avatarModel.traverse((object) => {
              // SkinnedMesh contains the skeleton
              if (object.isSkinnedMesh) {
                console.log('=== FINDING AND STORING BONES ===');
                // Use skeleton.getBoneByName for reliable access
                const boneMap = bonesRef.current;
                const skeleton = object.skeleton;

                // Log all available bone names to the console to be sure
                console.log('Available bones:', skeleton.bones.map(b => b.name));

                // Get and store the bones you need.
                // Try different naming conventions
                boneMap.leftUpLeg = skeleton.getBoneByName('mixamorigLeftUpLeg') || skeleton.getBoneByName('mixamorig:LeftUpLeg') || skeleton.getBoneByName('LeftUpLeg');
                boneMap.rightUpLeg = skeleton.getBoneByName('mixamorigRightUpLeg') || skeleton.getBoneByName('mixamorig:RightUpLeg') || skeleton.getBoneByName('RightUpLeg');
                boneMap.leftLeg = skeleton.getBoneByName('mixamorigLeftLeg') || skeleton.getBoneByName('mixamorig:LeftLeg') || skeleton.getBoneByName('LeftLeg');
                boneMap.rightLeg = skeleton.getBoneByName('mixamorigRightLeg') || skeleton.getBoneByName('mixamorig:RightLeg') || skeleton.getBoneByName('RightLeg');
                boneMap.leftArm = skeleton.getBoneByName('mixamorigLeftArm') || skeleton.getBoneByName('mixamorig:LeftArm') || skeleton.getBoneByName('LeftArm');
                boneMap.rightArm = skeleton.getBoneByName('mixamorigRightArm') || skeleton.getBoneByName('mixamorig:RightArm') || skeleton.getBoneByName('RightArm');
                boneMap.leftShoulder = skeleton.getBoneByName('mixamorigLeftShoulder') || skeleton.getBoneByName('mixamorig:LeftShoulder') || skeleton.getBoneByName('LeftShoulder');
                boneMap.rightShoulder = skeleton.getBoneByName('mixamorigRightShoulder') || skeleton.getBoneByName('mixamorig:RightShoulder') || skeleton.getBoneByName('RightShoulder');
                
                console.log('Bones stored:', Object.keys(boneMap).filter(key => boneMap[key]));
                console.log('=== BONE SETUP COMPLETE ===');
              }
            });
            // --- END NEW CODE ---
            
            // Debug: Log model dimensions and position
            const debugBox = new THREE.Box3().setFromObject(avatarModel);
            const size = debugBox.getSize(new THREE.Vector3());
            const debugCenter = debugBox.getCenter(new THREE.Vector3());
            console.log('=== MODEL DEBUG INFO ===');
            console.log('Model dimensions:', size.x, size.y, size.z);
            console.log('Model center:', debugCenter.x, debugCenter.y, debugCenter.z);
            console.log('Model position after adjustment:', avatarModel.position.x, avatarModel.position.y, avatarModel.position.z);
            console.log('Model scale:', avatarModel.scale.x, avatarModel.scale.y, avatarModel.scale.z);
            console.log('Camera position:', camera.position.x, camera.position.y, camera.position.z);
            console.log('Camera lookAt:', 0, 0, 0);
            
            // Debug: Log available animations
            console.log('=== AVAILABLE ANIMATIONS ===');
            console.log('Number of animations:', fbx.animations ? fbx.animations.length : 0);
            if (fbx.animations) {
              fbx.animations.forEach((clip, index) => {
                console.log(`Animation ${index}: ${clip.name} (duration: ${clip.duration}s)`);
              });
            }
            
            scene.add(avatarModel);
            handleLoad();
          },
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
          },
          (error) => {
            console.error('❌ Error loading FBX:', error);
            console.error('❌ Error details:', error.message);
            console.error('❌ Error stack:', error.stack);
            createFallbackCube(scene);
            handleLoad();
          }
        );
      } else {
        console.log('❌ No FBX model found, using fallback cube');
        console.log('❌ Model path:', modelPath);
        createFallbackCube(scene);
        handleLoad();
      }
    } catch (error) {
      console.error('❌ Failed to load FBX model:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      createFallbackCube(scene);
      handleLoad();
    }

    // Start animation loop
    const animate = (timestamp) => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Get the time elapsed since the last frame. clockRef is your THREE.Clock()
      const delta = clockRef.current.getDelta();

      // --- STEP 3: UPDATE THE MIXER ---
      // If the mixer exists, update it with the delta time.
      // This is what actually moves the animation forward.
      if (mixerRef.current) {
        mixerRef.current.update(delta);
        
        // Debug: Log mixer update occasionally
        if (Math.floor(timestamp / 3000) !== Math.floor((timestamp - 16) / 3000)) {
          console.log(`🎬 AnimationMixer updated - delta: ${delta.toFixed(4)}s`);
        }
      }
      
      const currentModel = scene.getObjectByName('avatar');
      if (currentModel) {
        // Get current position
        const currentPos = currentModel.position;
        
        // Walking in place - no horizontal movement, just joint animation
        if (isWalking) {
          // Update walking cycle
          walkCycle.current += walkCycleSpeed.current;
          
          // --- ALWAYS CALL MANUAL ANIMATION WHEN WALKING ---
          // This is the key change. We no longer check for mixerRef.
          animateWalkingJoints(walkCycle.current);
          
          // Debug logging every 2 seconds
          if (Math.floor(timestamp / 2000) !== Math.floor((timestamp - 16) / 2000)) {
            console.log(`🚶‍♂️ Walking in place - Cycle: ${walkCycle.current.toFixed(2)}`);
          }
        } else {
          // --- IMPROVEMENT ---
          // Only reset the joints ONCE when the avatar stops walking
          if (wasWalkingRef.current) {
            console.log('🛑 Avatar stopped walking. Resetting joints to idle.');
            resetJointsToIdle();
          }
          
          // Idle animations when not walking
          if (enableRotation) {
            currentModel.rotation.y += rotationSpeed; // Slow rotation when idle
          }
          
          // Gentle breathing effect when idle
          const breathingScale = 1 + Math.sin(timestamp * 0.002) * 0.03;
          currentModel.scale.setScalar(breathingScale);
          
          // Subtle idle sway
          const idleSway = Math.sin(timestamp * 0.003) * 0.02;
          currentModel.position.y = -0.5 + idleSway;
        }
        
        // Update the ref for the next frame
        wasWalkingRef.current = isWalking;
      }
      
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    
    animate();
  };

  const createFallbackCube = (scene) => {
    console.log('Creating fallback cube');
    const geometry = new THREE.BoxGeometry(1, 1, 1); // Cube size (width, height, depth)
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x667eea, // Color (hex value)
      shininess: 100, // How shiny the material is (0-1000)
      specular: 0x222222, // Specular highlight color
      transparent: true, // Enable transparency
      opacity: 0.9 // Opacity (0 = invisible, 1 = opaque)
    });
    const cube = new THREE.Mesh(geometry, material); // Combine geometry and material
    cube.name = 'avatar'; // Name for finding the object later
    scene.add(cube); // Add to scene
  };

  return (
    <View style={[{ flex: 1, alignItems: 'center' }, style]}> {/* Container view - full height */}
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={0.8}
        style={{ width: '100%', height: '100%' }} // Full screen touchable area
      > {/* Touchable wrapper */}
        <GLView
          style={{
            width: '100%', // Full width
            height: '100%', // Full height
            backgroundColor: '#1a1a1a', // Dark background for better 3D visibility
            ...style // Allow custom styles to override
          }}
          onContextCreate={onContextCreate} // Called when WebGL context is ready
        />
      </TouchableOpacity>
    </View>
  );
};

export default FBXAvatar;
