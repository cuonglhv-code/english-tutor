import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import {
  rawScoreToBand,
  estimateEntryBandRange,
} from "@/lib/placementBands";
import type { PlacementWritingResult } from "../writing/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const INTERNAL_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * POST /api/placement/submit
 * Body: { testId: string }
 *
 * 1. Authenticate user.
 * 2. Fetch all answers for the test.
 * 3. Score reading & listening against correct_answer fields.
 * 4. Call /api/placement/writing to score the essay with Claude.
 * 5. Compute estimated_entry_band_range.
 * 6. Update placement_tests row and insert writing evaluation.
 * 7. Return results.
 */
export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { testId } = body as { testId: string };

  if (!testId) {
    return NextResponse.json({ error: "testId is required" }, { status: 400 });
  }

  const service = createServiceClient();

  // ── Verify test belongs to this user ───────────────────────────────────────
  const { data: test } = await service
    .from("placement_tests")
    .select("id, user_id, status")
    .eq("id", testId)
    .eq("user_id", user.id)
    .single();

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  // ── Fetch all stored answers ───────────────────────────────────────────────
  const { data: answers } = await service
    .from("placement_answers")
    .select("section, question_number, answer_text")
    .eq("test_id", testId);

  const readingAnswers = (answers ?? []).filter(
    (a: { section: string }) => a.section === "reading"
  );
  const listeningAnswers = (answers ?? []).filter(
    (a: { section: string }) => a.section === "listening"
  );
  // Task 1 essay = question_number=1, Task 2 = question_number=2 (or 0 legacy)
  const task1Answer = (answers ?? []).find(
    (a: { section: string; question_number: number }) =>
      a.section === "writing" && a.question_number === 1
  );
  const task2Answer =
    (answers ?? []).find(
      (a: { section: string; question_number: number }) =>
        a.section === "writing" && a.question_number === 2
    ) ??
    (answers ?? []).find(
      (a: { section: string; question_number: number }) =>
        a.section === "writing" && a.question_number === 0
    );

  // ── Score Reading ──────────────────────────────────────────────────────────
  const { data: readingQuestions } = await service
    .from("placement_reading_questions")
    .select("question_number, correct_answer")
    .eq("is_active", true);

  let readingCorrect = 0;
  for (const q of readingQuestions ?? []) {
    const userAns = readingAnswers.find(
      (a: { question_number: number }) => a.question_number === q.question_number
    );
    if (
      userAns &&
      userAns.answer_text?.trim().toUpperCase() ===
        q.correct_answer.trim().toUpperCase()
    ) {
      readingCorrect++;
    }
  }
  const readingTotal = readingQuestions?.length ?? 0;
  const readingBand = rawScoreToBand(readingCorrect, "reading");

  // ── Score Listening ────────────────────────────────────────────────────────
  const { data: listeningQuestions } = await service
    .from("placement_listening_questions")
    .select("question_number, correct_answer")
    .eq("is_active", true);

  let listeningCorrect = 0;
  for (const q of listeningQuestions ?? []) {
    const userAns = listeningAnswers.find(
      (a: { question_number: number }) => a.question_number === q.question_number
    );
    if (
      userAns &&
      userAns.answer_text?.trim().toLowerCase() ===
        q.correct_answer.trim().toLowerCase()
    ) {
      listeningCorrect++;
    }
  }
  const listeningTotal = listeningQuestions?.length ?? 0;
  const listeningBand = rawScoreToBand(listeningCorrect, "listening");

  // ── Score Writing via Claude — evaluate BOTH Task 1 and Task 2 ───────────
  let task1Eval: PlacementWritingResult | null = null;
  let task2Eval: PlacementWritingResult | null = null;

  // Helper: call Claude writing scorer for one task
  async function scoreEssay(
    essayText: string,
    promptText: string,
    taskType: "task1" | "task2"
  ): Promise<PlacementWritingResult | null> {
    if (essayText.trim().length <= 20) return null;
    try {
      const res = await fetch(`${INTERNAL_ORIGIN}/api/placement/writing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({ essay: essayText, promptText, taskType }),
      });
      return res.ok ? (await res.json()) as PlacementWritingResult : null;
    } catch (e) {
      console.error(`[placement/submit] ${taskType} eval failed:`, e);
      return null;
    }
  }

  // Fetch both task prompts in parallel
  const [{ data: task1Prompt }, { data: task2Prompt }] = await Promise.all([
    service
      .from("placement_writing_tasks")
      .select("prompt_text")
      .eq("is_active", true)
      .eq("task_type", "task1")
      .limit(1)
      .single(),
    service
      .from("placement_writing_tasks")
      .select("prompt_text")
      .eq("is_active", true)
      .eq("task_type", "task2")
      .limit(1)
      .single(),
  ]);

  // Score both essays in parallel
  [task1Eval, task2Eval] = await Promise.all([
    scoreEssay(
      task1Answer?.answer_text ?? "",
      task1Prompt?.prompt_text ?? "Summarise and describe the visual data.",
      "task1"
    ),
    scoreEssay(
      task2Answer?.answer_text ?? "",
      task2Prompt?.prompt_text ?? "Present a well-structured argument.",
      "task2"
    ),
  ]);

  // Writing band = average of available task bands, or fallback from word count
  const availableBands = [task1Eval?.overall_band, task2Eval?.overall_band].filter(
    (b): b is number => typeof b === "number" && b > 0
  );
  let writingBand =
    availableBands.length > 0
      ? Math.round((availableBands.reduce((a, b) => a + b, 0) / availableBands.length) * 2) / 2
      : 0;
  // Fallback: estimate from essay length if Claude scored nothing
  if (writingBand === 0) {
    const wc = (task2Answer?.answer_text ?? task1Answer?.answer_text ?? "")
      .trim()
      .split(/\s+/).length;
    writingBand = wc >= 250 ? 5.0 : wc >= 150 ? 4.0 : 3.0;
  }

  // ── Compute entry band range ───────────────────────────────────────────────
  const estimatedRange = estimateEntryBandRange(
    readingBand,
    listeningBand,
    writingBand > 0 ? writingBand : readingBand
  );

  // ── Update placement_tests ─────────────────────────────────────────────────
  await service
    .from("placement_tests")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      reading_raw_score: readingCorrect,
      listening_raw_score: listeningCorrect,
      reading_band: readingBand,
      listening_band: listeningBand,
      writing_band: writingBand || null,
      estimated_entry_band_range: estimatedRange,
    })
    .eq("id", testId);

  // ── Insert one evaluation row per task (only if essay was scored) ──────────
  const evalInserts = [];
  if (task1Eval) {
    evalInserts.push({
      test_id: testId,
      task_type: "task1",
      essay_text: task1Answer?.answer_text ?? "",
      word_count: task1Eval.word_count,
      task_achievement_band: task1Eval.task_achievement_band,
      coherence_cohesion_band: task1Eval.coherence_cohesion_band,
      lexical_resource_band: task1Eval.lexical_resource_band,
      grammatical_range_accuracy_band: task1Eval.grammatical_range_accuracy_band,
      overall_band: task1Eval.overall_band,
      feedback_json: task1Eval.feedback_json,
    });
  }
  if (task2Eval) {
    evalInserts.push({
      test_id: testId,
      task_type: "task2",
      essay_text: task2Answer?.answer_text ?? "",
      word_count: task2Eval.word_count,
      task_achievement_band: task2Eval.task_achievement_band,
      coherence_cohesion_band: task2Eval.coherence_cohesion_band,
      lexical_resource_band: task2Eval.lexical_resource_band,
      grammatical_range_accuracy_band: task2Eval.grammatical_range_accuracy_band,
      overall_band: task2Eval.overall_band,
      feedback_json: task2Eval.feedback_json,
    });
  }
  if (evalInserts.length > 0) {
    const { error: evalInsertError } = await service
      .from("placement_writing_evaluations")
      .insert(evalInserts);

    if (evalInsertError) {
      console.error("[placement/submit] Eval insert failed:", evalInsertError.message);
      // Fallback: task_type column may not exist yet (migration 010 not applied).
      // Insert the best available eval WITHOUT the task_type field.
      const bestEval =
        evalInserts.find((e) => e.task_type === "task2") ?? evalInserts[0];
      if (bestEval) {
        const { task_type: _drop, ...legacyRow } = bestEval;
        const { error: fallbackErr } = await service
          .from("placement_writing_evaluations")
          .insert([legacyRow]);
        if (fallbackErr) {
          console.error("[placement/submit] Fallback eval insert failed:", fallbackErr.message);
        }
      }
    }
  }

  return NextResponse.json({
    testId,
    readingBand,
    listeningBand,
    writingBand,
    readingRaw: readingCorrect,
    readingTotal,
    listeningRaw: listeningCorrect,
    listeningTotal,
    estimatedEntryBandRange: estimatedRange,
  });
}
