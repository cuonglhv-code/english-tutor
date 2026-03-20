"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Search, Filter, PenLine, CheckCircle2, BookMarked,
    RotateCcw, ChevronDown, ChevronUp, Library, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import {
    SEED_QUESTIONS,
    TASK1_TYPES,
    TASK2_TYPES,
    SOURCES,
    TYPE_COLORS,
    type PracticeQuestion,
} from "@/lib/questionBank";
import Task1Uploader from "@/components/Task1Uploader";

// ─── Proxy helper (same logic as ielts-examiner.tsx) ─────────────────────────
function proxyImg(url: string) {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&output=jpg`;
}

// ─── Task card with image proxy and completion badge ─────────────────────────
function TaskCard({
    q,
    done,
    onPractice,
}: {
    q: PracticeQuestion;
    done: boolean;
    onPractice: (q: PracticeQuestion) => void;
}) {
    const typeColor = TYPE_COLORS[q.type] ?? "bg-gray-100 text-gray-600";
    const [imgStatus, setImgStatus] = useState<"loading" | "ok" | "error">(
        q.imageUrl ? "loading" : "ok"
    );

    return (
        <div className="group bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
            {/* Image or placeholder */}
            {q.imageUrl ? (
                <div className="relative w-full h-32 bg-muted shrink-0">
                    {imgStatus === "loading" && (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    )}
                    {imgStatus === "error" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-xs gap-1">
                            <span className="text-3xl">🖼️</span>
                            <span>Image unavailable</span>
                        </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={proxyImg(q.imageUrl)}
                        alt="chart"
                        className={`w-full h-full object-cover transition-opacity duration-300 ${imgStatus === "ok" ? "opacity-100" : "opacity-0"}`}
                        onLoad={() => setImgStatus("ok")}
                        onError={() => setImgStatus("error")}
                    />
                    {done && (
                        <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full shadow">
                                <CheckCircle2 className="h-3 w-3" /> Done
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`h-24 flex items-center justify-center text-4xl relative shrink-0 ${q.task === "Task 1" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-orange-50 dark:bg-orange-900/20"
                        }`}
                >
                    {q.task === "Task 1" ? "📊" : "✍️"}
                    {done && (
                        <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full shadow">
                                <CheckCircle2 className="h-3 w-3" /> Done
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Body */}
            <div className="p-4 flex flex-col flex-1 gap-2">
                <div className="flex flex-wrap gap-1.5">
                    <Badge
                        variant={q.task === "Task 1" ? "default" : "blue"}
                        className="text-[10px] font-bold"
                    >
                        {q.task}
                    </Badge>
                    {q.type && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColor}`}>
                            {q.type}
                        </span>
                    )}
                    {q.source && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {q.source}
                        </span>
                    )}
                </div>

                <p className="text-sm text-foreground/80 line-clamp-3 flex-1 leading-relaxed">
                    {q.questionText}
                </p>

                <Button
                    size="sm"
                    variant={done ? "outline" : "default"}
                    className="w-full mt-1 gap-1.5"
                    onClick={() => onPractice(q)}
                >
                    {done ? (
                        <>
                            <RotateCcw className="h-3.5 w-3.5" />
                            Redo / Viết lại
                        </>
                    ) : (
                        <>
                            <PenLine className="h-3.5 w-3.5" />
                            Practice / Viết bài
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

// ─── Sidebar filter panel ─────────────────────────────────────────────────────
function FilterSidebar({
    taskFilter,
    setTaskFilter,
    typeFilters,
    setTypeFilters,
    sourceFilters,
    setSourceFilters,
    allTypes,
    open,
    setActiveTab,
}: {
    taskFilter: "All" | "Task 1" | "Task 2";
    setTaskFilter: (t: "All" | "Task 1" | "Task 2") => void;
    typeFilters: string[];
    setTypeFilters: React.Dispatch<React.SetStateAction<string[]>>;
    sourceFilters: string[];
    setSourceFilters: React.Dispatch<React.SetStateAction<string[]>>;
    allTypes: readonly string[];
    open: boolean;
    setActiveTab: (t: "task1" | "task2") => void;
}) {
    const toggle = (
        arr: string[],
        set: React.Dispatch<React.SetStateAction<string[]>>,
        v: string
    ) => set((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

    if (!open) return null;

    return (
        <aside className="w-full md:w-56 shrink-0 space-y-5 bg-card border rounded-2xl p-4 h-fit">
            {/* Task filter */}
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Task Type
                </p>
                {(["All", "Task 1", "Task 2"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => {
                            setTaskFilter(t);
                            setTypeFilters([]);
                            if (t === "Task 1") setActiveTab("task1");
                            if (t === "Task 2") setActiveTab("task2");
                        }}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm mb-1 transition-colors ${
                            taskFilter === t
                                ? "bg-jaxtina-red/10 text-jaxtina-red font-semibold"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Type filter */}
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Dạng đề / Type
                </p>
                {allTypes.map((t) => (
                    <label key={t} className="flex items-center gap-2 text-sm text-muted-foreground py-0.5 cursor-pointer hover:text-foreground">
                        <input
                            type="checkbox"
                            checked={typeFilters.includes(t)}
                            onChange={() => toggle(typeFilters, setTypeFilters, t)}
                            className="accent-jaxtina-red"
                        />
                        {t}
                    </label>
                ))}
            </div>

            {/* Source filter */}
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Nguồn / Source
                </p>
                {SOURCES.map((s) => (
                    <label key={s} className="flex items-center gap-2 text-sm text-muted-foreground py-0.5 cursor-pointer hover:text-foreground">
                        <input
                            type="checkbox"
                            checked={sourceFilters.includes(s)}
                            onChange={() => toggle(sourceFilters, setSourceFilters, s)}
                            className="accent-jaxtina-red"
                        />
                        {s}
                    </label>
                ))}
            </div>

            {/* Clear all */}
            {(typeFilters.length > 0 || sourceFilters.length > 0 || taskFilter !== "All") && (
                <button
                    onClick={() => { setTaskFilter("All"); setTypeFilters([]); setSourceFilters([]); }}
                    className="text-xs text-jaxtina-red hover:underline w-full text-left"
                >
                    ✕ Clear all filters
                </button>
            )}
        </aside>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PracticePage() {
    const { user, loading: userLoading } = useUser();
    const { lang } = useLanguage();
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
    const [task1Search, setTask1Search] = useState("");

    const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [loadingDone, setLoadingDone] = useState(false);

    // Fetch dynamic questions from Supabase (REST API proxy)
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


    // Load submitted question IDs from Supabase for authenticated users
    useEffect(() => {
        if (!user) return;
        setLoadingDone(true);
        fetch("/api/user/submissions")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const promptSet = new Set(data.map((r: any) => r.prompt_text?.trim()).filter(Boolean));
                    const ids = new Set(
                        allQuestions
                            .filter((q) => promptSet.has(q.questionText.trim()))
                            .map((q) => q.id)
                    );
                    setDoneIds(ids);
                }
                setLoadingDone(false);
            })
            .catch(() => setLoadingDone(false));
    }, [user, allQuestions]);

    const allTypes = taskFilter === "Task 1"
        ? TASK1_TYPES
        : taskFilter === "Task 2"
            ? TASK2_TYPES
            : [...TASK1_TYPES, ...TASK2_TYPES];

    const filtered = allQuestions.filter((q) => {
        if (taskFilter !== "All" && q.task !== taskFilter) return false;
        if (typeFilters.length && !typeFilters.includes(q.type)) return false;
        if (sourceFilters.length && !sourceFilters.includes(q.source)) return false;
        if (
            search &&
            !q.questionText.toLowerCase().includes(search.toLowerCase()) &&
            !q.type?.toLowerCase().includes(search.toLowerCase()) &&
            !q.source?.toLowerCase().includes(search.toLowerCase())
        )
            return false;
        if (doneTab === "done" && user) return doneIds.has(q.id);
        if (doneTab === "todo" && user) return !doneIds.has(q.id);
        return true;
    });

    // Navigate to the home wizard pre-populated with the selected question
    function handlePractice(q: PracticeQuestion) {
        const taskNumber: "1" | "2" = q.task === "Task 1" ? "1" : "2";
        // Determine taskType: GT letters → general, everything else → academic
        const isGTLetter = q.type.startsWith("GT -");
        const taskType: "academic" | "general" = isGTLetter ? "general" : "academic";

        // Store the pre-selected question in sessionStorage for the home page to pick up
        sessionStorage.setItem(
            "practice_question",
            JSON.stringify({
                question: q.questionText,
                taskNumber,
                taskType,
                questionImage: q.imageUrl ? proxyImg(q.imageUrl) : undefined,
            })
        );
        router.push("/");
    }

    const doneCount = doneIds.size;
    const totalCount = allQuestions.length;

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* ── Page header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-jaxtina-red to-jaxtina-blue px-4 py-1.5 text-white text-sm font-medium mb-3">
                            <Library className="h-4 w-4" />
                            {lang === "vi" ? "Thư viện câu hỏi" : "Practice Library"}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">
                            {lang === "vi" ? "Chọn đề để luyện tập" : "Pick a Question & Practice"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {lang === "vi"
                                ? `${totalCount} câu hỏi từ các nguồn IELTS hàng đầu`
                                : `${totalCount} questions from top IELTS sources`}
                            {user && !loadingDone && doneCount > 0 && (
                                <span className="ml-2 text-green-600 font-semibold">
                                    · {doneCount} done
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Filters toggle */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFiltersOpen((v) => !v)}
                            className="gap-1.5"
                        >
                            <Filter className="h-3.5 w-3.5" />
                            {filtersOpen ? "Hide filters" : "Filters"}
                            {filtersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>

                        {/* Quick link to custom question entry */}
                        <Button asChild size="sm" className="gap-1.5">
                            <Link href="/">
                                <PenLine className="h-3.5 w-3.5" />
                                {lang === "vi" ? "Tự nhập đề" : "Custom Question"}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── Tab Switcher ── */}
                <div className="flex items-center gap-1 bg-muted/60 p-1.5 rounded-2xl w-full sm:w-fit border shadow-sm">
                    <button
                        onClick={() => { setActiveTab("task1"); setTaskFilter("Task 1"); setTypeFilters([]); }}
                        className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === "task1"
                            ? "bg-card text-jaxtina-red shadow-md scale-[1.02]"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                         Task 1
                    </button>
                    <button
                        onClick={() => { setActiveTab("task2"); setTaskFilter("Task 2"); setTypeFilters([]); }}
                        className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === "task2"
                            ? "bg-card text-jaxtina-red shadow-md scale-[1.02]"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                         Task 2
                    </button>
                </div>

                {activeTab === "task1" ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        {/* ── Task 1: writing mode (question selected) ── */}
                        {selectedTask1Q ? (
                            <div className="space-y-4">
                                {/* Header: selected question info */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-card border rounded-2xl p-5 shadow-sm">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[selectedTask1Q.type] ?? "bg-gray-100 text-gray-600"}`}>
                                                {selectedTask1Q.type}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{selectedTask1Q.source}</span>
                                        </div>
                                        <p className="text-sm text-foreground/80 leading-relaxed">{selectedTask1Q.questionText}</p>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedTask1Q(null); setTask1Mode("bank"); }}
                                        className="shrink-0 text-xs text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
                                    >
                                        ← Back to questions
                                    </button>
                                </div>

                                {/* Visual description panel */}
                                {selectedTask1Q.visualDescription && task1Mode === "bank" && (
                                    <div className="bg-muted/40 border border-muted rounded-2xl p-5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">📊 Visual Description</p>
                                            <button
                                                onClick={() => setTask1Mode("upload")}
                                                className="text-xs text-jaxtina-blue hover:underline font-medium flex items-center gap-1"
                                            >
                                                Have an image? Upload it instead →
                                            </button>
                                        </div>
                                        <p className="text-sm leading-relaxed text-foreground/80">{selectedTask1Q.visualDescription}</p>
                                        <p className="text-[10px] text-muted-foreground italic">
                                            This description is used by the AI examiner to assess your Task Achievement accurately.
                                        </p>
                                    </div>
                                )}

                                {/* Image upload mode toggle */}
                                {task1Mode === "upload" && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <button
                                            onClick={() => setTask1Mode("bank")}
                                            className="text-xs text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
                                        >
                                            ← Use question bank description instead
                                        </button>
                                    </div>
                                )}

                                {/* Task1Uploader component */}
                                <div className="bg-card border rounded-3xl p-6 sm:p-10 shadow-card">
                                    {task1Mode === "bank" ? (
                                        // Question bank mode: preload chart data, no upload step
                                        <Task1Uploader
                                            key={`bank-${selectedTask1Q.id}`}
                                            questionId={selectedTask1Q.id}
                                            preloadedChartData={selectedTask1Q.visualDescriptionJson ?? null}
                                        />
                                    ) : (
                                        // Image upload mode: full upload flow
                                        <Task1Uploader
                                            key={`upload-${selectedTask1Q.id}`}
                                            questionId={selectedTask1Q.id}
                                        />
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ── Task 1: question selector ── */
                            <div className="space-y-5">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight">Select a Task 1 Question</h2>
                                        <p className="text-sm text-muted-foreground mt-0.5">Choose a visual prompt from the question bank, or upload your own image below.</p>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedTask1Q(null); setTask1Mode("upload"); setSelectedTask1Q({ id: "custom", task: "Task 1", type: "Custom Upload", source: "Custom", questionText: "Your uploaded visual prompt", imageUrl: "" }); }}
                                        className="shrink-0 text-sm font-semibold bg-jaxtina-blue hover:bg-jaxtina-blue/90 text-white px-5 py-2 rounded-xl flex items-center gap-2 transition-colors"
                                    >
                                        📤 Upload my own image
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Task 1 questions…"
                                        value={task1Search}
                                        onChange={(e) => setTask1Search(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>

                                {/* Question grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allQuestions
                                        .filter(q => q.task === "Task 1")
                                        .filter(q => !task1Search ||
                                            q.questionText.toLowerCase().includes(task1Search.toLowerCase()) ||
                                            q.type.toLowerCase().includes(task1Search.toLowerCase())
                                        )
                                        .map(q => (
                                            <div
                                                key={q.id}
                                                onClick={() => { setSelectedTask1Q(q); setTask1Mode("bank"); }}
                                                className="group bg-card rounded-2xl border shadow-sm hover:shadow-md hover:border-jaxtina-blue/40 transition-all cursor-pointer flex flex-col overflow-hidden"
                                            >
                                                {q.imageUrl ? (
                                                    <div className="relative w-full h-32 bg-muted shrink-0 overflow-hidden">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={proxyImg(q.imageUrl)}
                                                            alt="chart preview"
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-24 flex items-center justify-center text-4xl bg-blue-50 dark:bg-blue-900/20 shrink-0">📊</div>
                                                )}
                                                <div className="p-4 flex flex-col flex-1 gap-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${TYPE_COLORS[q.type] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {q.type}
                                                    </span>
                                                    <p className="text-sm text-foreground/80 line-clamp-3 flex-1 leading-relaxed">{q.questionText}</p>
                                                    <span className="text-xs text-jaxtina-blue font-semibold group-hover:underline mt-auto">Select → Write →</span>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <>
                        {/* ── Done/Todo tabs (only shown when logged in) ── */}
                        {user && (
                            <div className="flex items-center gap-1 bg-muted rounded-xl p-1 w-fit">
                                {([
                                    ["all", lang === "vi" ? "Tất cả" : "All"],
                                    ["todo", lang === "vi" ? "Chưa làm" : "To Do"],
                                    ["done", lang === "vi" ? "Đã làm" : "Done"],
                                ] as const).map(([k, l]) => (
                                    <button
                                        key={k}
                                        onClick={() => setDoneTab(k)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${doneTab === k ? "bg-card text-jaxtina-red shadow-sm" : "text-muted-foreground"
                                            }`}
                                    >
                                        {l}
                                        {k === "done" && doneCount > 0 && (
                                            <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                                                {doneCount}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* ── Search bar ── */}
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={lang === "vi" ? "Tìm kiếm câu hỏi..." : "Search questions..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* ── Main layout: sidebar + grid ── */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <FilterSidebar
                                taskFilter={taskFilter}
                                setTaskFilter={setTaskFilter}
                                typeFilters={typeFilters}
                                setTypeFilters={setTypeFilters}
                                sourceFilters={sourceFilters}
                                setSourceFilters={setSourceFilters}
                                allTypes={allTypes}
                                open={filtersOpen}
                                setActiveTab={setActiveTab}
                            />

                            <div className="flex-1 min-w-0">
                                {/* Result count */}
                                {filtered.length > 0 && (
                                    <p className="text-xs text-muted-foreground mb-3">
                                        {lang === "vi"
                                            ? `Hiển thị ${filtered.length} câu hỏi`
                                            : `Showing ${filtered.length} question${filtered.length !== 1 ? "s" : ""}`}
                                    </p>
                                )}

                                {/* Empty states */}
                                {filtered.length === 0 && search && (
                                    <div className="text-center py-20 text-muted-foreground">
                                        <div className="text-5xl mb-3">🔍</div>
                                        <p className="font-medium">
                                            {lang === "vi" ? "Không tìm thấy câu hỏi phù hợp." : "No questions match your search."}
                                        </p>
                                        <button
                                            onClick={() => setSearch("")}
                                            className="mt-3 text-sm text-jaxtina-red hover:underline"
                                        >
                                            Clear search
                                        </button>
                                    </div>
                                )}
                                {filtered.length === 0 && !search && doneTab === "done" && (
                                    <div className="text-center py-20 text-muted-foreground">
                                        <div className="text-5xl mb-3">📭</div>
                                        <p className="font-medium">
                                            {lang === "vi" ? "Bạn chưa làm bài nào." : "You haven't completed any questions yet."}
                                        </p>
                                        <button
                                            onClick={() => setDoneTab("all")}
                                            className="mt-3 text-sm text-jaxtina-red hover:underline"
                                        >
                                            {lang === "vi" ? "Xem tất cả câu hỏi" : "Browse all questions"}
                                        </button>
                                    </div>
                                )}
                                {filtered.length === 0 && !search && doneTab === "todo" && (
                                    <div className="text-center py-20 text-muted-foreground">
                                        <div className="text-5xl mb-3">🎉</div>
                                        <p className="font-medium text-green-600 font-bold">
                                            {lang === "vi" ? "Bạn đã làm hết tất cả câu hỏi!" : "You've completed all questions!"}
                                        </p>
                                        <button
                                            onClick={() => setDoneTab("done")}
                                            className="mt-3 text-sm text-jaxtina-red hover:underline"
                                        >
                                            {lang === "vi" ? "Xem bài đã làm" : "Review completed questions"}
                                        </button>
                                    </div>
                                )}

                                {/* Question grid */}
                                {filtered.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filtered.map((q) => (
                                            <TaskCard
                                                key={q.id}
                                                q={q}
                                                done={doneIds.has(q.id)}
                                                onPractice={handlePractice}
                                            />
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
