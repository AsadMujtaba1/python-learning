/**
 * Mock User Data for Testing
 * Use these credentials to test the Cost Saver App
 * 
 * IMPORTANT: These are for DEVELOPMENT/TESTING ONLY
 * Do NOT use in production or commit real user data
 */

export const mockUsers = [
  {
    id: 'user1',
    email: 'test@costsaver.com',
    password: 'test123',
    displayName: 'John Smith',
    profile: {
      postcode: 'SW1A 1AA',
      homeType: 'terraced',
      occupants: 2,
      heatingType: 'gas',
      completeness: 25, // Basic tier
    },
    createdAt: '2025-12-01',
  },
  {
    id: 'user2',
    email: 'advanced@costsaver.com',
    password: 'advanced123',
    displayName: 'Sarah Johnson',
    profile: {
      postcode: 'M1 1AE',
      homeType: 'detached',
      occupants: 4,
      heatingType: 'electric',
      bedrooms: 4,
      floorArea: 150,
      constructionYear: 1995,
      insulationQuality: 'good',
      hasSolarPanels: true,
      solarCapacity: 4,
      hasSmartMeter: true,
      completeness: 65, // Advanced tier
    },
    createdAt: '2025-11-15',
  },
  {
    id: 'user3',
    email: 'expert@costsaver.com',
    password: 'expert123',
    displayName: 'David Williams',
    profile: {
      // Basic Info
      postcode: 'EH1 1YZ',
      homeType: 'semi-detached',
      occupants: 3,
      bedrooms: 3,
      constructionYear: 2010,
      floorArea: 120,
      
      // Energy Supply
      heatingType: 'gas',
      hasElectricHeating: false,
      hasGasCooking: true,
      supplier: 'British Gas',
      tariffType: 'variable',
      standingChargeElec: 0.45,
      unitRateElec: 0.28,
      standingChargeGas: 0.30,
      unitRateGas: 0.07,
      
      // Smart Tech
      hasSmartMeter: true,
      hasSmartThermostat: true,
      thermostatBrand: 'Nest',
      hasSmartPlugs: true,
      
      // Renewable Energy
      hasSolarPanels: true,
      solarCapacity: 6,
      solarOrientation: 'south',
      hasBattery: true,
      batteryCapacity: 10,
      hasEVCharger: true,
      
      // Insulation
      insulationQuality: 'excellent',
      wallInsulation: 'cavity',
      loftInsulation: 300,
      hasDoubleGlazing: true,
      hasDraughtProofing: true,
      
      // Appliances (detailed list)
      hasWashingMachine: true,
      washingMachineAge: 2,
      washingMachineRating: 'A',
      hasDishwasher: true,
      dishwasherAge: 3,
      hasTumbleDryer: false,
      hasFridge: true,
      fridgeAge: 4,
      hasFreezer: true,
      hasOven: true,
      ovenType: 'electric',
      hasTV: true,
      tvCount: 2,
      hasDesktopComputer: true,
      hasLaptops: true,
      laptopCount: 2,
      
      // Heating Controls
      hasThermostats: true,
      hasTRVs: true,
      hasProgrammableTimer: true,
      
      // EPC
      epcRating: 'B',
      epcScore: 85,
      epcValidUntil: '2030-12-31',
      
      completeness: 100, // Expert tier - ALL fields filled
    },
    createdAt: '2025-10-01',
  },
];

/**
 * Mock Home Data Templates
 * Use these for quick testing without full signup
 */
export const mockHomeData = {
  basic: {
    postcode: 'SW1A 1AA',
    homeType: 'terraced',
    occupants: 2,
    heatingType: 'gas',
  },
  
  standard: {
    postcode: 'M1 1AE',
    homeType: 'detached',
    occupants: 4,
    heatingType: 'electric',
    bedrooms: 4,
    floorArea: 150,
    constructionYear: 1995,
    insulationQuality: 'good',
  },
  
  advanced: {
    postcode: 'EH1 1YZ',
    homeType: 'semi-detached',
    occupants: 3,
    bedrooms: 3,
    constructionYear: 2010,
    floorArea: 120,
    heatingType: 'gas',
    insulationQuality: 'excellent',
    hasSolarPanels: true,
    solarCapacity: 6,
    hasSmartMeter: true,
    epcRating: 'B',
  },
};

/**
 * Mock API Responses
 * Use these when testing without real API connections
 */
export const mockAPIResponses = {
  weather: {
    current: {
      temperature: 12,
      feelsLike: 10,
      condition: 'Partly Cloudy',
      humidity: 75,
      windSpeed: 15,
    },
    daily: [
      { day: 'Mon', high: 14, low: 8, condition: 'Sunny' },
      { day: 'Tue', high: 13, low: 9, condition: 'Cloudy' },
      { day: 'Wed', high: 12, low: 7, condition: 'Rainy' },
      { day: 'Thu', high: 15, low: 10, condition: 'Sunny' },
      { day: 'Fri', high: 14, low: 9, condition: 'Partly Cloudy' },
      { day: 'Sat', high: 13, low: 8, condition: 'Cloudy' },
      { day: 'Sun', high: 16, low: 11, condition: 'Sunny' },
    ],
  },
  
  carbonIntensity: {
    current: {
      intensity: 150,
      rating: 'moderate',
    },
    forecast: [
      { time: '00:00', intensity: 120, rating: 'low' },
      { time: '06:00', intensity: 180, rating: 'moderate' },
      { time: '12:00', intensity: 200, rating: 'high' },
      { time: '18:00', intensity: 160, rating: 'moderate' },
      { time: '23:00', intensity: 130, rating: 'low' },
    ],
  },
  
  peerComparison: {
    userDailyCost: 3.85,
    regionalAverage: 4.20,
    nationalAverage: 4.50,
    percentile: 35, // User is in top 35% (lower is better)
    savingsVsRegional: 127.75, // Annual
    savingsVsNational: 237.25, // Annual
  },
  
  tariffComparison: {
    currentCost: 1405, // Annual
    bestFixedTariff: 1250,
    bestVariableTariff: 1320,
    potentialSaving: 155,
    switchingRecommended: true,
  },
};

/**
 * Usage Instructions:
 * 
 * 1. Import in your test file:
 *    import { mockUsers, mockHomeData } from '@/lib/mockData';
 * 
 * 2. Use for manual testing:
 *    - Sign up with test@costsaver.com / test123
 *    - Sign in and explore basic tier features
 * 
 * 3. Use for automated tests:
 *    - Create user with mockUsers[0]
 *    - Set localStorage('userHomeData', mockHomeData.basic)
 * 
 * 4. Test different tiers:
 *    - Basic: mockUsers[0] (25% complete)
 *    - Advanced: mockUsers[1] (65% complete)
 *    - Expert: mockUsers[2] (100% complete)
 * 
 * 5. API Mocking:
 *    - Use mockAPIResponses when APIs unavailable
 *    - Replace fetch calls with mock data
 */

// Export default for easy import
export default {
  users: mockUsers,
  homeData: mockHomeData,
  apiResponses: mockAPIResponses,
};
