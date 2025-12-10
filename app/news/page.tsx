/**
 * NEWS FEED PAGE
 * 
 * AI-curated energy news and tips
 * Personalized based on user profile
 * Daily updates from UK sources
 * 
 * @page /news
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile, UserProfile } from '@/lib/userProfile';
import { getLatestNews, getPersonalizedNews, NewsArticle, getNewsCategories } from '@/lib/newsService';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import Badge from '@/components/Badge';

export default function NewsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<NewsArticle['category'] | 'all'>('all');
  const [personalized, setPersonalized] = useState(true);

  const categories = getNewsCategories();

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      loadNews();
    }
  }, [user, selectedCategory, personalized]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
      loadNews(userProfile);
    } catch (err) {
      console.error('Failed to load profile:', err);
      loadNews();
    }
  };

  const loadNews = async (userProfile?: UserProfile | null) => {
    try {
      setLoading(true);

      let articles: NewsArticle[];

      if (personalized && userProfile) {
        // Get personalized news
        articles = await getPersonalizedNews({
          interests: ['savings', 'green-energy'],
          location: userProfile.postcode,
          homeType: userProfile.homeType,
        }, 20);
      } else {
        // Get general news
        articles = await getLatestNews(
          20,
          selectedCategory === 'all' ? undefined : selectedCategory
        );
      }

      setNews(articles);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard-new" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                📰 Energy News & Insights
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadNews(profile)}
            >
              🔄 Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-3">
              Stay Informed, Save Money
            </h2>
            <p className="text-blue-100 text-lg">
              AI-curated energy news from BBC, Guardian, Ofgem, and Gov.UK. Updated daily with actionable insights.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Filter News
            </h3>
            {user && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={personalized}
                  onChange={(e) => setPersonalized(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Personalized for me
                </span>
              </label>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All News
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && news.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No news articles found
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => {
                setSelectedCategory('all');
                setPersonalized(false);
              }}
            >
              Show All News
            </Button>
          </div>
        )}

        {/* Update Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>News updated daily from trusted UK sources</p>
          <p className="mt-1">Sources: BBC, The Guardian, Gov.UK, Ofgem</p>
        </div>
      </div>
    </div>
  );
}

/**
 * News Card Component
 */
interface NewsCardProps {
  article: NewsArticle;
}

function NewsCard({ article }: NewsCardProps) {
  const getCategoryColor = (category: NewsArticle['category']) => {
    switch (category) {
      case 'prices':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'policy':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'green-energy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'tips':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'technology':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryLabel = (category: NewsArticle['category']) => {
    const cats = getNewsCategories();
    const found = cats.find(c => c.id === category);
    return found ? `${found.emoji} ${found.label}` : category;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
      {/* Relevance Bar */}
      {article.relevanceScore && article.relevanceScore >= 80 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 text-sm font-semibold text-gray-900">
          ⭐ Highly Relevant to You
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getCategoryColor(article.category)}`}>
            {getCategoryLabel(article.category)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(article.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>

        {/* Summary */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {article.summary}
        </p>

        {/* AI Summary */}
        {article.aiSummary && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 border-l-4 border-blue-500">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
              🤖 AI Insight
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {article.aiSummary}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Source: {article.source}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Read More →
          </a>
        </div>
      </div>
    </article>
  );
}
