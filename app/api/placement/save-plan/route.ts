import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface RequestBody {
  testId: string;
  entryBandRange: string;
  goalBand: string;
  planName: string;
  stagesJson: unknown[];
  totalMonths: number;
}

/**
 * POST /api/placement/save-plan
 * Saves a user's selected study plan to user_study_plans.
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
  const { testId, entryBandRange, goalBand, planName, stagesJson, totalMonths } = body;

  if (!entryBandRange || !goalBand || !planName || !stagesJson) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data, error } = await service
    .from("user_study_plans")
    .insert({
      user_id: user.id,
      test_id: testId ?? null,
      entry_band_range: entryBandRange,
      goal_band: goalBand,
      plan_name: planName,
      stages_json: stagesJson,
      total_months: totalMonths,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[placement/save-plan] Insert error:", error);
    return NextResponse.json({ error: "Failed to save plan" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
