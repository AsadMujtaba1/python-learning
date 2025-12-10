/**
 * SEO & METADATA UTILITIES
 * 
 * Comprehensive SEO optimization:
 * - Dynamic metadata generation
 * - Open Graph tags
 * - Twitter Card tags
 * - Structured data (JSON-LD)
 * - Canonical URLs
 * - Sitemap generation
 * 
 * @module lib/seo
 */

import { Metadata } from 'next';

// ============================================================================
// TYPES
// ============================================================================

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const SITE_CONFIG = {
  name: 'Cost Saver App',
  description: 'Save money on energy, broadband, insurance and more with intelligent comparison and switching',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://costsaver.app',
  ogImage: '/og-image.png',
  twitterHandle: '@costsaverapp',
  locale: 'en_GB',
  type: 'website',
};

const DEFAULT_KEYWORDS = [
  'cost saving',
  'energy comparison',
  'broadband comparison',
  'insurance comparison',
  'money saving',
  'bill comparison',
  'switch energy',
  'switch broadband',
  'UK savings',
  'household bills',
];

// ============================================================================
// METADATA GENERATOR
// ============================================================================

/**
 * Generate Next.js metadata object
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    noindex = false,
    nofollow = false,
    ogImage = SITE_CONFIG.ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
  } = config;
  
  const fullTitle = title === SITE_CONFIG.name 
    ? title 
    : `${title} | ${SITE_CONFIG.name}`;
  
  const url = canonical || SITE_CONFIG.url;
  const imageUrl = ogImage.startsWith('http') 
    ? ogImage 
    : `${SITE_CONFIG.url}${ogImage}`;
  
  return {
    title: fullTitle,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords].join(', '),
    
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
      },
    },
    
    alternates: {
      canonical: url,
    },
    
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: SITE_CONFIG.locale,
      type: ogType as 'website' | 'article',
    },
    
    twitter: {
      card: twitterCard,
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: SITE_CONFIG.twitterHandle,
    },
    
    other: {
      'application-name': SITE_CONFIG.name,
    },
  };
}

// ============================================================================
// STRUCTURED DATA (JSON-LD)
// ============================================================================

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    sameAs: [
      // Add social media links here
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    ...(product.price && {
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'GBP',
      },
    }),
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      },
    }),
  };
}

// ============================================================================
// PAGE-SPECIFIC METADATA
// ============================================================================

export const PAGE_METADATA = {
  home: generateMetadata({
    title: 'Save Money on Energy, Broadband & More',
    description: 'Compare and switch energy, broadband, insurance and more. Save hundreds of pounds per year with intelligent recommendations.',
    keywords: ['compare energy', 'switch broadband', 'save money UK'],
  }),
  
  dashboard: generateMetadata({
    title: 'Your Savings Dashboard',
    description: 'Track your savings, compare bills, and discover new ways to save money on household costs.',
    noindex: true, // Private page
  }),
  
  about: generateMetadata({
    title: 'About Us',
    description: 'Learn how Cost Saver App helps UK households save money on energy, broadband, insurance and more.',
  }),
  
  faq: generateMetadata({
    title: 'Frequently Asked Questions',
    description: 'Get answers to common questions about saving money, switching providers, and using our comparison service.',
  }),
  
  contact: generateMetadata({
    title: 'Contact Us',
    description: 'Get in touch with our team for support, partnerships, or any questions about saving money.',
  }),
  
  privacy: generateMetadata({
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
  }),
  
  terms: generateMetadata({
    title: 'Terms of Service',
    description: 'Terms and conditions for using Cost Saver App.',
  }),
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate JSON-LD script tag
 */
export function generateJSONLD(schema: any): string {
  return JSON.stringify(schema);
}

/**
 * Get full URL for a path
 */
export function getFullUrl(path: string): string {
  return `${SITE_CONFIG.url}${path}`;
}

/**
 * Generate meta tags for custom head insertion
 */
export function generateMetaTags(config: SEOConfig): string {
  const tags = [
    `<title>${config.title}</title>`,
    `<meta name="description" content="${config.description}" />`,
  ];
  
  if (config.keywords) {
    tags.push(`<meta name="keywords" content="${config.keywords.join(', ')}" />`);
  }
  
  if (config.canonical) {
    tags.push(`<link rel="canonical" href="${config.canonical}" />`);
  }
  
  return tags.join('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateMetadata,
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateProductSchema,
  generateJSONLD,
  getFullUrl,
  SITE_CONFIG,
  PAGE_METADATA,
};
