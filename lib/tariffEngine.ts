/**
 * ENERGY TARIFF RECOMMENDATION ENGINE
 * 
 * Compare energy tariffs and recommend best deals
 * Updates weekly via data refresh
 * 
 * @module lib/tariffEngine
 */

export interface EnergyTariff {
  id: string;
  supplier: string;
  tariffName: string;
  tariffType: 'fixed' | 'variable' | 'tracker';
  electricityRate: number; // pence per kWh
  gasRate: number; // pence per kWh
  standingChargeElectric: number; // pence per day
  standingChargeGas: number; // pence per day
  contractLength: number; // months (0 = variable)
  exitFee: number; // pounds
  greenEnergy: boolean;
  rating: number; // 1-5 stars
  affiliateLink?: string; // Placeholder for affiliate links
  lastUpdated: Date;
  region: string; // UK region
}

export interface TariffComparison {
  currentCost: number;
  recommendedTariff: EnergyTariff;
  estimatedSavings: number;
  savingsPercentage: number;
}

/**
 * Mock tariff database (in production, this would come from API/Firestore)
 * Updated weekly via automated data refresh
 */
const MOCK_TARIFFS: EnergyTariff[] = [
  {
    id: 'octopus-flexible-2024',
    supplier: 'Octopus Energy',
    tariffName: 'Flexible Octopus',
    tariffType: 'variable',
    electricityRate: 24.5,
    gasRate: 6.2,
    standingChargeElectric: 53.4,
    standingChargeGas: 28.8,
    contractLength: 0,
    exitFee: 0,
    greenEnergy: true,
    rating: 4.8,
    affiliateLink: '/tariff/octopus-flexible', // Placeholder
    lastUpdated: new Date('2024-12-01'),
    region: 'National',
  },
  {
    id: 'ovo-fixed-dec24',
    supplier: 'OVO Energy',
    tariffName: '2 Year Fixed',
    tariffType: 'fixed',
    electricityRate: 23.8,
    gasRate: 5.9,
    standingChargeElectric: 51.2,
    standingChargeGas: 27.5,
    contractLength: 24,
    exitFee: 50,
    greenEnergy: true,
    rating: 4.6,
    affiliateLink: '/tariff/ovo-fixed-2year',
    lastUpdated: new Date('2024-12-01'),
    region: 'National',
  },
  {
    id: 'bulb-variable-2024',
    supplier: 'Bulb',
    tariffName: 'Vari-Fair',
    tariffType: 'variable',
    electricityRate: 25.1,
    gasRate: 6.4,
    standingChargeElectric: 54.0,
    standingChargeGas: 29.2,
    contractLength: 0,
    exitFee: 0,
    greenEnergy: true,
    rating: 4.5,
    affiliateLink: '/tariff/bulb-varifair',
    lastUpdated: new Date('2024-12-01'),
    region: 'National',
  },
  {
    id: 'eon-fixed-1year',
    supplier: 'E.ON Next',
    tariffName: 'Next Online 1 Year Fixed',
    tariffType: 'fixed',
    electricityRate: 24.2,
    gasRate: 6.1,
    standingChargeElectric: 52.5,
    standingChargeGas: 28.0,
    contractLength: 12,
    exitFee: 30,
    greenEnergy: false,
    rating: 4.3,
    affiliateLink: '/tariff/eon-fixed-1year',
    lastUpdated: new Date('2024-12-01'),
    region: 'National',
  },
  {
    id: 'edf-blue-plus',
    supplier: 'EDF Energy',
    tariffName: 'Blue+ Price Promise',
    tariffType: 'variable',
    electricityRate: 25.8,
    gasRate: 6.6,
    standingChargeElectric: 55.0,
    standingChargeGas: 30.0,
    contractLength: 0,
    exitFee: 0,
    greenEnergy: false,
    rating: 4.1,
    affiliateLink: '/tariff/edf-blue-plus',
    lastUpdated: new Date('2024-12-01'),
    region: 'National',
  },
  {
    id: 'scottishpower-fixed',
    supplier: 'ScottishPower',
    tariffName: 'Fixed Energy Saver',
    tariffType: 'fixed',
    electricityRate: 23.5,
    gasRate: 5.8,
    standingChargeElectric: 50.8,
    standingChargeGas: 27.2,
    contractLength: 18,
    exitFee: 40,
    greenEnergy: true,
    rating: 4.4,
    affiliateLink: '/tariff/scottishpower-fixed',
    lastUpdated: new Date('2024-12-01'),
    region: 'Scotland',
  },
];

/**
 * Calculate annual cost for a tariff based on usage
 */
