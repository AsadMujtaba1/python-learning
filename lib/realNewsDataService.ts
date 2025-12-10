/**
 * REAL NEWS DATA SERVICE - RSS FEEDS & LEGAL SOURCES
 * 
 * Fetches real energy news from official RSS feeds:
 * 1. BBC News Energy RSS
 * 2. Guardian Environment RSS
 * 3. Ofgem News RSS
 * 4. Gov.UK Energy News
 * 
 * All sources are public RSS feeds - 100% legal
 * 
 * @module lib/realNewsDataService
 */

import { NewsArticle } from './newsService';

const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours for news
const USER_AGENT = 'CostSaverApp/1.0 (+https://cost-saver-app.vercel.app)';

interface CachedNews {
  articles: NewsArticle[];
  timestamp: number;
}

let cachedNews: CachedNews | null = null;

/**
 * Parse RSS feed XML to NewsArticle objects
 */
function parseRSSFeed(xml: string, source: NewsArticle['source']): NewsArticle[] {
  const articles: NewsArticle[] = [];
  
  // Simple XML parsing (in production, use a proper XML parser)
  const itemRegex = /<item>[\s\S]*?<\/item>/g;
  const items = xml.match(itemRegex) || [];
  
  for (const item of items) {
    const content = item;
    
    const titleMatch = content.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
                       content.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);
    const descMatch = content.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
                      content.match(/<description>([\s\S]*?)<\/description>/);
    const pubDateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    
    if (titleMatch && linkMatch) {
      const title = titleMatch[1].trim();
      const description = descMatch ? descMatch[1].trim().replace(/<[^>]+>/g, '') : '';
      
      // Only include energy-related articles
      if (isEnergyRelated(title + ' ' + description)) {
        articles.push({
          id: `rss-${source}-${Date.now()}-${Math.random()}`,
          title: title,
          summary: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
          source: source,
          category: categorizeArticle(title + ' ' + description),
          url: linkMatch[1].trim(),
          publishedAt: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
          relevanceScore: calculateRelevance(title + ' ' + description),
        });
      }
    }
  }
  
  return articles;
}

/**
 * Check if article is energy-related
 */
function isEnergyRelated(text: string): boolean {
  const keywords = [
    'energy', 'electricity', 'gas', 'power', 'heating',
    'bills', 'tariff', 'price cap', 'ofgem', 'renewable',
    'solar', 'wind', 'insulation', 'heat pump', 'boiler',
    'energy saving', 'energy efficiency', 'carbon', 'net zero',
    'cost of living', 'utility bills'
  ];
  
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Categorize article based on content
 */
function categorizeArticle(text: string): NewsArticle['category'] {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('price') || lowerText.includes('tariff') || lowerText.includes('bill')) {
    return 'prices';
  }
  if (lowerText.includes('government') || lowerText.includes('policy') || lowerText.includes('regulation')) {
    return 'policy';
  }
  if (lowerText.includes('renewable') || lowerText.includes('solar') || lowerText.includes('wind') || lowerText.includes('green')) {
    return 'green-energy';
  }
  if (lowerText.includes('how to') || lowerText.includes('save') || lowerText.includes('reduce')) {
    return 'tips';
  }
  if (lowerText.includes('technology') || lowerText.includes('innovation') || lowerText.includes('smart')) {
    return 'technology';
  }
  
  return 'tips';
}

/**
 * Calculate relevance score 0-100
 */
function calculateRelevance(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 50; // Base score
  
  // High priority keywords
  const highPriority = ['price cap', 'energy bills', 'cost of living', 'ofgem', 'save money'];
  for (const keyword of highPriority) {
    if (lowerText.includes(keyword)) score += 10;
  }
  
  // Medium priority
  const mediumPriority = ['renewable', 'solar', 'insulation', 'heat pump', 'tariff'];
  for (const keyword of mediumPriority) {
    if (lowerText.includes(keyword)) score += 5;
  }
  
  return Math.min(score, 100);
}

/**
 * Fetch from BBC News Energy RSS
 * https://www.bbc.co.uk/news/rss
 */
async function fetchBBCNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      'https://feeds.bbci.co.uk/news/business/rss.xml',
      { headers: { 'User-Agent': USER_AGENT } }
    );
    
    if (!response.ok) return [];
    
    const xml = await response.text();
    return parseRSSFeed(xml, 'BBC');
  } catch (error) {
    console.error('BBC RSS fetch error:', error);
    return [];
  }
}

/**
 * Fetch from Guardian Environment RSS
 * https://www.theguardian.com/environment/rss
 */
