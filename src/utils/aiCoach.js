// FREE AI Coach Implementation
// Uses completely free local fallback system - no paid APIs required

// Use Groq for free AI
const Groq = require('groq-sdk');

class AdvancedAICoach {
  constructor() {
    // Initialize Groq for free AI
    if (process.env.GROQ_API_KEY) {
      try {
        this.groq = new Groq({
          apiKey: process.env.GROQ_API_KEY,
        });
        this.initialized = true;
        console.log('✅ Groq API initialized successfully (FREE!)');
      } catch (error) {
        console.warn('⚠️ Groq API initialization failed:', error.message);
        this.initialized = false;
      }
    } else {
      console.warn('⚠️ GROQ_API_KEY not found. Running in fallback mode.');
      this.initialized = false;
    }
    
    this.conversationHistory = new Map();
    this.userPatterns = new Map();
  }

  // 1. ADVANCED: AI-Powered Sentiment Analysis
  async analyzeSentiment(text) {
    if (!this.initialized) {
      return this.fallbackSentimentAnalysis(text);
    }

    try {
      const response = await this.groq.chat.completions.create({
        model: "qwen/qwen3-32b",
        messages: [{
          role: "system",
          content: "Analyze the emotional tone and sentiment of the given text. Return a JSON object with 'sentiment' (positive/negative/neutral), 'confidence' (0-1), 'emotions' (array of detected emotions), and 'intensity' (0-1)."
        }, {
          role: "user",
          content: text
        }],
        temperature: 0.3,
        max_tokens: 150
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return {
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        emotions: analysis.emotions || [],
        intensity: analysis.intensity,
        isPositive: analysis.sentiment === 'positive'
      };
    } catch (error) {
      console.warn('Groq sentiment analysis failed, using fallback:', error);
      return this.fallbackSentimentAnalysis(text);
    }
  }

  // 2. ADVANCED: AI-Powered Topic Detection & Analysis
  async detectConversationTopic(text) {
    if (!this.initialized) {
      return this.localTopicDetection(text);
    }

    try {
      const response = await this.groq.chat.completions.create({
        model: "qwen/qwen3-32b",
        messages: [{
          role: "system",
          content: "Analyze the conversation topic and context. Return a JSON object with 'primaryTopic', 'subtopics' (array), 'complexity' (low/medium/high), 'urgency' (low/medium/high), and 'relationshipImpact' (low/medium/high)."
        }, {
          role: "user",
          content: text
        }],
        temperature: 0.2,
        max_tokens: 200
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return {
        labels: [analysis.primaryTopic],
        scores: [0.9], // High confidence for AI analysis
        primaryTopic: analysis.primaryTopic,
        subtopics: analysis.subtopics || [],
        complexity: analysis.complexity,
        urgency: analysis.urgency,
        relationshipImpact: analysis.relationshipImpact
      };
    } catch (error) {
      console.warn('Groq topic detection failed, using fallback:', error);
      return this.localTopicDetection(text);
    }
  }

  // 3. ADVANCED: AI-Generated Personalized Prompts
  async generatePrompts(relationshipType, topic, context = '', userHistory = []) {
    if (!this.initialized) {
      return this.generateSmartPrompts(relationshipType, topic);
    }

    try {
      const systemPrompt = `You are an expert communication coach. Generate 5-7 personalized conversation prompts for a ${relationshipType} discussing ${topic}. 
      
      Consider:
      - The relationship dynamics and history
      - The complexity and sensitivity of the topic
      - Different conversation approaches (direct, gentle, exploratory)
      - Emotional intelligence principles
      - Active listening techniques
      - The user's specific situation and responses from their conversation
      
      IMPORTANT: Return ONLY a valid JSON array. No explanations, no thinking tags, no additional text. Just the JSON array of prompt objects with: 'id', 'text', 'type' (opening/exploring/resolving/closing), 'difficulty' (easy/medium/hard), and 'purpose'.`;

      const userContext = userHistory.length > 0 ? 
        `User's previous conversation patterns: ${JSON.stringify(userHistory.slice(-3))}` : 
        'No previous history available.';

      // Parse conversation data if available
      let conversationContext = '';
      if (context) {
        try {
          const conversationData = JSON.parse(context);
          conversationContext = `User's current situation: ${JSON.stringify(conversationData)}`;
        } catch (e) {
          conversationContext = `User's current situation: ${context}`;
        }
      }

      const response = await this.groq.chat.completions.create({
        model: "qwen/qwen3-32b",
        messages: [{
          role: "system",
          content: systemPrompt
        }, {
          role: "user",
          content: `Relationship: ${relationshipType}\nTopic: ${topic}\n${conversationContext}\n${userContext}`
        }],
        temperature: 0.7,
        max_tokens: 400
      });

      let content = response.choices[0].message.content;
      
      // Clean the response - remove markdown code blocks, thinking tags, and extra text
      content = content.replace(/```json\s*/gi, '');
      content = content.replace(/```\s*/gi, '');
      content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
      content = content.replace(/<think[\s\S]*?>/gi, '');
      content = content.replace(/<\/think>/gi, '');
      content = content.trim();
      
      // Try to extract JSON if there's extra text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }
      
      const prompts = JSON.parse(content);
      return prompts.map((prompt, index) => ({
        id: prompt.id || `ai_prompt_${index}`,
        question: prompt.text,
        type: prompt.type || 'exploring',
        difficulty: prompt.difficulty || 'medium',
        purpose: prompt.purpose || 'general',
        for: 'solo'
      }));
    } catch (error) {
      console.warn('Groq prompt generation failed, using fallback:', error);
      return this.generateSmartPrompts(relationshipType, topic);
    }
  }

  // 4. FREE: Conversation Coaching Tips
  generateCoachingTips(sentiment, topic, relationshipType) {
    const tips = {
      positive: [
        "Great! The conversation seems to be going well. Keep listening actively.",
        "Your partner seems receptive. This is a good time to share your perspective.",
        "The positive tone suggests trust. You can be more direct about your needs."
      ],
      negative: [
        "The conversation seems tense. Try using 'I' statements instead of 'you' statements.",
        "Consider taking a break and revisiting this when emotions are calmer.",
        "Focus on understanding their perspective before sharing yours."
      ],
      neutral: [
        "The conversation is neutral. This is a good time to ask open-ended questions.",
        "Try to understand their underlying concerns before responding.",
        "Use active listening techniques to encourage deeper sharing."
      ]
    };

    return tips[sentiment] || tips.neutral;
  }

  // 5. FREE: Smart Fallback Methods
  fallbackSentimentAnalysis(text) {
    const positiveWords = ['good', 'great', 'happy', 'love', 'excited', 'wonderful', 'amazing', 'positive', 'optimistic', 'confident', 'hopeful', 'grateful', 'proud', 'satisfied', 'content', 'peaceful', 'calm', 'understanding', 'supportive'];
    const negativeWords = ['bad', 'terrible', 'angry', 'frustrated', 'disappointed', 'hurt', 'upset', 'worried', 'anxious', 'stressed', 'confused', 'overwhelmed', 'sad', 'depressed', 'lonely', 'isolated', 'rejected', 'abandoned', 'betrayed', 'confused'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    // Calculate confidence based on word count
    const totalEmotionalWords = positiveCount + negativeCount;
    const confidence = totalEmotionalWords > 0 ? Math.min(0.9, 0.5 + (totalEmotionalWords * 0.1)) : 0.3;
    
    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', confidence, isPositive: true };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', confidence, isPositive: false };
    }
    
    return { sentiment: 'neutral', confidence: 0.5, isPositive: null };
  }

  localTopicDetection(text) {
    const topicKeywords = {
      'relationship issues': ['relationship', 'partner', 'boyfriend', 'girlfriend', 'spouse', 'marriage', 'dating', 'love', 'romance', 'commitment', 'trust', 'intimacy'],
      'work conflict': ['work', 'job', 'boss', 'colleague', 'office', 'career', 'promotion', 'salary', 'meeting', 'project', 'deadline', 'team'],
      'family problems': ['family', 'parent', 'mother', 'father', 'sibling', 'brother', 'sister', 'child', 'son', 'daughter', 'grandparent', 'relative'],
      'financial stress': ['money', 'financial', 'debt', 'budget', 'income', 'expenses', 'savings', 'investment', 'bills', 'cost', 'expensive', 'afford'],
      'health concerns': ['health', 'medical', 'doctor', 'hospital', 'illness', 'sick', 'pain', 'treatment', 'medication', 'therapy', 'mental health', 'physical'],
      'future planning': ['future', 'plan', 'goal', 'dream', 'aspiration', 'career', 'education', 'travel', 'retirement', 'investment', 'long-term', 'vision'],
      'communication breakdown': ['communication', 'talk', 'discuss', 'conversation', 'listen', 'understand', 'misunderstand', 'conflict', 'argument', 'disagreement', 'silence']
    };

    const words = text.toLowerCase().split(/\s+/);
    let bestMatch = 'general conversation';
    let bestScore = 0;

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const score = keywords.filter(keyword => words.some(word => word.includes(keyword))).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = topic;
      }
    }

    return { 
      labels: [bestMatch], 
      scores: [Math.min(0.9, 0.3 + (bestScore * 0.2))] 
    };
  }

  generateSmartPrompts(relationshipType, topic) {
    const promptTemplates = {
      'romantic partner': [
        {
          id: '1',
          question: `I've been thinking about ${topic} and I'd like to understand your perspective better.`,
          type: 'opening',
          difficulty: 'easy',
          purpose: 'understanding',
          for: 'solo'
        },
        {
          id: '2',
          question: `I want to share something about ${topic} that's been on my mind.`,
          type: 'exploring',
          difficulty: 'medium',
          purpose: 'sharing',
          for: 'solo'
        },
        {
          id: '3',
          question: `Can we talk about ${topic}? I want to make sure we're on the same page.`,
          type: 'resolving',
          difficulty: 'medium',
          purpose: 'alignment',
          for: 'solo'
        }
      ],
      'family member': [
        {
          id: '1',
          question: `I'd like to discuss ${topic} with you because I value our relationship.`,
          type: 'opening',
          difficulty: 'easy',
          purpose: 'understanding',
          for: 'solo'
        },
        {
          id: '2',
          question: `There's something about ${topic} I want to share with you.`,
          type: 'exploring',
          difficulty: 'medium',
          purpose: 'sharing',
          for: 'solo'
        },
        {
          id: '3',
          question: `I think it's important we talk about ${topic} together.`,
          type: 'resolving',
          difficulty: 'medium',
          purpose: 'alignment',
          for: 'solo'
        }
      ],
      'friend': [
        {
          id: '1',
          question: `I've been thinking about ${topic} and wanted to get your thoughts.`,
          type: 'opening',
          difficulty: 'easy',
          purpose: 'understanding',
          for: 'solo'
        },
        {
          id: '2',
          question: `I'd like to talk about ${topic} - I value your perspective.`,
          type: 'exploring',
          difficulty: 'medium',
          purpose: 'sharing',
          for: 'solo'
        },
        {
          id: '3',
          question: `Can we chat about ${topic}? I think it would help to talk it through.`,
          type: 'resolving',
          difficulty: 'medium',
          purpose: 'alignment',
          for: 'solo'
        }
      ]
    };

    return promptTemplates[relationshipType] || promptTemplates['friend'];
  }

  // 6. FREE: Conversation Success Prediction
  predictConversationSuccess(sentiment, topic, relationshipType, preparationTime) {
    let score = 0.5; // Base score
    
    // Adjust based on sentiment
    if (sentiment === 'positive') score += 0.2;
    if (sentiment === 'negative') score -= 0.2;
    
    // Adjust based on preparation
    if (preparationTime > 10) score += 0.1; // More prep = better success
    
    // Adjust based on relationship type
    const relationshipScores = {
      'romantic partner': 0.8,
      'family member': 0.7,
      'friend': 0.9,
      'colleague': 0.6
    };
    
    score *= (relationshipScores[relationshipType] || 0.7);
    
    return {
      successProbability: Math.min(Math.max(score, 0.1), 0.95),
      recommendations: this.getSuccessRecommendations(score)
    };
  }

  getSuccessRecommendations(score) {
    if (score > 0.8) {
      return ["You're well-prepared! Trust your instincts and be authentic."];
    } else if (score > 0.6) {
      return ["Good preparation! Consider practicing your key points one more time."];
    } else {
      return [
        "Consider doing more preparation before this conversation.",
        "Think about what you want to achieve from this discussion.",
        "Consider the best time and place for this conversation."
      ];
    }
  }

  // 7. ADVANCED: AI-Powered Strategy Briefing Generation
  async generateStrategyBriefing(journalEntries, relationshipType, topic, userProfile = {}) {
    if (!this.initialized) {
      return this.generateFallbackBriefing(journalEntries, relationshipType, topic);
    }

    try {
      const systemPrompt = `You are an expert communication strategist. Analyze the journal entries and create a comprehensive strategy briefing.

      Generate a JSON object with:
      - 'keyInsights': Array of 3-5 key insights about the user's perspective
      - 'communicationStyle': Recommended approach (direct/gentle/exploratory/collaborative)
      - 'talkingPoints': Array of 5-7 key points to discuss
      - 'potentialChallenges': Array of 3-5 potential obstacles and solutions
      - 'successMetrics': How to measure if the conversation went well
      - 'followUpActions': Suggested next steps after the conversation
      - 'emotionalPreparation': Tips for managing emotions during the conversation
      
      IMPORTANT: Do not include any thinking tags, internal monologue, or reasoning process. Provide only the JSON response.`;

      const entriesText = journalEntries.map(entry => 
        `Prompt: ${entry.promptText}\nResponse: ${entry.encryptedResponse}`
      ).join('\n\n');

      const response = await this.groq.chat.completions.create({
        model: "qwen/qwen3-32b",
        messages: [{
          role: "system",
          content: systemPrompt
        }, {
          role: "user",
          content: `Relationship: ${relationshipType}\nTopic: ${topic}\nUser Profile: ${JSON.stringify(userProfile)}\n\nJournal Entries:\n${entriesText}`
        }],
        temperature: 0.6,
        max_tokens: 600
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.warn('Groq briefing generation failed, using fallback:', error);
      return this.generateFallbackBriefing(journalEntries, relationshipType, topic);
    }
  }

  // 8. ADVANCED: Real-time Conversation Coaching
  async provideRealTimeCoaching(conversationContext, currentMood, relationshipType) {
    if (!this.initialized) {
      return "Stay calm, listen actively, and express yourself clearly.";
    }

    try {
      const response = await this.groq.chat.completions.create({
        model: "qwen/qwen3-32b",
        messages: [{
          role: "system",
          content: "You are a real-time communication coach. Provide immediate, actionable advice based on the current conversation context and mood. Do not include any thinking tags, internal monologue, or reasoning process in your response. Give direct, helpful advice only."
        }, {
          role: "user",
          content: `Current context: ${conversationContext}\nMood: ${currentMood}\nRelationship: ${relationshipType}`
        }],
        temperature: 0.4,
        max_tokens: 300
      });

      return response.choices[0].message.content;
    } catch (error) {
      return "Stay calm, listen actively, and express yourself clearly.";
    }
  }

  // 9. ADVANCED: Personalized Learning & Pattern Recognition
  async analyzeUserPatterns(userId, conversationHistory) {
    if (!this.initialized) {
      return null;
    }

    try {
      const response = await this.groq.chat.completions.create({
        model: "qwen/qwen3-32b",
        messages: [{
          role: "system",
          content: "Analyze conversation patterns and provide personalized insights about communication style, strengths, and areas for improvement."
        }, {
          role: "user",
          content: `User ID: ${userId}\nConversation History: ${JSON.stringify(conversationHistory)}`
        }],
        temperature: 0.3,
        max_tokens: 300
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      this.userPatterns.set(userId, analysis);
      return analysis;
    } catch (error) {
      console.warn('Pattern analysis failed:', error);
      return null;
    }
  }

  // 10. ADVANCED: Smart Content Recommendations
  async generateContentRecommendations(userProfile, currentMood, relationshipType) {
    if (!this.initialized) {
      return { recommendations: ["Focus on active listening", "Use 'I' statements", "Take breaks if needed"] };
    }

    try {
      const response = await this.groq.chat.completions.create({
        model: "qwen/qwen3-32b",
        messages: [{
          role: "system",
          content: "Generate personalized content recommendations including conversation starters, relationship tips, and communication exercises."
        }, {
          role: "user",
          content: `Profile: ${JSON.stringify(userProfile)}\nMood: ${currentMood}\nRelationship: ${relationshipType}`
        }],
        temperature: 0.7,
        max_tokens: 400
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      return { recommendations: ["Focus on active listening", "Use 'I' statements", "Take breaks if needed"] };
    }
  }

  // 11. ADVANCED: Voice Analysis & Metrics
  analyzeVoiceMetrics(audioData) {
    const metrics = {
      pace: this.calculatePace(audioData),
      clarity: this.calculateClarity(audioData),
      confidence: this.calculateConfidence(audioData),
      emotion: this.detectEmotion(audioData),
      fillerWords: this.countFillerWords(audioData.transcript),
      pauses: this.analyzePauses(audioData),
      volume: this.analyzeVolume(audioData)
    };
    
    return {
      ...metrics,
      overallScore: this.calculateOverallScore(metrics),
      recommendations: this.generateVoiceRecommendations(metrics)
    };
  }

  // Calculate speaking pace (words per minute)
  calculatePace(audioData) {
    const words = audioData.transcript.split(' ').length;
    const duration = audioData.duration / 60; // Convert to minutes
    return Math.round(words / duration);
  }

  // Calculate speech clarity based on pronunciation and enunciation
  calculateClarity(audioData) {
    const baseScore = 75;
    const fillerPenalty = this.countFillerWords(audioData.transcript) * 2;
    const pausePenalty = this.analyzePauses(audioData).excessive * 1.5;
    
    return Math.max(0, Math.min(100, baseScore - fillerPenalty - pausePenalty));
  }

  // Calculate confidence based on voice characteristics
  calculateConfidence(audioData) {
    const volume = audioData.volume || 0.5;
    const pace = this.calculatePace(audioData);
    const clarity = this.calculateClarity(audioData);
    
    const volumeScore = Math.min(100, volume * 200);
    const paceScore = pace >= 120 && pace <= 180 ? 100 : Math.max(0, 100 - Math.abs(pace - 150) * 2);
    const clarityScore = clarity;
    
    return Math.round((volumeScore + paceScore + clarityScore) / 3);
  }

  // Detect emotion from voice characteristics
  detectEmotion(audioData) {
    const pace = this.calculatePace(audioData);
    const volume = audioData.volume || 0.5;
    
    if (pace > 160 && volume > 0.7) return 'excited';
    if (pace < 100 && volume < 0.4) return 'nervous';
    if (pace > 140 && volume < 0.5) return 'anxious';
    if (pace >= 120 && pace <= 160 && volume >= 0.5) return 'confident';
    
    return 'neutral';
  }

  // Count filler words
  countFillerWords(transcript) {
    const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically'];
    const words = transcript.toLowerCase().split(/\s+/);
    return words.filter(word => fillerWords.includes(word)).length;
  }

  // Analyze pauses in speech
  analyzePauses(audioData) {
    const words = audioData.transcript.split(' ');
    const longPauses = words.filter(word => word.includes('...') || word.includes('--')).length;
    
    return {
      total: longPauses,
      excessive: longPauses > 3 ? longPauses - 3 : 0,
      average: longPauses / words.length
    };
  }

  // Analyze volume patterns
  analyzeVolume(audioData) {
    return {
      average: audioData.volume || 0.5,
      variation: audioData.volumeVariation || 0.2,
      consistency: audioData.volumeConsistency || 0.8
    };
  }

  // Calculate overall speaking score
  calculateOverallScore(metrics) {
    const weights = {
      pace: 0.2,
      clarity: 0.3,
      confidence: 0.25,
      emotion: 0.15,
      fillerWords: 0.1
    };

    const paceScore = metrics.pace >= 120 && metrics.pace <= 180 ? 100 : 
                     Math.max(0, 100 - Math.abs(metrics.pace - 150) * 2);
    const fillerScore = Math.max(0, 100 - metrics.fillerWords * 10);
    const emotionScore = this.getEmotionScore(metrics.emotion);

    return Math.round(
      paceScore * weights.pace +
      metrics.clarity * weights.clarity +
      metrics.confidence * weights.confidence +
      emotionScore * weights.emotion +
      fillerScore * weights.fillerWords
    );
  }

  // Get emotion score (higher is better for communication)
  getEmotionScore(emotion) {
    const emotionScores = {
      'confident': 100,
      'excited': 85,
      'neutral': 70,
      'anxious': 40,
      'nervous': 30
    };
    return emotionScores[emotion] || 50;
  }

  // Generate personalized recommendations
  generateVoiceRecommendations(metrics) {
    const recommendations = [];

    if (metrics.pace < 120) {
      recommendations.push({
        type: 'pace',
        priority: 'high',
        message: 'Try speaking a bit faster to maintain engagement',
        tip: 'Practice reading aloud at 140-160 words per minute'
      });
    } else if (metrics.pace > 180) {
      recommendations.push({
        type: 'pace',
        priority: 'high',
        message: 'Slow down slightly for better comprehension',
        tip: 'Take deliberate pauses between key points'
      });
    }

    if (metrics.clarity < 70) {
      recommendations.push({
        type: 'clarity',
        priority: 'high',
        message: 'Focus on clear pronunciation and enunciation',
        tip: 'Practice tongue twisters to improve articulation'
      });
    }

    if (metrics.confidence < 60) {
      recommendations.push({
        type: 'confidence',
        priority: 'medium',
        message: 'Work on projecting your voice with more confidence',
        tip: 'Practice power poses and deep breathing before speaking'
      });
    }

    if (metrics.fillerWords > 5) {
      recommendations.push({
        type: 'filler_words',
        priority: 'medium',
        message: 'Reduce filler words for more professional delivery',
        tip: 'Practice pausing instead of using "um" or "uh"'
      });
    }

    if (metrics.emotion === 'nervous' || metrics.emotion === 'anxious') {
      recommendations.push({
        type: 'emotion',
        priority: 'high',
        message: 'Focus on calming techniques before important conversations',
        tip: 'Try 4-7-8 breathing: inhale for 4, hold for 7, exhale for 8'
      });
    }

    return recommendations;
  }

  // 12. ADVANCED: Real-time Coaching with Voice Analysis
  async generateCoachingResponse(input) {
    const {
      transcript,
      coachingMode = 'communication',
      personality = 'supportive',
      sessionData = {},
      audioData = null
    } = input;

    // Analyze the input
    const analysis = audioData ? this.analyzeVoiceMetrics(audioData) : null;
    
    // Generate contextual response based on mode
    let response = '';
    
    if (this.initialized) {
      try {
        const systemPrompt = `You are an expert communication coach with a ${personality} personality. Provide personalized coaching based on the user's speech and context.

        Coaching Mode: ${coachingMode}
        Personality: ${personality}
        
        Provide specific, actionable feedback that helps improve their communication skills. Be encouraging but direct about areas for improvement.`;
        
        const userPrompt = `Transcript: "${transcript}"
        ${analysis ? `Voice Analysis: ${JSON.stringify(analysis)}` : ''}
        Session Data: ${JSON.stringify(sessionData)}`;

        const groqResponse = await this.groq.chat.completions.create({
          model: "qwen/qwen3-32b",
          messages: [{
            role: "system",
            content: systemPrompt
          }, {
            role: "user",
            content: userPrompt
          }],
          temperature: 0.7,
          max_tokens: 300
        });

        response = groqResponse.choices[0].message.content;
      } catch (error) {
        console.warn('Groq coaching failed, using fallback:', error);
        response = this.generateFallbackCoaching(transcript, analysis, coachingMode, personality);
      }
    } else {
      response = this.generateFallbackCoaching(transcript, analysis, coachingMode, personality);
    }

    return {
      text: response,
      shouldSpeak: true,
      improvements: analysis?.recommendations || [],
      insights: this.generatePersonalizedInsights(sessionData, analysis),
      metrics: analysis,
      timestamp: Date.now()
    };
  }

  // Fallback coaching when AI is not available
  generateFallbackCoaching(transcript, analysis, coachingMode, personality) {
    const responses = {
      supportive: [
        "I can hear the thought you're putting into this. Let me help you express it even more clearly.",
        "You're doing great at sharing your perspective. Here's how you might make it even more impactful...",
        "I appreciate your honesty in sharing this. Let's work together to find the right words."
      ],
      professional: [
        "Your message is clear, but here are some ways to enhance its effectiveness:",
        "Good structure overall. Consider these refinements for better impact:",
        "Your communication shows good understanding. Here are specific improvements:"
      ],
      friendly: [
        "Nice work! I have a few ideas that might help you say this even better:",
        "You're on the right track! Here's what I'm thinking:",
        "I like where you're going with this. Want to try a different approach?"
      ]
    };

    const baseResponse = responses[personality]?.[Math.floor(Math.random() * responses[personality].length)] || 
                        responses.supportive[0];

    let specificAdvice = '';
    
    if (analysis) {
      if (analysis.clarity < 70) {
        specificAdvice += "Try speaking more slowly and clearly. ";
      }
      if (analysis.confidence < 60) {
        specificAdvice += "Project your voice with more confidence. ";
      }
      if (analysis.fillerWords > 3) {
        specificAdvice += "Reduce filler words for a more polished delivery. ";
      }
    }

    return `${baseResponse} ${specificAdvice}`.trim();
  }

  // Generate personalized insights based on user history
  generatePersonalizedInsights(sessionData, analysis) {
    const insights = [];
    
    if (sessionData.feedbackCount > 0) {
      const improvementRate = sessionData.improvements.length / sessionData.feedbackCount;
      if (improvementRate > 0.7) {
        insights.push("You're showing excellent improvement in addressing feedback!");
      } else if (improvementRate < 0.3) {
        insights.push("Focus on implementing the specific recommendations for faster progress.");
      }
    }

    if (analysis) {
      if (analysis.overallScore > 80) {
        insights.push("Your communication skills are really strong! Keep up the great work.");
      } else if (analysis.overallScore < 50) {
        insights.push("Don't worry - every expert was once a beginner. Focus on one area at a time.");
      }
    }

    return insights;
  }

  generateFallbackBriefing(entries, relationshipType, topic) {
    return {
      keyInsights: ["Focus on understanding each other's perspectives", "Be patient and open-minded"],
      communicationStyle: "collaborative",
      talkingPoints: ["Share your perspective clearly", "Listen to their concerns", "Find common ground"],
      potentialChallenges: ["Emotional reactions", "Misunderstandings", "Defensiveness"],
      successMetrics: ["Both parties feel heard", "Clear next steps established"],
      followUpActions: ["Schedule follow-up if needed", "Reflect on the conversation"],
      emotionalPreparation: ["Take deep breaths", "Stay calm and focused"]
    };
  }
}

module.exports = AdvancedAICoach;