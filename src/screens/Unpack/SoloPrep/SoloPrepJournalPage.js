import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Dimensions, Text } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../contexts/ThemeContext';
import { COLOR_SCHEMES } from '../../../theme';
import { useGetSoloPrepPromptsQuery, useGenerateSoloPrepBriefingMutation } from '../../../store/api/soloPrepApi';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/common/Alert';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import JournalingInterface from '../../../components/unpack/JournalingInterface';
import RealTimeCoach from '../../../components/ai/RealTimeCoach';
import AnalyticsDashboard from '../../../components/analytics/AnalyticsDashboard';
import SmartRecommendations from '../../../components/recommendations/SmartRecommendations';
import ReadyPlayerMeWebAvatar from '../../../components/ai/ReadyPlayerMeWebAvatar';
import RelationshipOnboarding from '../../../components/unpack/RelationshipOnboarding';

const { width } = Dimensions.get('window');

const Container = styled(LinearGradient).attrs(({ scheme }) => ({
  colors: COLOR_SCHEMES[scheme].primary,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}))`
  flex: 1;
`;

const Header = styled.View`
  padding: 20px;
  padding-top: 60px;
`;

const Title = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].text};
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].textSecondary};
  text-align: center;
  margin-bottom: 20px;
`;

const TabContainer = styled.View`
  flex-direction: row;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
`;

const Tab = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  background-color: ${({ active }) => active ? 'rgba(255, 255, 255, 0.9)' : 'transparent'};
`;

const TabText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ active, scheme }) => 
    active ? COLOR_SCHEMES[scheme].text : 'rgba(255, 255, 255, 0.7)'};
`;

const QuickActions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding-horizontal: 20px;
`;

const QuickActionButton = styled.TouchableOpacity`
  background-color: rgba(255, 255, 255, 0.9);
  padding: 12px 20px;
  border-radius: 20px;
  margin: 4px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const QuickActionText = styled.Text`
  color: #2d3748;
  font-weight: 600;
  font-size: 14px;
`;

const ContentContainer = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    paddingBottom: 100, // Extra padding for bottom navigation
  },
  showsVerticalScrollIndicator: true,
  bounces: true,
  scrollEventThrottle: 16,
}))`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.95);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding-top: 24px;
`;

const StatsCard = styled.View`
  background-color: white;
  margin: 20px;
  padding: 20px;
  border-radius: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 4;
`;

const StatsTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #1a202c;
  margin-bottom: 16px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const StatLabel = styled.Text`
  font-size: 14px;
  color: #4a5568;
`;

const StatValue = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
`;

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const ModalContent = styled.View`
  background-color: white;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  max-height: 80%;
  min-height: 50%;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #e2e8f0;
`;

const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #1a202c;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 8px;
`;

const CloseButtonText = styled.Text`
  font-size: 18px;
  color: #4a5568;
