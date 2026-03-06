"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronUp, ChevronDown, Loader2, Pencil, Trash2, ExternalLink, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast, ToastContainer } from "@/hooks/useToast";

type SortDir = "asc" | "desc";
type SortKey = "full_name" | "email" | "current_band" | "enrolled_at" | "submission_count";

interface Student {
    id: string;
    email: string;
    full_name: string | null;
    display_name: string | null;
    phone: string | null;
    role: string;
    current_band: number | null;
    target_band: number | null;
    is_active: boolean;
    enrolled_at: string | null;
    notes: string | null;
    submission_count: number;
    latest_band: number | null;
}

export default function StudentsPage() {
    const toast = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("enrolled_at");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [statusFilter, setStatusFilter] = useState("");

    // Edit panel
    const [editStudent, setEditStudent] = useState<Student | null>(null);
    const [editForm, setEditForm] = useState<Partial<Student>>({});
    const [editLoading, setEditLoading] = useState(false);

    // Confirm modal
    const [confirm, setConfirm] = useState<{ student: Student; action: "deactivate" | "delete" } | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const LIMIT = 20;

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({
            page: String(page),
            limit: String(LIMIT),
            sort_by: sortKey,
            sort_dir: sortDir,
            ...(debouncedSearch && { search: debouncedSearch }),
            ...(statusFilter && { is_active: statusFilter }),
        });
        const res = await fetch(`/api/admin/users?${params}`);
        const json = await res.json();
        if (res.ok) {
            setStudents(json.users ?? []);
            setTotal(json.total ?? 0);
        } else {
            toast.error(json.error ?? "Failed to load students");
        }
        setLoading(false);
    }, [page, debouncedSearch, sortKey, sortDir, statusFilter]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const SortIcon = ({ k }: { k: SortKey }) => (
        sortKey === k
            ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />)
            : null
    );

    const openEdit = (s: Student) => { setEditStudent(s); setEditForm({ ...s }); };
    const closeEdit = () => { setEditStudent(null); setEditForm({}); };

    const saveEdit = async () => {
        if (!editStudent) return;
        setEditLoading(true);
        const res = await fetch("/api/admin/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editStudent.id, ...editForm }),
        });
        const json = await res.json();
        if (res.ok) {
            toast.success("Student updated");
            closeEdit();
            fetchStudents();
        } else {
            toast.error(json.error ?? "Update failed");
        }
        setEditLoading(false);
    };

    const doConfirm = async () => {
        if (!confirm) return;
        setConfirmLoading(true);
        const res = await fetch("/api/admin/users", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: confirm.student.id,
                hard_delete: confirm.action === "delete",
            }),
        });
        const json = await res.json();
        if (res.ok) {
            toast.success(confirm.action === "delete" ? "Student deleted" : "Student deactivated");
            setConfirm(null);
            fetchStudents();
        } else {
            toast.error(json.error ?? "Action failed");
        }
        setConfirmLoading(false);
    };

    const totalPages = Math.ceil(total / LIMIT);
    const name = (s: Student) => s.full_name || s.display_name || s.email;

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toast.toasts} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Students</h1>
                    <p className="text-sm text-white/40 mt-1">{total} total</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name or email…"
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-jaxtina-blue/50"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none"
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-900/80">
                            <tr>
                                {[
                                    ["Name", "full_name"], ["Email", "email"],
                                    ["Band", "current_band"], ["Target", null],
                                    ["Essays", "submission_count"], ["Enrolled", "enrolled_at"],
                                    ["Status", null], ["Actions", null],
                                ].map(([label, key]) => (
                                    <th
                                        key={label as string}
                                        onClick={() => key && toggleSort(key as SortKey)}
                                        className={`px-4 py-3 text-left text-xs font-bold text-white/40 uppercase tracking-wider ${key ? "cursor-pointer hover:text-white/70" : ""}`}
                                    >
                                        {label}
                                        {key && <SortIcon k={key as SortKey} />}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr><td colSpan={8} className="py-20 text-center text-white/30"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan={8} className="py-20 text-center text-white/30 italic">No students found</td></tr>
                            ) : students.map(s => (
                                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{name(s)}</td>
                                    <td className="px-4 py-3 text-white/50 text-xs">{s.email}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-jaxtina-blue">{s.current_band ?? "—"}</span>
                                    </td>
                                    <td className="px-4 py-3 text-white/50">{s.target_band ?? "—"}</td>
                                    <td className="px-4 py-3 text-white/70">{s.submission_count}</td>
                                    <td className="px-4 py-3 text-white/30 text-xs">
                                        {s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.is_active ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                            {s.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Edit">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <Link href={`/admin/students/${s.id}/submissions`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="View Submissions">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Link>
                                            <button onClick={() => setConfirm({ student: s, action: "deactivate" })} className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-white/40 hover:text-yellow-400 transition-colors" title="Deactivate">
                                                <UserX className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => setConfirm({ student: s, action: "delete" })} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors" title="Delete">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
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
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs text-white/60 disabled:opacity-30 hover:text-white transition-colors">← Prev</button>
                    <span className="text-xs text-white/30">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs text-white/60 disabled:opacity-30 hover:text-white transition-colors">Next →</button>
                </div>
            )}

            {/* Edit slide-out panel */}
            {editStudent && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={closeEdit} />
                    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-neutral-900 border-l border-white/10 z-50 flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                            <h2 className="font-bold text-white">Edit Student</h2>
                            <button onClick={closeEdit} className="text-white/40 hover:text-white text-xl">×</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {[
                                ["Full Name", "full_name", "text"],
                                ["Phone", "phone", "text"],
                                ["Current Band", "current_band", "number"],
                                ["Target Band", "target_band", "number"],
                            ].map(([label, key, type]) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">{label}</label>
                                    <input
                                        type={type as string}
                                        step={type === "number" ? 0.5 : undefined}
                                        value={(editForm as any)[key as string] ?? ""}
                                        onChange={e => setEditForm(f => ({ ...f, [key as string]: type === "number" ? parseFloat(e.target.value) : e.target.value }))}
                                        className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-jaxtina-blue/50"
                                    />
                                </div>
                            ))}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Role</label>
                                <select
                                    value={(editForm as any).role ?? "user"}
                                    onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                >
                                    {["user", "student", "teacher", "admin"].map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer mt-2">
                                <input
                                    type="checkbox"
                                    checked={(editForm as any).is_active ?? true}
                                    onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))}
                                    className="w-4 h-4 accent-jaxtina-blue"
                                />
                                <span className="text-sm text-white/70 font-semibold">Account Active</span>
                            </label>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Admin Notes</label>
                                <textarea
                                    rows={3}
                                    value={(editForm as any).notes ?? ""}
                                    onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-white/10 flex gap-3">
                            <button onClick={closeEdit} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
                            <button onClick={saveEdit} disabled={editLoading} className="flex-1 py-2.5 rounded-xl bg-jaxtina-blue text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                                {editLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Confirm modal */}
            {confirm && (
                <ConfirmModal
                    title={confirm.action === "delete" ? "Delete Student" : "Deactivate Student"}
                    description={confirm.action === "delete"
                        ? `Permanently delete ${name(confirm.student)}? This cannot be undone.`
                        : `Deactivate ${name(confirm.student)}? They will lose access but data is preserved.`}
                    confirmLabel={confirm.action === "delete" ? "Delete" : "Deactivate"}
                    loading={confirmLoading}
                    onConfirm={doConfirm}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    );
}
