import { createFileRoute, useParams, useRouter, Link, Navigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Play, Loader2, Clock, ChevronRight, ChevronDown, FileText, Paperclip, ArrowRight } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { getSubjects, getChaptersBySubject, type Subject, type Chapter } from "@/lib/admin";

import logoImg from "@/assets/jjj.png";
import { useAuth } from "@/hooks/use-auth";
import { useXP } from "@/hooks/use-xp";

export const Route = createFileRoute("/subject/$id")({
  head: () => ({ meta: [{ title: "Subject - WisDawn" }] }),
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
    .map(([groupId, videos]) => {
      const shell = videos.find(v => v.isChapterShell);
      const chapterName = shell?.chapterName || videos.find(v => v.chapterName)?.chapterName;
      let label = groupId === 0 ? "Chapters" : `Chapter ${groupId}`;
      if (chapterName) {
        label = `Chapter ${groupId}: ${chapterName}`;
      }
      return {
        groupId,
        label,
        videos: videos.filter(v => !v.isChapterShell).sort((a, b) => (a.videoOrder ?? 1) - (b.videoOrder ?? 1)),
      };
    });

  return groups;
}

function SubjectPage() {
  const { id } = useParams({ from: "/subject/$id" });
  const router = useRouter();

  const { user, profile } = useAuth();
  const { data: userXP } = useXP(user?.uid);
  const liveXP = userXP?.total_xp ?? (profile as any)?.total_xp ?? profile?.stats?.xp ?? 0;

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
          {liveXP.toLocaleString("en-IN")}
        </span>
      </div>
    </div>

    {/* THE DIVIDER LINE */}
    <hr className="block md:hidden border-t border-border/60 mx-5 mb-2" />

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
          (() => {
            const firstChapter = chapters.sort((a, b) => (a.videoOrder ?? a.order ?? 0) - (b.videoOrder ?? b.order ?? 0))[0];
            return <Navigate to="/chapter/$id" params={{ id: firstChapter.id }} replace />;
          })()
        ) : (
          <div className="space-y-4 mt-3">
            {groups.map((group) => {
              const isExpanded = expandedGroups.has(group.groupId);
              return (
                <div key={group.groupId} className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  
                  {/* ── CHAPTER GROUP HEADER ── */}
                  <div className="flex items-center justify-between pr-3 group/header hover:bg-slate-50 transition-colors duration-300">
                    <Link
                      to={group.videos[0] ? "/chapter/$id" : "/subject/$id"}
                      params={{ id: group.videos[0]?.id || id }}
                      className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 px-4 py-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-sm font-bold transition-colors duration-300 group-hover/header:bg-primary/10 group-hover/header:text-primary group-hover/header:border-primary/20">
                        {group.groupId === 0 ? "—" : group.groupId}
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-slate-800 transition-colors duration-300 group-hover/header:text-primary truncate">
                          {group.label}
                        </p>
                        <p className="text-[12px] font-medium text-slate-500 mt-0.5 truncate">
                          {group.videos.length} resource{group.videos.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Link>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleGroup(group.groupId);
                      }}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition ml-2 shadow-sm"
                      aria-label="Toggle videos"
                    >
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* ── VIDEOS / RESOURCES LIST ── */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-4 bg-white">
                      <div className="flex flex-col divide-y divide-slate-100">
                        {group.videos.map((chapter, idx) => {
                          const getMaterialTheme = (type: string | undefined | null) => {
                            if (type === "pdf") return { main: "bg-rose-500", light: "bg-rose-50", text: "text-rose-500", border: "border-rose-100", hoverMain: "group-hover:bg-rose-500 group-hover:border-rose-500", icon: FileText };
                            if (type === "link") return { main: "bg-teal-500", light: "bg-teal-50", text: "text-teal-500", border: "border-teal-100", hoverMain: "group-hover:bg-teal-500 group-hover:border-teal-500", icon: Paperclip };
                            return { main: "bg-primary/100", light: "bg-primary/10", text: "text-blue-500", border: "border-primary/20", hoverMain: "group-hover:bg-primary group-hover:border-primary", icon: Play };
                          };

                          const theme = getMaterialTheme(chapter.lessonType);
                          const Icon = theme.icon;

                          return (
                            <Link
                              key={chapter.id}
                              to="/chapter/$id"
                              params={{ id: chapter.id }}
                              className="flex items-center gap-3 md:gap-4 py-4 group"
                            >
                              {/* 1. Left Large Icon / Thumbnail */}
                              {chapter.videoId ? (
                                <div className={`relative h-16 w-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 border ${theme.border}`}>
                                  <img src={`https://img.youtube.com/vi/${chapter.videoId}/mqdefault.jpg`} alt={chapter.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                              ) : (
                                <div className={`flex h-16 w-24 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${theme.light} ${theme.border}`}>
                                  {chapter.lessonType === "pdf" || chapter.lessonType === "link" ? (
                                    <Icon className={`h-7 w-7 ${theme.text}`} />
                                  ) : (
                                    <span className={`text-xl font-bold ${theme.text}`}>{chapter.videoOrder ?? idx + 1}</span>
                                  )}
                                </div>
                              )}

                              {/* 2. Middle Content */}
                              <div className="min-w-0 flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${theme.light} ${theme.text}`}>
                                    <Icon className={`h-3 w-3 ${chapter.lessonType !== 'pdf' && chapter.lessonType !== 'link' ? 'fill-current translate-x-[0.5px]' : ''}`} />
                                  </div>
                                  <p className="truncate text-[15px] font-bold text-slate-800 transition-colors duration-300 group-hover:text-primary">
                                    {chapter.title}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-1.5 mt-1 text-slate-400 min-w-0">
                                  {chapter.lessonType === "pdf" ? (
                                     <p className="text-[13px] font-medium text-slate-500 truncate">PDF Document</p>
                                  ) : chapter.lessonType === "link" ? (
                                     <p className="text-[13px] font-medium text-slate-500 truncate">External Material</p>
                                  ) : (
                                    chapter.duration ? (
                                      <>
                                        <Clock className="h-3.5 w-3.5 shrink-0" />
                                        <p className="text-[11px] font-semibold truncate">{chapter.duration}</p>
                                      </>
                                    ) : null
                                  )}
                                </div>
                              </div>

                              {/* 3. Right Action Button (Added shrink-0 so it never gets squished) */}
                              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white border shadow-sm transition-all duration-300 ${theme.border} ${theme.text} ${theme.hoverMain} group-hover:text-white group-hover:scale-105`}>
                                {chapter.lessonType === "pdf" || chapter.lessonType === "link" ? (
                                  <ArrowRight className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4 fill-current translate-x-[1px]" />
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
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
