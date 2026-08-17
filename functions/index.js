/* eslint-disable */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// ─── Badge definitions (server-side — kept in sync with src/lib/badges.ts) ───
const BADGE_DEFINITIONS = [
  // XP Milestones
  { id: "novice_explorer",    xp_bonus: 0,  check: (s) => s.total_xp >= 100 },
  { id: "rising_scholar",     xp_bonus: 10, check: (s) => s.total_xp >= 1000 },
  { id: "knowledge_seeker",   xp_bonus: 20, check: (s) => s.total_xp >= 2500 },
  { id: "master_mind",        xp_bonus: 30, check: (s) => s.total_xp >= 5000 },
  { id: "state_legend",       xp_bonus: 50, check: (s) => s.total_xp >= 10000 },
  // PDF / Material
  { id: "first_page_turned",  xp_bonus: 5,  check: (s) => s.pdf_material_count >= 1 },
  { id: "avid_reader",        xp_bonus: 10, check: (s) => s.pdf_material_count >= 10 },
  { id: "library_worm",       xp_bonus: 20, check: (s) => s.pdf_material_count >= 50 },
  { id: "deep_focus",         xp_bonus: 15, check: (s) => s.deep_focus_count >= 5 },
  // Video
  { id: "first_frame",        xp_bonus: 5,  check: (s) => s.video_count >= 1 },
  { id: "binge_learner",      xp_bonus: 10, check: (s) => s.video_count >= 10 },
  { id: "visual_master",      xp_bonus: 20, check: (s) => s.video_count >= 30 },
  // Tests
  { id: "test_taker",         xp_bonus: 5,  check: (s) => s.tests_completed >= 1 },
  { id: "bullseye",           xp_bonus: 15, check: (s) => s.has_perfect_score === true },
  { id: "speed_demon",        xp_bonus: 10, check: (s) => s.has_speed_demon === true },
  { id: "test_titan",         xp_bonus: 25, check: (s) => s.tests_completed >= 15 && s.avg_score >= 80 },
  // Subject Mastery
  { id: "chemistry_catalyst", xp_bonus: 40, check: (s) => s.chemistry_completed === true },
  { id: "code_cadet",         xp_bonus: 15, check: (s) => s.coding_tests_completed >= 5 },
  { id: "code_master",        xp_bonus: 30, check: (s) => s.coding_xp >= 2000 },
  // Consistency
  { id: "streak_starter",     xp_bonus: 5,  check: (s) => s.current_streak >= 3 },
  { id: "unstoppable",        xp_bonus: 15, check: (s) => s.current_streak >= 7 },
  { id: "night_owl",          xp_bonus: 5,  check: (s) => s.is_night_activity === true },
];

