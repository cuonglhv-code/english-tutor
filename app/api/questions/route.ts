import { NextResponse } from "next/server";
import { listPublishedQuestions } from "@/lib/supabase/questions";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const questions = await listPublishedQuestions();

        const mappedQuestions = questions.map((q) => ({
            id: q.id,
            task_type: q.task_type,
            question_type: q.question_type,
            source: "External",
            description: q.body_text,
            body_text: q.body_text,
            image_url: q.image_url,
            visual_description: q.visual_description,
            visual_description_json: q.visual_description_json,
        }));

        return NextResponse.json(mappedQuestions);
    } catch (err: any) {
        console.error("[api/questions GET]", err);
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }
}
