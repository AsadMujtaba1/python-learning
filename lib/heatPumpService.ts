/**
 * Heat Pump Recommendation Service
 * Calculates heat pump recommendations vs gas boiler comparison
 */

// Regional climate data (average annual temp °C)
const REGIONAL_CLIMATE: Record<string, { avgTemp: number; heatingDegreesDays: number }> = {
  'scotland': { avgTemp: 8.5, heatingDegreesDays: 3200 },
  'north-east': { avgTemp: 9.0, heatingDegreesDays: 3000 },
  'north-west': { avgTemp: 9.5, heatingDegreesDays: 2900 },
  'yorkshire': { avgTemp: 9.5, heatingDegreesDays: 2850 },
  'east-midlands': { avgTemp: 10.0, heatingDegreesDays: 2700 },
  'west-midlands': { avgTemp: 10.0, heatingDegreesDays: 2750 },
  'east': { avgTemp: 10.5, heatingDegreesDays: 2600 },
  'london': { avgTemp: 11.0, heatingDegreesDays: 2400 },
  'south-east': { avgTemp: 10.5, heatingDegreesDays: 2500 },
  'south-west': { avgTemp: 10.5, heatingDegreesDays: 2550 },
  'wales': { avgTemp: 9.5, heatingDegreesDays: 2800 },
  'northern-ireland': { avgTemp: 9.0, heatingDegreesDays: 3000 },
  'default': { avgTemp: 10.0, heatingDegreesDays: 2700 },
};

// EPC insulation ratings
const INSULATION_FACTORS: Record<string, { heatLoss: number; description: string }> = {
  'A': { heatLoss: 0.6, description: 'Excellent - Modern build with high-performance insulation' },
  'B': { heatLoss: 0.7, description: 'Good - Well-insulated with cavity walls and loft insulation' },
  'C': { heatLoss: 0.85, description: 'Average - Standard insulation, some improvements possible' },
  'D': { heatLoss: 1.0, description: 'Below average - Basic insulation, upgrades recommended' },
  'E': { heatLoss: 1.2, description: 'Poor - Significant heat loss, insulation upgrades needed' },
  'F': { heatLoss: 1.4, description: 'Very poor - Urgent insulation improvements required' },
  'G': { heatLoss: 1.6, description: 'Extremely poor - Not suitable without major upgrades' },
  'unknown': { heatLoss: 1.0, description: 'Unknown - Assuming average insulation' },
};

// House size heat demand (kWh/m²/year)
const HEAT_DEMAND_PER_M2: Record<string, number> = {
  'A': 40,
  'B': 60,
  'C': 80,
  'D': 100,
  'E': 130,
  'F': 160,
  'G': 200,
  'unknown': 100,
};

// SCOP (Seasonal Coefficient of Performance) by temperature
const SCOP_FACTORS = {
  mild: 3.5,    // >10°C average
  moderate: 3.2, // 9-10°C
  cold: 2.8,    // <9°C
};

// Costs (2024 UK market)
const COSTS = {
  heatPump: {
    small: 8000,  // 5-7kW
    medium: 10000, // 8-12kW
    large: 13000,  // 13-16kW
  },
  boiler: {
    installation: 2500,
    annual: 150, // Service & maintenance
  },
  installation: {
    radiatorUpgrades: 3000, // If needed
    hotWaterTank: 1500,
  },
};

// Government grants (2024)
const GRANTS = {
  boilerUpgradeScheme: 7500, // £7,500 BUS grant
};

export interface HeatPumpInput {
  postcode: string;
  annualGasUsageKwh: number;
  homeInsulation?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'unknown';
  houseSizeM2?: number;
  currentHeatingSystem: 'gas-boiler' | 'oil-boiler' | 'electric' | 'other';
  gasRate: number; // pence per kWh
  electricityRate: number; // pence per kWh
  propertyType?: 'detached' | 'semi-detached' | 'terraced' | 'flat' | 'bungalow';
  radiatorType?: 'standard' | 'oversized' | 'underfloor';
}

export interface HeatPumpRecommendation {
  recommendedSizeKw: number;
  suitabilityScore: number; // 0-100
  estimatedScop: number;
  annualHeatPumpCost: number;
  annualBoilerCost: number;
  annualSavings: number;
  installationCost: number;
  installationCostAfterGrant: number;
  paybackYears: number;
  breakEvenYear: number;
  lifetimeSavings20Years: number;
  co2ReductionKg: number;
  pros: string[];
  cons: string[];
  recommendations: string[];
  warnings: string[];
  comparison: {
    heatPump: SystemComparison;
    gasBoiler: SystemComparison;
  };
  upgrades: UpgradeRecommendation[];
}

