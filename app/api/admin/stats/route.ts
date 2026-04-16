import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { service } = auth;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString();

    // Run all queries concurrently
    const [
        studentStatsRes,
        submissionsTotalRes,
        submissionsTodayRes,
        submissionsWeekRes,
        submissionsMonthRes,
        submissionsTaskRes,
        submissionsAllRes,
        questionsRes,
        bandDistRes,
    ] = await Promise.all([
        // Student aggregate stats from view
        service.from("admin_student_stats").select("*").single(),

        // Total submissions ever
        service.from("essay_submissions").select("id", { count: "exact", head: true }),

        // Submissions today
        service.from("essay_submissions")
            .select("id", { count: "exact", head: true })
            .gte("submitted_at", todayStart),

        // Submissions this week
        service.from("essay_submissions")
            .select("id", { count: "exact", head: true })
            .gte("submitted_at", weekStart),

        // Submissions this month
        service.from("essay_submissions")
            .select("id", { count: "exact", head: true })
            .gte("submitted_at", monthStart),

        // Task type breakdown
        service.from("essay_submissions")
            .select("task_type"),

        // Last 30 days raw for by_day grouping (with feedback join via view)
        service.from("essay_submissions")
            .select("submitted_at, task_type, feedback_results(overall_band)")
            .gte("submitted_at", thirtyDaysAgo)
            .order("submitted_at", { ascending: false }),

        // Questions (exercises) count by task_type
        service.from("exercises")
            .select("task_type")
            .eq("is_published", true),

        // Band distribution from feedback_results
        service.from("feedback_results")
            .select("overall_band"),
    ]);

    // ── Student stats ──────────────────────────────────────────────────────────
    const sv = studentStatsRes.data ?? {};
    const students = {
        total: Number(sv.total_students ?? 0),
        active: Number(sv.active_students ?? 0),
        avg_current_band: sv.avg_current_band ? Number(sv.avg_current_band) : null,
        avg_target_band: sv.avg_target_band ? Number(sv.avg_target_band) : null,
    };

    // ── By-task breakdown ──────────────────────────────────────────────────────
    const taskRows = submissionsTaskRes.data ?? [];
    const by_task_type = {
        task1: taskRows.filter((r: any) => r.task_type === "task1").length,
        task2: taskRows.filter((r: any) => r.task_type === "task2").length,
    };

    // ── by_day (last 30 days) ──────────────────────────────────────────────────
    const allRows = submissionsAllRes.data ?? [];
    const dayMap = new Map<string, { count: number; bands: number[] }>();
    for (const row of allRows as any[]) {
        const day = row.submitted_at.slice(0, 10); // "YYYY-MM-DD"
        if (!dayMap.has(day)) dayMap.set(day, { count: 0, bands: [] });
        const entry = dayMap.get(day)!;
        entry.count++;
        const band = row.feedback_results?.[0]?.overall_band;
        if (band != null) entry.bands.push(Number(band));
    }
    const by_day = Array.from(dayMap.entries())
        .map(([date, v]) => ({
            date,
            count: v.count,
            avg_band: v.bands.length ? +(v.bands.reduce((a, b) => a + b, 0) / v.bands.length).toFixed(1) : null,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // ── by_month (last 12 months via same raw data expanded) ──────────────────
    // Fetch 12 months data separately
    const twelveMonthRows = await service
        .from("essay_submissions")
        .select("submitted_at, feedback_results(overall_band)")
        .gte("submitted_at", twelveMonthsAgo);

    const monthMap = new Map<string, { count: number; bands: number[] }>();
    for (const row of (twelveMonthRows.data ?? []) as any[]) {
        const month = row.submitted_at.slice(0, 7); // "YYYY-MM"
        if (!monthMap.has(month)) monthMap.set(month, { count: 0, bands: [] });
        const entry = monthMap.get(month)!;
        entry.count++;
        const band = row.feedback_results?.[0]?.overall_band;
        if (band != null) entry.bands.push(Number(band));
    }
    const by_month = Array.from(monthMap.entries())
        .map(([month, v]) => ({
            month,
            count: v.count,
            avg_band: v.bands.length ? +(v.bands.reduce((a, b) => a + b, 0) / v.bands.length).toFixed(1) : null,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

    // ── Questions ──────────────────────────────────────────────────────────────
    const qRows = questionsRes.data ?? [];
    const questions = {
        total: qRows.length,
        task1: qRows.filter((r: any) => r.task_type === "task1").length,
        task2: qRows.filter((r: any) => r.task_type === "task2").length,
    };

    // ── Band distribution ──────────────────────────────────────────────────────
    const bandRows = bandDistRes.data ?? [];
    const bandCountMap = new Map<number, number>();
    for (let b = 1.0; b <= 9.0; b += 0.5) {
        bandCountMap.set(+b.toFixed(1), 0);
    }
    for (const r of bandRows as any[]) {
        const rounded = Math.round(Number(r.overall_band) * 2) / 2;
        if (bandCountMap.has(rounded)) {
            bandCountMap.set(rounded, bandCountMap.get(rounded)! + 1);
        }
    }
    const band_distribution = Array.from(bandCountMap.entries())
        .map(([band, count]) => ({ band, count }))
        .sort((a, b) => a.band - b.band);

    return NextResponse.json({
        students,
        submissions: {
            total_all_time: submissionsTotalRes.count ?? 0,
            today: submissionsTodayRes.count ?? 0,
            this_week: submissionsWeekRes.count ?? 0,
            this_month: submissionsMonthRes.count ?? 0,
            by_day,
            by_month,
            by_task_type,
        },
        questions,
        band_distribution,
    });
}
