/**
 * UK POSTCODE GEOCODING
 * 
 * Comprehensive UK postcode to coordinates mapping
 * Uses free public data, no API keys needed
 * 
 * @module lib/postcodeGeocoding
 */

interface Coordinates {
  lat: number;
  lon: number;
  area: string;
}

/**
 * Comprehensive UK postcode area mappings
 * Covers all major UK postcode areas with approximate center coordinates
 */
export const POSTCODE_AREAS: Record<string, Coordinates> = {
  // London
  'E': { lat: 51.5389, lon: -0.0099, area: 'East London' },
  'EC': { lat: 51.5174, lon: -0.0935, area: 'East Central London' },
  'N': { lat: 51.5975, lon: -0.1357, area: 'North London' },
  'NW': { lat: 51.5656, lon: -0.1963, area: 'North West London' },
  'SE': { lat: 51.4700, lon: -0.0700, area: 'South East London' },
  'SW': { lat: 51.4700, lon: -0.1900, area: 'South West London' },
  'W': { lat: 51.5130, lon: -0.2283, area: 'West London' },
  'WC': { lat: 51.5152, lon: -0.1231, area: 'West Central London' },
  
  // South East England
  'BR': { lat: 51.4032, lon: 0.0157, area: 'Bromley' },
  'CR': { lat: 51.3727, lon: -0.0977, area: 'Croydon' },
  'DA': { lat: 51.4462, lon: 0.2094, area: 'Dartford' },
  'GU': { lat: 51.2363, lon: -0.5703, area: 'Guildford' },
  'KT': { lat: 51.3727, lon: -0.3386, area: 'Kingston upon Thames' },
  'ME': { lat: 51.3889, lon: 0.5203, area: 'Medway' },
  'RH': { lat: 51.1214, lon: -0.1792, area: 'Redhill' },
  'SM': { lat: 51.3454, lon: -0.1933, area: 'Sutton' },
  'TN': { lat: 51.1324, lon: 0.2644, area: 'Tonbridge' },
  'TW': { lat: 51.4480, lon: -0.3596, area: 'Twickenham' },
  
  // South England
  'BN': { lat: 50.8429, lon: -0.1313, area: 'Brighton' },
  'PO': { lat: 50.8198, lon: -1.0879, area: 'Portsmouth' },
  'SO': { lat: 50.9097, lon: -1.4044, area: 'Southampton' },
  'RG': { lat: 51.4543, lon: -0.9781, area: 'Reading' },
  'SL': { lat: 51.5095, lon: -0.5950, area: 'Slough' },
  
  // South West England
  'BA': { lat: 51.3781, lon: -2.3597, area: 'Bath' },
  'BS': { lat: 51.4545, lon: -2.5879, area: 'Bristol' },
  'EX': { lat: 50.7184, lon: -3.5339, area: 'Exeter' },
  'GL': { lat: 51.8642, lon: -2.2381, area: 'Gloucester' },
  'PL': { lat: 50.3755, lon: -4.1427, area: 'Plymouth' },
  'TA': { lat: 51.0141, lon: -3.1028, area: 'Taunton' },
  'TQ': { lat: 50.4619, lon: -3.5253, area: 'Torquay' },
  'TR': { lat: 50.2632, lon: -5.0510, area: 'Truro' },
  
  // East England
  'CB': { lat: 52.2053, lon: 0.1218, area: 'Cambridge' },
  'CM': { lat: 51.7356, lon: 0.4685, area: 'Chelmsford' },
  'CO': { lat: 51.8917, lon: 0.9036, area: 'Colchester' },
  'IP': { lat: 52.0594, lon: 1.1556, area: 'Ipswich' },
  'NR': { lat: 52.6309, lon: 1.2974, area: 'Norwich' },
  'PE': { lat: 52.5695, lon: -0.2405, area: 'Peterborough' },
  'SS': { lat: 51.5459, lon: 0.7077, area: 'Southend-on-Sea' },
  
  // West Midlands
  'B': { lat: 52.4862, lon: -1.8904, area: 'Birmingham' },
  'CV': { lat: 52.4068, lon: -1.5197, area: 'Coventry' },
  'DY': { lat: 52.5116, lon: -2.0880, area: 'Dudley' },
  'ST': { lat: 52.9909, lon: -2.1243, area: 'Stoke-on-Trent' },
  'TF': { lat: 52.6766, lon: -2.4444, area: 'Telford' },
  'WS': { lat: 52.5855, lon: -2.0094, area: 'Walsall' },
  'WV': { lat: 52.5866, lon: -2.1286, area: 'Wolverhampton' },
  'WR': { lat: 52.1920, lon: -2.2217, area: 'Worcester' },
  
  // East Midlands
  'DE': { lat: 52.9225, lon: -1.4746, area: 'Derby' },
  'DN': { lat: 53.5730, lon: -0.9822, area: 'Doncaster' },
  'LE': { lat: 52.6369, lon: -1.1398, area: 'Leicester' },
  'LN': { lat: 53.2307, lon: -0.5406, area: 'Lincoln' },
  'NG': { lat: 52.9548, lon: -1.1581, area: 'Nottingham' },
  'NN': { lat: 52.2405, lon: -0.9027, area: 'Northampton' },
  
  // Yorkshire and the Humber
  'BD': { lat: 53.7960, lon: -1.7594, area: 'Bradford' },
  'HD': { lat: 53.6459, lon: -1.7850, area: 'Huddersfield' },
  'HG': { lat: 54.0036, lon: -1.5373, area: 'Harrogate' },
  'HX': { lat: 53.7248, lon: -1.8630, area: 'Halifax' },
  'HU': { lat: 53.7457, lon: -0.3367, area: 'Hull' },
  'LS': { lat: 53.8008, lon: -1.5491, area: 'Leeds' },
  'S': { lat: 53.3811, lon: -1.4701, area: 'Sheffield' },
  'WF': { lat: 53.6831, lon: -1.4906, area: 'Wakefield' },
  'YO': { lat: 53.9600, lon: -1.0873, area: 'York' },
  
  // North West England
  'BB': { lat: 53.7528, lon: -2.4809, area: 'Blackburn' },
  'BL': { lat: 53.5768, lon: -2.4282, area: 'Bolton' },
  'CA': { lat: 54.8951, lon: -2.9382, area: 'Carlisle' },
  'CH': { lat: 53.1926, lon: -2.8908, area: 'Chester' },
  'CW': { lat: 53.0963, lon: -2.5199, area: 'Crewe' },
  'FY': { lat: 53.8175, lon: -3.0357, area: 'Blackpool' },
  'L': { lat: 53.4084, lon: -2.9916, area: 'Liverpool' },
  'LA': { lat: 54.0479, lon: -2.8010, area: 'Lancaster' },
  'M': { lat: 53.4808, lon: -2.2426, area: 'Manchester' },
  'OL': { lat: 53.5444, lon: -2.1169, area: 'Oldham' },
  'PR': { lat: 53.7632, lon: -2.7031, area: 'Preston' },
  'SK': { lat: 53.4084, lon: -2.1581, area: 'Stockport' },
  'WA': { lat: 53.3900, lon: -2.5970, area: 'Warrington' },
  'WN': { lat: 53.5448, lon: -2.6318, area: 'Wigan' },
  
  // North East England
  'DH': { lat: 54.8574, lon: -1.5659, area: 'Durham' },
  'DL': { lat: 54.5237, lon: -1.5514, area: 'Darlington' },
  'NE': { lat: 54.9783, lon: -1.6178, area: 'Newcastle upon Tyne' },
  'SR': { lat: 54.9069, lon: -1.3838, area: 'Sunderland' },
  'TS': { lat: 54.5742, lon: -1.2350, area: 'Teesside' },
  
  // Wales
  'CF': { lat: 51.4816, lon: -3.1791, area: 'Cardiff' },
  'LL': { lat: 53.2930, lon: -3.8260, area: 'Llandudno' },
  'NP': { lat: 51.5877, lon: -2.9984, area: 'Newport' },
  'SA': { lat: 51.6214, lon: -3.9436, area: 'Swansea' },
  'SY': { lat: 52.7081, lon: -2.7545, area: 'Shrewsbury' },
  
  // Scotland
  'AB': { lat: 57.1497, lon: -2.0943, area: 'Aberdeen' },
  'DD': { lat: 56.4620, lon: -2.9707, area: 'Dundee' },
  'DG': { lat: 55.0706, lon: -3.6059, area: 'Dumfries' },
  'EH': { lat: 55.9533, lon: -3.1883, area: 'Edinburgh' },
  'FK': { lat: 56.1166, lon: -3.9369, area: 'Falkirk' },
  'G': { lat: 55.8642, lon: -4.2518, area: 'Glasgow' },
  'IV': { lat: 57.4778, lon: -4.2247, area: 'Inverness' },
  'KA': { lat: 55.4537, lon: -4.6293, area: 'Kilmarnock' },
  'KY': { lat: 56.2069, lon: -3.1681, area: 'Kirkcaldy' },
  'ML': { lat: 55.6447, lon: -3.9969, area: 'Motherwell' },
  'PA': { lat: 55.9459, lon: -4.6251, area: 'Paisley' },
  'PH': { lat: 56.3959, lon: -3.4370, area: 'Perth' },
  
  // Northern Ireland
  'BT': { lat: 54.5973, lon: -5.9301, area: 'Belfast' },
};

