// NOTIFICATION SYSTEM
// This is going to make users ENGAGED! 🔔

import { storage } from './storage';
import { gamificationManager } from './gamification';

// 1. NOTIFICATION TYPES
export const NOTIFICATION_TYPES = {
  ACHIEVEMENT: 'achievement',
  LEVEL_UP: 'level_up',
  BADGE: 'badge',
  STREAK: 'streak',
  DAILY_CHALLENGE: 'daily_challenge',
  REMINDER: 'reminder',
  TIP: 'tip',
  CELEBRATION: 'celebration',
  WELCOME: 'welcome',
  MOTIVATION: 'motivation',
};

// 2. NOTIFICATION PRIORITIES
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// 3. NOTIFICATION MANAGER
export class NotificationManager {
  constructor() {
    this.notifications = new Map();
    this.settings = {
      enabled: true,
      sound: true,
      vibration: true,
      achievements: true,
      reminders: true,
      tips: true,
      celebrations: true,
    };
  }

  // Create a notification
  createNotification(type, title, message, data = {}) {
    const notification = {
      id: this.generateId(),
      type,
      title,
      message,
      data,
      timestamp: Date.now(),
      read: false,
      priority: this.getPriorityForType(type),
      icon: this.getIconForType(type),
      color: this.getColorForType(type),
    };

    this.notifications.set(notification.id, notification);
    return notification;
  }

  // Get priority based on notification type
  getPriorityForType(type) {
    const priorityMap = {
      [NOTIFICATION_TYPES.ACHIEVEMENT]: NOTIFICATION_PRIORITIES.HIGH,
      [NOTIFICATION_TYPES.LEVEL_UP]: NOTIFICATION_PRIORITIES.HIGH,
      [NOTIFICATION_TYPES.BADGE]: NOTIFICATION_PRIORITIES.MEDIUM,
      [NOTIFICATION_TYPES.STREAK]: NOTIFICATION_PRIORITIES.MEDIUM,
      [NOTIFICATION_TYPES.DAILY_CHALLENGE]: NOTIFICATION_PRIORITIES.LOW,
      [NOTIFICATION_TYPES.REMINDER]: NOTIFICATION_PRIORITIES.MEDIUM,
      [NOTIFICATION_TYPES.TIP]: NOTIFICATION_PRIORITIES.LOW,
      [NOTIFICATION_TYPES.CELEBRATION]: NOTIFICATION_PRIORITIES.HIGH,
      [NOTIFICATION_TYPES.WELCOME]: NOTIFICATION_PRIORITIES.MEDIUM,
      [NOTIFICATION_TYPES.MOTIVATION]: NOTIFICATION_PRIORITIES.LOW,
    };

    return priorityMap[type] || NOTIFICATION_PRIORITIES.LOW;
  }

  // Get icon based on notification type
  getIconForType(type) {
    const iconMap = {
      [NOTIFICATION_TYPES.ACHIEVEMENT]: '🏆',
      [NOTIFICATION_TYPES.LEVEL_UP]: '⬆️',
      [NOTIFICATION_TYPES.BADGE]: '🎖️',
      [NOTIFICATION_TYPES.STREAK]: '🔥',
      [NOTIFICATION_TYPES.DAILY_CHALLENGE]: '📅',
      [NOTIFICATION_TYPES.REMINDER]: '⏰',
      [NOTIFICATION_TYPES.TIP]: '💡',
      [NOTIFICATION_TYPES.CELEBRATION]: '🎉',
      [NOTIFICATION_TYPES.WELCOME]: '👋',
      [NOTIFICATION_TYPES.MOTIVATION]: '💪',
    };

    return iconMap[type] || '📱';
  }

  // Get color based on notification type
  getColorForType(type) {
    const colorMap = {
      [NOTIFICATION_TYPES.ACHIEVEMENT]: '#f59e0b',
      [NOTIFICATION_TYPES.LEVEL_UP]: '#8b5cf6',
      [NOTIFICATION_TYPES.BADGE]: '#3b82f6',
      [NOTIFICATION_TYPES.STREAK]: '#ef4444',
      [NOTIFICATION_TYPES.DAILY_CHALLENGE]: '#10b981',
      [NOTIFICATION_TYPES.REMINDER]: '#6b7280',
      [NOTIFICATION_TYPES.TIP]: '#06b6d4',
      [NOTIFICATION_TYPES.CELEBRATION]: '#ec4899',
      [NOTIFICATION_TYPES.WELCOME]: '#84cc16',
      [NOTIFICATION_TYPES.MOTIVATION]: '#f97316',
    };

    return colorMap[type] || '#6b7280';
  }

  // Generate unique ID
  generateId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Show notification
  async showNotification(notification) {
    if (!this.settings.enabled) return;

    // Store notification
    await this.storeNotification(notification);

    // Trigger notification display
    this.triggerNotification(notification);

    return notification;
  }