export interface SystemComparison {
  type: 'heat-pump' | 'gas-boiler';
  annualRunningCost: number;
  efficiency: number;
  co2EmissionsKg: number;
  maintenanceCostAnnual: number;
  lifespanYears: number;
  comfortLevel: string;
  environmentalImpact: string;
}

export interface UpgradeRecommendation {
  upgrade: string;
  cost: number;
  benefit: string;
  priority: 'essential' | 'recommended' | 'optional';
  savingsImpact: number;
}

/**
 * Get region from postcode (reuse from solar service)
 */
function getRegionFromPostcode(postcode: string): string {
  const area = postcode.toUpperCase().substring(0, 2);
  
  if (['AB', 'DD', 'DG', 'EH', 'FK', 'G', 'HS', 'IV', 'KA', 'KW', 'KY', 'ML', 'PA', 'PH', 'TD', 'ZE'].some(p => area.startsWith(p))) {
    return 'scotland';
  }
  if (['E', 'EC', 'N', 'NW', 'SE', 'SW', 'W', 'WC'].some(p => area === p || area.startsWith(p))) {
    return 'london';
  }
  if (['BN', 'BR', 'CR', 'CT', 'DA', 'GU', 'KT', 'ME', 'RH', 'SL', 'SM', 'TN', 'TW'].some(p => area.startsWith(p))) {
    return 'south-east';
  }
  if (['BA', 'BH', 'BS', 'DT', 'EX', 'GL', 'PL', 'SP', 'TA', 'TQ', 'TR'].some(p => area.startsWith(p))) {
    return 'south-west';
  }
  if (['CB', 'CM', 'CO', 'IP', 'NR', 'PE', 'SG'].some(p => area.startsWith(p))) {
    return 'east';
  }
  if (['CF', 'CH', 'HR', 'LD', 'LL', 'NP', 'SA', 'SY'].some(p => area.startsWith(p))) {
    return 'wales';
  }
  if (['DH', 'DL', 'NE', 'SR', 'TS'].some(p => area.startsWith(p))) {
    return 'north-east';
  }
  if (['BD', 'DN', 'HD', 'HG', 'HU', 'HX', 'LS', 'S', 'WF', 'YO'].some(p => area.startsWith(p))) {
    return 'yorkshire';
  }
  if (['BB', 'BL', 'CA', 'FY', 'L', 'LA', 'M', 'OL', 'PR', 'SK', 'WA', 'WN'].some(p => area.startsWith(p))) {
    return 'north-west';
  }
  if (['DE', 'LE', 'LN', 'NG', 'NN'].some(p => area.startsWith(p))) {
    return 'east-midlands';
  }
  if (['B', 'CV', 'DY', 'ST', 'TF', 'WR', 'WS', 'WV'].some(p => area.startsWith(p))) {
    return 'west-midlands';
  }
  if (['BT'].some(p => area.startsWith(p))) {
    return 'northern-ireland';
  }
  
  return 'default';
}

/**
 * Estimate house size from gas usage if not provided
 */
function estimateHouseSize(gasUsageKwh: number, insulation: string): number {
  const heatDemand = HEAT_DEMAND_PER_M2[insulation] || 100;
  return Math.round((gasUsageKwh * 0.8) / heatDemand); // 80% of gas is for heating
}

/**
 * Calculate required heat pump size
 */
function calculateHeatPumpSize(
  annualGasUsage: number,
  houseSizeM2: number,
  insulation: string,
  region: string
): number {
  const climate = REGIONAL_CLIMATE[region] || REGIONAL_CLIMATE['default'];
  const insulationFactor = INSULATION_FACTORS[insulation] || INSULATION_FACTORS['unknown'];
  
  // Peak heat loss calculation (W/m²)
  // Typical UK: 50-100 W/m² depending on insulation
  const baseHeatLoss = 70; // W/m²
  const peakHeatLossWatts = houseSizeM2 * baseHeatLoss * insulationFactor.heatLoss;
  
  // Add 20% for DHW (domestic hot water)
  const totalCapacityKw = (peakHeatLossWatts * 1.2) / 1000;
  
  // Round up to nearest kW
  return Math.ceil(totalCapacityKw);
}

/**
 * Calculate SCOP based on climate
 */
