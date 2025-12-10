/**
 * PLAIN ENGLISH GLOSSARY
 * 
 * Translates technical terms into simple language
 * for non-technical users
 * 
 * @module lib/plainEnglish
 */

export const PLAIN_ENGLISH = {
  // Energy Terms
  kWh: {
    simple: 'Units of Energy',
    explanation: 'This is how energy companies measure what you use - like counting how many cookies you eat. One unit (kWh) is roughly the energy needed to boil a kettle 10 times.',
    icon: '⚡',
  },
  
  carbonIntensity: {
    simple: 'How Green Your Energy Is',
    explanation: "This shows if your energy comes from clean sources (wind, solar) or polluting ones (coal, gas). Lower numbers = cleaner energy = better for the planet!",
    icon: '🌱',
  },
  
  efficiencyScore: {
    simple: 'Your Money-Saving Score',
    explanation: "Like a video game score, but for saving money! Higher = you're doing great! Lower = we have tips to help you improve.",
    icon: '🎯',
  },
  
  tariff: {
    simple: 'Your Energy Plan',
    explanation: "This is the deal you have with your energy company - like a phone contract. Different plans charge different prices.",
    icon: '📋',
  },
  
  standingCharge: {
    simple: 'Daily Fee (No Matter What)',
    explanation: "This is what you pay EVERY day just to be connected to energy, even if you don't use any. It's like a Netflix subscription.",
    icon: '💳',
  },
  
  unitRate: {
    simple: 'Price Per Unit',
    explanation: "This is how much each unit (kWh) of energy costs. Like the price per cookie. Lower = cheaper bills!",
    icon: '💰',
  },
  
  // Home Terms
  epc: {
    simple: 'Home Energy Grade',
    explanation: "Your home gets a grade from A (amazing!) to G (needs work) based on how well it saves energy. Like a school report card for your house!",
    icon: '🏠',
  },
  
  insulation: {
    simple: 'Keeping Heat Inside',
    explanation: "Like wearing a warm coat in winter, insulation stops heat escaping from your home. Good insulation = lower heating bills!",
    icon: '🧥',
  },
  
  heatPump: {
    simple: 'Modern Heating System',
    explanation: "Like a reverse fridge - it takes warmth from outside air and pumps it into your home. More expensive to install but cheaper to run!",
    icon: '🔥',
  },
  
  // Comparison Terms
  regionalAverage: {
    simple: 'What Your Neighbors Pay',
    explanation: "This is what other people in your area typically pay for energy. It helps you see if you're paying too much!",
    icon: '🏘️',
  },
  
  nationalAverage: {
    simple: 'UK Average Cost',
    explanation: "What the average person in the whole UK pays for energy. Good for seeing how your area compares!",
    icon: '🇬🇧',
  },
  
  // Action Terms
  switch: {
    simple: 'Change Energy Company',
    explanation: "Switching means moving to a different energy company that charges less. It's FREE and usually takes 2-3 weeks!",
    icon: '🔄',
  },
  
  comparison: {
    simple: 'Check Other Deals',
    explanation: "We'll show you other energy companies and their prices, so you can see if you could pay less by switching.",
    icon: '🔍',
  },
};

/**
 * Convert technical term to plain English
 */
export function toPlainEnglish(term: string): {
  simple: string;
  explanation: string;
  icon: string;
} {
  const key = term.toLowerCase().replace(/\s+/g, '');
  return PLAIN_ENGLISH[key as keyof typeof PLAIN_ENGLISH] || {
    simple: term,
    explanation: 'Need help understanding this? Contact us!',
    icon: '❓',
  };
}

/**
 * Format cost in plain English with context
 */
export function explainCost(amount: number, period: 'day' | 'week' | 'month' | 'year'): string {
  const comparisons = [
    { threshold: 1, comparison: "about a coffee" },
    { threshold: 5, comparison: "about a McDonald's meal" },
    { threshold: 10, comparison: "about a cinema ticket" },
    { threshold: 20, comparison: "about a takeaway pizza" },
    { threshold: 50, comparison: "about a nice dinner out" },
    { threshold: 100, comparison: "about a week's groceries" },
    { threshold: 200, comparison: "about a smartphone" },
    { threshold: 500, comparison: "about a short holiday" },
  ];

  const match = comparisons.find(c => amount <= c.threshold) || comparisons[comparisons.length - 1];

  return `£${amount.toFixed(2)} per ${period} (${match.comparison})`;
}

