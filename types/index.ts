// User and Home Data Types
export interface UserHomeData {
  postcode: string;
  homeType: 'flat' | 'terraced' | 'semi-detached' | 'detached';
  occupants: number;
  heatingType: 'gas' | 'electricity' | 'heat-pump' | 'mixed';
}

// Energy Cost Data
export interface EnergyCostData {
  dailyCost: number;
  monthlyCost: number;
  yearlyEstimate: number;
  breakdown: {
    heating: number;
    electricity: number;
    other: number;
  };
}

// Weather Data
export interface WeatherData {
  temperature: number;
  condition: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
}

// Saving Tip
export interface SavingTip {
  id: string;
  title: string;
  description: string;
  potentialSaving: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

// Forecast Data
export interface ForecastData {
  date: string;
  estimatedCost: number;
  temperature: number;
}
