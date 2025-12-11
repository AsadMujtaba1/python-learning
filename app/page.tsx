'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import WelcomeTour from '@/components/WelcomeTour';
import CompactBlogPreview from '@/components/CompactBlogPreview';
import CompactNewsFeed from '@/components/CompactNewsFeed';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <WelcomeTour tourType="homepage" />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-24 pb-32 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-8" id="hero-section">
            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Smarter Insights for Every Household Bill
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
                Understand your usage, spot waste, and discover when switching really makes sense. Start with energy today – broadband, insurance and flights are coming next.
              </p>
            </div>
            {/* Bullets */}
            <ul className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto text-left space-y-2 mt-6 mb-6 list-disc list-inside">
              <li>See if you’re overpaying compared to similar UK homes</li>
              <li>Get plain-English tips tailored to your home and local weather</li>
              <li>Only switch when it genuinely saves you money</li>
            </ul>
            {/* CTA Button */}
            <div className="pt-4" id="start-button">
              <button 
                onClick={() => router.push('/onboarding-conversational')}
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-blue-700 bg-white rounded-full hover:bg-blue-50 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                Start with Energy Insights
                <svg 
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <p className="text-sm text-blue-100 mt-4">
                No account needed for your first insight • 100% free to use
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-4" id="start-button">
              <button 
                onClick={() => router.push('/onboarding-conversational')}
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-blue-700 bg-white rounded-full hover:bg-blue-50 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                Start Saving Now
                <svg 
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <p className="text-sm text-blue-100 mt-4">
                Join <span className="font-bold text-yellow-300">1,000+</span> users saving money every month 💰
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 px-4" id="tools-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tools
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Access calculators and savings tools for your household bills.
            </p>
          </div>
          <div className="flex justify-center">
            <a href="/tools" className="inline-block px-8 py-4 rounded-xl bg-blue-700 text-white text-lg font-bold shadow hover:bg-blue-800 transition">
              Go to Tools
            </a>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16 bg-white dark:bg-gray-800 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              More ways to save money across all your household bills
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg opacity-60 cursor-not-allowed">
              <div className="absolute top-4 right-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-3xl mb-4">📡</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Broadband Savings</h3>
              <p className="text-gray-600 dark:text-gray-400">Compare broadband deals from UK providers and switch to faster, cheaper internet.</p>
            </div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg opacity-60 cursor-not-allowed">
              <div className="absolute top-4 right-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center text-3xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Insurance Optimisation</h3>
              <p className="text-gray-600 dark:text-gray-400">Find better rates on home, car, and life insurance with our smart comparison tools.</p>
            </div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg opacity-60 cursor-not-allowed">
              <div className="absolute top-4 right-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center text-3xl mb-4">✈️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Flight Price Tracker</h3>
              <p className="text-gray-600 dark:text-gray-400">Track flight prices and get alerts when your favorite routes drop in price.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Tell us about your home</h3>
              <p className="text-gray-600 dark:text-gray-400">Share quick details like postcode, home type, heating.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">We analyse your energy pattern</h3>
              <p className="text-gray-600 dark:text-gray-400">We compare your usage to similar UK homes and local weather + price data.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Get clear actions to save</h3>
              <p className="text-gray-600 dark:text-gray-400">Practical tips + when switching truly saves money.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Cost Saver? */}
      <section className="py-16 bg-white dark:bg-gray-800 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Cost Saver?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">📈</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Data-Driven Insights</h3>
                <p className="text-gray-600 dark:text-gray-400">We combine your home details with trusted UK pricing data to give realistic, personalised savings estimates.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">🔄</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Automatic Monitoring</h3>
                <p className="text-gray-600 dark:text-gray-400">We watch the market and notify you when better options appear.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">🧠</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Smart Forecasts, Not Guesswork</h3>
                <p className="text-gray-600 dark:text-gray-400">We factor in seasonality/weather so you aren’t surprised by bill changes.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">🚀</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">One place for all your bills (soon)</h3>
                <p className="text-gray-600 dark:text-gray-400">Start with energy; broadband, insurance, travel coming soon.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <div className="flex items-center justify-center gap-1 text-yellow-400 text-2xl mb-2">
              ★★★★★
            </div>
            <p className="text-gray-600 dark:text-gray-400">Rated 4.9/5 from 1,000+ reviews</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-yellow-400 mb-3">★★★★★</div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                "Finally understand my energy bills! Saved £40 in the first month."
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">— Sarah M.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-yellow-400 mb-3">★★★★★</div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                "So easy to use! The tips are simple and actually work."
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">— James P.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-yellow-400 mb-3">★★★★★</div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                "Wish I found this sooner. Saved over £300 this year!"
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">— Emma L.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid - Blog & News */}
      <section className="py-16 bg-white dark:bg-gray-800 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Blog Preview - 2 columns */}
            <div className="lg:col-span-2">
              <CompactBlogPreview />
            </div>
            
            {/* News Feed - 1 column */}
            <div>
              <CompactNewsFeed />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start Saving Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Begin with Energy Insights — More Categories Coming Soon.
          </p>
          <button 
            onClick={() => router.push('/onboarding-conversational')}
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-blue-700 bg-white rounded-full hover:bg-blue-50 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            Get Started Free
            <svg 
              className="ml-2 w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-sm text-blue-100 mt-4">
            No credit card required • Takes 2 minutes • 100% free forever
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
