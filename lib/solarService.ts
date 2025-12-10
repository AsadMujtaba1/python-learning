/**
 * Solar Panel Recommendation Service
 * Calculates solar panel system recommendations based on user inputs
 */

// UK Regional Sunlight Data (average annual kWh/kWp)
const SUNLIGHT_DATA: Record<string, number> = {
  'scotland': 850,
  'north-east': 900,
  'north-west': 900,
  'yorkshire': 950,
  'east-midlands': 975,
  'west-midlands': 950,
  'east': 1000,
  'london': 1050,
  'south-east': 1050,
  'south-west': 1000,
  'wales': 900,
  'northern-ireland': 850,
  'default': 950, // UK average
};

// Roof type efficiency factors
const ROOF_EFFICIENCY: Record<string, number> = {
  'south-facing': 1.0,
  'south-west': 0.95,
  'south-east': 0.95,
  'east-west': 0.85,
  'north-facing': 0.7,
  'flat': 0.9,
  'unknown': 0.9, // Conservative estimate
};

// System costs per kWp (2024 UK market prices)
const SYSTEM_COSTS = {
  budget: 1200, // £/kWp
  standard: 1400,
  premium: 1600,
};

// Battery costs
const BATTERY_COSTS = {
  small: 2500, // 5kWh
  medium: 4000, // 10kWh
  large: 6000, // 15kWh
};

export interface SolarInput {
  postcode: string;
  roofType?: 'south-facing' | 'south-west' | 'south-east' | 'east-west' | 'north-facing' | 'flat' | 'unknown';
  annualElectricityUsage: number; // kWh
  daytimeUsagePercentage?: number; // 0-100
  electricityRate: number; // pence per kWh
  feedInTariff?: number; // pence per kWh exported
  roofSpaceM2?: number; // square meters
}

export interface SolarRecommendation {
  systemSizeKw: number;
  panelCount: number;
  annualGenerationKwh: number;
  annualSavings: number;
  paybackYears: number;
  co2ReductionKg: number;
  selfConsumptionKwh: number;
  exportKwh: number;
  exportIncome: number;
  batteryRecommendation?: BatteryRecommendation;
  lifetimeSavings25Years: number;
  roiPercentage: number;
  options: {
    budget: SystemOption;
    standard: SystemOption;
    premium: SystemOption;
  };
  region: string;
  suitabilityScore: number; // 0-100
  warnings: string[];
}

export interface BatteryRecommendation {
  recommended: boolean;
  sizeKwh: number;
  cost: number;
  additionalSavings: number;
  paybackYears: number;
  reason: string;
}

export interface SystemOption {
  tier: 'budget' | 'standard' | 'premium';
  systemSizeKw: number;
  cost: number;
  panelCount: number;
  panelType: string;
  warranty: string;
  efficiency: string;
  annualGeneration: number;
  annualSavings: number;
  paybackYears: number;
  features: string[];
  affiliatePartners: AffiliatePartner[];
}

export interface AffiliatePartner {
  name: string;
  description: string;
  affiliateLink: string; // Placeholder
  rating: number;
  reviewCount: number;
  averageInstallTime: string;
}

export interface SavingsProjection {
  year: number;
  cumulativeSavings: number;
  annualGeneration: number;
  degradationFactor: number;
}

/**
 * Get region from postcode
 */
