import { createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Sparkles, Lightbulb, Loader2, BookOpen } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";
import { getSubjects, type Subject } from "@/lib/admin";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn — WisDawn" }] }),
  component: Learn,
});

function Learn() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search as Record<string, string | undefined>;

  const track = (search?.track === "coding" ? "coding" : "school") as "school" | "coding";
  const setTrack = (t: "school" | "coding") => {
    navigate({ to: "/learn", search: { track: t } });
    setQuery("");
  };

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    getSubjects()
      .then((all) => setSubjects(all.filter((s) => s.track === track).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))))
      .finally(() => setLoading(false));
  }, [track]);

  const filtered = subjects.filter((s) =>
    !query.trim() || s.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <MobileFrame>
      {/* ── MOBILE HEADER ── */}
      <div className="px-5 pt-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Learn</h1>
            <p className="text-xs text-muted-foreground">Explore and grow every day</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search" className="w-20 bg-transparent outline-none" />
          </div>
        </div>

        {/* Track toggle */}
        <div className="mt-4 relative rounded-full bg-muted p-1">
          <div className={`absolute inset-1 w-1/2 rounded-full shadow-lg transform transition-all duration-300 ${
            track === "coding" ? "bg-linear-to-r from-violet-700 to-violet-500 translate-x-full" : "bg-primary translate-x-0"
          }`} aria-hidden />
          <div className="relative grid grid-cols-2">
            <button onClick={() => setTrack("school")}
              className={`relative z-10 rounded-full py-2 text-xs font-semibold ${track === "school" ? "text-white" : "text-muted-foreground"}`}>
              School Academy
            </button>
            <button onClick={() => setTrack("coding")}
              className={`relative z-10 rounded-full py-2 text-xs font-semibold ${track === "coding" ? "text-white" : "text-muted-foreground"}`}>
              Coding Bootcamp
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto md:overflow-visible px-0 pb-5">

        {/* Desktop header */}
        <div className="hidden md:flex justify-between items-center mb-6 px-5 md:px-0">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Learn</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Choose a subject to get started</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex rounded-full bg-muted p-1 w-64">
              <div className={`absolute inset-1 w-1/2 rounded-full shadow-md transition-all duration-300 ${
                track === "coding" ? "bg-primary translate-x-full" : "bg-primary translate-x-0"
              }`} aria-hidden />
              <button onClick={() => setTrack("school")}
                className={`relative z-10 flex-1 rounded-full py-1.5 text-xs font-bold text-center transition ${track === "school" ? "text-white" : "text-muted-foreground"}`}>
                School Academy
              </button>
              <button onClick={() => setTrack("coding")}
                className={`relative z-10 flex-1 rounded-full py-1.5 text-xs font-bold text-center transition ${track === "coding" ? "text-white" : "text-muted-foreground"}`}>
                Coding Bootcamp
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search subjects..."
                className="w-48 bg-card border border-border/80 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 md:px-0 mt-4 md:mt-0">
          <div className="lg:col-span-2 space-y-6">

            {/* Today's focus — mobile */}
            <div className="rounded-2xl border border-border bg-primary-soft p-3 text-sm md:hidden">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Lightbulb className="h-4 w-4" /> Today's focus
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {track === "school" ? "Master one concept at a time and keep your streak alive." : "Build momentum with a short coding sprint."}
              </p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {/* Empty */}
            {!loading && subjects.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
                <p className="text-sm font-semibold text-muted-foreground">
                  No {track === "school" ? "School" : "Coding"} subjects added yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">Admin can add subjects from the dashboard.</p>
              </div>
            )}

            {/* Subject grid */}
            {!loading && filtered.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-foreground mb-3">Your Subjects</h2>
                {/* Gradient bg so glass cards are visible */}
                <div className="relative rounded-3xl p-3 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #ede9fe 0%, #dbeafe 40%, #fce7f3 70%, #d1fae5 100%)" }}>
                  <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)" }} />
                  <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)" }} />
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {filtered.map((s) => (
                    <Link
                      key={s.id}
                      to="/subject/$id"
                      params={{ id: s.id }}
                      className="relative flex flex-col rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(240,244,255,0.60) 100%)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.6)",
                        boxShadow: "0 4px 24px -4px rgba(99,102,241,0.12), 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
                      }}
                    >
                      {/* Glare */}
                      <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-3xl pointer-events-none"
                        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)" }} />
                      {/* Icon */}
                      <div className="relative h-14 w-14 flex items-center justify-center rounded-2xl mb-4 overflow-hidden text-2xl"
                        style={{
                          background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
                          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.7), 0 2px 8px rgba(99,102,241,0.1)",
                          border: "1px solid rgba(255,255,255,0.5)",
                        }}>
                        {s.icon ?? "📘"}
                      </div>
                      {/* Title */}
                      <p className="font-extrabold text-sm text-foreground tracking-tight relative z-10">{s.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium relative z-10">{s.class}</p>
                      {/* Bottom */}
                      <div className="mt-4 pt-3 flex items-center justify-between relative z-10"
                        style={{ borderTop: "1px solid rgba(99,102,241,0.12)" }}>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          {track === "school" ? "Explore" : "Start"}
                        </span>
                        <div className="grid h-6 w-6 place-items-center rounded-full"
                          style={{ background: "rgba(99,102,241,0.1)", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6)" }}>
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                </div>{/* close gradient wrapper */}
              </div>
            )}

            {/* No search results */}
            {!loading && subjects.length > 0 && filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-center text-muted-foreground">
                No subjects match "{query}".
              </div>
            )}

            {/* Wispy CTA */}
            {!loading && (
              <div className="hidden md:flex items-center justify-between rounded-3xl border border-border bg-primary-soft p-6">
                <div className="flex items-center gap-4">
                  <Wisby variant="cheer" className="h-16 w-16" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Can't find what you're looking for?</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Request new subjects or topics from the admin.</p>
                  </div>
                </div>
                <button className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition shadow-sm hover:scale-105">
                  Request a Topic
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR (Desktop) ── */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-border bg-gradient-to-br from-indigo-50 to-violet-50 p-5 shadow-xs flex items-center justify-between relative overflow-hidden">
              <div className="max-w-[65%] z-10">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 text-yellow-500 fill-yellow-500" /> Wispy's Tip
                </span>
                <p className="text-xs font-bold text-foreground mt-2 leading-snug">
                  Pick a subject and start with Lesson 1. Consistency beats perfection every time.
                </p>
              </div>
              <Wisby variant="thumbs" className="absolute -bottom-3 -right-3 h-20 w-20 opacity-90 scale-105" />
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
