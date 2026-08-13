import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Sparkles, ArrowRight, Trophy } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";
import { Skeleton } from "@/components/ui/skeleton";
import { getPracticeTests, getTestAttemptsByUser, type PracticeTest } from "@/lib/admin";
import { useAuth } from "@/hooks/use-auth";
import { useXP } from "@/hooks/use-xp";

import logoImg from "@/assets/jjj.png";
import logoCodingImg from "@/assets/logocoding.png";

export const Route = createFileRoute("/tests")({
  head: () => ({ meta: [{ title: "Tests — WisDawn" }] }),
  component: Tests,
});

type FilterType = "All" | "School" | "Coding" | "Results";

// Reusable SVG Coin Icon to match the header
const XPCoin = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-sm border border-yellow-400 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-full w-full p-0.5 text-amber-700 opacity-90">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  </div>
);

// Animated Cones/Scallops Layer — matches the Profile page's card background treatment.
function AnimatedZigZag({
  heightClass = "h-[30px]",
  speed = 100,
}: {
  heightClass?: string;
  speed?: number;
}) {
  const CONE_COUNT = 10;
  const COLORS = [
    "text-primary/10",
    "text-purple-500/10",
    "text-emerald-500/10",
    "text-amber-500/10",
  ];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), speed);
    return () => clearInterval(timer);
  }, [speed]);

  const cycleLength = CONE_COUNT * 2 + 5;
  const currentCycle = Math.floor(tick / cycleLength);
  const phaseTick = tick % cycleLength;
  const currentColor = COLORS[currentCycle % COLORS.length];

  return (
    <div className={`absolute bottom-0 left-0 w-full flex items-end z-0 pointer-events-none ${heightClass}`}>
      {Array.from({ length: CONE_COUNT }).map((_, i) => {
        const isShown = phaseTick >= i && phaseTick < (CONE_COUNT + 2 + i);
        return (
          <div
            key={i}
            className={`flex-1 transition-transform duration-300 ease-out origin-bottom ${currentColor} ${isShown ? "scale-y-100" : "scale-y-0"}`}
          >
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full block">
              <path d="M0,100 Q50,0 100,100 Z" fill="currentColor" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

function Tests() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const { profile, loading: authLoading, user } = useAuth();
  const { data: xpData } = useXP(user?.uid);

  const { data: tests = [], isLoading: testsLoading } = useQuery({
    queryKey: ["practiceTests"],
    queryFn: () => getPracticeTests(50),
    staleTime: 5 * 60 * 1000,
  });

  const { data: attempts = [], isLoading: attemptsLoading } = useQuery({
    queryKey: ["testAttempts", user?.uid],
    queryFn: () => user?.uid ? getTestAttemptsByUser(user.uid) : Promise.resolve([]),
    enabled: !!user?.uid,
    staleTime: 30 * 1000,
  });
  
  const savedTrack = typeof window !== "undefined" ? localStorage.getItem("wisdawn_track") : "school";
  const showCodingLogo = activeFilter === "Coding" || (activeFilter === "All" && savedTrack === "coding");

  const loading = authLoading || testsLoading;

  const visibleTests = activeFilter === "All" ? tests
    : activeFilter === "Results" ? []
    : tests.filter(t => t.tag === activeFilter);

  const liveXP = xpData?.total_xp ?? profile?.stats?.xp ?? 0;
  const courses = profile?.stats?.courses ?? 0;

  return (
    <MobileFrame>
          {/* NEW: WISDAWN BRANDING & POINTS HEADER */}
    <div className="flex md:hidden items-center justify-between px-5 pt-4 pb-2">
      {/* Left Side: Logo and Name */}
      <div className="flex items-center gap-2">
        <img 
          src={showCodingLogo ? logoCodingImg : logoImg} 
          alt="Wisdawn Logo" 
          className="h-8 w-8 object-contain" 
        />
        <span className="text-2xl font-bold text-primary">Wisdawn</span>
      </div>

      {/* Right Side: Coin Pill (No image file needed) */}
      <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1">
        {/* Custom CSS Coin with Star SVG */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-sm border border-yellow-400">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="h-4 w-4 text-amber-700 opacity-90"
          >
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-xl font-bold text-amber-500">
          {liveXP.toLocaleString("en-IN")}
        </span>
      </div>
    </div>

    {/* THE DIVIDER LINE */}
    <hr className="block md:hidden border-t border-border/60 mx-5 mb-2" />

      {/* MOBILE PAGE TITLE */}
      <div className="px-5 pt-2 pb-3 md:hidden bg-background">
        <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Tests</h1>
        <p className="text-xs font-medium text-slate-500 mt-0.5">Practice and track your progress</p>
      </div>

      {/* RESPONSIVE LAYOUT BODY */}
      <div className="flex-1 overflow-y-auto md:overflow-visible pb-24 px-0 md:px-0 pt-2 bg-background">
        {/* DESKTOP HEADER */}
        <div className="hidden md:flex justify-between items-center mb-6 px-5 md:px-0 pt-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-primary" /> Tests &amp; Practice
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Attempt practice tests and track performance
            </p>
          </div>

          <div className="flex gap-2">
            {(["All", "School", "Coding"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-colors duration-300 border shadow-sm ${
                  activeFilter === filter
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 md:px-0">
          {/* AVAILABLE TESTS LIST */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* MOBILE ONLY BANNER */}
            <div className="relative rounded-3xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-primary/20 shadow-sm overflow-hidden p-5 pb-0 md:hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 z-0">
                <AnimatedZigZag heightClass="h-[36px]" speed={110} />
              </div>

              <div className="relative z-10 pb-6">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-widest">
                  <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" /> Your XP
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <XPCoin className="h-8 w-8 shadow-sm" />
                  <p className="text-2xl font-black tracking-tight text-slate-900">{liveXP.toLocaleString()}</p>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {courses > 0 ? `Across ${courses} enrolled course${courses > 1 ? "s" : ""}` : "Start a course to earn XP"}
                </p>
              </div>
            </div>

            {/* MOBILE FILTER BUTTONS */}
            <div className="flex gap-2 md:hidden mt-2 pb-2 overflow-x-auto hide-scrollbar">
              {(["All", "School", "Coding", "Results"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors duration-300 border shadow-sm shrink-0 ${
                    activeFilter === filter
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {filter === "Results" ? "My Results" : filter}
                </button>
              ))}
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 mb-3 pt-2">
              {activeFilter === "Results" ? "My Test Results" : "Available Tests"}
            </h2>

            {activeFilter === "Results" ? (
              /* MY RESULTS */
              attemptsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 rounded-2xl animate-pulse" />
                  <Skeleton className="h-20 rounded-2xl animate-pulse" />
                </div>
              ) : attempts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <Trophy className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">No tests completed yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Attempt a practice test to see your results here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attempts.map((a: any) => {
                    const testTitle = tests.find(t => t.id === a.test_id)?.title ?? a.test_id;
                    return (
                      <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-sm text-slate-900 truncate">{testTitle}</p>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${a.score_percentage >= 80 ? "bg-emerald-100 text-emerald-700" : a.score_percentage >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                                {a.score_percentage}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {a.correct_answers}/{a.total_questions} correct • {Math.floor(a.actual_time_seconds / 60)}:{String(a.actual_time_seconds % 60).padStart(2, "0")} taken
                            </p>
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end">
                            <div className="flex items-center gap-1 justify-end">
                              <XPCoin className="h-3.5 w-3.5" />
                              <span className="text-sm font-extrabold text-amber-700">+{a.final_xp ?? 0}</span>
                            </div>
                            <p className="text-[10px] font-semibold text-slate-400 mt-1">
                              {a.submitted_at?.toDate ? new Date(a.submitted_at.toDate()).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Skeleton className="h-20 rounded-2xl animate-pulse" />
                <Skeleton className="h-20 rounded-2xl animate-pulse" />
                <Skeleton className="h-20 rounded-2xl animate-pulse" />
                <Skeleton className="h-20 rounded-2xl animate-pulse" />
              </div>
            ) : visibleTests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <ClipboardCheck className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">
                  No tests available yet.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Check back soon — new practice sets are added regularly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibleTests.map((t) => (
                  <TestCard key={t.id} test={t} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* PERFORMANCE METRICS CARD */}
            <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
              <div className="absolute inset-0 z-0">
                <AnimatedZigZag heightClass="h-[26px]" speed={100} />
              </div>

              <div className="relative z-10">
                <h3 className="text-sm font-bold text-slate-900">Performance Overview</h3>

                <div className="flex flex-col items-center py-4">
                  <div className="relative h-28 w-28 flex items-center justify-center">
                    <svg className="absolute transform -rotate-90 w-full h-full">
                      <circle
                        cx="56"
                        cy="56"
                        r="44"
                        className="stroke-slate-100"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="44"
                        className="stroke-primary transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 44}
                        strokeDashoffset={2 * Math.PI * 44 * (1 - (liveXP > 0 ? Math.min(liveXP / 5000, 1) : 0))}
                      />
                    </svg>
                    
                    <div className="text-center">
                      <span className="text-xl font-black text-slate-900 tracking-tighter">
                        {liveXP > 0 ? `${Math.min(Math.round((liveXP / 5000) * 100), 100)}%` : "0%"}
                      </span>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        Level
                      </p>
                    </div>
                  </div>

                  <div className="w-full mt-5 space-y-3 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span>Tests Available</span>
                      <span className="font-bold text-slate-900">{tests.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Courses Enrolled</span>
                      <span className="font-bold text-slate-900">{courses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total XP</span>
                      <div className="flex items-center gap-1 font-bold text-primary">
                        <XPCoin className="h-3.5 w-3.5" />
                        <span>+{liveXP.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PRACTICE TIPS */}
            <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 shadow-sm overflow-hidden">
              <div className="absolute inset-0 z-0">
                <AnimatedZigZag heightClass="h-[24px]" speed={130} />
              </div>

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-widest">
                  <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" /> Practice Tips
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">Build daily habits!</h4>
                <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                  Attempting at least one practice test per day sharpens your recall and builds exam confidence.
                </p>
              </div>
            </div>

            {/* MASCOT MOTIVATION */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
              <Wisby variant="thumbs" className="h-16 w-16 shrink-0 drop-shadow-sm" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Wisby says:</h4>
                <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                  "Practice is the key to mastery. Try attempting one MCQ set daily!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}

function TestCard({ test }: { test: PracticeTest }) {
  return (
    <Link
      to="/practice/$id"
      params={{ id: test.id }}
      className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-all duration-300 hover:shadow-sm hover:border-primary/40 group"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
        <ClipboardCheck className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900 group-hover:text-primary transition-colors duration-300">{test.title}</p>
        {test.subject && <p className="truncate text-[10px] text-primary/70 font-semibold mt-0.5">{test.subject}</p>}
        <p className="truncate text-xs font-medium text-slate-500 mt-0.5">{test.subtitle}</p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
          <span>{test.questions} questions</span>
          <span className="flex items-center gap-1">
            <XPCoin className="h-3 w-3" />
            <span className="text-amber-700">{test.base_test_xp ?? 1} XP/Q</span>
          </span>
        </div>
      </div>
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-50 border border-slate-200 text-slate-400 group-hover:bg-primary group-hover:border-primary group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-sm">
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}