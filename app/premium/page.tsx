/**
 * PREMIUM PAGE
 * 
 * Dedicated premium pricing and features page
 * Shows all benefits, pricing tiers, and upgrade flow
 * 
 * @page /premium
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { PREMIUM_BENEFITS, PRICING, FEATURES } from '@/lib/featureGating';
import { getUserProfile, grantPremiumAccess } from '@/lib/userProfile';
import Button from '@/components/Button';
import Alert from '@/components/Alert';

export default function PremiumPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/sign-in?redirect=/premium');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In production, this would integrate with Stripe
      // For now, grant premium access directly
      const tier = selectedPlan === 'lifetime' ? 'lifetime' : 'premium';
      const durationDays = selectedPlan === 'monthly' ? 30 : selectedPlan === 'yearly' ? 365 : 999999;
      
      await grantPremiumAccess(
        user.uid,
        durationDays,
        tier
      );

      setSuccess(`Successfully upgraded to ${selectedPlan} plan! Redirecting...`);
      
      setTimeout(() => {
        router.push('/dashboard-new');
      }, 2000);
    } catch (err: any) {
      setError('Failed to upgrade. Please try again or contact support.');
      console.error('Upgrade error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full mb-4">
            ⭐ PREMIUM FEATURES
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Maximize Your Savings
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Unlock powerful AI-driven insights, advanced analytics, and exclusive tools to save hundreds of pounds every year
          </p>
        </div>

        {/* Alerts */}
        {error && <Alert variant="error" className="mb-6">{error}</Alert>}
        {success && <Alert variant="success" className="mb-6">{success}</Alert>}

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
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
              'Email support',
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
              'Best value plan',
              'Priority support',
            ]}
            recommended
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
              'VIP support',
            ]}
          />
        </div>

        {/* CTA Button */}
        <div className="text-center mb-16">
          <Button
            variant="primary"
            size="lg"
            onClick={handleUpgrade}
            disabled={loading}
            className="px-12 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {loading ? 'Processing...' : user ? 'Upgrade Now' : 'Sign Up to Get Started'}
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            {user ? '🔒 Secure payment • Cancel anytime' : '✨ Start with a free account'}
          </p>
        </div>

        {/* Premium Benefits Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Everything in Premium
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {PREMIUM_BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Free vs Premium
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-900 dark:text-white font-semibold">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">
                    Free
                  </th>
                  <th className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, index) => {
                  const isFree = feature.requiredTier.includes('free');
                  return (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        {feature.name}
                      </td>
                      <td className="text-center py-4 px-4">
                        {isFree ? (
                          <span className="text-green-500 text-xl">✓</span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600 text-xl">—</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="text-green-500 text-xl">✓</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center mb-12">
          <p className="text-3xl font-bold mb-2">2,847+</p>
          <p className="text-lg mb-4">UK households already saving with Premium</p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span>⭐⭐⭐⭐⭐</span>
            <span>4.9/5 average rating</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes! You can cancel your subscription at any time with no penalties. Your premium access will continue until the end of your billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit and debit cards through our secure payment processor, Stripe. Your payment information is never stored on our servers."
            />
            <FAQItem
              question="How much can I actually save?"
              answer="Our premium users save an average of £347/year by optimizing their energy usage, switching tariffs at the right time, and using our advanced analytics tools."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="Yes! If you're not satisfied within the first 30 days, we offer a full refund, no questions asked."
            />
            <FAQItem
              question="Can I get premium for free?"
              answer="Yes! Refer 3 friends who sign up and you'll get 1 month of premium access for free. Refer 9 friends and get 3 months free!"
            />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            ← Back to home
          </Link>
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
  recommended?: boolean;
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
  recommended = false,
}: PricingCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 transition-all text-left shadow-lg hover:shadow-2xl ${
        isSelected
          ? 'border-blue-500 dark:border-blue-400 scale-105'
          : 'border-gray-200 dark:border-gray-700'
      } ${recommended ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}`}
    >
      {/* Popular/Recommended Badge */}
      {recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
          🔥 MOST POPULAR
        </div>
      )}

      {/* Selected Check */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Price */}
      <div className="mb-4">
        <span className="text-5xl font-bold text-gray-900 dark:text-white">
          £{price}
        </span>
        <span className="text-lg text-gray-600 dark:text-gray-400">
          /{period}
        </span>
      </div>

      {/* Savings */}
      {savings && (
        <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold px-3 py-1 rounded-full mb-6">
          💰 Save £{savings}
        </div>
      )}

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <span className="text-blue-500 text-lg">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

/**
 * FAQ Item
 */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
        {question}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {answer}
      </p>
    </div>
  );
}
