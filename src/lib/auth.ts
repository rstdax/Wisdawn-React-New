import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

// ─── Google Sign-In ───────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await saveUserToDatabase(result.user);
  return result.user;
}

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

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// ─── Save User to Firestore ───────────────────────────────────────────────────

async function saveUserToDatabase(user: User): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
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
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
  }
}

// ─── Get Chapter Video (now uses Firestore via admin.ts) ──────────────────────

export async function getChapterVideo(
  chapterId: string
): Promise<{ videoId: string; startTime?: number } | null> {
  const snap = await getDoc(doc(db, "chapters", chapterId));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data.videoId) return null;
  return { videoId: data.videoId, startTime: data.startTime ?? 0 };
}

export async function getChapterVideoId(chapterId: string): Promise<string | null> {
  const result = await getChapterVideo(chapterId);
  return result?.videoId ?? null;
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

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
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    await updateDoc(userRef, {
      ...data,
      onboardingCompleted: true,
      onboardingCompletedAt: serverTimestamp(),
    });
  }
}
