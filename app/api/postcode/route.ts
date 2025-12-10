/**
 * ENHANCED POSTCODE LOOKUP API
 * 
 * Provides comprehensive postcode information including coordinates,
 * region, district, and other geographical data.
 * 
 * API: https://postcodes.io (FREE - No API key required)
 * 
 * @route /api/postcode
 */

import { NextRequest, NextResponse } from 'next/server';
import { withTimeout } from '@/lib/utils/errorHandling';
import { cache } from '@/lib/utils/caching';
import { API } from '@/lib/utils/constants';
import { sanitizePostcode, isValidPostcode } from '@/lib/utils/validation';

interface PostcodeResponse {
  postcode: string;
  valid: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  region: string;
  district: string;
  ward: string;
  country: string;
  parliamentaryConstituency: string;
  eastings: number;
  northings: number;
  adminArea: {
    district: string;
    county: string;
    region: string;
  };
  codes: {
    adminDistrict: string;
    adminCounty: string;
    adminWard: string;
    parish: string;
  };
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

    // Validate and sanitize postcode
    const sanitized = sanitizePostcode(postcode);
    
    if (!sanitized) {
      return NextResponse.json(
        { 
          error: 'Invalid UK postcode',
          valid: false,
        },
        { status: 400 }
      );
    }

    // Use caching to avoid repeated API calls (7 days TTL)
    const cacheKey = `postcode:${sanitized}`;
    
    const data = await cache(
      async () => {
        const url = `${API.EXTERNAL_APIS.POSTCODES_IO}/postcodes/${encodeURIComponent(sanitized)}`;
        
        const response = await withTimeout(
          fetch(url),
          API.TIMEOUT_DEFAULT
        );

        if (!response.ok) {
          if (response.status === 404) {
            return {
              postcode: sanitized,
              valid: false,
              error: 'Postcode not found',
            };
          }
          throw new Error(`Postcodes.io API error: ${response.status}`);
        }

        const apiData = await response.json();
        
        if (apiData.status !== 200 || !apiData.result) {
          return {
            postcode: sanitized,
            valid: false,
            error: 'Postcode not found',
          };
        }

        const result = apiData.result;

        // Format response
        const postcodeResponse: PostcodeResponse = {
          postcode: result.postcode,
          valid: true,
          coordinates: {
            latitude: result.latitude,
            longitude: result.longitude,
          },
          region: result.region,
          district: result.admin_district,
          ward: result.admin_ward,
          country: result.country,
          parliamentaryConstituency: result.parliamentary_constituency,
          eastings: result.eastings,
          northings: result.northings,
          adminArea: {
            district: result.admin_district,
            county: result.admin_county || '',
            region: result.region,
          },
          codes: {
            adminDistrict: result.codes?.admin_district || '',
            adminCounty: result.codes?.admin_county || '',
            adminWard: result.codes?.admin_ward || '',
            parish: result.codes?.parish || '',
          },
        };

        return postcodeResponse;
      },
      {
        key: cacheKey,
        ttl: API.CACHE_POSTCODE, // 7 days
        persistent: true,
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('Postcode API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to lookup postcode',
        valid: false,
      },
      { status: 500 }
    );
  }
}

/**
 * Validate postcode endpoint (lightweight check)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postcode } = body;

    if (!postcode) {
      return NextResponse.json(
        { error: 'Postcode is required' },
        { status: 400 }
      );
    }

    const sanitized = sanitizePostcode(postcode);
    const valid = isValidPostcode(postcode);

    return NextResponse.json({
      postcode: sanitized || postcode,
      valid,
      sanitized: sanitized,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation error' },
      { status: 500 }
    );
  }
}
