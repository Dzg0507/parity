import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
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

const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 25px;
`;

const StatCard = styled.View`
  width: 48%;
  background-color: ${props => props.theme.colors.surface};
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 15px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 4;
`;

const StatValue = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: ${props => props.color || props.theme.colors.primary};
  margin-bottom: 5px;
`;

const StatLabel = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
`;

const StatChange = styled.Text`
  font-size: 12px;
  color: ${props => props.positive ? '#4CAF50' : '#F44336'};
  font-weight: 600;
  margin-top: 5px;
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

const SkillItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const SkillName = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

const SkillScore = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
`;

const ProgressBar = styled.View`
  height: 8px;
  background-color: ${props => props.theme.colors.border};
  border-radius: 4px;
  margin: 10px 0;
  overflow: hidden;
`;

const ProgressFill = styled.View`
  height: 100%;
  background-color: ${props => props.theme.colors.primary};
  width: ${props => props.progress}%;
  border-radius: 4px;
`;

const InsightItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 15px;
  padding: 15px;
  background-color: ${props => props.theme.colors.background};
  border-radius: 12px;
`;

const InsightIcon = styled.Text`
  font-size: 24px;
  margin-right: 12px;
  margin-top: 2px;
`;

const InsightContent = styled.View`
  flex: 1;
`;

const InsightTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 5px;
`;

const InsightText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 20px;
`;

const GoalItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const GoalText = styled.Text`
  flex: 1;
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

const GoalStatus = styled.Text`
  font-size: 14px;
  color: ${props => props.completed ? '#4CAF50' : props.theme.colors.textSecondary};
  font-weight: 600;
`;

const ChartContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
`;

const ChartTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 15px;
`;

const WeeklyChart = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
`;

const DayColumn = styled.View`
  align-items: center;
  flex: 1;
`;

const DayLabel = styled.Text`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 12px;
  margin-bottom: 8px;
  font-weight: 500;
`;

const DayBar = styled.View`
  width: 20px;
  height: ${props => props.height}px;
  background-color: ${props => props.color};
  border-radius: 2px;
  margin-bottom: 5px;
`;

