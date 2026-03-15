import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import type { PlacementWritingResult } from "../writing/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INTERNAL_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * POST /api/placement/rescore-writing
 * Body: { testId: string }
 *
 * Re-evaluates writing answers with Claude and saves evaluation rows.
 * Deletes any existing evaluation rows first to avoid duplicates.
 * Resilient to missing task_type column (pre-migration 010).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const testId = body.testId as string;
  if (!testId) {
    return NextResponse.json({ error: "testId required" }, { status: 400 });
  }

  const service = createServiceClient();

  // Verify test belongs to this user
  const { data: test } = await service
    .from("placement_tests")
    .select("id")
    .eq("id", testId)
    .eq("user_id", user.id)
    .single();

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  // Fetch writing answers
  const { data: answers } = await service
    .from("placement_answers")
    .select("question_number, answer_text")
    .eq("test_id", testId)
    .eq("section", "writing");

  const task1Answer = (answers ?? []).find((a) => a.question_number === 1);
  const task2Answer =
    (answers ?? []).find((a) => a.question_number === 2) ??
    (answers ?? []).find((a) => a.question_number === 0);

  if (!task1Answer?.answer_text && !task2Answer?.answer_text) {
    return NextResponse.json(
      { error: "No writing answers found for this test." },
      { status: 404 }
    );
  }

  // Fetch task prompts
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

  async function scoreEssay(
    essayText: string,
    promptText: string,
    taskType: "task1" | "task2"
  ): Promise<PlacementWritingResult | null> {
    if (!essayText || essayText.trim().length <= 20) return null;
    try {
      const res = await fetch(`${INTERNAL_ORIGIN}/api/placement/writing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({ essay: essayText, promptText, taskType }),
      });
      if (!res.ok) {
        console.error(`[rescore-writing] ${taskType} HTTP ${res.status}`);
        return null;
      }
      return (await res.json()) as PlacementWritingResult;
    } catch (e) {
      console.error(`[rescore-writing] ${taskType} error:`, e);
      return null;
    }
  }

  // Score both tasks in parallel
  const [task1Eval, task2Eval] = await Promise.all([
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

  if (!task1Eval && !task2Eval) {
    return NextResponse.json(
      { error: "Writing evaluation failed. Essays may be too short or Claude API unavailable." },
      { status: 422 }
    );
  }

  // Build insert rows
  type EvalRow = Record<string, unknown>;
  const evalInserts: EvalRow[] = [];
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

  // Delete any stale rows first
  await service
    .from("placement_writing_evaluations")
    .delete()
    .eq("test_id", testId);

  // Try inserting with task_type column
  const { error: insertError } = await service
    .from("placement_writing_evaluations")
    .insert(evalInserts);

  if (insertError) {
    console.error("[rescore-writing] Insert failed:", insertError.message);

    // Fallback: column task_type may not exist yet (migration 010 not applied).
    // Insert best available eval WITHOUT task_type field.
    const bestEval = evalInserts.find((e) => e.task_type === "task2") ?? evalInserts[0];
    if (bestEval) {
      const { task_type: _drop, ...legacyRow } = bestEval;
      const { error: fallbackErr } = await service
        .from("placement_writing_evaluations")
        .insert([legacyRow]);

      if (fallbackErr) {
        console.error("[rescore-writing] Fallback insert failed:", fallbackErr.message);
        return NextResponse.json(
          { error: "Failed to save evaluation results." },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({
    success: true,
    task1Scored: !!task1Eval,
    task2Scored: !!task2Eval,
  });
}
