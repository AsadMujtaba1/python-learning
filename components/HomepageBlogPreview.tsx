/**
 * HOMEPAGE BLOG PREVIEW
 * 
 * Display latest 3 blog posts on homepage
 * Drive traffic to blog section
 * 
 * @component HomepageBlogPreview
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBlogPosts, BlogPost } from '@/lib/blogService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

export default function HomepageBlogPreview() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const blogPosts = await getBlogPosts({ status: 'published' }, 3);
      setPosts(blogPosts);
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  const getCategoryColor = (category: BlogPost['category']) => {
    const colors = {
      energy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'home-upgrades': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      products: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      guides: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      news: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[category] || colors.energy;
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          💡 Latest Money-Saving Tips
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Expert advice, product reviews, and step-by-step guides to reduce your household bills
        </p>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {posts.map((post) => (
          <Link 
            key={post.id} 
            href={`/blog/${post.slug}`}
            className="group"
          >
            <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden h-full flex flex-col transform hover:scale-105">
              {/* Cover Image */}
              {post.coverImage ? (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.coverImage} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                  <span className="text-6xl">📝</span>
                </div>
              )}

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {post.category.replace('-', ' ')}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{post.readTime || 5} min read</span>
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                    Read more →
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Link href="/blog">
          <Button variant="secondary" size="lg">
            View All Articles
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>
    </section>
  );
}
