import { createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useMemo, useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Leaf, Lightbulb, Code2, Globe, Filter, ChevronRight,
  Sparkles, CheckSquare, Plus, ArrowRight, Play, BookOpen, Loader2
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";
import { getSubjects, getSubjectProgress, type Subject } from "@/lib/admin";
import { SubjectIcon } from "@/components/SubjectIcon";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn — WisDawn" }] }),
  component: Learn,
});

const filters = {
  school: ["All", "Physics", "Chemistry", "Biology", "Maths", "Science", "Geography", "History"],
  coding: ["All", "Python", "Web Dev", "DSA", "React", "JavaScript", "HTML", "C", "More"],
};

type ContentItem = { id: string; title: string; sub: string; progress?: number };
type RecommendedItem = {
  id: string;
  title: string;
  sub: string;
  lessonsCount?: number;
  tag?: string;
};
type Section = { continueList: ContentItem[]; recommended: RecommendedItem[] };

const contentData: { [k in "school" | "coding"]: Record<string, Section> } = {
  school: {
    All: {
      continueList: [
        { id: "balancing-equations", title: "Balancing Equations", sub: "Lesson · Physics" },
        {
          id: "chemical-reactions",
          title: "Chemical Reactions",
          sub: "Chapter 2 · Class 10 · Science",
          progress: 65,
        },
        {
          id: "life-processes",
          title: "Life Processes in Living Organisms",
          sub: "Chapter 6 · Biology · Class 10",
          progress: 15,
        },
        { id: "algebra-basics", title: "Algebra Basics", sub: "Chapter · Mathematics" },
      ],
      recommended: [
        {
          id: "life-processes",
          title: "Life Processes in Living Organisms",
          sub: "Chapter 6 · Biology · Class 10",
          lessonsCount: 12,
          tag: "Science",
        },
        {
          id: "light-refraction",
          title: "Light – Reflection & Refraction",
          sub: "Chapter 10 · Physics · Class 10",
          lessonsCount: 10,
          tag: "Physics",
        },
        {
          id: "geometry",
          title: "Linear Equations in Two Variables",
          sub: "Chapter 3 · Mathematics · Class 10",
          lessonsCount: 8,
          tag: "Maths",
        },
      ],
    },
    Physics: {
      continueList: [
        { id: "balancing-equations", title: "Balancing Equations", sub: "Lesson · Physics" },
      ],
      recommended: [
        {
          id: "light-refraction",
          title: "Light – Reflection & Refraction",
          sub: "Chapter 10 · Physics · Class 10",
          lessonsCount: 10,
          tag: "Physics",
        },
      ],
    },
    Chemistry: {
      continueList: [
        {
          id: "chemical-reactions",
          title: "Chemical Reactions",
          sub: "Chapter 2 · Class 10 · Science",
          progress: 65,
        },
      ],
      recommended: [
        {
          id: "types-of-reactions",
          title: "Types of Chemical Reactions",
          sub: "Video · 16:25",
          lessonsCount: 1,
        },
      ],
    },
    Biology: {
      continueList: [
        {
          id: "life-processes",
          title: "Life Processes in Living Organisms",
          sub: "Chapter 6 · Biology · Class 10",
          progress: 15,
        },
      ],
      recommended: [
        {
          id: "life-processes",
          title: "Life Processes in Living Organisms",
          sub: "Chapter 6 · Biology · Class 10",
          lessonsCount: 12,
          tag: "Science",
        },
      ],
    },
    Maths: {
      continueList: [
        { id: "algebra-basics", title: "Algebra Basics", sub: "Chapter · Mathematics" },
      ],
      recommended: [
        {
          id: "geometry",
          title: "Linear Equations in Two Variables",
          sub: "Chapter 3 · Mathematics · Class 10",
          lessonsCount: 8,
          tag: "Maths",
        },
      ],
    },
    Science: { continueList: [], recommended: [] },
    Geography: { continueList: [], recommended: [] },
    History: { continueList: [], recommended: [] },
  },
  coding: {
    All: {
      continueList: [
        {
          id: "python-variables",
          title: "Python Variables & Data Types",
          sub: "Lesson 3 · Python for Beginners",
          progress: 45,
        },
        { id: "html-basics", title: "HTML Basics", sub: "Lesson 1 · Web Development" },
        { id: "arrays", title: "Arrays & Pointers", sub: "Lesson · DSA" },
        { id: "react-intro", title: "React Basics", sub: "Lesson · React" },
      ],
      recommended: [
        {
          id: "html-basics",
          title: "HTML Basics",
          sub: "Lesson 1 · Web Development",
          lessonsCount: 18,
          tag: "Web Dev",
        },
        {
          id: "js-essentials",
          title: "JavaScript Essentials",
          sub: "Lesson 2 · Web Development",
          lessonsCount: 16,
          tag: "Web Dev",
        },
        {
          id: "python-control",
          title: "Data Handling in Python",
          sub: "Lesson 4 · Python for Beginners",
          lessonsCount: 14,
          tag: "Coding",
        },
      ],
    },
    Python: {
      continueList: [
        {
          id: "python-variables",
          title: "Python Variables & Data Types",
          sub: "Lesson 3 · Python for Beginners",
          progress: 45,
        },
      ],
      recommended: [
        {
          id: "python-control",
          title: "Data Handling in Python",
          sub: "Lesson 4 · Python for Beginners",
          lessonsCount: 14,
          tag: "Coding",
        },
      ],
    },
    "Web Dev": {
      continueList: [
        { id: "html-basics", title: "HTML Basics", sub: "Lesson 1 · Web Development" },
      ],
      recommended: [
        {
          id: "js-essentials",
          title: "JavaScript Essentials",
          sub: "Lesson 2 · Web Development",
          lessonsCount: 16,
          tag: "Web Dev",
        },
      ],
    },
    DSA: {
      continueList: [{ id: "arrays", title: "Arrays & Pointers", sub: "Lesson · DSA" }],
      recommended: [
        { id: "sorting", title: "Sorting Algorithms", sub: "Lesson · DSA", lessonsCount: 6 },
      ],
    },
    React: {
      continueList: [{ id: "react-intro", title: "React Basics", sub: "Lesson · React" }],
      recommended: [
        { id: "state-hooks", title: "State & Hooks", sub: "Lesson · React", lessonsCount: 8 },
      ],
    },
    JavaScript: { continueList: [], recommended: [] },
    HTML: { continueList: [], recommended: [] },
    More: { continueList: [], recommended: [] },
  },
};

