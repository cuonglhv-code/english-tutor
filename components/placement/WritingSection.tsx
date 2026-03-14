"use client";
import { useCallback, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { t } from "@/lib/i18n";
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
}

export function WritingSection({ lang, task, essay, onChange }: Props) {
  const [leftPct, setLeftPct] = useState(45);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const wordCount =
    essay.trim() === "" ? 0 : essay.trim().split(/\s+/).length;

  const isShort = wordCount > 0 && wordCount < task.min_words;
  const isGood  = wordCount >= task.min_words;

  const wordCountColor = isGood
    ? "text-emerald-600"
    : isShort
    ? "text-amber-500"
    : "text-slate-400";

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.max(25, Math.min(70, pct)));
    },
    []
  );

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

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2 text-sm text-amber-800 shrink-0">
        <span className="font-semibold">
          {task.task_type === "task1" ? "Writing Task 1" : "Writing Task 2"}
        </span>
        <span className="text-amber-400">·</span>
        <span>
          {task.task_type === "task1"
            ? `Min ${task.min_words} words · ${task.recommended_minutes} min`
            : `Min ${task.min_words} words · ${task.recommended_minutes} min`}
        </span>
        <span className="text-amber-400">·</span>
        <span>{t("placement", "writingInstruction", lang)}</span>
      </div>

      {/* Split panels */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left: Task prompt + image */}
        <div
          className="overflow-y-auto p-6 bg-white"
          style={{ width: `${leftPct}%` }}
        >
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            {task.prompt_text}
          </p>
          {task.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={task.image_url}
              alt={task.visual_description ?? "Task visual"}
              className="w-full rounded border border-slate-200 shadow-sm"
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

        {/* Right: Textarea */}
        <div
          className="flex flex-col overflow-hidden bg-white"
          style={{ width: `${100 - leftPct - 1}%` }}
        >
          <div className="flex-1 relative p-4">
            <textarea
              value={essay}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t("placement", "writingPlaceholder", lang)}
              className="w-full h-full resize-none outline-none border border-slate-200 rounded p-3 text-sm text-slate-800 leading-relaxed focus:border-blue-400 transition-colors"
            />
          </div>
          {/* Word counter */}
          <div className="px-5 pb-3 flex items-center justify-end gap-2 shrink-0">
            <span className={`text-xs font-mono font-semibold ${wordCountColor}`}>
              {t("placement", "wordCount", lang)}: {wordCount}
            </span>
            {isShort && (
              <span className="text-xs text-amber-500">
                ({task.min_words - wordCount} more needed)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