/**
 * Explain savings potential in relatable terms
 */
export function explainSavings(amount: number): string {
  if (amount < 50) {
    return `That's ${Math.round(amount / 4)} takeaway coffees saved!`;
  } else if (amount < 100) {
    return `That's enough for ${Math.floor(amount / 15)} cinema trips!`;
  } else if (amount < 300) {
    return `That's like getting ${Math.floor(amount / 100)} month's worth of streaming subscriptions FREE!`;
  } else if (amount < 500) {
    return `That's a nice weekend away with your family!`;
  } else {
    return `That's a proper holiday abroad!`;
  }
}

/**
 * Explain percentage changes in simple terms
 */
export function explainPercentage(percentage: number, context: 'saving' | 'increase'): string {
  const abs = Math.abs(percentage);
  
  if (abs < 5) return 'a tiny bit';
  if (abs < 10) return 'a small amount';
  if (abs < 20) return 'a decent amount';
  if (abs < 30) return 'quite a lot';
  if (abs < 50) return 'a huge amount';
  return 'a massive amount';
}

/**
 * Simplify energy efficiency rating
 */
export function explainEPCRating(rating: string): {
  grade: string;
  emoji: string;
  simple: string;
  action: string;
} {
  const ratings = {
    'A': { emoji: '🌟', simple: 'Amazing', action: 'Your home is super energy efficient' },
    'B': { emoji: '😊', simple: 'Great', action: 'Your home is very efficient' },
    'C': { emoji: '👍', simple: 'Good', action: 'Your home is doing well' },
    'D': { emoji: '😐', simple: 'OK', action: 'Room for improvement' },
    'E': { emoji: '😕', simple: 'Could be better', action: 'Some upgrades would help' },
    'F': { emoji: '😟', simple: 'Needs work', action: 'Improvements would save money' },
    'G': { emoji: '😰', simple: 'Needs urgent work', action: 'Big savings potential' },
  };

  const info = ratings[rating as keyof typeof ratings] || ratings['D'];
  
  return {
    grade: rating,
    ...info,
  };
}

/**
 * Convert daily cost to monthly budget impact
 */
export function toBudgetImpact(dailyCost: number): {
  monthly: string;
  yearly: string;
  comparison: string;
} {
  const monthly = dailyCost * 30;
  const yearly = dailyCost * 365;

  let comparison = '';
  if (monthly < 50) {
    comparison = "less than a gym membership";
  } else if (monthly < 100) {
    comparison = "about a phone contract";
  } else if (monthly < 150) {
    comparison = "like a car insurance payment";
  } else {
    comparison = "quite a chunk of your monthly budget";
  }

  return {
    monthly: `£${monthly.toFixed(2)}/month`,
    yearly: `£${yearly.toFixed(2)}/year`,
    comparison,
  };
}

/**
 * Quick action recommendations in plain English
 */
export const QUICK_ACTIONS = [
  {
    title: 'Turn thermostat down 1°C',
    savings: '£80/year',
    effort: 'Takes 10 seconds',
    icon: '🌡️',
    description: 'Most people won\'t even notice! Just turn your heating dial one notch down.',
  },
  {
    title: 'Switch off standby devices',
    savings: '£45/year',
    effort: 'Takes 1 minute',
    icon: '🔌',
    description: 'Turn things fully OFF at the plug when not using them - especially TVs and computers!',
  },
  {
    title: 'Use washing machine at 30°C',
    savings: '£28/year',
    effort: 'No effort!',
    icon: '👕',
    description: 'Modern detergents work great at 30°C. Just change the dial!',
  },
  {
    title: 'Check if you can switch energy company',
    savings: '£300/year',
    effort: 'Takes 5 minutes',
    icon: '🔄',
    description: 'Takes 5 minutes to check, could save hundreds! We\'ll show you how.',
  },
  {
    title: 'Get a smart meter (it\'s free!)',
    savings: '£50/year',
    effort: 'Free installation',
    icon: '📊',
    description: 'Your energy company will install it FREE. You\'ll see exactly what you\'re using!',
  },
];

export default PLAIN_ENGLISH;
