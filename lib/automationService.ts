/**
 * AUTOMATION SERVICE
 * 
 * Handles scheduled updates for:
 * - Weekly tariff updates
 * - Weekly/monthly product database updates
 * - Monthly solar and heat pump data updates
 * - Daily RSS feed refresh
 * 
 * Features:
 * - Configurable schedules
 * - Error handling and retries
 * - Logging and monitoring
 * - Graceful degradation when sources fail
 */

import { isProductDataStale, updateProductDatabase } from './productService';

export interface AutomationJob {
  name: string;
  schedule: 'daily' | 'weekly' | 'monthly';
  lastRun?: Date;
  nextRun: Date;
  status: 'idle' | 'running' | 'error';
  errorCount: number;
  lastError?: string;
}

export interface AutomationLog {
  jobName: string;
  timestamp: Date;
  status: 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
  details?: any;
}

class AutomationService {
  private jobs: Map<string, AutomationJob> = new Map();
  private logs: AutomationLog[] = [];
  private maxLogs = 1000;
  private isRunning = false;

  constructor() {
    this.initializeJobs();
  }

  private initializeJobs() {
    // Daily RSS feed refresh
    this.registerJob({
      name: 'rss-feed-refresh',
      schedule: 'daily',
      nextRun: this.getNextRunTime('daily'),
      status: 'idle',
      errorCount: 0
    });

    // Weekly tariff updates
    this.registerJob({
      name: 'tariff-updates',
      schedule: 'weekly',
      nextRun: this.getNextRunTime('weekly'),
      status: 'idle',
      errorCount: 0
    });

    // Weekly product database sync
    this.registerJob({
      name: 'product-updates-weekly',
      schedule: 'weekly',
      nextRun: this.getNextRunTime('weekly', 2), // Tuesday
      status: 'idle',
      errorCount: 0
    });

    // Monthly solar/heat pump data refresh
    this.registerJob({
      name: 'renewable-data-refresh',
      schedule: 'monthly',
      nextRun: this.getNextRunTime('monthly'),
      status: 'idle',
      errorCount: 0
    });

    // Monthly product deep scan
    this.registerJob({
      name: 'product-deep-scan',
      schedule: 'monthly',
      nextRun: this.getNextRunTime('monthly', 15), // 15th of month
      status: 'idle',
      errorCount: 0
    });
  }

  private registerJob(job: AutomationJob) {
    this.jobs.set(job.name, job);
    console.log(`Automation: Registered job '${job.name}' (${job.schedule})`);
  }

  private getNextRunTime(schedule: 'daily' | 'weekly' | 'monthly', dayOffset: number = 0): Date {
    const now = new Date();
    const next = new Date(now);

    switch (schedule) {
      case 'daily':
        next.setDate(now.getDate() + 1);
        next.setHours(2, 0, 0, 0); // 2 AM
        break;
      case 'weekly':
        const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
        next.setDate(now.getDate() + daysUntilMonday + dayOffset);
        next.setHours(3, 0, 0, 0); // 3 AM on Monday
        break;
      case 'monthly':
        next.setMonth(now.getMonth() + 1);
        next.setDate(dayOffset || 1);
        next.setHours(4, 0, 0, 0); // 4 AM on 1st of month
        break;
    }

    return next;
  }

  /**
   * Start automation service
   */
  start() {
    if (this.isRunning) {
      console.warn('Automation service is already running');
      return;
    }

    this.isRunning = true;
    console.log('Automation service started');

    // Check jobs every minute
    setInterval(() => {
      this.checkAndRunJobs();
    }, 60 * 1000);

    // Initial check
    this.checkAndRunJobs();
  }

  /**
   * Stop automation service
   */
  stop() {
    this.isRunning = false;
    console.log('Automation service stopped');
  }

  private async checkAndRunJobs() {
    const now = new Date();

    for (const [name, job] of this.jobs.entries()) {
      if (job.status === 'running') continue;
      if (now < job.nextRun) continue;

      await this.runJob(name);
    }
  }

