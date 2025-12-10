/**
 * Compact News Feed for Sidebar
 * Shows 4 latest news articles in a compact vertical list
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLatestNews, NewsArticle } from '@/lib/newsService';

export default function CompactNewsFeed() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const articles = await getLatestNews(4);
      setNews(articles);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return null;
  }

  const getCategoryIcon = (category: NewsArticle['category']): string => {
    const icons: Record<NewsArticle['category'], string> = {
      'prices': '💰',
      'policy': '⚖️',
      'green-energy': '🌱',
      'tips': '💡',
      'technology': '🔧',
    };
    return icons[category] || '📰';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📰 Energy News
        </h2>
        <Link 
          href="/news"
          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-3">
        {news.map((article) => (
          <a 
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <article className="bg-white dark:bg-gray-800 rounded-lg p-3 hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg flex-shrink-0">
                  {getCategoryIcon(article.category)}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                    {article.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 pl-8">
                {article.aiSummary || article.summary}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pl-8">
                <span className="truncate">{article.source}</span>
                <span className="flex-shrink-0 ml-2">{formatDate(article.publishedAt)}</span>
              </div>

              {article.relevanceScore && article.relevanceScore >= 80 && (
                <div className="mt-2 pl-8">
                  <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-xs rounded-full font-medium">
                    ⭐ High Impact
                  </span>
                </div>
              )}
            </article>
          </a>
        ))}
      </div>

      <Link 
        href="/news"
        className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium py-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        See All News
      </Link>
    </div>
  );
}
