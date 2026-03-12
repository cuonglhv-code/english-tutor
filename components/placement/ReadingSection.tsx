"use client";
import { useCallback, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

/**
 * Renders passage text, converting [A], [B] … markers into bold paragraph labels.
 * The `title` prop is used to skip any duplicate title line at the top of the text.
 */
function PassageText({ text, title }: { text: string; title: string }) {
  // Split on [A], [B], … markers — keeps the letter as a capture group
  const segments = text.split(/\[([A-Z])\]/);

  // segments = [beforeFirstLabel, label1, content1, label2, content2, …]
  const hasParagraphLabels = segments.length > 1;

  // Intro lines: everything before the first labelled paragraph (or all text if no labels)
  const introRaw = segments[0];
  const introLines = introRaw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l && l !== title.trim()); // drop any line that just repeats the title

  return (
    <div className="text-sm text-slate-700 leading-relaxed font-serif">
      {/* Subtitle / lead-in lines before first labelled paragraph */}
      {introLines.map((line, i) => (
        <p key={`intro-${i}`} className="mb-4 italic text-slate-500">
          {line}
        </p>
      ))}

      {/* Labelled paragraphs [A], [B], … */}
      {hasParagraphLabels &&
        (() => {
          const els: React.ReactNode[] = [];
          for (let i = 1; i < segments.length; i += 2) {
            const label = segments[i];
            const content = (segments[i + 1] ?? "").trim();
            // A section may contain multiple paragraphs separated by blank lines
            const paras = content.split(/\n{2,}/).filter((p) => p.trim());
            els.push(
              <div key={label} className="flex gap-4 mb-4">
                <span className="font-bold text-slate-900 shrink-0 w-4 pt-0.5">
                  {label}
                </span>
                <div className="flex-1">
                  {paras.map((para, j) => (
                    <p key={j} className={j > 0 ? "mt-3" : ""}>
                      {para.trim()}
                    </p>
                  ))}
                </div>
              </div>
            );
          }
          return els;
        })()}

      {/* Fallback: no labels — render as plain paragraphs */}
      {!hasParagraphLabels &&
        introRaw
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter((p) => p && p !== title.trim())
          .map((para, i) => (
            <p key={i} className="mb-3">
              {para}
            </p>
          ))}
    </div>
  );
}

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
  answers: Record<string, string>;
  onAnswer: (questionNumber: number, value: string) => void;
}

export function ReadingSection({ lang, passage, answers, onAnswer }: Props) {
  const [leftPct, setLeftPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftPct(Math.max(25, Math.min(70, pct)));
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  // Attach global listeners
  const attachListeners = useCallback(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  const detachListeners = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2 text-sm text-blue-800 shrink-0">
        <span className="font-semibold">
          {t("placement", "partLabel", lang)} {passage.part_number}
        </span>
        <span className="text-blue-400">·</span>
        <span>{t("placement", "readingInstruction", lang)}</span>
      </div>

      {/* Split panels */}
      <div
        ref={containerRef}
        className="flex flex-1 overflow-hidden"
        onMouseMove={(e) => isDragging.current && handleMouseMove(e.nativeEvent)}
        onMouseUp={() => isDragging.current && handleMouseUp()}
      >
        {/* Left: Passage */}
        <div
          className="overflow-y-auto p-6 bg-white"
          style={{ width: `${leftPct}%` }}
        >
          <h2 className="text-base font-semibold text-slate-800 mb-3 font-serif">
            {passage.passage_title}
          </h2>
          <PassageText text={passage.passage_text} title={passage.passage_title} />
        </div>

        {/* Drag divider */}
        <div
          className="w-3 flex items-center justify-center bg-slate-100 hover:bg-slate-200 cursor-col-resize shrink-0 border-x border-slate-200 transition-colors"
          onMouseDown={(e) => { handleMouseDown(e); attachListeners(); }}
          onMouseUp={() => detachListeners()}
        >
          <GripVertical className="h-5 w-5 text-slate-400" />
        </div>

        {/* Right: Questions */}
        <div
          className="overflow-y-auto p-5 bg-white"
          style={{ width: `${100 - leftPct - 1}%` }}
        >
          <div className="space-y-5">
            {passage.questions.map((q) => {
              const answerKey = String(q.question_number);
              const selected = answers[answerKey] ?? "";

              return (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mr-2">
                      {q.question_number}
                    </span>
                    {q.question_text}
                  </p>

                  {/* TRUE / FALSE / NOT GIVEN */}
                  {q.question_type === "true_false_ng" && (
                    <div className="space-y-1.5">
                      {(["TRUE", "FALSE", "NOT GIVEN"] as const).map((opt) => {
                        const label = opt === "TRUE"
                          ? t("placement", "trueLabel", lang)
                          : opt === "FALSE"
                          ? t("placement", "falseLabel", lang)
                          : t("placement", "ngLabel", lang);
                        const isSelected = selected === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => onAnswer(q.question_number, opt)}
                            className={`w-full text-left px-3 py-2 rounded border text-sm transition-colors
                              ${isSelected
                                ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                              }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiple choice */}
                  {q.question_type === "multiple_choice" && q.options && (
                    <div className="space-y-1.5">
                      {q.options.map((opt) => {
                        // Options format: "A: option text"
                        const letter = opt.split(":")[0].trim();
                        const text = opt.substring(opt.indexOf(":") + 1).trim();
                        const isSelected = selected === letter;
                        return (
                          <button
                            key={letter}
                            onClick={() => onAnswer(q.question_number, letter)}
                            className={`w-full text-left px-3 py-2 rounded border text-sm transition-colors
                              ${isSelected
                                ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                              }`}
                          >
                            <span className="font-semibold mr-2">{letter}</span>
                            {text}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Fill blank */}
                  {(q.question_type === "fill_blank" ||
                    q.question_type === "matching") && (
                    <input
                      type="text"
                      value={selected}
                      onChange={(e) => onAnswer(q.question_number, e.target.value)}
                      placeholder="Your answer…"
                      className="w-full border-b-2 border-slate-300 focus:border-blue-500 outline-none bg-transparent py-1 px-0.5 text-sm text-slate-800 transition-colors"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
