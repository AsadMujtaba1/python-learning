/**
 * INTELLIGENT RECOMMENDATION ENGINE
 * 
 * Generates personalized, context-aware savings recommendations
 * using rule-based AI and pattern analysis.
 * 
 * @module lib/calculations/recommendationEngine
 */

import { SAVINGS, HEATING, UK_AVERAGES } from '@/lib/utils/constants';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatting';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  potentialSaving: number; // £/month
  savingPercentage: number; // 0-100
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'behavior' | 'upgrade' | 'tariff' | 'timing' | 'efficiency';
  priority: number; // 1-10 (higher = more important)
  upfrontCost: number; // £
  paybackMonths: number; // months
  actions: string[];
  confidence: 'high' | 'medium' | 'low';
  tags: string[];
}

export interface UserProfile {
  homeType: string;
  heatingType: string;
  occupants: number;
  constructionYear?: number;
  currentMonthlyCost: number;
  averageTemperature: number;
  postcode: string;
}

/**
 * Generate all applicable recommendations
 */
export function generateRecommendations(
  profile: UserProfile,
  options: {
    includeUpgrades?: boolean;
    maxUpfrontCost?: number;
    maxPaybackMonths?: number;
  } = {}
): Recommendation[] {
  const {
    includeUpgrades = true,
    maxUpfrontCost = 10000,
    maxPaybackMonths = 60,
  } = options;

  const recommendations: Recommendation[] = [];

  // Add behavioral recommendations (always applicable)
  recommendations.push(...getBehavioralRecommendations(profile));

  // Add tariff recommendations
  recommendations.push(...getTariffRecommendations(profile));

  // Add efficiency recommendations
  recommendations.push(...getEfficiencyRecommendations(profile));

  // Add upgrade recommendations (if enabled)
  if (includeUpgrades) {
    recommendations.push(...getUpgradeRecommendations(profile, maxUpfrontCost));
  }

  // Filter by payback period
  const filtered = recommendations.filter(r => r.paybackMonths <= maxPaybackMonths);

  // Sort by priority (higher first)
  return filtered.sort((a, b) => b.priority - a.priority);
}

/**
 * Behavioral recommendations (zero cost, immediate impact)
 */
