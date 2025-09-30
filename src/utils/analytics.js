// ANALYTICS AND INSIGHTS SYSTEM
// This is going to provide MASSIVE insights! 📊

import { storage } from './storage';
import { gamificationManager } from './gamification';

// 1. ANALYTICS MANAGER
export class AnalyticsManager {
  constructor() {
    this.events = new Map();
    this.metrics = new Map();
    this.insights = new Map();
  }

  // Track an event
  async trackEvent(eventName, properties = {}) {
    const event = {
      id: this.generateId(),
      name: eventName,
      properties,
      timestamp: Date.now(),
      userId: await this.getCurrentUserId(),
    };

    // Store event
    await this.storeEvent(event);

    // Update metrics
    await this.updateMetrics(event);

    // Generate insights
    await this.generateInsights(event);

    return event;
  }

  // Store event
  async storeEvent(event) {
    const userId = event.userId;
    const userEvents = await this.getUserEvents(userId);
    
    userEvents.push(event);
    
    // Keep only last 1000 events
    if (userEvents.length > 1000) {
      userEvents.splice(0, userEvents.length - 1000);
    }
    
    await storage.setItem(`analytics_events_${userId}`, JSON.stringify(userEvents));
  }

  // Get user events
  async getUserEvents(userId) {
    const stored = await storage.getItem(`analytics_events_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  // Update metrics
  async updateMetrics(event) {
    const userId = event.userId;
    const metrics = await this.getUserMetrics(userId);
    
    // Update event counts
    if (!metrics.eventCounts) metrics.eventCounts = {};
    metrics.eventCounts[event.name] = (metrics.eventCounts[event.name] || 0) + 1;
    
    // Update daily activity
    const today = new Date().toDateString();
    if (!metrics.dailyActivity) metrics.dailyActivity = {};
    metrics.dailyActivity[today] = (metrics.dailyActivity[today] || 0) + 1;
    
    // Update session metrics
    if (event.name === 'session_started') {
      metrics.totalSessions = (metrics.totalSessions || 0) + 1;
    }
    
    if (event.name === 'session_completed') {
      metrics.completedSessions = (metrics.completedSessions || 0) + 1;
    }
    
    if (event.name === 'ai_coach_used') {
      metrics.aiCoachUsage = (metrics.aiCoachUsage || 0) + 1;
    }
    
    if (event.name === 'journal_entry_written') {
      metrics.journalEntries = (metrics.journalEntries || 0) + 1;
    }
    
    // Update relationship types
    if (event.properties.relationshipType) {
      if (!metrics.relationshipTypes) metrics.relationshipTypes = {};
      metrics.relationshipTypes[event.properties.relationshipType] = 
        (metrics.relationshipTypes[event.properties.relationshipType] || 0) + 1;
    }
    
    // Update conversation topics
    if (event.properties.topic) {
      if (!metrics.topics) metrics.topics = {};
      metrics.topics[event.properties.topic] = 
        (metrics.topics[event.properties.topic] || 0) + 1;
    }
    
    await this.saveUserMetrics(userId, metrics);
  }

  // Get user metrics
  async getUserMetrics(userId) {
    const stored = await storage.getItem(`analytics_metrics_${userId}`);
    return stored ? JSON.parse(stored) : {};
  }

  // Save user metrics
  async saveUserMetrics(userId, metrics) {
    await storage.setItem(`analytics_metrics_${userId}`, JSON.stringify(metrics));
  }

  // Generate insights
  async generateInsights(event) {
    const userId = event.userId;
    const metrics = await this.getUserMetrics(userId);
    const insights = await this.getUserInsights(userId);
    
    // Generate new insights based on event
    const newInsights = await this.analyzeEventForInsights(event, metrics);
    
    if (newInsights.length > 0) {
      insights.push(...newInsights);
      await this.saveUserInsights(userId, insights);
    }
  }

  // Analyze event for insights
  async analyzeEventForInsights(event, metrics) {
    const insights = [];
    
    // Session completion rate insight
    if (event.name === 'session_completed' && metrics.totalSessions > 0) {
      const completionRate = (metrics.completedSessions / metrics.totalSessions) * 100;
      if (completionRate >= 80) {
        insights.push({
          type: 'completion_rate',
          title: 'High Completion Rate',
          message: `You complete ${Math.round(completionRate)}% of your sessions!`,
          priority: 'high',
          timestamp: Date.now(),
        });
      }
    }
    
    // AI Coach usage insight
    if (event.name === 'ai_coach_used' && metrics.aiCoachUsage > 0) {
      const aiUsageRate = (metrics.aiCoachUsage / metrics.totalSessions) * 100;
      if (aiUsageRate >= 50) {
        insights.push({
          type: 'ai_usage',
          title: 'AI Coach Enthusiast',
          message: `You use the AI Coach in ${Math.round(aiUsageRate)}% of your sessions!`,
          priority: 'medium',
          timestamp: Date.now(),
        });
      }
    }
    
    // Journaling frequency insight
    if (event.name === 'journal_entry_written' && metrics.journalEntries > 0) {
      const avgEntriesPerSession = metrics.journalEntries / metrics.totalSessions;
      if (avgEntriesPerSession >= 5) {
        insights.push({
          type: 'journaling_frequency',
          title: 'Reflective Thinker',
          message: `You write an average of ${Math.round(avgEntriesPerSession)} entries per session!`,
          priority: 'medium',
          timestamp: Date.now(),
        });
      }
    }
    
    // Relationship diversity insight
    if (event.properties.relationshipType && metrics.relationshipTypes) {
      const uniqueTypes = Object.keys(metrics.relationshipTypes).length;
      if (uniqueTypes >= 3) {
        insights.push({
          type: 'relationship_diversity',
          title: 'Relationship Explorer',
          message: `You've worked on conversations with ${uniqueTypes} different relationship types!`,
          priority: 'low',
          timestamp: Date.now(),
        });
      }
    }
    
    return insights;
  }

  // Get user insights
  async getUserInsights(userId) {
    const stored = await storage.getItem(`analytics_insights_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  // Save user insights
  async saveUserInsights(userId, insights) {
    // Keep only last 50 insights
    if (insights.length > 50) {
      insights.splice(0, insights.length - 50);
    }
    
    await storage.setItem(`analytics_insights_${userId}`, JSON.stringify(insights));
  }

  // Get current user ID
  async getCurrentUserId() {
    const user = await storage.getItem('currentUser');
    return user ? JSON.parse(user).id : 'anonymous';
  }

  // Generate unique ID
  generateId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get comprehensive analytics
  async getComprehensiveAnalytics(userId) {
    const metrics = await this.getUserMetrics(userId);
    const insights = await this.getUserInsights(userId);
    const events = await this.getUserEvents(userId);
    
    // Calculate additional metrics
    const analytics = {
      ...metrics,
      insights,
      recentEvents: events.slice(-10),
      summary: await this.generateSummary(metrics, insights),
    };
    
    return analytics;
  }

  // Generate summary
  async generateSummary(metrics, insights) {
    const summary = {
      totalSessions: metrics.totalSessions || 0,
      completionRate: metrics.totalSessions > 0 ? 
        Math.round((metrics.completedSessions / metrics.totalSessions) * 100) : 0,
      aiCoachUsage: metrics.aiCoachUsage || 0,
      journalEntries: metrics.journalEntries || 0,
      relationshipTypes: Object.keys(metrics.relationshipTypes || {}).length,
      topics: Object.keys(metrics.topics || {}).length,
      insightsCount: insights.length,
      lastActivity: metrics.lastActivity ? 
        new Date(metrics.lastActivity).toLocaleDateString() : 'Never',
    };
    
    return summary;
  }
}

export const analyticsManager = new AnalyticsManager();

// 2. INSIGHTS GENERATOR
export class InsightsGenerator {
  constructor() {
    this.analyticsManager = analyticsManager;
  }

  // Generate communication insights
  async generateCommunicationInsights(userId) {
    const metrics = await this.analyticsManager.getUserMetrics(userId);
    const insights = [];
    
    // Most used relationship type
    if (metrics.relationshipTypes) {
      const mostUsed = Object.entries(metrics.relationshipTypes)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (mostUsed) {
        insights.push({
          type: 'relationship_preference',
          title: 'Most Common Relationship Type',
          message: `You work on ${mostUsed[0]} conversations most often (${mostUsed[1]} sessions)`,
          priority: 'medium',
          timestamp: Date.now(),
        });
      }
    }
    
    // Most discussed topic
    if (metrics.topics) {
      const mostDiscussed = Object.entries(metrics.topics)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (mostDiscussed) {
        insights.push({
          type: 'topic_preference',
          title: 'Most Discussed Topic',
          message: `You often prepare for conversations about ${mostDiscussed[0]} (${mostDiscussed[1]} times)`,
          priority: 'medium',
          timestamp: Date.now(),
        });
      }
    }
    
    // Session completion pattern
    if (metrics.totalSessions > 0) {
      const completionRate = (metrics.completedSessions / metrics.totalSessions) * 100;
      if (completionRate >= 90) {
        insights.push({
          type: 'completion_excellence',
          title: 'Completion Excellence',
          message: `You complete ${Math.round(completionRate)}% of your sessions - excellent commitment!`,
          priority: 'high',
          timestamp: Date.now(),
        });
      } else if (completionRate < 50) {
        insights.push({
          type: 'completion_improvement',
          title: 'Completion Improvement',
          message: `You complete ${Math.round(completionRate)}% of your sessions - try shorter sessions!`,
          priority: 'high',
          timestamp: Date.now(),
        });
      }
    }
    
    return insights;
  }

  // Generate progress insights
  async generateProgressInsights(userId) {
    const metrics = await this.analyticsManager.getUserMetrics(userId);
    const insights = [];
    
    // Growth in journal entries
    if (metrics.journalEntries > 0 && metrics.totalSessions > 0) {
      const avgEntriesPerSession = metrics.journalEntries / metrics.totalSessions;
      if (avgEntriesPerSession >= 5) {
        insights.push({
          type: 'journaling_growth',
          title: 'Deep Reflection',
          message: `You write an average of ${Math.round(avgEntriesPerSession)} entries per session - great depth!`,
          priority: 'medium',
          timestamp: Date.now(),
        });
      }
    }
    
    // AI Coach adoption
    if (metrics.aiCoachUsage > 0 && metrics.totalSessions > 0) {
      const aiUsageRate = (metrics.aiCoachUsage / metrics.totalSessions) * 100;
      if (aiUsageRate >= 70) {
        insights.push({
          type: 'ai_adoption',
          title: 'AI Coach Power User',
          message: `You use the AI Coach in ${Math.round(aiUsageRate)}% of your sessions - great utilization!`,
          priority: 'medium',
          timestamp: Date.now(),
        });
      }
    }
    
    // Consistency insights
    if (metrics.dailyActivity) {
      const activeDays = Object.keys(metrics.dailyActivity).length;
      if (activeDays >= 7) {
        insights.push({
          type: 'consistency',
          title: 'Consistent User',
          message: `You've been active for ${activeDays} days - great consistency!`,
          priority: 'high',
          timestamp: Date.now(),
        });
      }
    }
    
    return insights;
  }

  // Generate recommendation insights
  async generateRecommendationInsights(userId) {
    const metrics = await this.analyticsManager.getUserMetrics(userId);
    const insights = [];
    
    // Relationship diversity recommendation
    if (metrics.relationshipTypes) {
      const uniqueTypes = Object.keys(metrics.relationshipTypes).length;
      if (uniqueTypes < 3) {
        insights.push({
          type: 'diversity_recommendation',
          title: 'Expand Your Horizons',
          message: `Try working on conversations with different relationship types to broaden your skills!`,
          priority: 'low',
          timestamp: Date.now(),
        });
      }
    }
    
    // AI Coach recommendation
    if (metrics.aiCoachUsage === 0 && metrics.totalSessions > 0) {
      insights.push({
        type: 'ai_recommendation',
        title: 'Try the AI Coach',
        message: `The AI Coach can provide personalized advice for your conversations!`,
        priority: 'medium',
        timestamp: Date.now(),
      });
    }
    
    // Journaling recommendation
    if (metrics.journalEntries < metrics.totalSessions * 3) {
      insights.push({
        type: 'journaling_recommendation',
        title: 'Deeper Reflection',
        message: `Try writing more journal entries to get more insights from your sessions!`,
        priority: 'low',
        timestamp: Date.now(),
      });
    }
    
    return insights;
  }

  // Generate all insights
  async generateAllInsights(userId) {
    const communicationInsights = await this.generateCommunicationInsights(userId);
    const progressInsights = await this.generateProgressInsights(userId);
    const recommendationInsights = await this.generateRecommendationInsights(userId);
    
    return [
      ...communicationInsights,
      ...progressInsights,
      ...recommendationInsights,
    ];
  }
}

