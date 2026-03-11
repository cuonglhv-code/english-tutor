"use client";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import {
  STUDY_PLAN_CONFIG,
  ENTRY_BAND_RANGES,
  GOAL_BANDS,
  getAvailableGoals,
  type EntryBandRange,
  type GoalBand,
} from "@/lib/studyPlanConfig";
import { ENTRY_BAND_RANGE_LABELS } from "@/lib/placementBands";

interface Props {
  lang: Lang;
  testId: string;
  entryBandRange: EntryBandRange;
}

export function StudyPlanSuggestion({ lang, testId, entryBandRange }: Props) {
  const [selectedEntry, setSelectedEntry] = useState<EntryBandRange>(entryBandRange);
  const [selectedGoal, setSelectedGoal] = useState<GoalBand | "">("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const availableGoals = getAvailableGoals(selectedEntry);
  const plan = selectedGoal
    ? STUDY_PLAN_CONFIG[selectedEntry]?.[selectedGoal as GoalBand]
    : null;

  const handleSave = async () => {
    if (!plan || !selectedGoal) return;
    setSaving(true);
    try {
      const res = await fetch("/api/placement/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          entryBandRange: selectedEntry,
          goalBand: selectedGoal,
          planName: plan.planName,
          stagesJson: plan.stages,
          totalMonths: plan.totalMonths,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      toast.success(t("placement", "planSaved", lang));
    } catch {
      toast.error(t("placement", "planError", lang));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selectors row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Entry band */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t("placement", "yourLevel", lang)}
          </label>
          <select
            value={selectedEntry}
            onChange={(e) => {
              setSelectedEntry(e.target.value as EntryBandRange);
              setSelectedGoal("");
              setSaved(false);
            }}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ENTRY_BAND_RANGES.map((r) => (
              <option key={r} value={r}>
                {ENTRY_BAND_RANGE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        {/* Goal band */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t("placement", "yourGoal", lang)}
          </label>
          <select
            value={selectedGoal}
            onChange={(e) => {
              setSelectedGoal(e.target.value as GoalBand);
              setSaved(false);
            }}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("placement", "selectGoal", lang)}</option>
            {GOAL_BANDS.map((g) => (
              <option key={g} value={g} disabled={!availableGoals.includes(g)}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Plan display */}
      {plan ? (
        <div className="space-y-4">
          {/* Plan header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                {plan.planName}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {t("placement", "totalDuration", lang)}:{" "}
                <strong>{plan.totalMonths} {t("placement", "months", lang)}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-full">
              <Target className="h-4 w-4" />
              {selectedGoal}
            </div>
          </div>

          {/* Stages timeline */}
          <ol className="relative border-l-2 border-blue-200 pl-5 space-y-5">
            {plan.stages.map((stage, i) => (
              <li key={i} className="relative">
                {/* Dot */}
                <div className="absolute -left-[1.35rem] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {stage.name}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                      {stage.months} {t("placement", "months", lang)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    {t("placement", "stageFocus", lang)}:
                  </p>
                  <ul className="space-y-0.5">
                    {stage.focus.map((f, j) => (
                      <li key={j} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-blue-400 mt-0.5">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={saving || saved}
            className="w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("placement", "planSaving", lang)}
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                {t("placement", "planSaved", lang)}
              </>
            ) : (
              t("placement", "savePlan", lang)
            )}
          </Button>
        </div>
      ) : selectedGoal && !plan ? (
        <p className="text-sm text-slate-500 italic">
          {t("placement", "noGoalAvailable", lang)}
        </p>
      ) : null}
    </div>
  );
}
