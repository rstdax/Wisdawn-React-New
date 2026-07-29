import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithGoogle, getUserProfile } from "@/lib/auth";
import { ArrowLeft, GraduationCap, Leaf, Laptop, Star, ShieldCheck } from "lucide-react";
import signPageBg from "@/assets/sign-page-bg.jpeg";
import wisbyLaptop from "@/assets/wisby-laptop.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In / Sign Up — WisDawn" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await signInWithGoogle();
      const profile = await getUserProfile(user.uid);
      if (profile?.onboardingCompleted) {
        navigate({ to: "/home" });
      } else {
        navigate({ to: "/onboarding" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 md:p-6 font-sans overflow-x-hidden selection:bg-blue-100">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-top bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url(${signPageBg})` }}
      />

      {/* Top Header with Logos */}
      <header className="relative z-10 w-full max-w-4xl pt-2 pb-2 flex items-center justify-between px-2">
        <Link 
          to="/" 
          className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors font-medium text-xs md:text-sm bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/80 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        {/* Brand Header */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Wisdawn Brand */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-500/20 text-white font-black text-lg sm:text-xl">
              <span className="relative z-10">W</span>
              <svg className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-lg font-black tracking-wider text-[#0f172a] leading-none uppercase">
                WISDAWN
              </span>
              <span className="text-[8px] sm:text-[10px] font-semibold text-slate-500 tracking-tight mt-0.5">
                Learn Today, Lead Tomorrow
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 sm:h-10 w-[1.5px] bg-slate-300/80" />

          {/* RST Brand */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-lg sm:text-2xl font-black italic tracking-tighter text-blue-600">R</span>
              <span className="text-lg sm:text-2xl font-black italic tracking-tighter text-amber-500">S</span>
              <span className="text-lg sm:text-2xl font-black italic tracking-tighter text-blue-600">T</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-sm font-black tracking-wider text-[#0f172a] leading-none uppercase">
                ROYAL SYNERGY
              </span>
              <span className="text-[7px] sm:text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
                TECHNOLOGY
              </span>
            </div>
          </div>
        </div>

        <div className="w-8 sm:w-20" /> {/* Spacer for centering top header */}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col items-center w-full max-w-md my-auto pt-2 pb-4">
        {/* Wisby Character with Laptop */}
        <div className="relative -mb-14 sm:-mb-20 z-0 pointer-events-none flex justify-center">
          <img 
            src={wisbyLaptop} 
            alt="Wisby Mascot" 
            className="w-[280px] sm:w-[380px] h-auto drop-shadow-2xl select-none object-contain -translate-x-2 sm:-translate-x-4"
          />
        </div>

        {/* Auth Card */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-[2.25rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(29,99,237,0.15)] border border-white/80 p-6 sm:p-8 text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Welcome to{" "}
            <span className="relative inline-block text-[#1d63ed]">
              Wisdawn!
              <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-10 h-1 bg-[#f59e0b] rounded-full"></span>
            </span>
          </h1>

          <p className="mt-3 text-slate-500 text-xs sm:text-sm font-medium max-w-[320px] mx-auto leading-relaxed">
            Sign in or create an account to start your learning journey.
          </p>

          {error && (
            <div className="mt-4 w-full bg-red-50 text-red-600 font-medium p-3.5 rounded-xl text-xs sm:text-sm border border-red-100 text-left">
              {error}
            </div>
          )}

          {/* Google Auth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mt-6 sm:mt-7 w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span className="text-sm sm:text-base font-bold text-slate-800">
              {loading ? "Connecting..." : "Continue with Google"}
            </span>
          </button>

          {/* Sparkle Divider */}
          <div className="my-5 sm:my-6 flex items-center justify-center">
            <span className="text-blue-400 text-xs">✦</span>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 shadow-sm">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="font-bold text-[10px] sm:text-xs text-slate-800 leading-tight">
                Beginner<br />Friendly
              </span>
              <span className="text-[8px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                Start from Zero
              </span>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 shadow-sm">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="font-bold text-[10px] sm:text-xs text-slate-800 leading-tight">
                Anyone<br />Can Learn
              </span>
              <span className="text-[8px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                No limits
              </span>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 shadow-sm">
                <Laptop className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="font-bold text-[10px] sm:text-xs text-slate-800 leading-tight">
                No Expensive<br />Equipment
              </span>
              <span className="text-[8px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                Use what you have
              </span>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-1.5 shadow-sm">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-500" />
              </div>
              <span className="font-bold text-[10px] sm:text-xs text-slate-800 leading-tight">
                Build Your<br />Future
              </span>
              <span className="text-[8px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                Step by step
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-2 flex flex-col items-center gap-0.5 text-center">
        <div className="flex items-center gap-1.5 text-slate-600 text-xs sm:text-sm font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Safe. Secure. Made for learners.</span>
        </div>
        <p className="text-slate-400 text-[10px] sm:text-xs font-medium">
          Powered by <span className="font-bold text-slate-600">Royal Synergy Technology</span>
        </p>
      </footer>
    </div>
  );
}
