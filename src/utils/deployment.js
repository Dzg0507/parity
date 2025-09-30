// DEPLOYMENT AND CI/CD SYSTEM
// This is going to make the app DEPLOY READY! 🚀

import { storage } from './storage';
import { analyticsManager } from './analytics';

// 1. DEPLOYMENT ENVIRONMENTS
export const DEPLOYMENT_ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TESTING: 'testing',
};

// 2. DEPLOYMENT STATUS
export const DEPLOYMENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUCCESS: 'success',
  FAILED: 'failed',
  ROLLBACK: 'rollback',
};

// 3. DEPLOYMENT MANAGER
export class DeploymentManager {
  constructor() {
    this.deployments = new Map();
    this.environments = new Map();
    this.builds = new Map();
    this.rollbacks = new Map();
  }

  // Initialize deployment
  async initializeDeployment(deployment) {
    const deploymentInfo = {
      id: this.generateDeploymentId(),
      version: deployment.version,
      environment: deployment.environment,
      status: DEPLOYMENT_STATUS.PENDING,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      duration: 0,
      buildId: deployment.buildId,
      commitHash: deployment.commitHash,
      branch: deployment.branch,
      author: deployment.author,
      description: deployment.description,
      changes: deployment.changes || [],
      rollbackId: null,
      error: null,
      logs: [],
    };

    this.deployments.set(deploymentInfo.id, deploymentInfo);
    await this.storeDeployment(deploymentInfo);
    
    return deploymentInfo;
  }

