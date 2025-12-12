/**
 * UserSavingsProfile v1
 * Canonical, versioned profile for all tools and onboarding
 */

export interface UserSavingsProfileV1 {
  version: 1;
  household: {
    occupants: number;
    homeType: 'flat' | 'terraced' | 'semi-detached' | 'detached' | string;
    postcode?: string;
    region?: string;
  };
  energy: {
    supplier?: string;
    tariff?: string;
    standingCharge?: number; // pence per day
    unitRate?: number; // pence per kWh
    paymentType?: 'direct-debit' | 'prepay' | 'credit' | string;
    usage?: number; // kWh
    cost?: number; // £
  };
  ev?: {
    hasEV: boolean;
    chargingPreference?: 'daily' | 'weekly' | 'occasional' | string;
  };
  solarInterest?: boolean;
  heatPumpInterest?: boolean;
  /**
   * Future-facing: user interest in other categories (broadband, insurance, flights, etc.)
   */
  interests?: string[];
  // Add more fields in v2+
}

export type UserSavingsProfile = UserSavingsProfileV1;
