import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { COLOR_SCHEMES } from '../../theme';
import { storage } from '../../utils/storage';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';
import ReadyPlayerMeWebAvatar from './ReadyPlayerMeWebAvatar';

const CoachContainer = styled(LinearGradient).attrs(({ scheme }) => ({
  colors: COLOR_SCHEMES[scheme].primary,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}))`
  flex: 1;
  padding: 20px;
`;

const CoachCard = styled.View`
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 8px;
  shadow-opacity: 0.15;
  shadow-radius: 16px;
  elevation: 8;
`;

const CoachHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

const CoachAvatar = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #667eea;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
`;

const CoachName = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #1a202c;
`;

const CoachStatus = styled.Text`
  font-size: 14px;
  color: #4a5568;
  margin-top: 4px;
`;

const ConversationStarter = styled.View`
  margin-bottom: 20px;
  border-radius: 20px;
  min-height: 300px;
  shadow-color: #ff6b9d;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 12px;
  elevation: 8;
  overflow: hidden;
`;

const ConversationQuestion = styled.View`
  margin-bottom: 16px;
`;

const InputContainer = styled.View`
  margin-bottom: 16px;
`;

const InputLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
`;

const StyledTextInput = styled.TextInput`
  background-color: #f7fafc;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  color: #2d3748;
  border-width: 2px;
  border-color: ${props => props.focused ? '#667eea' : '#e2e8f0'};
  min-height: 100px;
  text-align-vertical: top;
`;

const MoodSelector = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const MoodButton = styled.TouchableOpacity`
  background-color: ${props => props.selected ? '#667eea' : '#e2e8f0'};
  padding: 12px 20px;
  border-radius: 20px;
  margin: 4px;
`;

const MoodText = styled.Text`
  color: ${props => props.selected ? '#ffffff' : '#4a5568'};
  font-weight: 600;
  font-size: 14px;
`;

const CoachingResponse = styled.View`
  background-color: #f0f4ff;
  border-radius: 16px;
  padding: 20px;
  margin-top: 16px;
  border-left-width: 4px;
  border-left-color: #667eea;
`;

const ResponseText = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: #2d3748;
`;

const ResponseMeta = styled.Text`
  font-size: 12px;
  color: #718096;
  margin-top: 12px;
  font-style: italic;
`;

const QuickActions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 16px;
`;

const QuickActionButton = styled.TouchableOpacity`
  background-color: #e6fffa;
  padding: 8px 16px;
  border-radius: 16px;
  margin: 4px;
  border-width: 1px;
  border-color: #38b2ac;
`;

const QuickActionText = styled.Text`
  color: #234e52;
  font-size: 12px;
  font-weight: 600;
