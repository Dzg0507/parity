import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../theme';

const { width: screenWidth } = Dimensions.get('window');

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

const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const StatCard = styled.View`
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

const ChartContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const ChartTitle = styled.Text`
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

const InsightsContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const InsightItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const InsightIcon = styled.Text`
  font-size: 20px;
  margin-right: 10px;
  margin-top: 2px;
`;

const InsightText = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  line-height: 20px;
`;

const GoalContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const GoalItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const GoalText = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
`;

const GoalStatus = styled.Text`
  font-size: 12px;
  color: ${props => props.completed ? '#4CAF50' : props.theme.colors.textSecondary};
  font-weight: 600;
`;

const EnhancedAnalytics = ({ userId, timeRange = 'week' }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [userId, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const data = {
        overview: {
          totalSessions: 24,
          totalTime: 180, // minutes
          averageScore: 78,
          improvement: 15,
          streak: 7
        },
        skills: [
          { name: 'Clarity', score: 85, trend: 'up' },
          { name: 'Confidence', score: 72, trend: 'up' },
          { name: 'Pace', score: 68, trend: 'down' },
          { name: 'Engagement', score: 81, trend: 'up' },
          { name: 'Structure', score: 76, trend: 'up' }
        ],
        weeklyProgress: [
          { day: 'Mon', score: 70 },
          { day: 'Tue', score: 75 },
          { day: 'Wed', score: 78 },
          { day: 'Thu', score: 82 },
          { day: 'Fri', score: 80 },
          { day: 'Sat', score: 85 },
          { day: 'Sun', score: 88 }
        ],
        insights: [
          {
            type: 'positive',
            icon: '🎯',
            text: 'Your clarity has improved by 20% this week - excellent progress!'
          },
          {
            type: 'suggestion',
            icon: '💡',
            text: 'Focus on pacing - try speaking 10% slower for better comprehension.'
          },
          {
            type: 'achievement',
            icon: '🏆',
            text: 'You\'ve maintained a 7-day practice streak - keep it up!'
          }
        ],
        goals: [
          { text: 'Complete 5 sessions this week', completed: true },
          { text: 'Improve confidence score to 80%', completed: false },
          { text: 'Practice for 30 minutes daily', completed: true },
          { text: 'Master presentation skills', completed: false }
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
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
  };

  if (loading || !analyticsData) {
    return (
      <Container theme={theme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text, fontSize: 16 }}>Loading analytics...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container theme={theme}>
      <Header>
        <Title>Analytics Dashboard</Title>
        <Subtitle>
          Track your progress and discover insights to improve your communication skills.
        </Subtitle>
      </Header>

      <StatsGrid>
        <StatCard theme={theme}>
          <StatValue color={theme.colors.primary}>
            {analyticsData.overview.totalSessions}
          </StatValue>
          <StatLabel>Total Sessions</StatLabel>
          <StatChange positive={analyticsData.overview.improvement > 0}>
            +{analyticsData.overview.improvement}% this week
          </StatChange>
        </StatCard>

        <StatCard theme={theme}>
          <StatValue color={theme.colors.primary}>
            {Math.round(analyticsData.overview.totalTime / 60)}h
          </StatValue>
          <StatLabel>Practice Time</StatLabel>
          <StatChange positive={true}>
            +2h this week
          </StatChange>
        </StatCard>

        <StatCard theme={theme}>
          <StatValue color={getScoreColor(analyticsData.overview.averageScore)}>
            {analyticsData.overview.averageScore}%
          </StatValue>
          <StatLabel>Average Score</StatLabel>
          <StatChange positive={true}>
            +5% improvement
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

      <ChartContainer theme={theme}>
        <ChartTitle>Skill Breakdown</ChartTitle>
        {analyticsData.skills.map((skill, index) => (
          <SkillItem key={index} theme={theme}>
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
        ))}
      </ChartContainer>

      <ChartContainer theme={theme}>
        <ChartTitle>Weekly Progress</ChartTitle>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          {analyticsData.weeklyProgress.map((day, index) => (
            <View key={index} style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ 
                color: theme.colors.textSecondary, 
                fontSize: 12, 
                marginBottom: 5 
              }}>
                {day.day}
              </Text>
              <View style={{
                width: 20,
                height: day.score * 2,
                backgroundColor: getScoreColor(day.score),
                borderRadius: 2,
                marginBottom: 5
              }} />
              <Text style={{ 
                color: theme.colors.text, 
                fontSize: 10, 
                fontWeight: '600' 
              }}>
                {day.score}
              </Text>
            </View>
          ))}
        </View>
      </ChartContainer>

      <InsightsContainer theme={theme}>
        <ChartTitle>AI Insights</ChartTitle>
        {analyticsData.insights.map((insight, index) => (
          <InsightItem key={index}>
            <InsightIcon>{insight.icon}</InsightIcon>
            <InsightText>{insight.text}</InsightText>
          </InsightItem>
        ))}
      </InsightsContainer>

      <GoalContainer theme={theme}>
        <ChartTitle>Goals & Achievements</ChartTitle>
        {analyticsData.goals.map((goal, index) => (
          <GoalItem key={index} theme={theme}>
            <GoalText>{goal.text}</GoalText>
            <GoalStatus completed={goal.completed}>
              {goal.completed ? '✅ Completed' : '⏳ In Progress'}
            </GoalStatus>
          </GoalItem>
        ))}
      </GoalContainer>
    </Container>
  );
};

export default EnhancedAnalytics;