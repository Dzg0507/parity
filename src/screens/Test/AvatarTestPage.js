import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../theme';

// Import Web FBX 3D avatar implementation (uses regular Three.js like test file)
import WebFBXAvatar from '../../components/ai/WebFBXAvatar';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
  padding: 10px;
`;

const Header = styled.View`
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 5px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 20px;
`;

const MainContent = styled.View`
  flex: 1;
  flex-direction: row;
`;

const AvatarSection = styled.View`
  flex: 1;
  margin-right: 15px;
  align-items: center;
`;

const ControlsSection = styled.View`
  width: 300px;
  max-height: 100%;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 10px;
  text-align: center;
`;

const SectionDescription = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 15px;
  text-align: center;
  line-height: 16px;
`;

const ButtonGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const TestButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  padding: 8px 12px;
  border-radius: 6px;
  margin: 3px;
  min-width: 90px;
  flex: 1;
  max-width: 140px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
`;

const ControlGroup = styled.View`
  margin-bottom: 15px;
`;

const GroupTitle = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
  text-align: center;
`;

const StatusIndicator = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const StatusDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.color};
  margin-right: 8px;
`;

const StatusText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

const FeaturesList = styled.View`
  align-items: flex-start;
  margin-top: 15px;
`;

const FeatureItem = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 4px;
  line-height: 16px;
`;

const NextSteps = styled.View`
  margin-top: 30px;
  padding: 20px;
  background-color: ${props => props.theme.colors.surface};
  border-radius: 12px;
`;

const NextStepsTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 15px;
`;

const NextStepsText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 20px;
  margin-bottom: 10px;
`;

