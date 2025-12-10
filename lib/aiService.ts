/**
 * AI SERVICE WITH CACHING AND COST CONTROL
 * 
 * Features:
 * - AI quick tips generation
 * - Weekly digest generation
 * - Personalized insights
 * - Bill analysis
 * - Product sentiment analysis
 * - Blog content support
 * - News summarization
 * 
 * Cost Control:
 * - All results cached with appropriate TTL
 * - Never repeat AI calls unnecessarily
 * - Fallback to static content when API fails
 * - Rate limiting to prevent cost overruns
 */

import { BillData } from './billOCR';
import { Product } from './productService';

// Cache storage with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

class AICache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttlMinutes: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const aiCache = new AICache();

// Rate limiting
interface RateLimit {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimit>();

function checkRateLimit(feature: string, maxPerHour: number): boolean {
  const now = Date.now();
  const limit = rateLimits.get(feature);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(feature, {
      count: 1,
      resetTime: now + 60 * 60 * 1000 // 1 hour
    });
    return true;
  }

  if (limit.count >= maxPerHour) {
    console.warn(`Rate limit exceeded for ${feature}`);
    return false;
  }

  limit.count++;
  return true;
}

// AI Response Types
export interface AITip {
  id: string;
  title: string;
  content: string;
  category: 'heating' | 'electricity' | 'water' | 'solar' | 'insulation' | 'general';
  potentialSaving: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  estimatedTime: string;
}

export interface AIWeeklyDigest {
  summary: string;
  weeklySpend: number;
  changeFromLastWeek: number;
  changePercent: number;
  topInsights: string[];
  recommendations: AITip[];
  weatherImpact: string;
  savingsOpportunities: {
    description: string;
    potentialSaving: number;
  }[];
  nextWeekForecast: string;
  generatedAt: string;
}

export interface AIPersonalizedInsight {
  type: 'cost-spike' | 'savings-opportunity' | 'efficiency-tip' | 'seasonal-advice' | 'product-recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  estimatedSaving?: number;
  relevanceScore: number; // 0-100
}

export interface AIBillAnalysis {
  overallScore: number; // 0-100
  findings: {
    type: 'good' | 'warning' | 'alert';
    category: string;
    message: string;
    impact: number; // £ per year
  }[];
  comparisonWithAverage: {
    category: string;
    yourUsage: number;
    ukAverage: number;
    difference: number;
  }[];
  recommendations: string[];
  estimatedOverpayment?: number;
  tariffSuggestions: string[];
}

export interface AIProductSentiment {
  productId: string;
  overallSentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // 0-100
  summary: string;
  pros: string[];
  cons: string[];
  commonPraises: string[];
  commonComplaints: string[];
  recommendationStrength: 'highly-recommended' | 'recommended' | 'conditional' | 'not-recommended';
  confidenceLevel: number; // 0-100
}

export interface AINewsDigest {
  id: string;
  title: string;
  summary: string;
  category: 'energy-prices' | 'policy' | 'technology' | 'tips' | 'weather';
  relevance: number; // 0-100
  sentiment: 'positive' | 'neutral' | 'negative';
  actionable: boolean;
  originalUrl?: string;
  publishedAt: string;
}

// Mock AI Implementation (Replace with real AI API in production)
// This simulates AI responses with intelligent fallbacks

/**
 * Generate AI quick tips based on user data
 * Cache: 24 hours
 */
export async function generateAIQuickTips(userData: {
  heatingType?: string;
  homeType?: string;
  occupants?: number;
  recentBills?: BillData[];
}): Promise<AITip[]> {
  const cacheKey = `ai-tips-${JSON.stringify(userData)}`;
  
  // Check cache first
  const cached = aiCache.get<AITip[]>(cacheKey);
  if (cached) {
    console.log('AI Tips: Using cached result');
    return cached;
  }

  // Check rate limit
  if (!checkRateLimit('quick-tips', 10)) {
    return getFallbackTips(userData);
  }

  try {
    // Simulate AI generation (replace with real AI API call)
    const tips = await generateTipsWithAI(userData);
    
    // Cache for 24 hours
    aiCache.set(cacheKey, tips, 24 * 60);
    
    return tips;
  } catch (error) {
    console.error('AI Tips generation failed:', error);
    return getFallbackTips(userData);
  }
}

