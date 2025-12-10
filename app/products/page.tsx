/**
 * PRODUCT SHOP PAGE
 * 
 * Browse energy-efficient products
 * AI-powered personalized recommendations
 * Category-based navigation
 * 
 * @page /products
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile, UserProfile } from '@/lib/userProfile';
import { getUserBills, BillData } from '@/lib/billOCR';
import {
  getAllProducts,
  getProductsByCategory,
  getTrendingProducts,
  Product,
  ProductCategory,
  PRODUCT_CATEGORIES,
} from '@/lib/productService';
import {
  getPersonalizedRecommendations,
  getCurrentSeason,
  PersonalizationInput,
} from '@/lib/productPersonalization';
import ProductCard, { ProductGrid } from '@/components/ProductCard';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import FeedbackButton from '@/components/UserFeedback';

export default function ProductsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [personalizedProducts, setPersonalizedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<number>(1000);
  const [showPersonalized, setShowPersonalized] = useState(true);

  useEffect(() => {
    loadData();
  }, [user, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load products (with real data enabled)
      const allProducts = await getAllProducts(
        selectedCategory === 'all' ? { useRealData: true } : { category: selectedCategory, useRealData: true }
      );
      setProducts(allProducts);

      // Load trending (with real data enabled)
      const trending = await getTrendingProducts(6, true);
      setTrendingProducts(trending);

      // Load user data for personalization
      if (user) {
        const [userProfile, bills] = await Promise.all([
          getUserProfile(user.uid),
          getUserBills(user.uid),
        ]);

        setProfile(userProfile);
        setBillData(bills[0] || null);

        // Generate personalized recommendations
        if (userProfile) {
          const input: PersonalizationInput = {
            userProfile,
            billData: bills[0],
            currentSeason: getCurrentSeason(),
          };

          const recommendations = await getPersonalizedRecommendations(input, allProducts);
          setPersonalizedProducts(
            recommendations.topRecommendations.map(r => r.product).slice(0, 6)
          );
        }
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => p.price <= priceFilter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Header with Gradient */}
      <header className="bg-gradient-to-r from-green-600 via-teal-500 to-blue-600 dark:from-green-900 dark:via-teal-900 dark:to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/dashboard-new" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-white mb-3">
                🛒 Energy-Efficient Products
              </h1>
              <p className="text-white/90 text-lg mb-4">
                Discover energy-efficient products personally recommended for your home. All products are tested and rated for reliability.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-medium">
                  ⭐ Expert-Curated
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-medium">
                  🤖 AI-Personalized
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-medium">
                  💰 Affiliate Links
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-medium">
                  📊 Energy Ratings
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Personalized Recommendations */}
        {user && personalizedProducts.length > 0 && showPersonalized && (
          <div className="mb-12">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🎯</span>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Recommended for You
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Based on your tariff, usage patterns, and household size
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPersonalized(false)}
              >
                ✕
              </Button>
            </div>
            <ProductGrid columns={3}>
              {personalizedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  featured={true}
                  showSavings={true}
                  currentPowerConsumption={product.powerConsumption * 1.5}
                />
              ))}
            </ProductGrid>
          </div>
        )}

        {/* Trending Products */}
        {trendingProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🔥</span>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Trending This Week
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Most popular products right now</p>
              </div>
            </div>
            <ProductGrid columns={3}>
              {trendingProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          </div>
        )}

        {/* Category & Price Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span>🔍</span> Filter Products
          </h3>
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    selectedCategory === 'all'
                      ? 'bg-green-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Products
                </button>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                      selectedCategory === cat.id
                        ? 'bg-green-600 text-white shadow-md scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Price Range
              </label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Max Price: <span className="font-bold text-gray-900 dark:text-white">£{priceFilter}</span>
                </span>
                <button
                  onClick={() => setPriceFilter(1000)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Reset
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={priceFilter}
                onChange={(e) => setPriceFilter(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>£0</span>
                <span>£1000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCategory === 'all' 
                  ? 'All Products' 
                  : PRODUCT_CATEGORIES.find(c => c.id === selectedCategory)?.label
                }
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredProducts.length} products
              </p>
            </div>
            <ProductGrid columns={3}>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showSavings={billData?.electricityUsage?.rate ? true : false}
                />
              ))}
            </ProductGrid>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              No products found matching your filters
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedCategory('all');
                setPriceFilter(1000);
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 How We Select Products
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            All products are carefully evaluated based on energy efficiency, reliability scores, 
            customer ratings, and real-world performance data. We only recommend products that 
            deliver genuine savings.
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Disclosure: We may earn commission from purchases through our affiliate links. 
            This helps us provide free tools and recommendations.
          </p>
        </div>
        
        {/* Feedback Button */}
        <FeedbackButton page="products" section="shop" />
      </main>
    </div>
  );
}
