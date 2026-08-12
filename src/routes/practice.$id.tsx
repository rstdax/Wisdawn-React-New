import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, RotateCcw, CheckCircle, XCircle, X, Check, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { getTestQuestions, getPracticeTests } from "@/lib/admin";
import { createTestAttempt, submitMcqTest, type McqSubmitResult } from "@/lib/xp";
import { XpGainAnimation } from "@/components/gamification/XpGainAnimation";
import { BadgeUnlockQueue } from "@/components/gamification/BadgeUnlock";
import { useInvalidateXP, useXP } from "@/hooks/use-xp";

export const Route = createFileRoute("/practice/$id")({
  head: () => ({ meta: [{ title: "Practice - WisDawn" }] }),
  component: Practice,
});

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Gold star/coin for the top bar
const StarCoin = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center rounded-full bg-amber-400 shadow-sm border-2 border-amber-500 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-[60%] w-[60%] text-amber-100">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  </div>
);

// Global Audio Context for sound effects
let audioCtx: AudioContext | null = null;

const triggerFeedback = (type: 'select' | 'success' | 'error') => {
  // 1. Haptic Feedback
  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
    if (type === 'success') window.navigator.vibrate([100, 50, 100]);
    else if (type === 'error') window.navigator.vibrate([50, 100, 50, 100, 50]);
    else window.navigator.vibrate(30);
  }
  
  // 2. Synthesized Sound Effects (Duolingo Style)
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'select') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); 
      osc.stop(now + 0.1);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(1200, now + 0.1); // Jump pitch up
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now); 
      osc.stop(now + 0.3);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(200, now + 0.2); // Drop pitch down
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now); 
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

