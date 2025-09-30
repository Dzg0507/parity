// Web-compatible sharing utility
import { Platform } from 'react-native';

// Web sharing using Web Share API or fallback
const webShare = async (options) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: options.title || '',
        text: options.message || '',
        url: options.url || '',
      });
      return { success: true };
    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;
      }
      return { success: false, cancelled: true };
    }
  } else {
    // Fallback: copy to clipboard
    try {
      const textToShare = `${options.title || ''}\n\n${options.message || ''}\n\n${options.url || ''}`.trim();
      await navigator.clipboard.writeText(textToShare);
      return { success: true, fallback: true };
    } catch (error) {
      throw new Error('Sharing not supported on this device');
    }
  }
};

// Native sharing using react-native-share
const nativeShare = async (options) => {
  const Share = require('react-native-share').default;
  try {
    await Share.open(options);
    return { success: true };
  } catch (error) {
    if (error.message === 'User did not share') {
      return { success: false, cancelled: true };
    }
    throw error;
  }
};

// Platform-agnostic share function
export const share = async (options) => {
  if (Platform.OS === 'web') {
    return webShare(options);
  } else {
    return nativeShare(options);
  }
};

// Copy to clipboard utility
export const copyToClipboard = async (text) => {
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      throw new Error('Clipboard access not available');
    }
  } else {
    const Clipboard = require('@react-native-clipboard/clipboard').default;
    try {
      Clipboard.setString(text);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
};
