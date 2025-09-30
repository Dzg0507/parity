// GAMIFICATION SYSTEM
// This is going to make the app ADDICTIVE! 🎮

import { storage } from './storage';

// 1. ACHIEVEMENT SYSTEM
export class AchievementSystem {
  constructor() {
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.initializeAchievements();
  }

  initializeAchievements() {
    // Communication Achievements
    this.achievements.set('first_session', {
      id: 'first_session',
      title: 'First Steps',
      description: 'Complete your first Solo Prep session',
      icon: '🎯',
      points: 10,
      rarity: 'common',
      unlocked: false
    });

    this.achievements.set('conversation_master', {
      id: 'conversation_master',
      title: 'Conversation Master',
      description: 'Complete 10 Solo Prep sessions',
      icon: '💬',
      points: 50,
      rarity: 'rare',
      unlocked: false
    });

    this.achievements.set('relationship_expert', {
      id: 'relationship_expert',
      title: 'Relationship Expert',
      description: 'Work on conversations with 5 different relationship types',
      icon: '❤️',
      points: 75,
      rarity: 'epic',
      unlocked: false
    });

    this.achievements.set('ai_coach_fan', {
      id: 'ai_coach_fan',
      title: 'AI Coach Fan',
      description: 'Use the AI Coach 20 times',
      icon: '🤖',
      points: 30,
      rarity: 'uncommon',
      unlocked: false
    });

    this.achievements.set('reflection_king', {
      id: 'reflection_king',
      title: 'Reflection King',
      description: 'Write 100 journal entries',
      icon: '📝',
      points: 100,
      rarity: 'legendary',
      unlocked: false
    });

    this.achievements.set('streak_master', {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Complete sessions for 7 days in a row',
      icon: '🔥',
      points: 150,
      rarity: 'legendary',
      unlocked: false
    });

    this.achievements.set('early_bird', {
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Complete a session before 8 AM',
      icon: '🌅',
      points: 25,
      rarity: 'uncommon',
      unlocked: false
    });

    this.achievements.set('night_owl', {
      id: 'night_owl',
      title: 'Night Owl',
      description: 'Complete a session after 10 PM',
      icon: '🦉',
      points: 25,
      rarity: 'uncommon',
      unlocked: false
    });

    this.achievements.set('perfectionist', {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Complete all prompts in a session',
      icon: '⭐',
      points: 40,
      rarity: 'rare',
      unlocked: false
    });

    this.achievements.set('collaborator', {
      id: 'collaborator',
      title: 'Collaborator',
      description: 'Start your first Joint Unpack session',
      icon: '🤝',
      points: 60,
      rarity: 'epic',
      unlocked: false
    });
  }

  async checkAchievements(userId, stats) {
    const unlockedAchievements = [];

    // Check each achievement
    for (const [achievementId, achievement] of this.achievements) {
      if (achievement.unlocked) continue;

      let shouldUnlock = false;

      switch (achievementId) {
        case 'first_session':
          shouldUnlock = stats.totalSessions >= 1;
          break;
        case 'conversation_master':
          shouldUnlock = stats.totalSessions >= 10;
          break;
        case 'relationship_expert':
          shouldUnlock = stats.uniqueRelationshipTypes >= 5;
          break;
        case 'ai_coach_fan':
          shouldUnlock = stats.aiCoachUsage >= 20;
          break;
        case 'reflection_king':
          shouldUnlock = stats.totalJournalEntries >= 100;
          break;
        case 'streak_master':
          shouldUnlock = stats.currentStreak >= 7;
          break;
        case 'early_bird':
          shouldUnlock = stats.earlyMorningSessions >= 1;
          break;
        case 'night_owl':
          shouldUnlock = stats.lateNightSessions >= 1;
          break;
        case 'perfectionist':
          shouldUnlock = stats.perfectSessions >= 1;
          break;
        case 'collaborator':
          shouldUnlock = stats.jointSessions >= 1;
          break;
      }

      if (shouldUnlock) {
        achievement.unlocked = true;
        unlockedAchievements.push(achievement);
        await this.saveAchievement(userId, achievement);
      }
    }

    return unlockedAchievements;
  }

  async saveAchievement(userId, achievement) {
    const userAchievements = await this.getUserAchievements(userId);
    userAchievements.push({
      ...achievement,
      unlockedAt: Date.now()
    });
    
    await storage.setItem(`achievements_${userId}`, JSON.stringify(userAchievements));
  }

