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

  // Existing writing-analysis state
  const [submissions, setSubmissions] = useState<SubmissionWithFeedback[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // New LMS state
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [examDate, setExamDate] = useState<UserExamDate | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityDay[]>([]);

  const [dataLoading, setDataLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  // Load all data
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
          // Using Supabase via API
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
          // New LMS queries
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
        // Aggregate DB rows -> one ActivityDay per date
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

  // Loading state
  if (userLoading || dataLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF7043]" />
      </div>
    );
  }

  if (!user) return null;

  // Derived writing stats
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
    <div className="relative min-h-screen bg-[#FAFAF8] py-12 px-6 overflow-hidden text-slate-800">
      {/* Background Decorations */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#26A69A]/5 blur-[100px] pointer-events-none transition-all duration-1000" />
      <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#FF7043]/5 blur-[120px] pointer-events-none transition-all duration-1000" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#26A69A 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }}
      />

      <div className="relative mx-auto max-w-6xl space-y-10 z-10">

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2 sm:px-0">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#26A69A]/10 text-[10px] font-black text-[#26A69A] uppercase tracking-widest border border-[#26A69A]/10">
              <TrendingUp className="w-3 h-3" />
              Level up your band score!
            </div>
            <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-slate-800 leading-none">
              {lang === "vi"
                ? "Academic Analytics"
                : "Learning Dashboard"}
            </h1>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
               {user.email} <span className="mx-2 opacity-30">•</span> Student ID: {user.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto h-16 px-8 rounded-full bg-gradient-to-r from-[#FF7043] to-[#FF8A65] border-b-4 border-orange-700 shadow-xl shadow-orange-100 hover:scale-105 active:scale-95 transition-all text-white font-black">
            <Link href="/">
              <PenLine className="h-4 w-4 mr-2" />
              {lang === "vi" ? "New Practice Session" : "New Essay"}
            </Link>
          </Button>
        </div>

        {/* SECTION 1 - LMS: GOALS + COUNTDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Goal Tracker */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border-b-4 border-slate-100 transition-all hover:shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-secondary/10 rounded-2xl shadow-sm">
                 <Target className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="font-black font-display text-2xl tracking-tight text-slate-800 uppercase">
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

          {/* Exam Countdown */}
          <div className="bg-white rounded-[2.5rem] p-8 border-b-4 border-orange-50 shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all hover:shadow-xl overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="relative flex items-center gap-3 mb-8">
               <div className="p-3 bg-[#FF7043]/10 rounded-2xl shadow-sm">
                 <Flame className="h-6 w-6 text-[#FF7043]" />
               </div>
               <h2 className="font-black font-display text-xl tracking-tight text-slate-800 uppercase leading-none text-left">
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

        {/* SECTION 2 - LMS: ACTIVITY HEATMAP */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border-b-4 border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#26A69A]/10 rounded-2xl shadow-sm">
               <BookOpen className="h-6 w-6 text-[#26A69A]" />
            </div>
            <h2 className="font-black font-display text-2xl tracking-tight text-slate-800 uppercase">
              {lang === "vi"
                ? "Theo dõi tiến độ học tập (8 tuần)"
                : "Practice Velocity — last 8 weeks"}
            </h2>
          </div>
          <ActivityHeatmap activityLog={activityLog} lang={lang} />
        </div>

        {/* SECTION DIVIDER */}
        <div className="flex items-center gap-6 pt-6">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF7043] leading-none bg-orange-50 px-6 py-3 rounded-full border border-orange-100 shadow-sm transition-transform hover:scale-105">
            {lang === "vi" ? "Phân tích Writing" : "IELTS Writing Performance"}
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* SECTION 3 - Writing: Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.03)] border-b-4 border-slate-100 text-center group hover:-translate-y-2 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Layout className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
              {t("dashboard", "totalSubmissions", lang)}
            </p>
            <p className="text-5xl font-black font-display text-slate-800 mb-4 tracking-tighter">{submissions.length}</p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-500">
                T1: {task1Count}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-500">
                T2: {task2Count}
              </Badge>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.03)] border-b-4 border-orange-100 text-center hover:-translate-y-2 transition-all cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-5 w-5 text-[#FF7043]" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
              {t("dashboard", "avgBand", lang)}
            </p>
            <p
              className={`text-5xl font-black font-display transition-colors ${progress ? bandToColor(progress.average_band) : "text-slate-200"
                }`}
            >
              {progress ? progress.average_band : "—"}
            </p>
            <p className="text-[9px] font-black text-[#FF7043] mt-3 uppercase tracking-tighter italic leading-none">Current Mastery</p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.03)] border-b-4 border-teal-100 text-center hover:-translate-y-2 transition-all cursor-default">
             <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <Target className="h-5 w-5 text-[#26A69A]" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
              {lang === "vi" ? "Độ tin cậy AI" : "Scoring Logic"}
            </p>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <ScoringMethodBadge method="ai_examiner" lang={lang} size="xs" />
                <span className="font-display font-black text-2xl text-slate-800 leading-none">{aiCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <ScoringMethodBadge
                  method="rule_based_fallback"
                  lang={lang}
                  size="xs"
                />
                <span className="font-display font-black text-2xl text-slate-300 leading-none">{ruleCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.03)] border-b-4 border-slate-100 text-center hover:-translate-y-2 transition-all">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
              {lang === "vi" ? "Bài gần nhất" : "Activity"}
            </p>
            <p className="text-xl font-black font-display text-slate-800 mt-4 uppercase tracking-tighter leading-none">
              {progress?.last_submission_at
                ? new Date(progress.last_submission_at).toLocaleDateString(
                  lang === "vi" ? "vi-VN" : "en-GB",
                  { day: "2-digit", month: "short" }
                )
                : "—"}
            </p>
            <p className="text-[9px] font-bold text-slate-300 mt-2 uppercase tracking-widest leading-none">Last Practice</p>
          </div>
        </div>

        {/* SECTION 4 - Per-criterion averages */}
        {avgPerCriterion && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.035)] border border-slate-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="relative flex items-center gap-3 mb-8 text-left">
              <div className="p-3 bg-[#26A69A]/10 rounded-2xl shadow-sm">
                 <BarChart2 className="h-6 w-6 text-[#26A69A]" />
              </div>
              <h2 className="font-black font-display text-2xl tracking-tight text-slate-800 uppercase leading-none">
                {lang === "vi"
                  ? "Band trung bình theo tiêu chí"
                  : "Criterion Mastery"}
              </h2>
            </div>
            <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-6">
              {criteriaStats.map(({ key, label }) => {
                const avg = avgPerCriterion[key];
                return (
                  <div key={key} className="bg-[#FBFCFE] p-8 rounded-[2rem] border-b-4 border-slate-100 text-center hover:bg-white hover:shadow-xl transition-all group cursor-default">
                    <p className="text-[10px] font-black text-slate-400 leading-tight mb-4 uppercase tracking-[0.1em] h-8 flex items-center justify-center opacity-70">
                      {label}
                    </p>
                    <p
                      className={`text-4xl font-black font-display ${avg ? bandToColor(avg) : "text-slate-200"
                        }`}
                    >
                      {avg ?? "—"}
                    </p>
                    <div className="w-1.5 h-1.5 bg-slate-100 rounded-full mx-auto mt-4 transition-all group-hover:scale-150 group-hover:bg-teal-400" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 5 - Band progression chart */}
        {submissions.length >= 2 && (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.04)] border border-slate-50 transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-10 text-left">
              <div className="p-3 bg-[#FF7043]/10 rounded-2xl shadow-sm">
                 <TrendingUp className="h-6 w-6 text-[#FF7043]" />
              </div>
              <h2 className="font-black font-display text-2xl tracking-tight text-slate-800 uppercase leading-none">
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

        {/* SECTION 6 - Recent feedback */}
        {submissions.length > 0 && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border-b-4 border-slate-100">
            <div className="flex items-center gap-3 mb-8 text-left">
               <div className="p-3 bg-secondary/10 rounded-2xl shadow-sm">
                  <Layout className="h-6 w-6 text-secondary" />
               </div>
               <h2 className="font-black font-display text-2xl tracking-tight text-slate-800 uppercase leading-none">
                {t("dashboard", "recentFeedback", lang)}
              </h2>
            </div>
            <RecentFeedbackPanel submissions={submissions} lang={lang} />
          </div>
        )}

        {/* SECTION 7 - Submission history */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-white shadow-2xl shadow-slate-200/20 mb-20 overflow-hidden">
          <div className="flex items-center gap-3 mb-8 text-left">
             <div className="p-3 bg-slate-50 rounded-2xl shadow-sm">
                <PenLine className="h-6 w-6 text-slate-400" />
             </div>
             <h2 className="font-black font-display text-2xl tracking-tight text-slate-800 uppercase leading-none">
              {t("dashboard", "submissionHistory", lang)}
            </h2>
          </div>
          <SubmissionHistoryTable submissions={submissions} lang={lang} />
        </div>

      </div>
    </div>
  );
}
