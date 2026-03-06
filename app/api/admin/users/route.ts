import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, writeAuditLog } from "@/lib/admin-auth";

export const runtime = "nodejs";

// ── GET /api/admin/users ───────────────────────────────────────────────────
// Paginated, searchable list of users with submission stats
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { service } = auth;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const search = searchParams.get("search") ?? "";
    const roleFilter = searchParams.get("role") ?? "";
    const isActiveFilter = searchParams.get("is_active") ?? "";
    const sortBy = searchParams.get("sort_by") ?? "enrolled_at";
    const sortAsc = searchParams.get("sort_dir") === "asc";

    const allowedSorts = ["enrolled_at", "current_band", "full_name", "email", "created_at"];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : "enrolled_at";

    const offset = (page - 1) * limit;

    // Build base query
    let query = service
        .from("profiles")
        .select("*", { count: "exact" })
        .order(safeSort, { ascending: sortAsc })
        .range(offset, offset + limit - 1);

    // Search by name or email
    if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,display_name.ilike.%${search}%`);
    }

    // Role filter
    if (roleFilter) {
        query = query.eq("role", roleFilter);
    } else {
        // Exclude admins by default
        query = query.neq("role", "admin");
    }

    // Active filter
    if (isActiveFilter === "true") query = query.eq("is_active", true);
    else if (isActiveFilter === "false") query = query.eq("is_active", false);

    const { data: profiles, count, error } = await query;

    if (error) {
        console.error("[admin/users GET]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch submission counts + latest band for each user in one query
    const userIds = (profiles ?? []).map((p: any) => p.id);
    let submissionStats: Record<string, { count: number; latest_band: number | null }> = {};

    if (userIds.length > 0) {
        // Get all submissions for these users
        const { data: subs } = await service
            .from("essay_submissions")
            .select("user_id, submitted_at, feedback_results(overall_band)")
            .in("user_id", userIds)
            .order("submitted_at", { ascending: false });

        // Aggregate per user
        for (const sub of (subs ?? []) as any[]) {
            if (!submissionStats[sub.user_id]) {
                submissionStats[sub.user_id] = {
                    count: 0,
                    latest_band: sub.feedback_results?.[0]?.overall_band ?? null,
                };
            }
            submissionStats[sub.user_id].count++;
        }
    }

    const users = (profiles ?? []).map((p: any) => ({
        ...p,
        submission_count: submissionStats[p.id]?.count ?? 0,
        latest_band: submissionStats[p.id]?.latest_band ?? null,
    }));

    return NextResponse.json({
        users,
        total: count ?? 0,
        page,
        limit,
    });
}

// ── PATCH /api/admin/users ─────────────────────────────────────────────────
// Update a user profile
export async function PATCH(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { user: admin, service } = auth;

    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
        return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    // Whitelist updatable fields
    const allowed = ["full_name", "role", "is_active", "notes", "current_band", "target_band", "phone", "date_of_birth"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in fields) updates[key] = fields[key];
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await service
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("[admin/users PATCH]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog(service, admin.id, "EDIT_USER", {
        target_table: "profiles",
        target_id: id,
        detail: { updated_fields: Object.keys(updates) },
    });

    return NextResponse.json({ user: data });
}

// ── DELETE /api/admin/users ────────────────────────────────────────────────
// Soft-delete (deactivate) or hard-delete a user
export async function DELETE(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { user: admin, service } = auth;

    const body = await req.json();
    const { id, hard_delete = false } = body;

    if (!id) {
        return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    if (hard_delete) {
        const { error } = await service
            .from("profiles")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("[admin/users DELETE hard]", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        await writeAuditLog(service, admin.id, "DELETE_USER", {
            target_table: "profiles",
            target_id: id,
            detail: { hard_delete: true },
        });

        return NextResponse.json({ success: true, action: "hard_deleted" });
    } else {
        // Soft delete — set is_active = false
        const { error } = await service
            .from("profiles")
            .update({ is_active: false })
            .eq("id", id);

        if (error) {
            console.error("[admin/users DELETE soft]", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        await writeAuditLog(service, admin.id, "DEACTIVATE_USER", {
            target_table: "profiles",
            target_id: id,
        });

        return NextResponse.json({ success: true, action: "deactivated" });
    }
}
