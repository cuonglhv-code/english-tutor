"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, ChevronLeft, Zap, CheckCircle2, GripVertical, FileText } from "lucide-react";
import { toast } from "sonner";
import type { WizardData } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";
import { useUser } from "@/hooks/useUser";

interface Props {
  data: Partial<WizardData>;
  onUpdate: (d: Partial<WizardData>) => void;
  onBack: () => void;
}

export function StepWrite({ data, onUpdate, onBack }: Props) {
  const { user } = useUser();
  const { lang, setLang } = useLanguage();
  const [essay, setEssay] = useState(data.essay || "");
  const [feedbackLang, setFeedbackLang] = useState<"en" | "vi">(data.language || lang);
  const [loading, setLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [leftPct, setLeftPct] = useState(42);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [activeTab, setActiveTab] = useState<"question" | "essay">("essay");
  const router = useRouter();

  const minWords = data.taskNumber === "1" ? 150 : 250;
  const approxMinutes = data.taskNumber === "1" ? 20 : 40;
  const wordCount = essay.trim() === "" ? 0 : essay.trim().split(/\s+/).length;

  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 mins countdown

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Keep feedbackLang in sync if lang toggle changes externally
  useEffect(() => {
    setFeedbackLang(lang);
  }, [lang]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.max(20, Math.min(70, pct)));
    };
    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const wordColor =
    wordCount >= minWords
      ? "text-green-600 dark:text-green-400"
      : wordCount >= minWords * 0.8
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-muted-foreground";

  // Validate and show the essay plan modal
  const handleSubmitClick = () => {
    if (wordCount < 1) {
      toast.error(t("write", "errorEmpty", lang));
      return;
    }
    if (wordCount < minWords) {
      const warnFn = t("write", "warningShort", lang);
      const warnMsg = typeof warnFn === "function" ? warnFn(wordCount, minWords) : String(warnFn);
      // user wants a friendlier warning about band penalties
      const penaltyMsg = lang === "vi" 
        ? "Lưu ý: Bài viết dưới số từ quy định có thể bị trừ điểm Band Score tự động." 
        : "Note: Essays below the required word count receive automatic band penalties.";
      
      toast.warning(`${warnMsg} ${penaltyMsg}`, { duration: 5000 });
    }
    setShowPlanModal(true);
  };

  // Run the full analysis (optionally fetch plan first)
  const runAnalysis = async (withPlan: boolean) => {
    setShowPlanModal(false);
    setLoading(true);

    // Exclude questionImage from API payload
    const { questionImage: _img, ...dataForApi } = data as WizardData;
    const fullData: WizardData = {
      ...dataForApi,
      essay,
      language: feedbackLang,
      ...(user?.id ? { user_id: user.id } : {})
    };
    onUpdate({ essay, language: feedbackLang });

    try {
      let planText: string | null = null;

      // 1. Optional essay plan
      if (withPlan) {
        setPlanLoading(true);
        try {
          const planRes = await fetch("/api/essay-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              task_type: data.taskType,
              task_number: data.taskNumber,
              prompt_text: data.question || "",
              language: feedbackLang,
            }),
          });
          const planJson = await planRes.json();
          if (planJson.success && planJson.plan) {
            planText = planJson.plan as string;
          } else {
            toast.error(t("essayPlan", "error", lang));
          }
        } catch {
          toast.error(t("essayPlan", "error", lang));
        } finally {
          setPlanLoading(false);
        }
      }

      // 2. Analyze essay
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Analysis failed");

      sessionStorage.setItem(
        "ielts_result",
        JSON.stringify({ result: json.result, formData: fullData, essayPlan: planText })
      );
      router.push("/results");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("common", "error", lang));
    } finally {
      setLoading(false);
      setPlanLoading(false);
    }
  };

  const isProcessing = loading || planLoading;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
      {/* Essay Plan Modal */}
      <Dialog open={showPlanModal} onOpenChange={(open) => { if (!isProcessing) setShowPlanModal(open); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-jaxtina-blue" />
              {t("essayPlan", "modalTitle", lang)}
            </DialogTitle>
            <DialogDescription>{t("essayPlan", "modalDesc", lang)}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={() => runAnalysis(true)} className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              {t("essayPlan", "yesBtn", lang)}
            </Button>
            <Button variant="outline" onClick={() => runAnalysis(false)} className="w-full">
              {t("essayPlan", "noBtn", lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top info bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/70 border-b shrink-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            Task {data.taskNumber}
          </span>
          <span className="text-border">|</span>
          <span>{data.taskType === "academic" ? "Academic" : "General Training"}</span>
          <span className="text-border">|</span>
          <span>{t("write", "spendAbout", lang)} {approxMinutes} {t("write", "minutes", lang)}</span>
          <span>{t("write", "writeAtLeast", lang)} {minWords} {t("write", "words", lang)}</span>
          <span className="text-border">|</span>
          <span className="font-semibold text-jaxtina-red font-mono bg-jaxtina-red/10 px-2 py-0.5 rounded flex items-center gap-1">
            ⏱️ {formatTime(timeLeft)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isProcessing}
          className="ml-4 shrink-0 hidden sm:flex"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> {t("write", "back", lang)}
        </Button>

        {/* Mobile Tab Toggle */}
        <div className="flex sm:hidden p-1 bg-muted rounded-lg h-9 ml-2 shrink-0 relative items-center">
          <button
            onClick={() => setActiveTab("question")}
            className={`relative z-10 px-3 h-7 text-[10px] font-black uppercase tracking-wider transition-colors duration-200 ${activeTab === "question" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t("write", "questionPanel", lang)}
            {activeTab === "question" && (
              <motion.div
                layoutId="activeStepTab"
                className="absolute inset-0 bg-jaxtina-red rounded-md -z-10"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("essay")}
            className={`relative z-10 px-3 h-7 text-[10px] font-black uppercase tracking-wider transition-colors duration-200 ${activeTab === "essay" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t("write", "responsePanel", lang)}
            {activeTab === "essay" && (
              <motion.div
                layoutId="activeStepTab"
                className="absolute inset-0 bg-jaxtina-red rounded-md -z-10"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Split pane / Tabs */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {/* Left: Question */}
          {(activeTab === "question" || (typeof window !== "undefined" && window.innerWidth >= 640)) && (
            <motion.div
              key="question"
              initial={{ x: activeTab === "question" ? -20 : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={`overflow-y-auto p-5 shrink-0 h-full ${activeTab === "question" ? "w-full" : "hidden sm:block"} sm:shrink-0 scrollbar-thin`}
              style={{
                width: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : `${leftPct}%`,
                position: typeof window !== "undefined" && window.innerWidth < 640 && activeTab !== "question" ? "absolute" : "relative"
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {t("write", "questionPanel", lang)}
              </p>

              {data.question &&
                !(data.questionImage && data.question.startsWith("[Image question:")) ? (
                <p className="text-base leading-relaxed whitespace-pre-wrap mb-4">
                  {data.question}
                </p>
              ) : !data.questionImage ? (
                <p className="text-sm text-muted-foreground italic mb-4">
                  {lang === "vi" ? "Không có nội dung câu hỏi." : "No question text was provided."}
                </p>
              ) : null}

              {data.questionImage && (
                <div className="mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.questionImage}
                    alt="Question"
                    className="w-full rounded-lg border object-contain shadow-sm"
                    style={{ maxHeight: "60vh" }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Draggable divider */}
          <div
            onMouseDown={handleMouseDown}
            className="hidden sm:flex w-2 shrink-0 cursor-col-resize bg-border hover:bg-jaxtina-red/60 transition-colors items-center justify-center group"
            title="Drag to resize"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground/40 group-hover:text-jaxtina-red/70 transition-colors pointer-events-none" />
          </div>

          {/* Right: Essay */}
          {(activeTab === "essay" || (typeof window !== "undefined" && window.innerWidth >= 640)) && (
            <motion.div
              key="essay"
              initial={{ x: activeTab === "essay" ? 20 : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={`flex flex-col p-4 gap-2 overflow-hidden h-full ${activeTab === "essay" ? "w-full" : "hidden sm:flex"}`}
              style={{
                width: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : `${100 - leftPct - 0.5}%`,
                position: typeof window !== "undefined" && window.innerWidth < 640 && activeTab !== "essay" ? "absolute" : "relative"
              }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">{t("write", "responsePanel", lang)}</span>
                <span className={`font-bold tabular-nums ${wordColor}`}>
                  {wordCount} {t("write", "words", lang)}{" "}
                  {wordCount >= minWords ? (
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  ) : (
                    <span className="text-muted-foreground font-normal">
                      / {minWords} {t("write", "wordsRequired", lang)}
                    </span>
                  )}
                </span>
              </div>
              <textarea
                className="flex-1 w-full resize-none rounded-xl border border-input bg-background p-4 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-jaxtina-red/30 font-[inherit] disabled:opacity-60 shadow-inner"
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder={data.taskNumber === "1" ? t("write", "placeholder1", lang) : t("write", "placeholder2", lang)}
                disabled={isProcessing}
                spellCheck
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom nav bar */}
      <div className="border-t bg-card flex items-center justify-between px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {(["1", "2"] as const).map((n) => {
            const isActive = data.taskNumber === n;
            return (
              <div
                key={n}
                className={`flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium select-none ${isActive
                    ? "bg-jaxtina-red text-white"
                    : "bg-muted text-muted-foreground"
                  }`}
              >
                {isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
                Part {n}
              </div>
            );
          })}

          {/* Feedback language selector */}
          <div className="flex items-center gap-1 border rounded-lg overflow-hidden text-xs h-7">
            <span className="px-2 text-muted-foreground text-[11px] hidden sm:inline">{t("write", "language", lang)}:</span>
            {(["en", "vi"] as const).map((l) => (
              <button
                key={l}
                onClick={() => { setFeedbackLang(l); setLang(l); }}
                className={`px-2.5 h-full font-semibold transition-colors ${feedbackLang === l
                    ? "bg-jaxtina-blue text-white"
                    : "hover:bg-muted text-muted-foreground"
                  }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`text-sm font-semibold tabular-nums ${wordColor}`}>
            {wordCount} / {minWords} {t("write", "words", lang)}
          </span>
          <Button onClick={handleSubmitClick} disabled={isProcessing} size="sm">
            {planLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("essayPlan", "generating", lang)}
              </>
            ) : loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("write", "analyzing", lang)}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" /> {t("write", "analyzeBtn", lang)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
