import { createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Bell,
  FlaskConical,
  Leaf,
  Sigma,
  TestTube2,
  Play,
  Code2,
  Sparkles,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  ChevronRight,
  Calendar,
  Award,
  TrendingUp,
  Flame,
  Clock,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — WisDawn" }] }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search as Record<string, string | undefined>;

  // Tab/Track is determined by URL search parameter ?track=coding or ?track=school (default)
  const tab = search?.track === "coding" ? "coding" : "school";
  const setTab = (newTab: "school" | "coding") => {
    navigate({
      to: "/home",
      search: { track: newTab },
    });
  };

  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <MobileFrame>
      {/* MOBILE-ONLY HEADER */}
      <header className="flex md:hidden items-center justify-between gap-3 px-5 pt-2">
        <div className="relative flex-1 rounded-full bg-muted p-1">
          <div
            className={`absolute inset-1 w-1/2 rounded-full shadow-lg transition-all duration-300 ${
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
        <button
          onClick={() => setShowAlerts((value) => !value)}
          className="grid h-9 w-9 place-items-center rounded-full active:bg-muted"
          aria-label="toggle alerts"
        >
          <Bell className="h-5 w-5" />
        </button>
      </header>

      {showAlerts && (
        <div className="mx-5 mt-3 rounded-2xl border border-border bg-card p-3 text-sm shadow-sm md:hidden">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Sparkles className="h-4 w-4" /> New updates ready
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            3 fresh lessons and 1 practice test are waiting for you.
          </p>
        </div>
      )}

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="flex-1 overflow-y-auto md:overflow-visible px-0 md:px-0 pb-6 pt-4">
        {/* DESKTOP PAGE TITLE */}
        <div className="hidden md:flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {tab === "school" ? "School Academy" : "Coding Bootcamp"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 md:px-0">
          {/* LEFT & CENTER COLUMN (Main Page Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* MOBILE USER BADGE */}
            <div className="flex md:hidden items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                RK
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Good morning 👋</p>
                <p className="text-base font-bold">Rahul Kumar</p>
              </div>
            </div>

            {/* HERO BANNER */}
            {tab === "school" ? (
              <div className="relative overflow-hidden rounded-3xl bg-primary-soft p-6 md:p-8 flex flex-col justify-center min-h-[180px] md:min-h-[220px]">
                <p className="text-xs md:text-sm text-primary font-bold tracking-wider uppercase">
                  Good morning, 👋
                </p>
                <h2 className="text-xl md:text-3xl font-extrabold text-foreground mt-1">
                  Rahul Kumar
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-md">
                  Learn better with School Academy for Class 10
                </p>
                <div className="mt-4 md:mt-6">
                  <Link
                    to="/learn"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs md:text-sm font-semibold text-primary-foreground transition shadow-md shadow-primary/20 hover:scale-105"
                  >
                    Explore Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <Wisby
                  variant="thumbs"
                  className="absolute -bottom-3 -right-3 h-28 md:h-44 w-auto"
                />
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl bg-[oklch(0.32_0.13_278)] text-white p-6 md:p-8 flex flex-col justify-center min-h-[180px] md:min-h-[220px]">
                <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">
                  Build. Code. Create.
                </h2>
                <p className="text-xs md:text-sm text-white/80 mt-2 max-w-sm">
                  Start your journey with Wisdawn Coding Bootcamp
                </p>

                {/* Desktop features list */}
                <div className="hidden md:flex gap-6 mt-4 text-xs text-white/70">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="h-4 w-4 text-primary" /> Learning
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-yellow-400" /> Real World Projects
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-400" /> Certification
                  </span>
                </div>

                <div className="mt-4 md:mt-6">
                  <Link
                    to="/learn"
                    className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-5 py-2 text-xs md:text-sm font-semibold transition hover:scale-105"
                  >
                    Continue Learning
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <Wisby
                  variant="cheer"
                  className="absolute -bottom-3 -right-3 h-28 md:h-44 w-auto"
                />
              </div>
            )}

            {/* MOBILE QUICK ACTIONS */}
            <div className="block md:hidden">
              <SectionHeader title="Quick Actions" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <QuickActionCard
                  icon={<BookOpen className="h-4 w-4" />}
                  title="Learn"
                  desc="Continue your lessons"
                  to="/learn"
                />
                <QuickActionCard
                  icon={<ClipboardCheck className="h-4 w-4" />}
                  title="Tests"
                  desc="Try fresh practice sets"
                  to="/tests"
                />
              </div>
            </div>

            {/* TRACK SPECIFIC CARDS: SUBJECTS OR COURSES */}
            {tab === "school" ? (
              <>
                <SectionHeader title="Your Subjects" />
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <SubjectCard
                    icon={<FlaskConical className="h-5 w-5 text-primary" />}
                    title="Physics"
                    sub="Class 10"
                    progress="65%"
                    to="/learn"
                  />
                  <SubjectCard
                    icon={<TestTube2 className="h-5 w-5 text-rose-500" />}
                    title="Chemistry"
                    sub="Class 10"
                    progress="40%"
                    to="/learn"
                  />
                  <SubjectCard
                    icon={<Leaf className="h-5 w-5 text-emerald-500" />}
                    title="Biology"
                    sub="Class 10"
                    progress="70%"
                    to="/learn"
                  />
                  <SubjectCard
                    icon={<Sigma className="h-5 w-5 text-violet-500" />}
                    title="Mathematics"
                    sub="Class 10"
                    progress="55%"
                    to="/learn"
                  />
                </div>
              </>
            ) : (
              <>
                <SectionHeader title="My Courses" />
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CourseCard
                    color="bg-emerald-100 text-emerald-700"
                    icon={<Code2 className="h-5 w-5" />}
                    title="Python for Beginners"
                    sub="12 Lessons"
                    progress={45}
                  />
                  <CourseCard
                    color="bg-sky-100 text-sky-700"
                    icon={<Code2 className="h-5 w-5" />}
                    title="Web Development"
                    sub="15 Lessons"
                    progress={30}
                  />
                </div>
              </>
            )}

            {/* CONTINUE LEARNING */}
            <SectionHeader title="Continue Learning" />
            <div className="mt-3 space-y-3">
              <Link to="/chapter/$id" params={{ id: "chemical-reactions" }} className="block">
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-sm">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary font-bold">
                    W
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">Chemical Reactions</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Chapter 2 · Science · Class 10
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-muted">
                        <div className="h-full w-[65%] rounded-full bg-primary" />
                      </div>
                      <span className="text-xs font-bold text-primary">65% Complete</span>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-1.5 ml-4">
                    <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/95">
                      Continue
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Last watched yesterday
                    </span>
                  </div>
                  <div className="grid md:hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </Link>

              {/* Second lesson (Coding specific / general) */}
              <Link to="/chapter/$id" params={{ id: "python-variables" }} className="block">
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-sm">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary font-bold">
                    P
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">Python Variables & Data Types</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Lesson 3 · Python for Beginners
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-muted">
                        <div className="h-full w-[45%] rounded-full bg-primary" />
                      </div>
                      <span className="text-xs font-bold text-primary">45% Complete</span>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-1.5 ml-4">
                    <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/95">
                      Continue
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Last watched 2 days ago
                    </span>
                  </div>
                  <div className="grid md:hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </Link>
            </div>

            {/* RECOMMENDED FOR YOU (only visible on school layout) */}
            {tab === "school" && (
              <>
                <SectionHeader title="Recommended For You" />
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <RecommendedCard
                    title="Life Processes in Living Organisms"
                    sub="Chapter 6 · Biology · Class 10"
                    progress={15}
                  />
                  <RecommendedCard
                    title="Light – Reflection & Refraction"
                    sub="Chapter 10 · Physics · Class 10"
                    progress={0}
                  />
                  <RecommendedCard
                    title="Linear Equations in Two Variables"
                    sub="Chapter 3 · Mathematics · Class 10"
                    progress={35}
                  />
                </div>
              </>
            )}

            {/* MOBILE ONLY FOOTER XP BANNER */}
            <div className="mt-6 flex md:hidden items-center justify-between rounded-2xl bg-primary-soft p-4">
              <div>
                <p className="text-sm font-bold">Keep it up, Rahul!</p>
                <p className="text-xs text-muted-foreground">5,240 XP · Rank #12</p>
              </div>
              <Wisby variant="thumbs" className="-mb-2 -mr-2 h-20" />
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop-Only Sidebar Widgets) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* PROGRESS CARD */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Your Progress</h3>
                <Link to="/profile" className="text-xs font-semibold text-primary hover:underline">
                  {tab === "school" ? "View Profile" : "View Details"}
                </Link>
              </div>

              {tab === "coding" ? (
                <div className="flex flex-col items-center py-4">
                  {/* Circle SVG Progress Chart */}
                  <div className="relative h-32 w-32 flex items-center justify-center">
                    <svg className="absolute transform -rotate-90 w-full h-full">
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-muted"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-primary transition-all duration-500"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={2 * Math.PI * 50 * (1 - 0.45)}
                      />
                    </svg>
                    <div className="text-center">
                      <span className="text-2xl font-extrabold text-foreground">45%</span>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        Progress
                      </p>
                    </div>
                  </div>

                  {/* Coding Stats Grid */}
                  <div className="w-full mt-6 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-muted/40 rounded-xl">
                      <p className="font-extrabold text-foreground">2</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Enrolled</p>
                    </div>
                    <div className="p-2 bg-muted/40 rounded-xl">
                      <p className="font-extrabold text-foreground">18 / 40</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Lessons</p>
                    </div>
                    <div className="p-2 bg-muted/40 rounded-xl">
                      <p className="font-extrabold text-primary">5,240</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">XP Earned</p>
                    </div>
                  </div>

                  {/* Streak banner */}
                  <div className="w-full mt-4 flex items-center justify-between p-3 rounded-2xl bg-orange-50 border border-orange-100 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-orange-700">
                      <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
                      <span>7 Days Streak</span>
                    </div>
                    <span className="text-orange-600 font-bold">Keep it up!</span>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  {/* Spline Wave Line Chart placeholder using SVG */}
                  <div className="h-28 w-full flex flex-col justify-end">
                    <svg className="w-full h-20" viewBox="0 0 200 80">
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,60 Q 25,45 50,55 T 100,20 T 150,30 T 200,10"
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="3"
                      />
                      <path
                        d="M 0,60 Q 25,45 50,55 T 100,20 T 150,30 T 200,10 L 200,80 L 0,80 Z"
                        fill="url(#gradient)"
                      />
                      <circle cx="100" cy="20" r="4" fill="var(--color-primary)" />
                      <circle cx="200" cy="10" r="4" fill="var(--color-primary)" />
                    </svg>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-2 px-1 font-semibold">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  {/* School Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                    <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center">
                      <span className="text-muted-foreground">Courses</span>
                      <span className="font-bold text-foreground">12</span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center">
                      <span className="text-muted-foreground">Lessons</span>
                      <span className="font-bold text-foreground">28</span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center">
                      <span className="text-muted-foreground">Points</span>
                      <span className="font-bold text-primary">5,240</span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center">
                      <span className="text-muted-foreground">Rank</span>
                      <span className="font-bold text-foreground">#12</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* UPCOMING SCHEDULE */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">
                  {tab === "school" ? "Upcoming Schedule" : "Upcoming Live Sessions"}
                </h3>
                <Link to="/tests" className="text-xs font-semibold text-primary hover:underline">
                  View Calendar
                </Link>
              </div>

              <div className="space-y-3">
                {tab === "school" ? (
                  <>
                    <ScheduleRow
                      icon={<FlaskConical className="h-4 w-4 text-primary" />}
                      title="Physics Live Class"
                      time="Today, 5:00 PM"
                      action={
                        <button className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground transition hover:scale-105">
                          Join Now
                        </button>
                      }
                    />
                    <ScheduleRow
                      icon={<Calendar className="h-4 w-4 text-emerald-600" />}
                      title="Chemistry Assignment"
                      time="Due: Tomorrow, 11:59 PM"
                    />
                  </>
                ) : (
                  <>
                    <ScheduleRow
                      icon={<Code2 className="h-4 w-4 text-primary" />}
                      title="Python Basics Live Class"
                      time="Today, 5:00 PM - 6:00 PM"
                      action={
                        <button className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground transition hover:scale-105">
                          Join Now
                        </button>
                      }
                    />
                    <ScheduleRow
                      icon={<Clock className="h-4 w-4 text-violet-600" />}
                      title="Web Development Q&A"
                      time="Tomorrow, 7:00 PM - 8:00 PM"
                      action={
                        <button className="rounded-full border border-border px-3 py-1.5 text-[10px] font-bold text-muted-foreground transition hover:bg-muted">
                          Remind Me
                        </button>
                      }
                    />
                  </>
                )}
              </div>
            </div>

            {/* RECENT ACHIEVEMENTS */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Recent Achievements</h3>
                <Link to="/profile" className="text-xs font-semibold text-primary hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                <AchievementRow
                  color="bg-amber-100 text-amber-700"
                  icon={<Award className="h-4 w-4" />}
                  title="Quiz Master"
                  desc="Score 90% in Quiz"
                  points="+50 pts"
                />
                <AchievementRow
                  color="bg-emerald-100 text-emerald-700"
                  icon={<Award className="h-4 w-4" />}
                  title={tab === "school" ? "Science Explorer" : "Lesson Completer"}
                  desc={tab === "school" ? "Completed 5 Lessons" : "Completed 5 Lessons"}
                  points="+30 pts"
                />
                <AchievementRow
                  color="bg-violet-100 text-violet-700"
                  icon={<Award className="h-4 w-4" />}
                  title="Consistent Learner"
                  desc="7 Days Streak"
                  points="+70 pts"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <h2 className="text-base font-bold">{title}</h2>
      <span className="text-xs font-semibold text-primary">View All</span>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  desc,
  to,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-start justify-between rounded-2xl border border-border bg-card p-3"
    >
      <div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
          {icon}
        </div>
        <p className="mt-3 text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function SubjectCard({
  icon,
  title,
  sub,
  progress,
  to,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  progress?: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between transition hover:shadow-sm"
    >
      <div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft">{icon}</div>
        <p className="mt-3 text-sm font-bold">{title}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      {progress && (
        <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-bold text-primary">
          <span>Progress</span>
          <span>{progress}</span>
        </div>
      )}
    </Link>
  );
}

function CourseCard({
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
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-sm">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${color}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-primary">{progress}%</span>
        </div>
      </div>
      <span className="hidden md:grid h-8 w-8 place-items-center rounded-full bg-muted/60 text-muted-foreground transition hover:bg-muted">
        <ChevronRight className="h-4 w-4" />
      </span>
    </div>
  );
}

function RecommendedCard({
  title,
  sub,
  progress,
}: {
  title: string;
  sub: string;
  progress: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between transition hover:shadow-xs">
      <div>
        <p className="text-sm font-semibold leading-tight text-foreground line-clamp-2">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
      </div>
      <div className="mt-4 pt-2 flex items-center gap-2">
        <div className="h-1 flex-1 rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[9px] font-bold text-primary">{progress}%</span>
      </div>
    </div>
  );
}

function ScheduleRow({
  icon,
  title,
  time,
  action,
}: {
  icon: ReactNode;
  title: string;
  time: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/20 border border-border/40">
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{title}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{time}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function AchievementRow({
  color,
  icon,
  title,
  desc,
  points,
}: {
  color: string;
  icon: ReactNode;
  title: string;
  desc: string;
  points: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-muted/10 border border-border/20">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${color} shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{title}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <span className="text-[10px] font-extrabold text-primary shrink-0 bg-primary-soft px-2 py-0.5 rounded-md">
        {points}
      </span>
    </div>
  );
}
