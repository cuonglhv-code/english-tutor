"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { StepTask } from "@/components/steps/StepTask";
import { StepQuestion } from "@/components/steps/StepQuestion";
import { StepWrite } from "@/components/steps/StepWrite";
import type { WizardData } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";
import { GraduationCap } from "lucide-react";

export default function HomePage() {
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<WizardData>>({});

  const STEPS = [
    lang === "vi" ? "Chọn bài" : "Task",
    lang === "vi" ? "Câu hỏi" : "Question",
    lang === "vi" ? "Viết & Chấm" : "Write & Analyze",
  ];

  // Keep language synced into wizard data
  useEffect(() => {
    setData((prev) => ({ ...prev, language: lang }));
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
        taskNumber: preloaded.taskNumber,
        taskType: preloaded.taskType,
        questionImage: preloaded.questionImage,
      }));
      // Jump straight to the Write step
      setStep(2);
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateData = (d: Partial<WizardData>) => setData((prev) => ({ ...prev, ...d }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const progress = ((step + 1) / STEPS.length) * 100;

  if (step === 2) {
    return <StepWrite data={data} onUpdate={updateData} onBack={back} />;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-jaxtina-red to-jaxtina-blue px-4 py-1.5 text-white text-sm font-medium mb-3">
            <GraduationCap className="h-4 w-4" />
            {lang === "vi" ? "Chấm thi IELTS Writing bằng AI" : "AI-Powered IELTS Writing Examiner"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {lang === "vi" ? (
              <>
                Nhận{" "}
                <span className="bg-gradient-to-r from-jaxtina-red to-jaxtina-blue bg-clip-text text-transparent">
                  Band Score
                </span>
                <br />
                Ngay lập tức
              </>
            ) : (
              <>
                Get Your{" "}
                <span className="bg-gradient-to-r from-jaxtina-red to-jaxtina-blue bg-clip-text text-transparent">
                  Band Score
                </span>
                <br />
                Instantly
              </>
            )}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            {lang === "vi"
              ? "Mô phỏng buổi chấm thi IELTS • Phản hồi theo từng tiêu chí • Miễn phí"
              : "Simulate an IELTS marking session • Get criterion-by-criterion feedback • Free"}
          </p>
        </motion.div>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium mb-2">
            {STEPS.map((s, i) => {
              const isActive = i === step;
              const isDone = i < step;
              return (
                <span
                  key={s}
                  className={
                    isActive
                      ? "text-jaxtina-red font-bold"
                      : isDone
                        ? "text-jaxtina-blue"
                        : "text-muted-foreground"
                  }
                >
                  {isDone ? "✓ " : ""}
                  {s}
                </span>
              );
            })}
          </div>
          <Progress value={progress} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {step === 0 && <StepTask data={data} onUpdate={updateData} onNext={next} onBack={back} />}
            {step === 1 && <StepQuestion data={data} onUpdate={updateData} onNext={next} onBack={back} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
