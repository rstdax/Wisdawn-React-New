import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Leaf, Lightbulb, Code2, Globe } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn — WisDawn" }] }),
  component: Learn,
});

const filters = {
  school: ["All", "Physics", "Chemistry", "Biology", "Maths"],
  coding: ["All", "Python", "Web Dev", "DSA", "React"],
};

type ContentItem = { id: string; title: string; sub: string; progress?: number };
type RecommendedItem = { id: string; title: string; sub: string };
type Section = { continueList: ContentItem[]; recommended: RecommendedItem[] };

const contentData: { [k in "school" | "coding"]: Record<string, Section> } = {
  school: {
    All: {
      continueList: [
        {
          id: "balancing-equations",
          title: "Balancing Equations",
          sub: "Lesson · Physics",
        },
        {
          id: "chemical-reactions",
          title: "Chemical Reactions",
          sub: "Chapter 2 · Class 10 · Science",
          progress: 55,
        },
        {
          id: "life-processes",
          title: "Life Processes in Living Organisms",
          sub: "Chapter 6 · Biology · Class 10",
        },
        {
          id: "algebra-basics",
          title: "Algebra Basics",
          sub: "Chapter · Mathematics",
        },
      ],
      recommended: [
        {
          id: "light-refraction",
          title: "Light – Reflection & Refraction",
          sub: "Chapter 10 · Physics · Class 10",
        },
        {
          id: "types-of-reactions",
          title: "Types of Chemical Reactions",
          sub: "Video · 16:25",
        },
        {
          id: "cell-structure",
          title: "Cell Structure",
          sub: "Chapter 3 · Biology · Class 10",
        },
        {
          id: "geometry",
          title: "Geometry Essentials",
          sub: "Chapter · Mathematics",
        },
      ],
    },
    Physics: {
      continueList: [
        {
          id: "balancing-equations",
          title: "Balancing Equations",
          sub: "Lesson · Physics",
        },
      ],
      recommended: [
        {
          id: "light-refraction",
          title: "Light – Reflection & Refraction",
          sub: "Chapter 10 · Physics · Class 10",
        },
      ],
    },
    Chemistry: {
      continueList: [
        {
          id: "chemical-reactions",
          title: "Chemical Reactions",
          sub: "Chapter 2 · Class 10 · Science",
        },
      ],
      recommended: [
        {
          id: "types-of-reactions",
          title: "Types of Chemical Reactions",
          sub: "Video · 16:25",
        },
      ],
    },
    Biology: {
      continueList: [
        {
          id: "life-processes",
          title: "Life Processes in Living Organisms",
          sub: "Chapter 6 · Biology · Class 10",
        },
      ],
      recommended: [
        {
          id: "cell-structure",
          title: "Cell Structure",
          sub: "Chapter 3 · Biology · Class 10",
        },
      ],
    },
    Maths: {
      continueList: [
        {
          id: "algebra-basics",
          title: "Algebra Basics",
          sub: "Chapter · Mathematics",
        },
      ],
      recommended: [
        {
          id: "geometry",
          title: "Geometry Essentials",
          sub: "Chapter · Mathematics",
        },
      ],
    },
  },
  coding: {
    All: {
      continueList: [
        {
          id: "python-variables",
          title: "Python Variables & Data Types",
          sub: "Lesson 3 · Python for Beginners",
          progress: 55,
        },
        {
          id: "html-basics",
          title: "HTML Basics",
          sub: "Lesson 1 · Web Development",
        },
        {
          id: "arrays",
          title: "Arrays & Pointers",
          sub: "Lesson · DSA",
        },
        {
          id: "react-intro",
          title: "React Basics",
          sub: "Lesson · React",
        },
      ],
      recommended: [
        {
          id: "js-essentials",
          title: "JavaScript Essentials",
          sub: "Lesson 2 · Web Development",
        },
        {
          id: "python-control",
          title: "Control Flow in Python",
          sub: "Lesson · Python",
        },
        {
          id: "sorting",
          title: "Sorting Algorithms",
          sub: "Lesson · DSA",
        },
        {
          id: "state-hooks",
          title: "State & Hooks",
          sub: "Lesson · React",
        },
      ],
    },
    Python: {
      continueList: [
        {
          id: "python-variables",
          title: "Python Variables & Data Types",
          sub: "Lesson 3 · Python for Beginners",
        },
      ],
      recommended: [
        {
          id: "python-control",
          title: "Control Flow in Python",
          sub: "Lesson · Python",
        },
      ],
    },
    "Web Dev": {
      continueList: [
        {
          id: "html-basics",
          title: "HTML Basics",
          sub: "Lesson 1 · Web Development",
        },
      ],
      recommended: [
        {
          id: "css-basics",
          title: "CSS Fundamentals",
          sub: "Lesson · Web Development",
        },
      ],
    },
    DSA: {
      continueList: [
        {
          id: "arrays",
          title: "Arrays & Pointers",
          sub: "Lesson · DSA",
        },
      ],
      recommended: [
        {
          id: "sorting",
          title: "Sorting Algorithms",
          sub: "Lesson · DSA",
        },
      ],
    },
    React: {
      continueList: [
        {
          id: "react-intro",
          title: "React Basics",
          sub: "Lesson · React",
        },
      ],
      recommended: [
        {
          id: "state-hooks",
          title: "State & Hooks",
          sub: "Lesson · React",
        },
      ],
    },
  },
};

function Learn() {
  const [track, setTrack] = useState<"school" | "coding">("school");
  const [active, setActive] = useState("All");

  return (
    <MobileFrame>
      <div className="px-5 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Learn</h1>
            <p className="text-xs text-muted-foreground">Explore and grow every day</p>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-muted">
            <Search className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 relative rounded-full bg-muted p-1">
          <div
            className={`absolute inset-1 w-1/2 rounded-full shadow-lg transform transition-all duration-300 ${
              track === "coding"
                ? "bg-linear-to-r from-violet-700 to-violet-500 translate-x-full"
                : "bg-primary translate-x-0"
            }`}
            aria-hidden
          />
          <div className="relative grid grid-cols-2">
            <button
              onClick={() => {
                setTrack("school");
                setActive("All");
              }}
              className={`relative z-10 rounded-full py-2 text-xs font-semibold ${
                track === "school" ? "text-white" : "text-muted-foreground"
              }`}
            >
              School Academy
            </button>
            <button
              onClick={() => {
                setTrack("coding");
                setActive("All");
              }}
              className={`relative z-10 rounded-full py-2 text-xs font-semibold ${
                track === "coding" ? "text-white" : "text-muted-foreground"
              }`}
            >
              Coding Bootcamp
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {filters[track].map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                active === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <h2 className="text-sm font-bold">Continue Learning</h2>
        <div className="mt-3 space-y-3">
          {contentData[track][active].continueList.map((item) => (
            <Link
              key={item.id}
              to="/chapter/$id"
              params={{ id: item.id }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary font-bold">
                W
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.sub}</p>
                {typeof item.progress === "number" && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {typeof item.progress === "number" && (
                <span className="text-xs font-semibold text-primary">{item.progress}%</span>
              )}
            </Link>
          ))}
        </div>

        <h2 className="mt-6 text-sm font-bold">Recommended for You</h2>
        <div className="mt-3 space-y-3">
          {contentData[track][active].recommended.map((r) => (
            <Link
              key={r.id}
              to="/chapter/$id"
              params={{ id: r.id }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft">
                <span className="text-sm font-bold">W</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{r.title}</p>
                <p className="truncate text-xs text-muted-foreground">{r.sub}</p>
              </div>
              <span className="text-muted-foreground">›</span>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
