import type { Meta, StoryObj } from '@storybook/react';
import FeatureGate from './FeatureGate';

const meta = {
  title: 'Components/Feature Gate',
  component: FeatureGate,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FeatureGate>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock user profiles
const freeUserProfile = {
  id: 'user-1',
  email: 'free.user@example.com',
  name: 'Free User',
  tier: 'free' as const,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripePriceId: null,
  stripeCurrentPeriodEnd: null,
};

const premiumUserProfile = {
  id: 'user-2',
  email: 'premium.user@example.com',
  name: 'Premium User',
  tier: 'premium' as const,
  stripeCustomerId: 'cus_premium123',
  stripeSubscriptionId: 'sub_premium456',
  stripePriceId: 'price_premium789',
  stripeCurrentPeriodEnd: new Date('2025-12-31'),
};

const proUserProfile = {
  id: 'user-3',
  email: 'pro.user@example.com',
  name: 'Pro User',
  tier: 'pro' as const,
  stripeCustomerId: 'cus_pro123',
  stripeSubscriptionId: 'sub_pro456',
  stripePriceId: 'price_pro789',
  stripeCurrentPeriodEnd: new Date('2025-12-31'),
};

export const UnlockedFeaturePremiumUser: Story = {
  args: {
    featureId: 'bill-ocr',
    profile: premiumUserProfile,
    children: (
      <div className="p-6 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-900/20">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          📄 Bill OCR Scanner
        </h3>
        <p className="text-green-800 dark:text-green-200">
          Upload your energy bills and we'll automatically extract all the important data!
        </p>
        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Upload Bill
        </button>
      </div>
    ),
  },
};

export const LockedFeatureFreeUser: Story = {
  args: {
    featureId: 'bill-ocr',
    profile: freeUserProfile,
    showUpgrade: true,
    children: (
      <div className="p-6 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-900/20">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          📄 Bill OCR Scanner
        </h3>
        <p className="text-green-800 dark:text-green-200">
          Upload your energy bills and we'll automatically extract all the important data!
        </p>
        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Upload Bill
        </button>
      </div>
    ),
  },
};

export const LockedWithCustomFallback: Story = {
  args: {
    featureId: 'advanced-analytics',
    profile: freeUserProfile,
    fallback: (
      <div className="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          📊 Advanced Analytics
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This premium feature is locked. Upgrade to access detailed energy analytics and insights.
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            See Plans
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    ),
    children: (
      <div className="p-6 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📊 Advanced Analytics Dashboard
        </h3>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Peak Usage</p>
            <p className="text-xl font-bold">2.5 kWh</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Cost/Day</p>
            <p className="text-xl font-bold">£8.45</p>
          </div>
        </div>
      </div>
    ),
  },
};

export const SmartMeterFeatureLocked: Story = {
  args: {
    featureId: 'smart-meter',
    profile: freeUserProfile,
    showUpgrade: true,
    children: (
      <div className="p-6 border-2 border-purple-500 rounded-lg bg-purple-50 dark:bg-purple-900/20">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          ⚡ Smart Meter Integration
        </h3>
        <p className="text-purple-800 dark:text-purple-200 mb-4">
          Connect your smart meter for real-time energy tracking and personalized insights.
        </p>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Connect Now
        </button>
      </div>
    ),
  },
};

export const ProFeatureForPremiumUser: Story = {
  args: {
    featureId: 'ai-recommendations',
    profile: premiumUserProfile,
    showUpgrade: true,
    children: (
      <div className="p-6 border-2 border-indigo-500 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
          🤖 AI-Powered Recommendations
        </h3>
        <p className="text-indigo-800 dark:text-indigo-200 mb-4">
          Get personalized energy-saving recommendations powered by AI analysis.
        </p>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          View Recommendations
        </button>
      </div>
    ),
  },
};

export const ProFeatureUnlockedForProUser: Story = {
  args: {
    featureId: 'ai-recommendations',
    profile: proUserProfile,
    children: (
      <div className="p-6 border-2 border-indigo-500 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
          🤖 AI-Powered Recommendations
        </h3>
        <p className="text-indigo-800 dark:text-indigo-200 mb-4">
          Get personalized energy-saving recommendations powered by AI analysis.
        </p>
        <div className="space-y-2 mt-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded border-l-4 border-indigo-500">
            <p className="font-semibold">💡 Reduce peak usage by 15%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Shift high-energy tasks to off-peak hours</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded border-l-4 border-indigo-500">
            <p className="font-semibold">🌡️ Optimize heating schedule</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Save £25/month with smart temperature control</p>
          </div>
        </div>
      </div>
    ),
  },
};

export const NoUpgradePrompt: Story = {
  args: {
    featureId: 'export-data',
    profile: freeUserProfile,
    showUpgrade: false,
    fallback: (
      <div className="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800">
        <p className="text-center text-gray-600 dark:text-gray-400">
          This feature is not available on your current plan.
        </p>
      </div>
    ),
    children: (
      <div className="p-6 border-2 border-teal-500 rounded-lg bg-teal-50 dark:bg-teal-900/20">
        <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100 mb-2">
          💾 Export Data
        </h3>
        <p className="text-teal-800 dark:text-teal-200 mb-4">
          Download your energy data in CSV or JSON format.
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            Export as CSV
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            Export as JSON
          </button>
        </div>
      </div>
    ),
  },
};

export const FreeUserViewingPremiumContent: Story = {
  args: {
    featureId: 'tariff-comparison',
    profile: freeUserProfile,
    showUpgrade: true,
    children: (
      <div className="p-6 border-2 border-orange-500 rounded-lg bg-orange-50 dark:bg-orange-900/20">
        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
          🔄 Tariff Comparison Tool
        </h3>
        <p className="text-orange-800 dark:text-orange-200 mb-4">
          Compare your current tariff with 50+ energy providers to find the best deal.
        </p>
        <div className="space-y-2">
          <div className="p-3 bg-white dark:bg-gray-800 rounded flex justify-between items-center">
            <span className="font-semibold">British Gas</span>
            <span className="text-green-600 font-bold">Save £120/year</span>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded flex justify-between items-center">
            <span className="font-semibold">EDF Energy</span>
            <span className="text-green-600 font-bold">Save £95/year</span>
          </div>
        </div>
        <button className="mt-4 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          Compare All Tariffs
        </button>
      </div>
    ),
  },
};
