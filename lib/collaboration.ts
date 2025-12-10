/**
 * REAL-TIME COLLABORATION FEATURES
 * 
 * Enable households to collaborate on energy savings:
 * - Family account with multiple users
 * - Shared dashboard and insights
 * - Real-time presence indicators
 * - Collaborative goal setting
 * - Activity feed (who made changes)
 * - Permission management (admin, member, viewer)
 * - Household challenges and competitions
 * 
 * @module lib/collaboration
 */

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore';
import { analytics } from '@/lib/analytics';
import SmartStorage from '@/lib/storage';

// ============================================
// TYPES
// ============================================

export interface HouseholdMember {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: number;
  lastActive: number;
  isOnline: boolean;
  avatar?: string;
}

export interface Household {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
  members: HouseholdMember[];
  invitations: HouseholdInvitation[];
  settings: HouseholdSettings;
  sharedGoal?: {
    target: number; // £/month target bill
    current: number;
    startDate: number;
    endDate: number;
  };
}

export interface HouseholdInvitation {
  id: string;
  email: string;
  role: 'member' | 'viewer';
  invitedBy: string;
  invitedAt: number;
  status: 'pending' | 'accepted' | 'declined';
  token: string;
}

export interface HouseholdSettings {
  allowMembersToInvite: boolean;
  allowMembersToEditData: boolean;
  shareDetailedUsage: boolean;
  enableActivityFeed: boolean;
  enableChallenges: boolean;
}

export interface Activity {
  id: string;
  householdId: string;
  userId: string;
  userDisplayName: string;
  type: 'data_updated' | 'goal_set' | 'member_joined' | 'achievement' | 'savings_logged';
  description: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'reduce_usage' | 'switch_tariff' | 'complete_profile' | 'upload_bill';
  targetValue: number;
  currentValue: number;
  reward: string;
  startDate: number;
  endDate: number;
  participants: string[]; // user IDs
  completed: boolean;
}

// ============================================
// COLLABORATION MANAGER
// ============================================

export class CollaborationManager {
  private static activeHousehold: string | null = null;
  private static presenceInterval: NodeJS.Timeout | null = null;

  /**
   * Create a new household
   */
  static async createHousehold(
    userId: string,
    name: string,
    userEmail: string,
    userDisplayName: string
  ): Promise<Household> {
    const householdId = this.generateId();

    const household: Household = {
      id: householdId,
      name,
      createdBy: userId,
      createdAt: Date.now(),
      members: [
        {
          userId,
          email: userEmail,
          displayName: userDisplayName,
          role: 'admin',
          joinedAt: Date.now(),
          lastActive: Date.now(),
          isOnline: true,
        },
      ],
      invitations: [],
      settings: {
        allowMembersToInvite: false,
        allowMembersToEditData: true,
        shareDetailedUsage: true,
        enableActivityFeed: true,
        enableChallenges: true,
      },
    };

    // Save to Firestore
    await setDoc(doc(db, 'households', householdId), household);

    // Track analytics
    // Analytics: Household created

    return household;
  }

  /**
   * Invite a member to household
   */
  static async inviteMember(
    householdId: string,
    invitedByUserId: string,
    email: string,
    role: 'member' | 'viewer'
  ): Promise<HouseholdInvitation> {
    const invitation: HouseholdInvitation = {
      id: this.generateId(),
      email,
      role,
      invitedBy: invitedByUserId,
      invitedAt: Date.now(),
      status: 'pending',
      token: this.generateToken(),
    };

    // Add invitation to household
    const householdRef = doc(db, 'households', householdId);
    await updateDoc(householdRef, {
      invitations: arrayUnion(invitation),
    });

    // Send invitation email
    await this.sendInvitationEmail(invitation, householdId);

    // Analytics: Invitation sent

    return invitation;
  }

  /**
   * Accept household invitation
   */
  static async acceptInvitation(
    householdId: string,
    userId: string,
    email: string,
    displayName: string,
    invitationToken: string
  ): Promise<void> {
    const householdRef = doc(db, 'households', householdId);
    const householdDoc = await getDoc(householdRef);

    if (!householdDoc.exists()) {
      throw new Error('Household not found');
    }

    const household = householdDoc.data() as Household;
    const invitation = household.invitations.find(inv => inv.token === invitationToken);

    if (!invitation || invitation.status !== 'pending') {
      throw new Error('Invalid or expired invitation');
    }

    // Add member
    const newMember: HouseholdMember = {
      userId,
      email,
      displayName,
      role: invitation.role,
      joinedAt: Date.now(),
      lastActive: Date.now(),
      isOnline: true,
    };

    await updateDoc(householdRef, {
      members: arrayUnion(newMember),
      invitations: household.invitations.map(inv =>
        inv.id === invitation.id ? { ...inv, status: 'accepted' } : inv
      ),
    });

    // Log activity
    await this.logActivity(householdId, {
      userId,
      userDisplayName: displayName,
      type: 'member_joined',
      description: `${displayName} joined the household`,
      timestamp: Date.now(),
    });

    // Analytics: Invitation accepted
  }

