/**
 * CARBON INTENSITY API
 * 
 * Fetches real-time carbon intensity data from the UK National Grid.
 * Provides current carbon intensity, forecast, and best times to use energy.
 * 
 * API: https://carbonintensity.org.uk (FREE - No API key required)
 * 
 * @route /api/carbon-intensity
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/utils/errorHandling';
import { cache } from '@/lib/utils/caching';
import { API } from '@/lib/utils/constants';

interface CarbonIntensityResponse {
  current: {
    intensity: number; // gCO2/kWh
    index: 'very low' | 'low' | 'moderate' | 'high' | 'very high';
    timestamp: string;
  };
  forecast: Array<{
    timestamp: string;
    intensity: number;
    index: string;
  }>;
  region: {
    regionid: number;
    shortname: string;
  };
  bestTimes: Array<{
    hour: number;
    intensity: number;
    saving: number;
  }>;
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

    // Use caching to avoid repeated API calls
    const cacheKey = `carbon:${postcode}`;
    
    const data = await cache(
      async () => {
        // Step 1: Get region ID from postcode
        const regionUrl = `${API.EXTERNAL_APIS.CARBON_INTENSITY}/regional/postcode/${postcode}`;
        
        const regionResponse = await withTimeout(
          fetch(regionUrl),
          API.TIMEOUT_DEFAULT
        );

        if (!regionResponse.ok) {
          console.warn('Carbon Intensity API failed, using national data');
          return await fetchNationalData();
        }

        const regionData = await regionResponse.json();
        const region = regionData.data[0];

        // Step 2: Get current and forecast intensity
        const intensityUrl = `${API.EXTERNAL_APIS.CARBON_INTENSITY}/regional/intensity/${region.regionid}/fw24h`;
        
        const intensityResponse = await withTimeout(
          fetch(intensityUrl),
          API.TIMEOUT_DEFAULT
        );

        if (!intensityResponse.ok) {
          return await fetchNationalData();
        }

        const intensityData = await intensityResponse.json();

        // Format response
        const current = intensityData.data[0];
        const forecast = intensityData.data.slice(1, 25); // Next 24 hours

        // Calculate best times (lowest carbon intensity)
        const sortedForecast = [...forecast].sort((a, b) => 
          a.intensity.forecast - b.intensity.forecast
        );
        
        const bestTimes = sortedForecast.slice(0, 3).map((item: any, index: number) => {
          const hour = new Date(item.from).getHours();
          const intensity = item.intensity.forecast;
          const avgIntensity = forecast.reduce((sum: number, f: any) => sum + f.intensity.forecast, 0) / forecast.length;
          const saving = ((avgIntensity - intensity) / avgIntensity) * 100;
          
          return {
            hour,
            intensity,
            saving: Math.round(saving),
          };
        });

        const response: CarbonIntensityResponse = {
          current: {
            intensity: current.intensity.forecast,
            index: current.intensity.index as any,
            timestamp: current.from,
          },
          forecast: forecast.map((item: any) => ({
            timestamp: item.from,
            intensity: item.intensity.forecast,
            index: item.intensity.index,
          })),
          region: {
            regionid: region.regionid,
            shortname: region.shortname,
          },
          bestTimes,
        };

        return response;
      },
      {
        key: cacheKey,
        ttl: API.CACHE_WEATHER, // 30 minutes
        persistent: true,
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('Carbon intensity API error:', error);
    
    // Return mock data on error
    return NextResponse.json(generateMockCarbonData());
  }
}

/**
 * Fetch national-level data as fallback
 */
async function fetchNationalData(): Promise<CarbonIntensityResponse> {
  const url = `${API.EXTERNAL_APIS.CARBON_INTENSITY}/intensity`;
  const response = await fetch(url);
  
  if (!response.ok) {
    return generateMockCarbonData();
  }

  const data = await response.json();
  const current = data.data[0];

  // Get forecast
  const forecastUrl = `${API.EXTERNAL_APIS.CARBON_INTENSITY}/intensity/date`;
  const forecastResponse = await fetch(forecastUrl);
  const forecastData = await forecastResponse.json();

  return {
    current: {
      intensity: current.intensity.actual || current.intensity.forecast,
      index: current.intensity.index as any,
      timestamp: current.from,
    },
    forecast: forecastData.data.slice(0, 24).map((item: any) => ({
      timestamp: item.from,
      intensity: item.intensity.forecast,
      index: item.intensity.index,
    })),
    region: {
      regionid: 0,
      shortname: 'National',
    },
    bestTimes: [],
  };
}

/**
 * Generate mock carbon data for development/fallback
 */
function generateMockCarbonData(): CarbonIntensityResponse {
  const baseIntensity = 150 + Math.random() * 100; // 150-250 gCO2/kWh

  return {
    current: {
      intensity: Math.round(baseIntensity),
      index: baseIntensity < 180 ? 'low' : baseIntensity < 220 ? 'moderate' : 'high',
      timestamp: new Date().toISOString(),
    },
    forecast: Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() + i);
      
      // Simulate day/night variation
      const hourOfDay = hour.getHours();
      const variation = Math.sin((hourOfDay - 6) / 24 * 2 * Math.PI) * 50;
      const intensity = Math.max(100, Math.min(300, baseIntensity + variation + (Math.random() * 40 - 20)));

      return {
        timestamp: hour.toISOString(),
        intensity: Math.round(intensity),
        index: intensity < 180 ? 'low' : intensity < 220 ? 'moderate' : 'high',
      };
    }),
    region: {
      regionid: 0,
      shortname: 'Mock Data',
    },
    bestTimes: [
      { hour: 3, intensity: 120, saving: 25 },
      { hour: 14, intensity: 135, saving: 18 },
      { hour: 23, intensity: 140, saving: 15 },
    ],
  };
}
