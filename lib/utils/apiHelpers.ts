/**
 * Shared helper functions for API routes
 */

// Currency symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] || code;
}

// Weather descriptions
export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
}

// Postcode to region mapping
export function postcodeToRegion(postcode: string): string {
  const prefix = postcode.toUpperCase().replace(/\s/g, '').substring(0, 2);
  
  // England regions
  const regionMap: Record<string, string> = {
    // London
    E: 'London',
    EC: 'London',
    N: 'London',
    NW: 'London',
    SE: 'London',
    SW: 'London',
    W: 'London',
    WC: 'London',
    
    // South East
    BR: 'South East',
    CR: 'South East',
    DA: 'South East',
    GU: 'South East',
    KT: 'South East',
    ME: 'South East',
    OX: 'South East',
    RG: 'South East',
    RH: 'South East',
    SL: 'South East',
    SM: 'South East',
    TN: 'South East',
    
    // South West
    BA: 'South West',
    BH: 'South West',
    BS: 'South West',
    DT: 'South West',
    EX: 'South West',
    GL: 'South West',
    PL: 'South West',
    SP: 'South West',
    TA: 'South West',
    TQ: 'South West',
    TR: 'South West',
    
    // Midlands
    B: 'West Midlands',
    CV: 'West Midlands',
    DY: 'West Midlands',
    HR: 'West Midlands',
    LE: 'East Midlands',
    NG: 'East Midlands',
    NN: 'East Midlands',
    DE: 'East Midlands',
    
    // North
    BD: 'Yorkshire',
    DN: 'Yorkshire',
    HD: 'Yorkshire',
    HG: 'Yorkshire',
    HU: 'Yorkshire',
    HX: 'Yorkshire',
    LS: 'Yorkshire',
    S: 'Yorkshire',
    WF: 'Yorkshire',
    YO: 'Yorkshire',
    
    // North West
    BB: 'North West',
    BL: 'North West',
    CA: 'North West',
    CH: 'North West',
    FY: 'North West',
    L: 'North West',
    LA: 'North West',
    M: 'North West',
    OL: 'North West',
    PR: 'North West',
    SK: 'North West',
    WA: 'North West',
    WN: 'North West',
    
    // North East
    DH: 'North East',
    DL: 'North East',
    NE: 'North East',
    SR: 'North East',
    TS: 'North East',
    
    // Scotland
    AB: 'Scotland',
    DD: 'Scotland',
    DG: 'Scotland',
    EH: 'Scotland',
    FK: 'Scotland',
    G: 'Scotland',
    HS: 'Scotland',
    IV: 'Scotland',
    KA: 'Scotland',
    KW: 'Scotland',
    KY: 'Scotland',
    ML: 'Scotland',
    PA: 'Scotland',
    PH: 'Scotland',
    TD: 'Scotland',
    ZE: 'Scotland',
    
    // Wales
    CF: 'Wales',
    LD: 'Wales',
    LL: 'Wales',
    NP: 'Wales',
    SA: 'Wales',
    SY: 'Wales',
    
    // Northern Ireland
    BT: 'Northern Ireland',
  };
  
  return regionMap[prefix] || 'Unknown';
}

// Location helpers
export interface LocationData {
  country: string;
  city?: string;
  region?: string;
  postal?: string;
}

export function isUKUser(locationData: LocationData): boolean {
  const ukCountries = ['GB', 'UK', 'United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland'];
  return ukCountries.includes(locationData.country);
}

export function suggestPostcodeFromLocation(locationData: LocationData): string | null {
  if (locationData.postal) {
    return locationData.postal;
  }
  
  // Major UK cities default postcodes
  const cityDefaults: Record<string, string> = {
    'London': 'SW1A 1AA',
    'Manchester': 'M1 1AA',
    'Birmingham': 'B1 1AA',
    'Leeds': 'LS1 1AA',
    'Glasgow': 'G1 1AA',
    'Edinburgh': 'EH1 1AA',
    'Liverpool': 'L1 1AA',
    'Bristol': 'BS1 1AA',
    'Cardiff': 'CF10 1AA',
    'Belfast': 'BT1 1AA',
  };
  
  if (locationData.city && cityDefaults[locationData.city]) {
    return cityDefaults[locationData.city];
  }
  
  return null;
}

// EPC estimation
export function estimateEPCFromConstructionYear(constructionYear: number): {
  rating: string;
  efficiency: number;
  description: string;
} {
  if (constructionYear >= 2010) {
    return {
      rating: 'B',
      efficiency: 85,
      description: 'Modern construction with good insulation standards',
    };
  } else if (constructionYear >= 2000) {
    return {
      rating: 'C',
      efficiency: 70,
      description: 'Relatively modern with decent energy efficiency',
    };
  } else if (constructionYear >= 1980) {
    return {
      rating: 'D',
      efficiency: 55,
      description: 'Older property with moderate insulation',
    };
  } else if (constructionYear >= 1960) {
    return {
      rating: 'E',
      efficiency: 40,
      description: 'Older property with poor insulation',
    };
  } else {
    return {
      rating: 'F',
      efficiency: 25,
      description: 'Very old property with minimal insulation',
    };
  }
}

// Tariff savings calculation
export interface TariffData {
  name: string;
  provider: string;
  standingCharge: number;
  unitRate: number;
  isVariable: boolean;
  exitFee?: number;
}

export function calculateTariffSavings(
  currentTariff: TariffData,
  newTariff: TariffData,
  annualUsageKwh: number
): {
  annualSaving: number;
  percentageSaving: number;
  paybackMonths: number;
} {
  const currentAnnualCost = 
    (currentTariff.standingCharge * 365) + 
    (currentTariff.unitRate * annualUsageKwh);
  
  const newAnnualCost = 
    (newTariff.standingCharge * 365) + 
    (newTariff.unitRate * annualUsageKwh);
  
  const annualSaving = currentAnnualCost - newAnnualCost;
  const percentageSaving = (annualSaving / currentAnnualCost) * 100;
  
  // Factor in exit fees
  const effectiveExitFee = currentTariff.exitFee || 0;
  const paybackMonths = effectiveExitFee > 0 
    ? (effectiveExitFee / (annualSaving / 12))
    : 0;
  
  return {
    annualSaving: Math.round(annualSaving * 100) / 100,
    percentageSaving: Math.round(percentageSaving * 10) / 10,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
  };
}
