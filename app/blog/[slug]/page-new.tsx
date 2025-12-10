/**
 * BLOG POST DETAIL PAGE
 * 
 * Individual blog post with full content
 * SEO-optimized with metadata
 * 
 * @page /blog/[slug]
 */

import { notFound } from 'next/navigation';
import { getBlogPost } from '@/lib/blogService';
import BlogPostClient from './BlogPostClient';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Load post on server
  const post = await getBlogPost(slug);
  
  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}
