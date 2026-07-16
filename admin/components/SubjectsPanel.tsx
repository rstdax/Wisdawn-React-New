import { useEffect, useState, useRef } from "react";
import { getSubjects, saveSubject, deleteSubject, type Subject } from "../../src/lib/admin";
import { Plus, Pencil, Trash2, Save, X, Upload, Loader2 } from "lucide-react";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../src/lib/firebase";

const emptySubject: Omit<Subject, "id"> = {
  title: "",
  class: "Class 10",
  track: "school",
  icon: "",
  color: "",
  order: 0,
};

export function SubjectsPanel() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [track, setTrack] = useState<"school" | "coding">("school");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Subject> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2MB."); return; }
    setUploading(true);
    setError("");
    try {
      const path = `subjects/icons/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setEditing((prev) => ({ ...prev, icon: url }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("storage/unauthorized") || msg.includes("403")) {
        setError("Permission denied. Update Firebase Storage rules to allow writes.");
      } else if (msg.includes("storage/unknown") || msg.includes("CORS")) {
        setError("Upload blocked. Check Firebase Storage is enabled and CORS is configured.");
      } else {
        setError(`Upload failed: ${msg.slice(0, 100)}`);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Cover image must be under 5MB."); return; }
    setUploadingCover(true);
    setError("");
    try {
      const path = `subjects/covers/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setEditing((prev) => ({ ...prev, coverImage: url }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Cover upload failed: ${msg.slice(0, 100)}`);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const load = () => {
    setLoading(true);
    getSubjects().then(setSubjects).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => setEditing({ ...emptySubject, track });
  const openEdit = (s: Subject) => setEditing({ ...s });
  const closeEdit = () => { setEditing(null); setError(""); };

  const handleSave = async () => {
    if (!editing?.title?.trim()) { setError("Subject title is required."); return; }
    setSaving(true);
    try {
      await saveSubject(editing as Subject);
      load();
      closeEdit();
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject? This cannot be undone.")) return;
    await deleteSubject(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Subjects</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage School and Coding subjects.</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:scale-105 transition">
          <Plus className="h-4 w-4" /> Add Subject
        </button>
      </div>

      {/* Track tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {(["school", "coding"] as const).map((t) => (
          <button key={t} onClick={() => { setTrack(t); setEditing(null); }}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px ${track === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "school" ? "🏫 School Academy" : "💻 Coding Bootcamp"}
          </button>
        ))}
      </div>

      {editing && (
        <div className="rounded-3xl border border-primary/30 bg-card p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">{editing.id ? "Edit Subject" : "New Subject"}</h2>
            <button onClick={closeEdit} className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Subject Title *" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="e.g. Physics" />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Track</label>
              <select value={editing.track ?? "school"}
                onChange={(e) => setEditing({ ...editing, track: e.target.value as Subject["track"] })}
                className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="school">School Academy</option>
                <option value="coding">Coding Bootcamp</option>
              </select>
            </div>
            <Field label="Class" value={editing.class ?? ""} onChange={(v) => setEditing({ ...editing, class: v })} placeholder="e.g. Class 10" />
            {/* Image upload */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Subject Icon (Image)</label>
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted transition disabled:opacity-50 flex-1">
                  {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Choose Image</>}
                </button>
                {editing.icon && !uploading && (
                  <div className="relative h-12 w-12 shrink-0 rounded-xl border border-border overflow-hidden bg-muted/20">
                    <img src={editing.icon} alt="preview" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setEditing({ ...editing, icon: "" })}
                      className="absolute top-0.5 right-0.5 grid h-4 w-4 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">PNG, JPG, SVG, WebP · Max 2MB</p>
            </div>

            {/* Cover image upload */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Card Cover Image</label>
              <div className="flex items-center gap-3">
                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}
                  className="flex items-center gap-2 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted transition disabled:opacity-50 flex-1">
                  {uploadingCover ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Choose Cover</>}
                </button>
                {editing.coverImage && !uploadingCover && (
                  <div className="relative h-12 w-20 shrink-0 rounded-xl border border-border overflow-hidden bg-muted/20">
                    <img src={editing.coverImage} alt="cover preview" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setEditing({ ...editing, coverImage: "" })}
                      className="absolute top-0.5 right-0.5 grid h-4 w-4 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">Background image shown on subject card · Max 5MB</p>
            </div>
            <Field label="Order" value={String(editing.order ?? 0)} onChange={(v) => setEditing({ ...editing, order: Number(v) })} placeholder="0" type="number" />
          </div>

          {error && <p className="text-xs text-destructive font-semibold">{error}</p>}

          <div className="flex gap-3 justify-end">
            <button onClick={closeEdit} className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Subject"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : subjects.filter(s => s.track === track).length === 0 ? (
        <EmptyState message={`No ${track === "school" ? "School Academy" : "Coding Bootcamp"} subjects yet.`} />
      ) : (
        <div className="space-y-3">
          {subjects.filter(s => s.track === track).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition hover:shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-xl border border-border bg-muted/20 overflow-hidden flex items-center justify-center">
                  {s.icon ? (
                    <img src={s.icon} alt={s.title} className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <span className="text-lg">📘</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.class} · {s.track === "school" ? "School Academy" : "Coding Bootcamp"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(s)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary-soft text-primary transition">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-red-50 text-destructive transition">
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

// ─── Shared helpers (re-exported for other panels) ────────────────────────────

export function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-muted-foreground uppercase">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
    </div>
  );
}

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
      <p className="text-sm text-muted-foreground font-semibold">{message}</p>
    </div>
  );
}
