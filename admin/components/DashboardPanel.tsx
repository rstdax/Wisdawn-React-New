import { useEffect, useState } from "react";
import { getSubjects, getChaptersBySubject, type Subject } from "../../src/lib/admin";
import { BookOpen, Video, ArrowRight } from "lucide-react";

type Panel = "dashboard" | "subjects" | "chapters" | "resources" | "qa" | "discussions";

export function DashboardPanel({ onNavigate }: { onNavigate: (p: Panel) => void }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapterCount, setChapterCount] = useState(0);

  useEffect(() => {
    getSubjects().then(async (subs) => {
      setSubjects(subs);
      let total = 0;
      for (const s of subs) {
        const chs = await getChaptersBySubject(s.id);
        total += chs.length;
      }
      setChapterCount(total);
    });
  }, []);

  const stats = [
    { label: "Subjects", value: subjects.length, icon: BookOpen, color: "bg-primary-soft text-primary", action: "subjects" as Panel },
    { label: "Chapters", value: chapterCount, icon: Video, color: "bg-emerald-100 text-emerald-700", action: "chapters" as Panel },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Welcome back 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your content, videos, resources and more from here.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, action }) => (
          <button key={label} onClick={() => onNavigate(action)}
            className="rounded-3xl border border-border bg-card p-5 text-left transition hover:shadow-md group">
            <div className={`grid h-10 w-10 place-items-center rounded-2xl ${color} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">{label}</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition">
              Manage <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-base font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Add a Subject", desc: "Create a new subject for School or Coding", action: "subjects" as Panel },
            { label: "Add Chapter & Video", desc: "Link a YouTube video to a chapter", action: "chapters" as Panel },
            { label: "Upload Resources", desc: "Attach PDFs, links and tests to chapters", action: "resources" as Panel },
          ].map(({ label, desc, action }) => (
            <button key={label} onClick={() => onNavigate(action)}
              className="flex items-start justify-between gap-3 rounded-3xl border border-border bg-card p-5 text-left transition hover:shadow-md hover:border-primary/30">
              <div>
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