function getBehavioralRecommendations(profile: UserProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Thermostat adjustment
  if (profile.averageTemperature < 15) {
    const saving = profile.currentMonthlyCost * SAVINGS.THERMOSTAT_1C_REDUCTION;
    recommendations.push({
      id: 'thermostat-1c',
      title: 'Lower thermostat by 1°C',
      description: 'Reducing your thermostat from 21°C to 20°C can save 10% on heating costs without noticeable comfort loss.',
      potentialSaving: saving,
      savingPercentage: SAVINGS.THERMOSTAT_1C_REDUCTION * 100,
      difficulty: 'easy',
      category: 'behavior',
      priority: 9,
      upfrontCost: 0,
      paybackMonths: 0,
      actions: [
        'Turn your thermostat down by 1°C',
        'Wait 1 week to adjust to the new temperature',
        'Monitor your comfort level',
        'Track your energy bills',
      ],
      confidence: 'high',
      tags: ['heating', 'instant', 'no-cost'],
    });
  }

  // Heating schedule optimization
  recommendations.push({
    id: 'heating-schedule',
    title: 'Optimize heating schedule',
    description: 'Heat only when you\'re home. Avoid heating empty rooms and reduce overnight heating.',
    potentialSaving: profile.currentMonthlyCost * 0.15,
    savingPercentage: 15,
    difficulty: 'easy',
    category: 'timing',
    priority: 8,
    upfrontCost: 0,
    paybackMonths: 0,
    actions: [
      'Set heating to turn on 30 min before you wake up',
      'Reduce temperature by 2-3°C overnight',
      'Turn off heating in unused rooms',
      'Use a timer or smart thermostat',
    ],
    confidence: 'high',
    tags: ['heating', 'scheduling', 'no-cost'],
  });

  // Layer up
  recommendations.push({
    id: 'layer-clothing',
    title: 'Wear warmer clothing indoors',
    description: 'Adding a sweater can make you comfortable at 19°C instead of 21°C, saving significantly on heating.',
    potentialSaving: profile.currentMonthlyCost * 0.10,
    savingPercentage: 10,
    difficulty: 'easy',
    category: 'behavior',
    priority: 6,
    upfrontCost: 0,
    paybackMonths: 0,
    actions: [
      'Wear layers (thermal base layer + sweater)',
      'Use blankets when sitting',
      'Wear slippers or warm socks',
    ],
    confidence: 'medium',
    tags: ['heating', 'comfort', 'no-cost'],
  });

  // Appliance timing
  if (profile.heatingType === 'electricity' || profile.heatingType === 'heat-pump') {
    recommendations.push({
      id: 'off-peak-timing',
      title: 'Use appliances during off-peak hours',
      description: 'Run washing machine, dishwasher, and charge devices after 9 PM to benefit from cheaper electricity rates.',
      potentialSaving: profile.currentMonthlyCost * 0.08,
      savingPercentage: 8,
      difficulty: 'easy',
      category: 'timing',
      priority: 7,
      upfrontCost: 0,
      paybackMonths: 0,
      actions: [
        'Run dishwasher after 9 PM',
        'Do laundry during off-peak times',
        'Charge devices overnight',
        'Use delay start features',
      ],
      confidence: 'high',
      tags: ['electricity', 'timing', 'no-cost'],
    });
  }

  // Curtains and blinds
  recommendations.push({
    id: 'curtains-strategy',
    title: 'Smart curtain management',
    description: 'Close curtains at dusk to retain heat, open during sunny days for passive solar gain.',
    potentialSaving: profile.currentMonthlyCost * 0.05,
    savingPercentage: 5,
    difficulty: 'easy',
    category: 'behavior',
    priority: 5,
    upfrontCost: 0,
    paybackMonths: 0,
    actions: [
      'Close curtains and blinds before sunset',
      'Open curtains on sunny south-facing windows',
      'Use thick curtains in winter',
    ],
    confidence: 'medium',
    tags: ['heating', 'insulation', 'no-cost'],
  });

  return recommendations;
}

/**
 * Tariff switching recommendations
 */
function getTariffRecommendations(profile: UserProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Fixed tariff
  if (profile.currentMonthlyCost > UK_AVERAGES.MONTHLY_DUAL * 1.05) {
    recommendations.push({
      id: 'switch-fixed-tariff',
      title: 'Switch to fixed-rate tariff',
      description: 'Fixed tariffs can save 8-12% compared to standard variable rates, with price protection for 1-2 years.',
      potentialSaving: profile.currentMonthlyCost * 0.10,
      savingPercentage: 10,
      difficulty: 'easy',
      category: 'tariff',
      priority: 8,
      upfrontCost: 0,
      paybackMonths: 0,
      actions: [
        'Compare tariffs on Ofgem-accredited sites',
        'Check exit fees on current tariff',
        'Switch online (takes 3 weeks)',
        'Set reminder to review in 12 months',
      ],
      confidence: 'high',
      tags: ['tariff', 'switching', 'no-cost'],
    });
  }

  // Economy 7
  if (profile.heatingType === 'electricity' && profile.occupants >= 2) {
    recommendations.push({
      id: 'economy-7-tariff',
      title: 'Consider Economy 7 tariff',
      description: 'If you can shift usage to nighttime (charging EV, storage heaters), Economy 7 offers cheaper overnight rates.',
      potentialSaving: profile.currentMonthlyCost * 0.12,
      savingPercentage: 12,
      difficulty: 'medium',
      category: 'tariff',
      priority: 7,
      upfrontCost: 0,
      paybackMonths: 0,
      actions: [
        'Track your current usage pattern',
        'Calculate if you can shift 40%+ to overnight',
        'Compare Economy 7 rates with current tariff',
        'Request smart meter if needed',
      ],
      confidence: 'medium',
      tags: ['tariff', 'electricity', 'timing'],
    });
  }

  return recommendations;
}

/**
 * Efficiency recommendations (low-cost improvements)
 */
