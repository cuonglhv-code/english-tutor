"use client";

import { useState } from "react";
import { Download, Users, FileText, FileSpreadsheet, Loader2, UserPlus, Trophy } from "lucide-react";
import { useToast, ToastContainer } from "@/hooks/useToast";

const EXPORTS = [
    {
        type: "users",
        label: "Student List",
        icon: Users,
        description: "All student profiles with submission counts, current & target bands, phone numbers, enrolment date, and active status.",
        columns: "id · full_name · email · phone · role · current_band · target_band · enrolled_at · is_active · submission_count · last_submission_date",
    },
    {
        type: "guest_users",
        label: "Experience Leads (Guests)",
        icon: UserPlus,
        description: "All users who registered via the public Experience page.",
        columns: "All standard guest profile fields (id, name, email, phone, etc.)",
    },
    {
        type: "leaderboard",
        label: "Quiz Leaderboard",
        icon: Trophy,
        description: "All quiz attempts, including scores, time taken, question counts, and difficulty levels.",
        columns: "id · name · user_id (if logged in) · score · total_possible · time_seconds · question_count · difficulty · played_at",
    },
    {
        type: "submissions",
        label: "Submissions Log",
        icon: FileText,
        description: "Complete log of all essay submissions with IELTS band scores for all four criteria.",
        columns: "id · student_name · student_email · task_type · question_topic · overall_band · TA · CC · LR · GRA · submitted_at · word_count",
    },
    {
        type: "full_report",
        label: "Full Report",
        icon: FileSpreadsheet,
        description: "Combined CSV containing both the student list and submissions log in a single file, separated by section headers.",
        columns: "All columns from Student List + Submissions Log",
    },
];

export default function ExportPage() {
    const toast = useToast();
    const [loading, setLoading] = useState<string | null>(null);

    const doExport = async (type: string) => {
        setLoading(type);
        try {
            const res = await fetch(`/api/admin/export?type=${type}`);
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                toast.error(json.error ?? "Export failed");
                return;
            }
            const blob = await res.blob();
            const filename = res.headers.get("Content-Disposition")
                ?.match(/filename="(.+?)"/)?.[1]
                ?? `jaxtina-export-${type}.csv`;

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            toast.success(`${type} export downloaded`);
        } catch (e: any) {
            toast.error(e.message ?? "Export failed");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toast.toasts} />
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Export Data</h1>
                <p className="text-sm text-white/40 mt-1">Download CSV reports for offline analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {EXPORTS.map(({ type, label, icon: Icon, description, columns }) => (
                    <div key={type} className="bg-neutral-900 border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-5 hover:border-white/10 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-jaxtina-blue/10 flex items-center justify-center shrink-0">
                                <Icon className="h-5 w-5 text-jaxtina-blue" />
                            </div>
                            <div>
                                <h2 className="font-bold text-white">{label}</h2>
                                <p className="text-sm text-white/40 mt-1 leading-relaxed">{description}</p>
                            </div>
                        </div>

                        <div className="bg-neutral-800/50 rounded-xl p-3">
                            <p className="text-[10px] text-white/20 font-semibold uppercase tracking-wider mb-1">Columns</p>
                            <p className="text-[11px] text-white/40 leading-relaxed">{columns}</p>
                        </div>

                        <button
                            onClick={() => doExport(type)}
                            disabled={loading === type}
                            className="mt-auto w-full py-2.5 rounded-xl bg-jaxtina-blue/10 hover:bg-jaxtina-blue text-jaxtina-blue hover:text-white border border-jaxtina-blue/20 hover:border-jaxtina-blue text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading === type ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            {loading === type ? "Preparing…" : "Download CSV"}
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-neutral-900/50 border border-white/[0.04] rounded-xl p-4 flex items-start gap-3">
                <span className="text-yellow-500 text-lg shrink-0">ℹ</span>
                <p className="text-sm text-white/40 leading-relaxed">
                    All exports are processed server-side using the service role key and include all rows regardless of RLS policies.
                    Each export is logged to the audit trail with the row count.
                </p>
            </div>
        </div>
    );
}
