import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSubmissionById } from "@/lib/supabase/submissions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const rawSubmission = await getSubmissionById(id);

        if (!rawSubmission || rawSubmission.user_id !== user.id) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(rawSubmission);
    } catch (err: any) {
        console.error("Error fetching submission:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
