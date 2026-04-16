import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/placement/review?testId=xxx
 *
 * Returns per-question answer review (correct / incorrect + correct answer)
 * for reading and listening, plus writing evaluation feedback.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const testId = req.nextUrl.searchParams.get("testId");
  if (!testId) {
    return NextResponse.json({ error: "testId required" }, { status: 400 });
  }

  const service = createServiceClient();

  // Verify the test belongs to this user
  const { data: test } = await service
    .from("placement_tests")
    .select("id, status")
    .eq("id", testId)
    .eq("user_id", user.id)
    .single();

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  // ── Fetch user answers ────────────────────────────────────────────────────
  const { data: answers } = await service
    .from("placement_answers")
    .select("section, question_number, answer_text")
    .eq("test_id", testId);

  const answerMap = new Map<string, string>();
  for (const a of answers ?? []) {
    answerMap.set(`${a.section}-${a.question_number}`, a.answer_text ?? "");
  }

  // ── Reading review ────────────────────────────────────────────────────────
  const { data: rqs } = await service
    .from("placement_reading_questions")
    .select(
      "question_number, question_text, question_type, options, correct_answer, part_number, passage_title"
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const reading = (rqs ?? []).map((q) => {
    const userAnswer = answerMap.get(`reading-${q.question_number}`) ?? "";
    const isCorrect =
      userAnswer.trim().toUpperCase() ===
      (q.correct_answer as string).trim().toUpperCase();
    return {
      question_number: q.question_number as number,
      question_text: q.question_text as string,
      question_type: q.question_type as string,
      options: q.options
        ? typeof q.options === "string"
          ? JSON.parse(q.options)
          : q.options
        : null,
      correct_answer: q.correct_answer as string,
      user_answer: userAnswer,
      is_correct: isCorrect,
      part_number: q.part_number as number,
      passage_title: q.passage_title as string,
    };
  });

  // ── Listening review ──────────────────────────────────────────────────────
  const { data: lqs } = await service
    .from("placement_listening_questions")
    .select(
      "question_number, question_text, question_type, options, correct_answer, context_text"
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const listening = (lqs ?? []).map((q) => {
    const userAnswer = answerMap.get(`listening-${q.question_number}`) ?? "";
    const isCorrect =
      userAnswer.trim().toLowerCase() ===
      (q.correct_answer as string).trim().toLowerCase();
    return {
      question_number: q.question_number as number,
      question_text: q.question_text as string,
      question_type: q.question_type as string,
      options: q.options
        ? typeof q.options === "string"
          ? JSON.parse(q.options)
          : q.options
        : null,
      correct_answer: q.correct_answer as string,
      user_answer: userAnswer,
      is_correct: isCorrect,
      context_text: (q.context_text as string) ?? null,
    };
  });

  // ── Writing evaluations — fetch ALL rows (one per task) ──────────────────
  // NOTE: order by created_at (not task_type) so this works even if migration
  // 010 (which adds task_type column) hasn't been applied yet.
  const { data: writingEvals, error: evalError } = await service
    .from("placement_writing_evaluations")
    .select("*")
    .eq("test_id", testId)
    .order("created_at", { ascending: true });

  if (evalError) {
    console.error("[review] writing eval fetch error:", evalError.message);
  }

  function mapWritingRow(row: Record<string, unknown> | undefined) {
    if (!row) return null;
    return {
      essay_text: row.essay_text as string,
      word_count: row.word_count as number,
      task_achievement_band: row.task_achievement_band as number,
      coherence_cohesion_band: row.coherence_cohesion_band as number,
      lexical_resource_band: row.lexical_resource_band as number,
      grammatical_range_accuracy_band: row.grammatical_range_accuracy_band as number,
      overall_band: row.overall_band as number,
      feedback: row.feedback_json as Record<string, unknown> | null,
    };
  }

  // Support both: rows with explicit task_type col (new) and legacy single rows
  const rows = writingEvals ?? [];
  const task1Row = rows.find((r) => r.task_type === "task1") as Record<string, unknown> | undefined;
  const task2Row = (rows.find((r) => r.task_type === "task2") ?? rows[rows.length - 1]) as Record<string, unknown> | undefined;

  const writing = {
    task1: mapWritingRow(task1Row),
    task2: mapWritingRow(task2Row),
  };

  return NextResponse.json({ reading, listening, writing });
}
