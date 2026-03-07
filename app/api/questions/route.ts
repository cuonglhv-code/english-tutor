import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const questions = await prisma.question.findMany({
            where: { is_published: true },
            orderBy: { created_at: "desc" },
        });

        const mappedQuestions = questions.map((q) => ({
            id: q.id,
            task_type: q.task_type,
            question_type: q.question_type,
            source: "External",
            description: q.prompt_text,
            body_text: q.prompt_text,
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
