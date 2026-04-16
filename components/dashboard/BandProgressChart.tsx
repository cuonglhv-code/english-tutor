"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import type { SubmissionWithFeedback } from "@/types";
import type { Lang } from "@/lib/i18n";

interface Props {
  submissions: SubmissionWithFeedback[];
  lang: Lang;
  targetBand?: number;
}

export function BandProgressChart({ submissions, lang, targetBand }: Props) {
  const data = [...submissions]
    .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
    .map((s) => {
      const fb = s.feedback_results?.[0];
      return {
        date: new Date(s.submitted_at).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", { day: "2-digit", month: "short" }),
        Overall: fb?.overall_band ?? null,
        TA: fb?.task_achievement_band ?? null,
        CC: fb?.coherence_cohesion_band ?? null,
        LR: fb?.lexical_resource_band ?? null,
        GRA: fb?.grammatical_range_accuracy_band ?? null,
      };
    });

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        {lang === "vi" ? "Cần ít nhất 2 bài để hiển thị biểu đồ." : "At least 2 submissions needed to show the chart."}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 9]} ticks={[1,2,3,4,5,6,7,8,9]} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value) => [value, ""]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {targetBand && (
          <ReferenceLine 
            y={targetBand} 
            label={{ value: `Target: ${targetBand}`, position: 'insideTopLeft', fill: '#8884d8', fontSize: 12 }} 
            stroke="#8884d8" 
            strokeDasharray="3 3" 
          />
        )}
        <Line type="monotone" dataKey="Overall" stroke="#D32F2F" strokeWidth={2.5} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="TA" stroke="#1976D2" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="CC" stroke="#388E3C" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="LR" stroke="#F57C00" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="GRA" stroke="#7B1FA2" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}
