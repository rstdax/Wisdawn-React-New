import { useEffect, useState } from "react";
import {
  getSubjects, getChaptersBySubject, getDiscussions, deleteDiscussion,
  type Subject, type Chapter, type Discussion,
} from "../../src/lib/admin";
import { Trash2 } from "lucide-react";
import { LoadingSkeleton, EmptyState } from "./SubjectsPanel";

export function DiscussionsPanel() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSubjects().then((subs) => { setSubjects(subs); if (subs.length) setSelectedSubject(subs[0].id); });
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
    getChaptersBySubject(selectedSubject).then((chs) => {
      setChapters(chs);
      if (chs.length) setSelectedChapter(chs[0].id); else setSelectedChapter("");
    });
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedChapter) { setDiscussions([]); return; }
    setLoading(true);
    getDiscussions(selectedChapter).then(setDiscussions).finally(() => setLoading(false));
  }, [selectedChapter]);

  const reload = () => {
    if (!selectedChapter) return;
    setLoading(true);
    getDiscussions(selectedChapter).then(setDiscussions).finally(() => setLoading(false));
  };

  const handleDelete = async (d: Discussion) => {
    if (!confirm("Delete this discussion message?")) return;
    await deleteDiscussion(selectedChapter, d.id);
    reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-foreground">Discussions</h1>
        <p className="text-xs text-muted-foreground mt-0.5">View and moderate student discussions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Subject</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none">
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.title}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Chapter</label>
          <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)}
            className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none">
            {chapters.length === 0 && <option value="">No chapters</option>}
            {chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>

      {loading ? <LoadingSkeleton rows={4} /> : !selectedChapter ? (
        <EmptyState message="Select a chapter to view discussions." />
      ) : discussions.length === 0 ? <EmptyState message="No discussions in this chapter yet." /> : (
        <div className="space-y-3">
          {discussions.map((d) => (
            <div key={d.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white text-xs font-bold">
                  {d.authorName?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">{d.authorName}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{d.message}</p>
                  {d.createdAt && <p className="text-[10px] text-muted-foreground mt-1">{new Date(d.createdAt).toLocaleString()}</p>}
                </div>
              </div>
              <button onClick={() => handleDelete(d)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-red-50 text-destructive transition">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
