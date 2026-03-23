'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Send, BookOpen, Target, TrendingUp,
  MessageSquare, CheckCircle, BarChart3,
  Star, ArrowLeft, Trash2, ChevronDown, ChevronUp,
  HelpCircle, RotateCcw, XCircle, Type, Info,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { createBrowserClient } from '@/lib/supabase'
import { useFavourites } from '@/lib/tutor/useFavourites'
import {
  LEVELS, SKILL_AREAS, SKILL_ICONS, LEVEL_COLORS,
  STARTER_PROMPTS,
} from '@/lib/tutor/prompts'
import type {
  ProficiencyLevel, SkillArea,
  TutorMessage, TutorFeedback,
  TutorChatResponse, QuizQuestion,
} from '@/lib/tutor/types'

// ── Quiz card ───────────────────────────────────────────────────────────────

interface QuizCardProps {
  questions: QuizQuestion[]
  onComplete: (passed: boolean) => void
}

function QuizCard({ questions, onComplete }: QuizCardProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null))
  const [submitted, setSubmitted] = useState(false)
  const [showExplanations, setShowExplanations] = useState(false)

  const handleSelect = (qIdx: number, choice: number) => {
    if (submitted) return
    setAnswers(prev => prev.map((a, i) => (i === qIdx ? choice : a)))
  }

  const handleSubmit = () => {
    if (answers.some(a => a === null)) return
    setSubmitted(true)
    const correct = answers.filter((a, i) => a === questions[i].correctIndex).length
    const passed = correct >= 2
    
    if (!passed) setShowExplanations(true) // Auto-expand on fail

    // Delay so the user sees result before the parent acts
    setTimeout(() => onComplete(passed), 2500)
  }

  const correctCount = submitted
    ? answers.filter((a, i) => a === questions[i].correctIndex).length
    : 0
  const answeredCount = answers.filter(a => a !== null).length
  const allAnswered = answeredCount === questions.length
  const passed = correctCount >= 2

  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-start">
        <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2 mt-1">
          <HelpCircle className="h-4 w-4" />
        </div>
        <div className="flex-1 max-w-sm lg:max-w-lg">
          <div className="border-l-4 border-purple-400 bg-purple-50/50 rounded-xl p-4 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 text-purple-700 font-semibold text-sm">
              🧠 Comprehension Check
              <span className="text-[10px] text-purple-500 font-normal ml-auto">Pass: 2/3 correct to continue</span>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {questions.map((q, qi) => {
                const userAnswer = answers[qi]
                
                return (
                  <div key={qi}>
                    <p className="text-sm font-semibold text-gray-800 mb-3 leading-relaxed">
                      <span className="text-purple-500 mr-1.5 font-bold">Q{qi + 1}.</span> {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.choices.map((choice, ci) => {
                        const isSelected = userAnswer === ci
                        const isCorrectChoice = ci === q.correctIndex

                        let base = 'w-full text-left px-4 py-3 rounded-lg text-sm border-2 transition-all flex items-start gap-3'
                        
                        if (!submitted) {
                          if (isSelected) {
                            base += ' border-purple-500 bg-purple-50 text-purple-800 font-medium'
                          } else {
                            base += ' border-transparent bg-white/60 text-gray-700 hover:border-purple-200 hover:bg-white'
                          }
                        } else {
                          if (isCorrectChoice) {
                            base += ' border-green-500 bg-green-50 text-green-800 font-medium'
                          } else if (isSelected && !isCorrectChoice) {
                            base += ' border-red-400 bg-red-50 text-red-600 line-through'
                          } else {
                            base += ' border-transparent bg-white/40 text-gray-400'
                          }
                        }

                        return (
                          <button key={ci} className={base} onClick={() => handleSelect(qi, ci)}>
                            <span className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] font-black ${
                              !submitted
                                ? isSelected ? 'border-purple-500 bg-purple-500 text-white shadow-sm' : 'border-gray-300 bg-white text-gray-500'
                                : isCorrectChoice ? 'border-green-500 bg-green-500 text-white'
                                : isSelected ? 'border-red-400 bg-red-400 text-white'
                                : 'border-gray-200 bg-gray-50 text-gray-300'
                            }`}>
                              {optionLabels[ci]}
                            </span>
                            <span className="flex-1 mt-0.5 leading-snug">{choice.replace(/^[A-D]\.\s*/, '')}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Explanations after submit */}
                    {submitted && showExplanations && (
                      <div className="mt-2 px-3 py-2.5 bg-white/80 border-l-2 border-amber-400 rounded-r-lg text-[11px] text-amber-900 leading-relaxed shadow-sm italic">
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer / Submit */}
            <div className="mt-6 pt-4 border-t border-purple-100">
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                    allAnswered 
                      ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {allAnswered ? 'Submit Answers' : `${answeredCount} / ${questions.length} answered`}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className={`text-center py-3 rounded-xl text-sm font-black shadow-inner ${
                    passed
                      ? 'bg-green-100 text-green-700 border-2 border-green-200'
                      : 'bg-red-100 text-red-700 border-2 border-red-200'
                  }`}>
                    {passed
                      ? `✅ ${correctCount}/3 correct! Great work!`
                      : `❌ ${correctCount}/3 correct — Help is on the way!`
                    }
                  </div>
                  <button
                    onClick={() => setShowExplanations(v => !v)}
                    className="w-full text-center text-xs font-bold text-purple-600/80 hover:text-purple-700 uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {showExplanations ? 'Hide' : 'Review'} Explanations
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <button 
        onClick={() => onComplete(true)} // Skip effectively "passes" to unblock input
        className="text-xs text-gray-400 hover:text-gray-600 underline mt-1 ml-10 block text-left transition-colors"
      >
        Skip this quiz
      </button>
    </div>
  )
}

// ── Bilingual tutor bubble ──────────────────────────────────────────────────

interface TutorBubbleProps {
  msg: TutorMessage
  onStar: () => void
  isStarred: boolean
}

function TutorBubble({ msg, onStar, isStarred }: TutorBubbleProps) {
  const [viCollapsed, setViCollapsed] = useState(false)

  return (
    <div className="flex justify-start group">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold mr-2 mt-1 shadow-sm">
        J
      </div>

      <div className="max-w-sm lg:max-w-lg flex-1">
        {/* English section */}
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base leading-none">🇬🇧</span>
              <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">English</span>
            </div>
            <div className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-blue-600">
              <ReactMarkdown
                components={{
                  h1: 'p', h2: 'p', h3: 'p', h4: 'p', h5: 'p', h6: 'p',
                  code: ({node, ...props}) => <span className="bg-gray-100 px-1 rounded mx-0.5 text-xs font-mono" {...props} />,
                  pre: 'div',
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>

          {/* Vietnamese section */}
          {msg.vietnameseNote && (
            <div className="px-4 pb-4">
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-3 mt-1 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded tracking-wide">🇻🇳 TIẾNG VIỆT</span>
                  <button
                    onClick={() => setViCollapsed(v => !v)}
                    className="ml-auto p-1 hover:bg-amber-100 rounded-full transition-colors"
                  >
                    {viCollapsed
                      ? <ChevronDown className="h-3 w-3 text-amber-600" />
                      : <ChevronUp className="h-3 w-3 text-amber-600" />}
                  </button>
                </div>
                {!viCollapsed && (
                  <p className="text-amber-900 text-sm leading-relaxed">
                    {msg.vietnameseNote}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-1.5 flex items-center justify-between border-t border-gray-50 bg-gray-50/30">
            <p className="text-[10px] text-gray-400">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <button
              onClick={onStar}
              title="Save this to Favourites"
              className={`transition-all p-1 rounded-full hover:bg-yellow-50 ${
                isStarred ? 'opacity-100 text-yellow-400 scale-125' : 'opacity-0 group-hover:opacity-100 text-gray-300 hover:text-yellow-400 scale-110'
              }`}
            >
              <Star className="h-5 w-5" fill={isStarred ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── User bubble ─────────────────────────────────────────────────────────────

interface UserBubbleProps {
  msg: TutorMessage
  onStar: () => void
  isStarred: boolean
}

function UserBubble({ msg, onStar, isStarred }: UserBubbleProps) {
  const isAuto = msg.isAutoGenerated
  return (
    <div className="flex flex-col items-end group">
      {isAuto && (
        <span className="text-[9px] text-gray-400 font-bold mb-1 mr-2 uppercase tracking-tight flex items-center gap-1">
          🔄 Auto-requested by Jaxtina
        </span>
      )}
      <div className="max-w-sm lg:max-w-md">
        <div className={`px-4 py-3 rounded-2xl rounded-br-sm shadow-sm transition-all
          ${isAuto 
            ? 'bg-white border-2 border-blue-100 text-gray-700 italic' 
            : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-200'}`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          <div className="flex items-center justify-between mt-1.5">
            <p className={`text-[10px] ${isAuto ? 'text-gray-400' : 'text-blue-200'}`}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <button
              onClick={onStar}
              title="Save this to Favourites"
              className={`transition-all p-1 rounded-full ${
                isStarred 
                  ? 'opacity-100 text-yellow-300 scale-125' 
                  : 'opacity-0 group-hover:opacity-100 text-blue-300 hover:text-yellow-300 scale-110'
              }`}
            >
              <Star className="h-5 w-5" fill={isStarred ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Typing indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
        J
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 0.15, 0.3].map((d, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">Jaxtina đang trả lời…</span>
        </div>
      </div>
    </div>
  )
}

// ── Chat-item type ──────────────────────────────────────────────────────────

type ChatItem =
  | { kind: 'message'; msg: TutorMessage }
  | { kind: 'quiz'; id: string; questions: QuizQuestion[]; done: boolean }

// ── Main component ──────────────────────────────────────────────────────────

export default function TutorSessionClient() {
  const router   = useRouter()
  const params   = useSearchParams()
  const supabase = createBrowserClient()

  // ── Session config ─────────────────────────────────────────────────────────
  const [level,     setLevel]     = useState<ProficiencyLevel>((params.get('level') as ProficiencyLevel) ?? 'Pre-Intermediate')
  const [skillArea, setSkillArea] = useState<SkillArea>((params.get('skill') as SkillArea) ?? 'Free Conversation')

  // ── Auth ───────────────────────────────────────────────────────────────────
  const [userId, setUserId] = useState<string>('')
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/login?next=/tutor')
      else setUserId(data.user.id)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Favourites ─────────────────────────────────────────────────────────────
  const { favourites, toggle: toggleFav, remove: removeFav, isFavourited } = useFavourites(userId)

  // ── Chat state ─────────────────────────────────────────────────────────────
  // chatItems holds both messages and quizzes in order
  const [chatItems,  setChatItems]  = useState<ChatItem[]>([])
  const [input,      setInput]      = useState(params.get('prefill') ?? '')
  const [isLoading,  setIsLoading]  = useState(false)
  const [feedback,   setFeedback]   = useState<TutorFeedback | null>(null)
  const [stats,      setStats]      = useState({ messages: 0, vocabCount: 0, accuracy: 0 })
  const [vocabList,  setVocabList]  = useState<string[]>([])
  const [isVocabOpen, setIsVocabOpen] = useState(false)
  const [skillToSwitch, setSkillToSwitch] = useState<SkillArea | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Track latest quiz's source message text so re-explain can reference it
  const lastTutorTextRef = useRef<string>('')

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  // ── Persistence ────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatItems.length === 0) return
    const sessionData = {
      level,
      skillArea,
      chatItems,
      feedback,
      stats,
      vocabList,
      lastTutorText: lastTutorTextRef.current,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('lastTutorSession', JSON.stringify(sessionData))
  }, [chatItems, level, skillArea, feedback, stats, vocabList])

  useEffect(() => {
    if (params.get('continue') === 'true') {
      const saved = localStorage.getItem('lastTutorSession')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setLevel(data.level)
          setSkillArea(data.skillArea)
          setChatItems(data.chatItems)
          setFeedback(data.feedback)
          setStats(data.stats)
          setVocabList(data.vocabList)
          lastTutorTextRef.current = data.lastTutorText || ''
          setTimeout(scrollToBottom, 200)
        } catch (e) {
          console.error("Failed to restore session", e)
        }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Derive plain messages for history context (hide quiz items)
  const messages = chatItems
    .filter((item): item is { kind: 'message'; msg: TutorMessage } => item.kind === 'message')
    .map(item => item.msg)

  // ── Send ───────────────────────────────────────────────────────────────────
  const send = useCallback(async (overrideText?: string, isAuto = false) => {
    const text = (overrideText ?? input).trim()
    if (!text || isLoading) return

    const userMsg: TutorMessage = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      isAutoGenerated: isAuto,
    }

    setChatItems(prev => [...prev, { kind: 'message', msg: userMsg }])
    setInput('')
    setIsLoading(true)
    setTimeout(scrollToBottom, 50)

    // Build history from plain messages
    const historyForApi = [...messages, userMsg]
      .slice(-8)
      .map(m => ({ sender: m.sender, text: m.text }))

    try {
      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyForApi,
          level,
          skillArea,
        }),
      })

      if (!res.ok) {
        const errBody = await res.text().catch(() => '(no body)')
        throw new Error(`API ${res.status}: ${errBody}`)
      }

      const data: TutorChatResponse = await res.json()

      const tutorMsg: TutorMessage = {
        id: crypto.randomUUID(),
        text: data.tutorResponse,
        vietnameseNote: data.vietnameseNote,
        sender: 'tutor',
        timestamp: new Date().toISOString(),
      }

      lastTutorTextRef.current = data.tutorResponse

      setChatItems(prev => {
        const next: ChatItem[] = [...prev, { kind: 'message', msg: tutorMsg }]
        // Append quiz if questions were returned
        if (data.quiz && data.quiz.length > 0) {
          next.push({
            kind: 'quiz',
            id: crypto.randomUUID(),
            questions: data.quiz,
            done: false,
          })
        }
        return next
      })

      setFeedback(data.feedback)
      if (data.newVocabulary && data.newVocabulary.length > 0) {
        setVocabList(prev => {
          const combined = [...prev, ...data.newVocabulary!];
          return Array.from(new Set(combined)); // Deduplicate
        })
      }
      setStats(prev => ({
        messages:   prev.messages + 1,
        vocabCount: prev.vocabCount + (data.newVocabulary?.length ?? 0),
        accuracy:   data.accuracyScore ?? prev.accuracy,
      }))
      setTimeout(scrollToBottom, 50)
    } catch (err) {
      console.error('[TutorSession] send error:', err)
      setChatItems(prev => [...prev, {
        kind: 'message',
        msg: {
          id: crypto.randomUUID(),
          text: "I'm having a little trouble — please try again!",
          vietnameseNote: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!',
          sender: 'tutor',
          timestamp: new Date().toISOString(),
        }
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, level, skillArea]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle quiz completion ─────────────────────────────────────────────────
  const handleQuizComplete = useCallback((quizId: string, passed: boolean) => {
    // Mark quiz done so it stops being interactive
    setChatItems(prev =>
      prev.map(item =>
        item.kind === 'quiz' && item.id === quizId ? { ...item, done: true } : item
      )
    )

    if (!passed) {
      // Auto-send a re-explain request
      const reExplainMsg = `Please explain this again with more examples and details. I didn't fully understand: "${lastTutorTextRef.current.slice(0, 120)}…"`
      setTimeout(() => send(reExplainMsg, true), 600)
    }
  }, [send])

  const handleLevelChange = (l: ProficiencyLevel) => {
    setLevel(l); setChatItems([]); setFeedback(null)
  }
  const handleSkillChange = (s: SkillArea) => {
    if (chatItems.length > 0) {
      setSkillToSwitch(s)
    } else {
      setSkillArea(s); setChatItems([]); setFeedback(null)
    }
  }

  const confirmSkillSwitch = () => {
    if (skillToSwitch) {
      setSkillArea(skillToSwitch)
      setChatItems([])
      setFeedback(null)
      setVocabList([])
      setStats({ messages: 0, vocabCount: 0, accuracy: 0 })
      setSkillToSwitch(null)
    }
  }

  const currentPrompts = STARTER_PROMPTS[skillArea]?.[level] ?? []

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── Chat column ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center flex-wrap gap-3 shadow-sm">
          <button
            onClick={() => router.push('/tutor')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <div className="w-px h-5 bg-gray-200" />

          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="font-bold text-gray-800 text-sm hidden sm:inline">Jaxtina AI Tutor</span>
            <span className="hidden sm:inline text-gray-300">·</span>
            <span className="hidden sm:inline text-xs text-gray-400">🇬🇧 + 🇻🇳 Bilingual</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={() => router.push('/tutor')}
              className="text-[10px] font-bold text-gray-500 hover:text-gray-800 border border-gray-300 rounded-lg px-2.5 py-1.5 hover:border-gray-500 transition mr-1 hidden sm:block"
            >
              🔄 New Session
            </button>
            <select
              value={level}
              onChange={e => handleLevelChange(e.target.value as ProficiencyLevel)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
            <select
              value={skillArea}
              onChange={e => handleSkillChange(e.target.value as SkillArea)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {SKILL_AREAS.map(s => <option key={s}>{s}</option>)}
            </select>
            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${LEVEL_COLORS[level]}`}>
              {level}
            </span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

          {/* Welcome / starter prompts */}
          {chatItems.length === 0 && (
            <div className="max-w-lg mx-auto">
              {/* Bilingual welcome card */}
              <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">
                  <div className="text-3xl mb-1">{SKILL_ICONS[skillArea]}</div>
                  <h2 className="font-bold text-base">{skillArea}</h2>
                  <p className="text-blue-100 text-xs mt-0.5">{level} level</p>
                </div>
                <div className="px-5 py-4 space-y-2">
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <span>🇬🇧</span>
                    <p>Hi! I&apos;m Jaxtina, your bilingual English tutor. Every reply includes English and Vietnamese — plus a short quiz to test your understanding!</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-red-800">
                    <span>🇻🇳</span>
                    <p>Xin chào bạn, mình là Jaxtina Tutor. Sau mỗi câu trả lời, mình sẽ đặt 3 câu hỏi trắc nghiệm để biết được bạn đã hiểu rõ nội dung hay chưa. Hãy bắt đầu đặt câu hỏi cho mình nhé!</p>
                  </div>
                </div>
              </div>

              {/* Starter prompts */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 text-center">
                💡 Chọn một câu hỏi để bắt đầu / Pick a starter
              </p>
              <div className="grid gap-2">
                {currentPrompts.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white border border-gray-100 hover:border-blue-300 hover:shadow-sm rounded-xl px-4 py-3 group transition-all cursor-pointer"
                    onClick={() => send(p)}
                  >
                    <span className="text-blue-400 text-xs font-bold shrink-0">{i + 1}</span>
                    <p className="flex-1 text-sm text-gray-700">{p}</p>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        toggleFav({ text: p, skill: skillArea, level, savedAt: new Date().toISOString() })
                      }}
                      title={isFavourited(p) ? 'Remove favourite' : 'Save favourite'}
                      className={`shrink-0 transition-colors ${isFavourited(p) ? 'text-yellow-400' : 'text-gray-300 group-hover:text-yellow-300'}`}
                    >
                      <Star className="h-4 w-4" fill={isFavourited(p) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat thread — messages + quizzes interleaved */}
          {chatItems.map(item => {
            if (item.kind === 'message') {
              const msg = item.msg
              return msg.sender === 'tutor' ? (
                <TutorBubble
                  key={msg.id}
                  msg={msg}
                  isStarred={isFavourited(msg.text)}
                  onStar={() => toggleFav({ text: msg.text, skill: skillArea, level, savedAt: new Date().toISOString() })}
                />
              ) : (
                <UserBubble
                  key={msg.id}
                  msg={msg}
                  isStarred={isFavourited(msg.text)}
                  onStar={() => toggleFav({ text: msg.text, skill: skillArea, level, savedAt: new Date().toISOString() })}
                />
              )
            }

            if (item.kind === 'quiz') {
              return (
                <QuizCard
                  key={item.id}
                  questions={item.questions}
                  onComplete={(passed) => handleQuizComplete(item.id, passed)}
                />
              )
            }

            return null
          })}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-200 px-4 pt-3 pb-2">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Type your message and press Enter to send"
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <button
              onClick={() => send()}
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between px-1 mt-1.5 overflow-hidden">
            <footer className="text-[10px] text-gray-400">
              <span className="hidden sm:inline">Jaxtina AI · 🇬🇧 English + 🇻🇳 Tiếng Việt · Quiz sau mỗi bài giảng</span>
              <span className="sm:hidden">🇬🇧 + 🇻🇳 · Quiz included</span>
            </footer>
            {skillArea === 'IELTS Writing' && (
              <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1 shrink-0 ml-2">
                <Type className="h-3 w-3" />
                {input.trim() === '' ? '0 words' : `${input.trim().split(/\s+/).length} words`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-y-auto hidden lg:flex">

        {/* Progress */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-blue-500" /> Tiến trình / Progress
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs text-nowrap">Messages sent</span>
              <span className="font-semibold text-gray-800 text-sm">{stats.messages}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs flex items-center gap-1">
                Vocab learned
                <button 
                  onClick={() => setIsVocabOpen(true)}
                  className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-bold hover:bg-blue-100 transition-colors uppercase"
                >
                  View
                </button>
              </span>
              <span className="font-semibold text-gray-800 text-sm">
                {vocabList.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs flex items-center">
                Accuracy Score
                <span title="Based on your comprehension quiz scores this session" className="cursor-help text-gray-400 ml-1">
                  <Info className="h-3 w-3" />
                </span>
              </span>
              <span className={`font-semibold text-sm ${stats.accuracy > 80 ? 'text-green-600' : stats.accuracy > 50 ? 'text-blue-600' : 'text-orange-600'}`}>
                {stats.accuracy}%
              </span>
            </div>
          </div>
          {stats.accuracy > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>Accuracy</span><span>{stats.accuracy}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.accuracy}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Saved favourites */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1.5">
            <Star className="h-4 w-4 text-yellow-400" /> Câu hỏi đã lưu
          </h3>
          {favourites.length === 0 ? (
            <p className="text-xs text-gray-400">Nhấn ⭐ để lưu câu hỏi yêu thích.</p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {favourites.map((f, i) => (
                <div key={i} className="flex items-start gap-1.5 group">
                  <button
                    onClick={() => setInput(f.text)}
                    className="flex-1 text-left text-xs text-gray-600 bg-yellow-50 border border-yellow-100 rounded-lg px-2 py-1.5 hover:bg-yellow-100 transition-colors leading-snug"
                  >
                    {f.text}
                  </button>
                  <button
                    onClick={() => removeFav(i)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-colors mt-1 shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Last feedback */}
        {feedback && (
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-purple-500" /> Nhận xét gần nhất
            </h3>
            <div className="space-y-2 text-xs">
              {feedback.positive?.map((p, i) => (
                <div key={i} className="bg-green-50 text-green-800 border border-green-100 rounded-lg px-3 py-2 leading-snug">
                  ✅ {p}
                </div>
              ))}
              {feedback.corrections?.map((c, i) => (
                <div key={i} className="bg-orange-50 text-orange-800 border border-orange-100 rounded-lg px-3 py-2 leading-snug">
                  ✏️ {c}
                </div>
              ))}
              {feedback.suggestions?.map((s, i) => (
                <div key={i} className="bg-blue-50 text-blue-800 border border-blue-100 rounded-lg px-3 py-2 leading-snug">
                  💡 {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill area switcher */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-indigo-500" /> Kỹ năng
          </h3>
          <div className="space-y-1.5">
            {SKILL_AREAS.map(s => (
              <div key={s}>
                <button
                  onClick={() => handleSkillChange(s)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                    s === skillArea
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span>{SKILL_ICONS[s]}</span>
                  {s}
                </button>
                {skillToSwitch === s && (
                  <div className="bg-orange-50 p-2 border-l-2 border-orange-400 mt-1 shadow-sm rounded-r-lg">
                    <p className="text-[10px] text-orange-700 font-bold mb-1 leading-tight">
                      Switching will start a new session. Progress will be lost.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={confirmSkillSwitch} className="text-[10px] font-bold text-orange-600 underline">Continue</button>
                      <button onClick={() => setSkillToSwitch(null)} className="text-[10px] text-gray-500">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Vocab drawer ─────────────────────────────────────────────────── */}
      {isVocabOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsVocabOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                  📚 Vocabulary This Session
                </h3>
                <button onClick={() => setIsVocabOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {vocabList.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium italic">No vocabulary extracted yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 border-t border-gray-100">
                    {vocabList.map((v, i) => (
                      <div key={i} className="py-3 px-2 hover:bg-blue-50/50 rounded-lg transition-colors group">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500 font-black text-xs mt-0.5">•</span>
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">
                            {v.includes('—') ? (
                              <>
                                <span className="text-blue-700">{v.split('—')[0]}</span>
                                <span className="mx-2 text-gray-300">—</span>
                                <span className="text-gray-500 text-xs italic">{v.split('—')[1]}</span>
                              </>
                            ) : v}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setIsVocabOpen(false)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
