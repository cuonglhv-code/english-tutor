"use client";

import type { ActivityDay } from "@/types/lms";
import type { Lang } from "@/lib/i18n";

interface Props {
  activityLog: ActivityDay[];
  lang: Lang;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKS        = 8;   // columns
const TOTAL_DAYS   = WEEKS * 7; // 56 days shown

const DAY_LABELS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS_VI = ["T2",  "T3",  "T4",  "T5",  "T6",  "T7",  "CN"];

const SKILL_COLORS: Record<string, string> = {
  writing:   "bg-jaxtina-red",
  reading:   "bg-jaxtina-blue",
  listening: "bg-amber-500",
  speaking:  "bg-green-600",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cellBg(count: number): string {
  if (count === 0) return "bg-muted dark:bg-muted/50";
  if (count === 1) return "bg-green-200 dark:bg-green-900/60";
  if (count <= 3)  return "bg-green-400 dark:bg-green-700";
  return              "bg-green-600 dark:bg-green-500";
}

function generateDays(): string[] {
  // Returns an array of TOTAL_DAYS date strings, oldest first, ending today.
  const today = new Date();
  return Array.from({ length: TOTAL_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (TOTAL_DAYS - 1 - i));
    return d.toISOString().split("T")[0];
  });
}

function formatTooltip(dateStr: string, count: number, skills: string[], lang: Lang): string {
  const d = new Date(dateStr + "T00:00:00");
  const label = d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", {
    weekday: "short",
    day:     "numeric",
    month:   "short",
  });
  if (count === 0) {
    return `${label} — ${lang === "vi" ? "Không có bài" : "No activity"}`;
  }
  const skillList = skills.join(", ");
  return `${label} — ${count} ${count === 1 ? "exercise" : "exercises"} (${skillList})`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ActivityHeatmap({ activityLog, lang }: Props) {
  const days = generateDays();

  // Build lookup: date → { count, skills }
  const map = new Map<string, { count: number; skills: string[] }>();
  for (const entry of activityLog) {
    map.set(entry.date, { count: entry.count, skills: entry.skills });
  }

  // Organize into WEEKS columns, each column = 7 days (Mon→Sun)
  // days[0] is the oldest; days[TOTAL_DAYS-1] is today
  const weeks: string[][] = Array.from({ length: WEEKS }, (_, w) =>
    days.slice(w * 7, w * 7 + 7)
  );

  const dayLabels = lang === "vi" ? DAY_LABELS_VI : DAY_LABELS_EN;

  // Month transition labels: show month abbreviation above first week that starts it
  const monthLabels: (string | null)[] = weeks.map((week) => {
    const firstDay = week[0];
    if (!firstDay) return null;
    const d = new Date(firstDay + "T00:00:00");
    // Show only if this week contains the 1st of a month
    const hasFirst = week.some((day) => day && parseInt(day.split("-")[2]) <= 7);
    if (!hasFirst) return null;
    return d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", { month: "short" });
  });

  const totalExercises = activityLog.reduce((sum, d) => sum + d.count, 0);
  const activeDays     = activityLog.filter((d) => d.count > 0).length;

  return (
    <div className="space-y-3">
      {/* Summary line */}
      <p className="text-xs text-muted-foreground">
        {lang === "vi"
          ? `${activeDays} ngày hoạt động · ${totalExercises} bài đã làm trong 8 tuần qua`
          : `${activeDays} active days · ${totalExercises} exercises in the last 8 weeks`}
      </p>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-1.5">
          {/* Day-of-week labels on the left */}
          <div className="flex flex-col gap-1.5 pt-5 shrink-0">
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className="h-5 w-7 flex items-center justify-end pr-1 shrink-0"
              >
                {/* Only show labels for Mon, Wed, Fri, Sun to avoid clutter */}
                {i % 2 === 0 && (
                  <span className="text-[10px] text-muted-foreground leading-none">
                    {label}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Week columns */}
          <div className="flex gap-1.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {/* Month label */}
                <div className="h-4 flex items-center">
                  {monthLabels[wi] && (
                    <span className="text-[10px] text-muted-foreground">
                      {monthLabels[wi]}
                    </span>
                  )}
                </div>
                {/* Day cells */}
                <div className="flex flex-col gap-1.5">
                  {week.map((day, di) => {
                    const entry = map.get(day);
                    const count  = entry?.count  ?? 0;
                    const skills = entry?.skills ?? [];
                    return (
                      <div
                        key={di}
                        className={`w-5 h-5 rounded-[3px] cursor-default transition-opacity hover:opacity-75 shrink-0 ${cellBg(count)}`}
                        title={formatTooltip(day, count, skills, lang)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Intensity legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">
            {lang === "vi" ? "Ít" : "Less"}
          </span>
          {[0, 1, 2, 4].map((c) => (
            <div key={c} className={`w-3.5 h-3.5 rounded-[2px] ${cellBg(c)}`} />
          ))}
          <span className="text-[10px] text-muted-foreground">
            {lang === "vi" ? "Nhiều" : "More"}
          </span>
        </div>

        {/* Skill colour legend */}
        <div className="flex items-center gap-2 ml-2">
          {Object.entries(SKILL_COLORS).map(([skill, color]) => (
            <div key={skill} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-[10px] text-muted-foreground capitalize">{skill}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
