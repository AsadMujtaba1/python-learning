/**
 * TARIFF COMPARISON PAGE
 * 
 * Compare energy tariffs and find best deals
 * Premium feature with detailed recommendations
 * 
 * @page /tariffs
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile, UserProfile, isPremiumActive } from '@/lib/userProfile';
import { 
  getRecommendedTariffs, 
  estimateAnnualUsage, 
  getAllTariffs, 
  EnergyTariff,
  TariffComparison 
} from '@/lib/tariffEngine';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';
import FeatureGate from '@/components/FeatureGate';
import { TariffAffiliateDisclosure } from '@/components/AffiliateDisclosure';
import FeedbackButton from '@/components/UserFeedback';

export default function TariffsPage() {
  return (
    <ProtectedRoute>
      <TariffsContent />
    </ProtectedRoute>
  );
}

function TariffsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [recommendations, setRecommendations] = useState<TariffComparison[]>([]);
  const [allTariffs, setAllTariffs] = useState<EnergyTariff[]>([]);
  const [currentCost, setCurrentCost] = useState(1400);
  const [preferGreen, setPreferGreen] = useState(true);

  // Load tariffs immediately (now async for real data)
  useEffect(() => {
    const loadTariffs = async () => {
      const tariffs = await getAllTariffs();
      setAllTariffs(tariffs);
      
      // Generate initial recommendations with default values
      const defaultUsage = estimateAnnualUsage(
        currentCost / 365,
        'semi',
        2
      );
      
      const initialRecs = getRecommendedTariffs(
        currentCost,
        defaultUsage.electricityKwh,
        defaultUsage.gasKwh,
        preferGreen
      );
      setRecommendations(initialRecs);
    };
    
    loadTariffs();
  }, []);

  // Load profile in background (slow, network call)
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);

      if (userProfile) {
        // Update recommendations with actual profile data
        const homeType = userProfile.homeType && ['flat', 'terraced', 'detached', 'semi'].includes(userProfile.homeType) 
          ? (userProfile.homeType as 'flat' | 'terraced' | 'detached' | 'semi') 
          : 'semi';
        const usage = estimateAnnualUsage(
          currentCost / 365,
          homeType,
          userProfile.occupants || 2
        );

        const recs = getRecommendedTariffs(
          currentCost,
          usage.electricityKwh,
          usage.gasKwh,
          preferGreen
        );
        setRecommendations(recs);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <FeatureGate featureId="tariff_comparison" profile={profile}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Header with Gradient */}
        <header className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-900 dark:via-blue-900 dark:to-purple-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/dashboard-new" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white mb-3">
              💷 Compare Energy Tariffs
            </h1>
            <p className="text-white/90 text-lg max-w-2xl">
              Compare hundreds of tariffs from UK suppliers and save up to £300/year on your energy bills
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Filters - Improved */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span>⚙️</span> Your Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Current Annual Cost
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">£</span>
                  <input
                    type="number"
                    value={currentCost}
                    onChange={(e) => setCurrentCost(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-3 w-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferGreen}
                    onChange={(e) => setPreferGreen(e.target.checked)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-900 dark:text-white font-semibold">
                    🌱 Prefer Green Energy
                  </span>
                </label>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={loadProfile}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  🔄 Update Results
                </Button>
              </div>
            </div>
          </div>

          {/* Top 3 Recommendations */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🏆</span>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Top Recommended Tariffs
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Based on your usage and preferences</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <TariffCard
                  key={rec.recommendedTariff.id}
                  tariff={rec.recommendedTariff}
                  comparison={rec}
                  rank={index + 1}
                  featured={index === 0}
                />
              ))}
            </div>
          </div>

          {/* All Tariffs */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📊</span>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  All Available Tariffs
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Browse all options from UK suppliers</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Supplier & Tariff
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Electricity Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Gas Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {allTariffs.map((tariff) => (
                      <tr key={tariff.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {tariff.supplier}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {tariff.tariffName}
                            </p>
                            {tariff.greenEnergy && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mt-1">
                                🌱 Green
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white capitalize">
                          {tariff.tariffType}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {tariff.electricityRate}p/kWh
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {tariff.gasRate}p/kWh
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">⭐</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {tariff.rating}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => window.open(tariff.affiliateLink, '_blank')}
                          >
                            View Deal
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Data Update Info */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Tariff data last updated: December 1, 2024</p>
            <p className="mt-1">Prices are updated weekly. Actual costs may vary based on your usage.</p>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}

/**
 * Tariff Card Component
 */
interface TariffCardProps {
  tariff: EnergyTariff;
  comparison: TariffComparison;
  rank: number;
  featured?: boolean;
}

function TariffCard({ tariff, comparison, rank, featured = false }: TariffCardProps) {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${
      featured 
        ? 'border-yellow-400 ring-4 ring-yellow-100 dark:ring-yellow-900/30' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Rank Badge */}
      <div className="absolute top-4 right-4 text-4xl">
        {medals[rank - 1]}
      </div>

      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold">
          BEST DEAL
        </div>
      )}

      {/* Supplier & Tariff */}
      <div className="mb-4 pr-12">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
          {tariff.supplier}
        </h4>
        <p className="text-gray-600 dark:text-gray-400">
          {tariff.tariffName}
        </p>
      </div>

      {/* Savings */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Estimated Annual Savings
        </p>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
          £{comparison.estimatedSavings.toFixed(0)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {comparison.savingsPercentage.toFixed(1)}% cheaper than current
        </p>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Electricity</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {tariff.electricityRate}p/kWh
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Gas</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {tariff.gasRate}p/kWh
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Contract</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {tariff.contractLength === 0 ? 'Variable' : `${tariff.contractLength} months`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Exit Fee</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {tariff.exitFee === 0 ? 'None' : `£${tariff.exitFee}`}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="flex items-center gap-2 mb-4">
        {tariff.greenEnergy && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            🌱 Green
          </span>
        )}
        <div className="flex items-center">
          <span className="text-yellow-400 mr-1">⭐</span>
          <span className="text-sm font-semibold">{tariff.rating}</span>
        </div>
      </div>

      {/* CTA */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => window.open(tariff.affiliateLink, '_blank')}
      >
        Switch & Save →
      </Button>
      
      {/* Affiliate Disclosure */}
      <TariffAffiliateDisclosure />
      
      {/* Feedback Button */}
      <FeedbackButton page="tariffs" section="comparison" />
    </div>
  );
}
