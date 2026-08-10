/**
 * useBadges — React Query hook for user earned badges.
 */

import { useQuery } from "@tanstack/react-query";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getBadgesByIds, type BadgeDefinition } from "@/lib/badges";

async function fetchUserBadges(uid: string): Promise<BadgeDefinition[]> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return [];
  const data = snap.data();
  const badgeIds: string[] = (data.badges as string[]) ?? [];
  return getBadgesByIds(badgeIds);
}

export function useBadges(uid: string | null | undefined) {
  return useQuery({
    queryKey: ["badges", uid],
    queryFn: () => fetchUserBadges(uid!),
    enabled: !!uid,
    staleTime: 60 * 1000,
  });
}
