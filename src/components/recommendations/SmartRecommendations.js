import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, RefreshControl, View, Text } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { COLOR_SCHEMES } from '../../theme';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';

const RecommendationsContainer = styled(LinearGradient).attrs(({ scheme }) => ({
  colors: COLOR_SCHEMES[scheme].primary,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}))`
  flex: 1;
  padding: 20px;
`;

const Header = styled.View`
  margin-bottom: 24px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].text};
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].textSecondary};
`;

const RecommendationCard = styled(Card)`
  margin-bottom: 16px;
  padding: 20px;
  border-left-width: 4px;
  border-left-color: ${({ type }) => {
    switch (type) {
      case 'conversation': return '#667eea';
      case 'exercise': return '#38b2ac';
      case 'tip': return '#f59e0b';
      case 'resource': return '#8b5cf6';
      default: return '#6b7280';
    }
  }};
`;

const RecommendationHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const RecommendationIcon = styled.Text`
  font-size: 24px;
  margin-right: 12px;
`;

const RecommendationTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].text};
  flex: 1;
`;

const RecommendationType = styled.Text`
  font-size: 12px;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].textSecondary};
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const RecommendationDescription = styled.Text`
  font-size: 14px;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].textSecondary};
  line-height: 20px;
  margin-bottom: 16px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${({ type }) => {
    switch (type) {
      case 'conversation': return '#667eea';
      case 'exercise': return '#38b2ac';
      case 'tip': return '#f59e0b';
      case 'resource': return '#8b5cf6';
      default: return '#6b7280';
    }
  }};
  padding: 12px 24px;
  border-radius: 8px;
  align-self: flex-start;
`;

const ActionButtonText = styled.Text`
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const MoodSelector = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const MoodButton = styled.TouchableOpacity`
  background-color: ${({ selected }) => selected ? '#667eea' : 'rgba(255, 255, 255, 0.2)'};
  padding: 12px 20px;
  border-radius: 20px;
  margin: 4px;
  border-width: 2px;
  border-color: ${({ selected }) => selected ? '#667eea' : 'rgba(255, 255, 255, 0.3)'};
