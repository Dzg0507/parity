// Scroll Fix Utility
// Fixes React Native Web scrolling issues and wheel event blocking

import { Platform } from 'react-native';

// Fix for React Native Web scroll blocking issues
export const fixScrollIssues = () => {
  if (Platform.OS === 'web') {
    // Add passive event listeners to prevent scroll blocking
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'wheel' || type === 'touchstart' || type === 'touchmove') {
        options = options || {};
        options.passive = true;
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    // Fix for React Native Web ScrollView issues
    const style = document.createElement('style');
    style.textContent = `
      /* Fix for React Native Web scrolling */
      .react-native-web-scrollview {
        -webkit-overflow-scrolling: touch;
        overflow: auto;
      }
      
      /* Ensure proper scrolling behavior */
      * {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Fix for wheel event blocking */
      body {
        touch-action: pan-y;
      }
    `;
    document.head.appendChild(style);
  }
};

// ScrollView props that work well with React Native Web
export const getScrollViewProps = () => ({
  showsVerticalScrollIndicator: true,
  bounces: true,
  scrollEventThrottle: 16,
  ...(Platform.OS === 'web' && {
    style: { overflow: 'auto' },
    contentContainerStyle: { flexGrow: 1 }
  })
});

// FlatList props that work well with React Native Web
export const getFlatListProps = () => ({
  showsVerticalScrollIndicator: true,
  bounces: true,
  scrollEventThrottle: 16,
  ...(Platform.OS === 'web' && {
    style: { overflow: 'auto' }
  })
});

export default {
  fixScrollIssues,
  getScrollViewProps,
  getFlatListProps
};
