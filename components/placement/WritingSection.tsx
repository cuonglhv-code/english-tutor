"use client";
import { useCallback, useRef, useState } from "react";
import { GripVertical, Check, Loader2 } from "lucide-react";
import type { Lang } from "@/lib/i18n";

export interface WritingTask {
  id: string;
  task_type: "task1" | "task2";
  prompt_text: string;
  image_url?: string | null;
  visual_description?: string | null;
  min_words: number;
  recommended_minutes: number;
}

interface Props {
  lang: Lang;
  task: WritingTask;
  essay: string;
  onChange: (text: string) => void;
  onBack?: () => void;
  onNext: () => void;
  backDisabled?: boolean;
  isLoading?: boolean;
  isLastTask?: boolean;   // true on Task 2 → shows "Submit" instead of "Next"
  taskIndex: number;      // 0 = Task 1, 1 = Task 2
  task1MinWords?: number; // min words required for task 1 badge
  task1WordCount?: number;// current word count of task 1 essay (passed from parent)
  task2WordCount?: number;// current word count of task 2 essay (passed from parent)
}

export function WritingSection({
  lang,
  task,
  essay,
  onChange,
  onBack,
  onNext,
  backDisabled = false,
  isLoading = false,
  isLastTask = false,
  taskIndex,
  task1MinWords = 150,
  task1WordCount = 0,
  task2WordCount = 0,
}: Props) {
  // ── Split-pane drag ────────────────────────────────────────────────────────
  const [leftPct, setLeftPct] = useState(48);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftPct(Math.max(28, Math.min(68, pct)));
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

  // ── Word count ─────────────────────────────────────────────────────────────
  const wordCount =
    essay.trim() === "" ? 0 : essay.trim().split(/\s+/).length;

  const isGood  = wordCount >= task.min_words;
  const isShort = wordCount > 0 && !isGood;

  const wordCountColor = isGood
    ? "text-emerald-600"
    : isShort
    ? "text-amber-500"
    : "text-slate-400";

  // ── Bottom bar task completion ─────────────────────────────────────────────
  const task1Done = task1WordCount >= task1MinWords;
  const task2Done = task2WordCount >= 250; // Task 2 min is always 250

  const partLabel = taskIndex === 0 ? "Part 1" : "Part 2";
  const instruction =
    taskIndex === 0
      ? `You should spend about ${task.recommended_minutes} minutes on this task. Write at least ${task.min_words} words.`
      : `You should spend about ${task.recommended_minutes} minutes on this task. Write at least ${task.min_words} words.`;

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">

      {/* ── Gray part header (matches Listening/Reading style) ────────────── */}
      <div className="bg-slate-600 text-white px-5 py-3 flex items-center gap-3 shrink-0">
        <span className="font-bold text-sm tracking-wide">{partLabel}</span>
        <span className="text-slate-300">·</span>
        <span className="text-sm text-slate-200">{instruction}</span>
      </div>

      {/* ── Split panels ──────────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">

        {/* Left: task prompt + image */}
        <div
          className="overflow-y-auto p-6 bg-white border-r border-slate-200 select-text"
          style={{ width: `${leftPct}%` }}
        >
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
            {task.prompt_text}
          </p>

          {task.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={task.image_url}
              alt={task.visual_description ?? "Task visual"}
              className="w-full rounded border border-slate-200 shadow-sm mt-2"
            />
          )}

          {!task.image_url && task.visual_description && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500 italic">
              {task.visual_description}
            </div>
          )}
        </div>

        {/* Drag divider */}
        <div
          className="w-3 flex items-center justify-center bg-slate-100 hover:bg-slate-200 cursor-col-resize shrink-0 border-x border-slate-200 transition-colors"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-5 w-5 text-slate-400" />
        </div>

        {/* Right: textarea + word count */}
        <div
          className="flex flex-col overflow-hidden bg-white select-text"
          style={{ width: `${100 - leftPct - 1}%` }}
        >
          {/* Textarea fills available space */}
          <div className="flex-1 p-4 pb-1 overflow-hidden">
            <textarea
              value={essay}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Type your answer here…"
              className="w-full h-full resize-none outline-none border border-slate-300 rounded p-3 text-sm text-slate-800 leading-relaxed focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Word counter row */}
          <div className="px-5 pb-2 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-400">
              {isShort && (
                <span className="text-amber-500">
                  {task.min_words - wordCount} more word{task.min_words - wordCount !== 1 ? "s" : ""} needed
                </span>
              )}
            </span>
            <span className={`text-xs font-mono font-semibold ${wordCountColor}`}>
              Words: {wordCount}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom navigation bar ─────────────────────────────────────────── */}
      <div className="h-12 bg-slate-800 flex items-center justify-between px-4 shrink-0">

        {/* Left: Part pills */}
        <div className="flex items-center gap-2">
          {/* Part 1 pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              taskIndex === 0
                ? "bg-white text-slate-800"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            <span>Part 1</span>
            {task1Done && (
              <Check className="h-3 w-3 text-emerald-500 shrink-0" strokeWidth={3} />
            )}
          </div>

          {/* Part 2 pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              taskIndex === 1
                ? "bg-white text-slate-800"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            <span>Part 2</span>
            {task2Done && (
              <Check className="h-3 w-3 text-emerald-500 shrink-0" strokeWidth={3} />
            )}
          </div>
        </div>

        {/* Right: ← → nav arrows */}
        <div className="flex items-center gap-2">
          {/* Back arrow */}
          <button
            onClick={!backDisabled && onBack ? onBack : undefined}
            disabled={backDisabled || !onBack || isLoading}
            className={`w-9 h-9 flex items-center justify-center rounded text-lg font-bold transition-colors
              ${backDisabled || !onBack
                ? "bg-slate-600 text-slate-500 cursor-not-allowed"
                : "bg-white text-slate-800 hover:bg-slate-100 cursor-pointer"
              }`}
            aria-label="Previous task"
          >
            ←
          </button>

          {/* Next / Submit arrow */}
          <button
            onClick={isLoading ? undefined : onNext}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 h-9 rounded text-sm font-bold transition-colors
              ${isLoading
                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                : isLastTask
                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                : "bg-white text-slate-800 hover:bg-slate-100 cursor-pointer"
              }`}
            aria-label={isLastTask ? "Submit test" : "Next task"}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting…</span>
              </>
            ) : isLastTask ? (
              <>Submit ✓</>
            ) : (
              <>→</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
