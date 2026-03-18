"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────
interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  funFact?: string;
  source?: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  total: number;
  time: number;
  date: string;
  history: { question: string; options: string[]; correctAnswer: number; chosen: number; correct: boolean }[];
}

// ─── Constants ────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "Science", label: "Science", emoji: "🔬" },
  { id: "History", label: "History", emoji: "🏛️" },
  { id: "Geography", label: "Geography", emoji: "🌏" },
  { id: "Sports", label: "Sports", emoji: "⚽" },
  { id: "Movies", label: "Movies & TV", emoji: "🎬" },
  { id: "Music", label: "Music", emoji: "🎵" },
  { id: "Literature", label: "Literature", emoji: "📖" },
  { id: "Technology", label: "Technology", emoji: "💻" },
  { id: "Animals", label: "Animals", emoji: "🐾" },
  { id: "Space", label: "Space", emoji: "🚀" },
  { id: "Math", label: "Math", emoji: "🔢" },
  { id: "Vietnam", label: "About Vietnam", emoji: "🇻🇳" },
];

const DIFF: Record<string, { label: string; emoji: string; color: string }> = {
  easy: { label: "Easy", emoji: "🌱", color: "from-green-400 to-emerald-500" },
  medium: { label: "Medium", emoji: "🔥", color: "from-amber-400 to-orange-500" },
  hard: { label: "Hard", emoji: "💀", color: "from-rose-500 to-pink-600" },
};