async function fetchGuardianNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      'https://www.theguardian.com/environment/rss',
      { headers: { 'User-Agent': USER_AGENT } }
    );
    
    if (!response.ok) return [];
    
    const xml = await response.text();
    return parseRSSFeed(xml, 'Guardian');
  } catch (error) {
    console.error('Guardian RSS fetch error:', error);
    return [];
  }
}

/**
 * Fetch from Ofgem News
 * https://www.ofgem.gov.uk/news-and-views
 */
async function fetchOfgemNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      'https://www.ofgem.gov.uk/news',
      { headers: { 'User-Agent': USER_AGENT } }
    );
    
    if (!response.ok) return [];
    
    const html = await response.text();
    return parseOfgemHTML(html);
  } catch (error) {
    console.error('Ofgem news fetch error:', error);
    return [];
  }
}

/**
 * Parse Ofgem news from HTML (they don't have RSS)
 */
function parseOfgemHTML(html: string): NewsArticle[] {
  const articles: NewsArticle[] = [];
  
  // Ofgem uses structured news cards
  const articleRegex = /<article[^>]*class="[^"]*news-card[^"]*"[^>]*>[\s\S]*?<\/article>/g;
  const matches = html.match(articleRegex) || [];
  
  for (const match of matches) {
    const content = match;
    
    const titleMatch = content.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) ||
                       content.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const linkMatch = content.match(/<a[^>]*href="([^"]+)"/);
    const descMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    const dateMatch = content.match(/<time[^>]*datetime="([^"]+)"/);
    
    if (titleMatch && linkMatch) {
      const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      let url = linkMatch[1];
      
      // Make relative URLs absolute
      if (!url.startsWith('http')) {
        url = 'https://www.ofgem.gov.uk' + url;
      }
      
      articles.push({
        id: `ofgem-${Date.now()}-${Math.random()}`,
        title: title,
        summary: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
        source: 'Ofgem',
        category: 'policy',
        url: url,
        publishedAt: dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString(),
        relevanceScore: 90, // Ofgem articles are highly relevant
      });
    }
  }
  
  return articles;
}

/**
 * Fetch from Gov.UK Energy News
 */
async function fetchGovUKNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      'https://www.gov.uk/search/news-and-communications.atom?keywords=energy',
      { headers: { 'User-Agent': USER_AGENT } }
    );
    
    if (!response.ok) return [];
    
    const xml = await response.text();
    return parseRSSFeed(xml, 'Gov.UK');
  } catch (error) {
    console.error('Gov.UK RSS fetch error:', error);
    return [];
  }
}

/**
 * Main function to get real news from all sources
 */
export async function getRealNewsData(): Promise<NewsArticle[]> {
  // Check cache first
  if (cachedNews && Date.now() - cachedNews.timestamp < CACHE_DURATION) {
    console.log('Using cached news data');
    return cachedNews.articles;
  }

  console.log('Fetching fresh news data...');

  try {
    // Fetch from all sources in parallel
    const [bbcNews, guardianNews, ofgemNews, govUKNews] = await Promise.allSettled([
      fetchBBCNews(),
      fetchGuardianNews(),
      fetchOfgemNews(),
      fetchGovUKNews(),
    ]);

    const allArticles: NewsArticle[] = [];

    if (bbcNews.status === 'fulfilled') {
      allArticles.push(...bbcNews.value);
    }
    if (guardianNews.status === 'fulfilled') {
      allArticles.push(...guardianNews.value);
    }
    if (ofgemNews.status === 'fulfilled') {
      allArticles.push(...ofgemNews.value);
    }
    if (govUKNews.status === 'fulfilled') {
      allArticles.push(...govUKNews.value);
    }

    // Sort by relevance and date
    const sorted = allArticles.sort((a, b) => {
      const scoreA = (a.relevanceScore || 50) + (new Date(a.publishedAt).getTime() / 1000000);
      const scoreB = (b.relevanceScore || 50) + (new Date(b.publishedAt).getTime() / 1000000);
      return scoreB - scoreA;
    });

    // Cache results
    cachedNews = {
      articles: sorted,
      timestamp: Date.now(),
    };

    return sorted;
  } catch (error) {
    console.error('Error fetching real news data:', error);
    return [];
  }
}

/**
 * Clear cache (for testing)
 */
export function clearNewsCache(): void {
  cachedNews = null;
}

/**
 * Get cache age
 */
export function getNewsCacheAge(): number | null {
  if (!cachedNews) return null;
  return Date.now() - cachedNews.timestamp;
}
