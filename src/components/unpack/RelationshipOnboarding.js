import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Animated, TouchableOpacity, Text, TextInput, StyleSheet, Modal } from 'react-native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Let the parent handle background
  },
  floatingCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    width: '100%',
    maxWidth: 400,
    minHeight: 500,
    maxHeight: 600,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 20,
    lineHeight: 26,
    fontFamily: 'System',
    letterSpacing: -0.3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 20, // Extra padding to ensure buttons are visible
  },
  optionButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 0,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    minHeight: 50,
    justifyContent: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: '#667eea',
    borderWidth: 3,
    borderColor: '#5a67d8',
    shadowOpacity: 0.5,
    elevation: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    transform: [{ scale: 1.05 }],
  },
  optionButtonUnselected: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    shadowOpacity: 0.3,
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  // Dark theme color schemes
  romanticButton: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderColor: '#ec4899',
    shadowColor: '#ec4899',
    shadowOpacity: 0.4,
    elevation: 6,
  },
  familyButton: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOpacity: 0.4,
    elevation: 6,
  },
  friendButton: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderColor: '#60a5fa',
    shadowColor: '#60a5fa',
    shadowOpacity: 0.4,
    elevation: 6,
  },
  colleagueButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    elevation: 6,
  },
  otherButton: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    borderColor: '#9ca3af',
    shadowColor: '#9ca3af',
    shadowOpacity: 0.4,
    elevation: 6,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: 'System',
    letterSpacing: 0.1,
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  optionTextUnselected: {
    color: '#f1f5f9',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 16,
    padding: 24,
    fontSize: 18,
    color: '#2d3748',
    marginBottom: 16,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40, // Extra margin to ensure it's visible above bottom nav
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  navButtonOutline: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    borderColor: 'rgba(100, 116, 139, 0.2)',
    shadowOpacity: 0.1,
    elevation: 1,
  },
  navButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  navButtonTextOutline: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    padding: 16,
    paddingBottom: 100, // Space for global footer
  },
  scrollableContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  twoColumnLayout: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 40,
  },
  leftColumn: {
    flex: 1,
    maxWidth: 400,
    alignItems: 'center',
  },
  rightColumn: {
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const RelationshipOnboarding = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardRotateAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const optionAnimations = useRef({}).current;

  const questions = [
    {
      id: 'relationship_type',
      type: 'multiple_choice',
      question: '🤖 AI is analyzing your relationship context... What type of relationship are we preparing for?',
      options: [
        'Romantic partner / Spouse',
        'Family member',
        'Friend',
        'Colleague / Coworker',
        'Other'
      ]
    },
    {
      id: 'conversation_importance',
      type: 'multiple_choice',
      question: '🧠 AI needs to understand the stakes... How critical is this conversation?',
      options: [
        'Very important - could affect our relationship',
        'Somewhat important - want to communicate well',
        'Casual - just want to have a good chat',
        'Not sure - exploring the topic'
      ]
    },
    {
      id: 'conversation_topic',
      type: 'multiple_choice',
      question: '🎯 AI is preparing personalized strategies... What\'s the main topic we\'re tackling?',
      options: [
        'Relationship issues / Concerns',
        'Future plans / Life decisions',
        'Daily life / Routine matters',
        'Emotional support / Feelings',
        'Conflict resolution',
        'Other (please specify)'
      ]
    },
    {
      id: 'names',
      type: 'text_input',
      question: '👥 AI wants to personalize your experience... What should I call you both?',
      fields: [
        { key: 'your_name', label: 'Your name' },
        { key: 'their_name', label: 'Their name' }
      ]
    },
    {
      id: 'conversation_goals',
      type: 'multiple_choice',
      question: '🎯 AI is crafting your success strategy... What\'s your main goal here?',
      options: [
        'Better understanding of each other',
        'Resolve a specific issue',
        'Share important news or feelings',
        'Plan something together',
        'Just connect and catch up',
        'Other'
      ]
    },
    {
      id: 'communication_style',
      type: 'multiple_choice',
      question: '💬 AI is adapting to your style... How do you communicate most effectively?',
      options: [
        'Direct and straightforward',
        'Gentle and considerate',
        'Through examples and stories',
        'By asking questions',
        'Through written/text communication',
        'Face-to-face conversation'
      ]
    }
  ];

  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  // Check if Next button should be disabled
  const currentQuestion = questions[currentStep];
  const currentResponse = responses[currentQuestion.id];
  const isNextDisabled = currentQuestion.type === 'multiple_choice' && !currentResponse;

  // Enhanced entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();

    // Animate options flying in from the side like post-it notes
    const currentQuestion = questions[currentStep];
    if (currentQuestion && currentQuestion.type === 'multiple_choice') {
      currentQuestion.options.forEach((option, index) => {
        if (!optionAnimations[option]) {
          optionAnimations[option] = {
            slideX: new Animated.Value(-300),
            slideY: new Animated.Value(100),
            rotate: new Animated.Value(-15),
            scale: new Animated.Value(0.3),
            opacity: new Animated.Value(0),
          };
        }
        
        // Reset animation values
        optionAnimations[option].slideX.setValue(-300);
        optionAnimations[option].slideY.setValue(100);
        optionAnimations[option].rotate.setValue(-15);
        optionAnimations[option].scale.setValue(0.3);
        optionAnimations[option].opacity.setValue(0);
        
        // Stagger the animations with more dramatic effect
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(optionAnimations[option].slideX, {
              toValue: 0,
              tension: 50,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.spring(optionAnimations[option].slideY, {
              toValue: 0,
              tension: 50,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.spring(optionAnimations[option].rotate, {
              toValue: 0,
              tension: 50,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.spring(optionAnimations[option].scale, {
              toValue: 1,
              tension: 50,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.timing(optionAnimations[option].opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        }, index * 150);
      });
    }
  }, [currentStep, progress]);

  // Card rotation animation on step change
  useEffect(() => {
    Animated.sequence([
      Animated.timing(cardRotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardRotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const handleResponse = (questionId, response) => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    const currentResponse = responses[currentQuestion.id];

    // For text input questions, check if all required fields are filled
    if (currentQuestion.type === 'text_input') {
      const allFieldsFilled = currentQuestion.fields.every(field => 
        responses[field.key] && responses[field.key].trim() !== ''
      );
      if (!allFieldsFilled) {
        setAlertMessage('Please fill in all name fields before continuing.');
        setShowAlert(true);
        return;
      }
    } else if (!currentResponse) {
      setAlertMessage('Please select an option before continuing.');
      setShowAlert(true);
      return;
    }

    if (currentStep < totalSteps - 1) {
      // Magical transition animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(prev => prev + 1);
        // Reset for next question
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Completion animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete(responses);
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const renderQuestion = () => {
    const question = questions[currentStep];
    const currentResponse = responses[question.id];

    return (
      <View>
        <Text style={styles.questionText}>{question.question}</Text>
        
        {question.type === 'multiple_choice' && (
          <View style={{ flexDirection: 'column', paddingHorizontal: 4, marginTop: 12 }}>
            {question.options.map((option, index) => {
              const anim = optionAnimations[option];
              
              // Get color scheme based on option
              const getColorScheme = (option) => {
                if (option.includes('Romantic') || option.includes('Spouse')) return styles.romanticButton;
                if (option.includes('Family')) return styles.familyButton;
                if (option.includes('Friend')) return styles.friendButton;
                if (option.includes('Colleague') || option.includes('Coworker')) return styles.colleagueButton;
                return styles.otherButton;
              };
              
              return (
                <AnimatedTouchableOpacity
                  key={index}
                  onPress={() => handleResponse(question.id, option)}
                  style={[
                    styles.optionButton,
                    currentResponse === option ? styles.optionButtonSelected : styles.optionButtonUnselected,
                    !currentResponse && getColorScheme(option),
                    { 
                      transform: [
                        { translateX: anim?.slideX || 0 },
                        { translateY: anim?.slideY || 0 },
                        { rotate: anim?.rotate || '0deg' },
                        { scale: anim?.scale || 1 }
                      ],
                      opacity: anim?.opacity || 1,
                    }
                  ]}
                >
                  <Text style={[
                    styles.optionText,
                    currentResponse === option ? styles.optionTextSelected : styles.optionTextUnselected
                  ]}>
                    {option}
                  </Text>
                </AnimatedTouchableOpacity>
              );
            })}
          </View>
        )}

        {question.type === 'text_input' && (
          <View style={styles.inputContainer}>
            {question.fields.map((field) => (
              <View key={field.key}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  value={responses[field.key] || ''}
                  onChangeText={(text) => handleResponse(field.key, text)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  placeholderTextColor="rgba(74, 85, 104, 0.6)"
                />
              </View>
            ))}
          </View>
        )}

      </View>
    );
  };

  const cardRotation = cardRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      <Modal
        visible={showAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAlert(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>{alertMessage}</Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setShowAlert(false)}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <View style={styles.mainContent}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          }}
        >
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressAnim }
                ]}
              />
            </View>
          </View>
        </Animated.View>

        <View style={styles.twoColumnLayout}>
          <View style={styles.leftColumn}>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                  { rotate: cardRotation },
                ],
              }}
            >
              <View style={styles.floatingCard}>
                {renderQuestion()}
              </View>
            </Animated.View>
          </View>

          <View style={styles.rightColumn}>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: buttonScaleAnim },
                ],
              }}
            >
              <View style={styles.buttonColumn}>
                <TouchableOpacity
                  style={[
                    styles.navButton, 
                    { marginBottom: 16, width: 180 },
                    isNextDisabled && styles.navButtonDisabled
                  ]}
                  onPress={isNextDisabled ? null : handleNext}
                  disabled={isNextDisabled}
                >
                  <Text style={[
                    styles.navButtonText,
                    isNextDisabled && styles.navButtonTextDisabled
                  ]}>
                    {currentStep === totalSteps - 1 ? "✨ Complete ✨" : "Next →"}
                  </Text>
                </TouchableOpacity>

                {currentStep > 0 && (
                  <TouchableOpacity
                    style={[styles.navButtonOutline, { marginBottom: 16, width: 180 }]}
                    onPress={handlePrevious}
                  >
                    <Text style={styles.navButtonTextOutline}>← Previous</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={[styles.skipButton, { width: 180 }]} 
                  onPress={handleSkip}
                >
                  <Text style={styles.skipText}>Skip Setup</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </View>
      </View>

    </View>
  );
};

export default RelationshipOnboarding;
