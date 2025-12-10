import { MetadataRoute } from 'next';

/**
 * Dynamic Sitemap Generator
 * 
 * Generates XML sitemap for search engines
 * Includes all public pages and blog posts
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cost-saver-app.vercel.app';
  
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/faq',
    '/contact',
    '/privacy',
    '/terms',
    '/blog',
    '/products',
    '/tools/energy-waste-calculator',
    '/sign-in',
    '/sign-up',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/blog' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // TODO: Dynamically add blog posts
  // In a future iteration, read from /blog directory
  // const blogPosts = getBlogPosts().map(post => ({
  //   url: `${baseUrl}/blog/${post.slug}`,
  //   lastModified: post.date,
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.6,
  // }));

  return [
    ...staticPages,
    // ...blogPosts,
  ];
}
