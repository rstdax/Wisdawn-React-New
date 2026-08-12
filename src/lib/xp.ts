/**
 * XP System — Production
 *
 * ALL XP is awarded ONLY through Firebase Cloud Functions.
 * No direct Firestore XP writes from the client.
 * If Cloud Functions are unavailable, XP is NOT awarded (fail secure).
 *
 * The frontend timer only decides WHEN to attempt the claim — the
 * Cloud Function is the sole authority that grants XP, verifies time,
 * scores tests, and awards badges server-side.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

// ─── Content type defaults (UI only — server enforces its own) ───────────────

export const CONTENT_XP_DEFAULTS: Record<string, { xp_reward: number; min_read_time_seconds: number }> = {
  video:    { xp_reward: 10, min_read_time_seconds: 120 },
  pdf:      { xp_reward: 2,  min_read_time_seconds: 60  },
  link:     { xp_reward: 5,  min_read_time_seconds: 15  },
  material: { xp_reward: 5,  min_read_time_seconds: 15  },
};

export function getContentDefaults(lessonType?: string) {
  return CONTENT_XP_DEFAULTS[lessonType ?? "video"] ?? CONTENT_XP_DEFAULTS.video;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ClaimXpResult = {
  success: boolean;
  xp_earned: number;
  message: string;
  new_total_xp?: number;
  new_badges?: string[];
};

export type McqSubmitResult = {
  success: boolean;
  xp_earned: number;
  base_xp: number;
  accuracy_bonus: number;
  speed_bonus: number;
  score_percentage: number;
  correct_answers: number;
  total_questions: number;
  actual_time_seconds: number;
  message: string;
  new_total_xp?: number;
  new_badges?: string[];
};

export type ContentSession = {
  session_id: string;
  content_id: string;
  content_type: string;
  user_uid: string;
  started_at: Timestamp;
};

// ─── Cloud Functions instance ─────────────────────────────────────────────────

const functions = getFunctions(getApp(), "asia-south1");

// ─── Session creation ─────────────────────────────────────────────────────────

export async function createContentSession(
  uid: string,
  contentId: string,
  contentType: string
): Promise<string> {
  const ref = await addDoc(collection(db, "contentSessions"), {
    user_uid: uid,
    content_id: contentId,
    content_type: contentType,
    started_at: serverTimestamp(),
    status: "active",
  });
  return ref.id;
}

// ─── Content XP — Cloud Function ONLY (fail secure) ───────────────────────────

export async function claimContentXP(
  sessionId: string,
  contentId: string
): Promise<ClaimXpResult> {
  const fn = httpsCallable<{ session_id: string; content_id: string }, ClaimXpResult>(
    functions, "claimContentXP"
  );
  const result = await fn({ session_id: sessionId, content_id: contentId });
  return result.data;
}

// ─── MCQ Test Attempt creation ────────────────────────────────────────────────

export async function createTestAttempt(
  uid: string,
  testId: string
): Promise<string> {
  const ref = await addDoc(collection(db, "testAttempts"), {
    user_uid: uid,
    test_id: testId,
    started_at: serverTimestamp(),
    status: "in_progress",
  });
  return ref.id;
}

// ─── MCQ Test Submit — Cloud Function ONLY (fail secure) ─────────────────────

export async function submitMcqTest(
  attemptId: string,
  answers: Record<string, string>
): Promise<McqSubmitResult> {
  const fn = httpsCallable<{ attempt_id: string; answers: Record<string, string> }, McqSubmitResult>(
    functions, "submitMcqTest"
  );
  const result = await fn({ attempt_id: attemptId, answers });
  return result.data;
}

// ─── Helpers (read-only) ──────────────────────────────────────────────────────

export async function isContentCompleted(uid: string, contentId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", uid, "completedContents", contentId));
  return snap.exists();
}

export async function getUserXP(uid: string): Promise<{ total_xp: number; school_xp: number; coding_xp: number }> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return { total_xp: 0, school_xp: 0, coding_xp: 0 };
  const d = snap.data();
  return {
    total_xp: d.total_xp ?? d.stats?.xp ?? 0,
    school_xp: d.school_xp ?? 0,
    coding_xp: d.coding_xp ?? 0,
  };
}