  // Store notification in storage
  async storeNotification(notification) {
    const userId = await this.getCurrentUserId();
    const userNotifications = await this.getUserNotifications(userId);
    
    userNotifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }
    
    await storage.setItem(`notifications_${userId}`, JSON.stringify(userNotifications));
  }

  // Get current user ID (placeholder)
  async getCurrentUserId() {
    const user = await storage.getItem('currentUser');
    return user ? JSON.parse(user).id : 'anonymous';
  }

  // Get user notifications
  async getUserNotifications(userId) {
    const stored = await storage.getItem(`notifications_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  // Trigger notification display
  triggerNotification(notification) {
    // This would integrate with your notification display system
    console.log('🔔 Notification:', notification);
    
    // In a real app, this would:
    // 1. Show a toast/alert
    // 2. Play sound if enabled
    // 3. Vibrate if enabled
    // 4. Update notification badge
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    const userId = await this.getCurrentUserId();
    const notifications = await this.getUserNotifications(userId);
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      await storage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    const userId = await this.getCurrentUserId();
    const notifications = await this.getUserNotifications(userId);
    
    notifications.forEach(notification => {
      notification.read = true;
    });
    
    await storage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  }

  // Get unread count
  async getUnreadCount() {
    const userId = await this.getCurrentUserId();
    const notifications = await this.getUserNotifications(userId);
    return notifications.filter(n => !n.read).length;
  }

  // Clear all notifications
  async clearAllNotifications() {
    const userId = await this.getCurrentUserId();
    await storage.removeItem(`notifications_${userId}`);
  }

  // Update settings
  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await storage.setItem('notification_settings', JSON.stringify(this.settings));
  }

  // Get settings
  async getSettings() {
    const stored = await storage.getItem('notification_settings');
    return stored ? JSON.parse(stored) : this.settings;
  }
}

export const notificationManager = new NotificationManager();

// 4. SMART NOTIFICATION GENERATOR
export class SmartNotificationGenerator {
  constructor() {
    this.notificationManager = notificationManager;
    this.gamificationManager = gamificationManager;
  }

  // Generate achievement notification
  async generateAchievementNotification(achievement) {
    const messages = [
      `🏆 Achievement Unlocked: ${achievement.title}!`,
      `🎉 You earned the "${achievement.title}" achievement!`,
      `⭐ Congratulations! You unlocked "${achievement.title}"!`,
      `🎯 Achievement: ${achievement.title} - ${achievement.description}`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.notificationManager.createNotification(
      NOTIFICATION_TYPES.ACHIEVEMENT,
      'Achievement Unlocked!',
      randomMessage,
      { achievement }
    );
  }

  // Generate level up notification
  async generateLevelUpNotification(level, points) {
    const messages = [
      `⬆️ Level Up! You're now level ${level}!`,
      `🎊 Congratulations! You reached level ${level}!`,
      `🚀 Amazing! You leveled up to level ${level}!`,
      `💫 Level ${level} achieved! Keep going!`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.notificationManager.createNotification(
      NOTIFICATION_TYPES.LEVEL_UP,
      'Level Up!',
      randomMessage,
      { level, points }
    );
  }

  // Generate streak notification
  async generateStreakNotification(streak) {
    const messages = [
      `🔥 ${streak} day streak! You're on fire!`,
      `💪 ${streak} days in a row! Keep it up!`,
      `⭐ Amazing! ${streak} day streak!`,
      `🎯 ${streak} days straight! You're unstoppable!`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.notificationManager.createNotification(
      NOTIFICATION_TYPES.STREAK,
      'Streak Update',
      randomMessage,
      { streak }
    );
  }

  // Generate daily challenge notification
  async generateDailyChallengeNotification(challenge) {
    const messages = [
      `📅 Daily Challenge: ${challenge.title}`,
      `🎯 Today's Challenge: ${challenge.title}`,
      `💡 Challenge of the Day: ${challenge.title}`,
      `🏆 New Challenge: ${challenge.title}`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.notificationManager.createNotification(
      NOTIFICATION_TYPES.DAILY_CHALLENGE,
      'Daily Challenge',
      randomMessage,
      { challenge }
    );
  }

  // Generate motivation notification
  async generateMotivationNotification() {
    const messages = [
      `💪 Ready to improve your communication today?`,
      `🌟 Every conversation is a chance to grow!`,
      `🎯 Your communication skills are getting stronger!`,
      `✨ Take a moment to reflect and prepare!`,
      `🚀 Ready to have meaningful conversations?`,
      `💡 Practice makes perfect - let's do this!`,
      `🎊 You're doing great! Keep it up!`,
      `🔥 Your communication journey continues!`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.notificationManager.createNotification(
      NOTIFICATION_TYPES.MOTIVATION,
      'Daily Motivation',
      randomMessage
    );
  }

  // Generate tip notification
  async generateTipNotification() {
    const tips = [
      `💡 Tip: Active listening involves asking follow-up questions!`,
      `💡 Tip: Mirror the other person's energy level for better connection!`,
      `💡 Tip: Use "I" statements to express your feelings clearly!`,
      `💡 Tip: Take a deep breath before responding to difficult topics!`,
      `💡 Tip: Ask open-ended questions to encourage deeper conversation!`,
      `💡 Tip: Show empathy by acknowledging the other person's feelings!`,
      `💡 Tip: Practice your conversation starters in advance!`,
      `💡 Tip: Remember to maintain eye contact and open body language!`,
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    return this.notificationManager.createNotification(
      NOTIFICATION_TYPES.TIP,
      'Communication Tip',
      randomTip
    );
  }

  // Generate welcome notification
  async generateWelcomeNotification() {
    const messages = [
      `👋 Welcome to Parity! Let's improve your communication together!`,
      `🌟 Welcome! Ready to have better conversations?`,
      `🎯 Welcome to your communication journey!`,
      `💫 Welcome! Let's make every conversation count!`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.notificationManager.createNotification(
      NOTIFICATION_TYPES.WELCOME,
      'Welcome to Parity!',
      randomMessage
    );
  }

  // Generate celebration notification
  async generateCelebrationNotification(milestone) {
    const messages = [
      `🎉 Congratulations on ${milestone}!`,
      `🎊 Amazing work on ${milestone}!`,
      `⭐ Fantastic! You achieved ${milestone}!`,
      `🚀 Incredible! ${milestone} completed!`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.notificationManager.createNotification(
      NOTIFICATION_TYPES.CELEBRATION,
      'Celebration!',
      randomMessage,
      { milestone }
    );
  }

  // Generate reminder notification
  async generateReminderNotification(type) {
    const reminders = {
      daily_session: {
        title: 'Daily Reflection',
        message: `⏰ Time for your daily Solo Prep session!`,
      },
      weekly_review: {
        title: 'Weekly Review',
        message: `📊 How did your conversations go this week?`,
      },
      challenge_reminder: {
        title: 'Daily Challenge',
        message: `🎯 Don't forget today's challenge!`,
      },
      streak_reminder: {
        title: 'Streak Reminder',
        message: `🔥 Keep your streak alive! Complete a session today!`,
      },
    };

    const reminder = reminders[type];
    if (!reminder) return null;

    return this.notificationManager.createNotification(
      NOTIFICATION_TYPES.REMINDER,
      reminder.title,
      reminder.message,
      { type }
    );
  }
}

export const smartNotificationGenerator = new SmartNotificationGenerator();

// 5. NOTIFICATION SCHEDULER
export class NotificationScheduler {
  constructor() {
    this.scheduledNotifications = new Map();
    this.generator = smartNotificationGenerator;
  }

  // Schedule daily motivation
  scheduleDailyMotivation() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM

    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.generator.generateMotivationNotification();
      this.scheduleDailyMotivation(); // Reschedule for next day
    }, timeUntilTomorrow);
  }

  // Schedule daily tip
  scheduleDailyTip() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0); // 3 PM

    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.generator.generateTipNotification();
      this.scheduleDailyTip(); // Reschedule for next day
    }, timeUntilTomorrow);
  }

  // Schedule streak reminder
  scheduleStreakReminder() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0); // 8 PM

    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.generator.generateReminderNotification('streak_reminder');
      this.scheduleStreakReminder(); // Reschedule for next day
    }, timeUntilTomorrow);
  }

  // Start all scheduled notifications
  startScheduling() {
    this.scheduleDailyMotivation();
    this.scheduleDailyTip();
    this.scheduleStreakReminder();
  }

  // Stop all scheduled notifications
  stopScheduling() {
    this.scheduledNotifications.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }
}

