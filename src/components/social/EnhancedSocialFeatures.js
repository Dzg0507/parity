import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const Header = styled.View`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  padding-top: 50px;
`;

const HeaderTitle = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
`;

const HeaderSubtitle = styled.Text`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 22px;
`;

const ContentContainer = styled.View`
  padding: 20px;
`;

const TabContainer = styled.View`
  flex-direction: row;
  background-color: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
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

const SectionContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 15px;
`;

const ChallengeCard = styled.View`
  background-color: ${props => props.theme.colors.background};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-left-width: 4px;
  border-left-color: ${props => props.color || props.theme.colors.primary};
`;

const ChallengeTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const ChallengeDescription = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 20px;
  margin-bottom: 12px;
`;

const ChallengeStats = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ChallengeStat = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ChallengeStatText = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: 4px;
`;

const ProgressBar = styled.View`
  height: 6px;
  background-color: ${props => props.theme.colors.border};
  border-radius: 3px;
  margin: 8px 0;
  overflow: hidden;
`;

const ProgressFill = styled.View`
  height: 100%;
  background-color: ${props => props.theme.colors.primary};
  width: ${props => props.progress}%;
  border-radius: 3px;
`;

const FriendCard = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background-color: ${props => props.theme.colors.background};
  border-radius: 12px;
  margin-bottom: 8px;
`;

const FriendAvatar = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => props.theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const FriendInfo = styled.View`
  flex: 1;
`;

const FriendName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 2px;
`;

const FriendStatus = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const FriendScore = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const AchievementCard = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.theme.colors.background};
  border-radius: 12px;
  margin-bottom: 12px;
`;

const AchievementIcon = styled.Text`
  font-size: 24px;
  margin-right: 12px;
`;

const AchievementInfo = styled.View`
  flex: 1;
`;

const AchievementTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

const AchievementDescription = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 18px;
`;

const AchievementDate = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.primary};
  margin-top: 4px;
`;

const LeaderboardItem = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background-color: ${props => props.theme.colors.background};
  border-radius: 12px;
  margin-bottom: 8px;
`;

const RankNumber = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  width: 30px;
  text-align: center;
`;

const LeaderboardInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const LeaderboardName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 2px;
`;

const LeaderboardScore = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const LeaderboardPoints = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
`;

const Button = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  padding: 12px 24px;
  border-radius: 8px;
  align-items: center;
  margin: 8px 0;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 600;
`;

const SecondaryButton = styled.TouchableOpacity`
  background-color: transparent;
  padding: 12px 24px;
  border-radius: 8px;
  border-width: 2px;
  border-color: ${props => props.theme.colors.primary};
  align-items: center;
  margin: 8px 0;
`;

const SecondaryButtonText = styled.Text`
  color: ${props => props.theme.colors.primary};
  font-size: 16px;
  font-weight: 600;