const MEDALS = ["🥇", "🥈", "🥉"];

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ─── Sub-components ───────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: "-10px",
            width: 10,
            height: 10,
            borderRadius: Math.random() > 0.5 ? "50%" : 2,
            background: ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff922b", "#cc5de8"][i % 6],
            animation: `fall ${1 + Math.random()}s ease-in forwards`,
            animationDelay: `${Math.random() * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-yellow-300 to-pink-400 rounded-full transition-all duration-500"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null;
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-black bg-orange-400 text-white animate-bounce">
      🔥 {streak}× Streak!
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────
function Leaderboard({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState(5);
  const [data, setData] = useState<Record<number, LeaderboardEntry[]>>({ 5: [], 10: [], 15: [], 20: [] });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const d: Record<number, LeaderboardEntry[]> = { 5: [], 10: [], 15: [], 20: [] };
      await Promise.all(
        [5, 10, 15, 20].map(async (n) => {
          try {
            const res = await fetch(`/api/leaderboard?n=${n}`);
            d[n] = await res.json();
          } catch {
            d[n] = [];
          }
        })
      );
      setData(d);
      setLoading(false);
    })();
  }, []);

  const rows = data[tab] || [];

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 rounded-3xl">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-2">
          <button
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 text-white rounded-2xl px-4 py-2 font-black transition-all"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-black text-white">🏆 Leaderboard</h1>
          <span className="ml-auto text-white/60 text-xs font-semibold">Top 10 per group</span>
        </div>

        <div className="flex gap-2 mb-4">
          {[5, 10, 15, 20].map((n) => (
            <button
              key={n}
              onClick={() => { setTab(n); setExpandedId(null); }}
              className={`flex-1 py-2.5 rounded-2xl font-black text-sm transition-all border-2
                ${tab === n
                  ? "bg-yellow-300 text-gray-900 border-yellow-200 scale-105 shadow-lg"
                  : "bg-white/20 text-white border-white/20 hover:bg-white/30"}`}
            >
              {n} Qs
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-12 text-xs font-black text-gray-400 uppercase tracking-wide px-4 py-3 border-b border-gray-100">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Name</div>
            <div className="col-span-3 text-center">Score</div>
            <div className="col-span-2 text-center">Time</div>
            <div className="col-span-2 text-center">Date</div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 font-semibold">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-5xl mb-2">😴</div>
              <p className="text-gray-400 font-semibold">No scores yet — be the first!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
              {rows.map((r, i) => (
                <div key={r.id ?? i}>
                  {/* Main row */}
                  <div
                    className={`grid grid-cols-12 items-center px-4 py-3 text-sm cursor-pointer transition-colors
                      ${i === 0 ? "bg-yellow-50 hover:bg-yellow-100" : i === 1 ? "bg-gray-50 hover:bg-gray-100" : i === 2 ? "bg-orange-50 hover:bg-orange-100" : "hover:bg-gray-50"}`}
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    <div className="col-span-1 font-black text-lg">
                      {i < 3 ? MEDALS[i] : <span className="text-gray-400 text-xs">{i + 1}</span>}
                    </div>
                    <div className="col-span-4 font-bold text-gray-800 truncate">{r.name}</div>
                    <div className="col-span-3 text-center">
                      <span
                        className={`font-black px-2 py-0.5 rounded-full text-xs
                        ${r.score === r.total
                          ? "bg-green-100 text-green-700"
                          : r.score / r.total >= 0.6
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-600"}`}
                      >
                        {r.score}/{r.total}
                      </span>
                    </div>
                    <div className="col-span-2 text-center text-gray-500 font-semibold text-xs">⏱ {fmt(r.time)}</div>
                    <div className="col-span-2 text-center text-gray-400 text-xs flex items-center justify-center gap-1">
                      {r.date}
                      {r.history.length > 0 && (
                        <span className="text-purple-400">{expandedId === r.id ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </div>

                  {/* Expandable history */}
                  {expandedId === r.id && r.history.length > 0 && (
                    <div className="bg-indigo-50 border-t border-indigo-100 px-4 py-3 space-y-2">
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-wide mb-2">📝 Test History</p>
                      {r.history.map((h, hi) => (
                        <div
                          key={hi}
                          className={`rounded-xl p-3 border text-xs ${
                            h.correct
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <p className="font-bold text-gray-800 mb-1">
                            <span className="text-gray-400 mr-1">Q{hi + 1}.</span> {h.question}
                          </p>
                          <p className={`font-semibold ${h.correct ? "text-green-600" : "text-red-500"}`}>
                            {h.correct ? "✅" : "❌"} {h.options[h.chosen]}
                          </p>
                          {!h.correct && (
                            <p className="text-green-700 font-semibold mt-0.5">
                              ✅ Correct: {h.options[h.correctAnswer]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-white/50 text-xs text-center mt-3">Ranked by highest score, then fastest time.</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────
export default function QuizGameClient() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [phase, setPhase] = useState<"setup" | "loading" | "playing" | "results">("setup");
  const [showLb, setShowLb] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [diff, setDiff] = useState("medium");
  const [numQ, setNumQ] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<{ q: Question; chosen: number; correct: boolean }[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [shake, setShake] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(false);

  // Timer
  useEffect(() => {
    if (phase === "playing") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Auto-fill name for logged-in users (full_name → display_name → email prefix)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, display_name, email")
          .eq("id", user.id)
          .single();
        if (cancelled) return;
        const derived =
          (profile as any)?.full_name ||
          (profile as any)?.display_name ||
          (profile as any)?.email?.split("@")[0];
        if (derived && !playerName.trim()) setPlayerName(String(derived).trim().slice(0, 24));
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save score + full test history to Supabase via API route when results screen appears
  useEffect(() => {
    if (phase === "results" && !savedRef.current && questions.length > 0) {
      savedRef.current = true;
      // Serialize history: include question text, options, correct+chosen index
      const historyPayload = history.map((h) => ({
        question: h.q.question,
        options: h.q.options,
        correctAnswer: h.q.correctAnswer,
        chosen: h.chosen,
        correct: h.correct,
      }));
      fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName.trim() || "Anonymous",
          score,
          total: questions.length,
          time: elapsed,
          question_count: questions.length,
          history: historyPayload,
        }),
      }).catch(console.error);
    }
    if (phase !== "results") savedRef.current = false;
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCat = (id: string) =>
    setCats((p) => (p.includes(id) ? p.filter((c) => c !== id) : [...p, id]));

  const generate = async () => {
    if (cats.length === 0) {
      alert("Pick at least one category! 🎯");
      return;
    }
    setPhase("loading");
    try {
      const prompt = `You are generating quiz questions for Vietnamese students in Grades 6–11 (ages 11–16).
Rules:
- Engaging and appropriate for Vietnamese secondary school students
- Include Vietnamese context where relevant
- Language: English
- Difficulty: ${diff}
- Categories: ${cats.join(", ")}
- Generate exactly ${numQ} questions
Respond ONLY with valid JSON, no markdown:
{
  "questions": [{
    "question": "...",
    "options": ["A","B","C","D"],
    "correctAnswer": 0,
    "category": "...",
    "funFact": "one short interesting fun fact about the answer (max 20 words)",
    "source": "a credible source verifying the correct answer e.g. 'NASA.gov', 'National Geographic', 'BBC Science', 'Khan Academy', 'Vietnam Ministry of Education'. Include article/page name where possible."
  }]
}`;

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find((b: { type: string }) => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setQuestions(parsed.questions);
      setQIdx(0);
      setScore(0);
      setStreak(0);
      setHistory([]);
      setChosen(null);
      setRevealed(false);
      setPhase("playing");
    } catch (e) {
      console.error(e);
      alert("Oops! Couldn't load questions. Try again 🙏");
      setPhase("setup");
    }
  };

  const handleCheck = () => {
    if (chosen === null) {
      alert("Pick an answer first! 👆");
      return;
    }
    if (!revealed) {
      setRevealed(true);
      const ok = chosen === questions[qIdx].correctAnswer;
      if (ok) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 1800);
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setStreak(0);
      }
      return;
    }
    const ok = chosen === questions[qIdx].correctAnswer;
    setHistory((h) => [...h, { q: questions[qIdx], chosen, correct: ok }]);
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1);
      setChosen(null);
      setRevealed(false);
    } else {
      setPhase("results");
    }
  };

  const reset = () => {
    setPhase("setup");
    setQuestions([]);
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setHistory([]);
    setChosen(null);
    setRevealed(false);
    setElapsed(0);
  };

  if (showLb) return <Leaderboard onBack={() => setShowLb(false)} />;

  if (phase === "setup")
    return (
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 rounded-3xl">
        <style>{`
          @keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
          .btn-pop:active { transform: scale(.95); }
        `}</style>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-6">
            <div className="text-5xl mb-1">🧠✨</div>
            <h1 className="text-5xl font-black text-white drop-shadow-lg">Brain Blast!</h1>
            <p className="text-white/80 mt-1">Quiz challenge for super-smart students 🎓</p>
          </div>

          <button
            onClick={() => setShowLb(true)}
            className="btn-pop w-full mb-4 py-3 rounded-2xl font-black text-base text-gray-900 bg-gradient-to-r from-yellow-300 to-orange-400 hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            🏆 View Leaderboard
          </button>

          <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/30">
            <h2 className="text-white font-black text-xl mb-2">✏️ Your name</h2>
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name…"
              maxLength={24}
              className="w-full mb-6 px-4 py-3 rounded-2xl bg-white/90 text-gray-800 font-bold text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-300"
            />

            <h2 className="text-white font-black text-xl mb-3">🎯 Pick your topics</h2>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleCat(c.id)}
                  className={`btn-pop py-2 px-2 rounded-2xl font-bold text-sm transition-all duration-150 border-2 flex items-center gap-1.5
                  ${cats.includes(c.id)
                      ? "bg-yellow-300 text-gray-900 border-yellow-200 scale-105 shadow-lg"
                      : "bg-white/20 text-white border-white/20 hover:bg-white/30"}`}
                >
                  <span>{c.emoji}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>

            <h2 className="text-white font-black text-xl mb-3">⚡ Difficulty</h2>
            <div className="flex gap-3 mb-6">
              {Object.entries(DIFF).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setDiff(k)}
                  className={`btn-pop flex-1 py-3 rounded-2xl font-black text-sm transition-all border-2
                  ${diff === k
                      ? `bg-gradient-to-r ${v.color} text-white border-white/40 scale-105 shadow-lg`
                      : "bg-white/20 text-white border-white/20 hover:bg-white/30"}`}
                >
                  {v.emoji} {v.label}
                </button>
              ))}
            </div>

            <h2 className="text-white font-black text-xl mb-3">🔢 How many questions?</h2>
            <div className="flex gap-3 mb-8">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumQ(n)}
                  className={`btn-pop flex-1 py-3 rounded-2xl font-black text-lg transition-all border-2
                  ${numQ === n
                      ? "bg-yellow-300 text-gray-900 border-yellow-200 scale-105 shadow-lg"
                      : "bg-white/20 text-white border-white/20 hover:bg-white/30"}`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={generate}
              className="btn-pop w-full py-4 rounded-2xl font-black text-xl text-gray-900 bg-gradient-to-r from-yellow-300 to-orange-400 hover:opacity-90 shadow-xl transition-all hover:scale-[1.02]"
            >
              🚀 Let&apos;s Go!
            </button>
          </div>
        </div>
      </div>
    );

  if (phase === "loading")
    return (
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center gap-6 p-10 rounded-3xl">
        <div className="text-7xl animate-bounce">🧠</div>
        <div className="w-16 h-16 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-xl font-black animate-pulse">Cooking up questions… 🍳</p>
      </div>
    );

  if (phase === "playing") {
    const q = questions[qIdx];
    const optLabels = ["A", "B", "C", "D"];
    return (
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 rounded-3xl">
        <Confetti active={confetti} />
        <style>{`
          @keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
          @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
          .shake { animation: shake .4s ease; }
        `}</style>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 rounded-2xl px-3 py-2 text-white font-black text-sm">
              Q {qIdx + 1}/{questions.length}
            </div>
            <StreakBadge streak={streak} />
            <div className="flex gap-2">
              <div className={`rounded-2xl px-3 py-2 font-black text-sm ${elapsed >= 60 ? "bg-red-400 text-white animate-pulse" : "bg-white/20 text-white"}`}>
                ⏱ {fmt(elapsed)}
              </div>
              <div className="bg-yellow-300 rounded-2xl px-3 py-2 text-gray-900 font-black text-sm">
                ⭐ {score}
              </div>
            </div>
          </div>
          <ProgressBar current={qIdx} total={questions.length} />

          <div className={`mt-4 bg-white rounded-3xl p-6 shadow-2xl ${shake ? "shake" : ""}`}>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                {CATEGORIES.find((c) => c.id === q.category)?.emoji || "🎯"} {q.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${DIFF[diff].color}`}>
                {DIFF[diff].emoji} {diff}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">
                👤 {playerName || "Anonymous"}
              </span>
            </div>
            <h2 className="text-xl font-black text-gray-800 leading-snug mb-5">{q.question}</h2>

            <div className="grid grid-cols-1 gap-3 mb-5">
              {q.options.map((opt, i) => {
                let cls = "w-full p-4 rounded-2xl font-bold text-left transition-all duration-200 border-2 flex items-center gap-3 ";
                if (!revealed) {
                  cls +=
                    chosen === i
                      ? "bg-indigo-500 text-white border-indigo-400 scale-[1.02] shadow-md"
                      : "bg-gray-50 text-gray-800 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50";
                } else {
                  if (i === q.correctAnswer) cls += "bg-green-400 text-white border-green-300 scale-[1.02] shadow-md";
                  else if (i === chosen) cls += "bg-red-400 text-white border-red-300";
                  else cls += "bg-gray-100 text-gray-400 border-gray-200";
                }
                return (
                  <button key={i} onClick={() => !revealed && setChosen(i)} className={cls}>
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/30 font-black text-sm shrink-0">
                      {optLabels[i]}
                    </span>
                    <span>{opt}</span>
                    {revealed && i === q.correctAnswer && <span className="ml-auto text-xl">✅</span>}
                    {revealed && i === chosen && i !== q.correctAnswer && <span className="ml-auto text-xl">❌</span>}
                  </button>
                );
              })}
            </div>

            {revealed && (q.funFact || q.source) && (
              <div className="space-y-2 mb-4">
                {q.funFact && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex gap-2">
                    <span className="text-2xl">💡</span>
                    <p className="text-sm text-yellow-800 font-semibold">{q.funFact}</p>
                  </div>
                )}
                {q.source && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 flex gap-2 items-start">
                    <span className="text-lg">📚</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="uppercase tracking-wide text-blue-400 text-[10px] font-semibold">Source</span>
                        <div className="relative group">
                          <span className="cursor-pointer text-blue-300 hover:text-blue-500 text-xs select-none">ⓘ</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-800 text-white text-[11px] font-normal rounded-xl p-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-snug">
                            This source was suggested by AI and may not be exact. Always double-check it yourself! 🔍
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-blue-700 font-semibold">{q.source}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleCheck}
              className="w-full py-4 rounded-2xl font-black text-lg text-gray-900 bg-gradient-to-r from-yellow-300 to-orange-400 hover:opacity-90 shadow-lg transition-all hover:scale-[1.02]"
            >
              {!revealed ? "✅ Check Answer" : qIdx + 1 === questions.length ? "🏁 See Results" : "➡️ Next Question"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const pct = Math.round((score / questions.length) * 100);
    const [medalEmoji, msg] =
      pct >= 80 ? ["🏆", "Genius level!"] :
        pct >= 60 ? ["🥈", "Great effort!"] :
          pct >= 40 ? ["🥉", "Not bad!"] :
            ["📚", "Keep studying!"];
    return (
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 rounded-3xl">
        <Confetti active={pct >= 60} />
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-6">
            <div className="text-7xl mb-1">{medalEmoji}</div>
            <h1 className="text-4xl font-black text-white">{msg}</h1>
            <p className="text-white/90 text-lg mt-1 font-bold">{playerName || "Anonymous"}</p>
            <div className="flex justify-center gap-4 mt-3">
              <span className="bg-white/20 rounded-2xl px-4 py-2 text-white font-black">
                ⭐ {score}/{questions.length} · {pct}%
              </span>
              <span className="bg-white/20 rounded-2xl px-4 py-2 text-white font-black">
                ⏱ {fmt(elapsed)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-3 mb-4 max-h-[40vh] overflow-y-auto">
            {history.map((h, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border-2 ${h.correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <p className="font-bold text-gray-800 text-sm mb-1">{h.q.question}</p>
                <p className={`text-sm font-semibold ${h.correct ? "text-green-600" : "text-red-500"}`}>
                  {h.correct ? "✅" : "❌"} Your answer: {h.q.options[h.chosen]}
                </p>
                {!h.correct && (
                  <p className="text-sm text-green-700 font-semibold">
                    ✅ Correct: {h.q.options[h.q.correctAnswer]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowLb(true)}
              className="flex-1 py-4 rounded-2xl font-black text-base text-gray-900 bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-[1.02]"
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={reset}
              className="flex-1 py-4 rounded-2xl font-black text-base text-gray-900 bg-gradient-to-r from-yellow-300 to-orange-400 hover:opacity-90 shadow-xl transition-all hover:scale-[1.02]"
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }
}

