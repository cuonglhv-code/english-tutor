"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { t } from "@/lib/i18n";
import { CountdownTimer } from "@/components/placement/CountdownTimer";
import { TimeUpModal } from "@/components/placement/TimeUpModal";
import { SectionNav } from "@/components/placement/SectionNav";
import {
  ReadingSection,
  type ReadingPassage,
} from "@/components/placement/ReadingSection";
import {
  ListeningSection,
  type ListeningPart,
} from "@/components/placement/ListeningSection";
import {
  WritingSection,
  type WritingTask,
} from "@/components/placement/WritingSection";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "reading" | "listening" | "writing";

interface QuestionsPayload {
  testId: string;
  readingPassages: ReadingPassage[];
  listeningParts: ListeningPart[];
  writingTask: WritingTask | null;
}

const SECTION_ORDER: Section[] = ["reading", "listening", "writing"];

const TIMER_DURATIONS: Record<Section, number> = {
  reading:   60 * 60,  // 60 min
  listening: 35 * 60,  // 35 min
  writing:   60 * 60,  // 60 min
};

const TIMER_KEYS: Record<Section, string> = {
  reading:   "placement_timer_reading",
  listening: "placement_timer_listening",
  writing:   "placement_timer_writing",
};

// ─── Page component ───────────────────────────────────────────────────────────
export default function PlacementTestPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QuestionsPayload | null>(null);

  const [currentSection, setCurrentSection] = useState<Section>("reading");
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [essay, setEssay] = useState("");

  // Strip section prefix so components can look up by bare question number
  const readingAnswers = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(answers)
          .filter(([k]) => k.startsWith("reading-"))
          .map(([k, v]) => [k.replace("reading-", ""), v])
      ),
    [answers]
  );
  const listeningAnswers = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(answers)
          .filter(([k]) => k.startsWith("listening-"))
          .map(([k, v]) => [k.replace("listening-", ""), v])
      ),
    [answers]
  );
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reading timer
  const readingTimer = useCountdownTimer(
    TIMER_DURATIONS.reading,
    TIMER_KEYS.reading
  );
  // Listening timer
  const listeningTimer = useCountdownTimer(
    TIMER_DURATIONS.listening,
    TIMER_KEYS.listening
  );
  // Writing timer
  const writingTimer = useCountdownTimer(
    TIMER_DURATIONS.writing,
    TIMER_KEYS.writing
  );

  const currentTimer =
    currentSection === "reading"
      ? readingTimer
      : currentSection === "listening"
      ? listeningTimer
      : writingTimer;

  // ── Fetch questions + create/resume test ──────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/placement/questions");
        if (!res.ok) {
          const body = await res.text();
          console.error("[placement/test] questions API error:", res.status, body);
          throw new Error(body);
        }
        const json: QuestionsPayload = await res.json();
        setData(json);
        // Start reading timer automatically
        readingTimer.start();
      } catch (e) {
        console.error("[placement/test] load error:", e);
        setError(t("placement", "errorLoading", lang));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Timer expiry handler ──────────────────────────────────────────────────
  useEffect(() => {
    if (currentTimer.remaining === 0 && !showTimeUp && !submitting) {
      setShowTimeUp(true);
    }
  }, [currentTimer.remaining, showTimeUp, submitting]);

  // ── Answer setter ─────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (section: Section, questionNumber: number, value: string) => {
      setAnswers((prev) => ({
        ...prev,
        [`${section}-${questionNumber}`]: value,
      }));
    },
    []
  );

  // ── Save answers for the current section ─────────────────────────────────
  const saveCurrentSectionAnswers = useCallback(
    async (section: Section, testId: string) => {
      const sectionAnswers = Object.entries(answers)
        .filter(([k]) => k.startsWith(`${section}-`))
        .map(([k, v]) => ({
          questionNumber: parseInt(k.split("-")[1], 10),
          answerText: v,
        }));

      // Add essay as writing answer (question_number = 0)
      if (section === "writing") {
        sectionAnswers.push({ questionNumber: 0, answerText: essay });
      }

      await fetch("/api/placement/save-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId, section, answers: sectionAnswers }),
      });
    },
    [answers, essay]
  );

  // ── Advance to next section ───────────────────────────────────────────────
  const advanceSection = useCallback(async () => {
    if (!data) return;
    currentTimer.pause();

    await saveCurrentSectionAnswers(currentSection, data.testId).catch(() => {});

    const nextIndex = SECTION_ORDER.indexOf(currentSection) + 1;
    if (nextIndex < SECTION_ORDER.length) {
      const next = SECTION_ORDER[nextIndex];
      setCurrentSection(next);
      // Start the next section timer
      if (next === "listening") listeningTimer.start();
      if (next === "writing") writingTimer.start();
    } else {
      // Writing was last — submit
      await handleSubmit();
    }
  }, [currentSection, currentTimer, data, listeningTimer, writingTimer, saveCurrentSectionAnswers]);

  // ── Handle time-up confirmation ───────────────────────────────────────────
  const handleTimeUpContinue = useCallback(() => {
    setShowTimeUp(false);
    advanceSection();
  }, [advanceSection]);

  // ── Final submit ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!data) return;
    setSubmitting(true);
    try {
      // Save writing essay first
      await saveCurrentSectionAnswers("writing", data.testId).catch(() => {});

      const res = await fetch("/api/placement/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: data.testId }),
      });
      if (!res.ok) throw new Error("Submission failed");

      // Clear all timers from storage
      readingTimer.clear();
      listeningTimer.clear();
      writingTimer.clear();

      router.push(`/placement/results?id=${data.testId}`);
    } catch {
      toast.error(t("placement", "errorSubmit", lang));
      setSubmitting(false);
    }
  }, [data, essay, lang, readingTimer, listeningTimer, writingTimer, router, saveCurrentSectionAnswers]);

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-3 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>{t("placement", "loadingQuestions", lang)}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 text-sm p-6">
        {error ?? t("placement", "errorLoading", lang)}
      </div>
    );
  }

  const isLastSection = currentSection === "writing";

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 shrink-0">
        {/* Section title */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 uppercase tracking-wide">
            IELTS Placement Test
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-700 capitalize">
            {t(
              "placement",
              currentSection === "reading"
                ? "readingTitle"
                : currentSection === "listening"
                ? "listeningTitle"
                : "writingTitle",
              lang
            )}
          </span>
        </div>

        {/* Section progress dots */}
        <div className="flex items-center gap-2">
          {SECTION_ORDER.map((s) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                s === currentSection
                  ? "bg-blue-600"
                  : SECTION_ORDER.indexOf(s) <
                    SECTION_ORDER.indexOf(currentSection)
                  ? "bg-blue-300"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Timer */}
        <CountdownTimer remaining={currentTimer.remaining} lang={lang} />
      </header>

      {/* ── Section content ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {currentSection === "reading" && data.readingPassages.length > 0 ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Passage tabs */}
            {data.readingPassages.length > 1 && (
              <div className="flex gap-1 px-4 pt-2 pb-0 bg-white border-b border-slate-200 shrink-0">
                {data.readingPassages.map((p, i) => (
                  <button
                    key={p.part_number}
                    onClick={() => setCurrentPassageIndex(i)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-t border border-b-0 transition-colors ${
                      i === currentPassageIndex
                        ? "bg-white border-slate-200 text-blue-700"
                        : "bg-slate-50 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {t("placement", "passageLabel", lang)} {p.part_number}
                  </button>
                ))}
              </div>
            )}
            <ReadingSection
              lang={lang}
              passage={data.readingPassages[currentPassageIndex]}
              answers={readingAnswers}
              onAnswer={(qn, v) => handleAnswer("reading", qn, v)}
            />
          </div>
        ) : currentSection === "listening" ? (
          <ListeningSection
            lang={lang}
            parts={data.listeningParts}
            answers={listeningAnswers}
            onAnswer={(qn, v) => handleAnswer("listening", qn, v)}
          />
        ) : currentSection === "writing" && data.writingTask ? (
          <WritingSection
            lang={lang}
            task={data.writingTask}
            essay={essay}
            onChange={setEssay}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            {t("placement", "errorLoading", lang)}
          </div>
        )}
      </div>

      {/* ── Bottom navigation ── */}
      <SectionNav
        lang={lang}
        onBack={
          currentSection !== "reading"
            ? () => {
                const idx = SECTION_ORDER.indexOf(currentSection);
                if (idx > 0) setCurrentSection(SECTION_ORDER[idx - 1]);
              }
            : undefined
        }
        backDisabled={currentSection === "reading"}
        onNext={isLastSection ? handleSubmit : advanceSection}
        nextLabel={
          isLastSection
            ? t("placement", "submitTest", lang)
            : undefined
        }
        isLoading={submitting}
      />

      {/* ── Time-up modal ── */}
      <TimeUpModal
        open={showTimeUp}
        lang={lang}
        onContinue={handleTimeUpContinue}
      />
    </div>
  );
}
