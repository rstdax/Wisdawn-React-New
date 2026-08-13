import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Filter, Trophy, Sparkles, Award, ChevronDown, Loader2 } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { Wisby } from "@/components/wisby";
import { useAuth } from "@/hooks/use-auth";
import { useLeaderboard, useUserRank } from "@/hooks/use-leaderboard";
import { useXP } from "@/hooks/use-xp";
import type { LeaderboardCategory } from "@/lib/leaderboard";

import logoImg from "@/assets/jjj.png";
import logoCodingImg from "@/assets/logocoding.png";

export const Route = createFileRoute("/rankings")({
  head: () => ({ meta: [{ title: "Rankings - WisDawn" }] }),
  component: Rankings,
});

const XPCoin = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-sm border border-yellow-400 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-full w-full p-0.5 text-amber-700 opacity-90">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  </div>
);

// Animated Cones Component (Pointing Upwards for the sticky bottom bar)
// Animated Cones Component (Pointing Upwards for the sticky bottom bar)
function AnimatedZigZag() {
  const CONE_COUNT = 10;
  
  // Changed the opacity from /90 to /20 so it is barely noticeable
  const COLORS = [
    "text-purple-300/20",
    "text-emerald-300/20",
    "text-amber-300/20",
    "text-cyan-300/20"
  ];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(timer);
  }, []);

  const cycleLength = CONE_COUNT * 2 + 5;
  const currentCycle = Math.floor(tick / cycleLength);
  const phaseTick = tick % cycleLength;
  const currentColor = COLORS[currentCycle % COLORS.length];

  return (
    <div className="absolute bottom-full left-0 w-full flex items-end z-0 pointer-events-none drop-shadow-sm h-[30px]">
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

type TabType = "All" | "School" | "Coding";
const CATEGORY_MAP: Record<TabType, LeaderboardCategory> = { All: "all", School: "school", Coding: "coding" };

function RankMedalBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative flex flex-col items-center justify-center h-9 w-8 shrink-0">
        <svg viewBox="0 0 36 44" className="h-full w-full drop-shadow-sm" fill="none">
          <path d="M11 2L18 13L10 13L5 2Z" fill="#3B82F6" />
          <path d="M25 2L18 13L26 13L31 2Z" fill="#EF4444" />
          <path d="M18 13L14 2H22Z" fill="#DC2626" />
          <circle cx="18" cy="13" r="2" fill="#D97706" />
          <circle cx="18" cy="27" r="13" fill="url(#goldGrad1)" stroke="#B45309" strokeWidth="1.2" />
          <circle cx="18" cy="27" r="10" fill="url(#goldInnerGrad1)" stroke="#FEF3C7" strokeWidth="0.8" opacity="0.9" />
          <text x="18" y="31.5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#78350F" fontFamily="sans-serif">1</text>
          <defs>
            <radialGradient id="goldGrad1" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </radialGradient>
            <radialGradient id="goldInnerGrad1" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="relative flex flex-col items-center justify-center h-9 w-8 shrink-0">
        <svg viewBox="0 0 36 44" className="h-full w-full drop-shadow-sm" fill="none">
          <path d="M11 2L18 13L10 13L5 2Z" fill="#3B82F6" />
          <path d="M25 2L18 13L26 13L31 2Z" fill="#EF4444" />
          <path d="M18 13L14 2H22Z" fill="#DC2626" />
          <circle cx="18" cy="13" r="2" fill="#64748B" />
          <circle cx="18" cy="27" r="13" fill="url(#silverGrad2)" stroke="#475569" strokeWidth="1.2" />
          <circle cx="18" cy="27" r="10" fill="url(#silverInnerGrad2)" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.9" />
          <text x="18" y="31.5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#334155" fontFamily="sans-serif">2</text>
          <defs>
            <radialGradient id="silverGrad2" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="60%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </radialGradient>
            <radialGradient id="silverInnerGrad2" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#94A3B8" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="relative flex flex-col items-center justify-center h-9 w-8 shrink-0">
        <svg viewBox="0 0 36 44" className="h-full w-full drop-shadow-sm" fill="none">
          <path d="M11 2L18 13L10 13L5 2Z" fill="#3B82F6" />
          <path d="M25 2L18 13L26 13L31 2Z" fill="#EF4444" />
          <path d="M18 13L14 2H22Z" fill="#DC2626" />
          <circle cx="18" cy="13" r="2" fill="#78350F" />
          <circle cx="18" cy="27" r="13" fill="url(#bronzeGrad3)" stroke="#78350F" strokeWidth="1.2" />
          <circle cx="18" cy="27" r="10" fill="url(#bronzeInnerGrad3)" stroke="#FFEDD5" strokeWidth="0.8" opacity="0.9" />
          <text x="18" y="31.5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#451A03" fontFamily="sans-serif">3</text>
          <defs>
            <radialGradient id="bronzeGrad3" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="60%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </radialGradient>
            <radialGradient id="bronzeInnerGrad3" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFEDD5" />
              <stop offset="100%" stopColor="#B45309" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-7 w-7 items-center justify-center font-bold text-slate-400 text-sm">
      {rank}
    </div>
  );
}

