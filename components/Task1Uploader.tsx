"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
    Upload, Image as ImageIcon, ArrowRight, CheckCircle2,
    ChevronDown, ChevronUp, Loader2, AlertCircle, RotateCcw,
    PenTool, Info, MessageSquare, BookOpen, GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { bandToColor, bandToBg } from "@/lib/utils";
import { toast } from "sonner";

interface Task1UploaderProps {
    onComplete?: (result: { submissionId: string; overallBand: number }) => void;
    /** When selected from question bank, pass the DB row id so the scoring API can resolve visual_description_json */
    questionId?: string | null;
    /** Pre-populated chart data (from question bank row's visual_description_json). Skips UPLOAD/CONFIRM steps. */
    preloadedChartData?: any;
}

type Step = "UPLOAD" | "CONFIRM" | "ESSAY" | "RESULTS";

export default function Task1Uploader({ onComplete, questionId, preloadedChartData }: Task1UploaderProps) {
    // If preloadedChartData is provided we jump straight to ESSAY
    const [step, setStep] = useState<Step>(preloadedChartData ? "ESSAY" : "UPLOAD");
    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Data states
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [chartData, setChartData] = useState<any>(preloadedChartData ?? null);
    const [editedJson, setEditedJson] = useState(preloadedChartData ? JSON.stringify(preloadedChartData, null, 2) : "");
    const [isJsonExpanded, setIsJsonExpanded] = useState(false);
    const [essay, setEssay] = useState("");
    const [results, setResults] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. UPLOAD LOGIC
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
                toast.error("Please upload a PNG, JPG, or WEBP image.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be under 5MB.");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (prev) => setImagePreview(prev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyse = async () => {
        if (!imageFile) return;
        setLoading(true);
        setLoadingMsg("Analysing visual prompt...");
        setError(null);

        const formData = new FormData();
        formData.append("image", imageFile);

        try {
            const res = await fetch("/api/task1/extract", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to extract chart data");

            setImagePath(data.imagePath);
            setChartData(data.chartData);
            setEditedJson(JSON.stringify(data.chartData, null, 2));
            setStep("CONFIRM");
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. CONFIRM LOGIC
    const handleConfirm = () => {
        try {
            const confirmedData = JSON.parse(editedJson);
            setChartData(confirmedData);
            setStep("ESSAY");
        } catch (e) {
            toast.error("Invalid JSON format. Please check your edits.");
        }
    };

    // 3. ESSAY LOGIC
    const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
    const handleScore = async () => {
        if (essay.length < 50) {
            toast.error("Essay must be at least 50 characters.");
            return;
        }
        setLoading(true);
        setLoadingMsg("Scoring response against IELTS criteria...");
        setError(null);

        try {
            const res = await fetch("/api/task1/score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    essay,
                    chartData: imagePath ? chartData : null,  // only send chartData if it came from an image upload
                    questionId: !imagePath ? questionId : null, // fall back to question bank when no image
                    imagePath,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to score essay");

            setResults(data);
            setStep("RESULTS");
            if (onComplete) {
                onComplete({
                    submissionId: data.submissionId || "",
                    overallBand: data.band_scores.overall
                });
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStep(preloadedChartData ? "ESSAY" : "UPLOAD");
        setImageFile(null);
        setImagePreview(null);
        setImagePath(null);
        setChartData(preloadedChartData ?? null);
        setEssay("");
        setResults(null);
        setError(null);
    };

    // ─── RENDER HELPER ───
    const renderStep = () => {
        switch (step) {
            case "UPLOAD":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">Upload Visual Prompt</h2>
                            <p className="text-muted-foreground text-sm max-w-md mx-auto">
                                Upload your Task 1 chart, graph, or diagram. Our AI will extract the data points to ensure precise scoring of your Task Achievement.
                            </p>
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file) handleFileSelect({ target: { files: [file] } } as any);
                            }}
                            className={`relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer group
                ${imagePreview ? "border-jaxtina-blue/50 bg-jaxtina-blue/5" : "border-muted hover:border-jaxtina-blue/30 hover:bg-muted/50"}`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*"
                            />

                            <div className="flex flex-col items-center justify-center space-y-4">
                                {imagePreview ? (
                                    <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border shadow-lg">
                                        <Image src={imagePreview} alt="Preview" fill className="object-contain" unoptimized />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-sm font-medium">Change Image</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-4 rounded-full bg-jaxtina-blue/10 text-jaxtina-blue group-hover:scale-110 transition-transform">
                                            <Upload className="h-8 w-8" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold text-lg">Click or drag image here</p>
                                            <p className="text-muted-foreground text-sm mt-1">PNG, JPG, or WEBP (max 5MB)</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {imagePreview && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    onClick={handleAnalyse}
                                    disabled={loading}
                                    className="bg-jaxtina-blue hover:bg-jaxtina-blue/90 px-8 py-6 text-lg rounded-xl shadow-xl shadow-jaxtina-blue/20"
                                >
                                    {loading ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {loadingMsg}</>
                                    ) : (
                                        <>Analyse Image <ArrowRight className="ml-2 h-5 w-5" /></>
                                    )}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                );

            case "CONFIRM":
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Confirm Interpretation</h2>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Visual Analysed
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="shadow-sm border-muted">
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Visual Type</p>
                                            <p className="text-sm font-semibold capitalize">{chartData.visual_type}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Measurement Units</p>
                                            <p className="text-sm font-semibold">{chartData.units}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Official Title</p>
                                            <p className="text-sm font-semibold text-jaxtina-blue italic">&quot;{chartData.title}&quot;</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Subject & Context</p>
                                            <p className="text-sm">{chartData.subject}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <div className="bg-muted/50 rounded-xl p-4 border space-y-2">
                                    <div className="flex items-center gap-2 text-jaxtina-blue">
                                        <Info className="h-4 w-4" />
                                        <p className="text-xs font-bold uppercase tracking-wider">What your overview must capture</p>
                                    </div>
                                    <p className="text-sm leading-relaxed">{chartData.overview_hint}</p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Significant Data Points</p>
                                    <ul className="space-y-1.5">
                                        {chartData.key_data_points?.map((pt: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                                <span className="mt-1.5 h-1 w-1 rounded-full bg-jaxtina-blue shrink-0" />
                                                {pt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded-xl overflow-hidden glassmorphism">
                            <button
                                onClick={() => setIsJsonExpanded(!isJsonExpanded)}
                                className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-muted/30 transition-colors"
                            >
                                <span className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-muted-foreground" /> Advanced: Edit raw extraction data</span>
                                {isJsonExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            <AnimatePresence>
                                {isJsonExpanded && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden bg-card/50"
                                    >
                                        <div className="p-3">
                                            <Textarea
                                                value={editedJson}
                                                onChange={(e) => setEditedJson(e.target.value)}
                                                className="font-mono text-[10px] bg-muted/30 h-48 border-none focus-visible:ring-1 focus-visible:ring-jaxtina-blue"
                                                placeholder="Raw JSON data..."
                                            />
                                            <p className="text-[9px] text-muted-foreground mt-2">Manual corrections only if AI misread numbers. JSON must be valid.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                onClick={handleConfirm}
                                className="flex-1 bg-jaxtina-blue hover:bg-jaxtina-blue/90 font-bold h-12 rounded-xl"
                            >
                                Confirm & Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setStep("UPLOAD")}
                                className="h-12 px-6 rounded-xl border-muted hover:bg-muted"
                            >
                                Re-upload
                            </Button>
                        </div>
                    </motion.div>
                );

            case "ESSAY":
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-5"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Write Your Response</h2>
                                <p className="text-sm text-muted-foreground italic">Target: 150+ words · 20 minutes</p>
                            </div>
                            <div className="flex items-center gap-3 bg-muted/50 px-3 py-2 rounded-xl border border-muted divide-x">
                                <div className="flex items-center gap-2 pr-3">
                                    <div className="h-2 w-2 rounded-full bg-jaxtina-blue" />
                                    <p className="text-xs font-semibold uppercase">{chartData.visual_type}</p>
                                </div>
                                <p className="text-xs font-medium pl-3 line-clamp-1 max-w-[200px]">{chartData.title}</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <Textarea
                                value={essay}
                                onChange={(e) => setEssay(e.target.value)}
                                placeholder="Write your IELTS Task 1 response here..."
                                className="min-h-[400px] text-base leading-relaxed p-6 rounded-2xl border-muted shadow-sm focus-visible:ring-jaxtina-blue"
                            />
                            <div className="absolute top-2 right-2 opacity-10 group-focus-within:opacity-30 transition-opacity">
                                <PenTool className="h-24 w-24" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="text-sm font-medium">
                                    <span className={wordCount < 150 ? "text-jaxtina-red" : "text-green-600"}>{wordCount}</span> / 150 words
                                </div>
                                {wordCount < 150 && (
                                    <Badge variant="outline" className="text-[10px] border-jaxtina-red text-jaxtina-red bg-jaxtina-red/5">
                                        <AlertCircle className="h-3 w-3 mr-1" /> Below recommended count
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setStep("CONFIRM")}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Back to Prompt
                                </Button>
                            </div>
                        </div>

                        <Button
                            onClick={handleScore}
                            disabled={loading || essay.length < 50}
                            className="w-full bg-jaxtina-blue hover:bg-jaxtina-blue/90 h-14 text-lg font-bold rounded-2xl shadow-lg shadow-jaxtina-blue/10"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {loadingMsg}</>
                            ) : (
                                <>Submit for Marking <GraduationCap className="ml-2 h-5 w-5" /></>
                            )}
                        </Button>
                    </motion.div>
                );

            case "RESULTS":
                const { band_scores, feedback, improved_sample, examiner_summary } = results;
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8 pb-12"
                    >
                        {/* Header / Summary */}
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-jaxtina-blue/10 text-jaxtina-blue rounded-full text-xs font-bold uppercase tracking-widest">
                                Official Scoring Report
                            </div>
                            <h2 className="text-3xl font-black">Performance Analysis</h2>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8">
                                <Card className="bg-gradient-to-br from-jaxtina-blue to-[#0d47a1] text-white border-none shadow-xl shadow-jaxtina-blue/20 overflow-hidden relative">
                                    <CardContent className="p-4 flex flex-col items-center justify-center min-h-[140px]">
                                        <p className="text-[10px] uppercase font-bold opacity-70">Overall Band</p>
                                        <p className="text-5xl font-black mt-1">{band_scores.overall}</p>
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <GraduationCap className="h-12 w-12" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {[
                                    { label: "Task Achievement", score: band_scores.task_achievement },
                                    { label: "Coherence & Cohesion", score: band_scores.coherence_cohesion },
                                    { label: "Lexical Resource", score: band_scores.lexical_resource },
                                    { label: "Grammar & Accuracy", score: band_scores.grammatical_range_accuracy }
                                ].map((s, i) => (
                                    <Card key={i} className="border shadow-sm border-muted">
                                        <CardContent className="p-4 flex flex-col items-center justify-center min-h-[140px]">
                                            <p className="text-[9px] uppercase font-bold text-muted-foreground text-center">{s.label}</p>
                                            <p className={`text-3xl font-black mt-2 ${bandToColor(s.score)}`}>{s.score}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Critique Block */}
                        <blockquote className="bg-muted/40 border-l-4 border-jaxtina-blue p-6 rounded-r-2xl italic text-lg leading-relaxed shadow-sm">
                            <MessageSquare className="h-6 w-6 text-jaxtina-blue/40 mb-3" />
                            &quot;{examiner_summary}&quot;
                        </blockquote>

                        {/* Detailed Criteria */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Task Achievement */}
                            <Card className="rounded-2xl border-muted overflow-hidden">
                                <CardHeader className="bg-violet-50 dark:bg-violet-950/20 pb-4 border-b">
                                    <CardTitle className="text-sm font-bold uppercase flex items-center justify-between">
                                        <span>Task Achievement</span>
                                        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-none">{band_scores.task_achievement}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <SectionList title="STRENGTHS" items={feedback.task_achievement.strengths} variant="positive" />
                                    <SectionList title="WEAKNESSES" items={feedback.task_achievement.weaknesses} variant="warning" />
                                    <SectionList title="MISSED / MISREPORTED DATA" items={feedback.task_achievement.missed_key_features} variant="negative" />
                                </CardContent>
                            </Card>

                            {/* Coherence & Cohesion */}
                            <Card className="rounded-2xl border-muted overflow-hidden">
                                <CardHeader className="bg-sky-50 dark:bg-sky-950/20 pb-4 border-b">
                                    <CardTitle className="text-sm font-bold uppercase flex items-center justify-between">
                                        <span>Coherence & Cohesion</span>
                                        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 border-none">{band_scores.coherence_cohesion}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <SectionList title="STRENGTHS" items={feedback.coherence_cohesion.strengths} variant="positive" />
                                    <SectionList title="WEAKNESSES" items={feedback.coherence_cohesion.weaknesses} variant="warning" />
                                </CardContent>
                            </Card>

                            {/* Lexical Resource */}
                            <Card className="rounded-2xl border-muted overflow-hidden">
                                <CardHeader className="bg-amber-50 dark:bg-amber-950/20 pb-4 border-b">
                                    <CardTitle className="text-sm font-bold uppercase flex items-center justify-between">
                                        <span>Lexical Resource</span>
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">{band_scores.lexical_resource}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <SectionList title="STRENGTHS" items={feedback.lexical_resource.strengths} variant="positive" />
                                    <SectionList title="WEAKNESSES" items={feedback.lexical_resource.weaknesses} variant="warning" />
                                    <div className="pt-2 border-t">
                                        <p className="text-[10px] font-bold text-amber-700 uppercase mb-2">VOCABULARY UPGRADES</p>
                                        <div className="space-y-2">
                                            {feedback.lexical_resource.suggestions?.map((s: string, i: number) => (
                                                <div key={i} className="text-xs bg-amber-100/30 p-2 rounded-lg border border-amber-200/50">
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Grammatical Range & Accuracy */}
                            <Card className="rounded-2xl border-muted overflow-hidden">
                                <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20 pb-4 border-b">
                                    <CardTitle className="text-sm font-bold uppercase flex items-center justify-between">
                                        <span>Grammar & Accuracy</span>
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">{band_scores.grammatical_range_accuracy}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <SectionList title="STRENGTHS" items={feedback.grammatical_range_accuracy.strengths} variant="positive" />
                                    {feedback.grammatical_range_accuracy.errors?.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-jaxtina-red uppercase">SPECIFIC ERRORS</p>
                                            <div className="space-y-3">
                                                {feedback.grammatical_range_accuracy.errors.map((e: string, i: number) => {
                                                    const parts = e.split("→");
                                                    return (
                                                        <div key={i} className="text-xs border rounded-lg overflow-hidden">
                                                            <div className="bg-red-50 p-2 text-jaxtina-red line-through">{parts[0]}</div>
                                                            <div className="bg-green-50 p-2 text-green-700 font-medium">→ {parts[1] || "Suggestion provided"}</div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground leading-relaxed">
                                        <strong>Range Comment:</strong> {feedback.grammatical_range_accuracy.range_comment}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Model Sample */}
                        <Card className="border-jaxtina-blue/30 bg-jaxtina-blue/5 shadow-lg shadow-jaxtina-blue/5 rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-jaxtina-blue" />
                                    Model Overview Paragraph (7.5+)
                                </CardTitle>
                                <CardDescription>Compare this model chunk with your own intro/overview.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base leading-relaxed text-foreground/90 font-medium">
                                    {improved_sample}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={handleReset}
                                className="bg-jaxtina-blue hover:bg-jaxtina-blue/90 px-10 py-6 text-lg rounded-2xl shadow-xl shadow-jaxtina-blue/20"
                            >
                                <RotateCcw className="mr-2 h-5 w-5" /> Score Another Essay
                            </Button>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-4">
            <AnimatePresence mode="wait">
                {renderStep()}
            </AnimatePresence>
        </div>
    );
}

function SectionList({ title, items, variant }: { title: string; items?: string[]; variant: "positive" | "negative" | "warning" }) {
    if (!items || items.length === 0) return null;

    const colors = {
        positive: "text-green-600",
        negative: "text-jaxtina-red",
        warning: "text-amber-600"
    };

    const bgs = {
        positive: "bg-green-500",
        negative: "bg-jaxtina-red",
        warning: "bg-amber-500"
    };

    return (
        <div className="space-y-2">
            <p className={`text-[10px] font-bold ${colors[variant]} uppercase tracking-wider`}>{title}</p>
            <ul className="space-y-1.5">
                {items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
                        <span className={`mt-1.5 h-1 w-1 rounded-full ${bgs[variant]} shrink-0`} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
