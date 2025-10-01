import React, { useState, useEffect, useRef } from 'react';
import { View, Text, PanGestureHandler, TapGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Gesture types
const GESTURE_TYPES = {
  TAP: 'tap',
  DOUBLE_TAP: 'double_tap',
  LONG_PRESS: 'long_press',
  SWIPE_LEFT: 'swipe_left',
  SWIPE_RIGHT: 'swipe_right',
  SWIPE_UP: 'swipe_up',
  SWIPE_DOWN: 'swipe_down',
  PINCH: 'pinch',
  ROTATE: 'rotate'
};

// Gesture recognition thresholds
const GESTURE_THRESHOLDS = {
  SWIPE_MIN_DISTANCE: 50,
  SWIPE_MAX_TIME: 300,
  LONG_PRESS_DURATION: 500,
  PINCH_MIN_SCALE: 0.5,
  PINCH_MAX_SCALE: 3.0
};

const GestureRecognition = ({ 
  children, 
  onGesture, 
  enableGestures = true,
  gestureConfig = {},
  style = {} 
}) => {
  // Gesture state
  const [activeGestures, setActiveGestures] = useState(new Set());
  const [gestureHistory, setGestureHistory] = useState([]);
  
  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  
  // Gesture tracking
  const gestureStartTime = useRef(0);
  const gestureStartPosition = useRef({ x: 0, y: 0 });
  const lastGestureTime = useRef(0);
  const tapCount = useRef(0);
  const longPressTimer = useRef(null);
  
  // Gesture configuration
  const config = {
    enableTap: true,
    enableDoubleTap: true,
    enableLongPress: true,
    enableSwipe: true,
    enablePinch: true,
    enableRotate: false,
    ...gestureConfig
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Detect gesture type based on movement
  const detectGestureType = (translationX, translationY, velocityX, velocityY, duration) => {
    const distance = Math.sqrt(translationX * translationX + translationY * translationY);
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    
    // Swipe detection
    if (distance > GESTURE_THRESHOLDS.SWIPE_MIN_DISTANCE && 
        duration < GESTURE_THRESHOLDS.SWIPE_MAX_TIME) {
      if (Math.abs(translationX) > Math.abs(translationY)) {
        return translationX > 0 ? GESTURE_TYPES.SWIPE_RIGHT : GESTURE_TYPES.SWIPE_LEFT;
      } else {
        return translationY > 0 ? GESTURE_TYPES.SWIPE_DOWN : GESTURE_TYPES.SWIPE_UP;
      }
    }
    
    return null;
  };

  // Handle gesture recognition
  const handleGesture = (gestureType, data = {}) => {
    if (!enableGestures) return;
    
    const gestureData = {
      type: gestureType,
      timestamp: Date.now(),
      data: data
    };
    
    // Update gesture history
    setGestureHistory(prev => [...prev.slice(-9), gestureData]);
    
    // Update active gestures
    setActiveGestures(prev => {
      const newSet = new Set(prev);
      newSet.add(gestureType);
      return newSet;
    });
    
    // Call gesture handler
    if (onGesture) {
      onGesture(gestureType, gestureData);
    }
    
    // Remove gesture from active after a delay
    setTimeout(() => {
      setActiveGestures(prev => {
        const newSet = new Set(prev);
        newSet.delete(gestureType);
        return newSet;
      });
    }, 1000);
  };

  // Tap gesture handler
  const tapGestureHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      gestureStartTime.current = Date.now();
      gestureStartPosition.current = { x: event.x, y: event.y };
    },
    onEnd: (event) => {
      const duration = Date.now() - gestureStartTime.current;
      const distance = Math.sqrt(
        Math.pow(event.x - gestureStartPosition.current.x, 2) + 
        Math.pow(event.y - gestureStartPosition.current.y, 2)
      );
      
      if (distance < 10 && duration < 300) {
        tapCount.current += 1;
        
        if (tapCount.current === 1) {
          // Single tap
          if (config.enableTap) {
            runOnJS(handleGesture)(GESTURE_TYPES.TAP, {
              x: event.x,
              y: event.y,
              duration
            });
          }
          
          // Check for double tap
          setTimeout(() => {
            if (tapCount.current === 1 && config.enableDoubleTap) {
              runOnJS(handleGesture)(GESTURE_TYPES.DOUBLE_TAP, {
                x: event.x,
                y: event.y,
                duration
              });
            }
            tapCount.current = 0;
          }, 300);
        }
      }
    }
  });

  // Long press gesture handler
  const longPressGestureHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      if (config.enableLongPress) {
        longPressTimer.current = setTimeout(() => {
          runOnJS(handleGesture)(GESTURE_TYPES.LONG_PRESS, {
            x: event.x,
            y: event.y
          });
        }, GESTURE_THRESHOLDS.LONG_PRESS_DURATION);
      }
    },
    onEnd: () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  });

  // Pan gesture handler for swipes
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      gestureStartTime.current = Date.now();
      gestureStartPosition.current = { x: event.x, y: event.y };
    },
    onActive: (event) => {
      if (config.enableSwipe) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      const duration = Date.now() - gestureStartTime.current;
      const gestureType = detectGestureType(
        event.translationX,
        event.translationY,
        event.velocityX,
        event.velocityY,
        duration
      );
      
      if (gestureType) {
        runOnJS(handleGesture)(gestureType, {
          translationX: event.translationX,
          translationY: event.translationY,
          velocityX: event.velocityX,
          velocityY: event.velocityY,
          duration
        });
      }
      
      // Reset position
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    }
  });

  // Pinch gesture handler
  const pinchGestureHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      if (config.enablePinch) {
        gestureStartTime.current = Date.now();
      }
    },
    onActive: (event) => {
      if (config.enablePinch) {
        const newScale = Math.max(
          GESTURE_THRESHOLDS.PINCH_MIN_SCALE,
          Math.min(GESTURE_THRESHOLDS.PINCH_MAX_SCALE, event.scale)
        );
        scale.value = newScale;
      }
    },
    onEnd: (event) => {
      if (config.enablePinch) {
        const duration = Date.now() - gestureStartTime.current;
        
        runOnJS(handleGesture)(GESTURE_TYPES.PINCH, {
          scale: event.scale,
          focalX: event.focalX,
          focalY: event.focalY,
          duration
        });
        
        // Reset scale
        scale.value = withSpring(1);
      }
    }
  });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` }
      ]
    };
  });

  // Gesture combination detection
  useEffect(() => {
    if (gestureHistory.length >= 2) {
      const recentGestures = gestureHistory.slice(-2);
      const [first, second] = recentGestures;
      
      // Detect gesture combinations
      if (first.type === GESTURE_TYPES.SWIPE_LEFT && second.type === GESTURE_TYPES.SWIPE_RIGHT) {
        handleGesture('swipe_left_right', { first, second });
      } else if (first.type === GESTURE_TYPES.SWIPE_RIGHT && second.type === GESTURE_TYPES.SWIPE_LEFT) {
        handleGesture('swipe_right_left', { first, second });
      } else if (first.type === GESTURE_TYPES.TAP && second.type === GESTURE_TYPES.LONG_PRESS) {
        handleGesture('tap_long_press', { first, second });
      }
    }
  }, [gestureHistory]);

  // Render gesture indicators
  const renderGestureIndicators = () => {
    if (activeGestures.size === 0) return null;
    
    return (
      <View style={{
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
        borderRadius: 6,
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}>
        {Array.from(activeGestures).map(gesture => (
          <Text key={gesture} style={{
            color: 'white',
            fontSize: 12,
            margin: 2,
            padding: 2,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 4
          }}>
            {gesture.replace('_', ' ')}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={[{ flex: 1 }, style]}>
      <PanGestureHandler onGestureEvent={panGestureHandler}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <TapGestureHandler onGestureEvent={tapGestureHandler}>
            <Animated.View style={{ flex: 1 }}>
              <TapGestureHandler
                numberOfTaps={2}
                onGestureEvent={longPressGestureHandler}
              >
                <Animated.View style={{ flex: 1 }}>
                  <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
                    <Animated.View style={{ flex: 1 }}>
                      {children}
                      {renderGestureIndicators()}
                    </Animated.View>
                  </PinchGestureHandler>
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// Gesture utility functions
export const createGestureHandler = (gestureType, handler) => {
  return (gestureData) => {
    if (gestureData.type === gestureType) {
      handler(gestureData);
    }
  };
};

export const combineGestures = (...gestureHandlers) => {
  return (gestureType, gestureData) => {
    gestureHandlers.forEach(handler => {
      if (typeof handler === 'function') {
        handler(gestureType, gestureData);
      }
    });
  };
};

export const debounceGestures = (handler, delay = 300) => {
  let timeoutId;
  return (gestureType, gestureData) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      handler(gestureType, gestureData);
    }, delay);
  };
};

export { GESTURE_TYPES, GESTURE_THRESHOLDS };

export default GestureRecognition;