function calculateScop(region: string, insulation: string): number {
  const climate = REGIONAL_CLIMATE[region] || REGIONAL_CLIMATE['default'];
  
  let baseSCOP: number;
  if (climate.avgTemp >= 10) {
    baseSCOP = SCOP_FACTORS.mild;
  } else if (climate.avgTemp >= 9) {
    baseSCOP = SCOP_FACTORS.moderate;
  } else {
    baseSCOP = SCOP_FACTORS.cold;
  }
  
  // Better insulation = more efficient operation
  const insulationFactor = INSULATION_FACTORS[insulation] || INSULATION_FACTORS['unknown'];
  if (insulationFactor.heatLoss < 0.8) {
    baseSCOP += 0.2; // Bonus for good insulation
  }
  
  return Math.round(baseSCOP * 10) / 10;
}

/**
 * Calculate suitability score
 */
function calculateSuitabilityScore(
  insulation: string,
  region: string,
  radiatorType: string,
  propertyType: string
): number {
  let score = 50; // Base score
  
  // Insulation (0-30 points)
  const insulationFactor = INSULATION_FACTORS[insulation] || INSULATION_FACTORS['unknown'];
  if (insulationFactor.heatLoss <= 0.7) score += 30;
  else if (insulationFactor.heatLoss <= 0.85) score += 25;
  else if (insulationFactor.heatLoss <= 1.0) score += 15;
  else if (insulationFactor.heatLoss <= 1.2) score += 5;
  else score += 0; // Poor insulation
  
  // Climate (0-15 points) - milder = better for heat pumps
  const climate = REGIONAL_CLIMATE[region] || REGIONAL_CLIMATE['default'];
  if (climate.avgTemp >= 10.5) score += 15;
  else if (climate.avgTemp >= 9.5) score += 10;
  else if (climate.avgTemp >= 8.5) score += 5;
  
  // Radiator type (0-10 points)
  if (radiatorType === 'underfloor') score += 10;
  else if (radiatorType === 'oversized') score += 7;
  else score += 3; // Standard radiators may need upgrade
  
  // Property type (0-5 points)
  if (['detached', 'semi-detached'].includes(propertyType)) score += 5;
  else if (propertyType === 'bungalow') score += 4;
  else score += 2;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Generate pros and cons
 */
function generateProsAndCons(
  input: HeatPumpInput,
  scop: number,
  suitabilityScore: number,
  annualSavings: number
): { pros: string[]; cons: string[] } {
  const pros: string[] = [
    `Very low carbon emissions - reduces your home's CO2 by 70-80%`,
    `Eligible for £${GRANTS.boilerUpgradeScheme.toLocaleString()} government grant`,
    `Heats and cools your home (reversible in summer)`,
    `Long lifespan of 20-25 years vs 10-15 for boilers`,
    `No gas connection required - fully electric`,
    `Low maintenance - no annual servicing required like boilers`,
  ];
  
  if (scop >= 3.2) {
    pros.push(`Excellent efficiency: ${scop} units of heat per unit of electricity`);
  }
  
  if (annualSavings > 0) {
    pros.push(`Save £${Math.round(annualSavings)}/year on energy bills`);
  }
  
  const cons: string[] = [];
  
  if (suitabilityScore < 50) {
    cons.push(`Your property may need insulation upgrades first (current score: ${suitabilityScore}/100)`);
  }
  
  if (input.radiatorType === 'standard') {
    cons.push(`Standard radiators may need upgrading to larger models for optimal performance`);
  }
  
  if (input.electricityRate > input.gasRate * 2.5) {
    cons.push(`High electricity rates in your area may reduce savings`);
  }
  
  cons.push(`Higher upfront cost than boiler (£${(COSTS.heatPump.medium - GRANTS.boilerUpgradeScheme).toLocaleString()} after grant)`);
  cons.push(`May require hot water tank if you don't have one`);
  cons.push(`Less effective in very cold weather (below -5°C)`);
  
  if (input.propertyType === 'flat') {
    cons.push(`Flats may face challenges with outdoor unit placement and permissions`);
  }
  
  return { pros, cons };
}

/**
 * Generate upgrade recommendations
 */
function generateUpgradeRecommendations(
  input: HeatPumpInput,
  suitabilityScore: number
): UpgradeRecommendation[] {
  const upgrades: UpgradeRecommendation[] = [];
  const insulation = input.homeInsulation || 'unknown';
  const insulationFactor = INSULATION_FACTORS[insulation] || INSULATION_FACTORS['unknown'];
  
  // Insulation upgrades
  if (insulationFactor.heatLoss > 1.0) {
    upgrades.push({
      upgrade: 'Loft and cavity wall insulation',
      cost: 2000,
      benefit: 'Reduces heat loss by 30-40%, improves heat pump efficiency significantly',
      priority: insulationFactor.heatLoss > 1.3 ? 'essential' : 'recommended',
      savingsImpact: 200
    });
  }
  
  // Radiator upgrades
  if (input.radiatorType === 'standard') {
    upgrades.push({
      upgrade: 'Upgrade to larger radiators',
      cost: 3000,
      benefit: 'Allows heat pump to run at lower temperatures, improving efficiency by 15-20%',
      priority: 'recommended',
      savingsImpact: 150
    });
  }
  
  // Hot water tank
  if (!input.radiatorType || input.radiatorType !== 'underfloor') {
    upgrades.push({
      upgrade: 'Install hot water cylinder',
      cost: 1500,
      benefit: 'Required for heat pump hot water production. Modern cylinders are highly efficient',
      priority: 'essential',
      savingsImpact: 0 // Essential, not for savings
    });
  }
  
  // Smart controls
  upgrades.push({
    upgrade: 'Smart heating controls',
    cost: 500,
    benefit: 'Optimizes heat pump operation, can reduce bills by 10-15%',
    priority: 'optional',
    savingsImpact: 100
  });
  
  // Windows
  if (insulationFactor.heatLoss > 1.2) {
    upgrades.push({
      upgrade: 'Double or triple glazing',
      cost: 5000,
      benefit: 'Reduces heat loss through windows, improves comfort and efficiency',
      priority: 'optional',
      savingsImpact: 180
    });
  }
  
  return upgrades;
}

/**
 * Main function: Get heat pump recommendations
 */
export function getHeatPumpRecommendations(input: HeatPumpInput): HeatPumpRecommendation {
  const region = getRegionFromPostcode(input.postcode);
  const insulation = input.homeInsulation || 'unknown';
  const houseSizeM2 = input.houseSizeM2 || estimateHouseSize(input.annualGasUsageKwh, insulation);
  const radiatorType = input.radiatorType || 'standard';
  const propertyType = input.propertyType || 'semi-detached';
  
  // Calculate heat pump size
  const recommendedSizeKw = calculateHeatPumpSize(
    input.annualGasUsageKwh,
    houseSizeM2,
    insulation,
    region
  );
  
  // Determine cost based on size
  let installationCost: number;
  if (recommendedSizeKw <= 7) installationCost = COSTS.heatPump.small;
  else if (recommendedSizeKw <= 12) installationCost = COSTS.heatPump.medium;
  else installationCost = COSTS.heatPump.large;
  
  // Add upgrade costs if needed
  if (radiatorType === 'standard') installationCost += COSTS.installation.radiatorUpgrades;
  installationCost += COSTS.installation.hotWaterTank;
  
  const installationCostAfterGrant = Math.max(0, installationCost - GRANTS.boilerUpgradeScheme);
  
  // Calculate SCOP
  const estimatedScop = calculateScop(region, insulation);
  
  // Calculate running costs
  // Heat pump: electricity usage = gas usage / SCOP
  const heatPumpElectricityKwh = input.annualGasUsageKwh / estimatedScop;
  const annualHeatPumpCost = Math.round(heatPumpElectricityKwh * (input.electricityRate / 100));
  
  // Gas boiler: assume 90% efficiency
  const boilerGasKwh = input.annualGasUsageKwh / 0.9;
  const annualBoilerCost = Math.round(boilerGasKwh * (input.gasRate / 100)) + COSTS.boiler.annual;
  
  const annualSavings = annualBoilerCost - annualHeatPumpCost;
  
  // Payback calculation
  const paybackYears = annualSavings > 0 
    ? Math.round((installationCostAfterGrant / annualSavings) * 10) / 10
    : 999;
  
  const breakEvenYear = Math.ceil(paybackYears);
  
  // Lifetime savings (20 years)
  // Assume 4% annual energy price increase
  let lifetimeSavings = -installationCostAfterGrant;
  for (let year = 1; year <= 20; year++) {
    const inflationFactor = Math.pow(1.04, year - 1);
    lifetimeSavings += annualSavings * inflationFactor;
  }
  lifetimeSavings = Math.round(lifetimeSavings);
  
  // CO2 reduction
  // Gas: 0.203 kg CO2/kWh, Electricity: 0.233 kg CO2/kWh (but heat pump is 3x efficient)
  const gasCO2 = input.annualGasUsageKwh * 0.203;
  const heatPumpCO2 = heatPumpElectricityKwh * 0.233;
  const co2ReductionKg = Math.round(gasCO2 - heatPumpCO2);
  
  // Suitability score
  const suitabilityScore = calculateSuitabilityScore(insulation, region, radiatorType, propertyType);
  
  // Pros and cons
  const { pros, cons } = generateProsAndCons(input, estimatedScop, suitabilityScore, annualSavings);
  
  // Recommendations
  const recommendations: string[] = [];
  if (suitabilityScore >= 70) {
    recommendations.push('✅ Your property is well-suited for a heat pump');
  } else if (suitabilityScore >= 50) {
    recommendations.push('⚠️ Heat pump is feasible but consider insulation upgrades first');
  } else {
    recommendations.push('❌ Significant upgrades needed before heat pump installation');
  }
  
  if (estimatedScop >= 3.2) {
    recommendations.push('✅ Excellent efficiency expected in your climate');
  }
  
  if (annualSavings > 300) {
    recommendations.push('✅ Good annual savings potential');
  } else if (annualSavings < 0) {
    recommendations.push('⚠️ May cost more to run than gas boiler at current rates');
  }
  
  if (radiatorType === 'standard') {
    recommendations.push('💡 Consider upgrading radiators for optimal performance');
  }
  
  recommendations.push(`💰 With £${GRANTS.boilerUpgradeScheme.toLocaleString()} grant, net cost is £${installationCostAfterGrant.toLocaleString()}`);
  
  // Warnings
  const warnings: string[] = [];
  if (suitabilityScore < 50) {
    warnings.push('⚠️ Your property needs insulation improvements for heat pump efficiency');
  }
  if (paybackYears > 20) {
    warnings.push('⚠️ Long payback period - consider waiting for technology costs to reduce');
  }
  if (input.electricityRate / input.gasRate > 3.5) {
    warnings.push('⚠️ Very high electricity-to-gas price ratio in your area may limit savings');
  }
  if (input.propertyType === 'flat') {
    warnings.push('⚠️ Flats may require building permission for outdoor unit installation');
  }
  
  // System comparison
  const comparison = {
    heatPump: {
      type: 'heat-pump' as const,
      annualRunningCost: annualHeatPumpCost,
      efficiency: estimatedScop * 100,
      co2EmissionsKg: Math.round(heatPumpCO2),
      maintenanceCostAnnual: 50,
      lifespanYears: 20,
      comfortLevel: 'Consistent, gentle heat',
      environmentalImpact: '70-80% lower emissions'
    },
    gasBoiler: {
      type: 'gas-boiler' as const,
      annualRunningCost: annualBoilerCost,
      efficiency: 90,
      co2EmissionsKg: Math.round(gasCO2),
      maintenanceCostAnnual: COSTS.boiler.annual,
      lifespanYears: 12,
      comfortLevel: 'Quick heating, on-demand',
      environmentalImpact: 'High carbon emissions'
    }
  };
  
  // Upgrade recommendations
  const upgrades = generateUpgradeRecommendations(input, suitabilityScore);
  
  return {
    recommendedSizeKw,
    suitabilityScore,
    estimatedScop,
    annualHeatPumpCost,
    annualBoilerCost,
    annualSavings,
    installationCost,
    installationCostAfterGrant,
    paybackYears,
    breakEvenYear,
    lifetimeSavings20Years: lifetimeSavings,
    co2ReductionKg,
    pros,
    cons,
    recommendations,
    warnings,
    comparison,
    upgrades
  };
}

/**
 * Check if property is suitable for heat pump
 */
export function checkHeatPumpSuitability(input: HeatPumpInput): {
  suitable: boolean;
  score: number;
  reasoning: string;
  essentialUpgrades: string[];
} {
  const recommendation = getHeatPumpRecommendations(input);
  
  const suitable = recommendation.suitabilityScore >= 50;
  const essentialUpgrades = recommendation.upgrades
    .filter(u => u.priority === 'essential')
    .map(u => u.upgrade);
  
  let reasoning = '';
  if (recommendation.suitabilityScore >= 70) {
    reasoning = 'Your property is well-suited for a heat pump with minimal modifications needed.';
  } else if (recommendation.suitabilityScore >= 50) {
    reasoning = 'A heat pump is feasible but some upgrades would improve performance and savings.';
  } else {
    reasoning = 'Significant property improvements are needed before a heat pump installation would be cost-effective.';
  }
  
  return {
    suitable,
    score: recommendation.suitabilityScore,
    reasoning,
    essentialUpgrades
  };
}
