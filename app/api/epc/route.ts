/**
 * EPC (Energy Performance Certificate) Open Data API
 * 
 * FREE, NO KEY REQUIRED (but rate limited)
 * 
 * Provides:
 * - Property energy rating (A-G)
 * - Current energy efficiency score
 * - Potential energy efficiency score
 * - Construction age band
 * - Wall/roof/window descriptions
 * - Heating cost estimates
 * - Recommended improvements
 * 
 * API: https://epc.opendatacommunities.org/
 * Docs: https://epc.opendatacommunities.org/docs/api
 * 
 * Rate Limit: 500 requests per 24 hours
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout, retry } from '@/lib/utils/errorHandling';
import { CacheManager } from '@/lib/utils/caching';
import { API } from '@/lib/utils/constants';
import { sanitizePostcode } from '@/lib/utils/validation';

const cache = new CacheManager();

interface EPCData {
  address: string;
  postcode: string;
  rating: string; // A-G
  currentEnergyEfficiency: number; // 1-100
  potentialEnergyEfficiency: number; // 1-100
  currentEnvironmentalImpact: number;
  constructionAgeBand: string;
  propertyType: string;
  builtForm: string;
  totalFloorArea: number;
  // Heating
  heatingCostCurrent: number;
  heatingCostPotential: number;
  hotWaterCostCurrent: number;
  mainHeatDescription: string;
  mainFuelType: string;
  // Building components
  wallsDescription: string;
  wallsEnergyEff: string;
  roofDescription: string;
  roofEnergyEff: string;
  windowsDescription: string;
  windowsEnergyEff: string;
  // Recommendations
  recommendations: Array<{
    improvement: string;
    indicativeCost: string;
  }>;
  inspectionDate: string;
  lodgementDate: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postcode = searchParams.get('postcode');

    if (!postcode) {
      return NextResponse.json(
        { error: 'Postcode is required' },
        { status: 400 }
      );
    }

    const sanitized = sanitizePostcode(postcode);
    if (!sanitized) {
      return NextResponse.json(
        { error: 'Invalid UK postcode format' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `epc:${sanitized}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    // EPC API endpoint
    const url = `https://epc.opendatacommunities.org/api/v1/domestic/search?postcode=${encodeURIComponent(sanitized)}&size=1`;

    // Fetch with retry logic (API can be flaky)
    const response = await retry(
      async () => {
        const res = await withTimeout(
          fetch(url, {
            headers: {
              'Accept': 'application/json',
            },
          }),
          API.TIMEOUT_DEFAULT * 2 // EPC API is slower
        );

        if (res.status === 429) {
          throw new Error('Rate limit exceeded');
        }

        if (!res.ok) {
          throw new Error(`EPC API error: ${res.status}`);
        }

        return res;
      },
      {
        maxRetries: 2,
        delay: 2000,
        backoff: 2,
      }
    );

    const data = await response.json();

    if (!data.rows || data.rows.length === 0) {
      return NextResponse.json(
        {
          error: 'No EPC data found for this postcode',
          message: 'This property may not have an Energy Performance Certificate on record. Properties built before 2008 or never sold/rented may not have EPCs.',
        },
        { status: 404 }
      );
    }

    // Get the most recent certificate
    const epc = data.rows[0];

    // Parse recommendations
    const recommendations = [];
    for (let i = 1; i <= 3; i++) {
      const improvement = epc[`improvement-item-${i}`];
      const cost = epc[`improvement-cost-${i}`];
      if (improvement) {
        recommendations.push({
          improvement,
          indicativeCost: cost || 'Not specified',
        });
      }
    }

    const formattedData: EPCData = {
      address: epc.address,
      postcode: epc.postcode,
      rating: epc['current-energy-rating'],
      currentEnergyEfficiency: parseInt(epc['current-energy-efficiency']),
      potentialEnergyEfficiency: parseInt(epc['potential-energy-efficiency']),
      currentEnvironmentalImpact: parseInt(epc['environmental-impact-current']),
      constructionAgeBand: epc['construction-age-band'],
      propertyType: epc['property-type'],
      builtForm: epc['built-form'],
      totalFloorArea: parseFloat(epc['total-floor-area']),
      // Heating
      heatingCostCurrent: parseFloat(epc['heating-cost-current']) || 0,
      heatingCostPotential: parseFloat(epc['heating-cost-potential']) || 0,
      hotWaterCostCurrent: parseFloat(epc['hot-water-cost-current']) || 0,
      mainHeatDescription: epc['main-heat-description'],
      mainFuelType: epc['main-fuel'],
      // Building components
      wallsDescription: epc['walls-description'],
      wallsEnergyEff: epc['walls-energy-eff'],
      roofDescription: epc['roof-description'],
      roofEnergyEff: epc['roof-energy-eff'],
      windowsDescription: epc['windows-description'],
      windowsEnergyEff: epc['windows-energy-eff'],
      // Recommendations
      recommendations,
      inspectionDate: epc['inspection-date'],
      lodgementDate: epc['lodgement-date'],
    };

    // Cache for 30 days (EPCs change infrequently)
    cache.set(cacheKey, formattedData);

    return NextResponse.json(formattedData);

  } catch (error: any) {
    console.error('EPC API error:', error);

    if (error.message?.includes('Rate limit')) {
      return NextResponse.json(
        {
          error: 'EPC API rate limit exceeded',
          message: 'The free EPC API has a limit of 500 requests per day. Please try again later.',
          fallback: 'estimate',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: handleApiError(error, '/api/epc').userMessage,
        fallback: 'estimate',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to estimate EPC rating from construction year
 * Used as fallback when EPC data unavailable
 */
function estimateEPCFromConstructionYear(constructionYear: number): {
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
