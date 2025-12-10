/**
 * PRODUCT RECOMMENDATION SERVICE
 * 
 * Energy-efficient product recommendations
 * Category-based: heaters, appliances, smart devices, insulation
 * AI-powered personalization
 * Safe review analysis (no scraping)
 */

export type ProductCategory = 
  | 'heaters'
  | 'washing-machines'
  | 'tumble-dryers'
  | 'dehumidifiers'
  | 'led-lighting'
  | 'smart-plugs'
  | 'insulation'
  | 'kitchen-efficiency';

export type ProductTier = 'top-pick' | 'budget' | 'premium';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  tier: ProductTier;
  brand: string;
  model: string;
  
  // Pricing
  price: number; // £
  previousPrice?: number; // For showing discounts
  
  // Performance
  energyRating: 'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D';
  powerConsumption: number; // Watts
  energyCostPerHour: number; // £/hour at avg UK rate
  annualRunningCost?: number; // £/year
  
  // Reviews (aggregated data only)
  rating: number; // 0-5
  reviewCount: number;
  reliabilityScore: number; // 0-100
  ratingTrend: 'rising' | 'stable' | 'falling';
  
  // AI-generated summary (not copied from reviews)
  aiSentiment: string;
  pros: string[];
  cons: string[];
  
  // Product details
  description: string;
  features: string[];
  image: string;
  affiliateLink: string;
  
  // Metadata
  inStock: boolean;
  lastUpdated: string;
  popularityScore: number; // 0-100
}

export interface ProductRecommendation {
  product: Product;
  matchScore: number; // 0-100
  reasonsToConsider: string[];
  estimatedSavings?: number; // £/year
  paybackPeriod?: number; // months
}

export interface CategoryRecommendations {
  category: ProductCategory;
  topPick: Product;
  budgetPick: Product;
  premiumPick: Product;
  allProducts: Product[];
}

/**
 * Product categories metadata
 */
export const PRODUCT_CATEGORIES = [
  {
    id: 'heaters' as ProductCategory,
    label: 'Heaters',
    emoji: '🔥',
    description: 'Energy-efficient space heaters and panel heaters',
  },
  {
    id: 'washing-machines' as ProductCategory,
    label: 'Washing Machines',
    emoji: '🧺',
    description: 'Low energy washing machines',
  },
  {
    id: 'tumble-dryers' as ProductCategory,
    label: 'Tumble Dryers',
    emoji: '👕',
    description: 'Heat pump and condenser dryers',
  },
  {
    id: 'dehumidifiers' as ProductCategory,
    label: 'Dehumidifiers',
    emoji: '💧',
    description: 'Prevent mould and reduce heating costs',
  },
  {
    id: 'led-lighting' as ProductCategory,
    label: 'LED Lighting',
    emoji: '💡',
    description: 'Energy-saving LED bulbs and strips',
  },
  {
    id: 'smart-plugs' as ProductCategory,
    label: 'Smart Plugs',
    emoji: '🔌',
    description: 'Monitor and control appliance power',
  },
  {
    id: 'insulation' as ProductCategory,
    label: 'Insulation',
    emoji: '🏠',
    description: 'Draught excluders, window film, pipe insulation',
  },
  {
    id: 'kitchen-efficiency' as ProductCategory,
    label: 'Kitchen Efficiency',
    emoji: '🍳',
    description: 'Air fryers, slow cookers, pressure cookers',
  },
];

/**
 * Mock product database
 * In production, fetch from API and update weekly
 */
