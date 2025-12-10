/**
 * IPAPI Geolocation Service (FREE, NO KEY REQUIRED)
 * 
 * Provides:
 * - User's IP address
 * - Approximate location (city, region, country)
 * - Timezone
 * - Currency
 * - Connection info (ISP, org)
 * 
 * API: https://ipapi.co/
 * Docs: https://ipapi.co/api/
 * 
 * Rate Limit: 1,000 requests/day (free tier)
 * 
 * Use cases:
 * - Auto-detect user's region for regional pricing
 * - Suggest postcode if user is in UK
 * - Auto-set timezone for accurate solar calculations
 * - Detect if user is using VPN (for fraud prevention)
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/utils/errorHandling';
import { CacheManager } from '@/lib/utils/caching';
import { API } from '@/lib/utils/constants';

const cache = new CacheManager();

interface LocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryName: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currency: string;
  languages: string;
  org: string; // ISP/Organization
  asn: string;
  isEU: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Get client IP from request headers
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     'auto';

    // Check cache first
    const cacheKey = `ipapi:${clientIp}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    // Fetch from IPAPI
    // Using 'auto' detects the requesting IP automatically
    const url = clientIp === 'auto' ? 
      'https://ipapi.co/json/' : 
      `https://ipapi.co/${clientIp}/json/`;

    const response = await withTimeout(
      fetch(url, {
        headers: {
          'User-Agent': 'Cost-Saver-App/1.0',
        },
      }),
      API.TIMEOUT_DEFAULT
    );

    if (!response.ok) {
      // Check if rate limited
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many location requests. Using default UK location.',
            fallback: getDefaultUKLocation(),
          },
          { status: 429 }
        );
      }

      throw new Error(`IPAPI error: ${response.status}`);
    }

    const data = await response.json();

    // Format response
    const locationData: LocationData = {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_code,
      countryName: data.country_name,
      postal: data.postal,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      currency: data.currency,
      languages: data.languages,
      org: data.org,
      asn: data.asn,
      isEU: data.in_eu || false,
    };

    // Cache the result
    cache.set(cacheKey, locationData);

    return NextResponse.json(locationData);

  } catch (error) {
    console.error('IPAPI error:', error);

    // Return default UK location as fallback
    return NextResponse.json({
      error: handleApiError(error, '/api/location').userMessage,
      fallback: getDefaultUKLocation(),
    }, { status: 200 }); // Still 200 since we have fallback data
  }
}

/**
 * Default UK location (London) for fallback
 */
function getDefaultUKLocation(): LocationData {
  return {
    ip: 'unknown',
    city: 'London',
    region: 'England',
    country: 'GB',
    countryName: 'United Kingdom',
    postal: 'SW1A 1AA',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    currency: 'GBP',
    languages: 'en',
    org: 'Unknown',
    asn: 'Unknown',
    isEU: false,
  };
}

/**
 * Check if user is likely in UK based on location data
 */
function isUKUser(locationData: LocationData): boolean {
  return locationData.country === 'GB' || 
         locationData.currency === 'GBP' ||
         locationData.timezone === 'Europe/London';
}

/**
 * Extract approximate postcode from location
 * Note: IPAPI postal codes can be inaccurate, use as suggestion only
 */
function suggestPostcodeFromLocation(locationData: LocationData): string | null {
  if (!isUKUser(locationData)) {
    return null;
  }

  // IPAPI postal might be incomplete or inaccurate
  const postal = locationData.postal;
  if (postal && postal.length >= 5) {
    return postal;
  }

  // City-based fallback postcodes
  const cityPostcodes: Record<string, string> = {
    'London': 'EC1A 1BB',
    'Birmingham': 'B1 1AA',
    'Manchester': 'M1 1AA',
    'Liverpool': 'L1 1AA',
    'Leeds': 'LS1 1AA',
    'Glasgow': 'G1 1AA',
    'Edinburgh': 'EH1 1AA',
    'Cardiff': 'CF1 1AA',
    'Bristol': 'BS1 1AA',
    'Newcastle': 'NE1 1AA',
  };

  return cityPostcodes[locationData.city] || null;
}
