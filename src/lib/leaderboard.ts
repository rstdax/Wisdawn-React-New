/**
 * Leaderboard — reads from pre-computed leaderboard snapshot documents.
 * Cloud Functions update these snapshots every ~10 minutes.
 * For users not in the top-50, we calculate individual rank via a count query.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";

export type LeaderboardCategory = "all" | "school" | "coding";
export type LeaderboardLocation = "assam" | string;

export type LeaderboardEntry = {
  uid: string;
  name: string;
  district: string;
  state: string;
  total_xp: number;
  school_xp: number;
  coding_xp: number;
  rank: number;
  photoURL?: string;
};

export type LeaderboardSnapshot = {
  id: string;
  entries: LeaderboardEntry[];
  updated_at: number;
  location: string;
  category: LeaderboardCategory;
};

export function leaderboardId(category: LeaderboardCategory, location: string): string {
  return `${location}_${category}`;
}

export async function getLeaderboard(
  category: LeaderboardCategory,
  location: string
): Promise<LeaderboardSnapshot | null> {
  try {
    const id = leaderboardId(category, location);
    const snap = await getDoc(doc(db, "leaderboards", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as LeaderboardSnapshot;
  } catch {
    return null;
  }
}

export async function getUserRank(
  uid: string,
  category: LeaderboardCategory,
  _location: string
): Promise<number | null> {
  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) return null;
    const userData = userSnap.data();

    const xpField =
      category === "school" ? "school_xp" :
      category === "coding" ? "coding_xp" :
      "total_xp";
    const myXP: number = userData[xpField] ?? userData.stats?.xp ?? 0;

    // Simple count: how many users have more XP than me?
    const baseQuery = query(
      collection(db, "users"),
      where(xpField, ">", myXP)
    );

    try {
      const countSnap = await getCountFromServer(baseQuery);
      return countSnap.data().count + 1;
    } catch {
      const snap = await getDocs(baseQuery);
      return snap.size + 1;
    }
  } catch {
    return null;
  }
}

/** Fallback: fetch top users directly — no composite index needed */
export async function getTopUsersDirectly(
  category: LeaderboardCategory,
  _location: string,
  limitCount = 50
): Promise<LeaderboardEntry[]> {
  try {
    // Always order by total_xp (guaranteed to exist on all users via stats.xp)
    // For school/coding tabs we sort client-side after fetch
    const q = query(
      collection(db, "users"),
      orderBy("total_xp", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const users = snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        name: data.name ?? "Learner",
        district: data.district ?? "",
        state: data.state ?? "Assam",
        total_xp: data.total_xp ?? data.stats?.xp ?? 0,
        school_xp: data.school_xp ?? 0,
        coding_xp: data.coding_xp ?? 0,
      };
    });

    // Client-side sort for school/coding tabs
    const xpField =
      category === "school" ? "school_xp" :
      category === "coding" ? "coding_xp" :
      "total_xp";

    const sorted = users
      .sort((a, b) => b[xpField] - a[xpField])
      .map((u, idx) => ({ ...u, rank: idx + 1 } as LeaderboardEntry));

    return sorted;
  } catch (err) {
    console.error("[leaderboard] direct query failed:", err);

    // Last resort: try stats.xp field (old schema)
    try {
      const q2 = query(
        collection(db, "users"),
        orderBy("stats.xp", "desc"),
        limit(limitCount)
      );
      const snap2 = await getDocs(q2);
      return snap2.docs.map((d, idx) => {
        const data = d.data();
        return {
          uid: d.id,
          name: data.name ?? "Learner",
          district: data.district ?? "",
          state: data.state ?? "Assam",
          total_xp: data.stats?.xp ?? 0,
          school_xp: data.school_xp ?? 0,
          coding_xp: data.coding_xp ?? 0,
          rank: idx + 1,
        } as LeaderboardEntry;
      });
    } catch {
      return [];
    }
  }
}
