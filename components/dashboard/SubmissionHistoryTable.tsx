"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoringMethodBadge } from "@/components/ScoringMethodBadge";
import { bandToColor } from "@/lib/utils";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import type { SubmissionWithFeedback } from "@/types";
import { t, type Lang } from "@/lib/i18n";

interface Props {
  submissions: SubmissionWithFeedback[];
  lang: Lang;
}

const PAGE_SIZE = 10;
type SortField = "submitted_at" | "overall_band";

export function SubmissionHistoryTable({ submissions, lang }: Props) {
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("submitted_at");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...submissions].sort((a, b) => {
    const aVal = sortField === "submitted_at"
      ? new Date(a.submitted_at).getTime()
      : (a.feedback_results?.[0]?.overall_band ?? 0);
    const bVal = sortField === "submitted_at"
      ? new Date(b.submitted_at).getTime()
      : (b.feedback_results?.[0]?.overall_band ?? 0);
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc((v) => !v);
    else { setSortField(field); setSortAsc(false); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortAsc ? <ChevronUp className="h-3 w-3 inline ml-0.5" /> : <ChevronDown className="h-3 w-3 inline ml-0.5" />;
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        {t("dashboard", "noSubmissions", lang)}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left p-3 font-semibold cursor-pointer select-none min-h-[44px]" onClick={() => toggleSort("submitted_at")}>
                <div className="flex items-center gap-1">
                  {t("dashboard", "date", lang)} <SortIcon field="submitted_at" />
                </div>
              </th>
              <th className="text-left p-3 font-semibold">{t("dashboard", "taskType", lang)}</th>
              <th className="text-left p-3 font-semibold hidden md:table-cell">{t("dashboard", "prompt", lang)}</th>
              <th className="text-center p-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort("overall_band")}>
                {t("dashboard", "overallBand", lang)} <SortIcon field="overall_band" />
              </th>
              <th className="text-center p-3 font-semibold hidden sm:table-cell">{t("dashboard", "scoringMethod", lang)}</th>
              <th className="text-center p-3 font-semibold hidden sm:table-cell">{t("dashboard", "language", lang)}</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {paged.map((s) => {
              const fb = s.feedback_results?.[0];
              const band = fb?.overall_band;
              return (
                <tr key={s.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-3 whitespace-nowrap text-muted-foreground text-xs">
                    {new Date(s.submitted_at).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="p-3">
                    <Badge variant={s.task_type === "task2" ? "blue" : "default"} className="text-xs">
                      {s.task_type === "task1" ? "Task 1" : "Task 2"}
                    </Badge>
                  </td>
                  <td className="p-3 hidden md:table-cell max-w-[200px]">
                    <p className="truncate text-xs text-muted-foreground" title={s.prompt_text || ""}>
                      {(s.prompt_text || "").slice(0, 80)}{(s.prompt_text || "").length > 80 ? "…" : ""}
                    </p>
                  </td>
                  <td className="p-3 text-center">
                    {band != null ? (
                      <span className={`font-bold text-base ${bandToColor(band)}`}>{band}</span>
                    ) : "—"}
                  </td>
                  <td className="p-3 text-center hidden sm:table-cell">
                    <ScoringMethodBadge method={s.scoring_method} lang={lang} size="xs" />
                  </td>
                  <td className="p-3 text-center hidden sm:table-cell text-xs text-muted-foreground uppercase">
                    {s.language}
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/dashboard/submission/${s.id}`}>
                      <Button size="sm" variant="ghost" className="h-11 w-11 p-0 flex items-center justify-center">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("dashboard", "prevPage", lang)}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("dashboard", "page", lang)} {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("dashboard", "nextPage", lang)}
          </Button>
        </div>
      )}
    </div>
  );
}
