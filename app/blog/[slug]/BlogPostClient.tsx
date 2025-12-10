'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { BlogPost, BLOG_CATEGORIES, incrementPostViews, togglePostLike } from '@/lib/blogService';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import ReactMarkdown from 'react-markdown';

interface BlogPostClientProps {
  post: BlogPost;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  useEffect(() => {
    // Increment view count when post is viewed
    incrementPostViews(post.id).catch(err => 
      console.error('Failed to increment views:', err)
    );
  }, [post.id]);

  const handleLike = async () => {
    if (!user) return;

    try {
      await togglePostLike(post.id, user.uid);
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(err => console.error('Share failed:', err));
    }
  };

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

        {/* Content - Render Markdown */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12 prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-green-600 dark:prose-a:text-green-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mb-12 pb-12 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant={liked ? 'primary' : 'secondary'}
            onClick={handleLike}
            disabled={!user}
          >
            ❤️ {liked ? 'Liked' : 'Like'} ({likeCount})
          </Button>
          <Button
            variant="secondary"
            onClick={handleShare}
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
