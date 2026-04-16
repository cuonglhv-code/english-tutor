import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// ── GET /api/admin/audit ───────────────────────────────────────────────────
// Paginated audit log with optional filters
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { service } = auth;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;

    const actionFilter = searchParams.get("action") ?? "";
    const adminIdFilter = searchParams.get("admin_id") ?? "";
    const dateFrom = searchParams.get("date_from") ?? "";
    const dateTo = searchParams.get("date_to") ?? "";

    let query = service
        .from("audit_log")
        .select(
            `*, admin:admin_id(email, full_name, display_name)`,
            { count: "exact" }
        )
        .order("performed_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (actionFilter) {
        // Support partial match, e.g. "DELETE" matches DELETE_USER and DELETE_QUESTION
        query = query.ilike("action", `%${actionFilter}%`);
    }

    if (adminIdFilter) {
        query = query.eq("admin_id", adminIdFilter);
    }

    if (dateFrom) {
        query = query.gte("performed_at", dateFrom);
    }

    if (dateTo) {
        // Include the entire end date day
        const endOfDay = new Date(dateTo);
        endOfDay.setDate(endOfDay.getDate() + 1);
        query = query.lt("performed_at", endOfDay.toISOString());
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("[admin/audit GET]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        logs: data ?? [],
        total: count ?? 0,
        page,
        limit,
    });
}
