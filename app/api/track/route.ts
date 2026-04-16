import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { event_name: string; metadata?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ALLOWED_EVENTS = new Set([
    "wizard_started",
    "wizard_step_advanced",
    "wizard_abandoned",
    "submission_completed",
  ]);

  const { event_name, metadata = {} } = body;
  if (!event_name || !ALLOWED_EVENTS.has(event_name)) {
    return NextResponse.json({ error: "invalid event_name" }, { status: 400 });
  }

  const { error } = await supabase
    .from("engagement_events")
    .insert({ user_id: user.id, event_name, metadata });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
