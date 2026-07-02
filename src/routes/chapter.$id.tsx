import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  FileText,
  Download,
  ListChecks,
  MessageSquareText,
  CheckCircle,
  HelpCircle,
  Clock,
  BookOpen,
  Check,
  ChevronRight,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";

export const Route = createFileRoute("/chapter/$id")({
  head: () => ({ meta: [{ title: "Chapter — WisDawn" }] }),
  component: Chapter,
});

const tabs = ["Overview", "Resources", "Notes", "Q&A", "Discussions"] as const;
type Tab = (typeof tabs)[number];

const resourcesList = [
  { id: "intro", t: "1. Introduction and Basics", s: "PDF · 1.2 MB", i: FileText },
  { id: "types", t: "2. Visual Explanations", s: "Video · 16:25", i: Play },
  { id: "practice", t: "3. Practice Questions (MCQ)", s: "PDF · 842 KB", i: FileText },
  { id: "solutions", t: "4. Question Solutions", s: "PDF · 2.4 MB", i: FileText },
  { id: "mindmap", t: "5. Chapter Mind Map", s: "PDF · 1.1 MB", i: FileText },
  { id: "test", t: "6. Quick Assessment Test", s: "Test · 10 Questions", i: ListChecks },
];

const playlistLessons = [
  { id: "1", title: "1. Introduction to Topic", duration: "16:25", active: true, locked: false },
  { id: "2", title: "2. Core Tags and Concepts", duration: "18:40", active: false, locked: true },
  { id: "3", title: "3. Structure & Elements", duration: "12:30", active: false, locked: true },
  { id: "4", title: "4. Links and Images", duration: "15:10", active: false, locked: true },
  { id: "5", title: "5. Lists & Details", duration: "14:20", active: false, locked: true },
  { id: "6", title: "6. Styling Basics", duration: "16:00", active: false, locked: true },
  { id: "7", title: "7. Standard Forms", duration: "20:15", active: false, locked: true },
  { id: "8", title: "8. Semantic Layouts", duration: "17:30", active: false, locked: true },
];

