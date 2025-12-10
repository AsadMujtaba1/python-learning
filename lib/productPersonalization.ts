/**
 * AI PRODUCT PERSONALIZATION ENGINE
 * 
 * Personalized product recommendations based on:
 * - User tariff and electricity rate
 * - Region and climate
 * - Usage patterns from bill data
 * - Household size
 * - Seasonal factors
 * - Current appliances
 * 
 * Results are cached for performance
 */

import { Product, ProductRecommendation, ProductCategory, calculateProductSavings } from './productService';
import { UserProfile } from './userProfile';
import { BillData } from './billOCR';

export interface PersonalizationInput {
  userProfile: UserProfile;
  billData?: BillData;
  currentSeason: 'winter' | 'spring' | 'summer' | 'autumn';
  currentAppliances?: {
    category: ProductCategory;
    age: number; // years
    powerConsumption: number; // watts
  }[];
}

export interface PersonalizedRecommendations {
  topRecommendations: ProductRecommendation[];
  categoryRecommendations: Map<ProductCategory, ProductRecommendation[]>;
  seasonalPriorities: ProductCategory[];
  estimatedTotalSavings: number; // £/year
  cacheTimestamp: string;
}

/**
 * Generate personalized product recommendations
 */
export async function getPersonalizedRecommendations(
  input: PersonalizationInput,
  allProducts: Product[]
): Promise<PersonalizedRecommendations> {
  // Check cache first
  const cacheKey = generateCacheKey(input);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Score all products
  const scoredProducts = allProducts.map(product => {
    const score = calculatePersonalizationScore(product, input);
    const matchScore = Math.round(score);
    const reasons = generateReasons(product, input, score);
    
    // Calculate savings if we have current appliance data
    let estimatedSavings: number | undefined;
    let paybackPeriod: number | undefined;
    
    const currentAppliance = input.currentAppliances?.find(
      a => a.category === product.category
    );
    
    if (currentAppliance) {
      const savings = calculateProductSavings(
        product,
        currentAppliance.powerConsumption,
        getTypicalUsageHours(product.category, input)
      );
      estimatedSavings = savings.annualSavings;
      paybackPeriod = savings.paybackPeriod;
    }

    return {
      product,
      matchScore,
      reasonsToConsider: reasons,
      estimatedSavings,
      paybackPeriod,
    };
  });

  // Sort by match score
  scoredProducts.sort((a, b) => b.matchScore - a.matchScore);

  // Get top recommendations overall
  const topRecommendations = scoredProducts.slice(0, 10);

  // Group by category
  const categoryRecommendations = new Map<ProductCategory, ProductRecommendation[]>();
  for (const rec of scoredProducts) {
    const category = rec.product.category;
    if (!categoryRecommendations.has(category)) {
      categoryRecommendations.set(category, []);
    }
    categoryRecommendations.get(category)!.push(rec);
  }

  // Determine seasonal priorities
  const seasonalPriorities = getSeasonalPriorities(input.currentSeason, input.userProfile.postcode || undefined);

  // Calculate total savings potential
  const estimatedTotalSavings = topRecommendations
    .filter(r => r.estimatedSavings)
    .reduce((sum, r) => sum + (r.estimatedSavings || 0), 0);

  const result: PersonalizedRecommendations = {
    topRecommendations,
    categoryRecommendations,
    seasonalPriorities,
    estimatedTotalSavings,
    cacheTimestamp: new Date().toISOString(),
  };

  // Cache result for 24 hours
  saveToCache(cacheKey, result, 24);

  return result;
}

/**
 * Calculate personalization score for a product (0-100)
 */
function calculatePersonalizationScore(
  product: Product,
  input: PersonalizationInput
): number {
  let score = 0;

  // Base score from product quality (40 points)
  score += (product.rating / 5) * 20; // Max 20 points
  score += (product.reliabilityScore / 100) * 20; // Max 20 points

  // Energy efficiency bonus (20 points)
  const energyScores = { 'A+++': 20, 'A++': 18, 'A+': 15, 'A': 12, 'B': 8, 'C': 4, 'D': 0 };
  score += energyScores[product.energyRating] || 0;

  // Household size relevance (10 points)
  score += getHouseholdSizeScore(product, input.userProfile.occupants || 2);

  // Tariff rate impact (10 points)
  if (input.billData?.electricityUsage?.rate) {
    const userRate = input.billData.electricityUsage.rate;
    if (userRate > 25 && product.powerConsumption < 500) {
      score += 10; // Prioritize low-power products for high tariffs
    } else if (userRate < 20) {
      score += 5;
    }
  }

  // Regional climate bonus (10 points)
  score += getRegionalScore(product, input.userProfile.postcode || undefined);

  // Seasonal relevance (10 points)
  score += getSeasonalScore(product, input.currentSeason);

  return Math.min(100, score);
}

/**
 * Get household size relevance score
 */
function getHouseholdSizeScore(product: Product, occupants: number): number {
  const { category } = product;

  // Large households benefit more from certain products
  if (occupants >= 4) {
    if (['washing-machines', 'tumble-dryers', 'kitchen-efficiency'].includes(category)) {
      return 10;
    }
  }

  // Small households benefit from different products
  if (occupants <= 2) {
    if (['dehumidifiers', 'led-lighting', 'smart-plugs'].includes(category)) {
      return 10;
    }
  }

  return 5;
}

/**
 * Get regional climate score
 */
