// PERSONALIZATION ENGINE
// This is going to make the app UNIQUELY YOURS! 🎯

import { storage } from './storage';
import { analyticsManager } from './analytics';
import { gamificationManager } from './gamification';

// 1. PERSONALIZATION MANAGER
export class PersonalizationManager {
  constructor() {
    this.userProfiles = new Map();
    this.preferences = new Map();
    this.learningStyles = new Map();
    this.communicationPatterns = new Map();
  }

  // Initialize user profile
  async initializeUserProfile(userId) {
    const profile = {
      id: userId,
      preferences: await this.getUserPreferences(userId),
      learningStyle: await this.getUserLearningStyle(userId),
      communicationPattern: await this.getUserCommunicationPattern(userId),
      personalizationLevel: 'basic',
      lastUpdated: Date.now(),
    };

    this.userProfiles.set(userId, profile);
    await this.saveUserProfile(userId, profile);
    return profile;
  }

  // Get user profile
  async getUserProfile(userId) {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId);
    }

    const stored = await storage.getItem(`user_profile_${userId}`);
    if (stored) {
      const profile = JSON.parse(stored);
      this.userProfiles.set(userId, profile);
      return profile;
    }

    return await this.initializeUserProfile(userId);
  }

  // Save user profile
  async saveUserProfile(userId, profile) {
    await storage.setItem(`user_profile_${userId}`, JSON.stringify(profile));
  }

  // Update user profile
  async updateUserProfile(userId, updates) {
    const profile = await this.getUserProfile(userId);
    const updatedProfile = {
      ...profile,
      ...updates,
      lastUpdated: Date.now(),
    };

    this.userProfiles.set(userId, updatedProfile);
    await this.saveUserProfile(userId, updatedProfile);
    return updatedProfile;
  }

  // Get user preferences
  async getUserPreferences(userId) {
    const stored = await storage.getItem(`user_preferences_${userId}`);
    return stored ? JSON.parse(stored) : {
      theme: 'auto',
      notifications: true,
      aiCoach: true,
      reminders: true,
      tips: true,
      celebrations: true,
      language: 'en',
      timezone: 'UTC',
      preferredSessionLength: 15,
      preferredTimeOfDay: 'morning',
      relationshipTypes: [],
      topics: [],
      difficulty: 'medium',
    };
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    const current = await this.getUserPreferences(userId);
    const updated = { ...current, ...preferences };
    await storage.setItem(`user_preferences_${userId}`, JSON.stringify(updated));
    return updated;
  }

  // Get user learning style
  async getUserLearningStyle(userId) {
    const stored = await storage.getItem(`learning_style_${userId}`);
    return stored ? JSON.parse(stored) : {
      type: 'balanced', // visual, auditory, kinesthetic, reading, balanced
      preferences: {
        visual: 0.2,
        auditory: 0.2,
        kinesthetic: 0.2,
        reading: 0.2,
        balanced: 0.2,
      },
      strengths: [],
      challenges: [],
      adaptations: [],
    };
  }

  // Update learning style
  async updateLearningStyle(userId, learningStyle) {
    await storage.setItem(`learning_style_${userId}`, JSON.stringify(learningStyle));
    return learningStyle;
  }

  // Get user communication pattern
  async getUserCommunicationPattern(userId) {
    const stored = await storage.getItem(`communication_pattern_${userId}`);
    return stored ? JSON.parse(stored) : {
      style: 'balanced', // assertive, passive, aggressive, balanced
      preferences: {
        direct: 0.5,
        indirect: 0.5,
        emotional: 0.5,
        logical: 0.5,
        formal: 0.5,
        casual: 0.5,
      },
      strengths: [],
      areasForImprovement: [],
      triggers: [],
      comfortZones: [],
    };
  }

  // Update communication pattern
  async updateCommunicationPattern(userId, pattern) {
    await storage.setItem(`communication_pattern_${userId}`, JSON.stringify(pattern));
    return pattern;
  }
}

export const personalizationManager = new PersonalizationManager();

