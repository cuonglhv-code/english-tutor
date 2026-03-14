"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2, Loader2, BookOpen, Target,
  ChevronDown, ChevronUp, ExternalLink, FileText,
  AlertCircle, TrendingUp,
} from "lucide-react";
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

// ─── Writing summary type (passed from server) ────────────────────────────────
export interface WritingSummary {
  overallBand: number;
  taskAchievementBand: number;
  coherenceCohesionBand: number;
  lexicalResourceBand: number;
  grammarBand: number;
  wordCount: number;
  priorityActions: string[];
  overallComment: string;
  strengths: string;
  improvements: string;
  feedbackJson: Record<string, unknown>;
}

interface Props {
  lang: Lang;
  testId: string;
  entryBandRange: EntryBandRange;
  readingBand: number;
  listeningBand: number;
  writingBand: number;
  overallAverage: number;
  writingSummary: WritingSummary | null;
}

function bandColorClass(b: number) {
  if (b >= 7) return "text-green-700 bg-green-50 border-green-200";
  if (b >= 5.5) return "text-blue-700 bg-blue-50 border-blue-200";
  if (b >= 4) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

// ─── Writing feedback panel (collapsible) ────────────────────────────────────
function WritingFeedbackPanel({ ws }: { ws: WritingSummary }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-amber-200 rounded-xl overflow-hidden bg-amber-50/30">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-sm font-semibold text-slate-800">
            Writing Feedback Summary
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${bandColorClass(ws.overallBand)}`}>
            Band {ws.overallBand.toFixed(1)}
          </span>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Criterion mini-grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Task Achievement", band: ws.taskAchievementBand },
              { label: "Coherence & Cohesion", band: ws.coherenceCohesionBand },
              { label: "Lexical Resource", band: ws.lexicalResourceBand },
              { label: "Grammar & Accuracy", band: ws.grammarBand },
            ].map(({ label, band }) => (
              <div key={label} className={`p-2.5 rounded-lg border text-center ${bandColorClass(band)}`}>
                <div className="text-lg font-black">{band.toFixed(1)}</div>
                <div className="text-[10px] font-medium leading-tight">{label}</div>
              </div>
            ))}
          </div>

          {ws.strengths && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-[11px] font-bold text-green-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">{ws.strengths}</p>
            </div>
          )}

          {ws.improvements && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-[11px] font-bold text-red-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Areas to Improve
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">{ws.improvements}</p>
            </div>
          )}

          {ws.priorityActions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Priority Actions
              </p>
              <ol className="space-y-1">
                {ws.priorityActions.map((action, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-700">
                    <span className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-blue-200 text-blue-800 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <p className="text-[11px] text-slate-400 text-right">{ws.wordCount} words written</p>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function StudyPlanSuggestion({
  lang,
  testId,
  entryBandRange,
  readingBand,
  listeningBand,
  writingBand,
  overallAverage,
  writingSummary,
}: Props) {
  const [selectedEntry, setSelectedEntry] = useState<EntryBandRange>(entryBandRange);
  const [selectedGoal, setSelectedGoal] = useState<GoalBand | "">("");
  const [saving, setSaving] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);

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
          readingBand,
          listeningBand,
          writingBand,
          overallAverage,
          writingFeedbackJson: writingSummary?.feedbackJson ?? null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const json = await res.json();
      setSavedPlanId(json.id);
      toast.success(t("placement", "planSaved", lang));
    } catch {
      toast.error(t("placement", "planError", lang));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Writing feedback panel */}
      {writingSummary && <WritingFeedbackPanel ws={writingSummary} />}

      {/* Selectors row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t("placement", "yourLevel", lang)}
          </label>
          <select
            value={selectedEntry}
            onChange={(e) => {
              setSelectedEntry(e.target.value as EntryBandRange);
              setSelectedGoal("");
              setSavedPlanId(null);
            }}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ENTRY_BAND_RANGES.map((r) => (
              <option key={r} value={r}>{ENTRY_BAND_RANGE_LABELS[r]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t("placement", "yourGoal", lang)}
          </label>
          <select
            value={selectedGoal}
            onChange={(e) => {
              setSelectedGoal(e.target.value as GoalBand);
              setSavedPlanId(null);
            }}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("placement", "selectGoal", lang)}</option>
            {GOAL_BANDS.map((g) => (
              <option key={g} value={g} disabled={!availableGoals.includes(g)}>{g}</option>
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
                <div className="absolute -left-[1.35rem] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-800">{stage.name}</span>
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

          {/* Save / View buttons */}
          <div className="flex flex-wrap gap-3 items-center">
            {!savedPlanId ? (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("placement", "planSaving", lang)}
                  </>
                ) : (
                  t("placement", "savePlan", lang)
                )}
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("placement", "planSaved", lang)}
                </div>
                <Button asChild variant="outline">
                  <Link href={`/placement/study-plan/${savedPlanId}`} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View &amp; Download PDF
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : selectedGoal && !plan ? (
        <p className="text-sm text-slate-500 italic">
          {t("placement", "noGoalAvailable", lang)}
        </p>
      ) : null}
    </div>
  );
}
