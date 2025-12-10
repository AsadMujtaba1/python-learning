# Blog System Quick Start 🚀

## ⚡ 5-Minute Setup

### Step 1: Get OpenAI API Key (2 mins)
```
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with sk-...)
4. IMPORTANT: Requires GPT-4 access on your OpenAI account
```

### Step 2: Add GitHub Secret (2 mins)
```
1. Go to your GitHub repo
2. Click: Settings → Secrets and variables → Actions
3. Click: "New repository secret"
4. Name: OPENAI_API_KEY
5. Value: Paste your key from Step 1
6. Click: "Add secret"
```

### Step 3: Enable GitHub Actions (30 secs)
```
1. GitHub repo → Settings → Actions → General
2. Select: "Allow all actions and reusable workflows"
3. Click: Save
```

### Step 4: Test It! (1 min)
```
1. GitHub repo → Actions tab
2. Click: "Generate Blog Post"
3. Click: "Run workflow" → Run workflow
4. Watch it execute (takes ~30 seconds)
5. Check the blog/ directory for your new post!
```

## ✅ That's It!

Your system will now automatically generate blog posts:
- **Every Monday at 9 AM UK time**
- **Every Thursday at 9 AM UK time**

## 📝 Quick Commands

Test locally (requires OPENAI_API_KEY env var):
```bash
npm run blog:generate
```

See recent posts:
```bash
npm run blog:preview
```

## 📊 What You Get

Each blog post includes:
- 900-1,200 words of UK-specific energy content
- SEO-optimized title, meta description, tags
- H2/H3 structure for readability
- Internal links to related posts
- Frontmatter metadata
- Clean URL slug
- Estimated read time

## 🎯 Topics Covered

8 categories, 60+ topics:
- **Pricing**: Price cap, standing charges, unit rates
- **Smart Meters**: SMETS1/2, IHD, privacy
- **Savings**: £500 cuts, seasonal tips, appliance costs
- **Switching**: When to switch, comparison tools
- **Technology**: Heat pumps, solar panels, EVs
- **Seasonal**: Winter prep, summer efficiency
- **Understanding**: How pricing works, Ofgem
- **Budgeting**: Payment plans, grants, forecasting

## 💰 Cost

- **£4-8 per month** (OpenAI API costs)
- **2 posts per week** × £0.03-0.06 per post
- First month might be higher while testing

## 🔍 Monitoring

Check your blog posts:
```
GitHub repo → blog/ directory
```

Check automation runs:
```
GitHub repo → Actions tab → "Generate Blog Post"
```

View execution logs:
```
Click any workflow run → See all jobs → generate-and-publish
```

## 🛠️ Troubleshooting

**"Error: OpenAI API key not found"**
- Add OPENAI_API_KEY to GitHub secrets (see Step 2)

**"Error: Insufficient quota"**
- Add payment method at https://platform.openai.com/account/billing
- You need GPT-4 access

**"No new post created"**
- Check Actions logs for errors
- Verify OpenAI API key is valid
- Ensure topic list isn't exhausted (unlikely with 60+ topics)

## 📚 Full Documentation

See `docs/BLOG_SYSTEM.md` for:
- Complete setup guide
- Customization options
- Topic management
- Quality assurance
- SEO features
- Cost breakdown
- Future enhancements

## 🎨 Optional: Vercel Auto-Deploy

Add these GitHub secrets for automatic deployment:
```
VERCEL_TOKEN       (from https://vercel.com/account/tokens)
VERCEL_ORG_ID      (from Vercel project settings)
VERCEL_PROJECT_ID  (from Vercel project settings)
```

Without these, Vercel will still deploy via GitHub integration (just takes 30-60 seconds longer).

## ✨ Example Output

See `blog/2025-01-01-understanding-uk-energy-bill-guide-2025.md` for a sample post showing:
- Proper frontmatter structure
- SEO-optimized content
- UK-specific examples
- Clear H2/H3 hierarchy
- Practical advice
- Internal linking
- Call-to-action

## 🚨 Important Notes

1. **First run takes 30-45 seconds** (OpenAI API call)
2. **Content is reviewed by GPT-4** for UK accuracy
3. **Duplicate prevention** via slug comparison
4. **Seasonal prioritization** (winter/summer topics)
5. **No manual intervention needed** once set up

## 🎉 Success Checklist

- [ ] OpenAI API key created
- [ ] OPENAI_API_KEY added to GitHub secrets
- [ ] GitHub Actions enabled
- [ ] Manual workflow test successful
- [ ] Sample blog post created in blog/ directory
- [ ] Automatic runs scheduled (Mon/Thu 9 AM)

**You're all set!** The system will now run automatically. Check back Monday morning for your first automated post.

---

**Questions?** See `docs/BLOG_SYSTEM.md` or raise an issue on GitHub.
