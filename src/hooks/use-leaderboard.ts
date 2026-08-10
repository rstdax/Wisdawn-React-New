import { useQuery } from "@tanstack/react-query";
import {
  getLeaderboard,
  getTopUsersDirectly,
  getUserRank,
  type LeaderboardCategory,
  type LeaderboardEntry,
} from "@/lib/leaderboard";

export function useLeaderboard(
  category: LeaderboardCategory,
  location: string,
  enabled = true
) {
  return useQuery({
    queryKey: ["leaderboard", category, location],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      // Try cached snapshot first
      const snapshot = await getLeaderboard(category, location);
      if (snapshot && snapshot.entries?.length > 0) {
        return snapshot.entries;
      }
      // Fall back to direct Firestore query (no composite index needed)
      return getTopUsersDirectly(category, location);
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useUserRank(
  uid: string | null | undefined,
  category: LeaderboardCategory,
  location: string
) {
  return useQuery({
    queryKey: ["userRank", uid, category, location],
    queryFn: () => getUserRank(uid!, category, location),
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}
