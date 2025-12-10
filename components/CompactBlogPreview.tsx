/**
 * Compact Blog Preview for Sidebar
 * Shows 3 latest blog posts in a compact vertical list
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBlogPosts, BlogPost } from '@/lib/blogService';

export default function CompactBlogPreview() {
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          💡 Latest Money-Saving Tips
        </h2>
        <Link 
          href="/blog"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link 
            key={post.id} 
            href={`/blog/${post.slug}`}
            className="group"
          >
            <article className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 hover:shadow-xl transition-all duration-200 h-full flex flex-col transform hover:scale-105">
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">
                  {post.excerpt}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-600">
                <span>⏱️ {post.readTime || 5} min</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Read →
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