function getRegionalScore(product: Product, region?: string): number {
  if (!region) return 5;

  const isNorth = region.toLowerCase().includes('scotland') || 
                  region.toLowerCase().includes('north');

  // Northern regions benefit more from heating products
  if (isNorth && product.category === 'heaters') {
    return 10;
  }

  // Southern regions benefit from dehumidifiers
  if (!isNorth && product.category === 'dehumidifiers') {
    return 8;
  }

  return 5;
}

/**
 * Get seasonal relevance score
 */
function getSeasonalScore(product: Product, season: 'winter' | 'spring' | 'summer' | 'autumn'): number {
  const { category } = product;

  if (season === 'winter') {
    if (category === 'heaters') return 10;
    if (category === 'insulation') return 8;
  }

  if (season === 'summer') {
    if (category === 'dehumidifiers') return 8;
    if (category === 'led-lighting') return 6;
  }

  if (season === 'spring' || season === 'autumn') {
    if (category === 'washing-machines') return 6;
    if (category === 'tumble-dryers') return 6;
  }

  return 5;
}

/**
 * Generate reasons why user should consider this product
 */
function generateReasons(
  product: Product,
  input: PersonalizationInput,
  score: number
): string[] {
  const reasons: string[] = [];

  // Energy efficiency
  if (['A+++', 'A++', 'A+'].includes(product.energyRating)) {
    reasons.push(`Excellent ${product.energyRating} energy rating - saves £${product.annualRunningCost || 50}/year`);
  }

  // High rating
  if (product.rating >= 4.5) {
    reasons.push(`Highly rated (${product.rating}★) by ${product.reviewCount.toLocaleString()} customers`);
  }

  // Reliability
  if (product.reliabilityScore >= 85) {
    reasons.push(`Very reliable (${product.reliabilityScore}% reliability score)`);
  }

  // Tariff-specific
  if (input.billData?.electricityUsage?.rate && input.billData.electricityUsage.rate > 25) {
    if (product.powerConsumption < 500) {
      reasons.push(`Low power consumption ideal for your high tariff rate`);
    }
  }

  // Household size
  const occupants = input.userProfile.occupants || 2;
  if (occupants >= 4 && ['washing-machines', 'kitchen-efficiency'].includes(product.category)) {
    reasons.push(`Perfect for families of ${occupants}`);
  }

  // Seasonal
  if (input.currentSeason === 'winter' && product.category === 'heaters') {
    reasons.push(`Essential for winter heating efficiency`);
  }

  // Price value
  if (product.tier === 'budget') {
    reasons.push(`Best value option in ${product.category}`);
  }

  // Trending
  if (product.ratingTrend === 'rising') {
    reasons.push(`Rising popularity - trending product`);
  }

  return reasons.slice(0, 4); // Max 4 reasons
}

/**
 * Get typical usage hours per day for product category
 */
function getTypicalUsageHours(category: ProductCategory, input: PersonalizationInput): number {
  const occupants = input.userProfile.occupants || 2;

  const usageMap: Record<ProductCategory, number> = {
    'heaters': 8, // 8 hours/day in winter
    'washing-machines': 1, // 1 hour/day
    'tumble-dryers': 0.5, // 30 min/day
    'dehumidifiers': 12, // 12 hours/day
    'led-lighting': 6, // 6 hours/day
    'smart-plugs': 0.1, // Minimal self-consumption
    'insulation': 0, // No power consumption
    'kitchen-efficiency': 1, // 1 hour/day
  };

  let baseHours = usageMap[category] || 2;

  // Adjust for household size
  if (['washing-machines', 'tumble-dryers', 'kitchen-efficiency'].includes(category)) {
    baseHours *= (occupants / 2); // Scale with household size
  }

  return baseHours;
}

/**
 * Get seasonal priorities for categories
 */
function getSeasonalPriorities(
  season: 'winter' | 'spring' | 'summer' | 'autumn',
  region?: string
): ProductCategory[] {
  if (season === 'winter') {
    return ['heaters', 'insulation', 'smart-plugs', 'led-lighting'];
  }

  if (season === 'summer') {
    return ['dehumidifiers', 'led-lighting', 'smart-plugs', 'kitchen-efficiency'];
  }

  // Spring/Autumn
  return ['washing-machines', 'tumble-dryers', 'kitchen-efficiency', 'led-lighting'];
}

/**
 * Get current season from date
 */
export function getCurrentSeason(): 'winter' | 'spring' | 'summer' | 'autumn' {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

/**
 * Cache management
 */
const recommendationCache = new Map<string, { data: PersonalizedRecommendations; expires: number }>();

function generateCacheKey(input: PersonalizationInput): string {
  return `${input.userProfile.uid}_${input.currentSeason}_${input.userProfile.occupants}_${input.userProfile.postcode || 'uk'}`;
}

function getFromCache(key: string): PersonalizedRecommendations | null {
  const cached = recommendationCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  recommendationCache.delete(key);
  return null;
}

function saveToCache(key: string, data: PersonalizedRecommendations, hoursValid: number): void {
  const expires = Date.now() + (hoursValid * 60 * 60 * 1000);
  recommendationCache.set(key, { data, expires });
}

/**
 * Clear cache (call when user updates profile)
 */
export function clearRecommendationCache(userId: string): void {
  for (const [key] of recommendationCache) {
    if (key.startsWith(userId)) {
      recommendationCache.delete(key);
    }
  }
}

/**
 * Clean expired cache entries (run periodically)
 */
export function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of recommendationCache) {
    if (value.expires <= now) {
      recommendationCache.delete(key);
    }
  }
}
