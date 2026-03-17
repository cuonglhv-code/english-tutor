'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Send, BookOpen, Target, TrendingUp,
  MessageSquare, CheckCircle, BarChart3,
  Star, ArrowLeft, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { useFavourites } from '@/lib/tutor/useFavourites'
import {
  LEVELS, SKILL_AREAS, SKILL_ICONS, LEVEL_COLORS,
  INITIAL_GOALS, STARTER_PROMPTS,
} from '@/lib/tutor/prompts'
import type {
  ProficiencyLevel, SkillArea,
  TutorMessage, TutorFeedback,
  TutorChatResponse, LearningGoal,
} from '@/lib/tutor/types'

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
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </div>

          {/* Vietnamese section */}
          {msg.vietnameseNote && (
            <>
              <div className="border-t border-dashed border-gray-200 mx-3" />
              <div className="bg-gradient-to-r from-red-50 to-amber-50">
                <button
                  onClick={() => setViCollapsed(v => !v)}
                  className="w-full px-4 pt-2 pb-1 flex items-center gap-1.5 text-left"
                >
                  <span className="text-base leading-none">🇻🇳</span>
                  <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider flex-1">
                    Tiếng Việt
                  </span>
                  {viCollapsed
                    ? <ChevronDown className="h-3 w-3 text-red-400" />
                    : <ChevronUp className="h-3 w-3 text-red-400" />}
                </button>
                {!viCollapsed && (
                  <p className="px-4 pb-3 text-sm text-red-900 leading-relaxed">
                    {msg.vietnameseNote}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="px-4 py-1.5 flex items-center justify-between border-t border-gray-50">
            <p className="text-[10px] text-gray-400">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <button
              onClick={onStar}
              title={isStarred ? 'Remove from favourites' : 'Save to favourites'}
              className={`opacity-0 group-hover:opacity-100 transition-all ${
                isStarred ? 'opacity-100 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              <Star className="h-3.5 w-3.5" fill={isStarred ? 'currentColor' : 'none'} />
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
  return (
    <div className="flex justify-end group">
      <div className="max-w-sm lg:max-w-md">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-sm">
          <p className="text-sm leading-relaxed">{msg.text}</p>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[10px] text-blue-200">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <button
              onClick={onStar}
              title={isStarred ? 'Remove from favourites' : 'Save to favourites'}
              className={`opacity-0 group-hover:opacity-100 transition-all ${
                isStarred ? 'opacity-100 text-yellow-300' : 'text-blue-300 hover:text-yellow-300'
              }`}
            >
              <Star className="h-3.5 w-3.5" fill={isStarred ? 'currentColor' : 'none'} />
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
  const [messages,  setMessages]  = useState<TutorMessage[]>([])
  const [input,     setInput]     = useState(params.get('prefill') ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback,  setFeedback]  = useState<TutorFeedback | null>(null)
  const [goals,     setGoals]     = useState<LearningGoal[]>(INITIAL_GOALS[level])
  const [stats,     setStats]     = useState({ messages: 0, vocabCount: 0, accuracy: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  // ── Send ───────────────────────────────────────────────────────────────────
  const send = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || isLoading) return

    const userMsg: TutorMessage = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setTimeout(scrollToBottom, 50)

    try {
      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: [...messages, userMsg].slice(-8).map(m => ({ sender: m.sender, text: m.text })),
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

      setMessages(prev => [...prev, tutorMsg])
      setFeedback(data.feedback)
      setStats(prev => ({
        messages:   prev.messages + 1,
        vocabCount: prev.vocabCount + (data.newVocabulary?.length ?? 0),
        accuracy:   data.accuracyScore ?? prev.accuracy,
      }))
      setTimeout(scrollToBottom, 50)
    } catch (err) {
      console.error('[TutorSession] send error:', err)
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        text: "I'm having a little trouble — please try again!",
        vietnameseNote: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!',
        sender: 'tutor',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, level, skillArea])

  const toggleGoal = (id: number) =>
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, completed: !g.completed, progress: g.completed ? g.progress : 100 } : g
    ))

  const handleLevelChange = (l: ProficiencyLevel) => {
    setLevel(l); setGoals(INITIAL_GOALS[l]); setMessages([]); setFeedback(null)
  }
  const handleSkillChange = (s: SkillArea) => {
    setSkillArea(s); setMessages([]); setFeedback(null)
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
          {messages.length === 0 && (
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
                    <p>Hi! I'm Jaxtina, your bilingual English tutor. Every reply will include English and Vietnamese so you can understand clearly.</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-red-800">
                    <span>🇻🇳</span>
                    <p>Xin chào! Mình là Jaxtina. Mỗi câu trả lời đều có cả tiếng Anh lẫn tiếng Việt để bạn dễ hiểu hơn. Bắt đầu thôi!</p>
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

          {/* Message thread */}
          {messages.map(msg =>
            msg.sender === 'tutor' ? (
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
          )}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Type in English… nhấn Enter để gửi"
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <button
              onClick={() => send()}
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-1.5">
            Jaxtina AI · 🇬🇧 English + 🇻🇳 Tiếng Việt · Phản hồi song ngữ
          </p>
        </div>
      </div>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-y-auto hidden lg:flex">

        {/* Progress */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-blue-500" /> Tiến trình / Progress
          </h3>
          <div className="space-y-2 text-sm">
            {([
              ['Messages sent', stats.messages],
              ['Vocab learned', stats.vocabCount],
              ['Accuracy', `${stats.accuracy}%`],
            ] as const).map(([label, val]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">{label}</span>
                <span className="font-semibold text-gray-800 text-sm">{val}</span>
              </div>
            ))}
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

        {/* Learning goals */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1.5">
            <Target className="h-4 w-4 text-green-500" /> Mục tiêu học tập
          </h3>
          <div className="space-y-3">
            {goals.map(g => (
              <div key={g.id}>
                <div className="flex items-start gap-2">
                  <button onClick={() => toggleGoal(g.id)} className="mt-0.5 shrink-0">
                    {g.completed
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />}
                  </button>
                  <span className={`text-xs leading-snug ${g.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {g.text}
                  </span>
                </div>
                <div className="ml-6 mt-1.5">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-green-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              <button
                key={s}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
