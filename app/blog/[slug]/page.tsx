/**
 * BLOG POST DETAIL PAGE
 * 
 * Individual blog post with full content
 * SEO-optimized with metadata
 * 
 * @page /blog/[slug]
 */

'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { getBlogPost, incrementPostViews, togglePostLike, BlogPost, BLOG_CATEGORIES } from '@/lib/blogService';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import Badge from '@/components/Badge';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadPost();
  }, [resolvedParams.slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const blogPost = await getBlogPost(resolvedParams.slug);
      
      if (blogPost) {
        setPost(blogPost);
        // Increment view count
        await incrementPostViews(blogPost.id);
      }
    } catch (err) {
      console.error('Failed to load blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !post) return;

    try {
      await togglePostLike(post.id, user.uid);
      setLiked(!liked);
      // Reload post to get updated like count
      loadPost();
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link href="/blog">
            <Button variant="primary">
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryData = BLOG_CATEGORIES.find(c => c.id === post.category);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm inline-block">
            ← Back to Blog
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Badge */}
        <div className="mb-4">
          <Badge variant="primary">
            {categoryData?.emoji} {categoryData?.label}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{post.author.name}</span>
          </div>
          <span>
            {new Date(post.publishedAt || post.updatedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          {post.readTime && (
            <span>{post.readTime} min read</span>
          )}
          <span className="flex items-center gap-1">
            👁️ {post.views || 0} views
          </span>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: post.content.replace(/\n/g, '<br />') 
            }} 
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mb-12 pb-12 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant={liked ? 'primary' : 'secondary'}
            onClick={handleLike}
            disabled={!user}
          >
            ❤️ {liked ? 'Liked' : 'Like'} ({post.likes || 0})
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: post.title,
                  text: post.excerpt,
                  url: window.location.href,
                });
              }
            }}
          >
            📤 Share
          </Button>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related CTA */}
        <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">
            Ready to Save on Your Energy Bills?
          </h3>
          <p className="text-green-100 mb-6">
            Track your energy costs and discover personalized savings opportunities
          </p>
          <Link href="/dashboard-new">
            <Button variant="secondary" size="lg">
              Get Started Free →
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
