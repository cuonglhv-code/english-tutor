"use client";
import { useEffect, useRef } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
    title: string;
    description: string;
    confirmLabel?: string;
    danger?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    title,
    description,
    confirmLabel = "Confirm",
    danger = true,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onCancel]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div
                ref={ref}
                className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? "bg-red-500/10" : "bg-jaxtina-blue/10"}`}>
                            <AlertTriangle className={`h-5 w-5 ${danger ? "text-red-400" : "text-jaxtina-blue"}`} />
                        </div>
                        <h2 className="font-bold text-white text-base">{title}</h2>
                    </div>
                    <button onClick={onCancel} className="text-white/40 hover:text-white shrink-0">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-sm text-white/60 leading-relaxed pl-[52px]">{description}</p>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-5 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-colors disabled:opacity-60 ${danger ? "bg-red-600 hover:bg-red-500" : "bg-jaxtina-blue hover:bg-jaxtina-blue/80"
                            }`}
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
