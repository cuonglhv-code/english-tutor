import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/placement/questions
 *
 * 1. Authenticates the user.
 * 2. Creates (or resumes) a placement_tests row.
 * 3. Fetches the active reading passage + questions, listening audio + questions,
 *    and writing task.
 * 4. Returns all content plus the testId.
 */
export async function GET() {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();

  // ── Get or create an in-progress test for this user ─────────────────────────
  let testId: string;

  const { data: existing } = await service
    .from("placement_tests")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (existing?.id) {
    testId = existing.id;
  } else {
    const { data: created, error: createError } = await service
      .from("placement_tests")
      .insert({ user_id: user.id, status: "in_progress" })
      .select("id")
      .single();

    if (createError || !created) {
      console.error("[placement/questions] Failed to create test:", createError);
      return NextResponse.json(
        { error: "Could not initialise test" },
        { status: 500 }
      );
    }
    testId = created.id;
  }

  // ── Reading: fetch all active questions ordered by display_order ────────────
  const { data: readingRows } = await service
    .from("placement_reading_questions")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  // Group: the first row gives us the passage; all rows are questions
  let reading = null;
  if (readingRows && readingRows.length > 0) {
    const first = readingRows[0];
    reading = {
      passage_title: first.passage_title,
      passage_text: first.passage_text,
      part_number: first.part_number,
      questions: readingRows.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        question_number: r.question_number as number,
        question_text: r.question_text as string,
        question_type: r.question_type as string,
        options: r.options
          ? typeof r.options === "string"
            ? JSON.parse(r.options)
            : r.options
          : null,
      })),
    };
  }

  // ── Listening: fetch the active audio + its questions ───────────────────────
  const { data: audioRow } = await service
    .from("placement_listening_audio")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let listeningAudio = null;
  let listeningQuestions: unknown[] = [];

  if (audioRow) {
    listeningAudio = {
      id: audioRow.id as string,
      title: audioRow.title as string,
      public_url: audioRow.public_url as string,
      part_number: audioRow.part_number as number,
    };

    const { data: lqs } = await service
      .from("placement_listening_questions")
      .select("*")
      .eq("audio_id", audioRow.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    listeningQuestions = (lqs ?? []).map((q: Record<string, unknown>) => ({
      id: q.id as string,
      question_number: q.question_number as number,
      question_text: q.question_text as string,
      question_type: q.question_type as string,
      options: q.options
        ? typeof q.options === "string"
          ? JSON.parse(q.options as string)
          : q.options
        : null,
      context_text: (q.context_text as string) ?? null,
    }));
  }

  // ── Writing: fetch the active writing task ───────────────────────────────────
  const { data: writingRow } = await service
    .from("placement_writing_tasks")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const writingTask = writingRow
    ? {
        id: writingRow.id as string,
        task_type: writingRow.task_type as string,
        prompt_text: writingRow.prompt_text as string,
        image_url: (writingRow.image_url as string) ?? null,
        visual_description: (writingRow.visual_description as string) ?? null,
        min_words: writingRow.min_words as number,
        recommended_minutes: writingRow.recommended_minutes as number,
      }
    : null;

  return NextResponse.json({
    testId,
    reading,
    listeningAudio,
    listeningQuestions,
    writingTask,
  });
}
