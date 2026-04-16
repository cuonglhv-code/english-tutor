"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { createBrowserClient } from "@/lib/supabase";
import {
  BASIC_QUESTIONS,
  INTERMEDIATE_QUESTIONS,
  ADVANCED_QUESTIONS,
  GRAMMAR_TOPICS,
  type GrammarQuestion,
} from "@/lib/grammarQuestions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  BookOpen,
  Gamepad2,
  BarChart3,
  Trophy,
  X,
  Check,
  XCircle,
  LogOut,
} from "lucide-react";

const COLORS = {
  terracotta: "#D97757",
  terracottaDark: "#C46847",
  amber: "#E8A945",
  forest: "#2D5A4A",
  charcoal: "#2C2C2C",
  grey: "#6B6B6B",
  cream: "#FAF7F2",
  sand: "#F0EBE3",
  taupe: "#E5DED4",
};

interface UserProgress {
  id: string;
  name: string;
  xp: number;
  completedTopics: Record<string, boolean>;
  streak: number;
}

export function GrammarApp() {
  const { user, loading: authLoading } = useUser();
  const { dict, lang } = useTranslation();
  const supabase = createBrowserClient();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [currentLevel, setCurrentLevel] = useState<"basic" | "intermediate" | "advanced">("basic");
  const [activeTab, setActiveTab] = useState<"practices" | "games" | "progress">("practices");
  const [leaderboard, setLeaderboard] = useState<UserProgress[]>([]);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPractice, setShowPractice] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<GrammarQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (user && !isLoggedIn) {
      setIsLoggedIn(true);
      setDisplayName(user.email?.split("@")[0] || "Learner");
    }
  }, [user, isLoggedIn]);

  const getQuestions = () => {
    switch (currentLevel) {
      case "basic":
        return BASIC_QUESTIONS;
      case "intermediate":
        return INTERMEDIATE_QUESTIONS;
      case "advanced":
        return ADVANCED_QUESTIONS;
      default:
        return BASIC_QUESTIONS;
    }
  };

  const startPractice = () => {
    const questions = getQuestions();
    if (questions.length > 0) {
      setCurrentQuestion(questions[0]);
      setQuestionIndex(0);
      setShowPractice(true);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setCorrectCount(0);
    }
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowFeedback(true);
    if (currentQuestion && index === currentQuestion.correct) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    const questions = getQuestions();
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      setCurrentQuestion(questions[questionIndex + 1]);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      const earnedXp = correctCount * 10;
      setXp((prev) => prev + earnedXp);
      setShowPractice(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setLoginError("Please enter your name");
      return;
    }
    setLoading(true);
    setDisplayName(userName);
    setIsLoggedIn(true);
    setXp(0);
    setStreak(0);
    setCompletedTopics({});
    setLoading(false);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setDisplayName("");
    setUserName("");
    setXp(0);
    setStreak(0);
  };

  const getLevelLabel = () => {
    switch (currentLevel) {
      case "basic":
        return "Basic (A1-A2)";
      case "intermediate":
        return "Intermediate (B1-B2)";
      case "advanced":
        return "Advanced (C1-C2)";
      default:
        return "";
    }
  };

  const renderLoginScreen = () => (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.sand} 100%)` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-xl"
        style={{ borderRadius: "24px" }}
      >
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.amber})`,
          }}
        >
          <Star className="w-12 h-12 text-white" />
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: COLORS.charcoal, fontFamily: "Playfair Display, serif" }}
        >
          Welcome to GrammarQuest
        </h1>
        <p className="mb-8" style={{ color: COLORS.grey }}>
          Enter your name to start learning English grammar
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-left">
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: COLORS.charcoal }}
            >
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-orange-400 focus:outline-none text-base font-semibold"
              style={{ backgroundColor: "#F5F5F5" }}
            />
          </div>
          {loginError && (
            <p style={{ color: "#E85D4C", fontSize: "13px" }}>{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${COLORS.terracotta}, #FF8A65)`,
              boxShadow: "0 4px 12px rgba(217, 119, 87, 0.3)",
            }}
          >
            {loading ? "Loading..." : "Start Learning"}
          </button>
        </form>
      </motion.div>
    </div>
  );

  const renderUserHeader = () => (
    <header
      className="flex items-center justify-between px-8 py-4 bg-white border-b"
      style={{ borderColor: COLORS.taupe }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
          style={{
            background: `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.amber})`,
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: COLORS.charcoal }}>
            {displayName}
          </h3>
          <p style={{ color: COLORS.grey, fontSize: "13px" }}>Learning English</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ backgroundColor: COLORS.sand }}
        >
          <Star className="w-5 h-5" style={{ color: COLORS.amber }} />
          <span className="font-semibold">{xp} XP</span>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-white"
          style={{
            background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.terracotta})`,
          }}
        >
          <Trophy className="w-5 h-5" />
          <span className="font-semibold">#{leaderboard.length + 1}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-stone-100 text-stone-500 text-sm font-medium hover:bg-stone-200 transition-colors"
        >
          <LogOut className="w-4 h-4 inline mr-1" />
          Logout
        </button>
      </div>
    </header>
  );

  const renderHero = () => (
    <section
      className="relative py-16 px-8"
      style={{
        background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.sand} 100%)`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: COLORS.sand }}>
          <Star className="w-4 h-4" style={{ color: COLORS.terracotta }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.terracotta }}>
            Learn English Grammar
          </span>
        </div>
        <h1
          className="text-4xl font-bold mb-4"
          style={{ color: COLORS.charcoal, fontFamily: "Playfair Display, serif" }}
        >
          Master <span style={{ color: COLORS.terracotta }}>English Grammar</span> From Basic to Advanced
        </h1>
        <p style={{ color: COLORS.grey, fontSize: "16px" }}>
          Interactive lessons, fun games, and personalized practice to help you build confidence.
        </p>
      </div>
    </section>
  );

  const renderProgress = () => (
    <section className="px-8 py-8" style={{ backgroundColor: COLORS.sand, borderRadius: "16px" }}>
      <div className="flex items-center gap-16">
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <span className="font-semibold" style={{ color: COLORS.charcoal }}>
              Level Progress
            </span>
            <span style={{ color: COLORS.terracotta }}>
              {xp} / {(Math.floor(xp / 100) + 1) * 100} XP
            </span>
          </div>
          <div className="h-3 bg-stone-200 rounded-lg overflow-hidden">
            <div
              className="h-full rounded-lg transition-all"
              style={{
                width: `${xp % 100}%`,
                background: `linear-gradient(90deg, ${COLORS.terracotta}, ${COLORS.amber})`,
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-xl">
          <Star className="w-10 h-10" style={{ color: COLORS.amber }} />
          <div>
            <div className="text-2xl font-bold" style={{ color: COLORS.amber }}>
              {Math.floor(xp / 100) + 1}
            </div>
            <div className="text-xs uppercase tracking-wider" style={{ color: COLORS.grey }}>
              Level
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderLevelTabs = () => (
    <div className="flex gap-4 px-8 py-4 border-b" style={{ borderColor: COLORS.taupe }}>
      <button
        onClick={() => setCurrentLevel("basic")}
        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
          currentLevel === "basic" ? "" : "text-stone-400"
        }`}
        style={{
          color: currentLevel === "basic" ? COLORS.terracotta : undefined,
          borderBottom: currentLevel === "basic" ? `3px solid ${COLORS.terracotta}` : "none",
        }}
      >
        <BookOpen className="w-5 h-5 inline mr-2" />
        Practices
      </button>
      <button
        onClick={() => setCurrentLevel("intermediate")}
        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
          currentLevel === "intermediate" ? "" : "text-stone-400"
        }`}
        style={{
          color: currentLevel === "intermediate" ? COLORS.terracotta : undefined,
          borderBottom: currentLevel === "intermediate" ? `3px solid ${COLORS.terracotta}` : "none",
        }}
      >
        <BookOpen className="w-5 h-5 inline mr-2" />
        Intermediate
      </button>
      <button
        onClick={() => setCurrentLevel("advanced")}
        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
          currentLevel === "advanced" ? "" : "text-stone-400"
        }`}
        style={{
          color: currentLevel === "advanced" ? COLORS.terracotta : undefined,
          borderBottom: currentLevel === "advanced" ? `3px solid ${COLORS.terracotta}` : "none",
        }}
      >
        <BookOpen className="w-5 h-5 inline mr-2" />
        Advanced
      </button>
    </div>
  );

  const renderTopicCards = () => {
    const filteredTopics = GRAMMAR_TOPICS.filter((t) => {
      if (currentLevel === "basic") return t.level === "basic";
      if (currentLevel === "intermediate") return t.level === "intermediate";
      return t.level === "advanced";
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 py-8">
        {filteredTopics.map((topic) => (
          <motion.div
            key={topic.id}
            whileHover={{ y: -4 }}
            className="bg-stone-50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg"
            style={{ border: "2px solid transparent" }}
            onClick={startPractice}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-white"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              >
                <BookOpen className="w-6 h-6" style={{ color: COLORS.terracotta }} />
              </div>
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: completedTopics[topic.id]
                    ? "rgba(143, 174, 139, 0.2)"
                    : "rgba(217, 119, 87, 0.1)",
                  color: completedTopics[topic.id] ? COLORS.forest : COLORS.terracotta,
                }}
              >
                {completedTopics[topic.id] ? "Completed" : "Available"}
              </span>
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: COLORS.charcoal }}
            >
              {topic.title}
            </h3>
            <p className="text-sm mb-4" style={{ color: COLORS.grey }}>
              {topic.description}
            </p>
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: COLORS.taupe }}>
              <span className="text-sm" style={{ color: COLORS.grey }}>
                {topic.lessons} lessons
              </span>
              <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: COLORS.amber }}>
                <Star className="w-4 h-4" />
                {topic.xp} XP
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderPracticeModal = () => {
    if (!showPractice || !currentQuestion) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(217, 119, 87, 0.1)",
                  color: COLORS.terracotta,
                }}
              >
                {getLevelLabel()}
              </span>
            </div>
            <button
              onClick={() => setShowPractice(false)}
              className="p-2 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
            {currentQuestion.question}
          </h2>

          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                  selectedAnswer !== null
                    ? index === currentQuestion.correct
                      ? "border-2 border-green-500 bg-green-50"
                      : selectedAnswer === index
                      ? "border-2 border-red-400 bg-red-50"
                      : "border-2 border-transparent"
                    : "border-2 border-transparent hover:border-orange-300 bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${
                      selectedAnswer !== null
                        ? index === currentQuestion.correct
                          ? "bg-green-500 text-white"
                          : selectedAnswer === index
                          ? "bg-red-400 text-white"
                          : "bg-stone-200"
                        : "bg-white"
                    }`}
                    style={{
                      backgroundColor:
                        selectedAnswer !== null
                          ? index === currentQuestion.correct
                            ? "#8FAE8B"
                            : selectedAnswer === index
                            ? "#E85D4C"
                            : COLORS.taupe
                          : "white",
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl mb-6 ${
                  selectedAnswer === currentQuestion.correct ? "bg-green-50" : "bg-red-50"
                }`}
                style={{
                  backgroundColor:
                    selectedAnswer === currentQuestion.correct
                      ? "rgba(143, 174, 139, 0.2)"
                      : "rgba(232, 93, 76, 0.1)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {selectedAnswer === currentQuestion.correct ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span
                    className="font-semibold"
                    style={{
                      color: selectedAnswer === currentQuestion.correct ? COLORS.forest : "#E85D4C",
                    }}
                  >
                    {selectedAnswer === currentQuestion.correct ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                <p className="text-sm" style={{ color: COLORS.grey }}>
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center gap-4">
            {showFeedback && (
              <button
                onClick={nextQuestion}
                className="px-8 py-3 rounded-xl font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.terracotta}, #FF8A65)`,
                }}
              >
                {questionIndex < getQuestions().length - 1 ? "Next Question" : "Finish"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderMainApp = () => (
    <div className="min-h-screen bg-[#FAF7F2]">
      {renderUserHeader()}
      {renderHero()}
      {renderProgress()}
      {renderLevelTabs()}
      {renderTopicCards()}
      {renderPracticeModal()}
    </div>
  );

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: COLORS.cream }}
      >
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-orange-400 rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: COLORS.grey }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return renderLoginScreen();
  }

  return renderMainApp();
}