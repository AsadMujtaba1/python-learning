/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml for SEO
 */

import { NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/blogService';

export async function GET() {
  // Static pages
  const staticPages = [
    '',
    'about',
    'blog',
    'products',
    'tariffs',
    'solar',
    'heat-pump',
    'tools/energy-waste-calculator',
    'faq',
    'contact',
    'privacy',
    'terms',
  ];

  // Get dynamic blog posts
  const blogPosts = await getBlogPosts({}, 100);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.costsaver.uk';
  const currentDate = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}/${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page === '' || page === 'blog' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
  ${blogPosts
    .map(
      (post) => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
