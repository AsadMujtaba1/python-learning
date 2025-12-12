# Blog Formatting & Design Standards

To ensure all blogs (current and future) are consistent, readable, and visually appealing, follow these standards:

## 1. Frontmatter
- All posts must include YAML frontmatter with:
  - title, date, excerpt, tags, slug, author, readTime, category, featured
- Use double quotes for all string values
- Tags: always include ["energy", "uk", "savings"] at minimum

## 2. Headings
- Only one H1 (#) per post (the main title)
- Use H2 (##) for main sections, H3 (###) for subsections
- No skipped heading levels

## 3. Lists
- Use hyphens (-) for unordered lists
- Use numbers for ordered lists
- No mixed list styles in the same section

## 4. Tables
- Use standard markdown table syntax
- Always include a header row

## 5. Code/Highlighting
- Use triple backticks for code blocks
- Use single backticks for inline code

## 6. Quotes
- Use > for blockquotes

## 7. Spacing
- One blank line before/after each heading, list, table, or blockquote
- No more than one consecutive blank line anywhere

## 8. Images
- Use markdown image syntax: ![alt text](url)
- Always provide alt text

## 9. Metadata
- All posts must have a unique slug
- Date format: YYYY-MM-DD

## 10. File Naming
- Format: YYYY-MM-DD-url-slug.md

## 11. Author
- Always "Cost Saver Team"

## 12. Read Time
- Format: "X min read"

---

**All scripts (fix_blog_formatting.py, process_enhanced_blogs.py) must enforce these rules.**

For any new blog, run the formatting script before publishing.
