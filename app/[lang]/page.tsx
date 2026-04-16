"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { StepTask } from "@/components/steps/StepTask";
import { StepQuestion } from "@/components/steps/StepQuestion";
import { StepWrite } from "@/components/steps/StepWrite";
import type { WizardData } from "@/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useUser } from "@/hooks/useUser";
import { Loader2, GraduationCap } from "lucide-react";

function trackEvent(name: string, metadata: Record<string, unknown> = {}) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_name: name, metadata }),
  }).catch(() => {});
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function PracticePage() {
  const { user, loading: userLoading } = useUser();
  const { dict, lang } = useTranslation();
  const router = useRouter();
  const startTimeRef = useRef(Date.now());
  const trackedStart = useRef(false);
  const sessionIdRef = useRef<string>(generateSessionId());
  // Set to true when submission is in-flight — suppresses false wizard_abandoned on unload
  const submittingRef = useRef(false);

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

  // Redirect unauthenticated users to login, preserving intended destination
  useEffect(() => {
    if (!userLoading && !user) {
      router.push(`/${lang}/login?next=/`);
    }
  }, [user, userLoading, lang, router]);

  // Fire wizard_started once after user confirmed
  useEffect(() => {
    if (user && !trackedStart.current) {
      trackedStart.current = true;
      startTimeRef.current = Date.now();
      trackEvent('wizard_started', { session_id: sessionIdRef.current });
    }
  }, [user]);

  // Fire wizard_abandoned on page unload via sendBeacon — but NOT if a submission is in-flight
  useEffect(() => {
    if (!user) return;
    const handleUnload = () => {
      if (submittingRef.current) return;
      const payload = JSON.stringify({
        event_name: 'wizard_abandoned',
        metadata: { step, session_id: sessionIdRef.current },
      });
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user, step]);

  const updateData = (d: Partial<WizardData>) => setData((prev) => ({ ...prev, ...d }));
  const next = () => {
    const newStep = Math.min(step + 1, STEPS.length - 1);
    trackEvent('wizard_step_advanced', { step: newStep, session_id: sessionIdRef.current });
    setStep(newStep);
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const progress = ((step + 1) / STEPS.length) * 100;

  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (step === 2) {
    return (
      <StepWrite
        data={data}
        onUpdate={updateData}
        onBack={back}
        startTime={startTimeRef.current}
        sessionId={sessionIdRef.current}
        onSubmitStart={() => { submittingRef.current = true; }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAF8] py-16 px-6 md:px-12 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#26A69A]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF7043]/5 blur-[100px] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#26A69A 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }}
      />

      <div className="relative mx-auto max-w-4xl pt-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 rounded-full bg-[#26A69A]/10 px-6 py-2.5 text-[#26A69A] text-[11px] font-black uppercase tracking-[0.2em] mb-8 border border-[#26A69A]/10 shadow-sm">
            <GraduationCap className="h-4 w-4" />
            Jaxtina Mastery Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-[0.95] text-slate-800 mb-10">
            {lang === 'vi' ? 'Nhận ' : 'Get Your '}
            <span className="text-[#FF7043]">Band Score</span>
            <br />
            {lang === 'vi' ? 'Ngay lập tức' : 'Instantly.'}
          </h1>
          <p className="mt-8 text-slate-500 text-lg font-bold max-w-2xl mx-auto leading-relaxed">
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
                    flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] text-sm font-black 
                    ${isActive ? "bg-[#FF7043] text-white shadow-xl shadow-orange-200" : isDone ? "bg-white text-[#26A69A] border border-[#26A69A]/20" : "bg-slate-100 text-slate-400"}
                  `}>
                    {isDone ? "✓" : `0${i + 1}`}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${isActive ? "text-[#FF7043]" : "text-slate-400"}`}>
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-2 border border-slate-200/50 shadow-inner">
            <motion.div 
                className="h-full bg-gradient-to-r from-[#FF7043] to-[#FF8A65] shadow-lg shadow-orange-100"
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
