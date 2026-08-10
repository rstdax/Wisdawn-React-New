import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Zap, Star, Trophy, RotateCcw, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { getTestQuestions, getPracticeTests, type McqQuestion } from "@/lib/admin";
import { createTestAttempt, submitMcqTest, type McqSubmitResult } from "@/lib/xp";
import { XpGainAnimation } from "@/components/gamification/XpGainAnimation";
import { BadgeUnlockQueue } from "@/components/gamification/BadgeUnlock";
import { useInvalidateXP } from "@/hooks/use-xp";

export const Route = createFileRoute("/practice/$id")({
  head: () => ({ meta: [{ title: "Practice - WisDawn" }] }),
  component: Practice,
});

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const XPCoin = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border border-yellow-400 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-full w-full p-0.5 text-amber-700 opacity-90">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  </div>
);

function Practice() {
  const { id } = useParams({ from: "/practice/$id" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const invalidateXP = useInvalidateXP();

  // answers: qId -> chosen key (locked once set)
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [result, setResult] = useState<McqSubmitResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showXpAnim, setShowXpAnim] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: tests = [] } = useQuery({
    queryKey: ["practiceTests"],
    queryFn: () => getPracticeTests(50),
    staleTime: 5 * 60 * 1000,
  });
  const test = tests.find(t => t.id === id);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["testQuestions", id],
    queryFn: () => getTestQuestions(id),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });

  const allowedSeconds = test ? (test.allowed_time_seconds || (test.durationMinutes || 30) * 60) : 1800;
  const xpPerQuestion = test ? Math.round((test.base_test_xp || 100) / Math.max(questions.length, 1)) : 0;
  const answeredCount = Object.keys(answers).length;
  const total = questions.length;

  useEffect(() => {
    if (!user?.uid || !id) return;
    createTestAttempt(user.uid, id).then(setAttemptId).catch(console.error);
  }, [user?.uid, id]);

  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [submitted]);

  // Select answer - locked after first selection
  const handleSelect = (qId: string, key: string) => {
    if (submitted || answers[qId]) return; // already answered - locked
    setAnswers(cur => ({ ...cur, [qId]: key }));
  };

  const handleSubmit = async () => {
    if (!attemptId || !user?.uid || submitting) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const res = await submitMcqTest(attemptId, answers, user?.uid);
      setResult(res);
      setSubmitted(true);
      if (res.success && res.xp_earned > 0) setShowXpAnim(true);
      if (res.new_badges?.length) setNewBadges(res.new_badges);
      if (user.uid) invalidateXP(user.uid);
    } catch {
      setResult({ success: false, xp_earned: 0, base_xp: 0, accuracy_bonus: 0, speed_bonus: 0, score_percentage: 0, correct_answers: 0, total_questions: total, actual_time_seconds: elapsed, message: "Submission failed." });
      setSubmitted(true);
    } finally { setSubmitting(false); }
  };

  const restart = () => {
    setAnswers({}); setSubmitted(false); setResult(null);
    setElapsed(0); setShowXpAnim(false); setNewBadges([]);
    if (user?.uid && id) createTestAttempt(user.uid, id).then(setAttemptId).catch(console.error);
  };

  if (isLoading || tests.length === 0) {
    return (
      <MobileFrame>
        <div className="flex flex-col gap-4 p-5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-full" />
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <XpGainAnimation xpEarned={result?.xp_earned ?? 0} show={showXpAnim} onComplete={() => setShowXpAnim(false)} />
      {newBadges.length > 0 && <BadgeUnlockQueue badgeIds={newBadges} onAllComplete={() => setNewBadges([])} />}

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-slate-100 bg-white sticky top-0 z-10">
        <button onClick={() => navigate({ to: "/tests" })} className="grid h-9 w-9 place-items-center rounded-full active:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center min-w-0 flex-1 px-2">
          <h1 className="text-sm font-extrabold text-slate-900 truncate">{test?.title ?? "Practice Test"}</h1>
          <p className="text-[11px] text-muted-foreground">
            {submitted ? "Completed" : `${answeredCount} / ${total} answered`}
          </p>
        </div>
        <div className="w-9" />
      </header>

      {/* Test info bar */}
      {!submitted && (
        <div className="flex items-center justify-between px-4 py-2 bg-primary/5 border-b border-primary/10">
          <span className="text-[11px] font-bold text-primary">{total} Questions</span>
          <div className="flex items-center gap-1.5">
            <XPCoin className="h-4 w-4" />
            <span className="text-[11px] font-bold text-amber-700">{(test?.base_test_xp ?? 1) * total} XP max</span>
            <span className="text-[11px] text-muted-foreground">({test?.base_test_xp ?? 1} XP/Q)</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-36">
        {submitted && result ? (
          /* RESULT SCREEN */
          <div className="p-4 space-y-4 mt-2">
            {/* Score card */}
            <div className={`rounded-3xl p-6 text-center ${result.score_percentage >= 80 ? "bg-emerald-50 border border-emerald-200" : result.score_percentage >= 50 ? "bg-amber-50 border border-amber-200" : "bg-red-50 border border-red-200"}`}>
              <div className="text-4xl mb-2">{result.score_percentage === 100 ? "🎯" : result.score_percentage >= 80 ? "🏆" : result.score_percentage >= 50 ? "👍" : "📚"}</div>
              <div className="text-3xl font-black text-slate-900">{result.score_percentage}%</div>
              <p className="text-sm font-semibold text-slate-600 mt-1">Test Completed!</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Correct</p>
                  <p className="text-lg font-black text-slate-900">{result.correct_answers}/{result.total_questions}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">XP Earned</p>
                  <p className="text-lg font-black text-amber-600">+{result.xp_earned}</p>
                </div>
              </div>
            </div>

            {/* XP Breakdown */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <XPCoin className="h-7 w-7 shadow-sm" />
                <p className="text-base font-extrabold text-amber-900">+{result.xp_earned} XP Earned</p>
              </div>
              <div className="flex justify-between text-sm font-semibold text-slate-600 pb-2 border-b border-amber-200">
                <span>Correct Answers</span>
                <span className="text-slate-900">{result.correct_answers} / {result.total_questions}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-amber-900 pt-2 font-extrabold">
                <span>Total XP ({result.correct_answers} x {result.base_xp / (result.correct_answers || 1)} XP/Q)</span>
                <span>+{result.xp_earned}</span>
              </div>
            </div>

            {/* Review answers */}
            <div>
              <p className="text-sm font-extrabold text-slate-900 mb-3">Answer Review</p>
              <div className="space-y-3">
                {questions.map((q, i) => {
                  const chosen = answers[q.id];
                  const isCorrect = chosen === q.correctKey;
                  return (
                    <div key={q.id} className={`rounded-2xl border p-3 ${isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                        <p className="text-sm font-semibold text-slate-800">{i + 1}. {q.question}</p>
                      </div>
                      {q.imageUrl && <img src={q.imageUrl} alt="" className="mb-2 max-h-32 rounded-xl object-contain" />}
                      <div className="space-y-1 pl-6">
                        {q.options.map(o => (
                          <div key={o.key} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold ${
                            o.key === q.correctKey ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : o.key === chosen && chosen !== q.correctKey ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-white/60 text-slate-500"
                          }`}>
                            <span className="font-extrabold w-5">{o.key}.</span>
                            <span>{o.text}</span>
                            {o.key === q.correctKey && <span className="ml-auto text-[10px] font-bold text-emerald-700">Correct</span>}
                            {o.key === chosen && chosen !== q.correctKey && <span className="ml-auto text-[10px] font-bold text-red-600">Your answer</span>}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="mt-2 pl-6 text-[12px] text-slate-500 font-medium">{q.explanation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pb-4">
              <button onClick={restart} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-white py-3.5 text-sm font-semibold text-muted-foreground">
                <RotateCcw className="h-4 w-4" /> Retry
              </button>
              <button onClick={() => navigate({ to: "/tests" })} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white">
                More Tests <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ALL QUESTIONS — question paper style */
          <div className="p-4 space-y-4 mt-2">
            {questions.length === 0 ? (
              <div className="text-center py-16 text-sm text-muted-foreground">No questions available for this test.</div>
            ) : questions.map((q, i) => {
              const chosen = answers[q.id];
              const isLocked = !!chosen;
              return (
                <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-[11px] font-extrabold">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 leading-snug">{q.question}</p>
                      {q.imageUrl && <img src={q.imageUrl} alt="" className="mt-2 max-h-40 rounded-xl object-contain border" />}
                    </div>
                  </div>
                  <div className="space-y-2 pl-1">
                    {q.options.map(o => {
                      const isPicked = chosen === o.key;
                      const isCorrect = isLocked && o.key === q.correctKey;
                      const isWrong = isPicked && o.key !== q.correctKey;
                      return (
                        <button key={o.key}
                          onClick={() => handleSelect(q.id, o.key)}
                          disabled={isLocked}
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                            isCorrect ? "border-emerald-500 bg-emerald-50"
                            : isWrong ? "border-red-400 bg-red-50"
                            : isPicked ? "border-primary bg-primary/5"
                            : isLocked ? "border-slate-100 bg-slate-50 opacity-60"
                            : "border-slate-200 hover:border-primary/40 hover:bg-primary/5"
                          }`}
                        >
                          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${
                            isCorrect ? "bg-emerald-500 text-white"
                            : isWrong ? "bg-red-500 text-white"
                            : isPicked ? "bg-primary text-white"
                            : "bg-slate-100 text-slate-500"
                          }`}>{o.key}</span>
                          <span className={`flex-1 font-semibold ${isCorrect ? "text-emerald-800" : isWrong ? "text-red-700" : "text-slate-800"}`}>{o.text}</span>
                          {isCorrect && <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />}
                          {isWrong && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {chosen && q.explanation && (
                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                      <p className="text-[11px] font-bold text-slate-600 mb-0.5">Explanation</p>
                      <p className="text-[12px] text-slate-500">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer — submit button */}
      {!submitted && questions.length > 0 && (
        <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 w-full max-w-[440px] border-t border-border bg-background p-4 z-10">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-slate-500">{answeredCount}/{total} answered</span>
            <div className="flex gap-1">
              {questions.map((q, i) => (
                <div key={i} className={`h-1.5 w-4 rounded-full ${answers[q.id] ? "bg-primary" : "bg-slate-200"}`} />
              ))}
            </div>
          </div>
          <button onClick={handleSubmit} disabled={answeredCount === 0 || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? (
              <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
            ) : (
              <>Submit Test <Zap className="h-4 w-4" /></>
            )}
          </button>
          {answeredCount < total && <p className="text-center text-[10px] text-muted-foreground mt-1.5">You can submit without answering all questions</p>}
        </div>
      )}
    </MobileFrame>
  );
}