`;

const EnhancedSocialFeatures = () => {
  const [activeTab, setActiveTab] = useState('challenges');
  const [challenges, setChallenges] = useState([]);
  const [friends, setFriends] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = () => {
    // Mock data - replace with actual API calls
    const challengesData = [
      {
        id: 1,
        title: 'Daily Practice Streak',
        description: 'Practice for 7 consecutive days to unlock the "Consistency Champion" badge',
        progress: 5,
        target: 7,
        participants: 1247,
        difficulty: 'easy',
        color: '#4CAF50',
        reward: 'Consistency Champion Badge'
      },
      {
        id: 2,
        title: 'Clarity Master',
        description: 'Achieve 90% clarity score in 5 consecutive sessions',
        progress: 3,
        target: 5,
        participants: 892,
        difficulty: 'medium',
        color: '#2196F3',
        reward: 'Clarity Master Badge'
      },
      {
        id: 3,
        title: 'Confidence Builder',
        description: 'Improve your confidence score by 20% this month',
        progress: 12,
        target: 20,
        participants: 1563,
        difficulty: 'hard',
        color: '#FF9800',
        reward: 'Confidence Builder Badge'
      }
    ];

    const friendsData = [
      {
        id: 1,
        name: 'Sarah Johnson',
        status: 'Active 2 hours ago',
        score: 87,
        avatar: 'SJ'
      },
      {
        id: 2,
        name: 'Mike Chen',
        status: 'Practicing now',
        score: 92,
        avatar: 'MC'
      },
      {
        id: 3,
        name: 'Emily Davis',
        status: 'Active 1 day ago',
        score: 78,
        avatar: 'ED'
      }
    ];

    const achievementsData = [
      {
        id: 1,
        title: 'First Steps',
        description: 'Completed your first practice session',
        icon: '🎯',
        date: '2024-01-15',
        earned: true
      },
      {
        id: 2,
        title: 'Week Warrior',
        description: 'Practiced for 7 consecutive days',
        icon: '🔥',
        date: '2024-01-22',
        earned: true
      },
      {
        id: 3,
        title: 'Clarity Champion',
        description: 'Achieved 85%+ clarity score',
        icon: '🏆',
        date: '2024-01-25',
        earned: true
      },
      {
        id: 4,
        title: 'Social Butterfly',
        description: 'Invited 5 friends to join',
        icon: '🦋',
        date: null,
        earned: false
      }
    ];

    const leaderboardData = [
      { rank: 1, name: 'Alex Thompson', score: 95, points: 2847 },
      { rank: 2, name: 'Sarah Johnson', score: 92, points: 2654 },
      { rank: 3, name: 'Mike Chen', score: 90, points: 2432 },
      { rank: 4, name: 'Emily Davis', score: 88, points: 2198 },
      { rank: 5, name: 'David Wilson', score: 85, points: 1987 }
    ];

    setChallenges(challengesData);
    setFriends(friendsData);
    setAchievements(achievementsData);
    setLeaderboard(leaderboardData);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return theme.colors.primary;
    }
  };

  const renderChallengesTab = () => (
    <View>
      <SectionContainer theme={theme}>
        <SectionTitle>Active Challenges</SectionTitle>
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} color={challenge.color} theme={theme}>
            <ChallengeTitle>{challenge.title}</ChallengeTitle>
            <ChallengeDescription>{challenge.description}</ChallengeDescription>
            <ProgressBar theme={theme}>
              <ProgressFill 
                progress={(challenge.progress / challenge.target) * 100} 
                theme={theme} 
              />
            </ProgressBar>
            <ChallengeStats>
              <ChallengeStat>
                <Text style={{ fontSize: 12, color: theme.colors.primary }}>
                  {challenge.progress}/{challenge.target}
                </Text>
              </ChallengeStat>
              <ChallengeStat>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                  👥 {challenge.participants} participants
                </Text>
              </ChallengeStat>
            </ChallengeStats>
          </ChallengeCard>
        ))}
      </SectionContainer>

      <Button theme={theme}>
        <ButtonText>Create New Challenge</ButtonText>
      </Button>
    </View>
  );

  const renderFriendsTab = () => (
    <View>
      <SectionContainer theme={theme}>
        <SectionTitle>Friends & Connections</SectionTitle>
        {friends.map((friend) => (
          <FriendCard key={friend.id} theme={theme}>
            <FriendAvatar theme={theme}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                {friend.avatar}
              </Text>
            </FriendAvatar>
            <FriendInfo>
              <FriendName>{friend.name}</FriendName>
              <FriendStatus>{friend.status}</FriendStatus>
            </FriendInfo>
            <FriendScore>{friend.score}%</FriendScore>
          </FriendCard>
        ))}
      </SectionContainer>

      <Button theme={theme}>
        <ButtonText>Invite Friends</ButtonText>
      </Button>
      <SecondaryButton theme={theme}>
        <SecondaryButtonText>Find Practice Partners</SecondaryButtonText>
      </SecondaryButton>
    </View>
  );

  const renderAchievementsTab = () => (
    <View>
      <SectionContainer theme={theme}>
        <SectionTitle>Your Achievements</SectionTitle>
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} theme={theme}>
            <AchievementIcon>{achievement.icon}</AchievementIcon>
            <AchievementInfo>
              <AchievementTitle>{achievement.title}</AchievementTitle>
              <AchievementDescription>{achievement.description}</AchievementDescription>
              {achievement.earned && achievement.date && (
                <AchievementDate>
                  Earned on {new Date(achievement.date).toLocaleDateString()}
                </AchievementDate>
              )}
            </AchievementInfo>
          </AchievementCard>
        ))}
      </SectionContainer>
    </View>
  );

  const renderLeaderboardTab = () => (
    <View>
      <SectionContainer theme={theme}>
        <SectionTitle>Weekly Leaderboard</SectionTitle>
        {leaderboard.map((item) => (
          <LeaderboardItem key={item.rank} theme={theme}>
            <RankNumber>{item.rank}</RankNumber>
            <LeaderboardInfo>
              <LeaderboardName>{item.name}</LeaderboardName>
              <LeaderboardScore>Average Score: {item.score}%</LeaderboardScore>
            </LeaderboardInfo>
            <LeaderboardPoints>{item.points} pts</LeaderboardPoints>
          </LeaderboardItem>
        ))}
      </SectionContainer>

      <SectionContainer theme={theme}>
        <SectionTitle>Your Ranking</SectionTitle>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          padding: 16px,
          backgroundColor: theme.colors.background,
          borderRadius: 12px
        }}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>🏆</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text }}>
              You're #12 this week!
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
              Keep practicing to climb higher!
            </Text>
          </View>
        </View>
      </SectionContainer>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'challenges':
        return renderChallengesTab();
      case 'friends':
        return renderFriendsTab();
      case 'achievements':
        return renderAchievementsTab();
      case 'leaderboard':
        return renderLeaderboardTab();
      default:
        return renderChallengesTab();
    }
  };

  return (
    <Container theme={theme}>
      <Header>
        <HeaderTitle>Social Learning</HeaderTitle>
        <HeaderSubtitle>
          Connect with others, compete in challenges, and celebrate your achievements together.
        </HeaderSubtitle>
      </Header>

      <ContentContainer>
        <TabContainer theme={theme}>
          <Tab
            active={activeTab === 'challenges'}
            onPress={() => setActiveTab('challenges')}
            theme={theme}
          >
            <TabText active={activeTab === 'challenges'}>Challenges</TabText>
          </Tab>
          <Tab
            active={activeTab === 'friends'}
            onPress={() => setActiveTab('friends')}
            theme={theme}
          >
            <TabText active={activeTab === 'friends'}>Friends</TabText>
          </Tab>
          <Tab
            active={activeTab === 'achievements'}
            onPress={() => setActiveTab('achievements')}
            theme={theme}
          >
            <TabText active={activeTab === 'achievements'}>Achievements</TabText>
          </Tab>
          <Tab
            active={activeTab === 'leaderboard'}
            onPress={() => setActiveTab('leaderboard')}
            theme={theme}
          >
            <TabText active={activeTab === 'leaderboard'}>Leaderboard</TabText>
          </Tab>
        </TabContainer>

        {renderTabContent()}
      </ContentContainer>
    </Container>
  );
};

export default EnhancedSocialFeatures;