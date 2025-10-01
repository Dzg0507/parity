import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Platform } from 'react-native';
import WebFBXAvatar from './WebFBXAvatar';
import { theme } from '../../theme';

// Voice integration components
import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';

// AI coaching utilities
import { generateCoachingResponse } from '../../utils/aiCoach';

const Enhanced3DAvatar = ({
  size = 400,
  onCoachingStart = null,
  onCoachingEnd = null,
  coachingMode = 'communication', // 'communication', 'presentation', 'interview'
  style = {},
  enableVoice = true,
  enableAI = true,
  personality = 'supportive' // 'supportive', 'professional', 'friendly'
}) => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [coachingActive, setCoachingActive] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState('');
  const [sessionProgress, setSessionProgress] = useState(0);
  const [voiceLevel, setVoiceLevel] = useState(0);
  
  // Refs
  const voiceTimeoutRef = useRef(null);
  const coachingSessionRef = useRef({
    startTime: null,
    totalSpeakingTime: 0,
    feedbackCount: 0,
    improvements: []
  });

  // Voice recognition setup
  useEffect(() => {
    if (!enableVoice || Platform.OS === 'web') return;

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [enableVoice]);

  // TTS setup
  useEffect(() => {
    if (!enableVoice || Platform.OS === 'web') return;

    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);

    Tts.addEventListener('tts-start', onTtsStart);
    Tts.addEventListener('tts-finish', onTtsFinish);
    Tts.addEventListener('tts-cancel', onTtsCancel);

    return () => {
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
    };
  }, [enableVoice]);

  // Voice event handlers
  const onSpeechStart = () => {
    console.log('🎤 Speech started');
    setIsListening(true);
    setVoiceLevel(0);
  };

  const onSpeechEnd = () => {
    console.log('🎤 Speech ended');
    setIsListening(false);
    setVoiceLevel(0);
  };

  const onSpeechResults = async (event) => {
    const transcript = event.value[0];
    console.log('🎤 Speech result:', transcript);
    
    if (coachingActive && enableAI) {
      await processCoachingInput(transcript);
    }
  };

  const onSpeechError = (error) => {
    console.error('🎤 Speech error:', error);
    setIsListening(false);
    setVoiceLevel(0);
  };

  const onSpeechVolumeChanged = (event) => {
    setVoiceLevel(event.value);
  };

  // TTS event handlers
  const onTtsStart = () => {
    console.log('🔊 TTS started');
    setIsSpeaking(true);
  };

  const onTtsFinish = () => {
    console.log('🔊 TTS finished');
    setIsSpeaking(false);
  };

  const onTtsCancel = () => {
    console.log('🔊 TTS cancelled');
    setIsSpeaking(false);
  };

  // AI coaching functions
  const processCoachingInput = async (transcript) => {
    try {
      const feedback = await generateCoachingResponse({
        transcript,
        coachingMode,
        personality,
        sessionData: coachingSessionRef.current
      });

      setCurrentFeedback(feedback.text);
      
      // Update session progress
      coachingSessionRef.current.feedbackCount++;
      setSessionProgress(Math.min(100, coachingSessionRef.current.feedbackCount * 10));

      // Speak the feedback
      if (enableVoice && feedback.shouldSpeak) {
        await speakText(feedback.text);
      }

      // Store improvements
      if (feedback.improvements) {
        coachingSessionRef.current.improvements.push(...feedback.improvements);
      }

    } catch (error) {
      console.error('AI coaching error:', error);
      setCurrentFeedback('I apologize, but I encountered an error processing your speech. Please try again.');
    }
  };

  const speakText = async (text) => {
    if (Platform.OS === 'web') {
      // Web TTS fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
      }
    } else {
      await Tts.speak(text);
    }
  };

  // Coaching session management
  const startCoachingSession = async () => {
    console.log('🎯 Starting coaching session');
    setCoachingActive(true);
    coachingSessionRef.current.startTime = Date.now();
    coachingSessionRef.current.totalSpeakingTime = 0;
    coachingSessionRef.current.feedbackCount = 0;
    coachingSessionRef.current.improvements = [];
    setSessionProgress(0);
    setCurrentFeedback('');

    if (onCoachingStart) {
      onCoachingStart();
    }

    // Welcome message
    const welcomeMessage = getWelcomeMessage();
    setCurrentFeedback(welcomeMessage);
    await speakText(welcomeMessage);
  };

  const endCoachingSession = async () => {
    console.log('🎯 Ending coaching session');
    setCoachingActive(false);
    
    // Generate session summary
    const summary = generateSessionSummary();
    setCurrentFeedback(summary);
    await speakText(summary);

    if (onCoachingEnd) {
      onCoachingEnd(coachingSessionRef.current);
    }
  };

  const getWelcomeMessage = () => {
    const messages = {
      communication: "Welcome to your communication coaching session! I'm here to help you improve your speaking skills. Let's start with a brief introduction about yourself.",
      presentation: "Ready to practice your presentation skills? I'll provide real-time feedback on your delivery, pacing, and clarity. Begin whenever you're ready.",
      interview: "Let's practice for your interview! I'll help you refine your answers and improve your confidence. Start by telling me about your background."
    };
    return messages[coachingMode] || messages.communication;
  };

  const generateSessionSummary = () => {
    const session = coachingSessionRef.current;
    const duration = session.startTime ? Math.round((Date.now() - session.startTime) / 1000) : 0;
    
    return `Great session! You practiced for ${Math.round(duration / 60)} minutes and received ${session.feedbackCount} pieces of feedback. ${session.improvements.length > 0 ? `Key areas to focus on: ${session.improvements.slice(0, 3).join(', ')}.` : 'Keep up the excellent work!'}`;
  };

  // Voice control functions
  const startListening = async () => {
    if (Platform.OS === 'web') {
      // Web speech recognition fallback
      if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = onSpeechStart;
        recognition.onend = onSpeechEnd;
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          onSpeechResults({ value: [transcript] });
        };
        recognition.onerror = onSpeechError;
        
        recognition.start();
      }
    } else {
      try {
        await Voice.start('en-US');
      } catch (error) {
        console.error('Voice start error:', error);
      }
    }
  };

  const stopListening = async () => {
    if (Platform.OS === 'web') {
      // Web speech recognition stop
      if (window.currentRecognition) {
        window.currentRecognition.stop();
      }
    } else {
      try {
        await Voice.stop();
      } catch (error) {
        console.error('Voice stop error:', error);
      }
    }
  };

  // Avatar interaction handlers
  const handleAvatarPress = () => {
    if (coachingActive) {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    } else {
      startCoachingSession();
    }
  };

  // Render voice level indicator
  const renderVoiceLevel = () => {
    if (!isListening || voiceLevel === 0) return null;

    const level = Math.min(100, voiceLevel * 100);
    const color = level > 80 ? '#4CAF50' : level > 50 ? '#FF9800' : '#F44336';

    return (
      <View style={{
        position: 'absolute',
        top: 10,
        right: 10,
        width: 20,
        height: 100,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
        overflow: 'hidden'
      }}>
        <View style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: `${level}%`,
          backgroundColor: color,
          borderRadius: 10
        }} />
      </View>
    );
  };

  // Render coaching status
  const renderCoachingStatus = () => {
    if (!coachingActive) return null;

    return (
      <View style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <View style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: isListening ? '#4CAF50' : isSpeaking ? '#2196F3' : '#FF9800',
          marginRight: 6
        }} />
        <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
        </Text>
      </View>
    );
  };

  // Render progress bar
  const renderProgress = () => {
    if (!coachingActive || sessionProgress === 0) return null;

    return (
      <View style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <View style={{
          width: `${sessionProgress}%`,
          height: '100%',
          backgroundColor: '#4CAF50',
          borderRadius: 2
        }} />
      </View>
    );
  };

  return (
    <View style={[{ position: 'relative' }, style]}>
      <WebFBXAvatar
        size={size}
        onPress={handleAvatarPress}
        style={{ width: '100%', height: size }}
      />
      
      {renderVoiceLevel()}
      {renderCoachingStatus()}
      {renderProgress()}
      
      {/* Feedback display */}
      {currentFeedback && (
        <View style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 15,
          borderRadius: 10,
          maxHeight: 100
        }}>
          <Text style={{
            color: 'white',
            fontSize: 14,
            lineHeight: 20,
            textAlign: 'center'
          }}>
            {currentFeedback}
          </Text>
        </View>
      )}
      
      {/* Control buttons */}
      <View style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        gap: 10
      }}>
        {coachingActive && (
          <TouchableOpacity
            onPress={endCoachingSession}
            style={{
              backgroundColor: '#F44336',
              padding: 10,
              borderRadius: 20
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              End Session
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Enhanced3DAvatar;