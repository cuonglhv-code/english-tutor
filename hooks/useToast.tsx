"use client";
import { useState, useCallback } from "react";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

let _id = 0;

/** Simple internal toast — no external library needed. */
export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const push = useCallback((message: string, type: Toast["type"] = "info") => {
        const id = ++_id;
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    }, []);

    const success = useCallback((m: string) => push(m, "success"), [push]);
    const error = useCallback((m: string) => push(m, "error"), [push]);
    const info = useCallback((m: string) => push(m, "info"), [push]);

    return { toasts, success, error, info };
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
    if (toasts.length === 0) return null;
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 pointer-events-auto animate-in slide-in-from-right-4 ${t.type === "success" ? "bg-green-600 text-white"
                            : t.type === "error" ? "bg-red-600 text-white"
                                : "bg-neutral-800 text-white"
                        }`}
                >
                    <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
                    {t.message}
                </div>
            ))}
        </div>
    );
}