const topicData = [
  { name: "Science", chapters: 32, icon: "🔬", color: "text-emerald-600 bg-emerald-50" },
  { name: "Mathematics", chapters: 28, icon: "📐", color: "text-violet-600 bg-violet-50" },
  { name: "English", chapters: 18, icon: "📖", color: "text-amber-600 bg-amber-50" },
  { name: "History", chapters: 20, icon: "🏛️", color: "text-rose-600 bg-rose-50" },
  { name: "Geography", chapters: 16, icon: "🌍", color: "text-blue-600 bg-blue-50" },
  { name: "Physics", chapters: 24, icon: "⚛️", color: "text-cyan-600 bg-cyan-50" },
  { name: "Chemistry", chapters: 22, icon: "🧪", color: "text-pink-600 bg-pink-50" },
  { name: "Computer", chapters: 30, icon: "💻", color: "text-indigo-600 bg-indigo-50" },
];

const fallbackSection: Section = { continueList: [], recommended: [] };

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

  const activeTab = search?.tab === "courses" ? "courses" : "lessons";
  const setActiveTab = (newTab: "lessons" | "courses") => {
    navigate({
      to: "/learn",
      search: { ...search, tab: newTab },
    });
  };

  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  const { user, profile, loading: authLoading } = useAuth();

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

  const section = contentData[track as keyof typeof contentData][active] || fallbackSection;

  const filteredContinue = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return section.continueList;
    return section.continueList.filter((item) =>
      `${item.title} ${item.sub}`.toLowerCase().includes(term),
    );
  }, [query, section]);

  const filteredRecommended = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return section.recommended;
    return section.recommended.filter((item) =>
      `${item.title} ${item.sub}`.toLowerCase().includes(term),
    );
  }, [query, section]);

  if (loading) {
    return (
      <MobileFrame>
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
          {/* DESKTOP HEADER SKELETON */}
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
            {/* Left & Center Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Focus Banner Skeleton */}
              <div className="mt-4 md:hidden">
                <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
              </div>

              {/* Your Subjects Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                  <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                  <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                  <Skeleton className="h-[140px] rounded-2xl animate-pulse" />
                </div>
              </div>

              {/* Recommended Section */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-40 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-32 rounded-2xl animate-pulse" />
                  <Skeleton className="h-32 rounded-2xl animate-pulse" />
                </div>
              </div>

              {/* Browse by Topics Section */}
              <div className="hidden md:block space-y-3">
                <Skeleton className="h-5 w-36 animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Skeleton className="h-16 rounded-2xl animate-pulse" />
                  <Skeleton className="h-16 rounded-2xl animate-pulse" />
                  <Skeleton className="h-16 rounded-2xl animate-pulse" />
                  <Skeleton className="h-16 rounded-2xl animate-pulse" />
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar) */}
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
      <div className="px-5 pt-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Learn</h1>
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

        <div className="mt-4 relative rounded-full bg-muted p-1">
          <div
            className={`absolute inset-1 w-1/2 rounded-full shadow-lg transform transition-all duration-300 ${track === 'coding'
              ? 'bg-linear-to-r from-violet-700 to-violet-500 translate-x-full'
              : 'bg-primary translate-x-0'
              }`}
            aria-hidden
          />
          <div className="relative grid grid-cols-2">
            <button
              onClick={() => {
                setTrack('school');
                setActive('All');
                setQuery('');
              }}
              className={`relative z-10 rounded-full py-2 text-xs font-semibold ${track === 'school' ? 'text-white' : 'text-muted-foreground'
                }`}
            >
              School Academy
            </button>
            <button
              onClick={() => {
                setTrack('coding');
                setActive('All');
                setQuery('');
              }}
              className={`relative z-10 rounded-full py-2 text-xs font-semibold ${track === 'coding' ? 'text-white' : 'text-muted-foreground'
                }`}
            >
              Coding Bootcamp
            </button>
          </div>
        </div>

      </div>

      <div className="flex-1 overflow-y-auto md:overflow-visible px-0 pb-5">
        <div className="hidden md:flex justify-between items-center mb-6 px-5 md:px-0">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Learn</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Explore and grow every day</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex rounded-full bg-muted p-1 w-64">
              <div
                className={`absolute inset-1 w-1/2 rounded-full shadow-md transition-all duration-300 ${track === 'coding' ? 'bg-primary translate-x-full' : 'bg-primary translate-x-0'
                  }`}
                aria-hidden
              />
              <button
                onClick={() => setTrack('school')}
                className={`relative z-10 flex-1 rounded-full py-1.5 text-xs font-bold text-center transition ${track === 'school' ? 'text-white' : 'text-muted-foreground'
                  }`}
              >
                School Academy
              </button>
              <button
                onClick={() => setTrack('coding')}
                className={`relative z-10 flex-1 rounded-full py-1.5 text-xs font-bold text-center transition ${track === 'coding' ? 'text-white' : 'text-muted-foreground'
                  }`}
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

            <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition">
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
          </div>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 md:px-0">
          <div className="lg:col-span-2 space-y-6">
            {true ? (
              <>
                <div className="mt-4 rounded-2xl border border-border bg-primary-soft p-3 text-sm md:hidden">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Lightbulb className="h-4 w-4" /> Today’s focus
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {track === 'school'
                      ? 'Master one concept at a time and keep your streak alive.'
                      : 'Build momentum with a short coding sprint.'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-foreground">Your Subjects</h2>
                  </div>
                  {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-center text-muted-foreground">
                      No subjects found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {filtered.map((subject) => {
                        const progressNum = progressMap[subject.id] ?? 0;
                        return (
                          <Link
                            key={subject.id}
                            to="/subject/$id"
                            params={{ id: subject.id }}
                            className="relative flex flex-col rounded-2xl overflow-hidden transition hover:shadow-md min-h-[140px]"
                          >
                            {/* Cover image */}
                            {subject.coverImage ? (
                              <img
                                src={subject.coverImage}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-card border border-border rounded-2xl" />
                            )}
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            {/* Content */}
                            <div className="relative p-3 flex flex-col justify-between h-full">
                              <div className="mt-auto pt-2">
                                <p className="text-sm font-bold text-white drop-shadow-md leading-tight">{subject.title}</p>
                                <p className="text-[11px] text-white/75 mt-0.5">{subject.class || track}</p>
                                <div className="mt-2 hidden items-center gap-2">
                                  <div className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                                    <div className="h-full rounded-full bg-white" style={{ width: `${progressNum}%` }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-white/90">{progressNum}%</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold text-foreground mb-3">Recommended for You</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRecommended.length > 0 ? (
                      filteredRecommended.map((r) => (
                        <Link
                          key={r.id}
                          to="/chapter/$id"
                          params={{ id: r.id }}
                          className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition hover:shadow-xs min-h-[120px]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                                {r.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{r.sub}</p>
                            </div>
                            {r.lessonsCount && (
                              <span className="bg-primary-soft text-primary text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                {r.lessonsCount} Lessons
                              </span>
                            )}
                          </div>
                          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                              {r.tag || 'Science'}
                            </span>
                            <span className="text-muted-foreground font-bold hover:translate-x-1 transition-transform">
                              ›
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-center text-muted-foreground">
                        No recommendations match that search yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden md:block">
                  <h2 className="text-base font-bold text-foreground mb-3">Browse by Topics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {topicData.map((t) => (
                      <Link
                        key={t.name}
                        to="/learn"
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card transition hover:shadow-xs hover:border-primary/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`grid h-9 w-9 place-items-center rounded-xl text-lg ${t.color}`}
                          >
                            {t.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{t.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                              {t.chapters} Chapters
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="hidden md:flex items-center justify-between rounded-3xl border border-border bg-primary-soft p-6">
                  <div className="flex items-center gap-4">
                    <Wisby variant="cheer" className="h-16 w-16" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Can't find what you're looking for?
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Explore more lessons and topics or request new content.
                      </p>
                    </div>
                  </div>
                  <button className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition shadow-sm hover:scale-105 cursor-pointer">
                    Request a Topic
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-base font-bold text-foreground mb-3">My Enrolled Courses</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.length === 0 ? (
                      <div className="col-span-1 md:col-span-2 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
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
                      const progressNum = progressMap[subject.id] ?? 0;
                      return (
                        <div
                          key={subject.id}
                          className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition hover:shadow-xs"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${color} text-white text-xl shadow-xs`}>
                                  <SubjectIcon icon={subject.icon} className="h-full w-full !rounded-none !bg-transparent text-white flex items-center justify-center" />
                                </div>
                                <div>
                                  <span className="bg-primary-soft text-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {subject.class || track}
                                  </span>
                                  <h3 className="text-xs font-bold text-foreground mt-1 leading-tight">{subject.title}</h3>
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                              Learn {subject.title} with comprehensive lessons and interactive concepts.
                            </p>
                          </div>

                          <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between">
                            <div className="flex-1 max-w-[60%]">
                              <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{progressNum}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${progressNum}%` }}
                                />
                              </div>
                            </div>

                            <Link
                              to="/subject/$id"
                              params={{ id: subject.id }}
                              className="bg-primary hover:bg-primary/95 text-primary-foreground text-[11px] font-bold px-4 py-2 rounded-xl transition shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              {progressNum > 0 ? "Continue" : "Start"}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-bold text-foreground mb-3">Popular Courses</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border bg-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs transition duration-200">
                      <div>
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Featured</span>
                        <h4 className="text-xs font-bold text-foreground mt-1.5">{track === 'school' ? 'Advanced Physics Sandbox' : 'Advanced JavaScript Algorithms'}</h4>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{track === 'school' ? 'Simulate physical phenomena and perform virtual laboratory experiments.' : 'Deep dive into execution context, closures, prototypes, and asynchronous execution patterns.'}</p>
                      </div>
                      <button className="bg-primary-soft text-primary hover:bg-primary hover:text-white rounded-xl py-2 mt-4 text-[11px] font-bold transition shadow-xs cursor-pointer">
                        Explore
                      </button>
                    </div>
                    <div className="border border-border bg-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs transition duration-200">
                      <div>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>
                        <h4 className="text-xs font-bold text-foreground mt-1.5">{track === 'school' ? 'Organic Chemistry Secrets' : 'AI Prompt Engineering for Coders'}</h4>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{track === 'school' ? 'Learn naming conventions, reaction mechanisms, and carbon structure properties.' : 'Learn how to use AI coding agents and prompts to accelerate software engineering.'}</p>
                      </div>
                      <button className="bg-primary-soft text-primary hover:bg-primary hover:text-white rounded-xl py-2 mt-4 text-[11px] font-bold transition shadow-xs cursor-pointer">
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

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
