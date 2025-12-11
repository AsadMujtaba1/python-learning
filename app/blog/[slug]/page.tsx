/**
 * BLOG POST DETAIL PAGE (SERVER COMPONENT)
 *
 * Individual blog post with full content
 * SEO-optimized with metadata
 *
 * @page /blog/[slug]
 */

import Link from 'next/link';
import { getBlogPost, incrementPostViews, BLOG_CATEGORIES } from '@/lib/blogService';
import BlogPostClient from './BlogPostClient';
import Button from '@/components/Button';
import Badge from '@/components/Badge';

export default async function BlogPostPage(props: { params: { slug: string } }) {
  // Await params for dynamic route (Next.js best practice)
  const { params } = props;
  // Defensive: await if params is a Promise (for edge cases)
  const awaitedParams = typeof params.then === 'function' ? await params : params;
  const slug = awaitedParams.slug;
  const post = await getBlogPost(slug);
  if (post) {
    // Increment view count (non-blocking)
    incrementPostViews(post.id);
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

  return <BlogPostClient post={post} />;
}