export const notificationScheduler = new NotificationScheduler();

// 6. NOTIFICATION ANALYTICS
export class NotificationAnalytics {
  constructor() {
    this.analytics = new Map();
  }

  // Track notification interaction
  async trackInteraction(notificationId, action) {
    const interaction = {
      notificationId,
      action,
      timestamp: Date.now(),
    };

    const interactions = await this.getInteractions();
    interactions.push(interaction);
    
    await storage.setItem('notification_interactions', JSON.stringify(interactions));
  }

  // Get interaction analytics
  async getInteractions() {
    const stored = await storage.getItem('notification_interactions');
    return stored ? JSON.parse(stored) : [];
  }

  // Get notification performance metrics
  async getPerformanceMetrics() {
    const interactions = await this.getInteractions();
    const totalInteractions = interactions.length;
    const readRate = interactions.filter(i => i.action === 'read').length / totalInteractions;
    const clickRate = interactions.filter(i => i.action === 'click').length / totalInteractions;
    const dismissRate = interactions.filter(i => i.action === 'dismiss').length / totalInteractions;

    return {
      totalInteractions,
      readRate,
      clickRate,
      dismissRate,
    };
  }
}

export const notificationAnalytics = new NotificationAnalytics();

export default {
  notificationManager,
  smartNotificationGenerator,
  notificationScheduler,
  notificationAnalytics,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
};
