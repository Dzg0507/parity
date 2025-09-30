// REAL-TIME FEATURES SYSTEM
// This is going to make the app feel ALIVE! ⚡

import { Platform } from 'react-native';

// 1. WEBSOCKET CONNECTION MANAGER
class RealtimeManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.heartbeatInterval = null;
  }

  connect(url = 'ws://localhost:5000/ws') {
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('connection', { status: 'disconnected' });
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  handleMessage(data) {
    const { type, payload } = data;
    
    switch (type) {
      case 'coaching_update':
        this.emit('coaching', payload);
        break;
      case 'session_update':
        this.emit('session', payload);
        break;
      case 'notification':
        this.emit('notification', payload);
        break;
      case 'pong':
        // Heartbeat response
        break;
      default:
        this.emit(type, payload);
    }
  }

  send(type, payload) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, 30000); // 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('connection', { status: 'failed' });
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const realtimeManager = new RealtimeManager();

// 2. REAL-TIME COACHING
export class RealtimeCoaching {
  constructor() {
    this.isActive = false;
    this.sessionId = null;
    this.coachingInterval = null;
  }

  start(sessionId, context) {
    this.sessionId = sessionId;
    this.isActive = true;
    
    // Send initial context
    realtimeManager.send('start_coaching', {
      sessionId,
      context,
      timestamp: Date.now()
    });

    // Start periodic coaching updates
    this.coachingInterval = setInterval(() => {
      this.requestCoachingUpdate();
    }, 10000); // Every 10 seconds
  }

  stop() {
    this.isActive = false;
    if (this.coachingInterval) {
      clearInterval(this.coachingInterval);
      this.coachingInterval = null;
    }
    
    realtimeManager.send('stop_coaching', {
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }

  requestCoachingUpdate() {
    if (this.isActive) {
      realtimeManager.send('coaching_request', {
        sessionId: this.sessionId,
        timestamp: Date.now()
      });
    }
  }

  updateContext(context) {
    if (this.isActive) {
      realtimeManager.send('update_context', {
        sessionId: this.sessionId,
        context,
        timestamp: Date.now()
      });
    }
  }
}

export const realtimeCoaching = new RealtimeCoaching();

// 3. LIVE SESSION SYNC
export class LiveSessionSync {
  constructor() {
    this.sessions = new Map();
    this.syncInterval = null;
  }

  startSync(sessionId) {
    this.sessions.set(sessionId, {
      lastSync: Date.now(),
      pendingChanges: [],
      isSyncing: false
    });

    // Start periodic sync
    if (!this.syncInterval) {
      this.syncInterval = setInterval(() => {
        this.syncAllSessions();
      }, 5000); // Every 5 seconds
    }
  }

  stopSync(sessionId) {
    this.sessions.delete(sessionId);
    
    if (this.sessions.size === 0 && this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  addChange(sessionId, change) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.pendingChanges.push({
        ...change,
        timestamp: Date.now()
      });
    }
  }

  async syncAllSessions() {
    for (const [sessionId, session] of this.sessions) {
      if (session.pendingChanges.length > 0 && !session.isSyncing) {
        await this.syncSession(sessionId);
      }
    }
  }

  async syncSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || session.isSyncing) return;

    session.isSyncing = true;
    
    try {
      const changes = [...session.pendingChanges];
      session.pendingChanges = [];

      realtimeManager.send('sync_session', {
        sessionId,
        changes,
        timestamp: Date.now()
      });

      session.lastSync = Date.now();
    } catch (error) {
      console.error('Sync failed:', error);
      // Re-add changes to pending
      session.pendingChanges.unshift(...session.pendingChanges);
    } finally {
      session.isSyncing = false;
    }
  }
}

export const liveSessionSync = new LiveSessionSync();

// 4. PUSH NOTIFICATIONS
export class PushNotificationManager {
  constructor() {
    this.permissionGranted = false;
    this.notificationHandlers = new Map();
  }

