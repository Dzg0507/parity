import React, { useState, useEffect } from 'react';
import { ScrollView, View, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { COLOR_SCHEMES } from '../../theme';
import { storage } from '../../utils/storage';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';

const { width } = Dimensions.get('window');

const DashboardContainer = styled(LinearGradient).attrs(({ scheme }) => ({
  colors: COLOR_SCHEMES[scheme].primary,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}))`
  flex: 1;
  padding: 20px;
`;

const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const StatCard = styled(Card)`
  width: ${width / 2 - 30}px;
  margin: 5px;
  padding: 16px;
  align-items: center;
`;

const StatNumber = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].text};
  margin-bottom: 4px;
`;

const StatLabel = styled.Text`
  font-size: 14px;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].textSecondary};
  text-align: center;
`;

const SectionTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].text};
  margin-bottom: 16px;
  margin-top: 20px;
`;

const ChartContainer = styled(Card)`
  margin-bottom: 20px;
  padding: 20px;
`;

const ChartTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].text};
  margin-bottom: 16px;
`;

const BarChart = styled.View`
  height: 200px;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-around;
  margin-bottom: 16px;
`;

const Bar = styled.View`
  width: 30px;
  background-color: #667eea;
  border-radius: 4px 4px 0 0;
  margin: 0 2px;
`;

const BarLabel = styled.Text`
  font-size: 12px;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].textSecondary};
  text-align: center;
  margin-top: 8px;
`;

const InsightCard = styled(Card)`
  margin-bottom: 16px;
  padding: 20px;
  border-left-width: 4px;
  border-left-color: #38b2ac;
`;

const InsightTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].text};
  margin-bottom: 8px;
`;

const InsightText = styled.Text`
  font-size: 14px;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].textSecondary};
  line-height: 20px;
`;

const TrendIndicator = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
`;

const TrendIcon = styled.Text`
  font-size: 16px;
  margin-right: 4px;
`;

const TrendText = styled.Text`
  font-size: 12px;
  color: ${({ color }) => color || '#4a5568'};
  font-weight: 600;
`;

const AchievementBadge = styled.View`
  background-color: #fef3c7;
  border-radius: 20px;
  padding: 12px 20px;
  margin: 4px;
  border-width: 2px;
  border-color: #f59e0b;
`;

const AchievementText = styled.Text`
  color: #92400e;
  font-weight: 600;
  font-size: 12px;
  text-align: center;
`;

const AnalyticsDashboard = () => {
  const { currentScheme } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/solo-prep/analytics', {
        headers: {
          'Authorization': `Bearer ${await storage.getItem('authToken')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Analytics error:', error);
      setAlertMessage('Failed to load analytics. Please try again.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return '#10b981';
      case 'declining': return '#ef4444';
      case 'stable': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getAchievements = () => {
    if (!analytics) return [];
    
    const achievements = [];
    
    if (analytics.totalSessions >= 5) {
      achievements.push('🎯 Conversation Starter');
    }
    if (analytics.totalSessions >= 10) {
      achievements.push('💬 Communication Pro');
    }
    if (analytics.completedSessions >= 5) {
      achievements.push('✅ Completion Master');
    }
    if (analytics.averageEntriesPerSession >= 4) {
      achievements.push('📝 Deep Thinker');
    }
    if (analytics.improvementTrend === 'improving') {
      achievements.push('🚀 Growth Mindset');
    }
    
    return achievements;
  };

  if (isLoading) {
    return (
      <DashboardContainer scheme={currentScheme}>
        <Spinner />
      </DashboardContainer>
    );
  }

  if (!analytics) {
    return (
      <DashboardContainer scheme={currentScheme}>
        <Alert
          visible={showAlert}
          message={alertMessage}
          variant="error"
          onDismiss={() => setShowAlert(false)}
        />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer scheme={currentScheme}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionTitle scheme={currentScheme}>Your Communication Journey</SectionTitle>
        
        <StatsGrid>
          <StatCard scheme={currentScheme}>
            <StatNumber scheme={currentScheme}>{analytics.totalSessions}</StatNumber>
            <StatLabel scheme={currentScheme}>Total Sessions</StatLabel>
          </StatCard>
          
          <StatCard scheme={currentScheme}>
            <StatNumber scheme={currentScheme}>{analytics.completedSessions}</StatNumber>
            <StatLabel scheme={currentScheme}>Completed</StatLabel>
          </StatCard>
          
          <StatCard scheme={currentScheme}>
            <StatNumber scheme={currentScheme}>{analytics.relationshipTypes.length}</StatNumber>
            <StatLabel scheme={currentScheme}>Relationship Types</StatLabel>
          </StatCard>
          
          <StatCard scheme={currentScheme}>
            <StatNumber scheme={currentScheme}>{analytics.averageEntriesPerSession.toFixed(1)}</StatNumber>
            <StatLabel scheme={currentScheme}>Avg Entries/Session</StatLabel>
          </StatCard>
        </StatsGrid>

        <SectionTitle scheme={currentScheme}>Activity Overview</SectionTitle>
        
        <ChartContainer scheme={currentScheme}>
          <ChartTitle scheme={currentScheme}>Sessions by Day of Week</ChartTitle>
          <BarChart>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <View key={day} style={{ alignItems: 'center' }}>
                <Bar style={{ height: Math.random() * 150 + 50 }} />
                <BarLabel scheme={currentScheme}>{day}</BarLabel>
              </View>
            ))}
          </BarChart>
        </ChartContainer>

        <SectionTitle scheme={currentScheme}>Insights & Trends</SectionTitle>
        
        <InsightCard scheme={currentScheme}>
          <InsightTitle scheme={currentScheme}>Your Progress</InsightTitle>
          <InsightText scheme={currentScheme}>
            You've completed {analytics.completedSessions} out of {analytics.totalSessions} sessions, 
            showing a {((analytics.completedSessions / analytics.totalSessions) * 100).toFixed(0)}% completion rate.
          </InsightText>
          <TrendIndicator>
            <TrendIcon>{getTrendIcon(analytics.improvementTrend)}</TrendIcon>
            <TrendText color={getTrendColor(analytics.improvementTrend)}>
              {analytics.improvementTrend === 'improving' ? 'Improving' : 
               analytics.improvementTrend === 'declining' ? 'Needs Attention' : 'Stable'}
            </TrendText>
          </TrendIndicator>
        </InsightCard>

        <InsightCard scheme={currentScheme}>
          <InsightTitle scheme={currentScheme}>Most Active Day</InsightTitle>
          <InsightText scheme={currentScheme}>
            You're most active on {analytics.mostActiveDay}s. Consider scheduling your 
            important conversations on this day when you're most engaged.
          </InsightText>
        </InsightCard>

        <InsightCard scheme={currentScheme}>
          <InsightTitle scheme={currentScheme}>Relationship Focus</InsightTitle>
          <InsightText scheme={currentScheme}>
            You've worked on conversations with: {analytics.relationshipTypes.join(', ')}. 
            This shows you value communication across different types of relationships.
          </InsightText>
        </InsightCard>

        <SectionTitle scheme={currentScheme}>Achievements</SectionTitle>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {getAchievements().map((achievement, index) => (
            <AchievementBadge key={index}>
              <AchievementText>{achievement}</AchievementText>
            </AchievementBadge>
          ))}
        </View>

        <Alert
          visible={showAlert}
          message={alertMessage}
          variant="error"
          onDismiss={() => setShowAlert(false)}
        />
      </ScrollView>
    </DashboardContainer>
  );
};

export default AnalyticsDashboard;
