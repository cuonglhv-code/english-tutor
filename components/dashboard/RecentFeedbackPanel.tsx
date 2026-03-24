"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { bandToColor } from "@/lib/utils";
import type { SubmissionWithFeedback } from "@/types";
import { t, type Lang } from "@/lib/i18n";

interface Props {
  submissions: SubmissionWithFeedback[];
  lang: Lang;
}

export function RecentFeedbackPanel({ submissions, lang }: Props) {
  const recent = submissions
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-3">
      {recent.map((s) => {
        const fb = s.feedback_results[0];
        const json = fb?.feedback_json as Record<string, unknown> | undefined;
        const overallComment =
          (json?.overall_comment as string | undefined) ??
          (json?.ta as Record<string, unknown> | undefined)?.wellDone as string | undefined ??
          "";

        return (
          <div key={s.id} className="rounded-xl border p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={s.task_type === "task2" ? "blue" : "default"} className="text-xs">
                  {s.task_type === "task1" ? "Task 1" : "Task 2"}
                </Badge>
                {fb && (
                  <span className={`font-bold text-lg ${bandToColor(fb.overall_band)}`}>
                    Band {fb.overall_band}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(s.submitted_at).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </span>
              </div>
              <Link
                href={`/dashboard/submission/${s.id}`}
                className="text-sm font-bold text-jaxtina-blue hover:underline shrink-0 min-h-[44px] flex items-center px-2"
              >
                {t("dashboard", "viewFull", lang)}
              </Link>
            </div>
            {overallComment && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{overallComment}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
