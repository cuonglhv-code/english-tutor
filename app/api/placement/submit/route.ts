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
  const writingAnswer = (answers ?? []).find(
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

  // ── Score Writing via Claude ───────────────────────────────────────────────
  let writingBand = 0;
  let writingEval: PlacementWritingResult | null = null;

  const essayText = writingAnswer?.answer_text ?? "";

  if (essayText.trim().length > 20) {
    // Fetch writing task prompt
    const { data: writingTask } = await service
      .from("placement_writing_tasks")
      .select("prompt_text")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    try {
      const writingRes = await fetch(
        `${INTERNAL_ORIGIN}/api/placement/writing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Pass auth cookie header for server-to-server call
            cookie: req.headers.get("cookie") ?? "",
          },
          body: JSON.stringify({
            essay: essayText,
            promptText: writingTask?.prompt_text ?? "Describe the visual.",
          }),
        }
      );

      if (writingRes.ok) {
        writingEval = await writingRes.json();
        writingBand = writingEval?.overall_band ?? 0;
      }
    } catch (e) {
      console.error("[placement/submit] Writing eval failed:", e);
      // Fallback: estimate band from word count
      const wc = essayText.trim().split(/\s+/).length;
      writingBand = wc >= 250 ? 5.0 : wc >= 150 ? 4.0 : 3.0;
    }
  }

  // ── Compute entry band range ───────────────────────────────────────────────
  const estimatedRange = estimateEntryBandRange(
    readingBand,
    listeningBand,
    writingBand > 0 ? writingBand : readingBand // fallback if no essay
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

  // ── Insert writing evaluation ──────────────────────────────────────────────
  if (writingEval) {
    await service.from("placement_writing_evaluations").insert({
      test_id: testId,
      essay_text: essayText,
      word_count: writingEval.word_count,
      task_achievement_band: writingEval.task_achievement_band,
      coherence_cohesion_band: writingEval.coherence_cohesion_band,
      lexical_resource_band: writingEval.lexical_resource_band,
      grammatical_range_accuracy_band:
        writingEval.grammatical_range_accuracy_band,
      overall_band: writingEval.overall_band,
      feedback_json: writingEval.feedback_json,
    });
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
