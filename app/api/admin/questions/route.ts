import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, writeAuditLog } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// ── GET /api/admin/questions ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const taskType = searchParams.get("task_type") ?? "";
    const questionType = searchParams.get("question_type") ?? "";

    try {
        const whereClause: any = {};
        if (taskType) whereClause.task_type = taskType;
        if (questionType) whereClause.question_type = { contains: questionType, mode: "insensitive" };

        const questions = await prisma.question.findMany({
            where: whereClause,
            orderBy: { created_at: "desc" },
        });

        const mappedQuestions = questions.map((q) => ({
            id: q.id,
            title: q.title,
            task_type: q.task_type,
            question_type: q.question_type,
            description: q.prompt_text,
            visual_description: q.visual_description,
            visual_description_json: q.visual_description_json,
            is_published: q.is_published,
            created_at: q.created_at.toISOString(),
        }));

        return NextResponse.json({ questions: mappedQuestions, total: mappedQuestions.length });
    } catch (err: any) {
        console.error("[admin/questions GET]", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── POST /api/admin/questions ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { user: admin, service } = auth;

    const body = await req.json();
    const {
        task_type,
        type,            // visual type label e.g. "Bar Chart"
        topic,           // used as title
        question_type,   // IELTS sub-type e.g. "Opinion"
        visual_description,
        visual_description_json,
        prompt,          // the full question prompt text
    } = body;

    if (!topic || !task_type) {
        return NextResponse.json({ error: "Fields 'topic' and 'task_type' are required" }, { status: 400 });
    }

    if (!["task1", "task2"].includes(task_type)) {
        return NextResponse.json({ error: "task_type must be 'task1' or 'task2'" }, { status: 400 });
    }

    try {
        const newQuestion = await prisma.question.create({
            data: {
                title: topic,
                task_type,
                question_type: type || question_type || null,
                prompt_text: prompt || "",
                visual_description: visual_description ?? null,
                visual_description_json: visual_description_json ?? null,
                is_published: true,
            }
        });

        await writeAuditLog(service, admin.id, "ADD_QUESTION", {
            target_table: "questions",
            target_id: newQuestion.id,
            detail: { topic, task_type },
        });

        return NextResponse.json({ question: newQuestion }, { status: 201 });
    } catch (err: any) {
        console.error("[admin/questions POST]", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── PATCH /api/admin/questions ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { user: admin, service } = auth;

    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
        return NextResponse.json({ error: "Missing question id" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if ("title" in fields) updates.title = fields.title;
    if ("task_type" in fields) updates.task_type = fields.task_type;
    if ("question_type" in fields) updates.question_type = fields.question_type;
    if ("description" in fields) updates.prompt_text = fields.description;
    if ("prompt" in fields) updates.prompt_text = fields.prompt;
    if ("image_url" in fields) updates.image_url = fields.image_url;
    if ("visual_description" in fields) updates.visual_description = fields.visual_description;
    if ("visual_description_json" in fields) updates.visual_description_json = fields.visual_description_json;
    if ("is_published" in fields) updates.is_published = fields.is_published;

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    try {
        const updatedQuestion = await prisma.question.update({
            where: { id },
            data: updates,
        });

        await writeAuditLog(service, admin.id, "EDIT_QUESTION", {
            target_table: "questions",
            target_id: id,
            detail: { updated_fields: Object.keys(updates) },
        });

        return NextResponse.json({ question: updatedQuestion });
    } catch (err: any) {
        console.error("[admin/questions PATCH]", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── DELETE /api/admin/questions ────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { user: admin, service } = auth;

    const body = await req.json();
    const { id } = body;

    if (!id) {
        return NextResponse.json({ error: "Missing question id" }, { status: 400 });
    }

    try {
        const qRow = await prisma.question.findUnique({
            where: { id },
            select: { title: true, prompt_text: true }
        });

        const questionPrompt = qRow?.prompt_text || qRow?.title || "";
        if (questionPrompt) {
            const count = await prisma.essaySubmission.count({
                where: { prompt_text: questionPrompt }
            });

            if (count > 0) {
                return NextResponse.json(
                    {
                        error: `Cannot delete — this question has ${count} associated submission(s). Unpublish it instead.`,
                        submission_count: count,
                    },
                    { status: 409 }
                );
            }
        }

        await prisma.question.delete({ where: { id } });

        await writeAuditLog(service, admin.id, "DELETE_QUESTION", {
            target_table: "questions",
            target_id: id,
            detail: { title: qRow?.title },
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[admin/questions DELETE]", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
