import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function randomAnonName() {
  const adj = ["Curious", "Brave", "Bright", "Swift", "Clever", "Lucky", "Calm", "Wild", "Happy", "Bold"];
  const animal = ["Tiger", "Panda", "Dolphin", "Eagle", "Fox", "Otter", "Falcon", "Turtle", "Koala", "Dragon"];
  const a = adj[Math.floor(Math.random() * adj.length)];
  const b = animal[Math.floor(Math.random() * animal.length)];
  const n = Math.floor(100 + Math.random() * 900);
  return `${a} ${b} ${n}`;
}

function toInt(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

// ── GET /api/leaderboard?n=5  →  top 10 rows for that question_count ──────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const n = toInt(searchParams.get("n")) ?? 5;
  const questionCount = [5, 10, 15, 20].includes(n) ? n : 5;

  const service = createServiceClient();
  const { data, error } = await service
    .from("trivia_leaderboard")
    .select("id, name, score, total, time_seconds, played_at, question_count, test_history")
    .eq("question_count", questionCount)
    .order("score", { ascending: false })
    .order("time_seconds", { ascending: true })
    .order("played_at", { ascending: false })
    .limit(10); // top 10 per group

  if (error) {
    console.error("[leaderboard GET]", error.message);
    return NextResponse.json([], { status: 200 });
  }

  const rows = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    score: r.score,
    total: r.total,
    time: r.time_seconds,
    date: new Date(r.played_at).toLocaleDateString("en-GB"),
    // Include history but only if it exists — won't break old rows
    history: Array.isArray(r.test_history) ? r.test_history : [],
  }));

  return NextResponse.json(rows);
}

// ── POST /api/leaderboard  →  save a new score ────────────────────────────────

export async function POST(req: NextRequest) {
  // Anonymous allowed; if logged in we attach user_id and use their profile name.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const body = await req.json();
    let name = String(body?.name ?? "").trim().slice(0, 48);
    const score = toInt(body?.score);
    const total = toInt(body?.total);
    const timeSeconds = toInt(body?.time);
    const questionCount = toInt(body?.question_count);
    // history: array of { question, options, correctAnswer, chosen, correct }
    const testHistory = Array.isArray(body?.history) ? body.history : [];

    if (
      score == null ||
      total == null ||
      timeSeconds == null ||
      questionCount == null ||
      total <= 0 ||
      score < 0 ||
      score > total ||
      ![5, 10, 15, 20].includes(questionCount)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
    }

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, display_name, email")
        .eq("id", user.id)
        .single();
      const derived =
        (profile as any)?.full_name ||
        (profile as any)?.display_name ||
        (profile as any)?.email?.split("@")[0];
      if (derived) name = String(derived).trim().slice(0, 48);
    }

    if (!name) name = randomAnonName();

    const { error } = await supabase.from("trivia_leaderboard").insert({
      user_id: user?.id ?? null,
      name,
      score,
      total,
      time_seconds: timeSeconds,
      question_count: questionCount,
      test_history: testHistory,
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[leaderboard POST]", err);
    return NextResponse.json({ error: err?.message ?? "Failed to save score" }, { status: 500 });
  }
}
