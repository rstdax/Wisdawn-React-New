import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode, useEffect } from "react";
import {
  ChevronRight,
  User as UserIcon,
  HelpCircle,
  Info,
  MoreHorizontal,
  Award,
  Trophy,
  LogOut
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { signOutUser } from "@/lib/auth";
import { useXP } from "@/hooks/use-xp";
import { useLeaderboard, useUserRank } from "@/hooks/use-leaderboard";
import type { LeaderboardCategory } from "@/lib/leaderboard";

import wisbyAvatar from "../assets/jjj.jpeg";
import logoImg from "@/assets/jjj.png";
import logoCodingImg from "@/assets/logocoding.png";

const ANIMAL_FACES = [
  "🐶", "🐱", "🐭", "🐹", "🐰", 
  "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐸", "🐵", 
  "🦉", "🐔", "🐧", "🐦", "🐤"
];

const AVATARS = ANIMAL_FACES.map(
  (emoji) =>
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".92em" font-size="85" x="50%" text-anchor="middle">${emoji}</text></svg>`
    )}`
);

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — WisDawn" }] }),
  component: Profile,
});

const XPCoin = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-sm border border-yellow-400 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-full w-full p-0.5 text-amber-700 opacity-90">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  </div>
);

// Animated Cones/Scallops Component for Profile Card Background
function AnimatedZigZag() {
  const CONE_COUNT = 10;
  const COLORS = [
    "text-blue-500/10",
    "text-purple-500/10",
    "text-emerald-500/10",
    "text-amber-500/10",
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
    <div className="absolute bottom-0 left-0 w-full flex items-end z-0 pointer-events-none h-[30px]">
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

function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { initials, displayName, displayEmail, profile, loading, user } = useAuth();
  
  const savedTrack = typeof window !== "undefined" ? localStorage.getItem("wisdawn_track") : "school";
  const category: LeaderboardCategory = savedTrack === "coding" ? "coding" : "school";
  
  // Fetch live entries exactly like the rankings page
  const { data: entries = [] } = useLeaderboard(category, "assam");
  const { data: xpData } = useXP(user?.uid);
  const { data: myRank } = useUserRank(user?.uid, category, "assam");
  
  const liveXP = xpData?.total_xp ?? profile?.stats?.xp ?? 0;
  
  // Calculate rank dynamically with fallbacks (using || so it overrides 0)
  const currentUserEntry = entries.find((e) => e.uid === user?.uid);
  const userRankNumber = currentUserEntry?.rank || myRank || profile?.stats?.rank;
  
  const [name, setName] = useState("");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!loading && displayName && displayName !== "Learner") {
      setName(displayName);
    } else if (!loading && profile?.name) {
      setName(profile.name);
    }
  }, [loading, displayName, profile]);

  const handleSignOut = async () => {
    await signOutUser();
    navigate({ to: "/", replace: true }).then(() => {
      navigate({ to: "/auth" });
    });
  };

  return (
    <MobileFrame>
      <div className="flex md:hidden items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <img 
            src={savedTrack === "coding" ? logoCodingImg : logoImg} 
            alt="Wisdawn Logo" 
            className="h-8 w-8 object-contain" 
          />
          <span className="text-2xl font-bold text-primary">Wisdawn</span>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1">
          <XPCoin className="h-7 w-7" />
          <span className="text-xl font-bold text-amber-500">
            {liveXP.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <hr className="block md:hidden border-t border-border/60 mx-5 mb-2" />

      <div className="px-5 pt-6 pb-2 md:hidden bg-white">
        <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">Profile</h1>
        <p className="text-[13px] font-medium text-slate-500 mt-0.5">Manage your settings and support</p>
      </div>

      <div className="flex-1 overflow-y-auto md:overflow-visible pb-10 px-5 md:px-0 pt-4 bg-white">
        <div className="hidden md:block mb-8 pt-6 px-5 md:px-0">
          <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Profile
          </h1>
          <p className="text-[13px] font-medium text-slate-500 mt-0.5">
            Manage your profile, learning stats, and support
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-6">
          <div className="relative rounded-[24px] bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-100 shadow-sm overflow-hidden p-5 pb-0">
            <div className="absolute inset-0 z-0">
              <AnimatedZigZag />
            </div>

            <div className="relative z-10 pb-6">
              <div className="flex items-start gap-4">
                <img 
                  src={(profile as any)?.avatar || AVATARS[0]} 
                  alt="Profile Avatar" 
                  className="h-16 w-16 shrink-0 rounded-full object-cover border border-slate-200 bg-white shadow-sm p-1" 
                />
                <div className="min-w-0 flex-1 pt-1">
                  <p className="truncate text-[18px] font-extrabold text-slate-900 leading-none">{name || "Learner"}</p>
                  
                  <p className="truncate text-[13px] font-medium text-slate-500 mt-1">
                    {loading 
                      ? "Loading..." 
                      : (displayEmail || (profile as any)?.phoneNumber || (user as any)?.phoneNumber || "Phone User")}
                  </p>
                  
                  <span className="mt-2.5 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold tracking-widest uppercase text-primary">
                    {profile?.track || "Active Learner"}
                  </span>
                </div>
                <button
                  onClick={() => navigate({ to: "/profile/edit" })}
                  className="rounded-full bg-white px-4 py-2 text-[11px] font-extrabold text-slate-600 border border-slate-200 shadow-sm transition hover:bg-slate-50 hover:text-primary hover:border-primary/30 shrink-0"
                >
                  Edit
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Stat 
                  label="Badges" 
                  value={String(profile?.stats?.badges ?? 0)} 
                  icon={<Award className="h-4 w-4 text-purple-600" />}
                  iconBg="bg-purple-100 border border-purple-200"
                />
                <Stat 
                  label="XP Points" 
                  value={liveXP.toLocaleString("en-IN")} 
                  icon={<XPCoin className="h-4 w-4" />}
                  iconBg="bg-gradient-to-br from-yellow-300 to-amber-500 border border-yellow-400"
                />
                <Stat 
                  label="Rank" 
                  value={userRankNumber ? `#${userRankNumber}` : "—"} 
                  icon={<Trophy className="h-4 w-4 text-primary" />}
                  iconBg="bg-primary/10 border border-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Item
              icon={<HelpCircle className="h-4 w-4" />}
              label="Help & Support"
              active={false}
              onClick={() => navigate({ to: "/support" })}
            />
            <Item
              icon={<Info className="h-4 w-4" />}
              label="About Us"
              active={false}
              onClick={() => navigate({ to: "/about" })}
            />
            <Item
              icon={<MoreHorizontal className="h-4 w-4" />}
              label="More Settings"
              active={showMore}
              onClick={() => setShowMore(!showMore)}
            />
            {showMore && (
              <div className="bg-slate-50/50 p-4 animate-fade-in border-t border-slate-100 flex justify-center">
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-200 bg-red-50 py-3.5 text-[13px] font-bold text-red-600 transition hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

function Stat({ label, value, icon, iconBg }: { label: string; value: string; icon: ReactNode; iconBg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3 border border-slate-200/60 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm mb-2 ${iconBg}`}>
        {icon}
      </div>
      <p className="text-[16px] font-black text-slate-900 leading-tight">{value}</p>
      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

function Item({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-300 group ${
        active
          ? "bg-primary/5"
          : "bg-white hover:bg-slate-50"
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors duration-300 ${
          active 
            ? "bg-primary/10 border-primary/20 text-primary" 
            : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary"
        }`}
      >
        {icon}
      </span>
      <span className={`flex-1 text-[15px] transition-colors duration-300 ${active ? "font-bold text-primary" : "font-bold text-slate-800 group-hover:text-primary"}`}>
        {label}
      </span>
      <ChevronRight className={`h-5 w-5 transition-colors duration-300 ${active ? "text-primary" : "text-slate-300 group-hover:text-primary"}`} />
    </button>
  );
}