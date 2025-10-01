import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../theme';
import Share from 'react-native-share';

const Container = styled.View`
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

const FeatureGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const FeatureCard = styled.TouchableOpacity`
  width: 48%;
  background-color: ${props => props.theme.colors.surface};
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const FeatureIcon = styled.Text`
  font-size: 32px;
  margin-bottom: 10px;
  text-align: center;
`;

const FeatureTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
  text-align: center;
`;

const FeatureDescription = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  line-height: 18px;
`;

const ProgressSection = styled.View`
  background-color: ${props => props.theme.colors.surface};
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const ProgressTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 15px;
`;

const ProgressBar = styled.View`
  height: 8px;
  background-color: ${props => props.theme.colors.border};
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
`;

const ProgressFill = styled.View`
  height: 100%;
  background-color: ${props => props.theme.colors.primary};
  width: ${props => props.progress}%;
  border-radius: 4px;
`;

const ProgressText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
`;

const AchievementList = styled.View`
  margin-top: 15px;
`;

const AchievementItem = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const AchievementIcon = styled.Text`
  font-size: 20px;
  margin-right: 10px;
`;

const AchievementText = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
`;

const SocialFeatures = ({ userProgress, onShare, onInvite }) => {
  const [achievements, setAchievements] = useState([]);
  const [socialStats, setSocialStats] = useState({
    sessionsCompleted: 0,
    totalPracticeTime: 0,
    improvements: 0,
    streak: 0
  });

  useEffect(() => {
    // Load user achievements and social stats
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Mock data - replace with actual API calls
    setAchievements([
      { id: 1, title: 'First Session', description: 'Completed your first coaching session', icon: '🎯', unlocked: true },
      { id: 2, title: 'Confidence Builder', description: 'Improved confidence score by 20%', icon: '💪', unlocked: true },
      { id: 3, title: 'Practice Streak', description: 'Practice for 7 days in a row', icon: '🔥', unlocked: false },
      { id: 4, title: 'Communication Master', description: 'Achieved 90%+ in communication skills', icon: '🏆', unlocked: false }
    ]);

    setSocialStats({
      sessionsCompleted: 12,
      totalPracticeTime: 180, // minutes
      improvements: 8,
      streak: 5
    });
  };

  const handleShareProgress = async () => {
    try {
      const shareOptions = {
        title: 'My Communication Progress',
        message: `I've completed ${socialStats.sessionsCompleted} coaching sessions and improved my communication skills! 🎯 Join me on this journey to better communication.`,
        url: 'https://parity-app.com/invite',
        type: 'text/plain'
      };

      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share(shareOptions);
        } else {
          // Fallback for browsers without Web Share API
          navigator.clipboard.writeText(shareOptions.message);
          Alert.alert('Copied!', 'Progress message copied to clipboard');
        }
      } else {
        await Share.open(shareOptions);
      }

      if (onShare) {
        onShare('progress');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share progress');
    }
  };

  const handleInviteFriends = async () => {
    try {
      const inviteOptions = {
        title: 'Join Me on Parity',
        message: `I'm using Parity to improve my communication skills and I think you'd love it too! 🚀 It's an AI-powered coaching app that helps with presentations, interviews, and everyday communication.`,
        url: 'https://parity-app.com/invite',
        type: 'text/plain'
      };

      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share(inviteOptions);
        } else {
          navigator.clipboard.writeText(inviteOptions.message);
          Alert.alert('Copied!', 'Invite message copied to clipboard');
        }
      } else {
        await Share.open(inviteOptions);
      }

      if (onInvite) {
        onInvite();
      }
    } catch (error) {
      console.error('Invite error:', error);
      Alert.alert('Error', 'Failed to send invite');
    }
  };

  const handleJoinCommunity = () => {
    Alert.alert(
      'Join Community',
      'Connect with other users, share tips, and get support from the Parity community!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join Discord', onPress: () => openCommunity('discord') },
        { text: 'Join Slack', onPress: () => openCommunity('slack') }
      ]
    );
  };

  const openCommunity = (platform) => {
    const urls = {
      discord: 'https://discord.gg/parity-app',
      slack: 'https://parity-app.slack.com'
    };
    
    if (Platform.OS === 'web') {
      window.open(urls[platform], '_blank');
    } else {
      // Use Linking for React Native
      Linking.openURL(urls[platform]);
    }
  };

  const handleCreateChallenge = () => {
    Alert.alert(
      'Create Challenge',
      'Challenge your friends to improve their communication skills together!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Challenge', onPress: () => showChallengeModal() }
      ]
    );
  };

  const showChallengeModal = () => {
    // This would open a modal to create a challenge
    Alert.alert('Coming Soon', 'Challenge creation feature will be available soon!');
  };

  const calculateProgress = () => {
    const totalPossible = 100; // Maximum possible score
    const currentScore = Math.min(totalPossible, socialStats.sessionsCompleted * 8 + socialStats.improvements * 5);
    return Math.round((currentScore / totalPossible) * 100);
  };

  const features = [
    {
      id: 'share',
      title: 'Share Progress',
      description: 'Share your achievements and motivate others',
      icon: '📊',
      onPress: handleShareProgress
    },
    {
      id: 'invite',
      title: 'Invite Friends',
      description: 'Invite friends to join your communication journey',
      icon: '👥',
      onPress: handleInviteFriends
    },
    {
      id: 'community',
      title: 'Join Community',
      description: 'Connect with other users and share tips',
      icon: '🌐',
      onPress: handleJoinCommunity
    },
    {
      id: 'challenge',
      title: 'Create Challenge',
      description: 'Challenge friends to improve together',
      icon: '🏁',
      onPress: handleCreateChallenge
    }
  ];

  return (
    <Container theme={theme}>
      <Header>
        <Title>Social Features</Title>
        <Subtitle>
          Connect with others, share your progress, and build a community around better communication.
        </Subtitle>
      </Header>

      <FeatureGrid>
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            onPress={feature.onPress}
            theme={theme}
          >
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeatureGrid>

      <ProgressSection theme={theme}>
        <ProgressTitle>Your Progress</ProgressTitle>
        <ProgressBar theme={theme}>
          <ProgressFill progress={calculateProgress()} />
        </ProgressBar>
        <ProgressText>{calculateProgress()}% Complete</ProgressText>
        
        <AchievementList>
          {achievements.map((achievement) => (
            <AchievementItem key={achievement.id} theme={theme}>
              <AchievementIcon>{achievement.icon}</AchievementIcon>
              <AchievementText>{achievement.title}</AchievementText>
              <Text style={{ 
                color: achievement.unlocked ? theme.colors.primary : theme.colors.textSecondary,
                fontSize: 12,
                fontWeight: '600'
              }}>
                {achievement.unlocked ? 'Unlocked' : 'Locked'}
              </Text>
            </AchievementItem>
          ))}
        </AchievementList>
      </ProgressSection>

      <View style={{
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 12,
        marginBottom: 20
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 15
        }}>
          Your Stats
        </Text>
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 15
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.primary }}>
              {socialStats.sessionsCompleted}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              Sessions
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.primary }}>
              {Math.round(socialStats.totalPracticeTime / 60)}h
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              Practice Time
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.primary }}>
              {socialStats.improvements}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              Improvements
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.primary }}>
              {socialStats.streak}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              Day Streak
            </Text>
          </View>
        </View>
      </View>
    </Container>
  );
};

export default SocialFeatures;