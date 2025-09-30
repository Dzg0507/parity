import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Platform } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import elevenLabsTtsService from '../../utils/elevenLabsTtsService';

// Import Ready Player Me packages
import { AvatarCreator, AvatarCreatorConfig, AvatarExportedEvent } from '@readyplayerme/react-avatar-creator';
import { Avatar } from '@readyplayerme/visage';

const AvatarContainer = styled.View`
  width: ${props => props.size || 200}px;
  height: ${props => props.size || 200}px;
  border-radius: ${props => (props.size || 200) / 2}px;
  overflow: hidden;
  position: relative;
  background-color: #f0f0f0;
  justify-content: center;
  align-items: center;
  shadow-color: #667eea;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

const LoadingContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: ${props => (props.size || 200) / 2}px;
`;

const LoadingText = styled.Text`
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-top: 10px;
  text-align: center;
`;

const ErrorContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 0, 0, 0.8);
  border-radius: ${props => (props.size || 200) / 2}px;
`;

const ErrorText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  padding: 10px;
`;

const SettingsButton = styled.TouchableOpacity`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.9);
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 4;
`;

const SettingsIcon = styled.Text`
  font-size: 16px;
  color: #667eea;
`;

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  background-color: white;
  border-radius: 20px;
  margin: 20px;
  max-height: 80%;
  width: 90%;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const CloseButton = styled.TouchableOpacity`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: #f0f0f0;
  justify-content: center;
  align-items: center;
`;

const CloseButtonText = styled.Text`
  font-size: 18px;
  color: #666;
`;

// Ready Player Me Avatar Creator Component
const AvatarCreatorComponent = ({ onAvatarExported, onClose }) => {
  const config = {
    clearCache: true,
    bodyType: 'fullbody',
    quickStart: false,
    language: 'en',
  };

  const style = { 
    width: '100%', 
    height: '80vh', 
    border: 'none',
    borderRadius: '20px'
  };

  return (
    <View style={{ flex: 1 }}>
      <AvatarCreator 
        subdomain="demo" 
        config={config} 
        style={style} 
        onAvatarExported={onAvatarExported} 
      />
    </View>
  );
};

// Main Avatar Component
const ReadyPlayerMeWebAvatar = ({ 
  size = 200, 
  text = "Hello! I'm Vibe, your AI communication coach.",
  onPress = null,
  showSettings = true,
  autoSpeak = true,
  speechText = "",
  style = {},
  avatarUrl = "https://models.readyplayer.me/68db3eef5327e5b9d763280e.glb"
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentText, setCurrentText] = useState(speechText || text);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);

  useEffect(() => {
    initializeServices();
  }, []);

  // Update speaking state when it changes
  useEffect(() => {
    if (isSpeaking !== undefined) {
      // Send speaking state to avatar
      console.log('🎭 AVATAR: Speaking state changed:', isSpeaking);
    }
  }, [isSpeaking]);

  const initializeServices = async () => {
    try {
      setIsInitializing(true);
      await elevenLabsTtsService.initialize();
      
      // Set up TTS event listeners to sync speaking state
      elevenLabsTtsService.setOnSpeechStart(() => {
        console.log('🎭 AVATAR: TTS started, setting speaking to true');
        setIsSpeaking(true);
      });

      elevenLabsTtsService.setOnSpeechEnd(() => {
        console.log('🎭 AVATAR: TTS ended, setting speaking to false');
        setIsSpeaking(false);
      });
      
      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      setIsInitializing(false);
    }
  };

  const handleSpeech = async (text) => {
    if (!text) {
      console.log('🎭 AVATAR: No text provided for speech');
      return;
    }

    console.log('🎭 AVATAR: Starting speech for text:', text);
    console.log('🎭 AVATAR: Text length:', text.length);

    try {
      setCurrentText(text);
      setError(null);
      console.log('🎤 AVATAR: Calling elevenLabsTtsService.speak');
      await elevenLabsTtsService.speak(text);
      console.log('✅ AVATAR: Speech completed successfully');
    } catch (error) {
      console.error('❌ AVATAR: Failed to handle speech:', error);
      setError('Speech failed');
    }
  };

  const handleAvatarLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleAvatarError = (error) => {
    console.error('Avatar load error:', error);
    setError('Failed to load 3D avatar');
    setIsLoading(false);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      handleSpeech(currentText);
    }
  };

  const handleSettingsPress = () => {
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  const handleAvatarExported = (event) => {
    console.log('🎭 AVATAR: New avatar exported:', event.data.url);
    setCurrentAvatarUrl(event.data.url);
    setShowSettingsModal(false);
  };

  const retrySpeech = () => {
    handleSpeech(currentText);
  };

  return (
    <>
      <View style={[{ alignItems: 'center' }, style]}>
        <AvatarContainer size={size} onTouchEnd={handlePress}>
          {currentAvatarUrl ? (
            <View style={{ width: '100%', height: '100%' }}>
              <Avatar 
                modelSrc={currentAvatarUrl}
                onLoad={handleAvatarLoad}
                onError={handleAvatarError}
                style={{
                  width: '100%',
                  height: '100%',
                  transform: isSpeaking ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}
              />
            </View>
          ) : (
            <View style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.1)'
            }}>
              <Text style={{
                fontSize: 16,
                color: '#667eea',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                Ready Player Me
              </Text>
              <Text style={{
                fontSize: 12,
                color: '#999',
                textAlign: 'center',
                marginTop: 5
              }}>
                Avatar
              </Text>
            </View>
          )}

          {isLoading && (
            <LoadingContainer size={size}>
              <ActivityIndicator size="large" color="white" />
              <LoadingText>Loading 3D Avatar...</LoadingText>
            </LoadingContainer>
          )}

          {error && !isLoading && (
            <ErrorContainer size={size}>
              <ErrorText>{error}</ErrorText>
              <TouchableOpacity
                onPress={retrySpeech}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: 8,
                  borderRadius: 8,
                  marginTop: 10
                }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  Retry
                </Text>
              </TouchableOpacity>
            </ErrorContainer>
          )}

          {showSettings && (
            <SettingsButton onPress={handleSettingsPress}>
              <SettingsIcon>⚙️</SettingsIcon>
            </SettingsButton>
          )}
        </AvatarContainer>
      </View>

      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeSettingsModal}
      >
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Ready Player Me Avatar</ModalTitle>
              <CloseButton onPress={closeSettingsModal}>
                <CloseButtonText>✕</CloseButtonText>
              </CloseButton>
            </ModalHeader>
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 16, color: '#333', marginBottom: 10 }}>
                3D Avatar Creator
              </Text>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
                Create your custom Ready Player Me avatar with ElevenLabs TTS integration!
              </Text>
              <AvatarCreatorComponent 
                onAvatarExported={handleAvatarExported}
                onClose={closeSettingsModal}
              />
            </View>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </>
  );
};

export default ReadyPlayerMeWebAvatar;