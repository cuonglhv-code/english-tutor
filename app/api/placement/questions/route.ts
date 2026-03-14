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

  // Group rows by part_number → one passage object per part
  const passageMap = new Map<
    number,
    { passage_title: string; passage_text: string; part_number: number; questions: unknown[] }
  >();

  for (const r of readingRows ?? []) {
    const key = r.part_number as number;
    if (!passageMap.has(key)) {
      passageMap.set(key, {
        passage_title: r.passage_title as string,
        passage_text: r.passage_text as string,
        part_number: key,
        questions: [],
      });
    }
    passageMap.get(key)!.questions.push({
      id: r.id as string,
      question_number: r.question_number as number,
      question_text: r.question_text as string,
      question_type: r.question_type as string,
      options: r.options
        ? typeof r.options === "string"
          ? JSON.parse(r.options)
          : r.options
        : null,
    });
  }

  // Sort by part_number so passages arrive in order 1 → 2 → 3
  const readingPassages = Array.from(passageMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, passage]) => passage);

  // ── Listening: fetch ALL active audio parts ordered by part_number ──────────
  const { data: audioParts } = await service
    .from("placement_listening_audio")
    .select("*")
    .eq("is_active", true)
    .order("part_number", { ascending: true });

  const listeningParts = await Promise.all(
    (audioParts ?? []).map(async (audioRow: Record<string, unknown>) => {
      const { data: lqs } = await service
        .from("placement_listening_questions")
        .select("*")
        .eq("audio_id", audioRow.id as string)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      return {
        audio: {
          id: audioRow.id as string,
          title: audioRow.title as string,
          public_url: audioRow.public_url as string,
          part_number: audioRow.part_number as number,
          notes_layout_json: (audioRow.notes_layout_json as string) ?? null,
        },
        questions: (lqs ?? []).map((q: Record<string, unknown>) => ({
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
          before_text: (q.before_text as string) ?? null,
          after_text: (q.after_text as string) ?? null,
        })),
      };
    })
  );

  // ── Writing: fetch both active writing tasks (task1 and task2) ──────────────
  const { data: writingRows } = await service
    .from("placement_writing_tasks")
    .select("*")
    .eq("is_active", true)
    .order("task_type", { ascending: true }); // "task1" sorts before "task2"

  function toWritingTask(row: Record<string, unknown> | undefined) {
    if (!row) return null;
    return {
      id: row.id as string,
      task_type: row.task_type as string,
      prompt_text: row.prompt_text as string,
      image_url: (row.image_url as string) ?? null,
      visual_description: (row.visual_description as string) ?? null,
      min_words: row.min_words as number,
      recommended_minutes: row.recommended_minutes as number,
    };
  }

  const writingTask1 = toWritingTask(
    (writingRows ?? []).find((r) => r.task_type === "task1") as Record<string, unknown> | undefined
  );
  const writingTask2 = toWritingTask(
    (writingRows ?? []).find((r) => r.task_type === "task2") as Record<string, unknown> | undefined
  );

  return NextResponse.json({
    testId,
    readingPassages,
    listeningParts,
    writingTask1,
    writingTask2,
  });
}
