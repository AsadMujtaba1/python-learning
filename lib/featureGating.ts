/**
 * FEATURE GATING SYSTEM
 * 
 * Controls access to free vs premium features
 * Provides clear upgrade paths
 * 
 * @module lib/featureGating
 */

import { UserProfile, PremiumTier, isPremiumActive } from './userProfile';

export interface Feature {
  id: string;
  name: string;
  description: string;
  requiredTier: PremiumTier[];
  category: 'analytics' | 'insights' | 'tools' | 'support' | 'data';
}

/**
 * All features with their access levels
 */
export const FEATURES: Feature[] = [
  // FREE FEATURES
  {
    id: 'basic_dashboard',
    name: 'Basic Dashboard',
    description: 'View your daily energy costs and simple trends',
    requiredTier: ['free', 'premium', 'lifetime'],
    category: 'analytics',
  },
  {
    id: 'weather_integration',
    name: 'Weather & Cost Correlation',
    description: 'See how weather affects your energy usage',
    requiredTier: ['free', 'premium', 'lifetime'],
    category: 'insights',
  },
  {
    id: 'cost_tracking',
    name: '7-Day Cost History',
    description: 'Track your costs for the past week',
    requiredTier: ['free', 'premium', 'lifetime'],
    category: 'data',
  },
  {
    id: 'uk_benchmarks',
    name: 'UK Average Comparison',
    description: 'Compare your costs to UK and regional averages',
    requiredTier: ['free', 'premium', 'lifetime'],
    category: 'analytics',
  },
  {
    id: 'basic_tips',
    name: 'Basic Energy Saving Tips',
    description: 'Get simple tips to reduce your energy bills',
    requiredTier: ['free', 'premium', 'lifetime'],
    category: 'insights',
  },
  
  // PREMIUM FEATURES
  {
    id: 'ai_insights',
    name: 'AI-Powered Insights',
    description: 'Get personalized recommendations powered by AI',
    requiredTier: ['premium', 'lifetime'],
    category: 'insights',
  },
  {
    id: 'weekly_digest',
    name: 'Weekly AI Digest Email',
    description: 'Receive weekly analysis and recommendations',
    requiredTier: ['premium', 'lifetime'],
    category: 'insights',
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics Dashboard',
    description: 'Deep dive into patterns, trends, and anomalies',
    requiredTier: ['premium', 'lifetime'],
    category: 'analytics',
  },
  {
    id: 'extended_history',
    name: '365-Day Cost History',
    description: 'Access full year of historical data and trends',
    requiredTier: ['premium', 'lifetime'],
    category: 'data',
  },
  {
    id: 'appliance_breakdown',
    name: 'Appliance-Level Breakdown',
    description: 'See which appliances cost you the most',
    requiredTier: ['premium', 'lifetime'],
    category: 'analytics',
  },
  {
    id: 'bill_upload',
    name: 'Bill Upload & OCR',
    description: 'Upload your energy bills for automatic data extraction',
    requiredTier: ['premium', 'lifetime'],
    category: 'tools',
  },
  {
    id: 'tariff_comparison',
    name: 'Smart Tariff Comparison',
    description: 'Find the cheapest energy tariffs for your usage',
    requiredTier: ['premium', 'lifetime'],
    category: 'tools',
  },
  {
    id: 'solar_modeling',
    name: 'Solar Panel ROI Calculator',
    description: 'Calculate if solar panels are worth it for your home',
    requiredTier: ['premium', 'lifetime'],
    category: 'tools',
  },
  {
    id: 'heatpump_modeling',
    name: 'Heat Pump Savings Calculator',
    description: 'Estimate savings from switching to a heat pump',
    requiredTier: ['premium', 'lifetime'],
    category: 'tools',
  },
  {
    id: 'pdf_export',
    name: 'PDF Report Export',
    description: 'Download professional reports for landlords/accountants',
    requiredTier: ['premium', 'lifetime'],
    category: 'tools',
  },
  {
    id: 'priority_support',
    name: 'Priority Email Support',
    description: 'Get help within 24 hours from our team',
    requiredTier: ['premium', 'lifetime'],
    category: 'support',
  },
  {
    id: 'custom_goals',
    name: 'Custom Savings Goals',
    description: 'Set personalized targets and track progress',
    requiredTier: ['premium', 'lifetime'],
    category: 'tools',
  },
  {
    id: 'api_access',
    name: 'API Access',
    description: 'Connect your smart home devices and meters',
    requiredTier: ['premium', 'lifetime'],
    category: 'tools',
  },
];