function Rankings() {
  const { initials, displayName, profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  const location = "assam";
  const category = CATEGORY_MAP[activeTab];

  const { data: entries = [], isLoading } = useLeaderboard(category, location);
  const { data: xpData } = useXP(user?.uid);
  const { data: myRank } = useUserRank(user?.uid, category, location);

  const savedTrack = typeof window !== "undefined" ? localStorage.getItem("wisdawn_track") : "school";
  const showCodingLogo = activeTab === "Coding" || (activeTab === "All" && savedTrack === "coding");

  const liveXP = xpData?.total_xp ?? profile?.stats?.xp ?? 0;

  const currentUserEntry = entries.find((e) => e.uid === user?.uid);
  const userRankNumber = currentUserEntry?.rank ?? myRank;

  const myXP =
    category === "school" ? (xpData?.school_xp ?? 0) :
    category === "coding" ? (xpData?.coding_xp ?? 0) :
    (xpData?.total_xp ?? profile?.stats?.xp ?? 0);

  const xpByCategory = (e: typeof entries[0]) =>
    category === "school" ? e.school_xp :
    category === "coding" ? e.coding_xp :
    e.total_xp;

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const currentScrollY = target.scrollTop !== undefined ? target.scrollTop : window.scrollY;

      if (currentScrollY === undefined) return;

      if (currentScrollY > lastScrollY.current + 5 && currentScrollY > 50) {
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, []);

  return (
    <MobileFrame>
      <div className="flex md:hidden items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <img 
            src={showCodingLogo ? logoCodingImg : logoImg} 
            alt="Wisdawn Logo" 
            className="h-8 w-8 object-contain" 
          />
          <span className="text-2xl font-bold text-primary">Wisdawn</span>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1">
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

      <hr className="block md:hidden border-t border-border/60 mx-5 mb-2" />

      <header className="flex md:hidden items-center justify-between px-5 pt-2 pb-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Rankings</h1>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            All Assam State Ranks <ChevronDown className="h-3.5 w-3.5" />
          </p>
        </div>
        
      </header>

      <div className="px-5 pb-2 md:hidden">
        <div className="relative rounded-full bg-slate-100 p-1 flex shadow-inner overflow-hidden">
          <div
            className="absolute inset-y-1 rounded-full shadow-sm transition-all duration-300 bg-primary"
            style={{
              width: "calc(33.33% - 4px)",
              left: activeTab === "All" ? "4px" : activeTab === "School" ? "calc(33.33% + 2px)" : "calc(66.66%)",
            }}
            aria-hidden
          />
          {(["All", "School", "Coding"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`relative z-10 flex-1 rounded-full py-2 text-xs font-bold transition-colors duration-300 truncate px-1 ${activeTab === t ? "text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-40 pt-2">
        <div className="hidden md:flex justify-between items-center mb-6 px-5 md:px-0">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500" /> Leaderboard
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Assam State Rankings</p>
          </div>
          <div className="flex gap-2">
            {(["All", "School", "Coding"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`rounded-full px-5 py-2 text-xs font-bold border shadow-sm transition ${activeTab === t ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-0 md:px-0">
          <div className="lg:col-span-2">
            <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-3 text-[11px] font-bold text-slate-400 tracking-widest uppercase border-b border-slate-200/60 mb-2">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-6">Student</div>
              <div className="col-span-2">District</div>
              <div className="col-span-2 text-right">XP</div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : entries.length === 0 ? (
              <div className="mx-5 md:mx-0 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-500 font-medium">
                No rankings yet. Start learning to appear here!
              </div>
            ) : (
              <div className="flex flex-col">
                {entries.map((u) => {
                  const isMe = u.uid === user?.uid;
                  
                  const rowAvatar = isMe ? (profile as any)?.avatar : (u as any)?.avatar;

                  return (
                    <div
                      key={u.uid}
                      className={`flex items-center gap-3 py-3 px-5 transition-colors border-b border-slate-50 ${isMe ? "bg-primary/10" : "bg-white hover:bg-slate-50/50"}`}
                    >
                      <div className="w-8 flex justify-center items-center shrink-0">
                        <RankMedalBadge rank={u.rank} />
                      </div>

                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold text-sm overflow-hidden ${
                        u.rank === 1 ? "bg-amber-100 text-amber-600" :
                        u.rank === 2 ? "bg-slate-100 text-slate-500" :
                        u.rank === 3 ? "bg-orange-100 text-orange-600" :
                        "bg-primary/10 text-primary"
                      }`}>
                        {rowAvatar ? (
                          <img src={rowAvatar} alt={u.name} className="h-full w-full object-cover p-0.5 rounded-full" />
                        ) : (
                          u.name.split(" ").map((p: string) => p[0]).join("").toUpperCase().slice(0, 2)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {u.name}{isMe ? " (You)" : ""}
                        </p>
                        <p className="truncate text-[11px] text-slate-500 mt-0.5">
                          {u.district}
                        </p>
                      </div>

                      <div className="hidden md:block col-span-2 text-xs font-medium text-slate-500">
                        {u.district}
                      </div>

                      <div className="text-right flex flex-col items-end justify-center shrink-0">
                        <div className="flex items-center gap-1">
                          <XPCoin className="h-3.5 w-3.5" />
                          <p className="text-[15px] font-bold text-slate-900">
                            {xpByCategory(u).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          XP POINTS
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" /> Your Rank Stats
              </h3>
              <div className="flex flex-col items-center py-5 text-center">
                <Wisby variant="cheer" className="h-28 w-28 drop-shadow-md" />
                <h4 className="text-lg font-black text-slate-900 mt-3">
                  {userRankNumber ? `Rank #${userRankNumber} in Assam` : "Unranked"}
                </h4>
                <p className="text-xs font-medium text-slate-500 mt-1 px-4 leading-relaxed">
                  Keep learning to climb the leaderboard!
                </p>
              </div>
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Your XP</span>
                  <div className="flex items-center gap-1.5">
                    <XPCoin className="h-4 w-4" />
                    <span className="text-sm text-slate-900 font-bold">{myXP.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 shadow-sm">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-widest">
                <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" /> Leaderboard
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Updated every 10 min</h4>
              <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                Complete lessons to climb higher!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky current user bar */}
      <div 
        className={`md:hidden fixed left-0 w-full z-10 transition-all duration-300 ease-in-out ${
          isNavVisible 
            ? "bottom-[calc(env(safe-area-inset-bottom)+72px)]" 
            : "bottom-[env(safe-area-inset-bottom)]"
        }`}
      >
        <div className="relative bg-primary px-5 py-3 shadow-lg">
          
          <AnimatedZigZag />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 flex justify-center items-center shrink-0">
              {userRankNumber && userRankNumber <= 3 ? (
                <RankMedalBadge rank={userRankNumber} />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center font-bold text-white text-sm">
                  {userRankNumber ? userRankNumber : "—"}
                </div>
              )}
            </div>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-primary shadow-sm overflow-hidden">
              {(profile as any)?.avatar ? (
                <img src={(profile as any).avatar} alt={displayName} className="h-full w-full object-cover p-0.5 rounded-full" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{displayName}</p>
              <p className="truncate text-xs text-white/80 mt-0.5">
                {profile?.district ?? "Assam"}
              </p>
            </div>
            <div className="text-right flex flex-col items-end shrink-0">
              <div className="flex items-center gap-1">
                <XPCoin className="h-3.5 w-3.5" />
                <p className="text-[15px] font-bold text-white">{myXP.toLocaleString()}</p>
              </div>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-0.5">POINTS</p>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}