// 2. ADAPTIVE CONTENT SYSTEM
export class AdaptiveContentSystem {
  constructor() {
    this.personalizationManager = personalizationManager;
    this.analyticsManager = analyticsManager;
  }

  // Adapt prompts based on user profile
  async adaptPrompts(userId, prompts) {
    const profile = await this.personalizationManager.getUserProfile(userId);
    const adaptedPrompts = [];

    for (const prompt of prompts) {
      const adaptedPrompt = await this.adaptPrompt(prompt, profile);
      adaptedPrompts.push(adaptedPrompt);
    }

    return adaptedPrompts;
  }

  // Adapt individual prompt
  async adaptPrompt(prompt, profile) {
    const adapted = { ...prompt };

    // Adapt based on learning style
    if (profile.learningStyle.type === 'visual') {
      adapted.text = this.addVisualElements(adapted.text);
    } else if (profile.learningStyle.type === 'auditory') {
      adapted.text = this.addAuditoryElements(adapted.text);
    } else if (profile.learningStyle.type === 'kinesthetic') {
      adapted.text = this.addKinestheticElements(adapted.text);
    }

    // Adapt based on communication pattern
    if (profile.communicationPattern.style === 'assertive') {
      adapted.text = this.addAssertiveElements(adapted.text);
    } else if (profile.communicationPattern.style === 'passive') {
      adapted.text = this.addPassiveElements(adapted.text);
    }

    // Adapt based on preferences
    if (profile.preferences.difficulty === 'easy') {
      adapted.text = this.simplifyText(adapted.text);
    } else if (profile.preferences.difficulty === 'hard') {
      adapted.text = this.complexifyText(adapted.text);
    }

    return adapted;
  }

  // Add visual elements
  addVisualElements(text) {
    return text.replace(/(imagine|picture|see)/gi, 'visualize and see');
  }

  // Add auditory elements
  addAuditoryElements(text) {
    return text.replace(/(think|consider)/gi, 'listen to your thoughts and consider');
  }

  // Add kinesthetic elements
  addKinestheticElements(text) {
    return text.replace(/(feel|sense)/gi, 'physically feel and sense');
  }

  // Add assertive elements
  addAssertiveElements(text) {
    return text.replace(/(maybe|perhaps|might)/gi, 'will');
  }

  // Add passive elements
  addPassiveElements(text) {
    return text.replace(/(will|must)/gi, 'might');
  }

  // Simplify text
  simplifyText(text) {
    return text.replace(/(complex|sophisticated|intricate)/gi, 'simple');
  }

  // Complexify text
  complexifyText(text) {
    return text.replace(/(simple|basic|easy)/gi, 'sophisticated');
  }

  // Adapt AI Coach responses
  async adaptAICoachResponse(userId, response) {
    const profile = await this.personalizationManager.getUserProfile(userId);
    
    // Adapt tone
    if (profile.communicationPattern.style === 'assertive') {
      response = this.makeResponseAssertive(response);
    } else if (profile.communicationPattern.style === 'passive') {
      response = this.makeResponseGentle(response);
    }

    // Adapt length
    if (profile.preferences.preferredSessionLength < 10) {
      response = this.shortenResponse(response);
    } else if (profile.preferences.preferredSessionLength > 20) {
      response = this.lengthenResponse(response);
    }

    return response;
  }

  // Make response assertive
  makeResponseAssertive(response) {
    return response.replace(/(I suggest|I recommend|you might)/gi, 'I recommend');
  }

  // Make response gentle
  makeResponseGentle(response) {
    return response.replace(/(I recommend|you should)/gi, 'you might consider');
  }

  // Shorten response
  shortenResponse(response) {
    const sentences = response.split('.');
    return sentences.slice(0, 2).join('.') + '.';
  }

  // Lengthen response
  lengthenResponse(response) {
    return response + ' This additional context will help you better understand the situation.';
  }
}

export const adaptiveContentSystem = new AdaptiveContentSystem();

