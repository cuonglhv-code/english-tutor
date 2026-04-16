"use client";

// ─── Types ────────────────────────────────────────────────────────────────────
export type NotesItem =
  | { kind: "heading"; text: string }
  | { kind: "plain";   text: string; indent: 0 | 1 }
  | { kind: "gap";     before: string; qn: number; after: string; indent: 0 | 1 };

export interface NotesCardData {
  title: string;
  items: NotesItem[];
}

interface Props {
  data: NotesCardData;
  answers: Record<string, string>;   // keyed by question number as string e.g. "31"
  onAnswer: (qn: number, value: string) => void;
  answeredNums: Set<number>;
}

// ─── Question number badge ────────────────────────────────────────────────────
function QBadge({ n, answered }: { n: number; answered: boolean }) {
  return (
    <span
      className={[
        "shrink-0 inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded border-2 select-none",
        answered
          ? "bg-blue-600 border-blue-600 text-white"
          : "border-slate-400 text-slate-600 bg-white",
      ].join(" ")}
    >
      {n}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function NotesCard({ data, answers, onAnswer, answeredNums }: Props) {
  function renderLine(item: NotesItem, i: number) {
    if (item.kind === "heading") {
      return (
        <div key={i} className="mt-5 mb-2">
          <p className="font-bold text-sm text-slate-900">{item.text}</p>
        </div>
      );
    }

    if (item.kind === "plain") {
      const bullet = item.indent === 0 ? "•" : "–";
      const padding = item.indent === 0 ? "pl-2" : "pl-10";
      return (
        <div key={i} className={`flex items-start gap-2 ${padding} mb-1.5`}>
          <span className="shrink-0 text-slate-500 text-sm select-none mt-0.5">{bullet}</span>
          <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
        </div>
      );
    }

    // kind === "gap"
    const bullet = item.indent === 0 ? "•" : "–";
    const padding = item.indent === 0 ? "pl-2" : "pl-10";
    const answered = answeredNums.has(item.qn);
    const value = answers[String(item.qn)] ?? "";

    return (
      <div key={i} className={`flex items-start gap-2 ${padding} mb-1.5`}>
        <span className="shrink-0 text-slate-500 text-sm select-none mt-0.5">{bullet}</span>
        <p className="text-sm text-slate-700 leading-relaxed flex flex-wrap items-center gap-x-1 gap-y-0">
          {item.before && <span>{item.before}</span>}
          <QBadge n={item.qn} answered={answered} />
          <input
            type="text"
            value={value}
            onChange={(e) => onAnswer(item.qn, e.target.value)}
            placeholder="…"
            maxLength={25}
            aria-label={`Answer for question ${item.qn}`}
            className={[
              "w-28 border-b-2 outline-none bg-transparent text-sm px-1 py-0.5",
              answered
                ? "border-blue-400"
                : "border-slate-400 focus:border-blue-500",
            ].join(" ")}
          />
          {item.after && <span>{item.after}</span>}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-slate-300 rounded-lg bg-white overflow-hidden shadow-sm max-w-2xl mx-auto my-4">
      {/* title bar */}
      <div className="border-b border-slate-200 px-6 py-2.5 bg-slate-50">
        <h2 className="text-center font-bold text-sm text-slate-900">{data.title}</h2>
      </div>
      {/* content */}
      <div className="px-6 py-5">
        {data.items.map((item, i) => renderLine(item, i))}
      </div>
    </div>
  );
}
