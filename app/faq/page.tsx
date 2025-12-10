'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'Is Cost Saver really free?',
      answer: 'Yes! Cost Saver is completely free to use forever. No credit card required, no hidden fees, no premium tiers. We make money through affiliate partnerships when you switch providers, but you\'re never obligated to switch.',
    },
    {
      question: 'How does Cost Saver calculate my energy costs?',
      answer: 'We use your home details (size, type, insulation, appliances) combined with your energy tariff rates and local weather data. Our calculations are based on industry-standard formulas and real usage patterns from similar homes.',
    },
    {
      question: 'Is my personal data safe?',
      answer: 'Absolutely. We use bank-level encryption (256-bit SSL) to protect your data. We never sell your information to third parties. All data is stored securely in GDPR-compliant databases. You can delete your account anytime.',
    },
    {
      question: 'How accurate are the savings estimates?',
      answer: 'Our estimates are based on your specific home details and current market rates. While individual results vary, most users find our predictions within 10-15% of their actual bills. The more information you provide, the more accurate we become.',
    },
    {
      question: 'Do I need to upload my bills?',
      answer: 'No, it\'s optional! You can get insights by just entering basic home details. However, uploading a bill lets us extract your exact tariff rates and usage patterns, making our recommendations much more accurate.',
    },
    {
      question: 'Can I compare different energy suppliers?',
      answer: 'Yes! Our comparison tool shows you potential savings from switching providers. We work with trusted comparison services to find you the best deals based on your actual usage.',
    },
    {
      question: 'How often should I check my dashboard?',
      answer: 'We recommend checking weekly to track your progress and see how weather or behavior changes affect costs. You\'ll also get personalized tips that update based on the season and your usage patterns.',
    },
    {
      question: 'What is the peer comparison feature?',
      answer: 'This shows how your costs compare to similar homes in your area (anonymously). It helps you see if you\'re overpaying and identifies specific areas where you can improve. All comparisons are private.',
    },
    {
      question: 'Can I use Cost Saver on my phone?',
      answer: 'Yes! Cost Saver works on any device – phone, tablet, or computer. The interface automatically adjusts to your screen size for the best experience.',
    },
    {
      question: 'What if my home has solar panels?',
      answer: 'Great! You can add solar panels in your profile settings. We\'ll factor in your generation and export rates to give you accurate net cost calculations and help maximize your savings.',
    },
    {
      question: 'How do I change my energy tariff information?',
      answer: 'Go to Settings > Energy Supply, then update your standing charge and unit rate. You can also re-upload a bill to automatically extract the latest rates from your provider.',
    },
    {
      question: 'What are "standing charges"?',
      answer: 'A standing charge is a daily fee you pay just for being connected to the energy network – even if you use zero energy that day. It covers infrastructure maintenance and is set by your supplier.',
    },
    {
      question: 'Can I track multiple properties?',
      answer: 'Currently, each account supports one property. If you need to track multiple homes, you can create separate accounts with different email addresses. Multi-property support is coming soon!',
    },
    {
      question: 'Do you support business or commercial properties?',
      answer: 'Right now, Cost Saver is designed for residential homes. Commercial properties have different tariff structures and usage patterns. Business support may be added in the future.',
    },
    {
      question: 'How do I delete my account?',
      answer: 'Go to Account Settings > Privacy & Data, then click "Delete Account". This will permanently remove all your data. You can also email us at support@costsaver.com for assistance.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Find answers to common questions about Cost Saver
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4 mb-12">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openIndex === index && (
                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Have Questions Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our friendly support team is here to help. We typically respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/sign-up"
                className="inline-block bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-lg font-semibold border border-blue-200 dark:border-gray-600 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
