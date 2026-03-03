"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  PenLine,
  TrendingUp,
  BarChart2,
  Target,
  Flame,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoringMethodBadge } from "@/components/ScoringMethodBadge";
import { BandProgressChart } from "@/components/dashboard/BandProgressChart";
import { SubmissionHistoryTable } from "@/components/dashboard/SubmissionHistoryTable";
import { RecentFeedbackPanel } from "@/components/dashboard/RecentFeedbackPanel";
import { GoalTracker } from "@/components/dashboard/GoalTracker";
import { ExamCountdown } from "@/components/dashboard/ExamCountdown";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { createBrowserClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";
import { bandToColor } from "@/lib/utils";
import type { SubmissionWithFeedback, UserProgress, Profile } from "@/types";
import type { UserGoals, UserExamDate, ActivityDay, ActivityLogRow } from "@/types/lms";

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { lang } = useLanguage();
  const router = useRouter();

  // ── Existing writing-analysis state ────────────────────────────────────────
  const [submissions, setSubmissions] = useState<SubmissionWithFeedback[]>([]);
  const [progress,    setProgress]    = useState<UserProgress | null>(null);
  const [profile,     setProfile]     = useState<Profile | null>(null);

  // ── New LMS state ──────────────────────────────────────────────────────────
  const [goals,       setGoals]       = useState<UserGoals | null>(null);
  const [examDate,    setExamDate]    = useState<UserExamDate | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityDay[]>([]);

  const [dataLoading, setDataLoading] = useState(true);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  // ── Load all data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const supabase = createBrowserClient();

    async function loadData() {
      setDataLoading(true);

      const eightWeeksAgo = new Date();
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
      const cutoffDate = eightWeeksAgo.toISOString().split("T")[0];

      const [subRes, progRes, profileRes, goalsRes, examRes, activityRes] =
        await Promise.all([
          // ── Existing queries ──────────────────────────────────────────────
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
          // ── New LMS queries ───────────────────────────────────────────────
          supabase
            .from("user_goals")
            .select("*")
            .eq("user_id", user!.id)
            .single(),
          supabase
            .from("user_exam_dates")
            .select("*")
            .eq("user_id", user!.id)
            .single(),
          supabase
            .from("user_activity_log")
            .select("activity_date, skill, exercises_done")
            .eq("user_id", user!.id)
            .gte("activity_date", cutoffDate)
            .order("activity_date", { ascending: true }),
        ]);

      if (!subRes.error)     setSubmissions(subRes.data as SubmissionWithFeedback[]);
      if (!progRes.error)    setProgress(progRes.data as UserProgress);
      if (!profileRes.error) setProfile(profileRes.data as Profile);
      if (!goalsRes.error)   setGoals(goalsRes.data as UserGoals);
      if (!examRes.error)    setExamDate(examRes.data as UserExamDate);

      if (!activityRes.error && activityRes.data) {
        // Aggregate DB rows → one ActivityDay per date
        const grouped: Record<string, ActivityDay> = {};
        for (const row of activityRes.data as ActivityLogRow[]) {
          const d = row.activity_date;
          if (!grouped[d]) grouped[d] = { date: d, count: 0, skills: [] };
          grouped[d].count += row.exercises_done;
          if (!grouped[d].skills.includes(row.skill)) {
            grouped[d].skills.push(row.skill);
          }
        }
        setActivityLog(Object.values(grouped));
      }

      setDataLoading(false);
    }

    loadData();
  }, [user]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (userLoading || dataLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jaxtina-red" />
      </div>
    );
  }

  if (!user) return null;

  // ── Derived writing stats (unchanged) ─────────────────────────────────────
  const task1Count      = submissions.filter((s) => s.task_type === "task1").length;
  const task2Count      = submissions.filter((s) => s.task_type === "task2").length;
  const aiCount         = submissions.filter((s) => s.scoring_method === "ai_examiner").length;
  const ruleCount       = submissions.filter((s) => s.scoring_method === "rule_based_fallback").length;
  const avgPerCriterion = progress?.average_per_criterion;

  const criteriaStats = [
    { key: "ta",  label: "Task Achievement / Task Response" },
    { key: "cc",  label: "Coherence and Cohesion" },
    { key: "lr",  label: "Lexical Resource" },
    { key: "gra", label: "Grammatical Range and Accuracy" },
  ] as const;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* ══════════════════════════════════════════════════════════════════
            PAGE HEADER
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">
              {lang === "vi"
                ? "Bảng điều khiển học tập"
                : "IELTS Learning Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button asChild>
            <Link href="/">
              <PenLine className="h-4 w-4 mr-2" />
              {lang === "vi" ? "Viết bài mới" : "New Essay"}
            </Link>
          </Button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — LMS: GOALS + COUNTDOWN
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          {/* Goal Tracker (2/3 width on desktop) */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-jaxtina-red" />
                {lang === "vi" ? "Mục tiêu Band Score" : "Band Score Goals"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GoalTracker
                goals={goals}
                writingCurrentBand={progress?.average_band}
                lang={lang}
              />
            </CardContent>
          </Card>

          {/* Exam Countdown (1/3 width on desktop) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                {lang === "vi" ? "Lịch thi" : "Exam Countdown"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExamCountdown
                examDate={examDate}
                lang={lang}
                onUpdate={(updated) => setExamDate(updated)}
              />
            </CardContent>
          </Card>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — LMS: ACTIVITY HEATMAP
        ══════════════════════════════════════════════════════════════════ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-jaxtina-blue" />
              {lang === "vi"
                ? "Biểu đồ \"chăm chỉ\" của bạn (8 tuần gần nhất)"
                : "Practice Activity — last 8 weeks"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap activityLog={activityLog} lang={lang} />
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION DIVIDER
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {lang === "vi" ? "Phân tích Writing" : "Writing Analysis"}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — Writing: Overview Stats (unchanged)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {t("dashboard", "totalSubmissions", lang)}
              </p>
              <p className="text-3xl font-black">{submissions.length}</p>
              <div className="flex justify-center gap-2 mt-1">
                <Badge variant="default" className="text-[10px]">
                  T1: {task1Count}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  T2: {task2Count}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {t("dashboard", "avgBand", lang)}
              </p>
              <p
                className={`text-3xl font-black ${
                  progress ? bandToColor(progress.average_band) : ""
                }`}
              >
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
                  <ScoringMethodBadge
                    method="rule_based_fallback"
                    lang={lang}
                    size="xs"
                  />
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

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — Per-criterion averages (unchanged)
        ══════════════════════════════════════════════════════════════════ */}
        {avgPerCriterion && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-jaxtina-red" />
                {lang === "vi"
                  ? "Band trung bình theo tiêu chí"
                  : "Average Band by Criterion"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {criteriaStats.map(({ key, label }) => {
                  const avg = avgPerCriterion[key];
                  return (
                    <div key={key} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1 leading-tight">
                        {label}
                      </p>
                      <p
                        className={`text-2xl font-black ${
                          avg ? bandToColor(avg) : ""
                        }`}
                      >
                        {avg ?? "—"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 — Band progression chart (unchanged)
        ══════════════════════════════════════════════════════════════════ */}
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
                targetBand={
                  profile?.target_writing_band
                    ? parseFloat(profile.target_writing_band)
                    : undefined
                }
              />
            </CardContent>
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 6 — Recent feedback (unchanged)
        ══════════════════════════════════════════════════════════════════ */}
        {submissions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("dashboard", "recentFeedback", lang)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentFeedbackPanel submissions={submissions} lang={lang} />
            </CardContent>
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 7 — Submission history (unchanged)
        ══════════════════════════════════════════════════════════════════ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {t("dashboard", "submissionHistory", lang)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionHistoryTable submissions={submissions} lang={lang} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
