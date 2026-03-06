"use client";

import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
    ComposedChart,
} from "recharts";
import { Users, TrendingUp, Target, FileText, Calendar, CalendarDays, CalendarRange } from "lucide-react";

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
    label, value, sub, icon: Icon, accent = "jaxtina-blue",
}: { label: string; value: string | number; sub?: string; icon: any; accent?: string }) {
    return (
        <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-jaxtina-blue/10`}>
                <Icon className="h-5 w-5 text-jaxtina-blue" />
            </div>
            <div>
                <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-white mt-0.5">{value ?? "—"}</p>
                {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

const CHART_STYLE = { background: "transparent" };
const AXIS_STYLE = { fill: "#6b7280", fontSize: 11 };
const GRID_STYLE = { stroke: "#ffffff0f" };
const TOOLTIP_STYLE = {
    contentStyle: { background: "#1c1c1c", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 12 },
    labelStyle: { color: "#fff" },
    itemStyle: { color: "#94a3b8" },
};

// Band → color gradient
function bandColor(band: number) {
    if (band <= 4) return "#ef4444";
    if (band <= 5.5) return "#f97316";
    if (band <= 6.5) return "#eab308";
    if (band <= 7.5) return "#22c55e";
    return "#3b82f6";
}

interface Stats {
    students: { total: number; active: number; avg_current_band: number | null; avg_target_band: number | null };
    submissions: { total: number; today: number; week: number; month: number; task1: number; task2: number };
    byDay: Array<{ date: string; count: number; avg_band: number | null }>;
    byMonth: Array<{ month: string; task1: number; task2: number }>;
    bandDist: Array<{ band: number; count: number }>;
}

export default function OverviewClient({ stats }: { stats: Stats }) {
    const { students, submissions, byDay, byMonth, bandDist } = stats;

    const donutData = [
        { name: "Task 1", value: submissions.task1 },
        { name: "Task 2", value: submissions.task2 },
    ];
    const DONUT_COLORS = ["#1976D2", "#1a2744"];

    return (
        <div className="space-y-8">
            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Dashboard Overview</h1>
                <p className="text-sm text-white/40 mt-1">Live usage statistics for Jaxtina IELTS</p>
            </div>

            {/* Top 4 stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Active Students" value={students.active} sub={`of ${students.total} enrolled`} icon={Users} />
                <StatCard label="Avg Current Band" value={students.avg_current_band ?? "—"} icon={TrendingUp} />
                <StatCard label="Avg Target Band" value={students.avg_target_band ?? "—"} icon={Target} />
                <StatCard label="Total Submissions" value={submissions.total.toLocaleString()} icon={FileText} />
            </div>

            {/* Secondary 3 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Submissions Today" value={submissions.today} icon={Calendar} />
                <StatCard label="This Week" value={submissions.week} icon={CalendarDays} />
                <StatCard label="This Month" value={submissions.month} icon={CalendarRange} />
            </div>

            {/* Charts: 2-column grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Chart 1: Line — Submissions by Day */}
                <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4">Submissions by Day (last 30 days)</h3>
                    {byDay.length === 0 ? (
                        <EmptyChart />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <ComposedChart data={byDay} style={CHART_STYLE}>
                                <CartesianGrid {...GRID_STYLE} vertical={false} />
                                <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                <YAxis yAxisId="left" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 9]} tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <Tooltip {...TOOLTIP_STYLE} />
                                <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                                <Bar yAxisId="left" dataKey="count" fill="#1976D2" name="Submissions" radius={[3, 3, 0, 0]} maxBarSize={20} />
                                <Line yAxisId="right" type="monotone" dataKey="avg_band" stroke="#f97316" dot={false} strokeWidth={2} name="Avg Band" connectNulls />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Chart 2: Stacked Bar — Submissions by Month */}
                <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4">Submissions by Month (last 12 months)</h3>
                    {byMonth.length === 0 ? (
                        <EmptyChart />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={byMonth} style={CHART_STYLE}>
                                <CartesianGrid {...GRID_STYLE} vertical={false} />
                                <XAxis dataKey="month" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <Tooltip {...TOOLTIP_STYLE} />
                                <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                                <Bar dataKey="task1" stackId="a" fill="#1976D2" name="Task 1" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="task2" stackId="a" fill="#1a2744" name="Task 2" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Chart 3: Horizontal Bar — Band Distribution */}
                <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4">Band Score Distribution</h3>
                    {bandDist.every(b => b.count === 0) ? (
                        <EmptyChart />
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart layout="vertical" data={bandDist} style={CHART_STYLE} margin={{ left: 8 }}>
                                <CartesianGrid {...GRID_STYLE} horizontal={false} />
                                <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="band" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={32} />
                                <Tooltip {...TOOLTIP_STYLE} />
                                <Bar dataKey="count" name="Students" radius={[0, 4, 4, 0]} maxBarSize={16}>
                                    {bandDist.map((entry) => (
                                        <Cell key={entry.band} fill={bandColor(entry.band)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Chart 4: Donut — Task split */}
                <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl p-5 flex flex-col">
                    <h3 className="text-sm font-bold text-white mb-4">Task 1 vs Task 2 Split</h3>
                    {submissions.total === 0 ? (
                        <EmptyChart />
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart style={CHART_STYLE}>
                                    <Pie
                                        data={donutData}
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {donutData.map((_, i) => (
                                            <Cell key={i} fill={DONUT_COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip {...TOOLTIP_STYLE} />
                                    <Legend wrapperStyle={{ fontSize: 12, color: "#6b7280" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyChart() {
    return (
        <div className="h-[220px] flex items-center justify-center text-white/20 text-sm italic">
            No data yet
        </div>
    );
}
