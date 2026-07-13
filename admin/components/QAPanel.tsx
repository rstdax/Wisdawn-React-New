import { useEffect, useState } from "react";
import {
  getSubjects, getChaptersBySubject, getQA, answerQA, deleteQA,
  type Subject, type Chapter, type QAItem,
} from "../../src/lib/admin";
import { MessageSquare, Trash2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { LoadingSkeleton, EmptyState } from "./SubjectsPanel";

export function QAPanel() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

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
    if (!selectedChapter) { setQaList([]); return; }
    setLoading(true);
    getQA(selectedChapter).then(setQaList).finally(() => setLoading(false));
  }, [selectedChapter]);

  const reload = () => {
    if (!selectedChapter) return;
    setLoading(true);
    getQA(selectedChapter).then(setQaList).finally(() => setLoading(false));
  };

  const handleAnswer = async (qa: QAItem) => {
    const ans = answerDrafts[qa.id]?.trim();
    if (!ans) return;
    setSavingId(qa.id);
    await answerQA(selectedChapter, qa.id, ans);
    setSavingId(null);
    reload();
  };

  const handleDelete = async (qa: QAItem) => {
    if (!confirm("Delete this question?")) return;
    await deleteQA(selectedChapter, qa.id);
    reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-foreground">Q&amp;A</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Answer student questions per chapter.</p>
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

      {loading ? <LoadingSkeleton rows={3} /> : !selectedChapter ? (
        <EmptyState message="Select a chapter to view Q&A." />
      ) : qaList.length === 0 ? <EmptyState message="No questions for this chapter yet." /> : (
        <div className="space-y-3">
          {qaList.map((qa) => (
            <div key={qa.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <button onClick={() => setExpanded(expanded === qa.id ? null : qa.id)}
                className="w-full flex items-start justify-between gap-4 p-4 text-left hover:bg-muted/30 transition">
                <div className="flex items-start gap-3 min-w-0">
                  <MessageSquare className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{qa.question}</p>
                    {qa.answer && <p className="text-xs text-emerald-600 font-semibold mt-0.5">✓ Answered</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(qa); }}
                    className="grid h-7 w-7 place-items-center rounded-full hover:bg-red-50 text-destructive transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {expanded === qa.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {expanded === qa.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/60">
                  {qa.answer && (
                    <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-3 text-xs text-emerald-800 font-semibold leading-relaxed mt-3">
                      <span className="text-emerald-600 font-bold">Current Answer: </span>{qa.answer}
                    </div>
                  )}
                  <textarea value={answerDrafts[qa.id] ?? qa.answer ?? ""}
                    onChange={(e) => setAnswerDrafts({ ...answerDrafts, [qa.id]: e.target.value })}
                    placeholder="Write your answer here…"
                    className="w-full min-h-24 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none mt-2" />
                  <div className="flex justify-end">
                    <button onClick={() => handleAnswer(qa)} disabled={savingId === qa.id}
                      className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-white transition disabled:opacity-60">
                      <Save className="h-3.5 w-3.5" />
                      {savingId === qa.id ? "Saving…" : qa.answer ? "Update Answer" : "Post Answer"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
