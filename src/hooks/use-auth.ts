import { useState, useEffect } from "react";
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
  stats?: {
    courses: number;
    badges: number;
    xp: number;
    rank: number;
  };
};

// Global auth cache variables to share state across route transitions
let cachedUser: User | null = null;
let cachedProfile: UserProfile | null = null;
let cachedLoading = true;
let isInitialized = false;
const listeners = new Set<() => void>();

function updateCache(user: User | null, profile: UserProfile | null, loading: boolean) {
  cachedUser = user;
  cachedProfile = profile;
  cachedLoading = loading;
  listeners.forEach((l) => l());
}

// Start listener once globally in browser environments
if (typeof window !== "undefined" && !isInitialized) {
  isInitialized = true;
  onAuthChange(async (firebaseUser) => {
    if (firebaseUser) {
      if (!cachedUser || cachedUser.uid !== firebaseUser.uid) {
        try {
          const data = await getUserProfile(firebaseUser.uid);
          updateCache(firebaseUser, data as UserProfile | null, false);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          updateCache(firebaseUser, null, false);
        }
      } else {
        updateCache(firebaseUser, cachedProfile, false);
      }
    } else {
      updateCache(null, null, false);
    }
  });
}

export function useAuth() {
  const [state, setState] = useState({
    user: cachedUser,
    profile: cachedProfile,
    loading: cachedLoading,
  });

  useEffect(() => {
    const handleUpdate = () => {
      setState({
        user: cachedUser,
        profile: cachedProfile,
        loading: cachedLoading,
      });
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

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
    displayEmail 
  };
}
