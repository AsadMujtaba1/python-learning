/**
 * Comprehensive User Profile Types
 * Progressive disclosure system: Basic → Standard → Advanced → Expert
 */

// ============================================================================
// TIER 1: BASIC (Required - Minimum for any analysis)
// ============================================================================

export interface BasicProfile {
  postcode: string;
  homeType: 'flat' | 'terraced' | 'semi-detached' | 'detached';
  occupants: number;
}

// ============================================================================
// TIER 2: STANDARD (Optional - Improves accuracy by 30%)
// ============================================================================

export interface StandardProfile extends BasicProfile {
  // Home characteristics
  bedrooms?: number; // 1-10
  totalFloorArea?: number; // Square meters
  constructionYear?: number;
  numberOfFloors?: number; // 1-4
  
  // Heating & insulation
  heatingType?: 'gas' | 'electric' | 'oil' | 'heat-pump';
  hasDoubleGlazing?: boolean;
  wallInsulation?: 'none' | 'cavity' | 'solid' | 'external';
  loftInsulation?: 'none' | 'partial' | 'full';
  
  // Energy sources
  hasGas?: boolean;
  hasElectricity?: boolean;
  hasSolarPanels?: boolean;
  solarPanelCapacity?: number; // kW
  
  // Lifestyle
  workFromHome?: boolean;
  typicalOccupancyHours?: 'all-day' | 'evenings-weekends' | 'minimal';
}

// ============================================================================
// TIER 3: ADVANCED (Optional - Improves accuracy by 50% + unlocks comparisons)
// ============================================================================

export interface AdvancedProfile extends StandardProfile {
  // Tariff information
  electricityProvider?: string;
  electricityTariffName?: string;
  electricityTariffType?: 'fixed' | 'variable' | 'tracker' | 'economy-7' | 'economy-10';
  electricityUnitRate?: number; // pence per kWh
  electricityStandingCharge?: number; // pence per day
  electricityContractEndDate?: string; // ISO date
  
  gasProvider?: string;
  gasTariffName?: string;
  gasTariffType?: 'fixed' | 'variable' | 'tracker';
  gasUnitRate?: number; // pence per kWh
  gasStandingCharge?: number; // pence per day
  gasContractEndDate?: string; // ISO date
  
  // Historical usage (if known)
  annualElectricityUsage?: number; // kWh per year
  annualGasUsage?: number; // kWh per year
  averageMonthlyBill?: number; // £
  
  // Smart meter
  hasSmartMeter?: boolean;
  smartMeterType?: 'SMETS1' | 'SMETS2';
  smartMeterIHDAccess?: boolean; // In-Home Display
  
  // Bills uploaded
  hasBillsUploaded?: boolean;
  lastBillUploadDate?: string;
  billUploadCount?: number;
}

// ============================================================================
// TIER 4: EXPERT (Optional - Maximum accuracy + predictive analytics)
// ============================================================================

export interface ExpertProfile extends AdvancedProfile {
  // Appliances inventory
  appliances?: Appliance[];
  
  // Heating schedule
  heatingSchedule?: HeatingSchedule;
  targetTemperature?: number; // Celsius
  hasSmartThermostat?: boolean;
  smartThermostatBrand?: string;
  
  // Hot water
  hotWaterSystem?: 'combi-boiler' | 'system-boiler' | 'immersion' | 'heat-pump';
  hotWaterSchedule?: HotWaterSchedule;
  
  // Electric vehicle
  hasElectricVehicle?: boolean;
  evBatterySize?: number; // kWh
  evChargingFrequency?: 'daily' | 'weekly' | 'occasional';
  hasHomeCharger?: boolean;
  homeChargerPower?: number; // kW
  
  // Cooking
  cookingMethod?: 'gas' | 'electric' | 'induction' | 'mixed';
  ovenType?: 'gas' | 'electric';
  
  // Renewable energy
  hasBatteryStorage?: boolean;
  batteryStorageCapacity?: number; // kWh
  hasWindTurbine?: boolean;
  windTurbineCapacity?: number; // kW
  
  // Energy export
  exportsToGrid?: boolean;
  exportTariffRate?: number; // pence per kWh
  exportTariffProvider?: string;
  
  // Budget & goals
  monthlyBudget?: number; // £
  savingsGoal?: number; // £ per year
  priorityGoal?: 'cost' | 'carbon' | 'comfort' | 'balanced';
  
