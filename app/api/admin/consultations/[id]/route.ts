import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// ── PATCH /api/admin/consultations/[id] ───────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { service } = auth;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { status, staff_notes, assigned_staff_id } = body as {
    status?: string;
    staff_notes?: string;
    assigned_staff_id?: string | null;
  };

  const validStatuses = ["pending", "contacted", "completed", "cancelled"];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (status !== undefined) {
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }
    updates.status = status;
  }

  if (staff_notes !== undefined) {
    updates.staff_notes = staff_notes;
  }

  if (assigned_staff_id !== undefined) {
    updates.assigned_staff_id = assigned_staff_id;
  }

  const { data, error } = await service
    .from("consultation_bookings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[admin/consultations PATCH] DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data });
}
