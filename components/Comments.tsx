/**
 * COMMENTS SECTION COMPONENT
 * 
 * Anonymous community comments
 * Can be embedded on blog posts and news articles
 * Privacy-first, no personal data collected
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  getComments, 
  postComment, 
  upvoteComment, 
  reportComment,
  checkRateLimit,
  Comment 
} from '@/lib/communityService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface CommentsProps {
  postId: string;
  postType: 'blog' | 'news';
}

export default function Comments({ postId, postType }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [postId, postType]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await getComments(postId, postType);
      setComments(fetchedComments);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      setError('Please enter a comment');
      return;
    }

    // Rate limiting (using browser fingerprint - simplified)
    const fingerprint = `${navigator.userAgent}_${postId}`;
    if (!checkRateLimit(fingerprint, 5)) {
      setError('You can only post 5 comments per hour. Please try again later.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const result = await postComment(postId, postType, newComment);

      if (result.success && result.comment) {
        setComments([result.comment, ...comments]);
        setNewComment('');
        setSuccess('Comment posted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
      setError('An error occurred while posting your comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (commentId: string) => {
    try {
      await upvoteComment(commentId);
      // Update local state
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c
      ));
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleReport = async (commentId: string) => {
    const reason = prompt('Why are you reporting this comment?');
    if (!reason) return;

    try {
      await reportComment(commentId, reason);
      setSuccess('Comment reported. Thank you for helping keep our community safe.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to report comment:', err);
      setError('Failed to report comment');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          💬 Community Comments ({comments.length})
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Anonymous • Safe • Moderated
        </span>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" className="mb-4" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Comment Form */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts... (Anonymous posting)"
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {newComment.length}/500 characters
          </span>
          <Button
            variant="primary"
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          🔒 Your comment will be posted anonymously. No personal data is collected.
        </p>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onUpvote={handleUpvote}
              onReport={handleReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Comment Card Component
 */
interface CommentCardProps {
  comment: Comment;
  onUpvote: (commentId: string) => void;
  onReport: (commentId: string) => void;
}

function CommentCard({ comment, onUpvote, onReport }: CommentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {comment.authorName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {comment.authorName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(comment.createdAt)}
            </p>
          </div>
        </div>
        <button
          onClick={() => onReport(comment.id)}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xs"
          title="Report inappropriate content"
        >
          🚩 Report
        </button>
      </div>

      {/* Content */}
      <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
        {comment.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onUpvote(comment.id)}
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span className="text-lg">👍</span>
          <span className="font-semibold">{comment.upvotes}</span>
        </button>
      </div>
    </div>
  );
}