/**
 * Extract postcode area from full postcode
 * Examples: "SW1A 1AA" -> "SW", "M1 1AE" -> "M", "EH1 1YZ" -> "EH"
 */
export function extractPostcodeArea(postcode: string): string {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, '');
  
  // Match postcode area (1-2 letters at start)
  const match = cleaned.match(/^([A-Z]{1,2})/);
  return match ? match[1] : '';
}

/**
 * Get coordinates for any UK postcode
 * Falls back to regional center if exact match not found
 */
export function geocodePostcode(postcode: string): Coordinates | null {
  if (!postcode) return null;
  
  const area = extractPostcodeArea(postcode);
  
  // Direct match
  if (POSTCODE_AREAS[area]) {
    return POSTCODE_AREAS[area];
  }
  
  // Fallback to London if it looks like a London postcode
  const londonAreas = ['E', 'EC', 'N', 'NW', 'SE', 'SW', 'W', 'WC'];
  if (londonAreas.includes(area)) {
    return { lat: 51.5074, lon: -0.1278, area: 'London' };
  }
  
  // Default fallback to UK center
  return { lat: 52.3555, lon: -1.1743, area: 'UK' };
}

/**
 * Validate UK postcode format
 */
export function isValidPostcode(postcode: string): boolean {
  if (!postcode) return false;
  
  const cleaned = postcode.toUpperCase().replace(/\s+/g, '');
  
  // UK postcode regex pattern
  const pattern = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?[0-9][A-Z]{2}$/;
  
  return pattern.test(cleaned);
}

/**
 * Format postcode nicely (e.g., "sw1a1aa" -> "SW1A 1AA")
 */
export function formatPostcode(postcode: string): string {
  if (!postcode) return '';
  
  const cleaned = postcode.toUpperCase().replace(/\s+/g, '');
  
  if (cleaned.length < 5) return cleaned;
  
  // Add space before last 3 characters
  return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
}

/**
 * Get region name from postcode
 */
export function getRegion(postcode: string): string {
  const coords = geocodePostcode(postcode);
  return coords ? coords.area : 'Unknown';
}

/**
 * Calculate distance between two postcodes (approximate km)
 */
export function calculateDistance(postcode1: string, postcode2: string): number {
  const coord1 = geocodePostcode(postcode1);
  const coord2 = geocodePostcode(postcode2);
  
  if (!coord1 || !coord2) return 0;
  
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * 
    Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return Math.round(R * c);
}