function Chapter() {
  const { id } = useParams({ from: "/chapter/$id" });
  const [tab, setTab] = useState<Tab>("Overview");
  const [bookmarked, setBookmarked] = useState(false);
  const [markedComplete, setMarkedComplete] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<string[]>(["intro", "types"]);
  const [notes, setNotes] = useState<string[]>([
    "Remember to check combination and displacement reactions carefully.",
  ]);
  const [noteDraft, setNoteDraft] = useState("");
  const [qaDraft, setQaDraft] = useState("");
  const [qas, setQas] = useState([
    {
      q: "What is the key takeaway of this lesson?",
      a: "Wisby: Focus on the basic syntax and patterns, then apply it in the practice test.",
    },
  ]);

  // Contextual text based on the active path/chapter ID
  const isCoding =
    !id.includes("reaction") &&
    !id.includes("equations") &&
    !id.includes("life") &&
    !id.includes("algebra");
  const trackName = isCoding ? "Coding Bootcamp" : "School Academy";
  const subjectTitle = isCoding ? "Web Development" : "Science";
  const chapterTitle = isCoding ? "HTML Basics" : "Chemical Reactions";
  const lessonTitle = isCoding ? "Introduction to HTML" : "Chemical Reactions & Equations";
  const lessonIndex = isCoding ? "Lesson 1 of 15" : "Chapter 2";

  const toggleDownload = (resourceId: string) => {
    setDownloadedIds((current) =>
      current.includes(resourceId)
        ? current.filter((item) => item !== resourceId)
        : [...current, resourceId],
    );
  };

  const addNote = () => {
    if (!noteDraft.trim()) return;
    setNotes((current) => [noteDraft.trim(), ...current]);
    setNoteDraft("");
  };

  const addQuestion = () => {
    if (!qaDraft.trim()) return;
    setQas((current) => [
      {
        q: qaDraft.trim(),
        a: `Wisby: Excellent question! Let's think about this. In ${chapterTitle}, we always start with the basic rules and build up. Check the resources tab for diagrams.`,
      },
      ...current,
    ]);
    setQaDraft("");
  };

  return (
    <MobileFrame>
      {/* MOBILE-ONLY HEADER */}
      <header className="flex md:hidden items-center justify-between px-5 pt-2">
        <Link to="/home" className="grid h-9 w-9 place-items-center rounded-full active:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-bold">{chapterTitle}</h1>
          <p className="text-[11px] text-muted-foreground">
            {isCoding ? "Coding Bootcamp" : "Class 10 · Science"}
          </p>
        </div>
        <button
          onClick={() => setBookmarked((value) => !value)}
          className={`grid h-9 w-9 place-items-center rounded-full ${bookmarked ? "bg-primary-soft text-primary" : "active:bg-muted"}`}
        >
          <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
        </button>
      </header>

      {/* RESPONSIVE CONTAINER */}
      <div className="flex-1 overflow-y-auto md:overflow-visible pb-6">
        {/* DESKTOP BREADCRUMBS & HEADING */}
        <div className="hidden md:block mb-5 px-5 md:px-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <span>{trackName}</span>
            <span>&gt;</span>
            <span>{subjectTitle}</span>
            <span>&gt;</span>
            <span>{chapterTitle}</span>
            <span>&gt;</span>
            <span className="text-primary">{lessonTitle}</span>
          </div>

          <div className="flex justify-between items-start mt-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                {lessonTitle}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lessonIndex} · {chapterTitle}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setBookmarked((value) => !value)}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-bold transition ${
                  bookmarked
                    ? "bg-primary-soft text-primary border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                <span>Save</span>
              </button>
              <button
                onClick={() => setMarkedComplete((value) => !value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                  markedComplete
                    ? "bg-emerald-500 text-white"
                    : "bg-primary text-white hover:bg-primary/95"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>{markedComplete ? "Completed ✓" : "Mark as Complete"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 md:px-0">
          {/* LEFT COLUMN: VIDEO & MAIN DETAILS */}
          <div className="lg:col-span-2 space-y-4">
            {/* VIDEO PLAYER */}
            <div className="overflow-hidden rounded-2xl bg-[oklch(0.25_0.12_265)] text-white shadow-md">
              <div className="relative grid aspect-video place-items-center">
                <Wisby variant="cheer" className="h-32 opacity-90" />
                <div className="absolute left-4 top-4 text-xs font-bold opacity-80 uppercase tracking-wider">
                  {lessonTitle}
                </div>
                <button className="absolute inset-0 m-auto grid h-16 w-16 place-items-center rounded-full bg-white/95 text-primary shadow-lg transition active:scale-95">
                  <Play className="h-6 w-6 fill-current translate-x-0.5" />
                </button>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-xs border-t border-white/10 bg-black/10">
                <SkipBack className="h-4 w-4 cursor-pointer hover:opacity-80" />
                <Play className="h-4 w-4 fill-current cursor-pointer hover:opacity-80" />
                <SkipForward className="h-4 w-4 cursor-pointer hover:opacity-80" />
                <Volume2 className="h-4 w-4 cursor-pointer hover:opacity-80" />
                <div className="mx-2 h-1 flex-1 rounded-full bg-white/20">
                  <div className="h-full w-[45%] rounded-full bg-white" />
                </div>
                <span className="font-medium">08:14 / 16:25</span>
                <span className="rounded-md bg-white/15 px-2 py-0.5 font-bold">1.25×</span>
                <Maximize2 className="h-4 w-4 cursor-pointer hover:opacity-80" />
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex gap-5 border-b border-border text-sm overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`-mb-px border-b-2 py-3.5 font-bold transition whitespace-nowrap ${
                    tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* TAB CONTAINER */}
            <div className="pt-2">
              {tab === "Overview" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-foreground">About This Lesson</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      In this section, we will learn about the key concepts in {chapterTitle}. We
                      will walk through live examples, examine reactants, structures, and run
                      through step-by-step instructions.
                    </p>
                  </div>

                  {/* Desktop Stats */}
                  <div className="hidden md:flex gap-4">
                    <div className="flex items-center gap-2 bg-muted/40 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Duration: 16:25 min</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/40 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>Difficulty: Beginner</span>
                    </div>
                  </div>

                  {/* What You'll Learn Checklists (Desktop only) */}
                  <div className="hidden md:block">
                    <h3 className="text-sm font-bold text-foreground mb-3">What You'll Learn</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-semibold">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" /> Introduction to core terms
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" /> Basic syntax and rules
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" /> Hands-on examples & diagrams
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" /> Creating first projects
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" /> Common mistakes to avoid
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" /> Best practices & standards
                      </div>
                    </div>
                  </div>

                  {/* UP NEXT OR PRACTICE CTA */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-foreground">Next Up</h3>
                    <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 transition hover:shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-16 place-items-center rounded-xl bg-primary-soft text-[10px] font-extrabold text-primary">
                          18:40
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            Core Tags & Concepts
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Lesson 2 · {chapterTitle}
                          </p>
                        </div>
                      </div>
                      <Play className="h-4 w-4 text-primary" />
                    </div>
                    <Link
                      to="/practice/$id"
                      params={{ id }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition active:scale-[0.99]"
                    >
                      <ListChecks className="h-4 w-4" /> Start Practice Test
                    </Link>
                  </div>

                  {/* Prev/Next buttons for Desktop */}
                  <div className="hidden md:flex justify-between items-center pt-4 border-t border-border">
                    <button className="rounded-full border border-border px-5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted transition">
                      &lt; Previous Lesson
                    </button>
                    <button className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:scale-105">
                      Next Lesson &gt;
                    </button>
                  </div>
                </div>
              )}

              {tab === "Resources" && (
                <div>
                  <p className="text-sm font-bold">Chapter Resources</p>
                  <div className="mt-3 space-y-3">
                    {resourcesList.map((r) => {
                      const Icon = r.i;
                      const isDownloaded = downloadedIds.includes(r.id);
                      return (
                        <div
                          key={r.t}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 transition hover:shadow-xs"
                        >
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{r.t}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{r.s}</p>
                          </div>
                          <button
                            onClick={() => toggleDownload(r.id)}
                            className={`grid h-9 w-9 place-items-center rounded-full transition ${
                              isDownloaded
                                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                                : "bg-muted text-primary hover:bg-primary-soft"
                            }`}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setDownloadedIds(resourcesList.map((resource) => resource.id))}
                    className="mt-5 w-full rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/95"
                  >
                    Download All Resources
                  </button>
                </div>
              )}

              {tab === "Notes" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <textarea
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      placeholder="Write a quick note for this chapter"
                      className="min-h-24 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={addNote}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:scale-105"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {notes.map((note, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-xs"
                      >
                        <p>{note}</p>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                          Added recently
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "Q&A" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <MessageSquareText className="h-4 w-4 text-primary" /> Ask Wisby
                    </div>
                    <textarea
                      value={qaDraft}
                      onChange={(event) => setQaDraft(event.target.value)}
                      placeholder="Ask anything about this chapter"
                      className="mt-3 min-h-20 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={addQuestion}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:scale-105"
                      >
                        Send Question
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {qas.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-border bg-card p-4 text-sm shadow-xs"
                      >
                        <p className="font-bold text-foreground">Q: {item.q}</p>
                        <p className="mt-2 text-muted-foreground leading-relaxed pl-3 border-l-2 border-primary-soft">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "Discussions" && (
                <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                  <MessageSquareText className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                  <p className="font-semibold">Join the discussion</p>
                  <p className="text-xs mt-1">Connect with other students studying this chapter.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DESKTOP ONLY DETAILS */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* PLAYLIST WIDGET */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Lesson Playlist</h3>
                <span className="text-[10px] bg-primary-soft text-primary px-2.5 py-0.5 rounded-full font-bold">
                  15 Lessons
                </span>
              </div>

              <div className="space-y-2.5">
                {playlistLessons.map((pl) => (
                  <div
                    key={pl.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition ${
                      pl.active
                        ? "bg-primary-soft border-primary/20 text-primary"
                        : "bg-muted/10 border-border/60 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-lg text-[10px] font-bold ${
                          pl.active ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {pl.id}
                      </span>
                      <p className="truncate font-bold">{pl.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] opacity-75 font-semibold">{pl.duration}</span>
                      {pl.locked && <span className="text-muted-foreground text-[10px]">🔒</span>}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-2xl border border-border py-3 text-xs font-bold text-muted-foreground hover:bg-muted transition">
                <span>View All Lessons</span>
                <ChevronRight className="h-3.5 w-3.5 rotate-90" />
              </button>
            </div>

            {/* QUICK NOTES WIDGET */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">Quick Notes</h3>
                <button
                  onClick={addNote}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Add Note
                </button>
              </div>
              <div className="space-y-3">
                <textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder="Type a fast note here..."
                  className="w-full h-20 p-3 rounded-2xl border border-border/80 bg-muted/20 text-xs outline-none resize-none"
                />

                {notes.length > 0 && (
                  <div className="rounded-2xl bg-amber-50/50 border border-amber-100/50 p-3 text-[11px] text-amber-900">
                    <p className="font-semibold">Last note:</p>
                    <p className="mt-1 line-clamp-2">{notes[0]}</p>
                  </div>
                )}
              </div>
            </div>

            {/* NEED HELP? WIDGET */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-bold text-foreground">Need Help?</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Stuck on something? Get help from instructors or classmates.
              </p>
              <button
                onClick={() => setTab("Q&A")}
                className="w-full mt-4 rounded-2xl bg-primary-soft py-3 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
              >
                Ask in Q&A
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
