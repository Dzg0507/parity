import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import styled from 'styled-components/native';
import Slider from '@react-native-community/slider';
import elevenLabsTtsService from '../../utils/elevenLabsTtsService';

const SettingsContainer = styled.View`
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  margin: 10px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 4;
`;

const SettingsTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const SettingRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const SettingLabel = styled.Text`
  font-size: 16px;
  color: #333;
  flex: 1;
`;

const SettingValue = styled.Text`
  font-size: 14px;
  color: #666;
  margin-left: 10px;
  min-width: 40px;
  text-align: right;
`;

const SliderContainer = styled.View`
  flex: 1;
  margin-left: 10px;
`;

const VoiceSelector = styled.View`
  margin-bottom: 15px;
`;

const VoiceButton = styled.TouchableOpacity`
  background-color: ${props => props.selected ? '#667eea' : '#f0f0f0'};
  padding: 10px 15px;
  border-radius: 10px;
  margin: 5px;
  border-width: 2px;
  border-color: ${props => props.selected ? '#667eea' : 'transparent'};
`;

const VoiceButtonText = styled.Text`
  color: ${props => props.selected ? 'white' : '#333'};
  font-size: 14px;
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
  text-align: center;
`;

const TestButton = styled.TouchableOpacity`
  background-color: #4CAF50;
  padding: 12px 20px;
  border-radius: 10px;
  margin-top: 10px;
`;

const TestButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const TTSSettings = ({ onClose }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    rate: 0.5,
    pitch: 1.0,
    volume: 1.0,
    voice: null,
    availableVoices: []
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const currentSettings = elevenLabsTtsService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load TTS settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      switch (key) {
        case 'enabled':
          await elevenLabsTtsService.setEnabled(value);
          break;
        case 'rate':
          await elevenLabsTtsService.setRate(value);
          break;
        case 'pitch':
          // ElevenLabs doesn't support pitch, skip
          break;
        case 'volume':
          await elevenLabsTtsService.setVolume(value);
          break;
        case 'voice':
          // Voice is set via environment variable
          break;
      }
    } catch (error) {
      console.error('Failed to update TTS setting:', error);
    }
  };

  const testVoice = async () => {
    try {
      const testText = "Hello! I'm Vibe, your AI communication coach. How does my voice sound?";
      await elevenLabsTtsService.speak(testText);
    } catch (error) {
      console.error('Failed to test voice:', error);
    }
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'rate':
        return value.toFixed(1);
      case 'pitch':
        return value.toFixed(1);
      case 'volume':
        return Math.round(value * 100) + '%';
      default:
        return value;
    }
  };

  const getVoiceDisplayName = (voice) => {
    if (!voice) return 'Default';
    if (typeof voice === 'string') return voice;
    return voice.name || voice.id || 'Unknown Voice';
  };

  return (
    <SettingsContainer>
      <SettingsTitle>🎤 Voice Settings</SettingsTitle>

      {/* Enable/Disable TTS */}
      <SettingRow>
        <SettingLabel>Enable Voice</SettingLabel>
        <Switch
          value={settings.enabled}
          onValueChange={(value) => updateSetting('enabled', value)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={settings.enabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </SettingRow>

      {/* Speech Rate */}
      <SettingRow>
        <SettingLabel>Speech Rate</SettingLabel>
        <SettingValue>{formatValue(settings.rate, 'rate')}</SettingValue>
        <SliderContainer>
          <Slider
            style={{ height: 40 }}
            minimumValue={0.1}
            maximumValue={2.0}
            value={settings.rate}
            onValueChange={(value) => updateSetting('rate', value)}
            minimumTrackTintColor="#667eea"
            maximumTrackTintColor="#d3d3d3"
            thumbStyle={{ backgroundColor: '#667eea' }}
            disabled={!settings.enabled}
          />
        </SliderContainer>
      </SettingRow>

      {/* Speech Pitch */}
      <SettingRow>
        <SettingLabel>Speech Pitch</SettingLabel>
        <SettingValue>{formatValue(settings.pitch, 'pitch')}</SettingValue>
        <SliderContainer>
          <Slider
            style={{ height: 40 }}
            minimumValue={0.1}
            maximumValue={2.0}
            value={settings.pitch}
            onValueChange={(value) => updateSetting('pitch', value)}
            minimumTrackTintColor="#667eea"
            maximumTrackTintColor="#d3d3d3"
            thumbStyle={{ backgroundColor: '#667eea' }}
            disabled={!settings.enabled}
          />
        </SliderContainer>
      </SettingRow>

      {/* Speech Volume */}
      <SettingRow>
        <SettingLabel>Volume</SettingLabel>
        <SettingValue>{formatValue(settings.volume, 'volume')}</SettingValue>
        <SliderContainer>
          <Slider
            style={{ height: 40 }}
            minimumValue={0.0}
            maximumValue={1.0}
            value={settings.volume}
            onValueChange={(value) => updateSetting('volume', value)}
            minimumTrackTintColor="#667eea"
            maximumTrackTintColor="#d3d3d3"
            thumbStyle={{ backgroundColor: '#667eea' }}
            disabled={!settings.enabled}
          />
        </SliderContainer>
      </SettingRow>

      {/* Voice Selection */}
      {settings.availableVoices.length > 0 && (
        <VoiceSelector>
          <SettingLabel style={{ marginBottom: 10 }}>Voice</SettingLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {settings.availableVoices.slice(0, 6).map((voice, index) => {
              const voiceName = getVoiceDisplayName(voice);
              const isSelected = settings.voice === voiceName;
              
              return (
                <VoiceButton
                  key={index}
                  selected={isSelected}
                  onPress={() => updateSetting('voice', voiceName)}
                  disabled={!settings.enabled}
                >
                  <VoiceButtonText selected={isSelected}>
                    {voiceName}
                  </VoiceButtonText>
                </VoiceButton>
              );
            })}
          </View>
        </VoiceSelector>
      )}

      {/* Test Button */}
      <TestButton onPress={testVoice} disabled={!settings.enabled || isLoading}>
        <TestButtonText>
          {isLoading ? 'Loading...' : '🎵 Test Voice'}
        </TestButtonText>
      </TestButton>
    </SettingsContainer>
  );
};

export default TTSSettings;
