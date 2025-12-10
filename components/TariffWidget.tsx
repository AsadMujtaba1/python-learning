/**
 * TARIFF WIDGET COMPONENT
 * 
 * Displays top tariff recommendation on dashboard
 * Compact card with savings potential
 * Premium feature
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/lib/userProfile';
import { getRecommendedTariffs, estimateAnnualUsage, TariffComparison } from '@/lib/tariffEngine';
import Button from './Button';
import FeatureGate from './FeatureGate';

interface TariffWidgetProps {
  profile: UserProfile | null;
  currentAnnualCost?: number;
}

export default function TariffWidget({ profile, currentAnnualCost = 1400 }: TariffWidgetProps) {
  const [topRecommendation, setTopRecommendation] = useState<TariffComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadRecommendation();
    }
  }, [profile, currentAnnualCost]);

  const loadRecommendation = () => {
    if (!profile) return;

    try {
      // Estimate usage
      const homeType = profile.homeType && ['flat', 'terraced', 'detached', 'semi'].includes(profile.homeType) 
        ? (profile.homeType as 'flat' | 'terraced' | 'detached' | 'semi') 
        : 'semi';
      const usage = estimateAnnualUsage(
        currentAnnualCost / 365,
        homeType,
        profile.occupants || 2
      );

      // Get top recommendation
      const recommendations = getRecommendedTariffs(
        currentAnnualCost,
        usage.electricityKwh,
        usage.gasKwh,
        true // Prefer green energy
      );

      if (recommendations.length > 0) {
        setTopRecommendation(recommendations[0]);
      }
    } catch (err) {
      console.error('Failed to load tariff recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <FeatureGate featureId="tariff_comparison" profile={profile} showUpgrade={false}>
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl shadow-md p-6 border-2 border-green-200 dark:border-green-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💷</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Better Tariff Available
            </h3>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Premium
          </span>
        </div>

        {topRecommendation ? (
          <>
            {/* Savings Display */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                You could save up to
              </p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                £{topRecommendation.estimatedSavings.toFixed(0)}/year
              </p>
            </div>

            {/* Tariff Details */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Recommended Tariff
              </p>
              <p className="font-bold text-gray-900 dark:text-white">
                {topRecommendation.recommendedTariff.supplier}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {topRecommendation.recommendedTariff.tariffName}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                {topRecommendation.recommendedTariff.greenEnergy && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    🌱 Green
                  </span>
                )}
                <div className="flex items-center text-sm">
                  <span className="text-yellow-400 mr-1">⭐</span>
                  <span className="font-semibold">{topRecommendation.recommendedTariff.rating}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link href="/tariffs">
              <Button variant="primary" size="lg" className="w-full">
                Compare All Tariffs →
              </Button>
            </Link>

            {/* Update Info */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              Updated weekly • Based on your usage
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No better tariffs found at the moment
            </p>
            <Link href="/tariffs">
              <Button variant="secondary">
                View All Tariffs
              </Button>
            </Link>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
