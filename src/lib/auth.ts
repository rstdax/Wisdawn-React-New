import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { ref, set, get, serverTimestamp } from "firebase/database";
import { auth, db, googleProvider } from "./firebase";

// ─── Google Sign-In (popup-based) ────────────────────────────────────────────

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await saveUserToDatabase(result.user);
  return result.user;
}

// ─── Kept for backward compatibility — no longer needed with popup flow ───────

export async function handleGoogleRedirectResult(): Promise<User | null> {
  return null;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// ─── Auth State Listener ──────────────────────────────────────────────────────

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─── Get Current User ─────────────────────────────────────────────────────────

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// ─── Save User to Firebase Realtime Database ─────────────────────────────────

async function saveUserToDatabase(user: User): Promise<void> {
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    // New user — create full profile with default stats
    await set(userRef, {
      uid: user.uid,
      name: user.displayName ?? "",
      email: user.email ?? "",
      photoURL: user.photoURL ?? "",
      provider: "google",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      onboardingCompleted: false,
      stats: {
        courses: 0,
        badges: 0,
        xp: 0,
        rank: 0,
      },
    });
  } else {
    // Existing user — update last login only
    const existingData = snapshot.val();
    await set(userRef, {
      ...existingData,
      lastLoginAt: serverTimestamp(),
    });
  }
}

// ─── Get Chapter Video from Database ─────────────────────────────────────────

export async function getChapterVideo(
  chapterId: string
): Promise<{ videoId: string; startTime?: number } | null> {
  const chapterRef = ref(db, `chapters/${chapterId}`);
  const snapshot = await get(chapterRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.val();
  if (!data.videoId) return null;
  return {
    videoId: data.videoId,
    startTime: data.startTime ?? 0,
  };
}

// ─── Get Chapter Video ID from Database (legacy) ─────────────────────────────

export async function getChapterVideoId(chapterId: string): Promise<string | null> {
  const result = await getChapterVideo(chapterId);
  return result?.videoId ?? null;
}

export async function getUserProfile(uid: string) {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
}

// ─── Update Onboarding Data ───────────────────────────────────────────────────

export async function saveOnboardingData(
  uid: string,
  data: {
    name: string;
    guardian: string;
    cls: string;
    track: string;
    dob: string;
    district: string;
    state: string;
  }
): Promise<void> {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    await set(userRef, {
      ...snapshot.val(),
      ...data,
      onboardingCompleted: true,
      onboardingCompletedAt: serverTimestamp(),
    });
  }
}
