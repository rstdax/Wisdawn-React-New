import { createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect, type MouseEvent, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Lightbulb, Filter, ChevronRight,
  Sparkles,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { Wisby } from "@/components/wisby";
import { getSubjects, getSubjectProgress, type Subject } from "@/lib/admin";
import { getCourseIntroChapterId } from "@/lib/course-navigation";
import { SubjectIcon } from "@/components/SubjectIcon";
import { useAuth } from "@/hooks/use-auth";
import { useXP } from "@/hooks/use-xp";
import { Skeleton } from "@/components/ui/skeleton";

import logoImg from "@/assets/jjj.jpeg";
import logoCodingImg from "@/assets/logocoding.png";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn — WisDawn" }] }),
  component: Learn,
});

// Animated Cones Component for the Learn Banner
function AnimatedZigZag() {
  const CONE_COUNT = 10;
  const COLORS = [
    "text-blue-400/20",
    "text-purple-400/20",
    "text-emerald-400/20",
    "text-amber-400/20",
  ];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(timer);
  }, []);

  const cycleLength = CONE_COUNT * 2 + 8;
  const currentCycle = Math.floor(tick / cycleLength);
  const phaseTick = tick % cycleLength;
  const currentColor = COLORS[currentCycle % COLORS.length];

  return (
    <div className="absolute bottom-0 left-0 w-full flex items-end z-0 pointer-events-none h-[28px]">
      {Array.from({ length: CONE_COUNT }).map((_, i) => {
        const isShown = phaseTick >= i && phaseTick < (CONE_COUNT + 4 + i);
        return (
          <div 
            key={i} 
            className={`flex-1 transition-transform duration-300 ease-out origin-bottom ${currentColor} ${isShown ? "scale-y-100" : "scale-y-0"}`}
          >
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full block">
              <polygon points="0,100 50,0 100,100" fill="currentColor" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({ title, linkTo, onClickViewAll, viewAllText = "View All" }: { title: string; linkTo?: string; onClickViewAll?: () => void; viewAllText?: string; }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">{title}</h2>
      
      {linkTo ? (
        <Link to={linkTo} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
          {viewAllText} <ChevronRight className="h-4 w-4" />
        </Link>
      ) : onClickViewAll ? (
        <button onClick={onClickViewAll} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer">
          {viewAllText} <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

function Learn() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search as Record<string, string | undefined>;

  const track = search?.track === "coding" ? "coding" : (search?.track === "school" ? "school" : (typeof window !== "undefined" ? (localStorage.getItem("wisdawn_track") as "school" | "coding" || "school") : "school"));
  const setTrack = (newTrack: "school" | "coding") => {
    if (typeof window !== "undefined") localStorage.setItem("wisdawn_track", newTrack);
    navigate({
      to: "/learn",
      search: { ...search, track: newTrack },
    });
  };

  const [query, setQuery] = useState("");

  const { user, profile, loading: authLoading } = useAuth();
  const { data: userXP } = useXP(user?.uid);
  const liveXP = userXP?.total_xp ?? (profile as any)?.total_xp ?? profile?.stats?.xp ?? 0;

  const { data: { subjects = [], progressMap = {} } = {}, isLoading: dataLoading } = useQuery({
    queryKey: ["learnData", track, user?.uid, profile?.cls],
    queryFn: async () => {
      const all = await getSubjects();
      const trackFiltered = all.filter((s) => {
        if (s.track !== track) return false;
        if (track === "school" && profile?.cls && s.class && s.class !== profile.cls) return false;
        return true;
      }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const map: Record<string, number> = {};
      if (user) {
        const results = await Promise.all(
          trackFiltered.map((s) =>
            getSubjectProgress(user.uid, s.id).then((p) => ({ id: s.id, percent: p.percent }))
          )
        );
        results.forEach((r) => { map[r.id] = r.percent; });
      }

      return { subjects: trackFiltered, progressMap: map };
    },
    enabled: !authLoading,
    staleTime: 5 * 60 * 1000,
  });

  const loading = authLoading || dataLoading;

  const filtered = subjects.filter((s) =>
    !query.trim() || s.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  if (loading) {
    return (
      <MobileFrame>
        {/* WISDAWN BRANDING & POINTS HEADER */}
        <div className="flex md:hidden items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <img 
              src={track === "coding" ? logoCodingImg : logoImg} 
              alt="Wisdawn Logo" 
              className="h-8 w-8 object-contain" 
            />
            <span className="text-2xl font-bold text-primary">Wisdawn</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-sm border border-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-700 opacity-90">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold text-amber-500">
              {liveXP.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* MOBILE HEADER SKELETON */}
        <div className="px-5 pt-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-6 w-20 animate-pulse" />
              <Skeleton className="h-4 w-36 animate-pulse" />
            </div>
            <Skeleton className="h-9 w-24 rounded-full animate-pulse" />
          </div>
          <div className="mt-4 relative rounded-full bg-muted p-1">
            <div className="h-8 rounded-full bg-muted-foreground/10 animate-pulse" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 space-y-6">
          <div className="hidden md:flex justify-between items-center mb-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-20 animate-pulse" />
              <Skeleton className="h-4 w-36 animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-64 rounded-full animate-pulse" />
              <Skeleton className="h-9 w-48 rounded-full animate-pulse" />
              <Skeleton className="h-9 w-24 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="mt-4 relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4.5 text-sm md:hidden shadow-sm">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 font-extrabold text-blue-700">
                    <Lightbulb className="h-4.5 w-4.5 fill-blue-500 text-blue-500" /> Today's focus
                  </div>
                  <p className="mt-1.5 text-[13px] font-medium text-slate-600 leading-relaxed max-w-[90%]">
                    Loading focus...
                  </p>
                </div>
                <AnimatedZigZag />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <Skeleton className="h-[150px] rounded-3xl animate-pulse" />
                  <Skeleton className="h-[150px] rounded-3xl animate-pulse" />
                  <Skeleton className="h-[150px] rounded-3xl animate-pulse" />
                  <Skeleton className="h-[150px] rounded-3xl animate-pulse" />
                </div>
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              <Skeleton className="h-[300px] w-full rounded-3xl animate-pulse" />
              <Skeleton className="h-[250px] w-full rounded-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      {/* WISDAWN BRANDING & POINTS HEADER */}
      <div className="flex md:hidden items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <img 
            src={track === "coding" ? logoCodingImg : logoImg} 
            alt="Wisdawn Logo" 
            className="h-8 w-8 object-contain" 
          />
          <span className="text-2xl font-bold text-primary">Wisdawn</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-sm border border-yellow-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-700 opacity-90">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl font-bold text-amber-500">
            {liveXP.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <hr className="block md:hidden border-t border-border/60 mx-5 mb-2" />

      {/* MOBILE HEADER */}
      <div className="px-5 pt-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Learn</h1>
            <p className="text-xs text-muted-foreground">Explore and grow every day</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="w-20 bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Pill-shaped 3D Tab Switcher */}
        <div className="mt-4 relative flex-1 rounded-full bg-muted p-1 flex shadow-inner">
          <div
            className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full shadow-sm transition-all duration-300 bg-primary ${
              track === "coding" ? "translate-x-full" : "translate-x-0"
            }`}
            aria-hidden
          />
          <div className="relative grid grid-cols-2 w-full">
            <button
              onClick={() => {
                setTrack('school');
                setQuery('');
              }}
              className={`relative z-10 rounded-full py-2 text-xs font-bold transition-colors duration-300 ${
                track === "school" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              School Academy
            </button>
            <button
              onClick={() => {
                setTrack('coding');
                setQuery('');
              }}
              className={`relative z-10 rounded-full py-2 text-xs font-bold transition-colors duration-300 ${
                track === "coding" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Coding
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto md:overflow-visible px-0 pb-6 pt-4">
        {/* DESKTOP HEADER */}
        <div className="hidden md:flex justify-between items-center mb-6 px-5 md:px-0">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Learn</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Explore and grow every day</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex rounded-full bg-muted p-1 w-64 shadow-inner">
              <div
                className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full shadow-sm transition-all duration-300 bg-primary ${
                  track === "coding" ? "translate-x-full" : "translate-x-0"
                }`}
                aria-hidden
              />
              <button
                onClick={() => setTrack('school')}
                className={`relative z-10 flex-1 rounded-full py-1.5 text-xs font-bold text-center transition ${track === 'school' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                School Academy
              </button>
              <button
                onClick={() => setTrack('coding')}
                className={`relative z-10 flex-1 rounded-full py-1.5 text-xs font-bold text-center transition ${track === 'coding' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Coding Bootcamp
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search in learning..."
                className="w-48 bg-card border border-border/80 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition shadow-sm">
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 md:px-0">
          {/* LEFT & CENTER COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TODAY'S FOCUS BANNER */}
            <div className="mt-4 md:mt-0 relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 text-sm shadow-sm md:rounded-3xl">
              <div className="relative z-10">
                <div className="flex items-center gap-2 font-extrabold text-blue-700 text-base">
                  <Lightbulb className="h-5 w-5 fill-blue-500 text-blue-500" /> Today's focus
                </div>
                <p className="mt-2 text-sm font-medium text-slate-600 leading-relaxed max-w-md">
                  {track === 'school'
                    ? 'Master one concept at a time and keep your streak alive.'
                    : 'Build momentum with a short coding sprint.'}
                </p>
              </div>
              <AnimatedZigZag />
            </div>

            {/* TRACK SPECIFIC CARDS */}
            {track === 'school' ? (
              <div className="mt-6">
                <SectionHeader title="Available Subjects" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {filtered.length === 0 ? (
                    <div className="col-span-2 md:col-span-4 rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground font-semibold">
                      No subjects found.
                    </div>
                  ) : filtered.map((s) => (
                    <SubjectCard 
                      key={s.id} 
                      title={s.title} 
                      sub={s.class || ""} 
                      to={`/subject/${s.id}`} 
                    />
                  ))}
                </div>

                <div className="mt-10 hidden md:flex items-center justify-between rounded-3xl border border-border bg-primary-soft p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <Wisby variant="cheer" className="h-16 w-16" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground tracking-tight">
                        Can't find what you're looking for?
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Explore more lessons and topics or request new content.
                      </p>
                    </div>
                  </div>
                  <button className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white transition shadow-sm hover:scale-105 cursor-pointer">
                    Request a Topic
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <SectionHeader title="Available Courses" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.length === 0 ? (
                    <div className="col-span-2 md:col-span-4 rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground font-semibold">
                      No {track} courses found.
                    </div>
                  ) : filtered.map((subject, index) => {
                    const colors = [
                      "from-blue-500 to-indigo-600",
                      "from-violet-500 to-fuchsia-600",
                      "from-amber-500 to-orange-600",
                      "from-emerald-500 to-teal-600",
                      "from-cyan-500 to-blue-600",
                      "from-rose-500 to-red-600"
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <Link
                        key={subject.id}
                        to="/subject/$id"
                        params={{ id: subject.id }}
                        onClick={async (event) => {
                          event.preventDefault();
                          const introChapterId = await getCourseIntroChapterId(subject.id);
                          if (!introChapterId) {
                            navigate({ to: "/subject/$id", params: { id: subject.id } });
                            return;
                          }
                          navigate({ to: "/chapter/$id", params: { id: introChapterId } });
                        }}
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
                            <div className={`h-full w-full bg-gradient-to-br ${color} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
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
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" clipPath="url(#half)"/></svg>
                            </div>
                            <span className="text-muted-foreground font-normal ml-0.5">(472,738)</span>
                          </div>
                          <p className="text-[13px] font-extrabold mt-1">
                            {(subject as any).isFree
                              ? <span className="text-emerald-600">Free</span>
                              : <span className="text-foreground">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(subject.price ?? 3199)}</span>
                            }
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Learning Progress</h3>
                <Link to="/profile" className="text-xs font-semibold text-primary hover:underline">
                  View Report
                </Link>
              </div>

              <div className="flex flex-col items-center py-2">
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
                      strokeDashoffset={2 * Math.PI * 50 * (1 - 0.68)}
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-2xl font-extrabold text-foreground">68%</span>
                    <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                      Overall Progress
                    </p>
                  </div>
                </div>

                <div className="w-full mt-6 space-y-2 text-xs">
                  <ProgressRow label="Lessons Completed" value="48" />
                  <ProgressRow label="Topics Studied" value="24" />
                  <ProgressRow label="Tests Taken" value="12" />
                  <ProgressRow label="Streak Days" value="7 Days" />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Today's Plan</h3>
                <Link to="/tests" className="text-xs font-semibold text-primary hover:underline">
                  View Calendar
                </Link>
              </div>

              <div className="space-y-3">
                <PlanRow
                  title="Chemical Reactions"
                  desc="Continue Lesson"
                  action={
                    <Link
                      to="/chapter/$id"
                      params={{ id: 'chemical-reactions' }}
                      className="rounded-full bg-primary px-4 py-1.5 text-[10px] font-bold text-white transition hover:scale-105"
                    >
                      Resume
                    </Link>
                  }
                />
                <PlanRow
                  title="Practice: MCQs"
                  desc="15 Questions"
                  action={
                    <Link
                      to="/practice/$id"
                      params={{ id: 'chemical-reactions' }}
                      className="rounded-full bg-primary-soft text-primary px-4 py-1.5 text-[10px] font-bold transition hover:bg-primary hover:text-white"
                    >
                      Start
                    </Link>
                  }
                />
                <PlanRow
                  title="Quick Test"
                  desc="20 Questions"
                  action={
                    <Link
                      to="/tests"
                      className="rounded-full bg-primary-soft text-primary px-4 py-1.5 text-[10px] font-bold transition hover:bg-primary hover:text-white"
                    >
                      Start
                    </Link>
                  }
                />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Recently Added</h3>
                <Link to="/learn" className="text-xs font-semibold text-primary hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                <RecentAddRow
                  title="Photosynthesis in Plants"
                  desc="Biology · Class 10"
                  icon="🌿"
                />
                <RecentAddRow
                  title="Linear Equations in Two Variables"
                  desc="Mathematics · Class 10"
                  icon="📐"
                />
                <RecentAddRow
                  title="Introduction to C Language"
                  desc="Computer · Class 10"
                  icon="💻"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-gradient-to-br from-indigo-50 to-violet-50 p-5 shadow-xs flex items-center justify-between relative overflow-hidden">
              <div className="max-w-[65%] z-10">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 text-yellow-500 fill-yellow-500" /> Wispy's Tip
                </span>
                <p className="text-xs font-bold text-foreground mt-2 leading-snug">
                  Consistency is the key! Study a little every day and see big results.
                </p>
              </div>
              <Wisby
                variant="thumbs"
                className="absolute -bottom-3 -right-3 h-20 w-20 opacity-90 scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

// ------------------------------------------------------------------
// Components for the school subject cards
// ------------------------------------------------------------------

function SubjectCard({
  title,
  sub,
  to,
}: {
  title: string;
  sub: string;
  to: string;
}) {
  const getTheme = (name: string) => {
    const lower = name.toLowerCase();
    
    // The "cardBg" uses the "50" shade with an opacity modifier "/40" for a super light background.
    // The "blobBg" uses a slightly stronger "100" or "200" shade so the SVG blob is visible inside the card.
    if (lower.includes("physics")) return { emoji: "🧲", cardBg: "bg-red-50/40", blobBg: "text-red-100", stroke: "text-red-400", dec: "squiggle" };
    if (lower.includes("chemistry")) return { emoji: "🧪", cardBg: "bg-emerald-50/40", blobBg: "text-emerald-100", stroke: "text-emerald-400", dec: "arc" };
    if (lower.includes("math")) return { emoji: "📐", cardBg: "bg-blue-50/40", blobBg: "text-blue-100", stroke: "text-blue-400", dec: "grid" };
    if (lower.includes("sanskrit")) return { emoji: "📜", cardBg: "bg-amber-50/40", blobBg: "text-amber-100", stroke: "text-amber-400", dec: "sparkle" };
    if (lower.includes("biology")) return { emoji: "🧬", cardBg: "bg-green-50/40", blobBg: "text-green-100", stroke: "text-green-400", dec: "arc" };
    if (lower.includes("english")) return { emoji: "📚", cardBg: "bg-rose-50/40", blobBg: "text-rose-100", stroke: "text-rose-400", dec: "sparkle" };
    if (lower.includes("history")) return { emoji: "🏛️", cardBg: "bg-yellow-50/40", blobBg: "text-yellow-100", stroke: "text-yellow-400", dec: "grid" };
    if (lower.includes("geography")) return { emoji: "🌍", cardBg: "bg-cyan-50/40", blobBg: "text-cyan-100", stroke: "text-cyan-400", dec: "squiggle" };
    if (lower.includes("computer") || lower.includes("coding")) return { emoji: "💻", cardBg: "bg-indigo-50/40", blobBg: "text-indigo-100", stroke: "text-indigo-400", dec: "grid" };
    
    return { emoji: "📓", cardBg: "bg-slate-50/40", blobBg: "text-slate-200", stroke: "text-slate-400", dec: "sparkle" };
  };

  const theme = getTheme(title);
  const safeId = title.replace(/[^a-zA-Z0-9]/g, '');

  const blobPaths = [
    "M 20,60 C 10,20 80,0 140,15 C 190,25 195,80 150,105 C 110,125 30,110 20,60 Z",
    "M 30,50 C 40,10 140,5 175,40 C 210,80 140,120 80,115 C 20,110 15,80 30,50 Z",
    "M 15,75 C 10,35 60,15 130,20 C 180,25 195,75 160,105 C 110,135 20,120 15,75 Z",
    "M 40,40 C 70,5 160,15 185,55 C 210,100 130,125 70,115 C 10,105 -5,75 40,40 Z"
  ];
  const blob = blobPaths[title.length % blobPaths.length];

  return (
    <Link 
      to={to} 
      // The outer card wrapper: Light dynamic background, rounded corners, no border, and a shadow
      className={`flex flex-col items-center gap-1 transition-all duration-300 group ${theme.cardBg} rounded-[28px] p-3 pb-5 hover:shadow-sm`}
    >
      {/* The Blob Graphic from the Home Page */}
      <div className="relative flex w-[90%] max-w-[160px] aspect-[4/3] items-center justify-center transition-transform group-hover:scale-105 mx-auto mt-1">
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 200 130">
          <path className={theme.blobBg} fill="currentColor" d={blob} />
          
          {theme.dec === "sparkle" && (
            <>
              <path d="M 30 20 Q 30 30 40 30 Q 30 30 30 40 Q 30 30 20 30 Q 30 30 30 20 Z" className={theme.stroke} fill="currentColor" opacity="0.6" />
              <path d="M 170 80 Q 170 85 175 85 Q 170 85 170 90 Q 170 85 165 85 Q 170 85 170 80 Z" className={theme.stroke} fill="currentColor" opacity="0.5" />
              <circle cx="160" cy="25" r="2" className={theme.stroke} fill="currentColor" opacity="0.6" />
            </>
          )}
          {theme.dec === "arc" && (
            <>
              <path d="M 20 60 Q 40 10 90 15" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" fill="none" className={theme.stroke} opacity="0.6" strokeLinecap="round" />
              <circle cx="165" cy="35" r="3" fill="currentColor" className={theme.stroke} opacity="0.5" />
              <path d="M 160 90 L 165 85 L 170 90" stroke="currentColor" strokeWidth="1.5" fill="none" className={theme.stroke} opacity="0.6" strokeLinecap="round" />
            </>
          )}
          {theme.dec === "squiggle" && (
            <>
              <path d="M 25 75 Q 35 55 45 70 T 65 65" stroke="currentColor" strokeWidth="2" fill="none" className={theme.stroke} opacity="0.6" strokeLinecap="round" />
              <circle cx="170" cy="40" r="2.5" fill="currentColor" className={theme.stroke} opacity="0.7" />
              <circle cx="180" cy="50" r="1.5" fill="currentColor" className={theme.stroke} opacity="0.5" />
              <path d="M 150 25 L 155 30 L 150 35" stroke="currentColor" strokeWidth="1.5" fill="none" className={theme.stroke} opacity="0.5" strokeLinecap="round" />
            </>
          )}
          {theme.dec === "grid" && (
            <>
              <pattern id={`dots-${safeId}`} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="currentColor" className={theme.stroke} opacity="0.4" />
              </pattern>
              <rect x="150" y="15" width="40" height="40" fill={`url(#dots-${safeId})`} />
              <path d="M 25 35 C 40 25 60 45 80 35" stroke="currentColor" strokeWidth="1.5" fill="none" className={theme.stroke} opacity="0.5" strokeLinecap="round" />
            </>
          )}
        </svg>
        
        <div className="text-[3.2rem] drop-shadow-sm z-10 -mt-2">{theme.emoji}</div>
      </div>
      
      {/* Title & Subtitle */}
      <div className="flex flex-col items-center text-center mt-3">
        <p className="text-[15px] font-extrabold text-slate-900 leading-tight">{title}</p>
        <p className="text-[11px] font-semibold text-slate-500 mt-1">{sub}</p>
      </div>
    </Link>
  );
}

// ------------------------------------------------------------------
// Utility layout components
// ------------------------------------------------------------------

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}

function PlanRow({ title, desc, action }: { title: string; desc: string; action: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/20 border border-border/40">
      <div className="min-w-0">
        <p className="text-xs font-bold text-foreground truncate">{title}</p>
        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{desc}</p>
      </div>
      {action}
    </div>
  );
}

function RecentAddRow({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/10 border border-border/20">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-base shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-foreground truncate">{title}</p>
        <p className="text-[9px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}