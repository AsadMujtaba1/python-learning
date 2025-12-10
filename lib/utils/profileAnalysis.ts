/**
 * Profile Completeness Calculator
 * Determines what analysis capabilities are available based on user data
 */

import type { 
  UserProfile, 
  BasicProfile, 
  StandardProfile, 
  AdvancedProfile, 
  ExpertProfile,
  ProfileCompleteness,
  AnalysisCapabilities 
} from '../types/userProfile';

// ============================================================================
// CALCULATE PROFILE TIER
// ============================================================================

export function calculateProfileTier(profile: UserProfile): 'basic' | 'standard' | 'advanced' | 'expert' {
  const standardFields = [
    'bedrooms', 'totalFloorArea', 'constructionYear', 'heatingType', 
    'hasDoubleGlazing', 'wallInsulation', 'loftInsulation', 'hasSolarPanels'
  ];
  
  const advancedFields = [
    'electricityProvider', 'electricityUnitRate', 'electricityStandingCharge',
    'gasProvider', 'gasUnitRate', 'annualElectricityUsage', 'hasSmartMeter'
  ];
  
  const expertFields = [
    'appliances', 'heatingSchedule', 'hasElectricVehicle', 'evBatterySize',
    'hasBatteryStorage', 'smartHomeDevices', 'monthlyBudget'
  ];
  
  const hasStandardData = standardFields.some(field => profile[field as keyof UserProfile] !== undefined);
  const hasAdvancedData = advancedFields.some(field => profile[field as keyof UserProfile] !== undefined);
  const hasExpertData = expertFields.some(field => profile[field as keyof UserProfile] !== undefined);
  
  if (hasExpertData) return 'expert';
  if (hasAdvancedData) return 'advanced';
  if (hasStandardData) return 'standard';
  return 'basic';
}

// ============================================================================
// CALCULATE COMPLETENESS PERCENTAGE
// ============================================================================

export function calculateCompleteness(profile: UserProfile): ProfileCompleteness {
  const tier = calculateProfileTier(profile);
  
  // Define all possible fields per tier
  const tierFields = {
    basic: ['postcode', 'homeType', 'occupants'],
    standard: [
      'bedrooms', 'totalFloorArea', 'constructionYear', 'numberOfFloors',
      'heatingType', 'hasDoubleGlazing', 'wallInsulation', 'loftInsulation',
      'hasGas', 'hasElectricity', 'hasSolarPanels', 'workFromHome', 'typicalOccupancyHours'
    ],
    advanced: [
      'electricityProvider', 'electricityTariffName', 'electricityTariffType',
      'electricityUnitRate', 'electricityStandingCharge', 'electricityContractEndDate',
      'gasProvider', 'gasTariffName', 'gasUnitRate', 'gasStandingCharge',
      'annualElectricityUsage', 'annualGasUsage', 'averageMonthlyBill',
      'hasSmartMeter', 'smartMeterType', 'hasBillsUploaded'
    ],
    expert: [
      'appliances', 'heatingSchedule', 'targetTemperature', 'hasSmartThermostat',
      'hotWaterSystem', 'hotWaterSchedule', 'hasElectricVehicle', 'evBatterySize',
      'cookingMethod', 'hasBatteryStorage', 'exportsToGrid', 'monthlyBudget',
      'savingsGoal', 'priorityGoal', 'hasSmartHome', 'smartHomeDevices'
    ]
  };
  
  // Calculate fields filled for current tier
  const relevantFields = [
    ...tierFields.basic,
    ...(tier === 'standard' || tier === 'advanced' || tier === 'expert' ? tierFields.standard : []),
    ...(tier === 'advanced' || tier === 'expert' ? tierFields.advanced : []),
    ...(tier === 'expert' ? tierFields.expert : [])
  ];
  
  const filledFields = relevantFields.filter(field => {
    const value = profile[field as keyof UserProfile];
    return value !== undefined && value !== null && value !== '';
  });
  
  const percentage = Math.round((filledFields.length / relevantFields.length) * 100);
  
  // Identify missing fields with impact descriptions
  const missingFields = getMissingFieldsByCategory(profile, tier);
  
  // Generate recommendations
  const recommendations = generateRecommendations(profile, tier, missingFields);
  
  return {
    tier,
    percentage,
    missingFields,
    recommendations
  };
}

// ============================================================================
// GET MISSING FIELDS BY CATEGORY
// ============================================================================

