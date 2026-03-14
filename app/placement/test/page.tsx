"use client";
// ── PLACEMENT TEST PAGE ─────────────────────────────────────────────────────
// Section order: Listening (35 min) → Reading (60 min) → Writing T1 (20 min) → Writing T2 (40 min)
// Within a section, "Next" moves to the next Part/Passage.
// Only when on the last Part/Passage does "Next" advance to the next section.
// Unanswered-questions warning shown when leaving Listening or Reading.
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
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
type Section = "listening" | "reading" | "writing_t1" | "writing_t2";

interface QuestionsPayload {
  testId: string;
  readingPassages: ReadingPassage[];
  listeningParts: ListeningPart[];
  writingTask1: WritingTask | null;
  writingTask2: WritingTask | null;
}

const SECTION_ORDER: Section[] = [
  "listening",
  "reading",
  "writing_t1",
  "writing_t2",
];

const TIMER_DURATIONS: Record<Section, number> = {
  listening:  35 * 60,
  reading:    60 * 60,
  writing_t1: 20 * 60,
  writing_t2: 40 * 60,
};

const TIMER_KEYS: Record<Section, string> = {
  listening:  "placement_timer_listening",
  reading:    "placement_timer_reading",
  writing_t1: "placement_timer_writing_t1",
  writing_t2: "placement_timer_writing_t2",
};

