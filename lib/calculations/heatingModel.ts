/**
 * ENHANCED HEATING MODEL
 * 
 * Advanced heating calculations with seasonal adjustments,
 * construction year consideration, and time-of-use modeling.
 * 
 * @module lib/calculations/heatingModel
 */

import { HEATING, TIME_PERIODS, BASE_CONSUMPTION } from '@/lib/utils/constants';

/**
 * Calculate seasonal adjustment factor based on month
 */
export function getSeasonalFactor(month: number): number {
  if ((TIME_PERIODS.WINTER_MONTHS as readonly number[]).includes(month)) {
    return HEATING.SEASONAL_WINTER;
  } else if ((TIME_PERIODS.SPRING_MONTHS as readonly number[]).includes(month)) {
    return HEATING.SEASONAL_SPRING;
  } else if ((TIME_PERIODS.SUMMER_MONTHS as readonly number[]).includes(month)) {
    return HEATING.SEASONAL_SUMMER;
  } else {
    return HEATING.SEASONAL_AUTUMN;
  }
}

/**
 * Calculate insulation factor based on home age
 */
export function getInsulationFactor(
  constructionYear?: number,
  knownInsulation?: 'poor' | 'average' | 'good' | 'excellent'
): number {
  // If insulation level is explicitly known, use it
  if (knownInsulation) {
    return {
      poor: HEATING.INSULATION_POOR,
      average: HEATING.INSULATION_AVERAGE,
      good: HEATING.INSULATION_GOOD,
      excellent: HEATING.INSULATION_EXCELLENT,
    }[knownInsulation];
  }

  // Otherwise estimate from construction year
  if (!constructionYear) {
    return HEATING.INSULATION_AVERAGE;
  }

  const currentYear = new Date().getFullYear();
  const age = currentYear - constructionYear;

  // Modern homes (post-2010) have better insulation due to Building Regulations Part L
  if (age <= 15) return HEATING.INSULATION_GOOD;
  
  // Homes from 1990-2010 have decent insulation
  if (age <= 35) return HEATING.INSULATION_AVERAGE;
  
  // Older homes typically have poor insulation
  return HEATING.INSULATION_POOR;
}

/**
 * Calculate heating demand with advanced factors
 */
export function calculateAdvancedHeatingLoad(
  temperature: number,
  homeType: string,
  heatingType: string,
  options: {
    constructionYear?: number;
    insulationLevel?: 'poor' | 'average' | 'good' | 'excellent';
    occupants?: number;
    month?: number;
    windSpeed?: number;
    humidity?: number;
  } = {}
): number {
  const {
    constructionYear,
    insulationLevel,
    occupants = 2,
    month = new Date().getMonth(),
    windSpeed = 0,
    humidity = 75,
  } = options;

  // Base temperature for degree-day calculation
  const baseTemp = HEATING.BASE_TEMPERATURE;

  // No heating needed if warm enough
  if (temperature >= baseTemp) {
    return 0;
  }

  const degreeDays = baseTemp - temperature;

  // Base heating demand by home type
  const heatingDemandMap: Record<string, number> = {
    flat: HEATING.DEMAND_FLAT,
    terraced: HEATING.DEMAND_TERRACED,
    'semi-detached': HEATING.DEMAND_SEMI_DETACHED,
    detached: HEATING.DEMAND_DETACHED,
  };

  let baseDemand = heatingDemandMap[homeType] || HEATING.DEMAND_TERRACED;

  // Apply insulation factor
  const insulationFactor = getInsulationFactor(constructionYear, insulationLevel);
  baseDemand *= insulationFactor;

  // Apply seasonal factor
  const seasonalFactor = getSeasonalFactor(month);
  baseDemand *= seasonalFactor;

  // Occupancy adjustment (more people = more internal heat gain = less heating needed)
  const occupancyAdjustment = 1 - ((occupants - 2) * 0.05);
  baseDemand *= Math.max(0.7, occupancyAdjustment);

  // Wind chill adjustment (wind increases heat loss)
  if (windSpeed > 0) {
    const windFactor = 1 + (windSpeed * 0.02); // 2% increase per m/s
    baseDemand *= Math.min(1.3, windFactor);
  }

  // Humidity adjustment (higher humidity feels warmer)
  if (humidity > 0) {
    const humidityFactor = 1 - ((humidity - 50) * 0.001);
    baseDemand *= Math.max(0.9, Math.min(1.1, humidityFactor));
  }

  // Calculate kWh based on degree-days
  let heatingKWh = degreeDays * baseDemand;

  // Apply heating system efficiency
  const efficiencyMap: Record<string, number> = {
    gas: HEATING.EFFICIENCY_GAS_BOILER,
    electricity: HEATING.EFFICIENCY_ELECTRIC_HEATER,
    'heat-pump': HEATING.EFFICIENCY_HEAT_PUMP,
    mixed: HEATING.EFFICIENCY_MIXED,
  };

  const efficiency = efficiencyMap[heatingType] || HEATING.EFFICIENCY_MIXED;
  heatingKWh = heatingKWh / efficiency;

  return Math.max(0, heatingKWh);
}

/**
 * Calculate hourly heating schedule based on occupancy patterns
 */
