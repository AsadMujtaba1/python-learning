# Cost Saver Blog

This directory contains automated blog posts generated twice per week.

## Structure

Each blog post is a Markdown file with the format:
```
YYYY-MM-DD-url-slug.md
```

## Frontmatter

Each post includes metadata:
```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
excerpt: "SEO description"
tags: ["tag1", "tag2"]
slug: "url-slug"
author: "Cost Saver Team"
readTime: "X min read"
---
```

## Automated Generation

Posts are automatically generated via GitHub Actions:
- Every Monday at 9 AM UK time
- Every Thursday at 9 AM UK time

See `/docs/BLOG_SYSTEM.md` for full documentation.
