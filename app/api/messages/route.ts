import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

// GET /api/messages  — returns messages for the current user + unread count
export async function GET(_req: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch messages addressed to this user OR broadcasts (recipient_id IS NULL)
    const { data: messages, error } = await supabase
        .from("messages")
        .select(`
            id, subject, body, message_type, sent_at, is_read,
            sender:sender_id ( full_name, display_name, email )
        `)
        .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
        .order("sent_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const unread = (messages ?? []).filter((m: any) => !m.is_read).length;

    return NextResponse.json({ messages: messages ?? [], unread });
}