export function generateHeatingSchedule(
  temperatures: number[],
  homeData: {
    homeType: string;
    heatingType: string;
    occupants: number;
    constructionYear?: number;
  }
): Array<{
  hour: number;
  temperature: number;
  heatingKWh: number;
  cost: number;
  shouldHeat: boolean;
}> {
  const schedule = [];
  const month = new Date().getMonth();

  // Typical UK occupancy pattern
  const occupancyPattern = [
    // Hours 0-5: Night (asleep, lower heating)
    ...Array(6).fill(0.6),
    // Hours 6-8: Morning (waking up, higher heating)
    ...Array(3).fill(1.0),
    // Hours 9-16: Day (some away, moderate heating)
    ...Array(8).fill(0.7),
    // Hours 17-22: Evening (home, higher heating)
    ...Array(6).fill(1.0),
    // Hours 23: Night (going to bed, moderate)
    0.8,
  ];

  for (let hour = 0; hour < 24; hour++) {
    const temp = temperatures[hour] || temperatures[0];
    const occupancyFactor = occupancyPattern[hour];

    // Calculate base heating load
    const baseHeating = calculateAdvancedHeatingLoad(
      temp,
      homeData.homeType,
      homeData.heatingType,
      {
        constructionYear: homeData.constructionYear,
        occupants: homeData.occupants,
        month,
      }
    );

    // Adjust for occupancy pattern
    const heatingKWh = baseHeating * occupancyFactor;

    // Calculate cost (TODO: integrate with time-of-use tariffs)
    const costPerKWh = homeData.heatingType === 'gas' ? 0.07 : 0.28;
    const cost = heatingKWh * costPerKWh;

    schedule.push({
      hour,
      temperature: temp,
      heatingKWh: Number(heatingKWh.toFixed(2)),
      cost: Number(cost.toFixed(2)),
      shouldHeat: heatingKWh > 0.1, // Only recommend heating if significant load
    });
  }

  return schedule;
}

/**
 * Calculate appliance-specific consumption
 */
export function calculateApplianceConsumption(
  appliances: Array<{
    name: string;
    quantity: number;
    hoursPerDay: number;
  }>
): {
  totalDaily: number;
  breakdown: Record<string, number>;
} {
  const breakdown: Record<string, number> = {};
  let totalDaily = 0;

  appliances.forEach(({ name, quantity, hoursPerDay }) => {
    const consumptionPerHour = (BASE_CONSUMPTION as any)[name.toUpperCase().replace(/ /g, '_')] || 0.5;
    const dailyConsumption = consumptionPerHour * hoursPerDay * quantity;
    
    breakdown[name] = Number(dailyConsumption.toFixed(2));
    totalDaily += dailyConsumption;
  });

  return {
    totalDaily: Number(totalDaily.toFixed(2)),
    breakdown,
  };
}

/**
 * Calculate heat loss by component (walls, roof, floor, windows)
 */
export function calculateHeatLoss(
  homeType: string,
  constructionYear: number,
  temperature: number
): {
  walls: number;
  roof: number;
  floor: number;
  windows: number;
  ventilation: number;
  total: number;
} {
  // U-values (W/m²K) - heat transfer coefficient
  const getUValues = (year: number) => {
    if (year >= 2010) {
      return { walls: 0.18, roof: 0.13, floor: 0.15, windows: 1.4 };
    } else if (year >= 1990) {
      return { walls: 0.35, roof: 0.20, floor: 0.25, windows: 2.0 };
    } else if (year >= 1970) {
      return { walls: 1.0, roof: 0.60, floor: 0.70, windows: 3.0 };
    } else {
      return { walls: 1.5, roof: 1.20, floor: 1.00, windows: 4.8 };
    }
  };

  // Approximate areas (m²) by home type
  const getAreas = (type: string) => {
    const areas = {
      flat: { walls: 40, roof: 50, floor: 50, windows: 10 },
      terraced: { walls: 80, roof: 70, floor: 70, windows: 15 },
      'semi-detached': { walls: 120, roof: 90, floor: 90, windows: 20 },
      detached: { walls: 180, roof: 120, floor: 120, windows: 30 },
    };
    return areas[type as keyof typeof areas] || areas.terraced;
  };

  const uValues = getUValues(constructionYear);
  const areas = getAreas(homeType);
  const tempDiff = Math.max(0, 19 - temperature); // Assuming 19°C internal temp

  // Heat loss = U-value × Area × Temperature difference (W)
  // Convert to kWh/day: W × 24 / 1000
  const walls = (uValues.walls * areas.walls * tempDiff * 24) / 1000;
  const roof = (uValues.roof * areas.roof * tempDiff * 24) / 1000;
  const floor = (uValues.floor * areas.floor * tempDiff * 24) / 1000;
  const windows = (uValues.windows * areas.windows * tempDiff * 24) / 1000;
  
  // Ventilation heat loss (assume 1 air change per hour)
  const volume = areas.floor * 2.4; // Assume 2.4m ceiling height
  const ventilation = (0.33 * volume * tempDiff * 24) / 1000;

  const total = walls + roof + floor + windows + ventilation;

  return {
    walls: Number(walls.toFixed(2)),
    roof: Number(roof.toFixed(2)),
    floor: Number(floor.toFixed(2)),
    windows: Number(windows.toFixed(2)),
    ventilation: Number(ventilation.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}
