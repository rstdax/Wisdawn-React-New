import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Bell, Menu, FlaskConical, Leaf, Sigma, TestTube2, Play, Code2 } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — WisDawn" }] }),
  component: Home,
});

function Home() {
  const [tab, setTab] = useState<"school" | "coding">("school");
  return (
    <MobileFrame>
      <header className="flex items-center justify-between px-5 pt-2">
        <button className="grid h-9 w-9 place-items-center rounded-full active:bg-muted">
          <Menu className="h-5 w-5" />
        </button>
        <div className="mt-3 relative w-72 rounded-full bg-muted p-1">
          <div
            className={`absolute inset-1 w-1/2 rounded-full shadow-lg transform transition-all duration-300 ${
              tab === "coding"
                ? "bg-linear-to-r from-violet-700 to-violet-500 translate-x-full"
                : "bg-primary translate-x-0"
            }`}
            aria-hidden
          />
          <div className="relative grid grid-cols-2">
            <button
              onClick={() => setTab("school")}
              className={`relative z-10 rounded-full py-2 text-xs font-semibold ${
                tab === "school" ? "text-white" : "text-muted-foreground"
              }`}
            >
              School Academy
            </button>
            <button
              onClick={() => setTab("coding")}
              className={`relative z-10 rounded-full py-2 text-xs font-semibold ${
                tab === "coding" ? "text-white" : "text-muted-foreground"
              }`}
            >
              Coding
            </button>
          </div>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full active:bg-muted">
          <Bell className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            RK
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Good morning 👋</p>
            <p className="text-base font-bold">Rahul Kumar</p>
          </div>
        </div>

        {tab === "school" ? (
          <HeroBanner
            title="Learn better with"
            highlight="School Academy"
            sub="for Class 9 & 10"
            cta="Explore Now"
            tone="soft"
          />
        ) : (
          <HeroBanner
            title="Build. Code. Create."
            highlight="Start your journey"
            sub="with Coding Bootcamp"
            cta="Explore Now"
            tone="dark"
          />
        )}

        {tab === "school" ? (
          <>
            <SectionHeader title="Your Subjects" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <SubjectCard
                icon={<FlaskConical className="h-5 w-5 text-primary" />}
                title="Physics"
                sub="Class 10"
              />
              <SubjectCard
                icon={<TestTube2 className="h-5 w-5 text-rose-500" />}
                title="Chemistry"
                sub="Class 10"
              />
              <SubjectCard
                icon={<Leaf className="h-5 w-5 text-emerald-500" />}
                title="Biology"
                sub="Class 10"
              />
              <SubjectCard
                icon={<Sigma className="h-5 w-5 text-violet-500" />}
                title="Mathematics"
                sub="Class 10"
              />
            </div>
          </>
        ) : (
          <>
            <SectionHeader title="My Courses" />
            <CourseRow
              color="bg-emerald-100 text-emerald-700"
              icon={<Code2 className="h-5 w-5" />}
              title="Python for Beginners"
              sub="12 Lessons"
              progress={45}
            />
            <CourseRow
              color="bg-sky-100 text-sky-700"
              icon={<Code2 className="h-5 w-5" />}
              title="Web Development"
              sub="15 Lessons"
              progress={30}
            />
          </>
        )}

        <SectionHeader title="Continue Learning" />
        <Link to="/chapter/$id" params={{ id: "chemical-reactions" }} className="mt-3 block">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary font-bold">
              W
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Chemical Reactions</p>
              <p className="truncate text-xs text-muted-foreground">
                Chapter 2 · Science · Class 10
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                <div className="h-full w-[63%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Play className="h-4 w-4 fill-current" />
            </div>
          </div>
        </Link>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-primary-soft p-4">
          <div>
            <p className="text-sm font-bold">Keep it up, Rahul!</p>
            <p className="text-xs text-muted-foreground">5,240 XP · Rank #12</p>
          </div>
          <Wisby variant="thumbs" className="-mb-2 -mr-2 h-20" />
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}

function HeroBanner({
  title,
  highlight,
  sub,
  cta,
  tone,
}: {
  title: string;
  highlight: string;
  sub: string;
  cta: string;
  tone: "soft" | "dark";
}) {
  return (
    <div
      className={`relative mt-5 overflow-hidden rounded-3xl p-5 ${
        tone === "soft" ? "bg-primary-soft" : "bg-[oklch(0.32_0.13_278)] text-white"
      }`}
    >
      <p className={`text-sm ${tone === "dark" ? "text-white/80" : "text-muted-foreground"}`}>
        {title}
      </p>
      <p className="text-lg font-extrabold">{highlight}</p>
      <p className={`text-sm ${tone === "dark" ? "text-white/80" : "text-muted-foreground"}`}>
        {sub}
      </p>
      <button
        className={`mt-3 rounded-full px-4 py-1.5 text-xs font-semibold ${
          tone === "dark" ? "bg-white text-primary" : "bg-primary text-primary-foreground"
        }`}
      >
        {cta}
      </button>
      <Wisby variant="thumbs" className="absolute -bottom-2 -right-2 h-28" />
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <h2 className="text-base font-bold">{title}</h2>
      <button className="text-xs font-semibold text-primary">View All</button>
    </div>
  );
}

function SubjectCard({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft">{icon}</div>
      <p className="mt-3 text-sm font-bold">{title}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function CourseRow({
  color,
  icon,
  title,
  sub,
  progress,
}: {
  color: string;
  icon: ReactNode;
  title: string;
  sub: string;
  progress: number;
}) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${color}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <span className="text-xs font-semibold text-primary">{progress}%</span>
    </div>
  );
}
