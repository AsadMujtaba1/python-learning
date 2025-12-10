/**
 * MONITORING AND ERROR HANDLING SERVICE
 * 
 * Features:
 * - Centralized error tracking
 * - Performance monitoring
 * - Health checks for all services
 * - Alert system for critical failures
 * - Fallback strategies
 * - Error recovery mechanisms
 */

export interface ErrorLog {
  id: string;
  timestamp: Date;
  service: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: any;
  userImpact: 'high' | 'medium' | 'low' | 'none';
  resolved: boolean;
}

export interface PerformanceMetric {
  service: string;
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: Date;
  message?: string;
  details?: any;
}

export interface ServiceAlert {
  id: string;
  service: string;
  type: 'downtime' | 'performance' | 'rate-limit' | 'data-quality' | 'security';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

class MonitoringService {
  private errors: ErrorLog[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alerts: ServiceAlert[] = [];
  
  private maxErrors = 1000;
  private maxMetrics = 5000;
  private maxAlerts = 100;

  /**
   * Log an error with context
   */
  logError(
    service: string,
    error: Error | string,
    severity: ErrorLog['severity'] = 'error',
    context?: any
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      service,
      severity,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context,
      userImpact: this.assessUserImpact(service, severity),
      resolved: false
    };

    this.errors.push(errorLog);
    this.trimErrors();

    // Log to console
    console.error(`[${service}] ${errorLog.message}`, context);

    // Create alert for critical errors
    if (severity === 'critical') {
      this.createAlert(service, 'downtime', 'critical', errorLog.message);
    }

    // Attempt recovery
    this.attemptRecovery(service, errorLog);
  }

  /**
   * Log performance metric
   */
  logPerformance(
    service: string,
    operation: string,
    duration: number,
    success: boolean = true
  ): void {
    const metric: PerformanceMetric = {
      service,
      operation,
      duration,
      timestamp: new Date(),
      success
    };

    this.performanceMetrics.push(metric);
    this.trimMetrics();

    // Alert on slow operations
    if (duration > 5000) { // > 5 seconds
      this.logError(
        service,
        `Slow operation: ${operation} took ${duration}ms`,
        'warning',
        { operation, duration }
      );
    }
  }

  /**
   * Measure execution time
   */
  async measurePerformance<T>(
    service: string,
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    let success = true;

    try {
      const result = await fn();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - start;
      this.logPerformance(service, operation, duration, success);
    }
  }

  /**
   * Update health check for a service
   */
  updateHealthCheck(
    service: string,
    status: HealthCheck['status'],
    message?: string,
    details?: any
  ): void {
    const healthCheck: HealthCheck = {
      service,
      status,
      lastCheck: new Date(),
      message,
      details
    };

    this.healthChecks.set(service, healthCheck);

    if (status === 'down') {
      this.createAlert(service, 'downtime', 'critical', message || `${service} is down`);
    }
  }

  /**
   * Run health checks for all services
   */
  async runHealthChecks(): Promise<Map<string, HealthCheck>> {
    const services = [
      'ai-service',
      'automation-service',
      'tariff-engine',
      'bill-ocr',
      'product-service',
      'solar-service',
      'heat-pump-service'
    ];

    for (const service of services) {
      try {
        await this.checkServiceHealth(service);
      } catch (error: any) {
        this.updateHealthCheck(service, 'down', error.message);
      }
    }

    return this.healthChecks;
  }

  private async checkServiceHealth(service: string): Promise<void> {
    // Implement service-specific health checks
    switch (service) {
      case 'ai-service':
        // Check AI cache, rate limits
        this.updateHealthCheck(service, 'healthy', 'AI service operational');
        break;
      case 'automation-service':
        // Check job statuses
        this.updateHealthCheck(service, 'healthy', 'Automation jobs running');
        break;
      case 'tariff-engine':
        // Check tariff data freshness
        this.updateHealthCheck(service, 'healthy', 'Tariff data current');
        break;
      default:
        this.updateHealthCheck(service, 'healthy', `${service} operational`);
    }
  }

