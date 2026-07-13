import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { adminAuth } from "../src/lib/firebase-admin";
import { isAdmin } from "../src/lib/admin";
import { AdminLayout } from "./components/AdminLayout";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";

const adminGoogleProvider = new GoogleAuthProvider();

export function AdminApp() {
  const [user, setUser] = useState<User | null>(null);
  const [adminVerified, setAdminVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Listen to the ADMIN-ONLY auth instance — never touches student session
  useEffect(() => {
    const unsub = onAuthStateChanged(adminAuth, async (u) => {
      setUser(u);
      if (u) {
        const ok = await isAdmin(u.uid);
        setAdminVerified(ok);
        if (!ok) setError("Access denied. This account is not an admin.");
      } else {
        setAdminVerified(false);
        setError("");
      }
      setChecking(false);
    });
    return unsub;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(adminAuth, email.trim(), password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      // Uses adminAuth (separate instance) — student session untouched
      await signInWithPopup(adminAuth, adminGoogleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => signOut(adminAuth);

  // ── Loading ──
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
          Loading admin panel…
        </div>
      </div>
    );
  }

  // ── Access denied (logged in but not admin) ──
  if (user && !adminVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-destructive/30 bg-white p-8 shadow-md text-center space-y-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-red-50 mx-auto">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            This account is not authorized as an admin.
          </p>
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2 font-mono">
            {user.email}
          </p>
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition"
          >
            Sign Out & Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Logged in & verified ──
  if (user && adminVerified) {
    return <AdminLayout user={user} onLogout={handleLogout} />;
  }

  // ── Login form ──
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary mx-auto shadow-lg shadow-primary/25">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">WisDawn Admin</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your admin credentials
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="rounded-3xl border border-border bg-white p-8 shadow-md space-y-5"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@wisdawn.com"
                autoComplete="username"
                className="flex-1 bg-transparent text-sm font-semibold focus:outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="flex-1 bg-transparent text-sm font-semibold focus:outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in…
              </>
            ) : (
              "Sign In to Admin Panel"
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-white py-3.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition disabled:opacity-60 shadow-sm"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">G</span>
            Continue with Google
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          This panel is for authorized administrators only.
        </p>
      </div>
    </div>
  );
}
