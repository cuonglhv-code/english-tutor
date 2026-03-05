"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Loader2, Cpu, Sliders, Target,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackAccordion } from "@/components/results/FeedbackAccordion";
import { createBrowserClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";
import { getDescriptor, getNextDescriptor } from "@/lib/descriptors";
import type { SubmissionWithFeedback, AnalysisResult, CriterionFeedback } from "@/types";

// ─── Reconstruct a full AnalysisResult from stored feedback_json ──────────────
function reconstructResult(
  submission: SubmissionWithFeedback
): AnalysisResult | null {
  const fb = submission.feedback_results[0];
  if (!fb) return null;

  const json = fb.feedback_json as Record<string, unknown>;

  // If we stored the full AnalysisResult, use it directly (new submissions)
  if (json?._full_result) {
    return json._full_result as AnalysisResult;
  }

  // Legacy fallback: reconstruct from raw fields
  const taskType = submission.task_type === "task1" ? "academic" : "general";
  const taskNumber = submission.task_type === "task1" ? "1" : "2";
  const taLabel = taskNumber === "1" ? "Task Achievement" : "Task Response";

  function makeCriterion(
    criterion: "ta" | "cc" | "lr" | "gra",
    band: number | null,
    label: string,
    rawEnKey: string,
    rawViKey: string
  ): CriterionFeedback {
    const safeband = band ?? 5;
    const enData = json?.[rawEnKey] as Record<string, string> | undefined;
    const viData = json?.[rawViKey] as Record<string, string> | undefined;
    return {
      score: safeband,
      label,
      wellDone: enData?.strengths ?? enData?.wellDone ?? "",
      improvement: enData?.improvements ?? enData?.improvement ?? "",
      descriptorCurrent: getDescriptor(
        criterion,
        Math.floor(safeband),
        taskType as "academic" | "general",
        taskNumber as "1" | "2"
      ),
      descriptorNext: getNextDescriptor(
        criterion,
        safeband,
        taskType as "academic" | "general",
        taskNumber as "1" | "2"
      ),
      bandJustification: enData?.band_justification ?? enData?.bandJustification,
      wellDone_vi: viData?.strengths,
      improvement_vi: viData?.improvements,
      bandJustification_vi: viData?.band_justification,
    };
  }

  const bands = {
    ta: fb.task_achievement_band ?? 5,
    cc: fb.coherence_cohesion_band ?? 5,
    lr: fb.lexical_resource_band ?? 5,
    gra: fb.grammatical_range_accuracy_band ?? 5,
    overall: fb.overall_band ?? 5,
  };

  return {
    bands,
    feedback: {
      ta: makeCriterion("ta", bands.ta, taLabel, "task_achievement", "task_achievement_vi"),
      cc: makeCriterion("cc", bands.cc, "Coherence & Cohesion", "coherence_cohesion", "coherence_cohesion_vi"),
      lr: makeCriterion("lr", bands.lr, "Lexical Resource", "lexical_resource", "lexical_resource_vi"),
      gra: makeCriterion("gra", bands.gra, "Grammatical Range & Accuracy", "grammatical_range_accuracy", "grammatical_range_accuracy_vi"),
    },
    tips: (json?.priority_actions as string[]) ?? [],
    tips_vi: (json?.priority_actions_vi as string[]) ?? [],
    wordCount: submission.word_count,
    disclaimer: "",
    scoring_method: submission.scoring_method,
    overallComment: json?.overall_comment as string | undefined,
    overallComment_vi: json?.overall_comment_vi as string | undefined,
    priorityActions: (json?.priority_actions as string[]) ?? [],
    priorityActions_vi: (json?.priority_actions_vi as string[]) ?? [],
  };
}

export default function SubmissionDetailPage() {
  const { user, loading: userLoading } = useUser();
  const { lang } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [submission, setSubmission] = useState<SubmissionWithFeedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user || !id) return;
    const supabase = createBrowserClient();
    supabase
      .from("essay_submissions")
      .select("*, feedback_results(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { router.push("/dashboard"); return; }
        setSubmission(data as SubmissionWithFeedback);
        setLoading(false);
      });
  }, [user, id, router]);

  if (userLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jaxtina-red" />
      </div>
    );
  }

  if (!submission) return null;

  const fb = submission.feedback_results[0];
  const isAI = submission.scoring_method === "ai_examiner";
  const result = reconstructResult(submission);

  if (!result) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="mx-auto max-w-3xl">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-1" /> {t("common", "back", lang)}
            </Link>
          </Button>
          <p className="text-muted-foreground text-sm">
            {lang === "vi" ? "Không tìm thấy dữ liệu phản hồi." : "Feedback data not found."}
          </p>
        </div>
      </div>
    );
  }

  const criteriaLabels = [
    { label: result.scoring_method === "ai_examiner" && submission.task_type === "task2" ? "Task Response" : "Task Achievement", band: fb?.task_achievement_band },
    { label: "Coherence", band: fb?.coherence_cohesion_band },
    { label: "Lexical", band: fb?.lexical_resource_band },
    { label: "Grammatical", band: fb?.grammatical_range_accuracy_band },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Back */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-1" /> {t("common", "back", lang)}
            </Link>
          </Button>
        </div>

        {/* Score hero card */}
        <div className="rounded-2xl bg-gradient-to-r from-jaxtina-red to-jaxtina-blue p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Badge variant="outline" className="text-white border-white/40 text-xs mb-2">
                {submission.task_type === "task1" ? "Task 1" : "Task 2"} ·{" "}
                {new Date(submission.submitted_at).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </Badge>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                {isAI
                  ? <><Cpu className="h-3.5 w-3.5" /> {t("results", "aiExaminer", lang)}</>
                  : <><Sliders className="h-3.5 w-3.5" /> {t("results", "ruleBased", lang)}</>
                }
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-70">{t("results", "overallBand", lang)}</p>
              <p className="text-6xl font-black">{fb?.overall_band ?? "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {criteriaLabels.map(({ label, band }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] opacity-60 leading-tight">{label}</p>
                <p className="text-xl font-bold">{band ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Overall comment (bilingual) */}
        {result.overallComment && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                {t("results", "overallComment", lang)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.overallComment_vi ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">EN</p>
                    <p className="text-sm leading-relaxed">{result.overallComment}</p>
                  </div>
                  <div className="border-l pl-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">VI</p>
                    <p className="text-sm leading-relaxed vi">{result.overallComment_vi}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{result.overallComment}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Priority actions (bilingual) */}
        {result.priorityActions && result.priorityActions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-jaxtina-red" />
                {t("results", "priorityActions", lang)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.priorityActions_vi && result.priorityActions_vi.length > 0 ? (
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">EN</p>
                    <ul className="space-y-1.5">
                      {result.priorityActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-jaxtina-red text-white text-[10px] flex items-center justify-center font-bold mt-0.5">
                            {i + 1}
                          </span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-l pl-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">VI</p>
                    <ul className="space-y-1.5">
                      {result.priorityActions_vi.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm vi">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-jaxtina-blue text-white text-[10px] flex items-center justify-center font-bold mt-0.5">
                            {i + 1}
                          </span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  {result.priorityActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-jaxtina-red text-white text-[10px] flex items-center justify-center font-bold mt-0.5">
                        {i + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detailed feedback accordion — full bilingual, same as results page */}
        <FeedbackAccordion feedback={result.feedback} lang={lang} />

        {/* Essay text */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
              {lang === "vi" ? "Bài viết đã nộp" : "Submitted Essay"} · {submission.word_count} {t("common", "words", lang)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-4">
              {submission.essay_text}
            </p>
          </CardContent>
        </Card>

        {/* Task prompt */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              {lang === "vi" ? "Đề bài" : "Task Prompt"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{submission.prompt_text}</p>
          </CardContent>
        </Card>

        {isAI && (
          <p className="text-center text-xs text-muted-foreground">
            {t("results", "disclaimer", lang)}
          </p>
        )}
      </div>
    </div>
  );
}
