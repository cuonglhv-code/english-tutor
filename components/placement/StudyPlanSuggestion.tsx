"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2, Loader2, BookOpen,
  ChevronDown, ChevronUp, ExternalLink, FileText,
  AlertCircle, TrendingUp, ArrowRight, Clock, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import {
  getCoursesFromEntry,
  coursesToPlan,
  type EntryBandRange,
  type Course,
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

// ─── Course card ──────────────────────────────────────────────────────────────
function CourseCard({
  course,
  index,
  isFirst,
}: {
  course: Course;
  index: number;
  isFirst: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl border p-5 transition-shadow ${
        isFirst
          ? "border-blue-400 bg-blue-50/40 shadow-md shadow-blue-100"
          : "border-slate-200 bg-white hover:shadow-sm"
      }`}
    >
      {/* Step number + "Start here" badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
              isFirst
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {index + 1}
          </div>
          <h3 className="text-sm font-bold text-slate-900">{course.name}</h3>
        </div>

        {isFirst && (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-blue-600 text-white">
            Bắt đầu ngay
          </span>
        )}
      </div>

      {/* Band + duration pills */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
          {course.inputBandLabel}
          <ArrowRight className="h-3 w-3" />
          <span className="text-blue-700">{course.outputBandLabel}</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          <Clock className="h-3 w-3" />
          {course.months} tháng
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          <Users className="h-3 w-3" />
          {course.sessions} buổi
        </span>
      </div>

      {/* Vietnamese description */}
      <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
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
  const [saving, setSaving] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);

  // Derive the recommended pathway automatically from entry band
  const courses = getCoursesFromEntry(entryBandRange);
  const plan = coursesToPlan(courses);
  const goalBand = courses.at(-1)?.outputBandLabel ?? "7.0+";

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/placement/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          entryBandRange,
          goalBand,
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

      {/* Pathway header */}
      <div className="flex items-center gap-3 py-1">
        <BookOpen className="h-5 w-5 text-blue-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Lộ trình học đề xuất
          </p>
          <p className="text-xs text-slate-500">
            Trình độ hiện tại:{" "}
            <span className="font-medium text-slate-700">
              {ENTRY_BAND_RANGE_LABELS[entryBandRange]}
            </span>
            {" · "}
            {plan.totalMonths} tháng · {plan.stages.reduce((s, st) => s + (st.sessions ?? 0), 0)} buổi
          </p>
        </div>
      </div>

      {/* Course cards */}
      <div className="space-y-3">
        {courses.map((course, i) => (
          <CourseCard
            key={course.key}
            course={course}
            index={i}
            isFirst={i === 0}
          />
        ))}
      </div>

      {/* Save / View buttons */}
      <div className="flex flex-wrap gap-3 items-center pt-1">
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
  );
}
