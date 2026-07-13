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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const data = await getUserProfile(firebaseUser.uid);
        setProfile(data as UserProfile | null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Name: prefer onboarding name > Google display name > fallback
  const displayName =
    (profile?.name && profile.name.trim()) ||
    (user?.displayName && user.displayName.trim()) ||
    "Learner";

  const displayEmail = profile?.email || user?.email || "";

  // Initials from name (e.g. "Rahul Kumar" → "RK")
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return { user, profile, loading, initials, displayName, displayEmail };
}
