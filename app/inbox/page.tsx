"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mail, MailOpen, Loader2, ArrowLeft, Globe, Radio } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";

interface Message {
    id: string;
    subject: string;
    body: string;
    message_type: string;
    sent_at: string;
    is_read: boolean;
    recipient_id: string | null;
    sender: { full_name: string | null; display_name: string | null; email: string } | null;
}

function senderName(sender: Message["sender"]) {
    if (!sender) return "Jaxtina Admin";
    return sender.full_name || sender.display_name || sender.email;
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString();
}

export default function InboxPage() {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Message | null>(null);
    const realtimeRef = useRef<any>(null);

    const fetchMessages = useCallback(async () => {
        const res = await fetch("/api/messages");
        if (!res.ok) return;
        const json = await res.json();
        setMessages(json.messages ?? []);
        setLoading(false);
    }, []);

    // Mark a message read both locally and via API
    const markRead = useCallback(async (msg: Message) => {
        if (msg.is_read) return;
        // Optimistic update
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
        await fetch(`/api/messages/${msg.id}/read`, { method: "PATCH" });
    }, []);

    const openMessage = (msg: Message) => {
        setSelected(msg);
        markRead(msg);
    };

    // Supabase Realtime — subscribe to new messages for this user or broadcasts
    useEffect(() => {
        if (!user) return;

        const supabase = createBrowserClient();

        const channel = supabase
            .channel("inbox-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    // Supabase realtime filter: recipient is this user OR null (broadcast)
                    filter: `recipient_id=eq.${user.id}`,
                },
                (payload) => {
                    // New targeted message
                    const newMsg = { ...(payload.new as Message), is_read: false };
                    setMessages(prev => [newMsg, ...prev]);
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `recipient_id=is.null`,
                },
                (payload) => {
                    // New broadcast message
                    const newMsg = { ...(payload.new as Message), is_read: false };
                    setMessages(prev => [newMsg, ...prev]);
                }
            )
            .subscribe();

        realtimeRef.current = channel;
        return () => { supabase.removeChannel(channel); };
    }, [user]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const unread = messages.filter(m => !m.is_read).length;

    return (
        <div className="min-h-screen bg-neutral-950">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-3">
                            <Mail className="h-6 w-6 text-jaxtina-blue" />
                            Inbox
                            {unread > 0 && (
                                <span className="text-[11px] font-bold bg-jaxtina-red text-white px-2 py-0.5 rounded-full">
                                    {unread}
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-white/40 mt-0.5">Messages from your IELTS instructor</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[320px,1fr] gap-4">
                    {/* Message list */}
                    <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-5 w-5 animate-spin text-white/30" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="py-16 px-6 text-center">
                                <Mail className="h-8 w-8 text-white/10 mx-auto mb-3" />
                                <p className="text-white/30 text-sm italic">No messages yet</p>
                                <p className="text-white/20 text-xs mt-1">Announcements from your teacher will appear here</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-white/[0.04]">
                                {messages.map(msg => (
                                    <li key={msg.id}>
                                        <button
                                            onClick={() => openMessage(msg)}
                                            className={`w-full text-left px-4 py-3.5 hover:bg-white/[0.03] transition-colors flex gap-3 items-start ${selected?.id === msg.id ? "bg-jaxtina-blue/5 border-l-2 border-jaxtina-blue" : ""
                                                }`}
                                        >
                                            <div className="shrink-0 mt-0.5">
                                                {msg.is_read
                                                    ? <MailOpen className="h-4 w-4 text-white/20" />
                                                    : <Mail className="h-4 w-4 text-jaxtina-blue" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-sm truncate ${msg.is_read ? "text-white/50 font-normal" : "text-white font-semibold"}`}>
                                                        {msg.subject}
                                                    </p>
                                                    {!msg.is_read && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-jaxtina-blue shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {msg.recipient_id === null && (
                                                        <span className="text-[9px] font-bold bg-purple-500/10 text-purple-400 px-1.5 py-px rounded-full flex items-center gap-1">
                                                            <Globe className="h-2.5 w-2.5" /> Broadcast
                                                        </span>
                                                    )}
                                                    <p className="text-[11px] text-white/30 truncate">{senderName(msg.sender)}</p>
                                                    <span className="text-white/20 text-[10px] ml-auto shrink-0">{timeAgo(msg.sent_at)}</span>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Reading pane */}
                    <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl">
                        {!selected ? (
                            <div className="flex flex-col items-center justify-center h-full py-24 px-8 text-center">
                                <MailOpen className="h-10 w-10 text-white/10 mb-3" />
                                <p className="text-white/30 text-sm">Select a message to read it</p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-5">
                                {/* Message header */}
                                <div className="border-b border-white/[0.06] pb-5 space-y-2">
                                    <h2 className="text-lg font-bold text-white">{selected.subject}</h2>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                                        <span>
                                            From: <span className="text-white/60">{senderName(selected.sender)}</span>
                                        </span>
                                        <span>{new Date(selected.sent_at).toLocaleString()}</span>
                                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${selected.message_type === "email"
                                                ? "bg-blue-500/10 text-blue-400"
                                                : "bg-white/5 text-white/30"
                                            }`}>
                                            {selected.message_type === "email"
                                                ? <><Mail className="h-2.5 w-2.5" /> Email copy</>
                                                : <><Radio className="h-2.5 w-2.5" /> In-app</>
                                            }
                                        </span>
                                        {selected.recipient_id === null && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                                                <Globe className="h-2.5 w-2.5" /> Sent to all students
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                                    {selected.body}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
