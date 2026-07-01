import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCheck, Clock } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/tests")({
  head: () => ({ meta: [{ title: "Tests — WisDawn" }] }),
  component: Tests,
});

const tests = [
  { id: "chemical-reactions", t: "Chemical Reactions", s: "Chapter 2 · Class 10", q: 10, m: 15 },
  {
    id: "light-refraction",
    t: "Light – Reflection & Refraction",
    s: "Chapter 10 · Class 10",
    q: 12,
    m: 20,
  },
  { id: "life-processes", t: "Life Processes", s: "Chapter 6 · Class 10", q: 10, m: 15 },
];

function Tests() {
  return (
    <MobileFrame>
      <div className="px-5 pt-3">
        <h1 className="text-2xl font-extrabold">Tests</h1>
        <p className="text-xs text-muted-foreground">Practice and track your progress</p>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground shadow-lg shadow-primary/25">
          <p className="text-xs opacity-80">Your average score</p>
          <p className="mt-1 text-3xl font-extrabold">82%</p>
          <p className="mt-1 text-xs opacity-80">Across 14 attempted tests</p>
        </div>
        <h2 className="mt-6 text-sm font-bold">Available Tests</h2>
        <div className="mt-3 space-y-3">
          {tests.map((t) => (
            <Link
              key={t.id}
              to="/practice/$id"
              params={{ id: t.id }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.t}</p>
                <p className="truncate text-xs text-muted-foreground">{t.s}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> {t.q} questions · {t.m} min
                </p>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                Start
              </span>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
