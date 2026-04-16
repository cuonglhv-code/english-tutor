"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useToast, ToastContainer } from "@/hooks/useToast";

interface AuditLog {
    id: string;
    admin_id: string;
    action: string;
    target_table: string | null;
    target_id: string | null;
    detail: Record<string, unknown> | null;
    performed_at: string;
    admin: { email: string; full_name: string | null } | null;
}

const ACTION_COLORS: Record<string, string> = {
    DELETE: "text-red-400 bg-red-500/10",
    DEACTIVATE: "text-orange-400 bg-orange-500/10",
    EDIT: "text-blue-400 bg-blue-500/10",
    ADD: "text-green-400 bg-green-500/10",
    EXPORT: "text-purple-400 bg-purple-500/10",
    SEND: "text-sky-400 bg-sky-500/10",
};
function actionColor(action: string) {
    for (const [key, cls] of Object.entries(ACTION_COLORS)) {
        if (action.startsWith(key)) return cls;
    }
    return "text-white/40 bg-white/5";
}

export default function AuditPage() {
    const toast = useToast();
    const { error: toastError } = toast;
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const LIMIT = 50;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({
            page: String(page),
            limit: String(LIMIT),
            ...(actionFilter && { action: actionFilter }),
            ...(dateFrom && { date_from: dateFrom }),
            ...(dateTo && { date_to: dateTo }),
        });
        const res = await fetch(`/api/admin/audit?${params}`);
        const json = await res.json();
        if (res.ok) { setLogs(json.logs ?? []); setTotal(json.total ?? 0); }
        else toastError(json.error ?? "Failed to load audit log");
        setLoading(false);
    }, [page, actionFilter, dateFrom, dateTo, toastError]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toast.toasts} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Audit Log</h1>
                    <p className="text-sm text-white/40 mt-1">{total} total entries</p>
                </div>
                <button onClick={() => setShowFilters(f => !f)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white/60 hover:text-white transition-colors">
                    <Filter className="h-4 w-4" />
                    Filters
                    {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl p-4 flex flex-wrap gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Action</label>
                        <input
                            placeholder="e.g. DELETE"
                            value={actionFilter}
                            onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                            className="bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white w-36 focus:outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">From</label>
                        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">To</label>
                        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                    </div>
                    <div className="flex items-end">
                        <button onClick={() => { setActionFilter(""); setDateFrom(""); setDateTo(""); setPage(1); }} className="px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-colors">Clear</button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-900/80">
                            <tr>
                                {["Timestamp", "Admin", "Action", "Target", "Detail"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-white/40 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-white/30" /></td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-white/30 italic">No audit entries found</td></tr>
                            ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                                        {new Date(log.performed_at).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-white/60 text-xs">
                                        {log.admin?.full_name || log.admin?.email || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${actionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-white/40 text-xs">
                                        {log.target_table && <span className="font-mono">{log.target_table}</span>}
                                        {log.target_id && <span className="text-white/20 ml-1">#{log.target_id.slice(0, 8)}…</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        {log.detail && (
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(log.detail).map(([k, v]) => (
                                                    <span key={k} className="text-[10px] bg-white/5 rounded-md px-1.5 py-0.5 text-white/40">
                                                        <span className="text-white/20">{k}:</span> {String(v)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs text-white/60 disabled:opacity-30 hover:text-white">← Prev</button>
                    <span className="text-xs text-white/30">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs text-white/60 disabled:opacity-30 hover:text-white">Next →</button>
                </div>
            )}
        </div>
    );
}
