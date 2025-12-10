/**
 * AI NEWS FEED SERVICE
 * 
 * Fetch and summarize energy news from UK sources
 * Uses RSS feeds + AI summarization
 * Automated daily updates
 */

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  fullContent?: string;
  source: 'BBC' | 'Guardian' | 'Gov.UK' | 'Ofgem' | 'Other';
  category: 'prices' | 'policy' | 'green-energy' | 'tips' | 'technology';
  url: string;
  imageUrl?: string;
  publishedAt: string;
  aiSummary?: string; // Short AI-generated summary
  relevanceScore?: number; // 0-100
}

/**
 * Mock news data
 * In production, fetch from RSS feeds and summarize with AI
 */
const MOCK_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'Energy Price Cap to Rise by 1.2% in January 2025',
    summary: 'Ofgem announces the energy price cap will increase to £1,928 per year for typical households from January 1st, 2025.',
    source: 'Ofgem',
    category: 'prices',
    url: 'https://www.ofgem.gov.uk/news',
    publishedAt: new Date('2024-12-01').toISOString(),
    aiSummary: 'The energy price cap will rise by 1.2% (£21/year) from January. Fixed tariffs may offer better value for those willing to lock in rates.',
    relevanceScore: 95,
  },
  {
    id: '2',
    title: 'Government Launches £150M Home Insulation Grant Scheme',
    summary: 'New government scheme offers grants up to £5,000 for home insulation improvements to help reduce energy bills.',
    source: 'Gov.UK',
    category: 'policy',
    url: 'https://www.gov.uk/energy',
    publishedAt: new Date('2024-11-28').toISOString(),
    aiSummary: 'Apply now for insulation grants. Average savings of £300/year. Prioritizes low-income households and homes with poor EPC ratings.',
    relevanceScore: 90,
  },
  {
    id: '3',
    title: 'UK Renewable Energy Hits Record 50% of Grid Mix',
    summary: 'Renewable sources including wind, solar, and hydro now provide half of all UK electricity, marking a historic milestone.',
    source: 'BBC',
    category: 'green-energy',
    url: 'https://www.bbc.co.uk/news/business',
    publishedAt: new Date('2024-11-25').toISOString(),
    aiSummary: 'Record renewable energy means cleaner power and potentially lower costs in 2025. Consider switching to a green tariff.',
    relevanceScore: 75,
  },
  {
    id: '4',
    title: 'Smart Meters Can Save Households Up to £290 Per Year',
    summary: 'New study reveals households with smart meters save an average of £290 annually through better energy management.',
    source: 'Guardian',
    category: 'tips',
    url: 'https://www.theguardian.com/environment',
    publishedAt: new Date('2024-11-22').toISOString(),
    aiSummary: 'Request a free smart meter from your supplier. Real-time data helps identify waste and shift usage to cheaper times.',
    relevanceScore: 85,
  },
  {
    id: '5',
    title: 'Heat Pumps Become Cheaper Than Gas Boilers',
    summary: 'Government subsidies and improved technology make heat pumps more affordable than traditional gas heating systems.',
    source: 'BBC',
    category: 'technology',
    url: 'https://www.bbc.co.uk/news/science',
    publishedAt: new Date('2024-11-20').toISOString(),
    aiSummary: 'Heat pumps now cost-effective with £7,500 grants. Save £200-400/year vs gas. Best for well-insulated homes.',
    relevanceScore: 70,
  },
  {
    id: '6',
    title: 'Winter Energy Support: Who Qualifies for £300 Payment',
    summary: 'Government announces Winter Fuel Payment eligibility criteria for 2024/25 heating season.',
    source: 'Gov.UK',
    category: 'policy',
    url: 'https://www.gov.uk/winter-fuel-payment',
    publishedAt: new Date('2024-11-18').toISOString(),
    aiSummary: 'Pensioners and low-income households may qualify for £300 winter support. Check eligibility on Gov.UK.',
    relevanceScore: 80,
  },
];

/**
 * Get latest news articles
 * Uses REAL DATA from RSS feeds by default
 */
export async function getLatestNews(
  limit: number = 10,
  category?: NewsArticle['category'],
  useRealData: boolean = true
): Promise<NewsArticle[]> {
  // Try to get real news first
  if (useRealData) {
    try {
      const { getRealNewsData } = await import('./realNewsDataService');
      const realArticles = await getRealNewsData();
      if (realArticles.length > 0) {
        console.log(`✅ Using REAL news data (${realArticles.length} articles)`);
        let articles = realArticles;
        
        // Filter by category if specified
        if (category) {
          articles = articles.filter(a => a.category === category);
        }
        
        // Sort by date (newest first) and limit
        return articles
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, limit);
      }
    } catch (error) {
      console.warn('Real news fetch failed, using mock:', error);
    }
  }
  
  console.log('📦 Using mock news data (fallback)');
  let articles = [...MOCK_NEWS];

  // Filter by category if specified
  if (category) {
    articles = articles.filter(a => a.category === category);
  }

  // Sort by date (newest first)
  articles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return articles.slice(0, limit);
}

