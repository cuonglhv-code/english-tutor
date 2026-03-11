"use client";
import { Clock } from "lucide-react";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

interface Props {
  remaining: number; // seconds
  lang: Lang;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function CountdownTimer({ remaining, lang }: Props) {
  const isWarning = remaining <= 300 && remaining > 60;  // ≤5 min
  const isDanger  = remaining <= 60;                     // ≤1 min

  const colorClass = isDanger
    ? "text-red-600 animate-pulse"
    : isWarning
    ? "text-orange-500"
    : "text-slate-700";

  const bgClass = isDanger
    ? "bg-red-50 border-red-200"
    : isWarning
    ? "bg-orange-50 border-orange-200"
    : "bg-white border-slate-200";

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-mono font-semibold shadow-sm ${bgClass}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <Clock className={`h-4 w-4 ${colorClass}`} />
      <span className="sr-only">{t("placement", "timeLeft", lang)}:</span>
      <span className={colorClass}>{formatTime(remaining)}</span>
    </div>
  );
}
