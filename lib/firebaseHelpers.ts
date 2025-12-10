/**
 * Firebase Helper Functions
 * 
 * Reusable functions for interacting with Firestore
 * Handles user data, analysis results, and preferences
 */

import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { UserHomeData } from '@/types';

// ============================
// USER DOCUMENT OPERATIONS
// ============================

/**
 * Save user home details to Firestore
 */
export async function saveUserHomeData(userId: string, homeData: UserHomeData) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...homeData,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving user home data:', error);
    return { success: false, error };
  }
}

/**
 * Get user home details from Firestore
 */
export async function getUserHomeData(userId: string): Promise<UserHomeData | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserHomeData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user home data:', error);
    return null;
  }
}

/**
 * Update specific user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<{
    electricityRate: number;
    gasRate: number;
    insulationLevel: 'poor' | 'average' | 'good';
    notifications: boolean;
  }>
) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { success: false, error };
  }
}

// ============================
// ANALYSIS RESULTS STORAGE
// ============================

interface AnalysisResult {
  date: string;
  dailyCost: number;
  heatingCost: number;
  electricityCost: number;
  temperature: number;
  savingTips: string[];
}

/**
 * Save daily analysis results
 */
export async function saveAnalysisResult(userId: string, analysis: AnalysisResult) {
  try {
    const analysisRef = doc(db, 'users', userId, 'analyses', analysis.date);
    await setDoc(analysisRef, {
      ...analysis,
      timestamp: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving analysis result:', error);
    return { success: false, error };
  }
}

/**
 * Get analysis history for a user
 */
export async function getAnalysisHistory(userId: string, days: number = 30) {
  try {
    // In production, use query with orderBy and limit
    // For now, return empty array as placeholder
    return [];
  } catch (error) {
    console.error('Error getting analysis history:', error);
    return [];
  }
}

// ============================
// WEEKLY/MONTHLY AGGREGATES
// ============================

interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalCost: number;
  averageDailyCost: number;
  efficiencyScore: number;
}

/**
 * Save weekly summary
 */
export async function saveWeeklySummary(userId: string, summary: WeeklySummary) {
  try {
    const summaryRef = doc(db, 'users', userId, 'weekly_summaries', summary.weekStart);
    await setDoc(summaryRef, {
      ...summary,
      timestamp: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving weekly summary:', error);
    return { success: false, error };
  }
}

// ============================
// ANONYMOUS USER SUPPORT
// ============================

/**
 * Generate anonymous user ID
 * For MVP without authentication
 */
export function generateAnonymousUserId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if user ID exists in Firestore
 */
export async function userExists(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}
