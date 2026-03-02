"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { StepDetails } from "@/components/steps/StepDetails";
import { StepTask } from "@/components/steps/StepTask";
import { StepQuestion } from "@/components/steps/StepQuestion";
import { StepWrite } from "@/components/steps/StepWrite";
import type { WizardData } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";
import { GraduationCap } from "lucide-react";

const STORAGE_KEY = "ielts_wizard_draft";

export default function HomePage() {
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<WizardData>>({});
  const [returning, setReturning] = useState(false);

  const STEPS = [
    t("details", "title", lang),
    lang === "vi" ? "Chọn bài" : "Task",
    lang === "vi" ? "Câu hỏi" : "Question",
    lang === "vi" ? "Viết & Chấm" : "Write & Analyze",
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed: Partial<WizardData> = saved ? JSON.parse(saved) : {};
      if (saved) setData(parsed);

      const isReturning = sessionStorage.getItem("ielts_returning") === "1";
      if (isReturning && parsed.name && parsed.email) {
        sessionStorage.removeItem("ielts_returning");
        setReturning(true);
        setStep(2);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Keep language synced into wizard data
  useEffect(() => {
    setData((prev) => ({ ...prev, language: lang }));
  }, [lang]);

  const updateData = (d: Partial<WizardData>) => setData((prev) => ({ ...prev, ...d }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, returning ? 1 : 0));
  const progress = ((step + 1) / STEPS.length) * 100;

  if (step === 3) {
    return <StepWrite data={data} onUpdate={updateData} onBack={back} />;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {returning ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl bg-gradient-to-r from-jaxtina-red/10 to-jaxtina-blue/10 border px-4 py-3 flex items-center gap-3"
          >
            <GraduationCap className="h-5 w-5 text-jaxtina-red shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                {lang === "vi" ? `Chào mừng trở lại, ${data.name?.split(" ")[0]}!` : `Welcome back, ${data.name?.split(" ")[0]}!`}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "vi"
                  ? "Thông tin của bạn đã được lưu — chỉ cần nhập câu hỏi và bài viết mới."
                  : "Your details are saved — just enter a new question and essay below."}
              </p>
            </div>
          </motion.div>
        ) : (
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
        )}

        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium mb-2">
            {STEPS.map((s, i) => {
              const isDone = returning ? i < step || (i < 2 && step >= 2) : i < step;
              const isActive = i === step;
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
            {step === 0 && <StepDetails data={data} onUpdate={updateData} onNext={next} />}
            {step === 1 && <StepTask data={data} onUpdate={updateData} onNext={next} onBack={back} />}
            {step === 2 && <StepQuestion data={data} onUpdate={updateData} onNext={next} onBack={back} />}
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {t("common", "draftSaved", lang)}
        </p>
      </div>
    </div>
  );
}