function getMissingFieldsByCategory(
  profile: UserProfile, 
  tier: 'basic' | 'standard' | 'advanced' | 'expert'
): ProfileCompleteness['missingFields'] {
  const missing: ProfileCompleteness['missingFields'] = [];
  
  // Home Details
  const homeFields = ['bedrooms', 'totalFloorArea', 'constructionYear', 'numberOfFloors'];
  const missingHome = homeFields.filter(f => !profile[f as keyof UserProfile]);
  if (missingHome.length > 0) {
    missing.push({
      category: 'Home Details',
      fields: missingHome,
      impact: 'Improves heating cost accuracy by 20-30%'
    });
  }
  
  // Insulation
  const insulationFields = ['wallInsulation', 'loftInsulation', 'hasDoubleGlazing'];
  const missingInsulation = insulationFields.filter(f => !profile[f as keyof UserProfile]);
  if (missingInsulation.length > 0) {
    missing.push({
      category: 'Insulation',
      fields: missingInsulation,
      impact: 'Unlocks insulation upgrade recommendations & ROI calculator'
    });
  }
  
  // Tariff Information
  if (tier === 'advanced' || tier === 'expert') {
    const tariffFields = ['electricityProvider', 'electricityUnitRate', 'electricityStandingCharge'];
    const missingTariff = tariffFields.filter(f => !profile[f as keyof UserProfile]);
    if (missingTariff.length > 0) {
      missing.push({
        category: 'Electricity Tariff',
        fields: missingTariff,
        impact: 'Enables tariff comparison and switching savings (avg £300/year)'
      });
    }
  }
  
  // Historical Usage
  if (tier === 'advanced' || tier === 'expert') {
    const usageFields = ['annualElectricityUsage', 'annualGasUsage'];
    const missingUsage = usageFields.filter(f => !profile[f as keyof UserProfile]);
    if (missingUsage.length > 0) {
      missing.push({
        category: 'Historical Usage',
        fields: missingUsage,
        impact: 'Improves forecast accuracy by 40% and enables trend analysis'
      });
    }
  }
  
  // Appliances
  if (tier === 'expert') {
    const expertProfile = profile as ExpertProfile;
    if (!expertProfile.appliances || expertProfile.appliances?.length === 0) {
      missing.push({
        category: 'Appliances',
        fields: ['appliances'],
        impact: 'Unlocks appliance-level breakdown and upgrade recommendations (avg £150/year)'
      });
    }
  }
  
  // EV Charging
  if (tier === 'expert') {
    const evFields = ['hasElectricVehicle'];
    const missingEV = evFields.filter(f => profile[f as keyof UserProfile] === undefined);
    if (missingEV.length > 0) {
      missing.push({
        category: 'Electric Vehicle',
        fields: missingEV,
        impact: 'Enables EV charging optimization (save £400/year on EV costs)'
      });
    }
  }
  
  return missing;
}

// ============================================================================
// GENERATE RECOMMENDATIONS
// ============================================================================

function generateRecommendations(
  profile: UserProfile,
  tier: 'basic' | 'standard' | 'advanced' | 'expert',
  missingFields: ProfileCompleteness['missingFields']
): string[] {
  const recommendations: string[] = [];
  
  // Prioritized recommendations based on impact
  if (missingFields.some(mf => mf.category === 'Electricity Tariff')) {
    recommendations.push('🎯 Add your electricity tariff to compare switching savings (2 min, £300/year potential)');
  }
  
  if (missingFields.some(mf => mf.category === 'Historical Usage')) {
    recommendations.push('📊 Upload a recent energy bill for accurate usage analysis (1 min)');
  }
  
  if (missingFields.some(mf => mf.category === 'Insulation')) {
    recommendations.push('🏠 Add insulation details to get upgrade recommendations (1 min, £200/year potential)');
  }
  
  if (missingFields.some(mf => mf.category === 'Home Details')) {
    recommendations.push('📏 Add home size and age for better heating cost estimates (1 min)');
  }
  
  if (tier === 'basic') {
    recommendations.push('⚡ Upgrade to Standard profile to unlock insulation recommendations and EPC comparison');
  }
  
  if (tier === 'standard') {
    recommendations.push('💰 Upgrade to Advanced profile to unlock tariff comparison and £300/year switching savings');
  }
  
  if (tier === 'advanced') {
    recommendations.push('🚀 Upgrade to Expert profile to unlock appliance breakdown and EV optimization');
  }
  
  const advancedProfile = profile as AdvancedProfile;
  if (!advancedProfile.hasBillsUploaded) {
    recommendations.push('📄 Upload your latest energy bill for automatic data extraction (30 sec)');
  }
  
  return recommendations.slice(0, 5); // Top 5 recommendations
}

// ============================================================================
// CALCULATE ANALYSIS CAPABILITIES
// ============================================================================

