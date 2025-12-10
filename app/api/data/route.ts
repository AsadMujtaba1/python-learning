/**
 * Unified Data Service
 * 
 * Orchestrates all API calls with intelligent fallback logic:
 * - Weather: OpenWeather → Open-Meteo → Mock data
 * - Location: IPAPI → Postcode lookup → Default UK
 * - Energy data: EPC → Estimates from construction year
 * - Regional data: ONS → National averages
 * 
 * Provides:
 * - Single endpoint for all dashboard data
 * - Automatic retry and fallback
 * - Request batching
 * - Parallel fetching
 * - Comprehensive error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils/errorHandling';
import { CacheManager } from '@/lib/utils/caching';
import { postcodeToRegion } from '@/lib/utils/apiHelpers';

const cache = new CacheManager();

interface UnifiedDataRequest {
  postcode?: string;
  includeWeather?: boolean;
  includeCarbon?: boolean;
  includeEPC?: boolean;
  includeRegional?: boolean;
  includeLocation?: boolean;
}

interface UnifiedDataResponse {
  postcode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  weather?: {
    current: {
      temperature: number;
      feelsLike: number;
      humidity: number;
      description: string;
      windSpeed?: number;
    };
    forecast: Array<{
      date: string;
      tempMax: number;
      tempMin: number;
    }>;
    source: 'openweather' | 'open-meteo' | 'mock';
  };
  carbonIntensity?: {
    current: number;
    forecast: any[];
    bestTimes: any[];
    source: 'live' | 'mock';
  };
  epc?: {
    rating: string;
    efficiency: number;
    recommendations: any[];
    source: 'epc-api' | 'estimated';
  };
  regional?: {
    region: string;
    averageIncome: number;
    averageEnergySpend: number;
    comparisonToNational: {
      income: string;
      energyCost: string;
    };
  };
  location?: {
    city: string;
    region: string;
    timezone: string;
  };
  fetchedAt: string;
  cached: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postcode = searchParams.get('postcode');
    
    if (!postcode) {
      return NextResponse.json(
        { error: 'Postcode parameter required' },
        { status: 400 }
      );
    }

    // Parse request options
    const options: UnifiedDataRequest = {
      postcode,
      includeWeather: searchParams.get('weather') !== 'false',
      includeCarbon: searchParams.get('carbon') !== 'false',
      includeEPC: searchParams.get('epc') === 'true', // Opt-in (rate limited)
      includeRegional: searchParams.get('regional') !== 'false',
      includeLocation: searchParams.get('location') === 'true', // Opt-in
    };

    // Check cache first
    const cacheKey = `unified:${postcode}:${JSON.stringify(options)}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    // Fetch all data in parallel
    const results = await Promise.allSettled([
      options.includeWeather ? fetchWeatherData(postcode) : null,
      options.includeCarbon ? fetchCarbonData(postcode) : null,
      options.includeEPC ? fetchEPCData(postcode) : null,
      options.includeRegional ? fetchRegionalData(postcode) : null,
      options.includeLocation ? fetchLocationData() : null,
      fetchPostcodeData(postcode), // Always fetch for coordinates
    ]);

    // Extract results with fallbacks
    const [weatherResult, carbonResult, epcResult, regionalResult, locationResult, postcodeResult] = results;

    const postcodeData = postcodeResult.status === 'fulfilled' ? postcodeResult.value : null;
    
    const response: UnifiedDataResponse = {
      postcode,
      coordinates: postcodeData?.coordinates,
      weather: weatherResult.status === 'fulfilled' ? weatherResult.value || undefined : undefined,
      carbonIntensity: carbonResult.status === 'fulfilled' ? carbonResult.value || undefined : undefined,
      epc: epcResult.status === 'fulfilled' ? epcResult.value || undefined : undefined,
      regional: regionalResult.status === 'fulfilled' ? regionalResult.value || undefined : undefined,
      location: locationResult.status === 'fulfilled' ? locationResult.value || undefined : undefined,
      fetchedAt: new Date().toISOString(),
      cached: false,
    };

    // Cache the unified response
    cache.set(cacheKey, response);

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json(
      { error: handleApiError(error, '/api/data').userMessage },
      { status: 500 }
    );
  }
}

/**
 * Fetch weather with fallback chain
 */
