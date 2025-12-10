/**
 * HOMEPAGE NEWS FEED
 * 
 * Display latest energy news on homepage
 * Show app is up-to-date and trustworthy
 * 
 * @component HomepageNewsFeed
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLatestNews, NewsArticle } from '@/lib/newsService';
import LoadingSpinner from './LoadingSpinner';

export default function HomepageNewsFeed() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const articles = await getLatestNews(5);
      setNews(articles);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: NewsArticle['category']) => {
    const icons = {
      prices: '💰',
      policy: '⚖️',
      'green-energy': '🌱',
      tips: '💡',
      technology: '🔧',
    };
    return icons[category] || '📰';
  };

  const getSourceColor = (source: NewsArticle['source']) => {
    const colors = {
      'BBC': 'text-red-600 dark:text-red-400',
      'Guardian': 'text-blue-600 dark:text-blue-400',
      'Gov.UK': 'text-green-600 dark:text-green-400',
      'Ofgem': 'text-purple-600 dark:text-purple-400',
      'Other': 'text-gray-600 dark:text-gray-400',
    };
    return colors[source] || colors.Other;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (news.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
            <span>📰</span>
            <span>Latest Energy News</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Stay informed about price changes, policies, and money-saving opportunities
          </p>
        </div>

        {/* News Items */}
        <div className="space-y-4 mb-6">
          {news.map((article, index) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white dark:bg-gray-800 rounded-lg p-5 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="flex items-start gap-4">
                {/* Category Icon */}
                <div className="flex-shrink-0 text-3xl">
                  {getCategoryIcon(article.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>

                  {/* AI Summary (if available) */}
                  {article.aiSummary ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {article.aiSummary}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {article.summary}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`font-medium ${getSourceColor(article.source)}`}>
                      {article.source}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatDate(article.publishedAt)}
                    </span>
                    {article.relevanceScore && article.relevanceScore >= 80 && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <span className="mr-1">⭐</span>
                          <span>High Impact</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* External Link Icon */}
                <div className="flex-shrink-0 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All News Link */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-600">
          <Link 
            href="/news"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            <span>View All Energy News</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
