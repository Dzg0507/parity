// ReadyPlayerMe React Avatar Creator shim to handle import.meta.env.MODE issues
// This provides a Metro-compatible wrapper for the ReadyPlayerMe avatar creator

import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

// Mock the environment check that causes import.meta issues
const isDev = process.env.NODE_ENV !== 'production';

// Create a shim component that provides the same interface as the original
const ReadyPlayerMeAvatarCreator = ({
  onAvatarGenerated,
  onClose,
  style,
  ...props
}) => {
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate the avatar creator loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'avatarGenerated') {
        onAvatarGenerated?.(data.avatarUrl);
      } else if (data.type === 'close') {
        onClose?.();
      }
    } catch (error) {
      console.warn('Error parsing ReadyPlayerMe message:', error);
    }
  };

  // For web, we can use an iframe
  if (typeof window !== 'undefined') {
    return (
      <View style={[styles.container, style]}>
        <iframe
          src="https://your-subdomain.readyplayer.me/avatar"
          style={styles.iframe}
          onLoad={() => setIsLoading(false)}
          onMessage={handleMessage}
          {...props}
        />
      </View>
    );
  }

  // For native, show a placeholder or use WebView
  return (
    <View style={[styles.container, style]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Avatar Creator...</Text>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            ReadyPlayerMe Avatar Creator
          </Text>
          <Text style={styles.placeholderSubtext}>
            This would normally show the avatar creator interface
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeholderSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ReadyPlayerMeAvatarCreator;

// Export any other components that might be used
export const AvatarCreator = ReadyPlayerMeAvatarCreator;
export const ReadyPlayerMe = ReadyPlayerMeAvatarCreator;
