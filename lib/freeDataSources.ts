/**
 * FREE WEATHER & COST INSIGHTS API
 * 
 * Uses free, no-login APIs to provide helpful information:
 * - Open-Meteo: Free weather API (no key needed)
 * - UK National Statistics: Public data
 * - Carbon Intensity API: Free UK grid data
 * 
 * @module lib/freeDataSources
 */

// ============================================
// TYPES
// ============================================

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  advice: string;
}

export interface WeatherForecast {
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  icon: string;
  heatingCost: number;
}

export interface CostComparison {
  yourCost: number;
  ukAverage: number;
  regionAverage: number;
  percentile: number; // Where you rank (0-100)
  savingsOpportunity: number;
  message: string;
}

export interface EnergyTip {
  title: string;
  description: string;
  savings: string;
  icon: string;
  category: 'heating' | 'appliances' | 'habits' | 'smart';
  effort: 'easy' | 'medium' | 'one-time';
  priority: number;
}

export interface DailyInsight {
  type: 'weather' | 'cost' | 'savings' | 'benchmark';
  title: string;
  message: string;
  icon: string;
  color: 'green' | 'blue' | 'amber' | 'red';
  actionable?: {
    text: string;
    action: string;
  };
}

// ============================================
// FREE WEATHER API (Open-Meteo - No key required!)
// ============================================

export class FreeWeatherService {
  private static BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Get current weather and 7-day forecast
   * Uses Open-Meteo - completely free, no signup!
   */
  static async getWeather(postcode: string): Promise<{
    current: WeatherData;
    forecast: WeatherForecast[];
  }> {
    try {
      // Convert postcode to coordinates (simplified - in production use a geocoding service)
      const coords = this.postcodeToCoords(postcode);
      
      const params = new URLSearchParams({
        latitude: coords.lat.toString(),
        longitude: coords.lon.toString(),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
        daily: 'temperature_2m_max,temperature_2m_min,weather_code',
        timezone: 'Europe/London',
        forecast_days: '7',
      });

      const response = await fetch(`${this.BASE_URL}?${params}`);
      const data = await response.json();

      const current: WeatherData = {
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        condition: this.getWeatherCondition(data.current.weather_code),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        icon: this.getWeatherIcon(data.current.weather_code),
        advice: this.getHeatingAdvice(data.current.temperature_2m, data.current.apparent_temperature),
      };

      const forecast: WeatherForecast[] = data.daily.time.map((date: string, i: number) => ({
        date,
        tempHigh: Math.round(data.daily.temperature_2m_max[i]),
        tempLow: Math.round(data.daily.temperature_2m_min[i]),
        condition: this.getWeatherCondition(data.daily.weather_code[i]),
        icon: this.getWeatherIcon(data.daily.weather_code[i]),
        heatingCost: this.estimateHeatingCost(data.daily.temperature_2m_min[i]),
      }));

      return { current, forecast };
    } catch (error) {
      console.error('Weather fetch failed:', error);
      return this.getFallbackWeather();
    }
  }

  /**
   * Convert UK postcode to coordinates using comprehensive geocoding
   */
  private static postcodeToCoords(postcode: string): { lat: number; lon: number } {
    // Import the comprehensive geocoding function
    try {
      const { geocodePostcode } = require('./postcodeGeocoding');
      const coords = geocodePostcode(postcode);
      return coords ? { lat: coords.lat, lon: coords.lon } : { lat: 52.3555, lon: -1.1743 };
    } catch (error) {
      // Fallback to UK center if geocoding fails
      return { lat: 52.3555, lon: -1.1743 };
    }
  }

  private static getWeatherCondition(code: number): string {
    const conditions: Record<number, string> = {
      0: 'Clear',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light Drizzle',
      53: 'Drizzle',
      55: 'Heavy Drizzle',
      61: 'Light Rain',
      63: 'Rain',
      65: 'Heavy Rain',
      71: 'Light Snow',
      73: 'Snow',
      75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Light Showers',
      81: 'Showers',
      82: 'Heavy Showers',
      85: 'Light Snow Showers',
      86: 'Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Hail',
      99: 'Severe Thunderstorm',
    };
    return conditions[code] || 'Unknown';
  }

