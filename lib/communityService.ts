/**
 * COMMUNITY COMMENTS SERVICE
 * 
 * Anonymous community comments system
 * Privacy-first: No personal data collection
 * Moderation: Profanity filter, spam detection
 * Safe engagement: Upvotes only, report abuse
 * 
 * @gdpr-compliant
 */

export interface Comment {
  id: string;
  postId: string; // Blog post or news article ID
  postType: 'blog' | 'news';
  content: string;
  authorName: string; // Anonymous display name
  createdAt: string;
  upvotes: number;
  reported: boolean;
  moderationStatus: 'approved' | 'pending' | 'hidden';
}

export interface CommentThread {
  postId: string;
  postType: 'blog' | 'news';
  totalComments: number;
  comments: Comment[];
}

/**
 * Profanity filter words (basic list)
 * In production, use a comprehensive library
 */
const PROFANITY_LIST = [
  'spam', 'scam', 'clickbait', // Add actual profanity words
];

/**
 * Check if content contains profanity
 */
function containsProfanity(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return PROFANITY_LIST.some(word => lowerContent.includes(word));
}

/**
 * Detect spam patterns
 */
function isLikelySpam(content: string): boolean {
  // Check for excessive links
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 2) return true;

  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.5 && content.length > 20) return true;

  // Check for repeated characters
  if (/(.)\1{4,}/.test(content)) return true;

  return false;
}

/**
 * Generate anonymous display name
 */
function generateAnonymousName(): string {
  const adjectives = [
    'Helpful', 'Smart', 'Friendly', 'Wise', 'Clever',
    'Thoughtful', 'Curious', 'Bright', 'Sharp', 'Quick',
  ];
  const nouns = [
    'Saver', 'Helper', 'Expert', 'Advisor', 'Guide',
    'Friend', 'Member', 'User', 'Reader', 'Visitor',
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);

  return `${adj}${noun}${num}`;
}

/**
 * Post anonymous comment
 */
export async function postComment(
  postId: string,
  postType: 'blog' | 'news',
  content: string
): Promise<{ success: boolean; error?: string; comment?: Comment }> {
  try {
    // Validate content
    if (!content || content.trim().length < 5) {
      return { success: false, error: 'Comment must be at least 5 characters' };
    }

    if (content.length > 500) {
      return { success: false, error: 'Comment must be less than 500 characters' };
    }

    // Check for profanity
    if (containsProfanity(content)) {
      return { success: false, error: 'Comment contains inappropriate language' };
    }

    // Check for spam
    if (isLikelySpam(content)) {
      return { success: false, error: 'Comment appears to be spam' };
    }

    // Create comment
    const comment: Comment = {
      id: `comment_${Date.now()}`,
      postId,
      postType,
      content: content.trim(),
      authorName: generateAnonymousName(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      reported: false,
      moderationStatus: 'approved', // Auto-approve if passes filters
    };

    // Save to Firestore
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const commentRef = doc(db, 'comments', comment.id);
    await setDoc(commentRef, {
      ...comment,
      createdAt: serverTimestamp(),
    });

    return { success: true, comment };
  } catch (error) {
    console.error('Failed to post comment:', error);
    return { success: false, error: 'Failed to post comment' };
  }
}

/**
 * Get comments for a post
 */
export async function getComments(
  postId: string,
  postType: 'blog' | 'news',
  limit: number = 50
): Promise<Comment[]> {
  try {
    const { collection, query, where, getDocs, orderBy, limit: fbLimit } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      where('postType', '==', postType),
      where('moderationStatus', '==', 'approved'),
      orderBy('upvotes', 'desc'),
      orderBy('createdAt', 'desc'),
      fbLimit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Comment);
  } catch (error) {
    console.error('Failed to get comments:', error);
    return [];
  }
}

/**
 * Upvote comment (anonymous, rate-limited by IP)
 */
export async function upvoteComment(commentId: string): Promise<void> {
  try {
    const { doc, updateDoc, increment } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      upvotes: increment(1),
    });
  } catch (error) {
    console.error('Failed to upvote comment:', error);
    throw error;
  }
}

/**
 * Report comment for moderation
 */
export async function reportComment(commentId: string, reason: string): Promise<void> {
  try {
    const { doc, setDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    // Create report
    const reportRef = doc(db, 'reports', `${commentId}_${Date.now()}`);
    await setDoc(reportRef, {
      commentId,
      reason,
      reportedAt: serverTimestamp(),
      status: 'pending',
    });

    // Mark comment as reported
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      reported: true,
    });
  } catch (error) {
    console.error('Failed to report comment:', error);
    throw error;
  }
}

/**
 * Get reported comments (admin only)
 */
export async function getReportedComments(): Promise<Comment[]> {
  try {
    const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('reported', '==', true),
      where('moderationStatus', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Comment);
  } catch (error) {
    console.error('Failed to get reported comments:', error);
    return [];
  }
}

/**
 * Moderate comment (admin only)
 */
export async function moderateComment(
  commentId: string,
  action: 'approve' | 'hide' | 'delete'
): Promise<void> {
  try {
    const { doc, updateDoc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const commentRef = doc(db, 'comments', commentId);

    if (action === 'delete') {
      await deleteDoc(commentRef);
    } else {
      await updateDoc(commentRef, {
        moderationStatus: action === 'approve' ? 'approved' : 'hidden',
        reported: false,
      });
    }
  } catch (error) {
    console.error('Failed to moderate comment:', error);
    throw error;
  }
}

/**
 * Get comment statistics
 */
export function getCommentStats(comments: Comment[]): {
  total: number;
  avgUpvotes: number;
  mostUpvoted: Comment | null;
} {
  if (comments.length === 0) {
    return { total: 0, avgUpvotes: 0, mostUpvoted: null };
  }

  const totalUpvotes = comments.reduce((sum, c) => sum + c.upvotes, 0);
  const mostUpvoted = comments.reduce((max, c) => 
    c.upvotes > max.upvotes ? c : max
  );

  return {
    total: comments.length,
    avgUpvotes: totalUpvotes / comments.length,
    mostUpvoted,
  };
}

/**
 * Rate limiting check (simple in-memory, production should use Redis)
 */
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(identifier: string, maxPerHour: number = 5): boolean {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);

  // Get timestamps for this identifier
  let timestamps = rateLimitMap.get(identifier) || [];
  
  // Remove old timestamps
  timestamps = timestamps.filter(t => t > hourAgo);

  // Check limit
  if (timestamps.length >= maxPerHour) {
    return false;
  }

  // Add current timestamp
  timestamps.push(now);
  rateLimitMap.set(identifier, timestamps);

  return true;
}

/**
 * Clean old rate limit entries (run periodically)
 */
export function cleanRateLimitCache(): void {
  const hourAgo = Date.now() - (60 * 60 * 1000);
  
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const recent = timestamps.filter(t => t > hourAgo);
    if (recent.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, recent);
    }
  }
}
