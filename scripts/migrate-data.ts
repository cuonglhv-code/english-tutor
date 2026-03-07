import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function main() {
    console.log("Starting Migration from Supabase to Neon Postgres via Prisma...");

    // 1. Fetch Essay Submissions
    console.log("Fetching essay_submissions from Supabase...");
    const { data: submissions, error: subErr } = await supabase
        .from("essay_submissions")
        .select("*");

    if (subErr) {
        console.error("Failed to fetch submissions:", subErr);
        process.exit(1);
    }
    console.log(`Found ${submissions.length} submissions.`);

    // 2. Fetch Feedback Results
    console.log("Fetching feedback_results from Supabase...");
    const { data: feedbackResults, error: fbErr } = await supabase
        .from("feedback_results")
        .select("*");

    if (fbErr) {
        console.error("Failed to fetch feedback:", fbErr);
        process.exit(1);
    }
    console.log(`Found ${feedbackResults.length} feedback results.`);

    // 3. Fetch Questions (exercises)
    console.log("Fetching exercises from Supabase...");
    const { data: exercises, error: exErr } = await supabase
        .from("exercises")
        .select("*");

    if (exErr) {
        console.error("Failed to fetch exercises:", exErr);
        process.exit(1);
    }
    console.log(`Found ${exercises?.length || 0} exercises.`);

    // 4. Upsert into Prisma (Neon)
    let subCount = 0;
    for (const sub of submissions) {
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
    console.log(`Successfully migrated ${subCount} / ${submissions.length} submissions.`);

    let fbCount = 0;
    for (const fb of feedbackResults) {
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
    console.log(`Successfully migrated ${fbCount} / ${feedbackResults.length} feedback results.`);

    // 5. Upsert Questions into Prisma
    let exCount = 0;
    for (const ex of exercises || []) {
        try {
            await prisma.question.upsert({
                where: { id: ex.id },
                update: {},
                create: {
                    id: ex.id,
                    title: ex.title || "Untitled",
                    task_type: ex.task_type || "task2",
                    question_type: ex.question_type || null,
                    prompt_text: ex.description || ex.body_text || "",
                    image_url: ex.image_url || null,
                    visual_description: ex.visual_description || null,
                    visual_description_json: ex.visual_description_json || null,
                    is_published: ex.is_published ?? true,
                    created_at: new Date(ex.created_at || Date.now()),
                },
            });
            exCount++;
        } catch (e: any) {
            console.error(`Error inserting question ${ex.id}:`, e.message);
        }
    }
    console.log(`Successfully migrated ${exCount} / ${exercises?.length || 0} questions.`);

    console.log("Migration Complete! 🎉");
}

main()
    .catch((e) => {
        console.error("Fatal error during migration:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
