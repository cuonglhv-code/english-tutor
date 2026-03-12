"use client";
import { useCallback, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { t } from "@/lib/i18n";
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
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** "Instruction — Statement" → { instruction, statement } */
function parseQText(text: string) {
  const sep = text.indexOf(" — ");
  if (sep === -1) return { instruction: "", statement: text };
  return { instruction: text.slice(0, sep).trim(), statement: text.slice(sep + 3).trim() };
}

/**
 * Extract a letter + display text from an option string.
 * Supports both "A: Some text" format and plain "Some text" format (index-based lettering).
 */
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

  return (
    <div className="text-[13.5px] text-slate-700 leading-relaxed font-serif">
      {introLines.map((line, i) => (
        <p key={`intro-${i}`} className="mb-4 italic text-slate-500 text-sm">{line}</p>
      ))}

      {hasParagraphLabels &&
        (() => {
          const els: React.ReactNode[] = [];
          for (let i = 1; i < segments.length; i += 2) {
            const label = segments[i];
            const content = (segments[i + 1] ?? "").trim();
            const paras = content.split(/\n{2,}/).filter((p) => p.trim());
            els.push(
              <div key={label} className="flex gap-3 mb-4">
                <span className="font-bold text-slate-900 shrink-0 w-5 pt-0.5 text-sm">{label}</span>
                <div className="flex-1">
                  {paras.map((para, j) => (
                    <p key={j} className={j > 0 ? "mt-3" : ""}>{para.trim()}</p>
                  ))}
                </div>
              </div>
            );
          }
          return els;
        })()}

      {!hasParagraphLabels &&
        introRaw
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter((p) => p && p !== title.trim())
          .map((para, i) => (
            <p key={i} className="mb-4">{para}</p>
          ))}
    </div>
  );
}

// ─── Question Group renderer ──────────────────────────────────────────────────
interface QuestionGroup {
  instruction: string;
  qType: ReadingQuestion["question_type"];
  options: string[] | null;
  items: Array<{ q: ReadingQuestion; statement: string }>;
}

function buildGroups(questions: ReadingQuestion[]): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  for (const q of questions) {
    const { instruction, statement } = parseQText(q.question_text);
    const last = groups[groups.length - 1];
    if (
      last &&
      last.instruction === instruction &&
      last.qType === q.question_type
    ) {
      last.items.push({ q, statement });
    } else {
      groups.push({
        instruction,
        qType: q.question_type,
        options: q.options ?? null,
        items: [{ q, statement }],
      });
    }
  }
  return groups;
}

// ─── Individual question input widgets ───────────────────────────────────────

