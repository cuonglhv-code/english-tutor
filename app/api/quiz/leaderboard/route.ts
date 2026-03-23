import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── GET /api/quiz/leaderboard?n=5 ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const n = Number(req.nextUrl.searchParams.get("n") ?? "5");
  const questionCount = [5, 10, 15, 20].includes(n) ? n : 5;

  const { data, error } = await supabase
    .from("quiz_leaderboard")
    .select("id, name, score, total, time_seconds, played_at, question_count, test_history, topics")
    .eq("question_count", questionCount)
    .order("score", { ascending: false })
    .order("time_seconds", { ascending: true })  // ← correct column name
    .order("played_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[quiz/leaderboard GET]", error.message);
    return NextResponse.json([], { status: 200 });
  }

  // Map to the shape the Leaderboard component expects
  const rows = (data ?? []).map((r: any) => ({
    id:      r.id,
    name:    r.name,
    score:   r.score,
    total:   r.total,
    time:    r.time_seconds,   // component uses 'time'
    date:    new Date(r.played_at).toLocaleDateString("en-GB"),
    fullDate: r.played_at,    // Keep iso string for relative dates
    history: Array.isArray(r.test_history) ? r.test_history : [],
    topics: Array.isArray(r.topics) ? r.topics : [],
  }));

  return NextResponse.json(rows);
}

// ── POST /api/quiz/leaderboard ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Map client fields → DB column names
    const { name, score, total, time, question_count, history, topics } = body ?? {};

    if (
      typeof score !== "number" ||
      typeof total !== "number" ||
      typeof time !== "number" ||
      typeof question_count !== "number" ||
      total <= 0 || score < 0 || score > total ||
      ![5, 10, 15, 20].includes(question_count)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
    }

    const { error } = await supabase.from("quiz_leaderboard").insert({
      name:           String(name ?? "Anonymous").trim().slice(0, 48) || "Anonymous",
      score,
      total,
      time_seconds:   time,        // client sends 'time', DB column is 'time_seconds'
      question_count,
      test_history:   Array.isArray(history) ? history : [],   // client sends 'history', DB column is 'test_history'
      topics:         Array.isArray(topics) ? topics : [],
      played_at:      new Date().toISOString(),
    });

    if (error) {
      console.error("[quiz/leaderboard POST]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[quiz/leaderboard POST]", err);
    return NextResponse.json({ error: err?.message ?? "Failed to save" }, { status: 500 });
  }
}
