import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getUserSubmissions } from "@/lib/supabase/submissions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const submissions = await getUserSubmissions(user.id);
        return NextResponse.json(submissions);
    } catch (err: any) {
        console.error("Error fetching submissions:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
