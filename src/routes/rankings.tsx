import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Filter } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/rankings")({
  head: () => ({ meta: [{ title: "Rankings — WisDawn" }] }),
  component: Rankings,
});

const top = [
  { r: 1, n: "Priya Sharma", c: "Guwahati", p: 9840, m: "🥇" },
  { r: 2, n: "Arjun Mehta", c: "Dibrugarh", p: 9210, m: "🥈" },
  { r: 3, n: "Kavya Reddy", c: "Jorhat", p: 8750, m: "🥉" },
  { r: 4, n: "Rohan Das", c: "Silchar", p: 8100 },
  { r: 5, n: "Sneha Patel", c: "Nagaon", p: 7890 },
  { r: 6, n: "Aman Verma", c: "Tezpur", p: 7430 },
  { r: 7, n: "Isha Bora", c: "Tinsukia", p: 7120 },
];

function Rankings() {
  return (
    <MobileFrame>
      <header className="flex items-center justify-between px-5 pt-2">
        <div className="flex items-center gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-full active:bg-muted">
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

      <div className="px-5 pt-3">
        <div className="flex gap-2 text-xs">
          {["All", "School (Science)", "Coding Bootcamp"].map((t, i) => (
            <button
              key={t}
              className={`rounded-full px-3 py-1.5 font-semibold ${
                i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-2">
          {top.map((u) => (
            <div
              key={u.r}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <div className="w-8 text-center text-sm font-bold text-muted-foreground">
                {u.m || `#${u.r}`}
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                {u.n
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{u.n}</p>
                <p className="truncate text-xs text-muted-foreground">{u.c}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{u.p.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">XP Points</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-primary-soft px-5 py-3">
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
