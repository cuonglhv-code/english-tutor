import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

// PATCH /api/messages/[id]/read  — marks a message as read
export async function PATCH(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Only allow marking a message as read if it's addressed to this user
    // (or a broadcast — recipient_id IS NULL). We use the anon client so
    // RLS enforces this automatically.
    const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", id)
        .or(`recipient_id.eq.${user.id},recipient_id.is.null`);

    if (error) {
        console.error("[messages/read PATCH]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
