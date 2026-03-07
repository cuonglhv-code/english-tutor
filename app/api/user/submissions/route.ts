import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

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
        const rawSubmissions = await prisma.essaySubmission.findMany({
            where: { user_id: user.id },
            include: {
                feedback_results: true,
            },
            orderBy: { submitted_at: "desc" },
        });

        // Safely format dates and Prisma Decimals into primitive types
        const submissions = rawSubmissions.map((sub) => ({
            ...sub,
            submitted_at: sub.submitted_at.toISOString(),
            feedback_results: sub.feedback_results.map((fb) => ({
                ...fb,
                overall_band: Number(fb.overall_band),
                task_achievement_band: Number(fb.task_achievement_band),
                coherence_cohesion_band: Number(fb.coherence_cohesion_band),
                lexical_resource_band: Number(fb.lexical_resource_band),
                grammatical_range_accuracy_band: Number(fb.grammatical_range_accuracy_band),
                generated_at: fb.generated_at.toISOString(),
            })),
        }));

        return NextResponse.json(submissions);
    } catch (err: any) {
        console.error("Error fetching Prisma submissions:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
