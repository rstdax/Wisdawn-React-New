/**
 * Leaderboard
 * - Reads from pre-computed snapshots (updated by Cloud Functions every 10 min)
 * - Falls back to direct queries with correct per-category sorting
 * - getUserRank filters by actual state/district of the current user
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
    const snap = await getDoc(doc(db, "leaderboards", leaderboardId(category, location)));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as LeaderboardSnapshot;
  } catch {
    return null;
  }
}

/**
 * Get user rank — properly filtered by state or district.
 * Counts users with MORE XP than current user in the same location.
 */
export async function getUserRank(
  uid: string,
  category: LeaderboardCategory,
  location: string
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
    const userState: string = userData.state ?? "Assam";
    const userDistrict: string = userData.district ?? "";

    // Determine if location is state-level or district-level
    const isStateLevel = location === "assam" ||
      location === userState.toLowerCase().replace(/\s+/g, "_");

    let countQuery;
    if (isStateLevel) {
      countQuery = query(
        collection(db, "users"),
        where("state", "==", userState),
        where(xpField, ">", myXP)
      );
    } else {
      // District-level: filter by that specific district
      const districtName = location.replace(/_/g, " ");
      countQuery = query(
        collection(db, "users"),
        where("district", "==", districtName),
        where(xpField, ">", myXP)
      );
    }

    try {
      const countSnap = await getCountFromServer(countQuery);
      return countSnap.data().count + 1;
    } catch {
      const snap = await getDocs(countQuery);
      return snap.size + 1;
    }
  } catch {
    return null;
  }
}

/**
 * Fallback: fetch top users per category with correct field ordering.
 * Each category uses its own XP field — NOT derived from overall top users.
 */
export async function getTopUsersDirectly(
  category: LeaderboardCategory,
  location: string,
  limitCount = 50
): Promise<LeaderboardEntry[]> {
  const xpField =
    category === "school" ? "school_xp" :
    category === "coding" ? "coding_xp" :
    "total_xp";

  try {
    // Try with state filter + correct XP field
    const isDistrict = location !== "assam" && !location.includes("assam");
    let q;

    if (isDistrict) {
      const districtName = location.replace(/_/g, " ");
      q = query(
        collection(db, "users"),
        where("district", "==", districtName),
        orderBy(xpField, "desc"),
        limit(limitCount)
      );
    } else {
      // State level — try with state filter
      q = query(
        collection(db, "users"),
        where("state", "==", "Assam"),
        orderBy(xpField, "desc"),
        limit(limitCount)
      );
    }

    const snap = await getDocs(q);
    return snap.docs.map((d, idx) => {
      const data = d.data();
      return {
        uid: d.id,
        name: data.name ?? "Learner",
        district: data.district ?? "",
        state: data.state ?? "Assam",
        total_xp: data.total_xp ?? data.stats?.xp ?? 0,
        school_xp: data.school_xp ?? 0,
        coding_xp: data.coding_xp ?? 0,
        rank: idx + 1,
      } as LeaderboardEntry;
    });
  } catch {
    // Final fallback: no location filter, correct XP field sort
    try {
      const q2 = query(
        collection(db, "users"),
        orderBy(xpField, "desc"),
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
          total_xp: data.total_xp ?? data.stats?.xp ?? 0,
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
