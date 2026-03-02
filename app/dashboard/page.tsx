"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, PenLine, TrendingUp, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoringMethodBadge } from "@/components/ScoringMethodBadge";
import { BandProgressChart } from "@/components/dashboard/BandProgressChart";
import { SubmissionHistoryTable } from "@/components/dashboard/SubmissionHistoryTable";
import { RecentFeedbackPanel } from "@/components/dashboard/RecentFeedbackPanel";
import { createBrowserClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";
import { bandToColor } from "@/lib/utils";
import type { SubmissionWithFeedback, UserProgress, Profile } from "@/types";

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { lang } = useLanguage();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<SubmissionWithFeedback[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;

    const supabase = createBrowserClient();

    async function loadData() {
      setDataLoading(true);
      const [subRes, progRes, profileRes] = await Promise.all([
        supabase
          .from("essay_submissions")
          .select("*, feedback_results(*)")
          .eq("user_id", user!.id)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user!.id)
          .single(),
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user!.id)
          .single(),
      ]);

      if (!subRes.error) setSubmissions(subRes.data as SubmissionWithFeedback[]);
      if (!progRes.error) setProgress(progRes.data as UserProgress);
      if (!profileRes.error) setProfile(profileRes.data as Profile);
      setDataLoading(false);
    }

    loadData();
  }, [user]);

  if (userLoading || dataLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jaxtina-red" />
      </div>
    );
  }

  if (!user) return null;

  const task1Count = submissions.filter((s) => s.task_type === "task1").length;
  const task2Count = submissions.filter((s) => s.task_type === "task2").length;
  const aiCount = submissions.filter((s) => s.scoring_method === "ai_examiner").length;
  const ruleCount = submissions.filter((s) => s.scoring_method === "rule_based_fallback").length;

  const avgPerCriterion = progress?.average_per_criterion;

  const criteriaStats = [
    { key: "ta", label: "Task Achievement / Task Response" },
    { key: "cc", label: "Coherence and Cohesion" },
    { key: "lr", label: "Lexical Resource" },
    { key: "gra", label: "Grammatical Range and Accuracy" },
  ] as const;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">{t("dashboard", "title", lang)}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button asChild>
            <Link href="/">
              <PenLine className="h-4 w-4 mr-2" />
              {lang === "vi" ? "Viết bài mới" : "New Essay"}
            </Link>
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {t("dashboard", "totalSubmissions", lang)}
              </p>
              <p className="text-3xl font-black">{submissions.length}</p>
              <div className="flex justify-center gap-2 mt-1">
                <Badge variant="default" className="text-[10px]">T1: {task1Count}</Badge>
                <Badge variant="blue" className="text-[10px]">T2: {task2Count}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {t("dashboard", "avgBand", lang)}
              </p>
              <p className={`text-3xl font-black ${progress ? bandToColor(progress.average_band) : ""}`}>
                {progress ? progress.average_band : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {lang === "vi" ? "AI / Dự phòng" : "AI / Fallback"}
              </p>
              <div className="flex flex-col items-center gap-1.5 mt-2">
                <div className="flex items-center gap-2">
                  <ScoringMethodBadge method="ai_examiner" lang={lang} size="xs" />
                  <span className="font-bold text-lg">{aiCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ScoringMethodBadge method="rule_based_fallback" lang={lang} size="xs" />
                  <span className="font-bold text-lg">{ruleCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {lang === "vi" ? "Bài gần nhất" : "Last Submission"}
              </p>
              <p className="text-sm font-semibold mt-2">
                {progress?.last_submission_at
                  ? new Date(progress.last_submission_at).toLocaleDateString(
                      lang === "vi" ? "vi-VN" : "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Per-criterion averages */}
        {avgPerCriterion && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-jaxtina-red" />
                {lang === "vi" ? "Band trung bình theo tiêu chí" : "Average Band by Criterion"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {criteriaStats.map(({ key, label }) => {
                  const avg = avgPerCriterion[key];
                  return (
                    <div key={key} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1 leading-tight">{label}</p>
                      <p className={`text-2xl font-black ${avg ? bandToColor(avg) : ""}`}>
                        {avg ?? "—"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Band progression chart */}
        {submissions.length >= 2 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-jaxtina-blue" />
                {t("dashboard", "bandProgression", lang)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BandProgressChart 
                submissions={submissions} 
                lang={lang}
                targetBand={profile?.target_writing_band ? parseFloat(profile.target_writing_band) : undefined}
              />
            </CardContent>
          </Card>
        )}

        {/* Recent feedback */}
        {submissions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("dashboard", "recentFeedback", lang)}</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentFeedbackPanel submissions={submissions} lang={lang} />
            </CardContent>
          </Card>
        )}

        {/* Submission history */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("dashboard", "submissionHistory", lang)}</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionHistoryTable submissions={submissions} lang={lang} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