function getRegionFromPostcode(postcode: string): string {
  const area = postcode.toUpperCase().substring(0, 2);
  
  // Scotland
  if (['AB', 'DD', 'DG', 'EH', 'FK', 'G', 'HS', 'IV', 'KA', 'KW', 'KY', 'ML', 'PA', 'PH', 'TD', 'ZE'].some(p => area.startsWith(p))) {
    return 'scotland';
  }
  
  // London
  if (['E', 'EC', 'N', 'NW', 'SE', 'SW', 'W', 'WC'].some(p => area === p || area.startsWith(p))) {
    return 'london';
  }
  
  // South East
  if (['BN', 'BR', 'CR', 'CT', 'DA', 'GU', 'KT', 'ME', 'RH', 'SL', 'SM', 'TN', 'TW'].some(p => area.startsWith(p))) {
    return 'south-east';
  }
  
  // South West
  if (['BA', 'BH', 'BS', 'DT', 'EX', 'GL', 'PL', 'SP', 'TA', 'TQ', 'TR'].some(p => area.startsWith(p))) {
    return 'south-west';
  }
  
  // East
  if (['CB', 'CM', 'CO', 'IP', 'NR', 'PE', 'SG'].some(p => area.startsWith(p))) {
    return 'east';
  }
  
  // Wales
  if (['CF', 'CH', 'HR', 'LD', 'LL', 'NP', 'SA', 'SY'].some(p => area.startsWith(p))) {
    return 'wales';
  }
  
  // North East
  if (['DH', 'DL', 'NE', 'SR', 'TS'].some(p => area.startsWith(p))) {
    return 'north-east';
  }
  
  // Yorkshire
  if (['BD', 'DN', 'HD', 'HG', 'HU', 'HX', 'LS', 'S', 'WF', 'YO'].some(p => area.startsWith(p))) {
    return 'yorkshire';
  }
  
  // North West
  if (['BB', 'BL', 'CA', 'FY', 'L', 'LA', 'M', 'OL', 'PR', 'SK', 'WA', 'WN'].some(p => area.startsWith(p))) {
    return 'north-west';
  }
  
  // East Midlands
  if (['DE', 'LE', 'LN', 'NG', 'NN'].some(p => area.startsWith(p))) {
    return 'east-midlands';
  }
  
  // West Midlands
  if (['B', 'CV', 'DY', 'ST', 'TF', 'WR', 'WS', 'WV'].some(p => area.startsWith(p))) {
    return 'west-midlands';
  }
  
  // Northern Ireland
  if (['BT'].some(p => area.startsWith(p))) {
    return 'northern-ireland';
  }
  
  return 'default';
}

/**
 * Calculate optimal system size based on usage
 */
function calculateOptimalSystemSize(annualUsage: number, region: string, roofSpaceM2?: number): number {
  // Rule of thumb: 1kW system generates ~950kWh/year in UK
  const sunlightKwhPerKwp = SUNLIGHT_DATA[region] || SUNLIGHT_DATA['default'];
  
  // Aim for 80-100% of annual usage
  let optimalSize = (annualUsage * 0.9) / sunlightKwhPerKwp;
  
  // Round to nearest 0.5kW
  optimalSize = Math.round(optimalSize * 2) / 2;
  
  // Minimum 2kW, maximum 10kW for residential
  optimalSize = Math.max(2, Math.min(10, optimalSize));
  
  // Check roof space constraint (assume 6m² per kW)
  if (roofSpaceM2) {
    const maxSizeByRoof = roofSpaceM2 / 6;
    optimalSize = Math.min(optimalSize, maxSizeByRoof);
  }
  
  return optimalSize;
}

/**
 * Calculate battery recommendation
 */
