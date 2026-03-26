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
  fullDate?: string;
  topics?: string[];
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

// ─── Utilities ────────────────────────────────────────────────────────
function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return "Yesterday";
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString("en-GB");
}

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

function LeaderboardSkeleton() {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 items-center px-4 py-4 animate-pulse">
          <div className="col-span-1 h-4 w-4 bg-gray-200 rounded shrink-0" />
          <div className="col-span-3 h-4 bg-gray-200 rounded mx-2" />
          <div className="col-span-3 h-4 bg-gray-200 rounded mx-2" />
          <div className="col-span-2 h-4 bg-gray-200 rounded mx-2" />
          <div className="col-span-1 h-4 bg-gray-200 rounded mx-2" />
          <div className="col-span-2 h-4 bg-gray-200 rounded mx-2" />
        </div>
      ))}
    </div>
  );
}

function Leaderboard({ onBack, from }: { onBack: () => void; from?: "setup" | "results" }) {
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
            const res = await fetch(`/api/quiz/leaderboard?n=${n}`);
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
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-2">
          <button
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 text-white rounded-2xl px-4 py-2 font-black transition-all"
          >
            ← Back {from === "results" ? "to Results" : ""}
          </button>
          <h1 className="text-3xl font-black text-white">🏆 Leaderboard</h1>
          <span className="ml-auto text-white/60 text-xs font-semibold">Top 100 per group</span>
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

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          <div className="grid grid-cols-12 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Topics</div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-1 text-center">Time</div>
            <div className="col-span-2 text-right pr-2">Played</div>
          </div>

          {loading ? (
            <LeaderboardSkeleton />
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-5xl mb-2">😴</div>
              <p className="font-semibold italic">No scores yet — be the first!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {rows.map((r, i) => (
                <div key={r.id ?? i}>
                  <div
                    className={`grid grid-cols-12 items-center px-4 py-4 text-sm cursor-pointer transition-all active:scale-[0.98]
                      ${i === 0 ? "bg-yellow-50/50 hover:bg-yellow-50" : i === 1 ? "bg-gray-50/50 hover:bg-gray-50" : i === 2 ? "bg-orange-50/50 hover:bg-orange-50" : "hover:bg-gray-50/80"}`}
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    <div className="col-span-1 flex flex-col items-center">
                      {i < 3 && <span className="text-base leading-none mb-0.5">{MEDALS[i]}</span>}
                      <span className={`font-black text-[10px] ${i < 3 ? "text-gray-600" : "text-gray-400"}`}>{i + 1}</span>
                    </div>
                    <div className="col-span-3 font-bold text-gray-800 truncate pr-2">{r.name}</div>
                    <div className="col-span-3">
                      <div className="flex flex-wrap gap-1 items-center">
                        {r.topics && r.topics.length > 0 ? (
                          <>
                            <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-100 truncate max-w-full">
                              {CATEGORIES.find(c => c.id === r.topics![0])?.emoji || "🎯"} {r.topics[0]}
                            </span>
                            {r.topics.length > 1 && (
                              <span className="bg-gray-100 text-gray-500 px-1 py-0.5 rounded-lg text-[10px] font-bold">
                                +{r.topics.length - 1}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-[10px italic]">Various</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span
                        className={`font-black px-2 py-0.5 rounded-md text-[10px]
                        ${r.score === r.total
                          ? "bg-green-100 text-green-700"
                          : r.score / r.total >= 0.6
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-600"}`}
                      >
                        {r.score}/{r.total}
                      </span>
                    </div>
                    <div className="col-span-1 text-center text-gray-500 font-bold text-[10px]">
                      {fmt(r.time)}
                    </div>
                    <div
                      title={r.fullDate ? new Date(r.fullDate).toLocaleString() : r.date}
                      className="col-span-2 text-right text-gray-400 text-[11px] font-medium pr-2"
                    >
                      {r.fullDate ? getRelativeTime(r.fullDate) : r.date}
                    </div>
                  </div>

                  {expandedId === r.id && r.history.length > 0 && (
                    <div className="bg-indigo-50/50 border-y border-indigo-100/50 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">📝 Test History</p>
                      {r.history.map((h, hi) => (
                        <div
                          key={hi}
                          className={`rounded-2xl p-3 border text-xs shadow-sm ${
                            h.correct
                              ? "bg-white/80 border-green-200"
                              : "bg-white/80 border-red-200"
                          }`}
                        >
                          <p className="font-bold text-gray-800 mb-1.5 leading-snug">
                            <span className="text-gray-400 mr-1.5">Q{hi + 1}.</span> {h.question}
                          </p>
                          <div className="flex gap-2 items-center flex-wrap">
                            <span className={`font-bold px-2 py-0.5 rounded-lg ${h.correct ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                              {h.correct ? "✅" : "❌"} {h.options[h.chosen]}
                            </span>
                            {!h.correct && (
                              <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-lg">
                                ✅ Correct: {h.options[h.correctAnswer]}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
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

  // Auto-fill name for players (Auth user → Guest localStorage)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (auth.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, display_name, email")
            .eq("id", auth.user.id)
            .single();
          if (cancelled) return;
          const derived =
            (profile as any)?.full_name ||
            (profile as any)?.display_name ||
            (profile as any)?.email?.split("@")[0];
          if (derived && !playerName.trim()) setPlayerName(String(derived).trim().slice(0, 24));
        } else {
          // Check localStorage for guest
          const stored = localStorage.getItem('jaxtina_guest');
          if (stored) {
            const guest = JSON.parse(stored);
            if (guest.name && !playerName.trim()) {
               setPlayerName(guest.name.trim().slice(0, 24));
            }
          }
        }
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
    const saveScore = async () => {
      if (phase === "results" && !savedRef.current && questions.length > 0) {
        savedRef.current = true;
        
        console.log('Attempting to save score:', {
          name: playerName.trim() || "Anonymous",
          score: score,
          total: questions.length,
          time_seconds: elapsed,
          topics: cats,
          difficulty: diff,
          question_count: questions.length,
        });
        
        // Serialize history: include question text, options, correct+chosen index
        const historyPayload = history.map((h) => ({
          question: h.q.question,
          options: h.q.options,
          correctAnswer: h.q.correctAnswer,
          chosen: h.chosen,
          correct: h.correct,
        }));

        try {
          const res = await fetch("/api/quiz/leaderboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: playerName.trim() || "Anonymous",
              score,
              total: questions.length,
              time: elapsed,
              question_count: Number(questions.length), // cast to Number
              history: historyPayload,
              topics: cats,
              difficulty: diff,
            }),
          });
          
          const result = await res.json();
          if (!res.ok) {
            console.error('❌ Leaderboard insert FAILED:', result.error || res.statusText);
          } else {
            console.log('✅ Score saved successfully:', result.data || result);
          }
        } catch (err: any) {
          console.error('❌ Leaderboard insert FAILED:', err.message);
        }
      }
    };
    
    saveScore();
    if (phase !== "results") savedRef.current = false;
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "playing" || showExitConfirm) return;

      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D"].includes(key)) {
        if (!revealed) {
          const idx = ["A", "B", "C", "D"].indexOf(key);
          setChosen(idx);
        }
      } else if (e.key === "Enter") {
        if (!revealed) {
          if (chosen !== null) handleCheck();
        } else {
          handleCheck();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, revealed, chosen, showExitConfirm]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCat = (id: string) =>
    setCats((p) => (p.includes(id) ? p.filter((c) => c !== id) : [...p, id]));

  const generate = async () => {
    if (cats.length === 0) {
      alert("Pick at least one category! 🎯");
      return;
    }
    setPhase("loading");
    try {
      // ── Try Supabase question bank first ─────────────────────────────
      const qs = new URLSearchParams({
        categories: cats.join(","),
        difficulty: diff,
        count: numQ.toString(),
      });
      const res = await fetch(`/api/quiz/questions?${qs.toString()}`);

      if (res.ok) {
        const data = await res.json();
        if (data.questions?.length > 0) {
          setQuestions(data.questions);
          setQIdx(0); setScore(0); setStreak(0);
          setHistory([]); setChosen(null); setRevealed(false);
          setPhase("playing");
          return;
        }
      }

      // ── Fallback: generate via Claude AI ─────────────────────────────
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
    "source": "a credible source e.g. 'NASA.gov', 'National Geographic', 'BBC Science', 'Khan Academy'"
  }]
}`;

      const aiRes = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
        }),
      });
      if (!aiRes.ok) throw new Error("AI fallback also failed");
      const aiData = await aiRes.json();
      const raw = aiData.content?.find((b: { type: string }) => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setQuestions(parsed.questions);
      setQIdx(0); setScore(0); setStreak(0);
      setHistory([]); setChosen(null); setRevealed(false);
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

  // Navigation & Global Effects
  useEffect(() => {
    if (phase === "playing") {
      document.documentElement.setAttribute("data-quiz-active", "true");
      if (cats.length === 0) {
        alert("Please select at least one topic to start.");
        setPhase("setup");
      }
    } else {
      document.documentElement.removeAttribute("data-quiz-active");
    }
    return () => document.documentElement.removeAttribute("data-quiz-active");
  }, [phase, cats.length]);

  if (showLb) return <Leaderboard onBack={() => setShowLb(false)} from={phase === "results" ? "results" : "setup"} />;

  if (phase === "setup")
    return (
      <div className="min-h-[85vh] py-8 px-4 animate-in fade-in zoom-in-95 duration-500">
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        `}</style>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-6">
            <div className="text-5xl mb-1">🧠✨</div>
            <h1 className="text-5xl font-black text-white drop-shadow-lg">Jaxtina Quiz</h1>
            <p className="text-white/80 mt-1">Test your knowledge — English, Science, Vietnam & more</p>
          </div>

          <button
            onClick={() => setShowLb(true)}
            className="btn-pop w-full mb-4 py-3 rounded-2xl font-black text-base text-gray-900 bg-gradient-to-r from-yellow-300 to-orange-400 hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            🏆 View Leaderboard
          </button>

          <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-pink-500 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[75vh] border border-white/10">
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-6">
              <h2 className="text-white font-bold text-xl mb-1">✏️ Your name</h2>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-2 mt-1">THIS NAME WILL APPEAR ON THE LEADERBOARD.</p>
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name…"
                maxLength={24}
                className="w-full mb-6 px-4 py-3 rounded-2xl bg-white/95 text-gray-800 font-bold text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
              />

              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-bold text-xl">🎯 Pick your topics</h2>
                <button
                  onClick={() => {
                    if (cats.length === CATEGORIES.length) setCats([]);
                    else setCats(CATEGORIES.map(c => c.id));
                  }}
                  className="text-white/80 text-sm underline hover:text-white transition-all font-medium"
                >
                  {cats.length === CATEGORIES.length ? "Clear All" : "SELECT ALL TOPICS"}
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                {CATEGORIES.map((c) => {
                  const isSelected = cats.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCat(c.id)}
                      className={`btn-pop flex items-center gap-2 group transition
                      ${isSelected
                          ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-full px-4 py-2 shadow-md scale-[1.02]"
                          : "border border-white/40 text-white bg-white/10 hover:bg-white/20 rounded-full px-4 py-2"}`}
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">{c.emoji}</span>
                      <span className="truncate flex-1 text-left">{c.label}</span>
                      {isSelected && <span className="text-[10px] font-black">✓</span>}
                    </button>
                  );
                })}
              </div>

              <h2 className="text-white font-bold text-xl mb-3">⚡ Difficulty</h2>
              <div className="flex gap-2 mb-6">
                {Object.entries(DIFF).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setDiff(k)}
                    className={`btn-pop flex-1 font-bold text-xs transition
                    ${diff === k
                        ? `bg-gradient-to-r ${v.color} text-white font-bold rounded-full px-4 py-3 shadow-lg scale-105`
                        : "border border-white/40 text-white bg-white/10 hover:bg-white/20 rounded-full px-4 py-3"}`}
                  >
                    {v.emoji} {v.label}
                  </button>
                ))}
              </div>

              <h2 className="text-white font-bold text-xl mb-3">🔢 How many questions?</h2>
              <div className="flex gap-2 mb-4">
                {[5, 10, 15, 20].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumQ(n)}
                    className={`btn-pop flex-1 font-bold text-base transition
                    ${numQ === n
                        ? "bg-yellow-300 text-gray-900 font-bold rounded-full px-4 py-3 shadow-lg scale-105"
                        : "border border-white/40 text-white bg-white/10 hover:bg-white/20 rounded-full px-4 py-3"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Scroll Hint Gradient */}
            <div className="absolute bottom-[88px] left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />

            <div className="pt-4 mt-auto">
              <button
                onClick={generate}
                disabled={cats.length === 0}
                className={`btn-pop w-full py-4 rounded-2xl font-black text-xl text-gray-900 bg-gradient-to-r from-yellow-300 to-orange-400 shadow-xl transition-all
                  ${cats.length === 0 ? "opacity-30 cursor-not-allowed scale-95" : "hover:opacity-90 hover:scale-[1.02]"}`}
              >
                🚀 Let&apos;s Go!
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  if (phase === "loading")
    return (
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 min-h-[60vh] flex flex-col items-center justify-center gap-6 rounded-3xl animate-in fade-in duration-500">
        <div className="text-7xl animate-bounce">🧠</div>
        <div className="w-16 h-16 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-xl font-black animate-pulse">Loading your questions… 📚</p>
      </div>
    );

  if (phase === "playing") {
    const q = questions[qIdx];
    return (
      <div className="min-h-screen pb-12 animate-in fade-in duration-500">
        {/* Persistent Minimal Sticky Header */}
        <header className="sticky top-0 z-50 w-full bg-indigo-600/80 backdrop-blur-md border-b border-white/10 px-4 py-3 mb-8 shadow-xl">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-lg p-1.5 shadow-md shrink-0">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#D32F2F" />
                  <text x="16" y="21" textAnchor="middle" fontFamily="Georgia, serif" fontSize="16" fontWeight="bold" fill="white">J</text>
                </svg>
              </div>
              <span className="font-black text-white text-lg tracking-tight hidden sm:inline">Jaxtina Quiz</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="bg-white/20 rounded-xl px-3 py-1.5 text-white font-black text-xs border border-white/10">
                 ⭐ {score}
               </div>
               <div className="bg-white/20 rounded-xl px-3 py-1.5 text-white font-black text-xs border border-white/10">
                 ⏱ {fmt(elapsed)}
               </div>
               <button
                 onClick={() => setShowExitConfirm(true)}
                 className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition-all border border-rose-400 shadow-lg"
               >
                 🚪 Exit
               </button>
            </div>
          </div>
        </header>

        <div className="max-w-xl mx-auto px-4">
          <div className="mb-6">
             <div className="flex justify-between items-end mb-2">
               <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Progress</span>
               <span className="text-white font-black text-sm">{qIdx + 1} / {questions.length}</span>
             </div>
             <ProgressBar current={qIdx + 1} total={questions.length} />
          </div>

          <div
            className={`bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 relative overflow-hidden border-2 border-white/50
            ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
          >
            <Confetti active={confetti} />

            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Topic: {q.category}</span>
                <span className="inline-block h-1 w-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" />
              </div>
              <StreakBadge streak={streak} />
            </div>

            <h2 className="text-2xl font-black text-gray-800 leading-tight mb-10 min-h-[4rem]">
              {q.question}
            </h2>

            <div className="grid grid-cols-1 gap-3 mb-10">
              {q.options.map((opt, i) => {
                const label = ["A", "B", "C", "D"][i];
                const isChosen = chosen === i;
                const isCorrect = i === q.correctAnswer;
                const stateClass = revealed
                  ? isCorrect
                    ? "bg-green-100 border-green-400 text-green-700 shadow-[0_4px_0_#48bb78] scale-[1.02]"
                    : isChosen
                      ? "bg-red-50 border-red-300 text-red-600 shadow-[0_4px_0_#f56565]"
                      : "bg-gray-50 border-gray-100 text-gray-400 opacity-60"
                  : isChosen
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-[0_4px_0_#6366f1] scale-[1.02]"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-white hover:scale-[1.01]";

                return (
                  <button
                    key={i}
                    disabled={revealed}
                    onClick={() => setChosen(i)}
                    className={`btn-pop flex items-center gap-4 px-6 py-4 rounded-2xl border-2 font-black text-left transition-all duration-200 ${stateClass}`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm shadow-inner transition-colors duration-300
                      ${isChosen ? "bg-indigo-600 text-white" : "bg-white/80 text-gray-400"}`}>
                      {label}
                    </span>
                    <span className="flex-1 text-base">{opt}</span>
                    {revealed && isCorrect && <span className="text-xl">✅</span>}
                    {revealed && !isCorrect && isChosen && <span className="text-xl">❌</span>}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div className="bg-indigo-50 rounded-3xl p-6 mb-8 border border-indigo-100 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">💡</span>
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Did you know?</span>
                </div>
                <p className="text-sm text-gray-700 font-bold leading-relaxed">{q.funFact}</p>
                {q.source && (
                  <div className="mt-4 pt-4 border-t border-indigo-100/50">
                    <p className="text-[10px] text-gray-500 mb-1.5 font-bold uppercase tracking-tight">Source Material</p>
                    <a
                      href={q.source.startsWith('http') ? q.source : `https://www.google.com/search?q=${encodeURIComponent(q.source)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 font-black hover:underline inline-flex items-center gap-1.5 group"
                    >
                      📖 {q.source}
                      <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleCheck}
                disabled={chosen === null}
                className={`btn-pop w-full py-5 rounded-3xl font-black text-xl text-gray-900 shadow-xl transition-all relative overflow-hidden group
                  ${chosen === null ? "bg-gray-200 cursor-not-allowed text-gray-400 opacity-50" : "bg-gradient-to-r from-yellow-300 to-orange-400 hover:opacity-90 hover:scale-[1.02]"}`}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {revealed ? (qIdx + 1 === questions.length ? "🏁 See Results" : "Next Question ➡️") : "⚡ Check Answer"}
                </div>
                {!revealed && chosen !== null && (
                  <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite] pointer-events-none" />
                )}
              </button>
              
              {!revealed && (
                <div className="flex items-center gap-1.5 opacity-40 text-gray-900 font-black text-[10px] tracking-widest uppercase">
                  <span>Press</span>
                  <kbd className="bg-gray-900 text-white px-1.5 py-0.5 rounded shadow-sm">Enter</kbd>
                  <span>to confirm</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl">
              <div className="text-4xl mb-4 text-center">👋</div>
              <h3 className="text-2xl font-black text-gray-800 text-center mb-2">Wait, don&quot;t go!</h3>
              <p className="text-gray-500 text-center font-bold mb-8">You&quot;ll lose your progress. Are you sure you want to exit?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Stay
                </button>
                <button
                  onClick={reset}
                  className="flex-1 py-4 rounded-2xl font-black text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-lg"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === "results") {
    const pct = Math.round((score / questions.length) * 100);
    const [medalEmoji, msg] =
      pct === 100 ? ["🏆", "Perfect score! 🏆"] :
      pct >= 80 ? ["🌟", "Great job! 🌟"] :
      pct >= 60 ? ["🎯", "Good effort! 🎯"] :
      pct >= 40 ? ["👍", "Not bad! Keep going 👍"] :
      ["💪", "Keep practising! 💪"];

    const handleShare = async () => {
      const url = window.location.href;
      const text = `I scored ${score}/${questions.length} (${pct}%) on the Jaxtina Quiz! Can you beat me? 🧠`;
      
      if (navigator.share) {
        try {
          await navigator.share({ title: "Jaxtina Quiz", text, url });
        } catch (err) {
          console.error(err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(`${text} ${url}`);
          alert("Result copied to clipboard! 📋");
        } catch (err) {
          console.error(err);
        }
      }
    };

    return (
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 rounded-3xl min-h-[80vh] flex flex-col items-center">
        <Confetti active={pct >= 60} />
        <div className="max-w-2xl w-full mx-auto">
          <div className="text-center py-6">
            <div className="text-7xl mb-1">{medalEmoji}</div>
            <h1 className="text-4xl font-black text-white">{msg}</h1>
            <p className="text-white/90 text-lg mt-1 font-bold">{playerName || "Anonymous"}</p>
            <div className="flex justify-center gap-4 mt-3">
              <span className="bg-white/20 rounded-2xl px-4 py-2 text-white font-black shadow-lg">
                ⭐ {score}/{questions.length} · {pct}%
              </span>
              <span className="bg-white/20 rounded-2xl px-4 py-2 text-white font-black shadow-lg">
                ⏱ {fmt(elapsed)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleShare}
              className="flex-1 py-4 rounded-2xl font-black text-base text-gray-900 bg-white hover:bg-white/90 shadow-xl transition-all hover:scale-[1.02]"
            >
              📤 Share Result
            </button>
            <button
              onClick={() => generate()}
              className="flex-1 py-4 rounded-2xl font-black text-base text-gray-900 bg-gradient-to-r from-yellow-300 to-orange-400 hover:opacity-90 shadow-xl transition-all hover:scale-[1.02]"
            >
              🔁 Retry Same Settings
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-white font-black text-xl px-2">📜 Question Review</h3>
            {history.map((h, i) => (
              <div
                key={i}
                className={`p-5 rounded-3xl border-2 shadow-lg transition-all hover:translate-x-1 ${h.correct ? "border-green-300 bg-green-50/95" : "border-red-300 bg-red-50/95"}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${h.correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-base mb-2 leading-tight">{h.q.question}</p>
                    <div className="space-y-1">
                      <p className={`text-sm font-semibold flex items-center gap-2 ${h.correct ? "text-green-600" : "text-red-500"}`}>
                        {h.correct ? "✅" : "❌"} {h.correct ? "Your answer" : "You chose"}: {h.q.options[h.chosen]}
                      </p>
                      {!h.correct && (
                        <p className="text-sm text-green-700 font-bold flex items-center gap-2">
                          ✅ Correct: {h.q.options[h.q.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pb-6">
            <button
              onClick={() => setShowLb(true)}
              className="flex-1 py-4 rounded-2xl font-black text-base text-gray-900 bg-white/20 text-white hover:bg-white/30 transition-all"
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={reset}
              className="flex-1 py-4 rounded-2xl font-black text-base text-gray-900 bg-gradient-to-r from-yellow-300 to-orange-400 hover:opacity-90 shadow-xl transition-all hover:scale-[1.02]"
            >
              🏠 Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }
}

