import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Clock, Sparkles, Loader2 } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { Wisby } from "@/components/wisby";
import { Skeleton } from "@/components/ui/skeleton";
import { getPracticeTests, type PracticeTest } from "@/lib/admin";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/tests")({
  head: () => ({ meta: [{ title: "Tests — WisDawn" }] }),
  component: Tests,
});

type FilterType = "All" | "School" | "Coding";

function Tests() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const { profile, loading: authLoading } = useAuth();

  const { data: tests = [], isLoading: testsLoading } = useQuery({
    queryKey: ["practiceTests"],
    queryFn: () => getPracticeTests(50),
    staleTime: 5 * 60 * 1000,
  });

  const loading = authLoading || testsLoading;

  const visibleTests = tests.filter(
    (t) => activeFilter === "All" || t.tag === activeFilter,
  );

  // Derive real stats from user profile
  const xp = profile?.stats?.xp ?? 0;
  const courses = profile?.stats?.courses ?? 0;

  return (
    <MobileFrame>
      {/* MOBILE HEADER */}
      <div className="px-5 pt-3 md:hidden">
        <h1 className="text-2xl font-extrabold">Tests</h1>
        <p className="mt-1 mb-2 text-xs text-muted-foreground">Practice and track your progress</p>
      </div>

      {/* RESPONSIVE LAYOUT BODY */}
      <div className="flex-1 overflow-y-auto md:overflow-visible pb-5">
        {/* DESKTOP HEADER */}
        <div className="hidden md:flex justify-between items-center mb-6 px-5 md:px-0">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-primary" /> Tests &amp; Practice
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Attempt practice tests and track performance
            </p>
          </div>

          <div className="flex gap-2">
            {(["All", "School", "Coding"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition border ${
                  activeFilter === filter
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
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
            <div className="rounded-2xl bg-primary p-4 text-primary-foreground shadow-lg shadow-primary/25 md:hidden">
              <div className="flex items-center gap-2 text-xs opacity-80">
                <Sparkles className="h-4 w-4" /> Your XP
              </div>
              <p className="mt-1 text-3xl font-extrabold">{xp.toLocaleString()}</p>
              <p className="mt-1 text-xs opacity-80">
                {courses > 0 ? `Across ${courses} enrolled course${courses > 1 ? "s" : ""}` : "Start a course to earn XP"}
              </p>
            </div>

            {/* MOBILE FILTER BUTTONS */}
            <div className="flex gap-2 md:hidden mt-4">
              {(["All", "School", "Coding"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    activeFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <h2 className="text-base font-bold text-foreground mb-3">Available Tests</h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 rounded-2xl animate-pulse" />
                <Skeleton className="h-24 rounded-2xl animate-pulse" />
                <Skeleton className="h-24 rounded-2xl animate-pulse" />
                <Skeleton className="h-24 rounded-2xl animate-pulse" />
              </div>
            ) : visibleTests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No tests available yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check back soon — new practice sets are added regularly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleTests.map((t) => (
                  <TestCard key={t.id} test={t} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* PERFORMANCE METRICS CARD */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-bold text-foreground">Performance Overview</h3>

              <div className="flex flex-col items-center py-4">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="absolute transform -rotate-90 w-full h-full">
                    <circle
                      cx="56"
                      cy="56"
                      r="45"
                      className="stroke-muted"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="45"
                      className="stroke-primary"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * (1 - (xp > 0 ? Math.min(xp / 5000, 1) : 0))}
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-xl font-extrabold text-foreground">
                      {xp > 0 ? `${Math.min(Math.round((xp / 5000) * 100), 100)}%` : "0%"}
                    </span>
                    <p className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">
                      XP Level
                    </p>
                  </div>
                </div>

                <div className="w-full mt-5 space-y-2.5 text-xs font-semibold text-muted-foreground border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span>Tests Available</span>
                    <span className="text-foreground">{tests.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Courses Enrolled</span>
                    <span className="text-foreground">{courses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total XP</span>
                    <span className="text-primary font-bold">+{xp.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PRACTICE STREAK */}
            <div className="rounded-3xl border border-border bg-gradient-to-br from-indigo-50 to-violet-50 p-5 shadow-xs">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-yellow-500 fill-yellow-500" /> Practice Tips
              </span>
              <h4 className="text-xs font-bold text-foreground mt-2">Build daily habits!</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Attempting at least one practice test per day sharpens your recall and builds exam confidence.
              </p>
            </div>

            {/* MASCOT MOTIVATION */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
              <Wisby variant="thumbs" className="h-16 w-16" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Wisby says:</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  "Practice is the key to mastery. Try attempting one MCQ set daily!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

function TestCard({ test }: { test: PracticeTest }) {
  return (
    <Link
      to="/practice/$id"
      params={{ id: test.id }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-xs hover:border-primary/50"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <ClipboardCheck className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{test.title}</p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">{test.subtitle}</p>
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
          <Clock className="h-3 w-3 text-primary" />
          {test.questions} questions · {test.durationMinutes} min
        </p>
      </div>
      <span className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/95">
        Start
      </span>
    </Link>
  );
}
