import type { ReactNode } from "react";
import { redirect, notFound } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import { PrintButton } from "./PrintButton";
import ConsultCTA from "./ConsultCTA";
import {
  CheckCircle2, Target, BookOpen, TrendingUp, AlertCircle,
  Calendar, User, Award, BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ planId: string }>;
}

// ─── Colour helpers ────────────────────────────────────────────────────────────
function bandBg(b: number) {
  if (b >= 7) return "bg-green-100 text-green-800 border-green-300";
  if (b >= 5.5) return "bg-blue-100 text-blue-800 border-blue-300";
  if (b >= 4) return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-red-100 text-red-800 border-red-300";
}

function stageColor(i: number) {
  const palette = [
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  return palette[i % palette.length];
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function StudyPlanViewPage({ params }: PageProps) {
  const { planId } = await params;

  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/placement/study-plan/${planId}`);

  const service = createServiceClient();

  // Fetch plan — must belong to this user (or be an admin view later)
  const { data: plan, error } = await service
    .from("user_study_plans")
    .select("*")
    .eq("id", planId)
    .eq("user_id", user.id)
    .single();

  if (error || !plan) notFound();

  // Student profile
  const { data: profile } = await service
    .from("profiles")
    .select("full_name, email, phone, nearest_center")
    .eq("id", user.id)
    .single();

  // Writing evaluation (via test_id)
  type WritingEval = {
    overall_band: number;
    task_achievement_band: number;
    coherence_cohesion_band: number;
    lexical_resource_band: number;
    grammatical_range_accuracy_band: number;
    word_count: number | null;
    feedback_json: Record<string, unknown> | null;
  };
  let writingEval: WritingEval | null = null;
  if (plan.test_id) {
    const { data } = await service
      .from("placement_writing_evaluations")
      .select(
        "overall_band, task_achievement_band, coherence_cohesion_band, lexical_resource_band, grammatical_range_accuracy_band, word_count, feedback_json"
      )
      .eq("test_id", plan.test_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    writingEval = data as WritingEval | null;
  }

  // If plan already stored writing_feedback_json, prefer that (it was captured at save time)
  const storedFb = plan.writing_feedback_json as Record<string, unknown> | null;
  type FeedbackJson = {
    priority_actions?: string[];
    overall_comment?: string;
    task_achievement?: { strengths?: string; improvements?: string };
  };
  const fb = (storedFb ?? writingEval?.feedback_json ?? {}) as FeedbackJson;
  const priorityActions = (fb.priority_actions ?? []) as string[];
  const overallComment = (fb.overall_comment ?? "") as string;
  const strengths = (fb.task_achievement?.strengths ?? "") as string;
  const improvements = (fb.task_achievement?.improvements ?? "") as string;

  // Bands — prefer plan columns, fall back to writingEval
  const readingBand: number = (plan.reading_band as number) ?? 0;
  const listeningBand: number = (plan.listening_band as number) ?? 0;
  const writingBand: number =
    (plan.writing_band as number) ?? writingEval?.overall_band ?? 0;
  const overallAvg: number =
    (plan.overall_average as number) ??
    ((readingBand + listeningBand + writingBand) / 3);

  type Stage = { name: string; months: number; focus: string[] };
  const stages = (plan.stages_json as Stage[]) ?? [];

  const createdAt = new Date(plan.created_at as string).toLocaleDateString(
    "en-GB",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const studentName =
    (profile?.full_name as string | null) ??
    (user.email ?? "Student");

  return (
    <>
      {/* ── Print stylesheet injected inline so it works without Tailwind purge ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-page { box-shadow: none !important; border: none !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      {/* ── Top action bar (hidden on print) ── */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <span className="text-sm font-semibold text-slate-700">
          Study Plan · {plan.plan_name as string}
        </span>
        <PrintButton />
      </div>

      {/* ── Document ── */}
      <main className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:p-0">
        <div className="print-page max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden print:rounded-none print:shadow-none">

          {/* ══ HEADER BANNER ══════════════════════════════════════════════════ */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-8 py-7">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
                  IELTS Placement — Study Plan
                </p>
                <h1 className="text-2xl font-black leading-tight">
                  {plan.plan_name as string}
                </h1>
                <div className="flex items-center gap-4 mt-3 text-sm text-blue-100 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {studentName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {createdAt}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-blue-200 text-xs mb-0.5">Target Band</p>
                <p className="text-4xl font-black flex items-center gap-1.5 justify-end">
                  <Target className="h-6 w-6 text-blue-300" />
                  {plan.goal_band as string}
                </p>
                <p className="text-blue-200 text-xs mt-1">
                  {plan.total_months as number} months programme
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-7 space-y-8">

            {/* ══ SCORE SUMMARY ══════════════════════════════════════════════ */}
            <section>
              <SectionTitle icon={<BarChart3 className="h-4 w-4" />} title="Placement Test Scores" />
              <div className="grid grid-cols-4 gap-3 mt-3">
                <ScoreCard label="Reading" labelVi="Reading" band={readingBand} />
                <ScoreCard label="Listening" labelVi="Nghe" band={listeningBand} />
                <ScoreCard label="Writing" labelVi="Viết" band={writingBand} />
                <ScoreCard label="Overall Avg" labelVi="Trung bình" band={overallAvg} highlight />
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                <Award className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  Estimated Entry Level:{" "}
                  <strong className="text-blue-700">{plan.entry_band_range as string}</strong>
                  {" "}· Goal:{" "}
                  <strong className="text-indigo-700">{plan.goal_band as string}</strong>
                </span>
              </div>
            </section>

            {/* ══ WRITING FEEDBACK ═══════════════════════════════════════════ */}
            {writingBand > 0 && (
              <section>
                <SectionTitle icon={<BookOpen className="h-4 w-4" />} title="Writing Evaluation Summary" />

                {/* Criterion grid */}
                {writingEval && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[
                      { label: "Task Achievement", band: writingEval.task_achievement_band },
                      { label: "Coherence & Cohesion", band: writingEval.coherence_cohesion_band },
                      { label: "Lexical Resource", band: writingEval.lexical_resource_band },
                      { label: "Grammar", band: writingEval.grammatical_range_accuracy_band },
                    ].map(({ label, band }) => (
                      <div
                        key={label}
                        className={`rounded-lg border p-3 text-center ${bandBg(band)}`}
                      >
                        <div className="text-2xl font-black">{band.toFixed(1)}</div>
                        <div className="text-[10px] font-medium leading-tight mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Overall comment */}
                {overallComment && (
                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Overall Assessment
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">{overallComment}</p>
                    {writingEval?.word_count ? (
                      <p className="text-[11px] text-slate-400 mt-2 text-right">
                        {writingEval.word_count} words written
                      </p>
                    ) : null}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {strengths && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-[11px] font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">{strengths}</p>
                    </div>
                  )}
                  {improvements && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-[11px] font-bold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Areas to Improve
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">{improvements}</p>
                    </div>
                  )}
                </div>

                {priorityActions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                    <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" /> Priority Actions
                    </p>
                    <ol className="space-y-1.5">
                      {priorityActions.map((action, i) => (
                        <li key={i} className="flex gap-2.5 text-xs text-slate-700">
                          <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-blue-200 text-blue-800 text-[10px] font-bold">
                            {i + 1}
                          </span>
                          {action}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </section>
            )}

            {/* ══ PROGRAMME STAGES ═══════════════════════════════════════════ */}
            <section>
              <SectionTitle
                icon={<Target className="h-4 w-4" />}
                title="Study Programme"
                subtitle={`${plan.total_months as number} months to Band ${plan.goal_band as string}`}
              />

              {/* Total months visual bar */}
              <div className="mt-3 flex rounded-full overflow-hidden h-3 border border-slate-200">
                {stages.map((stage, i) => (
                  <div
                    key={i}
                    title={`${stage.name}: ${stage.months}m`}
                    className={`${stageColor(i)} transition-all`}
                    style={{ width: `${(stage.months / (plan.total_months as number)) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                {stages.map((stage, i) => (
                  <span key={i} className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span className={`inline-block w-2.5 h-2.5 rounded-sm ${stageColor(i)}`} />
                    {stage.name} ({stage.months}m)
                  </span>
                ))}
              </div>

              {/* Timeline cards */}
              <ol className="relative border-l-2 border-blue-200 pl-6 space-y-5 mt-5">
                {stages.map((stage, i) => (
                  <li key={i} className="relative">
                    <div
                      className={`absolute -left-[1.45rem] top-1 w-5 h-5 rounded-full ${stageColor(i)} border-2 border-white shadow flex items-center justify-center text-white text-[10px] font-bold`}
                    >
                      {i + 1}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="text-sm font-bold text-slate-800">{stage.name}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 font-medium">
                          {stage.months} month{stage.months !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                        Focus areas
                      </p>
                      <ul className="space-y-1">
                        {stage.focus.map((f, j) => (
                          <li key={j} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5 shrink-0">▸</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* ══ CONSULTANT CTA ═════════════════════════════════════════════ */}
            <section className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 text-center">
              <p className="text-sm font-bold text-indigo-800 mb-1">
                Ready to start your IELTS journey?
              </p>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Book a free consultation with one of our education advisors to discuss this
                study plan, choose the right course, and get personalised guidance on reaching
                Band {plan.goal_band as string}.
              </p>
              <div className="mt-4 no-print">
                <ConsultCTA
                  defaultName={studentName !== "Student" ? studentName : ""}
                  defaultEmail={(profile?.email as string | null) ?? user.email ?? ""}
                  defaultPhone={(profile?.phone as string | null) ?? ""}
                  defaultCenter={(profile?.nearest_center as string | null) ?? ""}
                />
              </div>
              {/* Print version — static contact info */}
              <div className="hidden print:block mt-4 text-xs text-slate-500">
                Contact us: cuonglhv@jaxtina.com · www.jaxtina.com
              </div>
            </section>

            {/* ══ FOOTER ═════════════════════════════════════════════════════ */}
            <footer className="border-t border-slate-200 pt-5 flex items-center justify-between flex-wrap gap-3 text-[11px] text-slate-400">
              <span>Generated on {createdAt}</span>
              <span className="font-semibold text-slate-500">
                IELTS Examiner · Placement Assessment
              </span>
            </footer>

          </div>
        </div>
      </main>
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function SectionTitle({
  icon, title, subtitle,
}: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
      <span className="text-blue-600">{icon}</span>
      <div>
        <h2 className="text-base font-bold text-slate-800 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function ScoreCard({
  label, labelVi, band, highlight = false,
}: { label: string; labelVi: string; band: number; highlight?: boolean }) {
  const cls = highlight
    ? "bg-blue-600 text-white border-blue-600"
    : band === 0
    ? "bg-slate-50 border-slate-200 text-slate-400"
    : bandBg(band);
  return (
    <div className={`rounded-xl border p-3 text-center ${cls}`}>
      <div className={`text-2xl font-black ${highlight ? "text-white" : ""}`}>
        {band > 0 ? band.toFixed(1) : "—"}
      </div>
      <div className={`text-[10px] font-semibold mt-0.5 ${highlight ? "text-blue-100" : ""}`}>
        {label}
      </div>
      <div className={`text-[9px] ${highlight ? "text-blue-200" : "opacity-70"}`}>
        {labelVi}
      </div>
    </div>
  );
}
