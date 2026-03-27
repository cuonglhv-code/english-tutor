"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ArrowLeft, TrendingUp } from "lucide-react";

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
    <div className="w-full h-4 bg-slate-100/50 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
      <div
        className="h-full bg-gradient-to-r from-[#FF7043] to-[#FF8A65] rounded-full transition-all duration-700 ease-out border-r border-orange-400/30"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  );
}

function StreakBadge({ streak, label }: { streak: number; label: string }) {
  if (streak < 2) return null;
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-black bg-orange-400 text-white animate-bounce">
      🔥 {streak}× {label}!
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────
function Leaderboard({ onBack, dict }: { onBack: () => void; dict: any }) {
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
    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-50 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF7043]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#26A69A]/5 blur-[100px] pointer-events-none" />
      
      <div className="relative max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">{dict.quiz.leaderboard.title}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.quiz.leaderboard.top10}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[5, 10, 15, 20].map((n) => (
            <button
              key={n}
              onClick={() => { setTab(n); setExpandedId(null); }}
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs transition-all border-b-4
                ${tab === n
                  ? "bg-[#FF7043] text-white border-orange-700 shadow-lg -translate-y-0.5"
                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"}`}
            >
              {n} {dict.quiz.stats.question}s
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-12 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wide px-4 py-3 border-b border-gray-100 italic">
            <div className="col-span-1">{dict.quiz.leaderboard.rank}</div>
            <div className="col-span-4 sm:col-span-4">{dict.quiz.leaderboard.name}</div>
            <div className="col-span-3 text-center">{dict.quiz.leaderboard.score}</div>
            <div className="col-span-4 sm:col-span-2 text-center">{dict.quiz.leaderboard.time}</div>
            <div className="hidden sm:block col-span-2 text-center">{dict.quiz.leaderboard.date}</div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 font-semibold">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-5xl mb-2">😴</div>
              <p className="text-gray-400 font-semibold">{dict.quiz.leaderboard.noScores}</p>
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
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : <span className="text-gray-400 text-xs">{i + 1}</span>}
                    </div>
                    <div className="col-span-4 font-bold text-gray-800 truncate pr-2 text-xs sm:text-sm">{r.name}</div>
                    <div className="col-span-3 text-center">
                      <span
                        className={`font-black px-2 py-0.5 rounded-full text-[10px] sm:text-xs
                        ${r.score === r.total
                          ? "bg-green-100 text-green-700"
                          : r.score / r.total >= 0.6
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-600"}`}
                      >
                        {r.score}/{r.total}
                      </span>
                    </div>
                    <div className="col-span-4 sm:col-span-2 text-center text-gray-500 font-semibold text-[10px] sm:text-xs">⏱ {fmt(r.time)}</div>
                    <div className="hidden sm:flex col-span-2 text-center text-gray-400 text-xs items-center justify-center gap-1">
                      {r.date}
                      {r.history.length > 0 && (
                        <span className="text-purple-400">{expandedId === r.id ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </div>

                  {/* Expandable history */}
                  {expandedId === r.id && r.history.length > 0 && (
                    <div className="bg-indigo-50 border-t border-indigo-100 px-4 py-3 space-y-2">
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-wide mb-2">{dict.quiz.leaderboard.history}</p>
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
  const { dict, lang } = useTranslation();
  const supabase = useMemo(() => createBrowserClient(), []);

  const CATEGORIES = useMemo(() => [
    { id: "Science", label: dict.quiz.categories.Science, emoji: "🔬" },
    { id: "History", label: dict.quiz.categories.History, emoji: "🏛️" },
    { id: "Geography", label: dict.quiz.categories.Geography, emoji: "🌏" },
    { id: "Sports", label: dict.quiz.categories.Sports, emoji: "⚽" },
    { id: "Movies", label: dict.quiz.categories.Movies, emoji: "🎬" },
    { id: "Music", label: dict.quiz.categories.Music, emoji: "🎵" },
    { id: "Literature", label: dict.quiz.categories.Literature, emoji: "📖" },
    { id: "Technology", label: dict.quiz.categories.Technology, emoji: "💻" },
    { id: "Animals", label: dict.quiz.categories.Animals, emoji: "🐾" },
    { id: "Space", label: dict.quiz.categories.Space, emoji: "🚀" },
    { id: "Math", label: dict.quiz.categories.Math, emoji: "🔢" },
    { id: "Vietnam", label: dict.quiz.categories.Vietnam, emoji: "🇻🇳" },
  ], [dict]);

  const DIFF: Record<string, { label: string; emoji: string; color: string }> = useMemo(() => ({
    easy: { label: dict.quiz.diff.easy, emoji: "🌱", color: "from-green-400 to-emerald-500" },
    medium: { label: dict.quiz.diff.medium, emoji: "🔥", color: "from-amber-400 to-orange-500" },
    hard: { label: dict.quiz.diff.hard, emoji: "💀", color: "from-rose-500 to-pink-600" },
  }), [dict]);

  const [phase, setPhase] = useState<"setup" | "loading" | "playing" | "results">("setup");
  const [showLb, setShowLb] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const router = useRouter();
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
        if (!user) throw new Error('No user');
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
        setUserId(user.id);
      } catch {
        const saved = localStorage.getItem('jaxtina_guest')
        if (saved) {
          try {
            const guestItems = JSON.parse(saved)
            setUserId('guest-' + (guestItems.phone || guestItems.email || 'anonymous'))
            if (guestItems.name && !playerName.trim()) setPlayerName(guestItems.name.slice(0, 24))
          } catch {
            setUserId('guest-anonymous-' + Date.now())
          }
        } else {
          setUserId('guest-anonymous-' + Date.now())
          setPlayerName(dict.quiz.guest || "Guest")
        }
      }
    })();
    return () => { cancelled = true; };
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save score + full test history to Supabase via API route when results screen appears
  useEffect(() => {
    if (phase === "results" && !savedRef.current && questions.length > 0) {
      if (userId.startsWith('guest-')) return; // No persistence for guests
      savedRef.current = true;
      // Serialize history: include question text, options, correct+chosen index
      const historyPayload = history.map((h) => ({
        question: h.q.question,
        options: h.q.options,
        correctAnswer: h.q.correctAnswer,
        chosen: h.chosen,
        correct: h.correct,
      }));
      fetch("/api/quiz/leaderboard", {
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
      alert(dict.quiz.gameplay.pickFirst);
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
- Language: English (questions and options)
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
    "funFact": "one short interesting fun fact about the answer (max 20 words in English)",
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
      alert(dict.quiz.gameplay.pickFirst);
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

  if (showLb) return <Leaderboard onBack={() => setShowLb(false)} dict={dict} />;

  if (phase === "setup")
    return (
      <div className="bg-white rounded-[3rem] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.06)] border border-slate-50 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#26A69A]/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF7043]/5 blur-[100px] pointer-events-none" />
        
        <style>{`
          @keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
          .btn-pop:active { transform: scale(.95); }
        `}</style>
        <div className="relative max-w-2xl mx-auto">
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF7043]/10 text-[10px] font-black text-[#FF7043] uppercase tracking-widest border border-[#FF7043]/10 mb-4">
              <TrendingUp className="w-3 h-3" />
              Test your knowledge!
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tight leading-none mb-2">{dict.quiz.title}</h1>
            <p className="text-slate-400 font-medium">{dict.quiz.subtitle}</p>
          </div>

          <Link
            href={`/${lang}/experience`}
            className="inline-flex items-center gap-2 mb-8 px-6 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-[#FF7043] hover:border-[#FF7043]/20 hover:shadow-lg transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {lang === 'vi' ? 'Quay lại' : 'Back to Experience'}
          </Link>

          <button
            onClick={() => setShowLb(true)}
            className="btn-pop w-full mb-10 py-4 rounded-full font-black text-base text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            ⭐ {dict.quiz.viewLeaderboard}
          </button>

          <div className="space-y-10">
            <div>
              <h2 className="text-slate-800 font-black text-xl mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#FF7043]/10 flex items-center justify-center text-[#FF7043] text-sm">1</span>
                {dict.quiz.yourName}
              </h2>
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={dict.quiz.namePlaceholder}
                maxLength={24}
                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 text-slate-800 font-bold text-lg placeholder-slate-300 outline-none border-2 border-transparent focus:border-[#FF7043]/20 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div>
              <h2 className="text-slate-800 font-black text-xl mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#26A69A]/10 flex items-center justify-center text-[#26A69A] text-sm">2</span>
                {dict.quiz.pickTopics}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleCat(c.id)}
                    className={`btn-pop py-4 px-4 rounded-2xl font-black text-[13px] transition-all duration-200 border-2 flex flex-col items-center gap-2 shadow-sm
                    ${cats.includes(c.id)
                        ? "bg-[#26A69A] text-white border-[#1e867c] scale-105 shadow-xl shadow-[#26A69A]/20"
                        : "bg-white text-slate-500 border-slate-100 hover:border-[#26A69A]/30 hover:bg-slate-50"}`}
                  >
                    <span className="text-3xl mb-1">{c.emoji}</span>
                    <span className="truncate leading-none uppercase tracking-tighter">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-slate-800 font-black text-xl mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 text-sm">3</span>
                  {dict.quiz.difficulty}
                </h2>
                <div className="flex flex-col gap-3">
                  {Object.entries(DIFF).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => setDiff(k)}
                      className={`btn-pop flex-1 py-3.5 rounded-2xl font-black text-sm transition-all border-b-4
                      ${diff === k
                          ? `bg-[#FF7043] text-white border-orange-700 shadow-lg -translate-y-0.5`
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"}`}
                    >
                      {v.emoji} {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-slate-800 font-black text-xl mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-sm">4</span>
                  {dict.quiz.questionCount}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[5, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumQ(n)}
                      className={`btn-pop py-3.5 rounded-2xl font-black text-lg transition-all border-b-4
                      ${numQ === n
                          ? "bg-[#26A69A] text-white border-[#1e867c] shadow-lg -translate-y-0.5"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={generate}
              className="btn-pop w-full py-5 rounded-full font-black text-2xl text-white bg-gradient-to-r from-[#FF7043] to-[#FF8A65] border-b-4 border-orange-700 shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all mt-4"
            >
              🚀 {dict.quiz.letsGo}
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
        <p className="text-white text-xl font-black animate-pulse">{dict.quiz.loading}</p>
      </div>
    );

  if (phase === "playing") {
    const q = questions[qIdx];
    const optLabels = ["A", "B", "C", "D"];
    return (
      <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-50 relative overflow-hidden">
        <Confetti active={confetti} />
        <style>{`
          @keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
          @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
          .shake { animation: shake .4s ease; }
        `}</style>
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-slate-50 text-slate-400 rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest border border-slate-100 shadow-sm">
              {dict.quiz.stats.question} {qIdx + 1}/{questions.length}
            </div>
            <StreakBadge streak={streak} label={dict.quiz.stats.streak} />
            <div className="flex gap-2">
              <div className={`rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest border transition-all ${elapsed >= 60 ? "bg-red-50 text-red-500 border-red-100 animate-pulse" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                ⏱ {fmt(elapsed)}
              </div>
              <div className="bg-[#26A69A]/10 border border-[#26A69A]/20 rounded-full px-4 py-1.5 text-[#26A69A] font-black text-[10px] uppercase tracking-widest shadow-sm">
                ⭐ {dict.quiz.stats.score}: {score}
              </div>
            </div>
          </div>
          <ProgressBar current={qIdx} total={questions.length} />

          <div className={`mt-8 bg-slate-50/50 rounded-[2rem] p-8 border border-white shadow-xl ${shake ? "shake" : ""}`}>
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="px-4 py-1.5 bg-white border border-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                {CATEGORIES.find((c) => c.id === q.category)?.emoji || "🎯"} {q.category}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm bg-[#FF7043]`}>
                {DIFF[diff].emoji} {diff}
              </span>
              <span className="px-4 py-1.5 bg-white border border-slate-100 text-slate-300 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                👤 {playerName || "Anonymous"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight mb-8">
              {q.question}
            </h2>

            <div className="grid grid-cols-1 gap-3 mb-8">
              {q.options.map((opt, i) => {
                let cls = "w-full p-5 rounded-2xl font-black text-left transition-all duration-200 border-b-4 flex items-center gap-4 ";
                if (!revealed) {
                  cls +=
                    chosen === i
                      ? "bg-[#26A69A] text-white border-[#1e867c] scale-[1.02] shadow-xl shadow-[#26A69A]/20"
                      : "bg-white text-slate-500 border-slate-100 hover:border-[#26A69A]/30 hover:bg-slate-50";
                } else {
                  if (i === q.correctAnswer) cls += "bg-[#26A69A] text-white border-[#1e867c] scale-[1.02] shadow-xl shadow-[#26A69A]/20";
                  else if (i === chosen) cls += "bg-[#FF7043] text-white border-orange-700";
                  else cls += "bg-white/50 text-slate-300 border-slate-50 scale-95 opacity-50";
                }
                return (
                  <button key={i} onClick={() => !revealed && setChosen(i)} className={cls}>
                    <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 font-black text-sm shrink-0">
                      {optLabels[i]}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {revealed && i === q.correctAnswer && <span className="text-2xl drop-shadow-sm">✅</span>}
                    {revealed && i === chosen && i !== q.correctAnswer && <span className="text-2xl drop-shadow-sm">❌</span>}
                  </button>
                );
              })}
            </div>

            {revealed && (q.funFact || q.source) && (
              <div className="space-y-4 mb-8">
                {q.funFact && (
                  <div className="bg-orange-50/50 border border-orange-100 rounded-[1.5rem] p-5 flex gap-4">
                    <span className="text-3xl filter drop-shadow-sm">💡</span>
                    <p className="text-sm text-orange-800 font-bold leading-relaxed">{q.funFact}</p>
                  </div>
                )}
                {q.source && (
                  <div className="bg-teal-50/50 border border-teal-100 rounded-[1.5rem] p-4 flex gap-4 items-start">
                    <span className="text-2xl filter drop-shadow-sm">📚</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="uppercase tracking-[0.2em] text-teal-400 text-[9px] font-black">Verify source</span>
                        <div className="relative group">
                          <span className="cursor-pointer text-teal-300 hover:text-teal-500 text-xs select-none">ⓘ</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-slate-800 text-white text-[10px] font-medium rounded-2xl p-3 shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 leading-relaxed border border-white/10">
                            This source was suggested by AI and may not be exact. Always double-check it yourself! 🔍
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-teal-700 font-black">{q.source}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleCheck}
              className="w-full py-5 rounded-full font-black text-xl text-white bg-gradient-to-r from-[#FF7043] to-[#FF8A65] border-b-4 border-orange-700 shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {!revealed ? dict.quiz.gameplay.checkAnswer : qIdx + 1 === questions.length ? dict.quiz.gameplay.seeResults : dict.quiz.gameplay.nextQuestion}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const pct = Math.round((score / questions.length) * 100);
    const [medalEmoji, msg] =
      pct >= 80 ? ["🏆", dict.quiz.results.genius] :
        pct >= 60 ? ["🥈", dict.quiz.results.great] :
          pct >= 40 ? ["🥉", dict.quiz.results.notBad] :
            ["📚", dict.quiz.results.keepStudying];
    return (
      <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-50 relative overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#26A69A]/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#FF7043]/5 blur-[120px] pointer-events-none" />
        
        <Confetti active={pct >= 60} />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-center py-10">
            <div className="text-8xl mb-4 filter drop-shadow-xl animate-bounce">{medalEmoji}</div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-none mb-2">{msg}</h1>
            <p className="text-slate-400 text-lg font-bold mb-8">{playerName || "Anonymous"}</p>
            <div className="flex justify-center gap-4 mt-3">
              <span className="bg-[#26A69A]/10 border border-[#26A69A]/20 rounded-2xl px-6 py-3 text-[#26A69A] font-black text-sm shadow-sm transition-transform hover:scale-105">
                ⭐ {score}/{questions.length} · {pct}%
              </span>
              <span className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 text-slate-400 font-black text-sm shadow-sm transition-transform hover:scale-105">
                ⏱ {fmt(elapsed)}
              </span>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-white shadow-xl space-y-3 mb-8 max-h-[40vh] overflow-y-auto">
            {history.map((h, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border-b-4 transition-all hover:scale-[1.01] ${h.correct ? "border-green-100 bg-white" : "border-red-100 bg-white"}`}
              >
                <p className="font-black text-slate-700 text-sm mb-2">{h.q.question}</p>
                <p className={`text-sm font-black flex items-center gap-2 ${h.correct ? "text-[#26A69A]" : "text-[#FF7043]"}`}>
                  {h.correct ? "✅" : "❌"} {dict.quiz.results.yourAnswer || 'Your answer'}: <span className="underline decoration-2 underline-offset-4">{h.q.options[h.chosen]}</span>
                </p>
                {!h.correct && (
                  <p className="text-sm text-[#26A69A] font-black mt-2 flex items-center gap-2">
                    ✅ {dict.quiz.results.correctAnswer || 'Correct'}: <span className="bg-[#26A69A]/10 px-2 py-0.5 rounded-lg">{h.q.options[h.q.correctAnswer]}</span>
                  </p>
                )}
              </div>
            ))}
          </div>

          {userId.startsWith('guest-') && (
            <div className="bg-white rounded-[2rem] p-8 text-center mb-8 border-b-4 border-orange-50 shadow-xl group">
              <p className="text-slate-400 text-[10px] font-black mb-4 uppercase tracking-[0.2em] leading-relaxed group-hover:text-[#FF7043] transition-colors">
                {lang === 'vi' 
                  ? 'Bạn đang ở chế độ Khách. Tạo tài khoản để lưu kết quả và xem phân tích!' 
                  : 'You’re in Guest Mode. Create a free account to save this and unlock full analytics.'}
              </p>
              <button
                onClick={() => router.push(`/${lang}/register`)}
                className="w-full py-5 rounded-full font-black text-base text-white bg-gradient-to-r from-[#FF7043] to-[#FF8A65] border-b-4 border-orange-700 shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {lang === 'vi' ? 'Tạo tài khoản Miễn phí' : 'Create Free Account'}
              </button>
            </div>
          )}
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setShowLb(true)}
              className="flex-1 py-5 rounded-full font-black text-base text-slate-600 bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:scale-[1.02] active:scale-95 shadow-sm"
            >
              {dict.quiz.results.leaderboard}
            </button>
            <button
              onClick={reset}
              className="flex-1 py-5 rounded-full font-black text-base text-white bg-gradient-to-r from-[#FF7043] to-[#FF8A65] border-b-4 border-orange-700 shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {dict.quiz.results.playAgain}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

