import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";

export const Route = createFileRoute("/chapter/$id")({
  head: () => ({ meta: [{ title: "Chapter — WisDawn" }] }),
  component: Chapter,
});

const tabs = ["Overview", "Resources", "Notes", "Q&A"] as const;
type Tab = (typeof tabs)[number];

const resources = [
  { t: "1. Introduction to Chemical Reactions", s: "PDF · 1.2 MB", i: FileText },
  { t: "2. Types of Chemical Reactions", s: "Video · 16:25", i: Play },
  { t: "3. Practice Questions (MCQ)", s: "PDF · 842 KB", i: FileText },
  { t: "4. NCERT Solutions", s: "PDF · 2.4 MB", i: FileText },
  { t: "5. Mind Map – Chemical Reactions", s: "PDF · 1.1 MB", i: FileText },
  { t: "6. Test Your Understanding", s: "Test · 10 Questions", i: ListChecks },
];

function Chapter() {
  const [tab, setTab] = useState<Tab>("Overview");
  return (
    <MobileFrame>
      <header className="flex items-center justify-between px-5 pt-2">
        <Link to="/home" className="grid h-9 w-9 place-items-center rounded-full active:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-bold">Chemical Reactions</h1>
          <p className="text-[11px] text-muted-foreground">Class 10 · Science</p>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full active:bg-muted">
          <Bookmark className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="mx-5 mt-3 overflow-hidden rounded-2xl bg-[oklch(0.25_0.12_265)] text-white">
          <div className="relative grid aspect-video place-items-center">
            <Wisby variant="thumbs" className="h-32 opacity-90" />
            <div className="absolute left-3 top-3 text-xs font-semibold opacity-80">
              Types of Chemical Reactions
            </div>
            <button className="absolute inset-0 m-auto grid h-14 w-14 place-items-center rounded-full bg-white/90 text-primary">
              <Play className="h-6 w-6 fill-current" />
            </button>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-xs">
            <SkipBack className="h-4 w-4" />
            <Play className="h-4 w-4 fill-current" />
            <SkipForward className="h-4 w-4" />
            <Volume2 className="h-4 w-4" />
            <div className="mx-2 h-1 flex-1 rounded-full bg-white/20">
              <div className="h-full w-1/2 rounded-full bg-white" />
            </div>
            <span>08:14 / 16:25</span>
            <span className="rounded-md bg-white/15 px-1.5 py-0.5">1.0×</span>
            <Maximize2 className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 flex gap-5 border-b border-border px-5 text-sm">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 py-3 font-semibold ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="px-5 pt-4">
          {tab === "Overview" && (
            <div>
              <h2 className="text-base font-bold">Types of Chemical Reactions</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                In this video, we will learn about different types of chemical reactions with
                examples — combination, decomposition, displacement, and double displacement.
              </p>
              <h3 className="mt-5 text-sm font-bold">Up Next</h3>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="grid h-12 w-16 shrink-0 place-items-center rounded-xl bg-primary-soft text-[10px] font-bold text-primary">
                  16:42
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">Balancing Equations</p>
                  <p className="text-xs text-muted-foreground">12:45</p>
                </div>
                <Play className="h-4 w-4 text-primary" />
              </div>
              <Link
                to="/practice/$id"
                params={{ id: "chemical-reactions" }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25"
              >
                <ListChecks className="h-4 w-4" /> Start Practice Test
              </Link>
            </div>
          )}

          {tab === "Resources" && (
            <div>
              <p className="text-sm font-bold">Chapter Resources</p>
              <div className="mt-3 space-y-3">
                {resources.map((r) => {
                  const Icon = r.i;
                  return (
                    <div
                      key={r.t}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{r.t}</p>
                        <p className="text-xs text-muted-foreground">{r.s}</p>
                      </div>
                      <button className="grid h-9 w-9 place-items-center rounded-full bg-muted text-primary">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button className="mt-5 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">
                Download All Resources
              </button>
            </div>
          )}

          {tab === "Notes" && (
            <p className="text-sm text-muted-foreground">
              Your personal notes will appear here. Tap to add your first note.
            </p>
          )}
          {tab === "Q&A" && (
            <p className="text-sm text-muted-foreground">
              Ask Wisby anything about this chapter — Q&amp;A coming soon.
            </p>
          )}
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
