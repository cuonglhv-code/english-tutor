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
import { Loader2, ChevronLeft, Zap, GripVertical, FileText } from "lucide-react";
import { toast } from "sonner";
import type { WizardData } from "@/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useUser } from "@/hooks/useUser";

interface Props {
  data: Partial<WizardData>;
  onUpdate: (d: Partial<WizardData>) => void;
  onBack: () => void;
  startTime?: number;
  sessionId?: string;
  onSubmitStart?: () => void;
}

export function StepWrite({ data, onUpdate, onBack, startTime, sessionId, onSubmitStart }: Props) {
  const { user } = useUser();
  const { dict, lang, setLang } = useTranslation();
  const [essay, setEssay] = useState(data.essay || "");
  const initialLang = (() => {
    const l = data.language || lang;
    return l === "vi" ? "vi" : "en";
  })();
  const [feedbackLang, setFeedbackLang] = useState<"en" | "vi">(initialLang);
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

  const [timeLeft, setTimeLeft] = useState(60 * 60);

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

  useEffect(() => {
    if (lang === "en" || lang === "vi") {
      setFeedbackLang(lang);
    }
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
      ? "text-primary"
      : wordCount >= minWords * 0.8
        ? "text-secondary"
        : "text-on-surface-variant opacity-40";

  const handleSubmitClick = () => {
    if (wordCount < 1) {
      toast.error(lang === 'vi' ? 'Vui lòng nhập bài viết của bạn.' : 'Please enter your essay.');
      return;
    }
    if (wordCount < minWords) {
      const penaltyMsg = lang === "vi" 
        ? `Lưu ý: Bài viết mới chỉ có ${wordCount} từ (yêu cầu tối thiểu ${minWords} từ). Việc viết dưới số từ quy định có thể bị trừ điểm Band Score.` 
        : `Note: Your essay only has ${wordCount} words (minimum ${minWords} required). Essays below the required word count receive band penalties.`;
      
      toast.warning(penaltyMsg, { duration: 5000 });
    }
    setShowPlanModal(true);
  };

  const runAnalysis = async (withPlan: boolean) => {
    setShowPlanModal(false);
    setLoading(true);
    onSubmitStart?.();

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
            toast.error(lang === 'vi' ? 'Không thể tạo dàn ý.' : 'Failed to generate essay plan.');
          }
        } catch {
          toast.error(lang === 'vi' ? 'Không thể tạo dàn ý.' : 'Failed to generate essay plan.');
        } finally {
          setPlanLoading(false);
        }
      }

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

      // Fire completion tracking event (fire-and-forget)
      const timeSpentMs = startTime ? Date.now() - startTime : undefined;
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'submission_completed',
          metadata: {
            time_spent_ms: timeSpentMs,
            task_type: fullData.taskNumber === '1' ? 'task1' : 'task2',
            scoring_method: json.result?.scoring_method,
            session_id: sessionId,
          },
        }),
      }).catch(() => {});

      router.push("/results");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (lang === 'vi' ? 'Đã có lỗi xảy ra.' : 'An error occurred.'));
    } finally {
      setLoading(false);
      setPlanLoading(false);
    }
  };

  const isProcessing = loading || planLoading;

  return (
    <div className="flex flex-col bg-surface overflow-hidden h-screen">
      <Dialog open={showPlanModal} onOpenChange={(open) => { if (!isProcessing) setShowPlanModal(open); }}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-10">
          <DialogHeader className="space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black font-display tracking-tight text-on-surface">
              {lang === 'vi' ? 'Cần dàn ý không?' : 'Need an Essay Plan?'}
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant font-medium opacity-60">
                {lang === 'vi' ? 'Nhận dàn ý chi tiết giúp bạn đạt band điểm cao trước khi tiến hành chấm bài.' : 'Receive a high-scoring essay plan before proceeding to final evaluation.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 pt-6 w-full sm:flex-col sm:space-x-0">
            <Button onClick={() => runAnalysis(true)} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-primary/20">
              <Zap className="h-4 w-4 mr-2" />
              {lang === 'vi' ? 'CÓ, TẠO DÀN Ý' : 'YES, GENERATE PLAN'}
            </Button>
            <Button variant="ghost" onClick={() => runAnalysis(false)} className="w-full h-14 rounded-2xl text-on-surface-variant/40 font-black uppercase tracking-widest text-[10px] hover:bg-surface">
              {lang === 'vi' ? 'KHÔNG, CHẤM BÀI NGAY' : 'NO, ANALYZE NOW'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-on-surface-variant/5 shrink-0">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/40">
          <span className="text-primary opacity-100">
            Task {data.taskNumber}
          </span>
          <span className="w-1 h-1 rounded-full bg-on-surface-variant/10" />
          <span>{data.taskType === "academic" ? "Academic" : "General"}</span>
          <span className="w-1 h-1 rounded-full bg-on-surface-variant/10" />
          <span>{approxMinutes} MINS</span>
          <span className="w-1 h-1 rounded-full bg-on-surface-variant/10" />
          <span>{minWords} WORDS</span>
          <span className="w-1 h-1 rounded-full bg-on-surface-variant/10" />
          <span className="font-mono text-secondary opacity-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              disabled={isProcessing}
              className="hidden sm:flex rounded-xl font-black uppercase tracking-widest text-[9px] text-on-surface-variant/40 hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-3 w-3 mr-2" /> {dict.practice.back}
            </Button>
            <div className="flex sm:hidden p-1.5 bg-surface-container-low rounded-2xl shrink-0 relative items-center gap-1 shadow-inner">
              <button
                onClick={() => setActiveTab("question")}
                className={`relative z-10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "question" ? "text-primary" : "text-on-surface-variant/40"}`}
              >
                Question
                {activeTab === "question" && (
                  <motion.div
                    layoutId="activeStepTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("essay")}
                className={`relative z-10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "essay" ? "text-primary" : "text-on-surface-variant/40"}`}
              >
                Draft
                {activeTab === "essay" && (
                  <motion.div
                    layoutId="activeStepTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </div>
        </div>
      </div>

      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {(activeTab === "question" || (typeof window !== "undefined" && window.innerWidth >= 640)) && (
            <motion.div
              key="question"
              initial={{ x: activeTab === "question" ? -20 : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={`overflow-y-auto p-10 shrink-0 h-full ${activeTab === "question" ? "w-full" : "hidden sm:block"} sm:shrink-0 scrollbar-thin`}
              style={{
                width: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : `${leftPct}%`,
                position: typeof window !== "undefined" && window.innerWidth < 640 && activeTab !== "question" ? "absolute" : "relative"
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/20 mb-8 px-1">
                Examination Prompt
              </p>
              {data.question &&
                !(data.questionImage && data.question.startsWith("[Image question:")) ? (
                <p className="text-xl leading-relaxed text-on-surface font-medium mb-10 px-1 whitespace-pre-wrap">
                  {data.question}
                </p>
              ) : !data.questionImage ? (
                <p className="text-sm text-on-surface-variant opacity-40 italic mb-10 px-1">
                  {lang === "vi" ? "Không có nội dung câu hỏi." : "No question text provided."}
                </p>
              ) : null}
              {data.questionImage && (
                <div className="mb-10 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.questionImage}
                    alt="Question"
                    className="w-full rounded-[40px] border-none shadow-premium object-contain bg-white group-hover:scale-[1.02] transition-transform duration-700"
                    style={{ maxHeight: "60vh" }}
                  />
                </div>
              )}
            </motion.div>
          )}

          <div
            onMouseDown={handleMouseDown}
            className="hidden sm:flex w-2 shrink-0 cursor-col-resize bg-surface items-center justify-center group"
            title="Drag to resize"
          >
            <GripVertical className="h-4 w-4 text-on-surface-variant opacity-10 group-hover:text-primary transition-colors pointer-events-none" />
          </div>

          {(activeTab === "essay" || (typeof window !== "undefined" && window.innerWidth >= 640)) && (
            <motion.div
              key="essay"
              initial={{ x: activeTab === "essay" ? 20 : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={`flex flex-col p-8 gap-4 overflow-hidden h-full ${activeTab === "essay" ? "w-full" : "hidden sm:flex"}`}
              style={{
                width: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : `${100 - leftPct - 0.5}%`,
                position: typeof window !== "undefined" && window.innerWidth < 640 && activeTab !== "essay" ? "absolute" : "relative"
              }}
            >
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/20">{lang === 'vi' ? 'Bản thảo học thuật' : 'Academic Response'}</span>
                <span className={`font-black tabular-nums text-[10px] tracking-widest uppercase ${wordColor}`}>
                  {wordCount} {dict.practice.words}{" "}
                  <span className="opacity-30">/</span>{" "}
                  <span className="opacity-50">{minWords} {lang === 'vi' ? 'TỪ' : 'REQUIRED'}</span>
                </span>
              </div>
              <textarea
                className="flex-1 w-full resize-none rounded-[40px] bg-white p-12 text-lg leading-relaxed text-on-surface border-none focus:outline-none focus:ring-4 focus:ring-primary/5 font-body placeholder:text-on-surface-variant/10 shadow-premium disabled:opacity-60 transition-all"
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder={data.taskNumber === "1" ? (lang === 'vi' ? 'Mô tả các đặc điểm chính và so sánh...' : 'Summarize the information by selecting and reporting the main features...') : (lang === 'vi' ? 'Đưa ra lý do và dẫn chứng cho quan điểm của bạn...' : 'Give reasons for your answer and include any relevant examples...')}
                disabled={isProcessing}
                spellCheck
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white/90 backdrop-blur-xl flex items-center justify-between px-10 py-5 shrink-0 shadow-stitched border-t border-on-surface-variant/5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 p-1.5 bg-surface-container-low rounded-2xl shadow-inner">
            {(["1", "2"] as const).map((n) => {
              const isActive = data.taskNumber === n;
              return (
                <div
                  key={n}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive
                      ? "bg-white text-primary shadow-sm"
                      : "text-on-surface-variant opacity-20"
                    }`}
                >
                  Part {n}
                </div>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 p-1.5 bg-surface-container-low rounded-2xl shadow-inner">
            {(["en", "vi"] as const).map((l) => (
              <button
                key={l}
                onClick={() => { setFeedbackLang(l); setLang(l); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${feedbackLang === l
                    ? "bg-primary text-white shadow-sm"
                    : "text-on-surface-variant opacity-20 hover:opacity-100"
                  }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <Button 
            onClick={handleSubmitClick} 
            disabled={isProcessing} 
            className="h-16 px-12 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.25em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 border-none"
          >
            {planLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-4" /> {lang === 'vi' ? 'ĐANG TẠO...' : 'GENERATING...'}
              </>
            ) : loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-4" /> {lang === 'vi' ? 'ĐANG PHÂN TÍCH...' : 'ANALYZING...'}
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-4" /> {lang === 'vi' ? 'GỬI & CHẤM BÀI' : 'AUTHORIZE REVIEW'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
