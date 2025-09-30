import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

class ElevenLabsTTSService {
  constructor() {
    this.isInitialized = false;
    this.isSpeaking = false;
    this.apiKey = null;
    this.voiceId = null;
    this.speechRate = 1.0;
    this.speechVolume = 1.0;
    this.isEnabled = true;
    this.currentSound = null;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load API key and voice ID from environment or hardcoded values
      this.apiKey = process.env.ELEVEN_LABS_API_KEY || 'sk_bcff5ed77086c0e42a1a2928e7d3b78c5888223182bf4f67';
      this.voiceId = process.env.VOICE_ID || 'S9WrLrqYPJzmQyWPWbZ5';

      if (!this.apiKey || !this.voiceId) {
        throw new Error('ElevenLabs API key or Voice ID not found. Please check your configuration.');
      }

      // Load saved settings
      await this.loadSettings();
      
      this.isInitialized = true;
      console.log('ElevenLabs TTS Service initialized successfully');
    } catch (error) {
      console.error('ElevenLabs TTS Service initialization failed:', error);
      throw error;
    }
  }

  async loadSettings() {
    try {
      const settings = await AsyncStorage.getItem('elevenLabsTtsSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.speechRate = parsed.rate || 1.0;
        this.speechVolume = parsed.volume || 1.0;
        this.isEnabled = parsed.enabled !== false;
      }
    } catch (error) {
      console.error('Failed to load ElevenLabs TTS settings:', error);
    }
  }

  async saveSettings() {
    try {
      const settings = {
        rate: this.speechRate,
        volume: this.speechVolume,
        enabled: this.isEnabled
      };
      await AsyncStorage.setItem('elevenLabsTtsSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save ElevenLabs TTS settings:', error);
    }
  }

  async speak(text, options = {}) {
    console.log('🎤 ELEVENLABS: speak() called with text:', text);
    console.log('🎤 ELEVENLABS: isEnabled:', this.isEnabled);
    console.log('🎤 ELEVENLABS: text length:', text ? text.length : 0);
    
    if (!this.isEnabled || !text) {
      console.log('🎤 ELEVENLABS: Speech disabled or no text, returning');
      return;
    }

    // Only use ElevenLabs - no fallback
    if (!this.apiKey || !this.voiceId) {
      console.error('❌ ELEVENLABS: API key or Voice ID not configured');
      throw new Error('ElevenLabs API key or Voice ID not configured. Please check your .env file.');
    }

    try {
      console.log('🛑 ELEVENLABS: Stopping any current speech');
      // Stop any current speech
      await this.stop();
      
      console.log('🗣️ ELEVENLABS: Starting ElevenLabs speech');
      return await this.speakWithElevenLabs(text, options);
    } catch (error) {
      console.error('❌ ELEVENLABS: TTS error:', error);
      throw new Error(`ElevenLabs TTS failed: ${error.message}`);
    }
  }

  async speakWithElevenLabs(text, options = {}) {
    try {
      console.log('🎤 ELEVENLABS: speakWithElevenLabs called with text:', text);
      console.log('🎤 ELEVENLABS: Voice ID:', this.voiceId);
      
      this.isSpeaking = true;
      this.onSpeechStart?.();
      console.log('🎤 ELEVENLABS: Speech started, calling onSpeechStart');

      console.log('🌐 ELEVENLABS: Making API request to ElevenLabs');
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        console.error('❌ ELEVENLABS: API response not ok:', response.status, response.statusText);
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      console.log('✅ ELEVENLABS: API response successful, processing audio');
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('🎵 ELEVENLABS: Audio blob created, URL:', audioUrl);

      // Play audio
      console.log('▶️ ELEVENLABS: Creating audio sound');
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: true,
          volume: this.speechVolume,
          rate: this.speechRate
        }
      );

      this.currentSound = sound;
      console.log('🎵 ELEVENLABS: Audio sound created and assigned');

      // Set up completion handler
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          console.log('🏁 ELEVENLABS: Audio playback finished');
          this.isSpeaking = false;
          this.onSpeechEnd?.();
          sound.unloadAsync();
          this.currentSound = null;
        }
      });

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      this.isSpeaking = false;
      this.onSpeechEnd?.();
      throw error;
    }
  }

  // Fallback methods removed - ElevenLabs only

  async stop() {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }
      
      this.isSpeaking = false;
    } catch (error) {
      console.error('ElevenLabs TTS stop error:', error);
    }
  }

  async pause() {
    try {
      if (this.currentSound) {
        await this.currentSound.pauseAsync();
      }
    } catch (error) {
      console.error('ElevenLabs TTS pause error:', error);
    }
  }

  async resume() {
    try {
      if (this.currentSound) {
        await this.currentSound.playAsync();
      }
    } catch (error) {
      console.error('ElevenLabs TTS resume error:', error);
    }
  }

  // Settings management
  async setRate(rate) {
    this.speechRate = Math.max(0.1, Math.min(2.0, rate));
    await this.saveSettings();
  }

  async setVolume(volume) {
    this.speechVolume = Math.max(0.0, Math.min(1.0, volume));
    await this.saveSettings();
  }

  async setEnabled(enabled) {
    this.isEnabled = enabled;
    await this.saveSettings();
    if (!enabled) {
      await this.stop();
    }
  }

  // Event callbacks
  onSpeechStart = null;
  onSpeechEnd = null;

  setOnSpeechStart(callback) {
    this.onSpeechStart = callback;
  }

  setOnSpeechEnd(callback) {
    this.onSpeechEnd = callback;
  }

  // Utility methods
  isCurrentlySpeaking() {
    return this.isSpeaking;
  }

  getSettings() {
    return {
      rate: this.speechRate,
      volume: this.speechVolume,
      enabled: this.isEnabled,
      hasElevenLabs: !!(this.apiKey && this.voiceId),
      voiceId: this.voiceId
    };
  }

  // Cleanup
  async destroy() {
    await this.stop();
    this.isInitialized = false;
  }
}

// Create singleton instance
const elevenLabsTtsService = new ElevenLabsTTSService();

export default elevenLabsTtsService;