/**
 * BETA: Features enabled for all users during beta testing
 * These will be restricted to premium after public launch
 */
const BETA_ENABLED_FEATURES = [
  'bill_upload',
  'tariff_comparison',
  'ai_insights',
  'advanced_analytics',
  'solar_modeling',
  'heatpump_modeling',
];

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(profile: UserProfile | null, featureId: string): boolean {
  // BETA: Enable key features for all users
  if (BETA_ENABLED_FEATURES.includes(featureId)) {
    return true;
  }
  
  if (!profile) return false;
  
  const feature = FEATURES.find(f => f.id === featureId);
  if (!feature) return false;
  
  // Check if user's tier grants access
  if (feature.requiredTier.includes('free')) return true;
  
  if (isPremiumActive(profile)) {
    return feature.requiredTier.includes(profile.premiumTier);
  }
  
  return false;
}

/**
 * Get all features user has access to
 */
export function getAccessibleFeatures(profile: UserProfile | null): Feature[] {
  return FEATURES.filter(feature => hasFeatureAccess(profile, feature.id));
}

/**
 * Get locked premium features (for upgrade prompts)
 */
export function getLockedFeatures(profile: UserProfile | null): Feature[] {
  return FEATURES.filter(feature => !hasFeatureAccess(profile, feature.id));
}

/**
 * Get feature by category
 */
export function getFeaturesByCategory(
  profile: UserProfile | null,
  category: Feature['category']
): {
  accessible: Feature[];
  locked: Feature[];
} {
  const categoryFeatures = FEATURES.filter(f => f.category === category);
  
  return {
    accessible: categoryFeatures.filter(f => hasFeatureAccess(profile, f.id)),
    locked: categoryFeatures.filter(f => !hasFeatureAccess(profile, f.id)),
  };
}

/**
 * Premium benefits for marketing
 */
export const PREMIUM_BENEFITS = [
  {
    icon: '🤖',
    title: 'AI-Powered Insights',
    description: 'Get personalized recommendations that save you money',
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Deep dive into your usage patterns and trends',
  },
  {
    icon: '☀️',
    title: 'Solar & Heat Pump Calculators',
    description: 'See if renewable energy makes sense for your home',
  },
  {
    icon: '📅',
    title: 'Full Year History',
    description: 'Access 365 days of data and insights',
  },
  {
    icon: '📧',
    title: 'Weekly AI Digest',
    description: 'Personalized weekly reports delivered to your inbox',
  },
  {
    icon: '💾',
    title: 'PDF Export',
    description: 'Professional reports for landlords and accountants',
  },
  {
    icon: '⚡',
    title: 'Priority Support',
    description: '24-hour response time from our expert team',
  },
  {
    icon: '🔌',
    title: 'API Access',
    description: 'Connect smart meters and home automation',
  },
];

/**
 * Pricing tiers
 */
export const PRICING = {
  monthly: {
    price: 4.99,
    savings: 0,
    label: 'Monthly',
  },
  yearly: {
    price: 39.99,
    savings: 19.89,
    label: 'Yearly',
    popular: true,
  },
  lifetime: {
    price: 99.99,
    savings: 499.01,
    label: 'Lifetime',
  },
};

/**
 * Get upgrade call-to-action message
 */
export function getUpgradeMessage(featureId: string): string {
  const feature = FEATURES.find(f => f.id === featureId);
  if (!feature) return 'Upgrade to Premium to unlock this feature';
  
  const messages: Record<string, string> = {
    ai_insights: '🤖 Get AI-powered insights that could save you £200+/year. Upgrade now!',
    weekly_digest: '📧 Stay on top of your savings with weekly AI reports. Go Premium!',
    solar_modeling: '☀️ See if solar panels are worth it for your home. Upgrade to find out!',
    extended_history: '📊 Unlock full year of data to spot long-term trends. Go Premium!',
    pdf_export: '📄 Download professional reports to share with landlords. Upgrade now!',
  };
  
  return messages[featureId] || `🌟 Upgrade to Premium to unlock ${feature.name}`;
}

/**
 * Feature gate component helper
 */
export interface FeatureGateProps {
  featureId: string;
  profile: UserProfile | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}