`;

const SoloPrepJournalPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentScheme } = useTheme();
  const { sessionId, userResponses, conversationComplete } = route.params || {};

  console.log('SoloPrepJournalPage - sessionId:', sessionId);
  console.log('SoloPrepJournalPage - userResponses:', userResponses);
  console.log('SoloPrepJournalPage - conversationComplete:', conversationComplete);

  const [activeTab, setActiveTab] = useState(conversationComplete ? 'journal' : 'coach');

  const { data: promptsData, isLoading: isLoadingPrompts, error: promptsError } = useGetSoloPrepPromptsQuery(sessionId, {
    skip: !sessionId || activeTab !== 'journal' || typeof sessionId !== 'string'
  });
  const [generateBriefing, { isLoading: isGeneratingBriefing, error: generateBriefingError }] = useGenerateSoloPrepBriefingMutation();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');
  const [journalEntries, setJournalEntries] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [relationshipInfo, setRelationshipInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    if (promptsError) {
      setAlertMessage(promptsError.data?.message || 'Failed to load prompts.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (generateBriefingError) {
      setAlertMessage(generateBriefingError.data?.message || 'Failed to generate strategy briefing.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [promptsError, generateBriefingError]);

  const handleSessionComplete = async (allEntries) => {
    setShowAlert(false);
    try {
      await generateBriefing(sessionId).unwrap();
      navigation.replace('StrategyBriefing', { sessionId });
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleJournalUpdate = (entries) => {
    setJournalEntries(entries);
  };

  const handleOnboardingComplete = (info) => {
    console.log('Onboarding completed with info:', info);
    setRelationshipInfo(info);
    setShowOnboarding(false);
    setShowAlert(true);
    setAlertMessage('Great! Now let\'s prepare for your conversation.');
    setAlertVariant('success');
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    setShowAlert(true);
    setAlertMessage('You can always provide this information later for a more personalized experience.');
    setAlertVariant('info');
  };

  const openModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const renderQuickActions = () => (
    <QuickActions>
      <QuickActionButton 
        onPress={() => openModal('coach')}
        style={{ 
          backgroundColor: '#667eea', 
          borderColor: '#5a67d8',
          borderWidth: 2,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6
        }}
      >
        <QuickActionText style={{ color: 'white', fontWeight: 'bold' }}>🤖 AI Coach</QuickActionText>
      </QuickActionButton>
      <QuickActionButton onPress={() => openModal('analytics')}>
        <QuickActionText>📊 Analytics</QuickActionText>
      </QuickActionButton>
      <QuickActionButton onPress={() => openModal('recommendations')}>
        <QuickActionText>💡 Recommendations</QuickActionText>
      </QuickActionButton>
      <QuickActionButton onPress={() => setShowOnboarding(true)}>
        <QuickActionText>⚙️ Settings</QuickActionText>
      </QuickActionButton>
    </QuickActions>
  );

  const renderStats = () => (
    <StatsCard>
      <StatsTitle>Session Progress</StatsTitle>
      <StatsRow>
        <StatLabel>Prompts Completed</StatLabel>
        <StatValue>{journalEntries.length} / {promptsData?.prompts?.length || 0}</StatValue>
      </StatsRow>
      <StatsRow>
        <StatLabel>Relationship Type</StatLabel>
        <StatValue>{promptsData?.relationshipType || 'Not specified'}</StatValue>
      </StatsRow>
      <StatsRow>
        <StatLabel>Topic</StatLabel>
        <StatValue>{promptsData?.conversationTopic || 'Not specified'}</StatValue>
      </StatsRow>
      <StatsRow>
        <StatLabel>AI Generated</StatLabel>
        <StatValue>{promptsData?.aiGenerated ? 'Yes' : 'No'}</StatValue>
      </StatsRow>
    </StatsCard>
  );

  const renderModalContent = () => {
    switch (modalContent) {
      case 'coach':
        return (
          <RealTimeCoach
            relationshipType={promptsData?.relationshipType || 'friend'}
            onClose={closeModal}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'recommendations':
        return <SmartRecommendations />;
      default:
        return null;
    }
  };

  if (!sessionId) {
    return (
      <Container scheme={currentScheme} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Title scheme={currentScheme}>Session Not Found</Title>
        <Subtitle scheme={currentScheme}>No session ID provided. Please start a new session.</Subtitle>
        <Button
          title="Start New Session"
          onPress={() => navigation.navigate('NewSoloPrepSession')}
          style={{ marginTop: 20 }}
        />
      </Container>
    );
  }

  if (isLoadingPrompts) {
    return (
      <Container scheme={currentScheme} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Spinner />
      </Container>
    );
  }

  if (promptsError) {
    return (
      <Container scheme={currentScheme} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Alert
          visible={showAlert}
          message={alertMessage}
          variant={alertVariant}
          onDismiss={() => setShowAlert(false)}
        />
        <Title scheme={currentScheme}>Error</Title>
        <Subtitle scheme={currentScheme}>Unable to load prompts for this session.</Subtitle>
      </Container>
    );
  }

  if (showOnboarding) {
    return (
      <RelationshipOnboarding
        onComplete={handleOnboardingComplete}
        onSkip={handleSkipOnboarding}
      />
    );
  }

  return (
    <Container scheme={currentScheme}>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />

      <Header>
        <Title scheme={currentScheme}>Solo Prep</Title>
        <Subtitle scheme={currentScheme}>
          {relationshipInfo ? 
            `Prepare for your conversation with ${relationshipInfo.their_name || 'them'}` :
            'Prepare for your important conversation'
          }
        </Subtitle>

        <TabContainer>
          <Tab active={activeTab === 'journal'} onPress={() => setActiveTab('journal')}>
            <TabText active={activeTab === 'journal'} scheme={currentScheme}>Journal</TabText>
          </Tab>
          <Tab active={activeTab === 'coach'} onPress={() => setActiveTab('coach')} style={{
            backgroundColor: activeTab === 'coach' ? 'rgba(102, 126, 234, 0.9)' : 'transparent',
            borderWidth: activeTab === 'coach' ? 2 : 0,
            borderColor: 'rgba(255, 255, 255, 0.8)',
            shadowColor: activeTab === 'coach' ? '#667eea' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: activeTab === 'coach' ? 6 : 0
          }}>
            <TabText active={activeTab === 'coach'} scheme={currentScheme} style={{
              color: activeTab === 'coach' ? 'white' : 'rgba(255, 255, 255, 0.7)',
              fontWeight: 'bold',
              fontSize: 15
            }}>✨ Vibe</TabText>
          </Tab>
          <Tab active={activeTab === 'analytics'} onPress={() => setActiveTab('analytics')}>
            <TabText active={activeTab === 'analytics'} scheme={currentScheme}>Analytics</TabText>
          </Tab>
        </TabContainer>

        {renderQuickActions()}
      </Header>

      <ContentContainer>
        {activeTab === 'journal' && (
          <>
            {renderStats()}
            
            {/* AI Coach Hero Section */}
            <View style={{
              marginBottom: 24,
              borderRadius: 20,
              overflow: 'hidden',
              shadowColor: '#667eea',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 12
            }}>
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 24 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <ReadyPlayerMeWebAvatar
                    size={60}
                    text="🤖"
                    showSettings={true}
                    autoSpeak={false}
                    style={{ marginRight: 16 }}
                    avatarUrl="https://models.readyplayer.me/68db3eef5327e5b9d763280e.glb"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontSize: 24, 
                      fontWeight: 'bold', 
                      color: 'white',
                      marginBottom: 4
                    }}>
                      Vibe
                    </Text>
                    <Text style={{ 
                      fontSize: 16, 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: '500'
                    }}>
                      Your AI communication coach
                    </Text>
                  </View>
                </View>
                
                <Text style={{ 
                  fontSize: 16, 
                  color: 'rgba(255, 255, 255, 0.95)',
                  marginBottom: 20,
                  lineHeight: 24
                }}>
                  I'm here to help you check the vibe and find the right words for your important conversations. Let's work together to create authentic connections and navigate those challenging moments.
                </Text>
                
                <TouchableOpacity 
                  onPress={() => setActiveTab('coach')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignSelf: 'flex-start',
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <Text style={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: 16
                  }}>
                    Check the Vibe →
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
            
            {isLoadingPrompts ? (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 40,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                margin: 20
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: 'white',
                  textAlign: 'center',
                  marginBottom: 20
                }}>
                  🤖 Vibe is creating your personalized prompts...
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'center',
                  lineHeight: 24
                }}>
                  Based on our conversation, I'm crafting reflection questions just for you.
                </Text>
              </View>
            ) : (
              <JournalingInterface
                sessionId={sessionId}
                prompts={promptsData?.prompts || []}
                initialEntries={promptsData?.journalEntries || {}}
                onSessionComplete={handleSessionComplete}
                onJournalUpdate={handleJournalUpdate}
                isSavingAll={isGeneratingBriefing}
                relationshipInfo={relationshipInfo}
              />
            )}
          </>
        )}

        {activeTab === 'coach' && (
          <RealTimeCoach
            onClose={() => setActiveTab('journal')}
            userResponses={userResponses}
            conversationComplete={conversationComplete}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
      </ContentContainer>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalContent === 'coach' && 'AI Coach'}
                {modalContent === 'analytics' && 'Analytics'}
                {modalContent === 'recommendations' && 'Recommendations'}
              </ModalTitle>
              <CloseButton onPress={closeModal}>
                <CloseButtonText>✕</CloseButtonText>
              </CloseButton>
            </ModalHeader>
            {renderModalContent()}
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </Container>
  );
};

export default SoloPrepJournalPage;