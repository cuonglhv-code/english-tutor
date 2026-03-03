"use client";

import { useState, useTransition } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, Tooltip, ResponsiveContainer,
} from "recharts";
import { Target, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bandToColor } from "@/lib/utils";
import { updateUserGoalsAction } from "@/lib/actions/lms";
import type { UserGoals } from "@/types/lms";
import type { Lang } from "@/lib/i18n";

interface Props {
  goals: UserGoals | null;
  writingCurrentBand?: number;
  lang: Lang;
  onUpdate?: (updated: UserGoals) => void;
}

const SKILLS = [
  { key: "reading",   label: "Reading"   },
  { key: "listening", label: "Listening" },
  { key: "writing",   label: "Writing"   },
  { key: "speaking",  label: "Speaking"  },
] as const;

const BAND_OPTIONS = ["", "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9"];

function safeNum(val: number | null | undefined): number {
  return val != null ? Number(val) : 0;
}

type GoalForm = {
  current_reading: string; current_listening: string;
  current_writing: string; current_speaking: string;
  target_reading:  string; target_listening:  string;
  target_writing:  string; target_speaking:   string;
};

function goalsToForm(g: UserGoals | null): GoalForm {
  const s = (v: number | null | undefined) => v != null ? String(v) : "";
  return {
    current_reading:   s(g?.current_reading),
    current_listening: s(g?.current_listening),
    current_writing:   s(g?.current_writing),
    current_speaking:  s(g?.current_speaking),
    target_reading:    s(g?.target_reading),
    target_listening:  s(g?.target_listening),
    target_writing:    s(g?.target_writing),
    target_speaking:   s(g?.target_speaking),
  };
}

function BandSelect({
  value, onChange, disabled,
}: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded border border-input bg-background px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-jaxtina-red/40 disabled:opacity-50"
    >
      <option value="">—</option>
      {BAND_OPTIONS.filter(Boolean).map((b) => (
        <option key={b} value={b}>{b}</option>
      ))}
    </select>
  );
}

