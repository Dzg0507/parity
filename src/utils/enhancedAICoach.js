// Enhanced AI Coaching System
import { generateCoachingResponse as baseCoachingResponse } from './aiCoach';

// Coaching modes and their specific feedback patterns
const COACHING_MODES = {
  communication: {
    name: 'Communication Skills',
    focus: ['clarity', 'pace', 'confidence', 'engagement'],
    feedbackTemplates: {
      positive: [
        "Excellent! Your {aspect} is really strong.",
        "Great job on {aspect}! That's exactly what we want to see.",
        "Your {aspect} is improving significantly. Keep it up!"
      ],
      constructive: [
        "Let's work on your {aspect}. Try to {suggestion}.",
        "I noticed your {aspect} could be improved. Consider {suggestion}.",
        "For better {aspect}, try {suggestion}."
      ]
    },
    suggestions: {
      clarity: [
        "speak more slowly and enunciate each word clearly",
        "pause between sentences to let your message sink in",
        "use simpler words and shorter sentences"
      ],
      pace: [
        "slow down your speaking rate to about 150 words per minute",
        "add more pauses for emphasis and breathing",
        "vary your pace to keep listeners engaged"
      ],
      confidence: [
        "speak with more volume and conviction",
        "maintain steady eye contact (even with me!)",
        "use confident body language and posture"
      ],
      engagement: [
        "ask questions to involve your audience",
        "use storytelling to make your points more memorable",
        "show enthusiasm and passion for your topic"
      ]
    }
  },
  presentation: {
    name: 'Presentation Skills',
    focus: ['structure', 'delivery', 'visuals', 'audience_connection'],
    feedbackTemplates: {
      positive: [
        "Outstanding {aspect}! That's professional-level presentation skill.",
        "Your {aspect} is exactly what makes presentations effective.",
        "Perfect {aspect}! You're mastering this skill."
      ],
      constructive: [
        "For better presentations, focus on {aspect}. Try {suggestion}.",
        "Your {aspect} needs work. Here's how to improve: {suggestion}.",
        "To enhance your {aspect}, consider {suggestion}."
      ]
    },
    suggestions: {
      structure: [
        "start with a clear agenda and stick to it",
        "use the 'tell them what you'll tell them, tell them, tell them what you told them' structure",
        "organize your content into 3-5 main points maximum"
      ],
      delivery: [
        "practice your opening and closing until they're perfect",
        "use vocal variety to emphasize key points",
        "move around the space to engage different parts of the audience"
      ],
      visuals: [
        "keep slides simple with minimal text",
        "use visuals to support, not replace, your spoken words",
        "ensure all text is readable from the back of the room"
      ],
      audience_connection: [
        "make eye contact with different people throughout the room",
        "ask rhetorical questions to keep the audience thinking",
        "share personal stories or examples to build rapport"
      ]
    }
  },
  interview: {
    name: 'Interview Skills',
    focus: ['answers', 'confidence', 'examples', 'questions'],
    feedbackTemplates: {
      positive: [
        "Perfect answer! Your {aspect} really impressed me.",
        "Excellent {aspect}! That's exactly what interviewers want to hear.",
        "Your {aspect} shows real professionalism. Well done!"
      ],
      constructive: [
        "For interviews, work on {aspect}. Try {suggestion}.",
        "Your {aspect} could be stronger. Here's how: {suggestion}.",
        "To improve your {aspect}, consider {suggestion}."
      ]
    },
    suggestions: {
      answers: [
        "use the STAR method: Situation, Task, Action, Result",
        "prepare 5-7 stories that demonstrate different skills",
        "keep answers to 2-3 minutes maximum"
      ],
      confidence: [
        "practice your answers until they feel natural",
        "prepare for common questions like 'tell me about yourself'",
        "research the company and role to show genuine interest"
      ],
      examples: [
        "use specific, quantifiable examples with numbers and results",
        "choose examples that directly relate to the job requirements",
        "practice explaining technical concepts in simple terms"
      ],
      questions: [
        "prepare 3-5 thoughtful questions about the role and company",
        "ask about challenges, growth opportunities, and team culture",
        "avoid questions about salary, benefits, or vacation time initially"
      ]
    }
  }
};

// Personality types and their communication styles
const PERSONALITIES = {
  supportive: {
    tone: 'encouraging and gentle',
    approach: 'focuses on strengths while gently suggesting improvements',
    language: 'uses "we" and "together" language, emphasizes progress'
  },
  professional: {
    tone: 'direct and business-like',
    approach: 'provides clear, actionable feedback with specific metrics',
    language: 'uses formal language, focuses on results and improvement'
  },
  friendly: {
    tone: 'casual and enthusiastic',
    approach: 'celebrates wins and makes learning fun',
    language: 'uses casual language, includes encouragement and humor'
  }
};

// Advanced analysis functions
const analyzeSpeechPatterns = (transcript) => {
  const words = transcript.toLowerCase().split(/\s+/);
  const analysis = {
    wordCount: words.length,
    speakingRate: words.length / 60, // Assuming 1 minute of speech
    fillerWords: (transcript.match(/\b(um|uh|like|you know|so|well)\b/gi) || []).length,
    sentenceLength: transcript.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
    confidence: 0,
    clarity: 0
  };

  // Calculate confidence based on filler words and sentence structure
  analysis.confidence = Math.max(0, 100 - (analysis.fillerWords / analysis.wordCount * 100));
  
  // Calculate clarity based on sentence length and complexity
  const avgSentenceLength = analysis.wordCount / analysis.sentenceLength;
  analysis.clarity = Math.max(0, 100 - (avgSentenceLength - 15) * 2);

  return analysis;
};

