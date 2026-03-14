"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { NotesCard, type NotesCardData } from "@/components/placement/NotesCard";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ListeningQuestion {
  id: string;
  question_number: number;
  question_text: string;
  question_type: "fill_blank" | "multiple_choice" | "matching" | "notes_completion";
  options?: string[] | null;
  context_text?: string | null;
  before_text?: string | null;   // text before the gap (notes_completion)
  after_text?: string | null;    // text after the gap (notes_completion)
}

export interface ListeningAudio {
  id: string;
  title: string;
  public_url: string;
  part_number: number;
  notes_layout_json?: string | null;  // JSON string → NotesCardData
}

export interface ListeningPart {
  audio: ListeningAudio;
  questions: ListeningQuestion[];
}

interface Props {
  lang: Lang;
  parts: ListeningPart[];
  activePart: number;
  onPartChange: (index: number) => void;
  answers: Record<string, string>;
  onAnswer: (questionNumber: number, value: string) => void;
  // Navigation (mirrors ReadingSection)
  onBack: () => void;
  onNext: () => void;
  backDisabled?: boolean;
  isLoading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function optionLetter(opt: string, idx: number) {
  return opt.includes(":") ? opt.split(":")[0].trim() : String.fromCharCode(65 + idx);
}
function optionText(opt: string) {
  return opt.includes(":") ? opt.substring(opt.indexOf(":") + 1).trim() : opt;
}

interface ListeningGroup {
  context: string | null;
  items: ListeningQuestion[];
}
function buildGroups(questions: ListeningQuestion[]): ListeningGroup[] {
  const groups: ListeningGroup[] = [];
  for (const q of questions) {
    const ctx = q.context_text ?? null;
    const last = groups[groups.length - 1];
    if (last && last.context === ctx) {
      last.items.push(q);
    } else {
      groups.push({ context: ctx, items: [q] });
    }
  }
  return groups;
}

// ─── Question number badge ─────────────────────────────────────────────────────
function QBadge({ n, answered }: { n: number; answered: boolean }) {
  return (
    <span
      className={[
        "shrink-0 inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded border-2 select-none",
        answered
          ? "bg-blue-600 border-blue-600 text-white"
          : "border-slate-400 text-slate-600 bg-white",
      ].join(" ")}
    >
      {n}
    </span>
  );
}

// ─── MCQ — radio-button style (no A/B/C letter prefix, matches real portal) ───
function MCQInput({
  qn, options, selected, onAnswer,
}: { qn: number; options: string[]; selected: string; onAnswer: (qn: number, v: string) => void }) {
  return (
    <div className="mt-3 space-y-2.5">
      {options.map((opt, idx) => {
        const letter = optionLetter(opt, idx);
        const text = optionText(opt);
        const isSelected = selected === letter;
        return (
          <label
            key={letter}
            onClick={() => onAnswer(qn, letter)}
            className={[
              "flex items-start gap-3 cursor-pointer px-3 py-2.5 rounded-lg border transition-all",
              isSelected
                ? "bg-blue-50 border-blue-300"
                : "bg-white border-transparent hover:bg-slate-50",
            ].join(" ")}
          >
            {/* Radio circle */}
            <span
              className={[
                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                isSelected ? "border-blue-600" : "border-slate-400 group-hover:border-blue-400",
              ].join(" ")}
            >
              {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
            </span>
            <span className={`text-sm leading-snug ${isSelected ? "text-blue-800 font-medium" : "text-slate-700"}`}>
              {text}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// ─── Fill blank — clean underline input ───────────────────────────────────────
function FillInput({
  qn, selected, onAnswer,
}: { qn: number; selected: string; onAnswer: (qn: number, v: string) => void }) {
  return (
    <input
      type="text"
      value={selected}
      onChange={(e) => onAnswer(qn, e.target.value)}
      placeholder="Write your answer…"
      className="mt-2 border-b-2 border-slate-300 focus:border-blue-500 outline-none bg-transparent py-1.5 px-1 text-sm text-slate-800 placeholder-slate-400 transition-colors w-full max-w-xs"
    />
  );
}

// ─── Matching — letter-tile row ────────────────────────────────────────────────
function MatchingInput({
  qn, options, selected, onAnswer,
}: { qn: number; options: string[]; selected: string; onAnswer: (qn: number, v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {options.map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        return (
          <button
            key={letter}
            onClick={() => onAnswer(qn, letter)}
            title={opt}
            className={[
              "w-8 h-8 rounded border text-xs font-bold transition-all",
              selected === letter
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : "bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:bg-blue-50",
            ].join(" ")}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}

// ─── Audio status badge ────────────────────────────────────────────────────────
function AudioBadge({
  status, onToggle,
}: {
  status: "idle" | "playing" | "paused" | "ended";
  onToggle: () => void;
}) {
  const isPlaying = status === "playing";
  return (
    <button
      onClick={onToggle}
      className={[
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all",
        isPlaying
          ? "bg-green-50 border-green-300 text-green-700"
          : status === "ended"
          ? "bg-slate-100 border-slate-300 text-slate-500"
          : "bg-white border-slate-300 text-slate-600 hover:border-blue-400",
      ].join(" ")}
      title={isPlaying ? "Pause audio" : "Play audio"}
    >
      {isPlaying ? (
        <>
          {/* Pulsing dots when playing */}
          <span className="flex items-end gap-px h-3.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-0.5 bg-green-500 rounded-full animate-bounce"
                style={{
                  height: `${[10, 14, 8][i]}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </span>
          <Volume2 className="h-3.5 w-3.5" />
          <span>Audio is playing</span>
          <Pause className="h-3 w-3 ml-0.5" />
        </>
      ) : status === "ended" ? (
        <>
          <VolumeX className="h-3.5 w-3.5" />
          <span>Audio ended</span>
        </>
      ) : (
        <>
          <Play className="h-3.5 w-3.5" />
          <span>{status === "paused" ? "Resume audio" : "Start audio"}</span>
        </>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ListeningSection({
  lang: _lang,
  parts,
  activePart,
  onPartChange,
  answers,
  onAnswer,
  onBack,
  onNext,
  backDisabled = false,
  isLoading = false,
}: Props) {
  // ── Audio ──────────────────────────────────────────────────────────────────
  // One single audio file covers all 4 parts — loaded ONCE on mount, never
  // reloaded when the user navigates between parts.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioStatus, setAudioStatus] = useState<"idle" | "playing" | "paused" | "ended">("idle");
  const [started, setStarted] = useState(false); // false until user clicks "Start Listening"

  // Create & load the single audio on mount
  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener("play",  () => setAudioStatus("playing"));
    audio.addEventListener("pause", () => setAudioStatus((s) => s !== "ended" ? "paused" : "ended"));
    audio.addEventListener("ended", () => setAudioStatus("ended"));
    // Load from Part 1's URL — the one file covers the whole test
    const url = parts[0]?.audio.public_url;
    if (url) { audio.src = url; audio.load(); }
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // "Start Listening" button handler — satisfies browser autoplay policy
  const handleStart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => {});
    setStarted(true);
  }, []);

  const handleAudioToggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  // ── Question scroll refs ───────────────────────────────────────────────────
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollToQuestion = useCallback((qn: number) => {
    questionRefs.current[qn]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  if (!parts.length) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400 italic">
        No listening audio available.
      </div>
    );
  }

  const currentPart = parts[activePart];
  const groups = buildGroups(currentPart.questions);
  const allNums = currentPart.questions.map((q) => q.question_number);
  const answeredNums = new Set(allNums.filter((n) => (answers[String(n)] ?? "").trim() !== ""));
  const qMin = allNums.length ? Math.min(...allNums) : 1;
  const qMax = allNums.length ? Math.max(...allNums) : 1;

  // All-parts summary for bottom bar
  const allDone = parts.every((p) =>
    p.questions.every((q) => (answers[String(q.question_number)] ?? "").trim() !== "")
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">

      {/* ── "Ready to start?" overlay — shown until user clicks Start ── */}
      {!started && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 rounded-full flex items-center justify-center mx-auto mb-5">
              <Volume2 className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Listening Test</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-1">
              A single audio recording plays continuously for all 4 parts.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed mb-7">
              You can freely navigate between parts while the audio plays. Answer as you listen.
            </p>
            <button
              onClick={handleStart}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl px-6 py-3.5 font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Play className="h-5 w-5 fill-white" />
              Start Listening
            </button>
          </div>
        </div>
      )}

      {/* ── Part header bar ── */}
      <div className="shrink-0 bg-[#f4f4f4] border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-900 text-sm">
            Part {currentPart.audio.part_number}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            Listen and answer questions {qMin}–{qMax}.
          </p>
        </div>
        {/* Audio title + controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block max-w-xs truncate">
            {currentPart.audio.title}
          </span>
          <AudioBadge status={audioStatus} onToggle={handleAudioToggle} />
        </div>
      </div>

      {/* ── Question content (full-width, scrollable) ── */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="px-8 py-7 max-w-3xl pb-24">
            {groups.map((group, gi) => {
              // ── Notes-completion: render the entire group as a single NotesCard ──
              const isNotesGroup = group.items[0]?.question_type === "notes_completion";
              if (isNotesGroup && currentPart.audio.notes_layout_json) {
                let notesData: NotesCardData | null = null;
                try {
                  notesData = JSON.parse(currentPart.audio.notes_layout_json) as NotesCardData;
                } catch { /* ignore parse errors */ }

                if (notesData) {
                  return (
                    <div key={gi} className="px-4 py-4">
                      <NotesCard
                        data={notesData}
                        answers={answers}
                        onAnswer={onAnswer}
                        answeredNums={answeredNums}
                      />
                    </div>
                  );
                }
              }

              return (
              <div key={gi} className="mb-10">

                {/* Group context / instruction */}
                {group.context && (
                  <div className="mb-5">
                    {/* Parse "Questions N–M\nInstruction" format */}
                    {(() => {
                      const lines = group.context.split(/\n/).map((l) => l.trim()).filter(Boolean);
                      const qLine = lines.find((l) => /^Questions?\s+\d/i.test(l));
                      const instrLines = lines.filter((l) => l !== qLine);
                      return (
                        <div className="pb-3 border-b border-slate-100">
                          {qLine && (
                            <p className="text-xs font-bold text-slate-700 tracking-wide">{qLine}</p>
                          )}
                          {instrLines.map((line, i) => (
                            <p key={i} className="mt-1 text-sm text-slate-600 leading-snug">{line}</p>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Questions in this group */}
                <div className="space-y-6">
                  {group.items.map((q) => {
                    const raw = answers[String(q.question_number)] ?? "";
                    const answered = raw.trim() !== "";
                    return (
                      <div
                        key={q.id}
                        ref={(el) => { questionRefs.current[q.question_number] = el; }}
                        className="flex gap-3 items-start"
                      >
                        <QBadge n={q.question_number} answered={answered} />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 leading-snug">{q.question_text}</p>

                          {q.question_type === "multiple_choice" && q.options && (
                            <MCQInput
                              qn={q.question_number}
                              options={q.options}
                              selected={raw}
                              onAnswer={onAnswer}
                            />
                          )}

                          {q.question_type === "fill_blank" && (
                            <FillInput qn={q.question_number} selected={raw} onAnswer={onAnswer} />
                          )}

                          {q.question_type === "matching" && q.options && (
                            <MatchingInput
                              qn={q.question_number}
                              options={q.options}
                              selected={raw}
                              onAnswer={onAnswer}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* ── Navigation arrows — absolute bottom-right ── */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-20">
          <button
            onClick={onBack}
            disabled={backDisabled || isLoading}
            aria-label="Previous"
            className={[
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-colors",
              backDisabled || isLoading
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-700 text-white",
            ].join(" ")}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={onNext}
            disabled={isLoading}
            aria-label="Next"
            className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-md transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* ── Bottom bar: all 4 parts ── */}
      <div className="shrink-0 flex items-stretch border-t border-slate-200 bg-white overflow-x-auto">
        {parts.map((part, i) => {
          const isActive = i === activePart;
          const partNums = part.questions.map((q) => q.question_number);
          const partAnswered = partNums.filter(
            (n) => (answers[String(n)] ?? "").trim() !== ""
          ).length;
          const partAllDone = partAnswered === partNums.length && partNums.length > 0;

          return (
            <div
              key={part.audio.id}
              className={[
                "flex items-center gap-2 px-3 py-2 border-r border-slate-200 min-w-0",
                isActive ? "bg-slate-50" : "",
              ].join(" ")}
            >
              {/* Part label — clickable */}
              <button
                onClick={() => onPartChange(i)}
                className={[
                  "text-sm font-semibold shrink-0 transition-colors",
                  isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-700",
                ].join(" ")}
              >
                Part {part.audio.part_number}
              </button>

              {isActive ? (
                /* Active part: individual question pills */
                <div className="flex flex-wrap gap-1">
                  {partNums.map((n) => (
                    <button
                      key={n}
                      onClick={() => scrollToQuestion(n)}
                      title={`Question ${n}`}
                      className={[
                        "w-7 h-7 text-xs font-semibold rounded border transition-colors",
                        answeredNums.has(n)
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              ) : (
                /* Inactive part: "X of Y" count */
                <span
                  className={[
                    "text-xs",
                    partAllDone ? "text-green-600 font-medium" : "text-slate-400",
                  ].join(" ")}
                >
                  {partAnswered} of {partNums.length}
                </span>
              )}
            </div>
          );
        })}

        {/* Checkmark spacer */}
        <div className="ml-auto flex items-center px-4 shrink-0">
          {allDone ? (
            <Check className="h-5 w-5 text-green-600" strokeWidth={2.5} />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
          )}
        </div>
      </div>
    </div>
  );
}
