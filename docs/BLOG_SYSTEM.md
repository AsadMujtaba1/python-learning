# Automated Blog System - Setup Guide

## 🎯 Overview

This automated blog system generates 2 high-quality, SEO-optimized blog posts per week for the Cost Saver app. It runs completely automatically via GitHub Actions.

## 📅 Schedule

- **Monday at 9 AM UK time** - First post of the week
- **Thursday at 9 AM UK time** - Second post of the week
- Can also be triggered manually via GitHub Actions UI

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install openai tsx
```

### 2. Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

1. **OPENAI_API_KEY** (Required)
   - Get from: https://platform.openai.com/api-keys
   - Create a new API key with GPT-4 access
   - Paste the key (starts with `sk-...`)

2. **VERCEL_TOKEN** (Optional - for deployment)
   - Get from: https://vercel.com/account/tokens
   - Create a new token
   - Paste the token

3. **VERCEL_ORG_ID** (Optional)
   - Found in Vercel project settings

4. **VERCEL_PROJECT_ID** (Optional)
   - Found in Vercel project settings

### 3. Enable GitHub Actions

Ensure GitHub Actions are enabled in your repository:
- Go to Settings → Actions → General
- Select "Allow all actions and reusable workflows"

### 4. Test Manual Run

1. Go to Actions tab in GitHub
2. Click "Generate Blog Post" workflow
3. Click "Run workflow" button
4. Select main branch
5. Click "Run workflow"

Watch the workflow execute and check the blog/ directory for the new post.

## 📁 Directory Structure

```
cost-saver-app/
├── .github/
│   └── workflows/
│       └── generate-blog.yml          # GitHub Action workflow
├── scripts/
│   └── generateBlog.ts                # Blog generator script
├── blog/
│   ├── 2025-01-13-smart-meters-guide.md
│   ├── 2025-01-16-winter-heating-tips.md
│   └── ...                            # Generated blog posts
└── docs/
    └── BLOG_SYSTEM.md                 # This file
```

## 📝 Blog Post Format

Each generated blog post includes:

### Frontmatter (Metadata)
```yaml
---
title: "Blog Post Title"
date: "2025-01-13"
excerpt: "SEO-friendly description"
tags: ["energy-bills", "uk-energy", "money-saving"]
slug: "clean-url-slug"
author: "Cost Saver Team"
readTime: "5 min read"
---
```

### Content Structure
- Engaging introduction
- 4-6 main sections with H2/H3 headings
- Practical, actionable advice
- Real UK household examples
- Bullet points for tips
- Internal links to related posts
- Call-to-action for Cost Saver app

## 🎯 Topic Categories

The system covers 8 main categories:

1. **Pricing** - Price caps, bill breakdowns, standing charges
2. **Smart Meters** - SMETS1/2, IHD usage, troubleshooting
3. **Savings** - Practical tips, seasonal advice, appliance costs
4. **Switching** - Tariff comparison, best timing, avoiding mistakes
5. **Technology** - Heat pumps, solar, EVs, smart thermostats
6. **Seasonal** - Winter/summer guides, weather impacts
7. **Understanding** - How energy pricing works, regulations
8. **Budgeting** - Payment plans, grants, support schemes

## 🔄 How It Works

1. **GitHub Action triggers** (Monday/Thursday 9 AM)
2. **Script checks** existing blog posts to avoid duplicates
3. **Topic selection** based on season and coverage gaps
4. **OpenAI generates** 900-1,200 word blog post
5. **Content saved** to `blog/YYYY-MM-DD-slug.md`
6. **Auto-commit** to main branch
7. **Vercel redeploys** automatically

## 📊 Quality Assurance

Every blog post is:
- ✅ **UK-specific** - All advice relevant to British households
- ✅ **Factually accurate** - Based on current UK energy market
- ✅ **SEO-optimized** - Keywords, structure, metadata
- ✅ **Practical** - Actionable steps readers can take today
- ✅ **Safe** - No legally binding advice, compliant phrasing
- ✅ **Engaging** - Conversational tone, clear structure
- ✅ **Current** - Reflects 2025 market conditions

## 🔍 SEO Features

- Keyword-optimized titles
- Meta descriptions under 160 characters
- Structured headings (H1 → H6)
- Internal linking between posts
- Relevant tags for categorization
- Readable URLs (clean slugs)
- Estimated read time
- Author attribution

## 🚨 Troubleshooting

### Workflow fails
- Check OPENAI_API_KEY is set correctly
- Ensure you have GPT-4 API access
- Check GitHub Actions logs for errors

### No blog post generated
- File may already exist with same date/slug
- Check blog/ directory for existing posts
- Run workflow manually to test

### Deployment not triggered
- Vercel should auto-deploy via GitHub integration
- If using Vercel tokens, check they're valid
- Check Vercel deployment logs

## 📈 Monitoring

Check workflow runs:
1. Go to Actions tab
2. Click "Generate Blog Post"
3. View recent runs and logs

View generated posts:
1. Check blog/ directory
2. Review commit history
3. Check live site after deployment

## 🔄 Customization

### Change schedule
Edit `.github/workflows/generate-blog.yml`:
```yaml
schedule:
  - cron: '0 10 * * 1'  # Monday 10 AM UTC
  - cron: '0 10 * * 5'  # Friday 10 AM UTC
```

### Add new topics
Edit `scripts/generateBlog.ts`:
```typescript
const TOPIC_CATEGORIES = {
  newCategory: [
    'New Topic Title 1',
    'New Topic Title 2',
  ],
};
```

### Adjust content length
Modify the prompt in `generateBlogContent()`:
```typescript
// Change from 900-1,200 to desired range
**Length**: 1,200-1,500 words
```

## 🎓 Best Practices

1. **Review first few posts** - Check quality and adjust prompts if needed
2. **Monitor API costs** - OpenAI GPT-4 costs ~$0.03-0.06 per post
3. **Check duplicates** - System auto-prevents but monitor edge cases
4. **Update topics** - Add new topics quarterly to keep content fresh
5. **Internal linking** - System auto-links, verify they make sense
6. **SEO tracking** - Use Google Search Console to monitor performance

## 💰 Cost Estimate

- **OpenAI API**: ~£4-8/month (2 posts/week @ £0.03-0.06 each)
- **GitHub Actions**: Free (well within limits)
- **Vercel**: Free (assuming existing plan)

**Total**: ~£4-8/month for fully automated content

## 📞 Support

For issues or questions:
1. Check GitHub Actions logs
2. Review OpenAI API usage/limits
3. Test manual workflow run
4. Check generated content quality

## 🚀 Future Enhancements

Potential additions:
- Image generation via DALL-E
- Social media post generation
- Newsletter integration
- Analytics tracking
- A/B testing titles
- Trending topic integration
- User comment analysis