/** TRUE / FALSE / NOT GIVEN */
function TFNGInput({
  qn, selected, onAnswer, lang,
}: { qn: number; selected: string; onAnswer: (qn: number, v: string) => void; lang: Lang }) {
  const opts = [
    { val: "TRUE", label: t("placement", "trueLabel", lang) },
    { val: "FALSE", label: t("placement", "falseLabel", lang) },
    { val: "NOT GIVEN", label: t("placement", "ngLabel", lang) },
  ];
  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {opts.map(({ val, label }) => (
        <button
          key={val}
          onClick={() => onAnswer(qn, val)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            selected === val
              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
              : "bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Fill blank / matching — underline input */
function FillInput({
  qn, selected, onAnswer,
}: { qn: number; selected: string; onAnswer: (qn: number, v: string) => void }) {
  return (
    <input
      type="text"
      value={selected}
      onChange={(e) => onAnswer(qn, e.target.value)}
      placeholder="Write your answer…"
      className="mt-2 w-full border-b-2 border-slate-300 focus:border-blue-500 outline-none bg-transparent py-1.5 px-1 text-sm text-slate-800 placeholder-slate-400 transition-colors"
    />
  );
}

/** Standard multiple choice — "A: text" format, one button per option */
function MCQInput({
  qn, options, selected, onAnswer,
}: { qn: number; options: string[]; selected: string; onAnswer: (qn: number, v: string) => void }) {
  return (
    <div className="space-y-1.5 mt-2">
      {options.map((opt, idx) => {
        const letter = optionLetter(opt, idx);
        const text = optionText(opt);
        return (
          <button
            key={letter}
            onClick={() => onAnswer(qn, letter)}
            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
              selected === letter
                ? "bg-blue-50 border-blue-500 text-blue-800 font-medium"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <span className="font-bold mr-2 text-slate-500">{letter}.</span>
            {text}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Matching-style MCQ (options without ":") — e.g. paragraph matching, section matching,
 * people matching, timber cut matching.
 * Renders a compact letter-tile row beneath each question statement.
 * The options legend is shown once at the top of the group.
 */
function MatchingLetterInput({
  qn, options, selected, onAnswer,
}: { qn: number; options: string[]; selected: string; onAnswer: (qn: number, v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {options.map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        return (
          <button
            key={letter}
            onClick={() => onAnswer(qn, letter)}
            title={opt}
            className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
              selected === letter
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : "bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}

// ─── Group renderer ───────────────────────────────────────────────────────────
function QuestionGroupBlock({
  group, answers, onAnswer, lang,
}: { group: QuestionGroup; answers: Record<string, string>; onAnswer: (qn: number, v: string) => void; lang: Lang }) {
  const isMatchingOptions =
    group.qType === "multiple_choice" &&
    group.options !== null &&
    group.options.length > 0 &&
    !group.options[0].includes(":");

  const qNums = group.items.map((it) => it.q.question_number);
  const rangeLabel =
    qNums.length === 1
      ? `Question ${qNums[0]}`
      : `Questions ${qNums[0]}–${qNums[qNums.length - 1]}`;

  return (
    <div className="mb-6">
      {/* Group header */}
      <div className="mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {rangeLabel}
        </span>
        {group.instruction && (
          <p className="mt-0.5 text-xs text-slate-600 italic leading-snug">
            {group.instruction}
          </p>
        )}
      </div>

      {/* Options legend for matching-style questions */}
      {isMatchingOptions && group.options && (
        <div className="mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
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

      {/* Questions */}
      <div className="space-y-4">
        {group.items.map(({ q, statement }) => {
          const selected = answers[String(q.question_number)] ?? "";
          return (
            <div key={q.id} className="flex gap-2.5">
              {/* Number badge */}
              <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold mt-0.5">
                {q.question_number}
              </span>

              {/* Statement + input */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 leading-snug">{statement}</p>

                {q.question_type === "true_false_ng" && (
                  <TFNGInput qn={q.question_number} selected={selected} onAnswer={onAnswer} lang={lang} />
                )}

                {q.question_type === "multiple_choice" && q.options && isMatchingOptions && (
                  <MatchingLetterInput qn={q.question_number} options={q.options} selected={selected} onAnswer={onAnswer} />
                )}

                {q.question_type === "multiple_choice" && q.options && !isMatchingOptions && (
                  <MCQInput qn={q.question_number} options={q.options} selected={selected} onAnswer={onAnswer} />
                )}

                {(q.question_type === "fill_blank" || q.question_type === "matching") && (
                  <FillInput qn={q.question_number} selected={selected} onAnswer={onAnswer} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ReadingSection({ lang, passage, answers, onAnswer }: Props) {
  const [leftPct, setLeftPct] = useState(52);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

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

  const groups = buildGroups(passage.questions);
  const allNums = passage.questions.map((q) => q.question_number);
  const qRange =
    allNums.length > 0
      ? `Questions ${Math.min(...allNums)}–${Math.max(...allNums)}`
      : "";

  // Count answered questions for progress indicator
  const answeredCount = passage.questions.filter(
    (q) => (answers[String(q.question_number)] ?? "").trim() !== ""
  ).length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-3 text-sm shrink-0">
        <span className="font-semibold text-blue-800">
          {t("placement", "passageLabel", lang)} {passage.part_number}
        </span>
        <span className="text-blue-300">·</span>
        <span className="text-blue-700 text-xs">{qRange}</span>
        <span className="ml-auto text-xs text-blue-600">
          {answeredCount}/{passage.questions.length} answered
        </span>
      </div>

      {/* Split panels */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left: Passage */}
        <div
          className="overflow-y-auto p-5 bg-white"
          style={{ width: `${leftPct}%` }}
        >
          <h2 className="text-base font-bold text-slate-900 mb-3 font-serif">
            {passage.passage_title}
          </h2>
          <PassageText text={passage.passage_text} title={passage.passage_title} />
        </div>

        {/* Drag divider */}
        <div
          className="w-2.5 flex items-center justify-center bg-slate-100 hover:bg-blue-100 cursor-col-resize shrink-0 border-x border-slate-200 transition-colors"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-4 w-4 text-slate-400" />
        </div>

        {/* Right: Questions */}
        <div
          className="overflow-y-auto p-5 bg-white"
          style={{ width: `${100 - leftPct - 1}%` }}
        >
          {groups.map((group, gi) => (
            <QuestionGroupBlock
              key={gi}
              group={group}
              answers={answers}
              onAnswer={onAnswer}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
