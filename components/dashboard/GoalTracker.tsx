"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Target } from "lucide-react";
import { bandToColor } from "@/lib/utils";
import type { UserGoals } from "@/types/lms";
import type { Lang } from "@/lib/i18n";

interface Props {
  goals: UserGoals | null;
  writingCurrentBand?: number; // derived from actual submissions (user_progress)
  lang: Lang;
}

const SKILLS = [
  { key: "reading",   label: "Reading"   },
  { key: "listening", label: "Listening" },
  { key: "writing",   label: "Writing"   },
  { key: "speaking",  label: "Speaking"  },
] as const;

function safeNum(val: number | null | undefined): number {
  return val != null ? Number(val) : 0;
}

export function GoalTracker({ goals, writingCurrentBand, lang }: Props) {
  if (!goals) {
    return (
      <div className="flex flex-col items-center justify-center h-52 gap-3 text-center">
        <Target className="h-10 w-10 text-muted-foreground opacity-40" />
        <p className="text-sm text-muted-foreground max-w-[220px]">
          {lang === "vi"
            ? "Chưa có mục tiêu. Thêm dữ liệu vào bảng user_goals trong Supabase để bắt đầu."
            : "No goals yet. Add a row to user_goals in Supabase to get started."}
        </p>
      </div>
    );
  }

  // Build radar data; use writingCurrentBand (from submissions) as the live writing figure
  const radarData = SKILLS.map(({ key, label }) => {
    const current =
      key === "writing" && writingCurrentBand != null
        ? writingCurrentBand
        : safeNum(goals[`current_${key}` as keyof UserGoals] as number | null);

    return {
      skill:   label,
      Current: current,
      Target:  safeNum(goals[`target_${key}` as keyof UserGoals] as number | null),
    };
  });

  return (
    <div className="space-y-4">
      {/* Radar chart */}
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 9]}
            tick={{ fontSize: 10 }}
            tickCount={4}
          />
          <Radar
            name={lang === "vi" ? "Hiện tại" : "Current"}
            dataKey="Current"
            stroke="#1976D2"
            fill="#1976D2"
            fillOpacity={0.35}
          />
          <Radar
            name={lang === "vi" ? "Mục tiêu" : "Target"}
            dataKey="Target"
            stroke="#D32F2F"
            fill="#D32F2F"
            fillOpacity={0.15}
            strokeDasharray="5 3"
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value: number | undefined) => [`Band ${value ?? "—"}`, ""]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Per-skill stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SKILLS.map(({ key, label }) => {
          const cur =
            key === "writing" && writingCurrentBand != null
              ? writingCurrentBand
              : safeNum(goals[`current_${key}` as keyof UserGoals] as number | null);
          const tgt = safeNum(goals[`target_${key}` as keyof UserGoals] as number | null);
          const gap = tgt > 0 ? +(tgt - cur).toFixed(1) : null;

          return (
            <div
              key={key}
              className="flex flex-col items-center rounded-xl border bg-card p-2 gap-0.5"
            >
              <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-black ${cur > 0 ? bandToColor(cur) : "text-muted-foreground"}`}>
                  {cur > 0 ? cur : "—"}
                </span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-xl font-black text-jaxtina-red">
                  {tgt > 0 ? tgt : "—"}
                </span>
              </div>
              {gap !== null && gap > 0 && (
                <span className="text-[10px] text-orange-500 font-medium">
                  +{gap} {lang === "vi" ? "cần đạt" : "to go"}
                </span>
              )}
              {gap !== null && gap <= 0 && tgt > 0 && (
                <span className="text-[10px] text-green-600 font-medium">
                  {lang === "vi" ? "Đạt rồi! ✓" : "Achieved ✓"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
