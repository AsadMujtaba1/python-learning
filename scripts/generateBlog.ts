/**
 * AUTOMATED BLOG GENERATOR
 * 
 * Generates high-quality, SEO-optimized blog posts for UK energy consumers
 * Runs automatically via GitHub Actions twice per week
 * 
 * Features:
 * - Smart topic selection with no duplicates
 * - Factually accurate content aligned with UK energy market
 * - SEO optimization with proper metadata
 * - Automatic file naming and slug generation
 * - Cross-linking between related posts
 */

import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BlogPost {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  slug: string;
  content: string;
  relatedSlugs?: string[];
}

// Comprehensive topic pool aligned with Cost Saver app
const TOPIC_CATEGORIES = {
  pricing: [
    'Understanding the UK Energy Price Cap: What It Means for Your Bills',
    'Why Did My Energy Bill Go Up? Common Reasons Explained',
    'Standing Charges Explained: Are You Paying Too Much?',
    'Unit Rates vs Standing Charges: Breaking Down Your Energy Bill',
    'How to Calculate Your True Cost Per kWh in the UK',
    'Fixed vs Variable Tariffs: Which Saves You More Money?',
    'Economy 7 Tariffs: Are They Still Worth It in 2025?',
    'The Hidden Costs in Your Energy Bill You Might Be Missing',
  ],
  smartMeters: [
    'Smart Meters: 10 Ways They Help You Save Money',
    'SMETS1 vs SMETS2: Which Smart Meter Do You Have?',
    'How to Read Your Smart Meter Display Like a Pro',
    'Smart Meter Data: Privacy Concerns and What You Should Know',
    'Troubleshooting Common Smart Meter Issues in UK Homes',
    'Using Your IHD (In-Home Display) to Cut Energy Costs',
    'Smart Meter Myths Debunked: Separating Fact from Fiction',
  ],
  savings: [
    'Cut Your Energy Bill by £500: 20 Practical UK Tips',
    '10 Energy-Wasting Habits Costing You Hundreds Per Year',
    'The Cost Saver Method: Track, Analyse, Save',
    'Winter Heating Tips: Stay Warm and Save Money',
    'Summer Energy Savings: Keep Cool Without Breaking the Bank',
    'Energy-Efficient Appliances: Which Upgrades Pay Off?',
    'Phantom Power: How Much Are Your Standby Devices Costing You?',
    'Washing Machine Energy Costs: Cold vs Hot Wash Savings',
    'Kettle Costs: How Much Does Boiling Water Really Cost?',
    'Fridge Freezer Running Costs: Optimization Tips',
  ],
  switching: [
    'When Should You Switch Energy Suppliers? A UK Guide',
    'How to Compare Energy Tariffs: Step-by-Step Guide',
    'Switching Energy Suppliers: Common Mistakes to Avoid',
    'Best Time to Switch: Timing Your Energy Tariff Change',
    'Loyalty Penalty: Why Staying with Your Supplier Costs More',
    'Direct Debit vs Prepayment: Which Payment Method Saves Money?',
    'Exit Fees Explained: When It\'s Worth Paying to Switch',
  ],
  technology: [
    'Heat Pumps in the UK: Cost, Savings, and Installation Guide',
    'Solar Panels ROI: When Do They Pay for Themselves?',
    'EV Charging at Home: Costs and Money-Saving Tips',
    'Battery Storage: Is It Worth Adding to Your Solar System?',
    'Smart Thermostats: Do They Really Save You Money?',
    'LED Lighting: Calculate Your Actual Savings',
    'Air Source vs Ground Source Heat Pumps: UK Comparison',
  ],
  seasonal: [
    'Winter Energy Survival Guide: Heat Your Home for Less',
    'Spring Cleaning Your Energy Bills: Annual Maintenance Tips',
    'Summer Energy Efficiency: Keep Cool, Keep Costs Down',
    'Autumn Preparation: Get Your Home Ready for Higher Bills',
    'Christmas Energy Costs: Festive Lights and Cooking Tips',
    'Heating Degree Days: How Weather Affects Your Bill',
  ],
  understanding: [
    'How UK Energy Pricing Actually Works: The Complete Guide',
    'Ofgem Explained: Who They Are and How They Protect You',
    'Wholesale Energy Prices: Why They Affect Your Bill',
    'Green Energy Tariffs: Are They Really Cheaper?',
    'Energy Consumption by Appliance: UK Household Breakdown',
    'kWh Explained: Understanding Energy Units',
    'Carbon Footprint: How Your Energy Use Affects the Planet',
  ],
  budgeting: [
    'Energy Budgeting: How to Predict Your Monthly Costs',
    'Winter Bill Shock: How to Prepare and Budget',
    'Payment Plans: Managing Energy Debt in the UK',
    'Warm Home Discount: How to Claim Your £150',
    'Energy Grants and Support: What Help Is Available?',
    'Cost of Living Crisis: Energy-Specific Money Saving Tips',
  ],
};