const generatePersonalizedFeedback = (transcript, mode, personality, sessionData) => {
  const analysis = analyzeSpeechPatterns(transcript);
  const modeConfig = COACHING_MODES[mode];
  const personalityConfig = PERSONALITIES[personality];
  
  const feedback = {
    text: '',
    shouldSpeak: true,
    improvements: [],
    score: 0
  };

  // Calculate overall score
  feedback.score = Math.round((analysis.confidence + analysis.clarity) / 2);

  // Identify areas for improvement
  const improvements = [];
  if (analysis.confidence < 70) improvements.push('confidence');
  if (analysis.clarity < 70) improvements.push('clarity');
  if (analysis.fillerWords > analysis.wordCount * 0.05) improvements.push('filler_words');
  if (analysis.speakingRate > 200) improvements.push('pace');

  feedback.improvements = improvements;

  // Generate personalized feedback
  if (feedback.score >= 80) {
    // Positive feedback
    const aspect = modeConfig.focus[Math.floor(Math.random() * modeConfig.focus.length)];
    const template = personalityConfig.approach === 'encouraging and gentle' 
      ? modeConfig.feedbackTemplates.positive[0]
      : modeConfig.feedbackTemplates.positive[1];
    
    feedback.text = template.replace('{aspect}', aspect);
  } else {
    // Constructive feedback
    const improvement = improvements[0] || modeConfig.focus[0];
    const suggestion = modeConfig.suggestions[improvement]?.[0] || 'practice more';
    const template = modeConfig.feedbackTemplates.constructive[0];
    
    feedback.text = template
      .replace('{aspect}', improvement.replace('_', ' '))
      .replace('{suggestion}', suggestion);
  }

  // Add personality-specific language
  if (personality === 'supportive') {
    feedback.text = `Great effort! ${feedback.text} Remember, we're building these skills together.`;
  } else if (personality === 'professional') {
    feedback.text = `Based on my analysis: ${feedback.text} Your current score is ${feedback.score}/100.`;
  } else if (personality === 'friendly') {
    feedback.text = `Hey there! ${feedback.text} You're doing awesome! 🎉`;
  }

  return feedback;
};

const generateSessionInsights = (sessionData) => {
  const insights = [];
  
  if (sessionData.feedbackCount > 0) {
    const avgScore = sessionData.improvements.length > 0 
      ? Math.max(0, 100 - (sessionData.improvements.length * 20))
      : 85;
    
    insights.push(`You've completed ${sessionData.feedbackCount} practice rounds with an average score of ${avgScore}/100.`);
  }

  if (sessionData.improvements.length > 0) {
    const topImprovement = sessionData.improvements[0];
    insights.push(`Your biggest opportunity for growth is in ${topImprovement.replace('_', ' ')}.`);
  }

  if (sessionData.totalSpeakingTime > 300) { // 5 minutes
    insights.push(`You've practiced for over ${Math.round(sessionData.totalSpeakingTime / 60)} minutes - excellent commitment!`);
  }

  return insights;
};

// Main enhanced coaching function
export const generateCoachingResponse = async (params) => {
  const { transcript, coachingMode, personality, sessionData } = params;
  
  try {
    // Generate personalized feedback
    const feedback = generatePersonalizedFeedback(transcript, coachingMode, personality, sessionData);
    
    // Add session insights if this is a summary
    if (sessionData.feedbackCount > 5) {
      const insights = generateSessionInsights(sessionData);
      feedback.text += ` ${insights.join(' ')}`;
    }

    // Add motivational elements based on personality
    if (personality === 'supportive' && feedback.score >= 70) {
      feedback.text += " I'm really proud of your progress!";
    } else if (personality === 'professional' && feedback.score >= 80) {
      feedback.text += " This level of performance would impress any interviewer or audience.";
    } else if (personality === 'friendly' && feedback.score >= 60) {
      feedback.text += " You're getting the hang of this! Keep going! 🚀";
    }

    return feedback;
  } catch (error) {
    console.error('Enhanced coaching error:', error);
    
    // Fallback to basic coaching
    try {
      return await baseCoachingResponse(params);
    } catch (fallbackError) {
      return {
        text: "I'm here to help you improve your communication skills. Please try speaking again, and I'll provide feedback.",
        shouldSpeak: true,
        improvements: [],
        score: 0
      };
    }
  }
};

// Additional utility functions
export const getCoachingModeInfo = (mode) => {
  return COACHING_MODES[mode] || COACHING_MODES.communication;
};

export const getPersonalityInfo = (personality) => {
  return PERSONALITIES[personality] || PERSONALITIES.supportive;
};

export const generatePracticePrompts = (mode) => {
  const prompts = {
    communication: [
      "Tell me about a time when you had to explain something complex to someone who didn't understand it.",
      "Describe your ideal work environment and why it motivates you.",
      "Share a story about a challenge you overcame and what you learned from it."
    ],
    presentation: [
      "Present a 2-minute overview of your current project or role.",
      "Explain a concept from your field to someone outside your industry.",
      "Pitch an idea you're passionate about in 3 minutes."
    ],
    interview: [
      "Tell me about yourself and your professional background.",
      "Describe a time when you had to work with a difficult team member.",
      "What are your greatest strengths and how do they apply to this role?"
    ]
  };
  
  return prompts[mode] || prompts.communication;
};

export const calculateProgressScore = (sessionData) => {
  const { feedbackCount, improvements, totalSpeakingTime } = sessionData;
  
  let score = 0;
  
  // Base score from practice time
  score += Math.min(30, totalSpeakingTime / 10);
  
  // Bonus for consistent practice
  if (feedbackCount >= 5) score += 20;
  if (feedbackCount >= 10) score += 20;
  
  // Penalty for repeated issues
  const uniqueImprovements = new Set(improvements).size;
  score -= uniqueImprovements * 5;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};