"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Cpu, Sliders, CheckCircle2, ArrowUpCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { createBrowserClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";
import { bandToColor, bandToBg } from "@/lib/utils";
import type { SubmissionWithFeedback } from "@/types";

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
  const json = fb?.feedback_json as Record<string, unknown> | undefined;

  // Determine if this is a structured AI response
  const isAI = submission.scoring_method === "ai_examiner";
  const overallComment = json?.overall_comment as string | undefined;
  const priorityActions = (json?.priority_actions as string[] | undefined) ?? [];

  const criteriaKeys = [
    { key: "task_achievement", label: "Task Achievement / Task Response", band: fb?.task_achievement_band },
    { key: "coherence_cohesion", label: "Coherence and Cohesion", band: fb?.coherence_cohesion_band },
    { key: "lexical_resource", label: "Lexical Resource", band: fb?.lexical_resource_band },
    { key: "grammatical_range_accuracy", label: "Grammatical Range and Accuracy", band: fb?.grammatical_range_accuracy_band },
  ] as const;

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

        {/* Header */}
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
            {criteriaKeys.map(({ label, band }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] opacity-60 leading-tight">{label.split(" ")[0]}</p>
                <p className="text-xl font-bold">{band ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Overall comment */}
        {overallComment && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                {t("results", "overallComment", lang)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{overallComment}</p>
            </CardContent>
          </Card>
        )}

        {/* Priority actions */}
        {priorityActions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-jaxtina-red" />
                {t("results", "priorityActions", lang)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {priorityActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-jaxtina-red text-white text-[10px] flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Criterion feedback */}
        <div className="rounded-xl border overflow-hidden">
          <div className="p-4 border-b bg-muted">
            <h2 className="font-bold text-lg">{t("results", "detailedFeedback", lang)}</h2>
          </div>
          <Accordion type="multiple" defaultValue={["task_achievement", "coherence_cohesion"]} className="px-2">
            {criteriaKeys.map(({ key, label, band }) => {
              const criterionData = json?.[key] as Record<string, string> | undefined;
              const strengths = criterionData?.strengths ?? criterionData?.wellDone;
              const improvements = criterionData?.improvements ?? criterionData?.improvement;
              const justification = criterionData?.band_justification ?? criterionData?.bandJustification;

              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 w-full pr-2">
                      {band != null && (
                        <Badge
                          variant="outline"
                          className={`text-base font-bold min-w-[2.5rem] justify-center ${bandToColor(band)}`}
                        >
                          {band}
                        </Badge>
                      )}
                      <span className="font-semibold text-left">{label}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-2">
                      {strengths && (
                        <div className={`flex gap-3 rounded-lg p-3 ${band != null ? bandToBg(band) : "bg-muted"}`}>
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-xs text-green-700 dark:text-green-400 mb-0.5">
                              {t("results", "strengths", lang)}
                            </p>
                            <p className="text-sm">{strengths}</p>
                          </div>
                        </div>
                      )}
                      {improvements && (
                        <div className="flex gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                          <ArrowUpCircle className="h-4 w-4 text-jaxtina-blue shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-xs text-jaxtina-blue mb-0.5">
                              {t("results", "improvements", lang)}
                            </p>
                            <p className="text-sm whitespace-pre-line">{improvements}</p>
                          </div>
                        </div>
                      )}
                      {justification && (
                        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                          <span className="font-medium">{t("results", "bandJustification", lang)}: </span>
                          {justification}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

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
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
              {lang === "vi" ? "Đề bài" : "Task Prompt"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{submission.prompt_text}</p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">{t("results", "disclaimer", lang)}</p>
      </div>
    </div>
  );
}