export const insightsGenerator = new InsightsGenerator();

// 3. PERFORMANCE ANALYTICS
export class PerformanceAnalytics {
  constructor() {
    this.analyticsManager = analyticsManager;
  }

  // Track performance metrics
  async trackPerformanceMetric(metricName, value, properties = {}) {
    const metric = {
      id: this.generateId(),
      name: metricName,
      value,
      properties,
      timestamp: Date.now(),
      userId: await this.analyticsManager.getCurrentUserId(),
    };

    await this.storePerformanceMetric(metric);
    return metric;
  }

  // Store performance metric
  async storePerformanceMetric(metric) {
    const userId = metric.userId;
    const metrics = await this.getPerformanceMetrics(userId);
    
    if (!metrics[metric.name]) {
      metrics[metric.name] = [];
    }
    
    metrics[metric.name].push(metric);
    
    // Keep only last 100 metrics per type
    if (metrics[metric.name].length > 100) {
      metrics[metric.name].splice(0, metrics[metric.name].length - 100);
    }
    
    await storage.setItem(`performance_metrics_${userId}`, JSON.stringify(metrics));
  }

  // Get performance metrics
  async getPerformanceMetrics(userId) {
    const stored = await storage.getItem(`performance_metrics_${userId}`);
    return stored ? JSON.parse(stored) : {};
  }