export function GoalTracker({ goals, writingCurrentBand, lang, onUpdate }: Props) {
  const [editing, setEditing] = useState(!goals); // open form immediately if no goals
  const [form, setForm] = useState<GoalForm>(() => goalsToForm(goals));
  const [isPending, startTransition] = useTransition();

  const setField = (key: keyof GoalForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    startTransition(async () => {
      const n = (v: string) => v ? parseFloat(v) : null;
      const result = await updateUserGoalsAction({
        current_overall:   null,
        current_reading:   n(form.current_reading),
        current_listening: n(form.current_listening),
        current_writing:   n(form.current_writing),
        current_speaking:  n(form.current_speaking),
        target_overall:    null,
        target_reading:    n(form.target_reading),
        target_listening:  n(form.target_listening),
        target_writing:    n(form.target_writing),
        target_speaking:   n(form.target_speaking),
      });
      if (result.error) {
        toast.error(lang === "vi" ? `Lỗi: ${result.error}` : `Error: ${result.error}`);
      } else {
        toast.success(lang === "vi" ? "Đã lưu mục tiêu!" : "Goals saved!");
        setEditing(false);
        onUpdate?.({
          id: goals?.id ?? "",
          user_id: goals?.user_id ?? "",
          updated_at: new Date().toISOString(),
          current_overall: null,
          current_reading:   n(form.current_reading),
          current_listening: n(form.current_listening),
          current_writing:   n(form.current_writing),
          current_speaking:  n(form.current_speaking),
          target_overall: null,
          target_reading:    n(form.target_reading),
          target_listening:  n(form.target_listening),
          target_writing:    n(form.target_writing),
          target_speaking:   n(form.target_speaking),
        });
      }
    });
  };

  // ── Edit form ───────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="space-y-4 py-1">
        <p className="text-xs text-muted-foreground">
          {lang === "vi"
            ? "Nhập band hiện tại và mục tiêu cho từng kỹ năng."
            : "Enter your current and target band for each skill."}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-1.5 font-medium pr-3">Skill</th>
                <th className="pb-1.5 font-medium pr-2">
                  {lang === "vi" ? "Hiện tại" : "Current"}
                </th>
                <th className="pb-1.5 font-medium">
                  {lang === "vi" ? "Mục tiêu" : "Target"}
                </th>
              </tr>
            </thead>
            <tbody className="space-y-1">
              {SKILLS.map(({ key, label }) => (
                <tr key={key}>
                  <td className="pr-3 py-1 font-medium">{label}</td>
                  <td className="pr-2 py-1">
                    <BandSelect
                      value={form[`current_${key}` as keyof GoalForm]}
                      onChange={(v) => setField(`current_${key}` as keyof GoalForm, v)}
                      disabled={isPending}
                    />
                  </td>
                  <td className="py-1">
                    <BandSelect
                      value={form[`target_${key}` as keyof GoalForm]}
                      onChange={(v) => setField(`target_${key}` as keyof GoalForm, v)}
                      disabled={isPending}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="h-7 text-xs gap-1" onClick={handleSave} disabled={isPending}>
            <Check className="h-3 w-3" />
            {lang === "vi" ? "Lưu mục tiêu" : "Save goals"}
          </Button>
          {goals && (
            <Button
              size="sm" variant="ghost" className="h-7 text-xs gap-1"
              onClick={() => { setForm(goalsToForm(goals)); setEditing(false); }}
              disabled={isPending}
            >
              <X className="h-3 w-3" />
              {lang === "vi" ? "Hủy" : "Cancel"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Radar chart (goals exist) ────────────────────────────────────────────────
  const radarData = SKILLS.map(({ key, label }) => {
    const current =
      key === "writing" && writingCurrentBand != null
        ? writingCurrentBand
        : safeNum(goals![`current_${key}` as keyof UserGoals] as number | null);
    return {
      skill:   label,
      Current: current,
      Target:  safeNum(goals![`target_${key}` as keyof UserGoals] as number | null),
    };
  });

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
          <PolarRadiusAxis angle={90} domain={[0, 9]} tick={{ fontSize: 10 }} tickCount={4} />
          <Radar
            name={lang === "vi" ? "Hiện tại" : "Current"}
            dataKey="Current" stroke="#1976D2" fill="#1976D2" fillOpacity={0.35}
          />
          <Radar
            name={lang === "vi" ? "Mục tiêu" : "Target"}
            dataKey="Target" stroke="#D32F2F" fill="#D32F2F" fillOpacity={0.15} strokeDasharray="5 3"
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`Band ${v}`, ""]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SKILLS.map(({ key, label }) => {
          const cur =
            key === "writing" && writingCurrentBand != null
              ? writingCurrentBand
              : safeNum(goals![`current_${key}` as keyof UserGoals] as number | null);
          const tgt = safeNum(goals![`target_${key}` as keyof UserGoals] as number | null);
          const gap = tgt > 0 ? +(tgt - cur).toFixed(1) : null;
          return (
            <div key={key} className="flex flex-col items-center rounded-xl border bg-card p-2 gap-0.5">
              <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-black ${cur > 0 ? bandToColor(cur) : "text-muted-foreground"}`}>
                  {cur > 0 ? cur : "—"}
                </span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-xl font-black text-jaxtina-red">{tgt > 0 ? tgt : "—"}</span>
              </div>
              {gap !== null && gap > 0 && (
                <span className="text-[10px] text-orange-500 font-medium">+{gap} {lang === "vi" ? "cần đạt" : "to go"}</span>
              )}
              {gap !== null && gap <= 0 && tgt > 0 && (
                <span className="text-[10px] text-green-600 font-medium">{lang === "vi" ? "Đạt rồi! ✓" : "Achieved ✓"}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground"
          onClick={() => { setForm(goalsToForm(goals)); setEditing(true); }}
        >
          <Pencil className="h-3 w-3" /> {lang === "vi" ? "Chỉnh sửa mục tiêu" : "Edit goals"}
        </Button>
      </div>
    </div>
  );
}
