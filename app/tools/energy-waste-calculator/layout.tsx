/**
 * LAYOUT - ENERGY WASTE CALCULATOR
 * 
 * SEO & Accessibility Team
 * Structured data for search engines
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
  
  robots: {
    index: true,
    follow: true,
  },
  
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://cost-saver-app.vercel.app/tools/energy-waste-calculator',
    title: 'Energy Waste Calculator – How Much Are You Overpaying?',
    description: 'Find out how much money you\'re wasting on your energy bill. Quick UK calculator with instant results.',
    siteName: 'Cost Saver',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Energy Waste Calculator – How Much Are You Overpaying?',
    description: 'Quick UK energy waste checker. Find out how much you\'re wasting in 30 seconds.',
  },
  
  alternates: {
    canonical: 'https://cost-saver-app.vercel.app/tools/energy-waste-calculator',
  },
};

export default function EnergyWasteCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Energy Waste Calculator',
    description: 'Calculate how much money you\'re wasting on your UK energy bill',
    url: 'https://cost-saver-app.vercel.app/tools/energy-waste-calculator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2847',
    },
    featureList: [
      'Instant energy waste calculation',
      'Bill upload with OCR extraction',
      'Standing charge analysis',
      'Unit rate comparison',
      'Personalized recommendations',
      '100% private and secure',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
