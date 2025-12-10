/**
 * PREMIUM UPGRADE MODAL
 * 
 * Modal for upgrading to premium with pricing tiers
 * Shows all benefits and handles upgrade flow
 * 
 * @module components/PremiumUpgradeModal
 */

'use client';

import { useState } from 'react';
import { PREMIUM_BENEFITS, PRICING } from '@/lib/featureGating';
import Button from './Button';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: 'monthly' | 'yearly' | 'lifetime') => void;
  currentTier?: 'free' | 'premium' | 'lifetime';
}

export default function PremiumUpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  currentTier = 'free',
}: PremiumUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onUpgrade(selectedPlan);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ×
          </button>

          {/* Header */}
          <div className="text-center pt-8 pb-6 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="text-5xl mb-3">⭐</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Upgrade to Premium
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Unlock powerful tools to maximize your household savings and take control of your costs
            </p>
          </div>

          {/* Pricing Plans */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {/* Monthly Plan */}
              <PricingCard
                title="Monthly"
                price={PRICING.monthly.price}
                period="month"
                savings={null}
                isPopular={false}
                isSelected={selectedPlan === 'monthly'}
                onSelect={() => setSelectedPlan('monthly')}
                features={[
                  'All premium features',
                  'Cancel anytime',
                  'Monthly billing',
                ]}
              />

              {/* Yearly Plan - POPULAR */}
              <PricingCard
                title="Yearly"
                price={PRICING.yearly.price}
                period="year"
                savings={PRICING.yearly.savings}
                isPopular={true}
                isSelected={selectedPlan === 'yearly'}
                onSelect={() => setSelectedPlan('yearly')}
                features={[
                  'All premium features',
                  'Save £19.89/year',
                  'Best value',
                ]}
              />

              {/* Lifetime Plan */}
              <PricingCard
                title="Lifetime"
                price={PRICING.lifetime.price}
                period="forever"
                savings={PRICING.lifetime.savings}
                isPopular={false}
                isSelected={selectedPlan === 'lifetime'}
                onSelect={() => setSelectedPlan('lifetime')}
                features={[
                  'All premium features',
                  'One-time payment',
                  'Lifetime access',
                ]}
              />
            </div>

            {/* Benefits List */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
                Everything in Premium
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {PREMIUM_BENEFITS.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="text-green-500 mt-0.5">✓</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {benefit.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {selectedPlan === 'monthly' && `Start Monthly Plan - £${PRICING.monthly.price}/mo`}
              {selectedPlan === 'yearly' && `Start Yearly Plan - £${PRICING.yearly.price}/yr`}
              {selectedPlan === 'lifetime' && `Get Lifetime Access - £${PRICING.lifetime.price}`}
            </Button>

            {/* Trust Indicators */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                🔒 Secure payment • 💳 Cancel anytime • 🇬🇧 UK-based support
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Join thousands of UK households saving money every month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pricing Card Component
 */
interface PricingCardProps {
  title: string;
  price: number;
  period: string;
  savings: number | null;
  isPopular: boolean;
  isSelected: boolean;
  onSelect: () => void;
  features: string[];
}

function PricingCard({
  title,
  price,
  period,
  savings,
  isPopular,
  isSelected,
  onSelect,
  features,
}: PricingCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative p-5 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? 'border-blue-500 dark:border-blue-400 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      } ${isPopular ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="text-white text-xs">✓</div>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>

      {/* Price */}
      <div className="mb-3">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          £{price}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          /{period}
        </span>
      </div>

      {/* Savings Badge */}
      {savings && (
        <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-1 rounded mb-3">
          Save £{savings}
        </div>
      )}

      {/* Features */}
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <span className="text-blue-500">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </button>
  );
}

/**
 * Inline Premium Upsell (for feature pages)
 */
interface InlinePremiumUpsellProps {
  featureName: string;
  featureIcon?: string;
  onUpgrade: () => void;
}

export function InlinePremiumUpsell({
  featureName,
  featureIcon = '⭐',
  onUpgrade,
}: InlinePremiumUpsellProps) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
      <div className="text-center max-w-md mx-auto">
        <div className="text-5xl mb-3">{featureIcon}</div>
        <h3 className="text-2xl font-bold mb-2">
          Unlock {featureName}
        </h3>
        <p className="text-blue-100 mb-4">
          Upgrade to Premium to access this powerful feature and start saving more money
        </p>
        <Button
          variant="secondary"
          size="lg"
          onClick={onUpgrade}
          className="bg-white text-blue-600 hover:bg-gray-100"
        >
          View Premium Plans →
        </Button>
        <p className="text-xs text-blue-200 mt-3">
          Starting at just £4.99/month • Cancel anytime
        </p>
      </div>
    </div>
  );
}

/**
 * Floating Premium Badge (for navigation/headers)
 */
export function FloatingPremiumBadge({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-semibold group"
    >
      <span className="text-xl">⭐</span>
      <span className="hidden sm:inline">Upgrade to Premium</span>
      <span className="sm:hidden">Premium</span>
      <span className="group-hover:translate-x-1 transition-transform">→</span>
    </button>
  );
}
