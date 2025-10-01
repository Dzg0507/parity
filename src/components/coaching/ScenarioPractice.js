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

const ScenarioCard = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 4;
  border-left-width: 4px;
  border-left-color: ${props => props.color || props.theme.colors.primary};
`;

const ScenarioTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const ScenarioDescription = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 20px;
  margin-bottom: 12px;
`;

const ScenarioMeta = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ScenarioDifficulty = styled.Text`
  font-size: 12px;
  color: ${props => props.color || props.theme.colors.primary};
  font-weight: 600;
  padding: 4px 8px;
  background-color: ${props => props.backgroundColor || 'rgba(102, 126, 234, 0.1)'};
  border-radius: 12px;
`;

const ScenarioDuration = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const PracticeContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
`;

const PracticeTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 15px;
`;

const PracticeStep = styled.View`
  background-color: ${props => props.theme.colors.background};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`;

const StepTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const StepDescription = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 20px;
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

const ProgressBar = styled.View`
  height: 8px;
  background-color: ${props => props.theme.colors.border};
  border-radius: 4px;
  margin: 12px 0;
  overflow: hidden;
`;

const ProgressFill = styled.View`
  height: 100%;
  background-color: ${props => props.theme.colors.primary};
  width: ${props => props.progress}%;
  border-radius: 4px;
`;

const FeedbackContainer = styled.View`
  background-color: ${props => props.theme.colors.background};
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  border-left-width: 4px;
  border-left-color: #4CAF50;
`;

const FeedbackTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const FeedbackText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 20px;
`;

const ScenarioPractice = () => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPracticing, setIsPracticing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const scenarios = [
    {
      id: 1,
      title: 'Job Interview - Tell Me About Yourself',
      description: 'Practice the classic "Tell me about yourself" question with AI feedback on structure, confidence, and clarity.',
      difficulty: 'medium',
      duration: '5-7 minutes',
      color: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      steps: [
        {
          title: 'Preparation',
          description: 'Think about your key achievements, skills, and career goals. Focus on what makes you unique.'
        },
        {
          title: 'Structure Your Answer',
          description: 'Use the STAR method: Situation, Task, Action, Result. Keep it concise and relevant.'
        },
        {
          title: 'Practice Delivery',
          description: 'Speak clearly, maintain eye contact, and show enthusiasm about the role.'
        },
        {
          title: 'Get Feedback',
          description: 'Receive AI-powered feedback on your delivery, content, and overall impression.'
        }
      ]
    },
    {
      id: 2,
      title: 'Difficult Conversation - Performance Review',
      description: 'Practice discussing performance issues with a team member in a constructive and professional manner.',
      difficulty: 'hard',
      duration: '8-10 minutes',
      color: '#FF9800',
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      steps: [
        {
          title: 'Set the Tone',
          description: 'Start with a positive note and explain the purpose of the conversation.'
        },
        {
          title: 'Present the Issue',
          description: 'Be specific about the performance concerns and provide examples.'
        },
        {
          title: 'Listen Actively',
          description: 'Give the other person a chance to respond and truly listen to their perspective.'
        },
        {
          title: 'Find Solutions',
          description: 'Work together to develop an improvement plan and set clear expectations.'
        }
      ]
    },
    {
      id: 3,
      title: 'Presentation - Quarterly Results',
      description: 'Practice presenting quarterly results to stakeholders with focus on clarity and engagement.',
      difficulty: 'medium',
      duration: '6-8 minutes',
      color: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      steps: [
        {
          title: 'Opening Hook',
          description: 'Start with a compelling statistic or story to grab attention.'
        },
        {
          title: 'Present Data',
          description: 'Use clear visuals and explain the numbers in context.'
        },
        {
          title: 'Tell the Story',
          description: 'Connect the data to business impact and future opportunities.'
        },
        {
          title: 'Call to Action',
          description: 'End with clear next steps and what you need from the audience.'
        }
      ]
    },
    {
      id: 4,
      title: 'Networking Event - Elevator Pitch',
      description: 'Practice your 30-second elevator pitch for networking events and professional meetings.',
      difficulty: 'easy',
      duration: '3-5 minutes',
      color: '#9C27B0',
      backgroundColor: 'rgba(156, 39, 176, 0.1)',
      steps: [
        {
          title: 'Who You Are',
          description: 'Start with your name and current role or profession.'
        },
        {
          title: 'What You Do',
          description: 'Explain your work in simple, compelling terms.'
        },
        {
          title: 'What Makes You Unique',
          description: 'Highlight your key differentiator or special skill.'
        },
        {
          title: 'Call to Action',
          description: 'End with how they can connect with you or what you can offer.'
        }
      ]
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return theme.colors.primary;
    }
  };

  const startPractice = (scenario) => {
    setSelectedScenario(scenario);
    setCurrentStep(0);
    setIsPracticing(true);
    setFeedback(null);
  };

  const nextStep = () => {
    if (currentStep < selectedScenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Practice completed, generate feedback
      generateFeedback();
    }
  };

  const generateFeedback = () => {
    // Mock feedback - replace with actual AI analysis
    const feedbackText = `Great job! Your practice session showed strong improvement in several areas:

