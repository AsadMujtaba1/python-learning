/**
 * USER FEEDBACK SERVICE
 * 
 * Collects feedback from UK users on:
 * - Confusing text/jargon
 * - Unclear metrics
 * - Difficult UI steps
 * 
 * Integrates with AI to suggest improvements automatically
 */

import { monitoring } from './monitoringService';

export interface UserFeedback {
  id: string;
  userId?: string; // Optional - can be anonymous
  timestamp: Date;
  
  // Context
  page: string;
  section?: string;
  elementId?: string;
  
  // Feedback type
  category: 'confusing-text' | 'unclear-metrics' | 'difficult-ui' | 'incorrect-data' | 'general';
  severity: 'blocker' | 'major' | 'minor' | 'suggestion';
  
  // Details
  issue: string;
  userComment?: string;
  expectedBehavior?: string;
  
  // User context
  userType?: 'first-time' | 'returning' | 'power-user';
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  
  // Status
  status: 'new' | 'reviewing' | 'implementing' | 'resolved' | 'wont-fix';
  aiSuggestion?: string;
  resolution?: string;
  resolvedAt?: Date;
}

export interface FeedbackStats {
  total: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byPage: Record<string, number>;
  topIssues: Array<{
    issue: string;
    count: number;
    category: string;
  }>;
}

export interface UKUserPersona {
  concern: string;
  check: (content: string) => {
    hasConcern: boolean;
    suggestions: string[];
  };
}

class FeedbackService {
  private feedback: UserFeedback[] = [];
  private readonly maxFeedback = 1000;
  
  /**
   * UK user persona - checks for common confusion points
   */
  private readonly ukUserPersona: UKUserPersona[] = [
    {
      concern: 'Technical jargon',
      check: (content: string) => {
        const jargon = [
          'kWh', 'standing charge', 'unit rate', 'MPAN', 'MPRN',
          'DCC', 'TPI', 'deemed contract', 'SVT', 'DAC'
        ];
        
        const found = jargon.filter(term => 
          content.includes(term) && !content.includes(`${term} (`) // No explanation
        );
        
        return {
          hasConcern: found.length > 0,
          suggestions: found.map(term => {
            const explanations: Record<string, string> = {
              'kWh': 'Add: "kWh (kilowatt-hour - one unit of energy)"',
              'standing charge': 'Add: "standing charge (daily fixed fee)"',
              'unit rate': 'Add: "unit rate (price per kWh used)"',
              'MPAN': 'Add: "MPAN (your electricity meter number)"',
              'MPRN': 'Add: "MPRN (your gas meter number)"',
              'SVT': 'Add: "SVT (Standard Variable Tariff - default rate)"',
              'DCC': 'Add: "DCC (Data Communications Company - smart meter network)"'
            };
            return explanations[term] || `Explain "${term}" in plain English`;
          })
        };
      }
    },
    {
      concern: 'Unclear savings',
      check: (content: string) => {
        const issues: string[] = [];
        
        // Check for "save £X" without time period
        if (/save £\d+/i.test(content) && !/per year|annually|per month|monthly/i.test(content)) {
          issues.push('Specify time period: "save £150 per year"');
        }
        
        // Check for "up to" without typical
        if (/up to £\d+/i.test(content) && !/typical|average|most people/i.test(content)) {
          issues.push('Add typical savings: "typically £80-120"');
        }
        
        // Check for comparison basis
        if (/save £\d+/i.test(content) && !/compared to|vs\.|versus|current/i.test(content)) {
          issues.push('Add comparison: "compared to your current tariff"');
        }
        
        return {
          hasConcern: issues.length > 0,
          suggestions: issues
        };
      }
    },
    {
      concern: 'Complex instructions',
      check: (content: string) => {
        const issues: string[] = [];
        
        // Check for long sentences
        const sentences = content.split(/[.!?]+/);
        const longSentences = sentences.filter(s => s.split(' ').length > 20);
        if (longSentences.length > 0) {
          issues.push(`Break into shorter sentences (found ${longSentences.length} long sentences)`);
        }
        
        // Check for passive voice
        if (/is required|must be|should be|can be/i.test(content)) {
          issues.push('Use active voice: "You need to..." instead of "It is required..."');
        }
        
        // Check for steps without numbers
        if (/first|second|third|next|then|finally/i.test(content) && !/<ol>|<li>|\d\./.test(content)) {
          issues.push('Use numbered list for multi-step instructions');
        }
        
        return {
          hasConcern: issues.length > 0,
          suggestions: issues
        };
      }
    },
    {
      concern: 'Unclear metrics',
      check: (content: string) => {
        const issues: string[] = [];
        
        // Check for percentages without context
        if (/\d+%/.test(content) && !/compared to|vs\.|versus|average|typical/i.test(content)) {
          issues.push('Add context for percentages: "20% above UK average"');
        }
        
        // Check for large numbers without formatting
        if (/\d{4,}/.test(content) && !/,/.test(content)) {
          issues.push('Format large numbers: "3,731" instead of "3731"');
        }
        
        return {
          hasConcern: issues.length > 0,
          suggestions: issues
        };
      }
    },
    {
      concern: 'Missing context',
      check: (content: string) => {
        const issues: string[] = [];
        
        // Check for "this will save" without explaining why
        if (/this will save|you could save/i.test(content) && !/because|by reducing|by switching/i.test(content)) {
          issues.push('Explain WHY it saves: "by reducing standby power consumption"');
        }
        
        // Check for recommendations without reasoning
        if (/we recommend|you should/i.test(content) && !/because|as|since/i.test(content)) {
          issues.push('Add reasoning: "We recommend X because..."');
        }
        
        return {
          hasConcern: issues.length > 0,
          suggestions: issues
        };
      }
    }
  ];
  