const MOCK_PRODUCTS: Product[] = [
  // HEATERS
  {
    id: 'heater-001',
    name: 'Devola Electric Panel Heater',
    category: 'heaters',
    tier: 'top-pick',
    brand: 'Devola',
    model: 'DVPW2000W',
    price: 89.99,
    previousPrice: 119.99,
    energyRating: 'A',
    powerConsumption: 2000,
    energyCostPerHour: 0.49,
    annualRunningCost: 235,
    rating: 4.6,
    reviewCount: 1247,
    reliabilityScore: 88,
    ratingTrend: 'rising',
    aiSentiment: 'Highly recommended for energy efficiency and reliability. Users praise quick heating and low running costs.',
    pros: ['Fast heating', 'Slim design', 'Programmable timer', 'Low noise'],
    cons: ['No remote control', 'Basic controls'],
    description: 'Wall-mountable panel heater with thermostat and 24/7 timer. Ideal for bedrooms and offices.',
    features: ['2000W output', 'Wall-mount brackets', 'Overheating protection', 'IP24 splash-proof'],
    image: '/products/heaters/devola-panel.jpg',
    affiliateLink: 'https://www.amazon.co.uk/s?k=Devola+Electric+Panel+Heater',
    inStock: true,
    lastUpdated: new Date('2024-12-01').toISOString(),
    popularityScore: 92,
  },
  {
    id: 'heater-002',
    name: 'Duronic Oil-Filled Radiator',
    category: 'heaters',
    tier: 'budget',
    brand: 'Duronic',
    model: 'HV102',
    price: 54.99,
    energyRating: 'B',
    powerConsumption: 2500,
    energyCostPerHour: 0.61,
    annualRunningCost: 293,
    rating: 4.3,
    reviewCount: 892,
    reliabilityScore: 76,
    ratingTrend: 'stable',
    aiSentiment: 'Best value oil-filled radiator. Retains heat well, though higher running costs than panel heaters.',
    pros: ['Retains heat', 'Portable', 'Silent operation', 'Affordable'],
    cons: ['Slow to warm up', 'Heavy', 'Higher energy use'],
    description: 'Portable oil-filled radiator with 3 heat settings and adjustable thermostat.',
    features: ['2500W max', '11 fins', 'Safety tip-over switch', 'Thermal cutout'],
    image: '/products/heaters/duronic-radiator.jpg',
    affiliateLink: 'https://www.amazon.co.uk/s?k=Duronic+Oil+Filled+Radiator',
    inStock: true,
    lastUpdated: new Date('2024-12-01').toISOString(),
    popularityScore: 78,
  },
  {
    id: 'heater-003',
    name: 'Dyson Hot+Cool AM09',
    category: 'heaters',
    tier: 'premium',
    brand: 'Dyson',
    model: 'AM09',
    price: 399.99,
    energyRating: 'A+',
    powerConsumption: 2000,
    energyCostPerHour: 0.49,
    annualRunningCost: 220,
    rating: 4.7,
    reviewCount: 2341,
    reliabilityScore: 94,
    ratingTrend: 'stable',
    aiSentiment: 'Premium choice with advanced features. Highly efficient with fan mode for summer. Excellent build quality.',
    pros: ['Dual function', 'Precise temperature', 'Oscillation', 'Sleep timer'],
    cons: ['Expensive', 'Noisy on high', 'Large footprint'],
    description: 'Bladeless heater and fan with precise temperature control and remote.',
    features: ['Jet Focus control', 'Sleep timer', 'Remote control', '10 airspeed settings'],
    image: '/products/heaters/dyson-am09.jpg',
    affiliateLink: 'https://www.amazon.co.uk/s?k=Dyson+Hot+Cool+AM09',
    inStock: true,
    lastUpdated: new Date('2024-12-01').toISOString(),
    popularityScore: 89,
  },

  // WASHING MACHINES
  {
    id: 'washer-001',
    name: 'Beko Pro WEX940530B',
    category: 'washing-machines',
    tier: 'top-pick',
    brand: 'Beko',
    model: 'WEX940530B',
    price: 399.99,
    energyRating: 'A',
    powerConsumption: 150,
    energyCostPerHour: 0.04,
    annualRunningCost: 42,
    rating: 4.5,
    reviewCount: 1567,
    reliabilityScore: 85,
    ratingTrend: 'rising',
    aiSentiment: 'Excellent energy efficiency with fast wash cycles. Users report significant savings on bills.',
    pros: ['Low energy use', 'Quick wash', '9kg capacity', 'Quiet'],
    cons: ['Basic display', 'No steam function'],
    description: '9kg washing machine with RecycledTub technology and 15 programs.',
    features: ['A-rated efficiency', '1400rpm spin', 'Quick wash 28min', 'Auto dose'],
    image: '/products/washers/beko-pro.jpg',
    affiliateLink: 'https://www.amazon.co.uk/s?k=Beko+WEX940530B',
    inStock: true,
    lastUpdated: new Date('2024-12-01').toISOString(),
    popularityScore: 91,
  },
  {
    id: 'washer-002',
    name: 'Indesit BWE 71452',
    category: 'washing-machines',
    tier: 'budget',
    brand: 'Indesit',
    model: 'BWE71452',
    price: 249.99,
    energyRating: 'B',
    powerConsumption: 180,
    energyCostPerHour: 0.04,
    annualRunningCost: 52,
    rating: 4.2,
    reviewCount: 743,
    reliabilityScore: 72,
    ratingTrend: 'stable',
    aiSentiment: 'Affordable and reliable for basic washing needs. Good value but higher energy costs.',
    pros: ['Affordable', 'Reliable', '7kg capacity', 'Simple controls'],
    cons: ['Noisy spin', 'Basic features', 'Higher energy use'],
    description: '7kg freestanding washing machine with 16 programs.',
    features: ['1400rpm spin', 'Delay timer', 'Quick wash', 'Cold wash option'],
    image: '/products/washers/indesit-bwe.jpg',
    affiliateLink: 'https://www.amazon.co.uk/s?k=Indesit+BWE71452',
    inStock: true,
    lastUpdated: new Date('2024-12-01').toISOString(),
    popularityScore: 68,
  },

  // SMART PLUGS
  {
    id: 'plug-001',
    name: 'TP-Link Tapo P110',
    category: 'smart-plugs',
    tier: 'top-pick',
    brand: 'TP-Link',
    model: 'Tapo P110',
    price: 12.99,
    energyRating: 'A++',
    powerConsumption: 0.5,
    energyCostPerHour: 0.0001,
    annualRunningCost: 1,
    rating: 4.7,
    reviewCount: 8934,
    reliabilityScore: 93,
    ratingTrend: 'rising',
    aiSentiment: 'Best smart plug for energy monitoring. Accurate readings and reliable app. Users report £50+ annual savings.',
    pros: ['Energy monitoring', 'Compact', 'Reliable app', 'Voice control'],
    cons: ['Requires 2.4GHz WiFi', 'No USB ports'],
    description: 'Smart plug with energy monitoring and scheduling. Track power usage in real-time.',
    features: ['13A max', 'Energy stats', 'Timer & schedules', 'Alexa/Google compatible'],
    image: '/products/plugs/tapo-p110.jpg',
    affiliateLink: 'https://www.amazon.co.uk/s?k=TP-Link+Tapo+P110',
    inStock: true,
    lastUpdated: new Date('2024-12-01').toISOString(),
    popularityScore: 96,
  },

  // LED LIGHTING
  {
    id: 'led-001',
    name: 'Philips Hue White Starter Kit',
    category: 'led-lighting',
    tier: 'premium',
    brand: 'Philips',
    model: 'Hue White E27',
    price: 59.99,
    energyRating: 'A++',
    powerConsumption: 9,
    energyCostPerHour: 0.0022,
    annualRunningCost: 4,
    rating: 4.8,
    reviewCount: 12456,
    reliabilityScore: 96,
    ratingTrend: 'stable',
    aiSentiment: 'Premium smart lighting with excellent app and automation. Significant energy savings vs traditional bulbs.',
    pros: ['Smart control', 'Scheduling', 'Long lifespan', 'Very low energy'],
    cons: ['Expensive upfront', 'Requires hub', 'Bridge needed'],
    description: 'Smart LED bulbs with hub. Control brightness and create schedules.',
    features: ['800 lumens', '25,000hr lifespan', 'Voice control', 'Away mode'],
    image: '/products/led/philips-hue.jpg',
    affiliateLink: 'https://www.amazon.co.uk/s?k=Philips+Hue+White+Starter+Kit',
    inStock: true,
    lastUpdated: new Date('2024-12-01').toISOString(),
    popularityScore: 94,
  },
  {
    id: 'led-002',
    name: 'Amazon Basics LED Bulbs (6-pack)',
    category: 'led-lighting',
    tier: 'budget',
    brand: 'Amazon Basics',
    model: 'LED-E27-806lm',
    price: 14.99,
    energyRating: 'A+',
    powerConsumption: 9,
    energyCostPerHour: 0.0022,
    annualRunningCost: 4,
    rating: 4.4,
    reviewCount: 5678,
    reliabilityScore: 79,
    ratingTrend: 'stable',
    aiSentiment: 'Great value LED bulbs. No smart features but excellent energy savings. Reliable for basic use.',
    pros: ['Affordable', 'Energy efficient', 'Good brightness', 'Standard fitting'],
    cons: ['No dimming', 'No smart features', 'Basic quality'],
    description: 'Standard LED bulbs. 806 lumens, warm white, 15,000hr lifespan.',
    features: ['806 lumens', '15,000hr life', 'Warm white', 'E27 fitting'],
    image: '/products/led/amazon-basics.jpg',
    affiliateLink: 'https://www.amazon.co.uk/s?k=Amazon+Basics+LED+Bulbs',
    inStock: true,
    lastUpdated: new Date('2024-12-01').toISOString(),
    popularityScore: 82,
  },

  // DEHUMIDIFIERS
  {
    id: 'dehum-001',
    name: 'Pro Breeze 12L Dehumidifier',
    category: 'dehumidifiers',
    tier: 'top-pick',
    brand: 'Pro Breeze',
    model: 'PB-02-EU',
    price: 159.99,
    energyRating: 'A',
    powerConsumption: 220,
    energyCostPerHour: 0.05,
    annualRunningCost: 88,
    rating: 4.6,
    reviewCount: 2134,
    reliabilityScore: 87,
    ratingTrend: 'rising',
    aiSentiment: 'Excellent for preventing mould and reducing heating costs. Efficient and quiet operation.',
    pros: ['Prevents mould', 'Quiet', 'Auto shut-off', 'Large tank'],
    cons: ['Heavy', 'No pump', 'Loud on turbo'],
    description: '12L/day dehumidifier with continuous drainage option. Ideal for 3-bed homes.',
    features: ['12L capacity', 'Digital display', 'Timer', 'Laundry mode'],
    image: '/products/dehum/probreeze-12l.jpg',
    affiliateLink: 'https://www.amazon.co.uk/s?k=Pro+Breeze+12L+Dehumidifier',
    inStock: true,
    lastUpdated: new Date('2024-12-01').toISOString(),
    popularityScore: 88,
  },

  // KITCHEN EFFICIENCY
  {
    id: 'kitchen-001',
    name: 'Ninja Dual Zone Air Fryer',
    category: 'kitchen-efficiency',
    tier: 'top-pick',
    brand: 'Ninja',
    model: 'AF300UK',
    price: 199.99,
    previousPrice: 249.99,
    energyRating: 'A++',
    powerConsumption: 2470,
    energyCostPerHour: 0.60,
    annualRunningCost: 52,
    rating: 4.8,
    reviewCount: 15234,
    reliabilityScore: 95,
    ratingTrend: 'rising',
    aiSentiment: 'Best air fryer for energy savings. Uses 70% less energy than conventional ovens. Highly rated.',
    pros: ['Dual zones', 'Fast cooking', 'Low energy', 'Versatile'],
    cons: ['Large size', 'Expensive', 'Learning curve'],
    description: '7.6L dual-zone air fryer. Cook two foods at once with different settings.',
    features: ['7.6L capacity', '6 cooking functions', 'Dishwasher safe', 'Match Cook'],
    image: '/products/kitchen/ninja-airfryer.jpg',
    affiliateLink: 'https://www.amazon.co.uk/s?k=Ninja+Dual+Zone+Air+Fryer',
    inStock: true,
    lastUpdated: new Date('2024-12-01').toISOString(),
    popularityScore: 97,
  },
];

