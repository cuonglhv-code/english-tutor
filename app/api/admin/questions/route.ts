import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, writeAuditLog } from "@/lib/admin-auth";

export const runtime = "nodejs";

// ── GET /api/admin/questions ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { service } = auth;

    const { searchParams } = new URL(req.url);
    const taskType = searchParams.get("task_type") ?? "";
    const questionType = searchParams.get("question_type") ?? "";

    let query = service
        .from("exercises")
        .select("*")
        .order("created_at", { ascending: false });

    if (taskType) query = query.eq("task_type", taskType);
    if (questionType) query = query.ilike("question_type", `%${questionType}%`);

    const { data, error } = await query;

    if (error) {
        console.error("[admin/questions GET]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions: data ?? [], total: data?.length ?? 0 });
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

    const { data, error } = await service
        .from("exercises")
        .insert({
            title: topic,
            skill: "writing",
            task_type,
            question_type: type || question_type || null,
            description: prompt || null,
            body_text: prompt || null,
            visual_description: visual_description ?? null,
            visual_description_json: visual_description_json ?? null,
            is_published: true,
        })
        .select()
        .single();

    if (error) {
        console.error("[admin/questions POST]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog(service, admin.id, "ADD_QUESTION", {
        target_table: "exercises",
        target_id: data.id,
        detail: { topic, task_type },
    });

    return NextResponse.json({ question: data }, { status: 201 });
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

    const allowed = [
        "title", "task_type", "question_type", "description", "body_text",
        "image_url", "visual_description", "visual_description_json", "is_published",
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in fields) updates[key] = fields[key];
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await service
        .from("exercises")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("[admin/questions PATCH]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog(service, admin.id, "EDIT_QUESTION", {
        target_table: "exercises",
        target_id: id,
        detail: { updated_fields: Object.keys(updates) },
    });

    return NextResponse.json({ question: data });
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

    // Fetch the question row first for the title
    const { data: qRow } = await service
        .from("exercises")
        .select("title, description")
        .eq("id", id)
        .single();

    // Block delete if submissions reference this question's prompt text
    const questionPrompt = qRow?.description || qRow?.title || "";
    if (questionPrompt) {
        const { count } = await service
            .from("essay_submissions")
            .select("id", { count: "exact", head: true })
            .eq("prompt_text", questionPrompt);

        if (count && count > 0) {
            return NextResponse.json(
                {
                    error: `Cannot delete — this question has ${count} associated submission(s). Unpublish it instead.`,
                    submission_count: count,
                },
                { status: 409 }
            );
        }
    }

    const { error } = await service.from("exercises").delete().eq("id", id);

    if (error) {
        console.error("[admin/questions DELETE]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog(service, admin.id, "DELETE_QUESTION", {
        target_table: "exercises",
        target_id: id,
        detail: { title: qRow?.title },
    });

    return NextResponse.json({ success: true });
}