// 3. SMART RECOMMENDATION ENGINE
export class SmartRecommendationEngine {
  constructor() {
    this.personalizationManager = personalizationManager;
    this.analyticsManager = analyticsManager;
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(userId, type = 'all') {
    const profile = await this.personalizationManager.getUserProfile(userId);
    const analytics = await this.analyticsManager.getComprehensiveAnalytics(userId);
    
    const recommendations = [];

    if (type === 'all' || type === 'sessions') {
      recommendations.push(...await this.getSessionRecommendations(profile, analytics));
    }

    if (type === 'all' || type === 'content') {
      recommendations.push(...await this.getContentRecommendations(profile, analytics));
    }

    if (type === 'all' || type === 'features') {
      recommendations.push(...await this.getFeatureRecommendations(profile, analytics));
    }

    if (type === 'all' || type === 'goals') {
      recommendations.push(...await this.getGoalRecommendations(profile, analytics));
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  // Get session recommendations
  async getSessionRecommendations(profile, analytics) {
    const recommendations = [];

    // Based on completion rate
    if (analytics.summary.completionRate < 70) {
      recommendations.push({
        type: 'session',
        title: 'Shorter Sessions',
        description: 'Try shorter sessions to improve completion rate',
        priority: 8,
        action: 'reduce_session_length',
      });
    }

    // Based on AI Coach usage
    if (analytics.summary.aiCoachUsage < 3) {
      recommendations.push({
        type: 'session',
        title: 'Try AI Coach',
        description: 'Use the AI Coach for personalized guidance',
        priority: 6,
        action: 'use_ai_coach',
      });
    }

    // Based on relationship diversity
    if (analytics.summary.relationshipTypes < 3) {
      recommendations.push({
        type: 'session',
        title: 'Explore Relationships',
        description: 'Try sessions with different relationship types',
        priority: 5,
        action: 'diversify_relationships',
      });
    }

    return recommendations;
  }

  // Get content recommendations
  async getContentRecommendations(profile, analytics) {
    const recommendations = [];

    // Based on learning style
    if (profile.learningStyle.type === 'visual') {
      recommendations.push({
        type: 'content',
        title: 'Visual Prompts',
        description: 'Try prompts with visual elements',
        priority: 7,
        action: 'visual_prompts',
      });
    }

    // Based on communication pattern
    if (profile.communicationPattern.style === 'passive') {
      recommendations.push({
        type: 'content',
        title: 'Assertiveness Practice',
        description: 'Practice being more direct in conversations',
        priority: 8,
        action: 'assertiveness_practice',
      });
    }

    // Based on topics
    if (analytics.summary.topics < 5) {
      recommendations.push({
        type: 'content',
        title: 'Topic Diversity',
        description: 'Explore different conversation topics',
        priority: 4,
        action: 'diversify_topics',
      });
    }

    return recommendations;
  }

  // Get feature recommendations
  async getFeatureRecommendations(profile, analytics) {
    const recommendations = [];

    // Based on usage patterns
    if (analytics.summary.journalEntries < 10) {
      recommendations.push({
        type: 'feature',
        title: 'Journal More',
        description: 'Write more journal entries for deeper insights',
        priority: 6,
        action: 'increase_journaling',
      });
    }

    // Based on preferences
    if (!profile.preferences.aiCoach) {
      recommendations.push({
        type: 'feature',
        title: 'Enable AI Coach',
        description: 'Turn on AI Coach for personalized advice',
        priority: 7,
        action: 'enable_ai_coach',
      });
    }

    return recommendations;
  }

  // Get goal recommendations
  async getGoalRecommendations(profile, analytics) {
    const recommendations = [];

    // Based on current performance
    if (analytics.summary.totalSessions < 5) {
      recommendations.push({
        type: 'goal',
        title: 'Complete 10 Sessions',
        description: 'Complete 10 sessions to build a habit',
        priority: 9,
        action: 'complete_10_sessions',
      });
    }

    // Based on streaks
    if (analytics.summary.lastActivity !== 'Never') {
      const daysSinceLastActivity = this.getDaysSinceLastActivity(analytics.summary.lastActivity);
      if (daysSinceLastActivity > 3) {
        recommendations.push({
          type: 'goal',
          title: 'Restart Your Streak',
          description: 'Complete a session today to restart your streak',
          priority: 8,
          action: 'restart_streak',
        });
      }
    }

    return recommendations;
  }

  // Get days since last activity
  getDaysSinceLastActivity(lastActivity) {
    const lastDate = new Date(lastActivity);
    const now = new Date();
    const diffTime = Math.abs(now - lastDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const smartRecommendationEngine = new SmartRecommendationEngine();

// 4. ADAPTIVE UI SYSTEM
export class AdaptiveUISystem {
  constructor() {
    this.personalizationManager = personalizationManager;
  }

  // Get personalized UI configuration
  async getPersonalizedUIConfig(userId) {
    const profile = await this.personalizationManager.getUserProfile(userId);
    const preferences = profile.preferences;

    return {
      theme: preferences.theme,
      layout: this.getLayoutPreference(profile),
      colors: this.getColorPreference(profile),
      typography: this.getTypographyPreference(profile),
      spacing: this.getSpacingPreference(profile),
      animations: this.getAnimationPreference(profile),
      accessibility: this.getAccessibilityPreference(profile),
    };
  }

  // Get layout preference
  getLayoutPreference(profile) {
    if (profile.learningStyle.type === 'visual') {
      return 'grid';
    } else if (profile.learningStyle.type === 'reading') {
      return 'list';
    }
    return 'card';
  }

  // Get color preference
  getColorPreference(profile) {
    if (profile.communicationPattern.style === 'assertive') {
      return 'bold';
    } else if (profile.communicationPattern.style === 'passive') {
      return 'soft';
    }
    return 'balanced';
  }

  // Get typography preference
  getTypographyPreference(profile) {
    if (profile.preferences.difficulty === 'easy') {
      return 'large';
    } else if (profile.preferences.difficulty === 'hard') {
      return 'small';
    }
    return 'medium';
  }

  // Get spacing preference
  getSpacingPreference(profile) {
    if (profile.learningStyle.type === 'kinesthetic') {
      return 'wide';
    }
    return 'normal';
  }

  // Get animation preference
  getAnimationPreference(profile) {
    if (profile.preferences.preferredSessionLength < 10) {
      return 'fast';
    } else if (profile.preferences.preferredSessionLength > 20) {
      return 'slow';
    }
    return 'normal';
  }

  // Get accessibility preference
  getAccessibilityPreference(profile) {
    return {
      highContrast: profile.preferences.difficulty === 'easy',
      largeText: profile.preferences.difficulty === 'easy',
      reducedMotion: profile.learningStyle.type === 'reading',
      screenReader: false, // Would be based on actual accessibility needs
    };
  }
}

export const adaptiveUISystem = new AdaptiveUISystem();

// 5. LEARNING PATH SYSTEM
export class LearningPathSystem {
  constructor() {
    this.personalizationManager = personalizationManager;
    this.analyticsManager = analyticsManager;
  }

  // Get personalized learning path
  async getPersonalizedLearningPath(userId) {
    const profile = await this.personalizationManager.getUserProfile(userId);
    const analytics = await this.analyticsManager.getComprehensiveAnalytics(userId);
    
    const path = {
      currentLevel: this.calculateCurrentLevel(analytics),
      nextMilestones: this.getNextMilestones(analytics),
      recommendedSessions: this.getRecommendedSessions(profile, analytics),
      skillGaps: this.identifySkillGaps(profile, analytics),
      learningGoals: this.generateLearningGoals(profile, analytics),
    };

    return path;
  }

  // Calculate current level
  calculateCurrentLevel(analytics) {
    const sessions = analytics.summary.totalSessions;
    const completionRate = analytics.summary.completionRate;
    const aiUsage = analytics.summary.aiCoachUsage;
    
    let level = 1;
    
    if (sessions >= 50 && completionRate >= 80 && aiUsage >= 20) {
      level = 5; // Expert
    } else if (sessions >= 25 && completionRate >= 70 && aiUsage >= 10) {
      level = 4; // Advanced
    } else if (sessions >= 10 && completionRate >= 60) {
      level = 3; // Intermediate
    } else if (sessions >= 5) {
      level = 2; // Beginner
    }
    
    return level;
  }

  // Get next milestones
  getNextMilestones(analytics) {
    const milestones = [];
    
    if (analytics.summary.totalSessions < 10) {
      milestones.push({
        title: 'Complete 10 Sessions',
        description: 'Build a consistent practice habit',
        target: 10,
        current: analytics.summary.totalSessions,
        priority: 'high',
      });
    }
    
    if (analytics.summary.completionRate < 80) {
      milestones.push({
        title: 'Improve Completion Rate',
        description: 'Complete 80% of your sessions',
        target: 80,
        current: analytics.summary.completionRate,
        priority: 'medium',
      });
    }
    
    if (analytics.summary.aiCoachUsage < 15) {
      milestones.push({
        title: 'Use AI Coach More',
        description: 'Get personalized guidance 15 times',
        target: 15,
        current: analytics.summary.aiCoachUsage,
        priority: 'low',
      });
    }
    
    return milestones;
  }

  // Get recommended sessions
  getRecommendedSessions(profile, analytics) {
    const recommendations = [];
    
    // Based on relationship types
    const usedTypes = Object.keys(analytics.summary.relationshipTypes || {});
    const allTypes = ['friend', 'family', 'romantic', 'colleague', 'acquaintance'];
    const unusedTypes = allTypes.filter(type => !usedTypes.includes(type));
    
    if (unusedTypes.length > 0) {
      recommendations.push({
        type: 'relationship',
        title: `Try ${unusedTypes[0]} Conversation`,
        description: `Practice with a ${unusedTypes[0]} relationship`,
        priority: 'medium',
      });
    }
    
    // Based on learning style
    if (profile.learningStyle.type === 'visual') {
      recommendations.push({
        type: 'style',
        title: 'Visual Reflection Session',
        description: 'Use visual prompts and imagery',
        priority: 'high',
      });
    }
    
    return recommendations;
  }

  // Identify skill gaps
  identifySkillGaps(profile, analytics) {
    const gaps = [];
    
    if (analytics.summary.completionRate < 60) {
      gaps.push({
        skill: 'Consistency',
        description: 'Improve session completion rate',
        priority: 'high',
      });
    }
    
    if (analytics.summary.journalEntries < 20) {
      gaps.push({
        skill: 'Reflection',
        description: 'Write more journal entries',
        priority: 'medium',
      });
    }
    
    if (analytics.summary.relationshipTypes < 3) {
      gaps.push({
        skill: 'Diversity',
        description: 'Practice with different relationship types',
        priority: 'low',
      });
    }
    
    return gaps;
  }

  // Generate learning goals
  generateLearningGoals(profile, analytics) {
    const goals = [];
    
    // Short-term goals (1 week)
    goals.push({
      timeframe: 'short',
      title: 'Complete 3 Sessions This Week',
      description: 'Build consistency with regular practice',
      target: 3,
      current: 0, // Would be calculated based on current week
    });
    
    // Medium-term goals (1 month)
    goals.push({
      timeframe: 'medium',
      title: 'Improve Completion Rate to 80%',
      description: 'Focus on finishing what you start',
      target: 80,
      current: analytics.summary.completionRate,
    });
    
    // Long-term goals (3 months)
    goals.push({
      timeframe: 'long',
      title: 'Master 5 Relationship Types',
      description: 'Become comfortable with diverse conversations',
      target: 5,
      current: analytics.summary.relationshipTypes,
    });
    
    return goals;
  }
}

export const learningPathSystem = new LearningPathSystem();

export default {
  personalizationManager,
  adaptiveContentSystem,
  smartRecommendationEngine,
  adaptiveUISystem,
  learningPathSystem,
};
