import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) ?? [];
  const difficulty  = searchParams.get("difficulty") ?? "medium";
  const count       = Math.min(parseInt(searchParams.get("count") ?? "5"), 20);

  let query = supabase
    .from("quiz_questions")
    .select("id, question, options, correct_answer, category, difficulty, fun_fact, source")
    .eq("active", true)
    .eq("difficulty", difficulty);

  if (categories.length > 0) query = query.in("category", categories);

  // Fetch up to 100 matching rows then shuffle in JS (Supabase JS has no random())
  const { data, error } = await query.limit(100);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "No questions found for these filters" }, 
      { status: 404 }
    );
  }

  const questions = shuffle(data).slice(0, count).map((q) => ({
    question:      q.question,
    options:       typeof q.options === "string" ? JSON.parse(q.options) : q.options,
    correctAnswer: q.correct_answer,
    category:      q.category,
    funFact:       q.fun_fact  ?? undefined,
    source:        q.source    ?? undefined,
  }));

  return NextResponse.json({ questions });
}
