"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Search, Filter, PenLine, CheckCircle2, BookMarked,
    RotateCcw, ChevronDown, ChevronUp, Library, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/useUser";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
    SEED_QUESTIONS,
    TASK1_TYPES,
    TASK2_TYPES,
    SOURCES,
    TYPE_COLORS,
    type PracticeQuestion,
} from "@/lib/questionBank";
import Task1Uploader from "@/components/Task1Uploader";

// ─── Proxy helper ────────────────────────────────────────────────────────────
function proxyImg(url: string) {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&output=jpg`;
}

// ─── Modern Task card ────────────────────────────────────────────────────────
function TaskCard({
    q,
    done,
    onPractice,
}: {
    q: PracticeQuestion;
    done: boolean;
    onPractice: (q: PracticeQuestion) => void;
}) {
    const typeColor = TYPE_COLORS[q.type] ?? "bg-surface-container-low text-on-surface-variant";
    const [imgStatus, setImgStatus] = useState<"loading" | "ok" | "error">(
        q.imageUrl ? "loading" : "ok"
    );

    return (
        <div className="group bg-white rounded-[32px] shadow-premium hover:shadow-2xl transition-all duration-700 flex flex-col overflow-hidden border-none hover:-translate-y-2">
            {/* Image or placeholder */}
            <div className="relative w-full h-48 bg-surface-container-low shrink-0 overflow-hidden">
                {q.imageUrl ? (
                    <>
                        {imgStatus === "loading" && (
                            <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={proxyImg(q.imageUrl)}
                            alt="chart"
                            className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${imgStatus === "ok" ? "opacity-100" : "opacity-0"}`}
                            onLoad={() => setImgStatus("ok")}
                            onError={() => setImgStatus("error")}
                        />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-10 font-black italic">
                        {q.task === "Task 1" ? "📊" : "✍️"}
                    </div>
                )}
                
                <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white/90 backdrop-blur-md text-primary font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border-none shadow-sm">
                        {q.task}
                    </Badge>
                </div>

                {done && (
                    <div className="absolute top-4 right-4">
                        <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-8 flex flex-col flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${typeColor} border-none`}>
                        {q.type}
                    </span>
                    {q.source && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant/40 border-none">
                            {q.source}
                        </span>
                    )}
                </div>

                <p className="text-base text-on-surface-variant font-medium line-clamp-3 flex-1 mb-8 leading-relaxed opacity-80">
                    {q.questionText}
                </p>

                <Button
                    onClick={() => onPractice(q)}
                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all active:scale-95 ${done ? "bg-surface-container-low text-primary hover:bg-surface-container-high" : "bg-primary text-white hover:bg-primary/90 shadow-primary/10"}`}
                >
                    {done ? (
                        <>
                            <RotateCcw className="h-4 w-4 mr-3" /> Redo Masterclass
                        </>
                    ) : (
                        <>
                            <PenLine className="h-4 w-4 mr-3" /> Practice Hub
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

export default function PracticeLibraryPage() {
    const { user, loading: userLoading } = useUser();
    const { dict, lang } = useTranslation();
    const router = useRouter();

    const [taskFilter, setTaskFilter] = useState<"All" | "Task 1" | "Task 2">("All");
    const [typeFilters, setTypeFilters] = useState<string[]>([]);
    const [sourceFilters, setSourceFilters] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [doneTab, setDoneTab] = useState<"todo" | "all" | "done">("all");
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [dbQuestions, setDbQuestions] = useState<PracticeQuestion[]>([]);
    const [activeTab, setActiveTab] = useState<"task1" | "task2">("task2");

    // Task 1 question-selector state
    const [selectedTask1Q, setSelectedTask1Q] = useState<PracticeQuestion | null>(null);
    const [task1Mode, setTask1Mode] = useState<"bank" | "upload">("bank");

    const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    // Fetch dynamic questions from Supabase
    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/questions");
                if (res.ok) {
                    const data = await res.json();
                    const mapped: PracticeQuestion[] = data.map((ex: any) => ({
                        id: ex.id,
                        task: ex.task_type === "task1" ? "Task 1" : "Task 2",
                        type: ex.question_type || (ex.task_type === "task1" ? "Task 1" : "Task 2"),
                        source: ex.source || "External",
                        questionText: ex.description || ex.body_text || "",
                        imageUrl: ex.image_url || ""
                    }));
                    setDbQuestions(mapped);
                }
            } catch (err) {
                console.error("Failed to load practice questions:", err);
            }
            setLoading(false);
        };
        fetchQuestions();
    }, []);

    const allQuestions = useMemo(() => {
        return [...dbQuestions, ...SEED_QUESTIONS];
    }, [dbQuestions]);

    // Load submitted question IDs
    useEffect(() => {
        if (!user) return;
        fetch("/api/user/submissions")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const dbQuestionIdSet = new Set(data.map((r: any) => r.question_id).filter(Boolean));
                    const promptSet = new Set(data.map((r: any) => r.prompt_text?.trim()).filter(Boolean));
                    
                    const ids = new Set(
                        allQuestions
                            .filter((q) => dbQuestionIdSet.has(q.id) || promptSet.has(q.questionText.trim()))
                            .map((q) => q.id)
                    );
                    setDoneIds(ids);
                }
            });
    }, [user, allQuestions]);

    const filtered = allQuestions.filter((q) => {
        if (taskFilter !== "All" && q.task !== taskFilter) return false;
        if (typeFilters.length && !typeFilters.includes(q.type)) return false;
        if (sourceFilters.length && !sourceFilters.includes(q.source)) return false;
        if (search && !q.questionText.toLowerCase().includes(search.toLowerCase())) return false;
        if (doneTab === "done" && user) return doneIds.has(q.id);
        if (doneTab === "todo" && user) return !doneIds.has(q.id);
        return true;
    });

    function handlePractice(q: PracticeQuestion) {
        const taskNumber: "1" | "2" = q.task === "Task 1" ? "1" : "2";
        const isGTLetter = q.type.startsWith("GT -");
        const taskType: "academic" | "general" = isGTLetter ? "general" : "academic";

        sessionStorage.setItem(
            "practice_question",
            JSON.stringify({
                question: q.questionText,
                question_id: q.id,
                taskNumber,
                taskType,
                questionImage: q.imageUrl ? proxyImg(q.imageUrl) : undefined,
            })
        );
        router.push(`/${lang}`);
    }

    if (userLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface py-20 px-6 md:px-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            <Library className="h-4 w-4" /> {dict.practiceLibrary.badge}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-[0.9] text-on-surface">
                            {dict.practiceLibrary.title}<span className="text-primary italic">{dict.practiceLibrary.subtitle}</span>
                        </h1>
                        <p className="text-xl text-on-surface-variant font-medium opacity-60 leading-relaxed max-w-2xl">
                            {dict.practiceLibrary.desc}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className="h-14 rounded-2xl bg-white shadow-sm border-none font-black uppercase tracking-widest text-[10px] px-8"
                        >
                            <Filter className="h-4 w-4 mr-3" /> {dict.practiceLibrary.filterBtn}
                        </Button>
                        <Button
                            asChild
                            className="h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-primary/20"
                        >
                            <Link href={`/${lang}`}>
                                <PenLine className="h-4 w-4 mr-3" /> {dict.practiceLibrary.customBtn}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Hub */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
                    {/* Sidebar */}
                    <AnimatePresence>
                        {filtersOpen && (
                            <motion.aside 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="lg:col-span-3 space-y-12"
                            >
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/30">Evaluation Context</p>
                                    <div className="flex flex-col gap-2">
                                        {(["All", "Task 1", "Task 2"] as const).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setTaskFilter(t)}
                                                className={`w-full text-left p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${taskFilter === t ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-on-surface-variant/60 hover:bg-surface-container-low"}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {user && (
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/30">User Analytics</p>
                                        <div className="flex flex-col gap-2">
                                            {(["all", "todo", "done"] as const).map((k) => (
                                                <button
                                                    key={k}
                                                    onClick={() => setDoneTab(k)}
                                                    className={`w-full text-left p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${doneTab === k ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "bg-white text-on-surface-variant/60 hover:bg-surface-container-low"}`}
                                                >
                                                    {k === 'all' ? dict.practiceLibrary.all : k === 'todo' ? dict.practiceLibrary.todo : dict.practiceLibrary.done}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* Repository */}
                    <main className={`${filtersOpen ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-12 transition-all duration-700`}>
                        {/* Search Hub */}
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant/20 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder={dict.practiceLibrary.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-16 pl-16 rounded-3xl bg-white border-none shadow-premium text-lg font-medium focus-visible:ring-4 focus-visible:ring-primary/5 transition-all"
                            />
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence mode="popLayout">
                                {filtered.map((q) => (
                                    <motion.div
                                        layout
                                        key={q.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <TaskCard
                                            q={q}
                                            done={doneIds.has(q.id)}
                                            onPractice={handlePractice}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
