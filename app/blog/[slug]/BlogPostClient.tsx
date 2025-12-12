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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">← Home</Link>
          <Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm inline-block">← Back to Blog</Link>
          <span className="w-12" /> {/* Spacer for alignment */}
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8 py-10 bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800">
        {/* Category Badge */}
        <div className="flex items-center gap-3 mb-6">
          <Badge variant="primary">
            {categoryData?.emoji} {categoryData?.label}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">{post.readTime || 5} min read</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          {post.author.avatar && (
            <img src={post.author.avatar} alt={post.author.name} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 mr-2" />
          )}
          <span className="font-semibold">{post.author.name}</span>
          <span>•</span>
          <span>{new Date(post.publishedAt || post.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><span>👁️</span> {post.views || 0}</span>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-auto object-cover max-h-[400px] mx-auto"
            />
          </div>
        )}

        {/* Content - Render Markdown with enhanced team-driven style */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h1:text-4xl prose-h1:font-extrabold prose-h1:mb-8 prose-h1:text-blue-700 dark:prose-h1:text-blue-300 prose-h1:tracking-tight prose-h1:drop-shadow
            prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-6 prose-h2:text-purple-700 dark:prose-h2:text-purple-300 prose-h2:border-b prose-h2:border-purple-200 dark:prose-h2:border-purple-800 prose-h2:pb-2
            prose-h3:text-2xl prose-h3:font-semibold prose-h3:mb-4 prose-h3:text-green-700 dark:prose-h3:text-green-300 prose-h3:italic
            prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-5
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-200
            prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:bg-yellow-100 dark:prose-strong:bg-yellow-900/30 prose-strong:px-1 prose-strong:rounded
            prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:text-blue-900 dark:prose-blockquote:text-blue-100 prose-blockquote:font-medium prose-blockquote:px-6 prose-blockquote:py-3 prose-blockquote:my-6 prose-blockquote:rounded-xl prose-blockquote:shadow
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:rounded prose-code:px-2 prose-code:py-1 prose-code:font-mono prose-code:text-base prose-code:shadow-sm
            prose-li:marker:text-blue-500 dark:prose-li:marker:text-blue-300 prose-li:text-base prose-li:mb-1 prose-li:pl-1 prose-ul:pl-6 prose-ol:pl-6 prose-ul:space-y-1 prose-ol:space-y-1
            prose-table:bg-white dark:prose-table:bg-gray-900 prose-th:bg-blue-50 dark:prose-th:bg-blue-900 prose-td:bg-white dark:prose-td:bg-gray-900 prose-table:rounded-xl prose-table:overflow-hidden prose-table:shadow prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-800 prose-th:font-bold prose-th:text-lg prose-td:text-base prose-td:px-4 prose-td:py-2 prose-th:px-4 prose-th:py-2
            prose-img:rounded-xl prose-img:shadow-md prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-800 prose-img:my-6
            prose-hr:my-8 prose-hr:border-t-2 prose-hr:border-gray-200 dark:prose-hr:border-gray-700
            prose-em:text-orange-600 dark:prose-em:text-orange-300 prose-em:font-semibold
            prose-pre:bg-gray-900 prose-pre:text-white prose-pre:rounded-xl prose-pre:p-4 prose-pre:shadow-lg prose-pre:my-6
            prose-kbd:bg-gray-200 dark:prose-kbd:bg-gray-700 prose-kbd:text-xs prose-kbd:rounded prose-kbd:px-2 prose-kbd:py-1 prose-kbd:font-mono prose-kbd:shadow-sm
            prose-card:bg-yellow-50 dark:prose-card:bg-yellow-900/20 prose-card:border prose-card:border-yellow-200 dark:prose-card:border-yellow-800 prose-card:rounded-xl prose-card:p-4 prose-card:my-6 prose-card:shadow
          "
        >
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 mb-10 pb-8 border-b border-gray-200 dark:border-gray-700">
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
          <div className="mb-10">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 tracking-wide uppercase">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium tracking-wide border border-blue-100 dark:border-blue-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related CTA */}
        <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-2xl p-8 text-white text-center shadow-xl mt-8">
          <h3 className="text-2xl font-bold mb-3">
            Ready to Save on Your Energy Bills?
          </h3>
          <p className="text-green-100 mb-6">
            Track your energy costs and discover personalized savings opportunities
          </p>
          <Link href="/dashboard-new">
            <Button variant="secondary" size="lg">
              Sign Up →
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