  /**
   * Submit user feedback
   */
  submitFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'status'>): UserFeedback {
    const newFeedback: UserFeedback = {
      ...feedback,
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'new'
    };
    
    // Generate AI suggestion
    newFeedback.aiSuggestion = this.generateAISuggestion(newFeedback);
    
    this.feedback.push(newFeedback);
    
    // Trim if exceeds max
    if (this.feedback.length > this.maxFeedback) {
      this.feedback = this.feedback.slice(-this.maxFeedback);
    }
    
    // Log to monitoring
    monitoring.logError(
      'user-feedback',
      new Error(`User feedback: ${feedback.issue}`),
      feedback.severity === 'blocker' ? 'critical' : 
      feedback.severity === 'major' ? 'error' : 'warning',
      {
        category: feedback.category,
        page: feedback.page,
        userComment: feedback.userComment
      }
    );
    
    console.log('📝 User feedback received:', {
      category: newFeedback.category,
      page: newFeedback.page,
      issue: newFeedback.issue,
      aiSuggestion: newFeedback.aiSuggestion
    });
    
    return newFeedback;
  }
  
  /**
   * Generate AI suggestion for improvement
   */
  private generateAISuggestion(feedback: UserFeedback): string {
    const suggestions: Record<string, string> = {
      'confusing-text': `Simplify language on ${feedback.page}. Replace technical terms with plain English or add explanations.`,
      'unclear-metrics': `Add context to metrics on ${feedback.page}. Include comparisons to UK averages or typical values.`,
      'difficult-ui': `Simplify UI flow on ${feedback.page}. Consider reducing steps or adding guidance tooltips.`,
      'incorrect-data': `Verify data accuracy on ${feedback.page}. Check calculation logic and data sources.`,
      'general': `Review ${feedback.page} based on user comment: "${feedback.userComment}"`
    };
    
    let suggestion = suggestions[feedback.category] || 'Review and improve based on feedback.';
    
    // Add specific suggestions based on element
    if (feedback.elementId) {
      suggestion += ` Focus on element: ${feedback.elementId}.`;
    }
    
    // Add severity-based priority
    if (feedback.severity === 'blocker') {
      suggestion = '🚨 URGENT: ' + suggestion;
    }
    
    return suggestion;
  }
  
  /**
   * Analyze content using UK user persona
   */
  analyzeContent(page: string, content: string): {
    needsImprovement: boolean;
    concerns: Array<{
      type: string;
      suggestions: string[];
    }>;
  } {
    const concerns: Array<{ type: string; suggestions: string[] }> = [];
    
    this.ukUserPersona.forEach(persona => {
      const result = persona.check(content);
      if (result.hasConcern) {
        concerns.push({
          type: persona.concern,
          suggestions: result.suggestions
        });
      }
    });
    
    return {
      needsImprovement: concerns.length > 0,
      concerns
    };
  }
  
  /**
   * Get feedback statistics
   */
  getStats(timeframe: 'hour' | 'day' | 'week' | 'all' = 'all'): FeedbackStats {
    // Filter by timeframe
    let filtered = this.feedback;
    if (timeframe !== 'all') {
      const cutoff = new Date();
      if (timeframe === 'hour') cutoff.setHours(cutoff.getHours() - 1);
      if (timeframe === 'day') cutoff.setDate(cutoff.getDate() - 1);
      if (timeframe === 'week') cutoff.setDate(cutoff.getDate() - 7);
      
      filtered = this.feedback.filter(f => f.timestamp >= cutoff);
    }
    
    // Calculate stats
    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byPage: Record<string, number> = {};
    const issueCount: Record<string, number> = {};
    
    filtered.forEach(f => {
      byCategory[f.category] = (byCategory[f.category] || 0) + 1;
      bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
      byPage[f.page] = (byPage[f.page] || 0) + 1;
      issueCount[f.issue] = (issueCount[f.issue] || 0) + 1;
    });
    
    // Get top issues
    const topIssues = Object.entries(issueCount)
      .map(([issue, count]) => {
        const feedback = filtered.find(f => f.issue === issue)!;
        return {
          issue,
          count,
          category: feedback.category
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      total: filtered.length,
      byCategory,
      bySeverity,
      byPage,
      topIssues
    };
  }
  
  /**
   * Get pending feedback (needs review)
   */
  getPendingFeedback(limit = 20): UserFeedback[] {
    return this.feedback
      .filter(f => f.status === 'new' || f.status === 'reviewing')
      .sort((a, b) => {
        // Sort by severity first
        const severityOrder = { blocker: 0, major: 1, minor: 2, suggestion: 3 };
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        
        // Then by timestamp (newest first)
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, limit);
  }
  
  /**
   * Update feedback status
   */
  updateStatus(
    feedbackId: string,
    status: UserFeedback['status'],
    resolution?: string
  ): boolean {
    const feedback = this.feedback.find(f => f.id === feedbackId);
    if (!feedback) return false;
    
    feedback.status = status;
    if (resolution) feedback.resolution = resolution;
    if (status === 'resolved' || status === 'wont-fix') {
      feedback.resolvedAt = new Date();
    }
    
    console.log(`✅ Feedback ${feedbackId} updated to: ${status}`);
    return true;
  }
  
  /**
   * Get feedback by page
   */
  getFeedbackByPage(page: string, limit = 10): UserFeedback[] {
    return this.feedback
      .filter(f => f.page === page)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  /**
   * Get improvement suggestions for page
   */
  getPageImprovements(page: string): {
    priority: 'high' | 'medium' | 'low';
    suggestions: string[];
    feedbackCount: number;
  } {
    const pageFeedback = this.getFeedbackByPage(page, 100);
    
    if (pageFeedback.length === 0) {
      return {
        priority: 'low',
        suggestions: [],
        feedbackCount: 0
      };
    }
    
    // Aggregate suggestions
    const suggestionMap = new Map<string, number>();
    pageFeedback.forEach(f => {
      if (f.aiSuggestion) {
        const current = suggestionMap.get(f.aiSuggestion) || 0;
        suggestionMap.set(f.aiSuggestion, current + 1);
      }
    });
    
    // Sort by frequency
    const suggestions = Array.from(suggestionMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([suggestion]) => suggestion);
    
    // Determine priority
    const blockerCount = pageFeedback.filter(f => f.severity === 'blocker').length;
    const majorCount = pageFeedback.filter(f => f.severity === 'major').length;
    
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (blockerCount > 0 || majorCount >= 5) priority = 'high';
    else if (majorCount > 0 || pageFeedback.length >= 10) priority = 'medium';
    
    return {
      priority,
      suggestions,
      feedbackCount: pageFeedback.length
    };
  }
  
  /**
   * Export feedback data for analysis
   */
  exportFeedback(filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: UserFeedback['category'];
    page?: string;
  }): UserFeedback[] {
    let filtered = this.feedback;
    
    if (filters) {
      if (filters.startDate) {
        filtered = filtered.filter(f => f.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(f => f.timestamp <= filters.endDate!);
      }
      if (filters.category) {
        filtered = filtered.filter(f => f.category === filters.category);
      }
      if (filters.page) {
        filtered = filtered.filter(f => f.page === filters.page);
      }
    }
    
    return filtered;
  }
  
  /**
   * Clear old feedback
   */
  cleanup(daysToKeep = 90): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    
    const before = this.feedback.length;
    this.feedback = this.feedback.filter(f => f.timestamp >= cutoff);
    
    const removed = before - this.feedback.length;
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} old feedback records`);
    }
    
    return removed;
  }
}

// Singleton instance
const feedbackService = new FeedbackService();

// Auto-cleanup every 7 days
if (typeof window !== 'undefined') {
  setInterval(() => {
    feedbackService.cleanup();
  }, 7 * 24 * 60 * 60 * 1000);
}

export default feedbackService;

// Convenience exports
export const feedback = {
  submit: (feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'status'>) =>
    feedbackService.submitFeedback(feedback),
  
  analyze: (page: string, content: string) =>
    feedbackService.analyzeContent(page, content),
  
  getStats: (timeframe?: 'hour' | 'day' | 'week' | 'all') =>
    feedbackService.getStats(timeframe),
  
  getPending: (limit?: number) =>
    feedbackService.getPendingFeedback(limit),
  
  updateStatus: (feedbackId: string, status: UserFeedback['status'], resolution?: string) =>
    feedbackService.updateStatus(feedbackId, status, resolution),
  
  getByPage: (page: string, limit?: number) =>
    feedbackService.getFeedbackByPage(page, limit),
  
  getImprovements: (page: string) =>
    feedbackService.getPageImprovements(page),
  
  export: (filters?: any) =>
    feedbackService.exportFeedback(filters)
};
