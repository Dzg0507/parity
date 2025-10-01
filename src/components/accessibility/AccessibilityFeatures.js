import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../theme';

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
  padding: 20px;
`;

const Header = styled.View`
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 10px;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 22px;
`;

const Section = styled.View`
  background-color: ${props => props.theme.colors.surface};
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 15px;
`;

const SettingItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const SettingInfo = styled.View`
  flex: 1;
  margin-right: 15px;
`;

const SettingTitle = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  margin-bottom: 5px;
`;

const SettingDescription = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 18px;
`;

const SettingControl = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SliderContainer = styled.View`
  width: 100px;
  height: 40px;
  background-color: ${props => props.theme.colors.border};
  border-radius: 20px;
  padding: 2px;
  margin-left: 10px;
`;

const Slider = styled.View`
  width: 36px;
  height: 36px;
  background-color: ${props => props.theme.colors.primary};
  border-radius: 18px;
  position: absolute;
  left: ${props => props.position}px;
  top: 2px;
`;

const AccessibilityFeatures = () => {
  const [settings, setSettings] = useState({
    // Visual accessibility
    highContrast: false,
    largeText: false,
    textSize: 'medium', // small, medium, large, extra-large
    colorBlindSupport: false,
    reducedMotion: false,
    
    // Audio accessibility
    screenReader: false,
    audioDescriptions: true,
    hapticFeedback: true,
    voiceGuidance: true,
    
    // Motor accessibility
    largeTouchTargets: false,
    gestureNavigation: true,
    voiceControl: false,
    switchControl: false,
    
    // Cognitive accessibility
    simplifiedUI: false,
    progressIndicators: true,
    clearInstructions: true,
    errorPrevention: true
  });

  const [textSize, setTextSize] = useState(1); // 0-3 scale

  useEffect(() => {
    loadAccessibilitySettings();
  }, []);

  const loadAccessibilitySettings = async () => {
    // Load from AsyncStorage or user preferences
    // This is a mock implementation
    console.log('Loading accessibility settings...');
  };

  const saveSettings = async (newSettings) => {
    try {
      setSettings({ ...settings, ...newSettings });
      // Save to AsyncStorage or API
      console.log('Saving accessibility settings:', newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleToggle = (key) => {
    saveSettings({ [key]: !settings[key] });
  };

  const handleTextSizeChange = (newSize) => {
    setTextSize(newSize);
    const sizeMap = ['small', 'medium', 'large', 'extra-large'];
    saveSettings({ textSize: sizeMap[newSize] });
  };

  const getTextSizeStyle = () => {
    const sizes = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
      'extra-large': { fontSize: 20 }
    };
    return sizes[settings.textSize] || sizes.medium;
  };

  const renderSlider = (value, onValueChange, min = 0, max = 3) => {
    const position = (value / max) * 64; // 100px - 36px = 64px range
    
    return (
      <TouchableOpacity
        onPress={() => onValueChange((value + 1) % (max + 1))}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <Text style={{ color: theme.colors.text, marginRight: 10 }}>
          {['S', 'M', 'L', 'XL'][value]}
        </Text>
        <SliderContainer theme={theme}>
          <Slider position={position} theme={theme} />
        </SliderContainer>
      </TouchableOpacity>
    );
  };

  return (
    <Container theme={theme} style={getTextSizeStyle()}>
      <Header>
        <Title>Accessibility Settings</Title>
        <Subtitle>
          Customize the app to work better for your needs and preferences.
        </Subtitle>
      </Header>

      {/* Visual Accessibility */}
      <Section theme={theme}>
        <SectionTitle>Visual Accessibility</SectionTitle>
        
        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>High Contrast Mode</SettingTitle>
            <SettingDescription>
              Increases contrast between text and background for better visibility
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.highContrast}
              onValueChange={() => handleToggle('highContrast')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.highContrast ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Text Size</SettingTitle>
            <SettingDescription>
              Adjust text size for better readability
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            {renderSlider(textSize, handleTextSizeChange)}
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Color Blind Support</SettingTitle>
            <SettingDescription>
              Uses patterns and shapes in addition to colors
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.colorBlindSupport}
              onValueChange={() => handleToggle('colorBlindSupport')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.colorBlindSupport ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Reduced Motion</SettingTitle>
            <SettingDescription>
              Minimizes animations and transitions
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.reducedMotion}
              onValueChange={() => handleToggle('reducedMotion')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.reducedMotion ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>
      </Section>

      {/* Audio Accessibility */}
      <Section theme={theme}>
        <SectionTitle>Audio Accessibility</SectionTitle>
        
        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Screen Reader Support</SettingTitle>
            <SettingDescription>
              Optimizes interface for screen readers
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.screenReader}
              onValueChange={() => handleToggle('screenReader')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.screenReader ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Audio Descriptions</SettingTitle>
            <SettingDescription>
              Provides audio descriptions of visual elements
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.audioDescriptions}
              onValueChange={() => handleToggle('audioDescriptions')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.audioDescriptions ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Haptic Feedback</SettingTitle>
            <SettingDescription>
              Provides tactile feedback for interactions
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={() => handleToggle('hapticFeedback')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.hapticFeedback ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Voice Guidance</SettingTitle>
            <SettingDescription>
              Provides spoken instructions and feedback
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.voiceGuidance}
              onValueChange={() => handleToggle('voiceGuidance')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.voiceGuidance ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>
      </Section>

      {/* Motor Accessibility */}
      <Section theme={theme}>
        <SectionTitle>Motor Accessibility</SectionTitle>
        
        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Large Touch Targets</SettingTitle>
            <SettingDescription>
              Increases button and touch target sizes
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.largeTouchTargets}
              onValueChange={() => handleToggle('largeTouchTargets')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.largeTouchTargets ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Gesture Navigation</SettingTitle>
            <SettingDescription>
              Enables swipe and gesture-based navigation
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.gestureNavigation}
              onValueChange={() => handleToggle('gestureNavigation')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.gestureNavigation ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Voice Control</SettingTitle>
            <SettingDescription>
              Allows voice commands for navigation and control
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.voiceControl}
              onValueChange={() => handleToggle('voiceControl')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.voiceControl ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Switch Control</SettingTitle>
            <SettingDescription>
              Enables external switch control support
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.switchControl}
              onValueChange={() => handleToggle('switchControl')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.switchControl ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>
      </Section>

      {/* Cognitive Accessibility */}
      <Section theme={theme}>
        <SectionTitle>Cognitive Accessibility</SectionTitle>
        
        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Simplified UI</SettingTitle>
            <SettingDescription>
              Reduces visual complexity and distractions
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.simplifiedUI}
              onValueChange={() => handleToggle('simplifiedUI')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.simplifiedUI ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Progress Indicators</SettingTitle>
            <SettingDescription>
              Shows clear progress and completion status
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.progressIndicators}
              onValueChange={() => handleToggle('progressIndicators')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.progressIndicators ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Clear Instructions</SettingTitle>
            <SettingDescription>
              Provides step-by-step guidance and help
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.clearInstructions}
              onValueChange={() => handleToggle('clearInstructions')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.clearInstructions ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingTitle>Error Prevention</SettingTitle>
            <SettingDescription>
              Provides warnings and confirmation dialogs
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Switch
              value={settings.errorPrevention}
              onValueChange={() => handleToggle('errorPrevention')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.errorPrevention ? '#fff' : '#f4f3f4'}
            />
          </SettingControl>
        </SettingItem>
      </Section>

      {/* Quick Actions */}
      <Section theme={theme}>
        <SectionTitle>Quick Actions</SectionTitle>
        
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary,
            padding: 15,
            borderRadius: 8,
            marginBottom: 10
          }}
          onPress={() => Alert.alert('Reset', 'Reset all settings to default?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', onPress: () => {
              setSettings({
                highContrast: false,
                largeText: false,
                textSize: 'medium',
                colorBlindSupport: false,
                reducedMotion: false,
                screenReader: false,
                audioDescriptions: true,
                hapticFeedback: true,
                voiceGuidance: true,
                largeTouchTargets: false,
                gestureNavigation: true,
                voiceControl: false,
                switchControl: false,
                simplifiedUI: false,
                progressIndicators: true,
                clearInstructions: true,
                errorPrevention: true
              });
              setTextSize(1);
            }}
          ])}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            Reset to Defaults
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.surface,
            padding: 15,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}
          onPress={() => Alert.alert('Help', 'Accessibility features help make the app usable for everyone. Enable the features that work best for you.')}
        >
          <Text style={{ color: theme.colors.text, textAlign: 'center', fontWeight: '600' }}>
            Get Help
          </Text>
        </TouchableOpacity>
      </Section>
    </Container>
  );
};

export default AccessibilityFeatures;