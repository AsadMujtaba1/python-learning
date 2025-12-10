'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      {/* Hero Section with Gradient */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
            About Cost Saver
          </h1>
          <p className="text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            We help everyday people save money on their bills – simply and effortlessly.
          </p>
        </div>
      </section>

      <main className="flex-1 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">

          {/* Mission Section */}
          <section id="mission" className="mb-16 scroll-mt-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🎯</span>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Our Mission
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Household bills are confusing and expensive. From energy to broadband, insurance to subscriptions - 
                most people overpay without even knowing it. We believe everyone deserves to understand their bills 
                and save money, without needing to be an expert.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                <span className="font-semibold text-gray-900 dark:text-white">We started with energy bills</span> because they're the most complex and expensive. 
                But our vision is bigger: Cost Saver will become your personal money-saving assistant for <span className="font-semibold text-blue-600">ALL</span> your household costs.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Our Roadmap</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">✅ Currently Available:</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Energy bill analysis & comparison</li>
                      <li>• Solar panel ROI calculator</li>
                      <li>• Heat pump suitability checker</li>
                      <li>• Smart product recommendations</li>
                      <li>• Bill upload with OCR extraction</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">🔜 Coming Soon:</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Broadband comparison & switching</li>
                      <li>• Home & car insurance renewals</li>
                      <li>• Subscription audit & cancellation</li>
                      <li>• Shopping deal alerts</li>
                      <li>• Council tax band checker</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                How Cost Saver Works
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Three simple steps to start saving money
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Step 1 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📝</span>
                </div>
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Tell Us About Your Home
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Share basic details like your postcode, home size, and energy provider. 
                  Takes less than 2 minutes.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  2. We Analyze Your Costs
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Our system calculates your daily energy spending, compares it to similar homes, 
                  and identifies savings opportunities.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  3. Start Saving
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Get personalized tips to reduce costs, compare better deals, and track your 
                  savings over time.
                </p>
              </div>

            </div>
          </section>

          {/* Why Trust Us Section */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-10 shadow-lg border border-blue-100 dark:border-blue-800">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Why Trust Cost Saver?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Built with your security and savings in mind</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🔒</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Your Data is Safe
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      We use bank-level encryption and never sell your information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Always Free
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      No hidden fees, no credit card required, no catch. Free forever.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🇬🇧</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      UK-Based
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Built for UK homes with accurate pricing and local support.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📈</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Proven Results
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Users save an average of £300/year on energy costs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Coming Soon Section */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                More Ways to Save
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Exciting features launching soon</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <span>📡</span>
                  <span>Broadband comparison</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <span>🏠</span>
                  <span>Home insurance switching</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <span>✈️</span>
                  <span>Flight & hotel deals</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <span>🛒</span>
                  <span>Grocery price comparison</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <span>📺</span>
                  <span>Subscription management</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <span>⛽</span>
                  <span>Petrol price alerts</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Start Saving?
              </h2>
              <p className="text-blue-100 mb-6">
                Join thousands of people already saving money with Cost Saver.
              </p>
              <Link
                href="/sign-up"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Get Started Free →
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
