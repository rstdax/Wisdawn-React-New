/**
 * XP System
 *
 * Primary path: Firebase Cloud Function (claimContentXP / submitMcqTest)
 * Fallback path: Direct Firestore transaction (used when Functions not deployed)
 *
 * The fallback uses a Firestore transaction with a completedContents record
 * to prevent duplicate claims — same safety guarantee as the Cloud Function.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

// ─── Content type defaults ──────────────────────────────────────────────────

export const CONTENT_XP_DEFAULTS: Record<string, { xp_reward: number; min_read_time_seconds: number }> = {
  video:    { xp_reward: 10, min_read_time_seconds: 120 },
  pdf:      { xp_reward: 2,  min_read_time_seconds: 60  },
  link:     { xp_reward: 5,  min_read_time_seconds: 15  },
  material: { xp_reward: 5,  min_read_time_seconds: 15  },
};

export function getContentDefaults(lessonType?: string) {
  return CONTENT_XP_DEFAULTS[lessonType ?? "video"] ?? CONTENT_XP_DEFAULTS.video;
}

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Session creation ────────────────────────────────────────────────────────

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

// ─── Cloud Function callers ──────────────────────────────────────────────────

const functions = getFunctions(getApp(), "asia-south1");

async function tryCloudFunction<T>(name: string, data: unknown): Promise<T | null> {
  try {
    const fn = httpsCallable<unknown, T>(functions, name);
    const result = await fn(data);
    return result.data;
  } catch (err: any) {
    // functions/not-found means not deployed yet → use fallback
    if (
      err?.code === "functions/not-found" ||
      err?.code === "functions/internal" ||
      err?.code === "functions/unavailable" ||
      String(err?.message).includes("NOT_FOUND") ||
      String(err?.message).includes("not found")
    ) {
      return null; // Signal to use fallback
    }
    throw err; // Other errors (auth, permission) should still throw
  }
}

// ─── Firestore-direct XP claim (fallback when Functions not deployed) ────────

async function claimContentXP_direct(
  uid: string,
  sessionId: string,
  contentId: string
): Promise<ClaimXpResult> {
  const sessionRef    = doc(db, "contentSessions", sessionId);
  const completionRef = doc(db, "users", uid, "completedContents", contentId);
  const contentRef    = doc(db, "chapters", contentId);
  const userRef       = doc(db, "users", uid);

  return runTransaction(db, async (tx) => {
    const [sessionSnap, completionSnap, contentSnap, userSnap] = await Promise.all([
      tx.get(sessionRef),
      tx.get(completionRef),
      tx.get(contentRef),
      tx.get(userRef),
    ]);

    // Duplicate check
    if (completionSnap.exists()) {
      return { success: false, xp_earned: 0, message: "XP already claimed." };
    }
    if (sessionSnap.exists() && sessionSnap.data()?.status === "claimed") {
      return { success: false, xp_earned: 0, message: "XP already claimed." };
    }

    // Determine XP amount
    const content = contentSnap.exists() ? contentSnap.data() : null;
    const lessonType = content?.lessonType ?? "video";
    const defaults = CONTENT_XP_DEFAULTS[lessonType] ?? CONTENT_XP_DEFAULTS.video;
    const xpReward: number = typeof content?.xp_reward === "number"
      ? content.xp_reward
      : defaults.xp_reward;
    const minTime: number = typeof content?.min_read_time_seconds === "number"
      ? content.min_read_time_seconds
      : defaults.min_read_time_seconds;

    // Verify elapsed time from server-side started_at
    const startedAt = sessionSnap.exists()
      ? (sessionSnap.data()?.started_at?.toMillis?.() ?? Date.now())
      : Date.now();
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    if (elapsedSeconds < minTime) {
      return { success: false, xp_earned: 0, message: `Not enough time. Need ${minTime}s.` };
    }

    // Determine category
    const userData = userSnap.exists() ? userSnap.data() : {};
    const currentTotalXP: number = userData.total_xp ?? userData.stats?.xp ?? 0;
    const currentSchoolXP: number = userData.school_xp ?? 0;
    const currentCodingXP: number = userData.coding_xp ?? 0;

    // We need the subject to determine school vs coding
    // Default to school if we can't determine
    const subjectId = content?.subjectId;
    let category: "school" | "coding" = "school";
    if (subjectId) {
      const subjectSnap = await tx.get(doc(db, "subjects", subjectId));
      if (subjectSnap.exists() && subjectSnap.data()?.track === "coding") {
        category = "coding";
      }
    }

    const newTotalXP = currentTotalXP + xpReward;
    const newSchoolXP = category === "school" ? currentSchoolXP + xpReward : currentSchoolXP;
    const newCodingXP = category === "coding" ? currentCodingXP + xpReward : currentCodingXP;

    // Write all atomically
    tx.update(userRef, {
      total_xp: newTotalXP,
      school_xp: newSchoolXP,
      coding_xp: newCodingXP,
      "stats.xp": newTotalXP,
    });

    tx.set(completionRef, {
      content_id: contentId,
      content_type: lessonType,
      completed_at: Timestamp.now(),
      xp_earned: xpReward,
      category,
    });

    if (sessionSnap.exists()) {
      tx.update(sessionRef, { status: "claimed", claimed_at: Timestamp.now() });
    }

    // XP history entry
    const histRef = doc(collection(db, "xp_history"));
    tx.set(histRef, {
      user_uid: uid,
      content_id: contentId,
      content_type: lessonType,
      category,
      xp_earned: xpReward,
      timestamp: Timestamp.now(),
      transaction_type: "content_completion",
    });

    return {
      success: true,
      xp_earned: xpReward,
      new_total_xp: newTotalXP,
      new_badges: [],
      message: "XP awarded.",
    };
  });
}

// ─── Public API: claimContentXP ──────────────────────────────────────────────

export async function claimContentXP(
  sessionId: string,
  contentId: string,
  uid?: string
): Promise<ClaimXpResult> {
  // 1. Try Cloud Function first
  const cfResult = await tryCloudFunction<ClaimXpResult>("claimContentXP", {
    session_id: sessionId,
    content_id: contentId,
  });
  if (cfResult !== null) return cfResult;

  // 2. Cloud Function not deployed → use Firestore-direct fallback
  if (!uid) throw new Error("uid required for direct fallback");
  return claimContentXP_direct(uid, sessionId, contentId);
}

// ─── MCQ Test ────────────────────────────────────────────────────────────────

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

export async function submitMcqTest(
  attemptId: string,
  answers: Record<string, string>,
  uid?: string
): Promise<McqSubmitResult> {
  // Try Cloud Function first
  const cfResult = await tryCloudFunction<McqSubmitResult>("submitMcqTest", {
    attempt_id: attemptId,
    answers,
  });
  if (cfResult !== null) return cfResult;

  // Fallback: direct Firestore scoring
  if (!uid) throw new Error("uid required for direct fallback");
  return submitMcqTest_direct(uid, attemptId, answers);
}

async function submitMcqTest_direct(
  uid: string,
  attemptId: string,
  answers: Record<string, string>
): Promise<McqSubmitResult> {
  const attemptRef = doc(db, "testAttempts", attemptId);
  const userRef    = doc(db, "users", uid);

  const [attemptSnap, userSnap] = await Promise.all([
    getDoc(attemptRef),
    getDoc(userRef),
  ]);

  if (!attemptSnap.exists()) throw new Error("Attempt not found");
  const attempt = attemptSnap.data();
  if (attempt.status === "completed") {
    return { success: false, xp_earned: 0, base_xp: 0, accuracy_bonus: 0, speed_bonus: 0, score_percentage: 0, correct_answers: 0, total_questions: 0, actual_time_seconds: 0, message: "Already submitted." };
  }

  // Load test and questions
  const testSnap = await getDoc(doc(db, "practiceTests", attempt.test_id));
  if (!testSnap.exists()) throw new Error("Test not found");
  const test = testSnap.data();

  const { getDocs } = await import("firebase/firestore");
  const qResult = await getDocs(collection(db, "practiceTests", attempt.test_id, "questions"));
  const questions = qResult.docs.map(d => d.data());

  const totalQuestions = questions.length;
  let correctCount = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctKey) correctCount++;
  }
  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const startedAt = attempt.started_at?.toMillis?.() ?? Date.now();
  const actualTimeSecs = Math.floor((Date.now() - startedAt) / 1000);
  const allowedTimeSecs = test.allowed_time_seconds || (test.durationMinutes || 30) * 60;
  const baseTestXP = test.base_test_xp || 1;

  // XP per question × correct answers (no time bonus)
  const xpPerQuestion = baseTestXP;
  const finalXP = xpPerQuestion * correctCount;
  const baseXP = finalXP;
  const accuracyBonus = 0;
  const speedBonus = 0;

  const category: "school" | "coding" = test.category === "coding" || test.tag === "Coding" ? "coding" : "school";
  const xpField = category === "coding" ? "coding_xp" : "school_xp";

  const userData = userSnap.exists() ? userSnap.data() : {};
  const currentTotal = userData.total_xp ?? userData.stats?.xp ?? 0;
  const newTotal = currentTotal + finalXP;

  await runTransaction(db, async (tx) => {
    tx.update(userRef, {
      total_xp: newTotal,
      [xpField]: increment(finalXP),
      "stats.xp": newTotal,
      tests_completed: increment(1),
    });
    tx.update(attemptRef, {
      status: "completed",
      submitted_at: Timestamp.now(),
      total_questions: totalQuestions,
      correct_answers: correctCount,
      score_percentage: scorePercentage,
      allowed_time_seconds: allowedTimeSecs,
      actual_time_seconds: actualTimeSecs,
      base_xp: baseXP,
      accuracy_bonus: accuracyBonus,
      speed_bonus: speedBonus,
      final_xp: finalXP,
      category,
    });
    const histRef = doc(collection(db, "xp_history"));
    tx.set(histRef, {
      user_uid: uid,
      test_id: attempt.test_id,
      source: "mcq_test",
      category,
      xp_earned: finalXP,
      base_xp: baseXP,
      accuracy_bonus: accuracyBonus,
      speed_bonus: speedBonus,
      score_percentage: scorePercentage,
      timestamp: Timestamp.now(),
      transaction_type: "test_completion",
    });
  });

  return { success: true, xp_earned: finalXP, base_xp: baseXP, accuracy_bonus: accuracyBonus, speed_bonus: speedBonus, score_percentage: scorePercentage, correct_answers: correctCount, total_questions: totalQuestions, actual_time_seconds: actualTimeSecs, new_total_xp: newTotal, new_badges: [], message: "Test submitted." };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