/**
 * Get all existing blog posts to avoid duplicates
 */
async function getExistingBlogPosts(): Promise<string[]> {
  const blogDir = path.join(process.cwd(), 'blog');
  
  try {
    await fs.access(blogDir);
  } catch {
    await fs.mkdir(blogDir, { recursive: true });
    return [];
  }

  const files = await fs.readdir(blogDir);
  return files
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', ''));
}

/**
 * Select a fresh, relevant topic based on season and existing content
 */
async function selectTopic(existingSlugs: string[]): Promise<string> {
  const allTopics = Object.values(TOPIC_CATEGORIES).flat();
  const month = new Date().getMonth();
  
  // Prioritize seasonal content
  let prioritizedTopics = [...allTopics];
  
  // Winter (Nov-Feb)
  if (month >= 10 || month <= 1) {
    prioritizedTopics = [
      ...TOPIC_CATEGORIES.seasonal.filter(t => t.includes('Winter')),
      ...TOPIC_CATEGORIES.savings.filter(t => t.includes('heating')),
      ...allTopics,
    ];
  }
  // Summer (Jun-Aug)
  else if (month >= 5 && month <= 7) {
    prioritizedTopics = [
      ...TOPIC_CATEGORIES.seasonal.filter(t => t.includes('Summer')),
      ...allTopics,
    ];
  }
  
  // Filter out topics similar to existing slugs
  const availableTopics = prioritizedTopics.filter(topic => {
    const topicSlug = createSlug(topic);
    return !existingSlugs.some(existing => 
      existing.includes(topicSlug.slice(0, 20)) || 
      topicSlug.includes(existing.slice(0, 20))
    );
  });
  
  if (availableTopics.length === 0) {
    throw new Error('No available topics - all have been covered!');
  }
  
  return availableTopics[0];
}

/**
 * Create URL-friendly slug from title
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Generate high-quality blog content using OpenAI
 */
