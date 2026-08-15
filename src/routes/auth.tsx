import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { signInWithGoogle, getUserProfile, setupRecaptcha, sendPhoneOTP, verifyPhoneOTP } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { GraduationCap, Leaf, Laptop, Star, ShieldCheck, Send } from "lucide-react";
import signPageBg from "@/assets/sign-page-bg.jpeg";
import wisbyLaptop from "@/assets/wisby-laptop.png";
import logo from "@/assets/logo.jpeg";
import rstLogo from "@/assets/rst-logo.jpeg";
import type { ConfirmationResult } from "firebase/auth";

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
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // AUTH GUARD: Prevent logged-in users from seeing the Auth page
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      if ((profile as any)?.onboardingCompleted) {
        navigate({ to: "/home", replace: true });
      } else {
        navigate({ to: "/onboarding", replace: true });
      }
    }
  }, [user, profile, authLoading, navigate]);

  // FIXED: Only initialize Recaptcha AFTER auth is done loading and the DOM is rendered
  useEffect(() => {
    if (!authLoading && !user) {
      // A small timeout ensures the DOM has finished painting the #recaptcha-container div
      const timer = setTimeout(() => {
        try {
          const result = setupRecaptcha("recaptcha-container");
          // Safely catch any unhandled promise rejections from Firebase
          if (result && typeof (result as any).catch === "function") {
            (result as any).catch((err: any) => console.error("Recaptcha setup error:", err));
          }
        } catch (err) {
          console.error("Recaptcha init error:", err);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authLoading, user]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const authUser = await signInWithGoogle();
      const userProfile = await getUserProfile(authUser.uid);
      if (userProfile?.onboardingCompleted) {
        navigate({ to: "/home", replace: true });
      } else {
        navigate({ to: "/onboarding", replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formattedPhone = `+91${phoneNumber}`;
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await sendPhoneOTP(formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    if (!confirmationResult) return;
    
    setLoading(true);
    setError("");
    try {
      const authUser = await verifyPhoneOTP(confirmationResult, otp);
      const userProfile = await getUserProfile(authUser.uid);
      if (userProfile?.onboardingCompleted) {
        navigate({ to: "/home", replace: true });
      } else {
        navigate({ to: "/onboarding", replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP.");
      setLoading(false);
    }
  };

  // Show nothing while evaluating auth state to prevent flashing
  if (authLoading || user) return null;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between font-sans overflow-x-hidden selection:bg-blue-100 bg-[#E8F1FF]">
      {/* Background Image (Top Area) */}
      <div 
        className="absolute top-0 left-0 right-0 h-[65vh] z-0 bg-cover bg-top bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url(${signPageBg})` }}
      />

      {/* Main Content Area */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-end max-w-md mx-auto pt-4">
        
        {/* Wisby Character */}
        <div className="relative -mb-10 z-10 pointer-events-none flex justify-center w-full">
          <img 
            src={wisbyLaptop} 
            alt="Wisby Mascot" 
            className="w-[280px] h-auto drop-shadow-2xl select-none object-contain"
          />
        </div>

        {/* Bottom White Card */}
        <div className="w-full bg-white rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-6 pt-12 pb-8 flex flex-col items-center relative z-20">
          <h1 className="text-[32px] font-extrabold text-slate-900 tracking-tight text-center leading-tight">
            Welcome to{" "}
            <span className="text-[#3B66F5] relative inline-block">
              Wisdawn!
              <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-10 h-1.5 bg-[#FDBA2A] rounded-full"></span>
            </span>
          </h1>

          <p className="mt-4 text-slate-500 text-[15px] font-medium text-center max-w-[280px] leading-snug">
            Sign in or create an account to start your learning journey.
          </p>

          {error && (
            <div className="mt-4 w-full bg-red-50 text-red-600 font-medium p-3 rounded-2xl text-sm border border-red-100 text-center">
              {error}
            </div>
          )}

          {/* OTP Section */}
          <div className="w-full mt-8 flex flex-col gap-2.5">
            <label className="text-[13px] font-bold text-slate-800 ml-1">Login with Phone (OTP)</label>
            
            {!showOtpInput ? (
              <>
                <div className="flex w-full items-center border-2 border-slate-100 rounded-2xl overflow-hidden focus-within:border-[#3B66F5] focus-within:ring-2 focus-within:ring-[#3B66F5]/10 transition-all bg-white h-14">
                  <div className="flex items-center gap-2 pl-4 pr-3 py-2 h-full border-r-2 border-slate-100 shrink-0">
                    <span className="text-lg">🇮🇳</span>
                    <span className="text-[15px] font-bold text-slate-800">+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    className="flex-1 w-full h-full px-4 text-[15px] font-bold text-slate-900 bg-transparent outline-none placeholder:text-slate-400 placeholder:font-medium"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
                <button
                  onClick={handleSendOTP}
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full h-14 flex items-center justify-center gap-2 bg-[#6B8DFF] hover:bg-[#5277FA] text-white font-bold rounded-2xl shadow-[0_4px_14px_rgba(107,141,255,0.3)] transition-all disabled:opacity-70 active:scale-[0.99] mt-1 text-[15px]"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      Send OTP <Send className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="flex w-full items-center border-2 border-slate-100 rounded-2xl overflow-hidden focus-within:border-[#3B66F5] focus-within:ring-2 focus-within:ring-[#3B66F5]/10 transition-all bg-white h-14">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    className="flex-1 w-full h-full px-4 text-center text-xl tracking-widest font-bold text-slate-900 bg-transparent outline-none placeholder:text-slate-400 placeholder:font-medium placeholder:tracking-normal placeholder:text-[15px]"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length < 6}
                  className="w-full h-14 flex items-center justify-center gap-2 bg-[#6B8DFF] hover:bg-[#5277FA] text-white font-bold rounded-2xl shadow-[0_4px_14px_rgba(107,141,255,0.3)] transition-all disabled:opacity-70 active:scale-[0.99] mt-1 text-[15px]"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "Verify & Login"
                  )}
                </button>
                <button 
                  onClick={() => { setShowOtpInput(false); setOtp(""); setError(""); }}
                  className="text-[13px] font-semibold text-slate-400 hover:text-slate-600 mt-2"
                >
                  Change Phone Number
                </button>
              </>
            )}
          </div>

          <div id="recaptcha-container" className="mt-2 flex justify-center"></div>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 my-7 px-4">
            <div className="flex-1 h-[2px] bg-slate-100"></div>
            <span className="text-[11px] uppercase font-black text-slate-300">OR</span>
            <div className="flex-1 h-[2px] bg-slate-100"></div>
          </div>

          {/* Google Auth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-700 font-extrabold h-14 rounded-full transition-all disabled:opacity-70 active:scale-[0.99]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[15px]">Continue with Google</span>
          </button>

          {/* Feature Highlights Grid */}
          <div className="w-full grid grid-cols-4 gap-2 mt-10">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#F0F4FF] text-[#3B66F5] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[10px] text-slate-800 leading-tight">Beginner<br />Friendly</span>
                <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Start from Zero</span>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#EDFCF2] text-[#22C55E] flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[10px] text-slate-800 leading-tight">Anyone<br />Can Learn</span>
                <span className="text-[8px] text-slate-400 font-semibold mt-0.5">No limits</span>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#FDF4FF] text-[#D946EF] flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[10px] text-slate-800 leading-tight">No Expensive<br />Equipment</span>
                <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Use what you have</span>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
                <Star className="w-5 h-5 fill-[#F59E0B]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[10px] text-slate-800 leading-tight">Build Your<br />Future</span>
                <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Step by step</span>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col items-center gap-1 mt-10">
            <div className="flex items-center gap-1.5 text-[#3B66F5] text-[12px] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-slate-600">Safe. Secure. Made for learners.</span>
            </div>
            <p className="text-slate-400 text-[10px] font-medium mt-1">
              Powered by <span className="font-bold text-slate-700">Royal Synergy Technology</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}