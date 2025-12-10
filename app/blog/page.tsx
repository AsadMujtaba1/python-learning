/**
 * BLOG PAGE (PUBLIC)
 * 
 * Energy-saving blog with guides and tips
 * SEO-optimized for organic traffic
 * 
 * @page /blog
 */

import { getBlogPosts } from '@/lib/blogService';
import BlogPageClient from './BlogPageClient';

export default async function BlogPage() {
  // Load all posts on the server
  const allPosts = await getBlogPosts();
  
  console.log('Blog Page - Loaded posts:', allPosts.length);
  
  if (allPosts.length > 0) {
    console.log('First post:', allPosts[0].title, allPosts[0].slug);
  }

  return <BlogPageClient initialPosts={allPosts} />;
}