function generateTipsWithAI(userData: any): Promise<AITip[]> {
  // Mock AI logic - replace with real OpenAI/Claude API
  const tips: AITip[] = [];

  if (userData.heatingType === 'gas-boiler') {
    tips.push({
      id: 'tip-1',
      title: 'Reduce thermostat by 1°C',
      content: 'Lowering your thermostat by just 1°C can save £80-£100 per year. Most people won\'t notice the difference.',
      category: 'heating',
      potentialSaving: 90,
      difficulty: 'easy',
      priority: 'high',
      actionable: true,
      estimatedTime: '1 minute'
    });
  }

  if (userData.occupants && userData.occupants > 2) {
    tips.push({
      id: 'tip-2',
      title: 'Install a smart thermostat',
      content: 'For larger households, smart thermostats can reduce bills by 10-15% through better scheduling and zone control.',
      category: 'heating',
      potentialSaving: 150,
      difficulty: 'medium',
      priority: 'high',
      actionable: true,
      estimatedTime: '2-3 hours (DIY) or book installer'
    });
  }

  tips.push({
    id: 'tip-3',
    title: 'Switch to LED bulbs everywhere',
    content: 'LED bulbs use 90% less energy than traditional bulbs and last 10x longer. Complete household switch saves £40-60/year.',
    category: 'electricity',
    potentialSaving: 50,
    difficulty: 'easy',
    priority: 'medium',
    actionable: true,
    estimatedTime: '30 minutes'
  });

  tips.push({
    id: 'tip-4',
    title: 'Draught-proof windows and doors',
    content: 'DIY draught excluders cost £20-40 and can save £30-60/year on heating. Professional draught-proofing saves even more.',
    category: 'insulation',
    potentialSaving: 45,
    difficulty: 'easy',
    priority: 'high',
    actionable: true,
    estimatedTime: '1-2 hours'
  });

  return Promise.resolve(tips);
}

function getFallbackTips(userData: any): AITip[] {
  // Static fallback tips when AI unavailable
  return [
    {
      id: 'fallback-1',
      title: 'Turn off standby devices',
      content: 'Devices on standby can cost £30-50/year. Use smart plugs to eliminate standby waste.',
      category: 'electricity',
      potentialSaving: 40,
      difficulty: 'easy',
      priority: 'medium',
      actionable: true,
      estimatedTime: '5 minutes'
    },
    {
      id: 'fallback-2',
      title: 'Wash clothes at 30°C',
      content: 'Modern detergents work well at 30°C. Save £15-20/year and reduce wear on clothes.',
      category: 'electricity',
      potentialSaving: 18,
      difficulty: 'easy',
      priority: 'low',
      actionable: true,
      estimatedTime: 'Ongoing'
    }
  ];
}

/**
 * Generate weekly digest with AI insights
 * Cache: 1 week (regenerate weekly)
 */
export async function generateWeeklyDigest(userData: {
  userId: string;
  weeklyUsage: number;
  lastWeekUsage: number;
  bills: BillData[];
}): Promise<AIWeeklyDigest> {
  const cacheKey = `weekly-digest-${userData.userId}-${getCurrentWeek()}`;
  
  const cached = aiCache.get<AIWeeklyDigest>(cacheKey);
  if (cached) {
    console.log('Weekly Digest: Using cached result');
    return cached;
  }

  if (!checkRateLimit('weekly-digest', 1)) {
    return getFallbackDigest(userData);
  }

  try {
    const digest = await generateDigestWithAI(userData);
    aiCache.set(cacheKey, digest, 7 * 24 * 60); // Cache for 1 week
    return digest;
  } catch (error) {
    console.error('Weekly digest generation failed:', error);
    return getFallbackDigest(userData);
  }
}

