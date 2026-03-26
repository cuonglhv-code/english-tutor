"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BandsTable } from "@/components/results/BandsTable";
import { FeedbackAccordion } from "@/components/results/FeedbackAccordion";
import { TipsCarousel } from "@/components/results/TipsCarousel";
import { SubscribeCTA } from "@/components/results/SubscribeCTA";
import { ScoringMethodBadge } from "@/components/ScoringMethodBadge";
import { Loader2, RotateCcw, BookOpen, ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { AnalysisResult, WizardData } from "@/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { Lang } from "@/lib/i18n";

interface StoredResult {
  result: AnalysisResult;
  formData: WizardData;
  essayPlan?: string | null;
}

export default function ResultsPage() {
  const { dict, lang } = useTranslation();
  const [stored, setStored] = useState<StoredResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [planOpen, setPlanOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ielts_result");
      if (!raw) { router.push(`/${lang}`); return; }
      setStored(JSON.parse(raw));
    } catch {
      router.push(`/${lang}`);
    } finally {
      setLoading(false);
    }
  }, [router, lang]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!stored) return null;

  const { result, formData, essayPlan } = stored;
  const scoringMethod = result.scoring_method ?? "rule_based_fallback";

  const handlePracticeAgain = () => {
    sessionStorage.removeItem("ielts_result");
    sessionStorage.setItem("ielts_returning", "1");
    router.push(`/${lang}`);
  };

  const handleFullReset = () => {
    localStorage.removeItem("ielts_wizard_draft");
    sessionStorage.removeItem("ielts_result");
    sessionStorage.removeItem("ielts_returning");
    router.push(`/${lang}`);
  };

  return (
    <div className="min-h-screen bg-surface py-20 px-6 md:px-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                Evaluation Complete
              </div>
              <h1 className="text-5xl font-black font-display tracking-tighter text-on-surface">
                {lang === 'vi' ? 'Kết quả của ' : 'Analysis for '}
                <span className="text-primary italic">{formData.name || 'Candidate'}</span>
              </h1>
              <p className="text-sm text-on-surface-variant font-medium opacity-60 flex items-center gap-3 flex-wrap lowercase tracking-wider">
                Task {formData.taskNumber} · {formData.taskType} · {result.wordCount} words
                <span className="w-1 h-1 rounded-full bg-on-surface-variant/20" />
                <ScoringMethodBadge method={scoringMethod} lang={lang as Lang} size="xs" />
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleFullReset} className="rounded-xl font-black uppercase tracking-widest text-[9px] text-on-surface-variant/40 hover:text-primary transition-colors h-12 px-6 bg-white shadow-sm border-none">
              <RotateCcw className="h-3.5 w-3.5 mr-2" /> {lang === 'vi' ? 'LÀM LẠI MỚI' : 'START FRESH'}
            </Button>
          </div>
        </motion.div>

        {/* Essay Plan Panel */}
        {essayPlan && (
          <div className="rounded-[32px] bg-white shadow-premium overflow-hidden border-none group transition-all duration-500">
            <button
              className="w-full flex items-center justify-between px-10 py-8 text-left"
              onClick={() => setPlanOpen((v) => !v)}
            >
              <span className="flex items-center gap-4 font-black text-xs uppercase tracking-[0.2em] text-on-surface">
                <FileText className="h-5 w-5 text-primary" />
                {lang === 'vi' ? 'Dàn ý học thuật' : 'Strategic Essay Plan'}
              </span>
              {planOpen
                ? <ChevronUp className="h-4 w-4 text-on-surface-variant opacity-20" />
                : <ChevronDown className="h-4 w-4 text-on-surface-variant opacity-20" />
              }
            </button>
            <AnimatePresence>
              {planOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-10 pb-10 overflow-hidden"
                >
                  <div className="p-8 bg-surface rounded-2xl border-none font-medium text-lg leading-relaxed text-on-surface-variant whitespace-pre-wrap">
                    {essayPlan}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <BandsTable bands={result.bands} taskNumber={formData.taskNumber} lang={lang as Lang} />
        <FeedbackAccordion feedback={result.feedback} lang={lang as Lang} />

        {/* Priority actions for AI feedback */}
        {result.priorityActions && result.priorityActions.length > 0 && (
          <div className="rounded-[40px] bg-white p-12 space-y-8 shadow-premium border-none">
            <h3 className="font-black font-display text-2xl tracking-tight flex items-center gap-4">
              <span className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary text-sm">🎯</span>
              {lang === 'vi' ? 'Hành động ưu tiên' : 'Strategic Priority Actions'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/20">English Directive</p>
                <ul className="space-y-4">
                  {result.priorityActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-4 text-base font-medium text-on-surface-variant opacity-80 leading-relaxed">
                      <span className="flex-shrink-0 h-6 w-6 rounded-lg bg-secondary/10 text-secondary text-[10px] flex items-center justify-center font-black mt-0.5">
                        {i + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              {result.priorityActions_vi && result.priorityActions_vi.length > 0 && (
                <div className="md:border-l md:border-on-surface-variant/5 md:pl-12 space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/20">Hướng dẫn tiếng Việt</p>
                  <ul className="space-y-4">
                    {result.priorityActions_vi.map((action, i) => (
                      <li key={i} className="flex items-start gap-4 text-base font-medium text-on-surface-variant opacity-80 leading-relaxed">
                        <span className="flex-shrink-0 h-6 w-6 rounded-lg bg-primary/10 text-primary text-[10px] flex items-center justify-center font-black mt-0.5">
                          {i + 1}
                        </span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overall comment for AI feedback */}
        {result.overallComment && (
          <div className="rounded-[40px] bg-white p-12 space-y-8 shadow-premium border-none">
            <h3 className="font-black font-display text-2xl tracking-tight flex items-center gap-4">
               <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm">💬</span>
               {lang === 'vi' ? 'Nhận xét tổng quan' : 'Examiner Recap'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/20">Technical Summary</p>
                <p className="text-lg leading-relaxed font-medium text-on-surface-variant opacity-80">{result.overallComment}</p>
              </div>
              {result.overallComment_vi && (
                <div className="md:border-l md:border-on-surface-variant/5 md:pl-12 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/20">Tóm tắt tiếng Việt</p>
                  <p className="text-lg leading-relaxed font-medium text-on-surface-variant opacity-80">{result.overallComment_vi}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <TipsCarousel tips={result.tips} lang={lang as Lang} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12">
          <Button asChild size="lg" className="h-20 rounded-[24px] bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-[0.25em] text-[10px] shadow-2xl shadow-secondary/20 transition-all active:scale-95 border-none">
            <Link href={`/${lang}/courses`}>
              <BookOpen className="h-5 w-5 mr-4" /> {lang === 'vi' ? 'KHÁM PHÁ KHÓA HỌC' : 'EXPLORE SYLLABUS'}
            </Link>
          </Button>
          <Button onClick={handlePracticeAgain} size="lg" className="h-20 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.25em] text-[10px] shadow-2xl shadow-primary/20 transition-all active:scale-95 border-none">
            <RotateCcw className="h-5 w-5 mr-4" /> {lang === 'vi' ? 'LUYỆN TẬP LẠI' : 'ANOTHER ATTEMPT'}
          </Button>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant opacity-20 pt-12">
            Automated Evaluation by Scholar AI Logic Hub v4.0.2
        </p>
      </div>

      <SubscribeCTA email={formData.email} name={formData.name} mobile={formData.mobile} />
    </div>
  );
}
