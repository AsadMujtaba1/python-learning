/**
 * ENERGY MODEL - Complete calculation and analysis logic
 * 
 * This file contains all the core energy estimation, heating load calculations,
 * cost predictions, and saving recommendations as per specification.
 */

import { UserHomeData } from '@/types';

// ============================
// 1. BASE HOUSEHOLD ENERGY CONSUMPTION MODEL
// ============================

/**
 * Calculate baseline household energy consumption in kWh per day
 * Based on home type and number of occupants
 */
export function calculateBaseConsumption(homeType: string, occupants: number): number {
  // Base consumption by home type (kWh/day)
  const baseConsumption: Record<string, number> = {
    flat: 8.5,
    terraced: 11.0,
    'semi-detached': 13.5,
    detached: 16.0,
  };

  const base = baseConsumption[homeType] || 11.0;
  
  // Add 1.2 kWh per additional person after first
  const occupantFactor = 1 + ((occupants - 1) * 0.12);
  
  return base * occupantFactor;
}

// ============================
// 2. HEATING LOAD ESTIMATION
// ============================

/**
 * Estimate heating load in kWh based on outdoor temperature and home characteristics
 * Uses degree-day method with 15.5°C base temperature
 */
export function calculateHeatingLoad(
  temperature: number,
  homeType: string,
  heatingType: string,
  insulationLevel: 'poor' | 'average' | 'good' = 'average'
): number {
  const baseTemp = 15.5; // UK standard base temperature
  
  if (temperature >= baseTemp) {
    return 0; // No heating needed
  }

  const degreeDays = baseTemp - temperature;

  // Heating demand factor by home type (kWh per degree-day)
  const heatingDemand: Record<string, number> = {
    flat: 0.8,
    terraced: 1.1,
    'semi-detached': 1.4,
    detached: 1.8,
  };

  // Insulation efficiency multiplier
  const insulationMultiplier = {
    poor: 1.4,
    average: 1.0,
    good: 0.7,
  };

  // Heating system efficiency
  const heatingEfficiency: Record<string, number> = {
    gas: 0.90,
    electricity: 1.0,
    'heat pump': 3.0, // COP of 3
    mixed: 0.95,
  };

  const baseDemand = heatingDemand[homeType] || 1.1;
  const efficiency = heatingEfficiency[heatingType] || 1.0;
  const insulation = insulationMultiplier[insulationLevel];

  // Calculate actual kWh needed
  const heatingKWh = (degreeDays * baseDemand * insulation) / efficiency;

  return Math.max(0, heatingKWh);
}

// ============================
// 3. DAILY COST ESTIMATION
// ============================

/**
 * Calculate estimated daily energy cost in GBP
 * Includes heating, base electricity, and standing charges
 */