function generateDigestWithAI(userData: any): Promise<AIWeeklyDigest> {
  const weeklySpend = userData.weeklyUsage * 0.245; // Mock calculation
  const changeFromLastWeek = weeklySpend - (userData.lastWeekUsage * 0.245);
  const changePercent = (changeFromLastWeek / (userData.lastWeekUsage * 0.245)) * 100;

  const digest: AIWeeklyDigest = {
    summary: changePercent > 10 
      ? `Your energy costs increased by ${changePercent.toFixed(1)}% this week, likely due to colder weather. Here's how to reduce it.`
      : changePercent < -10
      ? `Great news! Your energy costs dropped by ${Math.abs(changePercent).toFixed(1)}% this week. Keep up the good habits!`
      : `Your energy usage is stable this week. Here are some tips to reduce it further.`,
    weeklySpend,
    changeFromLastWeek,
    changePercent,
    topInsights: [
      'Heating accounts for 65% of your energy costs',
      'Peak usage is between 6-9 PM',
      'Weekend usage is 20% higher than weekdays'
    ],
    recommendations: [
      {
        id: 'digest-rec-1',
        title: 'Schedule heating more efficiently',
        content: 'Your heating is running during unoccupied hours. Use a programmable thermostat.',
        category: 'heating',
        potentialSaving: 120,
        difficulty: 'easy',
        priority: 'high',
        actionable: true,
        estimatedTime: '10 minutes'
      }
    ],
    weatherImpact: 'Colder temperatures this week increased heating demand by 15%',
    savingsOpportunities: [
      {
        description: 'Switch to Economy 7 tariff for nighttime EV charging',
        potentialSaving: 180
      },
      {
        description: 'Install loft insulation (current: minimal)',
        potentialSaving: 250
      }
    ],
    nextWeekForecast: 'Temperatures expected to drop further. Budget an extra £5-8 for heating.',
    generatedAt: new Date().toISOString()
  };

  return Promise.resolve(digest);
}