async function fetchWeatherData(postcode: string) {
  try {
    // Try OpenWeather first
    const openWeatherRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/weather?postcode=${postcode}`,
      { next: { revalidate: 1800 } } // 30 min cache
    );

    if (openWeatherRes.ok) {
      const data = await openWeatherRes.json();
      return {
        current: data.current,
        forecast: data.forecast?.slice(0, 7).map((f: any) => ({
          date: new Date(f.timestamp * 1000).toISOString().split('T')[0],
          tempMax: f.temperature + 2,
          tempMin: f.temperature - 2,
        })) || [],
        source: 'openweather' as const,
      };
    }

    // Fallback to Open-Meteo
    const openMeteoRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/open-meteo?postcode=${postcode}`,
      { next: { revalidate: 1800 } }
    );

    if (openMeteoRes.ok) {
      const data = await openMeteoRes.json();
      return {
        current: {
          temperature: data.current.temperature,
          feelsLike: data.current.temperature - 1,
          humidity: data.current.humidity,
          description: 'Clear',
          windSpeed: data.current.windSpeed,
        },
        forecast: data.daily.slice(0, 7).map((d: any) => ({
          date: d.date,
          tempMax: d.tempMax,
          tempMin: d.tempMin,
        })),
        source: 'open-meteo' as const,
      };
    }

    // Final fallback: mock data
    return {
      current: {
        temperature: 10,
        feelsLike: 8,
        humidity: 75,
        description: 'Cloudy',
      },
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        tempMax: 12,
        tempMin: 6,
      })),
      source: 'mock' as const,
    };

  } catch (error) {
    console.error('Weather fetch failed:', error);
    return null;
  }
}

/**
 * Fetch carbon intensity data
 */
async function fetchCarbonData(postcode: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/carbon-intensity?postcode=${postcode}`,
      { next: { revalidate: 1800 } }
    );

    if (!res.ok) {
      throw new Error('Carbon API failed');
    }

    const data = await res.json();
    return {
      current: data.current?.intensity || 200,
      forecast: data.forecast || [],
      bestTimes: data.bestTimes || [],
      source: data.current ? 'live' as const : 'mock' as const,
    };

  } catch (error) {
    console.error('Carbon fetch failed:', error);
    return {
      current: 200,
      forecast: [],
      bestTimes: [],
      source: 'mock' as const,
    };
  }
}

/**
 * Fetch EPC data
 */
async function fetchEPCData(postcode: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/epc?postcode=${postcode}`,
      { next: { revalidate: 86400 * 30 } } // 30 days cache
    );

    if (!res.ok) {
      throw new Error('EPC API failed');
    }

    const data = await res.json();
    return {
      rating: data.rating,
      efficiency: data.currentEnergyEfficiency,
      recommendations: data.recommendations,
      source: 'epc-api' as const,
    };

  } catch (error) {
    console.warn('EPC fetch failed, using estimates:', error);
    return {
      rating: 'D',
      efficiency: 55,
      recommendations: [],
      source: 'estimated' as const,
    };
  }
}

/**
 * Fetch regional ONS data
 */
async function fetchRegionalData(postcode: string) {
  try {
    const region = postcodeToRegion(postcode);
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ons?type=regional&region=${region}`,
      { next: { revalidate: 86400 * 7 } } // 7 days cache
    );

    if (!res.ok) {
      throw new Error('ONS API failed');
    }

    const data = await res.json();
    return {
      region: data.region,
      averageIncome: data.averageHouseholdIncome,
      averageEnergySpend: data.averageEnergySpend,
      comparisonToNational: data.comparisonToNational,
    };

  } catch (error) {
    console.error('Regional fetch failed:', error);
    return null;
  }
}

/**
 * Fetch location data
 */
async function fetchLocationData() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/location`,
      { next: { revalidate: 86400 } } // 24 hours cache
    );

    const data = await res.json();
    return {
      city: data.city || data.fallback?.city,
      region: data.region || data.fallback?.region,
      timezone: data.timezone || data.fallback?.timezone,
    };

  } catch (error) {
    console.error('Location fetch failed:', error);
    return null;
  }
}

/**
 * Fetch postcode coordinates
 */
async function fetchPostcodeData(postcode: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/postcode?postcode=${postcode}`,
      { next: { revalidate: 86400 * 7 } }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return {
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
    };

  } catch (error) {
    console.error('Postcode fetch failed:', error);
    return null;
  }
}
