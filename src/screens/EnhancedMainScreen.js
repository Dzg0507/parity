import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../theme';

// Import enhanced components
import Enhanced3DAvatar from '../components/ai/Enhanced3DAvatar';
import SocialFeatures from '../components/social/SocialFeatures';
import AdvancedAnalytics from '../components/analytics/AdvancedAnalytics';
import EnhancedSocialFeatures from '../components/social/EnhancedSocialFeatures';
import AccessibilityFeatures from '../components/accessibility/AccessibilityFeatures';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const Header = styled.View`
  background-color: ${props => props.theme.colors.primary};
  padding: ${Platform.OS === 'ios' ? '50px 20px 20px' : '20px'};
  padding-top: ${Platform.OS === 'ios' ? '50px' : '20px'};
`;

const HeaderContent = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const WelcomeText = styled.Text`
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Subtitle = styled.Text`
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
`;

const MenuButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  justify-content: center;
  align-items: center;
`;

const TabContainer = styled.View`
  flex-direction: row;
  background-color: ${props => props.theme.colors.surface};
  margin: 20px;
  border-radius: 12px;
  padding: 4px;
`;

const Tab = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  background-color: ${props => props.active ? props.theme.colors.primary : 'transparent'};
`;

const TabText = styled.Text`
  color: ${props => props.active ? 'white' : props.theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 600;
`;

const ContentContainer = styled.View`
  flex: 1;
  padding: 0 20px 20px;
`;

const QuickActions = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const QuickActionButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${props => props.theme.colors.surface};
  padding: 20px;
  border-radius: 12px;
  margin: 0 5px;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const QuickActionIcon = styled.Text`
  font-size: 32px;
  margin-bottom: 10px;
`;

const QuickActionText = styled.Text`
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`;

const StatsContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const StatsTitle = styled.Text`
  color: ${props => props.theme.colors.text};
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StatItem = styled.View`
  flex: 1;
  align-items: center;
`;

const StatValue = styled.Text`
  color: ${props => props.theme.colors.primary};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const StatLabel = styled.Text`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 12px;
  text-align: center;
`;

const AvatarContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  align-items: center;
`;

const AvatarTitle = styled.Text`
  color: ${props => props.theme.colors.text};
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const CoachingModeSelector = styled.View`
  flex-direction: row;
  margin-bottom: 15px;
`;

const ModeButton = styled.TouchableOpacity`
  padding: 8px 16px;
  border-radius: 20px;
  margin: 0 5px;
  background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
`;

const ModeButtonText = styled.Text`
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  font-size: 12px;
  font-weight: 600;
`;

const EnhancedMainScreen = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [coachingMode, setCoachingMode] = useState('communication');
  const [userStats, setUserStats] = useState({
    sessionsCompleted: 12,
    totalTime: 180,
    averageScore: 78,
    streak: 7
  });

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'coaching', label: 'Coaching', icon: '🎯' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const coachingModes = [
    { id: 'communication', label: 'Communication' },
    { id: 'presentation', label: 'Presentation' },
    { id: 'interview', label: 'Interview' }
  ];

  const quickActions = [
    {
      id: 'start-session',
      icon: '🚀',
      label: 'Start Session',
      onPress: () => setActiveTab('coaching')
    },
    {
      id: 'view-progress',
      icon: '📈',
      label: 'View Progress',
      onPress: () => setActiveTab('analytics')
    },
    {
      id: 'share-achievement',
      icon: '🏆',
      label: 'Share Achievement',
      onPress: () => setActiveTab('social')
    }
  ];

  const renderHomeTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <QuickActions>
        {quickActions.map((action) => (
          <QuickActionButton
            key={action.id}
            onPress={action.onPress}
            theme={theme}
          >
            <QuickActionIcon>{action.icon}</QuickActionIcon>
            <QuickActionText>{action.label}</QuickActionText>
          </QuickActionButton>
        ))}
      </QuickActions>

      <StatsContainer theme={theme}>
        <StatsTitle>Your Progress</StatsTitle>
        <StatsRow>
          <StatItem>
            <StatValue theme={theme}>{userStats.sessionsCompleted}</StatValue>
            <StatLabel>Sessions</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue theme={theme}>{Math.round(userStats.totalTime / 60)}h</StatValue>
            <StatLabel>Practice Time</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue theme={theme}>{userStats.averageScore}%</StatValue>
            <StatLabel>Avg Score</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue theme={theme}>{userStats.streak}</StatValue>
            <StatLabel>Day Streak</StatLabel>
          </StatItem>
        </StatsRow>
      </StatsContainer>

      <AvatarContainer theme={theme}>
        <AvatarTitle>AI Coach</AvatarTitle>
        <CoachingModeSelector>
          {coachingModes.map((mode) => (
            <ModeButton
              key={mode.id}
              active={coachingMode === mode.id}
              onPress={() => setCoachingMode(mode.id)}
              theme={theme}
            >
              <ModeButtonText active={coachingMode === mode.id}>
                {mode.label}
              </ModeButtonText>
            </ModeButton>
          ))}
        </CoachingModeSelector>
        
        <Enhanced3DAvatar
          size={Math.min(screenWidth - 80, 300)}
          coachingMode={coachingMode}
          enableVoice={true}
          enableAI={true}
          personality="supportive"
        />
      </AvatarContainer>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeTab();
      case 'coaching':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Enhanced3DAvatar
              size={Math.min(screenWidth - 40, screenHeight - 200)}
              coachingMode={coachingMode}
              enableVoice={true}
              enableAI={true}
              personality="supportive"
            />
          </View>
        );
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'social':
        return <EnhancedSocialFeatures />;
      case 'settings':
        return <AccessibilityFeatures />;
      default:
        return renderHomeTab();
    }
  };

  return (
    <Container theme={theme}>
      <Header theme={theme}>
        <HeaderContent>
          <View>
            <WelcomeText>Welcome back!</WelcomeText>
            <Subtitle>Ready to improve your communication skills?</Subtitle>
          </View>
          <MenuButton>
            <Text style={{ color: 'white', fontSize: 20 }}>☰</Text>
          </MenuButton>
        </HeaderContent>
      </Header>

      <TabContainer theme={theme}>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onPress={() => setActiveTab(tab.id)}
            theme={theme}
          >
            <TabText active={activeTab === tab.id}>
              {tab.icon} {tab.label}
            </TabText>
          </Tab>
        ))}
      </TabContainer>

      <ContentContainer theme={theme}>
        {renderTabContent()}
      </ContentContainer>
    </Container>
  );
};

export default EnhancedMainScreen;