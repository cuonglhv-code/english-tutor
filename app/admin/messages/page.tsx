"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Loader2, ChevronDown, Radio, Mail } from "lucide-react";
import { useToast, ToastContainer } from "@/hooks/useToast";

interface Message {
    id: string;
    subject: string;
    body: string;
    message_type: string;
    sent_at: string;
    recipient_id: string | null;
    recipient: { email: string; full_name: string | null } | null;
}

const DEFAULT_FORM = {
    recipient_id: "",    // "" = broadcast
    subject: "",
    body: "",
    message_type: "in_app" as "in_app" | "email",
};

export default function MessagesPage() {
    const toast = useToast();
    const [form, setForm] = useState({ ...DEFAULT_FORM });
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const LIMIT = 20;

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/admin/messages?page=${page}&limit=${LIMIT}`);
        const json = await res.json();
        if (res.ok) { setMessages(json.messages ?? []); setTotal(json.total ?? 0); }
        setLoading(false);
    }, [page]);

    useEffect(() => { fetchMessages(); }, [fetchMessages]);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.body.length < 10) { toast.error("Message body must be at least 10 characters"); return; }
        setSending(true);
        const res = await fetch("/api/admin/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recipient_id: form.recipient_id || null,
                subject: form.subject,
                body: form.body,
                message_type: form.message_type,
            }),
        });
        const json = await res.json();
        if (res.ok) {
            toast.success(`Sent to ${json.recipient_count ?? "—"} recipient(s)`);
            if (json.warning) toast.info(json.warning);
            setForm({ ...DEFAULT_FORM });
            fetchMessages();
        } else {
            toast.error(json.error ?? "Failed to send");
        }
        setSending(false);
    };

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toast.toasts} />
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Messages</h1>
                <p className="text-sm text-white/40 mt-1">Send announcements to students</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compose */}
                <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl p-6">
                    <h2 className="font-bold text-white mb-5 flex items-center gap-2"><Send className="h-4 w-4 text-jaxtina-blue" /> Compose</h2>
                    <form onSubmit={send} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Recipient</label>
                            <select
                                value={form.recipient_id}
                                onChange={e => setForm(f => ({ ...f, recipient_id: e.target.value }))}
                                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                            >
                                <option value="">📣 All Students (Broadcast)</option>
                                {/* In a real flow, you'd populate this from the students list */}
                            </select>
                            <p className="text-[10px] text-white/30 mt-1">Leave as broadcast to message all active students at once.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Subject</label>
                            <input
                                required
                                value={form.subject}
                                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                placeholder="e.g. Important announcement…"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Message</label>
                            <textarea
                                required
                                rows={5}
                                value={form.body}
                                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
                                placeholder="Write your message here…"
                            />
                            <p className="text-[10px] text-white/30">{form.body.length} chars (min 10)</p>
                        </div>

                        {/* Message type toggle */}
                        <div className="flex gap-2">
                            {(["in_app", "email"] as const).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, message_type: t }))}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${form.message_type === t ? "bg-jaxtina-blue border-jaxtina-blue text-white" : "border-white/10 text-white/40 hover:text-white"}`}
                                >
                                    {t === "in_app" ? <Radio className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                                    {t === "in_app" ? "In-App" : "Email"}
                                </button>
                            ))}
                        </div>
                        {form.message_type === "email" && (
                            <p className="text-[10px] text-yellow-500/70">Requires RESEND_API_KEY to be configured. Falls back to in-app if not set.</p>
                        )}

                        <button type="submit" disabled={sending} className="w-full py-3 rounded-xl bg-jaxtina-blue text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors hover:bg-jaxtina-blue/80">
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {sending ? "Sending…" : "Send Message"}
                        </button>
                    </form>
                </div>

                {/* Sent messages */}
                <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl p-6 flex flex-col">
                    <h2 className="font-bold text-white mb-4">Sent Messages</h2>
                    <div className="flex-1 min-h-0 space-y-2 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
                        ) : messages.length === 0 ? (
                            <p className="text-center text-white/30 italic py-10">No messages sent yet</p>
                        ) : messages.map(m => (
                            <div key={m.id} className="bg-neutral-800/50 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(e => e === m.id ? null : m.id)}
                                    className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{m.subject}</p>
                                        <p className="text-[11px] text-white/40 mt-0.5">
                                            {m.recipient_id ? m.recipient?.email : "📣 Broadcast"} · {m.message_type} · {new Date(m.sent_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-white/30 shrink-0 mt-0.5 transition-transform ${expandedId === m.id ? "rotate-180" : ""}`} />
                                </button>
                                {expandedId === m.id && (
                                    <div className="px-3 pb-3 pt-1 border-t border-white/[0.06]">
                                        <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{m.body}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-white/[0.06]">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg bg-neutral-800 text-xs text-white/60 disabled:opacity-30">← Prev</button>
                            <span className="text-xs text-white/30">{page}/{totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-lg bg-neutral-800 text-xs text-white/60 disabled:opacity-30">Next →</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