function getEfficiencyRecommendations(profile: UserProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Draft proofing
  if (profile.constructionYear && profile.constructionYear < 2000) {
    recommendations.push({
      id: 'draft-proofing',
      title: 'Draft proofing',
      description: 'Seal gaps around doors and windows with draft excluders to prevent heat loss.',
      potentialSaving: profile.currentMonthlyCost * SAVINGS.DRAFT_PROOFING,
      savingPercentage: SAVINGS.DRAFT_PROOFING * 100,
      difficulty: 'easy',
      category: 'efficiency',
      priority: 8,
      upfrontCost: SAVINGS.COST_DRAFT_PROOFING,
      paybackMonths: (SAVINGS.COST_DRAFT_PROOFING / (profile.currentMonthlyCost * SAVINGS.DRAFT_PROOFING)),
      actions: [
        'Install door draft excluders (£15-30)',
        'Apply window sealing strips (£20-40)',
        'Fill gaps with expanding foam',
        'Install chimney balloons if unused',
      ],
      confidence: 'high',
      tags: ['insulation', 'diy', 'low-cost'],
    });
  }

  // Radiator reflectors
  if (profile.heatingType !== 'heat-pump') {
    recommendations.push({
      id: 'radiator-reflectors',
      title: 'Radiator reflector panels',
      description: 'Reflector panels behind radiators bounce heat back into the room instead of heating walls.',
      potentialSaving: profile.currentMonthlyCost * 0.05,
      savingPercentage: 5,
      difficulty: 'easy',
      category: 'efficiency',
      priority: 6,
      upfrontCost: 50,
      paybackMonths: 10,
      actions: [
        'Buy reflector panels (£5-10 per radiator)',
        'Install behind external wall radiators',
        'Ensure radiators are bled and clean',
      ],
      confidence: 'medium',
      tags: ['heating', 'diy', 'low-cost'],
    });
  }

  // LED lighting
  recommendations.push({
    id: 'led-lighting',
    title: 'Switch to LED bulbs',
    description: 'LED bulbs use 75% less energy than traditional bulbs and last 15 times longer.',
    potentialSaving: 5, // Fixed £5/month
    savingPercentage: SAVINGS.LED_LIGHTING * 100,
    difficulty: 'easy',
    category: 'efficiency',
    priority: 7,
    upfrontCost: 50, // 10 bulbs at £5 each
    paybackMonths: 10,
    actions: [
      'Replace most-used bulbs first',
      'Choose 2700K for warm white',
      'Buy dimmable LEDs if needed',
      'Dispose of old bulbs safely',
    ],
    confidence: 'high',
    tags: ['lighting', 'electricity', 'low-cost'],
  });

  return recommendations;
}

/**
 * Upgrade recommendations (significant investment)
 */
