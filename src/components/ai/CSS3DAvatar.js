import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';


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

// CSS-based 3D Human Avatar (TTS disabled until 3D human torso is implemented)
const CSS3DAvatar = ({ 
  size = 200, 
  text = "Hello! I'm your AI communication coach.",
  onPress = null,
  style = {}
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      setIsInitializing(true);
      // TTS disabled for now - just initialize the avatar
      setIsInitializing(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize CSS 3D avatar services:', error);
      setIsInitializing(false);
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // TTS disabled for now - just show a message
      console.log('Avatar pressed - TTS disabled until 3D human torso is implemented');
    }
  };

  const handleAvatarError = (error) => {
    console.error('CSS 3D Avatar error:', error);
    setError('Failed to load 3D avatar');
    setIsLoading(false);
  };

  // Check if we're on web platform for CSS 3D effects
  const isWeb = typeof window !== 'undefined';

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size || 200,
          height: size || 200,
          borderRadius: (size || 200) / 2,
          overflow: 'hidden',
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(102, 126, 234, 0.3)',
          elevation: 8,
        }}
      >
        <TouchableOpacity 
          style={{ width: '100%', height: '100%' }}
          onPress={handlePress}
          activeOpacity={0.8}
        >
        {isWeb ? (
          <View style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: 'scale(1)',
            transition: 'transform 0.3s ease'
          }}>
            {/* 3D Human Head using CSS */}
            <div style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              transform: 'perspective(500px) rotateY(-15deg)',
              transformStyle: 'preserve-3d'
            }}>
              {/* Head */}
              <div style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #fdbcb4 0%, #f4a6a6 100%)',
                borderRadius: '50%',
                top: '20px',
                left: '20px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                transform: 'rotateY(0deg)',
                transition: 'transform 0.3s ease'
              }}>
                {/* Eyes */}
                <div style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  background: '#000',
                  borderRadius: '50%',
                  top: '25px',
                  left: '20px',
                  boxShadow: '2px 2px 0 #fff'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  background: '#000',
                  borderRadius: '50%',
                  top: '25px',
                  right: '20px',
                  boxShadow: '2px 2px 0 #fff'
                }} />
                
                {/* Nose */}
                <div style={{
                  position: 'absolute',
                  width: '4px',
                  height: '6px',
                  background: '#fdbcb4',
                  borderRadius: '2px',
                  top: '35px',
                  left: '38px',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                }} />
                
                {/* Mouth */}
                <div style={{
                  position: 'absolute',
                  width: '12px',
                  height: '4px',
                  background: '#ff6b6b',
                  borderRadius: '6px',
                  top: '45px',
                  left: '30px',
                  transition: 'all 0.3s ease'
                }} />
              </div>
              
              {/* Torso */}
              <div style={{
                position: 'absolute',
                width: '60px',
                height: '80px',
                background: 'linear-gradient(135deg, #4a90e2 0%, #5b73e8 100%)',
                borderRadius: '30px 30px 10px 10px',
                top: '100px',
                left: '30px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transform: 'rotateY(0deg)',
                transition: 'all 0.3s ease'
              }}>
                {/* Shoulders */}
                <div style={{
                  position: 'absolute',
                  width: '20px',
                  height: '15px',
                  background: 'linear-gradient(135deg, #4a90e2 0%, #5b73e8 100%)',
                  borderRadius: '10px',
                  top: '-5px',
                  left: '-10px',
                  transform: 'rotate(-15deg)'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '20px',
                  height: '15px',
                  background: 'linear-gradient(135deg, #4a90e2 0%, #5b73e8 100%)',
                  borderRadius: '10px',
                  top: '-5px',
                  right: '-10px',
                  transform: 'rotate(15deg)'
                }} />
              </div>
              
              {/* Arms */}
              <div style={{
                position: 'absolute',
                width: '8px',
                height: '40px',
                background: '#fdbcb4',
                borderRadius: '4px',
                top: '110px',
                left: '10px',
                transform: 'rotate(-5deg)',
                transition: 'transform 0.3s ease'
              }} />
              <div style={{
                position: 'absolute',
                width: '8px',
                height: '40px',
                background: '#fdbcb4',
                borderRadius: '4px',
                top: '110px',
                right: '10px',
                transform: 'rotate(5deg)',
                transition: 'transform 0.3s ease'
              }} />
            </div>
          </View>
        ) : (
          // React Native fallback
          <View style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#4a90e2',
            borderRadius: size / 2,
            transform: [{ scale: 1 }]
          }}>
            <Text style={{
              fontSize: 24,
              color: 'white',
              fontWeight: 'bold'
            }}>
              👤
            </Text>
            <Text style={{
              fontSize: 12,
              color: 'white',
              marginTop: 5,
              textAlign: 'center'
            }}>
              3D Human Avatar
            </Text>
          </View>
        )}

        {isLoading && (
          <LoadingContainer size={size}>
            <ActivityIndicator size="large" color="white" />
            <LoadingText>Loading 3D Human Avatar...</LoadingText>
          </LoadingContainer>
        )}

        {error && !isLoading && (
          <ErrorContainer size={size}>
            <ErrorText>{error}</ErrorText>
            <TouchableOpacity
              onPress={() => handleSpeech(currentText)}
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
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default CSS3DAvatar;