function calculateBatteryRecommendation(
  input: SolarInput,
  annualGeneration: number,
  selfConsumption: number
): BatteryRecommendation {
  const daytimeUsage = input.daytimeUsagePercentage || 40;
  const exportKwh = annualGeneration - selfConsumption;
  
  // If less than 50% daytime usage, battery is beneficial
  if (daytimeUsage < 50 && exportKwh > 1000) {
    const dailyExport = exportKwh / 365;
    const recommendedSize = Math.min(15, Math.ceil(dailyExport * 1.5));
    
    let cost = BATTERY_COSTS.small;
    if (recommendedSize > 10) cost = BATTERY_COSTS.large;
    else if (recommendedSize > 5) cost = BATTERY_COSTS.medium;
    
    // Battery can store ~70% of excess generation
    const additionalStoredKwh = exportKwh * 0.7;
    const additionalSavings = additionalStoredKwh * (input.electricityRate / 100) - 
                               additionalStoredKwh * ((input.feedInTariff || 5) / 100);
    
    const paybackYears = cost / additionalSavings;
    
    return {
      recommended: true,
      sizeKwh: recommendedSize,
      cost,
      additionalSavings,
      paybackYears: Math.round(paybackYears * 10) / 10,
      reason: daytimeUsage < 30 
        ? `Your low daytime usage (${daytimeUsage}%) means you're exporting a lot of energy. A battery could store this for evening use.`
        : `With ${daytimeUsage}% daytime usage, a battery could increase your self-consumption and savings.`
    };
  }
  
  return {
    recommended: false,
    sizeKwh: 0,
    cost: 0,
    additionalSavings: 0,
    paybackYears: 0,
    reason: daytimeUsage >= 60 
      ? `Your high daytime usage (${daytimeUsage}%) means you're already using most of your solar generation directly.`
      : `At your current export rates, a battery may not be cost-effective yet.`
  };
}

/**
 * Calculate suitability score
 */
