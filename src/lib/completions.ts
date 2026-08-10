/**
 * Completion tracking — read-only helpers for checking what content
 * a user has already completed (used to show completion UI).
 * Writing completions is done server-side in Cloud Functions.
 */

import { collection, doc, getDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";

export type CompletedContent = {
  content_id: string;
  content_type: string;
  completed_at: number;
  xp_earned: number;
};

export type XpHistoryEntry = {
  user_uid: string;
  content_id?: string;
  test_id?: string;
  content_type?: string;
  category: "school" | "coding";
  xp_earned: number;
  timestamp: number;
  transaction_type: "content_completion" | "test_completion" | "badge_bonus" | "practice_activity";
  // MCQ fields
  base_xp?: number;
  accuracy_bonus?: number;
  speed_bonus?: number;
  score_percentage?: number;
};

export async function getCompletedContent(
  uid: string,
  contentId: string
): Promise<CompletedContent | null> {
  const snap = await getDoc(doc(db, "users", uid, "completedContents", contentId));
  if (!snap.exists()) return null;
  return snap.data() as CompletedContent;
}

export async function getXpHistory(
  uid: string,
  limitCount = 20
): Promise<XpHistoryEntry[]> {
  const snap = await getDocs(
    query(
      collection(db, "xp_history"),
      // We don't have a composite query here — just order by timestamp desc
      // The Cloud Function writes to this top-level collection with user_uid field
      orderBy("timestamp", "desc"),
      limit(limitCount)
    )
  );
  return snap.docs
    .map((d) => d.data() as XpHistoryEntry)
    .filter((e) => e.user_uid === uid);
}

export async function getUserEarnedBadges(uid: string): Promise<string[]> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return [];
  const data = snap.data();
  return (data.badges as string[]) ?? [];
}
