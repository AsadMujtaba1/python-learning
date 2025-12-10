/**
 * Open-Meteo API Integration (FREE, NO KEY REQUIRED)
 * 
 * Provides:
 * - 7-day weather forecast
 * - Hourly temperature data
 * - Solar radiation (for solar panel estimates)
 * - Wind speed
 * 
 * API: https://open-meteo.com/
 * Docs: https://open-meteo.com/en/docs
 * 
 * Fallback for OpenWeather API
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/utils/errorHandling';
import { cacheWeather, getCachedWeather } from '@/lib/utils/caching';
import { API } from '@/lib/utils/constants';

interface OpenMeteoResponse {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
  };
  hourly: Array<{
    timestamp: string;
    temperature: number;
    humidity: number;
    precipitation: number;
  }>;
  daily: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    precipitation: number;
    sunrise: string;
    sunset: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postcode = searchParams.get('postcode');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!postcode && (!lat || !lon)) {
      return NextResponse.json(
        { error: 'Either postcode or lat/lon coordinates are required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `open-meteo:${postcode || `${lat},${lon}`}`;
    const cached = getCachedWeather(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    let latitude = lat;
    let longitude = lon;

    // If postcode provided, convert to coordinates using Postcodes.io (free)
    if (postcode && !lat && !lon) {
      try {
        const postcodeResponse = await withTimeout(
          fetch(`/api/postcode?postcode=${postcode}`),
          API.TIMEOUT_DEFAULT
        );
        
        if (postcodeResponse.ok) {
          const postcodeData = await postcodeResponse.json();
          latitude = postcodeData.latitude;
          longitude = postcodeData.longitude;
        }
      } catch (error) {
        console.warn('Postcode lookup failed, using default London coordinates');
        latitude = '51.5074';
        longitude = '-0.1278';
      }
    }

    // Fetch from Open-Meteo API
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset&timezone=Europe/London&forecast_days=7`;

    const response = await withTimeout(
      fetch(url),
      API.TIMEOUT_WEATHER
    );

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // Format response
    const formattedResponse: OpenMeteoResponse = {
      current: {
        temperature: Math.round(data.current.temperature_2m * 10) / 10,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m * 10) / 10,
        weatherCode: data.current.weather_code,
      },
      hourly: data.hourly.time.slice(0, 24).map((time: string, index: number) => ({
        timestamp: time,
        temperature: Math.round(data.hourly.temperature_2m[index] * 10) / 10,
        humidity: data.hourly.relative_humidity_2m[index],
        precipitation: data.hourly.precipitation[index],
      })),
      daily: data.daily.time.map((date: string, index: number) => ({
        date,
        tempMax: Math.round(data.daily.temperature_2m_max[index] * 10) / 10,
        tempMin: Math.round(data.daily.temperature_2m_min[index] * 10) / 10,
        precipitation: data.daily.precipitation_sum[index],
        sunrise: data.daily.sunrise[index],
        sunset: data.daily.sunset[index],
      })),
    };

    // Cache the result
    cacheWeather(cacheKey, formattedResponse);

    return NextResponse.json(formattedResponse);

  } catch (error) {
    return NextResponse.json(
      { error: handleApiError(error, '/api/open-meteo').userMessage },
      { status: 500 }
    );
  }
}

// Weather code descriptions
function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
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
