/**
 * ADMIN BLOG MANAGEMENT PAGE
 * 
 * CRUD interface for blog posts
 * AI-assisted content generation
 * Admin-only access
 * 
 * @page /admin/blog
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile, UserProfile } from '@/lib/userProfile';
import { 
  getBlogPosts, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost, 
  generateBlogWithAI,
  generateSlug,
  calculateReadTime,
  BlogPost, 
  BLOG_CATEGORIES 
} from '@/lib/blogService';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import Alert from '@/components/Alert';

export default function AdminBlogPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <AdminBlogContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function AdminBlogContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'energy' as BlogPost['category'],
    tags: '',
    status: 'draft' as BlogPost['status'],
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [userProfile, allPosts] = await Promise.all([
        getUserProfile(user.uid),
        getBlogPosts({ status: undefined }, 50), // Get all posts including drafts
      ]);

      setProfile(userProfile);
      setPosts(allPosts);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load blog data');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin (in production, check Firestore custom claims)
  const isAdmin = user?.email?.endsWith('@costsaver.com') || user?.uid === 'admin';

  const handleCreatePost = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'energy',
      tags: '',
      status: 'draft',
    });
    setShowEditor(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags.join(', '),
      status: post.status,
    });
    setShowEditor(true);
  };

  const handleSavePost = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const slug = generateSlug(formData.title);
      const readTime = calculateReadTime(formData.content);
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

      if (editingPost) {
        // Update existing post
        await updateBlogPost(editingPost.id, {
          ...formData,
          slug,
          tags,
          readTime,
          publishedAt: formData.status === 'published' ? new Date().toISOString() : undefined,
        });
        setSuccess('Post updated successfully!');
      } else {
        // Create new post
        await createBlogPost(user.uid, {
          ...formData,
          slug,
          tags,
          readTime,
          publishedAt: formData.status === 'published' ? new Date().toISOString() : undefined,
          seo: {
            metaTitle: formData.title,
            metaDescription: formData.excerpt,
            keywords: tags,
          },
        });
        setSuccess('Post created successfully!');
      }

      setShowEditor(false);
      loadData();
    } catch (err) {
      console.error('Failed to save post:', err);
      setError('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setLoading(true);
      await deleteBlogPost(postId);
      setSuccess('Post deleted successfully!');
      loadData();
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    const topic = prompt('Enter blog topic:');
    if (!topic) return;

    try {
      setLoading(true);
      const generated = await generateBlogWithAI(topic, formData.category);
      setFormData({
        ...formData,
        title: generated.title || '',
        content: generated.content || '',
        excerpt: generated.excerpt || '',
        tags: generated.tags?.join(', ') || '',
      });
      setSuccess('AI content generated! Review and edit before publishing.');
    } catch (err) {
      console.error('Failed to generate content:', err);
      setError('Failed to generate AI content');
    } finally {
      setLoading(false);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📝</span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Blog Management
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage blog posts
          </p>
        </div>
        <Button variant="primary" onClick={handleCreatePost}>
          ➕ New Post
        </Button>
      </div>

      <div>
        {/* Alerts */}
        {error && (
          <Alert variant="error" className="mb-6" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-6" onDismiss={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Editor Modal */}
        {showEditor && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleAIGenerate}>
                  🤖 AI Generate
                </Button>
                <Button variant="ghost" onClick={() => setShowEditor(false)}>
                  ❌ Cancel
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter post title..."
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as BlogPost['category'] })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {BLOG_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BlogPost['status'] })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Short summary..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content (Markdown supported)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="Write your blog post..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="energy, savings, tips..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSavePost}
                  disabled={!formData.title || !formData.content || loading}
                >
                  💾 Save Post
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowEditor(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{post.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">/{post.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white capitalize">
                      {post.category}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : post.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-3">
                        <span>👁️ {post.views || 0}</span>
                        <span>❤️ {post.likes || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPost(post)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
