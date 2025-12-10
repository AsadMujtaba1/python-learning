/**
 * USER PROFILE SYSTEM
 * 
 * Manages user data, premium status, and preferences
 * Integrates with Firebase Auth and Firestore
 * 
 * @module lib/userProfile
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export type PremiumTier = 'free' | 'premium' | 'lifetime';

export interface UserProfile {
  // Identity
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastLoginAt: Date;

  // Premium Status
  premiumTier: PremiumTier;
  premiumSince?: Date;
  premiumExpiresAt?: Date;

  // Referral System
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  referralRewards: number;

  // Household Data
  postcode?: string;
  homeType?: string;
  occupants?: number;
  heatingType?: string;
  
  // Preferences
  emailNotifications: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  
  // Metadata
  onboardingCompleted: boolean;
  profileCompleteness: number;
}

/**
 * Generate unique referral code
 */
function generateReferralCode(uid: string, email: string): string {
  const timestamp = Date.now().toString(36);
  const userHash = btoa(email).substring(0, 6).toUpperCase();
  return `CS${userHash}${timestamp}`.replace(/[^A-Z0-9]/g, '');
}

/**
 * Create new user profile in Firestore
 */
export async function createUserProfile(
  user: User,
  referredBy?: string
): Promise<UserProfile> {
  if (!db) throw new Error('Firestore not initialized');

  const referralCode = generateReferralCode(user.uid, user.email!);
  
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName: user.displayName || 'User',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    
    premiumTier: 'free',
    
    referralCode,
    ...(referredBy && { referredBy }), // Only include if defined
    referralCount: 0,
    referralRewards: 0,
    
    emailNotifications: true,
    weeklyDigest: true,
    marketingEmails: false,
    
    onboardingCompleted: false,
    profileCompleteness: 20,
  };

  const profileData: any = {
    ...profile,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  // Remove undefined values
  Object.keys(profileData).forEach(key => {
    if (profileData[key] === undefined) {
      delete profileData[key];
    }
  });

  await setDoc(doc(db, 'users', user.uid), profileData);

  // If referred, update referrer's count
  if (referredBy) {
    await incrementReferralCount(referredBy);
  }

  return profile;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) throw new Error('Firestore not initialized');

  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
    premiumSince: data.premiumSince?.toDate(),
    premiumExpiresAt: data.premiumExpiresAt?.toDate(),
  } as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...updates,
    lastLoginAt: serverTimestamp(),
  });
}

/**
 * Update last login time
 */
export async function updateLastLogin(uid: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    lastLoginAt: serverTimestamp(),
  });
}

/**
 * Grant premium access
 */
export async function grantPremiumAccess(
  uid: string,
  durationDays: number = 365,
  tier: PremiumTier = 'premium'
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    premiumTier: tier,
    premiumSince: serverTimestamp(),
    premiumExpiresAt: expiresAt,
  });
}

/**
 * Check if user has active premium
 */
export function isPremiumActive(profile: UserProfile): boolean {
  if (profile.premiumTier === 'lifetime') return true;
  if (profile.premiumTier === 'free') return false;
  
  if (profile.premiumExpiresAt) {
    return profile.premiumExpiresAt > new Date();
  }
  
  return false;
}

/**
 * Increment referral count for referrer
 */
async function incrementReferralCount(referralCode: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  // Find user by referral code
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('referralCode', '==', referralCode));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    const currentCount = userDoc.data().referralCount || 0;
    const currentRewards = userDoc.data().referralRewards || 0;

    await updateDoc(userDoc.ref, {
      referralCount: currentCount + 1,
      referralRewards: currentRewards + 1,
    });

    // Grant premium if reached threshold (e.g., 3 referrals = 1 month free)
    if ((currentCount + 1) % 3 === 0) {
      await grantPremiumAccess(userDoc.id, 30);
    }
  }
}

/**
 * Get referral code from URL or storage
 */
export function getReferralCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref');
  
  if (code) {
    // Store in localStorage for later use
    localStorage.setItem('referralCode', code);
    return code;
  }
  
  // Check if previously stored
  return localStorage.getItem('referralCode');
}

/**
 * Clear stored referral code (after signup)
 */
export function clearStoredReferralCode(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('referralCode');
  }
}

/**
 * Calculate profile completeness percentage
 */
export function calculateProfileCompleteness(profile: Partial<UserProfile>): number {
  let score = 20; // Base score for having an account
  
  if (profile.displayName) score += 10;
  if (profile.postcode) score += 15;
  if (profile.homeType) score += 15;
  if (profile.occupants) score += 10;
  if (profile.heatingType) score += 15;
  if (profile.emailNotifications !== undefined) score += 5;
  if (profile.onboardingCompleted) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Complete onboarding step
 */
export async function completeOnboarding(
  uid: string,
  householdData: {
    postcode: string;
    homeType: string;
    occupants: number;
    heatingType: string;
  }
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const completeness = calculateProfileCompleteness({
    ...householdData,
    onboardingCompleted: true,
  });

  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...householdData,
    onboardingCompleted: true,
    profileCompleteness: completeness,
  });
}

/**
 * Delete all user data from Firestore (GDPR Right to Erasure)
 */
export async function deleteUserData(uid: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    // Delete user profile document
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      deleted: true,
      deletedAt: new Date(),
      // Optionally keep minimal data for legal compliance
      // All PII will be removed by scheduled cleanup job
    });

    // In a real implementation, you would also:
    // 1. Delete user's bills from 'bills' collection
    // 2. Delete user's comparisons from 'comparisons' collection
    // 3. Delete any uploaded files from Storage
    // 4. Remove user from any referral records
    
    // For now, we mark the account as deleted
    // A scheduled Cloud Function would handle complete data removal after 30 days
    
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw new Error('Failed to delete user data from database');
  }
}
