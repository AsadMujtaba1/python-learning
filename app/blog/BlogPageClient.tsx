'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BlogPost, BLOG_CATEGORIES } from '@/lib/blogService';
import Badge from '@/components/Badge';

interface BlogPageClientProps {
  initialPosts: BlogPost[];
}

export default function BlogPageClient({ initialPosts }: BlogPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<BlogPost['category'] | 'all'>('all');

  console.log('BlogPageClient - Received posts:', initialPosts?.length || 0);

  // Filter posts on the client side
  const filteredPosts = selectedCategory === 'all' 
    ? initialPosts 
    : initialPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
            ← Home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📝 Energy Saving Blog
          </h1>
          <span className="w-12" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Expert Energy-Saving Advice
          </h2>
          <p className="text-green-100 text-lg">
            Practical advice, product reviews, and step-by-step guides to reduce your energy bills
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Browse by Category
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Posts
            </button>
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts && filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              {initialPosts && initialPosts.length > 0 
                ? 'No blog posts found for this category'
                : 'No blog posts available'}
            </p>
            <p className="text-sm text-gray-500">
              Total posts loaded: {initialPosts?.length || 0}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Blog Post Card Component
 */
interface BlogPostCardProps {
  post: BlogPost;
}

function BlogPostCard({ post }: BlogPostCardProps) {
  const getCategoryColor = (category: BlogPost['category']) => {
    switch (category) {
      case 'energy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'home-upgrades':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'products':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'guides':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'news':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryData = (category: BlogPost['category']) => {
    return BLOG_CATEGORIES.find(c => c.id === category);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const categoryData = getCategoryData(post.category);

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group h-full flex flex-col">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="h-48 overflow-hidden">
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getCategoryColor(post.category)}`}>
              {categoryData?.emoji} {categoryData?.label}
            </span>
            {post.readTime && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {post.readTime} min read
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                👁️ {post.views || 0}
              </span>
              <span className="flex items-center gap-1">
                ❤️ {post.likes || 0}
              </span>
            </div>
            <span>{formatDate(post.publishedAt || post.updatedAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
