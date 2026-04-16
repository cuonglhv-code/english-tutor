import { createServiceClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const service = createServiceClient();

    const { data: profile } = await service
        .from("profiles")
        .select("full_name, display_name, email, current_band, target_band")
        .eq("id", id)
        .single();

    if (!profile) notFound();

    const { data: subs } = await service
        .from("essay_submissions")
        .select(`id, task_type, prompt_text, essay_text, word_count, submitted_at, feedback_results(overall_band, task_achievement_band, coherence_cohesion_band, lexical_resource_band, grammatical_range_accuracy_band, feedback_json)`)
        .eq("user_id", id)
        .order("submitted_at", { ascending: false });

    const name = profile.full_name || profile.display_name || profile.email;

    return (
        <div className="space-y-6">
            <Link href="/admin/students" className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors w-fit">
                <ArrowLeft className="h-4 w-4" /> Back to Students
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white">{name}</h1>
                    <p className="text-sm text-white/40">{profile.email} · {subs?.length ?? 0} submissions</p>
                </div>
                <div className="flex gap-4">
                    {profile.current_band && (
                        <div className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Current</p>
                            <p className="text-xl font-black text-jaxtina-blue">{profile.current_band}</p>
                        </div>
                    )}
                    {profile.target_band && (
                        <div className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Target</p>
                            <p className="text-xl font-black text-green-400">{profile.target_band}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Submissions accordion */}
            <div className="space-y-3">
                {!subs || subs.length === 0 ? (
                    <div className="text-center py-20 text-white/30 italic bg-neutral-900 border border-white/[0.06] rounded-2xl">
                        No submissions yet for this student
                    </div>
                ) : (subs as any[]).map(sub => {
                    const fb = Array.isArray(sub.feedback_results) ? sub.feedback_results[0] : sub.feedback_results;
                    return (
                        <details key={sub.id} className="group bg-neutral-900 border border-white/[0.06] rounded-2xl overflow-hidden">
                            <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer list-none hover:bg-white/[0.02] transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.task_type === "task1" ? "bg-jaxtina-blue/20 text-jaxtina-blue" : "bg-orange-500/15 text-orange-400"}`}>
                                            {sub.task_type?.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-white/30">{new Date(sub.submitted_at).toLocaleString()}</span>
                                        {sub.word_count && <span className="text-xs text-white/20">{sub.word_count}w</span>}
                                    </div>
                                    <p className="text-sm text-white/70 mt-1 truncate">{sub.prompt_text}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {fb?.overall_band != null && (
                                        <span className="text-xl font-black text-jaxtina-blue">{fb.overall_band}</span>
                                    )}
                                    <ChevronDown className="h-4 w-4 text-white/30 group-open:rotate-180 transition-transform" />
                                </div>
                            </summary>
                            <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-4">
                                {/* Band scores */}
                                {fb && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            ["TA", fb.task_achievement_band],
                                            ["CC", fb.coherence_cohesion_band],
                                            ["LR", fb.lexical_resource_band],
                                            ["GRA", fb.grammatical_range_accuracy_band],
                                        ].map(([label, val]) => (
                                            <div key={label as string} className="bg-neutral-800 rounded-xl p-3 text-center">
                                                <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
                                                <p className="text-lg font-black text-white">{val ?? "—"}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* Essay text */}
                                <div className="bg-neutral-950/50 rounded-xl p-4">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Student Essay</p>
                                    <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{sub.essay_text}</p>
                                </div>
                                {/* Examiner summary */}
                                {fb?.feedback_json?.examiner_summary && (
                                    <div className="bg-jaxtina-blue/5 border border-jaxtina-blue/20 rounded-xl p-4">
                                        <p className="text-[10px] text-jaxtina-blue/70 uppercase tracking-wider mb-1">Examiner Summary</p>
                                        <p className="text-sm text-white/70 leading-relaxed">{fb.feedback_json.examiner_summary}</p>
                                    </div>
                                )}
                            </div>
                        </details>
                    );
                })}
            </div>
        </div>
    );
}
