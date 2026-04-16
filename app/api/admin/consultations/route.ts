import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// ── GET /api/admin/consultations ──────────────────────────────────────────────
// Paginated list with optional filters
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { service } = auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";
  const center = searchParams.get("center") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const source = searchParams.get("source") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(200, parseInt(searchParams.get("limit") ?? "50", 10));
  const offset = (page - 1) * limit;

  let query = service
    .from("consultation_bookings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (center) query = query.ilike("center_name", `%${center}%`);
  if (from) query = query.gte("preferred_date", from);
  if (to) query = query.lte("preferred_date", to);
  if (source) query = query.eq("source_context", source);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    bookings: data ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}