  // Smart home integration
  hasSmartHome?: boolean;
  smartHomeDevices?: string[]; // ['hue-lights', 'nest-thermostat', 'smart-plugs']
  canIntegrateAPIs?: boolean;
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface Appliance {
  id: string;
  type: 'fridge' | 'freezer' | 'washing-machine' | 'tumble-dryer' | 'dishwasher' | 
        'tv' | 'computer' | 'oven' | 'microwave' | 'kettle' | 'gaming-console' | 
        'dehumidifier' | 'air-conditioner' | 'electric-heater' | 'other';
  brand?: string;
  model?: string;
  powerRating?: number; // Watts
  energyRating?: 'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  estimatedDailyUsage?: number; // hours
  age?: number; // years
  quantity?: number; // e.g., 3 TVs
}

export interface HeatingSchedule {
  weekday?: DaySchedule;
  weekend?: DaySchedule;
  // Or per-day schedules
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  periods: TimePeriod[];
}

export interface TimePeriod {
  startTime: string; // "06:00"
  endTime: string; // "08:00"
  temperature: number; // Celsius
}

export interface HotWaterSchedule {
  weekday?: { morning?: boolean; evening?: boolean };
  weekend?: { morning?: boolean; midday?: boolean; evening?: boolean };
}

// ============================================================================
// BILL UPLOAD TYPES
// ============================================================================

export interface EnergyBill {
  id: string;
  userId: string;
  uploadDate: string;
  billDate: string;
  billPeriodStart: string;
  billPeriodEnd: string;
  provider: string;
  energyType: 'electricity' | 'gas' | 'dual';
  fileUrl?: string;
  fileName?: string;
  
  // Extracted data
  electricityUsage?: number; // kWh
  electricityDays?: number;
  electricityCost?: number; // £
  electricityUnitRate?: number; // p/kWh
  electricityStandingCharge?: number; // p/day
  
  gasUsage?: number; // kWh
  gasDays?: number;
  gasCost?: number; // £
  gasUnitRate?: number; // p/kWh
  gasStandingCharge?: number; // p/day
  
  totalCost: number; // £
  
  // OCR metadata
  extractedText?: string;
  ocrConfidence?: number; // 0-1
  manuallyVerified?: boolean;
  needsReview?: boolean;
}

// ============================================================================
// DATA COMPLETENESS TRACKING
// ============================================================================

export interface ProfileCompleteness {
  tier: 'basic' | 'standard' | 'advanced' | 'expert';
  percentage: number; // 0-100
  missingFields: {
    category: string;
    fields: string[];
    impact: string; // What analysis this unlocks
  }[];
  recommendations: string[]; // What to add next
}

// ============================================================================
// ANALYSIS CAPABILITIES BASED ON DATA TIER
// ============================================================================

export interface AnalysisCapabilities {
  // Basic tier unlocks
  basicCostEstimate: boolean;
  weatherImpact: boolean;
  regionalComparison: boolean;
  carbonIntensity: boolean;
  
  // Standard tier unlocks
  accurateHeatingCost: boolean;
  epcComparison: boolean;
  insulationRecommendations: boolean;
  seasonalForecasts: boolean;
  
  // Advanced tier unlocks
  tariffComparison: boolean;
  switchingSavings: boolean;
  contractEndReminders: boolean;
  billAccuracyCheck: boolean;
  historicalTrends: boolean;
  