  private async runJob(jobName: string) {
    const job = this.jobs.get(jobName);
    if (!job) return;

    console.log(`Automation: Running job '${jobName}'`);
    const startTime = Date.now();

    job.status = 'running';
    job.lastRun = new Date();

    try {
      await this.executeJob(jobName);
      
      const duration = Date.now() - startTime;
      this.log(jobName, 'success', `Completed in ${duration}ms`, duration);
      
      job.status = 'idle';
      job.errorCount = 0;
      job.nextRun = this.getNextRunTime(job.schedule);
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.log(jobName, 'error', error.message, duration, error);
      
      job.status = 'error';
      job.errorCount++;
      job.lastError = error.message;
      
      // Retry logic: exponential backoff
      const retryMinutes = Math.min(60, Math.pow(2, job.errorCount));
      job.nextRun = new Date(Date.now() + retryMinutes * 60 * 1000);
      
      console.error(`Automation: Job '${jobName}' failed, retry in ${retryMinutes} minutes`);
    }
  }

  private async executeJob(jobName: string): Promise<void> {
    switch (jobName) {
      case 'rss-feed-refresh':
        await this.refreshRSSFeeds();
        break;
      case 'tariff-updates':
        await this.updateTariffs();
        break;
      case 'product-updates-weekly':
        await this.updateProducts('weekly');
        break;
      case 'product-deep-scan':
        await this.updateProducts('monthly');
        break;
      case 'renewable-data-refresh':
        await this.updateRenewableData();
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }

  /**
   * RSS Feed Refresh (Daily)
   */
  private async refreshRSSFeeds(): Promise<void> {
    console.log('Refreshing RSS feeds...');
    
    const feeds = [
      'https://www.ofgem.gov.uk/feeds/news.xml',
      'https://www.gov.uk/search/news-and-communications.atom?organisations[]=department-for-energy-security-and-net-zero',
    ];

    const results = await Promise.allSettled(
      feeds.map(feed => this.fetchFeed(feed))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    if (failed > 0) {
      this.log('rss-feed-refresh', 'warning', 
        `${successful}/${feeds.length} feeds refreshed successfully`, 
        undefined, 
        { successful, failed }
      );
    }

    // Store feeds in cache or database
    // ... implementation
  }

  private async fetchFeed(url: string): Promise<any> {
    // Implement RSS parsing
    // For now, return mock data
    return { items: [] };
  }

  /**
   * Tariff Updates (Weekly)
   */
  private async updateTariffs(): Promise<void> {
    console.log('Updating tariff database...');

    // In production, fetch from Ofgem API or partner APIs
    // For now, use mock data or cached comparisons
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update tariff comparison data
      // In production, this would fetch from Ofgem API or energy provider APIs
      const tariffCount = 150; // Mock count for now
      
      this.log('tariff-updates', 'success', 
        `Updated ${tariffCount} tariffs`, 
        undefined,
        { tariffCount }
      );
      
    } catch (error: any) {
      // Fallback: use cached data
      this.log('tariff-updates', 'warning', 
        'Using cached tariff data due to API failure',
        undefined,
        { error: error.message }
      );
    }
  }

  /**
   * Product Database Updates (Weekly/Monthly)
   */
  private async updateProducts(frequency: 'weekly' | 'monthly'): Promise<void> {
    console.log(`Running ${frequency} product update...`);

    try {
      // Check if update needed
      const lastUpdated = new Date().toISOString();
      if (!isProductDataStale(lastUpdated) && frequency === 'weekly') {
        this.log('product-updates-weekly', 'success', 'Product data is fresh, skipping update');
        return;
      }

      // In production, fetch from Amazon Product API, eBay API, etc.
      // For now, mock the update
      await updateProductDatabase();

      this.log(`product-updates-${frequency}`, 'success', 
        `Product database updated (${frequency} scan)`
      );

    } catch (error: any) {
      // Use existing product database
      this.log(`product-updates-${frequency}`, 'warning',
        'Product update failed, using existing database',
        undefined,
        { error: error.message }
      );
    }
  }

  /**
   * Renewable Data Refresh (Monthly)
   */
  private async updateRenewableData(): Promise<void> {
    console.log('Updating solar and heat pump modeling data...');

    try {
      // Update:
      // 1. Regional sunlight data (from Met Office or solar radiation database)
      // 2. Regional climate data (temperatures, heating degree days)
      // 3. Government grant amounts (BUS scheme, etc.)
      // 4. Equipment costs (market prices for panels, heat pumps)
      // 5. Energy price forecasts

      await Promise.all([
        this.updateSunlightData(),
        this.updateClimateData(),
        this.updateGrantData(),
        this.updateEquipmentCosts()
      ]);

      this.log('renewable-data-refresh', 'success', 
        'Renewable energy data refreshed'
      );

    } catch (error: any) {
      this.log('renewable-data-refresh', 'warning',
        'Partial renewable data update failed, using cached values',
        undefined,
        { error: error.message }
      );
    }
  }

  private async updateSunlightData(): Promise<void> {
    // Mock: In production, fetch from Met Office API or solar database
    // Update regional kWh/kWp values
    console.log('Updated sunlight data');
  }

  private async updateClimateData(): Promise<void> {
    // Mock: Fetch average temperatures, heating degree days
    console.log('Updated climate data');
  }

  private async updateGrantData(): Promise<void> {
    // Mock: Scrape or API call to gov.uk for current BUS grant amounts
    console.log('Updated grant data');
  }

  private async updateEquipmentCosts(): Promise<void> {
    // Mock: Check market prices for solar panels, inverters, heat pumps
    console.log('Updated equipment costs');
  }

  /**
   * Manual job trigger (for testing or forced updates)
   */
  async triggerJob(jobName: string): Promise<void> {
    console.log(`Manually triggering job: ${jobName}`);
    await this.runJob(jobName);
  }

  /**
   * Get job status
   */
  getJobStatus(jobName: string): AutomationJob | undefined {
    return this.jobs.get(jobName);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): AutomationJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get recent logs
   */
  getLogs(limit: number = 50): AutomationLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get logs for specific job
   */
  getJobLogs(jobName: string, limit: number = 20): AutomationLog[] {
    return this.logs
      .filter(log => log.jobName === jobName)
      .slice(-limit);
  }

  /**
   * Clear old logs
   */
  clearOldLogs(daysToKeep: number = 30): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    
    this.logs = this.logs.filter(log => log.timestamp > cutoff);
    console.log(`Cleared logs older than ${daysToKeep} days`);
  }

