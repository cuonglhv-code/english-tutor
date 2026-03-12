"use client";
import { useState } from "react";
import { Headphones, Volume2 } from "lucide-react";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ListeningQuestion {
  id: string;
  question_number: number;
  question_text: string;
  question_type: "fill_blank" | "multiple_choice" | "matching";
  options?: string[] | null;
  context_text?: string | null;
}

export interface ListeningAudio {
  id: string;
  title: string;
  public_url: string;
  part_number: number;
}

export interface ListeningPart {
  audio: ListeningAudio;
  questions: ListeningQuestion[];
}

interface Props {
  lang: Lang;
  parts: ListeningPart[];
  answers: Record<string, string>; // keyed by bare question number string
  onAnswer: (questionNumber: number, value: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function optionLetter(opt: string, idx: number) {
  return opt.includes(":") ? opt.split(":")[0].trim() : String.fromCharCode(65 + idx);
}
function optionText(opt: string) {
  return opt.includes(":") ? opt.substring(opt.indexOf(":") + 1).trim() : opt;
}

// Group consecutive questions with identical context_text
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

// ─── Question widgets ─────────────────────────────────────────────────────────

function FillInput({
  qn, selected, onAnswer,
}: { qn: number; selected: string; onAnswer: (qn: number, v: string) => void }) {
  return (
    <input
      type="text"
      value={selected}
      onChange={(e) => onAnswer(qn, e.target.value)}
      placeholder="Write your answer…"
      className="mt-1.5 w-full border-b-2 border-slate-300 focus:border-teal-500 outline-none bg-transparent py-1.5 px-1 text-sm text-slate-800 placeholder-slate-400 transition-colors"
    />
  );
}

function MCQInput({
  qn, options, selected, onAnswer,
}: { qn: number; options: string[]; selected: string; onAnswer: (qn: number, v: string) => void }) {
  return (
    <div className="space-y-1.5 mt-2">
      {options.map((opt, idx) => {
        const letter = optionLetter(opt, idx);
        const text = optionText(opt);
        const isSelected = selected === letter;
        return (
          <button
            key={letter}
            onClick={() => onAnswer(qn, letter)}
            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
              isSelected
                ? "bg-teal-50 border-teal-500 text-teal-800 font-medium"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <span className="font-bold mr-2 text-slate-500">{letter}.</span>
            {text}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ListeningSection({ lang, parts, answers, onAnswer }: Props) {
  const [activePart, setActivePart] = useState(0);

  if (!parts.length) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500 italic">
        {t("placement", "noAudio", lang)}
      </div>
    );
  }

  const { audio, questions } = parts[activePart];
  const groups = buildGroups(questions);

  const allNums = questions.map((q) => q.question_number);
  const qRange =
    allNums.length > 0
      ? `Questions ${Math.min(...allNums)}–${Math.max(...allNums)}`
      : "";

  const answeredCount = questions.filter(
    (q) => (answers[String(q.question_number)] ?? "").trim() !== ""
  ).length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Part tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-teal-50 border-b border-teal-100 shrink-0 flex-wrap">
        {parts.map((p, i) => (
          <button
            key={p.audio.id}
            onClick={() => setActivePart(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              i === activePart
                ? "bg-teal-600 text-white shadow-sm"
                : "text-teal-700 hover:bg-teal-100 border border-teal-200"
            }`}
          >
            {t("placement", "partLabel", lang)} {p.audio.part_number}
          </button>
        ))}
        <span className="ml-2 text-xs text-teal-600">{qRange}</span>
        <span className="ml-auto text-xs text-teal-600">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      {/* Split panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: questions */}
        <div className="flex-1 overflow-y-auto p-5 bg-white border-r border-slate-200">
          <div className="space-y-5">
            {groups.map((group, gi) => (
              <div key={gi}>
                {/* Context / instruction block */}
                {group.context && (
                  <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 italic leading-relaxed">
                    {group.context}
                  </div>
                )}

                <div className="space-y-4">
                  {group.items.map((q) => {
                    const selected = answers[String(q.question_number)] ?? "";
                    return (
                      <div key={q.id} className="flex gap-2.5">
                        {/* Number badge */}
                        <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold mt-0.5">
                          {q.question_number}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 leading-snug">
                            {q.question_text}
                          </p>

                          {(q.question_type === "fill_blank" ||
                            q.question_type === "matching") && (
                            <FillInput
                              qn={q.question_number}
                              selected={selected}
                              onAnswer={onAnswer}
                            />
                          )}

                          {q.question_type === "multiple_choice" && q.options && (
                            <MCQInput
                              qn={q.question_number}
                              options={q.options}
                              selected={selected}
                              onAnswer={onAnswer}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: audio player */}
        <div className="w-64 shrink-0 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                <Headphones className="h-4.5 w-4.5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {audio.title}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {t("placement", "audioOnce", lang)}
                </p>
              </div>
            </div>
            <audio
              key={audio.id}
              src={audio.public_url}
              controls
              className="w-full mt-1"
            >
              Your browser does not support audio playback.
            </audio>
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-slate-500 px-1">
            <Volume2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Ensure your headphones or speakers are on.
              {lang === "vi" && " Đảm bảo tai nghe hoặc loa đang bật."}
            </span>
          </div>

          {/* All parts overview */}
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Progress
            </p>
            {parts.map((p, i) => {
              const partAnswered = p.questions.filter(
                (q) => (answers[String(q.question_number)] ?? "").trim() !== ""
              ).length;
              return (
                <div key={p.audio.id} className="flex items-center justify-between text-xs mb-1.5">
                  <button
                    onClick={() => setActivePart(i)}
                    className={`font-medium transition-colors ${
                      i === activePart ? "text-teal-700" : "text-slate-500 hover:text-teal-600"
                    }`}
                  >
                    Part {p.audio.part_number}
                  </button>
                  <span className={`text-[10px] ${partAnswered === p.questions.length ? "text-teal-600" : "text-slate-400"}`}>
                    {partAnswered}/{p.questions.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
