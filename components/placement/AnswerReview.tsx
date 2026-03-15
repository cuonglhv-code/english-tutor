"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Headphones,
  PenLine,
  Loader2,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReviewQuestion {
  question_number: number;
  question_text: string;
  question_type: string;
  options: string[] | null;
  correct_answer: string;
  user_answer: string;
  is_correct: boolean;
  part_number?: number;
  passage_title?: string;
  context_text?: string | null;
}

interface CriterionFeedback {
  strengths: string;
  improvements: string;
  band_justification: string;
}

interface WritingFeedback {
  task_achievement?: CriterionFeedback;
  coherence_cohesion?: CriterionFeedback;
  lexical_resource?: CriterionFeedback;
  grammatical_range_accuracy?: CriterionFeedback;
  priority_actions?: string[];
  overall_comment?: string;
}

interface WritingReview {
  essay_text: string;
  word_count: number;
  task_achievement_band: number;
  coherence_cohesion_band: number;
  lexical_resource_band: number;
  grammatical_range_accuracy_band: number;
  overall_band: number;
  feedback: WritingFeedback | null;
}

interface ReviewData {
  reading: ReviewQuestion[];
  listening: ReviewQuestion[];
  writing: {
    task1: WritingReview | null;
    task2: WritingReview | null;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function bandColor(band: number) {
  if (band >= 7) return "text-green-700 bg-green-50 border-green-200";
  if (band >= 5.5) return "text-blue-700 bg-blue-50 border-blue-200";
  if (band >= 4) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

function optionText(opt: string, idx: number) {
  if (opt.includes(":")) return opt.substring(opt.indexOf(":") + 1).trim();
  return `${String.fromCharCode(65 + idx)} — ${opt}`;
}

/** Resolve displayed answer for MCQ (letter → option text) */
function resolveAnswer(answer: string, options: string[] | null): string {
  if (!answer) return "—";
  if (!options) return answer;
  // If answer is a single letter, find matching option
  if (/^[A-Z]$/.test(answer.toUpperCase())) {
    const idx = answer.toUpperCase().charCodeAt(0) - 65;
    if (options[idx]) return `${answer.toUpperCase()} — ${optionText(options[idx], idx)}`;
  }
  return answer;
}

// ─── Question row ─────────────────────────────────────────────────────────────
function QuestionRow({ q }: { q: ReviewQuestion }) {
  const { instruction, statement } = (() => {
    const sep = q.question_text.indexOf(" — ");
    if (sep === -1) return { instruction: "", statement: q.question_text };
    return {
      instruction: q.question_text.slice(0, sep).trim(),
      statement: q.question_text.slice(sep + 3).trim(),
    };
  })();

  const userDisplay = resolveAnswer(q.user_answer, q.options);
  const correctDisplay = resolveAnswer(q.correct_answer, q.options);

  return (
    <div
      className={`flex gap-3 p-3 rounded-lg border ${
        q.user_answer === ""
          ? "bg-slate-50 border-slate-200"
          : q.is_correct
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      {/* Status icon */}
      <div className="shrink-0 mt-0.5">
        {q.user_answer === "" ? (
          <MinusCircle className="h-4.5 w-4.5 text-slate-400" />
        ) : q.is_correct ? (
          <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
        ) : (
          <XCircle className="h-4.5 w-4.5 text-red-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 mt-0.5">
            Q{q.question_number}
          </span>
          <p className="text-sm text-slate-800 flex-1">{statement}</p>
        </div>

        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          {/* User answer */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Your answer:</span>
            <span
              className={`font-semibold ${
                q.user_answer === ""
                  ? "text-slate-400 italic"
                  : q.is_correct
                  ? "text-green-700"
                  : "text-red-600 line-through"
              }`}
            >
              {q.user_answer === "" ? "Not answered" : userDisplay}
            </span>
          </div>

          {/* Correct answer (always shown) */}
          {!q.is_correct && (
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Correct answer:</span>
              <span className="font-semibold text-green-700">{correctDisplay}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section score bar ────────────────────────────────────────────────────────
function ScoreBar({
  correct, total, label,
}: { correct: number; total: number; label: string }) {
  const pct = total > 0 ? (correct / total) * 100 : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">
          {correct}/{total} correct
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Reading / Listening tab ──────────────────────────────────────────────────
function RLTab({
  questions,
  section,
}: { questions: ReviewQuestion[]; section: "reading" | "listening" }) {
  // Group by passage/part for reading, flat for listening
  const correct = questions.filter((q) => q.is_correct).length;
  const answered = questions.filter((q) => q.user_answer !== "").length;
  const total = questions.length;

  const groupLabel = section === "reading" ? "Passage" : "Part";

  // Build groups (reading by part_number+passage_title, listening flat)
  const groups: Array<{ key: string; label: string; items: ReviewQuestion[] }> = [];
  if (section === "reading") {
    const seen = new Map<number, ReviewQuestion[]>();
    for (const q of questions) {
      const pn = q.part_number ?? 1;
      if (!seen.has(pn)) seen.set(pn, []);
      seen.get(pn)!.push(q);
    }
    for (const [pn, items] of Array.from(seen.entries()).sort(([a], [b]) => a - b)) {
      groups.push({
        key: String(pn),
        label: `${groupLabel} ${pn} — ${items[0].passage_title ?? ""}`,
        items,
      });
    }
  } else {
    // Listening: group by question range 1-10, 11-20, 21-30, 31-40
    const partRanges = [[1,10],[11,20],[21,30],[31,40]];
    for (const [start, end] of partRanges) {
      const items = questions.filter(
        (q) => q.question_number >= start && q.question_number <= end
      );
      if (items.length > 0) {
        const partNum = Math.ceil(start / 10);
        groups.push({ key: String(partNum), label: `Part ${partNum} (Q${start}–${end})`, items });
      }
    }
  }

  return (
    <div>
      {/* Summary */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">
            {section === "reading" ? "Reading" : "Listening"} Summary
          </span>
          <span className="text-xs text-slate-500">{answered}/{total} answered</span>
        </div>
        <ScoreBar correct={correct} total={total} label={`${correct} correct out of ${total}`} />
        <div className="flex gap-4 text-xs text-slate-500 mt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> {correct} correct
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5 text-red-400" /> {answered - correct} incorrect
          </span>
          <span className="flex items-center gap-1">
            <MinusCircle className="h-3.5 w-3.5 text-slate-400" /> {total - answered} skipped
          </span>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {groups.map((group) => (
          <CollapsibleGroup key={group.key} label={group.label} items={group.items} />
        ))}
      </div>
    </div>
  );
}

function CollapsibleGroup({
  label,
  items,
}: { label: string; items: ReviewQuestion[] }) {
  const [open, setOpen] = useState(true);
  const correct = items.filter((q) => q.is_correct).length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="text-xs text-slate-500">
            {correct}/{items.length} correct
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="p-3 space-y-2">
          {items.map((q) => (
            <QuestionRow key={q.question_number} q={q} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Writing tab ──────────────────────────────────────────────────────────────
function WritingTab({
  writing,
  taskLabel = "Writing",
}: {
  writing: WritingReview;
  taskLabel?: string;
}) {
  const criteria = [
    {
      key: "task_achievement" as const,
      label: "Task Achievement",
      band: writing.task_achievement_band,
    },
    {
      key: "coherence_cohesion" as const,
      label: "Coherence & Cohesion",
      band: writing.coherence_cohesion_band,
    },
    {
      key: "lexical_resource" as const,
      label: "Lexical Resource",
      band: writing.lexical_resource_band,
    },
    {
      key: "grammatical_range_accuracy" as const,
      label: "Grammatical Range & Accuracy",
      band: writing.grammatical_range_accuracy_band,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Overall + word count */}
      <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="text-center min-w-[64px]">
          <div className="text-3xl font-black text-amber-700">
            {writing.overall_band.toFixed(1)}
          </div>
          <div className="text-[10px] text-amber-600 font-medium uppercase tracking-wide">
            Overall
          </div>
        </div>
        <div className="flex-1 text-sm text-amber-800">
          <p className="font-semibold mb-0.5">{taskLabel} Band Score</p>
          <p className="text-xs text-amber-700">
            {writing.word_count} words written
            {writing.word_count < 250
              ? " · Under 250-word minimum — penalties may apply"
              : " · Word count requirement met ✓"}
          </p>
        </div>
      </div>

      {/* 4 criteria bands */}
      <div className="grid grid-cols-2 gap-3">
        {criteria.map(({ key, label, band }) => (
          <div
            key={key}
            className={`p-3 rounded-lg border text-center ${bandColor(band)}`}
          >
            <div className="text-2xl font-black mb-0.5">{band.toFixed(1)}</div>
            <div className="text-[11px] font-medium leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Detailed feedback per criterion */}
      {writing.feedback &&
        criteria.map(({ key, label, band }) => {
          const fb = writing.feedback?.[key];
          if (!fb) return null;
          return (
            <CriterionCard
              key={key}
              label={label}
              band={band}
              feedback={fb}
            />
          );
        })}

      {/* Overall comment */}
      {writing.feedback?.overall_comment && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Overall Examiner Comment
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {writing.feedback.overall_comment}
          </p>
        </div>
      )}

      {/* Priority actions */}
      {writing.feedback?.priority_actions &&
        writing.feedback.priority_actions.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
              🎯 Priority Actions to Improve
            </p>
            <ol className="space-y-2">
              {writing.feedback.priority_actions.map((action, i) => (
                <li key={i} className="flex gap-2 text-sm text-blue-800">
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-blue-200 text-blue-800 text-[11px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ol>
          </div>
        )}

      {/* Essay text */}
      <details className="border border-slate-200 rounded-xl overflow-hidden">
        <summary className="px-4 py-3 bg-slate-50 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
          View your essay
        </summary>
        <div className="p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-serif bg-white">
          {writing.essay_text}
        </div>
      </details>
    </div>
  );
}

function CriterionCard({
  label,
  band,
  feedback,
}: {
  label: string;
  band: number;
  feedback: CriterionFeedback;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-black px-2 py-0.5 rounded border ${bandColor(band)}`}
          >
            {band.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-slate-700">{label}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="p-4 space-y-3 bg-white">
          {feedback.strengths && (
            <FeedbackBlock
              icon="✅"
              label="Strengths"
              text={feedback.strengths}
            />
          )}
          {feedback.improvements && (
            <FeedbackBlock
              icon="📈"
              label="Areas to Improve"
              text={feedback.improvements}
            />
          )}
          {feedback.band_justification && (
            <FeedbackBlock
              icon="🎓"
              label="Band Justification"
              text={feedback.band_justification}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FeedbackBlock({
  icon,
  label,
  text,
}: { icon: string; label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-1">
        {icon} {label}
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
    </div>
  );
}

// ─── Writing dual-task container ──────────────────────────────────────────────
function WritingDualTab({
  task1,
  task2,
  testId,
  onRescoreSuccess,
}: {
  task1: WritingReview | null;
  task2: WritingReview | null;
  testId: string;
  onRescoreSuccess: () => void;
}) {
  const [activeTask, setActiveTask] = useState<"task1" | "task2">("task2");
  const [rescoring, setRescoring] = useState(false);
  const [rescoreError, setRescoreError] = useState<string | null>(null);

  const hasTask1 = !!task1;
  const hasTask2 = !!task2;
  const hasAny   = hasTask1 || hasTask2;

  async function handleRescore() {
    setRescoring(true);
    setRescoreError(null);
    try {
      const res = await fetch("/api/placement/rescore-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRescoreError(json.error ?? "Re-evaluation failed. Please try again.");
      } else {
        // Reload to show new evaluations
        onRescoreSuccess();
      }
    } catch {
      setRescoreError("Network error. Please try again.");
    } finally {
      setRescoring(false);
    }
  }

  if (!hasAny) {
    return (
      <div className="py-10 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
          <PenLine className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-1">
            Writing feedback not yet generated
          </p>
          <p className="text-xs text-slate-400 max-w-xs">
            Your essays were saved but not evaluated. Click below to score them with AI now.
          </p>
        </div>
        {rescoreError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 max-w-sm">
            {rescoreError}
          </p>
        )}
        <button
          onClick={handleRescore}
          disabled={rescoring}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
        >
          {rescoring ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Evaluating with AI… this may take 30–60 seconds
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Generate Writing Feedback
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Task sub-tabs */}
      <div className="flex gap-1 mb-5 border-b border-slate-200">
        {(["task1", "task2"] as const).map((t) => {
          const label = t === "task1" ? "Task 1" : "Task 2";
          const ev    = t === "task1" ? task1 : task2;
          const isActive = activeTask === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTask(t)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-amber-500 text-amber-700"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {label}
              {ev && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Band {ev.overall_band.toFixed(1)}
                </span>
              )}
              {!ev && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-medium">
                  Not submitted
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active task panel */}
      {activeTask === "task1" && (
        hasTask1 ? (
          <WritingTab writing={task1!} taskLabel="Task 1 — Describe the visual" />
        ) : (
          <p className="text-sm text-slate-500 italic text-center py-8">
            Task 1 was not submitted or could not be evaluated.
          </p>
        )
      )}
      {activeTask === "task2" && (
        hasTask2 ? (
          <WritingTab writing={task2!} taskLabel="Task 2 — Essay" />
        ) : (
          <p className="text-sm text-slate-500 italic text-center py-8">
            Task 2 was not submitted or could not be evaluated.
          </p>
        )
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
type Tab = "reading" | "listening" | "writing";

export function AnswerReview({ testId }: { testId: string }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("reading");

  function fetchReview() {
    setLoading(true);
    fetch(`/api/placement/review?testId=${testId}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchReview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading answer review…</span>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-slate-500 text-center py-8">
        Could not load answer review.
      </p>
    );
  }

  const readingCorrect = data.reading.filter((q) => q.is_correct).length;
  const listeningCorrect = data.listening.filter((q) => q.is_correct).length;

  const tabs: Array<{ key: Tab; icon: React.ReactNode; label: string; badge?: string }> = [
    {
      key: "reading",
      icon: <BookOpen className="h-4 w-4" />,
      label: "Reading",
      badge: `${readingCorrect}/${data.reading.length}`,
    },
    {
      key: "listening",
      icon: <Headphones className="h-4 w-4" />,
      label: "Listening",
      badge: `${listeningCorrect}/${data.listening.length}`,
    },
    {
      key: "writing",
      icon: <PenLine className="h-4 w-4" />,
      label: "Writing",
      badge: (data.writing.task1 || data.writing.task2)
        ? (() => {
            const bands = [data.writing.task1?.overall_band, data.writing.task2?.overall_band]
              .filter((b): b is number => typeof b === "number");
            const avg = bands.length > 0
              ? Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 2) / 2
              : 0;
            return `Band ${avg.toFixed(1)}`;
          })()
        : undefined,
    },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.key
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel */}
      {activeTab === "reading" && (
        <RLTab questions={data.reading} section="reading" />
      )}
      {activeTab === "listening" && (
        <RLTab questions={data.listening} section="listening" />
      )}
      {activeTab === "writing" && (
        <WritingDualTab
          task1={data.writing.task1}
          task2={data.writing.task2}
          testId={testId}
          onRescoreSuccess={fetchReview}
        />
      )}
    </div>
  );
}
