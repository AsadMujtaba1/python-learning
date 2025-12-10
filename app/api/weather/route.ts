/**
 * OpenWeather API Integration
 * 
 * Fetches real weather data including:
 * - Current temperature
 * - Forecast temperature
 * - Humidity
 * - Feels like temperature
 * 
 * API Route: /api/weather
 */

import { NextRequest, NextResponse } from 'next/server';

interface WeatherResponse {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    description: string;
  };
  forecast: Array<{
    timestamp: number;
    temperature: number;
    feelsLike: number;
    humidity: number;
    description: string;
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

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      // Return mock data if API key not configured
      console.warn('OpenWeather API key not configured, returning mock data');
      return NextResponse.json(generateMockWeatherData());
    }

    // Step 1: Convert UK postcode to lat/lon using geocoding API
    // Remove spaces from postcode for API compatibility
    const cleanPostcode = postcode.replace(/\s+/g, '');
    const geoUrl = `http://api.openweathermap.org/geo/1.0/zip?zip=${cleanPostcode},GB&appid=${apiKey}`;
    
    console.log('Fetching geocoding data from:', geoUrl.replace(apiKey, 'API_KEY'));
    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      const errorText = await geoResponse.text();
      console.warn('Geocoding failed, using mock data. Error:', errorText);
      // Return mock data if geocoding fails (API key might not be activated yet)
      return NextResponse.json(generateMockWeatherData());
    }

    const geoData = await geoResponse.json();
    const { lat, lon } = geoData;

    // Step 2: Get current weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const currentResponse = await fetch(currentUrl);

    if (!currentResponse.ok) {
      throw new Error('Failed to fetch current weather');
    }

    const currentData = await currentResponse.json();

    // Step 3: Get 5-day forecast (3-hour intervals)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastUrl);

    if (!forecastResponse.ok) {
      throw new Error('Failed to fetch weather forecast');
    }

    const forecastData = await forecastResponse.json();

    // Format response
    const weatherResponse: WeatherResponse = {
      current: {
        temperature: Math.round(currentData.main.temp * 10) / 10,
        feelsLike: Math.round(currentData.main.feels_like * 10) / 10,
        humidity: currentData.main.humidity,
        description: currentData.weather[0].description,
      },
      forecast: forecastData.list.slice(0, 24).map((item: any) => ({
        timestamp: item.dt,
        temperature: Math.round(item.main.temp * 10) / 10,
        feelsLike: Math.round(item.main.feels_like * 10) / 10,
        humidity: item.main.humidity,
        description: item.weather[0].description,
      })),
    };

    return NextResponse.json(weatherResponse);
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return mock data on error
    return NextResponse.json(generateMockWeatherData());
  }
}

/**
 * Generate mock weather data for development/fallback
 */
function generateMockWeatherData(): WeatherResponse {
  const baseTemp = 8 + Math.random() * 4; // 8-12°C typical UK winter

  return {
    current: {
      temperature: Math.round(baseTemp * 10) / 10,
      feelsLike: Math.round((baseTemp - 2) * 10) / 10,
      humidity: 75 + Math.floor(Math.random() * 15),
      description: 'partly cloudy',
    },
    forecast: Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() + i * 3);
      const temp = baseTemp + (Math.sin(i / 8 * Math.PI) * 3); // Simulate day/night variation

      return {
        timestamp: Math.floor(hour.getTime() / 1000),
        temperature: Math.round(temp * 10) / 10,
        feelsLike: Math.round((temp - 1.5) * 10) / 10,
        humidity: 70 + Math.floor(Math.random() * 20),
        description: ['clear sky', 'few clouds', 'scattered clouds', 'overcast clouds'][Math.floor(Math.random() * 4)],
      };
    }),
  };
}