// ─── Content XP defaults ─────────────────────────────────────────────────────
const CONTENT_DEFAULTS = {
  video:    { xp_reward: 10, min_read_time_seconds: 120 },
  pdf:      { xp_reward: 2,  min_read_time_seconds: 60  },
  link:     { xp_reward: 5,  min_read_time_seconds: 15  },
  material: { xp_reward: 5,  min_read_time_seconds: 15  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isNightActivity(ts) {
  // Asia/Kolkata offset: UTC+5:30
  const istMs = ts + (5 * 60 + 30) * 60 * 1000;
  const istDate = new Date(istMs);
  const h = istDate.getUTCHours();
  // 22:00–23:59 or 00:00–03:59
  return h >= 22 || h < 4;
}

function todayISTString(ts) {
  const istMs = ts + (5 * 60 + 30) * 60 * 1000;
  const d = new Date(istMs);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

async function checkAndAwardBadges(tx, userRef, userData, extraFlags = {}) {
  const currentBadges = new Set(userData.badges || []);
  const newBadges = [];

  const stats = {
    total_xp:              userData.total_xp || 0,
    school_xp:             userData.school_xp || 0,
    coding_xp:             userData.coding_xp || 0,
    pdf_material_count:    userData.pdf_material_count || 0,
    deep_focus_count:      userData.deep_focus_count || 0,
    video_count:           userData.video_count || 0,
    tests_completed:       userData.tests_completed || 0,
    avg_score:             userData.avg_score || 0,
    has_perfect_score:     userData.has_perfect_score || false,
    has_speed_demon:       userData.has_speed_demon || false,
    chemistry_completed:   userData.chemistry_completed || false,
    coding_tests_completed: userData.coding_tests_completed || 0,
    current_streak:        userData.current_streak || 0,
    is_night_activity:     false,
    ...extraFlags,
  };

  let totalBonusXP = 0;
  for (const badge of BADGE_DEFINITIONS) {
    if (!currentBadges.has(badge.id) && badge.check(stats)) {
      newBadges.push(badge.id);
      currentBadges.add(badge.id);
      totalBonusXP += badge.xp_bonus;
    }
  }

  if (newBadges.length > 0) {
    tx.set(userRef, {
      badges: Array.from(currentBadges),
      "stats.badges": Array.from(currentBadges).length,
    }, { merge: true });
  }

  return { newBadges, totalBonusXP };
}

async function updateStreak(tx, userRef, userData, nowTs) {
  const todayStr = todayISTString(nowTs);
  const lastDate = userData.last_study_date || "";

  if (lastDate === todayStr) {
    // Already counted today
    return userData.current_streak || 0;
  }

  // Check if yesterday
  const yesterdayMs = nowTs - (5 * 60 + 30) * 60 * 1000 - 86400000;
  const yesterdayStr = todayISTString(yesterdayMs + (5 * 60 + 30) * 60 * 1000);

  let newStreak;
  if (lastDate === yesterdayStr) {
    newStreak = (userData.current_streak || 0) + 1;
  } else if (!lastDate) {
    newStreak = 1;
  } else {
    newStreak = 1; // streak broken
  }

  const newLongest = Math.max(userData.longest_streak || 0, newStreak);

  // Use set with merge so it works even if fields don't exist yet
  tx.set(userRef, {
    current_streak: newStreak,
    longest_streak: newLongest,
    last_study_date: todayStr,
  }, { merge: true });

  return newStreak;
}


// ─── claimContentXP ──────────────────────────────────────────────────────────
exports.claimContentXP = onCall({ region: "asia-south1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");
  const uid = request.auth.uid;
  const { session_id, content_id } = request.data;
  if (!session_id || !content_id) throw new HttpsError("invalid-argument", "Missing session_id or content_id.");

  const sessionRef = db.doc(`contentSessions/${session_id}`);
  const chapterRef = db.doc(`chapters/${content_id}`);
  const lessonRef  = db.doc(`lessons/${content_id}`);
  const userRef    = db.doc(`users/${uid}`);
  const completionRef = db.doc(`users/${uid}/completedContents/${content_id}`);

  return db.runTransaction(async (tx) => {
    const [sessionSnap, chapterSnap, lessonSnap, userSnap, completionSnap] = await Promise.all([
      tx.get(sessionRef),
      tx.get(chapterRef),
      tx.get(lessonRef),
      tx.get(userRef),
      tx.get(completionRef),
    ]);

    // Validate session
    if (!sessionSnap.exists) throw new HttpsError("not-found", "Session not found.");
    const session = sessionSnap.data();
    if (session.user_uid !== uid) throw new HttpsError("permission-denied", "Session does not belong to user.");
    if (session.status === "claimed") {
      return { success: false, xp_earned: 0, message: "XP already claimed." };
    }

    // Check duplicate completion
    if (completionSnap.exists) {
      return { success: false, xp_earned: 0, message: "XP already claimed." };
    }

    // Validate content from chapter or lesson doc or fallback to session data
    const content = chapterSnap.exists ? chapterSnap.data() : (lessonSnap.exists ? lessonSnap.data() : {});
    const lessonType = content.lessonType || content.type || session.content_type || "video";
    const defaults = CONTENT_DEFAULTS[lessonType] || CONTENT_DEFAULTS.video;
    const xpReward = typeof content.xp_reward === "number" ? content.xp_reward : defaults.xp_reward;
    const minTime  = typeof content.min_read_time_seconds === "number" ? content.min_read_time_seconds : defaults.min_read_time_seconds;

    // Verify elapsed time using server-side started_at
    const startedAt = session.started_at?.toMillis ? session.started_at.toMillis() : Date.now();
    const nowTs = Date.now();
    // Reject future timestamps (anti-cheat)
    if (startedAt > nowTs + 30000) {
      throw new HttpsError("failed-precondition", "Invalid session start time.");
    }
    const elapsedSeconds = Math.floor((nowTs - startedAt) / 1000);
    if (elapsedSeconds < minTime) {
      throw new HttpsError("failed-precondition", `Minimum time not reached. Need ${minTime}s, got ${elapsedSeconds}s.`);
    }

    // Determine category from subject
    const subjectSnap = content.subjectId ? await db.doc(`subjects/${content.subjectId}`).get() : null;
    const category = subjectSnap?.data()?.track === "coding" ? "coding" : "school";
    const xpField = category === "coding" ? "coding_xp" : "school_xp";

    const userData = userSnap.data() || {};

    // Streak
    const newStreak = await updateStreak(tx, userRef, userData, nowTs);

    // Update user XP
    const newTotalXP  = (userData.total_xp  || userData.stats?.xp || 0) + xpReward;
    const newCatXP    = (userData[xpField]   || 0) + xpReward;

    // Determine pdf/video count for badges
    const isPdfMaterial = lessonType === "pdf" || lessonType === "link" || lessonType === "material";
    const isVideo = lessonType === "video";
    const isDeepFocus = isPdfMaterial && minTime >= 300;

    tx.update(userRef, {
      total_xp:  newTotalXP,
      [xpField]: newCatXP,
      "stats.xp": newTotalXP,
      pdf_material_count: FieldValue.increment(isPdfMaterial ? 1 : 0),
      video_count:        FieldValue.increment(isVideo ? 1 : 0),
      deep_focus_count:   FieldValue.increment(isDeepFocus ? 1 : 0),
    });

    // Mark session claimed
    tx.update(sessionRef, { status: "claimed", claimed_at: Timestamp.now() });

    // Write completion record
    tx.set(completionRef, {
      content_id,
      content_type: lessonType,
      completed_at: Timestamp.now(),
      xp_earned: xpReward,
      category,
    });

    // XP history
    const histRef = db.collection("xp_history").doc();
    tx.set(histRef, {
      user_uid: uid,
      content_id,
      content_type: lessonType,
      category,
      xp_earned: xpReward,
      timestamp: Timestamp.now(),
      transaction_type: "content_completion",
    });

    // Check badges
    const updatedUserData = {
      ...userData,
      total_xp: newTotalXP,
      [xpField]: newCatXP,
      pdf_material_count: (userData.pdf_material_count || 0) + (isPdfMaterial ? 1 : 0),
      video_count:        (userData.video_count || 0) + (isVideo ? 1 : 0),
      deep_focus_count:   (userData.deep_focus_count || 0) + (isDeepFocus ? 1 : 0),
      current_streak:     newStreak,
      coding_xp:          category === "coding" ? newCatXP : (userData.coding_xp || 0),
    };
    const nightFlag = { is_night_activity: isNightActivity(nowTs) };
    const { newBadges, totalBonusXP } = await checkAndAwardBadges(tx, userRef, updatedUserData, nightFlag);

    // Award badge XP bonus
    if (totalBonusXP > 0) {
      tx.set(userRef, {
        total_xp: FieldValue.increment(totalBonusXP),
        "stats.xp": FieldValue.increment(totalBonusXP),
        [xpField]: FieldValue.increment(totalBonusXP),
      }, { merge: true });
      // Write one xp_history entry per badge with badge_id and source="badge"
      for (const badgeId of newBadges) {
        const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
        if (badgeDef && badgeDef.xp_bonus > 0) {
          const bonusRef = db.collection("xp_history").doc();
          tx.set(bonusRef, {
            user_uid: uid,
            category,
            xp_earned: badgeDef.xp_bonus,
            source: "badge",
            badge_id: badgeId,
            timestamp: Timestamp.now(),
            transaction_type: "badge_bonus",
          });
        }
      }
    }

    return {
      success: true,
      xp_earned: xpReward,
      new_total_xp: newTotalXP + totalBonusXP,
      new_badges: newBadges,
      message: "XP awarded.",
    };
  });
});


// ─── submitMcqTest ────────────────────────────────────────────────────────────
exports.submitMcqTest = onCall({ region: "asia-south1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");
  const uid = request.auth.uid;
  const { attempt_id, answers } = request.data;
  if (!attempt_id || !answers) throw new HttpsError("invalid-argument", "Missing attempt_id or answers.");

  const attemptRef = db.doc(`testAttempts/${attempt_id}`);
  const userRef    = db.doc(`users/${uid}`);

  return db.runTransaction(async (tx) => {
    const [attemptSnap, userSnap] = await Promise.all([tx.get(attemptRef), tx.get(userRef)]);

    if (!attemptSnap.exists) throw new HttpsError("not-found", "Attempt not found.");
    const attempt = attemptSnap.data();
    if (attempt.user_uid !== uid) throw new HttpsError("permission-denied", "Not your attempt.");
    if (attempt.status === "completed") {
      return { success: false, xp_earned: 0, message: "Test attempt already submitted.", score_percentage: 0, correct_answers: 0, total_questions: 0, actual_time_seconds: 0, base_xp: 0, accuracy_bonus: 0, speed_bonus: 0 };
    }

    // Load test
    const testSnap = await db.doc(`practiceTests/${attempt.test_id}`).get();
    if (!testSnap.exists) throw new HttpsError("not-found", "Test not found.");
    const test = testSnap.data();

    // Load questions — Cloud Function reads correctKey server-side from admin SDK
    // Client never receives correctKey (Firestore rules block answerKeys subcollection)
    const qSnaps = await db.collection(`practiceTests/${attempt.test_id}/questions`).get();
    const questions = qSnaps.docs.map((d) => d.data());
    const totalQuestions = questions.length;
    if (totalQuestions === 0) throw new HttpsError("failed-precondition", "Test has no questions.");

    // Score using server-side correctKey values
    let correctCount = 0;
    for (const q of questions) {
      const studentAnswer = answers[q.id];
      if (studentAnswer && studentAnswer === q.correctKey) correctCount++;
    }
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // Time — server-side only
    const startedAt = attempt.started_at?.toMillis ? attempt.started_at.toMillis() : Date.now();
    const nowTs = Date.now();
    const actualTimeSecs = Math.floor((nowTs - startedAt) / 1000);
    const allowedTimeSecs = test.allowed_time_seconds || (test.durationMinutes || 30) * 60;

    // Validate: reject future start times (anti-cheat)
    if (startedAt > nowTs + 30000) {
      throw new HttpsError("failed-precondition", "Invalid attempt start time.");
    }

    const baseTestXP = test.base_test_xp || 1;

    // XP = XP_per_question × correct answers
    const finalXP = baseTestXP * correctCount;
    const baseXP = finalXP;
    const accuracyBonus = 0;
    const speedBonus = 0;

    const category = test.category || (test.tag === "Coding" ? "coding" : "school");
    const xpField = category === "coding" ? "coding_xp" : "school_xp";
    const userData = userSnap.data() || {};

    const newTotalXP = (userData.total_xp || userData.stats?.xp || 0) + finalXP;
    const newCatXP   = (userData[xpField] || 0) + finalXP;

    // Update test stats
    const prevTests = userData.tests_completed || 0;
    const prevTotalScore = (userData.avg_score || 0) * prevTests;
    const newTests = prevTests + 1;
    const newAvgScore = Math.round((prevTotalScore + scorePercentage) / newTests);
    const prevCodingTests = userData.coding_tests_completed || 0;
    const newCodingTests = category === "coding" ? prevCodingTests + 1 : prevCodingTests;

    // Streak
    const newStreak = await updateStreak(tx, userRef, userData, nowTs);

    tx.update(userRef, {
      total_xp:  newTotalXP,
      [xpField]: newCatXP,
      "stats.xp": newTotalXP,
      tests_completed: newTests,
      avg_score: newAvgScore,
      coding_tests_completed: newCodingTests,
      has_perfect_score: scorePercentage === 100 ? true : (userData.has_perfect_score || false),
      has_speed_demon: (scorePercentage > 90 && actualTimeSecs < allowedTimeSecs / 2) ? true : (userData.has_speed_demon || false),
    });

    // Mark attempt completed
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

    // XP history
    const histRef = db.collection("xp_history").doc();
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

    // Badges
    const updatedUserData = {
      ...userData,
      total_xp: newTotalXP,
      [xpField]: newCatXP,
      tests_completed: newTests,
      avg_score: newAvgScore,
      coding_tests_completed: newCodingTests,
      coding_xp: category === "coding" ? newCatXP : (userData.coding_xp || 0),
      has_perfect_score: scorePercentage === 100 ? true : (userData.has_perfect_score || false),
      has_speed_demon: speedBonus > 0 ? true : (userData.has_speed_demon || false),
      current_streak: newStreak,
    };
    const nightFlag = { is_night_activity: isNightActivity(nowTs) };
    const { newBadges, totalBonusXP } = await checkAndAwardBadges(tx, userRef, updatedUserData, nightFlag);

    if (totalBonusXP > 0) {
      tx.set(userRef, {
        total_xp: FieldValue.increment(totalBonusXP),
        "stats.xp": FieldValue.increment(totalBonusXP),
        [xpField]: FieldValue.increment(totalBonusXP),
      }, { merge: true });
      for (const badgeId of newBadges) {
        const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
        if (badgeDef && badgeDef.xp_bonus > 0) {
          const bonusRef = db.collection("xp_history").doc();
          tx.set(bonusRef, {
            user_uid: uid,
            category,
            xp_earned: badgeDef.xp_bonus,
            source: "badge",
            badge_id: badgeId,
            timestamp: Timestamp.now(),
            transaction_type: "badge_bonus",
          });
        }
      }
    }

    return {
      success: true,
      xp_earned: finalXP,
      base_xp: baseXP,
      accuracy_bonus: accuracyBonus,
      speed_bonus: speedBonus,
      score_percentage: scorePercentage,
      correct_answers: correctCount,
      total_questions: totalQuestions,
      actual_time_seconds: actualTimeSecs,
      new_total_xp: newTotalXP + totalBonusXP,
      new_badges: newBadges,
      message: "Test submitted.",
      // Return answer key only after submission so client can show review screen
      answer_key: Object.fromEntries(questions.map((q) => [q.id, q.correctKey])),
    };
  });
});


// ─── updateLeaderboards (Scheduled every 10 minutes) ─────────────────────────
exports.updateLeaderboards = onSchedule(
  { schedule: "every 10 minutes", region: "asia-south1" },
  async () => {
    const usersSnap = await db.collection("users")
      .where("state", "==", "Assam")
      .orderBy("total_xp", "desc")
      .limit(200)
      .get();

    const users = usersSnap.docs.map((d, i) => ({
      uid: d.id,
      name: d.data().name || "Learner",
      district: d.data().district || "",
      state: d.data().state || "Assam",
      total_xp: d.data().total_xp || d.data().stats?.xp || 0,
      school_xp: d.data().school_xp || 0,
      coding_xp: d.data().coding_xp || 0,
      rank: i + 1,
    }));

    const categories = ["all", "school", "coding"];
    const now = Date.now();
    const batch = db.batch();

    for (const cat of categories) {
      const field = cat === "school" ? "school_xp" : cat === "coding" ? "coding_xp" : "total_xp";
      const sorted = [...users].sort((a, b) => b[field] - a[field]).map((u, i) => ({ ...u, rank: i + 1 })).slice(0, 50);

      // State-level
      batch.set(db.doc(`leaderboards/assam_${cat}`), {
        entries: sorted, updated_at: now, location: "assam", category: cat,
      });

      // Per-district
      const districts = [...new Set(users.map((u) => u.district).filter(Boolean))];
      for (const district of districts) {
        const slug = district.toLowerCase().replace(/\s+/g, "_");
        const distUsers = sorted.filter((u) => u.district === district).map((u, i) => ({ ...u, rank: i + 1 }));
        batch.set(db.doc(`leaderboards/${slug}_${cat}`), {
          entries: distUsers, updated_at: now, location: slug, category: cat,
        });
      }
    }

    await batch.commit();
    console.log("Leaderboards updated.");
  }
);