  async getUserAchievements(userId) {
    const stored = await storage.getItem(`achievements_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  getAchievementById(id) {
    return this.achievements.get(id);
  }

  getAllAchievements() {
    return Array.from(this.achievements.values());
  }
}

export const achievementSystem = new AchievementSystem();

// 2. POINTS AND LEVELING SYSTEM
export class PointsSystem {
  constructor() {
    this.userPoints = new Map();
    this.levelThresholds = [
      { level: 1, points: 0 },
      { level: 2, points: 100 },
      { level: 3, points: 250 },
      { level: 4, points: 450 },
      { level: 5, points: 700 },
      { level: 6, points: 1000 },
      { level: 7, points: 1350 },
      { level: 8, points: 1750 },
      { level: 9, points: 2200 },
      { level: 10, points: 2700 },
    ];
  }

  async addPoints(userId, points, reason) {
    const currentPoints = await this.getUserPoints(userId);
    const newPoints = currentPoints + points;
    
    await storage.setItem(`points_${userId}`, newPoints.toString());
    
    // Log the points transaction
    await this.logPointsTransaction(userId, points, reason);
    
    return newPoints;
  }

  async getUserPoints(userId) {
    const stored = await storage.getItem(`points_${userId}`);
    return stored ? parseInt(stored) : 0;
  }

  async getUserLevel(userId) {
    const points = await this.getUserPoints(userId);
    let level = 1;
    
    for (const threshold of this.levelThresholds) {
      if (points >= threshold.points) {
        level = threshold.level;
      } else {
        break;
      }
    }
    
    return level;
  }

  async getProgressToNextLevel(userId) {
    const points = await this.getUserPoints(userId);
    const level = await this.getUserLevel(userId);
    
    const currentThreshold = this.levelThresholds.find(t => t.level === level);
    const nextThreshold = this.levelThresholds.find(t => t.level === level + 1);
    
    if (!nextThreshold) {
      return { progress: 1, pointsNeeded: 0, isMaxLevel: true };
    }
    
    const progress = (points - currentThreshold.points) / (nextThreshold.points - currentThreshold.points);
    const pointsNeeded = nextThreshold.points - points;
    
    return { progress, pointsNeeded, isMaxLevel: false };
  }

  async logPointsTransaction(userId, points, reason) {
    const transactions = await this.getPointsTransactions(userId);
    transactions.push({
      points,
      reason,
      timestamp: Date.now()
    });
    
    await storage.setItem(`points_transactions_${userId}`, JSON.stringify(transactions));
  }

  async getPointsTransactions(userId) {
    const stored = await storage.getItem(`points_transactions_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }
}

export const pointsSystem = new PointsSystem();

// 3. STREAK SYSTEM
export class StreakSystem {
  constructor() {
    this.streakData = new Map();
  }

  async updateStreak(userId, action) {
    const today = new Date().toDateString();
    const userStreak = await this.getUserStreak(userId);
    
    if (action === 'complete_session') {
      if (userStreak.lastActivityDate === today) {
        // Already completed today, no change
        return userStreak;
      }
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      if (userStreak.lastActivityDate === yesterdayString) {
        // Consecutive day
        userStreak.currentStreak += 1;
      } else if (userStreak.lastActivityDate !== today) {
        // New streak started
        userStreak.currentStreak = 1;
      }
      
      userStreak.lastActivityDate = today;
      userStreak.totalSessions += 1;
      
      if (userStreak.currentStreak > userStreak.longestStreak) {
        userStreak.longestStreak = userStreak.currentStreak;
      }
    }
    
    await this.saveUserStreak(userId, userStreak);
    return userStreak;
  }

  async getUserStreak(userId) {
    const stored = await storage.getItem(`streak_${userId}`);
    return stored ? JSON.parse(stored) : {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      totalSessions: 0
    };
  }

  async saveUserStreak(userId, streakData) {
    await storage.setItem(`streak_${userId}`, JSON.stringify(streakData));
  }

  async getStreakRewards(userId) {
    const streak = await this.getUserStreak(userId);
    const rewards = [];
    
    // Streak milestone rewards
    if (streak.currentStreak === 3) {
      rewards.push({ type: 'points', amount: 25, message: '3-day streak!' });
    } else if (streak.currentStreak === 7) {
      rewards.push({ type: 'points', amount: 75, message: 'Week streak!' });
    } else if (streak.currentStreak === 30) {
      rewards.push({ type: 'points', amount: 300, message: 'Month streak!' });
    }
    
    return rewards;
  }
}

export const streakSystem = new StreakSystem();

// 4. BADGE SYSTEM
export class BadgeSystem {
  constructor() {
    this.badges = new Map();
    this.initializeBadges();
  }