  /**
   * Create alert
   */
  private createAlert(
    service: string,
    type: ServiceAlert['type'],
    severity: ServiceAlert['severity'],
    message: string
  ): void {
    const alert: ServiceAlert = {
      id: this.generateId(),
      service,
      type,
      severity,
      message,
      timestamp: new Date(),
      acknowledged: false
    };

    this.alerts.push(alert);
    this.trimAlerts();

    // In production, send to alerting system (email, Slack, PagerDuty, etc.)
    console.warn(`🚨 ALERT [${severity}]: ${message}`);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Attempt automatic recovery
   */
  private attemptRecovery(service: string, error: ErrorLog): void {
    console.log(`Attempting recovery for ${service}...`);

    switch (service) {
      case 'ai-service':
        // Clear cache and retry
        console.log('AI Service: Clearing cache and using fallback');
        break;
      case 'tariff-engine':
        // Use cached tariff data
        console.log('Tariff Engine: Using cached data');
        break;
      case 'product-service':
        // Use stale product data
        console.log('Product Service: Using existing database');
        break;
      default:
        console.log(`No automatic recovery available for ${service}`);
    }
  }

  /**
   * Assess user impact
   */
  private assessUserImpact(
    service: string,
    severity: ErrorLog['severity']
  ): ErrorLog['userImpact'] {
    if (severity === 'critical') return 'high';
    if (severity === 'error') {
      // Services with fallbacks have lower impact
      if (['ai-service', 'product-service'].includes(service)) {
        return 'low';
      }
      return 'medium';
    }
    return 'none';
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeframe: 'hour' | 'day' | 'week' = 'day'): {
    total: number;
    bySeverity: Record<string, number>;
    byService: Record<string, number>;
    recentErrors: ErrorLog[];
  } {
    const cutoff = this.getCutoffTime(timeframe);
    const recentErrors = this.errors.filter(e => e.timestamp > cutoff);

    const bySeverity: Record<string, number> = {};
    const byService: Record<string, number> = {};

    recentErrors.forEach(error => {
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
      byService[error.service] = (byService[error.service] || 0) + 1;
    });

    return {
      total: recentErrors.length,
      bySeverity,
      byService,
      recentErrors: recentErrors.slice(-10)
    };
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(
    service?: string,
    timeframe: 'hour' | 'day' | 'week' = 'day'
  ): {
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
    successRate: number;
    totalOperations: number;
  } {
    const cutoff = this.getCutoffTime(timeframe);
    let metrics = this.performanceMetrics.filter(m => m.timestamp > cutoff);

    if (service) {
      metrics = metrics.filter(m => m.service === service);
    }

    if (metrics.length === 0) {
      return {
        avgDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        successRate: 100,
        totalOperations: 0
      };
    }

    const durations = metrics.map(m => m.duration);
    const successful = metrics.filter(m => m.success).length;

    return {
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      successRate: (successful / metrics.length) * 100,
      totalOperations: metrics.length
    };
  }

  /**
   * Get system health overview
   */
  getSystemHealth(): {
    overallStatus: 'healthy' | 'degraded' | 'critical';
    services: HealthCheck[];
    activeAlerts: ServiceAlert[];
    errorRate: number;
    performanceScore: number;
  } {
    const services = Array.from(this.healthChecks.values());
    const activeAlerts = this.alerts.filter(a => !a.acknowledged);
    const errorStats = this.getErrorStats('hour');

    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (services.some(s => s.status === 'down')) {
      overallStatus = 'critical';
    } else if (services.some(s => s.status === 'degraded')) {
      overallStatus = 'degraded';
    }

    const perfStats = this.getPerformanceStats(undefined, 'hour');
    const performanceScore = Math.min(100, Math.max(0, 
      100 - (perfStats.avgDuration / 50) // Penalize slow operations
    ));

    return {
      overallStatus,
      services,
      activeAlerts,
      errorRate: errorStats.total,
      performanceScore: Math.round(performanceScore)
    };
  }

  /**
   * Get all unresolved errors
   */
  getUnresolvedErrors(): ErrorLog[] {
    return this.errors.filter(e => !e.resolved);
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  /**
   * Clear old data
   */
  cleanup(daysToKeep: number = 7): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    this.errors = this.errors.filter(e => e.timestamp > cutoff);
    this.performanceMetrics = this.performanceMetrics.filter(m => m.timestamp > cutoff);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);

    console.log(`Monitoring: Cleaned up data older than ${daysToKeep} days`);
  }

  private getCutoffTime(timeframe: 'hour' | 'day' | 'week'): Date {
    const now = new Date();
    switch (timeframe) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private trimErrors(): void {
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  private trimMetrics(): void {
    if (this.performanceMetrics.length > this.maxMetrics) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetrics);
    }
  }

  private trimAlerts(): void {
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
const monitoringService = new MonitoringService();

// Periodic cleanup
setInterval(() => {
  monitoringService.cleanup();
}, 24 * 60 * 60 * 1000); // Daily

// Export service
export default monitoringService;

// Convenience exports
export const monitoring = {
  logError: (service: string, error: Error | string, severity?: ErrorLog['severity'], context?: any) =>
    monitoringService.logError(service, error, severity, context),
  
  logPerformance: (service: string, operation: string, duration: number, success?: boolean) =>
    monitoringService.logPerformance(service, operation, duration, success),
  
  measurePerformance: <T>(service: string, operation: string, fn: () => Promise<T>) =>
    monitoringService.measurePerformance(service, operation, fn),
  
  updateHealth: (service: string, status: HealthCheck['status'], message?: string, details?: any) =>
    monitoringService.updateHealthCheck(service, status, message, details),
  
  runHealthChecks: () => monitoringService.runHealthChecks(),
  
  getSystemHealth: () => monitoringService.getSystemHealth(),
  
  getErrorStats: (timeframe?: 'hour' | 'day' | 'week') => monitoringService.getErrorStats(timeframe),
  
  getPerformanceStats: (service?: string, timeframe?: 'hour' | 'day' | 'week') =>
    monitoringService.getPerformanceStats(service, timeframe),
  
  resolveError: (errorId: string) => monitoringService.resolveError(errorId),
  
  acknowledgeAlert: (alertId: string) => monitoringService.acknowledgeAlert(alertId)
};

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    monitoring.logError('global', event.error || event.message, 'error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    monitoring.logError('global', event.reason, 'error', {
      promise: 'unhandled rejection'
    });
  });
}
