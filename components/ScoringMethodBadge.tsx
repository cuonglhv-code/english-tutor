"use client";
import { Cpu, Sliders } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { t, type Lang } from "@/lib/i18n";

interface Props {
  method: string | null | undefined;
  lang: Lang;
  size?: "sm" | "xs";
}

export function ScoringMethodBadge({ method, lang, size = "sm" }: Props) {
  const isAI = method === "ai_examiner";
  const tooltipText = isAI
    ? t("tooltip", "aiExaminer", lang)
    : t("tooltip", "ruleBased", lang);

  return (
    <span className="relative group inline-flex">
      <Badge
        variant={isAI ? "blue" : "outline"}
        className={`flex items-center gap-1 cursor-default ${size === "xs" ? "text-[10px] px-1.5 py-0" : "text-xs"}`}
      >
        {isAI
          ? <><Cpu className="h-2.5 w-2.5" /> {t("dashboard", "aiExaminer", lang)}</>
          : <><Sliders className="h-2.5 w-2.5" /> {t("dashboard", "ruleBased", lang)}</>
        }
      </Badge>
      {/* Tooltip */}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-[max-content] max-w-[80vw] sm:max-w-64 rounded-lg bg-popover border border-border shadow-lg p-2.5 text-xs text-popover-foreground leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {tooltipText}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
      </span>
    </span>
  );
}
