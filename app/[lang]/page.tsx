"use client";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { StepTask } from "@/components/steps/StepTask";
import { StepQuestion } from "@/components/steps/StepQuestion";
import { StepWrite } from "@/components/steps/StepWrite";
import type { WizardData } from "@/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useUser } from "@/hooks/useUser";
import { LoginPageContent } from "@/components/auth/LoginPageContent";
import { Loader2, GraduationCap } from "lucide-react";

export default function PracticePage() {
  const { user, loading: userLoading } = useUser();
  const { dict, lang } = useTranslation();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<WizardData>>({});

  const STEPS = [
    dict.practice.step1,
    dict.practice.step2,
    dict.practice.step3,
  ];

  // Keep language synced into wizard data
  useEffect(() => {
    setData((prev) => ({ ...prev, language: lang as "en" | "vi" }));
  }, [lang]);

  // Pre-populate from Practice Library handoff
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("practice_question");
      if (!raw) return;
      sessionStorage.removeItem("practice_question");
      const preloaded = JSON.parse(raw) as {
        question: string;
        taskNumber: "1" | "2";
        taskType: "academic" | "general";
        questionImage?: string;
      };
      setData((prev) => ({
        ...prev,
        question: preloaded.question,
        question_id: (preloaded as any).question_id,
        taskNumber: preloaded.taskNumber,
        taskType: preloaded.taskType,
        questionImage: preloaded.questionImage,
      }));
      // Jump straight to the Write step
      setStep(2);
    } catch { /* ignore */ }
  }, []);

  const updateData = (d: Partial<WizardData>) => setData((prev) => ({ ...prev, ...d }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const progress = ((step + 1) / STEPS.length) * 100;

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
      }>
        <LoginPageContent />
      </Suspense>
    );
  }

  if (step === 2) {
    return <StepWrite data={data} onUpdate={updateData} onBack={back} />;
  }

  return (
    <div className="min-h-screen bg-surface py-16 px-6 md:px-12">
      <div className="mx-auto max-w-4xl pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 rounded-full bg-primary/5 px-6 py-2 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-primary/5">
            <GraduationCap className="h-4 w-4" />
            Scholar Mastery Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-[0.9] text-on-surface mb-10">
            {lang === 'vi' ? 'Nhận ' : 'Get Your '}
            <span className="text-primary italic">Band Score</span>
            <br />
            {lang === 'vi' ? 'Ngay lập tức' : 'Instantly.'}
          </h1>
          <p className="mt-8 text-on-surface-variant opacity-60 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            {lang === 'vi' 
              ? "Mô phỏng buổi chấm thi IELTS học thuật • Phản hồi theo từng tiêu chí • Chuẩn bị cho Band 8.0+" 
              : "Simulate an elite IELTS marking session • Individual criterion feedback • Designed for Band 8.0+"}
          </p>
        </motion.div>

        <div className="mb-16">
          <div className="flex justify-between items-center gap-4 mb-10 px-2 overflow-x-auto no-scrollbar">
            {STEPS.map((s, i) => {
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div
                  key={s}
                  className={`
                    flex items-center gap-4 transition-all duration-700
                    ${isActive ? "opacity-100 scale-100" : "opacity-30 scale-95"}
                  `}
                >
                  <div className={`
                    flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[11px] font-black 
                    ${isActive ? "bg-primary text-white shadow-xl shadow-primary/20" : isDone ? "bg-white text-primary" : "bg-surface-container-low text-on-surface-variant"}
                  `}>
                    {isDone ? "✓" : `0${i + 1}`}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${isActive ? "text-primary" : "text-on-surface-variant"}`}>
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden mb-2">
            <motion.div 
                className="h-full bg-primary shadow-lg shadow-primary/10"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && <StepTask data={data} onUpdate={updateData} onNext={next} onBack={back} />}
            {step === 1 && <StepQuestion data={data} onUpdate={updateData} onNext={next} onBack={back} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
