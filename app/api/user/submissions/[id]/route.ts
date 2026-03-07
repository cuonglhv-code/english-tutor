import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

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
        const rawSubmission = await prisma.essaySubmission.findUnique({
            where: { id },
            include: {
                feedback_results: true,
            },
        });

        if (!rawSubmission || rawSubmission.user_id !== user.id) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Safely format dates and Prisma Decimals into primitive types
        const submission = {
            ...rawSubmission,
            submitted_at: rawSubmission.submitted_at.toISOString(),
            feedback_results: rawSubmission.feedback_results.map((fb) => ({
                ...fb,
                overall_band: Number(fb.overall_band),
                task_achievement_band: Number(fb.task_achievement_band),
                coherence_cohesion_band: Number(fb.coherence_cohesion_band),
                lexical_resource_band: Number(fb.lexical_resource_band),
                grammatical_range_accuracy_band: Number(fb.grammatical_range_accuracy_band),
                generated_at: fb.generated_at.toISOString(),
            })),
        };

        return NextResponse.json(submission);
    } catch (err: any) {
        console.error("Error fetching Prisma submission:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