/**
 * Get all products by category
 * Uses REAL DATA from legal sources when available
 */
export async function getProductsByCategory(category: ProductCategory, useRealData: boolean = true): Promise<CategoryRecommendations> {
  let products: Product[] = [];
  
  // Try to get real data first
  if (useRealData) {
    try {
      const { getRealProductData } = await import('./realProductDataService');
      const realProducts = await getRealProductData(category, 20);
      if (realProducts.length > 0) {
        console.log(`✅ Using REAL product data (${realProducts.length} products)`);
        products = realProducts;
      }
    } catch (error) {
      console.warn('Real data fetch failed, using mock:', error);
    }
  }
  
  // Fallback to mock data
  if (products.length === 0) {
    console.log('📦 Using mock product data (fallback)');
    products = MOCK_PRODUCTS.filter(p => p.category === category);
  }
  
  return {
    category,
    topPick: products.find(p => p.tier === 'top-pick')!,
    budgetPick: products.find(p => p.tier === 'budget')!,
    premiumPick: products.find(p => p.tier === 'premium')!,
    allProducts: products,
  };
}

/**
 * Get all products
 * Uses REAL DATA when available
 */
export async function getAllProducts(filters?: {
  category?: ProductCategory;
  maxPrice?: number;
  minRating?: number;
  useRealData?: boolean;
}): Promise<Product[]> {
  let products: Product[] = [];
  
  // Try to get real data first (prioritize real data over mock)
  if (filters?.useRealData !== false) {
    try {
      const { getRealProductData } = await import('./realProductDataService');
      const category = filters?.category || 'heaters'; // Default to heaters if no category
      const realProducts = await getRealProductData(category, 50);
      if (realProducts.length > 0) {
        console.log(`✅ Using REAL product data (${realProducts.length} products from ${category})`);
        products = realProducts;
      } else {
        console.log('⚠️ No real products found, falling back to mock data');
      }
    } catch (error) {
      console.warn('❌ Real data fetch failed, using mock data:', error);
    }
  }
  
  // Fallback to mock data
  if (products.length === 0) {
    products = [...MOCK_PRODUCTS];
  }

  if (filters?.category) {
    products = products.filter(p => p.category === filters.category);
  }

  if (filters?.maxPrice !== undefined) {
    const maxPrice = filters.maxPrice;
    products = products.filter(p => p.price <= maxPrice);
  }

  if (filters?.minRating !== undefined) {
    const minRating = filters.minRating;
    products = products.filter(p => p.rating >= minRating);
  }

  // Sort by popularity
  products.sort((a, b) => b.popularityScore - a.popularityScore);

  return products;
}

