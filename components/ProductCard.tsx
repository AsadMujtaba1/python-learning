/**
 * PRODUCT CARD COMPONENT
 * 
 * Reusable product display card
 * Shows: image, rating, price, energy cost, affiliate link
 * Optimized for energy products
 */

'use client';

import { useState } from 'react';
import { Product, calculateProductSavings } from '@/lib/productService';
import Button from './Button';
import Badge from './Badge';

interface ProductCardProps {
  product: Product;
  showSavings?: boolean;
  currentPowerConsumption?: number; // For savings calculation
  usageHours?: number;
  featured?: boolean;
  compact?: boolean;
}

export default function ProductCard({
  product,
  showSavings = false,
  currentPowerConsumption,
  usageHours = 4,
  featured = false,
  compact = false,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  // Calculate savings if current appliance data provided
  const savings = showSavings && currentPowerConsumption
    ? calculateProductSavings(product, currentPowerConsumption, usageHours)
    : null;

  const getEnergyRatingColor = (rating: Product['energyRating']) => {
    if (rating.startsWith('A')) return 'bg-green-500';
    if (rating === 'B') return 'bg-yellow-500';
    if (rating === 'C') return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTierBadge = (tier: Product['tier']) => {
    switch (tier) {
      case 'top-pick':
        return { label: '🏆 Top Pick', variant: 'success' as const };
      case 'budget':
        return { label: '💰 Best Value', variant: 'primary' as const };
      case 'premium':
        return { label: '⭐ Premium', variant: 'warning' as const };
    }
  };

  if (compact) {
    return (
      <div className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
          {!imageError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              📦
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-xs">
              <span className="text-yellow-400 mr-1">⭐</span>
              <span className="font-semibold">{product.rating}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                ({product.reviewCount})
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              £{product.price}
            </span>
          </div>
        </div>

        {/* Action */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => window.open(product.affiliateLink, '_blank')}
        >
          View
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group ${
        featured ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {/* Featured Banner */}
      {featured && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-bold">
          🎯 Recommended for You
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📦
          </div>
        )}

        {/* Energy Rating Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 ${getEnergyRatingColor(product.energyRating)} text-white rounded-full text-xs font-bold shadow-lg`}>
          {product.energyRating}
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg">
            Out of Stock
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Tier Badge */}
        <div className="mb-2">
          <Badge variant={getTierBadge(product.tier).variant}>
            {getTierBadge(product.tier).label}
          </Badge>
        </div>

        {/* Brand & Name */}
        <div className="mb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
            {product.brand}
          </p>
          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 h-12">
            {product.name}
          </h3>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center">
            <span className="text-yellow-400 mr-1">⭐</span>
            <span className="font-bold text-gray-900 dark:text-white">{product.rating}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              ({product.reviewCount.toLocaleString()})
            </span>
          </div>
          {product.reliabilityScore >= 85 && (
            <div className="flex items-center text-xs">
              <span className="text-green-500 mr-1">✓</span>
              <span className="text-gray-600 dark:text-gray-400">
                {product.reliabilityScore}% reliable
              </span>
            </div>
          )}
        </div>

        {/* AI Sentiment */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
            🤖 AI Summary
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200 line-clamp-2">
            {product.aiSentiment}
          </p>
        </div>

        {/* Energy Cost */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">Cost/Hour</p>
            <p className="font-bold text-gray-900 dark:text-white">
              £{product.energyCostPerHour.toFixed(3)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">Annual Cost</p>
            <p className="font-bold text-gray-900 dark:text-white">
              £{product.annualRunningCost || 'N/A'}
            </p>
          </div>
        </div>

        {/* Savings Display */}
        {savings && savings.annualSavings > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-3 border border-green-200 dark:border-green-800">
            <p className="text-xs font-semibold text-green-900 dark:text-green-100 mb-1">
              💰 Estimated Savings
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                £{savings.annualSavings.toFixed(0)}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">per year</p>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Pays for itself in {savings.paybackPeriod} months
            </p>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            £{product.price}
          </span>
          {product.previousPrice && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              £{product.previousPrice}
            </span>
          )}
          {product.previousPrice && (
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              Save £{(product.previousPrice - product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Key Features */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Key Features:
          </p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {product.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-green-500 mr-1">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => window.open(product.affiliateLink, '_blank')}
          disabled={!product.inStock}
        >
          {product.inStock ? 'View Deal →' : 'Out of Stock'}
        </Button>

        {/* Pros & Cons Toggle */}
        <details className="mt-3">
          <summary className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
            View Pros & Cons
          </summary>
          <div className="mt-2 space-y-2">
            <div>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                ✓ Pros:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 pl-4">
                {product.pros.map((pro, idx) => (
                  <li key={idx}>• {pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                ✗ Cons:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 pl-4">
                {product.cons.map((con, idx) => (
                  <li key={idx}>• {con}</li>
                ))}
              </ul>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

/**
 * Product Grid Container
 */
interface ProductGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ children, columns = 3 }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {children}
    </div>
  );
}