• **Clarity**: Your speech was clear and well-paced
• **Structure**: You followed the recommended format effectively
• **Confidence**: Your delivery showed good confidence and engagement

**Areas for improvement:**
• Try to reduce filler words like "um" and "uh"
• Practice maintaining eye contact throughout
• Consider adding more specific examples

**Overall Score: 8.5/10**

Keep practicing to master this scenario!`;
    
    setFeedback(feedbackText);
    setIsPracticing(false);
  };

  const resetPractice = () => {
    setSelectedScenario(null);
    setCurrentStep(0);
    setIsPracticing(false);
    setFeedback(null);
  };

  const renderScenarioList = () => (
    <View>
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '600', 
        color: theme.colors.text, 
        marginBottom: 16 
      }}>
        Choose a scenario to practice:
      </Text>
      {scenarios.map((scenario) => (
        <ScenarioCard
          key={scenario.id}
          color={scenario.color}
          onPress={() => startPractice(scenario)}
          theme={theme}
        >
          <ScenarioTitle>{scenario.title}</ScenarioTitle>
          <ScenarioDescription>{scenario.description}</ScenarioDescription>
          <ScenarioMeta>
            <ScenarioDifficulty
              color={getDifficultyColor(scenario.difficulty)}
              backgroundColor={scenario.backgroundColor}
            >
              {scenario.difficulty.toUpperCase()}
            </ScenarioDifficulty>
            <ScenarioDuration>{scenario.duration}</ScenarioDuration>
          </ScenarioMeta>
        </ScenarioCard>
      ))}
    </View>
  );

  const renderPracticeSession = () => (
    <View>
      <PracticeContainer theme={theme}>
        <PracticeTitle>{selectedScenario.title}</PracticeTitle>
        
        <ProgressBar theme={theme}>
          <ProgressFill 
            progress={((currentStep + 1) / selectedScenario.steps.length) * 100} 
            theme={theme} 
          />
        </ProgressBar>
        
        <Text style={{ 
          fontSize: 14, 
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginBottom: 20
        }}>
          Step {currentStep + 1} of {selectedScenario.steps.length}
        </Text>

        <PracticeStep theme={theme}>
          <StepTitle>{selectedScenario.steps[currentStep].title}</StepTitle>
          <StepDescription>{selectedScenario.steps[currentStep].description}</StepDescription>
        </PracticeStep>

        <Button theme={theme} onPress={nextStep}>
          <ButtonText>
            {currentStep < selectedScenario.steps.length - 1 ? 'Next Step' : 'Complete Practice'}
          </ButtonText>
        </Button>

        <SecondaryButton theme={theme} onPress={resetPractice}>
          <SecondaryButtonText>Cancel Practice</SecondaryButtonText>
        </SecondaryButton>
      </PracticeContainer>

      {feedback && (
        <FeedbackContainer theme={theme}>
          <FeedbackTitle>AI Feedback</FeedbackTitle>
          <FeedbackText>{feedback}</FeedbackText>
          <Button theme={theme} onPress={resetPractice} style={{ marginTop: 16 }}>
            <ButtonText>Try Another Scenario</ButtonText>
          </Button>
        </FeedbackContainer>
      )}
    </View>
  );

  return (
    <Container theme={theme}>
      <Header>
        <HeaderTitle>Scenario Practice</HeaderTitle>
        <HeaderSubtitle>
          Practice real-world communication scenarios with AI-powered feedback and guidance.
        </HeaderSubtitle>
      </Header>

      <ContentContainer>
        {selectedScenario ? renderPracticeSession() : renderScenarioList()}
      </ContentContainer>
    </Container>
  );
};

export default ScenarioPractice;