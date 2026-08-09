import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Filter, Trophy, Sparkles, Award, ChevronDown } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";
import { useAuth } from "@/hooks/use-auth";


import logoImg from "@/assets/jjj.png";

export const Route = createFileRoute("/rankings")({
  head: () => ({ meta: [{ title: "Rankings — WisDawn" }] }),
  component: Rankings,
});

type Category = "All" | "School (Science)" | "Coding Bootcamp";

const topUsers = [
  { r: 1, n: "Priya Sharma", c: "Guwahati", p: 9840, m: "🥇", track: "School (Science)" as const },
  { r: 2, n: "Arjun Mehta", c: "Dibrugarh", p: 9210, m: "🥈", track: "School (Science)" as const },
  { r: 3, n: "Kavya Reddy", c: "Jorhat", p: 8750, m: "🥉", track: "Coding Bootcamp" as const },
  { r: 4, n: "Rohan Das", c: "Silchar", p: 8100, track: "School (Science)" as const },
  { r: 5, n: "Sneha Patel", c: "Nagaon", p: 7890, track: "Coding Bootcamp" as const },
  { r: 6, n: "Aman Verma", c: "Tezpur", p: 7430, track: "School (Science)" as const },
  { r: 7, n: "Isha Bora", c: "Tinsukia", p: 7120, track: "Coding Bootcamp" as const },
];

// Reusable SVG Coin Icon to match the header
const XPCoin = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-sm border border-yellow-400 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-full w-full p-0.5 text-amber-700 opacity-90">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  </div>
);

