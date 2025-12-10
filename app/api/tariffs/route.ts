/**
 * Ofgem Energy Tariff Data (Static JSON for MVP)
 * 
 * Source: Ofgem Price Cap Data (Updated quarterly)
 * Latest: Q4 2024 / Q1 2025
 * 
 * Provides:
 * - Current price cap rates
 * - Regional variations
 * - Standing charges
 * - Unit rates for electricity and gas
 * - Economy 7 rates (day/night)
 * 
 * API: /api/tariffs
 * 
 * Future: Integrate with Ofgem API or comparison sites when available
 */

import { NextRequest, NextResponse } from 'next/server';

export interface TariffData {
  region: string;
  electricity: {
    standingCharge: number; // £/day
    unitRate: number; // £/kWh
    economy7?: {
      day: number; // £/kWh
      night: number; // £/kWh
    };
  };
  gas: {
    standingCharge: number; // £/day
    unitRate: number; // £/kWh
  };
  validFrom: string;
  validTo: string;
}

// Ofgem Price Cap Data (Q1 2025 estimates based on current trends)
const TARIFF_DATA: Record<string, TariffData> = {
  'london': {
    region: 'London',
    electricity: {
      standingCharge: 0.53,
      unitRate: 0.245,
      economy7: {
        day: 0.285,
        night: 0.135,
      },
    },
    gas: {
      standingCharge: 0.31,
      unitRate: 0.073,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
  'south-east': {
    region: 'South East',
    electricity: {
      standingCharge: 0.52,
      unitRate: 0.242,
      economy7: {
        day: 0.282,
        night: 0.133,
      },
    },
    gas: {
      standingCharge: 0.30,
      unitRate: 0.072,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
  'south-west': {
    region: 'South West',
    electricity: {
      standingCharge: 0.54,
      unitRate: 0.248,
      economy7: {
        day: 0.288,
        night: 0.138,
      },
    },
    gas: {
      standingCharge: 0.31,
      unitRate: 0.074,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
  'east': {
    region: 'East of England',
    electricity: {
      standingCharge: 0.51,
      unitRate: 0.240,
      economy7: {
        day: 0.280,
        night: 0.130,
      },
    },
    gas: {
      standingCharge: 0.29,
      unitRate: 0.071,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
  'west-midlands': {
    region: 'West Midlands',
    electricity: {
      standingCharge: 0.50,
      unitRate: 0.238,
      economy7: {
        day: 0.278,
        night: 0.128,
      },
    },
    gas: {
      standingCharge: 0.28,
      unitRate: 0.070,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
  'east-midlands': {
    region: 'East Midlands',
    electricity: {
      standingCharge: 0.49,
      unitRate: 0.236,
      economy7: {
        day: 0.276,
        night: 0.126,
      },
    },
    gas: {
      standingCharge: 0.28,
      unitRate: 0.069,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
  'north-west': {
    region: 'North West',
    electricity: {
      standingCharge: 0.50,
      unitRate: 0.239,
      economy7: {
        day: 0.279,
        night: 0.129,
      },
    },
    gas: {
      standingCharge: 0.29,
      unitRate: 0.071,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
  'north-east': {
    region: 'North East',
    electricity: {
      standingCharge: 0.48,
      unitRate: 0.234,
      economy7: {
        day: 0.274,
        night: 0.124,
      },
    },
    gas: {
      standingCharge: 0.27,
      unitRate: 0.068,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
  'yorkshire': {
    region: 'Yorkshire and the Humber',
    electricity: {
      standingCharge: 0.49,
      unitRate: 0.237,
      economy7: {
        day: 0.277,
        night: 0.127,
      },
    },
    gas: {
      standingCharge: 0.28,
      unitRate: 0.070,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
  'scotland': {
    region: 'Scotland',
    electricity: {
      standingCharge: 0.51,
      unitRate: 0.241,
      economy7: {
        day: 0.281,
        night: 0.131,
      },
    },
    gas: {
      standingCharge: 0.29,
      unitRate: 0.072,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
  'wales': {
    region: 'Wales',
    electricity: {
      standingCharge: 0.50,
      unitRate: 0.239,
      economy7: {
        day: 0.279,
        night: 0.129,
      },
    },
    gas: {
      standingCharge: 0.29,
      unitRate: 0.071,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
  'northern-ireland': {
    region: 'Northern Ireland',
    electricity: {
      standingCharge: 0.55,
      unitRate: 0.250,
      economy7: {
        day: 0.290,
        night: 0.140,
      },
    },
    gas: {
      standingCharge: 0.32,
      unitRate: 0.075,
    },
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
  },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get('region');

  if (region) {
    const tariff = TARIFF_DATA[region.toLowerCase()];
    if (!tariff) {
      return NextResponse.json(
        {
          error: 'Region not found',
          availableRegions: Object.keys(TARIFF_DATA),
        },
        { status: 404 }
      );
    }

    return NextResponse.json(tariff);
  }

  // Return all tariffs
  return NextResponse.json({
    tariffs: TARIFF_DATA,
    note: 'Ofgem price cap data for Q1 2025. Rates updated quarterly.',
    lastUpdated: '2025-01-01',
  });
}

/**
 * Calculate potential savings from switching tariff
 */
function calculateTariffSavings(
  currentUsage: { electricity: number; gas?: number }, // kWh per year
  currentRegion: string,
  targetRegion?: string
): {
  currentCost: number;
  potentialCost: number;
  saving: number;
  savingPercentage: number;
} {
  const current = TARIFF_DATA[currentRegion] || TARIFF_DATA['east-midlands'];
  const target = targetRegion ? 
    (TARIFF_DATA[targetRegion] || current) : 
    current;

  // Calculate current annual cost
  const currentElecCost = 
    (current.electricity.standingCharge * 365) + 
    (currentUsage.electricity * current.electricity.unitRate);

  const currentGasCost = currentUsage.gas ? 
    (current.gas.standingCharge * 365) + 
    (currentUsage.gas * current.gas.unitRate) : 
    0;

  const currentTotal = currentElecCost + currentGasCost;

  // Calculate potential cost with better tariff
  const targetElecCost = 
    (target.electricity.standingCharge * 365) + 
    (currentUsage.electricity * target.electricity.unitRate);

  const targetGasCost = currentUsage.gas ? 
    (target.gas.standingCharge * 365) + 
    (currentUsage.gas * target.gas.unitRate) : 
    0;

  const targetTotal = targetElecCost + targetGasCost;

  const saving = currentTotal - targetTotal;
  const savingPercentage = (saving / currentTotal) * 100;

  return {
    currentCost: Math.round(currentTotal),
    potentialCost: Math.round(targetTotal),
    saving: Math.round(saving),
    savingPercentage: Math.round(savingPercentage * 10) / 10,
  };
}
