"use client";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

interface Props {
  lang: Lang;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  isLoading?: boolean;
  /** Clickable question numbers for within-section pagination (optional) */
  questionNumbers?: number[];
  currentQuestion?: number;
  onQuestionJump?: (n: number) => void;
}

export function SectionNav({
  lang,
  onBack,
  onNext,
  nextLabel,
  backDisabled = false,
  nextDisabled = false,
  isLoading = false,
  questionNumbers,
  currentQuestion,
  onQuestionJump,
}: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
      {/* Back button */}
      <Button
        variant="outline"
        onClick={onBack}
        disabled={backDisabled || isLoading}
        className="rounded-full px-5"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {t("placement", "back", lang)}
      </Button>

      {/* Question number pills (optional) */}
      {questionNumbers && questionNumbers.length > 0 && (
        <div className="flex items-center gap-1">
          {questionNumbers.map((n) => (
            <button
              key={n}
              onClick={() => onQuestionJump?.(n)}
              className={`w-7 h-7 rounded-full text-xs font-medium transition-colors
                ${currentQuestion === n
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Next / Submit button */}
      <Button
        onClick={onNext}
        disabled={nextDisabled || isLoading}
        className="rounded-full px-5"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t("placement", "submitting", lang)}
          </>
        ) : (
          <>
            {nextLabel ?? t("placement", "next", lang)}
            <ChevronRight className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
}
