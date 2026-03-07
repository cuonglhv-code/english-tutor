import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    // Simple auth for script endpoint: require admin or secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    try {
        console.log("Starting Migration from Supabase to Neon Postgres via Prisma...");

        // 1. Fetch Essay Submissions
        console.log("Fetching essay_submissions from Supabase...");
        const { data: submissions, error: subErr } = await supabase
            .from("essay_submissions")
            .select("*");

        if (subErr) throw subErr;

        // 2. Fetch Feedback Results
        console.log("Fetching feedback_results from Supabase...");
        const { data: feedbackResults, error: fbErr } = await supabase
            .from("feedback_results")
            .select("*");

        if (fbErr) throw fbErr;

        // 3. Upsert into Prisma (Neon)
        let subCount = 0;
        for (const sub of submissions || []) {
            try {
                await prisma.essaySubmission.upsert({
                    where: { id: sub.id },
                    update: {},
                    create: {
                        id: sub.id,
                        user_id: sub.user_id,
                        task_type: sub.task_type,
                        prompt_text: sub.prompt_text,
                        essay_text: sub.essay_text,
                        word_count: sub.word_count,
                        language: sub.language,
                        submitted_at: new Date(sub.submitted_at),
                        scoring_method: sub.scoring_method || "rule_based_fallback",
                    },
                });
                subCount++;
            } catch (e: any) {
                console.error(`Error inserting submission ${sub.id}:`, e.message);
            }
        }

        let fbCount = 0;
        for (const fb of feedbackResults || []) {
            try {
                await prisma.feedbackResult.upsert({
                    where: { id: fb.id },
                    update: {},
                    create: {
                        id: fb.id,
                        submission_id: fb.submission_id,
                        overall_band: fb.overall_band,
                        task_achievement_band: fb.task_achievement_band,
                        coherence_cohesion_band: fb.coherence_cohesion_band,
                        lexical_resource_band: fb.lexical_resource_band,
                        grammatical_range_accuracy_band: fb.grammatical_range_accuracy_band,
                        feedback_json: fb.feedback_json,
                        generated_at: new Date(fb.generated_at),
                    },
                });
                fbCount++;
            } catch (e: any) {
                console.error(`Error inserting feedback ${fb.id}:`, e.message);
            }
        }

        return NextResponse.json({
            success: true,
            migrated_submissions: subCount,
            migrated_feedback: fbCount,
            total_submissions: submissions?.length,
            total_feedback: feedbackResults?.length
        });

    } catch (err: any) {
        console.error("Migration fatal error:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