function getUpgradeRecommendations(profile: UserProfile, maxCost: number): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Smart thermostat
  if (profile.currentMonthlyCost > 100) {
    recommendations.push({
      id: 'smart-thermostat',
      title: 'Install smart thermostat',
      description: 'Smart thermostats learn your routine and optimize heating automatically, saving 10-15% on average.',
      potentialSaving: profile.currentMonthlyCost * SAVINGS.SMART_THERMOSTAT,
      savingPercentage: SAVINGS.SMART_THERMOSTAT * 100,
      difficulty: 'medium',
      category: 'upgrade',
      priority: 8,
      upfrontCost: SAVINGS.COST_SMART_THERMOSTAT,
      paybackMonths: SAVINGS.PAYBACK_SMART_THERMOSTAT * 12,
      actions: [
        'Research compatible thermostats (Nest, Hive, Tado)',
        'Check heating system compatibility',
        'Book professional installation (£50-100)',
        'Set up app and optimize settings',
      ],
      confidence: 'high',
      tags: ['heating', 'smart-home', 'professional-install'],
    });
  }

  // Loft insulation
  if ((profile.homeType === 'semi-detached' || profile.homeType === 'detached') && 
      profile.constructionYear && profile.constructionYear < 2000) {
    if (SAVINGS.COST_LOFT_INSULATION <= maxCost) {
      recommendations.push({
        id: 'loft-insulation',
        title: 'Upgrade loft insulation',
        description: '270mm loft insulation can save £200/year. Government grants may be available.',
        potentialSaving: profile.currentMonthlyCost * 0.15,
        savingPercentage: 15,
        difficulty: 'medium',
        category: 'upgrade',
        priority: 9,
        upfrontCost: SAVINGS.COST_LOFT_INSULATION,
        paybackMonths: SAVINGS.PAYBACK_INSULATION * 12,
        actions: [
          'Check current insulation depth',
          'Get quotes from 3+ installers',
          'Apply for ECO4 grant if eligible',
          'Ensure proper ventilation',
        ],
        confidence: 'high',
        tags: ['insulation', 'grant-available', 'professional-install'],
      });
    }
  }

  // Cavity wall insulation
  if (profile.homeType !== 'flat' && profile.constructionYear && 
      profile.constructionYear >= 1920 && profile.constructionYear < 1990) {
    if (SAVINGS.COST_CAVITY_WALL <= maxCost) {
      recommendations.push({
        id: 'cavity-wall-insulation',
        title: 'Cavity wall insulation',
        description: 'Fill cavity walls with insulation to save £150-200/year on heating.',
        potentialSaving: profile.currentMonthlyCost * 0.20,
        savingPercentage: 20,
        difficulty: 'hard',
        category: 'upgrade',
        priority: 9,
        upfrontCost: SAVINGS.COST_CAVITY_WALL,
        paybackMonths: 36,
        actions: [
          'Check if walls have cavities (1920-1990 builds)',
          'Get borescope survey (free from installers)',
          'Apply for ECO4 funding',
          'Book professional installation',
        ],
        confidence: 'high',
        tags: ['insulation', 'grant-available', 'professional-install'],
      });
    }
  }

  // Heat pump
  if ((profile.heatingType === 'gas' || profile.heatingType === 'electricity') &&
      profile.currentMonthlyCost > 120) {
    if (SAVINGS.COST_HEAT_PUMP <= maxCost) {
      recommendations.push({
        id: 'heat-pump-upgrade',
        title: 'Upgrade to heat pump',
        description: 'Heat pumps are 300% efficient. £7,500 BUS grant available, saving 40-50% on heating costs.',
        potentialSaving: profile.currentMonthlyCost * SAVINGS.HEAT_PUMP_UPGRADE,
        savingPercentage: SAVINGS.HEAT_PUMP_UPGRADE * 100,
        difficulty: 'hard',
        category: 'upgrade',
        priority: 10,
        upfrontCost: SAVINGS.COST_HEAT_PUMP - 7500, // After BUS grant
        paybackMonths: SAVINGS.PAYBACK_HEAT_PUMP * 12,
        actions: [
          'Check eligibility for £7,500 BUS grant',
          'Get MCS-certified installer quotes',
          'Ensure adequate insulation first',
          'Consider air-source vs ground-source',
        ],
        confidence: 'medium',
        tags: ['heating', 'renewable', 'grant-available', 'professional-install'],
      });
    }
  }

  return recommendations.filter(r => r.upfrontCost <= maxCost);
}

/**
 * Get top N recommendations
 */
export function getTopRecommendations(
  profile: UserProfile,
  count: number = 3
): Recommendation[] {
  const all = generateRecommendations(profile);
  return all.slice(0, count);
}

/**
 * Calculate total potential savings
 */
export function calculateTotalSavingsPotential(
  profile: UserProfile
): {
  monthly: number;
  annual: number;
  percentage: number;
  topActions: string[];
} {
  const recommendations = generateRecommendations(profile, {
    includeUpgrades: true,
    maxUpfrontCost: 1000, // Only low-cost upgrades
    maxPaybackMonths: 24,
  });

  // Take top 5 recommendations
  const top5 = recommendations.slice(0, 5);
  const monthlySaving = top5.reduce((sum, r) => sum + r.potentialSaving, 0);

  return {
    monthly: Number(monthlySaving.toFixed(2)),
    annual: Number((monthlySaving * 12).toFixed(2)),
    percentage: Number(((monthlySaving / profile.currentMonthlyCost) * 100).toFixed(1)),
    topActions: top5.map(r => r.title),
  };
}