  initializeBadges() {
    this.badges.set('communication_novice', {
      id: 'communication_novice',
      title: 'Communication Novice',
      description: 'Complete your first 5 sessions',
      icon: '🌱',
      color: '#10b981',
      requirements: { sessions: 5 }
    });

    this.badges.set('communication_expert', {
      id: 'communication_expert',
      title: 'Communication Expert',
      description: 'Complete 25 sessions',
      icon: '🎓',
      color: '#3b82f6',
      requirements: { sessions: 25 }
    });

    this.badges.set('communication_master', {
      id: 'communication_master',
      title: 'Communication Master',
      description: 'Complete 50 sessions',
      icon: '👑',
      color: '#8b5cf6',
      requirements: { sessions: 50 }
    });

    this.badges.set('ai_enthusiast', {
      id: 'ai_enthusiast',
      title: 'AI Enthusiast',
      description: 'Use AI features 50 times',
      icon: '🤖',
      color: '#f59e0b',
      requirements: { aiUsage: 50 }
    });

    this.badges.set('reflection_champion', {
      id: 'reflection_champion',
      title: 'Reflection Champion',
      description: 'Write 200 journal entries',
      icon: '📚',
      color: '#ef4444',
      requirements: { journalEntries: 200 }
    });
  }

  async checkBadges(userId, stats) {
    const userBadges = await this.getUserBadges(userId);
    const unlockedBadges = [];

    for (const [badgeId, badge] of this.badges) {
      if (userBadges.some(b => b.id === badgeId)) continue;

      let shouldUnlock = true;
      for (const [requirement, value] of Object.entries(badge.requirements)) {
        if (stats[requirement] < value) {
          shouldUnlock = false;
          break;
        }
      }

      if (shouldUnlock) {
        unlockedBadges.push(badge);
        await this.saveBadge(userId, badge);
      }
    }

    return unlockedBadges;
  }

  async saveBadge(userId, badge) {
    const userBadges = await this.getUserBadges(userId);
    userBadges.push({
      ...badge,
      unlockedAt: Date.now()
    });
    
    await storage.setItem(`badges_${userId}`, JSON.stringify(userBadges));
  }

