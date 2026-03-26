import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, RefreshCcw } from "lucide-react";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { ResultsClient } from "@/components/placement/ResultsClient";
import { AnswerReview } from "@/components/placement/AnswerReview";
import { ENTRY_BAND_RANGE_LABELS } from "@/lib/placementBands";
import type { EntryBandRange } from "@/lib/studyPlanConfig";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function PlacementResultsPage({ searchParams }: PageProps) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/placement/results");

  const params = await searchParams;
  const testId = params.id;
  if (!testId) notFound();

  // Fetch test result
  const service = createServiceClient();
  const { data: test, error } = await service
    .from("placement_tests")
    .select("*")
    .eq("id", testId)
    .eq("user_id", user.id)
    .single();

  if (error || !test) notFound();

  const readingBand: number = test.reading_band ?? 0;
  const listeningBand: number = test.listening_band ?? 0;
  const writingBand: number = test.writing_band ?? 0;
  const avg = ((readingBand + listeningBand + writingBand) / 3).toFixed(1);
  const entryRange: EntryBandRange =
    (test.estimated_entry_band_range as EntryBandRange) ?? "3.5-4.0";

  // Fetch writing evaluations — prefer Task 2 for the study plan context
  // (fall back to Task 1 if Task 2 is absent, or to most recent row for legacy data)
  const { data: writingEvals } = await service
    .from("placement_writing_evaluations")
    .select(
      "task_type, overall_band, task_achievement_band, coherence_cohesion_band, lexical_resource_band, grammatical_range_accuracy_band, feedback_json, word_count"
    )
    .eq("test_id", testId)
    .order("created_at", { ascending: true }); // safe: works even before migration 010

  // Prefer task2 for study plan summary; fall back to task1 or the last row
  const writingEval =
    (writingEvals ?? []).find((r) => r.task_type === "task2") ??
    (writingEvals ?? []).find((r) => r.task_type === "task1") ??
    (writingEvals ?? [])[0] ??
    null;

  type FeedbackJson = {
    priority_actions?: string[];
    overall_comment?: string;
    task_achievement?: { strengths?: string; improvements?: string };
  };
  const fb = (writingEval?.feedback_json ?? {}) as FeedbackJson;

  const writingSummary = writingEval
    ? {
        overallBand: writingEval.overall_band as number,
        taskAchievementBand: writingEval.task_achievement_band as number,
        coherenceCohesionBand: writingEval.coherence_cohesion_band as number,
        lexicalResourceBand: writingEval.lexical_resource_band as number,
        grammarBand: writingEval.grammatical_range_accuracy_band as number,
        wordCount: (writingEval.word_count ?? 0) as number,
        priorityActions: (fb.priority_actions ?? []) as string[],
        overallComment: (fb.overall_comment ?? "") as string,
        strengths: (fb.task_achievement?.strengths ?? "") as string,
        improvements: (fb.task_achievement?.improvements ?? "") as string,
        feedbackJson: writingEval.feedback_json as Record<string, unknown>,
      }
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Your Placement Results
          </h1>
          <p className="text-slate-500">Kết quả xếp lớp của bạn</p>
          <p className="text-sm text-slate-400 mt-1">
            Test completed ·{" "}
            {new Date(test.completed_at ?? test.started_at).toLocaleDateString()}
          </p>
        </div>

        {/* Scores card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Overall band banner */}
          <div className="bg-blue-600 text-white px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200 mb-0.5">
                Estimated Entry Level / Trình độ đầu vào
              </p>
              <p className="text-2xl font-bold">
                {ENTRY_BAND_RANGE_LABELS[entryRange]}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200 mb-0.5">Overall Average</p>
              <p className="text-4xl font-black">{avg}</p>
            </div>
          </div>

          {/* Section bands */}
          <div className="grid grid-cols-3 divide-x divide-slate-200">
            <BandCell
              label="Reading Band"
              labelVi="Band Reading"
              band={readingBand}
              color="blue"
            />
            <BandCell
              label="Listening Band"
              labelVi="Band Listening"
              band={listeningBand}
              color="teal"
            />
            <BandCell
              label="Writing Band"
              labelVi="Band Writing"
              band={writingBand}
              color="amber"
            />
          </div>
        </div>

        {/* Study plan suggestion */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            Suggested Study Plan
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Lộ trình học gợi ý — select your target band to see the recommended
            programme.
          </p>
          <ResultsClient
            testId={testId}
            entryBandRange={entryRange}
            readingBand={readingBand}
            listeningBand={listeningBand}
            writingBand={writingBand}
            overallAverage={parseFloat(avg)}
            writingSummary={writingSummary}
          />
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            Answer Review
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Xem chi tiết đáp án — see which answers were correct, what the right answers were, and detailed writing feedback.
          </p>
          <AnswerReview testId={testId} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Go to Dashboard · Vào Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link href="/placement/test">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retake Test · Làm lại bài kiểm tra
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

// ─── Local sub-component ──────────────────────────────────────────────────────
function BandCell({
  label,
  labelVi,
  band,
  color,
}: {
  label: string;
  labelVi: string;
  band: number;
  color: "blue" | "teal" | "amber";
}) {
  const colors = {
    blue:  "text-blue-700",
    teal:  "text-teal-700",
    amber: "text-amber-700",
  };
  return (
    <div className="px-5 py-4 text-center">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-xs text-slate-400 mb-2">{labelVi}</p>
      <p className={`text-3xl font-black ${colors[color]}`}>
        {band > 0 ? band.toFixed(1) : "—"}
      </p>
    </div>
  );
}