  // Get performance summary
  async getPerformanceSummary(userId) {
    const metrics = await this.getPerformanceMetrics(userId);
    const summary = {};
    
    for (const [metricName, metricData] of Object.entries(metrics)) {
      if (metricData.length > 0) {
        const values = metricData.map(m => m.value);
        summary[metricName] = {
          count: values.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1],
        };
      }
    }
    
    return summary;
  }

  // Generate unique ID
  generateId() {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const performanceAnalytics = new PerformanceAnalytics();

// 4. USER BEHAVIOR ANALYTICS
export class UserBehaviorAnalytics {
  constructor() {
    this.analyticsManager = analyticsManager;
  }

  // Track user behavior
  async trackBehavior(behaviorType, properties = {}) {
    const behavior = {
      id: this.generateId(),
      type: behaviorType,
      properties,
      timestamp: Date.now(),
      userId: await this.analyticsManager.getCurrentUserId(),
    };

    await this.storeBehavior(behavior);
    return behavior;
  }

  // Store behavior
  async storeBehavior(behavior) {
    const userId = behavior.userId;
    const behaviors = await this.getUserBehaviors(userId);
    
    behaviors.push(behavior);
    
    // Keep only last 500 behaviors
    if (behaviors.length > 500) {
      behaviors.splice(0, behaviors.length - 500);
    }
    
    await storage.setItem(`user_behaviors_${userId}`, JSON.stringify(behaviors));
  }

  // Get user behaviors
  async getUserBehaviors(userId) {
    const stored = await storage.getItem(`user_behaviors_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  // Analyze user patterns
  async analyzeUserPatterns(userId) {
    const behaviors = await this.getUserBehaviors(userId);
    const patterns = {};
    
    // Group behaviors by type
    behaviors.forEach(behavior => {
      if (!patterns[behavior.type]) {
        patterns[behavior.type] = [];
      }
      patterns[behavior.type].push(behavior);
    });
    
    // Analyze patterns
    const analysis = {};
    for (const [type, typeBehaviors] of Object.entries(patterns)) {
      analysis[type] = {
        count: typeBehaviors.length,
        frequency: typeBehaviors.length / behaviors.length,
        averageInterval: this.calculateAverageInterval(typeBehaviors),
        peakHours: this.findPeakHours(typeBehaviors),
        trends: this.analyzeTrends(typeBehaviors),
      };
    }
    
    return analysis;
  }

  // Calculate average interval between behaviors
  calculateAverageInterval(behaviors) {
    if (behaviors.length < 2) return 0;
    
    const intervals = [];
    for (let i = 1; i < behaviors.length; i++) {
      const interval = behaviors[i].timestamp - behaviors[i-1].timestamp;
      intervals.push(interval);
    }
    
    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  // Find peak hours
  findPeakHours(behaviors) {
    const hourCounts = {};
    
    behaviors.forEach(behavior => {
      const hour = new Date(behavior.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));
  }

  // Analyze trends
  analyzeTrends(behaviors) {
    if (behaviors.length < 7) return 'insufficient_data';
    
    const recent = behaviors.slice(-7);
    const older = behaviors.slice(-14, -7);
    
    if (recent.length === 0 || older.length === 0) return 'insufficient_data';
    
    const recentAvg = recent.length / 7;
    const olderAvg = older.length / 7;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 20) return 'increasing';
    if (change < -20) return 'decreasing';
    return 'stable';
  }

  // Generate unique ID
  generateId() {
    return `behavior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const userBehaviorAnalytics = new UserBehaviorAnalytics();

export default {
  analyticsManager,
  insightsGenerator,
  performanceAnalytics,
  userBehaviorAnalytics,
};