`;

const RealTimeCoach = ({ relationshipType = 'friend', onClose, userResponses: passedUserResponses, conversationComplete = false }) => {
  const { currentScheme } = useTheme();
  const [conversationContext, setConversationContext] = useState('');
  const [currentMood, setCurrentMood] = useState('');
  const [coaching, setCoaching] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Conversation flow state
  const [conversationStep, setConversationStep] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userResponses, setUserResponses] = useState(passedUserResponses || {
    situation: '',
    relationship: '',
    mood: '',
    goal: ''
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;

  // Conversation flow messages with different fonts
  const conversationMessages = [
    {
      text: "✨ Hey there! I'm Vibe",
      delay: 800,
      type: 'greeting',
      fontFamily: 'System',
      fontSize: 28
    },
    {
      text: "Welcome to your Solo Prep session! I'm here to help you check the vibe and prepare for an important conversation.",
      delay: 2000,
      type: 'intro',
      fontFamily: 'System',
      fontSize: 20
    },
    {
      text: "I'll ask you a few questions to understand your situation, then we'll work together to find the right words and approach. No judgment, just real support.",
      delay: 2500,
      type: 'explanation',
      fontFamily: 'System',
      fontSize: 18
    },
    {
      text: "Let's start with the basics - what's going on that you'd like to talk about?",
      delay: 2000,
      type: 'question',
      inputType: 'situation',
      fontFamily: 'System',
      fontSize: 20
    }
  ];

  const moods = [
    'Confident', 'Vulnerable', 'Hopeful', 'Frustrated', 
    'Peaceful', 'Anxious', 'Loving', 'Worried'
  ];

  const quickActions = [
    'I don\'t know how to begin...', 'I\'m scared they\'ll be angry', 
    'I want to truly hear them', 'My heart is racing',
    'I might cry or get defensive', 'How do I end this with love?'
  ];

  // Animated typing effect with natural pauses
  const typeText = (text, onComplete) => {
    let index = 0;
    setCurrentMessage('');
    setIsTyping(true);
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setCurrentMessage(text.substring(0, index + 1));
        index++;
        
        // Add natural pauses at punctuation
        if (text[index - 1] === '.' || text[index - 1] === '!' || text[index - 1] === '?') {
          clearInterval(typeInterval);
          setTimeout(() => {
            const newInterval = setInterval(() => {
              if (index < text.length) {
                setCurrentMessage(text.substring(0, index + 1));
                index++;
              } else {
                clearInterval(newInterval);
                setIsTyping(false);
                if (onComplete) onComplete();
              }
            }, 30);
          }, 200); // Pause at punctuation
        }
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, 25); // Slightly faster typing
  };

  // Start conversation flow
  useEffect(() => {
    // If conversation is already complete, skip the initial conversation
    if (conversationComplete) {
      return;
    }

    const startConversation = () => {
      if (conversationStep < conversationMessages.length) {
        const message = conversationMessages[conversationStep];
        
        setTimeout(() => {
          typeText(message.text, () => {
            setConversationHistory(prev => [...prev, {
              text: message.text,
              type: message.type,
              timestamp: Date.now()
            }]);
            
            if (message.inputType) {
              // This is a question that needs user input
              setConversationStep(prev => prev + 1);
            } else {
              // Continue to next message
              setTimeout(() => {
                setConversationStep(prev => prev + 1);
              }, 1000);
            }
          });
        }, message.delay);
      }
    };

    startConversation();
  }, [conversationStep, conversationComplete]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getCoaching = async () => {
    if (!conversationContext.trim() || !currentMood) {
      setAlertMessage('Please describe the situation and select your mood.');
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/solo-prep/real-time-coaching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await storage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          conversationContext,
          currentMood,
          relationshipType: relationshipType || 'friend'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCoaching(data.data);
      } else {
        throw new Error(data.message || 'Failed to get coaching');
      }
    } catch (error) {
      console.error('Coaching error:', error);
      setAlertMessage('Failed to get coaching advice. Please try again.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    setConversationContext(prev => prev + ` ${action} `);
  };

  // Clean AI response by removing thinking tags and internal monologue
  const cleanAIResponse = (response) => {
    if (!response) return '';
    
    // Remove <think>...</think> tags and their content
    let cleaned = response.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // Remove any remaining thinking patterns
    cleaned = cleaned.replace(/<think[\s\S]*?>/gi, '');
    cleaned = cleaned.replace(/<\/think>/gi, '');
    
    // Remove any other internal monologue patterns
    cleaned = cleaned.replace(/^.*?(?=Here's|Here is|Here are|Here is|Here's|Here are)/i, '');
    
    return cleaned.trim();
  };

  // If conversation is already complete, show a summary instead
  if (conversationComplete) {
    return (
      <CoachContainer scheme={currentScheme}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <CoachCard>
            <CoachHeader>
              <ReadyPlayerMeWebAvatar
                size={60}
                text="🤖"
                showSettings={false}
                autoSpeak={false}
                style={{ marginRight: 16 }}
                avatarUrl="https://models.readyplayer.me/68db3eef5327e5b9d763280e.glb"
              />
              <View>
                <CoachName>Vibe</CoachName>
                <CoachStatus>Your AI Communication Coach</CoachStatus>
              </View>
            </CoachHeader>

            <ConversationStarter>
              <LinearGradient
                colors={['#ff6b9d', '#ff8a80', '#ffb74d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ 
                  padding: 24, 
                  flex: 1, 
                  borderRadius: 20 
                }}
              >
                <Text style={{ 
                  fontSize: 20, 
                  fontWeight: '600', 
                  color: 'white',
                  textAlign: 'center',
                  marginBottom: 20,
                  textShadowColor: 'rgba(0,0,0,0.6)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2
                }}>
                  Great! I already know you well from our conversation.
                </Text>
                <Text style={{ 
                  fontSize: 16, 
                  color: 'white',
                  textAlign: 'center',
                  marginBottom: 20,
                  lineHeight: 24
                }}>
                  I'm here whenever you need me for additional support or guidance during your reflection.
                </Text>
                <Button
                  title="Close Coach"
                  onPress={onClose}
                  variant="secondary"
                  style={{ marginTop: 20 }}
                />
              </LinearGradient>
            </ConversationStarter>
          </CoachCard>
        </Animated.View>
      </CoachContainer>
    );
  }

  return (
    <CoachContainer scheme={currentScheme}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <CoachCard>
          <CoachHeader>
            <ReadyPlayerMeWebAvatar
              size={60}
              text="🤖"
              showSettings={false}
              autoSpeak={false}
              style={{ marginRight: 16 }}
              avatarUrl="https://models.readyplayer.me/68db3eef5327e5b9d763280e.glb"
            />
            <View>
              <CoachName>Vibe</CoachName>
              <CoachStatus>Your AI Communication Coach</CoachStatus>
            </View>
          </CoachHeader>

          {/* Animated Conversation Flow */}
          <ConversationStarter>
            <LinearGradient
              colors={['#ff6b9d', '#ff8a80', '#ffb74d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ 
                padding: 24, 
                flex: 1, 
                borderRadius: 20 
              }}
            >
              {/* Show conversation history */}
              {conversationHistory.map((message, index) => (
                <View key={index} style={{ marginBottom: 24 }}>
                  <Text style={{ 
                    fontSize: message.fontSize || (message.type === 'greeting' ? 28 : 18), 
                    fontWeight: message.type === 'greeting' ? '900' : '600', 
                    color: 'white',
                    textAlign: message.type === 'greeting' ? 'center' : 'left',
                    lineHeight: (message.fontSize || 18) + 8,
                    fontStyle: message.type === 'question' ? 'italic' : 'normal',
                    fontFamily: message.fontFamily || 'System',
                    textShadowColor: 'rgba(0,0,0,0.4)',
                    textShadowOffset: { width: 2, height: 2 },
                    textShadowRadius: 4,
                    letterSpacing: message.type === 'greeting' ? 1 : 0.5
                  }}>
                    {message.text}
                  </Text>
                </View>
              ))}
              
              {/* Show current typing message */}
              {currentMessage && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ 
                    fontSize: 18, 
                    color: 'white',
                    textAlign: 'left',
                    lineHeight: 28,
                    fontWeight: '600',
                    textShadowColor: 'rgba(0,0,0,0.3)',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 2
                  }}>
                    {currentMessage}
                    {isTyping && (
                      <Text style={{ 
                        color: '#ffeb3b',
                        fontSize: 20,
                        fontWeight: 'bold'
                      }}>
                        |
                      </Text>
                    )}
                  </Text>
                </View>
              )}
            
            {/* Show input when it's time for user response */}
            {conversationStep >= conversationMessages.length && (
              <ConversationQuestion>
                <StyledTextInput
                  value={conversationContext}
                  onChangeText={setConversationContext}
                  placeholder="Tell me about the situation... What's happening that you want to address?"
                  multiline
                  onFocus={() => setFocusedInput(true)}
                  onBlur={() => setFocusedInput(false)}
                  focused={focusedInput}
                />
              </ConversationQuestion>
            )}

            {/* Show mood selector when it's time */}
            {conversationStep >= conversationMessages.length && (
              <>
                <Text style={{ 
                  fontSize: 18, 
                  color: 'white',
                  marginBottom: 12,
                  textAlign: 'left',
                  lineHeight: 24,
                  marginTop: 16,
                  fontWeight: '600',
                  textShadowColor: 'rgba(0,0,0,0.3)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2
                }}>
                  And how are you feeling about this situation? Sometimes it helps to name what's going on inside.
                </Text>
                
                <ConversationQuestion>
                  <MoodSelector>
                    {moods.map((mood) => (
                      <MoodButton
                        key={mood}
                        selected={currentMood === mood}
                        onPress={() => setCurrentMood(mood)}
                      >
                        <MoodText selected={currentMood === mood}>{mood}</MoodText>
                      </MoodButton>
                    ))}
                  </MoodSelector>
                </ConversationQuestion>

                <QuickActions>
                  {quickActions.map((action) => (
                    <QuickActionButton
                      key={action}
                      onPress={() => handleQuickAction(action)}
                    >
                      <QuickActionText>{action}</QuickActionText>
                    </QuickActionButton>
                  ))}
                </QuickActions>
              </>
            )}
            </LinearGradient>
          </ConversationStarter>

          <Text style={{ 
            fontSize: 16, 
            color: '#4a5568',
            marginBottom: 16,
            textAlign: 'left',
            lineHeight: 24,
            marginTop: 16
          }}>
            Perfect! Now I have a good sense of what's going on. Let me think about this and give you some personalized guidance for your conversation.
          </Text>

          <Button
            title={isLoading ? "I'm reflecting on your situation..." : "Let's figure this out together"}
            onPress={getCoaching}
            disabled={isLoading}
            loading={isLoading}
            style={{ marginTop: 16 }}
          />

          {coaching && (
            <CoachingResponse>
              <Text style={{ 
                fontSize: 14, 
                color: '#667eea', 
                fontWeight: '600', 
                marginBottom: 8,
                fontStyle: 'italic'
              }}>
                Vibe's thoughts:
              </Text>
              <ResponseText>{cleanAIResponse(coaching.coaching)}</ResponseText>
              <ResponseMeta>
                Shared with you at {new Date(coaching.timestamp).toLocaleTimeString()} • Powered by advanced AI
              </ResponseMeta>
            </CoachingResponse>
          )}
        </CoachCard>

        <Button
          title="Close Coach"
          onPress={onClose}
          variant="outline"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
        />
      </Animated.View>

      <Alert
        visible={showAlert}
        message={alertMessage}
        variant="error"
        onDismiss={() => setShowAlert(false)}
      />
    </CoachContainer>
  );
};

export default RealTimeCoach;