function Practice() {
  const { id } = useParams({ from: "/practice/$id" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const invalidateXP = useInvalidateXP();

  // Test states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSelected, setCurrentSelected] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Submission & Backend states
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

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["testQuestions", id],
    queryFn: () => getTestQuestions(id),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });

  const test = tests.find(t => t.id === id);
  const total = questions.length;
  const currentQ = questions[currentIndex];
  const allowedSeconds = test ? (test.allowed_time_seconds || (test.durationMinutes || 30) * 60) : 1800;

  useEffect(() => {
    if (!user?.uid || !id) return;
    createTestAttempt(user.uid, id).then(setAttemptId).catch(console.error);
  }, [user?.uid, id]);

  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [submitted]);

  const handleOptionClick = (key: string) => {
    if (isChecked) return;
    triggerFeedback('select');
    setCurrentSelected(key);
  };

  const handleCheck = () => {
    if (!currentSelected || isChecked || !currentQ) return;
    const isCorrect = currentSelected === currentQ.correctKey;
    
    triggerFeedback(isCorrect ? 'success' : 'error');
    
    setAnswers(prev => ({ ...prev, [currentQ.id]: currentSelected }));
    setIsChecked(true);
  };

  const handleContinue = async () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSelected(null);
      setIsChecked(false);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!attemptId || !user?.uid || submitting) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const res = await submitMcqTest(attemptId, answers);
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
    setCurrentIndex(0); setCurrentSelected(null); setIsChecked(false);
    setElapsed(0); setShowXpAnim(false); setNewBadges([]);
    if (user?.uid && id) createTestAttempt(user.uid, id).then(setAttemptId).catch(console.error);
  };

  // Auto-submit when time runs out
  useEffect(() => {
    if (submitted || submitting || !attemptId || !user?.uid) return;
    if (elapsed >= allowedSeconds) {
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, allowedSeconds, submitted]);

  // LOCAL SCORE FALLBACK (Guarantees the UI is accurate regardless of network lag)
  const localCorrectCount = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctKey ? 1 : 0), 0);
  const displayScore = total > 0 ? Math.round((localCorrectCount / total) * 100) : 0;
  const progressPercent = total > 0 ? (currentIndex / total) * 100 : 0;
  const currentProgress = submitted ? 100 : progressPercent;

  if (isLoading || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center p-5 gap-4">
        <Skeleton className="h-8 w-1/2 rounded-lg" />
        <Skeleton className="h-40 w-full max-w-[500px] rounded-[24px]" />
        <Skeleton className="h-16 w-full max-w-[500px] rounded-[20px]" />
        <Skeleton className="h-16 w-full max-w-[500px] rounded-[20px]" />
      </div>
    );
  }

  return (
    // STRICT Z-INDEX AND OVERFLOW CONTAINER to hide BottomNav
    <div className="fixed inset-0 z-[9999] bg-white sm:bg-slate-50 flex flex-col font-sans overflow-hidden items-center">
      <XpGainAnimation xpEarned={result?.xp_earned ?? 0} show={showXpAnim} onComplete={() => setShowXpAnim(false)} />
      {newBadges.length > 0 && <BadgeUnlockQueue badgeIds={newBadges} onAllComplete={() => setNewBadges([])} />}

      <div className="w-full sm:max-w-[500px] h-full flex flex-col bg-white relative shadow-2xl overflow-hidden">
        
        {/* HEADER SECTION (Shrink-0 to protect space) */}
        <div className="shrink-0 bg-white z-20 relative">
          {/* DUOLINGO STYLE TOP PROGRESS BAR */}
          <header className="flex items-center gap-4 px-4 pt-4 pb-2">
            <button onClick={() => navigate({ to: "/tests" })} className="text-slate-400 hover:text-slate-600 transition-colors active:scale-95">
              <X className="h-7 w-7" />
            </button>
            <div className="flex-1 h-[14px] bg-slate-200 rounded-full overflow-hidden relative">
              <div 
                className="absolute left-0 top-0 h-full bg-[#58cc02] transition-all duration-500 ease-out rounded-full" 
                style={{ width: `${currentProgress}%` }} 
              />
              <div className="absolute top-1 left-2 h-1.5 w-[80%] max-w-16 bg-white/30 rounded-full" />
            </div>
            <div className="flex items-center">
              <StarCoin className="h-8 w-8" />
            </div>
          </header>

          {/* TIMER AND QUESTION TRACKER (Matches screenshot) */}
          {!submitted && (
            <div className="flex justify-between items-center px-5 pb-3 pt-2 border-b border-slate-100">
              <span className="text-[13px] font-extrabold text-slate-400 uppercase tracking-widest">
                Question {currentIndex + 1} of {total}
              </span>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border-2 border-slate-100 shadow-sm text-slate-500">
                <Clock className="h-4 w-4" />
                <span className={`text-[13px] font-extrabold tracking-widest ${allowedSeconds - elapsed <= 60 ? "text-[#ff4b4b] animate-pulse" : "text-slate-600"}`}>
                  {formatTime(Math.max(0, allowedSeconds - elapsed))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto w-full hide-scrollbar">
          <div className="pb-8 px-5 pt-4">
            {submitted ? (
              /* RESULT SCREEN */
              <div className="space-y-6 max-w-[500px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-10">
                <div className={`rounded-[32px] p-8 text-center border-2 border-b-4 ${displayScore >= 80 ? "bg-[#d7ffb8] border-[#58cc02]" : displayScore >= 50 ? "bg-amber-50 border-amber-400" : "bg-[#ffdfe0] border-[#ff4b4b]"}`}>
                  <div className="text-7xl mb-5 drop-shadow-sm">{displayScore === 100 ? "🎯" : displayScore >= 80 ? "🏆" : displayScore >= 50 ? "👍" : "📚"}</div>
                  <div className={`text-5xl font-black tracking-tight ${displayScore >= 80 ? "text-[#46a302]" : displayScore >= 50 ? "text-amber-600" : "text-[#ea2b2b]"}`}>
                    {displayScore}%
                  </div>
                  <p className={`text-[18px] font-bold mt-2 ${displayScore >= 80 ? "text-[#58cc02]" : displayScore >= 50 ? "text-amber-500" : "text-[#ff4b4b]"}`}>
                    {displayScore >= 80 ? "Excellent Work!" : displayScore >= 50 ? "Good Job!" : "Keep Practicing!"}
                  </p>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/60 p-4 text-center">
                      <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Correct</p>
                      <p className="text-[26px] font-black text-slate-800 mt-1">{localCorrectCount}/{total}</p>
                    </div>
                    <div className="rounded-2xl bg-white/60 p-4 text-center">
                      <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">XP Earned</p>
                      <p className="text-[26px] font-black text-amber-600 mt-1">+{result?.xp_earned ?? 0}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[22px] font-extrabold text-slate-800 mb-5 tracking-tight">Answer Review</p>
                  <div className="space-y-5">
                    {questions.map((q, i) => {
                      const chosen = answers[q.id];
                      const isCorrect = chosen === q.correctKey;
                      return (
                        <div key={q.id} className={`rounded-[32px] border-2 p-6 ${isCorrect ? "border-[#58cc02] bg-[#d7ffb8]" : "border-[#ff4b4b] bg-[#ffdfe0]"}`}>
                          <div className="flex items-start gap-3 mb-5">
                            {isCorrect ? <CheckCircle className="h-7 w-7 text-[#58cc02] shrink-0 fill-white" /> : <XCircle className="h-7 w-7 text-[#ff4b4b] shrink-0 fill-white" />}
                            <p className={`text-[18px] font-bold leading-snug pt-0.5 ${isCorrect ? "text-[#46a302]" : "text-[#ea2b2b]"}`}>{i + 1}. {q.question}</p>
                          </div>
                          {q.imageUrl && <img src={q.imageUrl} alt="" className="mb-5 max-h-36 rounded-2xl object-contain border-2 border-white/50 bg-white w-full" />}
                          <div className="space-y-3">
                            {q.options.map(o => (
                              <div key={o.key} className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 text-[15px] font-bold border-2 transition-colors ${
                                o.key === q.correctKey ? "bg-white border-[#58cc02] text-[#46a302]"
                                : o.key === chosen && chosen !== q.correctKey ? "bg-white border-[#ff4b4b] text-[#ea2b2b]"
                                : "bg-white/40 border-transparent text-slate-500 opacity-60"
                              }`}>
                                <span className="font-extrabold text-[17px] opacity-60">{o.key}.</span>
                                <span>{o.text}</span>
                                {o.key === q.correctKey && <span className="ml-auto text-[11px] font-black text-[#58cc02] uppercase tracking-widest">Correct</span>}
                                {o.key === chosen && chosen !== q.correctKey && <span className="ml-auto text-[11px] font-black text-[#ff4b4b] uppercase tracking-widest">Your pick</span>}
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <div className="mt-5">
                              <div className="bg-white/60 border-2 border-white/50 p-4 rounded-2xl">
                                <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Explanation</p>
                                <p className="text-[14px] text-slate-700 font-semibold leading-relaxed">{q.explanation}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* SINGLE QUESTION VIEW */
              <div className="max-w-[500px] mx-auto animate-in fade-in slide-in-from-right-4 duration-300 pt-2">
                <div className="space-y-4">
                  <h2 className="text-[22px] md:text-[24px] font-extrabold text-[#202B36] leading-snug">
                    {currentQ.question}
                  </h2>
                  {currentQ.imageUrl && (
                    <img src={currentQ.imageUrl} alt="" className="mt-4 max-h-48 w-full rounded-2xl object-contain border-2 border-slate-100 bg-white" />
                  )}
                </div>
                
                <div className="space-y-3.5 pt-8">
                  {currentQ.options.map(o => {
                    const isPicked = currentSelected === o.key;
                    const isLocked = isChecked;
                    const isCorrect = isLocked && o.key === currentQ.correctKey;
                    const isWrong = isLocked && isPicked && o.key !== currentQ.correctKey;
                    
                    let btnClass = "relative flex w-full items-center gap-4 rounded-[20px] border-2 px-5 py-4 text-left text-[17px] font-bold transition-all duration-200 outline-none";

                    if (isLocked) {
                      if (isCorrect) {
                        btnClass += " border-[#58cc02] bg-[#d7ffb8] text-[#46a302]";
                      } else if (isWrong) {
                        btnClass += " border-[#ff4b4b] bg-[#ffdfe0] text-[#ea2b2b]";
                      } else {
                        btnClass += " border-slate-200 bg-white text-slate-400 opacity-50 cursor-default";
                      }
                    } else {
                      if (isPicked) {
                        btnClass += " border-blue-400 bg-[#eef5ff] text-blue-600 border-b-4 translate-y-[-2px]";
                      } else {
                        btnClass += " border-slate-200 bg-white text-[#4B5563] hover:bg-slate-50 border-b-4 active:border-b-2 active:translate-y-[2px]";
                      }
                    }

                    return (
                      <button 
                        key={o.key}
                        onClick={() => handleOptionClick(o.key)}
                        disabled={isLocked}
                        className={btnClass}
                      >
                        <span className={`text-[17px] ${isCorrect || isWrong || isPicked ? "opacity-100 font-black" : "text-[#778da9] font-extrabold"}`}>
                          {o.key}.
                        </span>
                        <span className="flex-1">{o.text}</span>
                        
                        {isCorrect && <CheckCircle className="h-7 w-7 text-[#58cc02] shrink-0 fill-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* BOTTOM ACTION SHEET (Anchored absolutely to the bottom) */}
        <footer className={`shrink-0 w-full border-t-2 transition-colors duration-300 ${
          submitted ? "bg-white border-slate-200" :
          !isChecked ? "bg-white border-slate-200" :
          (currentSelected === currentQ.correctKey) ? "bg-[#d7ffb8] border-[#d7ffb8]" : "bg-[#ffdfe0] border-[#ffdfe0]"
        }`}>
          <div className="max-w-[500px] mx-auto px-5 pt-5 pb-[max(env(safe-area-inset-bottom),24px)] relative">
            
            {/* Feedback Banner (Only visible when checked but not submitted) */}
            {!submitted && isChecked && (
              <div className="mb-5 flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300 relative">
                
                {/* Floating +XP Animation for Correct Answer */}
                {currentSelected === currentQ.correctKey && (
                  <div className="absolute right-2 -top-16 flex items-center gap-1.5 animate-in zoom-in slide-in-from-bottom-5 fade-in duration-500 fill-mode-forwards drop-shadow-md">
                    <span className="text-2xl font-black text-amber-500">
                      +{Math.max(1, Math.round((test?.base_test_xp ?? 100) / total))}
                    </span>
                  </div>
                )}

                <div className={`grid h-14 w-14 place-items-center rounded-full shrink-0 ${currentSelected === currentQ.correctKey ? "bg-white text-[#58cc02]" : "bg-white text-[#ea2b2b]"}`}>
                  {currentSelected === currentQ.correctKey ? <Check className="h-8 w-8 stroke-[4]" /> : <X className="h-8 w-8 stroke-[4]" />}
                </div>
                <div>
                  <h3 className={`text-[22px] font-black tracking-tight ${currentSelected === currentQ.correctKey ? "text-[#58cc02]" : "text-[#ea2b2b]"}`}>
                    {currentSelected === currentQ.correctKey ? "Excellent!" : "Incorrect"}
                  </h3>
                  {currentSelected !== currentQ.correctKey && (
                    <p className="text-[#ea2b2b] text-[15px] font-bold mt-1 leading-snug">
                      Correct answer: {currentQ.options.find(o => o.key === currentQ.correctKey)?.text}
                    </p>
                  )}
                  {currentQ.explanation && (
                    <p className={`text-[14px] mt-2 font-bold opacity-90 leading-snug ${currentSelected === currentQ.correctKey ? "text-[#46a302]" : "text-[#d12424]"}`}>
                      {currentQ.explanation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS (Always Wisdawn Blue!) */}
            {submitted ? (
              <div className="flex flex-col gap-3">
                <button onClick={() => navigate({ to: "/tests" })} className="w-full rounded-2xl bg-blue-500 py-4 text-[16px] font-extrabold text-white border-b-4 border-blue-700 transition active:border-b-0 active:translate-y-1 uppercase tracking-widest">
                  CONTINUE
                </button>
                <button onClick={restart} className="w-full rounded-2xl border-2 border-b-4 border-slate-200 bg-white py-4 text-[16px] font-extrabold text-slate-500 transition hover:bg-slate-50 active:border-b-2 active:translate-y-1 uppercase tracking-widest">
                  RETRY TEST
                </button>
              </div>
            ) : !isChecked ? (
              <button
                onClick={handleCheck}
                disabled={!currentSelected}
                className="w-full rounded-2xl bg-blue-500 py-4 text-[16px] font-extrabold text-white uppercase tracking-widest border-b-4 border-blue-700 transition-all active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:bg-slate-200 disabled:border-b-0 disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                CHECK
              </button>
            ) : (
              <button
                onClick={handleContinue}
                disabled={submitting}
                className="w-full rounded-2xl bg-blue-500 py-4 text-[16px] font-extrabold text-white uppercase tracking-widest border-b-4 border-blue-700 transition-all active:border-b-0 active:translate-y-1 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> LOADING...</>
                ) : (
                  currentIndex === total - 1 ? "FINISH TEST" : "CONTINUE"
                )}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}