function calculateSuitabilityScore(
  region: string,
  roofType: string,
  annualUsage: number,
  paybackYears: number
): number {
  let score = 50; // Base score
  
  // Sunlight factor (0-25 points)
  const sunlight = SUNLIGHT_DATA[region] || SUNLIGHT_DATA['default'];
  score += ((sunlight - 850) / 200) * 25;
  
  // Roof factor (0-15 points)
  const roofEfficiency = ROOF_EFFICIENCY[roofType] || ROOF_EFFICIENCY['unknown'];
  score += roofEfficiency * 15;
  
  // Usage factor (0-10 points)
  if (annualUsage > 3000) score += 10;
  else if (annualUsage > 2000) score += 5;
  
  // Payback factor (0-10 points)
  if (paybackYears < 8) score += 10;
  else if (paybackYears < 12) score += 5;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Generate system options (budget, standard, premium)
 */
function generateSystemOptions(
  systemSizeKw: number,
  region: string,
  roofType: string,
  electricityRate: number,
  feedInTariff: number,
  daytimeUsagePercentage: number
): { budget: SystemOption; standard: SystemOption; premium: SystemOption } {
  const roofEfficiency = ROOF_EFFICIENCY[roofType] || ROOF_EFFICIENCY['unknown'];
  const sunlightKwhPerKwp = SUNLIGHT_DATA[region] || SUNLIGHT_DATA['default'];
  
  const createOption = (tier: 'budget' | 'standard' | 'premium'): SystemOption => {
    const efficiencyMultiplier = tier === 'premium' ? 1.1 : tier === 'standard' ? 1.0 : 0.95;
    const cost = systemSizeKw * SYSTEM_COSTS[tier];
    const panelCount = Math.ceil(systemSizeKw / 0.4); // Assume 400W panels
    
    const annualGeneration = systemSizeKw * sunlightKwhPerKwp * roofEfficiency * efficiencyMultiplier;
    const selfConsumption = annualGeneration * (daytimeUsagePercentage / 100);
    const exportKwh = annualGeneration - selfConsumption;
    
    const selfConsumptionSavings = selfConsumption * (electricityRate / 100);
    const exportIncome = exportKwh * (feedInTariff / 100);
    const annualSavings = selfConsumptionSavings + exportIncome;
    
    const paybackYears = cost / annualSavings;
    
    const features = {
      budget: [
        'Tier 1 polycrystalline panels',
        '16-18% efficiency',
        '10-year product warranty',
        '25-year performance warranty',
        'Standard inverter',
        'Basic monitoring app'
      ],
      standard: [
        'Tier 1 monocrystalline panels',
        '19-21% efficiency',
        '12-year product warranty',
        '25-year performance warranty',
        'Smart inverter with optimization',
        'Advanced monitoring with AI insights'
      ],
      premium: [
        'Premium monocrystalline panels (Sunpower/LG)',
        '21-23% efficiency',
        '25-year product warranty',
        '25-year performance warranty',
        'Premium inverter with battery-ready',
        'Premium monitoring with energy management',
        'All-black aesthetics'
      ]
    };
    
    const affiliatePartners: AffiliatePartner[] = [
      {
        name: 'Octopus Energy Solar',
        description: 'UK leading renewable installer with excellent customer service',
        affiliateLink: '/partners/octopus-solar',
        rating: 4.7,
        reviewCount: 3421,
        averageInstallTime: '4-6 weeks'
      },
      {
        name: 'British Gas Solar',
        description: 'Trusted brand with nationwide coverage',
        affiliateLink: '/partners/british-gas-solar',
        rating: 4.4,
        reviewCount: 2156,
        averageInstallTime: '6-8 weeks'
      },
      {
        name: 'EvoEnergy',
        description: 'Specialist solar installer with competitive pricing',
        affiliateLink: '/partners/evo-energy',
        rating: 4.6,
        reviewCount: 1893,
        averageInstallTime: '3-5 weeks'
      }
    ];
    
    return {
      tier,
      systemSizeKw,
      cost: Math.round(cost),
      panelCount,
      panelType: tier === 'premium' ? 'Premium Monocrystalline' : tier === 'standard' ? 'Monocrystalline' : 'Polycrystalline',
      warranty: tier === 'premium' ? '25 years full' : tier === 'standard' ? '12 years product' : '10 years product',
      efficiency: tier === 'premium' ? '21-23%' : tier === 'standard' ? '19-21%' : '16-18%',
      annualGeneration: Math.round(annualGeneration),
      annualSavings: Math.round(annualSavings),
      paybackYears: Math.round(paybackYears * 10) / 10,
      features: features[tier],
      affiliatePartners
    };
  };
  
  return {
    budget: createOption('budget'),
    standard: createOption('standard'),
    premium: createOption('premium')
  };
}

/**
 * Generate savings projection over 25 years
 */
export function generateSavingsProjection(
  annualSavings: number,
  systemCost: number,
  withBattery: boolean = false,
  batteryCost: number = 0
): SavingsProjection[] {
  const projections: SavingsProjection[] = [];
  const totalCost = systemCost + (withBattery ? batteryCost : 0);
  let cumulativeSavings = -totalCost; // Start with negative (initial investment)
  
  // Panel degradation: 0.5% per year
  // Electricity price increase: 3% per year (conservative)
  
  for (let year = 1; year <= 25; year++) {
    const degradationFactor = 1 - (0.005 * year);
    const priceInflationFactor = Math.pow(1.03, year - 1);
    
    const yearSavings = annualSavings * degradationFactor * priceInflationFactor;
    cumulativeSavings += yearSavings;
    
    projections.push({
      year,
      cumulativeSavings: Math.round(cumulativeSavings),
      annualGeneration: Math.round(annualSavings / 0.25 * degradationFactor), // Approximate kWh
      degradationFactor: Math.round(degradationFactor * 100) / 100
    });
  }
  
  return projections;
}

/**
 * Main function: Get solar recommendations
 */
export function getSolarRecommendations(input: SolarInput): SolarRecommendation {
  const region = getRegionFromPostcode(input.postcode);
  const roofType = input.roofType || 'unknown';
  const sunlightKwhPerKwp = SUNLIGHT_DATA[region] || SUNLIGHT_DATA['default'];
  const roofEfficiency = ROOF_EFFICIENCY[roofType] || ROOF_EFFICIENCY['unknown'];
  const feedInTariff = input.feedInTariff || 5; // Default SEG rate
  const daytimeUsagePercentage = input.daytimeUsagePercentage || 40;
  
  // Calculate optimal system size
  const systemSizeKw = calculateOptimalSystemSize(
    input.annualElectricityUsage,
    region,
    input.roofSpaceM2
  );
  
  const panelCount = Math.ceil(systemSizeKw / 0.4); // 400W panels
  
  // Calculate generation
  const annualGenerationKwh = Math.round(systemSizeKw * sunlightKwhPerKwp * roofEfficiency);
  
  // Calculate self-consumption and export
  const selfConsumptionKwh = Math.round(annualGenerationKwh * (daytimeUsagePercentage / 100));
  const exportKwh = annualGenerationKwh - selfConsumptionKwh;
  
  // Calculate savings
  const selfConsumptionSavings = selfConsumptionKwh * (input.electricityRate / 100);
  const exportIncome = exportKwh * (feedInTariff / 100);
  const annualSavings = Math.round(selfConsumptionSavings + exportIncome);
  
  // Generate system options
  const options = generateSystemOptions(
    systemSizeKw,
    region,
    roofType,
    input.electricityRate,
    feedInTariff,
    daytimeUsagePercentage
  );
  
  // Use standard option for main calculations
  const systemCost = options.standard.cost;
  const paybackYears = Math.round((systemCost / annualSavings) * 10) / 10;
  
  // CO2 reduction (UK grid: 0.233 kg CO2 per kWh)
  const co2ReductionKg = Math.round(annualGenerationKwh * 0.233);
  
  // Battery recommendation
  const batteryRecommendation = calculateBatteryRecommendation(
    input,
    annualGenerationKwh,
    selfConsumptionKwh
  );
  
  // Lifetime savings (25 years)
  const savingsProjection = generateSavingsProjection(annualSavings, systemCost);
  const lifetimeSavings25Years = savingsProjection[24].cumulativeSavings;
  const roiPercentage = Math.round((lifetimeSavings25Years / systemCost) * 100);
  
  // Suitability score
  const suitabilityScore = calculateSuitabilityScore(
    region,
    roofType,
    input.annualElectricityUsage,
    paybackYears
  );
  
  // Warnings
  const warnings: string[] = [];
  if (roofType === 'north-facing') {
    warnings.push('North-facing roofs generate 30% less energy. Consider east-west split if possible.');
  }
  if (paybackYears > 15) {
    warnings.push('Long payback period. Consider a smaller system or wait for prices to drop.');
  }
  if (input.roofSpaceM2 && input.roofSpaceM2 < systemSizeKw * 6) {
    warnings.push('Limited roof space may restrict system size.');
  }
  if (sunlightKwhPerKwp < 900) {
    warnings.push('Your region has lower sunlight hours. Payback will be longer than southern regions.');
  }
  
  return {
    systemSizeKw,
    panelCount,
    annualGenerationKwh,
    annualSavings,
    paybackYears,
    co2ReductionKg,
    selfConsumptionKwh,
    exportKwh,
    exportIncome: Math.round(exportIncome),
    batteryRecommendation,
    lifetimeSavings25Years,
    roiPercentage,
    options,
    region,
    suitabilityScore,
    warnings
  };
}

/**
 * Calculate savings with different scenarios
 */
export function compareSolarScenarios(baseInput: SolarInput): {
  withoutSolar: { annualCost: number };
  withSolar: { annualCost: number; savings: number };
  withSolarAndBattery: { annualCost: number; savings: number };
} {
  const currentAnnualCost = baseInput.annualElectricityUsage * (baseInput.electricityRate / 100);
  
  const solarRec = getSolarRecommendations(baseInput);
  
  const withSolarCost = currentAnnualCost - solarRec.annualSavings;
  
  let withBatterySavings = solarRec.annualSavings;
  if (solarRec.batteryRecommendation?.recommended) {
    withBatterySavings += solarRec.batteryRecommendation.additionalSavings;
  }
  const withBatteryCost = currentAnnualCost - withBatterySavings;
  
  return {
    withoutSolar: { annualCost: Math.round(currentAnnualCost) },
    withSolar: { annualCost: Math.round(withSolarCost), savings: solarRec.annualSavings },
    withSolarAndBattery: { 
      annualCost: Math.round(withBatteryCost), 
      savings: Math.round(withBatterySavings) 
    }
  };
}
