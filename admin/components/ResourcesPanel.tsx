import { useEffect, useState } from "react";
import {
  getSubjects, getChaptersBySubject, getResources, saveResource, deleteResource,
  type Subject, type Chapter, type Resource,
} from "../../src/lib/admin";
import { Plus, Pencil, Trash2, Save, X, FileText, Play, ListChecks, Link as LinkIcon } from "lucide-react";
import { Field, LoadingSkeleton, EmptyState } from "./SubjectsPanel";

const typeIcons: Record<Resource["type"], React.ElementType> = {
  pdf: FileText, video: Play, test: ListChecks, link: LinkIcon,
};

export function ResourcesPanel() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<Resource> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    if (!selectedChapter) { setResources([]); return; }
    setLoading(true);
    getResources(selectedChapter).then(setResources).finally(() => setLoading(false));
  }, [selectedChapter]);

  const reload = () => {
    if (!selectedChapter) return;
    setLoading(true);
    getResources(selectedChapter).then(setResources).finally(() => setLoading(false));
  };

  const openNew = () => { setEditing({ chapterId: selectedChapter, title: "", type: "pdf", size: "", url: "", order: 0 }); setError(""); };
  const openEdit = (r: Resource) => { setEditing({ ...r }); setError(""); };
  const closeEdit = () => { setEditing(null); setError(""); };

  const handleSave = async () => {
    if (!editing?.title?.trim()) { setError("Title is required."); return; }
    if (!editing?.chapterId) { setError("Chapter is required."); return; }
    setSaving(true);
    try { await saveResource(editing as Resource); reload(); closeEdit(); }
    catch { setError("Failed to save. Try again."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (r: Resource) => {
    if (!confirm("Delete this resource?")) return;
    await deleteResource(r.chapterId, r.id);
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Resources</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Attach PDFs, videos, tests and links to chapters.</p>
        </div>
        <button onClick={openNew} disabled={!selectedChapter}
          className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:scale-105 transition disabled:opacity-40">
          <Plus className="h-4 w-4" /> Add Resource
        </button>
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

      {editing && (
        <div className="rounded-3xl border border-primary/30 bg-card p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">{editing.id ? "Edit Resource" : "New Resource"}</h2>
            <button onClick={closeEdit} className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title *" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="e.g. Chapter Mind Map" />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Type</label>
              <select value={editing.type ?? "pdf"} onChange={(e) => setEditing({ ...editing, type: e.target.value as Resource["type"] })}
                className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none">
                <option value="pdf">PDF</option><option value="video">Video</option>
                <option value="test">Test</option><option value="link">Link</option>
              </select>
            </div>
            <Field label="Size / Info" value={editing.size ?? ""} onChange={(v) => setEditing({ ...editing, size: v })} placeholder="e.g. 1.2 MB" />
            <Field label="URL / Link" value={editing.url ?? ""} onChange={(v) => setEditing({ ...editing, url: v })} placeholder="https://…" />
            <Field label="Order" value={String(editing.order ?? 0)} onChange={(v) => setEditing({ ...editing, order: Number(v) })} type="number" />
          </div>
          {error && <p className="text-xs text-destructive font-semibold">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button onClick={closeEdit} className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Resource"}
            </button>
          </div>
        </div>
      )}

      {loading ? <LoadingSkeleton rows={3} /> : !selectedChapter ? (
        <EmptyState message="Select a subject and chapter to manage its resources." />
      ) : resources.length === 0 ? <EmptyState message="No resources for this chapter yet." /> : (
        <div className="space-y-3">
          {resources.map((r) => {
            const Icon = typeIcons[r.type];
            return (
              <div key={r.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition hover:shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="h-4 w-4" /></div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{r.title}</p>
                    <p className="text-[11px] text-muted-foreground">{r.type.toUpperCase()} · {r.size ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(r)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary-soft text-primary transition"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(r)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-red-50 text-destructive transition"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
