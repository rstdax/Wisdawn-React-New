import { useSyncExternalStore } from "react";
import { type User } from "firebase/auth";
import { onAuthChange, getUserProfile } from "@/lib/auth";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  guardian: string;
  cls: string;
  track: string;
  dob: string;
  district: string;
  state: string;
  onboardingCompleted: boolean;
  purchasedCourseIds?: string[];
  stats?: {
    courses: number;
    badges: number;
    xp: number;
    rank: number;
  };
};

// ─── Global auth store ────────────────────────────────────────────────────────
// Single source of truth shared across all components and route transitions.
// Uses useSyncExternalStore to eliminate double-renders from useState + useEffect.

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
};

let authState: AuthState = { user: null, profile: null, loading: true };
const subscribers = new Set<() => void>();

function setAuthState(next: AuthState) {
  authState = next;
  subscribers.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function getSnapshot(): AuthState {
  return authState;
}

// Server snapshot — always "loading" so SSR doesn't block on auth
const serverSnapshot: AuthState = { user: null, profile: null, loading: true };
function getServerSnapshot(): AuthState {
  return serverSnapshot;
}

export async function refreshUserProfile(): Promise<void> {
  if (!authState.user) return;
  const profile = await getUserProfile(authState.user.uid);
  setAuthState({ ...authState, profile: profile as UserProfile | null });
}

// Start the Firebase auth listener exactly once in the browser
if (typeof window !== "undefined") {
  onAuthChange(async (firebaseUser) => {
    if (firebaseUser) {
      // Avoid unnecessary profile re-fetch if same user is already loaded
      if (authState.user?.uid === firebaseUser.uid && authState.profile) {
        setAuthState({ user: firebaseUser, profile: authState.profile, loading: false });
        return;
      }
      try {
        const data = await getUserProfile(firebaseUser.uid);
        setAuthState({ user: firebaseUser, profile: data as UserProfile | null, loading: false });
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setAuthState({ user: firebaseUser, profile: null, loading: false });
      }
    } else {
      setAuthState({ user: null, profile: null, loading: false });
    }
  });
}

export function useAuth() {
  // useSyncExternalStore is React 18+ and guarantees a single consistent render
  // — no tearing, no double-renders from separate useState + useEffect.
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Name: prefer onboarding name > Google display name > fallback
  const displayName =
    (state.profile?.name && state.profile.name.trim()) ||
    (state.user?.displayName && state.user.displayName.trim()) ||
    "Learner";

  const displayEmail = state.profile?.email || state.user?.email || "";

  // Initials from name (e.g. "Rahul Kumar" → "RK")
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    initials,
    displayName,
    displayEmail,
  };
}
