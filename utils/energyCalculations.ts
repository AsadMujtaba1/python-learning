import { UserHomeData, EnergyCostData, ForecastData } from '@/types';
import type { UserSavingsProfile } from '@/types/UserSavingsProfile';

// Base energy costs (£ per day) - UK averages 2025
const BASE_COSTS = {
  flat: { gas: 2.5, electricity: 3.2, heatPump: 2.8, mixed: 3.0 },
  terraced: { gas: 3.2, electricity: 4.1, heatPump: 3.5, mixed: 3.8 },
  'semi-detached': { gas: 4.0, electricity: 5.2, heatPump: 4.4, mixed: 4.8 },
  detached: { gas: 5.5, electricity: 7.0, heatPump: 6.0, mixed: 6.5 },
};

// Occupant multiplier
const OCCUPANT_MULTIPLIER = 0.15; // 15% increase per additional person

/**
 * Calculate daily energy costs based on user home data
 */
export function calculateEnergyCost(homeData: UserHomeData | UserSavingsProfile): EnergyCostData {
  // Accepts either legacy UserHomeData or canonical UserSavingsProfile
  let homeType, heatingType, occupants;
  if ((homeData as any).version === 1 && (homeData as any).household) {
    homeType = (homeData as any).household.homeType;
    heatingType = (homeData as any).household.heatingType;
    occupants = (homeData as any).household.occupants;
  } else {
    homeType = (homeData as any).homeType;
    heatingType = (homeData as any).heatingType;
    occupants = (homeData as any).occupants;
  }
  const heatingTypeKey = heatingType === 'heat-pump' ? 'heatPump' : heatingType;
  const baseCost = BASE_COSTS[homeType][heatingTypeKey as keyof typeof BASE_COSTS.flat];
  // Adjust for occupants (1 person = base, each additional adds 15%)
  const occupantFactor = 1 + ((occupants - 1) * OCCUPANT_MULTIPLIER);
  const dailyCost = baseCost * occupantFactor;
  // Calculate breakdown
  const heatingPortion = heatingType === 'electricity' ? 0.35 : 0.55;
  const electricityPortion = heatingType === 'gas' ? 0.30 : 0.50;
  return {
    dailyCost: Number(dailyCost.toFixed(2)),
    monthlyCost: Number((dailyCost * 30).toFixed(2)),
    yearlyEstimate: Number((dailyCost * 365).toFixed(2)),
    breakdown: {
      heating: Number((dailyCost * heatingPortion).toFixed(2)),
      electricity: Number((dailyCost * electricityPortion).toFixed(2)),
      other: Number((dailyCost * (1 - heatingPortion - electricityPortion)).toFixed(2)),
    },
  };
}

/**
 * Generate 7-day heating cost forecast based on temperature
 */
export function generateForecast(baseData: UserHomeData | UserSavingsProfile, currentTemp: number = 12): ForecastData[] {
  const baseCost = calculateEnergyCost(baseData).dailyCost;
  const forecast: ForecastData[] = [];
  for (let i = 0; i < 7; i++) {
    // Simulate temperature variation
    const temp = currentTemp + (Math.random() * 4 - 2);
    // Cost increases as temperature drops
    const tempFactor = temp < 15 ? 1 + ((15 - temp) * 0.08) : 1;
    const estimatedCost = baseCost * tempFactor;
    const date = new Date();
    date.setDate(date.getDate() + i);
    forecast.push({
      date: date.toISOString().split('T')[0],
      estimatedCost: Number(estimatedCost.toFixed(2)),
      temperature: Number(temp.toFixed(1)),
    });
  }
  return forecast;
}

/**
 * Calculate weather impact on energy usage
 */
export function calculateWeatherImpact(temperature: number): {
  impact: 'low' | 'medium' | 'high';
  description: string;
  multiplier: number;
} {
  if (temperature >= 15) {
    return {
      impact: 'low',
      description: 'Mild weather - minimal heating needed',
      multiplier: 1.0,
    };
  } else if (temperature >= 10) {
    return {
      impact: 'medium',
      description: 'Cool weather - moderate heating usage',
      multiplier: 1.3,
    };
  } else {
    return {
      impact: 'high',
      description: 'Cold weather - high heating usage expected',
      multiplier: 1.6,
    };
  }
}