/**
 * Get personalized news feed based on user profile
 */
export async function getPersonalizedNews(
  userPreferences: {
    interests?: string[];
    location?: string;
    homeType?: string;
  },
  limit: number = 10
): Promise<NewsArticle[]> {
  // Get all news
  const allNews = await getLatestNews(50);

  // Score articles based on user preferences
  const scoredNews = allNews.map(article => {
    let score = article.relevanceScore || 50;

    // Boost for user interests
    if (userPreferences.interests) {
      if (userPreferences.interests.includes('green-energy') && article.category === 'green-energy') {
        score += 20;
      }
      if (userPreferences.interests.includes('savings') && article.category === 'prices') {
        score += 15;
      }
    }

    // Boost for home-relevant content
    if (userPreferences.homeType === 'flat' && article.title.toLowerCase().includes('flat')) {
      score += 10;
    }

    return { ...article, relevanceScore: Math.min(100, score) };
  });

  // Sort by relevance score
  scoredNews.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  return scoredNews.slice(0, limit);
}

/**
 * Fetch news from RSS feeds
 * Now uses REAL DATA from BBC, Guardian, Ofgem RSS feeds
 */
async function fetchRSSFeeds(useRealData: boolean = true): Promise<NewsArticle[]> {
  if (useRealData) {
    try {
      const { getRealNewsData } = await import('./realNewsDataService');
      const realArticles = await getRealNewsData();
      if (realArticles.length > 0) {
        console.log(`✅ Using REAL news data (${realArticles.length} articles)`);
        return realArticles;
      }
    } catch (error) {
      console.warn('Real news data fetch failed, using mock:', error);
    }
  }
  
  console.log('📦 Using mock news data (fallback)');
  return MOCK_NEWS;
}

/**
 * Generate AI summary for article
 * In production, use OpenAI or similar
 */
async function generateAISummary(articleContent: string): Promise<string> {
  // Mock implementation
  // In production:
  // const response = await openai.chat.completions.create({
  //   model: 'gpt-4',
  //   messages: [{
  //     role: 'user',
  //     content: `Summarize this energy news article in one sentence focusing on actionable insights: ${articleContent}`
  //   }],
  //   max_tokens: 50,
  // });
  // return response.choices[0].message.content;
  
  return 'AI-generated summary of the article highlighting key points and action items.';
}

/**
 * Save news to Firestore
 */
export async function saveNewsToFirestore(articles: NewsArticle[]): Promise<void> {
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    for (const article of articles) {
      const newsRef = doc(db, 'news', article.id);
      await setDoc(newsRef, {
        ...article,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Failed to save news:', error);
    throw error;
  }
}

/**
 * Get news from Firestore
 */
export async function getNewsFromFirestore(limit: number = 10): Promise<NewsArticle[]> {
  try {
    const { collection, query, getDocs, orderBy, limit: fbLimit } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const newsRef = collection(db, 'news');
    const q = query(newsRef, orderBy('publishedAt', 'desc'), fbLimit(limit));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as NewsArticle);
  } catch (error) {
    console.error('Failed to get news:', error);
    return MOCK_NEWS.slice(0, limit);
  }
}

/**
 * Refresh news feed (for automated cron job)
 */
export async function refreshNewsFeed(): Promise<void> {
  try {
    console.log('Refreshing news feed...');
    
    // 1. Fetch from RSS feeds
    const articles = await fetchRSSFeeds();
    
    // 2. Generate AI summaries
    for (const article of articles) {
      if (!article.aiSummary && article.fullContent) {
        article.aiSummary = await generateAISummary(article.fullContent);
      }
    }
    
    // 3. Save to Firestore
    await saveNewsToFirestore(articles);
    
    console.log(`Refreshed ${articles.length} news articles`);
  } catch (error) {
    console.error('Failed to refresh news feed:', error);
    throw error;
  }
}

/**
 * Get news categories
 */
export function getNewsCategories(): { id: NewsArticle['category']; label: string; emoji: string }[] {
  return [
    { id: 'prices', label: 'Energy Prices', emoji: '💷' },
    { id: 'policy', label: 'Government Policy', emoji: '🏛️' },
    { id: 'green-energy', label: 'Green Energy', emoji: '🌱' },
    { id: 'tips', label: 'Saving Tips', emoji: '💡' },
    { id: 'technology', label: 'Technology', emoji: '🔧' },
  ];
}