const DayValue = styled.Text`
  color: ${props => props.theme.colors.text};
  font-size: 10px;
  font-weight: 600;
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

const AdvancedAnalytics = ({ userId, timeRange = 'week' }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [userId, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Enhanced mock data with more comprehensive analytics
      const data = {
        overview: {
          totalSessions: 47,
          totalTime: 420, // minutes
          averageScore: 82,
          improvement: 23,
          streak: 12,
          weeklyGoal: 5,
          weeklyProgress: 4,
          monthlyGoal: 20,
          monthlyProgress: 18
        },
        skills: [
          { name: 'Clarity', score: 88, trend: 'up', improvement: 15, target: 90 },
          { name: 'Confidence', score: 76, trend: 'up', improvement: 8, target: 85 },
          { name: 'Pace', score: 72, trend: 'up', improvement: 12, target: 80 },
          { name: 'Engagement', score: 85, trend: 'up', improvement: 18, target: 90 },
          { name: 'Structure', score: 79, trend: 'up', improvement: 10, target: 85 },
          { name: 'Emotional Intelligence', score: 81, trend: 'up', improvement: 14, target: 88 }
        ],
        weeklyProgress: [
          { day: 'Mon', score: 75, height: 75 },
          { day: 'Tue', score: 78, height: 78 },
          { day: 'Wed', score: 82, height: 82 },
          { day: 'Thu', score: 85, height: 85 },
          { day: 'Fri', score: 88, height: 88 },
          { day: 'Sat', score: 90, height: 90 },
          { day: 'Sun', score: 87, height: 87 }
        ],
        insights: [
          {
            type: 'achievement',
            icon: '🎯',
            title: 'Clarity Breakthrough',
            text: 'Your clarity score improved by 15% this week - you\'re now in the top 20% of users!'
          },
          {
            type: 'suggestion',
            icon: '💡',
            title: 'Pace Optimization',
            text: 'Focus on speaking 10% slower during presentations for better audience comprehension.'
          },
          {
            type: 'motivation',
            icon: '🔥',
            title: 'Streak Master',
            text: 'You\'ve maintained a 12-day practice streak - keep the momentum going!'
          },
          {
            type: 'growth',
            icon: '📈',
            title: 'Rapid Improvement',
            text: 'Your overall communication skills have improved 23% this month - excellent progress!'
          }
        ],
        goals: [
          { text: 'Complete 5 sessions this week', completed: true, progress: 4, target: 5 },
          { text: 'Improve confidence score to 85%', completed: false, progress: 76, target: 85 },
          { text: 'Practice for 30 minutes daily', completed: true, progress: 100, target: 100 },
          { text: 'Master presentation skills', completed: false, progress: 72, target: 80 },
          { text: 'Reduce filler words by 50%', completed: true, progress: 100, target: 100 }
        ],
        achievements: [
          { name: 'First Steps', description: 'Completed your first session', earned: true, date: '2024-01-15' },
          { name: 'Week Warrior', description: 'Practiced for 7 consecutive days', earned: true, date: '2024-01-22' },
          { name: 'Clarity Champion', description: 'Achieved 85%+ clarity score', earned: true, date: '2024-01-25' },
          { name: 'Confidence Builder', description: 'Improved confidence by 20%', earned: false, date: null },
          { name: 'Presentation Pro', description: 'Mastered presentation skills', earned: false, date: null }
        ],
        recommendations: [
          'Try the "Power Pause" technique to reduce filler words',
          'Practice the "Confidence Stance" before important conversations',
          'Use the "Clarity Check" method for complex topics',
          'Join a practice group to accelerate your learning'
        ]
      };
      
      setAnalyticsData(data);
    } catch (error) {
      console.error('Analytics loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
  };

  const renderOverviewTab = () => (
    <View>
      <StatsGrid>
        <StatCard theme={theme}>
          <StatValue color={theme.colors.primary}>
            {analyticsData.overview.totalSessions}
          </StatValue>
          <StatLabel>Total Sessions</StatLabel>
          <StatChange positive={analyticsData.overview.improvement > 0}>
            +{analyticsData.overview.improvement}% this month
          </StatChange>
        </StatCard>

        <StatCard theme={theme}>
          <StatValue color={theme.colors.primary}>
            {Math.round(analyticsData.overview.totalTime / 60)}h
          </StatValue>
          <StatLabel>Practice Time</StatLabel>
          <StatChange positive={true}>
            +3h this week
          </StatChange>
        </StatCard>

        <StatCard theme={theme}>
          <StatValue color={getScoreColor(analyticsData.overview.averageScore)}>
            {analyticsData.overview.averageScore}%
          </StatValue>
          <StatLabel>Average Score</StatLabel>
          <StatChange positive={true}>
            +8% improvement
          </StatChange>
        </StatCard>

        <StatCard theme={theme}>
          <StatValue color={theme.colors.primary}>
            {analyticsData.overview.streak}
          </StatValue>
          <StatLabel>Day Streak</StatLabel>
          <StatChange positive={true}>
            🔥 Keep going!
          </StatChange>
        </StatCard>
      </StatsGrid>

      <SectionContainer theme={theme}>
        <SectionTitle>Skill Breakdown</SectionTitle>
        {analyticsData.skills.map((skill, index) => (
          <View key={index}>
            <SkillItem theme={theme}>
              <SkillName>{skill.name}</SkillName>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SkillScore color={getScoreColor(skill.score)}>
                  {skill.score}%
                </SkillScore>
                <Text style={{ marginLeft: 8, fontSize: 16 }}>
                  {getTrendIcon(skill.trend)}
                </Text>
              </View>
            </SkillItem>
            <ProgressBar theme={theme}>
              <ProgressFill progress={skill.score} theme={theme} />
            </ProgressBar>
          </View>
        ))}
      </SectionContainer>

      <ChartContainer theme={theme}>
        <ChartTitle>Weekly Progress</ChartTitle>
        <WeeklyChart>
          {analyticsData.weeklyProgress.map((day, index) => (
            <DayColumn key={index}>
              <DayLabel theme={theme}>{day.day}</DayLabel>
              <DayBar height={day.height} color={getScoreColor(day.score)} />
              <DayValue theme={theme}>{day.score}</DayValue>
            </DayColumn>
          ))}
        </WeeklyChart>
      </ChartContainer>
    </View>
  );

  const renderInsightsTab = () => (
    <View>
      <SectionContainer theme={theme}>
        <SectionTitle>AI Insights</SectionTitle>
        {analyticsData.insights.map((insight, index) => (
          <InsightItem key={index} theme={theme}>
            <InsightIcon>{insight.icon}</InsightIcon>
            <InsightContent>
              <InsightTitle>{insight.title}</InsightTitle>
              <InsightText>{insight.text}</InsightText>
            </InsightContent>
          </InsightItem>
        ))}
      </SectionContainer>

      <SectionContainer theme={theme}>
        <SectionTitle>Recommendations</SectionTitle>
        {analyticsData.recommendations.map((rec, index) => (
          <View key={index} style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingVertical: 10,
            borderBottomWidth: index < analyticsData.recommendations.length - 1 ? 1 : 0,
            borderBottomColor: theme.colors.border
          }}>
            <Text style={{ marginRight: 10, fontSize: 16 }}>💡</Text>
            <Text style={{ 
              flex: 1, 
              fontSize: 14, 
              color: theme.colors.text,
              lineHeight: 20
            }}>
              {rec}
            </Text>
          </View>
        ))}
      </SectionContainer>
    </View>
  );

  const renderGoalsTab = () => (
    <View>
      <SectionContainer theme={theme}>
        <SectionTitle>Goals & Progress</SectionTitle>
        {analyticsData.goals.map((goal, index) => (
          <View key={index}>
            <GoalItem theme={theme}>
              <GoalText>{goal.text}</GoalText>
              <View style={{ alignItems: 'flex-end' }}>
                <GoalStatus completed={goal.completed}>
                  {goal.completed ? '✅ Completed' : `${goal.progress}/${goal.target}`}
                </GoalStatus>
                {!goal.completed && (
                  <ProgressBar theme={theme} style={{ width: 60, marginTop: 5 }}>
                    <ProgressFill 
                      progress={(goal.progress / goal.target) * 100} 
                      theme={theme} 
                    />
                  </ProgressBar>
                )}
              </View>
            </GoalItem>
          </View>
        ))}
      </SectionContainer>

      <SectionContainer theme={theme}>
        <SectionTitle>Achievements</SectionTitle>
        {analyticsData.achievements.map((achievement, index) => (
          <View key={index} style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingVertical: 12,
            borderBottomWidth: index < analyticsData.achievements.length - 1 ? 1 : 0,
            borderBottomColor: theme.colors.border
          }}>
            <Text style={{ 
              marginRight: 12, 
              fontSize: 20,
              opacity: achievement.earned ? 1 : 0.3
            }}>
              {achievement.earned ? '🏆' : '🔒'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: theme.colors.text,
                opacity: achievement.earned ? 1 : 0.6
              }}>
                {achievement.name}
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: theme.colors.textSecondary,
                marginTop: 2
              }}>
                {achievement.description}
              </Text>
              {achievement.earned && achievement.date && (
                <Text style={{ 
                  fontSize: 12, 
                  color: theme.colors.primary,
                  marginTop: 2
                }}>
                  Earned on {new Date(achievement.date).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        ))}
      </SectionContainer>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'insights':
        return renderInsightsTab();
      case 'goals':
        return renderGoalsTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading || !analyticsData) {
    return (
      <Container theme={theme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16 }}>Loading analytics...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container theme={theme}>
      <Header>
        <HeaderTitle>Advanced Analytics</HeaderTitle>
        <HeaderSubtitle>
          Track your progress and discover insights to improve your communication skills.
        </HeaderSubtitle>
      </Header>

      <ContentContainer>
        <TabContainer theme={theme}>
          <Tab
            active={activeTab === 'overview'}
            onPress={() => setActiveTab('overview')}
            theme={theme}
          >
            <TabText active={activeTab === 'overview'}>Overview</TabText>
          </Tab>
          <Tab
            active={activeTab === 'insights'}
            onPress={() => setActiveTab('insights')}
            theme={theme}
          >
            <TabText active={activeTab === 'insights'}>Insights</TabText>
          </Tab>
          <Tab
            active={activeTab === 'goals'}
            onPress={() => setActiveTab('goals')}
            theme={theme}
          >
            <TabText active={activeTab === 'goals'}>Goals</TabText>
          </Tab>
        </TabContainer>

        {renderTabContent()}
      </ContentContainer>
    </Container>
  );
};

export default AdvancedAnalytics;