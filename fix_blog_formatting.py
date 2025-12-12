"""
Fix frontmatter and formatting for all blog posts
"""
import os
import re

def read_docx_and_extract_proper_content(blog_num):
    """Read the Word doc again and extract content properly"""
    from docx import Document
    
    file_path = f'ChatGPT/Blogs/blog{blog_num}.docx'
    doc = Document(file_path)
    
    # Extract all paragraphs
    paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            paragraphs.append(text)
    
    full_text = '\n\n'.join(paragraphs)
    return full_text

def extract_blog_metadata(text):
    """Extract title and create proper frontmatter"""
    
    # Find the main title (usually the first # heading)
    title_match = re.search(r'^#\s+(.+)$', text, re.MULTILINE)
    if not title_match:
        # Try to find title in first line
        lines = text.split('\n')
        for line in lines[:5]:
            if len(line) > 10 and not line.startswith('-'):
                title = line.strip('#').strip()
                break
        else:
            title = "Energy Saving Guide"
    else:
        title = title_match.group(1).strip()
    
    # Clean title
    title = title.replace('Blog ', '').replace('blog ', '')
    title = re.sub(r'^\d+\s*[–-]\s*', '', title)  # Remove "1 - " or "1 – "
    
    # Create slug from title
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug[:80]  # Limit length
    
    # Extract excerpt (first paragraph after title)
    excerpt_match = re.search(r'^#[^\n]+\n+(.+?)(?:\n\n|\n#)', text, re.DOTALL)
    if excerpt_match:
        excerpt = excerpt_match.group(1).strip()
        # Take first 150 chars
        if len(excerpt) > 150:
            excerpt = excerpt[:147] + '...'
    else:
        excerpt = title
    
    # Determine category based on title keywords
    title_lower = title.lower()
    if any(word in title_lower for word in ['heat pump', 'boiler', 'thermostat', 'solar panel']):
        category = 'home-upgrades'
    elif any(word in title_lower for word in ['insulation', 'upgrade', 'installation']):
        category = 'home-upgrades'
    elif any(word in title_lower for word in ['smart meter', 'bill', 'tariff', 'price cap']):
        category = 'energy'
    elif any(word in title_lower for word in ['product', 'review', 'comparison']):
        category = 'products'
    else:
        category = 'guides'
    
    # Extract tags
    tags = ['energy', 'uk', 'savings']
    if 'heat pump' in title_lower:
        tags.append('heat-pumps')
    if 'solar' in title_lower:
        tags.append('solar-panels')
    if 'insulation' in title_lower:
        tags.append('insulation')
    if 'bill' in title_lower:
        tags.append('bills')
    if 'smart meter' in title_lower:
        tags.append('smart-meters')
    
    # Estimate read time based on word count
    word_count = len(text.split())
    read_time = max(5, min(15, word_count // 200))
    
    return {
        'title': title,
        'slug': slug,
        'excerpt': excerpt,
        'category': category,
        'tags': tags,
        'readTime': f"{read_time} min read"
    }

def create_proper_blog_file(blog_num):
    """Create properly formatted blog file"""
    
    print(f"\n🔧 Processing blog{blog_num}.docx...")
    
    # Read content from Word doc
    text = read_docx_and_extract_proper_content(blog_num)
    
    # Extract metadata
    metadata = extract_blog_metadata(text)
    
title: "{metadata['title']}"
date: "2025-01-{blog_num:02d}"
excerpt: "{metadata['excerpt']}"
tags: [{tags_str}]
slug: "{metadata['slug']}"
author: "Cost Saver Team"
readTime: "{metadata['readTime']}"
category: "{metadata['category']}"
featured: {str(blog_num <= 3).lower()}
    # Remove any existing "Blog X –" prefixes from the content
    text = re.sub(r'^Blog\s+\d+\s*[–-]\s*[^\n]+\n+', '', text, flags=re.MULTILINE)

    # Remove the duplicate title if it appears twice
    lines = text.split('\n')
    if len(lines) > 1 and lines[0].strip() == lines[1].strip():
        text = '\n'.join(lines[1:])

    # Enforce heading levels: only one H1, use H2 for main sections, H3 for subsections
    # Convert all headings to proper markdown and ensure spacing
    def fix_headings(md):
        lines = md.split('\n')
        new_lines = []
        h1_found = False
        for line in lines:
            # Fix heading spacing
            if re.match(r'^#+ ', line):
                if new_lines and new_lines[-1].strip() != '':
                    new_lines.append('')
            # Only allow one H1
            if re.match(r'^# ', line):
                if h1_found:
                    line = re.sub(r'^# ', '## ', line)
                else:
                    h1_found = True
            # No skipped heading levels (convert ### to ## if no ## before)
            if re.match(r'^### ', line):
                if not any(l.startswith('## ') for l in new_lines[-5:]):
                    line = re.sub(r'^### ', '## ', line)
            new_lines.append(line)
            # Add blank line after heading
            if re.match(r'^#+ ', line):
                new_lines.append('')
        return '\n'.join(new_lines)

    # Enforce list style: hyphens for unordered, numbers for ordered
    def fix_lists(md):
        md = re.sub(r'^[*•]\s+', '- ', md, flags=re.MULTILINE)
        md = re.sub(r'^(\d+)\. ', r'\1. ', md, flags=re.MULTILINE)
        return md

    # Enforce table formatting: header row, standard markdown
    def fix_tables(md):
        # This is a placeholder for more advanced table checks
        return md

    # Remove extra blank lines (no more than one consecutive)
    def fix_blank_lines(md):
        return re.sub(r'\n{3,}', '\n\n', md)

    # Enforce blockquote and code block spacing
    def fix_blocks(md):
        # Ensure blank line before/after blockquotes and code blocks
        md = re.sub(r'([^\n])\n(> )', r'\1\n\n\2', md)
        md = re.sub(r'(```[a-zA-Z]*\n)', r'\n\1', md)
        md = re.sub(r'(\n```)', r'\1\n', md)
        return md

    # Apply all fixes
    text = fix_headings(text)
    text = fix_lists(text)
    text = fix_tables(text)
    text = fix_blank_lines(text)
    text = fix_blocks(text)

    # Create frontmatter
    tags_str = ', '.join([f'"{tag}"' for tag in metadata['tags']])

    frontmatter = f'''---\ntitle: "{metadata['title']}"\ndate: "2025-01-{blog_num:02d}"\nexcerpt: "{metadata['excerpt']}"\ntags: [{tags_str}]\nslug: "{metadata['slug']}"\nauthor: "Cost Saver Team"\nreadTime: "{metadata['readTime']}"\ncategory: "{metadata['category']}"\nfeatured: {str(blog_num <= 3).lower()}\n---'''

    # Combine frontmatter and content
    final_content = f"{frontmatter}\n\n{text.strip()}"

    # Create filename
    filename = f"2025-01-{blog_num:02d}-{metadata['slug']}.md"
    output_path = f"blog/{filename}"

    # Write file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(final_content)

    print(f"✓ Created: {filename}")
    print(f"  Title: {metadata['title']}")
    print(f"  Category: {metadata['category']}")

    return filename

def main():
    print("=" * 70)
    print("FIXING ALL BLOG POSTS - PROPER FORMATTING")
    print("=" * 70)
    
    created_files = []
    
    for i in range(1, 13):
        try:
            filename = create_proper_blog_file(i)
            created_files.append(filename)
        except Exception as e:
            print(f"❌ Error processing blog{i}: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 70)
    print(f"✓ COMPLETED: {len(created_files)}/12 blogs successfully processed")
    print("=" * 70)
    
    print("\n📋 Created files:")
    for f in created_files:
        print(f"  • {f}")

if __name__ == '__main__':
    main()