/**
 * Get single product
 */
export async function getProduct(productId: string): Promise<Product | null> {
  return MOCK_PRODUCTS.find(p => p.id === productId) || null;
}

/**
 * Calculate product savings vs current appliance
 */
export function calculateProductSavings(
  product: Product,
  currentPowerConsumption: number, // Watts
  hoursPerDay: number = 4
): {
  annualSavings: number;
  paybackPeriod: number;
  co2Reduction: number; // kg/year
} {
  const daysPerYear = 365;
  const ukElectricityRate = 0.245; // £/kWh (Dec 2024)
  const co2PerKwh = 0.233; // kg CO2 per kWh (UK grid)

  // Current costs
  const currentKwhPerYear = (currentPowerConsumption / 1000) * hoursPerDay * daysPerYear;
  const currentAnnualCost = currentKwhPerYear * ukElectricityRate;

  // New product costs
  const newKwhPerYear = (product.powerConsumption / 1000) * hoursPerDay * daysPerYear;
  const newAnnualCost = newKwhPerYear * ukElectricityRate;

  // Savings
  const annualSavings = currentAnnualCost - newAnnualCost;
  const paybackPeriod = annualSavings > 0 ? product.price / annualSavings : 999;

  // CO2 reduction
  const co2Reduction = (currentKwhPerYear - newKwhPerYear) * co2PerKwh;

  return {
    annualSavings: Math.max(0, annualSavings),
    paybackPeriod: Math.ceil(paybackPeriod),
    co2Reduction: Math.max(0, co2Reduction),
  };
}

