import { createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useRef, type MouseEvent, type ReactNode } from "react";
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
  FileText,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";
import { useAuth } from "@/hooks/use-auth";
import { getSubjects, getLastWatched, type LastWatchedEntry, type Subject } from "@/lib/admin";
import { getCourseIntroChapterId } from "@/lib/course-navigation";
import { SubjectIcon } from "@/components/SubjectIcon";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

import logoImg from "@/assets/jjj.jpeg";
import girlImg from "@/assets/girl.png";

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

// NEW: Animated Cones Component
// NEW: Animated Cones Component (Hanging Downwards)
function AnimatedZigZag() {
  const CONE_COUNT = 12; // Number of triangles across the screen
  const COLORS = [
    "text-purple-300/80",
    "text-emerald-300/80",
    "text-amber-300/80",
    "text-blue-300/80"
  ];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Ticks every 120ms to drive the sequential animation
    const timer = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(timer);
  }, []);

  const cycleLength = CONE_COUNT * 2 + 8; // Total ticks for one full show/hide cycle
  const currentCycle = Math.floor(tick / cycleLength);
  const phaseTick = tick % cycleLength;
  const currentColor = COLORS[currentCycle % COLORS.length];

  return (
    // Positioned at top-full to hang directly below the container
    <div className="absolute top-full left-0 w-[calc(100%+40px)] -mx-5 md:w-full md:mx-0 flex z-0 pointer-events-none drop-shadow-sm h-[20px] md:h-[28px]">
      {Array.from({ length: CONE_COUNT }).map((_, i) => {
        // Math to make them emerge left-to-right, pause, then hide left-to-right
        const isShown = phaseTick >= i && phaseTick < (CONE_COUNT + 4 + i);
        return (
          <div 
            key={i} 
            // Changed origin-bottom to origin-top so they grow downwards
            className={`flex-1 transition-transform duration-300 ease-out origin-top ${currentColor} ${isShown ? "scale-y-100" : "scale-y-0"}`}
          >
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full block">
              {/* Flipped polygon: Flat on top (0,0 to 100,0), point at bottom (50,100) */}
              <polygon points="0,0 100,0 50,100" fill="currentColor" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

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

  const { data: allSubjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["allSubjects"],
    queryFn: getSubjects,
    staleTime: 5 * 60 * 1000,
  });

  const subjects = allSubjects.filter((s) => {
    if (s.track !== tab) return false;
    if (tab === "school" && profile?.cls && s.class && s.class !== profile.cls) return false;
    return true;
  }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 4);

  const { data: lastWatched = [], isLoading: lastWatchedLoading } = useQuery({
    queryKey: ["lastWatched", user?.uid],
    queryFn: () => user ? getLastWatched(user.uid, 10) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  if (loading) {
    return (
      <MobileFrame>

        {/* NEW: WISDAWN BRANDING & POINTS HEADER */}
    <div className="flex md:hidden items-center justify-between px-5 pt-4 pb-2">
      {/* Left Side: Logo and Name */}
      <div className="flex items-center gap-2">
        <img src={logoImg} alt="Wisdawn Logo" className="h-8 w-8 object-contain" />
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
          {profile?.stats?.xp ?? 0}
        </span>
      </div>
    </div>

    {/* THE DIVIDER LINE */}
    <hr className="block md:hidden border-t border-border/60 mx-5 mb-2" />

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
              <div className="relative">
                <Skeleton className="h-[180px] md:h-[220px] w-full rounded-3xl animate-pulse" />
                {banners.length > 0 && banners[0].imageUrl && (
                  <img src={banners[0].imageUrl} style={{ display: "none" }} fetchPriority="high" loading="eager" alt="" />
                )}
              </div>

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

    {/* NEW: WISDAWN BRANDING & POINTS HEADER */}
    <div className="flex md:hidden items-center justify-between px-5 pt-4 pb-2">
      {/* Left Side: Logo and Name */}
      <div className="flex items-center gap-2">
        <img src={logoImg} alt="Wisdawn Logo" className="h-8 w-8 object-contain" />
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
          {profile?.stats?.xp ?? 0}
        </span>
      </div>
    </div>

    {/* THE DIVIDER LINE */}
    <hr className="block md:hidden border-t border-border/60 mx-5 mb-2" />

      {/* MOBILE-ONLY HEADER */}
      <header className="flex md:hidden items-center justify-between gap-3 px-5 pt-2">
        <div className="relative flex-1 rounded-full bg-muted p-1">
          <div
            className={`absolute inset-1 w-1/2 rounded-full shadow-lg transition-all duration-300 bg-primary ${tab === "coding" ? "translate-x-full" : "translate-x-0"}`}
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
        <Link
          to="/notifications"
          className="grid h-9 w-9 place-items-center rounded-full bg-slate-50 hover:bg-slate-100 transition shrink-0 text-slate-700"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
        </Link>
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
                <p className="text-xl font-bold">{loading ? "Loading…" : displayName}</p>
              </div>
            </div>            
            {/* HERO BANNER CAROUSEL */}
            {bannersLoading ? (
              <Skeleton className="h-[180px] md:h-[220px] w-[calc(100%+40px)] -mx-5 md:w-full md:mx-0 rounded-none md:rounded-3xl animate-pulse" />
            ) : banners.length > 0 ? (
              // NEW WRAPPER: Gives room for cones to hang
              <div className="relative mb-6 md:mb-8">
                {/* Image Container (Keeps overflow-hidden) */}
                <div className="relative overflow-hidden w-[calc(100%+40px)] -mx-5 md:w-full md:mx-0 rounded-none md:rounded-3xl min-h-[200px] md:min-h-[220px] z-10">
                  {banners.map((banner, idx) => (
                    <div
                      key={banner.id}
                      className={`absolute inset-0 transition-opacity duration-700 ${idx === bannerIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                    >
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 h-full w-full object-cover" fetchPriority={idx === 0 ? "high" : "auto"} loading={idx === 0 ? "eager" : "lazy"} decoding="async" />
                      ) : null}
                      <div className={`absolute inset-0 ${banner.imageUrl ? "bg-transparent" : "bg-primary-soft"}`} />
                      <div className="relative z-10 p-6 px-8 md:p-8 flex flex-col justify-center h-full max-w-[85%] md:max-w-[60%]">
                        {banner.title && (
                          <h2 className={`text-2xl md:text-4xl font-extrabold mt-1 max-w-[180px] md:max-w-[280px] leading-tight ${banner.imageUrl ? "text-slate-900" : "text-foreground"}`}>
                            {banner.title}
                          </h2>
                        )}
                        {banner.subtitle && (
                          <p className={`text-xs md:text-sm mt-2 whitespace-nowrap overflow-hidden text-ellipsis ${banner.imageUrl ? "text-slate-700 font-medium" : "text-muted-foreground"}`}>
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.buttonText && (
                          <div className="mt-4 md:mt-6">
                            <Link
                              to={(banner.buttonLink as "/learn") || "/learn"}
                              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs md:text-sm font-bold text-slate-800 transition shadow-sm hover:bg-slate-50 hover:scale-105"
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
                    <div className="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
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
                {/* NEW: Hanging ZigZag placed outside overflow-hidden */}
                <AnimatedZigZag />
              </div>
            ) : (
              <div className="relative mb-6 md:mb-8">
                <div className="relative overflow-hidden w-[calc(100%+40px)] -mx-5 md:w-full md:mx-0 rounded-none md:rounded-3xl bg-primary-soft p-6 px-8 md:p-8 flex flex-col justify-center min-h-[180px] md:min-h-[220px] z-10">
                  <div className="relative z-20">
                    <h2 className="text-xl md:text-3xl font-extrabold text-foreground mt-1">
                      {displayName}
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-md">
                      Learn better with School Academy for {profile?.cls || "your class"}
                    </p>
                    <div className="mt-4 md:mt-6">
                      <Link
                        to="/learn"
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs md:text-sm font-bold text-slate-800 transition shadow-sm hover:bg-slate-50 hover:scale-105"
                      >
                        Explore Now
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  
                  <Wisby
                    variant="thumbs"
                    className="absolute -bottom-3 -right-3 h-28 md:h-44 w-auto z-10"
                  />
                </div>
                {/* NEW: Hanging ZigZag placed outside overflow-hidden */}
                <AnimatedZigZag />
              </div>
            )}

            {/* TRACK SPECIFIC CARDS: SUBJECTS OR COURSES */}
            {tab === "school" ? (
              <>
                <SectionHeader title="Available Subjects" linkTo="/learn" />
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-2">
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
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-2">
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

            {/* NEW BANNER SECTION (Edge-to-Edge) */}
            <div className="mt-10 relative w-[calc(100%+40px)] -mx-5 md:w-full md:mx-0 overflow-hidden md:rounded-[24px] bg-[#F4F7FB] pt-10 pb-0 flex flex-col md:flex-row shadow-sm border-y md:border border-slate-100">
              
              {/* Decorative Yellow Arc Background */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[55%] md:w-[60%] md:h-[130%] md:left-auto md:right-0 md:translate-x-0 bg-[#FDC02A] rounded-t-[50%] md:rounded-t-none md:rounded-tl-[100px] z-0 opacity-95" />
              
              {/* Green Sketch Lines */}
              <svg className="absolute top-10 right-6 w-40 opacity-70 z-0 hidden md:block" viewBox="0 0 200 60">
                <path d="M0,10 Q50,-5 100,10 T200,10 M0,25 Q50,10 100,25 T200,25 M0,40 Q50,25 100,40 T200,40" stroke="#22C55E" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>

              {/* Text Content */}
              <div className="relative z-10 w-full md:w-3/5 pb-12 md:pb-10 px-6 md:px-10">
                <p className="text-[9px] font-bold tracking-[0.15em] text-slate-500 uppercase mb-3">
                  Together we can make a difference
                </p>
                <h2 className="text-[28px] md:text-3xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                  Every child <span className="relative whitespace-nowrap">deserves
                    {/* Teal Underline */}
                    <svg className="absolute -bottom-1 left-0 w-full text-emerald-500" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 0 100 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </svg>
                  </span> <br /> the chance to learn.
                </h2>
                <p className="mt-4 text-[13px] font-medium text-slate-500 max-w-[260px] leading-relaxed">
                  Help us bring quality education to every child around the world.
                </p>
                <Link to="/learn" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Girl Image & Floating Elements */}
              <div className="relative z-10 w-full md:w-2/5 flex justify-center md:justify-end items-end mt-auto px-4">
                <img 
                  src={girlImg} 
                  alt="Child learning" 
                  className="w-[90%] max-w-[280px] md:max-w-[340px] h-auto object-contain object-bottom drop-shadow-2xl z-10" 
                />
                
                {/* Floating cross & check */}
                <div className="absolute top-4 left-[10%] text-orange-500 font-black text-2xl rotate-12">×</div>
                <div className="absolute top-1/3 right-[15%] text-emerald-500 font-bold text-3xl -rotate-12">✓</div>
                <div className="absolute bottom-10 right-[10%] h-4 w-4 rounded-full bg-indigo-500 shadow-md" />
              </div>

              {/* NEW: Graphical Grass Overlay */}
              <div className="absolute bottom-0 left-0 w-full h-10 md:h-14 z-20 pointer-events-none">
                <svg className="absolute bottom-0 w-full h-full text-lime-500" preserveAspectRatio="none" viewBox="0 0 1200 120">
                  {/* Background, slightly taller, lighter grass blades */}
                  <path fill="currentColor" opacity="0.6" d="M0,120 L0,40 L15,90 L35,20 L50,80 L75,10 L90,70 L115,30 L130,90 L160,15 L180,80 L210,25 L225,85 L250,35 L270,90 L295,10 L310,75 L335,20 L350,85 L380,15 L400,80 L425,30 L440,90 L470,25 L490,85 L515,15 L530,75 L560,20 L580,85 L605,10 L620,70 L645,30 L660,90 L685,15 L700,80 L725,25 L740,85 L765,20 L780,80 L805,10 L820,75 L845,30 L860,90 L885,15 L900,80 L925,25 L940,85 L965,20 L980,80 L1005,10 L1020,75 L1045,30 L1060,90 L1085,15 L1100,80 L1125,25 L1140,85 L1165,20 L1180,80 L1200,40 L1200,120 Z" />
                  {/* Foreground, shorter, denser grass blades */}
                  <path fill="currentColor" opacity="0.95" d="M0,120 L0,70 L20,95 L40,50 L60,90 L85,45 L100,85 L120,60 L140,95 L170,40 L190,90 L220,55 L240,95 L260,65 L280,90 L300,45 L320,85 L340,50 L360,95 L390,40 L410,90 L430,60 L450,95 L480,55 L500,90 L520,45 L540,85 L560,65 L580,95 L610,40 L630,90 L650,50 L670,95 L690,45 L710,85 L730,60 L750,95 L780,40 L800,90 L820,55 L840,95 L860,65 L880,90 L900,45 L920,85 L940,50 L960,95 L990,40 L1010,90 L1030,60 L1050,95 L1080,55 L1100,90 L1120,45 L1140,85 L1160,65 L1180,95 L1200,70 L1200,120 Z" />
                </svg>
              </div>

            </div>

            {/* CONTINUE LEARNING */}
            {/* CONTINUE LEARNING */}
            <div className="mt-8 flex items-end justify-between">
              <div>
                <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Continue Learning</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Pick up where you left off</p>
              </div>
              {lastWatched.length > 3 && (
                <button 
                  onClick={() => navigate({ to: "/history" })} 
                  className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-col divide-y divide-slate-100">
              {lastWatchedLoading ? (
                <>
                  <div className="py-4"><Skeleton className="h-20 w-full rounded-2xl animate-pulse" /></div>
                  <div className="py-4"><Skeleton className="h-20 w-full rounded-2xl animate-pulse" /></div>
                </>
              ) : lastWatched.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground font-semibold mt-2">
                  Start watching a chapter to track your progress here.
                </div>
              ) : lastWatched.slice(0, 4).map((entry) => {
                const isVideo = !!entry.videoId;

                return (
                  <Link key={entry.chapterId} to="/chapter/$id" params={{ id: entry.chapterId }} className="flex items-center gap-3 md:gap-4 py-4 group">
                    
                    {/* 1. Left Large Icon / Thumbnail (Neutralized) */}
                    {isVideo ? (
                      <div className="relative h-16 w-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/50">
                        <img src={`https://img.youtube.com/vi/${entry.videoId}/mqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 transition-colors duration-300 group-hover:bg-blue-50/50">
                        <FileText className="h-7 w-7 text-slate-300 group-hover:text-blue-500 transition-colors duration-300" />
                      </div>
                    )}
                    
                    {/* 2. Middle Content */}
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        {/* Tiny inline icon */}
                        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-400 transition-colors duration-300 group-hover:bg-blue-100 group-hover:text-blue-600">
                          {isVideo ? <Play className="h-3 w-3 fill-current translate-x-[0.5px]" /> : <FileText className="h-3 w-3" />}
                        </div>
                        <p className="truncate text-[15px] font-bold text-slate-800 transition-colors duration-300 group-hover:text-blue-600">
                          {entry.chapterTitle}
                        </p>
                      </div>
                      <p className="truncate text-[13px] font-medium text-slate-500 mt-1">{entry.subjectTitle}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <p className="text-[11px] font-semibold">
                          {new Date(entry.watchedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>

                    {/* 3. Right Action Button (Neutralized until hovered) */}
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm transition-all duration-300 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white group-hover:scale-105">
                      <Play className="h-4 w-4 fill-current translate-x-[1px]" />
                    </div>
                  </Link>
                );
              })}
            </div>



            {/* MOBILE ONLY FOOTER XP BANNER (Redesigned Edge-to-Edge & Flush Bottom) */}
            <div className="mt-12 relative w-[calc(100%+40px)] -mx-5 -mb-6 md:hidden overflow-hidden bg-gradient-to-br from-[#F5F3FF] to-[#EBE6FF] pt-6 pb-0 flex items-center justify-between border-t border-[#E0D7FF]">
              
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top left soft glow */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/60 rounded-full blur-2xl" />
                
                {/* Floating 4-Point Star */}
                <div className="absolute top-6 left-[45%]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FBBF24">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>
                </div>
                
                {/* Floating Cross, Check, and Dot */}
                <div className="absolute bottom-10 left-6 text-[#A78BFA] font-black text-2xl rotate-45">+</div>
                <div className="absolute top-8 right-6 text-emerald-400 font-bold text-xl -rotate-12">✓</div>
                <div className="absolute bottom-16 right-4 h-2.5 w-2.5 rounded-full bg-[#A78BFA] opacity-60" />
                
                {/* Bottom Purple Grass / Zigzag */}
                <div className="absolute bottom-0 left-0 w-full h-6 text-[#DCD3FF]">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 20">
                    <path fill="currentColor" d="M0,20 L0,10 L5,18 L10,8 L15,15 L20,5 L25,18 L30,10 L35,16 L40,6 L45,15 L50,8 L55,18 L60,10 L65,16 L70,5 L75,18 L80,10 L85,15 L90,6 L95,18 L100,10 L100,20 Z" />
                  </svg>
                </div>
              </div>
              
              {/* Text Content */}
              <div className="relative z-10 pl-6 pb-6 w-3/5">
                <h2 className="text-[24px] font-extrabold text-[#1E1B4B] leading-tight tracking-tight">
                  Keep it up, {loading ? "…" : displayName.split(" ")[0]}!
                </h2>
                <p className="text-[13px] font-bold text-[#635B85] mt-1.5 uppercase tracking-wide">
                  {(profile?.stats?.xp ?? 0).toLocaleString()} XP 
                  <span className="mx-1.5 font-normal opacity-50">•</span> 
                  {profile?.stats?.rank ? `Rank #${profile.stats.rank}` : "Unranked"}
                </p>
              </div>
              
              {/* Wisby Mascot */}
              <div className="relative z-10 w-2/5 flex justify-end items-end pr-2 pt-2">
                <Wisby variant="thumbs" className="h-32 sm:h-36 w-auto object-contain drop-shadow-2xl translate-y-[2px]" />
              </div>
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
    <div className="mt-8 flex items-center justify-between">
      {/* Increased font size, weight, and tracking to match the new design */}
      <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">{title}</h2>
      
      {/* Updated the "View All" links to match the blue arrow style */}
      {linkTo ? (
        <Link to={linkTo} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
          {viewAllText} <ChevronRight className="h-4 w-4" />
        </Link>
      ) : onClickViewAll ? (
        <button onClick={onClickViewAll} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
          {viewAllText} <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <span className="text-sm font-semibold text-blue-600">{viewAllText}</span>
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
  const navigate = useNavigate();

  if (type === "coding") {
    const openCourseIntro = async (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const introChapterId = await getCourseIntroChapterId(subject.id);

      if (!introChapterId) {
        navigate({ to: "/subject/$id", params: { id: subject.id } });
        return;
      }

      navigate({ to: "/chapter/$id", params: { id: introChapterId } });
    };

    return (
      <Link
        to="/subject/$id"
        params={{ id: subject.id }}
        onClick={openCourseIntro}
        className="flex flex-col gap-2 group transition hover:opacity-95"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-border/40">
          {subject.coverImage ? (
            <img
              src={subject.coverImage}
              alt={subject.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
              <SubjectIcon icon={subject.icon} className="h-12 w-12 text-white" />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2">
            {subject.title}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
            {subject.description || "Dr. Angela Yu, Developer and Lead Instr..."}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-bold">
            <span className="text-amber-600">4.7</span>
            <div className="flex items-center text-amber-500">
              {[...Array(4)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
              ))}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" clipPath="url(#half)" /></svg>
            </div>
            <span className="text-muted-foreground font-normal ml-0.5">(472,738)</span>
          </div>
          <p className="text-[13px] font-extrabold text-foreground mt-1">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(subject.price ?? 3199)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <SubjectCard
      title={subject.title}
      sub={subject.class || ""}
      to={`/subject/${subject.id}`}
    />
  );
}

function SubjectCard({
  title,
  sub,
  to,
}: {
  title: string;
  sub: string;
  to: string;
}) {
  // SMART MAPPER: Assigns Emoji, soft background, stroke color, and a specific decoration!
  const getTheme = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("physics")) return { emoji: "🧲", bg: "text-red-50", stroke: "text-red-400", dec: "squiggle" };
    if (lower.includes("chemistry")) return { emoji: "🧪", bg: "text-emerald-50", stroke: "text-emerald-400", dec: "arc" };
    if (lower.includes("math")) return { emoji: "📐", bg: "text-blue-50", stroke: "text-blue-400", dec: "grid" };
    if (lower.includes("sanskrit")) return { emoji: "📜", bg: "text-amber-50", stroke: "text-amber-400", dec: "sparkle" };
    if (lower.includes("biology")) return { emoji: "🧬", bg: "text-green-50", stroke: "text-green-400", dec: "arc" };
    if (lower.includes("english")) return { emoji: "📚", bg: "text-rose-50", stroke: "text-rose-400", dec: "sparkle" };
    if (lower.includes("history")) return { emoji: "🏛️", bg: "text-yellow-50", stroke: "text-yellow-400", dec: "grid" };
    if (lower.includes("geography")) return { emoji: "🌍", bg: "text-cyan-50", stroke: "text-cyan-400", dec: "squiggle" };
    if (lower.includes("computer") || lower.includes("coding")) return { emoji: "💻", bg: "text-indigo-50", stroke: "text-indigo-400", dec: "grid" };
    
    // Default fallback
    return { emoji: "📓", bg: "text-slate-100", stroke: "text-slate-400", dec: "sparkle" };
  };

  const theme = getTheme(title);
  
  // Cleaned ID for unique SVG patterns (prevents rendering bugs when multiple cards load)
  const safeId = title.replace(/[^a-zA-Z0-9]/g, '');

  // 4 Wide, irregular organic blob shapes (Atrangila shapes!)
  const blobPaths = [
    "M 20,60 C 10,20 80,0 140,15 C 190,25 195,80 150,105 C 110,125 30,110 20,60 Z",
    "M 30,50 C 40,10 140,5 175,40 C 210,80 140,120 80,115 C 20,110 15,80 30,50 Z",
    "M 15,75 C 10,35 60,15 130,20 C 180,25 195,75 160,105 C 110,135 20,120 15,75 Z",
    "M 40,40 C 70,5 160,15 185,55 C 210,100 130,125 70,115 C 10,105 -5,75 40,40 Z"
  ];
  const blob = blobPaths[title.length % blobPaths.length];

  return (
    <Link to={to} className="flex flex-col items-center gap-1 transition group">
      {/* Responsive Wide Container */}
      <div className="relative flex w-[90%] max-w-[160px] aspect-[4/3] items-center justify-center transition-transform group-hover:scale-105 mx-auto">
        
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 200 130">
          {/* The main blob background */}
          <path className={theme.bg} fill="currentColor" d={blob} />
          
          {/* Dynamic Decorations (Tweaks) */}
          {theme.dec === "sparkle" && (
            <>
              {/* 4-point sparkle */}
              <path d="M 30 20 Q 30 30 40 30 Q 30 30 30 40 Q 30 30 20 30 Q 30 30 30 20 Z" className={theme.stroke} fill="currentColor" opacity="0.6" />
              <path d="M 170 80 Q 170 85 175 85 Q 170 85 170 90 Q 170 85 165 85 Q 170 85 170 80 Z" className={theme.stroke} fill="currentColor" opacity="0.5" />
              <circle cx="160" cy="25" r="2" className={theme.stroke} fill="currentColor" opacity="0.6" />
            </>
          )}
          {theme.dec === "arc" && (
            <>
              {/* Dashed swoosh */}
              <path d="M 20 60 Q 40 10 90 15" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" fill="none" className={theme.stroke} opacity="0.6" strokeLinecap="round" />
              <circle cx="165" cy="35" r="3" fill="currentColor" className={theme.stroke} opacity="0.5" />
              <path d="M 160 90 L 165 85 L 170 90" stroke="currentColor" strokeWidth="1.5" fill="none" className={theme.stroke} opacity="0.6" strokeLinecap="round" />
            </>
          )}
          {theme.dec === "squiggle" && (
            <>
              {/* Abstract squiggle */}
              <path d="M 25 75 Q 35 55 45 70 T 65 65" stroke="currentColor" strokeWidth="2" fill="none" className={theme.stroke} opacity="0.6" strokeLinecap="round" />
              <circle cx="170" cy="40" r="2.5" fill="currentColor" className={theme.stroke} opacity="0.7" />
              <circle cx="180" cy="50" r="1.5" fill="currentColor" className={theme.stroke} opacity="0.5" />
              <path d="M 150 25 L 155 30 L 150 35" stroke="currentColor" strokeWidth="1.5" fill="none" className={theme.stroke} opacity="0.5" strokeLinecap="round" />
            </>
          )}
          {theme.dec === "grid" && (
            <>
              {/* Dot matrix grid */}
              <pattern id={`dots-${safeId}`} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="currentColor" className={theme.stroke} opacity="0.4" />
              </pattern>
              <rect x="150" y="15" width="40" height="40" fill={`url(#dots-${safeId})`} />
              <path d="M 25 35 C 40 25 60 45 80 35" stroke="currentColor" strokeWidth="1.5" fill="none" className={theme.stroke} opacity="0.5" strokeLinecap="round" />
            </>
          )}
        </svg>
        
        {/* Emoji centered over the wider blob */}
        <div className="text-[3.2rem] drop-shadow-sm z-10 -mt-2">{theme.emoji}</div>
      </div>
      
      {/* Text */}
      <div className="flex flex-col items-center text-center mt-2">
        <p className="text-[15px] font-extrabold text-slate-900 leading-tight">{title}</p>
        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{sub}</p>
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
