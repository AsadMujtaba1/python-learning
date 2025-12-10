"""
Process all enhanced blog posts from ChatGPT and create markdown files
"""
import os
import re
from docx import Document
from datetime import datetime

def extract_text_from_docx(file_path):
    """Extract all text from a Word document"""
    doc = Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

def parse_blog_content(text):
    """Parse the blog content to extract frontmatter and markdown"""
    # Look for frontmatter markers
    frontmatter_pattern = r'---\s*\n(.*?)\n---\s*\n(.*)'
    match = re.search(frontmatter_pattern, text, re.DOTALL)
    
    if match:
        frontmatter = match.group(1)
        content = match.group(2)
        return frontmatter, content
    else:
        # If no proper frontmatter, try to extract it manually
        return None, text

def extract_slug_from_frontmatter(frontmatter):
    """Extract slug from frontmatter"""
    slug_match = re.search(r'slug:\s*["\']?([^"\'\n]+)["\']?', frontmatter)
    if slug_match:
        return slug_match.group(1).strip()
    return None

def extract_date_from_frontmatter(frontmatter):
    """Extract date from frontmatter"""
    date_match = re.search(r'date:\s*["\']?([^"\'\n]+)["\']?', frontmatter)
    if date_match:
        return date_match.group(1).strip()
    return None

def clean_frontmatter(frontmatter):
    """Clean and standardize frontmatter"""
    lines = frontmatter.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#'):
            # Remove any markdown formatting from frontmatter
            line = line.replace('**', '').replace('*', '')
            cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def process_blog_file(blog_num, blogs_dir, output_dir):
    """Process a single blog file"""
    file_path = os.path.join(blogs_dir, f'blog{blog_num}.docx')
    
    if not os.path.exists(file_path):
        print(f"⚠️  File not found: blog{blog_num}.docx")
        return None
    
    print(f"\n📄 Processing blog{blog_num}.docx...")
    
    # Extract text from Word document
    text = extract_text_from_docx(file_path)
    
    # Parse frontmatter and content
    frontmatter, content = parse_blog_content(text)
    
    if not frontmatter:
        print(f"⚠️  Could not find frontmatter in blog{blog_num}, attempting manual extraction...")
        # Try to find title and create basic frontmatter
        title_match = re.search(r'^#\s+(.+)$', text, re.MULTILINE)
        if title_match:
            title = title_match.group(1)
            # Create slug from title
            slug = re.sub(r'[^\w\s-]', '', title.lower())
            slug = re.sub(r'[-\s]+', '-', slug)
            
            # Create basic frontmatter
            frontmatter = f'''title: "{title}"
date: "2025-01-{blog_num:02d}"
excerpt: "{title}"
tags: ["energy", "savings", "uk"]
slug: "{slug}"
author: "Cost Saver Team"
readTime: "8 min read"
category: "guides"
featured: false'''
            content = text
    else:
        frontmatter = clean_frontmatter(frontmatter)
    
    # Extract slug and date for filename
    slug = extract_slug_from_frontmatter(frontmatter)
    date = extract_date_from_frontmatter(frontmatter)
    
    if not slug:
        # Generate slug from blog number
        slug = f"blog-post-{blog_num}"
        print(f"⚠️  No slug found, using: {slug}")
    
    if not date:
        date = f"2025-01-{blog_num:02d}"
        print(f"⚠️  No date found, using: {date}")
    
    # Clean the date for filename (remove quotes and extra chars)
    date_clean = date.replace('"', '').replace("'", '').strip()
    
    # Create filename
    filename = f"{date_clean}-{slug}.md"
    output_path = os.path.join(output_dir, filename)
    
    # Create final markdown content
    final_content = f"---\n{frontmatter}\n---\n\n{content.strip()}"
    
    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    
    print(f"✓ Created: {filename}")
    return filename

def main():
    blogs_dir = 'ChatGPT/Blogs'
    output_dir = 'blog'
    
    print("=" * 60)
    print("PROCESSING ENHANCED BLOG POSTS")
    print("=" * 60)
    
    created_files = []
    
    # Process all 12 blogs
    for i in range(1, 13):
        try:
            filename = process_blog_file(i, blogs_dir, output_dir)
            if filename:
                created_files.append(filename)
        except Exception as e:
            print(f"❌ Error processing blog{i}.docx: {str(e)}")
            continue
    
    print("\n" + "=" * 60)
    print(f"✓ COMPLETED: {len(created_files)} blog posts created")
    print("=" * 60)
    
    print("\nCreated files:")
    for filename in created_files:
        print(f"  • {filename}")
    
    print("\n📋 Next steps:")
    print("1. Review the created markdown files in /blog folder")
    print("2. Commit changes: git add blog/ && git commit -m 'Add 12 enhanced blog posts'")
    print("3. Deploy: git push")

if __name__ == '__main__':
    main()
