import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, writeAuditLog } from "@/lib/admin-auth";

export const runtime = "nodejs";

// ─── CSV helpers ─────────────────────────────────────────────────────────────

function escapeCsv(val: unknown): string {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function toCsvRow(values: unknown[]): string {
    return values.map(escapeCsv).join(",");
}

function toCsv(headers: string[], rows: unknown[][]): string {
    return [headers.join(","), ...rows.map(toCsvRow)].join("\r\n");
}

// ── GET /api/admin/export ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { user: admin, service } = auth;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "users";

    if (!["users", "submissions", "full_report"].includes(type)) {
        return NextResponse.json({ error: "Invalid type. Must be users, submissions, or full_report" }, { status: 400 });
    }

    let csv = "";
    let rowCount = 0;
    const filename = `jaxtina-export-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === "users" || type === "full_report") {
        // Fetch users with submission counts
        const { data: users, error } = await service
            .from("profiles")
            .select("*")
            .neq("role", "admin")
            .order("enrolled_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Submission stats per user
        const userIds = (users ?? []).map((u: any) => u.id);
        let subMap: Record<string, { count: number; last_date: string | null }> = {};

        if (userIds.length > 0) {
            const { data: subs } = await service
                .from("essay_submissions")
                .select("user_id, submitted_at")
                .in("user_id", userIds)
                .order("submitted_at", { ascending: false });

            for (const s of (subs ?? []) as any[]) {
                if (!subMap[s.user_id]) {
                    subMap[s.user_id] = { count: 0, last_date: s.submitted_at };
                }
                subMap[s.user_id].count++;
            }
        }

        const userHeaders = [
            "id", "full_name", "email", "phone", "role",
            "current_band", "target_band", "enrolled_at", "is_active",
            "submission_count", "last_submission_date",
        ];

        const userRows = (users ?? []).map((u: any) => [
            u.id,
            u.full_name || u.display_name || "",
            u.email,
            u.phone ?? "",
            u.role,
            u.current_band ?? "",
            u.target_band ?? "",
            u.enrolled_at ?? u.created_at ?? "",
            u.is_active ?? true,
            subMap[u.id]?.count ?? 0,
            subMap[u.id]?.last_date ?? "",
        ]);

        rowCount = userRows.length;

        if (type === "users") {
            csv = toCsv(userHeaders, userRows);
        } else {
            // full_report — prepend user section, append submission section below
            csv += "=== STUDENTS ===\r\n" + toCsv(userHeaders, userRows) + "\r\n\r\n";
        }
    }

    if (type === "submissions" || type === "full_report") {
        const { data: subs, error } = await service
            .from("essay_submissions")
            .select(`
                id, task_type, prompt_text, essay_text, word_count, submitted_at,
                profiles(full_name, display_name, email),
                feedback_results(
                    overall_band, task_achievement_band, coherence_cohesion_band,
                    lexical_resource_band, grammatical_range_accuracy_band
                )
            `)
            .order("submitted_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const subHeaders = [
            "id", "student_name", "student_email", "task_type", "question_topic",
            "overall_band", "ta", "cc", "lr", "gra", "submitted_at", "word_count",
        ];

        const subRows = (subs ?? []).map((s: any) => {
            const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
            const fb = Array.isArray(s.feedback_results) ? s.feedback_results[0] : s.feedback_results;
            return [
                s.id,
                profile?.full_name || profile?.display_name || "",
                profile?.email || "",
                s.task_type,
                s.prompt_text?.slice(0, 120) ?? "",
                fb?.overall_band ?? "",
                fb?.task_achievement_band ?? "",
                fb?.coherence_cohesion_band ?? "",
                fb?.lexical_resource_band ?? "",
                fb?.grammatical_range_accuracy_band ?? "",
                s.submitted_at,
                s.word_count,
            ];
        });

        rowCount += subRows.length;

        if (type === "submissions") {
            csv = toCsv(subHeaders, subRows);
        } else {
            csv += "=== SUBMISSIONS ===\r\n" + toCsv(subHeaders, subRows);
        }
    }

    // Audit log
    await writeAuditLog(service, admin.id, "EXPORT_DATA", {
        detail: { type, row_count: rowCount },
    });

    return new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