  /**
   * Remove member from household
   */
  static async removeMember(
    householdId: string,
    userId: string,
    removedByUserId: string
  ): Promise<void> {
    const householdRef = doc(db, 'households', householdId);
    const householdDoc = await getDoc(householdRef);

    if (!householdDoc.exists()) return;

    const household = householdDoc.data() as Household;
    const member = household.members.find(m => m.userId === userId);

    if (!member) return;

    // Check permissions
    const remover = household.members.find(m => m.userId === removedByUserId);
    if (!remover || remover.role !== 'admin') {
      throw new Error('Only admins can remove members');
    }

    await updateDoc(householdRef, {
      members: household.members.filter(m => m.userId !== userId),
    });

    // Analytics: Member removed
  }

  /**
   * Set shared household goal
   */
  static async setSharedGoal(
    householdId: string,
    userId: string,
    targetBill: number,
    durationMonths: number
  ): Promise<void> {
    const householdRef = doc(db, 'households', householdId);
    const householdDoc = await getDoc(householdRef);

    if (!householdDoc.exists()) return;

    const household = householdDoc.data() as Household;
    const member = household.members.find(m => m.userId === userId);

    if (!member || (member.role !== 'admin' && member.role !== 'member')) {
      throw new Error('Insufficient permissions');
    }

    const now = Date.now();
    const endDate = now + durationMonths * 30 * 24 * 60 * 60 * 1000;

    await updateDoc(householdRef, {
      sharedGoal: {
        target: targetBill,
        current: 0,
        startDate: now,
        endDate,
      },
    });

    // Log activity
    await this.logActivity(householdId, {
      userId,
      userDisplayName: member.displayName,
      type: 'goal_set',
      description: `Set household goal: £${targetBill}/month for ${durationMonths} months`,
      timestamp: now,
    });

    // Analytics: Goal set
  }

  /**
   * Update member's online presence
   */
  static startPresenceTracking(householdId: string, userId: string): void {
    this.activeHousehold = householdId;

    // Update presence every 30 seconds
    this.presenceInterval = setInterval(async () => {
      const householdRef = doc(db, 'households', householdId);
      const householdDoc = await getDoc(householdRef);

      if (!householdDoc.exists()) return;

      const household = householdDoc.data() as Household;
      const updatedMembers = household.members.map(member =>
        member.userId === userId
          ? { ...member, lastActive: Date.now(), isOnline: true }
          : member
      );

      await updateDoc(householdRef, { members: updatedMembers });
    }, 30000);
  }

  /**
   * Stop presence tracking
   */
  static stopPresenceTracking(householdId: string, userId: string): void {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }

    // Mark as offline
    const householdRef = doc(db, 'households', householdId);
    getDoc(householdRef).then(async (householdDoc) => {
      if (!householdDoc.exists()) return;

      const household = householdDoc.data() as Household;
      const updatedMembers = household.members.map(member =>
        member.userId === userId
          ? { ...member, lastActive: Date.now(), isOnline: false }
          : member
      );

      await updateDoc(householdRef, { members: updatedMembers });
    });
  }

  /**
   * Subscribe to household changes (real-time)
   */
  static subscribeToHousehold(
    householdId: string,
    callback: (household: Household) => void
  ): () => void {
    const householdRef = doc(db, 'households', householdId);

    return onSnapshot(householdRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as Household);
      }
    });
  }

  /**
   * Subscribe to activity feed
   */
  static subscribeToActivity(
    householdId: string,
    callback: (activities: Activity[]) => void
  ): () => void {
    const activitiesRef = collection(db, `households/${householdId}/activities`);

    return onSnapshot(activitiesRef, (snapshot) => {
      const activities = snapshot.docs.map(doc => doc.data() as Activity);
      callback(activities.sort((a, b) => b.timestamp - a.timestamp));
    });
  }

  /**
   * Create household challenge
   */
  static async createChallenge(
    householdId: string,
    challenge: Omit<Challenge, 'id' | 'currentValue' | 'completed'>
  ): Promise<Challenge> {
    const fullChallenge: Challenge = {
      ...challenge,
      id: this.generateId(),
      currentValue: 0,
      completed: false,
    };

    const challengeRef = doc(db, `households/${householdId}/challenges`, fullChallenge.id);
    await setDoc(challengeRef, fullChallenge);

    // Analytics: Challenge created

    return fullChallenge;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private static async logActivity(
    householdId: string,
    activity: Omit<Activity, 'id' | 'householdId'>
  ): Promise<void> {
    const activityId = this.generateId();
    const activityRef = doc(db, `households/${householdId}/activities`, activityId);

    await setDoc(activityRef, {
      ...activity,
      id: activityId,
      householdId,
    });
  }

  private static async sendInvitationEmail(
    invitation: HouseholdInvitation,
    householdId: string
  ): Promise<void> {
    // Send via backend API
    await fetch('/api/households/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitation,
        householdId,
        inviteUrl: `${window.location.origin}/invite/${invitation.token}`,
      }),
    });
  }

  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// ============================================
// REACT HOOKS
// ============================================

export function useHousehold(householdId: string | null) {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    const unsubscribe = CollaborationManager.subscribeToHousehold(
      householdId,
      (data) => {
        setHousehold(data);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [householdId]);

  return { household, loading };
}

export function useActivityFeed(householdId: string | null) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!householdId) return;

    const unsubscribe = CollaborationManager.subscribeToActivity(
      householdId,
      setActivities
    );

    return unsubscribe;
  }, [householdId]);

  return activities;
}

// ============================================
// EXPORTS
// ============================================

export default CollaborationManager;
