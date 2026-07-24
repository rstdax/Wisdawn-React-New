import { createFileRoute, Link, useParams, useRouter, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Bookmark, Play, FileText, Download, ListChecks,
  MessageSquareText, CheckCircle, Check, Clock, BookOpen,
  Maximize2, X, ChevronRight, Link as LinkIcon,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";
import {
  getLesson, getChapter, getLessonNavContext, getResources, getQA, addQA,
  getDiscussions, addDiscussion, getLessonsByChapter, saveLastWatched, getSubject,
  type Lesson, type Chapter, type Resource, type QAItem,
  type Discussion, type LessonNavContext,
} from "@/lib/admin";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/lesson/$chapterId/$lessonId")({
  head: () => ({ meta: [{ title: "Lesson — WisDawn" }] }),
  component: LessonPage,
});

const tabs = ["Overview", "Resources", "Notes", "Q&A", "Discussions"] as const;
type Tab = (typeof tabs)[number];

const typeIcons: Record<Resource["type"], React.ElementType> = {
  pdf: FileText, video: Play, test: ListChecks, link: LinkIcon,
};

function LessonPage() {
  const { chapterId, lessonId } = useParams({ from: "/lesson/$chapterId/$lessonId" });
  const router = useRouter();
  const { user, displayName } = useAuth();

  const [tab, setTab] = useState<Tab>("Overview");
  const [bookmarked, setBookmarked] = useState(false);
  const [markedComplete, setMarkedComplete] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [navCtx, setNavCtx] = useState<LessonNavContext | null>(null);
  const [chapterLessons, setChapterLessons] = useState<Lesson[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [qaDraft, setQaDraft] = useState("");
  const [discussionDraft, setDiscussionDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setDescExpanded(false);
    setNotesExpanded(false);
    Promise.all([
      getLesson(chapterId, lessonId),
      getChapter(chapterId),
      getLessonNavContext(chapterId, lessonId),
      getLessonsByChapter(chapterId),
      getResources(chapterId),
      getQA(chapterId),
      getDiscussions(chapterId),
    ]).then(([les, ch, nav, allLessons, res, qa, disc]) => {
      setLesson(les);
      setChapter(ch);
      setNavCtx(nav);
      setChapterLessons(allLessons.filter((l) => l.published));
      setResources(res);
      setQaList(qa);
      setDiscussions(disc);
    }).finally(() => setLoading(false));
  }, [chapterId, lessonId]);

  useEffect(() => {
    if (lesson && chapter && user?.uid && chapter.subjectId) {
      getSubject(chapter.subjectId).then((sub) => {
        if (sub) {
          saveLastWatched(user.uid, {
            chapterId: chapter.id, // Using chapterId for navigation back to chapter or lesson group
            chapterTitle: lesson.title, // Use lesson title as the specific item title
            subjectId: sub.id,
            subjectTitle: sub.title,
            videoId: lesson.youtubeVideoId,
          }).catch(console.error);
        }
      });
    }
  }, [lesson, chapter, user?.uid]);

  const videoId = lesson?.youtubeVideoId ?? null;
  const startTime = lesson?.startTimeSeconds ?? 0;
  const lessonTitle = lesson?.title ?? "Loading…";
  const chapterTitle = chapter?.title ?? "";

  const addNote = () => {
    if (!noteDraft.trim()) return;
    setNotes((n) => [noteDraft.trim(), ...n]);
    setNoteDraft("");
  };

  const submitQuestion = async () => {
    if (!qaDraft.trim() || !user) return;
    setSubmitting(true);
    await addQA(chapterId, qaDraft.trim(), user.uid);
    setQaList(await getQA(chapterId));
    setQaDraft("");
    setSubmitting(false);
  };

  const submitDiscussion = async () => {
    if (!discussionDraft.trim() || !user) return;
    setSubmitting(true);
    await addDiscussion(chapterId, discussionDraft.trim(), displayName, user.uid);
    setDiscussions(await getDiscussions(chapterId));
    setDiscussionDraft("");
    setSubmitting(false);
  };

  const iframeSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&fs=1&iv_load_policy=3${startTime ? `&start=${startTime}` : ""}`
    : null;

  return (
    <MobileFrame>
      {/* MOBILE HEADER */}
      <header className="flex md:hidden items-center justify-between px-5 pt-2">
        <button onClick={() => router.history.back()} className="grid h-9 w-9 place-items-center rounded-full active:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center max-w-[60%]">
          <h1 className="text-sm font-bold truncate">{lessonTitle}</h1>
          <p className="text-[11px] text-muted-foreground truncate">{chapterTitle}</p>
        </div>
        <button onClick={() => setBookmarked((v) => !v)}
          className={`grid h-9 w-9 place-items-center rounded-full ${bookmarked ? "bg-primary-soft text-primary" : "active:bg-muted"}`}>
          <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto md:overflow-visible pb-6">
        {/* DESKTOP HEADING */}
        <div className="hidden md:block mb-5 px-5 md:px-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mb-2">
            <span>{chapterTitle}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">{lessonTitle}</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{lessonTitle}</h1>
              {navCtx && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {chapterTitle} · Lesson {navCtx.lessonIndex + 1}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setBookmarked((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-bold transition ${bookmarked ? "bg-primary-soft text-primary border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}>
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} /> Save
              </button>
              <button onClick={() => setMarkedComplete((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${markedComplete ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-primary/95"}`}>
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
              {loading ? (
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="flex flex-col items-center gap-3 opacity-50">
                      <div className="h-14 w-14 rounded-full bg-white/20 animate-pulse" />
                      <p className="text-xs text-white/60 font-semibold">Loading…</p>
                    </div>
                  </div>
                </div>
              ) : iframeSrc ? (
                <>

                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
                    <iframe key={`${lessonId}-${videoId}`} src={iframeSrc} title={lessonTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen referrerPolicy="origin"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} />
                  </div>
                </>
              ) : (
                <div className="relative grid aspect-video place-items-center">
                  <Wisby variant="cheer" className="h-32 opacity-90" />
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

            {/* LESSON TITLE + META (mobile) */}
            <div className="md:hidden px-0">
              <h2 className="text-base font-bold text-foreground">{lessonTitle}</h2>
              {navCtx && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {chapterTitle} · Lesson {navCtx.lessonIndex + 1}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                {lesson?.durationDisplay && (
                  <span className="flex items-center gap-1 bg-muted/40 px-3 py-1 rounded-full text-xs font-semibold text-muted-foreground">
                    <Clock className="h-3 w-3 text-primary" /> {lesson.durationDisplay}
                  </span>
                )}
                {chapter?.difficulty && (
                  <span className="flex items-center gap-1 bg-muted/40 px-3 py-1 rounded-full text-xs font-semibold text-muted-foreground">
                    <BookOpen className="h-3 w-3 text-primary" /> {chapter.difficulty}
                  </span>
                )}
              </div>
            </div>

            {/* TABS */}
            <div className="flex gap-5 border-b border-border text-sm overflow-x-auto">
              {tabs.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`-mb-px border-b-2 py-3.5 font-bold transition whitespace-nowrap ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="pt-2">
              {/* ── OVERVIEW ── */}
              {tab === "Overview" && (
                <div className="space-y-5">
                  {/* Description */}
                  {(lesson?.description || chapter?.description) && (
                    <div>
                      <h3 className="text-base font-bold text-foreground">About This Lesson</h3>
                      <div className="mt-2 overflow-hidden">
                        <p className={`text-sm leading-relaxed text-muted-foreground whitespace-pre-line break-words ${descExpanded ? "" : "line-clamp-4"}`}
                          style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
                          {lesson?.description ?? chapter?.description}
                        </p>
                        {(lesson?.description ?? "").length > 180 && (
                          <button onClick={() => setDescExpanded((v) => !v)}
                            className="mt-1 text-xs font-bold text-foreground hover:text-primary transition">
                            {descExpanded ? "Show less ▲" : "...more ▼"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Resources note */}
                  {(lesson?.resourcesNote || chapter?.resourcesNote) && (
                    <div className="rounded-2xl border border-border bg-amber-50/60 p-4 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">📌 Resources &amp; Notes</p>
                        <button onClick={() => setNotesExpanded((v) => !v)}
                          className="text-[10px] font-bold text-amber-700 hover:text-amber-900 transition">
                          {notesExpanded ? "Show less ▲" : "Show more ▼"}
                        </button>
                      </div>
                      <p className={`text-sm text-foreground leading-relaxed whitespace-pre-line break-words mt-2 ${notesExpanded ? "" : "line-clamp-3"}`}
                        style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
                        {lesson?.resourcesNote ?? chapter?.resourcesNote}
                      </p>
                    </div>
                  )}

                  {/* What you'll learn */}
                  {(lesson?.whatYouLearn ?? []).length > 0 && (
                    <div className="hidden md:block">
                      <h3 className="text-sm font-bold text-foreground mb-3">What You'll Learn</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-semibold">
                        {lesson!.whatYouLearn!.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" /> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Up */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-foreground">Next Up</h3>
                    {navCtx?.nextLesson ? (
                      <Link
                        to="/lesson/$chapterId/$lessonId"
                        params={{ chapterId: navCtx.nextLessonChapter?.id ?? chapterId, lessonId: navCtx.nextLesson.id }}
                        className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 transition hover:shadow-xs hover:border-primary/30"
                      >
                        <div className="flex items-center gap-3">
                          {navCtx.nextLesson.youtubeVideoId ? (
                            <img src={`https://img.youtube.com/vi/${navCtx.nextLesson.youtubeVideoId}/mqdefault.jpg`} alt={navCtx.nextLesson.title} className="h-12 w-16 rounded-md object-cover shrink-0 bg-primary-soft" />
                          ) : (
                            <div className="grid h-12 w-16 place-items-center rounded-md bg-primary-soft text-[10px] font-extrabold text-primary shrink-0">
                              {navCtx.nextLesson.durationDisplay ?? "—"}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{navCtx.nextLesson.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {navCtx.nextLessonChapter ? navCtx.nextLessonChapter.title : chapterTitle}
                            </p>
                            {navCtx.nextLesson.durationDisplay && (
                              <p className="text-[10px] text-primary font-semibold mt-0.5">{navCtx.nextLesson.durationDisplay}</p>
                            )}
                          </div>
                        </div>
                        <Play className="h-4 w-4 text-primary shrink-0" />
                      </Link>
                    ) : navCtx?.isLastLessonOfSubject ? (
                      <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                        <p className="text-sm font-bold text-emerald-700">🎉 Course Complete!</p>
                        <p className="text-xs text-emerald-600 mt-1">You've finished all lessons in this course.</p>
                      </div>
                    ) : (
                      <div className="mt-2 rounded-2xl border border-dashed border-border bg-card p-3.5 text-xs text-muted-foreground text-center font-semibold">
                        You've reached the last lesson in this chapter.
                      </div>
                    )}
                  </div>

                  {/* Prev / Next desktop */}
                  <div className="hidden md:flex justify-between items-center pt-4 border-t border-border">
                    {navCtx?.prevLesson ? (
                      <Link to="/lesson/$chapterId/$lessonId"
                        params={{ chapterId: navCtx.prevLessonChapter?.id ?? chapterId, lessonId: navCtx.prevLesson.id }}
                        className="rounded-full border border-border px-5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted transition">
                        ← {navCtx.prevLesson.title}
                      </Link>
                    ) : <div />}
                    {navCtx?.nextLesson ? (
                      <Link to="/lesson/$chapterId/$lessonId"
                        params={{ chapterId: navCtx.nextLessonChapter?.id ?? chapterId, lessonId: navCtx.nextLesson.id }}
                        className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:scale-105">
                        {navCtx.nextLesson.title} →
                      </Link>
                    ) : <div />}
                  </div>
                </div>
              )}

              {/* ── RESOURCES ── */}
              {tab === "Resources" && (
                <div>
                  <p className="text-sm font-bold">Chapter Resources</p>
                  {resources.length === 0 ? (
                    <div className="mt-4 rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground font-semibold">No resources added yet.</div>
                  ) : (
                    <>
                      <div className="mt-3 space-y-3">
                        {resources.map((r) => {
                          const Icon = typeIcons[r.type] ?? FileText;
                          const isDownloaded = downloadedIds.includes(r.id);
                          let thumbVid = null;
                          if (r.type === "video" && r.url) {
                            const m = r.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                            thumbVid = m ? m[1] : (r.url.length === 11 ? r.url : null);
                          }
                          return (
                            <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 transition hover:shadow-xs">
                              {thumbVid ? (
                                <img src={`https://img.youtube.com/vi/${thumbVid}/mqdefault.jpg`} alt={r.title} className="h-10 w-14 shrink-0 rounded-md object-cover bg-primary-soft" />
                              ) : (
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="h-4 w-4" /></div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{r.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{r.type.toUpperCase()} · {r.size ?? "—"}</p>
                              </div>
                              {r.url ? (
                                <a href={r.url} target="_blank" rel="noreferrer"
                                  className="grid h-9 w-9 place-items-center rounded-full bg-muted text-primary hover:bg-primary-soft transition">
                                  <Download className="h-4 w-4" />
                                </a>
                              ) : (
                                <button onClick={() => setDownloadedIds((c) => c.includes(r.id) ? c.filter((x) => x !== r.id) : [...c, r.id])}
                                  className={`grid h-9 w-9 place-items-center rounded-full transition ${isDownloaded ? "bg-primary text-primary-foreground" : "bg-muted text-primary hover:bg-primary-soft"}`}>
                                  <Download className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <button onClick={() => setDownloadedIds(resources.map((r) => r.id))}
                        className="mt-5 w-full rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/95">
                        Download All Resources
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ── NOTES ── */}
              {tab === "Notes" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Write a quick note for this lesson"
                      className="min-h-24 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                    <div className="flex justify-end mt-2">
                      <button onClick={addNote} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:scale-105">Save Note</button>
                    </div>
                  </div>
                  {notes.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground font-semibold">Your notes will appear here.</div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note, i) => (
                        <div key={i} className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-xs">
                          <p>{note}</p>
                          <p className="text-[10px] text-muted-foreground mt-2 font-medium">Added recently</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Q&A ── */}
              {tab === "Q&A" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <MessageSquareText className="h-4 w-4 text-primary" /> Ask a Question
                    </div>
                    <textarea value={qaDraft} onChange={(e) => setQaDraft(e.target.value)}
                      placeholder={user ? "Ask anything about this lesson" : "Sign in to ask a question"} disabled={!user}
                      className="mt-3 min-h-20 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50" />
                    <div className="flex justify-end mt-2">
                      <button onClick={submitQuestion} disabled={!user || submitting}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:scale-105 disabled:opacity-50">
                        {submitting ? "Sending…" : "Send Question"}
                      </button>
                    </div>
                  </div>
                  {qaList.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground font-semibold">No questions yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {qaList.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-border bg-card p-4 text-sm shadow-xs">
                          <p className="font-bold text-foreground">Q: {item.question}</p>
                          {item.answer ? (
                            <p className="mt-2 text-muted-foreground leading-relaxed pl-3 border-l-2 border-primary-soft">{item.answer}</p>
                          ) : (
                            <p className="mt-2 text-xs text-muted-foreground italic">Awaiting answer from instructor…</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── DISCUSSIONS ── */}
              {tab === "Discussions" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <MessageSquareText className="h-4 w-4 text-primary" /> Join the Discussion
                    </div>
                    <textarea value={discussionDraft} onChange={(e) => setDiscussionDraft(e.target.value)}
                      placeholder={user ? "Share your thoughts…" : "Sign in to participate"} disabled={!user}
                      className="mt-3 min-h-20 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50" />
                    <div className="flex justify-end mt-2">
                      <button onClick={submitDiscussion} disabled={!user || submitting}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:scale-105 disabled:opacity-50">
                        {submitting ? "Posting…" : "Post Message"}
                      </button>
                    </div>
                  </div>
                  {discussions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                      <MessageSquareText className="h-8 w-8 mx-auto opacity-50 mb-2" />
                      <p className="font-semibold">No discussions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {discussions.map((d) => (
                        <div key={d.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white text-xs font-bold">
                            {d.authorName?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">{d.authorName}</p>
                            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed break-words" style={{ wordBreak: "break-word" }}>{d.message}</p>
                            {d.createdAt && <p className="text-[10px] text-muted-foreground mt-1">{new Date(d.createdAt).toLocaleString()}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR — lesson playlist */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-bold text-foreground mb-4">{chapterTitle}</h3>
              <div className="space-y-2">
                {chapterLessons.map((l, idx) => {
                  const isCurrent = l.id === lessonId;
                  return (
                    <Link key={l.id} to="/lesson/$chapterId/$lessonId"
                      params={{ chapterId, lessonId: l.id }}
                      className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-semibold transition ${isCurrent ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
                      <span className={`grid h-6 w-6 place-items-center rounded-lg text-[10px] font-bold shrink-0 ${isCurrent ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                        {idx + 1}
                      </span>
                      <span className="flex-1 truncate">{l.title}</span>
                      <span className={`opacity-75 font-semibold shrink-0 ${isCurrent ? "text-white/80" : ""}`}>{l.durationDisplay ?? "—"}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      

      {/* MOBILE FULLSCREEN VIDEO */}
      {videoExpanded && iframeSrc && (
        <div className="md:hidden fixed inset-0 z-50 bg-black flex flex-col" style={{ touchAction: "none" }}>
          <button onClick={() => setVideoExpanded(false)}
            className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 transition">
            <X className="h-5 w-5" />
          </button>
          <div className="px-5 pt-4 pb-2">
            <p className="text-white text-xs font-semibold opacity-70 truncate pr-12">{lessonTitle}</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <iframe key={`expand-${lessonId}`}
              src={iframeSrc.replace("playsinline=1", "playsinline=1&autoplay=1")}
              title={lessonTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen referrerPolicy="origin"
              style={{ width: "100vw", height: "56.25vw", minHeight: 270, maxHeight: "100vh", border: "none", display: "block" }} />
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-white/40 text-[10px] font-semibold">Tap × to go back</p>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}
