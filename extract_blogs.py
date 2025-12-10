import re
import json

# Read the markdown blog
with open('blog/2025-01-01-understanding-uk-energy-bill-guide-2025.md', 'r', encoding='utf-8') as f:
    md_blog = f.read()

# Read the TypeScript file
with open('lib/blogService.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Extract MOCK_POSTS section
mock_start = ts_content.find('const MOCK_POSTS')
mock_end = ts_content.find('];', mock_start) + 2
mock_section = ts_content[mock_start:mock_end]

# Count blogs
blog_count = mock_section.count("id: '")
print(f"Found {blog_count} mock blog posts")
print(f"Plus 1 markdown blog = {blog_count + 1} total")

# Extract all blog contents using regex
pattern = r"content: `([^`]+)`"
matches = re.findall(pattern, mock_section, re.DOTALL)

print(f"\nExtracted {len(matches)} blog contents")

# Create comprehensive prompt
prompt = """==============================================
CHATGPT BLOG ENHANCEMENT PROMPT
==============================================

INSTRUCTIONS FOR CHATGPT:

Please review and enhance ALL the following blog posts for the Cost Saver app (a UK energy cost management application).

ENHANCEMENT GOALS:
1. FACTUAL ACCURACY: Verify all UK energy statistics, regulations, and pricing information are current for December 2025
2. SEO OPTIMIZATION:
   - Improve keyword density for: UK energy bills, energy saving tips, reduce energy costs, energy tariffs, smart meters, heat pumps, solar panels, insulation
   - Add relevant long-tail keywords naturally
   - Optimize meta descriptions (150-160 characters)
   - Improve heading hierarchy (H1, H2, H3)
   - Include internal linking opportunities
3. READABILITY: Ensure content is accessible to average UK households (Flesch reading ease: 60-70)
4. ENGAGEMENT: Add compelling hooks, clear CTAs, and practical examples with real numbers
5. STRUCTURE: Improve heading hierarchy, add bullet points, break up long paragraphs (max 3-4 sentences)
6. VALUE: Ensure every section provides actionable insights that help users save money
7. CONSISTENCY: Maintain consistent tone and style across all blog posts

QUALITY CRITERIA:
- Use UK English spelling and terminology throughout
- Include current 2025 UK energy price cap figures (Q4 2024/Q1 2025)
- Reference Ofgem regulations, Energy Saving Trust, and other authorities
- Provide specific, measurable savings figures (£ amounts, percentages, timeframes)
- Include real-world examples for different UK household types (1-bed flat, 3-bed semi, 4-bed detached)
- Maintain friendly, helpful, authoritative tone
- Ensure all statistics are verifiable
- Add specific dates where relevant ("as of December 2025")
- Include comparison tables where useful
- Add "Pro Tips", "Warning" and "Key Takeaway" callout boxes
- Include FAQs at end where appropriate

OUTPUT FORMAT FOR EACH BLOG:
1. ✅ Enhanced blog content in full markdown format with frontmatter
2. 📋 Summary of key changes made
3. 🔍 Primary & secondary SEO keywords used
4. 🔗 Suggested internal links (to /dashboard, /tariffs, /products, /bills, /account, /about)
5. ⚠️ Any factual corrections or updates needed
6. 📊 Estimated readability improvement

TARGET METRICS PER BLOG:
- Reading time: 5-12 minutes
- Keyword density: 1-2% for primary keywords
- Paragraph length: Max 3-4 sentences
- Heading frequency: Every 150-200 words
- Internal links: 3-5 per post
- External authority links: 1-2 per post
- Bullet points: Use liberally for lists
- Tables: Include for comparisons
- Examples: 2-3 real-world scenarios per post

==============================================
EXISTING BLOG POSTS TO ENHANCE
==============================================

"""

# Add markdown blog
prompt += f"""
-----------------------------------------------------------
BLOG POST #1 (from markdown file)
-----------------------------------------------------------
Filename: 2025-01-01-understanding-uk-energy-bill-guide-2025.md
Source: /blog folder (published)
Status: NEEDS ENHANCEMENT

{md_blog}

"""

# Add mock blogs
for i, content in enumerate(matches, start=2):
    # Extract title from content
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else f"Blog Post {i}"
    
    prompt += f"""
-----------------------------------------------------------
BLOG POST #{i}
-----------------------------------------------------------
Title: {title}
Source: Mock data in blogService.ts (NOT YET CREATED AS FILE)
Status: NEEDS ENHANCEMENT + FILE CREATION

{content}

"""
    print(f"Added Blog #{i}: {title}")

prompt += """
-----------------------------------------------------------
END OF ALL BLOG POSTS
-----------------------------------------------------------

==============================================
DELIVERABLES REQUIRED:
==============================================

For EACH of the 8 blog posts above, provide:

1. **Full Enhanced Markdown** with this frontmatter structure:
```markdown
---
title: "Compelling SEO-Optimized Title"
date: "2025-01-0X"
excerpt: "150-160 character summary for SEO"
tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
slug: "url-friendly-slug"
author: "Cost Saver Team"
readTime: "X min read"
category: "energy|home-upgrades|products|guides|news"
featured: true/false
---
```

2. **Change Summary** - What you improved
3. **SEO Keywords** - Primary and secondary
4. **Internal Links** - Where to link within app
5. **Fact Check** - Any corrections needed

==============================================
NEXT STEPS AFTER ENHANCEMENT:
==============================================

1. ChatGPT reviews and enhances all 8 blog posts
2. User saves output as "Enhanced_Blogs_Output.docx"
3. Development team will:
   - Extract enhanced markdown
   - Create new .md files for posts #2-8 in /blog folder
   - Update existing post #1
   - Update blog index and navigation
   - Deploy to production

CRITICAL REMINDERS:
✓ Verify all statistics are accurate for December 2025
✓ Update energy price cap figures (currently around £1,717/year typical)
✓ Check all grant amounts (BUS grant £7,500 for heat pumps as of 2024)
✓ Ensure product recommendations are current
✓ Add disclaimers for financial advice
✓ Include "last updated" dates in frontmatter
✓ Make content actionable with clear next steps
✓ Add Cost Saver app CTAs naturally throughout

Thank you for helping improve the Cost Saver app content to drive more user engagement and traffic!
"""

# Save to file
with open('ChatGPT/Blogs/ALL_Blogs_For_Enhancement.txt', 'w', encoding='utf-8') as f:
    f.write(prompt)

print(f"\n✓ Document created successfully!")
print(f"Location: ChatGPT/Blogs/ALL_Blogs_For_Enhancement.txt")
print(f"Total blogs: {len(matches) + 1}")
print(f"File size: {len(prompt)} characters")
