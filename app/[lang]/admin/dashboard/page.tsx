import { createServiceClient } from "@/lib/supabase-server";
import OverviewClient from "@/components/admin/OverviewClient";

export const dynamic = "force-dynamic";

async function fetchStats() {
    const service = createServiceClient();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
        statsRes,
        totalCountRes,
        todayCountRes,
        weekCountRes,
        monthCountRes,
        taskRowsRes,
        bandsDataRes,
        byDayRes,
        byMonthRes
    ] = await Promise.all([
        service.from("admin_student_stats").select("*").single(),
        service.from("essay_submissions").select("*", { count: "exact", head: true }),
        service.from("essay_submissions").select("*", { count: "exact", head: true }).gte("submitted_at", todayStart.toISOString()),
        service.from("essay_submissions").select("*", { count: "exact", head: true }).gte("submitted_at", weekStart.toISOString()),
        service.from("essay_submissions").select("*", { count: "exact", head: true }).gte("submitted_at", monthStart.toISOString()),
        service.from("essay_submissions").select("task_type"),
        service.from("feedback_results").select("overall_band"),
        service
            .from("essay_submissions")
            .select("submitted_at, task_type, feedback_results(overall_band)")
            .gte("submitted_at", new Date(now.getTime() - 30 * 86400000).toISOString())
            .order("submitted_at", { ascending: true }),
        service
            .from("essay_submissions")
            .select("submitted_at, task_type, feedback_results(overall_band)")
            .gte("submitted_at", new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString())
            .order("submitted_at", { ascending: true }),
    ]);

    const sv = statsRes.data ?? {};
    const totalCount = totalCountRes.count ?? 0;
    const todayCount = todayCountRes.count ?? 0;
    const weekCount = weekCountRes.count ?? 0;
    const monthCount = monthCountRes.count ?? 0;
    const taskRows = taskRowsRes.data ?? [];
    const bandsData = bandsDataRes.data ?? [];
    const byDayData = byDayRes.data ?? [];
    const byMonthData = byMonthRes.data ?? [];

    // by_day
    const dayMap = new Map<string, { count: number; bands: number[]; t1: number; t2: number }>();
    for (const r of byDayData) {
        const day = new Date(r.submitted_at).toISOString().slice(0, 10);
        if (!dayMap.has(day)) dayMap.set(day, { count: 0, bands: [], t1: 0, t2: 0 });
        const e = dayMap.get(day)!;
        e.count++;
        if (r.task_type === "task1") e.t1++; else e.t2++;
        const b = r.feedback_results?.[0]?.overall_band;
        if (b != null) e.bands.push(Number(b));
    }
    const byDay = Array.from(dayMap.entries()).map(([date, v]) => ({
        date: date.slice(5),
        count: v.count,
        avg_band: v.bands.length ? +(v.bands.reduce((a, b) => a + b, 0) / v.bands.length).toFixed(1) : null,
    })).sort((a, b) => a.date.localeCompare(b.date));

    // by_month
    const monthMap = new Map<string, { t1: number; t2: number; bands: number[] }>();
    for (const r of byMonthData) {
        const m = new Date(r.submitted_at).toISOString().slice(0, 7);
        if (!monthMap.has(m)) monthMap.set(m, { t1: 0, t2: 0, bands: [] });
        const e = monthMap.get(m)!;
        if (r.task_type === "task1") e.t1++; else e.t2++;
        const b = r.feedback_results?.[0]?.overall_band;
        if (b != null) e.bands.push(Number(b));
    }
    const byMonth = Array.from(monthMap.entries()).map(([month, v]) => ({
        month: month.slice(0, 7),
        task1: v.t1,
        task2: v.t2,
        avg_band: v.bands.length ? +(v.bands.reduce((a, b) => a + b, 0) / v.bands.length).toFixed(1) : null,
    })).sort((a, b) => a.month.localeCompare(b.month));

    // band distribution
    const bandMap = new Map<number, number>();
    for (let b = 1.0; b <= 9.0; b += 0.5) bandMap.set(+b.toFixed(1), 0);
    for (const r of bandsData) {
        const rounded = Math.round(Number(r.overall_band) * 2) / 2;
        if (bandMap.has(rounded)) bandMap.set(rounded, bandMap.get(rounded)! + 1);
    }
    const bandDist = Array.from(bandMap.entries()).map(([band, count]) => ({ band, count }));

    return {
        students: {
            total: Number(sv.total_students ?? 0),
            active: Number(sv.active_students ?? 0),
            avg_current_band: sv.avg_current_band ? Number(sv.avg_current_band) : null,
            avg_target_band: sv.avg_target_band ? Number(sv.avg_target_band) : null,
        },
        submissions: {
            total: totalCount,
            today: todayCount,
            week: weekCount,
            month: monthCount,
            task1: taskRows.filter((r: any) => r.task_type === "task1").length,
            task2: taskRows.filter((r: any) => r.task_type === "task2").length,
        },
        byDay,
        byMonth,
        bandDist,
    };
}

export default async function AdminDashboardPage() {
    const stats = await fetchStats();
    return <OverviewClient stats={stats} />;
}