async function generateBlogContent(topic: string, existingSlugs: string[]): Promise<BlogPost> {
  const date = new Date().toISOString().split('T')[0];
  const slug = createSlug(topic);
  
  // Select 2-3 related blog posts for internal linking
  const relatedSlugs = existingSlugs
    .filter(s => s !== slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const prompt = `You are a professional UK energy blogger writing for Cost Saver, an energy bill tracking and savings app.

Write a comprehensive, SEO-optimized blog post on: "${topic}"

CRITICAL REQUIREMENTS:
1. **UK-specific**: All advice, prices, and regulations must be UK-focused
2. **Factually accurate**: Use only verifiable information about UK energy market
3. **Practical**: Include actionable steps readers can take TODAY
4. **SEO-optimized**: Natural keyword integration, clear structure
5. **Engaging**: Write in friendly, conversational tone
6. **Safe**: No legally binding advice, use phrases like "typically", "often", "may"
7. **Current**: Reflect 2025 UK energy market conditions
8. **Length**: 900-1,200 words
9. **Structure**: Clear sections with H2/H3 headings

CONTENT STRUCTURE:
- Engaging introduction (hook the reader)
- 4-6 main sections with practical advice
- Real UK household examples (e.g., "A typical 3-bedroom semi-detached home in Birmingham...")
- Bullet points for tips
- Call-to-action promoting Cost Saver app at the end
${relatedSlugs.length > 0 ? `- Internal links to: ${relatedSlugs.map(s => `/blog/${s}`).join(', ')}` : ''}

WRITING STYLE:
- Second person ("you", "your")
- Short paragraphs (2-3 sentences)
- Active voice
- Avoid jargon, or explain it clearly
- Include specific numbers and examples
- Be helpful, not promotional

Write the complete blog post in Markdown format. Do NOT include the frontmatter - only the content starting with the H1 title.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert UK energy blogger with deep knowledge of the UK energy market, Ofgem regulations, and practical money-saving advice for British households. You write clear, accurate, engaging content that helps people save money on their energy bills.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = completion.choices[0].message.content || '';
  
  // Extract title from content (first H1)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : topic;
  
  // Generate excerpt using AI
  const excerptPrompt = `Write a compelling 150-character SEO meta description for this blog post title: "${title}". Make it actionable and include a benefit.`;
  
  const excerptCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: excerptPrompt }],
    temperature: 0.7,
    max_tokens: 60,
  });
  
  const excerpt = excerptCompletion.choices[0].message.content?.replace(/['"]/g, '') || 
    title.slice(0, 150);

  // Generate relevant tags
  const tags = generateTags(title, content);

  return {
    title,
    date,
    excerpt,
    tags,
    slug,
    content,
    relatedSlugs,
  };
}

/**
 * Generate relevant tags from content
 */
function generateTags(title: string, content: string): string[] {
  const allText = `${title} ${content}`.toLowerCase();
  
  const possibleTags = {
    'energy-bills': ['bill', 'cost', 'price', 'payment'],
    'smart-meters': ['smart meter', 'smets', 'ihd', 'display'],
    'uk-energy': ['uk', 'britain', 'ofgem', 'price cap'],
    'money-saving': ['save', 'saving', 'reduce', 'cut', 'lower'],
    'tariffs': ['tariff', 'fixed', 'variable', 'rate'],
    'heating': ['heating', 'boiler', 'radiator', 'warm'],
    'electricity': ['electricity', 'electric', 'power', 'kwh'],
    'gas': ['gas', 'natural gas'],
    'solar': ['solar', 'panel', 'pv'],
    'heat-pump': ['heat pump', 'ashp', 'gshp'],
    'ev-charging': ['ev', 'electric vehicle', 'charging'],
    'budgeting': ['budget', 'plan', 'forecast'],
    'switching': ['switch', 'supplier', 'compare'],
    'efficiency': ['efficient', 'efficiency', 'reduce consumption'],
  };
  
  const tags: string[] = [];
  
  for (const [tag, keywords] of Object.entries(possibleTags)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      tags.push(tag);
    }
  }
  
  return tags.slice(0, 6); // Maximum 6 tags
}

/**
 * Create blog post file with frontmatter
 */
async function saveBlogPost(post: BlogPost): Promise<string> {
  const filename = `${post.date}-${post.slug}.md`;
  const filepath = path.join(process.cwd(), 'blog', filename);
  
  // Check if file already exists
  try {
    await fs.access(filepath);
    console.log(`✓ Blog post already exists: ${filename}`);
    return '';
  } catch {
    // File doesn't exist, continue
  }
  
  const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
date: "${post.date}"
excerpt: "${post.excerpt.replace(/"/g, '\\"')}"
tags: [${post.tags.map(t => `"${t}"`).join(', ')}]
slug: "${post.slug}"
author: "Cost Saver Team"
readTime: "${estimateReadTime(post.content)} min read"
---

`;

  const fullContent = frontmatter + post.content;
  
  await fs.writeFile(filepath, fullContent, 'utf-8');
  console.log(`✅ Created blog post: ${filename}`);
  
  return filename;
}

/**
 * Estimate reading time
 */
function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200); // Average reading speed
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting automated blog generation...\n');
    
    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    // Get existing blog posts
    console.log('📚 Scanning existing blog posts...');
    const existingSlugs = await getExistingBlogPosts();
    console.log(`Found ${existingSlugs.length} existing posts\n`);
    
    // Select topic
    console.log('🎯 Selecting topic...');
    const topic = await selectTopic(existingSlugs);
    console.log(`Selected: ${topic}\n`);
    
    // Generate content
    console.log('✍️  Generating blog content with OpenAI...');
    const blogPost = await generateBlogContent(topic, existingSlugs);
    console.log(`Generated: ${blogPost.title}`);
    console.log(`Word count: ~${blogPost.content.split(/\s+/).length} words`);
    console.log(`Tags: ${blogPost.tags.join(', ')}\n`);
    
    // Save to file
    console.log('💾 Saving blog post...');
    const filename = await saveBlogPost(blogPost);
    
    if (filename) {
      console.log('\n✅ Blog generation completed successfully!');
      console.log(`📄 File: blog/${filename}`);
      console.log(`🔗 URL: /blog/${blogPost.slug}`);
    } else {
      console.log('\n⚠️  No new blog post created (file already exists)');
    }
    
  } catch (error) {
    console.error('❌ Error generating blog:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main, generateBlogContent, selectTopic };
