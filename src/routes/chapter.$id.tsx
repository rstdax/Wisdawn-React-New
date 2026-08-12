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
  ArrowRight,
} from "lucide-react";
import { SilentContentXp } from "@/components/gamification/ContentXpTimer";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { PlyrVideoPlayer } from "@/components/plyr-video-player";
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
import { useXP } from "@/hooks/use-xp";

import logoImg from "@/assets/jjj.png";

export const Route = createFileRoute("/chapter/$id")({
  head: () => ({ meta: [{ title: "Chapter - WisDawn" }] }),
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
  const { data: xpData } = useXP(user?.uid);
  const liveXP = xpData?.total_xp ?? profile?.stats?.xp ?? 0;
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
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [iframeTitle, setIframeTitle] = useState("");
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

  // Next / Previous chapters from same subject
  // Sort by: chapterId (chapter group) first, then videoOrder/order within group
  const publishedSiblings = subjectChapters
    .filter((c) => c.published)
    .sort((a, b) => {
      const chpA = a.chapterId ?? 0;
      const chpB = b.chapterId ?? 0;
      if (chpA !== chpB) return chpA - chpB;
      return (a.videoOrder ?? a.order ?? 0) - (b.videoOrder ?? b.order ?? 0);
    });
  const currentIdx = publishedSiblings.findIndex((c) => c.id === id);
  const allSiblings = subjectChapters
    .sort((a, b) => {
      const chpA = a.chapterId ?? 0;
      const chpB = b.chapterId ?? 0;
      if (chpA !== chpB) return chpA - chpB;
      return (a.videoOrder ?? a.order ?? 0) - (b.videoOrder ?? b.order ?? 0);
    });
  const currentIdxAll = allSiblings.findIndex((c) => c.id === id);

  // For chapter groups (school subjects): use chapterGroupVideos for next/prev within same chapter
  const useGroupNav = chapterGroupVideos.length > 1;
  const groupIdx = useGroupNav ? chapterGroupVideos.findIndex((c) => c.id === id) : -1;
  const isLastInGroup = useGroupNav && groupIdx === chapterGroupVideos.length - 1;

  // Find next chapter shell (next chapter group) when we're last in current group
  const allShells = subjectChapters.filter((c) => c.isChapterShell);
  const currentShellId = chapterData?.chapterId;
  const currentShell = allShells.find((c) => c.chapterId === currentShellId);
  const currentShellIdx = currentShell ? allShells.findIndex((c) => c.id === currentShell.id) : -1;
  const nextChapterShell = currentShellIdx >= 0 && currentShellIdx < allShells.length - 1
    ? allShells[currentShellIdx + 1]
    : null;

  // nextChapter: only within same chapterId group — last item shows Chapter Complete
  const currentChapterId = chapterData?.chapterId ?? null;
  const nextSibling = currentIdx >= 0 && currentIdx < publishedSiblings.length - 1 ? publishedSiblings[currentIdx + 1] : null;
  const nextChapter = nextSibling && nextSibling.chapterId === currentChapterId ? nextSibling : null;

  const prevChapter = useGroupNav && groupIdx > 0
    ? chapterGroupVideos[groupIdx - 1]
    : currentIdx > 0
      ? publishedSiblings[currentIdx - 1]
      : (currentIdxAll > 0 ? allSiblings[currentIdxAll - 1] : null);
  const isCodingCourse = subjectData?.track === "coding";
  const isFreeCourse = Boolean((subjectData as any)?.isFree);
  const hasCourseAccess = !isCodingCourse || isFreeCourse || Boolean(
    chapterData?.subjectId && profile?.purchasedCourseIds?.includes(chapterData.subjectId)
  );
  const isLockedCourse = !authLoading && !subjectLoading && isCodingCourse && !hasCourseAccess;
  const isIntroChapter = publishedSiblings[0]?.id === id;
  // Only show purchase bar for video type — not PDF or link (they show content freely)
  const showPurchaseBar = isLockedCourse && isIntroChapter && chapterData?.lessonType !== "pdf" && chapterData?.lessonType !== "link";
  const displayedResources = (isCodingCourse ? publishedSiblings : chapterGroupVideos).filter(
    (v) => chapterData?.lessonType === "pdf" ? v.lessonType === "pdf" : v.lessonType !== "pdf"
  );
  const coursePrice = (subjectData as any)?.isFree
    ? "Free"
    : new Intl.NumberFormat("en-IN", {
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

     {/* NEW: WISDAWN BRANDING & POINTS HEADER */}
    <div className="flex md:hidden items-center justify-between px-5 pt-4 pb-3 bg-primary">
      {/* Left Side: Logo and Name */}
      <div className="flex items-center gap-2">
        <img src={logoImg} alt="Wisdawn Logo" className="h-8 w-8 object-contain" />
        <span className="text-2xl font-bold text-white">Wisdawn</span>
      </div>

      {/* Right Side: Coin Pill */}
      <div id="xp-header-pill" className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 shadow-sm">
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

    {/* THE DIVIDER LINE */}
    <hr className="block md:hidden border-t border-border/60 mx-5 mb-2" />

      {/* Silent background XP session — no visible UI, auto-claims after min time */}
      {!dataLoading && !subjectLoading && chapterData && user?.uid && !isLockedCourse && (
        <SilentContentXp
          uid={user.uid}
          contentId={chapterData.id}
          contentType={chapterData.lessonType ?? "video"}
          xpReward={(chapterData as any).xp_reward}
          minReadTimeSeconds={(chapterData as any).min_read_time_seconds}
        />
      )}

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

      <div className={`flex-1 md:overflow-visible ${
        showPurchaseBar ? "overflow-y-auto pb-52 md:pb-6" 
        : chapterData?.lessonType === "pdf" || chapterData?.lessonType === "link" ? "overflow-hidden flex flex-col" 
        : "overflow-y-auto pb-24 md:pb-6"
      }`}>
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

        <div className={chapterData?.lessonType === "pdf" || chapterData?.lessonType === "link" ? "flex flex-col flex-1 min-h-0 md:px-0" : "grid grid-cols-1 lg:grid-cols-3 gap-6 md:px-0"}>
          <div className={chapterData?.lessonType === "pdf" || chapterData?.lessonType === "link" ? "flex flex-col flex-1 min-h-0" : "lg:col-span-2 space-y-4"}>

            {/* VIDEO PLAYER */}
            <div className={`${chapterData?.lessonType === "pdf" || chapterData?.lessonType === "link" ? "flex flex-col flex-1 min-h-0" : "shadow-md md:rounded-2xl relative overflow-hidden"} ${videoLoading ? "bg-muted animate-pulse" : chapterData?.lessonType !== "pdf" && chapterData?.lessonType !== "link" ? "bg-black text-white" : ""}`}>
              {videoLoading ? (
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }} />
              ) : videoId ? (
                <PlyrVideoPlayer videoId={videoId} startTime={startTime} />
              ) : chapterData?.lessonType === "pdf" ? (() => {
                const urlMatch = chapterData.resourcesNote?.match(/https?:\/\/[^\s]+/);
                const url = urlMatch?.[0] ?? null;
                const isDrive = url?.includes("drive.google.com/file/d/");
                const embedUrl = isDrive
                  ? url!.replace("/view", "/preview").split("?")[0]
                  : url ? `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true` : null;

                return (
                  <div className="flex-1 flex flex-col overflow-hidden -mx-5 md:mx-0" style={{ minHeight: 0 }}>
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="flex-1 w-full border-none bg-white"
                        style={{ minHeight: 0, height: "100%" }}
                        title={chapterTitle}
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center bg-[#1a1a1a] text-white gap-3">
                        <FileText className="h-12 w-12 text-white/40" />
                        <p className="text-sm font-semibold">No PDF link found.</p>
                        <p className="text-xs text-white/40">Add a link in the Notes field in Admin.</p>
                      </div>
                    )}
                  </div>
                );
              })() : chapterData?.lessonType === "link" ? (() => {
                const url = chapterData.resourcesNote?.trim() ?? null;
                return (
                  <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden" style={{ minHeight: 0 }}>
                    {url ? (
                      <div className="relative flex-1 overflow-hidden" style={{ minHeight: 0 }}>
                        <iframe
                          src={url}
                          className="absolute inset-0 border-none bg-white"
                          style={{ width: "100%", height: "100%" }}
                          title={chapterTitle}
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-white gap-3">
                        <LinkIcon className="h-12 w-12 text-white/40" />
                        <p className="text-sm font-semibold">No URL configured.</p>
                        <p className="text-xs text-white/40">Add a website URL in Admin.</p>
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

            {/* PREV/NEXT FOR PDF (Desktop) */}
            {chapterData?.lessonType === "pdf" && (
              <div className="hidden md:flex justify-between items-center pt-2">
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
                  isLockedCourse ? (
                    <div
                      className="flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-xs font-bold text-muted-foreground opacity-70"
                    >
                      <LockKeyhole className="h-3.5 w-3.5" />
                      {nextChapter.title}
                    </div>
                  ) : (
                    <Link
                      to="/chapter/$id"
                      params={{ id: nextChapter.id }}
                      className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:scale-105"
                    >
                      {nextChapter.title} →
                    </Link>
                  )
                ) : (
                  <div />
                )}
              </div>
            )}

            {/* TABS */}
            {chapterData && !videoLoading && chapterData?.lessonType !== "pdf" && chapterData?.lessonType !== "link" && (
              <div className="px-5 md:px-0 space-y-4">
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

              {/* — OVERVIEW — */}
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
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100/50 text-primary">
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

                  <div className="pt-2 md:block hidden">
                    <h3 className="text-sm font-bold text-foreground">Next Up</h3>
                    {subjectLoading ? (
                      <div className="mt-2 h-[76px] rounded-2xl border border-border bg-card animate-pulse" />
                    ) : nextChapter ? (
                      isLockedCourse ? (
                        <div
                          className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 opacity-80"
                        >
                          <div className="flex items-center gap-3">
                            {nextChapter.videoId ? (
                              <div className="relative h-12 w-16 shrink-0 rounded-md overflow-hidden bg-primary-soft">
                                <img src={`https://img.youtube.com/vi/${nextChapter.videoId}/mqdefault.jpg`} alt={nextChapter.title} className="h-full w-full object-cover blur-[2px]" />
                                <div className="absolute inset-0 grid place-items-center bg-black/10">
                                  <LockKeyhole className="h-5 w-5 text-white drop-shadow-md" />
                                </div>
                              </div>
                            ) : (
                              <div className="grid h-12 w-16 place-items-center rounded-md bg-primary-soft text-[10px] font-extrabold text-primary shrink-0">
                                <LockKeyhole className="h-5 w-5" />
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
                          <LockKeyhole className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      ) : (
                        <Link
                          to="/chapter/$id"
                          params={{ id: nextChapter.id }}
                          className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 transition hover:shadow-xs hover:border-primary/30"
                        >
                          <div className="flex items-center gap-3">
                            {nextChapter.videoId ? (
                              <div className="relative h-12 w-16 shrink-0 rounded-md overflow-hidden bg-primary-soft">
                                <img src={`https://img.youtube.com/vi/${nextChapter.videoId}/mqdefault.jpg`} alt={nextChapter.title} className="h-full w-full object-cover" />
                                <div className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[8px] font-bold px-1 py-0.5 rounded backdrop-blur-sm">
                                  VIDEO
                                </div>
                              </div>
                            ) : nextChapter.lessonType === "pdf" ? (
                              <div className="relative h-12 w-16 place-items-center rounded-md bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shrink-0 flex flex-col justify-center items-center">
                                <FileText className="h-5 w-5 text-red-600" />
                                <span className="text-[7px] font-bold text-red-600 mt-0.5">PDF</span>
                              </div>
                            ) : (
                              <div className="grid h-12 w-16 place-items-center rounded-md bg-primary-soft text-[10px] font-extrabold text-primary shrink-0">
                                {nextChapter.duration ?? "-"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-sm font-semibold text-foreground">{nextChapter.title}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {nextChapter.chapterId !== undefined 
                                  ? (nextChapter.chapterName ? `Chapter ${nextChapter.chapterId}: ${nextChapter.chapterName}` : `Chapter ${nextChapter.chapterId}`) 
                                  : (nextChapter.chapterName ?? (nextChapter.lessonType === "pdf" ? "Next PDF" : "Next Video"))}
                              </p>
                            </div>
                          </div>
                          {nextChapter.lessonType === "pdf" ? (
                            <FileText className="h-4 w-4 text-red-600 shrink-0" />
                          ) : (
                            <Play className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </Link>
                      )
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
                      isLockedCourse ? (
                        <div
                          className="flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-xs font-bold text-muted-foreground opacity-70"
                        >
                          <LockKeyhole className="h-3.5 w-3.5" />
                          {nextChapter.title}
                        </div>
                      ) : (
                        <Link
                          to="/chapter/$id"
                          params={{ id: nextChapter.id }}
                          className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:scale-105"
                        >
                          {nextChapter.title} →
                        </Link>
                      )
                    ) : (
                      <div />
                    )}
                  </div>
                </>
              )}
            </div>
          )}

              {/* — RESOURCES — */}
              {tab === "Resources" && (
                <div className="mt-2">
                  <div className="text-[15px] font-extrabold text-slate-900 mb-4">
                    {subjectLoading ? (
                      <div className="h-5 w-40 bg-slate-100 animate-pulse rounded" />
                    ) : isCodingCourse ? "Course Chapters" : chapterData?.chapterId
                      ? `Chapter ${chapterData.chapterId} - Resources`
                      : "Chapter Resources"}
                  </div>
                  {subjectLoading ? (
                    <div className="space-y-4">
                      <div className="h-20 w-full rounded-2xl bg-slate-50 animate-pulse" />
                      <div className="h-20 w-full rounded-2xl bg-slate-50 animate-pulse" />
                    </div>
                  ) : displayedResources.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                      <Play className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-700">No other videos found.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-slate-100">
                      {displayedResources.map((v, idx) => {
                        const isCurrent = v.id === id;
                        
                        // Semantic Color Mapper for Resources
                        const getMaterialTheme = (type: string | undefined | null) => {
                          if (type === "pdf") return { main: "bg-rose-500", light: "bg-rose-50", text: "text-rose-500", border: "border-rose-200", groupLight: "group-hover:bg-rose-50", groupText: "group-hover:text-rose-500", groupBorder: "group-hover:border-rose-200", groupMain: "group-hover:bg-rose-500 group-hover:border-rose-500", icon: FileText };
                          if (type === "link") return { main: "bg-teal-500", light: "bg-teal-50", text: "text-teal-500", border: "border-teal-200", groupLight: "group-hover:bg-teal-50", groupText: "group-hover:text-teal-500", groupBorder: "group-hover:border-teal-200", groupMain: "group-hover:bg-teal-500 group-hover:border-teal-500", icon: LinkIcon };
                          return { main: "bg-primary", light: "bg-primary/10", text: "text-primary", border: "border-primary/30", groupLight: "group-hover:bg-primary/10", groupText: "group-hover:text-primary", groupBorder: "group-hover:border-primary/30", groupMain: "group-hover:bg-primary group-hover:border-primary", icon: Play };
                        };
                        
                        const theme = getMaterialTheme(v.lessonType);
                        const Icon = theme.icon;

                        return (
                          <Link
                            key={v.id}
                            to="/chapter/$id"
                            params={{ id: v.id }}
                            onClick={(event) => {
                              if (isLockedCourse) event.preventDefault();
                            }}
                            aria-disabled={isLockedCourse}
                            className={`flex items-center gap-3 md:gap-4 py-4 group ${isLockedCourse ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            {/* 1. Left Large Icon / Thumbnail (With specific material colors) */}
                            {v.videoId ? (
                              <div className={`relative h-16 w-24 shrink-0 rounded-xl overflow-hidden border ${isCurrent ? `border-blue-500 ring-2 ring-blue-500/20` : `border-slate-200/50 bg-slate-100`}`}>
                                <img src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`} alt={v.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                {/* Playing Animation Overlay */}
                                {isCurrent && (
                                  <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="flex items-end gap-[3px] h-4">
                                      <span className="w-1 bg-white rounded-full animate-[bounce_1s_infinite] h-full"></span>
                                      <span className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_0.2s] h-2/3"></span>
                                      <span className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_0.4s] h-full"></span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={`flex h-16 w-24 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${isCurrent ? `${theme.light} ${theme.border}` : `bg-slate-50 border-slate-100 ${theme.groupLight} ${theme.groupBorder}`}`}>
                                {v.lessonType === "pdf" || v.lessonType === "link" ? (
                                  <Icon className={`h-7 w-7 transition-colors duration-300 ${isCurrent ? theme.text : `text-slate-300 ${theme.groupText}`}`} />
                                ) : (
                                  <span className={`text-xl font-bold transition-colors duration-300 ${isCurrent ? theme.text : `text-slate-400 ${theme.groupText}`}`}>{v.videoOrder ?? idx + 1}</span>
                                )}
                              </div>
                            )}

                            {/* 2. Middle Content */}
                            <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <div className="flex items-center gap-2">
                                <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-md transition-colors duration-300 ${isCurrent ? `${theme.light} ${theme.text}` : `bg-slate-100 text-slate-400 ${theme.groupLight} ${theme.groupText}`}`}>
                                  <Icon className={`h-3 w-3 ${v.lessonType !== 'pdf' && v.lessonType !== 'link' ? 'fill-current translate-x-[0.5px]' : ''}`} />
                                </div>
                                <p className={`truncate text-[15px] font-bold transition-colors duration-300 ${isCurrent ? theme.text : `text-slate-800 ${theme.groupText}`}`}>
                                  {v.title}
                                </p>
                              </div>
                              <p className="truncate text-[13px] font-medium text-slate-500 mt-1">
                                {v.lessonType === "pdf" ? "PDF Document" : v.lessonType === "link" ? "External Material" : (v.duration ?? "-")}
                              </p>
                            </div>

                            {/* 3. Right Action Button (Fills with specific material color on hover) */}
                            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border shadow-sm transition-all duration-300 ${isCurrent ? `${theme.main} border-transparent text-white` : `bg-white border-slate-200 text-slate-400 ${theme.groupMain} group-hover:text-white group-hover:scale-105`}`}>
                              {isLockedCourse ? (
                                <LockKeyhole className="h-4 w-4" />
                              ) : (
                                <Icon className={`h-4 w-4 ${v.lessonType !== 'pdf' && v.lessonType !== 'link' ? 'fill-current translate-x-[1px]' : ''}`} />
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* — NOTES — */}
              {tab === "Notes" && (
                <div className="mt-2">
                  {isLockedCourse ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                      <LockKeyhole className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-900">Course notes are locked</p>
                      <p className="text-xs text-slate-500 mt-1">Buy this course to open and download all notes.</p>
                    </div>
                  ) : (
                    <>
                      {/* Admin PDF / Notes */}
                      {(() => {
                        const pdfLessonsInGroup = isCodingCourse
                          ? publishedSiblings.filter(v => v.lessonType === "pdf" && v.resourcesNote)
                          : chapterGroupVideos.filter(v => v.lessonType === "pdf" && v.resourcesNote);

                        const videosWithNotes = Array.from(new Map(
                          (isCodingCourse
                            ? [
                                // Only include current chapter if it's a PDF type
                                ...((chapterData as any)?.resourcesNote && (chapterData as any)?.lessonType === "pdf" ? [chapterData] : []),
                                // Only PDF type from siblings — NOT link/material
                                ...displayedResources.filter(v => v.lessonType === "pdf" && v.resourcesNote),
                                ...pdfLessonsInGroup
                              ]
                            : [
                                ...pdfLessonsInGroup
                              ]
                          ).map(v => [v.id, v])
                        ).values());

                        if (videosWithNotes.length === 0) return (
                          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                            <FileText className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                            <p className="text-sm font-bold text-slate-700">No notes available.</p>
                          </div>
                        );

                        // Notes are all treated as PDF materials, so we assign the Rose/Red theme
                        const theme = { main: "bg-rose-500", light: "bg-rose-50", text: "text-rose-500", border: "border-rose-200", groupLight: "group-hover:bg-rose-50", groupText: "group-hover:text-rose-500", groupBorder: "group-hover:border-rose-200", groupMain: "group-hover:bg-rose-500 group-hover:border-rose-500" };

                        return (
                          <div className="flex flex-col divide-y divide-slate-100">
                            {videosWithNotes.map((video) => {
                              const urlMatch = video.resourcesNote!.match(/https?:\/\/[^\s]+/);
                              const url = urlMatch?.[0] ?? null;
                              // Text without URL
                              const textOnly = video.resourcesNote!.replace(/https?:\/\/[^\s]+/g, "").trim();

                              // Open in-app — navigate to the PDF chapter page (same as school section)
                              // This gives fullscreen PDF with proper header and Next Up bar
                              const handlePdfClick = (targetId: string) => {
                                if (targetId !== id) {
                                  router.navigate({ to: "/chapter/$id", params: { id: targetId } });
                                }
                                // If same chapter, open iframe modal as fallback
                                else if (url) {
                                  const isDrive = url.includes("drive.google.com/file/d/");
                                  const embedUrl = isDrive
                                    ? url.replace("/view", "/preview").split("?")[0]
                                    : `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
                                  setIframeUrl(embedUrl);
                                  setIframeTitle(video.title ?? "Lesson Notes");
                                }
                              };

                              return (
                                <div
                                  key={video.id}
                                  onClick={() => handlePdfClick(video.id)}
                                  className="flex items-center gap-3 md:gap-4 py-4 group cursor-pointer"
                                >
                                  {/* 1. Left Large Icon (Fills with Red on hover) */}
                                  <div className={`flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 transition-colors duration-300 ${theme.groupLight} ${theme.groupBorder}`}>
                                    <FileText className={`h-7 w-7 text-slate-300 transition-colors duration-300 ${theme.groupText}`} />
                                  </div>

                                  {/* 2. Middle Content */}
                                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                                    <div className="flex items-center gap-2">
                                      <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-400 transition-colors duration-300 ${theme.groupLight} ${theme.groupText}`}>
                                        <FileText className="h-3 w-3" />
                                      </div>
                                      <p className={`truncate text-[15px] font-bold text-slate-800 transition-colors duration-300 ${theme.groupText}`}>
                                        {video.title ?? "Lesson Notes"}
                                      </p>
                                    </div>
                                    <p className="truncate text-[13px] font-medium text-slate-500 mt-1">
                                      {video.chapterId !== undefined
                                        ? `Chapter ${video.chapterId}${video.chapterName ? `: ${video.chapterName}` : ""}`
                                        : "Notes"}
                                    </p>
                                    {/* If there is additional text description, show it neatly truncated */}
                                    {textOnly && (
                                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-medium">
                                        {textOnly}
                                      </p>
                                    )}
                                  </div>

                                  {/* 3. Right Action Arrow Button (Turns Red on hover) */}
                                  {url && (
                                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm transition-all duration-300 ${theme.groupMain} group-hover:text-white group-hover:scale-105`}>
                                      <ArrowRight className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              


            </div>
              </div>
            )}
          </div>
        </div>
      </div>
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

      {/* PDF / Material iframe modal — fullscreen, same style as school PDF view */}
      {iframeUrl && (
        <div className="fixed inset-0 z-[9990] bg-white flex flex-col" style={{ touchAction: "none" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-primary shrink-0">
            <button
              onClick={() => { setIframeUrl(null); setIframeTitle(""); }}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 transition shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-center min-w-0 flex-1 px-3">
              <p className="text-sm font-bold text-white truncate">{iframeTitle}</p>
              <p className="text-[11px] text-white/70 mt-0.5">PDF / Material</p>
            </div>
            <button
              onClick={() => { setIframeUrl(null); setIframeTitle(""); }}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 transition shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Iframe fills remaining space */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src={iframeUrl}
              className="w-full h-full border-none bg-white"
              style={{ minHeight: 0, height: "100%" }}
              title={iframeTitle}
              allowFullScreen
            />
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
            <div style={{ width: "100vw", height: "56.25vw", minHeight: "270px", maxHeight: "100vh" }}>
              <PlyrVideoPlayer videoId={videoId} startTime={startTime} />
            </div>
          </div>

          {/* Bottom hint */}
          <div className="px-5 py-4 text-center">
            <p className="text-white/40 text-[10px] font-semibold">Tap × to go back</p>
          </div>
        </div>
      )}

      {/* FIXED BOTTOM NEXT UP (Mobile Only) */}
      {!videoExpanded && !showPurchaseBar && !iframeUrl && (
        <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-50 bg-background border-t border-border shadow-lg">
          {subjectLoading ? (
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex flex-col gap-1.5">
                <div className="h-2.5 w-12 bg-muted rounded animate-pulse" />
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                <div className="h-2.5 w-28 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0 ml-4" />
            </div>
          ) : nextChapter ? (
            <Link
              to="/chapter/$id"
              params={{ id: nextChapter.id }}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Next Up</span>
                <p className="text-sm font-bold text-foreground truncate mt-0.5">{nextChapter.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[11px] text-muted-foreground truncate">
                    {nextChapter.chapterId !== undefined
                      ? (nextChapter.chapterName ? `Chapter ${nextChapter.chapterId}: ${nextChapter.chapterName}` : `Chapter ${nextChapter.chapterId}`)
                      : (nextChapter.chapterName ?? "")}
                  </p>
                  <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${nextChapter.lessonType === "pdf" ? "bg-red-100 text-red-600" : nextChapter.lessonType === "link" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-primary"}`}>
                    {nextChapter.lessonType === "pdf" ? ".pdf" : nextChapter.lessonType === "link" ? ".material" : ".video"}
                  </span>
                </div>
              </div>
              <div className="shrink-0 ml-4 grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-md">
                <ArrowRight className="h-6 w-6" />
              </div>
            </Link>
          ) : chapterData?.subjectId ? (
            // Last chapter — show "Chapter Completed" → go to next chapter shell or subject
            <Link
              to={nextChapterShell ? "/chapter/$id" : "/subject/$id"}
              params={nextChapterShell ? { id: nextChapterShell.id } : { id: chapterData.subjectId }}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Chapter Completed
                </span>
                <p className="text-sm font-bold text-foreground truncate mt-0.5">
                  {nextChapterShell ? nextChapterShell.chapterName ?? nextChapterShell.title : subjectData?.title ?? "Back to Subject"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {nextChapterShell ? `Chapter ${nextChapterShell.chapterId ?? ""}` : "You've finished all chapters 🎉"}
                </p>
              </div>
              <div className="shrink-0 ml-4 grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white shadow-md">
                <CheckCircle className="h-6 w-6" />
              </div>
            </Link>
          ) : null}
        </div>
      )}
    </MobileFrame>
  );
}

