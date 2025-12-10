'use client';

import { useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { deleteUserData } from '@/lib/userProfile';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      console.error('Firebase Auth is not initialized. Check .env.local configuration.');
      throw new Error('Authentication service is not available. Please refresh the page and try again.');
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getFriendlyErrorMessage(error.code));
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<User> => {
    if (!auth) {
      console.error('Firebase Auth is not initialized. Check .env.local configuration.');
      throw new Error('Authentication service is not available. Please refresh the page and try again.');
    }
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      
      return result.user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getFriendlyErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    if (!auth) return;
    
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase Auth not initialized');
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getFriendlyErrorMessage(error.code));
    }
  };

  const deleteUserAccount = async () => {
    if (!auth || !user) throw new Error('No user signed in');
    
    try {
      // Delete Firestore data first
      await deleteUserData(user.uid);
      
      // Then delete Firebase Auth user
      await deleteUser(user);
      
      // Redirect happens automatically via onAuthStateChanged
      router.push('/');
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw new Error(getFriendlyErrorMessage(error.code) || 'Failed to delete account');
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    deleteUserAccount
  };
}

// Convert Firebase error codes to user-friendly messages
function getFriendlyErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password sign in is not enabled. Please contact support.',
    'auth/weak-password': 'Please choose a stronger password (at least 6 characters).',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
  };

  return messages[code] || 'Something went wrong. Please try again.';
}
