import { SavingTip } from '@/types';

/**
 * Generate personalized saving tips based on user data
 */
export function generateSavingTips(heatingType: string, homeType: string): SavingTip[] {
  const allTips: SavingTip[] = [
    {
      id: '1',
      title: 'Lower thermostat by 1°C',
      description: 'Reducing your thermostat by just 1°C can save up to 10% on heating bills.',
      potentialSaving: 150,
      difficulty: 'easy',
      category: 'heating',
    },
    {
      id: '2',
      title: 'Install smart thermostat',
      description: 'Smart thermostats learn your routine and optimize heating automatically.',
      potentialSaving: 250,
      difficulty: 'medium',
      category: 'heating',
    },
    {
      id: '3',
      title: 'Switch to LED bulbs',
      description: 'LED bulbs use 75% less energy than traditional bulbs and last much longer.',
      potentialSaving: 80,
      difficulty: 'easy',
      category: 'electricity',
    },
    {
      id: '4',
      title: 'Draught-proof windows and doors',
      description: 'Seal gaps around windows and doors to prevent heat loss.',
      potentialSaving: 120,
      difficulty: 'easy',
      category: 'insulation',
    },
    {
      id: '5',
      title: 'Upgrade loft insulation',
      description: 'Proper loft insulation can reduce heat loss by up to 25%.',
      potentialSaving: 300,
      difficulty: 'hard',
      category: 'insulation',
    },
    {
      id: '6',
      title: 'Use smart power strips',
      description: 'Eliminate phantom power drain from devices on standby.',
      potentialSaving: 60,
      difficulty: 'easy',
      category: 'electricity',
    },
  ];

  // Filter and prioritize tips based on heating type
  let relevantTips = allTips;
  
  if (heatingType === 'electricity') {
    relevantTips = allTips.filter(tip => tip.category !== 'heating' || tip.id === '2');
  }

  // Sort by potential saving (highest first) and return top 4
  return relevantTips
    .sort((a, b) => b.potentialSaving - a.potentialSaving)
    .slice(0, 4);
}

/**
 * Get current weather (mock for MVP - replace with real API later)
 */
export async function getCurrentWeather(postcode: string): Promise<{
  temperature: number;
  condition: string;
}> {
  // Mock weather data for MVP
  // TODO: Replace with OpenWeatherMap or Met Office API
  return {
    temperature: 12,
    condition: 'Cloudy',
  };
}
