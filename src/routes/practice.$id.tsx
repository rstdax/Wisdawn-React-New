import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MoreVertical, ArrowRight, Check, RotateCcw } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";

export const Route = createFileRoute("/practice/$id")({
  head: () => ({ meta: [{ title: "Practice — WisDawn" }] }),
  component: Practice,
});

const questions = [
  {
    q: "Which of the following is an example of a combination reaction?",
    options: [
      { k: "A", t: "CaCO₃ → CaO + CO₂" },
      { k: "B", t: "Zn + 2HCl → ZnCl₂ + H₂" },
      { k: "C", t: "2H₂ + O₂ → 2H₂O" },
      { k: "D", t: "AgNO₃ + NaCl → AgCl + NaNO₃" },
    ],
    correct: "C",
    explanation:
      "In a combination reaction, two or more substances combine to form a single product.",
  },
  {
    q: "What happens in a decomposition reaction?",
    options: [
      { k: "A", t: "Two reactants merge into one product" },
      { k: "B", t: "A single reactant breaks into simpler products" },
      { k: "C", t: "An acid neutralizes a base" },
      { k: "D", t: "A metal replaces hydrogen in water" },
    ],
    correct: "B",
    explanation: "A decomposition reaction splits one compound into two or more simpler products.",
  },
  {
    q: "Which reaction is a displacement reaction?",
    options: [
      { k: "A", t: "2H₂ + O₂ → 2H₂O" },
      { k: "B", t: "CaCO₃ → CaO + CO₂" },
      { k: "C", t: "Zn + CuSO₄ → ZnSO₄ + Cu" },
      { k: "D", t: "NaCl + AgNO₃ → AgCl + NaNO₃" },
    ],
    correct: "C",
    explanation: "In a displacement reaction, one element replaces another in a compound.",
  },
];

function Practice() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const total = questions.length;
  const q = questions[idx];
  const selected = answers[idx] ?? "";
  const score = questions.reduce((count, question, questionIndex) => {
    return count + (answers[questionIndex] === question.correct ? 1 : 0);
  }, 0);

  const handleSelect = (value: string) => {
    setAnswers((current) => ({ ...current, [idx]: value }));
  };

  const handleNext = () => {
    if (!selected) return;
    if (idx < total - 1) {
      setIdx((current) => current + 1);
      return;
    }
    setSubmitted(true);
  };

  const restart = () => {
    setIdx(0);
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <MobileFrame>
      <header className="flex items-center justify-between px-5 pt-2">
        <button
          onClick={() => navigate({ to: "/chapter/$id", params: { id: "chemical-reactions" } })}
          className="grid h-9 w-9 place-items-center rounded-full active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold">Practice: Chemical Reactions</h1>
          <p className="text-[11px] text-muted-foreground">
            {submitted ? "Practice complete" : `Question ${idx + 1} of ${total}`}
          </p>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full active:bg-muted">
          <MoreVertical className="h-5 w-5" />
        </button>
      </header>

      <div className="px-5 pt-3">
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <p className="mt-2 text-right text-[11px] font-semibold text-muted-foreground">
          {submitted ? "Completed" : `${idx + 1} / ${total} Questions`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {submitted ? (
          <div className="mt-4 rounded-3xl border border-border bg-card p-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary">
              Result • {score}/{total}
            </div>
            <h2 className="mt-3 text-base font-bold">Nice work! You finished the practice set.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {score >= 2
                ? "You’ve got a solid handle on the topic. Keep going!"
                : "Review the explanations and try again for a stronger score."}
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-primary-soft p-3 text-sm">
              <p className="font-semibold">Study tip</p>
              <p className="mt-1 text-muted-foreground">
                Try explaining each reaction type out loud to make the patterns stick.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary">
              Q{idx + 1} · MULTIPLE CHOICE
            </div>
            <h2 className="mt-3 text-base font-bold leading-snug">{q.q}</h2>

            <div className="mt-5 space-y-3">
              {q.options.map((o) => {
                const isPicked = selected === o.k;
                const isCorrect = selected && o.k === q.correct;
                const isWrong = isPicked && o.k !== q.correct;
                return (
                  <button
                    key={o.k}
                    onClick={() => handleSelect(o.k)}
                    className={`flex w-full items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 text-left text-sm transition ${
                      isCorrect
                        ? "border-emerald-500 bg-emerald-50"
                        : isWrong
                          ? "border-destructive bg-destructive/5"
                          : "border-border"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                        isCorrect
                          ? "bg-emerald-500 text-white"
                          : isWrong
                            ? "bg-destructive text-white"
                            : "bg-primary-soft text-primary"
                      }`}
                    >
                      {o.k}
                    </span>
                    <span className="flex-1 font-medium">{o.t}</span>
                    {isCorrect && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <Check className="h-3.5 w-3.5" /> Correct
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="mt-5 rounded-2xl border border-border bg-primary-soft p-4 text-sm">
                <p className="font-bold">Explanation</p>
                <p className="mt-1 text-muted-foreground">{q.explanation}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t border-border bg-background p-5">
        {submitted ? (
          <button
            onClick={restart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold"
          >
            <RotateCcw className="h-4 w-4" /> Restart Practice
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!selected}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {idx < total - 1 ? "Next Question" : "Finish Practice"}{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </MobileFrame>
  );
}