const AvatarTestPage = () => {
  const [css3dStatus, setCss3dStatus] = useState('loading');
  const [currentTestText, setCurrentTestText] = useState(0);
  
  const testTexts = [
    "Hello! I'm your AI communication coach.",
    "Let's work on improving your communication skills together.",
    "I'm here to help you prepare for difficult conversations.",
    "Ready to start your session? Let's begin!"
  ];

  const handleCss3dLoad = () => {
    setCss3dStatus('ready');
  };

  const handleCss3dError = () => {
    setCss3dStatus('error');
  };

  const cycleTestText = () => {
    setCurrentTestText((prev) => (prev + 1) % testTexts.length);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'error': return 'Error';
      default: return 'Loading...';
    }
  };

  return (
    <Container theme={theme}>
      <Header>
        <Title>3D Avatar Test</Title>
        <Subtitle>
          FBX walking avatar with animation controls
        </Subtitle>
      </Header>

      <MainContent>
        <AvatarSection>
          <SectionTitle>FBX Walking Avatar</SectionTitle>
          <SectionDescription>
            Interactive 3D avatar with walking animations
          </SectionDescription>
          
          <StatusIndicator>
            <StatusDot color={getStatusColor(css3dStatus)} />
            <StatusText>{getStatusText(css3dStatus)}</StatusText>
          </StatusIndicator>

          <WebFBXAvatar
            size={400}
            text={testTexts[currentTestText]}
            onLoad={handleCss3dLoad}
            onError={handleCss3dError}
            style={{ width: '100%', height: 500 }}
          />

          {/* WASD Controls Instructions */}
          <View style={{ 
            marginTop: 15, 
            padding: 10, 
            backgroundColor: 'rgba(0,0,0,0.7)', 
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Text style={{ 
              color: 'white', 
              fontSize: 14, 
              fontWeight: '600',
              marginBottom: 5
            }}>
              🎮 WASD Controls
            </Text>
            <Text style={{ 
              color: '#ccc', 
              fontSize: 12, 
              textAlign: 'center',
              lineHeight: 16
            }}>
              W = Walk Forward • A = Walk Left • S = Walk Back{'\n'}
              D = Walk Right • Release Key = Stop Walking
            </Text>
          </View>
        </AvatarSection>

        <ControlsSection>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '100%' }}>
            {/* Basic Controls */}
            <ControlGroup>
              <GroupTitle>Basic Controls</GroupTitle>
              <ButtonGrid>
          <TestButton onPress={cycleTestText}>
                  <ButtonText>Cycle Text</ButtonText>
          </TestButton>

          <TestButton onPress={() => {
            console.log('🚶‍♂️ STARTING WALKING ANIMATION TEST');
            window.dispatchEvent(new CustomEvent('startWalking'));
          }}>
                  <ButtonText>🚶‍♂️ Start Test</ButtonText>
                </TestButton>
              </ButtonGrid>
            </ControlGroup>

            {/* Animation Speed Controls */}
            <ControlGroup>
              <GroupTitle>Speed Controls</GroupTitle>
              <ButtonGrid>
                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    window.avatarAnimation.setSpeed(0.5);
                    console.log('🐌 Animation slowed to 0.5x speed');
                  }
                }}>
                  <ButtonText>🐌 0.5x</ButtonText>
                </TestButton>

                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    window.avatarAnimation.setSpeed(1.0);
                    console.log('🚶‍♂️ Animation set to normal speed');
                  }
                }}>
                  <ButtonText>🚶‍♂️ 1.0x</ButtonText>
                </TestButton>

                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    window.avatarAnimation.setSpeed(2.0);
                    console.log('🏃‍♂️ Animation sped up to 2.0x speed');
                  }
                }}>
                  <ButtonText>🏃‍♂️ 2.0x</ButtonText>
                </TestButton>
              </ButtonGrid>
            </ControlGroup>

            {/* Animation Playback Controls */}
            <ControlGroup>
              <GroupTitle>Playback</GroupTitle>
              <ButtonGrid>
                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    window.avatarAnimation.play();
                    console.log('🚶‍♂️ Started walking animation');
                  }
                }}>
                  <ButtonText>▶️ Play</ButtonText>
                </TestButton>

                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    if (window.avatarAnimation.isPlaying()) {
                      window.avatarAnimation.pause();
                      console.log('⏸️ Animation paused');
                    } else {
                      window.avatarAnimation.play();
                      console.log('▶️ Animation playing');
                    }
                  }
                }}>
                  <ButtonText>⏸️ Pause</ButtonText>
                </TestButton>

                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    window.avatarAnimation.reset();
                    console.log('🔄 Animation reset');
                  }
                }}>
                  <ButtonText>🔄 Reset</ButtonText>
                </TestButton>
              </ButtonGrid>
            </ControlGroup>

            {/* Continuous Walking Controls */}
            <ControlGroup>
              <GroupTitle>Continuous Walking</GroupTitle>
              <ButtonGrid>
                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    window.avatarAnimation.startContinuousWalking();
                  }
                }}>
                  <ButtonText>🚶‍♂️ Start Walk</ButtonText>
                </TestButton>

                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    window.avatarAnimation.stopContinuousWalking();
                  }
                }}>
                  <ButtonText>🛑 Stop Walk</ButtonText>
                </TestButton>

                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    window.avatarAnimation.toggleContinuousWalking();
                  }
                }}>
                  <ButtonText>🔄 Toggle Walk</ButtonText>
                </TestButton>
              </ButtonGrid>
            </ControlGroup>

            {/* Position Controls */}
            <ControlGroup>
              <GroupTitle>Position</GroupTitle>
              <ButtonGrid>
                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    window.avatarAnimation.resetPosition();
                  }
                }}>
                  <ButtonText>🏠 Reset Position</ButtonText>
                </TestButton>
              </ButtonGrid>
            </ControlGroup>

            {/* Pose Controls */}
            <ControlGroup>
              <GroupTitle>Pose</GroupTitle>
              <ButtonGrid>
                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    window.avatarAnimation.setIdlePose();
                  }
                }}>
                  <ButtonText>🛑 Idle</ButtonText>
                </TestButton>

                <TestButton onPress={() => {
                  if (window.avatarAnimation) {
                    window.avatarAnimation.toggleLooping();
                  }
                }}>
                  <ButtonText>🔄 Loop</ButtonText>
          </TestButton>

                <TestButton onPress={() => {
                  console.log('🔍 Debug: Checking animation state...');
                  if (window.avatarAnimation) {
                    console.log('Is playing:', window.avatarAnimation.isPlaying());
                    console.log('Is idle:', window.avatarAnimation.isIdle());
                    console.log('Speed:', window.avatarAnimation.getSpeed());
                  }
                }}>
                  <ButtonText>🔍 Debug</ButtonText>
                </TestButton>
              </ButtonGrid>
            </ControlGroup>

      </ScrollView>
        </ControlsSection>
      </MainContent>
    </Container>
  );
};

export default AvatarTestPage;