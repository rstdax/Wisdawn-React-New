import { createFileRoute, useParams, useRouter, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Play, Loader2, Clock, ChevronRight, ChevronDown } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { getSubjects, getChaptersBySubject, type Subject, type Chapter } from "@/lib/admin";

export const Route = createFileRoute("/subject/$id")({
  head: () => ({ meta: [{ title: "Subject — WisDawn" }] }),
  component: SubjectPage,
});

// Group chapters by chapterId, sorted by chapterId then videoOrder
function groupChapters(chapters: Chapter[]): { groupId: number; label: string; videos: Chapter[] }[] {
  const map = new Map<number, Chapter[]>();

  for (const ch of chapters) {
    const gid = ch.chapterId ?? 0;
    if (!map.has(gid)) map.set(gid, []);
    map.get(gid)!.push(ch);
  }

  // Sort each group by videoOrder
  const groups = Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([groupId, videos]) => ({
      groupId,
      label: groupId === 0 ? "Chapters" : `Chapter ${groupId}`,
      videos: [...videos].sort((a, b) => (a.videoOrder ?? 1) - (b.videoOrder ?? 1)),
    }));

  return groups;
}

function SubjectPage() {
  const { id } = useParams({ from: "/subject/$id" });
  const router = useRouter();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoading(true);
    getSubjects().then(async (subs) => {
      const sub = subs.find((s) => s.id === id) ?? null;
      setSubject(sub);
      if (sub) {
        const chs = await getChaptersBySubject(sub.id);
        const published = chs.filter((c) => c.published);
        setChapters(published);
        // Start with all groups collapsed
        setExpandedGroups(new Set());
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const groups = groupChapters(chapters);

  const toggleGroup = (gid: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(gid)) next.delete(gid);
      else next.add(gid);
      return next;
    });
  };

  return (
    <MobileFrame>
      {/* MOBILE HEADER */}
      <header className="flex md:hidden items-center gap-3 px-5 pt-2 pb-1">
        <button onClick={() => router.history.back()}
          className="grid h-9 w-9 place-items-center rounded-full active:bg-muted shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-bold truncate">
            {subject?.title ?? "Subject"}
          </h1>
          <p className="text-[11px] text-muted-foreground">{subject?.class ?? ""}</p>
        </div>
      </header>

      {/* DESKTOP HEADER */}
      <div className="hidden md:block mb-6">
        <button onClick={() => router.history.back()}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground mb-3 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Learn
        </button>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{subject?.title}</h1>
            <p className="text-sm text-muted-foreground">
              {subject?.class} · {subject?.track === "school" ? "School Academy" : "Coding Bootcamp"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 px-5 md:px-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : chapters.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center mt-4">
            <p className="text-sm font-semibold text-muted-foreground">No chapters available yet.</p>
          </div>
        ) : subject?.track === "coding" ? (
          // Coding: flat video list, no accordion
          <div className="space-y-2 mt-3">
            {chapters
              .sort((a, b) => (a.videoOrder ?? a.order ?? 0) - (b.videoOrder ?? b.order ?? 0))
              .map((chapter, idx) => (
                <Link
                  key={chapter.id}
                  to="/chapter/$id"
                  params={{ id: chapter.id }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-border bg-card hover:bg-primary-soft/40 transition"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary font-bold text-sm">
                    {chapter.videoOrder ?? idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground truncate">{chapter.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {chapter.duration && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
                          <Clock className="h-3 w-3" /> {chapter.duration}
                        </span>
                      )}
                      {chapter.difficulty && (
                        <span className="text-[11px] text-muted-foreground font-semibold">{chapter.difficulty}</span>
                      )}
                    </div>
                  </div>
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white shadow-sm shadow-primary/25">
                    <Play className="h-3.5 w-3.5 fill-current translate-x-0.5" />
                  </div>
                </Link>
              ))}
          </div>
        ) : (
          <div className="space-y-4 mt-3">
            {groups.map((group) => {
              const isExpanded = expandedGroups.has(group.groupId);
              return (
                <div key={group.groupId} className="rounded-2xl border border-border bg-card overflow-hidden">
                  {/* Chapter group header */}
                  <button
                    onClick={() => toggleGroup(group.groupId)}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-white text-xs font-bold shrink-0">
                        {group.groupId === 0 ? "—" : group.groupId}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-foreground">{group.label}</p>
                        <p className="text-[11px] text-muted-foreground">{group.videos.length} video{group.videos.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    {isExpanded
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>

                  {/* Videos list */}
                  {isExpanded && (
                    <div className="border-t border-border/60">
                      {group.videos.map((chapter, idx) => (
                        <Link
                          key={chapter.id}
                          to="/chapter/$id"
                          params={{ id: chapter.id }}
                          className="flex items-center gap-4 px-4 py-3.5 hover:bg-primary-soft/40 transition border-b border-border/30 last:border-b-0"
                        >
                          {/* Video number within chapter */}
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary font-bold text-sm">
                            {chapter.videoOrder ?? idx + 1}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-foreground truncate">{chapter.title}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              {chapter.duration && (
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
                                  <Clock className="h-3 w-3" /> {chapter.duration}
                                </span>
                              )}
                              {chapter.difficulty && (
                                <span className="text-[11px] text-muted-foreground font-semibold">{chapter.difficulty}</span>
                              )}
                            </div>
                          </div>

                          {/* Play */}
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white shadow-sm shadow-primary/25">
                            <Play className="h-3.5 w-3.5 fill-current translate-x-0.5" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
    </MobileFrame>
  );
}