// ─── Unanswered-questions warning dialog ─────────────────────────────────────
function UnansweredWarning({
  count,
  sectionName,
  onReview,
  onContinue,
}: {
  count: number;
  sectionName: string;
  onReview: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base leading-tight">
              {count} unanswered question{count !== 1 ? "s" : ""} in {sectionName}
            </h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Once you leave this section you <span className="font-semibold text-red-600">cannot come back</span> to change your answers.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm text-amber-800">
          Do you want to go back and review, or continue to the next section?
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full border-slate-300"
            onClick={onReview}
          >
            ← Review Answers
          </Button>
          <Button
            className="flex-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white"
            onClick={onContinue}
          >
            Continue Anyway →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PlacementTestPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QuestionsPayload | null>(null);

  // ── Section navigation ────────────────────────────────────────────────────
  // IMPORTANT: starts at "listening" — first section in new order
  const [currentSection, setCurrentSection] = useState<Section>("listening");
  const [activeListeningPart, setActiveListeningPart] = useState(0);  // 0-indexed Part index
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);   // 0-indexed Passage index

  // ── Answers ───────────────────────────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [essayT1, setEssayT1] = useState("");  // Writing Task 1 essay
  const [essayT2, setEssayT2] = useState("");  // Writing Task 2 essay

  // ── Unanswered warning ────────────────────────────────────────────────────
  const [showUnanswered, setShowUnanswered] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);

  // ── Misc UI state ─────────────────────────────────────────────────────────
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Section-specific answer views ─────────────────────────────────────────
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

  // ── Wipe stale timer state BEFORE hooks read localStorage ─────────────────
  // useCountdownTimer reads localStorage in its useState lazy initialiser, so we
  // must clear storage synchronously on the very first render — before those hooks
  // are called — otherwise a leftover "remaining=0" causes the Time-Up modal to
  // appear immediately every time the user loads/refreshes the page.
  const _timersWiped = useRef(false);
  if (!_timersWiped.current) {
    _timersWiped.current = true;
    if (typeof window !== "undefined") {
      Object.values(TIMER_KEYS).forEach((key) => {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
      });
    }
  }

  // ── Four independent countdown timers ─────────────────────────────────────
  const listeningTimer  = useCountdownTimer(TIMER_DURATIONS.listening,  TIMER_KEYS.listening);
  const readingTimer    = useCountdownTimer(TIMER_DURATIONS.reading,     TIMER_KEYS.reading);
  const writingT1Timer  = useCountdownTimer(TIMER_DURATIONS.writing_t1,  TIMER_KEYS.writing_t1);
  const writingT2Timer  = useCountdownTimer(TIMER_DURATIONS.writing_t2,  TIMER_KEYS.writing_t2);

  // Helper: get timer instance for a given section
  const getTimer = useCallback(
    (s: Section) => {
      if (s === "listening")  return listeningTimer;
      if (s === "reading")    return readingTimer;
      if (s === "writing_t1") return writingT1Timer;
      return writingT2Timer;
    },
    [listeningTimer, readingTimer, writingT1Timer, writingT2Timer]
  );

  const currentTimer = getTimer(currentSection);

  // ── Fetch questions (create / resume test) ────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/placement/questions");
        if (!res.ok) {
          const body = await res.text();
          console.error("[placement/test] API error:", res.status, body);
          throw new Error(body);
        }
        const json: QuestionsPayload = await res.json();
        setData(json);
        listeningTimer.start(); // kick off the first timer
      } catch (e) {
        console.error("[placement/test] load error:", e);
        setError(t("placement", "errorLoading", lang));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ── Timer-expiry ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentTimer.remaining === 0 && !showTimeUp && !submitting) {
      setShowTimeUp(true);
    }
  }, [currentTimer.remaining, showTimeUp, submitting]);

  // ── Answer setter ─────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (section: "reading" | "listening", questionNumber: number, value: string) => {
      setAnswers((prev) => ({
        ...prev,
        [`${section}-${questionNumber}`]: value,
      }));
    },
    []
  );

  // ── Save answers to the DB ────────────────────────────────────────────────
  const saveAnswers = useCallback(
    async (section: Section, testId: string) => {
      // The DB check-constraint uses "writing" for both writing sections
      const dbSection =
        section === "writing_t1" || section === "writing_t2" ? "writing" : section;

      let sectionAnswers: { questionNumber: number; answerText: string }[] = [];

      if (section === "reading" || section === "listening") {
        sectionAnswers = Object.entries(answers)
          .filter(([k]) => k.startsWith(`${section}-`))
          .map(([k, v]) => ({
            questionNumber: parseInt(k.split("-")[1], 10),
            answerText: v,
          }));
      } else if (section === "writing_t1") {
        sectionAnswers = [{ questionNumber: 1, answerText: essayT1 }];
      } else if (section === "writing_t2") {
        sectionAnswers = [{ questionNumber: 2, answerText: essayT2 }];
      }

      await fetch("/api/placement/save-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId, section: dbSection, answers: sectionAnswers }),
      });
    },
    [answers, essayT1, essayT2]
  );

  // ── Count unanswered questions for the WHOLE current section ──────────────
  const countUnanswered = useCallback((): number => {
    if (!data) return 0;
    if (currentSection === "listening") {
      const allQs = data.listeningParts.flatMap((p) => p.questions);
      return allQs.filter(
        (q) => (answers[`listening-${q.question_number}`] ?? "").trim() === ""
      ).length;
    }
    if (currentSection === "reading") {
      const allQs = data.readingPassages.flatMap((p) => p.questions);
      return allQs.filter(
        (q) => (answers[`reading-${q.question_number}`] ?? "").trim() === ""
      ).length;
    }
    return 0;
  }, [data, currentSection, answers]);

  // ── Within-section navigation ─────────────────────────────────────────────
  // Returns true if there are more Parts (Listening) or Passages (Reading) ahead
  const canGoNextWithinSection = useCallback((): boolean => {
    if (!data) return false;
    if (currentSection === "listening")
      return activeListeningPart < data.listeningParts.length - 1;
    if (currentSection === "reading")
      return currentPassageIndex < data.readingPassages.length - 1;
    return false; // writing sections go straight to advanceSection
  }, [currentSection, activeListeningPart, currentPassageIndex, data]);

  const goNextWithinSection = useCallback(() => {
    if (currentSection === "listening")
      setActiveListeningPart((p) => p + 1);
    else if (currentSection === "reading")
      setCurrentPassageIndex((p) => p + 1);
  }, [currentSection]);

  // ── Advance to the next major section (or submit) ─────────────────────────
  // Use a ref to break the mutual dependency between advanceSection ↔ handleSubmit
  const handleSubmitRef = useRef<() => Promise<void>>();

  const advanceSection = useCallback(async () => {
    if (!data) return;
    currentTimer.pause();
    await saveAnswers(currentSection, data.testId).catch(() => {});

    const nextIndex = SECTION_ORDER.indexOf(currentSection) + 1;

    if (nextIndex < SECTION_ORDER.length) {
      const next = SECTION_ORDER[nextIndex];
      // Reset within-section indices
      if (next === "reading")   setCurrentPassageIndex(0);
      if (next === "listening") setActiveListeningPart(0);
      setCurrentSection(next);
      getTimer(next).start();
    } else {
      // All sections done — submit
      await handleSubmitRef.current?.();
    }
  }, [currentSection, currentTimer, data, saveAnswers, getTimer]);

  // ── Main "Next" button handler ────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (canGoNextWithinSection()) {
      // Still within the section — just go to the next part/passage
      goNextWithinSection();
    } else {
      // About to leave this section. Warn if there are unanswered questions.
      if (currentSection === "listening" || currentSection === "reading") {
        const count = countUnanswered();
        if (count > 0) {
          setUnansweredCount(count);
          setShowUnanswered(true);
          return; // wait for user decision
        }
      }
      await advanceSection();
    }
  }, [
    canGoNextWithinSection,
    goNextWithinSection,
    currentSection,
    countUnanswered,
    advanceSection,
  ]);

  // ── Unanswered warning actions ────────────────────────────────────────────
  const handleUnansweredContinue = useCallback(async () => {
    setShowUnanswered(false);
    await advanceSection();
  }, [advanceSection]);

  const handleUnansweredReview = useCallback(() => {
    setShowUnanswered(false);
    // Stay on current section — user can scroll/navigate to review
  }, []);

  // ── "Back" handler ────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (currentSection === "listening") {
      if (activeListeningPart > 0) setActiveListeningPart((p) => p - 1);
      // At Part 1 — no further back (first section)
    } else if (currentSection === "reading") {
      if (currentPassageIndex > 0) {
        setCurrentPassageIndex((p) => p - 1);
      } else {
        // Back to last Listening part
        readingTimer.pause();
        listeningTimer.start();
        setCurrentSection("listening");
        if (data) setActiveListeningPart(data.listeningParts.length - 1);
      }
    } else if (currentSection === "writing_t1") {
      writingT1Timer.pause();
      readingTimer.start();
      setCurrentSection("reading");
      if (data) setCurrentPassageIndex(data.readingPassages.length - 1);
    } else if (currentSection === "writing_t2") {
      writingT2Timer.pause();
      writingT1Timer.start();
      setCurrentSection("writing_t1");
    }
  }, [
    currentSection,
    activeListeningPart,
    currentPassageIndex,
    data,
    readingTimer,
    listeningTimer,
    writingT1Timer,
    writingT2Timer,
  ]);

  // ── Time-up modal "Continue" ──────────────────────────────────────────────
  const handleTimeUpContinue = useCallback(() => {
    setShowTimeUp(false);
    advanceSection();
  }, [advanceSection]);

  // ── Final submit ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!data) return;
    setSubmitting(true);
    try {
      // Persist both writing essays before submitting
      await saveAnswers("writing_t1", data.testId).catch(() => {});
      await saveAnswers("writing_t2", data.testId).catch(() => {});

      const res = await fetch("/api/placement/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: data.testId }),
      });
      if (!res.ok) throw new Error("Submission failed");

      // Clear timer persistence from localStorage
      Object.values(TIMER_KEYS).forEach((key) => {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
      });
      listeningTimer.clear();
      readingTimer.clear();
      writingT1Timer.clear();
      writingT2Timer.clear();

      router.push(`/placement/results?id=${data.testId}`);
    } catch {
      toast.error(t("placement", "errorSubmit", lang));
      setSubmitting(false);
    }
  }, [
    data,
    lang,
    listeningTimer,
    readingTimer,
    writingT1Timer,
    writingT2Timer,
    router,
    saveAnswers,
  ]);

  // Keep the ref in sync so advanceSection can call it without circular deps
  handleSubmitRef.current = handleSubmit;

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

  // ── Derived display values ────────────────────────────────────────────────
  const sectionIdx    = SECTION_ORDER.indexOf(currentSection);
  const isLastSection = currentSection === "writing_t2";
  const isBackDisabled =
    currentSection === "listening" && activeListeningPart === 0;

  // Header label e.g. "Listening — Part 2", "Reading — Passage 3", "Writing — Task 1"
  const sectionLabel =
    currentSection === "listening"
      ? `Listening — Part ${
          data.listeningParts[activeListeningPart]?.audio.part_number ??
          activeListeningPart + 1
        }`
      : currentSection === "reading"
      ? `Reading — Passage ${currentPassageIndex + 1}`
      : currentSection === "writing_t1"
      ? "Writing — Task 1"
      : "Writing — Task 2";

  const sectionNameForWarning =
    currentSection === "listening" ? "Listening" : "Reading";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-white">

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 shrink-0">
        {/* Section label */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-slate-400 uppercase tracking-wide shrink-0">
            IELTS Placement
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-700 truncate">{sectionLabel}</span>
        </div>

        {/* 4-dot section progress */}
        <div className="flex items-center gap-2 shrink-0">
          {SECTION_ORDER.map((s, i) => (
            <div
              key={s}
              title={s}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === sectionIdx
                  ? "bg-blue-600"
                  : i < sectionIdx
                  ? "bg-blue-300"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Countdown for the CURRENT section's timer */}
        <CountdownTimer remaining={currentTimer.remaining} lang={lang} />
      </header>

      {/* ── Section content ── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* ──── LISTENING ──── */}
        {currentSection === "listening" && (
          <ListeningSection
            lang={lang}
            parts={data.listeningParts}
            activePart={activeListeningPart}
            onPartChange={setActiveListeningPart}
            answers={listeningAnswers}
            onAnswer={(qn, v) => handleAnswer("listening", qn, v)}
            onBack={handleBack}
            onNext={handleNext}
            backDisabled={isBackDisabled}
            isLoading={submitting}
          />
        )}

        {/* ──── READING ──── */}
        {currentSection === "reading" && data.readingPassages.length > 0 && (
          <ReadingSection
            lang={lang}
            passage={data.readingPassages[currentPassageIndex]}
            answers={readingAnswers}
            onAnswer={(qn, v) => handleAnswer("reading", qn, v)}
            onBack={handleBack}
            onNext={handleNext}
            backDisabled={false}
            isLoading={submitting}
          />
        )}

        {/* ──── WRITING TASK 1 ──── */}
        {currentSection === "writing_t1" && data.writingTask1 && (
          <WritingSection
            lang={lang}
            task={data.writingTask1}
            essay={essayT1}
            onChange={setEssayT1}
          />
        )}

        {/* ──── WRITING TASK 2 ──── */}
        {currentSection === "writing_t2" && data.writingTask2 && (
          <WritingSection
            lang={lang}
            task={data.writingTask2}
            essay={essayT2}
            onChange={setEssayT2}
          />
        )}

        {/* Fallback for missing data */}
        {((currentSection === "reading" && data.readingPassages.length === 0) ||
          (currentSection === "writing_t1" && !data.writingTask1) ||
          (currentSection === "writing_t2" && !data.writingTask2)) && (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            {t("placement", "errorLoading", lang)}
          </div>
        )}
      </div>

      {/* ── Bottom navigation bar (hidden for listening+reading — they have their own) ── */}
      {currentSection !== "reading" && currentSection !== "listening" && (
        <SectionNav
          lang={lang}
          onBack={!isBackDisabled ? handleBack : undefined}
          backDisabled={isBackDisabled}
          onNext={isLastSection ? handleSubmit : handleNext}
          nextLabel={
            isLastSection
              ? t("placement", "submitTest", lang)
              : canGoNextWithinSection()
              ? `Next Part`
              : `Next Section →`
          }
          isLoading={submitting}
        />
      )}

      {/* ── Time-up modal ── */}
      <TimeUpModal
        open={showTimeUp}
        lang={lang}
        onContinue={handleTimeUpContinue}
      />

      {/* ── Unanswered-questions warning ── */}
      {showUnanswered && (
        <UnansweredWarning
          count={unansweredCount}
          sectionName={sectionNameForWarning}
          onReview={handleUnansweredReview}
          onContinue={handleUnansweredContinue}
        />
      )}
    </div>
  );
}