// Animated Waving ZigZag Layer
function AnimatedZigZag({ speed = 120, opacityClass = "opacity-20", offset = 0 }: { speed?: number, opacityClass?: string, offset?: number }) {
  const CONE_COUNT = 12;
  const COLORS = [
    "text-blue-500",
    "text-purple-500",
    "text-emerald-500",
    "text-amber-500",
  ];
  const [tick, setTick] = useState(offset);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), speed);
    return () => clearInterval(timer);
  }, [speed]);

  const cycleLength = CONE_COUNT * 2 + 5;
  const currentCycle = Math.floor(tick / cycleLength);
  const phaseTick = tick % cycleLength;
  const currentColor = COLORS[currentCycle % COLORS.length];

  return (
    <div className={`absolute bottom-0 left-0 w-full flex items-end z-0 pointer-events-none h-full ${opacityClass}`}>
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

function Rankings() {
  const navigate = useNavigate();
  const { initials, displayName, profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const visibleUsers = topUsers.filter(
    (user) => activeCategory === "All" || user.track === activeCategory,
  );

  return (
    <MobileFrame>
      {/* WISDAWN BRANDING & POINTS HEADER */}
      <div className="flex md:hidden items-center justify-between px-5 pt-4 pb-3 bg-white border-b border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="Wisdawn Logo" className="h-8 w-8 object-contain" />
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Wisdawn</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-50 border border-slate-100 px-3 py-1 shadow-sm">
          <XPCoin className="h-6 w-6" />
          <span className="text-[15px] font-black text-slate-800">
            {profile?.stats?.xp ?? 0}
          </span>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <header className="flex md:hidden items-center justify-between px-5 pt-6 pb-2">
        <div className="flex flex-col">
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">Rankings</h1>
          <p className="text-[13px] font-medium text-slate-500 mt-0.5 flex items-center gap-1">
            ASOM State (All Assam) <ChevronDown className="h-3 w-3" />
          </p>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 hover:bg-slate-100 transition shadow-sm border border-slate-100 text-slate-600">
          <Filter className="h-4 w-4" />
        </button>
      </header>

      {/* SEGMENTED TABS */}
      <div className="px-5 pt-2 pb-1 md:hidden">
        <div className="relative rounded-full bg-slate-100 p-1 flex shadow-inner overflow-hidden">
          {/* Active Pill Background indicator */}
          <div
            className={`absolute inset-y-1 rounded-full shadow-sm transition-all duration-300 bg-blue-600`}
            style={{ 
              width: activeCategory === "All" ? '33.33%' : activeCategory === "School (Science)" ? '33.33%' : '33.33%',
              left: activeCategory === "All" ? '4px' : activeCategory === "School (Science)" ? 'calc(33.33%)' : 'calc(66.66% - 4px)' 
            }}
            aria-hidden
          />
          {(["All", "School (Science)", "Coding Bootcamp"] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`relative z-10 flex-1 rounded-full py-2.5 text-[11px] font-bold transition-colors duration-300 truncate px-1 ${activeCategory === category ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {category === "School (Science)" ? "School" : category === "Coding Bootcamp" ? "Coding" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* RESPONSIVE LAYOUT BODY */}
      <div className="flex-1 overflow-y-auto md:overflow-visible pb-28 pt-2">
        {/* DESKTOP PAGE HEADER */}
        <div className="hidden md:flex justify-between items-center mb-8 px-5 md:px-0">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500" /> Leaderboard
            </h1>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">ASOM State Rankings (All Assam)</p>
          </div>

          <div className="flex gap-2 text-[13px]">
            {(["All", "School (Science)", "Coding Bootcamp"] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-5 py-2 font-bold transition-colors duration-300 border shadow-sm ${activeCategory === category
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 md:px-0">
          {/* LEADERBOARD LIST */}
          <div className="lg:col-span-2">
            {/* DESKTOP-ONLY HEADER FOR TABLE */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-3 text-[11px] font-bold text-slate-400 tracking-widest uppercase border-b border-slate-200/60 mb-2">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-6">Student</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2 text-right">Points (XP)</div>
            </div>

            <div className="flex flex-col divide-y divide-slate-100">
              {visibleUsers.map((u, idx) => (
                <div
                  key={u.r}
                  className="grid grid-cols-12 gap-3 md:gap-4 items-center py-4 px-2 hover:bg-slate-50/50 transition-colors group"
                >
                  {/* Rank */}
                  <div className="col-span-2 text-center flex justify-center">
                    {u.m ? (
                      <div className="text-[26px] drop-shadow-sm">{u.m}</div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-extrabold text-slate-500 text-[13px] border border-slate-200">
                        {u.r}
                      </div>
                    )}
                  </div>

                  {/* Name + Details */}
                  <div className="col-span-7 md:col-span-6 flex items-center gap-3 md:gap-4">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full font-bold text-[15px] border ${idx === 0 ? 'bg-amber-100 text-amber-700 border-amber-200' : idx === 1 ? 'bg-slate-200 text-slate-600 border-slate-300' : idx === 2 ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {u.n.split(" ").map((p) => p[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{u.n}</p>
                      <p className="truncate text-[12px] md:hidden text-slate-500 font-medium mt-0.5">{u.c}</p>
                    </div>
                  </div>

                  {/* City (Desktop only) */}
                  <div className="hidden md:block col-span-2 text-[13px] font-medium text-slate-500">
                    {u.c}
                  </div>

                  {/* Points */}
                  <div className="col-span-3 md:col-span-2 text-right flex flex-col items-end justify-center">
                    <div className="flex items-center gap-1.5">
                      <XPCoin className="h-3.5 w-3.5" />
                      <p className="text-[15px] font-black text-slate-900">{u.p.toLocaleString()}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 md:hidden">XP Points</p>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP CURRENT USER STATUS INTEGRATION */}
            <div className="hidden md:grid grid-cols-12 gap-3 items-center rounded-[24px] bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-100 p-5 mt-8 shadow-sm relative overflow-hidden">
               {/* Background Wave */}
               <div className="absolute inset-0 opacity-40 mix-blend-multiply">
                 <AnimatedZigZag speed={150} />
               </div>

              <div className="col-span-2 text-center flex justify-center relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-blue-200 font-extrabold text-blue-600 shadow-sm text-[15px]">
                  #12
                </div>
              </div>
              <div className="col-span-6 flex items-center gap-4 relative z-10">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-600 text-[18px] font-extrabold text-white border-2 border-white shadow-md">
                  {initials}
                </div>
                <div>
                  <p className="text-[16px] font-extrabold text-slate-900">{displayName} <span className="text-blue-600">(You)</span></p>
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5">Current user status</p>
                </div>
              </div>
              <div className="col-span-2 text-[13px] font-bold text-slate-500 relative z-10">{profile?.district || "—"}</div>
              <div className="col-span-2 flex items-center justify-end gap-1.5 relative z-10">
                <XPCoin className="h-5 w-5" />
                <span className="font-black text-slate-900 text-[18px]">
                  {(profile?.stats?.xp ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* RANKING STATS CARD */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" /> Your Rank Stats
              </h3>

              <div className="flex flex-col items-center py-6 text-center">
                <Wisby variant="cheer" className="h-32 w-32 drop-shadow-md" />
                <h4 className="text-[20px] font-black text-slate-900 mt-3">
                  {profile?.stats?.rank ? `Rank #${profile.stats.rank} in Assam` : "Unranked"}
                </h4>
                <p className="text-[13px] font-medium text-slate-500 mt-1.5 px-4 leading-relaxed">
                  Keep learning to climb to the top 10 list.
                </p>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-slate-500">Current Points</span>
                  <div className="flex items-center gap-1.5">
                    <XPCoin className="h-4 w-4" />
                    <span className="text-[15px] text-slate-900 font-black">{(profile?.stats?.xp ?? 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-slate-500">Next Rank (Rank #11)</span>
                  <div className="flex items-center gap-1.5">
                    <XPCoin className="h-4 w-4 opacity-50" />
                    <span className="text-[14px] text-slate-700 font-bold">5,600</span>
                  </div>
                </div>

                {/* Progress bar to next rank */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>XP to Level Up</span>
                    <span>360 XP</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: "70%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* LEADERBOARD TRENDS */}
            <div className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 shadow-sm">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-700 uppercase tracking-widest">
                <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" /> Weekly Streaks
              </span>
              <h4 className="text-[15px] font-bold text-slate-900 mt-3">Priya Sharma is leading!</h4>
              <p className="text-[13px] font-medium text-slate-500 mt-1.5 leading-relaxed">
                Priya from Guwahati holds Rank #1 this week with a perfect 9,840 XP score. You can do it too!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY FOOTER WITH ANIMATED WAVES */}
      <div className="md:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+64px)] left-0 w-full z-10">
        <div className="relative border-t border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 shadow-[0_-8px_30px_rgba(37,99,235,0.2)] overflow-hidden">
          {/* Animated Wave Background */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <AnimatedZigZag speed={150} opacityClass="opacity-100" />
            <AnimatedZigZag speed={200} offset={4} opacityClass="opacity-50" />
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-8 text-center text-[18px] font-black text-white drop-shadow-sm">
              {profile?.stats?.rank ? `#${profile.stats.rank}` : "—"}
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-[15px] font-extrabold text-blue-600 shadow-md">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-white leading-tight">{displayName}</p>
              <p className="truncate text-[11px] font-medium text-blue-100 mt-0.5">{profile?.district || "—"}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <XPCoin className="h-4 w-4 shadow-none" />
                <p className="text-[16px] font-black text-white drop-shadow-sm">{(profile?.stats?.xp ?? 0).toLocaleString()}</p>
              </div>
              <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-0.5">Points</p>
            </div>
          </div>
        </div>
      </div>
      
    </MobileFrame>
  );
}