  async getUserBadges(userId) {
    const stored = await storage.getItem(`badges_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }
}

export const badgeSystem = new BadgeSystem();

// 5. DAILY CHALLENGES
export class DailyChallengeSystem {
  constructor() {
    this.challenges = new Map();
    this.initializeChallenges();
  }

  initializeChallenges() {
    this.challenges.set('complete_session', {
      id: 'complete_session',
      title: 'Daily Reflection',
      description: 'Complete one Solo Prep session today',
      icon: '📝',
      points: 20,
      type: 'session'
    });

    this.challenges.set('use_ai_coach', {
      id: 'use_ai_coach',
      title: 'AI Guidance',
      description: 'Get advice from the AI Coach today',
      icon: '🤖',
      points: 15,
      type: 'ai_usage'
    });

    this.challenges.set('write_entries', {
      id: 'write_entries',
      title: 'Deep Thinking',
      description: 'Write 5 journal entries today',
      icon: '✍️',
      points: 25,
      type: 'journal_entries'
    });

    this.challenges.set('morning_session', {
      id: 'morning_session',
      title: 'Early Bird',
      description: 'Complete a session before 10 AM',
      icon: '🌅',
      points: 30,
      type: 'morning'
    });
  }

  async getDailyChallenges(userId) {
    const today = new Date().toDateString();
    const stored = await storage.getItem(`daily_challenges_${userId}_${today}`);
    
    if (stored) {
      return JSON.parse(stored);
    }

    // Generate new challenges for today
    const challenges = Array.from(this.challenges.values()).map(challenge => ({
      ...challenge,
      completed: false,
      progress: 0,
      maxProgress: this.getMaxProgress(challenge.type)
    }));

    await storage.setItem(`daily_challenges_${userId}_${today}`, JSON.stringify(challenges));
    return challenges;
  }

  getMaxProgress(type) {
    switch (type) {
      case 'session': return 1;
      case 'ai_usage': return 1;
      case 'journal_entries': return 5;
      case 'morning': return 1;
      default: return 1;
    }
  }

  async updateChallengeProgress(userId, challengeId, progress) {
    const today = new Date().toDateString();
    const challenges = await this.getDailyChallenges(userId);
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (challenge) {
      challenge.progress = Math.min(progress, challenge.maxProgress);
      challenge.completed = challenge.progress >= challenge.maxProgress;
      
      await storage.setItem(`daily_challenges_${userId}_${today}`, JSON.stringify(challenges));
      
      if (challenge.completed) {
        await pointsSystem.addPoints(userId, challenge.points, `Daily challenge: ${challenge.title}`);
      }
    }
  }
}

export const dailyChallengeSystem = new DailyChallengeSystem();

// 6. GAMIFICATION MANAGER
export class GamificationManager {
  constructor() {
    this.achievementSystem = achievementSystem;
    this.pointsSystem = pointsSystem;
    this.streakSystem = streakSystem;
    this.badgeSystem = badgeSystem;
    this.dailyChallengeSystem = dailyChallengeSystem;
  }

  async processUserAction(userId, action, data = {}) {
    const results = {
      pointsEarned: 0,
      achievements: [],
      badges: [],
      challenges: [],
      levelUp: false
    };

    // Update streak
    await this.streakSystem.updateStreak(userId, action);

    // Add points based on action
    const points = this.getPointsForAction(action, data);
    if (points > 0) {
      const newPoints = await this.pointsSystem.addPoints(userId, points, action);
      results.pointsEarned = points;
    }

    // Check for level up
    const oldLevel = await this.pointsSystem.getUserLevel(userId);
    const newLevel = await this.pointsSystem.getUserLevel(userId);
    if (newLevel > oldLevel) {
      results.levelUp = true;
    }

    // Get current stats
    const stats = await this.getUserStats(userId);

    // Check achievements
    const achievements = await this.achievementSystem.checkAchievements(userId, stats);
    results.achievements = achievements;

    // Check badges
    const badges = await this.badgeSystem.checkBadges(userId, stats);
    results.badges = badges;

    // Update daily challenges
    const challenges = await this.dailyChallengeSystem.getDailyChallenges(userId);
    for (const challenge of challenges) {
      if (!challenge.completed) {
        const progress = this.getChallengeProgress(action, challenge.type, data);
        if (progress > 0) {
          await this.dailyChallengeSystem.updateChallengeProgress(userId, challenge.id, progress);
        }
      }
    }

    return results;
  }

  getPointsForAction(action, data) {
    const pointValues = {
      'complete_session': 10,
      'use_ai_coach': 5,
      'write_journal_entry': 2,
      'start_joint_session': 15,
      'complete_joint_session': 25,
      'share_content': 3,
      'first_session': 20,
      'perfect_session': 15,
    };

    return pointValues[action] || 0;
  }

  getChallengeProgress(action, challengeType, data) {
    switch (challengeType) {
      case 'session':
        return action === 'complete_session' ? 1 : 0;
      case 'ai_usage':
        return action === 'use_ai_coach' ? 1 : 0;
      case 'journal_entries':
        return action === 'write_journal_entry' ? 1 : 0;
      case 'morning':
        return action === 'complete_session' && new Date().getHours() < 10 ? 1 : 0;
      default:
        return 0;
    }
  }

  async getUserStats(userId) {
    // This would typically come from your main stats system
    return {
      totalSessions: 0,
      uniqueRelationshipTypes: 0,
      aiCoachUsage: 0,
      totalJournalEntries: 0,
      currentStreak: 0,
      earlyMorningSessions: 0,
      lateNightSessions: 0,
      perfectSessions: 0,
      jointSessions: 0,
    };
  }

  async getUserProfile(userId) {
    const points = await this.pointsSystem.getUserPoints(userId);
    const level = await this.pointsSystem.getUserLevel(userId);
    const progress = await this.pointsSystem.getProgressToNextLevel(userId);
    const streak = await this.streakSystem.getUserStreak(userId);
    const achievements = await this.achievementSystem.getUserAchievements(userId);
    const badges = await this.badgeSystem.getUserBadges(userId);
    const challenges = await this.dailyChallengeSystem.getDailyChallenges(userId);

    return {
      points,
      level,
      progress,
      streak,
      achievements,
      badges,
      challenges,
    };
  }
}

export const gamificationManager = new GamificationManager();

export default {
  achievementSystem,
  pointsSystem,
  streakSystem,
  badgeSystem,
  dailyChallengeSystem,
  gamificationManager,
};
