"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, X, ChevronDown } from "lucide-react";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast, ToastContainer } from "@/hooks/useToast";

const QUESTION_TYPES = [
    "Opinion", "Discussion", "Adv/Disadv", "Cause/Solution",
    "Problem/Solution", "Positive/Negative", "Direct Question",
    "Bar Chart", "Line Graph", "Pie Chart", "Table", "Map", "Process", "Mixed",
];

interface Exercise {
    id: string;
    title: string;
    task_type: string;
    question_type: string | null;
    description: string | null;
    visual_description: string | null;
    visual_description_json: any;
    is_published: boolean;
    created_at: string;
}

const emptyForm = {
    task_type: "task2",
    title: "",
    question_type: "Opinion",
    description: "",
    visual_description: "",
    visual_description_json: "",
};

export default function QuestionsPage() {
    const toast = useToast();
    const { error: toastError } = toast;
    const [tab, setTab] = useState<"task1" | "task2">("task1");
    const [questions, setQuestions] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [jsonError, setJsonError] = useState("");
    const [confirm, setConfirm] = useState<{ q: Exercise; msg?: string } | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/admin/questions");
        const json = await res.json();
        if (res.ok) setQuestions(json.questions ?? []);
        else toastError(json.error ?? "Failed to load questions");
        setLoading(false);
    }, [toastError]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const filtered = questions.filter(q => q.task_type === tab);

    const openAdd = () => {
        setForm({ ...emptyForm, task_type: tab });
        setEditId(null);
        setJsonError("");
        setModal("add");
    };

    const openEdit = (q: Exercise) => {
        setForm({
            task_type: q.task_type,
            title: q.title,
            question_type: q.question_type ?? "Opinion",
            description: q.description ?? "",
            visual_description: q.visual_description ?? "",
            visual_description_json: q.visual_description_json ? JSON.stringify(q.visual_description_json, null, 2) : "",
        });
        setEditId(q.id);
        setJsonError("");
        setModal("edit");
    };

    const closeModal = () => { setModal(null); setEditId(null); };

    const validateAndSave = async () => {
        // Validate JSON for task1
        let parsedJson: any = null;
        if (form.task_type === "task1" && form.visual_description_json.trim()) {
            try {
                parsedJson = JSON.parse(form.visual_description_json);
                setJsonError("");
            } catch {
                setJsonError("Invalid JSON — please fix before saving.");
                return;
            }
        }

        setSaving(true);
        const body: Record<string, any> = {
            task_type: form.task_type,
            topic: form.title,
            question_type: form.question_type,
            prompt: form.description,
            ...(form.task_type === "task1" && {
                visual_description: form.visual_description || null,
                visual_description_json: parsedJson,
            }),
        };

        let url = "/api/admin/questions";
        let method = "POST";
        if (modal === "edit" && editId) {
            body.id = editId;
            method = "PATCH";
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const json = await res.json();
        if (res.ok) {
            toast.success(modal === "add" ? "Question added" : "Question updated");
            closeModal();
            fetchAll();
        } else {
            toast.error(json.error ?? "Save failed");
        }
        setSaving(false);
    };

    const deleteQuestion = async () => {
        if (!confirm) return;
        setConfirmLoading(true);
        const res = await fetch("/api/admin/questions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: confirm.q.id }),
        });
        const json = await res.json();
        if (res.ok) {
            toast.success("Question deleted");
            setConfirm(null);
            fetchAll();
        } else if (res.status === 409) {
            toast.error(json.error ?? "Cannot delete — has submissions");
            setConfirm(null);
        } else {
            toast.error(json.error ?? "Delete failed");
        }
        setConfirmLoading(false);
    };

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toast.toasts} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Question Bank</h1>
                    <p className="text-sm text-white/40 mt-1">{questions.length} total exercises</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 bg-jaxtina-blue hover:bg-jaxtina-blue/80 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                    <Plus className="h-4 w-4" /> Add Question
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-neutral-900 border border-white/[0.06] rounded-xl p-1 w-fit">
                {(["task1", "task2"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${tab === t ? "bg-jaxtina-blue text-white" : "text-white/40 hover:text-white"}`}>
                        {t === "task1" ? "Task 1" : "Task 2"}
                        <span className="ml-2 text-[10px] opacity-70">({questions.filter(q => q.task_type === t).length})</span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-900/80">
                        <tr>
                            {["Topic", "Question Type", "Published", "Actions"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-white/40 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {loading ? (
                            <tr><td colSpan={4} className="py-16 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-white/30" /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={4} className="py-16 text-center text-white/30 italic">No questions found for {tab}</td></tr>
                        ) : filtered.map(q => (
                            <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3 font-medium text-white max-w-xs truncate">{q.title}</td>
                                <td className="px-4 py-3 text-white/50 text-xs">{q.question_type}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${q.is_published ? "bg-green-500/10 text-green-400" : "bg-neutral-700 text-white/30"}`}>
                                        {q.is_published ? "Live" : "Draft"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button onClick={() => setConfirm({ q })} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                            <h2 className="font-bold text-white">{modal === "add" ? "Add Question" : "Edit Question"}</h2>
                            <button onClick={closeModal} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Task Type</label>
                                    <select value={form.task_type} onChange={e => setForm(f => ({ ...f, task_type: e.target.value }))} className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                                        <option value="task1">Task 1</option>
                                        <option value="task2">Task 2</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Question Type</label>
                                    <select value={form.question_type} onChange={e => setForm(f => ({ ...f, question_type: e.target.value }))} className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                                        {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Topic / Title</label>
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" placeholder="e.g. UK Telephone Calls 1995–2002" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Prompt / Instructions</label>
                                <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none" placeholder="The chart below shows…" />
                            </div>
                            {form.task_type === "task1" && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Visual Description (plain text)</label>
                                        <textarea rows={3} value={form.visual_description} onChange={e => setForm(f => ({ ...f, visual_description: e.target.value }))} className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none" placeholder="Describe the chart in plain English…" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Visual Description JSON</label>
                                        <textarea rows={6} value={form.visual_description_json} onChange={e => { setForm(f => ({ ...f, visual_description_json: e.target.value })); setJsonError(""); }} className={`w-full bg-neutral-800 border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none resize-none font-mono ${jsonError ? "border-red-500" : "border-white/10"}`} placeholder={'{\n  "visual_type": "Bar Chart",\n  "title": "…"\n}'} />
                                        {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-white/10 flex gap-3 shrink-0">
                            <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
                            <button onClick={validateAndSave} disabled={saving || !form.title.trim()} className="flex-1 py-2.5 rounded-xl bg-jaxtina-blue text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {modal === "add" ? "Add Question" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirm && (
                <ConfirmModal
                    title="Delete Question"
                    description={`Delete "${confirm.q.title}"? This is irreversible. If submissions reference this question, the delete will be blocked.`}
                    confirmLabel="Delete"
                    loading={confirmLoading}
                    onConfirm={deleteQuestion}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    );
}
