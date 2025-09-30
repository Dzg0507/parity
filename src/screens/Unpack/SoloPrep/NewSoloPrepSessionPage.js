import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Animated, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import PaywallModal from '../../../components/subscription/PaywallModal';
import Card from '../../../components/common/Card';
import { useTheme } from '../../../contexts/ThemeContext';
import { COLOR_SCHEMES } from '../../../theme';
import {
  useCreateSoloPrepSessionMutation,
  useGetSoloPrepTrialStatusQuery,
} from '../../../store/api/soloPrepApi';
import { useGetSubscriptionStatusQuery } from '../../../store/api/userApi';
import { SOLO_PREP_TRIAL_LIMIT } from '../../../constants';
import { theme } from '../../../theme';
import { storage } from '../../../utils/storage';
import ReadyPlayerMeWebAvatar from '../../../components/ai/ReadyPlayerMeWebAvatar';

const GradientBackground = styled(LinearGradient).attrs(({ scheme }) => ({
  colors: COLOR_SCHEMES[scheme].primary,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}))`
  flex: 1;
`;

const Container = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    padding: theme.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
}))`
  background-color: transparent;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h3}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].text};
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  text-align: center;
  text-shadow: 2px 2px 8px ${({ scheme }) => COLOR_SCHEMES[scheme].shadow};
  letter-spacing: 1px;
`;

const Subtitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.extraLarge}px;
  text-align: center;
  padding-horizontal: ${({ theme }) => theme.spacing.medium}px;
  text-shadow: 1px 1px 4px ${({ scheme }) => COLOR_SCHEMES[scheme].shadow};
`;

const FormContainer = styled.View`
  width: 100%;
  max-width: 400px;
