import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const n = req.nextUrl.searchParams.get("n") ?? "5";
  const { data } = await supabase
    .from("quiz_leaderboard")
    .select("*")
    .eq("question_count", Number(n))
    .order("score", { ascending: false })
    .order("time",  { ascending: true })
    .limit(50);
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { error } = await supabase.from("quiz_leaderboard").insert(body);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
