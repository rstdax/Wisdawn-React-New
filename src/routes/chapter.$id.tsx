import { createFileRoute, Link, useParams, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bookmark,
  Play,
  FileText,
  Download,
  ListChecks,
  MessageSquareText,
  CheckCircle,
  Clock,
  BookOpen,
  Check,
  Link as LinkIcon,
  Maximize2,
  X, 
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";
import { getChapter, getChaptersBySubject, getChaptersByGroupId } from "@/lib/admin";
import {
  getResources,
  getQA,
  addQA,
  getDiscussions,
  addDiscussion,
  type Resource,
  type QAItem,
  type Discussion,
  type Chapter,
} from "@/lib/admin";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/chapter/$id")({
  head: () => ({ meta: [{ title: "Chapter — WisDawn" }] }),
  component: Chapter,
});

const tabs = ["Overview", "Resources", "Notes"] as const;
type Tab = (typeof tabs)[number];

const typeIcons: Record<Resource["type"], React.ElementType> = {
  pdf: FileText,
  video: Play,
  test: ListChecks,
  link: LinkIcon,
};

function Chapter() {
  const { id } = useParams({ from: "/chapter/$id" });
  const router = useRouter();
  const { user, displayName } = useAuth();
  const [tab, setTab] = useState<Tab>("Overview");
  const [bookmarked, setBookmarked] = useState(false);
  const [markedComplete, setMarkedComplete] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  // Firebase-driven state
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [subjectChapters, setSubjectChapters] = useState<Chapter[]>([]);
  const [chapterGroupVideos, setChapterGroupVideos] = useState<Chapter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  // Local interaction state
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [qaDraft, setQaDraft] = useState("");
  const [discussionDraft, setDiscussionDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setVideoLoading(true);
    setDataLoading(true);
    Promise.all([
      getChapter(id),
      getResources(id),
      getQA(id),
      getDiscussions(id),
    ]).then(([ch, res, qa, disc]) => {
      setChapterData(ch);
      setResources(res);
      setQaList(qa);
      setDiscussions(disc);
      // Fetch all chapters from same subject for next/prev
      if (ch?.subjectId) {
        getChaptersBySubject(ch.subjectId).then(setSubjectChapters);
        // Fetch all videos in same chapter group
        if (ch.chapterId !== undefined) {
          getChaptersByGroupId(ch.subjectId, ch.chapterId).then(setChapterGroupVideos);
        }
      }
    }).finally(() => {
      setVideoLoading(false);
      setDataLoading(false);
    });
  }, [id]);

  const chapterTitle = chapterData?.title ?? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const lessonTitle = chapterTitle;
  const videoId = chapterData?.videoId ?? null;
  const startTime = chapterData?.startTime ?? 0;

  // Next / Previous chapters from same subject (sorted by order)
  const publishedSiblings = subjectChapters.filter((c) => c.published);
  const currentIdx = publishedSiblings.findIndex((c) => c.id === id);
  const nextChapter = currentIdx >= 0 && currentIdx < publishedSiblings.length - 1
    ? publishedSiblings[currentIdx + 1]
    : null;
  const prevChapter = currentIdx > 0
    ? publishedSiblings[currentIdx - 1]
    : null;

  const addNote = () => {
    if (!noteDraft.trim()) return;
    setNotes((n) => [noteDraft.trim(), ...n]);
    setNoteDraft("");
  };

  const submitQuestion = async () => {
    if (!qaDraft.trim() || !user) return;
    setSubmitting(true);
    await addQA(id, qaDraft.trim(), user.uid);
    const updated = await getQA(id);
    setQaList(updated);
    setQaDraft("");
    setSubmitting(false);
  };

  const submitDiscussion = async () => {
    if (!discussionDraft.trim() || !user) return;
    setSubmitting(true);
    await addDiscussion(id, discussionDraft.trim(), displayName, user.uid);
    const updated = await getDiscussions(id);
    setDiscussions(updated);
    setDiscussionDraft("");
    setSubmitting(false);
  };

  const toggleDownload = (resourceId: string) => {
    setDownloadedIds((c) =>
      c.includes(resourceId) ? c.filter((x) => x !== resourceId) : [...c, resourceId]
    );
  };

  return (
    <MobileFrame>
      {/* MOBILE HEADER */}
      <header className="flex md:hidden items-center justify-between px-5 pt-2">
        <button
          onClick={() => router.history.back()}
          className="grid h-9 w-9 place-items-center rounded-full active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold">{chapterTitle}</h1>
          <p className="text-[11px] text-muted-foreground">Class 10 · Science</p>
        </div>
        <button
          onClick={() => setBookmarked((v) => !v)}
          className={`grid h-9 w-9 place-items-center rounded-full ${bookmarked ? "bg-primary-soft text-primary" : "active:bg-muted"}`}
        >
          <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto md:overflow-visible pb-6">
        {/* DESKTOP HEADING */}
        <div className="hidden md:block mb-5 px-5 md:px-0">
          <div className="flex justify-between items-start mt-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{chapterTitle}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{lessonTitle}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setBookmarked((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-bold transition ${bookmarked ? "bg-primary-soft text-primary border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} /> Save
              </button>
              <button
                onClick={() => setMarkedComplete((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${markedComplete ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-primary/95"}`}
              >
                <CheckCircle className="h-4 w-4" />
                {markedComplete ? "Completed ✓" : "Mark as Complete"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 md:px-0">
          <div className="lg:col-span-2 space-y-4">

            {/* VIDEO PLAYER */}
            <div className="rounded-2xl bg-[oklch(0.25_0.12_265)] text-white shadow-md -mx-5 md:mx-0 relative overflow-hidden">
              {videoLoading ? (
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", background: "oklch(0.25 0.12 265)" }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="flex flex-col items-center gap-3 opacity-50">
                      <div className="h-14 w-14 rounded-full bg-white/20 animate-pulse" />
                      <p className="text-xs text-white/60 font-semibold">Loading video…</p>
                    </div>
                  </div>
                </div>
              ) : videoId ? (
                <>
                  {/* Expand button — mobile only */}
                  <button
                    onClick={() => setVideoExpanded(true)}
                    className="md:hidden absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                    aria-label="Expand video"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
                    <iframe
                      key={videoId}
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&fs=1&origin=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "http://localhost:8081")}&widget_referrer=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "http://localhost:8081")}${startTime ? `&start=${startTime}` : ""}`}
                      title={chapterTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      referrerPolicy="origin"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    />
                  </div>
                </>
              ) : (
                <div className="relative grid aspect-video place-items-center">
                  <Wisby variant="cheer" className="h-32 opacity-90" />
                  <div className="absolute left-4 top-4 text-xs font-bold opacity-80 uppercase tracking-wider">{chapterTitle}</div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="grid h-16 w-16 place-items-center rounded-full bg-white/20 mx-auto mb-2">
                        <Play className="h-6 w-6 fill-current translate-x-0.5 opacity-50" />
                      </div>
                      <p className="text-xs text-white/60 font-semibold">Video not available yet</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TABS */}
            <div className="flex border-b border-border text-sm">
              {tabs.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 -mb-px border-b-2 py-3.5 font-bold transition text-center ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="pt-2">

              {/* ── OVERVIEW ── */}
              {tab === "Overview" && (
                <div className="space-y-5">
                  {/* Description — collapsible like YouTube */}
                  <div>
                    <h2 className="text-base font-bold text-foreground">About This Lesson</h2>
                    <div className="mt-2 relative overflow-hidden">
                      <p
                        className={`text-sm leading-relaxed text-muted-foreground whitespace-pre-line break-words ${descExpanded ? "" : "line-clamp-4"}`}
                        style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                      >
                        {chapterData?.description ?? "In this lesson, we will explore the key concepts and build a solid understanding through examples and practice."}
                      </p>
                      {(chapterData?.description ?? "").length > 180 && (
                        <button
                          onClick={() => setDescExpanded((v) => !v)}
                          className="mt-1 text-xs font-bold text-foreground hover:text-primary transition"
                        >
                          {descExpanded ? "Show less ▲" : "...more ▼"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="hidden md:flex gap-4 flex-wrap">
                    {chapterData?.duration && (
                      <div className="flex items-center gap-2 bg-muted/40 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" /> Duration: {chapterData.duration}
                      </div>
                    )}
                    {chapterData?.difficulty && (
                      <div className="flex items-center gap-2 bg-muted/40 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground">
                        <BookOpen className="h-4 w-4 text-primary" /> Difficulty: {chapterData.difficulty}
                      </div>
                    )}
                  </div>

                  {(chapterData?.whatYouLearn ?? []).length > 0 && (
                    <div className="hidden md:block">
                      <h3 className="text-sm font-bold text-foreground mb-3">What You'll Learn</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-semibold">
                        {chapterData!.whatYouLearn!.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" /> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-foreground">Next Up</h3>
                    {nextChapter ? (
                      <Link
                        to="/chapter/$id"
                        params={{ id: nextChapter.id }}
                        className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 transition hover:shadow-xs hover:border-primary/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-12 w-16 place-items-center rounded-xl bg-primary-soft text-[10px] font-extrabold text-primary shrink-0">
                            {nextChapter.duration ?? "—"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{nextChapter.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {`Chapter ${currentIdx + 2}`}
                            </p>
                          </div>
                        </div>
                        <Play className="h-4 w-4 text-primary shrink-0" />
                      </Link>
                    ) : (
                      <div className="mt-2 rounded-2xl border border-dashed border-border bg-card p-3.5 text-xs text-muted-foreground text-center font-semibold">
                        You've reached the last chapter in this subject 🎉
                      </div>
                    )}
                  </div>

                  <div className="hidden md:flex justify-between items-center pt-4 border-t border-border">
                    {prevChapter ? (
                      <Link
                        to="/chapter/$id"
                        params={{ id: prevChapter.id }}
                        className="rounded-full border border-border px-5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted transition"
                      >
                        ← {prevChapter.title}
                      </Link>
                    ) : (
                      <div />
                    )}
                    {nextChapter ? (
                      <Link
                        to="/chapter/$id"
                        params={{ id: nextChapter.id }}
                        className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:scale-105"
                      >
                        {nextChapter.title} →
                      </Link>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              )}

              {/* ── RESOURCES ── */}
              {tab === "Resources" && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-foreground">
                    {chapterData?.chapterId
                      ? `Chapter ${chapterData.chapterId} — All Videos`
                      : "Chapter Videos"}
                  </p>
                  {chapterGroupVideos.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center">
                      <Play className="h-8 w-8 mx-auto text-muted-foreground opacity-40 mb-3" />
                      <p className="text-sm font-semibold text-muted-foreground">No other videos in this chapter group.</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Set the same <strong>Chapter ID</strong> on related videos in the admin panel.
                      </p>
                    </div>
                  ) : (
                    chapterGroupVideos.map((v, idx) => {
                      const isCurrent = v.id === id;
                      return (
                        <Link
                          key={v.id}
                          to="/chapter/$id"
                          params={{ id: v.id }}
                          className={`flex items-center gap-3 rounded-2xl border p-3.5 transition hover:shadow-xs ${isCurrent ? "border-primary bg-primary-soft/50" : "border-border bg-card"}`}
                        >
                          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${isCurrent ? "bg-primary text-white" : "bg-primary-soft text-primary"}`}>
                            {v.videoOrder ?? idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{v.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{v.duration ?? "—"}</p>
                          </div>
                          {isCurrent ? (
                            <span className="text-[10px] font-bold text-primary bg-primary-soft px-2 py-1 rounded-full shrink-0">▶ Playing</span>
                          ) : (
                            <Play className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </Link>
                      );
                    })
                  )}
                </div>
              )}

              {/* ── NOTES ── */}
              {tab === "Notes" && (
                <div className="space-y-4">
                  {/* Admin PDF / Notes — shown at top if exists */}
                  {chapterData?.resourcesNote && (
                    <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">Chapter Notes</p>
                      </div>
                      {(() => {
                        const urlMatch = chapterData.resourcesNote.match(/https?:\/\/[^\s]+/);
                        const url = urlMatch?.[0] ?? null;
                        // Convert Google Drive view link → download link
                        const downloadUrl = url?.includes("drive.google.com/file/d/")
                          ? url.replace("/view", "/export?format=pdf").replace("?usp=drive_link", "")
                          : url;
                        // Text without URL
                        const textOnly = chapterData.resourcesNote.replace(/https?:\/\/[^\s]+/g, "").trim();
                        return (
                          <>
                            {textOnly && (
                              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line break-words mb-3"
                                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
                                {textOnly}
                              </p>
                            )}
                            {url && (
                              <div className="flex gap-2 flex-wrap">
                                <a href={url} target="_blank" rel="noreferrer"
                                  className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90">
                                  <FileText className="h-3.5 w-3.5" /> Open PDF
                                </a>
                                <a href={downloadUrl ?? url} target="_blank" rel="noreferrer"
                                  className="flex items-center gap-1.5 rounded-full border border-primary bg-white px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary-soft">
                                  <Download className="h-3.5 w-3.5" /> Download PDF
                                </a>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Student personal notes */}
                  <div>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
      <BottomNav />

      {/* ── MOBILE FULLSCREEN VIDEO OVERLAY ── */}
      {videoExpanded && videoId && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black flex flex-col"
          style={{ touchAction: "none" }}
        >
          {/* Close button */}
          <button
            onClick={() => setVideoExpanded(false)}
            className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
            aria-label="Close fullscreen"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Chapter title */}
          <div className="px-5 pt-4 pb-2">
            <p className="text-white text-xs font-semibold opacity-70 truncate pr-12">{chapterTitle}</p>
          </div>

          {/* Full-height iframe */}
          <div className="flex-1 flex items-center justify-center px-0">
            <iframe
              key={`expand-${videoId}`}
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&fs=1&autoplay=1&origin=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "http://localhost:8081")}${startTime ? `&start=${startTime}` : ""}`}
              title={chapterTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="origin"
              style={{
                width: "100vw",
                height: "56.25vw",
                minHeight: "270px",
                maxHeight: "100vh",
                border: "none",
                display: "block",
              }}
            />
          </div>

          {/* Bottom hint */}
          <div className="px-5 py-4 text-center">
            <p className="text-white/40 text-[10px] font-semibold">Tap × to go back</p>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}
