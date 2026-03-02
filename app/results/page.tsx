"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BandsTable } from "@/components/results/BandsTable";
import { FeedbackAccordion } from "@/components/results/FeedbackAccordion";
import { TipsCarousel } from "@/components/results/TipsCarousel";
import { SubscribeCTA } from "@/components/results/SubscribeCTA";
import { ScoringMethodBadge } from "@/components/ScoringMethodBadge";
import { Loader2, RotateCcw, BookOpen, ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { AnalysisResult, WizardData } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";

interface StoredResult {
  result: AnalysisResult;
  formData: WizardData;
  essayPlan?: string | null;
}

export default function ResultsPage() {
  const { lang } = useLanguage();
  const [stored, setStored] = useState<StoredResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [planOpen, setPlanOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ielts_result");
      if (!raw) { router.push("/"); return; }
      setStored(JSON.parse(raw));
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jaxtina-red" />
      </div>
    );
  }

  if (!stored) return null;

  const { result, formData, essayPlan } = stored;
  const scoringMethod = result.scoring_method ?? "rule_based_fallback";

  const handlePracticeAgain = () => {
    try {
      const draft = JSON.parse(localStorage.getItem("ielts_wizard_draft") || "{}");
      const preserved = {
        name: draft.name,
        age: draft.age,
        address: draft.address,
        mobile: draft.mobile,
        email: draft.email,
        currentBands: draft.currentBands,
        targetBand: draft.targetBand,
        taskType: draft.taskType,
        taskNumber: draft.taskNumber,
        language: draft.language,
      };
      localStorage.setItem("ielts_wizard_draft", JSON.stringify(preserved));
    } catch {}
    sessionStorage.removeItem("ielts_result");
    sessionStorage.setItem("ielts_returning", "1");
    router.push("/");
  };

  const handleFullReset = () => {
    localStorage.removeItem("ielts_wizard_draft");
    sessionStorage.removeItem("ielts_result");
    sessionStorage.removeItem("ielts_returning");
    router.push("/");
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-black">{t("results", "title", lang)}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                {formData.name} · Task {formData.taskNumber}{" "}
                {formData.taskType === "academic" ? "Academic" : "General"} · {result.wordCount} {t("common", "words", lang)}
                <ScoringMethodBadge method={scoringMethod} lang={lang} size="xs" />
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleFullReset} title="Start completely fresh">
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> {t("results", "startOver", lang)}
            </Button>
          </div>
        </motion.div>

        {/* Essay Plan Panel */}
        {essayPlan && (
          <div className="rounded-xl border overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/60 hover:bg-muted/80 transition-colors text-left"
              onClick={() => setPlanOpen((v) => !v)}
            >
              <span className="flex items-center gap-2 font-semibold text-sm">
                <FileText className="h-4 w-4 text-jaxtina-blue" />
                {t("essayPlan", "planTitle", lang)}
              </span>
              {planOpen
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />
              }
            </button>
            {planOpen && (
              <div className="p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{essayPlan}</p>
              </div>
            )}
          </div>
        )}

        <BandsTable bands={result.bands} taskNumber={formData.taskNumber} lang={lang} />
        <FeedbackAccordion feedback={result.feedback} lang={lang} />

        {/* Priority actions for AI feedback */}
        {result.priorityActions && result.priorityActions.length > 0 && (
          <div className="rounded-xl border p-4 space-y-2">
            <h3 className="font-bold text-sm flex items-center gap-2">
              🎯 {t("results", "priorityActions", lang)}
            </h3>
            <ul className="space-y-1.5">
              {result.priorityActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-jaxtina-red text-white text-[10px] flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Overall comment for AI feedback */}
        {result.overallComment && (
          <div className="rounded-xl border p-4 bg-muted/30">
            <h3 className="font-bold text-sm mb-2">{t("results", "overallComment", lang)}</h3>
            <p className="text-sm leading-relaxed">{result.overallComment}</p>
          </div>
        )}

        <TipsCarousel tips={result.tips} lang={lang} />

        <div className="grid grid-cols-2 gap-3">
          <Button variant="blue" asChild size="lg">
            <Link href="/courses">
              <BookOpen className="h-4 w-4 mr-2" /> {t("results", "exploreCourses", lang)}
            </Link>
          </Button>
          <Button onClick={handlePracticeAgain} size="lg">
            <RotateCcw className="h-4 w-4 mr-2" /> {t("results", "practiceAgain", lang)}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">{result.disclaimer}</p>
      </div>

      <SubscribeCTA email={formData.email} name={formData.name} mobile={formData.mobile} />
    </div>
  );
}