export function calculateCapabilities(profile: UserProfile): AnalysisCapabilities {
  const tier = calculateProfileTier(profile);
  const p = profile as ExpertProfile; // Type assertion for easier access
  
  return {
    // Basic tier (always available with postcode)
    basicCostEstimate: true,
    weatherImpact: true,
    regionalComparison: true,
    carbonIntensity: true,
    
    // Standard tier (requires home characteristics)
    accurateHeatingCost: !!(p.bedrooms && p.heatingType),
    epcComparison: !!(p.constructionYear && p.homeType),
    insulationRecommendations: !!(p.wallInsulation || p.loftInsulation),
    seasonalForecasts: !!(p.totalFloorArea && p.heatingType),
    
    // Advanced tier (requires tariff + usage data)
    tariffComparison: !!(p.electricityProvider && p.electricityUnitRate),
    switchingSavings: !!(p.electricityUnitRate && p.annualElectricityUsage),
    contractEndReminders: !!(p.electricityContractEndDate || p.gasContractEndDate),
    billAccuracyCheck: !!(p.hasBillsUploaded && p.electricityUnitRate),
    historicalTrends: !!(p.annualElectricityUsage || p.hasBillsUploaded),
    
    // Expert tier (requires detailed appliance/schedule data)
    applianceBreakdown: !!(p.appliances && p.appliances.length > 0),
    optimizedScheduling: !!(p.heatingSchedule || p.hotWaterSchedule),
    evChargingOptimization: !!(p.hasElectricVehicle && p.evBatterySize),
    solarROI: !!(p.hasSolarPanels && p.solarPanelCapacity),
    batteryOptimization: !!(p.hasBatteryStorage && p.batteryStorageCapacity),
    smartHomeIntegration: !!(p.hasSmartHome && p.smartHomeDevices),
    predictiveAnalytics: !!(p.annualElectricityUsage && p.heatingSchedule),
    peakAvoidance: !!(p.electricityTariffType === 'economy-7' || p.hasSmartMeter),
  };
}

// ============================================================================
// GET NEXT BEST ACTIONS (What to add next)
// ============================================================================

export function getNextBestActions(profile: UserProfile): Array<{
  action: string;
  category: string;
  impact: string;
  timeRequired: string;
  savingsPotential: string;
  priority: number;
}> {
  const capabilities = calculateCapabilities(profile);
  const actions: Array<{
    action: string;
    category: string;
    impact: string;
    timeRequired: string;
    savingsPotential: string;
    priority: number;
  }> = [];
  
  // Tariff comparison (highest impact)
  if (!capabilities.tariffComparison) {
    actions.push({
      action: 'Add your electricity tariff details',
      category: 'Tariff',
      impact: 'Compare with 40+ suppliers and find cheaper deals',
      timeRequired: '3 minutes',
      savingsPotential: '£300/year',
      priority: 10
    });
  }
  
  // Bill upload
  const advProfile = profile as AdvancedProfile;
  if (!advProfile.hasBillsUploaded) {
    actions.push({
      action: 'Upload your latest energy bill',
      category: 'Bills',
      impact: 'Automatic data extraction and usage tracking',
      timeRequired: '30 seconds',
      savingsPotential: '£200/year (accuracy)',
      priority: 9
    });
  }
  
  // Historical usage
  if (!capabilities.historicalTrends) {
    actions.push({
      action: 'Enter your annual energy usage',
      category: 'Usage',
      impact: 'Accurate forecasting and trend analysis',
      timeRequired: '1 minute',
      savingsPotential: '£150/year (optimization)',
      priority: 8
    });
  }
  
  // Insulation
  if (!capabilities.insulationRecommendations) {
    actions.push({
      action: 'Add insulation details',
      category: 'Home',
      impact: 'Get insulation upgrade recommendations',
      timeRequired: '2 minutes',
      savingsPotential: '£200/year',
      priority: 7
    });
  }
  
  // Appliances
  if (!capabilities.applianceBreakdown) {
    actions.push({
      action: 'Add your major appliances',
      category: 'Appliances',
      impact: 'See exactly where your money goes',
      timeRequired: '5 minutes',
      savingsPotential: '£180/year (upgrades)',
      priority: 6
    });
  }
  
  // EV
  if ((profile as ExpertProfile).hasElectricVehicle === undefined) {
    actions.push({
      action: 'Do you have an electric vehicle?',
      category: 'EV',
      impact: 'Optimize charging times and costs',
      timeRequired: '30 seconds',
      savingsPotential: '£400/year (EV only)',
      priority: 5
    });
  }
  
  // Smart meter
  if (!(profile as AdvancedProfile).hasSmartMeter) {
    actions.push({
      action: 'Do you have a smart meter?',
      category: 'Smart Meter',
      impact: 'Enable real-time monitoring',
      timeRequired: '10 seconds',
      savingsPotential: '£100/year (awareness)',
      priority: 4
    });
  }
  
  return actions.sort((a, b) => b.priority - a.priority);
}

// ============================================================================
// CALCULATE POTENTIAL SAVINGS
// ============================================================================

export function calculatePotentialSavings(profile: UserProfile): {
  current: number; // Current estimated savings with available data
  withStandard: number; // If user adds standard data
  withAdvanced: number; // If user adds advanced data
  withExpert: number; // If user adds expert data
} {
  const tier = calculateProfileTier(profile);
  
  // Base savings from basic analysis
  let current = 120; // £120/year from basic recommendations
  
  if (tier === 'standard' || tier === 'advanced' || tier === 'expert') {
    current += 180; // Add £180 from insulation recommendations
  }
  
  if (tier === 'advanced' || tier === 'expert') {
    current += 300; // Add £300 from tariff switching
  }
  
  if (tier === 'expert') {
    current += 250; // Add £250 from appliance optimization + EV
  }
  
  return {
    current,
    withStandard: 300,
    withAdvanced: 600,
    withExpert: 850
  };
}
