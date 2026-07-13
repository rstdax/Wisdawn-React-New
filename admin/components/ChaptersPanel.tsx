import { useEffect, useState } from "react";
import {
  getSubjects, getChaptersBySubject, saveChapter, deleteChapter,
  type Subject, type Chapter,
} from "../../src/lib/admin";
import { Plus, Pencil, Trash2, Save, X, ExternalLink } from "lucide-react";
import { Field, LoadingSkeleton, EmptyState } from "./SubjectsPanel";

function parseYouTubeId(input: string): string {
  if (!input) return "";
  if (/^[\w-]{11}$/.test(input.trim())) return input.trim();
  try {
    const url = new URL(input.trim());
    return url.searchParams.get("v") ?? url.pathname.split("/").pop() ?? input.trim();
  } catch { return input.trim(); }
}

const empty: Omit<Chapter, "id"> = {
  subjectId: "", title: "", description: "",
  videoId: "", startTime: 0, duration: "", difficulty: "Beginner",
  whatYouLearn: [], resourcesNote: "", chapterId: 1, videoOrder: 1, order: 0, published: false,
};

export function ChaptersPanel() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<Chapter> | null>(null);
  const [videoInput, setVideoInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSubjects().then((subs) => {
      setSubjects(subs);
      if (subs.length) setSelectedSubject(subs[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
    setLoading(true);
    getChaptersBySubject(selectedSubject).then(setChapters).finally(() => setLoading(false));
  }, [selectedSubject]);

  const reload = () => {
    if (!selectedSubject) return;
    setLoading(true);
    getChaptersBySubject(selectedSubject).then(setChapters).finally(() => setLoading(false));
  };

  const openNew = () => {
    setEditing({ ...empty, subjectId: selectedSubject });
    setVideoInput(""); setError("");
  };
  const openEdit = (c: Chapter) => {
    setEditing({ ...c }); setVideoInput(c.videoId ?? ""); setError("");
  };
  const closeEdit = () => { setEditing(null); setError(""); };

  const handleSave = async () => {
    if (!editing?.title?.trim()) { setError("Chapter title is required."); return; }
    if (!editing?.subjectId) { setError("Please select a subject."); return; }
    setSaving(true);
    try {
      await saveChapter({ ...editing, videoId: parseYouTubeId(videoInput) } as Chapter);
      reload(); closeEdit();
    } catch { setError("Failed to save. Try again."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this chapter?")) return;
    await deleteChapter(id); reload();
  };

  const parsedId = parseYouTubeId(videoInput);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Chapters &amp; Videos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Each chapter contains one video lesson.</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:scale-105 transition">
          <Plus className="h-4 w-4" /> Add Chapter
        </button>
      </div>

      {/* Subject pills */}
      {subjects.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {subjects.map((s) => (
            <button key={s.id} onClick={() => { setSelectedSubject(s.id); closeEdit(); }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition border ${selectedSubject === s.id ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
              {s.icon} {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Edit/Create form */}
      {editing && (
        <div className="rounded-3xl border border-primary/30 bg-card p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">{editing.id ? "Edit Chapter" : "New Chapter"}</h2>
            <button onClick={closeEdit} className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Chapter Title *" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="e.g. What is Python?" />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Subject *</label>
              <select value={editing.subjectId ?? ""} onChange={(e) => setEditing({ ...editing, subjectId: e.target.value })}
                className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Select subject…</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.title} — {s.class}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Difficulty</label>
              <select value={editing.difficulty ?? "Beginner"} onChange={(e) => setEditing({ ...editing, difficulty: e.target.value as Chapter["difficulty"] })}
                className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
            <Field label="Duration (e.g. 12:34)" value={editing.duration ?? ""} onChange={(v) => setEditing({ ...editing, duration: v })} placeholder="12:34" />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Chapter ID <span className="text-muted-foreground font-normal normal-case">(1, 2, 3…)</span></label>
              <input type="number" min={1}
                value={editing.chapterId ?? 1}
                onChange={(e) => setEditing({ ...editing, chapterId: Number(e.target.value) })}
                className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
              <p className="text-[10px] text-muted-foreground">Videos with same Chapter ID belong to the same chapter group.</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Video Order <span className="text-muted-foreground font-normal normal-case">(1, 2, 3… within chapter)</span></label>
              <input type="number" min={1}
                value={editing.videoOrder ?? 1}
                onChange={(e) => setEditing({ ...editing, videoOrder: Number(e.target.value) })}
                className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
              <p className="text-[10px] text-muted-foreground">Restarts from 1 for each Chapter ID.</p>
            </div>
          </div>

          {/* YouTube */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">YouTube Video URL or ID</label>
            <div className="flex gap-2">
              <input type="text" value={videoInput} onChange={(e) => setVideoInput(e.target.value)}
                placeholder="https://youtube.com/watch?v=xxxx  or  video-id"
                className="flex-1 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
              {parsedId && (
                <a href={`https://youtube.com/watch?v=${parsedId}`} target="_blank" rel="noreferrer"
                  className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {parsedId && <p className="text-[10px] text-emerald-600 font-bold">✓ Video ID: {parsedId}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
            <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="Brief overview for students…" rows={3}
              className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>

          {/* Resources note */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Notes</label>
            <textarea value={editing.resourcesNote ?? ""} onChange={(e) => setEditing({ ...editing, resourcesNote: e.target.value })}
              placeholder="Links, formulas, references…" rows={2}
              className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ch-pub" checked={editing.published ?? false}
              onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="h-4 w-4 accent-primary" />
            <label htmlFor="ch-pub" className="text-sm font-semibold text-foreground">Published (visible to students)</label>
          </div>

          {error && <p className="text-xs text-destructive font-semibold">{error}</p>}

          <div className="flex gap-3 justify-end">
            <button onClick={closeEdit} className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Chapter"}
            </button>
          </div>
        </div>
      )}

      {/* Chapter list */}
      {loading ? <LoadingSkeleton rows={4} /> : chapters.length === 0 ? (
        <EmptyState message="No chapters yet. Add your first chapter above." />
      ) : (
        <div className="space-y-3">
          {chapters.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition hover:shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary text-xs font-bold">{c.order ?? 0}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-foreground truncate">{c.title}</p>
                    {c.published
                      ? <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[9px] font-bold uppercase">Live</span>
                      : <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[9px] font-bold uppercase">Draft</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {c.videoId ? `▶ ${c.videoId}` : "No video"} · {c.duration ?? "—"}
                    {c.chapterId !== undefined && ` · Ch.${c.chapterId} V${c.videoOrder ?? 1}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.videoId && (
                  <a href={`https://youtube.com/watch?v=${c.videoId}`} target="_blank" rel="noreferrer"
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-red-50 text-red-600 transition">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button onClick={() => openEdit(c)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary-soft text-primary transition">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-red-50 text-destructive transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
