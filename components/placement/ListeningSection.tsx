"use client";
import { useState } from "react";
import { Headphones, Volume2 } from "lucide-react";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

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
  answers: Record<string, string>;
  onAnswer: (questionNumber: number, value: string) => void;
}

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

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Part tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-teal-50 border-b border-teal-100 shrink-0">
        {parts.map((p, i) => (
          <button
            key={p.audio.id}
            onClick={() => setActivePart(i)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              i === activePart
                ? "bg-teal-600 text-white"
                : "text-teal-700 hover:bg-teal-100"
            }`}
          >
            {t("placement", "partLabel", lang)} {p.audio.part_number}
          </button>
        ))}
        <span className="ml-auto text-xs text-teal-600 hidden sm:block">
          {t("placement", "listeningInstruction", lang)}
        </span>
      </div>

      {/* Split panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: questions */}
        <div className="w-1/2 overflow-y-auto p-6 border-r border-slate-200 bg-white">
          {questions[0]?.context_text && (
            <p className="text-sm text-slate-600 italic mb-4 p-3 bg-slate-50 rounded border border-slate-200">
              {questions[0].context_text}
            </p>
          )}

          <div className="space-y-5">
            {questions.map((q) => {
              const selected = answers[String(q.question_number)] ?? "";
              return (
                <div key={q.id} className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-700">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold mr-2">
                      {q.question_number}
                    </span>
                    {q.question_text}
                  </p>

                  {(q.question_type === "fill_blank" ||
                    q.question_type === "matching") && (
                    <input
                      type="text"
                      value={selected}
                      onChange={(e) => onAnswer(q.question_number, e.target.value)}
                      placeholder="…"
                      className="w-full border-b-2 border-slate-300 focus:border-teal-500 outline-none bg-transparent py-1 px-0.5 text-sm text-slate-800 transition-colors"
                    />
                  )}

                  {q.question_type === "multiple_choice" && q.options && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {q.options.map((opt) => {
                        const letter = opt.split(":")[0].trim();
                        const text = opt.substring(opt.indexOf(":") + 1).trim();
                        const isSelected = selected === letter;
                        return (
                          <button
                            key={letter}
                            onClick={() => onAnswer(q.question_number, letter)}
                            className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                              isSelected
                                ? "bg-teal-600 border-teal-600 text-white font-medium"
                                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="font-semibold mr-1">{letter}.</span>
                            {text}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: audio player */}
        <div className="w-1/2 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                <Headphones className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{audio.title}</p>
                <p className="text-xs text-slate-500">{t("placement", "audioOnce", lang)}</p>
              </div>
            </div>
            <audio
              key={audio.id}
              src={audio.public_url}
              controls
              className="w-full mt-2"
            >
              Your browser does not support audio playback.
            </audio>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Volume2 className="h-3.5 w-3.5" />
            Ensure your headphones or speakers are on.
            {lang === "vi" && " Đảm bảo tai nghe hoặc loa đang bật."}
          </p>
        </div>
      </div>
    </div>
  );
}
