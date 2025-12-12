import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile } from '@/lib/userProfile';
import type { UserSavingsProfile } from '@/types/UserSavingsProfile';

/**
 * Returns the canonical UserSavingsProfile for the current user.
 * - If signed in: loads from Firestore (server profile)
 * - If signed out: falls back to localStorage onboarding profile
 */
export function useUserSavingsProfile(): {
  profile: UserSavingsProfile | null;
  loading: boolean;
} {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserSavingsProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      if (user) {
        // Prefer server profile
        try {
          const serverProfile = await getUserProfile(user.uid);
          if (serverProfile?.savingsProfileV1) {
            setProfile(serverProfile.savingsProfileV1);
            setLoading(false);
            return;
          }
        } catch (err) {
          // Fallback to local if server fails
        }
      }
      // Fallback: localStorage
      const local = localStorage.getItem('userSavingsProfile') || localStorage.getItem('userHomeData');
      if (local) {
        try {
          setProfile(JSON.parse(local));
        } catch {}
      }
      setLoading(false);
    }
    loadProfile();
    // Re-run if user changes
  }, [user]);

  return { profile, loading };
}
