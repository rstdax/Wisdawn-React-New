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
  LockKeyhole,
  Maximize2,
  X,
  GraduationCap,
  Target,
  ShieldCheck,
  ShoppingCart,
  Gem,
  RefreshCcw,
  MonitorPlay,
  Award,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";
import { getChapter, getChaptersBySubject, getChaptersByGroupId, saveLastWatched, getSubject } from "@/lib/admin";
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
  type Subject,
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
  const { user, profile, displayName, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("Overview");
  const [bookmarked, setBookmarked] = useState(false);
  const [markedComplete, setMarkedComplete] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [pdfMaximized, setPdfMaximized] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  // Firebase-driven state
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [subjectData, setSubjectData] = useState<Subject | null>(null);
  const [subjectChapters, setSubjectChapters] = useState<Chapter[]>([]);
  const [chapterGroupVideos, setChapterGroupVideos] = useState<Chapter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [subjectLoading, setSubjectLoading] = useState(true);

  // Local interaction state
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [qaDraft, setQaDraft] = useState("");
  const [discussionDraft, setDiscussionDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setVideoLoading(true);
      setDataLoading(true);
      try {
        const [ch, res, qa, disc] = await Promise.all([
          getChapter(id),
          getResources(id),
          getQA(id),
          getDiscussions(id),
        ]);
        if (!active) return;
        setChapterData(ch);
        setResources(res);
        setQaList(qa);
        setDiscussions(disc);
        
        setVideoLoading(false);
        setDataLoading(false);
        
        if (ch?.subjectId) {
          const promises: Promise<any>[] = [
            getChaptersBySubject(ch.subjectId).then(chapters => { if (active) setSubjectChapters(chapters.filter(c => !c.isChapterShell)) }),
            getSubject(ch.subjectId).then(sub => { if (active) setSubjectData(sub) })
          ];
          if (ch.chapterId !== undefined) {
            promises.push(
              getChaptersByGroupId(ch.subjectId, ch.chapterId).then(videos => { if (active) setChapterGroupVideos(videos.filter(v => !v.isChapterShell)) })
            );
          }
          await Promise.all(promises);
        } else if (active) {
          setSubjectData(null);
        }
      } finally {
        if (active) {
          setSubjectLoading(false);
          setVideoLoading(false);
          setDataLoading(false);
        }
      }
    };
    fetchData();
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (chapterData && user?.uid && chapterData.subjectId) {
      getSubject(chapterData.subjectId).then((sub) => {
        if (sub) {
          saveLastWatched(user.uid, {
            chapterId: chapterData.id,
            chapterTitle: chapterData.title,
            subjectId: sub.id,
            subjectTitle: sub.title,
            videoId: chapterData.videoId,
          }).catch(console.error);
        }
      });
    }
  }, [chapterData, user?.uid]);

  useEffect(() => {
    if (chapterData?.lessonType === "pdf") {
      setPdfMaximized(true);
    }
  }, [chapterData?.id, chapterData?.lessonType]);

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
  const isCodingCourse = subjectData?.track === "coding";
  const hasCourseAccess = !isCodingCourse || Boolean(
    chapterData?.subjectId && profile?.purchasedCourseIds?.includes(chapterData.subjectId)
  );
  const isLockedCourse = !authLoading && isCodingCourse && !hasCourseAccess;
  const isIntroChapter = publishedSiblings[0]?.id === id;
  const showPurchaseBar = isLockedCourse && isIntroChapter;
  const displayedResources = (isCodingCourse ? publishedSiblings : chapterGroupVideos).filter(
    (v) => chapterData?.lessonType === "pdf" ? v.lessonType === "pdf" : v.lessonType !== "pdf"
  );
  const coursePrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(subjectData?.price ?? 3199);

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
      <header className="flex md:hidden items-center justify-between px-5 pt-2 pb-3">
        <button
          onClick={() => router.history.back()}
          className="grid h-9 w-9 place-items-center rounded-full active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center gap-1.5 mt-0.5">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <>
              <h1 className="text-sm font-bold">{chapterTitle}</h1>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {subjectLoading ? (
                  <div className="h-3 w-24 bg-muted animate-pulse rounded mx-auto" />
                ) : (subjectData?.class && subjectData?.title 
                  ? `${subjectData.class} · ${subjectData.title}`
                  : (subjectData?.title ?? "Loading..."))}
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => setBookmarked((v) => !v)}
          className={`grid h-9 w-9 place-items-center rounded-full ${bookmarked ? "bg-primary-soft text-primary" : "active:bg-muted"}`}
        >
          <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
        </button>
      </header>

      <div className={`flex-1 overflow-y-auto md:overflow-visible ${showPurchaseBar ? "pb-52 md:pb-6" : "pb-6"}`}>
        {/* DESKTOP HEADING */}
        <div className="hidden md:block mb-5 px-5 md:px-0">
          <div className="flex justify-between items-start mt-3">
            <div>
              {dataLoading ? (
                <>
                  <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{chapterTitle}</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">{lessonTitle}</p>
                </>
              )}
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
            <div className={`shadow-md -mx-5 md:mx-0 relative overflow-hidden ${videoLoading ? "bg-muted animate-pulse" : "bg-black text-white"}`}>
              {videoLoading ? (
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }} />
              ) : videoId ? (
                <>

                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
                    <iframe
                      key={videoId}
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&fs=1&iv_load_policy=3&origin=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "http://localhost:8081")}&widget_referrer=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "http://localhost:8081")}${startTime ? `&start=${startTime}` : ""}`}
                      title={chapterTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      referrerPolicy="origin"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    />
                  </div>
                </>
              ) : chapterData?.lessonType === "pdf" ? (() => {
                const urlMatch = chapterData.resourcesNote?.match(/https?:\/\/[^\s]+/);
                const url = urlMatch?.[0] ?? null;
                const isDrive = url?.includes("drive.google.com/file/d/");
                const embedUrl = isDrive
                  ? url!.replace("/view", "/preview").split("?")[0]
                  : url ? `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true` : null;
                const downloadUrl = isDrive
                  ? url!.replace("/view", "/export?format=pdf").split("?")[0]
                  : url;

                return (
                  <div className="relative w-full h-[calc(100vh-80px)] md:h-[80vh] min-h-[400px] bg-muted flex flex-col">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="flex-1 w-full border-none bg-white"
                        title={chapterTitle}
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex-1 w-full flex flex-col items-center justify-center bg-black text-white">
                        <FileText className="h-10 w-10 text-white/50 mb-3" />
                        <p className="text-sm font-semibold">No PDF link found.</p>
                        <p className="text-xs text-white/50 mt-1">Please add a link in the Notes field in Admin.</p>
                      </div>
                    )}
                  </div>
                );
              })() : (
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
            {chapterData?.lessonType !== "pdf" && (
              <>
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
                  {dataLoading ? (
                    <div className="space-y-4 pt-2">
                      <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-4 w-[90%] bg-muted animate-pulse rounded" />
                        <div className="h-4 w-[80%] bg-muted animate-pulse rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                        <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                        <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                        <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Description — collapsible like YouTube */}
                  <div>
                    <h2 className="text-base font-bold text-foreground">About this video</h2>
                    <div className="mt-2 relative overflow-hidden">
                      <p
                        className={`text-sm leading-relaxed text-muted-foreground whitespace-pre-line break-words ${descExpanded ? "" : "line-clamp-4"}`}
                        style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                      >
                        {chapterData?.description ?? `In this lesson, you will learn ${chapterTitle} through clear explanations, practical examples, and guided practice.`}
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
                  
                  {subjectLoading ? (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                      <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                      <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                      <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                    </div>
                  ) : subjectData?.track !== "school" && (
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      {/* DURATION */}
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-purple-100/50 text-purple-600">
                           <Clock className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Duration</p>
                          <p className="text-xs sm:text-sm font-extrabold text-foreground mt-0.5 truncate">{chapterData?.duration ?? "Self-paced"}</p>
                        </div>
                      </div>
                      
                      {/* LEVEL */}
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-100/50 text-green-600">
                           <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Level</p>
                          <p className="text-xs sm:text-sm font-extrabold text-foreground mt-0.5 truncate">{chapterData?.difficulty ?? "Beginner"}</p>
                        </div>
                      </div>

                      {/* COURSE */}
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100/50 text-blue-600">
                           <GraduationCap className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Course</p>
                          <p className="text-xs sm:text-sm font-extrabold text-foreground mt-0.5 leading-tight line-clamp-2">{subjectData?.title ?? "Web Development"}</p>
                        </div>
                      </div>

                      {/* NO. OF VIDEOS */}
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-100/50 text-orange-500">
                           <Play className="h-5 w-5 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">No. of Videos</p>
                          <p className="text-xs sm:text-sm font-extrabold text-foreground mt-0.5 truncate">{publishedSiblings.length || 2}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(chapterData?.whatYouLearn ?? []).length > 0 && (
                    <div className="mt-6 rounded-[24px] bg-[#F7F5FF] p-5 border border-purple-100 relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-80 mix-blend-multiply translate-x-4 translate-y-4">
                         <div className="bg-purple-100/50 rounded-xl p-4">
                            <MonitorPlay className="h-16 w-16 text-purple-300" />
                         </div>
                      </div>
                      <div className="relative z-10 flex gap-4">
                        <div className="shrink-0 pt-0.5">
                           <Target className="h-6 w-6 text-[#7F56D9]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#42307D] mb-4">What you'll learn</h3>
                          <div className="space-y-2.5 text-xs text-[#6941C6] font-semibold">
                            {chapterData!.whatYouLearn!.map((item, i) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <CheckCircle className="h-4 w-4 text-[#7F56D9] shrink-0 mt-0.5 fill-[#7F56D9] stroke-white" /> 
                                <span className="leading-tight pr-12">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-foreground">Next Up</h3>
                    {subjectLoading ? (
                      <div className="mt-2 h-[76px] rounded-2xl border border-border bg-card animate-pulse" />
                    ) : nextChapter ? (
                      <Link
                        to="/chapter/$id"
                        params={{ id: nextChapter.id }}
                        className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 transition hover:shadow-xs hover:border-primary/30"
                      >
                        <div className="flex items-center gap-3">
                          {nextChapter.videoId ? (
                            <img src={`https://img.youtube.com/vi/${nextChapter.videoId}/mqdefault.jpg`} alt={nextChapter.title} className="h-12 w-16 rounded-md object-cover shrink-0 bg-primary-soft" />
                          ) : (
                            <div className="grid h-12 w-16 place-items-center rounded-md bg-primary-soft text-[10px] font-extrabold text-primary shrink-0">
                              {nextChapter.lessonType === "pdf" ? <FileText className="h-5 w-5" /> : (nextChapter.duration ?? "—")}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{nextChapter.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {nextChapter.chapterId !== undefined 
                                ? (nextChapter.chapterName ? `Chapter ${nextChapter.chapterId}: ${nextChapter.chapterName}` : `Chapter ${nextChapter.chapterId}`) 
                                : (nextChapter.chapterName ?? "Next Video")}
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
                </>
              )}
            </div>
          )}

              {/* ── RESOURCES ── */}
              {tab === "Resources" && (
                <div className="space-y-3">
                  <div className="text-sm font-bold text-foreground">
                    {subjectLoading ? (
                      <div className="h-5 w-40 bg-muted animate-pulse rounded" />
                    ) : isCodingCourse ? "Course Chapters" : chapterData?.chapterId
                      ? `Chapter ${chapterData.chapterId} — All Videos`
                      : "Chapter Videos"}
                  </div>
                  {subjectLoading ? (
                    <div className="space-y-3">
                      <div className="h-16 rounded-2xl border border-border bg-card animate-pulse" />
                      <div className="h-16 rounded-2xl border border-border bg-card animate-pulse" />
                    </div>
                  ) : displayedResources.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center">
                      <Play className="h-8 w-8 mx-auto text-muted-foreground opacity-40 mb-3" />
                      <p className="text-sm font-semibold text-muted-foreground">No other videos in this chapter group.</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Set the same <strong>Chapter ID</strong> on related videos in the admin panel.
                      </p>
                    </div>
                  ) : (
                    displayedResources.map((v, idx) => {
                      const isCurrent = v.id === id;
                      return (
                        <Link
                          key={v.id}
                          to="/chapter/$id"
                          params={{ id: v.id }}
                          onClick={(event) => {
                            if (isLockedCourse) event.preventDefault();
                          }}
                          aria-disabled={isLockedCourse}
                          className={`flex items-center gap-3 rounded-2xl border p-3.5 transition hover:shadow-xs ${isCurrent ? "border-primary bg-primary-soft/50" : "border-border bg-card"} ${isLockedCourse ? "cursor-not-allowed opacity-70" : ""}`}
                        >
                          {v.videoId ? (
                            <img src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`} alt={v.title} className="h-10 w-14 rounded-md object-cover shrink-0 bg-primary-soft" />
                          ) : (
                            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-md text-xs font-bold ${isCurrent ? "bg-primary text-white" : "bg-primary-soft text-primary"}`}>
                              {v.lessonType === "pdf" ? <FileText className="h-4 w-4" /> : v.videoOrder ?? idx + 1}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{v.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{v.lessonType === "pdf" ? "PDF Document" : (v.duration ?? "—")}</p>
                          </div>
                          {isLockedCourse ? (
                            <LockKeyhole className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : isCurrent ? (
                            <span className="text-[10px] font-bold text-primary bg-primary-soft px-2 py-1 rounded-full shrink-0">{v.lessonType === "pdf" ? "Viewing" : "▶ Playing"}</span>
                          ) : (
                            v.lessonType === "pdf" ? <FileText className="h-4 w-4 text-primary shrink-0" /> : <Play className="h-4 w-4 text-primary shrink-0" />
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
                  {isLockedCourse ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
                      <LockKeyhole className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-bold text-foreground">Course notes are locked</p>
                      <p className="text-xs text-muted-foreground mt-1">Buy this course to open and download all notes.</p>
                    </div>
                  ) : (
                    <>
                  {/* Admin PDF / Notes — shown at top if exists */}
                  {(() => {
                    const pdfLessonsInGroup = isCodingCourse
                      ? publishedSiblings.filter(v => v.lessonType === "pdf" && v.resourcesNote)
                      : chapterGroupVideos.filter(v => v.lessonType === "pdf" && v.resourcesNote);

                    const videosWithNotes = Array.from(new Map(
                      (isCodingCourse
                        ? [
                            ...(chapterData?.resourcesNote ? [chapterData] : []),
                            ...displayedResources.filter(v => v.resourcesNote),
                            ...pdfLessonsInGroup
                          ]
                        : [
                            ...pdfLessonsInGroup
                          ]
                      ).map(v => [v.id, v])
                    ).values());

                    if (videosWithNotes.length === 0) return null;

                    return (
                      <div className="space-y-4">
                        {videosWithNotes.map((video) => (
                          <div key={video.id} className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="h-4 w-4 text-primary shrink-0" />
                              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                                {video.chapterId !== undefined
                                  ? `Chapter ${video.chapterId}${video.chapterName ? `: ${video.chapterName}` : ""} — ${video.title}`
                                  : video.title ?? "Notes"}
                              </p>
                            </div>
                            {(() => {
                              const urlMatch = video.resourcesNote!.match(/https?:\/\/[^\s]+/);
                              const url = urlMatch?.[0] ?? null;
                              // Convert Google Drive view link → download link
                              const downloadUrl = url?.includes("drive.google.com/file/d/")
                                ? url.replace("/view", "/export?format=pdf").replace("?usp=drive_link", "")
                                : url;
                              // Text without URL
                              const textOnly = video.resourcesNote!.replace(/https?:\/\/[^\s]+/g, "").trim();
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
                        ))}
                      </div>
                    );
                  })()}

                  {/* Student personal notes */}
                  <div>
                  </div>
                    </>
                  )}
                </div>
              )}


            </div>
            </>
            )}
          </div>
        </div>
      </div>
      

      {/* ── MOBILE FULLSCREEN VIDEO OVERLAY ── */}
      {showPurchaseBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 md:static md:px-0 md:pb-8 md:pt-4">
          <div className="mx-auto max-w-110 overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:max-w-none">
            <div className="flex items-center gap-2 p-4 md:flex-row md:justify-between md:gap-5 md:p-5">
              <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
                <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F5F3FF] text-[#7F56D9] md:h-14 md:w-14">
                  <Award className="absolute h-7 w-7 fill-current opacity-20" />
                  <Award className="relative z-10 h-6 w-6" />
                </div>
                <div className="min-w-0 md:border-r md:border-border/50 md:pr-6">
                  <p className="text-sm font-bold text-[#6941C6]">Lifetime Access</p>
                  <p className="mt-1 text-[10px] leading-snug text-muted-foreground whitespace-nowrap md:text-xs">Learn at your own pace<br />with full lifetime access</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center justify-center md:items-end">
                <span className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">{coursePrice}</span>
                <Link
                  to="/support"
                  className="mt-2 flex items-center gap-2 rounded-full bg-[#7F56D9] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition hover:bg-[#6941C6] md:px-10 md:py-3"
                >
                  Buy Now <ShoppingCart className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-border bg-[#FAF9FF] px-3 py-3 text-[10px] font-semibold text-muted-foreground sm:gap-4 sm:text-[11px]">
              <span className="flex items-center gap-1 whitespace-nowrap"><LockKeyhole className="h-3.5 w-3.5 text-[#7F56D9]" /> Secure Payment</span>
              <span className="h-4 w-px bg-border" />
              <span className="flex items-center gap-1 whitespace-nowrap"><Gem className="h-3.5 w-3.5 text-[#7F56D9]" /> One-time Payment</span>
              <span className="h-4 w-px bg-border" />
              <span className="flex items-center gap-1 whitespace-nowrap"><RefreshCcw className="h-3.5 w-3.5 text-[#7F56D9]" /> Lifetime Access</span>
            </div>
          </div>
        </div>
      )}

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
