'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Send, BookOpen, Target, TrendingUp,
  MessageSquare, CheckCircle, BarChart3,
  Star, ArrowLeft, Trash2,
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

export default function TutorSessionClient() {
  const router      = useRouter()
  const params      = useSearchParams()
  const supabase    = createBrowserClient()

  // ── Session config from URL params ────────────────────────────────────────
  const [level,     setLevel]     = useState<ProficiencyLevel>((params.get('level') as ProficiencyLevel) ?? 'Pre-Intermediate')
  const [skillArea, setSkillArea] = useState<SkillArea>((params.get('skill') as SkillArea) ?? 'Free Conversation')
  const [language,  setLanguage]  = useState<'en' | 'vi'>('en')

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
  const [messages,     setMessages]     = useState<TutorMessage[]>([])
  const [input,        setInput]        = useState(params.get('prefill') ?? '')
  const [isLoading,    setIsLoading]    = useState(false)
  const [feedback,     setFeedback]     = useState<TutorFeedback | null>(null)
  const [goals,        setGoals]        = useState<LearningGoal[]>(INITIAL_GOALS[level])
  const [showVI,       setShowVI]       = useState<Set<string>>(new Set())
  const [stats,        setStats]        = useState({ messages: 0, vocabCount: 0, accuracy: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  // ── Send message ───────────────────────────────────────────────────────────
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
          language,
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
        sender: 'tutor',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, level, skillArea, language])

  const toggleVI = (id: string) =>
    setShowVI(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const toggleGoal = (id: number) =>
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, completed: !g.completed, progress: g.completed ? g.progress : 100 } : g
    ))

  const handleLevelChange = (l: ProficiencyLevel) => {
    setLevel(l)
    setGoals(INITIAL_GOALS[l])
    setMessages([])
    setFeedback(null)
  }

  const handleSkillChange = (s: SkillArea) => {
    setSkillArea(s)
    setMessages([])
    setFeedback(null)
  }

  const currentPrompts = STARTER_PROMPTS[skillArea]?.[level] ?? []

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── Chat area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center flex-wrap gap-3">
          <button
            onClick={() => router.push('/tutor')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-gray-800 text-sm hidden sm:inline">Jaxtina English Tutor</span>

          <select
            value={level}
            onChange={e => handleLevelChange(e.target.value as ProficiencyLevel)}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>

          <select
            value={skillArea}
            onChange={e => handleSkillChange(e.target.value as SkillArea)}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {SKILL_AREAS.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* EN / VI toggle */}
          <button
            onClick={() => setLanguage(l => l === 'en' ? 'vi' : 'en')}
            className={`px-2 py-1 text-xs font-semibold rounded-md border transition-colors ${
              language === 'vi'
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-gray-50 border-gray-300 text-gray-600'
            }`}
          >
            {language === 'en' ? 'EN' : 'VI'}
          </button>

          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${LEVEL_COLORS[level]}`}>
            {level}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="py-4 max-w-lg mx-auto">
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">{SKILL_ICONS[skillArea]}</div>
                <h2 className="text-base font-semibold text-gray-700 mb-1">
                  {skillArea} · {level}
                </h2>
                <p className="text-gray-400 text-xs">
                  Click a tutor reply to see its Vietnamese note. Star prompts to save them.
                </p>
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 text-center">
                💡 Starter prompts
              </p>
              <div className="grid gap-2">
                {currentPrompts.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white border border-blue-100 hover:border-blue-300 rounded-xl px-3 py-2.5 shadow-sm group transition-colors"
                  >
                    <button onClick={() => setInput(p)} className="flex-1 text-left text-sm text-gray-700">
                      {p}
                    </button>
                    <button
                      onClick={() => toggleFav({ text: p, skill: skillArea, level, savedAt: new Date().toISOString() })}
                      title={isFavourited(p) ? 'Remove favourite' : 'Save favourite'}
                      className={`shrink-0 transition-colors ${
                        isFavourited(p) ? 'text-yellow-400' : 'text-gray-300 group-hover:text-yellow-300'
                      }`}
                    >
                      <Star className="h-4 w-4" fill={isFavourited(p) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div className="flex items-end gap-1.5">
                {msg.sender === 'user' && (
                  <button
                    onClick={() => toggleFav({ text: msg.text, skill: skillArea, level, savedAt: new Date().toISOString() })}
                    className={`mb-1 opacity-0 group-hover:opacity-100 transition-colors ${
                      isFavourited(msg.text) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" fill={isFavourited(msg.text) ? 'currentColor' : 'none'} />
                  </button>
                )}
                <div
                  onClick={msg.sender === 'tutor' ? () => toggleVI(msg.id) : undefined}
                  className={`max-w-sm lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm cursor-pointer hover:border-blue-300 transition-colors'
                    }`}
                >
                  <p>{msg.text}</p>
                  {msg.sender === 'tutor' && showVI.has(msg.id) && msg.vietnameseNote && (
                    <p className="mt-2 pt-2 border-t border-gray-100 text-xs text-blue-600 italic">
                      🇻🇳 {msg.vietnameseNote}
                    </p>
                  )}
                  <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center space-x-2">
                {[0, 0.15, 0.3].map((d, i) => (
                  <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                ))}
                <span className="text-xs text-gray-400 ml-1">Tutor is thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex space-x-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type in English… (Enter to send)"
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={() => send()}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">

        {/* Stats */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> Progress
          </h3>
          <div className="space-y-2 text-sm">
            {([['Messages sent', stats.messages], ['New vocab learned', stats.vocabCount], ['Accuracy', `${stats.accuracy}%`]] as const).map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-gray-800">{val}</span>
              </div>
            ))}
          </div>
          {stats.accuracy > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${stats.accuracy}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Saved favourites (quick access) */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" /> Saved Prompts
          </h3>
          {favourites.length === 0 ? (
            <p className="text-xs text-gray-400">Star a prompt to save it.</p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {favourites.map((f, i) => (
                <div key={i} className="flex items-start gap-1.5 group">
                  <button
                    onClick={() => setInput(f.text)}
                    className="flex-1 text-left text-xs text-gray-600 bg-yellow-50 rounded-lg px-2 py-1.5 hover:bg-yellow-100 transition-colors leading-snug"
                  >
                    {f.text}
                  </button>
                  <button
                    onClick={() => removeFav(i)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-colors mt-1"
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
          <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1">
            <Target className="h-4 w-4" /> Learning Goals
          </h3>
          <div className="space-y-3">
            {goals.map(g => (
              <div key={g.id} className="text-sm">
                <div className="flex items-start gap-2">
                  <button onClick={() => toggleGoal(g.id)} className="mt-0.5 shrink-0">
                    {g.completed
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />}
                  </button>
                  <span className={g.completed ? 'line-through text-gray-400 text-xs' : 'text-gray-700 text-xs'}>
                    {g.text}
                  </span>
                </div>
                <div className="ml-6 mt-1">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last feedback */}
        {feedback && (
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1">
              <MessageSquare className="h-4 w-4" /> Last Feedback
            </h3>
            <div className="space-y-2 text-xs">
              {feedback.positive?.map((p, i) => (
                <div key={i} className="bg-green-50 text-green-700 rounded-lg px-3 py-2">✅ {p}</div>
              ))}
              {feedback.corrections?.map((c, i) => (
                <div key={i} className="bg-orange-50 text-orange-700 rounded-lg px-3 py-2">✏️ {c}</div>
              ))}
              {feedback.suggestions?.map((s, i) => (
                <div key={i} className="bg-blue-50 text-blue-700 rounded-lg px-3 py-2">💡 {s}</div>
              ))}
            </div>
          </div>
        )}

        {/* Skill area bar chart */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1">
            <BarChart3 className="h-4 w-4" /> Skill Areas
          </h3>
          <div className="space-y-2">
            {SKILL_AREAS.map(s => (
              <div key={s} className="flex items-center gap-2 text-xs">
                <span className={`w-32 truncate ${s === skillArea ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {s}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${s === skillArea ? 'bg-blue-500' : 'bg-gray-200'}`}
                    style={{ width: s === skillArea ? '70%' : '20%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

