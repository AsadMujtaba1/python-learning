'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserHomeData, EnergyCostData, ForecastData, SavingTip } from '@/types';
import { calculateEnergyCost, generateForecast, calculateWeatherImpact } from '@/utils/energyCalculations';
import { generateSavingTips, getCurrentWeather } from '@/utils/savingTips';
import OnboardingGate from '@/components/OnboardingGate';
import OnboardingChatPopup from '@/components/OnboardingChatPopup';

function DashboardPageContent() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserHomeData | null>(null);
  const [costData, setCostData] = useState<EnergyCostData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [tips, setTips] = useState<SavingTip[]>([]);
  const [weather, setWeather] = useState({ temperature: 12, condition: 'Cloudy' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    const storedData = localStorage.getItem('userHomeData');
    if (!storedData) {
      router.push('/onboarding-conversational');
      return;
    }

    const parsedData: UserHomeData = JSON.parse(storedData);
    setUserData(parsedData);

    // Calculate costs
    const costs = calculateEnergyCost(parsedData);
    setCostData(costs);

    // Generate forecast
    const forecastData = generateForecast(parsedData, weather.temperature);
    setForecast(forecastData);

    // Get saving tips
    const savingTips = generateSavingTips(parsedData.heatingType, parsedData.homeType);
    setTips(savingTips);

    setLoading(false);
  }, [router, weather.temperature]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const weatherImpact = calculateWeatherImpact(weather.temperature);

  // Check if onboarding is incomplete (profile completeness < 100 or missing userData)
  const needsOnboarding = !userData || (userData.profileCompleteness !== undefined && userData.profileCompleteness < 100);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Onboarding Link Banner */}
      {needsOnboarding && (
        <div className="bg-blue-100 border border-blue-300 text-blue-900 px-4 py-3 flex items-center justify-between">
          <div>
            <span className="font-semibold">Haven't completed onboarding?</span>
            <span className="ml-2">Finish onboarding to unlock all features and get personalized savings.</span>
          </div>
          <button
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors"
            onClick={() => setOnboardingOpen(true)}
          >
            Complete Onboarding
          </button>
        </div>
      )}
      <OnboardingChatPopup open={onboardingOpen} setOpen={setOnboardingOpen} />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cost Saver Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {userData?.postcode} • {userData?.homeType}
              </p>
            </div>
            <button
              onClick={() => setOnboardingOpen(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Update Details
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cost Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Cost</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              £{costData?.dailyCost.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Per day average
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Cost</h3>
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              £{costData?.monthlyCost.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Estimated monthly
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Yearly Estimate</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              £{costData?.yearlyEstimate.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Annual projection
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Cost Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cost Breakdown</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Heating</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    £{costData?.breakdown.heating.toFixed(2)}/day
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${((costData?.breakdown.heating || 0) / (costData?.dailyCost || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Electricity</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    £{costData?.breakdown.electricity.toFixed(2)}/day
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${((costData?.breakdown.electricity || 0) / (costData?.dailyCost || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Other</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    £{costData?.breakdown.other.toFixed(2)}/day
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${((costData?.breakdown.other || 0) / (costData?.dailyCost || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Weather Impact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Weather Impact</h2>
            <div className="text-center py-4">
              <div className="text-5xl mb-3">🌤️</div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {weather.temperature}°C
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{weather.condition}</p>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                weatherImpact.impact === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                weatherImpact.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {weatherImpact.impact.toUpperCase()} IMPACT
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                {weatherImpact.description}
              </p>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">7-Day Cost Forecast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {forecast.map((day, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"
              >
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  £{day.estimatedCost.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {day.temperature}°C
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Big Savings Opportunities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">💡 Big Savings Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Solar Panels */}
            <div
              onClick={() => router.push('/solar')}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border-2 border-yellow-300 dark:border-yellow-700 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">☀️ Solar Panels</h3>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 rounded font-medium">
                  Save £400-800/year
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate your own electricity and reduce bills by up to 70%. Get personalized recommendations based on your location and roof type.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mr-2">✓</span>
                  Payback in 8-12 years
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mr-2">✓</span>
                  25-year warranty
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mr-2">✓</span>
                  Reduce CO2 by 1-2 tonnes/year
                </div>
              </div>
              <button className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Get Solar Quote →
              </button>
            </div>

            {/* Heat Pump */}
            <div
              onClick={() => router.push('/heat-pump')}
              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border-2 border-blue-300 dark:border-blue-700 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">🔥 Heat Pump</h3>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 rounded font-medium">
                  £7,500 Grant
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Replace your gas boiler with an ultra-efficient heat pump. Get £7,500 government grant + lower running costs.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mr-2">✓</span>
                  3x more efficient than boilers
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mr-2">✓</span>
                  70-80% lower emissions
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mr-2">✓</span>
                  20-25 year lifespan
                </div>
              </div>
              <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Check Suitability →
              </button>
            </div>
          </div>
        </div>

        {/* Saving Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Personalized Saving Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{tip.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    tip.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                    tip.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' :
                    'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400'
                  }`}>
                    {tip.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {tip.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Potential saving:
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    £{tip.potentialSaving}/year
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <OnboardingGate minCompleteness={30}>
      <DashboardPageContent />
    </OnboardingGate>
  );
}
