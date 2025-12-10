/**
 * CTA SECTION COMPONENT
 * 
 * Marketing & Product Team Implementation
 * Convert calculator users to full dashboard users
 */

'use client';

import { useRouter } from 'next/navigation';

interface CTASectionProps {
  annualSavings: number;
}

export default function CTASection({ annualSavings }: CTASectionProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Main CTA Card */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-2xl">
        <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-4">
          <span className="text-sm font-semibold">✨ Ready to Save More?</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Get Your Full Savings Analysis
        </h2>

        <p className="text-lg mb-6 opacity-95 max-w-2xl mx-auto">
          This calculator shows you're wasting <strong>£{annualSavings.toFixed(0)}/year</strong>.
          Our full dashboard finds even more savings with tariff comparisons, appliance insights, and switching support.
        </p>

        <button
          onClick={() => router.push('/dashboard-new')}
          className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-bold text-lg rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg"
        >
          <span>Open Full Dashboard</span>
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <p className="text-sm mt-4 opacity-80">
          100% Free • No credit card required • Cancel anytime
        </p>
      </div>

      {/* Feature Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
          Calculator vs Full Dashboard
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calculator Features */}
          <div className="space-y-3">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="text-green-500 mr-2">✓</span>
              <span>Quick waste estimate</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="text-green-500 mr-2">✓</span>
              <span>Standing charge check</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="text-green-500 mr-2">✓</span>
              <span>Unit rate comparison</span>
            </div>
            <div className="pt-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                🎯 This Tool
              </span>
            </div>
          </div>

          {/* Full Dashboard Features */}
          <div className="space-y-3 md:border-l md:pl-6 border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-gray-900 dark:text-white font-medium">
              <span className="text-green-500 mr-2">✓</span>
              <span>All calculator features +</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="text-green-500 mr-2">✓</span>
              <span>Compare 100+ tariffs instantly</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="text-green-500 mr-2">✓</span>
              <span>Appliance-level insights</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="text-green-500 mr-2">✓</span>
              <span>Easy switching support</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="text-green-500 mr-2">✓</span>
              <span>Track savings over time</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="text-green-500 mr-2">✓</span>
              <span>Personalized tips & alerts</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Average user saves an additional £{Math.round(annualSavings * 1.4)}/year</strong> with the full dashboard
          </p>
        </div>
      </div>

      {/* Secondary CTA */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Not ready yet? Compare tariffs first:
        </p>
        <button
          onClick={() => router.push('/tariffs')}
          className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
        >
          View Tariff Comparison
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