export function calculateTariffCost(
  tariff: EnergyTariff,
  annualElectricityKwh: number,
  annualGasKwh: number = 0
): number {
  const electricityCost = (annualElectricityKwh * tariff.electricityRate) / 100;
  const gasCost = (annualGasKwh * tariff.gasRate) / 100;
  const standingCharges = ((tariff.standingChargeElectric + tariff.standingChargeGas) * 365) / 100;
  
  return electricityCost + gasCost + standingCharges;
}

/**
 * Get top 3 recommended tariffs for user
 */
export function getRecommendedTariffs(
  currentAnnualCost: number,
  annualElectricityKwh: number,
  annualGasKwh: number = 0,
  preferGreen: boolean = false,
  region: string = 'National'
): TariffComparison[] {
  let tariffs = [...MOCK_TARIFFS];

  // Filter by region
  tariffs = tariffs.filter(t => t.region === 'National' || t.region === region);

  // Prioritize green energy if preferred
  if (preferGreen) {
    tariffs.sort((a, b) => {
      if (a.greenEnergy && !b.greenEnergy) return -1;
      if (!a.greenEnergy && b.greenEnergy) return 1;
      return 0;
    });
  }

  // Calculate costs and savings for each tariff
  const comparisons: TariffComparison[] = tariffs.map(tariff => {
    const estimatedCost = calculateTariffCost(tariff, annualElectricityKwh, annualGasKwh);
    const savings = currentAnnualCost - estimatedCost;
    const savingsPercentage = (savings / currentAnnualCost) * 100;

    return {
      currentCost: currentAnnualCost,
      recommendedTariff: tariff,
      estimatedSavings: savings,
      savingsPercentage,
    };
  });

  // Sort by savings (highest first)
  comparisons.sort((a, b) => b.estimatedSavings - a.estimatedSavings);

  // Return top 3
  return comparisons.slice(0, 3);
}

/**
 * Estimate annual usage from daily cost
 */
export function estimateAnnualUsage(
  dailyCost: number,
  homeType: 'flat' | 'terraced' | 'semi' | 'detached',
  occupants: number
): { electricityKwh: number; gasKwh: number } {
  // Average UK household uses 2,700 kWh electricity and 11,500 kWh gas per year
  // Adjust based on home type and occupants
  
  const baseElectricity = 2700;
  const baseGas = 11500;

  const homeMultiplier = {
    flat: 0.7,
    terraced: 0.9,
    semi: 1.0,
    detached: 1.3,
  };

  const occupantMultiplier = 0.8 + (occupants * 0.15);

  const electricityKwh = baseElectricity * homeMultiplier[homeType] * occupantMultiplier;
  const gasKwh = baseGas * homeMultiplier[homeType] * occupantMultiplier;

  return {
    electricityKwh: Math.round(electricityKwh),
    gasKwh: Math.round(gasKwh),
  };
}

/**
 * Get all available tariffs (for comparison page)
 * Uses REAL DATA from Ofgem and comparison sites
 */
export async function getAllTariffs(useRealData: boolean = true): Promise<EnergyTariff[]> {
  if (useRealData) {
    try {
      const { getRealTariffData } = await import('./realTariffDataService');
      const realTariffs = await getRealTariffData();
      if (realTariffs.length > 0) {
        console.log(`✅ Using REAL tariff data (${realTariffs.length} tariffs)`);
        return realTariffs;
      }
    } catch (error) {
      console.warn('Real tariff data fetch failed, using mock:', error);
    }
  }
  
  console.log('📦 Using mock tariff data (fallback)');
  return [...MOCK_TARIFFS].sort((a, b) => b.rating - a.rating);
}

/**
 * Get tariff by ID
 */
export function getTariffById(id: string): EnergyTariff | null {
  return MOCK_TARIFFS.find(t => t.id === id) || null;
}

/**
 * Weekly data refresh (would be automated in production)
 */
export async function refreshTariffData(): Promise<void> {
  // In production, this would:
  // 1. Fetch latest tariff data from energy APIs
  // 2. Update Firestore collection
  // 3. Cache results
  // 4. Log refresh timestamp
  
  console.log('Tariff data refresh triggered - would update from API');
}

/**
 * Check if tariff data is stale (older than 7 days)
 */
export function isTariffDataStale(): boolean {
  const oldestTariff = MOCK_TARIFFS.reduce((oldest, tariff) => 
    tariff.lastUpdated < oldest ? tariff.lastUpdated : oldest,
    MOCK_TARIFFS[0].lastUpdated
  );

  const daysSinceUpdate = Math.floor(
    (Date.now() - oldestTariff.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceUpdate > 7;
}