export function calculateDailyCost(
  baseConsumptionKWh: number,
  heatingKWh: number,
  heatingType: string,
  electricityRate: number = 0.28, // £/kWh - UK 2025 average
  gasRate: number = 0.07 // £/kWh - UK 2025 average
): {
  heatingCost: number;
  electricityCost: number;
  standingCharge: number;
  totalCost: number;
} {
  // Standing charges (£/day) by heating type
  const standingCharges: Record<string, number> = {
    gas: 0.53,
    electricity: 0.60,
    'heat pump': 0.60,
    mixed: 0.80, // Both gas and electricity
  };

  const standingCharge = standingCharges[heatingType] || 0.60;

  let heatingCost = 0;
  let electricityCost = baseConsumptionKWh * electricityRate;

  // Calculate heating cost based on heating type
  if (heatingType === 'gas') {
    heatingCost = heatingKWh * gasRate;
  } else if (heatingType === 'electricity' || heatingType === 'heat pump') {
    heatingCost = heatingKWh * electricityRate;
  } else if (heatingType === 'mixed') {
    // Assume 70% gas, 30% electric
    heatingCost = (heatingKWh * 0.7 * gasRate) + (heatingKWh * 0.3 * electricityRate);
  }

  const totalCost = heatingCost + electricityCost + standingCharge;

  return {
    heatingCost: Number(heatingCost.toFixed(2)),
    electricityCost: Number(electricityCost.toFixed(2)),
    standingCharge: Number(standingCharge.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
  };
}

// ============================
// 4. HEATING FORECAST FOR NEXT 24 HOURS
// ============================

/**
 * Generate heating cost forecast for next 24 hours based on temperature forecast
 */
export function generateHeatingForecast(
  temperatureForecast: number[],
  homeData: UserHomeData,
  heatingType: string
): Array<{ hour: number; temperature: number; heatingKWh: number; cost: number }> {
  const forecast = [];

  for (let i = 0; i < temperatureForecast.length; i++) {
    const temp = temperatureForecast[i];
    const heatingKWh = calculateHeatingLoad(temp, homeData.homeType, heatingType);
    const gasRate = 0.07;
    const electricityRate = 0.28;

    let cost = 0;
    if (heatingType === 'gas') {
      cost = heatingKWh * gasRate;
    } else if (heatingType === 'electricity' || heatingType === 'heat pump') {
      cost = heatingKWh * electricityRate;
    } else if (heatingType === 'mixed') {
      cost = (heatingKWh * 0.7 * gasRate) + (heatingKWh * 0.3 * electricityRate);
    }

    forecast.push({
      hour: i,
      temperature: Number(temp.toFixed(1)),
      heatingKWh: Number(heatingKWh.toFixed(2)),
      cost: Number(cost.toFixed(2)),
    });
  }

  return forecast;
}

// ============================
// 5. WEATHER IMPACT EXPLANATION
// ============================

/**
 * Generate human-readable weather impact explanation
 */
export function generateWeatherImpact(
  currentTemp: number,
  yesterdayTemp: number,
  currentCost: number,
  yesterdayCost: number
): {
  tempDiff: number;
  costDiff: number;
  percentageChange: number;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
} {
  const tempDiff = currentTemp - yesterdayTemp;
  const costDiff = currentCost - yesterdayCost;
  const percentageChange = yesterdayCost > 0 
    ? ((costDiff / yesterdayCost) * 100) 
    : 0;

  let explanation = '';
  let severity: 'low' | 'medium' | 'high' = 'low';

  if (Math.abs(tempDiff) < 2) {
    explanation = `Temperature is similar to yesterday (${tempDiff > 0 ? '+' : ''}${tempDiff.toFixed(1)}°C). Heating costs remain stable.`;
    severity = 'low';
  } else if (tempDiff < 0) {
    // Colder today
    explanation = `Today is ${Math.abs(tempDiff).toFixed(1)}°C colder than yesterday. Heating cost may increase by ${Math.abs(percentageChange).toFixed(0)}% (approx £${Math.abs(costDiff).toFixed(2)}).`;
    severity = Math.abs(tempDiff) > 5 ? 'high' : 'medium';
  } else {
    // Warmer today
    explanation = `Today is ${tempDiff.toFixed(1)}°C warmer than yesterday. Heating cost may decrease by ${Math.abs(percentageChange).toFixed(0)}% (approx £${Math.abs(costDiff).toFixed(2)} saving).`;
    severity = 'low';
  }

  return {
    tempDiff: Number(tempDiff.toFixed(1)),
    costDiff: Number(costDiff.toFixed(2)),
    percentageChange: Number(percentageChange.toFixed(1)),
    explanation,
    severity,
  };
}

// ============================
// 6. SAVING SUGGESTIONS
// ============================

/**
 * Generate personalized saving suggestions based on current conditions
 */
export function generateSavingSuggestions(
  homeData: UserHomeData,
  currentTemp: number,
  currentCost: number
): Array<{ tip: string; potentialSaving: number; category: string }> {
  const suggestions = [];

  // Thermostat adjustment tip
  if (currentTemp < 15) {
    suggestions.push({
      tip: 'Lowering thermostat by 1°C can save approximately £0.40 per day in heating costs.',
      potentialSaving: 0.40,
      category: 'heating',
    });
  }

  // Time-of-use tip
  if (homeData.heatingType === 'electricity' || homeData.heatingType === 'heat-pump') {
    suggestions.push({
      tip: 'Use high-energy appliances (washing machine, dishwasher) after 9 PM to benefit from off-peak rates.',
      potentialSaving: 0.25,
      category: 'timing',
    });
  }

  // Insulation recommendation
  if (homeData.homeType === 'detached' || homeData.homeType === 'semi-detached') {
    suggestions.push({
      tip: 'Insulation improvements (loft, cavity walls) could save £12-15 monthly on heating bills.',
      potentialSaving: 12.0,
      category: 'upgrade',
    });
  }

  // Draft proofing
  if (currentTemp < 10) {
    suggestions.push({
      tip: 'Simple draft proofing (door strips, window seals) can reduce heating costs by 10-15%.',
      potentialSaving: currentCost * 0.125,
      category: 'efficiency',
    });
  }

  // Smart heating tip
  suggestions.push({
    tip: 'Heating rooms individually instead of the whole house can save £8-10 per month.',
    potentialSaving: 9.0,
    category: 'behavior',
  });

  // Hot water tip
  if (homeData.heatingType === 'gas' || homeData.heatingType === 'mixed') {
    suggestions.push({
      tip: 'Reducing hot water temperature to 60°C saves energy without compromising comfort.',
      potentialSaving: 0.30,
      category: 'hot water',
    });
  }

  // Heat pump specific
  if (homeData.heatingType === 'heat-pump') {
    suggestions.push({
      tip: 'Heat pumps work best with constant low temperature. Avoid frequent on/off cycles.',
      potentialSaving: 0.50,
      category: 'heating',
    });
  }

  // Return top 4 suggestions sorted by potential saving
  return suggestions
    .sort((a, b) => b.potentialSaving - a.potentialSaving)
    .slice(0, 4)
    .map(s => ({
      ...s,
      potentialSaving: Number(s.potentialSaving.toFixed(2)),
    }));
}

// ============================
// 7. WEEKLY ANALYSIS
// ============================

/**
 * Calculate weekly energy totals and efficiency metrics
 */
export function calculateWeeklyAnalysis(
  dailyCosts: number[]
): {
  weeklyTotal: number;
  weekOnWeekChange: number;
  averageDailyCost: number;
  efficiencyScore: number;
  pattern: string;
} {
  const weeklyTotal = dailyCosts.reduce((sum, cost) => sum + cost, 0);
  const averageDailyCost = weeklyTotal / dailyCosts.length;

  // Calculate week-on-week change (if we have previous week data)
  // For now, use mock -5% improvement
  const weekOnWeekChange = -5;

  // Efficiency score (0-100) based on cost relative to UK average
  const ukAverageDailyElectric = 4.50; // £/day for average household
  const efficiencyScore = Math.max(0, Math.min(100, 
    ((ukAverageDailyElectric - averageDailyCost) / ukAverageDailyElectric) * 100 + 50
  ));

  // Detect pattern
  const firstHalf = dailyCosts.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = dailyCosts.slice(4).reduce((a, b) => a + b, 0) / 3;
  
  let pattern = 'Stable';
  if (secondHalf > firstHalf * 1.1) {
    pattern = 'Increasing - colder weather detected';
  } else if (secondHalf < firstHalf * 0.9) {
    pattern = 'Decreasing - warmer weather or better efficiency';
  }

  return {
    weeklyTotal: Number(weeklyTotal.toFixed(2)),
    weekOnWeekChange: Number(weekOnWeekChange.toFixed(1)),
    averageDailyCost: Number(averageDailyCost.toFixed(2)),
    efficiencyScore: Number(efficiencyScore.toFixed(0)),
    pattern,
  };
}

// ============================
// 8. MONTHLY PROJECTION
// ============================

/**
 * Project monthly bill and generate saving plan
 */
export function calculateMonthlyProjection(
  averageDailyCost: number,
  homeData: UserHomeData
): {
  projectedMonthlyBill: number;
  savingOpportunity: number;
  savingPlan: string[];
  tariffSwitchOpportunity: boolean;
  upgradeRecommendations: string[];
} {
  const projectedMonthlyBill = averageDailyCost * 30.5;

  // Estimate saving opportunity (10-20% typically achievable)
  const savingOpportunity = projectedMonthlyBill * 0.15;

  // Generate saving plan
  const savingPlan = [
    'Lower thermostat by 1°C to save £12/month',
    'Use timer controls to avoid heating empty rooms',
    'Switch to LED bulbs to save £5/month on electricity',
    'Wash clothes at 30°C instead of 40°C to save £8/month',
  ];

  // Check if tariff switch could help (if paying above UK average)
  const ukAverageMonthly = 140;
  const tariffSwitchOpportunity = projectedMonthlyBill > ukAverageMonthly * 1.1;

  // Upgrade recommendations
  const upgradeRecommendations = [];
  
  if (homeData.homeType === 'detached' || homeData.homeType === 'semi-detached') {
    upgradeRecommendations.push('Loft insulation upgrade (£400-600, saves £200/year)');
  }
  
  if (homeData.heatingType === 'gas' || homeData.heatingType === 'electricity') {
    upgradeRecommendations.push('Consider heat pump (£7,000 grant available, saves 30-50%)');
  }
  
  upgradeRecommendations.push('Smart thermostat (£150-250, saves 10-15%)');

  return {
    projectedMonthlyBill: Number(projectedMonthlyBill.toFixed(2)),
    savingOpportunity: Number(savingOpportunity.toFixed(2)),
    savingPlan,
    tariffSwitchOpportunity,
    upgradeRecommendations,
  };
}

// ============================
// 9. SWITCH RECOMMENDATION LOGIC
// ============================

/**
 * Compare current estimated cost vs available tariffs
 * Returns switch recommendation if savings > 10%
 */
export function checkTariffSwitchOpportunity(
  currentMonthlyBill: number,
  heatingType: string
): {
  shouldSwitch: boolean;
  currentEstimatedTariff: string;
  recommendedTariff: string;
  potentialMonthlySaving: number;
  confidence: 'high' | 'medium' | 'low';
} {
  // Mock tariff comparison (in real app, fetch from Ofgem API)
  const averageTariffCosts: Record<string, number> = {
    'Standard Variable': currentMonthlyBill,
    'Fixed 1 Year': currentMonthlyBill * 0.92,
    'Fixed 2 Year': currentMonthlyBill * 0.88,
    'Economy 7': heatingType === 'electricity' ? currentMonthlyBill * 0.85 : currentMonthlyBill,
  };

  const cheapestTariff = Object.entries(averageTariffCosts)
    .sort(([, a], [, b]) => a - b)[0];

  const potentialMonthlySaving = currentMonthlyBill - cheapestTariff[1];
  const savingPercentage = (potentialMonthlySaving / currentMonthlyBill) * 100;

  return {
    shouldSwitch: savingPercentage > 10,
    currentEstimatedTariff: 'Standard Variable',
    recommendedTariff: cheapestTariff[0],
    potentialMonthlySaving: Number(potentialMonthlySaving.toFixed(2)),
    confidence: savingPercentage > 15 ? 'high' : savingPercentage > 10 ? 'medium' : 'low',
  };
}