  // Expert tier unlocks
  applianceBreakdown: boolean;
  optimizedScheduling: boolean;
  evChargingOptimization: boolean;
  solarROI: boolean;
  batteryOptimization: boolean;
  smartHomeIntegration: boolean;
  predictiveAnalytics: boolean;
  peakAvoidance: boolean;
}

// ============================================================================
// FULL USER PROFILE (Union type)
// ============================================================================

export type UserProfile = BasicProfile | StandardProfile | AdvancedProfile | ExpertProfile;

// ============================================================================
// PROFILE SECTION METADATA (for UI rendering)
// ============================================================================

export interface ProfileSection {
  id: string;
  title: string;
  description: string;
  tier: 'standard' | 'advanced' | 'expert';
  icon: string;
  fields: ProfileField[];
  unlocks: string[]; // What analysis this enables
  estimatedTime: string; // "2 minutes"
  priority: number; // 1-10
}

export interface ProfileField {
  key: keyof ExpertProfile;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'file' | 'multi-select' | 'time' | 'custom';
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  helpText?: string;
  dependsOn?: { field: keyof ExpertProfile; value: any };
}

// ============================================================================
// PROFILE SECTIONS CONFIGURATION
// ============================================================================

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'home-details',
    title: 'Home Details',
    description: 'Physical characteristics of your property',
    tier: 'standard',
    icon: '🏠',
    priority: 10,
    estimatedTime: '2 minutes',
    unlocks: ['Accurate heating cost calculations', 'Insulation recommendations', 'EPC comparison'],
    fields: [
      { key: 'bedrooms', label: 'Number of Bedrooms', type: 'number', validation: { min: 1, max: 10 } },
      { key: 'totalFloorArea', label: 'Total Floor Area (m²)', type: 'number', helpText: 'Approximate size of your home' },
      { key: 'constructionYear', label: 'Year Built', type: 'number', validation: { min: 1800, max: 2025 } },
      { key: 'numberOfFloors', label: 'Number of Floors', type: 'number', validation: { min: 1, max: 4 } },
    ],
  },
  {
    id: 'heating-insulation',
    title: 'Heating & Insulation',
    description: 'How your home is heated and insulated',
    tier: 'standard',
    icon: '🔥',
    priority: 9,
    estimatedTime: '3 minutes',
    unlocks: ['Heat loss analysis', 'Insulation upgrade ROI', 'Heating schedule optimization'],
    fields: [
      { 
        key: 'heatingType', 
        label: 'Primary Heating', 
        type: 'select',
        options: [
          { value: 'gas', label: 'Gas Boiler' },
          { value: 'electric', label: 'Electric Heating' },
          { value: 'oil', label: 'Oil Boiler' },
          { value: 'heat-pump', label: 'Heat Pump' },
        ]
      },
      { key: 'hasDoubleGlazing', label: 'Double Glazing', type: 'boolean' },
      { 
        key: 'wallInsulation', 
        label: 'Wall Insulation', 
        type: 'select',
        options: [
          { value: 'none', label: 'None' },
          { value: 'cavity', label: 'Cavity Wall' },
          { value: 'solid', label: 'Solid Wall' },
          { value: 'external', label: 'External' },
        ]
      },
      { 
        key: 'loftInsulation', 
        label: 'Loft Insulation', 
        type: 'select',
        options: [
          { value: 'none', label: 'None' },
          { value: 'partial', label: 'Partial (<100mm)' },
          { value: 'full', label: 'Full (270mm+)' },
        ]
      },
    ],
  },
  {
    id: 'energy-sources',
    title: 'Energy Sources',
    description: 'Electricity, gas, and renewable energy',
    tier: 'standard',
    icon: '⚡',
    priority: 8,
    estimatedTime: '2 minutes',
    unlocks: ['Fuel mix analysis', 'Solar ROI calculator', 'Export earnings'],
    fields: [
      { key: 'hasGas', label: 'Gas Connection', type: 'boolean' },
      { key: 'hasElectricity', label: 'Electricity Supply', type: 'boolean' },
      { key: 'hasSolarPanels', label: 'Solar Panels', type: 'boolean' },
      { 
        key: 'solarPanelCapacity', 
        label: 'Solar Panel Capacity (kW)', 
        type: 'number',
        dependsOn: { field: 'hasSolarPanels', value: true }
      },
    ],
  },
  {
    id: 'tariffs-electricity',
    title: 'Electricity Tariff',
    description: 'Your electricity provider and pricing',
    tier: 'advanced',
    icon: '💡',
    priority: 7,
    estimatedTime: '4 minutes',
    unlocks: ['Tariff comparison', 'Switching savings', 'Contract end alerts'],
    fields: [
      { key: 'electricityProvider', label: 'Provider', type: 'text', placeholder: 'e.g., British Gas' },
      { key: 'electricityTariffName', label: 'Tariff Name', type: 'text', placeholder: 'e.g., Fixed Energy Oct 2024' },
      { 
        key: 'electricityTariffType', 
        label: 'Tariff Type', 
        type: 'select',
        options: [
          { value: 'fixed', label: 'Fixed Rate' },
          { value: 'variable', label: 'Variable Rate' },
          { value: 'tracker', label: 'Tracker' },
          { value: 'economy-7', label: 'Economy 7' },
          { value: 'economy-10', label: 'Economy 10' },
        ]
      },
      { key: 'electricityUnitRate', label: 'Unit Rate (p/kWh)', type: 'number', helpText: 'Check your bill' },
      { key: 'electricityStandingCharge', label: 'Standing Charge (p/day)', type: 'number' },
      { key: 'electricityContractEndDate', label: 'Contract End Date', type: 'date' },
    ],
  },
  {
    id: 'tariffs-gas',
    title: 'Gas Tariff',
    description: 'Your gas provider and pricing',
    tier: 'advanced',
    icon: '🔥',
    priority: 6,
    estimatedTime: '4 minutes',
    unlocks: ['Dual fuel comparison', 'Gas vs electricity cost analysis'],
    fields: [
      { key: 'gasProvider', label: 'Provider', type: 'text', placeholder: 'e.g., British Gas' },
      { key: 'gasTariffName', label: 'Tariff Name', type: 'text' },
      { 
        key: 'gasTariffType', 
        label: 'Tariff Type', 
        type: 'select',
        options: [
          { value: 'fixed', label: 'Fixed Rate' },
          { value: 'variable', label: 'Variable Rate' },
          { value: 'tracker', label: 'Tracker' },
        ]
      },
      { key: 'gasUnitRate', label: 'Unit Rate (p/kWh)', type: 'number' },
      { key: 'gasStandingCharge', label: 'Standing Charge (p/day)', type: 'number' },
      { key: 'gasContractEndDate', label: 'Contract End Date', type: 'date' },
    ],
  },
  {
    id: 'historical-usage',
    title: 'Historical Usage',
    description: 'Your past energy consumption',
    tier: 'advanced',
    icon: '📊',
    priority: 5,
    estimatedTime: '2 minutes',
    unlocks: ['Accurate forecasting', 'Year-on-year comparison', 'Usage anomaly detection'],
    fields: [
      { key: 'annualElectricityUsage', label: 'Annual Electricity (kWh)', type: 'number', helpText: 'Check annual statement' },
      { key: 'annualGasUsage', label: 'Annual Gas (kWh)', type: 'number' },
      { key: 'averageMonthlyBill', label: 'Average Monthly Bill (£)', type: 'number' },
    ],
  },
  {
    id: 'smart-meter',
    title: 'Smart Meter',
    description: 'Smart meter information',
    tier: 'advanced',
    icon: '📱',
    priority: 4,
    estimatedTime: '1 minute',
    unlocks: ['Real-time monitoring integration', 'Half-hourly data analysis'],
    fields: [
      { key: 'hasSmartMeter', label: 'Have Smart Meter', type: 'boolean' },
      { 
        key: 'smartMeterType', 
        label: 'Smart Meter Type', 
        type: 'select',
        options: [
          { value: 'SMETS1', label: 'SMETS1 (1st Generation)' },
          { value: 'SMETS2', label: 'SMETS2 (2nd Generation)' },
        ],
        dependsOn: { field: 'hasSmartMeter', value: true }
      },
      { key: 'smartMeterIHDAccess', label: 'Have In-Home Display', type: 'boolean', dependsOn: { field: 'hasSmartMeter', value: true } },
    ],
  },
  {
    id: 'appliances',
    title: 'Appliances Inventory',
    description: 'Track your electrical appliances',
    tier: 'expert',
    icon: '🔌',
    priority: 3,
    estimatedTime: '10 minutes',
    unlocks: ['Appliance-level breakdown', 'Upgrade recommendations', 'Old appliance cost calculator'],
    fields: [
      { key: 'appliances', label: 'Appliances', type: 'custom', helpText: 'Add your major appliances' },
    ],
  },
  {
    id: 'electric-vehicle',
    title: 'Electric Vehicle',
    description: 'EV charging information',
    tier: 'expert',
    icon: '🚗',
    priority: 2,
    estimatedTime: '3 minutes',
    unlocks: ['EV charging cost', 'Optimal charging times', 'EV tariff comparison'],
    fields: [
      { key: 'hasElectricVehicle', label: 'Own Electric Vehicle', type: 'boolean' },
      { key: 'evBatterySize', label: 'Battery Size (kWh)', type: 'number', dependsOn: { field: 'hasElectricVehicle', value: true } },
      { 
        key: 'evChargingFrequency', 
        label: 'Charging Frequency', 
        type: 'select',
        options: [
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'occasional', label: 'Occasional' },
        ],
        dependsOn: { field: 'hasElectricVehicle', value: true }
      },
      { key: 'hasHomeCharger', label: 'Home Charger', type: 'boolean', dependsOn: { field: 'hasElectricVehicle', value: true } },
      { key: 'homeChargerPower', label: 'Charger Power (kW)', type: 'number', dependsOn: { field: 'hasHomeCharger', value: true } },
    ],
  },
  {
    id: 'heating-schedule',
    title: 'Heating Schedule',
    description: 'When and how you heat your home',
    tier: 'expert',
    icon: '🌡️',
    priority: 1,
    estimatedTime: '5 minutes',
    unlocks: ['Heating schedule optimization', 'Setback temperature savings', 'Smart thermostat integration'],
    fields: [
      { key: 'heatingSchedule', label: 'Heating Times', type: 'custom', helpText: 'Set your heating schedule' },
      { key: 'targetTemperature', label: 'Target Temperature (°C)', type: 'number', validation: { min: 15, max: 25 } },
      { key: 'hasSmartThermostat', label: 'Smart Thermostat', type: 'boolean' },
      { key: 'smartThermostatBrand', label: 'Thermostat Brand', type: 'text', placeholder: 'e.g., Nest, Hive', dependsOn: { field: 'hasSmartThermostat', value: true } },
    ],
  },
];