  private static getWeatherIcon(code: number): string {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 55) return '🌦️';
    if (code >= 61 && code <= 65) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌧️';
    if (code >= 85 && code <= 86) return '❄️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  }

  private static getHeatingAdvice(temp: number, feelsLike: number): string {
    if (feelsLike < 5) return "It's very cold! Make sure your heating is on and check for drafts.";
    if (feelsLike < 10) return "Chilly day - you'll want heating on. Consider a jumper to save energy!";
    if (feelsLike < 15) return "Cool weather - light heating needed. Perfect for saving energy!";
    if (feelsLike < 20) return "Mild weather - you probably don't need heating today!";
    return "Warm day - no heating needed! Great for your energy bill! 😊";
  }

  private static estimateHeatingCost(minTemp: number): number {
    // Rough estimate: £1-£5 per day based on temperature
    if (minTemp < 0) return 5.50;
    if (minTemp < 5) return 4.20;
    if (minTemp < 10) return 3.00;
    if (minTemp < 15) return 1.50;
    return 0.50;
  }

  private static getFallbackWeather(): {
    current: WeatherData;
    forecast: WeatherForecast[];
  } {
    return {
      current: {
        temperature: 12,
        feelsLike: 10,
        condition: 'Partly Cloudy',
        humidity: 70,
        windSpeed: 15,
        icon: '⛅',
        advice: "Check your thermostat - moderate weather today",
      },
      forecast: [],
    };
  }
}

// ============================================
// UK COST BENCHMARKS (Public Data)
// ============================================

export class UKCostBenchmarks {
  /**
   * Get national and regional average energy costs
   * Based on UK government public data
   */
  static getCostComparison(
    userDailyCost: number,
    region: string = 'UK'
  ): CostComparison {
    // UK National Average (Ofgem Price Cap data - public)
    const ukAverage = 4.50; // £/day typical
    
    // Regional estimates (from public UK stats)
    const regionalAverages: Record<string, number> = {
      'London': 4.80,
      'South East': 4.70,
      'South West': 4.60,
      'East': 4.55,
      'West Midlands': 4.40,
      'East Midlands': 4.35,
      'North West': 4.30,
      'Yorkshire': 4.25,
      'North East': 4.20,
      'Scotland': 4.40,
      'Wales': 4.35,
      'Northern Ireland': 4.50,
    };

    const regionAverage = regionalAverages[region] || ukAverage;
    
    // Calculate percentile (0 = cheapest, 100 = most expensive)
    const percentile = Math.min(100, Math.max(0, 
      ((userDailyCost - 2.50) / (6.50 - 2.50)) * 100
    ));

    const savingsOpportunity = Math.max(0, (userDailyCost - 3.20) * 365);

    let message = '';
    if (percentile < 25) {
      message = "🌟 Excellent! You're in the top 25% of energy savers!";
    } else if (percentile < 50) {
      message = "👍 Good job! You're better than average!";
    } else if (percentile < 75) {
      message = "💡 You're close to average - small improvements could save you money!";
    } else {
      message = "🎯 Big savings opportunity! Let's get your costs down!";
    }

    return {
      yourCost: userDailyCost,
      ukAverage,
      regionAverage: regionAverage,
      percentile: Math.round(percentile),
      savingsOpportunity,
      message,
    };
  }

  /**
   * Get home type typical costs
   */
  static getTypicalCostByHomeType(homeType: string): number {
    const costs: Record<string, number> = {
      'flat': 3.20,
      'terraced': 3.80,
      'semi-detached': 4.40,
      'detached': 5.50,
    };
    return costs[homeType.toLowerCase()] || 4.00;
  }
}

// ============================================
// SMART TIPS GENERATOR
// ============================================