  // Start deployment
  async startDeployment(deploymentId) {
    const deployment = await this.getDeployment(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    deployment.status = DEPLOYMENT_STATUS.IN_PROGRESS;
    deployment.startedAt = Date.now();
    
    await this.updateDeployment(deployment);
    
    // Start deployment process
    try {
      await this.executeDeployment(deployment);
      await this.completeDeployment(deploymentId);
    } catch (error) {
      await this.failDeployment(deploymentId, error);
    }
    
    return deployment;
  }

  // Execute deployment
  async executeDeployment(deployment) {
    const steps = [
      { name: 'Pre-deployment checks', fn: () => this.preDeploymentChecks(deployment) },
      { name: 'Build application', fn: () => this.buildApplication(deployment) },
      { name: 'Run tests', fn: () => this.runTests(deployment) },
      { name: 'Deploy to environment', fn: () => this.deployToEnvironment(deployment) },
      { name: 'Post-deployment verification', fn: () => this.postDeploymentVerification(deployment) },
    ];

    for (const step of steps) {
      await this.logDeploymentStep(deployment.id, step.name, 'started');
      
      try {
        await step.fn();
        await this.logDeploymentStep(deployment.id, step.name, 'completed');
      } catch (error) {
        await this.logDeploymentStep(deployment.id, step.name, 'failed', error.message);
        throw error;
      }
    }
  }

  // Pre-deployment checks
  async preDeploymentChecks(deployment) {
    // Check environment availability
    const environment = await this.getEnvironment(deployment.environment);
    if (!environment) {
      throw new Error(`Environment ${deployment.environment} not found`);
    }

    // Check if environment is available
    if (environment.status !== 'available') {
      throw new Error(`Environment ${deployment.environment} is not available`);
    }

    // Check for conflicting deployments
    const activeDeployments = await this.getActiveDeployments(deployment.environment);
    if (activeDeployments.length > 0) {
      throw new Error('Another deployment is already in progress');
    }

    // Check required resources
    const resources = await this.checkRequiredResources(deployment);
    if (!resources.available) {
      throw new Error(`Required resources not available: ${resources.missing.join(', ')}`);
    }
  }

  // Build application
  async buildApplication(deployment) {
    const build = await this.createBuild(deployment);
    
    // Build steps
    const buildSteps = [
      { name: 'Install dependencies', fn: () => this.installDependencies(build) },
      { name: 'Compile code', fn: () => this.compileCode(build) },
      { name: 'Run linting', fn: () => this.runLinting(build) },
      { name: 'Bundle assets', fn: () => this.bundleAssets(build) },
      { name: 'Generate build artifacts', fn: () => this.generateBuildArtifacts(build) },
    ];

    for (const step of buildSteps) {
      await this.logBuildStep(build.id, step.name, 'started');
      
      try {
        await step.fn();
        await this.logBuildStep(build.id, step.name, 'completed');
      } catch (error) {
        await this.logBuildStep(build.id, step.name, 'failed', error.message);
        throw error;
      }
    }

    build.status = 'completed';
    build.completedAt = Date.now();
    await this.updateBuild(build);
  }

  // Run tests
  async runTests(deployment) {
    const testSuites = [
      { name: 'Unit tests', fn: () => this.runUnitTests(deployment) },
      { name: 'Integration tests', fn: () => this.runIntegrationTests(deployment) },
      { name: 'E2E tests', fn: () => this.runE2ETests(deployment) },
      { name: 'Performance tests', fn: () => this.runPerformanceTests(deployment) },
    ];

    for (const suite of testSuites) {
      await this.logDeploymentStep(deployment.id, suite.name, 'started');
      
      try {
        const results = await suite.fn();
        if (!results.passed) {
          throw new Error(`Test suite ${suite.name} failed`);
        }
        await this.logDeploymentStep(deployment.id, suite.name, 'completed');
      } catch (error) {
        await this.logDeploymentStep(deployment.id, suite.name, 'failed', error.message);
        throw error;
      }
    }
  }

  // Deploy to environment
  async deployToEnvironment(deployment) {
    const environment = await this.getEnvironment(deployment.environment);
    
    // Deploy steps
    const deploySteps = [
      { name: 'Backup current version', fn: () => this.backupCurrentVersion(environment) },
      { name: 'Upload new version', fn: () => this.uploadNewVersion(deployment) },
      { name: 'Update configuration', fn: () => this.updateConfiguration(deployment) },
      { name: 'Start services', fn: () => this.startServices(environment) },
      { name: 'Health check', fn: () => this.healthCheck(environment) },
    ];

    for (const step of deploySteps) {
      await this.logDeploymentStep(deployment.id, step.name, 'started');
      
      try {
        await step.fn();
        await this.logDeploymentStep(deployment.id, step.name, 'completed');
      } catch (error) {
        await this.logDeploymentStep(deployment.id, step.name, 'failed', error.message);
        throw error;
      }
    }
  }

  // Post-deployment verification
  async postDeploymentVerification(deployment) {
    const environment = await this.getEnvironment(deployment.environment);
    
    // Verification steps
    const verificationSteps = [
      { name: 'Check application health', fn: () => this.checkApplicationHealth(environment) },
      { name: 'Verify functionality', fn: () => this.verifyFunctionality(environment) },
      { name: 'Check performance metrics', fn: () => this.checkPerformanceMetrics(environment) },
      { name: 'Monitor error rates', fn: () => this.monitorErrorRates(environment) },
    ];

    for (const step of verificationSteps) {
      await this.logDeploymentStep(deployment.id, step.name, 'started');
      
      try {
        await step.fn();
        await this.logDeploymentStep(deployment.id, step.name, 'completed');
      } catch (error) {
        await this.logDeploymentStep(deployment.id, step.name, 'failed', error.message);
        throw error;
      }
    }
  }

  // Complete deployment
  async completeDeployment(deploymentId) {
    const deployment = await this.getDeployment(deploymentId);
    deployment.status = DEPLOYMENT_STATUS.SUCCESS;
    deployment.completedAt = Date.now();
    deployment.duration = deployment.completedAt - deployment.startedAt;
    
    await this.updateDeployment(deployment);
    
    // Send success notification
    await this.sendDeploymentNotification(deployment, 'success');
  }

  // Fail deployment
  async failDeployment(deploymentId, error) {
    const deployment = await this.getDeployment(deploymentId);
    deployment.status = DEPLOYMENT_STATUS.FAILED;
    deployment.completedAt = Date.now();
    deployment.duration = deployment.completedAt - deployment.startedAt;
    deployment.error = error.message;
    
    await this.updateDeployment(deployment);
    
    // Send failure notification
    await this.sendDeploymentNotification(deployment, 'failed');
  }

  // Rollback deployment
  async rollbackDeployment(deploymentId) {
    const deployment = await this.getDeployment(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const rollback = await this.createRollback(deployment);
    
    try {
      await this.executeRollback(rollback);
      await this.completeRollback(rollback.id);
    } catch (error) {
      await this.failRollback(rollback.id, error);
    }
    
    return rollback;
  }

  // Execute rollback
  async executeRollback(rollback) {
    const steps = [
      { name: 'Stop current services', fn: () => this.stopCurrentServices(rollback) },
      { name: 'Restore previous version', fn: () => this.restorePreviousVersion(rollback) },
      { name: 'Update configuration', fn: () => this.updateConfiguration(rollback) },
      { name: 'Start services', fn: () => this.startServices(rollback) },
      { name: 'Verify rollback', fn: () => this.verifyRollback(rollback) },
    ];

    for (const step of steps) {
      await this.logRollbackStep(rollback.id, step.name, 'started');
      
      try {
        await step.fn();
        await this.logRollbackStep(rollback.id, step.name, 'completed');
      } catch (error) {
        await this.logRollbackStep(rollback.id, step.name, 'failed', error.message);
        throw error;
      }
    }
  }

  // Get deployment
  async getDeployment(deploymentId) {
    if (this.deployments.has(deploymentId)) {
      return this.deployments.get(deploymentId);
    }

    const stored = await storage.getItem(`deployment_${deploymentId}`);
    if (stored) {
      const deployment = JSON.parse(stored);
      this.deployments.set(deploymentId, deployment);
      return deployment;
    }

    return null;
  }

  // Update deployment
  async updateDeployment(deployment) {
    this.deployments.set(deployment.id, deployment);
    await this.storeDeployment(deployment);
  }

  // Store deployment
  async storeDeployment(deployment) {
    await storage.setItem(`deployment_${deployment.id}`, JSON.stringify(deployment));
  }

  // Generate deployment ID
  generateDeploymentId() {
    return `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log deployment step
  async logDeploymentStep(deploymentId, stepName, status, message = '') {
    const deployment = await this.getDeployment(deploymentId);
    if (!deployment) return;

    const logEntry = {
      step: stepName,
      status,
      message,
      timestamp: Date.now(),
    };

    deployment.logs.push(logEntry);
    await this.updateDeployment(deployment);
  }

  // Send deployment notification
  async sendDeploymentNotification(deployment, status) {
    // In a real implementation, this would send actual notifications
    console.log(`Deployment ${status}: ${deployment.id}`, deployment);
  }

  // Get active deployments
  async getActiveDeployments(environment) {
    const deployments = Array.from(this.deployments.values());
    return deployments.filter(d => 
      d.environment === environment && 
      d.status === DEPLOYMENT_STATUS.IN_PROGRESS
    );
  }

  // Check required resources
  async checkRequiredResources(deployment) {
    // In a real implementation, this would check actual resources
    return {
      available: true,
      missing: [],
    };
  }

  // Create build
  async createBuild(deployment) {
    const build = {
      id: this.generateBuildId(),
      deploymentId: deployment.id,
      status: 'pending',
      createdAt: Date.now(),
      completedAt: null,
      logs: [],
    };

    this.builds.set(build.id, build);
    await this.storeBuild(build);
    
    return build;
  }

  // Update build
  async updateBuild(build) {
    this.builds.set(build.id, build);
    await this.storeBuild(build);
  }

  // Store build
  async storeBuild(build) {
    await storage.setItem(`build_${build.id}`, JSON.stringify(build));
  }

  // Generate build ID
  generateBuildId() {
    return `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log build step
  async logBuildStep(buildId, stepName, status, message = '') {
    const build = this.builds.get(buildId);
    if (!build) return;

    const logEntry = {
      step: stepName,
      status,
      message,
      timestamp: Date.now(),
    };

    build.logs.push(logEntry);
    await this.updateBuild(build);
  }

  // Create rollback
  async createRollback(deployment) {
    const rollback = {
      id: this.generateRollbackId(),
      deploymentId: deployment.id,
      status: 'pending',
      createdAt: Date.now(),
      completedAt: null,
      logs: [],
    };

    this.rollbacks.set(rollback.id, rollback);
    await this.storeRollback(rollback);
    
    return rollback;
  }

  // Complete rollback
  async completeRollback(rollbackId) {
    const rollback = this.rollbacks.get(rollbackId);
    rollback.status = 'completed';
    rollback.completedAt = Date.now();
    
    await this.updateRollback(rollback);
  }

  // Fail rollback
  async failRollback(rollbackId, error) {
    const rollback = this.rollbacks.get(rollbackId);
    rollback.status = 'failed';
    rollback.completedAt = Date.now();
    rollback.error = error.message;
    
    await this.updateRollback(rollback);
  }

  // Update rollback
  async updateRollback(rollback) {
    this.rollbacks.set(rollback.id, rollback);
    await this.storeRollback(rollback);
  }

  // Store rollback
  async storeRollback(rollback) {
    await storage.setItem(`rollback_${rollback.id}`, JSON.stringify(rollback));
  }

  // Generate rollback ID
  generateRollbackId() {
    return `rollback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log rollback step
  async logRollbackStep(rollbackId, stepName, status, message = '') {
    const rollback = this.rollbacks.get(rollbackId);
    if (!rollback) return;

    const logEntry = {
      step: stepName,
      status,
      message,
      timestamp: Date.now(),
    };

    rollback.logs.push(logEntry);
    await this.updateRollback(rollback);
  }

  // Get deployment statistics
  async getDeploymentStatistics() {
    const deployments = Array.from(this.deployments.values());
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    const recentDeployments = deployments.filter(d => (now - d.createdAt) < oneDay);
    const weeklyDeployments = deployments.filter(d => (now - d.createdAt) < oneWeek);
    
    const successfulDeployments = deployments.filter(d => d.status === DEPLOYMENT_STATUS.SUCCESS);
    const failedDeployments = deployments.filter(d => d.status === DEPLOYMENT_STATUS.FAILED);
    
    return {
      total: deployments.length,
      recent: recentDeployments.length,
      weekly: weeklyDeployments.length,
      successful: successfulDeployments.length,
      failed: failedDeployments.length,
      successRate: deployments.length > 0 ? (successfulDeployments.length / deployments.length) * 100 : 0,
      averageDuration: deployments.length > 0 ? 
        deployments.reduce((sum, d) => sum + d.duration, 0) / deployments.length : 0,
    };
  }
}

export const deploymentManager = new DeploymentManager();

// 4. BUILD SYSTEM
export class BuildSystem {
  constructor() {
    this.builds = new Map();
    this.buildConfigs = new Map();
  }

  // Create build configuration
  createBuildConfig(config) {
    const buildConfig = {
      id: this.generateConfigId(),
      name: config.name,
      environment: config.environment,
      steps: config.steps || [],
      dependencies: config.dependencies || [],
      artifacts: config.artifacts || [],
      notifications: config.notifications || [],
      createdAt: Date.now(),
    };

    this.buildConfigs.set(buildConfig.id, buildConfig);
    return buildConfig;
  }

  // Execute build
  async executeBuild(configId, options = {}) {
    const config = this.buildConfigs.get(configId);
    if (!config) {
      throw new Error('Build configuration not found');
    }

    const build = {
      id: this.generateBuildId(),
      configId,
      status: 'pending',
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      duration: 0,
      logs: [],
      artifacts: [],
      ...options,
    };

    this.builds.set(build.id, build);
    
    try {
      build.status = 'running';
      build.startedAt = Date.now();
      
      await this.executeBuildSteps(build, config);
      
      build.status = 'completed';
      build.completedAt = Date.now();
      build.duration = build.completedAt - build.startedAt;
      
    } catch (error) {
      build.status = 'failed';
      build.completedAt = Date.now();
      build.duration = build.completedAt - build.startedAt;
      build.error = error.message;
    }
    
    return build;
  }

  // Execute build steps
  async executeBuildSteps(build, config) {
    for (const step of config.steps) {
      await this.logBuildStep(build.id, step.name, 'started');
      
      try {
        await this.executeBuildStep(build, step);
        await this.logBuildStep(build.id, step.name, 'completed');
      } catch (error) {
        await this.logBuildStep(build.id, step.name, 'failed', error.message);
        throw error;
      }
    }
  }

  // Execute build step
  async executeBuildStep(build, step) {
    switch (step.type) {
      case 'install':
        await this.installDependencies(build, step);
        break;
      case 'compile':
        await this.compileCode(build, step);
        break;
      case 'test':
        await this.runTests(build, step);
        break;
      case 'lint':
        await this.runLinting(build, step);
        break;
      case 'bundle':
        await this.bundleAssets(build, step);
        break;
      case 'package':
        await this.packageArtifacts(build, step);
        break;
      default:
        throw new Error(`Unknown build step type: ${step.type}`);
    }
  }

  // Install dependencies
  async installDependencies(build, step) {
    // In a real implementation, this would install actual dependencies
    console.log('Installing dependencies...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Compile code
  async compileCode(build, step) {
    // In a real implementation, this would compile actual code
    console.log('Compiling code...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Run tests
  async runTests(build, step) {
    // In a real implementation, this would run actual tests
    console.log('Running tests...');
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Run linting
  async runLinting(build, step) {
    // In a real implementation, this would run actual linting
    console.log('Running linting...');
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Bundle assets
  async bundleAssets(build, step) {
    // In a real implementation, this would bundle actual assets
    console.log('Bundling assets...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Package artifacts
  async packageArtifacts(build, step) {
    // In a real implementation, this would package actual artifacts
    console.log('Packaging artifacts...');
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Log build step
  async logBuildStep(buildId, stepName, status, message = '') {
    const build = this.builds.get(buildId);
    if (!build) return;

    const logEntry = {
      step: stepName,
      status,
      message,
      timestamp: Date.now(),
    };

    build.logs.push(logEntry);
  }

  // Generate config ID
  generateConfigId() {
    return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate build ID
  generateBuildId() {
    return `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const buildSystem = new BuildSystem();

// 5. MONITORING SYSTEM
export class MonitoringSystem {
  constructor() {
    this.metrics = new Map();
    this.alerts = new Map();
    this.healthChecks = new Map();
  }

  // Record metric
  recordMetric(name, value, tags = {}) {
    const metric = {
      name,
      value,
      tags,
      timestamp: Date.now(),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push(metric);
    
    // Keep only last 1000 metrics per name
    const metrics = this.metrics.get(name);
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }
  }

  // Get metrics
  getMetrics(name, timeRange = null) {
    const metrics = this.metrics.get(name) || [];
    
    if (!timeRange) return metrics;
    
    const now = Date.now();
    const startTime = now - timeRange;
    
    return metrics.filter(m => m.timestamp >= startTime);
  }

  // Create alert
  createAlert(alert) {
    const alertConfig = {
      id: this.generateAlertId(),
      name: alert.name,
      condition: alert.condition,
      threshold: alert.threshold,
      severity: alert.severity || 'medium',
      enabled: alert.enabled !== false,
      createdAt: Date.now(),
      lastTriggered: null,
      triggerCount: 0,
    };

    this.alerts.set(alertConfig.id, alertConfig);
    return alertConfig;
  }

  // Check alerts
  async checkAlerts() {
    for (const [alertId, alert] of this.alerts) {
      if (!alert.enabled) continue;
      
      try {
        const shouldTrigger = await this.evaluateAlertCondition(alert);
        if (shouldTrigger) {
          await this.triggerAlert(alert);
        }
      } catch (error) {
        console.error(`Error checking alert ${alertId}:`, error);
      }
    }
  }

  // Evaluate alert condition
  async evaluateAlertCondition(alert) {
    const metrics = this.getMetrics(alert.condition.metric, alert.condition.timeRange);
    if (metrics.length === 0) return false;
    
    const values = metrics.map(m => m.value);
    const currentValue = values[values.length - 1];
    
    switch (alert.condition.operator) {
      case 'gt':
        return currentValue > alert.threshold;
      case 'lt':
        return currentValue < alert.threshold;
      case 'eq':
        return currentValue === alert.threshold;
      case 'gte':
        return currentValue >= alert.threshold;
      case 'lte':
        return currentValue <= alert.threshold;
      default:
        return false;
    }
  }

  // Trigger alert
  async triggerAlert(alert) {
    alert.lastTriggered = Date.now();
    alert.triggerCount++;
    
    // Send alert notification
    await this.sendAlertNotification(alert);
  }

  // Send alert notification
  async sendAlertNotification(alert) {
    // In a real implementation, this would send actual notifications
    console.log(`Alert triggered: ${alert.name}`, alert);
  }

  // Create health check
  createHealthCheck(healthCheck) {
    const check = {
      id: this.generateHealthCheckId(),
      name: healthCheck.name,
      url: healthCheck.url,
      interval: healthCheck.interval || 60000, // 1 minute
      timeout: healthCheck.timeout || 5000, // 5 seconds
      enabled: healthCheck.enabled !== false,
      createdAt: Date.now(),
      lastCheck: null,
      status: 'unknown',
      responseTime: null,
      error: null,
    };

    this.healthChecks.set(check.id, check);
    return check;
  }

  // Run health checks
  async runHealthChecks() {
    for (const [checkId, check] of this.healthChecks) {
      if (!check.enabled) continue;
      
      try {
        await this.executeHealthCheck(check);
      } catch (error) {
        console.error(`Error running health check ${checkId}:`, error);
      }
    }
  }

  // Execute health check
  async executeHealthCheck(check) {
    const startTime = Date.now();
    
    try {
      // In a real implementation, this would make actual HTTP requests
      const response = await this.makeHealthCheckRequest(check);
      
      check.status = response.status === 200 ? 'healthy' : 'unhealthy';
      check.responseTime = Date.now() - startTime;
      check.error = null;
      
    } catch (error) {
      check.status = 'unhealthy';
      check.responseTime = Date.now() - startTime;
      check.error = error.message;
    }
    
    check.lastCheck = Date.now();
  }

  // Make health check request
  async makeHealthCheckRequest(check) {
    // In a real implementation, this would make actual HTTP requests
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 200 });
      }, 100);
    });
  }

  // Generate alert ID
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate health check ID
  generateHealthCheckId() {
    return `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get monitoring dashboard data
  getDashboardData() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const metrics = {};
    for (const [name, metricList] of this.metrics) {
      const recentMetrics = metricList.filter(m => (now - m.timestamp) < oneHour);
      if (recentMetrics.length > 0) {
        metrics[name] = {
          current: recentMetrics[recentMetrics.length - 1].value,
          average: recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length,
          count: recentMetrics.length,
        };
      }
    }
    
    const alerts = Array.from(this.alerts.values());
    const healthChecks = Array.from(this.healthChecks.values());
    
    return {
      metrics,
      alerts: {
        total: alerts.length,
        enabled: alerts.filter(a => a.enabled).length,
        triggered: alerts.filter(a => a.lastTriggered && (now - a.lastTriggered) < oneHour).length,
      },
      healthChecks: {
        total: healthChecks.length,
        healthy: healthChecks.filter(h => h.status === 'healthy').length,
        unhealthy: healthChecks.filter(h => h.status === 'unhealthy').length,
      },
    };
  }
}

export const monitoringSystem = new MonitoringSystem();

export default {
  deploymentManager,
  buildSystem,
  monitoringSystem,
  DEPLOYMENT_ENVIRONMENTS,
  DEPLOYMENT_STATUS,
};
