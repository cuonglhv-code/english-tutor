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
  Layout,
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
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // ── New LMS state ──────────────────────────────────────────────────────────
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [examDate, setExamDate] = useState<UserExamDate | null>(null);
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
          // ── Using Supabase via API ───────────────────────────────────────
          fetch("/api/user/submissions")
            .then(res => res.json())
            .then(data => ({ data: Array.isArray(data) ? data : [], error: data.error ? new Error(data.error) : null })),

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

      if (!subRes.error) setSubmissions(subRes.data as SubmissionWithFeedback[]);
      if (!progRes.error) setProgress(progRes.data as UserProgress);
      if (!profileRes.error) setProfile(profileRes.data as Profile);
      if (!goalsRes.error) setGoals(goalsRes.data as UserGoals);
      if (!examRes.error) setExamDate(examRes.data as UserExamDate);

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
    <div className="min-h-screen bg-surface py-12 px-6">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* ══════════════════════════════════════════════════════════════════
            PAGE HEADER
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2 sm:px-0">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-on-surface mb-1">
              {lang === "vi"
                ? "Academic Analytics"
                : "Learning Dashboard"}
            </h1>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-on-surface-variant/40">
               {user.email} <span className="mx-2 opacity-50">•</span> Student ID: {user.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto h-14 rounded-2xl gradient-primary border-none shadow-lg hover:scale-105 transition-transform">
            <Link href="/">
              <PenLine className="h-4 w-4 mr-2" />
              {lang === "vi" ? "New Practice Session" : "New Essay"}
            </Link>
          </Button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — LMS: GOALS + COUNTDOWN
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Goal Tracker (2/3 width on desktop) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-stitched border-none">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-secondary/10 rounded-xl">
                 <Target className="h-5 w-5 text-secondary" />
              </div>
              <h2 className="font-black font-display text-xl tracking-tight text-on-surface uppercase">
                {lang === "vi" ? "Mục tiêu Band Score" : "Academic Goals"}
              </h2>
            </div>
            <GoalTracker
              goals={goals}
              writingCurrentBand={progress?.average_band}
              lang={lang}
              onUpdate={(updated) => setGoals(updated)}
            />
          </div>

          {/* Exam Countdown (1/3 width on desktop) */}
          <div className="bg-surface-container-low rounded-3xl p-8 border-none">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2.5 bg-primary/10 rounded-xl">
                 <Flame className="h-5 w-5 text-primary" />
               </div>
               <h2 className="font-black font-display text-lg tracking-tight text-on-surface uppercase">
                {lang === "vi" ? "Lịch thi" : "Countdown"}
              </h2>
            </div>
            <ExamCountdown
              examDate={examDate}
              lang={lang}
              onUpdate={(updated) => setExamDate(updated)}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — LMS: ACTIVITY HEATMAP
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl p-8 shadow-stitched border-none">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-primary/10 rounded-xl">
               <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-black font-display text-xl tracking-tight text-on-surface uppercase">
              {lang === "vi"
                ? "Theo dõi tiến độ học tập (8 tuần)"
                : "Practice Velocity — last 8 weeks"}
            </h2>
          </div>
          <ActivityHeatmap activityLog={activityLog} lang={lang} />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION DIVIDER
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-6 pt-6">
          <div className="h-px flex-1 bg-on-surface-variant/10" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 leading-none">
            {lang === "vi" ? "Phân tích Writing" : "IELTS Writing Performance"}
          </span>
          <div className="h-px flex-1 bg-on-surface-variant/10" />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — Writing: Overview Stats
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-stitched border-none text-center group hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-4">
              {t("dashboard", "totalSubmissions", lang)}
            </p>
            <p className="text-5xl font-black font-display text-on-surface mb-4">{submissions.length}</p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-surface border-none text-on-surface-variant/60">
                T1: {task1Count}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-surface border-none text-on-surface-variant/60">
                T2: {task2Count}
              </Badge>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-stitched border-none text-center hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-4">
              {t("dashboard", "avgBand", lang)}
            </p>
            <p
              className={`text-5xl font-black font-display ${progress ? bandToColor(progress.average_band) : "text-on-surface-variant/20"
                }`}
            >
              {progress ? progress.average_band : "—"}
            </p>
            <p className="text-[9px] font-bold text-on-surface-variant/40 mt-3 uppercase tracking-tighter italic">Overall Performance</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-stitched border-none text-center hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-4">
              {lang === "vi" ? "Độ tin cậy AI" : "Scoring Logic"}
            </p>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <ScoringMethodBadge method="ai_examiner" lang={lang} size="xs" />
                <span className="font-display font-black text-xl text-on-surface">{aiCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <ScoringMethodBadge
                  method="rule_based_fallback"
                  lang={lang}
                  size="xs"
                />
                <span className="font-display font-black text-xl text-on-surface-variant/40">{ruleCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-stitched border-none text-center hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-4">
              {lang === "vi" ? "Bài gần nhất" : "Activity"}
            </p>
            <p className="text-xl font-black font-display text-on-surface mt-4 uppercase tracking-tighter">
              {progress?.last_submission_at
                ? new Date(progress.last_submission_at).toLocaleDateString(
                  lang === "vi" ? "vi-VN" : "en-GB",
                  { day: "2-digit", month: "short" }
                )
                : "—"}
            </p>
            <p className="text-[9px] font-bold text-on-surface-variant/40 mt-1 uppercase tracking-widest">Last Practice Date</p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — Per-criterion averages
        ══════════════════════════════════════════════════════════════════ */}
        {avgPerCriterion && (
          <div className="bg-surface-container-low rounded-3xl p-8 border-none">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                 <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-black font-display text-xl tracking-tight text-on-surface uppercase">
                {lang === "vi"
                  ? "Band trung bình theo tiêu chí"
                  : "Criterion Mastery"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {criteriaStats.map(({ key, label }) => {
                const avg = avgPerCriterion[key];
                return (
                  <div key={key} className="bg-white p-6 rounded-2xl shadow-sm text-center">
                    <p className="text-[9px] font-black text-on-surface-variant/40 leading-none mb-3 uppercase tracking-widest h-8 flex items-center justify-center">
                      {label}
                    </p>
                    <p
                      className={`text-3xl font-black font-display ${avg ? bandToColor(avg) : "text-on-surface-variant/20"
                        }`}
                    >
                      {avg ?? "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 — Band progression chart
        ══════════════════════════════════════════════════════════════════ */}
        {submissions.length >= 2 && (
          <div className="bg-white rounded-3xl p-10 shadow-stitched border-none">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                 <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-black font-display text-xl tracking-tight text-on-surface uppercase">
                {t("dashboard", "bandProgression", lang)}
              </h2>
            </div>
            <BandProgressChart
              submissions={submissions}
              lang={lang}
              targetBand={
                profile?.target_writing_band
                  ? parseFloat(profile.target_writing_band)
                  : undefined
              }
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 6 — Recent feedback
        ══════════════════════════════════════════════════════════════════ */}
        {submissions.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-stitched border-none">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2.5 bg-secondary/10 rounded-xl">
                  <Layout className="h-5 w-5 text-secondary" />
               </div>
               <h2 className="font-black font-display text-xl tracking-tight text-on-surface uppercase">
                {t("dashboard", "recentFeedback", lang)}
              </h2>
            </div>
            <RecentFeedbackPanel submissions={submissions} lang={lang} />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 7 — Submission history
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl p-8 shadow-stitched border-none">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-2.5 bg-on-surface-variant/10 rounded-xl">
                <PenLine className="h-5 w-5 text-on-surface-variant/40" />
             </div>
             <h2 className="font-black font-display text-xl tracking-tight text-on-surface uppercase">
              {t("dashboard", "submissionHistory", lang)}
            </h2>
          </div>
          <SubmissionHistoryTable submissions={submissions} lang={lang} />
        </div>

      </div>
    </div>
  );
}