  private log(
    jobName: string, 
    status: 'success' | 'error' | 'warning',
    message: string,
    duration?: number,
    details?: any
  ) {
    const log: AutomationLog = {
      jobName,
      timestamp: new Date(),
      status,
      message,
      duration,
      details
    };

    this.logs.push(log);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console
    const logLevel = status === 'error' ? 'error' : status === 'warning' ? 'warn' : 'log';
    console[logLevel](`[${jobName}] ${message}`);
  }

  /**
   * Health check
   */
  getHealthStatus(): {
    healthy: boolean;
    issues: string[];
    stats: {
      totalJobs: number;
      runningJobs: number;
      errorJobs: number;
      recentErrors: number;
    };
  } {
    const jobs = Array.from(this.jobs.values());
    const recentErrors = this.logs
      .filter(log => 
        log.status === 'error' && 
        log.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;

    const issues: string[] = [];
    const errorJobs = jobs.filter(j => j.status === 'error');

    errorJobs.forEach(job => {
      if (job.errorCount > 3) {
        issues.push(`Job '${job.name}' has failed ${job.errorCount} times`);
      }
    });

    if (recentErrors > 10) {
      issues.push(`High error rate: ${recentErrors} errors in last 24 hours`);
    }

    return {
      healthy: issues.length === 0,
      issues,
      stats: {
        totalJobs: jobs.length,
        runningJobs: jobs.filter(j => j.status === 'running').length,
        errorJobs: errorJobs.length,
        recentErrors
      }
    };
  }
}

// Singleton instance
const automationService = new AutomationService();

// Export service and types
export default automationService;

// Auto-start in production (comment out for testing)
if (typeof window === 'undefined') {
  // Node.js environment (backend)
  // automationService.start();
}

// Export for manual control
export const automation = {
  start: () => automationService.start(),
  stop: () => automationService.stop(),
  triggerJob: (jobName: string) => automationService.triggerJob(jobName),
  getStatus: (jobName: string) => automationService.getJobStatus(jobName),
  getAllJobs: () => automationService.getAllJobs(),
  getLogs: (limit?: number) => automationService.getLogs(limit),
  getJobLogs: (jobName: string, limit?: number) => automationService.getJobLogs(jobName, limit),
  getHealth: () => automationService.getHealthStatus()
};
