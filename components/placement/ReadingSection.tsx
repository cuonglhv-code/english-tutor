"use client";
import { useCallback, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { GripVertical, Check, ChevronLeft, ChevronRight } from "lucide-react";
import type { Lang } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ReadingQuestion {
  id: string;
  question_number: number;
  question_text: string;
  question_type: "true_false_ng" | "multiple_choice" | "fill_blank" | "matching";
  options?: string[] | null;
}

export interface ReadingPassage {
  passage_title: string;
  passage_text: string;
  part_number: number;
  questions: ReadingQuestion[];
}

interface Props {
  lang: Lang;
  passage: ReadingPassage;
  answers: Record<string, string>; // keyed by bare question number string
  onAnswer: (questionNumber: number, value: string) => void;
  // Navigation — now owned by ReadingSection (not SectionNav)
  onBack: () => void;
  onNext: () => void;
  backDisabled?: boolean;
  nextLabel?: string;
  isLoading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseQText(text: string) {
  const sep = text.indexOf(" — ");
  if (sep === -1) return { instruction: "", statement: text };
  return { instruction: text.slice(0, sep).trim(), statement: text.slice(sep + 3).trim() };
}
function optionLetter(opt: string, idx: number) {
  return opt.includes(":") ? opt.split(":")[0].trim() : String.fromCharCode(65 + idx);
}
function optionText(opt: string) {
  return opt.includes(":") ? opt.substring(opt.indexOf(":") + 1).trim() : opt;
}

// ─── Passage Text renderer ────────────────────────────────────────────────────
function PassageText({ text, title }: { text: string; title: string }) {
  const segments = text.split(/\[([A-Z])\]/);
  const hasParagraphLabels = segments.length > 1;
  const introRaw = segments[0];
  const introLines = introRaw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l && l !== title.trim());

  if (!hasParagraphLabels) {
    return (
      <div className="text-[14px] text-slate-700 leading-7" style={{ fontFamily: "Georgia, serif" }}>
        {introLines.map((line, i) => (
          <p key={`intro-${i}`} className="mb-4 italic text-slate-500 text-sm">{line}</p>
        ))}
        {introRaw
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter((p) => p && p !== title.trim() && !introLines.includes(p))
          .map((para, i) => (
            <p key={i} className="mb-4">{para}</p>
          ))}
      </div>
    );
  }

  // Passages with [A], [B], [C]... paragraph labels
  const els: React.ReactNode[] = [];
  for (let i = 1; i < segments.length; i += 2) {
    const label = segments[i];
    const content = (segments[i + 1] ?? "").trim();
    const paras = content.split(/\n{2,}/).filter((p) => p.trim());
    els.push(
      <div key={label} className="flex gap-3 mb-5">
        <span className="font-bold text-slate-900 shrink-0 w-5 pt-0.5 text-sm select-none">{label}</span>
        <div className="flex-1" style={{ fontFamily: "Georgia, serif" }}>
          {paras.map((para, j) => (
            <p key={j} className={`text-[14px] text-slate-700 leading-7${j > 0 ? " mt-3" : ""}`}>{para.trim()}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {introLines.map((line, i) => (
        <p key={`intro-${i}`} className="mb-4 italic text-slate-500 text-sm">{line}</p>
      ))}
      {els}
    </div>
  );
}

// ─── Question number badge ─────────────────────────────────────────────────────
// Blue-filled = answered · bordered = unanswered · double-border = active (matching)
function QBadge({ n, answered, active }: { n: number; answered: boolean; active?: boolean }) {
  return (
    <span
      className={[
        "shrink-0 inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded border-2 select-none",
        answered
          ? "bg-blue-600 border-blue-600 text-white"
          : active
          ? "border-blue-500 text-blue-700 bg-white"
          : "border-slate-400 text-slate-600 bg-white",
      ].join(" ")}
    >
      {n}
    </span>
  );
}

// ─── T / F / NG  —  radio-button style (matches real portal) ──────────────────
function TFNGInput({
  qn, selected, onAnswer,
}: { qn: number; selected: string; onAnswer: (qn: number, v: string) => void }) {
  const opts = [
    { val: "TRUE", label: "TRUE" },
    { val: "FALSE", label: "FALSE" },
    { val: "NOT GIVEN", label: "NOT GIVEN" },
  ];
  return (
    <div className="mt-3 space-y-2">
      {opts.map(({ val, label }) => {
        const checked = selected === val;
        return (
          <label
            key={val}
            onClick={() => onAnswer(qn, val)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Custom radio circle */}
            <span
              className={[
                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                checked ? "border-blue-600" : "border-slate-400 group-hover:border-blue-400",
              ].join(" ")}
            >
              {checked && <span className="w-2 h-2 rounded-full bg-blue-600" />}
            </span>
            <span className={`text-sm ${checked ? "font-semibold text-blue-700" : "text-slate-700"}`}>
              {label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// ─── Fill blank / short answer ────────────────────────────────────────────────
function FillInput({
  qn, selected, onAnswer,
}: { qn: number; selected: string; onAnswer: (qn: number, v: string) => void }) {
  return (
    <input
      type="text"
      value={selected}
      onChange={(e) => onAnswer(qn, e.target.value)}
      placeholder="Write your answer…"
      className="mt-2 border-b-2 border-slate-300 focus:border-blue-500 outline-none bg-transparent py-1.5 px-1 text-sm text-slate-800 placeholder-slate-400 transition-colors w-full max-w-xs"
    />
  );
}

// ─── Standard A / B / C / D multiple choice ──────────────────────────────────
function MCQInput({
  qn, options, selected, onAnswer,
}: { qn: number; options: string[]; selected: string; onAnswer: (qn: number, v: string) => void }) {
  return (
    <div className="mt-3 space-y-2">
      {options.map((opt, idx) => {
        const letter = optionLetter(opt, idx);
        const text = optionText(opt);
        const isSelected = selected === letter;
        return (
          <label
            key={letter}
            onClick={() => onAnswer(qn, letter)}
            className={[
              "flex items-start gap-2.5 cursor-pointer px-3 py-2.5 rounded-lg border transition-all",
              isSelected
                ? "bg-blue-50 border-blue-400"
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50",
            ].join(" ")}
          >
            <span className={`font-bold text-sm shrink-0 ${isSelected ? "text-blue-600" : "text-slate-400"}`}>
              {letter}.
            </span>
            <span className={`text-sm leading-snug ${isSelected ? "text-blue-800 font-medium" : "text-slate-700"}`}>
              {text}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// ─── Matching answer slot (click to activate, then pick a chip below) ─────────
function MatchingSlot({
  qn, displayValue, isActive, onActivate,
}: {
  qn: number;
  displayValue: string;
  isActive: boolean;
  onActivate: () => void;
}) {
  return (
    <div
      onClick={onActivate}
      className={[
        "mt-2 min-h-9 px-3 py-2 rounded border-2 text-sm cursor-pointer transition-all flex items-center justify-between gap-2",
        isActive
          ? "border-blue-500 bg-blue-50"
          : displayValue
          ? "border-slate-300 bg-slate-50"
          : "border-dashed border-slate-300 hover:border-blue-300 hover:bg-slate-50",
      ].join(" ")}
    >
      <span className={displayValue ? "text-slate-800 font-medium" : "text-slate-400 italic text-xs"}>
        {displayValue || "Click to select, then choose below"}
      </span>
      {isActive && <span className="text-blue-400 text-xs shrink-0">↓ choose option</span>}
    </div>
  );
}

// ─── Chips panel for matching questions (options without ":" format) ───────────
function MatchingChipsPanel({
  options,
  activeQuestion,
  onSelect,
}: {
  options: string[];
  activeQuestion: number | null;
  onSelect: (letter: string) => void;
}) {
  return (
    <div className={[
      "mt-4 pt-4 border-t border-slate-200",
      !activeQuestion ? "opacity-60 pointer-events-none" : "",
    ].join(" ")}>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">
        {activeQuestion
          ? `Options — click to answer Question ${activeQuestion}`
          : "Select a question above first"}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          return (
            <button
              key={idx}
              onClick={() => onSelect(letter)}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white text-sm text-slate-700 font-medium hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <span className="text-slate-400 font-bold mr-1.5 text-xs">{letter}.</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Question group ───────────────────────────────────────────────────────────
interface QuestionGroup {
  instruction: string;
  qType: ReadingQuestion["question_type"];
  options: string[] | null;
  isMatchingChips: boolean;
  items: Array<{ q: ReadingQuestion; statement: string }>;
}

function buildGroups(questions: ReadingQuestion[]): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  for (const q of questions) {
    const { instruction, statement } = parseQText(q.question_text);
    const last = groups[groups.length - 1];
    if (last && last.instruction === instruction && last.qType === q.question_type) {
      last.items.push({ q, statement });
    } else {
      const opts = q.options ?? null;
      const isMatchingChips =
        q.question_type === "multiple_choice" &&
        opts !== null &&
        opts.length > 0 &&
        !opts[0].includes(":");
      groups.push({
        instruction,
        qType: q.question_type,
        options: opts,
        isMatchingChips,
        items: [{ q, statement }],
      });
    }
  }
  return groups;
}

function QuestionGroupBlock({
  group,
  answers,
  onAnswer,
  questionRefs,
  activeQuestion,
  onSetActive,
}: {
  group: QuestionGroup;
  answers: Record<string, string>;
  onAnswer: (qn: number, v: string) => void;
  questionRefs: MutableRefObject<Record<number, HTMLDivElement | null>>;
  activeQuestion: number | null;
  onSetActive: (qn: number | null) => void;
}) {
  const qNums = group.items.map((it) => it.q.question_number);
  const rangeLabel =
    qNums.length === 1
      ? `Question ${qNums[0]}`
      : `Questions ${qNums[0]}–${qNums[qNums.length - 1]}`;

  // Filter activeQuestion to only this group
  const groupActive = qNums.includes(activeQuestion ?? -1) ? activeQuestion : null;

  return (
    <div className="mb-8">
      {/* Group header — "Questions X–Y" + instruction */}
      <div className="mb-4 pb-3 border-b border-slate-100">
        <p className="text-xs font-bold text-slate-700 tracking-wide">{rangeLabel}</p>
        {group.instruction && (
          <p className="mt-1 text-sm text-slate-600 leading-snug">{group.instruction}</p>
        )}
      </div>

      {/* Options legend for matching-chip groups */}
      {group.isMatchingChips && group.options && (
        <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {group.options.map((opt, idx) => (
              <span key={idx} className="text-xs text-slate-600">
                <span className="font-bold text-slate-800">{String.fromCharCode(65 + idx)}</span>
                {" "}— {opt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Individual questions */}
      <div className="space-y-6">
        {group.items.map(({ q, statement }) => {
          const raw = answers[String(q.question_number)] ?? "";
          const answered = raw.trim() !== "";
          const isActive = groupActive === q.question_number;

          // For matching chips: compute display label "A. Name"
          const displayValue =
            group.isMatchingChips && raw && group.options
              ? (() => {
                  const idx = raw.charCodeAt(0) - 65;
                  const name = group.options?.[idx];
                  return name ? `${raw}. ${name}` : raw;
                })()
              : raw;

          return (
            <div
              key={q.id}
              ref={(el) => { questionRefs.current[q.question_number] = el; }}
              className="flex gap-3 items-start"
            >
              {/* Number badge */}
              <QBadge n={q.question_number} answered={answered} active={isActive} />

              {/* Body */}
              <div className="flex-1 min-w-0">
                {statement && (
                  <p className="text-sm text-slate-800 leading-snug">{statement}</p>
                )}

                {q.question_type === "true_false_ng" && (
                  <TFNGInput qn={q.question_number} selected={raw} onAnswer={onAnswer} />
                )}

                {q.question_type === "multiple_choice" && q.options && !group.isMatchingChips && (
                  <MCQInput qn={q.question_number} options={q.options} selected={raw} onAnswer={onAnswer} />
                )}

                {q.question_type === "multiple_choice" && group.isMatchingChips && (
                  <MatchingSlot
                    qn={q.question_number}
                    displayValue={displayValue}
                    isActive={isActive}
                    onActivate={() => onSetActive(isActive ? null : q.question_number)}
                  />
                )}

                {(q.question_type === "fill_blank" || q.question_type === "matching") && (
                  <FillInput qn={q.question_number} selected={raw} onAnswer={onAnswer} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chips for matching groups */}
      {group.isMatchingChips && group.options && (
        <MatchingChipsPanel
          options={group.options}
          activeQuestion={groupActive}
          onSelect={(letter) => {
            if (groupActive !== null) {
              onAnswer(groupActive, letter);
              onSetActive(null);
            }
          }}
        />
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ReadingSection({
  lang: _lang,
  passage,
  answers,
  onAnswer,
  onBack,
  onNext,
  backDisabled = false,
  isLoading = false,
}: Props) {
  const [leftPct, setLeftPct] = useState(52);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  // ── Drag-resize ────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftPct(Math.max(30, Math.min(70, pct)));
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  // ── Scroll to question pill ────────────────────────────────────────────────
  const scrollToQuestion = useCallback((qn: number) => {
    questionRefs.current[qn]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const groups = buildGroups(passage.questions);
  const allNums = passage.questions.map((q) => q.question_number);
  const answeredNums = new Set(allNums.filter((n) => (answers[String(n)] ?? "").trim() !== ""));
  const allAnswered = answeredNums.size === allNums.length && allNums.length > 0;
  const qMin = allNums.length > 0 ? Math.min(...allNums) : 1;
  const qMax = allNums.length > 0 ? Math.max(...allNums) : 1;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Part header bar ── */}
      <div className="shrink-0 bg-[#f4f4f4] border-b border-slate-200 px-6 py-3">
        <p className="font-bold text-slate-900 text-sm">Part {passage.part_number}</p>
        <p className="text-slate-500 text-xs mt-0.5">
          Read the text and answer questions {qMin}–{qMax}.
        </p>
      </div>

      {/* ── Split panels ── */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">

        {/* Left — passage */}
        <div className="overflow-y-auto bg-white" style={{ width: `${leftPct}%` }}>
          <div className="px-8 py-7 max-w-3xl">
            <h2 className="text-base font-bold text-slate-900 mb-5">
              {passage.passage_title}
            </h2>
            <PassageText text={passage.passage_text} title={passage.passage_title} />
          </div>
        </div>

        {/* Drag divider */}
        <div
          className="w-3 shrink-0 flex items-center justify-center bg-slate-100 hover:bg-blue-50 border-x border-slate-200 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-5 w-5 text-slate-400" />
        </div>

        {/* Right — questions (extra bottom padding so arrows don't cover last question) */}
        <div
          className="overflow-y-auto bg-white pb-20"
          style={{ width: `${100 - leftPct - 1}%` }}
        >
          <div className="px-6 py-6">
            {groups.map((group, gi) => (
              <QuestionGroupBlock
                key={gi}
                group={group}
                answers={answers}
                onAnswer={onAnswer}
                questionRefs={questionRefs}
                activeQuestion={activeQuestion}
                onSetActive={setActiveQuestion}
              />
            ))}
          </div>
        </div>

        {/* ── Navigation arrows — absolute at bottom-right of split area ── */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-20">
          <button
            onClick={onBack}
            disabled={backDisabled || isLoading}
            aria-label="Previous"
            className={[
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-colors",
              backDisabled || isLoading
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-700 text-white",
            ].join(" ")}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={onNext}
            disabled={isLoading}
            aria-label="Next"
            className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-md transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* ── Bottom bar: Part label · question pills · checkmark ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-t border-slate-200 bg-white">
        <span className="font-semibold text-slate-700 text-sm shrink-0">
          Part {passage.part_number}
        </span>

        <div className="flex flex-wrap gap-1 flex-1">
          {allNums.map((n) => (
            <button
              key={n}
              onClick={() => scrollToQuestion(n)}
              title={`Question ${n}`}
              className={[
                "w-7 h-7 text-xs font-semibold rounded border transition-colors",
                answeredNums.has(n)
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600",
              ].join(" ")}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Checkmark when all questions answered */}
        <div className="shrink-0 w-6 h-6 flex items-center justify-center">
          {allAnswered ? (
            <Check className="h-5 w-5 text-green-600" strokeWidth={2.5} />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
          )}
        </div>
      </div>
    </div>
  );
}