/**
 * Get trending products
 * Uses REAL DATA by default
 */
export async function getTrendingProducts(limit: number = 6, useRealData: boolean = true): Promise<Product[]> {
  // Try to get real data from all categories
  if (useRealData) {
    try {
      const { getRealProductData } = await import('./realProductDataService');
      const categories: ProductCategory[] = ['heaters', 'washing-machines', 'led-lighting', 'smart-plugs'];
      const allRealProducts: Product[] = [];
      
      for (const cat of categories) {
        const products = await getRealProductData(cat, 5);
        allRealProducts.push(...products);
      }
      
      if (allRealProducts.length > 0) {
        console.log(`✅ Using REAL trending products (${allRealProducts.length} products)`);
        return allRealProducts
          .sort((a, b) => b.popularityScore - a.popularityScore)
          .slice(0, limit);
      }
    } catch (error) {
      console.warn('Real trending products fetch failed:', error);
    }
  }
  
  console.log('📦 Using mock trending products (fallback)');
  return MOCK_PRODUCTS
    .filter(p => p.ratingTrend === 'rising')
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit);
}

/**
 * Search products
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const lowerQuery = query.toLowerCase();
  
  return MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.brand.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Update product database (admin only)
 * In production, fetch from Amazon Product API, etc.
 */
export async function updateProductDatabase(): Promise<void> {
  // Mock implementation
  // In production:
  // 1. Fetch from Amazon/eBay APIs
  // 2. Update prices and stock
  // 3. Recalculate ratings and trends
  // 4. Generate new AI sentiments
  // 5. Save to Firestore
  
  console.log('Product database updated');
}

/**
 * Check if product data is stale
 */
export function isProductDataStale(lastUpdated: string): boolean {
  const weekInMs = 7 * 24 * 60 * 60 * 1000;
  const lastUpdateTime = new Date(lastUpdated).getTime();
  const now = Date.now();
  
  return (now - lastUpdateTime) > weekInMs;
}