`;

const NewSoloPrepSessionPage = () => {
  const navigation = useNavigation();
  const { currentScheme } = useTheme();
  const [createSession, { isLoading: isCreatingSession, error: createError }] = useCreateSoloPrepSessionMutation();
  const { data: subscriptionStatus, error: subscriptionError, isLoading: isLoadingSubscription, refetch: refetchSubscription } = useGetSubscriptionStatusQuery();
  const { data: trialStatus, error: trialError, refetch: refetchTrialStatus } = useGetSoloPrepTrialStatusQuery();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Conversation state
  const [showConversation, setShowConversation] = useState(false);
  const [conversationStep, setConversationStep] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userResponses, setUserResponses] = useState({
    name: '',
    weather_mood: '',
    situation_genre: '',
    superpower: '',
    inner_color: '',
    future_question: ''
  });
  const [showQuestionCards, setShowQuestionCards] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [showJournal, setShowJournal] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentSpeakingMessage, setCurrentSpeakingMessage] = useState('');
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [isTTSInitialized, setIsTTSInitialized] = useState(false);

  const isPremium = subscriptionStatus?.tier === 'premium_monthly' || subscriptionStatus?.tier === 'premium_annual';
  const hasUsedTrial = (trialStatus?.usedSessions || 0) >= SOLO_PREP_TRIAL_LIMIT;
  const canStartSession = isPremium || !hasUsedTrial;

  // Fallback: If API calls fail, allow session creation (assume trial user)
  const canStartSessionFallback = !subscriptionError && !trialError ? canStartSession : true;

  // Conversation messages
  const conversationMessages = [
    {
      text: "✨ Hey there! I'm Vibe",
      delay: 800,
      type: 'greeting',
      fontFamily: 'System',
      fontSize: 32
    },
    {
      text: "Welcome to your Solo Prep session! I'm here to help you check in with yourself and explore what's going on inside.",
      delay: 2000,
      type: 'intro',
      fontFamily: 'System',
      fontSize: 22
    },
    {
      text: "This is your safe space for self-reflection. I'll ask you some questions to help you understand yourself better and work through what you're experiencing.",
      delay: 2500,
      type: 'explanation',
      fontFamily: 'System',
      fontSize: 20
    },
    {
      text: "First, what should I call you?",
      delay: 2000,
      type: 'question',
      questionType: 'name',
      fontFamily: 'System',
      fontSize: 22
    },
    {
      text: "Nice to meet you! If you were a weather pattern right now, what would you be?",
      delay: 1000,
      type: 'question',
      questionType: 'weather_mood',
      fontFamily: 'System',
      fontSize: 22
    },
    {
      text: "Interesting! If your current situation was a song, what genre would it be?",
      delay: 1000,
      type: 'question',
      questionType: 'situation_genre',
      fontFamily: 'System',
      fontSize: 22
    },
    {
      text: "Got it. If you could have a superpower for one day to handle what's going on, what would it be?",
      delay: 1000,
      type: 'question',
      questionType: 'superpower',
      fontFamily: 'System',
      fontSize: 22
    },
    {
      text: "Cool! If your inner voice had a color, what would it be right now?",
      delay: 1000,
      type: 'question',
      questionType: 'inner_color',
      fontFamily: 'System',
      fontSize: 22
    },
    {
      text: "Perfect! If you could ask your future self one question, what would it be?",
      delay: 1000,
      type: 'question',
      questionType: 'future_question',
      fontFamily: 'System',
      fontSize: 22
    },
    {
      text: "Amazing! I have everything I need. Let me create a personalized reflection plan just for you.",
      delay: 1000,
      type: 'summary',
      fontFamily: 'System',
      fontSize: 20
    },
    {
      text: "Perfect! Now let's dive into your personalized reflection journey. I've created some prompts just for you based on what you've shared.",
      delay: 2000,
      type: 'transition',
      fontFamily: 'System',
      fontSize: 20
    }
  ];

  const typeText = (text, onComplete) => {
    console.log('🎬 TYPING: Starting text generation for:', text);
    console.log('🎬 TYPING: Text length:', text.length);
    
    let index = 0;
    setCurrentMessage('');
    setIsTyping(true);
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        const currentText = text.substring(0, index + 1);
        setCurrentMessage(currentText);
        console.log('⌨️ TYPING: Generated text so far:', currentText);
        index++;
        
        if (text[index - 1] === '.' || text[index - 1] === '!' || text[index - 1] === '?') {
          console.log('⏸️ TYPING: Pausing at punctuation:', text[index - 1]);
          clearInterval(typeInterval);
          setTimeout(() => {
            console.log('▶️ TYPING: Resuming after punctuation pause');
            const newInterval = setInterval(() => {
              if (index < text.length) {
                const currentText = text.substring(0, index + 1);
                setCurrentMessage(currentText);
                console.log('⌨️ TYPING: Resumed text:', currentText);
                index++;
              } else {
                console.log('✅ TYPING: Text generation complete, calling onComplete');
                clearInterval(newInterval);
                setIsTyping(false);
                if (onComplete) onComplete();
              }
            }, 30);
          }, 200); // Pause at punctuation
        }
      } else {
        console.log('✅ TYPING: Text generation finished, calling onComplete');
        clearInterval(typeInterval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, 25); // Slightly faster typing
  };

  // Question options
  const questionOptions = {
    weather_mood: [
      'A gentle rain',
      'A thunderstorm',
      'Foggy',
      'Sunny with clouds',
      'A blizzard',
      'A calm breeze',
      'A heatwave',
      'A rainbow after rain',
      'Dark clouds',
      'A clear blue sky'
    ],
    situation_genre: [
      'Drama',
      'Comedy',
      'Thriller',
      'Romance',
      'Horror',
      'Documentary',
      'Musical',
      'Action',
      'Mystery',
      'Fantasy'
    ],
    superpower: [
      'Mind reading',
      'Time travel',
      'Invisibility',
      'Super strength',
      'Teleportation',
      'Healing',
      'Precognition',
      'Shape-shifting',
      'Super speed',
      'Mind control'
    ],
    inner_color: [
      'Red',
      'Blue',
      'Yellow',
      'Green',
      'Purple',
      'Orange',
      'Black',
      'White',
      'Gray',
      'Pink'
    ],
    future_question: [
      'Did I make the right choice?',
      'Am I happy with who I became?',
      'What would you do differently?',
      'Was it worth the struggle?',
      'How did I get through this?',
      'What did I learn about myself?',
      'Did I find what I was looking for?',
      'How did this change me?',
      'What advice would you give me?',
      'Are you proud of how I handled this?'
    ]
  };

  const handleQuestionResponse = (questionType, response) => {
    // Debug: Handling response
    setUserResponses(prev => ({
      ...prev,
      [questionType]: response
    }));
    setShowQuestionCards(false);
    setCurrentQuestion('');
    
    // Move to next conversation step
    setTimeout(() => {
      setConversationStep(prev => {
        // Debug: Moving to next step
        return prev + 1;
      });
    }, 500);
  };

  // Debug logging removed

  // Initialize TTS service
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        setIsTTSLoading(true);
        // Import and initialize ElevenLabs TTS
        const elevenLabsTtsService = (await import('../../../utils/elevenLabsTtsService')).default;
        await elevenLabsTtsService.initialize();
        
        // Set up event listeners
        elevenLabsTtsService.setOnSpeechStart(() => {
          setIsTTSLoading(false);
        });
        
        elevenLabsTtsService.setOnSpeechEnd(() => {
          setIsTTSLoading(false);
        });
        
        setIsTTSInitialized(true);
        setIsTTSLoading(false);
      } catch (error) {
        console.error('Failed to initialize TTS:', error);
        setIsTTSLoading(false);
      }
    };

    initializeTTS();
  }, []);

  useEffect(() => {
    if (createError) {
      setAlertMessage(createError.data?.message || 'Failed to start Solo Prep session.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [createError]);

  // Conversation animation effect
  useEffect(() => {
    console.log('🔄 CONVERSATION: Effect triggered');
    console.log('🔄 CONVERSATION: showConversation:', showConversation);
    console.log('🔄 CONVERSATION: conversationStep:', conversationStep);
    console.log('🔄 CONVERSATION: isTTSInitialized:', isTTSInitialized);
    console.log('🔄 CONVERSATION: isTTSLoading:', isTTSLoading);
    
    if (showConversation && conversationStep < conversationMessages.length && isTTSInitialized && !isTTSLoading) {
      const message = conversationMessages[conversationStep];
      console.log('💬 CONVERSATION: Processing message:', message);
      
      // Personalize messages with user's name
      let personalizedText = message.text;
      if (userResponses.name && conversationStep > 3) {
        // More careful replacement to avoid issues
        personalizedText = message.text.replace(/\byou\b/g, userResponses.name);
        personalizedText = personalizedText.replace(/\byour\b/g, `${userResponses.name}'s`);
        console.log('👤 CONVERSATION: Personalized text:', personalizedText);
      }
      
      // Remove emojis from TTS text (keep them for display but not for speech)
      const ttsText = personalizedText.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
      
      // Set the message for the avatar to speak (without emojis)
      setCurrentSpeakingMessage(ttsText);
      console.log('🎭 CONVERSATION: Set currentSpeakingMessage (TTS):', ttsText);
      console.log('🎭 CONVERSATION: Display text (with emojis):', personalizedText);
      
      // Wait for TTS to be ready before starting
      const startConversation = async () => {
        try {
          console.log('🎤 TTS: Starting TTS for text:', ttsText);
          // Import TTS service
          const elevenLabsTtsService = (await import('../../../utils/elevenLabsTtsService')).default;
          
          // Stop any current speech first
          console.log('🛑 TTS: Stopping any current speech');
          await elevenLabsTtsService.stop();
          
          // Start typing animation first, then TTS after text is rendered
          typeText(personalizedText, () => {
            setConversationHistory(prev => [...prev, {
              text: personalizedText,
              type: message.type,
              questionType: message.questionType,
              timestamp: Date.now(),
              fontFamily: message.fontFamily,
              fontSize: message.fontSize
            }]);
            
            // If it's a question, show the question cards
            if (message.questionType) {
              setCurrentQuestion(message.questionType);
              setShowQuestionCards(true);
            } else if (message.type === 'transition') {
              setShowQuestionCards(false);
              // Transition to journal after a delay
              setTimeout(() => {
                setShowJournal(true);
              }, 2000);
            } else {
              setShowQuestionCards(false);
            }
            
            // Start TTS only after text is completely rendered
            console.log('🗣️ TTS: Starting speech for:', ttsText);
            elevenLabsTtsService.speak(ttsText).catch(error => {
              console.error('TTS error:', error);
            });
            
            // Always move to next step after message is complete
            setTimeout(() => {
              setConversationStep(prev => prev + 1);
            }, 1000);
          });
        } catch (error) {
          console.error('TTS error:', error);
          // Fallback to just typing without TTS
          typeText(personalizedText, () => {
            setConversationHistory(prev => [...prev, {
              text: personalizedText,
              type: message.type,
              questionType: message.questionType,
              timestamp: Date.now(),
              fontFamily: message.fontFamily,
              fontSize: message.fontSize
            }]);
            
            if (message.questionType) {
              setCurrentQuestion(message.questionType);
              setShowQuestionCards(true);
            } else if (message.type === 'transition') {
              setShowQuestionCards(false);
              setTimeout(() => {
                setShowJournal(true);
              }, 2000);
            } else {
              setShowQuestionCards(false);
            }
            
            // Always move to next step after message is complete
            setTimeout(() => {
              setConversationStep(prev => prev + 1);
            }, 1000);
          });
        }
      };
      
      // Start conversation after a brief delay
      setTimeout(startConversation, message.delay || 1000);
    }
  }, [showConversation, conversationStep, isTTSInitialized, isTTSLoading]);

  useEffect(() => {
    if (subscriptionError) {
      console.error('Subscription API Error:', subscriptionError);
    }
  }, [subscriptionError]);

  useEffect(() => {
    if (trialError) {
      console.error('Trial API Error:', trialError);
    }
  }, [trialError]);

  const validationSchema = Yup.object().shape({
    // No validation needed - Vibe will gather all information
  });

  const handleSubmit = async (values) => {
    setShowAlert(false); // Clear previous alerts
    if (!canStartSessionFallback) {
      setShowPaywall(true);
      return;
    }

    // Start the conversation animation (only if not already started)
    if (!showConversation) {
      setShowConversation(true);
      setConversationStep(0);
      setConversationHistory([]);
      setCurrentMessage('');
      setIsTyping(false);
    }

    try {
      const response = await createSession({
        relationshipType: 'To be determined', // Vibe will gather this information
        conversationTopic: 'To be determined', // Vibe will gather this information
        conversationData: userResponses // Pass the conversation data
      }).unwrap();
      refetchTrialStatus(); // Update trial status after session creation
      // The API returns { success: true, data: session }, so sessionId is in response.data._id
      const sessionId = response.data?._id || response.data?.id;
      if (sessionId) {
        // Store session ID for later navigation
        setSessionId(sessionId);
        storage.setItem('currentSessionId', sessionId);
        // Debug: Session created successfully
      } else {
        console.error('No session ID returned from API:', response);
        setAlertMessage('Failed to create session. Please try again.');
        setAlertVariant('error');
        setShowAlert(true);
      }
    } catch (err) {
      // Error handled by useEffect
    }
  };

  return (
    <GradientBackground scheme={currentScheme}>
      <Container>
        <Alert
          visible={showAlert}
          message={alertMessage}
          variant={alertVariant}
          onDismiss={() => setShowAlert(false)}
        />

        <PaywallModal
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          featureName="Solo Prep Session"
          description="You've used your free Solo Prep trial. Upgrade to Parity Premium for unlimited sessions."
        />

        {!showConversation ? (
          <>
        <Title scheme={currentScheme}>New Solo Prep Session</Title>
            <Subtitle scheme={currentScheme}>Start your private journaling session with Vibe. Your AI coach will guide you through everything - from understanding your situation to finding the right words.</Subtitle>
            
            {/* TTS Loading State */}
            {isTTSLoading && (
              <View style={{ 
                marginTop: 20, 
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}>
                <ActivityIndicator size="large" color="white" />
                <Text style={{ 
                  color: 'white', 
                  fontSize: 16, 
                  marginTop: 10,
                  textAlign: 'center'
                }}>
                  Initializing AI Voice...
                </Text>
              </View>
            )}
          
          {/* Premium Testing Button */}
          {!isPremium && (
            <Button
              title="Set Premium for Testing"
              onPress={async () => {
                try {
                  const response = await fetch('http://localhost:5000/users/set-premium', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${await storage.getItem('authToken')}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  const result = await response.json();
                  if (result.success) {
                    setAlertMessage('Premium status set! Refreshing data...');
                    setAlertVariant('success');
                    setShowAlert(true);
                    // Refresh the subscription and trial data
                    await refetchSubscription();
                    await refetchTrialStatus();
                  } else {
                    setAlertMessage('Failed to set premium status.');
                    setAlertVariant('error');
                    setShowAlert(true);
                  }
                } catch (error) {
                  console.error('Premium setting error:', error);
                  setAlertMessage('Error setting premium status. Check console.');
                  setAlertVariant('error');
                  setShowAlert(true);
                }
              }}
              variant="outline"
              style={{ marginTop: 8 }}
            />
          )}

      <Formik
              initialValues={{}}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
              {({ handleSubmit }) => (
          <FormContainer>
            <Button
                    title="Start Solo Prep with Vibe"
              onPress={handleSubmit}
                    disabled={isCreatingSession}
              loading={isCreatingSession}
              scheme={currentScheme}
              style={{ marginTop: theme.spacing.medium }}
            />

            {!isPremium && trialStatus && (
              <Text style={{ 
                textAlign: 'center', 
                marginTop: theme.spacing.medium, 
                color: COLOR_SCHEMES[currentScheme].text,
                backgroundColor: COLOR_SCHEMES[currentScheme].cardBg,
                padding: theme.spacing.small,
                borderRadius: theme.spacing.small,
                textShadow: `1px 1px 4px ${COLOR_SCHEMES[currentScheme].shadow}`,
                borderWidth: 1,
                borderColor: COLOR_SCHEMES[currentScheme].cardBorder,
                borderTopWidth: 2,
                borderTopColor: COLOR_SCHEMES[currentScheme].accent,
                borderBottomWidth: 1,
                borderBottomColor: COLOR_SCHEMES[currentScheme].cardBorder
              }}>
                {hasUsedTrial ? 'Free trial used.' : `1 free Solo Prep session remaining.`}
                {' '}
                <Text
                  style={{ color: COLOR_SCHEMES[currentScheme].accent, fontWeight: theme.typography.fontWeights.bold }}
                  onPress={() => setShowPaywall(true)}
                >
                  Upgrade to Premium
                </Text>
              </Text>
            )}
          </FormContainer>
        )}
      </Formik>
          </>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            {/* TTS Loading State for Conversation */}
            {isTTSLoading && (
              <View style={{ 
                marginBottom: 30, 
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}>
                <ActivityIndicator size="large" color="white" />
                <Text style={{ 
                  color: 'white', 
                  fontSize: 16, 
                  marginTop: 10,
                  textAlign: 'center'
                }}>
                  Preparing AI Response...
                </Text>
              </View>
            )}
            
            {/* Vibe Avatar with Talking Head */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'flex-start', 
              justifyContent: 'center',
              marginBottom: 30,
              width: '100%',
              maxWidth: 600
            }}>
              {/* Ready Player Me Avatar on the left */}
              <View style={{ marginRight: 20, marginTop: 20 }}>
                <ReadyPlayerMeWebAvatar
                  size={200}
                  text="Hello! I'm Vibe, your AI communication coach."
                  showSettings={true}
                  autoSpeak={false}
                  speechText=""
                  avatarUrl="https://models.readyplayer.me/68db3eef5327e5b9d763280e.glb"
                />
              </View>
              {/* Conversation messages on the right */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                {/* Show conversation history */}
                {conversationHistory.map((message, index) => (
                  <View key={index} style={{ marginBottom: 30, alignItems: 'center', width: '100%' }}>
                    <Text style={{ 
                      fontSize: message.fontSize || (message.type === 'greeting' ? 32 : 20), 
                      fontWeight: message.type === 'greeting' ? '900' : '600', 
                      color: 'white',
                      textAlign: 'center',
                      lineHeight: (message.fontSize || 20) + 8,
                      fontStyle: message.type === 'question' ? 'italic' : 'normal',
                      fontFamily: message.fontFamily || 'System',
                      textShadowColor: 'rgba(0,0,0,0.6)',
                      textShadowOffset: { width: 2, height: 2 },
                      textShadowRadius: 4,
                      letterSpacing: message.type === 'greeting' ? 1 : 0.5
                    }}>
                      {message.text}
                    </Text>
                    
                    {/* Show user response if available */}
                    {message.questionType && userResponses[message.questionType] && (
                      <View style={{ 
                        marginTop: 15, 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                        padding: 12, 
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}>
                        <Text style={{ 
                          color: 'white', 
                          fontSize: 16, 
                          fontWeight: '500',
                          textAlign: 'center'
                        }}>
                          {userResponses[message.questionType]}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
            {/* Show current typing message ONLY if we're currently typing */}
            {isTyping && currentMessage && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'flex-start', 
                justifyContent: 'center',
                marginBottom: 30,
                width: '100%',
                maxWidth: 600
              }}>
                {/* Current typing message */}
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ 
                    fontSize: 20, 
                    color: 'white',
                    textAlign: 'center',
                    lineHeight: 28,
                    fontWeight: '600',
                    textShadowColor: 'rgba(0,0,0,0.6)',
                    textShadowOffset: { width: 2, height: 2 },
                    textShadowRadius: 4
                  }}>
                    {currentMessage}
                    <Text style={{ 
                      color: '#ffeb3b',
                      fontSize: 24,
                      fontWeight: 'bold'
                    }}>
                      |
                    </Text>
                  </Text>
                </View>
              </View>
            )}
            {/* Show question cards when a question is asked */}
            {showQuestionCards && currentQuestion && questionOptions[currentQuestion] && (
              <View style={{ 
                marginTop: 20, 
                width: '100%', 
                maxWidth: 600,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 18, 
                  fontWeight: '600', 
                  textAlign: 'center', 
                  marginBottom: 20,
                  textShadowColor: 'rgba(0,0,0,0.6)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2
                }}>
                  Choose your answer:
                </Text>
                {questionOptions[currentQuestion].map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleQuestionResponse(currentQuestion, option)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: 15,
                      borderRadius: 12,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <Text style={{ 
                      color: 'white', 
                      fontSize: 16, 
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {/* Special input for name question */}
            {showQuestionCards && currentQuestion === 'name' && (
              <View style={{ 
                marginTop: 20, 
                width: '100%', 
                maxWidth: 600,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 18, 
                  fontWeight: '600', 
                  textAlign: 'center', 
                  marginBottom: 20,
                  textShadowColor: 'rgba(0,0,0,0.6)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2
                }}>
                  What should I call you?
                </Text>
                <TextInput
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: 15,
                    borderRadius: 12,
                    color: 'white',
                    fontSize: 16,
                    textAlign: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                  placeholder="Enter your name..."
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={userResponses.name}
                  onChangeText={(text) => setUserResponses(prev => ({ ...prev, name: text }))}
                  autoCapitalize="words"
                />
                <TouchableOpacity
                  onPress={() => handleQuestionResponse('name', userResponses.name)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    padding: 15,
                    borderRadius: 12,
                    marginTop: 15,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.4)'
                  }}
                >
                  <Text style={{ 
                    color: 'white', 
                    fontSize: 16, 
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Special input for situation question */}
            {showQuestionCards && currentQuestion === 'situation' && (
              <View style={{ 
                marginTop: 20, 
                width: '100%', 
                maxWidth: 400,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 18, 
                  fontWeight: '600', 
                  textAlign: 'center', 
                  marginBottom: 20,
                  textShadowColor: 'rgba(0,0,0,0.6)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2
                }}>
                  What's on your mind today?
                </Text>
                <TextInput
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: 15,
                    borderRadius: 12,
                    color: 'white',
                    fontSize: 16,
                    textAlignVertical: 'top',
                    minHeight: 100,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                  placeholder="What are you working through or thinking about? What's going on in your life right now?"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  multiline
                  value={userResponses.situation}
                  onChangeText={(text) => setUserResponses(prev => ({ ...prev, situation: text }))}
                />
                <TouchableOpacity
                  onPress={() => handleQuestionResponse('situation', userResponses.situation)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    padding: 15,
                    borderRadius: 12,
                    marginTop: 15,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.4)'
                  }}
                >
                  <Text style={{ 
                    color: 'white', 
                    fontSize: 16, 
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Show journal interface when conversation is complete */}
            {showJournal && (
              <View style={{ 
                marginTop: 20, 
                width: '100%', 
                maxWidth: 600,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 18, 
                  fontWeight: '600', 
                  textAlign: 'center', 
                  marginBottom: 20,
                  textShadowColor: 'rgba(0,0,0,0.6)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2
                }}>
                  Your personalized reflection prompts are ready!
                </Text>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 16, 
                  textAlign: 'center', 
                  marginBottom: 20,
                  lineHeight: 24
                }}>
                  Based on your responses, I've created custom prompts to help you explore your thoughts and feelings.
                </Text>
                <Button
                  title="Start Journaling"
                  onPress={() => {
                    // Debug: Navigating to journal
                    if (sessionId) {
                      navigation.navigate('SoloPrepJournal', { 
                        sessionId,
                        userResponses: userResponses,
                        conversationComplete: true
                      });
                    } else {
                      console.error('No session ID available for navigation');
                      setAlertMessage('Session not found. Please try again.');
                      setAlertVariant('error');
                      setShowAlert(true);
                    }
                  }}
                  scheme={currentScheme}
                  style={{ marginTop: 10 }}
                />
              </View>
            )}
          </View>
        )}
      </Container>
    </GradientBackground>
  );
};

export default NewSoloPrepSessionPage;
