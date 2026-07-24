import { createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Code2,
  Sparkles,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  ChevronRight,
  Calendar,
  Award,
  Flame,
  Clock,
  Play,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";
import { useAuth } from "@/hooks/use-auth";
import { getSubjects, getLastWatched, type LastWatchedEntry, type Subject } from "@/lib/admin";
import { SubjectIcon } from "@/components/SubjectIcon";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  order: number;
  active: boolean;
};

async function getActiveBanners(): Promise<Banner[]> {
  const snap = await getDocs(
    query(collection(db, "banners"), where("active", "==", true), orderBy("order", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
}

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — WisDawn" }] }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search as Record<string, string | undefined>;
  const { initials, displayName, profile, loading, user } = useAuth();

  // Real-time greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const greeting = getGreeting();

  const tab = search?.track === "coding" ? "coding" : (search?.track === "school" ? "school" : (typeof window !== "undefined" ? (localStorage.getItem("wisdawn_track") as "school" | "coding" || "school") : "school"));
  const setTab = (newTab: "school" | "coding") => {
    if (typeof window !== "undefined") localStorage.setItem("wisdawn_track", newTab);
    navigate({
      to: "/home",
      search: { track: newTab },
    });
  };

  const [showAlerts, setShowAlerts] = useState(false);
  const [showAllLastWatched, setShowAllLastWatched] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-slide banners every 4 seconds using React Query with a 5-minute cache
  const { data: banners = [], isLoading: bannersLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: getActiveBanners,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (banners.length <= 1) return;
    bannerTimer.current = setInterval(() => {
      setBannerIndex((i) => (i + 1) % banners.length);
    }, 4000);
    return () => { if (bannerTimer.current) clearInterval(bannerTimer.current); };
  }, [banners.length]);

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["homeSubjects", tab, profile?.cls],
    queryFn: async () => {
      const all = await getSubjects();
      return all.filter((s) => {
        if (s.track !== tab) return false;
        // Filter by user class for school track
        if (tab === "school" && profile?.cls && s.class && s.class !== profile.cls) return false;
        return true;
      }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 4);
    },
    enabled: !loading,
    staleTime: 5 * 60 * 1000,
  });

  const { data: lastWatched = [], isLoading: lastWatchedLoading } = useQuery({
    queryKey: ["lastWatched", user?.uid],
    queryFn: () => user ? getLastWatched(user.uid, 10) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  if (loading) {
    return (
      <MobileFrame>
        {/* MOBILE-ONLY HEADER */}
        <header className="flex md:hidden items-center justify-between gap-3 px-5 pt-2">
          <div className="relative flex-1 rounded-full bg-muted p-1">
            <div className="relative grid grid-cols-2">
              <div className="h-8 rounded-full bg-muted-foreground/10 animate-pulse" />
              <div className="h-8 rounded-full bg-muted-foreground/10 animate-pulse ml-2" />
            </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4 space-y-6">
          {/* Desktop Title Skeleton */}
          <div className="hidden md:block">
            <Skeleton className="h-8 w-48 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left & Center Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Greeting & Name Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 animate-pulse" />
                <Skeleton className="h-6 w-40 animate-pulse" />
              </div>

              {/* Hero Banner Skeleton */}
              <Skeleton className="h-[180px] md:h-[220px] w-full rounded-3xl animate-pulse" />

              {/* Subjects Section Skeleton */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32 animate-pulse" />
                  <Skeleton className="h-4 w-12 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                  <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                  <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                  <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                </div>
              </div>

              {/* Continue Learning Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-40 animate-pulse" />
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
                  <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
                </div>
              </div>
            </div>

            {/* Right Column (Desktop-Only Sidebar) */}
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              <Skeleton className="h-[250px] w-full rounded-3xl animate-pulse" />
              <Skeleton className="h-[180px] w-full rounded-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      {/* MOBILE-ONLY HEADER */}
      <header className="flex md:hidden items-center justify-between gap-3 px-5 pt-2">
        <div className="relative flex-1 rounded-full bg-muted p-1">
          <div
            className={`absolute inset-1 w-1/2 rounded-full shadow-lg transition-all duration-300 ${tab === "coding"
                ? "bg-linear-to-r from-violet-700 to-violet-500 translate-x-full"
                : "bg-primary translate-x-0"
              }`}
            aria-hidden
          />
          <div className="relative grid grid-cols-2">
            <button
              onClick={() => setTab("school")}
              className={`relative z-10 rounded-full py-2 text-xs font-semibold ${tab === "school" ? "text-white" : "text-muted-foreground"
                }`}
            >
              School Academy
            </button>
            <button
              onClick={() => setTab("coding")}
              className={`relative z-10 rounded-full py-2 text-xs font-semibold ${tab === "coding" ? "text-white" : "text-muted-foreground"
                }`}
            >
              Coding
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowAlerts((value) => !value)}
          className="grid h-9 w-9 place-items-center rounded-full active:bg-muted"
          aria-label="toggle alerts"
        >
          <Bell className="h-5 w-5" />
        </button>
      </header>

      {showAlerts && (
        <div className="mx-5 mt-3 rounded-2xl border border-border bg-card p-3 text-sm shadow-sm md:hidden">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Sparkles className="h-4 w-4" /> New updates ready
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            3 fresh lessons and 1 practice test are waiting for you.
          </p>
        </div>
      )}

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="flex-1 overflow-y-auto md:overflow-visible px-0 md:px-0 pb-6 pt-4">
        {/* DESKTOP PAGE TITLE */}
        <div className="hidden md:flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {tab === "school" ? "School Academy" : "Coding Bootcamp"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 md:px-0">
          {/* LEFT & CENTER COLUMN (Main Page Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* MOBILE USER BADGE */}
            <div className="flex md:hidden items-center gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{greeting}</p>
                <p className="text-base font-bold">{loading ? "Loading…" : displayName}</p>
              </div>
            </div>            {/* HERO BANNER CAROUSEL */}
            {bannersLoading ? (
              <Skeleton className="h-[180px] md:h-[220px] w-full rounded-3xl animate-pulse" />
            ) : banners.length > 0 ? (
              <div className="relative overflow-hidden rounded-3xl min-h-[180px] md:min-h-[220px]">
                {banners.map((banner, idx) => (
                  <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${idx === bannerIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                  >
                    {banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 h-full w-full object-cover" fetchPriority={idx === 0 ? "high" : "auto"} loading={idx === 0 ? "eager" : "lazy"} decoding="async" />
                    ) : null}
                    <div className={`absolute inset-0 ${banner.imageUrl ? "bg-black/40" : "bg-primary-soft"}`} />
                    <div className="relative z-10 p-6 md:p-8 flex flex-col justify-center h-full">
                      <h2 className={`text-xl md:text-3xl font-extrabold mt-1 ${banner.imageUrl ? "text-white" : "text-foreground"}`}>
                        {banner.title}
                      </h2>
                      {banner.subtitle && (
                        <p className={`text-xs md:text-sm mt-2 max-w-md ${banner.imageUrl ? "text-white/80" : "text-muted-foreground"}`}>
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.buttonText && (
                        <div className="mt-4 md:mt-6">
                          <Link
                             to={(banner.buttonLink as "/learn") || "/learn"}
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs md:text-sm font-semibold text-primary-foreground transition shadow-md shadow-primary/20 hover:scale-105"
                          >
                            {banner.buttonText}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {/* Dots */}
                {banners.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setBannerIndex(idx); if (bannerTimer.current) clearInterval(bannerTimer.current); }}
                        className={`h-1.5 rounded-full transition-all ${idx === bannerIndex ? "bg-white w-4" : "bg-white/50 w-1.5"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl bg-primary-soft p-6 md:p-8 flex flex-col justify-center min-h-[180px] md:min-h-[220px]">
                <h2 className="text-xl md:text-3xl font-extrabold text-foreground mt-1">
                  {displayName}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-md">
                  Learn better with School Academy for {profile?.cls || "your class"}
                </p>
                <div className="mt-4 md:mt-6">
                  <Link
                    to="/learn"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs md:text-sm font-semibold text-primary-foreground transition shadow-md shadow-primary/20 hover:scale-105"
                  >
                    Explore Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <Wisby
                  variant="thumbs"
                  className="absolute -bottom-3 -right-3 h-28 md:h-44 w-auto"
                />
              </div>
            )}

            {/* TRACK SPECIFIC CARDS: SUBJECTS OR COURSES */}
            {tab === "school" ? (
              <>
                <SectionHeader title="Available Subjects" linkTo="/learn" />
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {subjectsLoading ? (
                    <>
                      <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                      <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                      <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                      <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                    </>
                  ) : subjects.length === 0 ? (
                    <div className="col-span-2 md:col-span-4 rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground font-semibold">
                      No subjects yet. Admin can add subjects from the dashboard.
                    </div>
                  ) : subjects.map((s) => (
                    <FirebaseSubjectCard key={s.id} subject={s} type="school" />
                  ))}
                </div>
              </>
            ) : (
              <>
                <SectionHeader title="Available Courses" linkTo="/learn?tab=courses" />
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {subjectsLoading ? (
                    <>
                      <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                      <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                      <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                      <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                    </>
                  ) : subjects.length === 0 ? (
                    <div className="col-span-2 md:col-span-4 rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground font-semibold">
                      No coding courses yet. Admin can add them from the dashboard.
                    </div>
                  ) : subjects.map((s) => (
                    <FirebaseSubjectCard key={s.id} subject={s} type="coding" />
                  ))}
                </div>
              </>
            )}

            {/* CONTINUE LEARNING */}
            <SectionHeader 
              title="Continue Learning" 
              onClickViewAll={lastWatched.length > 3 ? () => setShowAllLastWatched(!showAllLastWatched) : undefined} 
              viewAllText={showAllLastWatched ? "View Less" : "View All"} 
            />
            <div className="mt-3 space-y-3">
              {lastWatchedLoading ? (
                <>
                  <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
                  <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
                </>
              ) : lastWatched.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground font-semibold">
                  Start watching a chapter to track your progress here.
                </div>
              ) : (showAllLastWatched ? lastWatched : lastWatched.slice(0, 3)).map((entry) => (
                <Link key={entry.chapterId} to="/chapter/$id" params={{ id: entry.chapterId }} className="block">
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-sm">
                    {entry.videoId ? (
                      <div className="relative h-12 w-20 shrink-0 rounded-xl overflow-hidden bg-black/5">
                        <img src={`https://img.youtube.com/vi/${entry.videoId}/mqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary font-bold text-lg">
                        📖
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{entry.chapterTitle}</p>
                      <p className="truncate text-xs text-muted-foreground">{entry.subjectTitle}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(entry.watchedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <div className="grid md:hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Play className="h-4 w-4 fill-current" />
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-1.5 ml-4">
                      <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/95">
                        Continue
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>



            {/* MOBILE ONLY FOOTER XP BANNER */}
            <div className="mt-6 flex md:hidden items-center justify-between rounded-2xl bg-primary-soft p-4">
              <div>
                <p className="text-sm font-bold">Keep it up, {loading ? "…" : displayName.split(" ")[0]}!</p>
                <p className="text-xs text-muted-foreground">{(profile?.stats?.xp ?? 0).toLocaleString()} XP · {profile?.stats?.rank ? `Rank #${profile.stats.rank}` : "Unranked"}</p>
              </div>
              <Wisby variant="thumbs" className="-mb-2 -mr-2 h-20" />
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop-Only Sidebar Widgets) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* PROGRESS CARD */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Your Progress</h3>
                <Link to="/profile" className="text-xs font-semibold text-primary hover:underline">
                  {tab === "school" ? "View Profile" : "View Details"}
                </Link>
              </div>

              {tab === "coding" ? (
                <div className="flex flex-col items-center py-4">
                  {/* Circle SVG Progress Chart */}
                  <div className="relative h-32 w-32 flex items-center justify-center">
                    <svg className="absolute transform -rotate-90 w-full h-full">
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-muted"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-primary transition-all duration-500"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={2 * Math.PI * 50 * (1 - 0.45)}
                      />
                    </svg>
                    <div className="text-center">
                      <span className="text-2xl font-extrabold text-foreground">45%</span>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        Progress
                      </p>
                    </div>
                  </div>

                  {/* Coding Stats Grid */}
                  <div className="w-full mt-6 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-muted/40 rounded-xl">
                      <p className="font-extrabold text-foreground">{profile?.stats?.courses ?? 0}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Enrolled</p>
                    </div>
                    <div className="p-2 bg-muted/40 rounded-xl">
                      <p className="font-extrabold text-foreground">0 / 40</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Lessons</p>
                    </div>
                    <div className="p-2 bg-muted/40 rounded-xl">
                      <p className="font-extrabold text-primary">{(profile?.stats?.xp ?? 0).toLocaleString()}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">XP Earned</p>
                    </div>
                  </div>

                  {/* Streak banner */}
                  <div className="w-full mt-4 flex items-center justify-between p-3 rounded-2xl bg-orange-50 border border-orange-100 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-orange-700">
                      <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
                      <span>7 Days Streak</span>
                    </div>
                    <span className="text-orange-600 font-bold">Keep it up!</span>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  {/* Spline Wave Line Chart placeholder using SVG */}
                  <div className="h-28 w-full flex flex-col justify-end">
                    <svg className="w-full h-20" viewBox="0 0 200 80">
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,60 Q 25,45 50,55 T 100,20 T 150,30 T 200,10"
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="3"
                      />
                      <path
                        d="M 0,60 Q 25,45 50,55 T 100,20 T 150,30 T 200,10 L 200,80 L 0,80 Z"
                        fill="url(#gradient)"
                      />
                      <circle cx="100" cy="20" r="4" fill="var(--color-primary)" />
                      <circle cx="200" cy="10" r="4" fill="var(--color-primary)" />
                    </svg>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-2 px-1 font-semibold">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  {/* School Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                    <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center">
                      <span className="text-muted-foreground">Courses</span>
                      <span className="font-bold text-foreground">{profile?.stats?.courses ?? 0}</span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center">
                      <span className="text-muted-foreground">Badges</span>
                      <span className="font-bold text-foreground">{profile?.stats?.badges ?? 0}</span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center">
                      <span className="text-muted-foreground">Points</span>
                      <span className="font-bold text-primary">{(profile?.stats?.xp ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center">
                      <span className="text-muted-foreground">Rank</span>
                      <span className="font-bold text-foreground">{profile?.stats?.rank ? `#${profile.stats.rank}` : "—"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* UPCOMING SCHEDULE */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">
                  {tab === "school" ? "Upcoming Schedule" : "Upcoming Live Sessions"}
                </h3>
                <Link to="/tests" className="text-xs font-semibold text-primary hover:underline">
                  View Calendar
                </Link>
              </div>

              <div className="space-y-3">
                {tab === "school" ? (
                  <>
                    <ScheduleRow
                      icon={<BookOpen className="h-4 w-4 text-primary" />}
                      title="Physics Live Class"
                      time="Today, 5:00 PM"
                      action={
                        <button className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground transition hover:scale-105">
                          Join Now
                        </button>
                      }
                    />
                    <ScheduleRow
                      icon={<Calendar className="h-4 w-4 text-emerald-600" />}
                      title="Chemistry Assignment"
                      time="Due: Tomorrow, 11:59 PM"
                    />
                  </>
                ) : (
                  <>
                    <ScheduleRow
                      icon={<Code2 className="h-4 w-4 text-primary" />}
                      title="Python Basics Live Class"
                      time="Today, 5:00 PM - 6:00 PM"
                      action={
                        <button className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground transition hover:scale-105">
                          Join Now
                        </button>
                      }
                    />
                    <ScheduleRow
                      icon={<Clock className="h-4 w-4 text-violet-600" />}
                      title="Web Development Q&A"
                      time="Tomorrow, 7:00 PM - 8:00 PM"
                      action={
                        <button className="rounded-full border border-border px-3 py-1.5 text-[10px] font-bold text-muted-foreground transition hover:bg-muted">
                          Remind Me
                        </button>
                      }
                    />
                  </>
                )}
              </div>
            </div>

            {/* RECENT ACHIEVEMENTS */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Recent Achievements</h3>
                <Link to="/profile" className="text-xs font-semibold text-primary hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                <AchievementRow
                  color="bg-amber-100 text-amber-700"
                  icon={<Award className="h-4 w-4" />}
                  title="Quiz Master"
                  desc="Score 90% in Quiz"
                  points="+50 pts"
                />
                <AchievementRow
                  color="bg-emerald-100 text-emerald-700"
                  icon={<Award className="h-4 w-4" />}
                  title={tab === "school" ? "Science Explorer" : "Lesson Completer"}
                  desc={tab === "school" ? "Completed 5 Lessons" : "Completed 5 Lessons"}
                  points="+30 pts"
                />
                <AchievementRow
                  color="bg-violet-100 text-violet-700"
                  icon={<Award className="h-4 w-4" />}
                  title="Consistent Learner"
                  desc="7 Days Streak"
                  points="+70 pts"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </MobileFrame>
  );
}

function SectionHeader({ title, linkTo, onClickViewAll, viewAllText = "View All" }: { title: string; linkTo?: string; onClickViewAll?: () => void; viewAllText?: string; }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <h2 className="text-base font-bold">{title}</h2>
      {linkTo ? (
        <Link to={linkTo} className="text-xs font-semibold text-primary">{viewAllText}</Link>
      ) : onClickViewAll ? (
        <button onClick={onClickViewAll} className="text-xs font-semibold text-primary hover:underline cursor-pointer">{viewAllText}</button>
      ) : (
        <span className="text-xs font-semibold text-primary">{viewAllText}</span>
      )}
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  desc,
  to,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-start justify-between rounded-2xl border border-border bg-card p-3"
    >
      <div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
          {icon}
        </div>
        <p className="mt-3 text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function FirebaseSubjectCard({ subject, type = "school" }: { subject: Subject; type?: "school" | "coding" }) {
  return (
    <SubjectCard
      icon={<SubjectIcon icon={subject.icon} className="h-10 w-10 rounded-xl" />}
      title={subject.title}
      sub={subject.class || ""}
      coverImage={subject.coverImage}
      to={`/subject/${subject.id}`}
    />
  );
}

function SubjectCard({
  icon,
  title,
  sub,
  coverImage,
  to,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  coverImage?: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="relative rounded-2xl overflow-hidden flex flex-col justify-between transition hover:shadow-sm min-h-[140px]"
    >
      {/* Cover image — full opacity, fills card completely */}
      {coverImage ? (
        <img
          src={coverImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-card border border-border rounded-2xl" />
      )}
      {/* Gradient overlay bottom — keeps text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative p-4 flex flex-col justify-between h-full">
        <div className="mt-auto pt-3">
          <p className="text-sm font-bold text-white drop-shadow-md">{title}</p>
          <p className="text-[11px] text-white/75">{sub}</p>
        </div>
      </div>
    </Link>
  );
}

function CourseCard({
  color,
  icon,
  title,
  sub,
  coverImage,
}: {
  color: string;
  icon: ReactNode;
  title: string;
  sub: string;
  coverImage?: string;
}) {
  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-border bg-card p-4 overflow-hidden transition hover:shadow-sm">
      {coverImage && (
        <img src={coverImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      )}
      <div className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-xl ${color}`}>{icon}</div>
      <div className="relative min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <span className="relative hidden md:grid h-8 w-8 place-items-center rounded-full bg-muted/60 text-muted-foreground transition hover:bg-muted">
        <ChevronRight className="h-4 w-4" />
      </span>
    </div>
  );
}



function ScheduleRow({
  icon,
  title,
  time,
  action,
}: {
  icon: ReactNode;
  title: string;
  time: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/20 border border-border/40">
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{title}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{time}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function AchievementRow({
  color,
  icon,
  title,
  desc,
  points,
}: {
  color: string;
  icon: ReactNode;
  title: string;
  desc: string;
  points: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-muted/10 border border-border/20">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${color} shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{title}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <span className="text-[10px] font-extrabold text-primary shrink-0 bg-primary-soft px-2 py-0.5 rounded-md">
        {points}
      </span>
    </div>
  );
}
