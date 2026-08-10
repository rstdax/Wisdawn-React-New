/**
 * useXP — React Query hook for user XP data.
 * Reads from Firestore user document and caches with React Query.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserXP = {
  total_xp: number;
  school_xp: number;
  coding_xp: number;
  current_streak: number;
  longest_streak: number;
  badges: string[];
};

async function fetchUserXP(uid: string): Promise<UserXP> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) {
    return { total_xp: 0, school_xp: 0, coding_xp: 0, current_streak: 0, longest_streak: 0, badges: [] };
  }
  const d = snap.data();
  return {
    total_xp: d.total_xp ?? d.stats?.xp ?? 0,
    school_xp: d.school_xp ?? 0,
    coding_xp: d.coding_xp ?? 0,
    current_streak: d.current_streak ?? 0,
    longest_streak: d.longest_streak ?? 0,
    badges: (d.badges as string[]) ?? [],
  };
}

export function useXP(uid: string | null | undefined) {
  return useQuery({
    queryKey: ["userXP", uid],
    queryFn: () => fetchUserXP(uid!),
    enabled: !!uid,
    staleTime: 0,           // always consider stale so it refetches after invalidation immediately
    gcTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useInvalidateXP() {
  const qc = useQueryClient();
  return (uid: string) => {
    // Invalidate + immediately refetch so the header updates without delay
    qc.invalidateQueries({ queryKey: ["userXP", uid] });
    qc.refetchQueries({ queryKey: ["userXP", uid] });
    qc.invalidateQueries({ queryKey: ["user", uid] });
    qc.invalidateQueries({ queryKey: ["leaderboard"] });
  };
}
