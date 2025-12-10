/**
 * ENERGY WASTE CALCULATOR - MAIN PAGE
 * 
 * Cross-Functional Team Product
 * Engineering, UX, Design, Marketing, Legal, SEO
 * 
 * Public tool, no login required
 * Client-side processing for privacy
 * Mobile-first, accessible, high-conversion
 * 
 * @route /tools/energy-waste-calculator
 */

'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import InputSection from '@/components/energy-waste-calculator/InputSection';
import UploadSection from '@/components/energy-waste-calculator/UploadSection';
import ResultCard from '@/components/energy-waste-calculator/ResultCard';
import RecommendationSection from '@/components/energy-waste-calculator/RecommendationSection';
import CTASection from '@/components/energy-waste-calculator/CTASection';
import SharingSection from '@/components/energy-waste-calculator/SharingSection';
import {
  calculateEnergyWaste,
  validateInput,
  WasteCalculatorInput,
  WasteCalculatorResult,
} from '@/lib/energyWasteCalculator';

export default function EnergyWasteCalculatorPage() {
  const [input, setInput] = useState<Partial<WasteCalculatorInput>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<WasteCalculatorResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleInputChange = (newInput: Partial<WasteCalculatorInput>) => {
    setInput(newInput);
    setErrors([]);
    setUploadError(null);
  };

  const handleUploadExtract = (extractedInput: Partial<WasteCalculatorInput>) => {
    setInput({ ...input, ...extractedInput });
    setErrors([]);
    setUploadError(null);
    
    // Auto-scroll to input section
    document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCalculate = () => {
    // Validate inputs
    const validation = validateInput(input);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Calculate
    setCalculating(true);
    setTimeout(() => {
      const calculationResult = calculateEnergyWaste(input as WasteCalculatorInput);
      setResult(calculationResult);
      setCalculating(false);

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 500); // Small delay for UX
  };

  const handleReset = () => {
    setInput({});
    setResult(null);
    setErrors([]);
    setUploadError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-green-600 dark:text-green-400">
              💰 Cost Saver
            </a>
            <nav className="flex items-center space-x-4">
              <a
                href="/dashboard-new"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Dashboard
              </a>
              <a
                href="/tariffs"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Compare Tariffs
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              🇬🇧 Free UK Energy Tool • No Sign Up Required
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            How Much Money Are You <span className="text-red-600 dark:text-red-400">Wasting</span> on Energy?
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Quick UK energy waste checker. Enter your bill details or upload a photo to find out how much you're overpaying each month.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
              <span>Takes 30 seconds</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
              <span>100% Private</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
              <span>No email required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-12">
            {/* Input Methods */}
            {!result && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Choose Your Method
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload a bill for instant extraction, or enter details manually
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Upload Section */}
                  <UploadSection
                    onExtract={handleUploadExtract}
                    onError={setUploadError}
                  />

                  {/* Or Divider */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">OR</span>
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-300">{uploadError}</p>
                  </div>
                )}

                {/* Input Section */}
                <div id="input-section">
                  <InputSection
                    onInputChange={handleInputChange}
                    initialValues={input}
                    errors={errors}
                  />
                </div>

                {/* Calculate Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleCalculate}
                    disabled={calculating || !input.monthlyBill}
                    className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all shadow-xl"
                    aria-label="Calculate energy waste"
                  >
                    {calculating ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating...
                      </span>
                    ) : (
                      '🔍 Calculate My Waste'
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Results Section */}
            {result && (
              <div id="results-section" className="space-y-12 animate-fade-in">
                {/* Results */}
                <ResultCard result={result} />

                {/* Recommendations */}
                <RecommendationSection result={result} />

                {/* CTA */}
                <CTASection annualSavings={result.annualWaste} />

                {/* Sharing */}
                <SharingSection
                  monthlyWaste={result.monthlyWaste}
                  annualWaste={result.annualWaste}
                />

                {/* Reset Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors"
                  >
                    ← Calculate Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Disclaimer Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Disclaimer:</strong> This is an estimated calculation based on publicly available UK energy market averages
              from Ofgem price cap data (Q4 2024). Actual savings may vary based on your specific circumstances, location, and
              available tariffs. This tool does not constitute financial advice.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Privacy:</strong> All bill processing happens in your browser. No personal data or bill information is
              uploaded to our servers or stored. We are GDPR compliant and take your privacy seriously.
            </p>
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-600 dark:text-gray-400">
              <a href="/privacy" className="hover:text-gray-900 dark:hover:text-white">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-gray-900 dark:hover:text-white">Terms of Service</a>
              <span>•</span>
              <a href="/contact" className="hover:text-gray-900 dark:hover:text-white">Contact Us</a>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © 2025 Cost Saver. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
