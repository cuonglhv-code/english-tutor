import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface AnswerItem {
  questionNumber: number;
  answerText: string;
}

type SectionInput = "reading" | "listening" | "writing" | "writing_t1" | "writing_t2";
type DBSection = "reading" | "listening" | "writing";

interface RequestBody {
  testId: string;
  section: SectionInput;
  answers: AnswerItem[];
}

/**
 * POST /api/placement/save-answers
 *
 * Upserts answers for a given section.
 * Called after each section completes (Back → Next or timer expiry).
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

  const body: RequestBody = await req.json();
  const { testId, answers } = body;
  let { section } = body;

  if (!testId || !section || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Map writing_t1 / writing_t2 → "writing" for DB (question_number disambiguates)
  const dbSection: DBSection =
    section === "writing_t1" || section === "writing_t2" ? "writing" : (section as DBSection);
  section = dbSection;

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

  // Upsert each answer
  const rows = answers.map((a) => ({
    test_id: testId,
    section: dbSection,
    question_number: a.questionNumber,
    answer_text: a.answerText ?? "",
  }));

  if (rows.length > 0) {
    const { error: upsertError } = await service
      .from("placement_answers")
      .upsert(rows, {
        onConflict: "test_id,section,question_number",
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error("[placement/save-answers] Upsert error:", upsertError);
      return NextResponse.json({ error: "Failed to save answers" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
