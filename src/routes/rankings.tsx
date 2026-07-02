import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Filter, Trophy, Sparkles, Award, TrendingUp } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { Wisby } from "@/components/wisby";

export const Route = createFileRoute("/rankings")({
  head: () => ({ meta: [{ title: "Rankings — WisDawn" }] }),
  component: Rankings,
});

type Category = "All" | "School (Science)" | "Coding Bootcamp";

const topUsers = [
  { r: 1, n: "Priya Sharma", c: "Guwahati", p: 9840, m: "🥇", track: "School (Science)" as const },
  { r: 2, n: "Arjun Mehta", c: "Dibrugarh", p: 9210, m: "🥈", track: "School (Science)" as const },
  { r: 3, n: "Kavya Reddy", c: "Jorhat", p: 8750, m: "🥉", track: "Coding Bootcamp" as const },
  { r: 4, n: "Rohan Das", c: "Silchar", p: 8100, track: "School (Science)" as const },
  { r: 5, n: "Sneha Patel", c: "Nagaon", p: 7890, track: "Coding Bootcamp" as const },
  { r: 6, n: "Aman Verma", c: "Tezpur", p: 7430, track: "School (Science)" as const },
  { r: 7, n: "Isha Bora", c: "Tinsukia", p: 7120, track: "Coding Bootcamp" as const },
];

function Rankings() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const visibleUsers = topUsers.filter(
    (user) => activeCategory === "All" || user.track === activeCategory,
  );

  return (
    <MobileFrame>
      {/* MOBILE HEADER */}
      <header className="flex md:hidden items-center justify-between px-5 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="grid h-9 w-9 place-items-center rounded-full active:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold leading-tight">ASOM State Rankings</h1>
            <p className="text-[11px] text-muted-foreground">(All Assam) ▾</p>
          </div>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full bg-muted">
          <Filter className="h-4 w-4" />
        </button>
      </header>

      {/* MOBILE CATEGORIES */}
      <div className="px-5 pt-3 md:hidden">
        <div className="flex gap-2 text-xs">
          {(["All", "School (Science)", "Coding Bootcamp"] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-3 py-1.5 font-semibold ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* RESPONSIVE LAYOUT BODY */}
      <div className="flex-1 overflow-y-auto md:overflow-visible pb-4">
        {/* DESKTOP PAGE HEADER */}
        <div className="hidden md:flex justify-between items-center mb-6 px-5 md:px-0">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500" /> Leaderboard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">ASOM State Rankings (All Assam)</p>
          </div>

          <div className="flex gap-2 text-xs">
            {(["All", "School (Science)", "Coding Bootcamp"] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 font-bold transition border ${
                  activeCategory === category
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 md:px-0">
          {/* LEADERBOARD LIST */}
          <div className="lg:col-span-2 space-y-3">
            {/* DESKTOP-ONLY HEADER FOR TABLE */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-2 text-xs font-bold text-muted-foreground tracking-wider uppercase border-b border-border/80">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-6">Name</div>
              <div className="col-span-2">City</div>
              <div className="col-span-2 text-right">Points (XP)</div>
            </div>

            <div className="space-y-2">
              {visibleUsers.map((u) => (
                <div
                  key={u.r}
                  className="grid grid-cols-12 gap-3 items-center rounded-2xl border border-border bg-card p-3 md:px-6 transition hover:shadow-xs"
                >
                  {/* Rank */}
                  <div className="col-span-2 md:col-span-2 text-center text-sm font-bold text-muted-foreground">
                    {u.m || `#${u.r}`}
                  </div>

                  {/* Name + Details */}
                  <div className="col-span-7 md:col-span-6 flex items-center gap-3">
                    <div className="grid h-9 w-9 md:h-10 md:w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                      {u.n
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{u.n}</p>
                      <p className="truncate text-[10px] md:hidden text-muted-foreground">{u.c}</p>
                    </div>
                  </div>

                  {/* City (Desktop only) */}
                  <div className="hidden md:block col-span-2 text-xs font-semibold text-muted-foreground">
                    {u.c}
                  </div>

                  {/* Points */}
                  <div className="col-span-3 md:col-span-2 text-right">
                    <p className="text-sm font-bold text-primary">{u.p.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground md:hidden">XP Points</p>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP CURRENT USER STATUS INTEGRATION */}
            <div className="hidden md:grid grid-cols-12 gap-3 items-center rounded-2xl bg-primary-soft border border-primary/10 p-4 px-6 mt-6">
              <div className="col-span-2 text-center text-sm font-bold text-primary">#12</div>
              <div className="col-span-6 flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">
                  RK
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Rahul Kumar (You)</p>
                  <p className="text-[10px] text-muted-foreground">Current user status</p>
                </div>
              </div>
              <div className="col-span-2 text-xs font-semibold text-muted-foreground">Kamrup</div>
              <div className="col-span-2 text-right font-extrabold text-primary text-sm">
                5,240 XP
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* RANKING STATS CARD */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-bold text-foreground">Your Rank Stats</h3>

              <div className="flex flex-col items-center py-4 text-center">
                <Wisby variant="cheer" className="h-28 w-28" />
                <h4 className="text-lg font-extrabold text-foreground mt-2">Rank #12 in Assam</h4>
                <p className="text-xs text-muted-foreground mt-1 px-4">
                  You're in the top 15%! Keep learning to climb to the top 10 list.
                </p>
              </div>

              <div className="space-y-3.5 border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Current Points</span>
                  <span className="text-primary font-bold">5,240 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next Rank (Rank #11)</span>
                  <span className="text-foreground">5,600 XP</span>
                </div>

                {/* Progress bar to next rank */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>XP to Level Up</span>
                    <span>360 XP</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: "70%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* LEADERBOARD TRENDS */}
            <div className="rounded-3xl border border-border bg-gradient-to-br from-indigo-50 to-violet-50 p-5 shadow-xs">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-yellow-500 fill-yellow-500" /> Weekly Streaks
              </span>
              <h4 className="text-xs font-bold text-foreground mt-2">Priya Sharma is leading!</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Priya from Guwahati holds Rank #1 this week with a perfect 9,840 XP score. You can
                do it too!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY FOOTER */}
      <div className="md:hidden border-t border-border bg-primary-soft px-5 py-3 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 text-center text-sm font-bold text-primary">#12</div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            RK
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Rahul Kumar (You)</p>
            <p className="truncate text-xs text-muted-foreground">Kamrup</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">5,240</p>
            <p className="text-[10px] text-muted-foreground">XP Points</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileFrame>
  );
}