  async requestPermission() {
    try {
      // This would integrate with react-native-push-notification
      // For now, we'll simulate permission
      this.permissionGranted = true;
      return true;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  async sendLocalNotification(title, message, data = {}) {
    if (!this.permissionGranted) {
      console.warn('Notification permission not granted');
      return;
    }

    // This would use react-native-push-notification
    console.log('Sending notification:', { title, message, data });
  }

  scheduleNotification(title, message, delay, data = {}) {
    setTimeout(() => {
      this.sendLocalNotification(title, message, data);
    }, delay);
  }

  onNotification(handler) {
    this.notificationHandlers.set(handler, handler);
  }

  offNotification(handler) {
    this.notificationHandlers.delete(handler);
  }
}

export const pushNotificationManager = new PushNotificationManager();

// 5. COLLABORATIVE FEATURES
export class CollaborativeManager {
  constructor() {
    this.activeCollaborations = new Map();
  }

  startCollaboration(sessionId, participants) {
    this.activeCollaborations.set(sessionId, {
      participants,
      lastActivity: Date.now(),
      isActive: true
    });

    realtimeManager.send('start_collaboration', {
      sessionId,
      participants,
      timestamp: Date.now()
    });
  }

  endCollaboration(sessionId) {
    this.activeCollaborations.delete(sessionId);
    
    realtimeManager.send('end_collaboration', {
      sessionId,
      timestamp: Date.now()
    });
  }

  updatePresence(sessionId, status) {
    realtimeManager.send('update_presence', {
      sessionId,
      status,
      timestamp: Date.now()
    });
  }

  sendCollaborativeMessage(sessionId, message) {
    realtimeManager.send('collaborative_message', {
      sessionId,
      message,
      timestamp: Date.now()
    });
  }
}

export const collaborativeManager = new CollaborativeManager();

// 6. REAL-TIME ANALYTICS
export class RealtimeAnalytics {
  constructor() {
    this.events = [];
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 seconds
    this.isFlushing = false;
  }

  track(event, properties = {}) {
    this.events.push({
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        platform: Platform.OS,
        version: '1.0.0' // This would come from app config
      }
    });

    // Auto-flush if batch is full
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.isFlushing || this.events.length === 0) return;

    this.isFlushing = true;
    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // Send to analytics service
      realtimeManager.send('analytics_batch', {
        events: eventsToFlush,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to flush analytics:', error);
      // Re-add events to queue
      this.events.unshift(...eventsToFlush);
    } finally {
      this.isFlushing = false;
    }
  }

  startAutoFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
}

export const realtimeAnalytics = new RealtimeAnalytics();

// 7. CONNECTION STATUS MONITOR
export class ConnectionMonitor {
  constructor() {
    this.isOnline = navigator?.onLine ?? true;
    this.listeners = new Map();
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.emit('status', { online: true });
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.emit('status', { online: false });
      });
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  getStatus() {
    return {
      online: this.isOnline,
      timestamp: Date.now()
    };
  }
}

export const connectionMonitor = new ConnectionMonitor();

// 8. REAL-TIME FEATURES INITIALIZATION
export const initializeRealtimeFeatures = () => {
  // Start connection monitor
  connectionMonitor.startAutoFlush();
  
  // Start analytics auto-flush
  realtimeAnalytics.startAutoFlush();
  
  // Connect to WebSocket
  realtimeManager.connect();
  
  console.log('Real-time features initialized');
};

// 9. CLEANUP UTILITIES
export const cleanupRealtimeFeatures = () => {
  realtimeManager.disconnect();
  liveSessionSync.sessions.clear();
  collaborativeManager.activeCollaborations.clear();
  realtimeAnalytics.events = [];
  
  console.log('Real-time features cleaned up');
};

export default {
  realtimeManager,
  realtimeCoaching,
  liveSessionSync,
  pushNotificationManager,
  collaborativeManager,
  realtimeAnalytics,
  connectionMonitor,
  initializeRealtimeFeatures,
  cleanupRealtimeFeatures,
};
