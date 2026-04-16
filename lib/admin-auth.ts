/**
 * Shared admin authentication helper.
 * Returns the authenticated admin user, or null if not admin.
 * Use this in every admin API route before any data operations.
 */
import { createClient, createServiceClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<
    | { user: { id: string; email: string }; service: ReturnType<typeof createServiceClient>; error: null }
    | { user: null; service: null; error: NextResponse }
> {
    // 1. Verify session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            user: null, service: null,
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        };
    }

    // 2. Verify admin role using service client (bypasses RLS)
    const service = createServiceClient();
    const { data: profile, error: profileError } = await service
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile || profile.role !== "admin") {
        return {
            user: null, service: null,
            error: NextResponse.json({ error: "Forbidden — admin access required" }, { status: 403 })
        };
    }

    return {
        user: { id: user.id, email: user.email ?? "" },
        service,
        error: null
    };
}

/** Append an entry to audit_log. Fire-and-forget — never throws. */
export async function writeAuditLog(
    service: ReturnType<typeof createServiceClient>,
    adminId: string,
    action: string,
    opts?: { target_table?: string; target_id?: string; detail?: Record<string, unknown> }
) {
    try {
        await service.from("audit_log").insert({
            admin_id: adminId,
            action,
            target_table: opts?.target_table ?? null,
            target_id: opts?.target_id ?? null,
            detail: opts?.detail ?? null,
        });
    } catch (e) {
        console.error("[audit_log] Failed to write:", e);
    }
}
