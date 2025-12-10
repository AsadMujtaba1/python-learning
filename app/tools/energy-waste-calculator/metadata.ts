/**
 * SEO METADATA - ENERGY WASTE CALCULATOR
 * 
 * SEO Team Implementation
 * Optimized for search engines and social media
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energy Waste Calculator – How Much Are You Overpaying? | Free UK Tool',
  description: 'Quick UK energy waste checker. Enter your bill or upload a photo to find out how much money you\'re wasting each month. Free, instant, and private. No sign up required.',
  
  keywords: [
    'energy waste calculator',
    'UK energy calculator',
    'energy bill checker',
    'energy savings calculator',
    'how much am I overpaying energy',
    'energy bill waste',
    'compare energy prices UK',
    'energy cost calculator',
    'standing charge calculator',
    'unit rate checker',
  ],
  
  authors: [{ name: 'Cost Saver' }],
  creator: 'Cost Saver',
  publisher: 'Cost Saver',
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://cost-saver-app.vercel.app/tools/energy-waste-calculator',
    title: 'Energy Waste Calculator – How Much Are You Overpaying?',
    description: 'Find out how much money you\'re wasting on your energy bill. Quick UK calculator with instant results. Upload a bill or enter details manually.',
    siteName: 'Cost Saver',
    images: [
      {
        url: '/og-energy-calculator.png', // Would need to be created
        width: 1200,
        height: 630,
        alt: 'Energy Waste Calculator - Cost Saver',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Energy Waste Calculator – How Much Are You Overpaying?',
    description: 'Quick UK energy waste checker. Find out how much you\'re wasting in 30 seconds.',
    images: ['/og-energy-calculator.png'],
    creator: '@CostSaverUK',
  },
  
  alternates: {
    canonical: 'https://cost-saver-app.vercel.app/tools/energy-waste-calculator',
  },
  
  category: 'Finance',
};