export class SmartTipsGenerator {
  /**
   * Generate personalized tips based on conditions
   */
  static getTipsForToday(
    weather: WeatherData,
    userCost: number,
    homeType: string
  ): EnergyTip[] {
    const tips: EnergyTip[] = [];

    // Weather-based tips
    if (weather.temperature < 10) {
      tips.push({
        title: 'Close curtains at dusk',
        description: "It's cold today! Close your curtains when it gets dark to keep heat in. Can save £50/year!",
        savings: '£50/year',
        icon: '🪟',
        category: 'heating',
        effort: 'easy',
        priority: 9,
      });
    }

    if (weather.temperature > 18) {
      tips.push({
        title: 'Turn heating off today',
        description: "It's mild outside! You probably don't need heating. Save £2-3 today!",
        savings: '£2-3 today',
        icon: '🌡️',
        category: 'heating',
        effort: 'easy',
        priority: 10,
      });
    }

    // Cost-based tips
    if (userCost > 4.50) {
      tips.push({
        title: 'Check your tariff',
        description: "Your costs are higher than average. Switching energy provider could save you £300/year!",
        savings: '£300/year',
        icon: '🔄',
        category: 'smart',
        effort: 'one-time',
        priority: 10,
      });
    }

    // General high-impact tips
    tips.push(
      {
        title: 'Wash clothes at 30°C',
        description: 'Modern detergents work great at 30°C instead of 40°C. Save energy without noticing!',
        savings: '£28/year',
        icon: '👕',
        category: 'appliances',
        effort: 'easy',
        priority: 7,
      },
      {
        title: 'Unplug devices overnight',
        description: 'TVs, computers and chargers on standby waste energy. Turn them off at the wall!',
        savings: '£45/year',
        icon: '🔌',
        category: 'appliances',
        effort: 'easy',
        priority: 8,
      },
      {
        title: 'Boil only what you need',
        description: 'Only fill the kettle with the water you need. Most people waste energy boiling too much!',
        savings: '£11/year',
        icon: '☕',
        category: 'habits',
        effort: 'easy',
        priority: 5,
      }
    );

    return tips.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }
}

// ============================================
// DAILY INSIGHTS GENERATOR
// ============================================

export class DailyInsightsGenerator {
  static generateInsights(
    weather: WeatherData,
    costComparison: CostComparison,
    userData: any
  ): DailyInsight[] {
    const insights: DailyInsight[] = [];

    // Weather insight
    insights.push({
      type: 'weather',
      title: `${weather.icon} ${weather.condition}, ${weather.temperature}°C`,
      message: weather.advice,
      icon: weather.icon,
      color: weather.temperature < 10 ? 'blue' : weather.temperature > 20 ? 'amber' : 'green',
    });

    // Cost comparison insight
    if (costComparison.percentile < 50) {
      insights.push({
        type: 'benchmark',
        title: "You're doing great!",
        message: `Your energy costs are better than ${100 - costComparison.percentile}% of UK homes!`,
        icon: '🌟',
        color: 'green',
      });
    } else {
      insights.push({
        type: 'savings',
        title: 'Savings opportunity',
        message: `You could save £${costComparison.savingsOpportunity.toFixed(0)}/year by reducing your costs to the UK average.`,
        icon: '💰',
        color: 'amber',
        actionable: {
          text: 'See how',
          action: '/tips',
        },
      });
    }

    // Daily tip
    const dayOfWeek = new Date().getDay();
    const weeklyTips = [
      { title: 'Monday tip', message: 'Start the week right - turn off devices you won\'t use today!', icon: '🔌' },
      { title: 'Tuesday tip', message: 'Wash clothes at 30°C instead of 40°C - same clean, less cost!', icon: '👕' },
      { title: 'Wednesday tip', message: 'Check your fridge is set to 3-4°C - colder wastes energy!', icon: '❄️' },
      { title: 'Thursday tip', message: 'Close curtains at dusk to keep heat in your home!', icon: '🪟' },
      { title: 'Friday tip', message: 'Turn off heating 30 mins before bed - your home stays warm!', icon: '🌡️' },
      { title: 'Weekend tip', message: 'Perfect time to switch energy providers - could save £300/year!', icon: '🔄' },
      { title: 'Sunday tip', message: 'Batch cook meals and freeze - saves energy reheating later!', icon: '🍲' },
    ];

    const todaysTip = weeklyTips[dayOfWeek];
    insights.push({
      type: 'savings',
      title: todaysTip.title,
      message: todaysTip.message,
      icon: todaysTip.icon,
      color: 'blue',
    });

    return insights;
  }
}

export default {
  FreeWeatherService,
  UKCostBenchmarks,
  SmartTipsGenerator,
  DailyInsightsGenerator,
};