function getFallbackDigest(userData: any): AIWeeklyDigest {
  return {
    summary: 'Your weekly energy summary is ready.',
    weeklySpend: userData.weeklyUsage * 0.245,
    changeFromLastWeek: 0,
    changePercent: 0,
    topInsights: [
      'Check your heating schedule',
      'Consider switching to LED bulbs',
      'Draught-proof your home'
    ],
    recommendations: [],
    weatherImpact: 'Weather data unavailable',
    savingsOpportunities: [],
    nextWeekForecast: 'Data unavailable',
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate personalized insights based on usage patterns
 * Cache: 12 hours
 */
export async function generatePersonalizedInsights(userData: {
  userId: string;
  bills: BillData[];
  usagePattern: any;
}): Promise<AIPersonalizedInsight[]> {
  const cacheKey = `insights-${userData.userId}-${new Date().toDateString()}`;
  
  const cached = aiCache.get<AIPersonalizedInsight[]>(cacheKey);
  if (cached) return cached;

  if (!checkRateLimit('insights', 20)) {
    return getFallbackInsights();
  }

  try {
    const insights = await generateInsightsWithAI(userData);
    aiCache.set(cacheKey, insights, 12 * 60);
    return insights;
  } catch (error) {
    console.error('Insights generation failed:', error);
    return getFallbackInsights();
  }
}

function generateInsightsWithAI(userData: any): Promise<AIPersonalizedInsight[]> {
  const insights: AIPersonalizedInsight[] = [
    {
      type: 'cost-spike',
      title: 'Unusual increase in electricity usage',
      description: 'Your electricity usage is 25% higher than your 3-month average. This could indicate an appliance issue or changed habits.',
      impact: 'high',
      action: 'Check appliances for faults and review recent usage patterns',
      estimatedSaving: 30,
      relevanceScore: 85
    },
    {
      type: 'savings-opportunity',
      title: 'You could save with a dual fuel tariff',
      description: 'Based on your usage, bundling gas and electricity with one supplier could save £150/year.',
      impact: 'medium',
      action: 'Compare dual fuel tariffs on our comparison page',
      estimatedSaving: 150,
      relevanceScore: 78
    }
  ];

  return Promise.resolve(insights);
}

function getFallbackInsights(): AIPersonalizedInsight[] {
  return [
    {
      type: 'efficiency-tip',
      title: 'Regular maintenance reminder',
      description: 'Service your boiler annually to maintain efficiency',
      impact: 'medium',
      action: 'Book a service appointment',
      relevanceScore: 60
    }
  ];
}

/**
 * Analyze bill and provide insights
 * Cache: Per bill ID (permanent until bill changes)
 */
export async function analyzeBillWithAI(bill: BillData): Promise<AIBillAnalysis> {
  const cacheKey = `bill-analysis-${JSON.stringify(bill)}`;
  
  const cached = aiCache.get<AIBillAnalysis>(cacheKey);
  if (cached) return cached;

  if (!checkRateLimit('bill-analysis', 50)) {
    return getFallbackBillAnalysis(bill);
  }

  try {
    const analysis = await performBillAnalysis(bill);
    aiCache.set(cacheKey, analysis, 30 * 24 * 60); // Cache for 30 days
    return analysis;
  } catch (error) {
    console.error('Bill analysis failed:', error);
    return getFallbackBillAnalysis(bill);
  }
}

function performBillAnalysis(bill: BillData): Promise<AIBillAnalysis> {
  const findings: AIBillAnalysis['findings'] = [];

  // Analyze electricity usage
  if (bill.electricityUsage) {
    const annualKwh = bill.electricityUsage.kwh * 12;
    if (annualKwh > 4500) {
      findings.push({
        type: 'warning',
        category: 'Electricity',
        message: 'Your electricity usage is above the UK average (3,731 kWh/year)',
        impact: (annualKwh - 3731) * 0.245
      });
    } else {
      findings.push({
        type: 'good',
        category: 'Electricity',
        message: 'Your electricity usage is below the UK average',
        impact: 0
      });
    }

    // Check rate
    if (bill.electricityUsage.rate && bill.electricityUsage.rate > 28) {
      findings.push({
        type: 'alert',
        category: 'Tariff',
        message: 'Your electricity rate is higher than market average (24.5p/kWh)',
        impact: (bill.electricityUsage.rate - 24.5) * annualKwh / 100
      });
    }
  }

  // Analyze gas usage
  if (bill.gasUsage) {
    const annualKwh = bill.gasUsage.kwh * 12;
    if (annualKwh > 15000) {
      findings.push({
        type: 'warning',
        category: 'Gas',
        message: 'Your gas usage is above the UK average (12,000 kWh/year)',
        impact: (annualKwh - 12000) * 0.075
      });
    }
  }

  const analysis: AIBillAnalysis = {
    overallScore: findings.filter(f => f.type === 'good').length > 0 ? 75 : 60,
    findings,
    comparisonWithAverage: [
      {
        category: 'Electricity',
        yourUsage: bill.electricityUsage?.kwh || 0,
        ukAverage: 311,
        difference: (bill.electricityUsage?.kwh || 0) - 311
      }
    ],
    recommendations: [
      'Compare tariffs - you may be on an expensive standard variable rate',
      'Check for standing charge - ensure it\'s competitive',
      'Consider dual fuel discount if not already applied'
    ],
    estimatedOverpayment: findings.reduce((sum, f) => sum + (f.impact || 0), 0),
    tariffSuggestions: [
      'Fixed rate tariff (12-24 months)',
      'Dual fuel bundle',
      'Green energy tariff'
    ]
  };

  return Promise.resolve(analysis);
}

function getFallbackBillAnalysis(bill: BillData): AIBillAnalysis {
  return {
    overallScore: 70,
    findings: [],
    comparisonWithAverage: [],
    recommendations: ['Review your tariff regularly', 'Monitor usage patterns'],
    tariffSuggestions: []
  };
}

/**
 * Generate product sentiment from aggregated reviews
 * Cache: 7 days
 */
export async function generateProductSentiment(product: Product): Promise<AIProductSentiment> {
  const cacheKey = `product-sentiment-${product.id}`;
  
  const cached = aiCache.get<AIProductSentiment>(cacheKey);
  if (cached) return cached;

  if (!checkRateLimit('product-sentiment', 100)) {
    return getFallbackProductSentiment(product);
  }

  try {
    const sentiment = await analyzeProductSentiment(product);
    aiCache.set(cacheKey, sentiment, 7 * 24 * 60);
    return sentiment;
  } catch (error) {
    console.error('Product sentiment analysis failed:', error);
    return getFallbackProductSentiment(product);
  }
}

function analyzeProductSentiment(product: Product): Promise<AIProductSentiment> {
  // AI-generated sentiment based on rating and review patterns
  const sentimentScore = Math.round(product.rating * 20); // Convert 5-star to 0-100
  
  let overallSentiment: 'positive' | 'neutral' | 'negative';
  if (sentimentScore >= 80) overallSentiment = 'positive';
  else if (sentimentScore >= 60) overallSentiment = 'neutral';
  else overallSentiment = 'negative';

  let recommendationStrength: AIProductSentiment['recommendationStrength'];
  if (sentimentScore >= 85 && product.reliabilityScore >= 90) recommendationStrength = 'highly-recommended';
  else if (sentimentScore >= 75) recommendationStrength = 'recommended';
  else if (sentimentScore >= 60) recommendationStrength = 'conditional';
  else recommendationStrength = 'not-recommended';

  const sentiment: AIProductSentiment = {
    productId: product.id,
    overallSentiment,
    sentimentScore,
    summary: product.aiSentiment,
    pros: product.pros,
    cons: product.cons,
    commonPraises: product.pros.slice(0, 2),
    commonComplaints: product.cons.slice(0, 2),
    recommendationStrength,
    confidenceLevel: Math.min(95, 60 + (product.reviewCount / 100))
  };

  return Promise.resolve(sentiment);
}

function getFallbackProductSentiment(product: Product): AIProductSentiment {
  return {
    productId: product.id,
    overallSentiment: 'neutral',
    sentimentScore: 70,
    summary: 'Product analysis unavailable',
    pros: [],
    cons: [],
    commonPraises: [],
    commonComplaints: [],
    recommendationStrength: 'conditional',
    confidenceLevel: 50
  };
}

/**
 * Summarize news articles with AI
 * Cache: 24 hours
 */
export async function summarizeNewsWithAI(articles: any[]): Promise<AINewsDigest[]> {
  const cacheKey = `news-digest-${new Date().toDateString()}`;
  
  const cached = aiCache.get<AINewsDigest[]>(cacheKey);
  if (cached) return cached;

  if (!checkRateLimit('news-summary', 10)) {
    return getFallbackNewsDigest();
  }

  try {
    const digests = await processNewsArticles(articles);
    aiCache.set(cacheKey, digests, 24 * 60);
    return digests;
  } catch (error) {
    console.error('News summarization failed:', error);
    return getFallbackNewsDigest();
  }
}

function processNewsArticles(articles: any[]): Promise<AINewsDigest[]> {
  // Mock AI processing
  const digests: AINewsDigest[] = articles.slice(0, 10).map((article, idx) => ({
    id: `news-${idx}`,
    title: article.title || 'Energy News Update',
    summary: article.description || 'Stay informed about energy market changes.',
    category: 'energy-prices',
    relevance: 85,
    sentiment: 'neutral',
    actionable: false,
    originalUrl: article.link,
    publishedAt: article.pubDate || new Date().toISOString()
  }));

  return Promise.resolve(digests);
}

function getFallbackNewsDigest(): AINewsDigest[] {
  return [
    {
      id: 'fallback-news-1',
      title: 'Energy prices remain stable',
      summary: 'UK energy prices are expected to remain stable through winter.',
      category: 'energy-prices',
      relevance: 70,
      sentiment: 'neutral',
      actionable: false,
      publishedAt: new Date().toISOString()
    }
  ];
}

// Helper functions
function getCurrentWeek(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek).toString();
}

// Periodic cleanup of expired cache
setInterval(() => {
  aiCache.clearExpired();
  console.log('AI Cache: Cleaned up expired entries');
}, 60 * 60 * 1000); // Every hour

// Export cache management functions for monitoring
export const aiCacheManager = {
  getSize: () => aiCache['cache'].size,
  clear: () => aiCache.clear(),
  clearExpired: () => aiCache.clearExpired()
};