`;

const MoodText = styled.Text`
  color: ${({ selected }) => selected ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  font-weight: 600;
  font-size: 14px;
`;

const RelationshipSelector = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const RelationshipButton = styled.TouchableOpacity`
  background-color: ${({ selected }) => selected ? '#38b2ac' : 'rgba(255, 255, 255, 0.2)'};
  padding: 12px 20px;
  border-radius: 20px;
  margin: 4px;
  border-width: 2px;
  border-color: ${({ selected }) => selected ? '#38b2ac' : 'rgba(255, 255, 255, 0.3)'};
`;

const RelationshipText = styled.Text`
  color: ${({ selected }) => selected ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  font-weight: 600;
  font-size: 14px;
`;

const SmartRecommendations = () => {
  const { currentScheme } = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('');

  const moods = [
    'Confident', 'Nervous', 'Excited', 'Frustrated', 
    'Calm', 'Anxious', 'Hopeful', 'Concerned', 'Motivated'
  ];

  const relationships = [
    'Romantic Partner', 'Family Member', 'Friend', 
    'Colleague', 'Acquaintance', 'Mentor'
  ];

  useEffect(() => {
    if (selectedMood && selectedRelationship) {
      fetchRecommendations();
    }
  }, [selectedMood, selectedRelationship]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/solo-prep/content-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await storage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          currentMood: selectedMood,
          relationshipType: selectedRelationship
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data.recommendations || []);
      } else {
        throw new Error(data.message || 'Failed to fetch recommendations');
      }
    } catch (error) {
      console.error('Recommendations error:', error);
      setAlertMessage('Failed to load recommendations. Please try again.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'conversation': return '💬';
      case 'exercise': return '🏃‍♀️';
      case 'tip': return '💡';
      case 'resource': return '📚';
      default: return '✨';
    }
  };

  const handleRecommendationAction = (recommendation) => {
    // Handle different types of recommendations
    switch (recommendation.type) {
      case 'conversation':
        // Navigate to conversation prep
        console.log('Starting conversation prep:', recommendation);
        break;
      case 'exercise':
        // Start communication exercise
        console.log('Starting exercise:', recommendation);
        break;
      case 'tip':
        // Show detailed tip
        console.log('Showing tip:', recommendation);
        break;
      case 'resource':
        // Open resource
        console.log('Opening resource:', recommendation);
        break;
      default:
        console.log('Handling recommendation:', recommendation);
    }
  };

  return (
    <RecommendationsContainer scheme={currentScheme}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Header>
          <Title scheme={currentScheme}>Smart Recommendations</Title>
          <Subtitle scheme={currentScheme}>
            Personalized suggestions based on your mood and relationship context
          </Subtitle>
        </Header>

        <Card scheme={currentScheme} style={{ marginBottom: 20, padding: 20 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: COLOR_SCHEMES[currentScheme].text,
            marginBottom: 12 
          }}>
            How are you feeling today?
          </Text>
          <MoodSelector>
            {moods.map((mood) => (
              <MoodButton
                key={mood}
                selected={selectedMood === mood}
                onPress={() => setSelectedMood(mood)}
              >
                <MoodText selected={selectedMood === mood}>{mood}</MoodText>
              </MoodButton>
            ))}
          </MoodSelector>
        </Card>

        <Card scheme={currentScheme} style={{ marginBottom: 20, padding: 20 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: COLOR_SCHEMES[currentScheme].text,
            marginBottom: 12 
          }}>
            What type of relationship?
          </Text>
          <RelationshipSelector>
            {relationships.map((relationship) => (
              <RelationshipButton
                key={relationship}
                selected={selectedRelationship === relationship}
                onPress={() => setSelectedRelationship(relationship)}
              >
                <RelationshipText selected={selectedRelationship === relationship}>
                  {relationship}
                </RelationshipText>
              </RelationshipButton>
            ))}
          </RelationshipSelector>
        </Card>

        {isLoading && <Spinner />}

        {selectedMood && selectedRelationship && !isLoading && (
          <View>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              color: COLOR_SCHEMES[currentScheme].text,
              marginBottom: 16 
            }}>
              Recommended for you
            </Text>

            {recommendations.map((recommendation, index) => (
              <RecommendationCard 
                key={index} 
                scheme={currentScheme}
                type={recommendation.type || 'tip'}
              >
                <RecommendationHeader>
                  <RecommendationIcon>
                    {getRecommendationIcon(recommendation.type || 'tip')}
                  </RecommendationIcon>
                  <RecommendationTitle scheme={currentScheme}>
                    {recommendation.title || 'Communication Tip'}
                  </RecommendationTitle>
                  <RecommendationType scheme={currentScheme}>
                    {recommendation.type || 'tip'}
                  </RecommendationType>
                </RecommendationHeader>

                <RecommendationDescription scheme={currentScheme}>
                  {recommendation.description || recommendation.content || 'A helpful communication suggestion.'}
                </RecommendationDescription>

                <ActionButton
                  type={recommendation.type || 'tip'}
                  onPress={() => handleRecommendationAction(recommendation)}
                >
                  <ActionButtonText>
                    {recommendation.actionText || 'Try This'}
                  </ActionButtonText>
                </ActionButton>
              </RecommendationCard>
            ))}

            {recommendations.length === 0 && (
              <Card scheme={currentScheme} style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ 
                  fontSize: 16, 
                  color: COLOR_SCHEMES[currentScheme].textSecondary,
                  textAlign: 'center' 
                }}>
                  No specific recommendations available for this combination. 
                  Try adjusting your mood or relationship type.
                </Text>
              </Card>
            )}
          </View>
        )}

        {!selectedMood || !selectedRelationship ? (
          <Card scheme={currentScheme} style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 16, 
              color: COLOR_SCHEMES[currentScheme].textSecondary,
              textAlign: 'center' 
            }}>
              Select your mood and relationship type to get personalized recommendations.
            </Text>
          </Card>
        ) : null}

        <Alert
          visible={showAlert}
          message={alertMessage}
          variant="error"
          onDismiss={() => setShowAlert(false)}
        />
      </ScrollView>
    </RecommendationsContainer>
  );
};

export default SmartRecommendations;
