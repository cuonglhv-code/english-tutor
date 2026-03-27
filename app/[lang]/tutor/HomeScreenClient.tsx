// app/tutor/HomeScreenClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Trash2 } from 'lucide-react'
import { useFavourites } from '@/lib/tutor/useFavourites'
import {
  LEVELS,
  SKILL_AREAS,
  SKILL_ICONS,
  LEVEL_COLORS,
  STARTER_PROMPTS,
} from '@/lib/tutor/prompts'
import type { ProficiencyLevel, SkillArea } from '@/lib/tutor/types'

const LEVEL_TOOLTIPS: Record<string, string> = {
  'Beginner': "Can understand basic words and simple phrases",
  'Elementary': "Can handle very short, simple conversations",
  'Pre-Intermediate': "Can discuss familiar everyday topics",
  'Intermediate': "Can deal with most situations while travelling",
  'Upper-Intermediate': "Can interact with a degree of fluency and spontaneity",
  'Advanced': "Can express ideas fluently and spontaneously",
}

const startersBySkill: Record<string, string[]> = {
  'Free Conversation': [
    '"What are the pros and cons of living in a big city?"',
    '"Tell me about a memorable trip you took."',
    '"How has your life changed in the last few years?"',
  ],
  'Grammar Practice': [
    '"Explain the difference between past simple and present perfect."',
    '"When should I use \'which\' vs \'that\'?"',
    '"Can you give me exercises on conditionals?"',
  ],
  'Vocabulary Building': [
    '"Teach me vocabulary related to the environment."',
    '"What are common collocations with the word \'make\'?"',
    '"Give me 5 advanced synonyms for \'important\'."',
  ],
  'IELTS Writing': [
    '"How do I write a strong thesis statement for Task 2?"',
    '"Check my introduction for this IELTS essay topic."',
    '"What are the differences between Task 1 and Task 2?"',
  ],
  'IELTS Speaking': [
    '"Let\'s practise Part 2: Describe a place you have visited."',
    '"How should I extend my answers in Speaking Part 1?"',
    '"Give me feedback on this Speaking Part 3 answer."',
  ],
  'Pronunciation': [
    '"How do I pronounce words ending in -ed correctly?"',
    '"What is the difference between /ɪ/ and /iː/ sounds?"',
    '"Practise the th- sound with me."',
  ],
}

interface Props {
  userId: string
}

export default function HomeScreenClient({ userId }: Props) {
  const router = useRouter()
  const { favourites, loading: favsLoading, remove, isFavourited, toggle } = useFavourites(userId)

  const [level, setLevel] = useState<ProficiencyLevel>('Pre-Intermediate')
  const [skill, setSkill] = useState<SkillArea>('Free Conversation')
  const [tab, setTab] = useState<'start' | 'favourites'>('start')
  const [lastSession, setLastSession] = useState<any>(null)

  useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lastTutorSession')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          const messages = data.chatItems?.filter((c: any) => c.kind === 'message') || []
          setLastSession({ ...data, messageCount: messages.length })
        } catch (e) {}
      }
    }
    return null
  })

  const handleStart = (prefill = '') => {
    const params = new URLSearchParams({ level, skill })
    if (prefill) params.set('prefill', prefill.replace(/^"|"$/g, ''))
    router.push(`/tutor/session?${params.toString()}`)
  }

  const handleUseFavourite = (f: { text: string; skill: string; level: string }) => {
    const params = new URLSearchParams({
      level: f.level,
      skill: f.skill,
      prefill: f.text,
    })
    router.push(`/tutor/session?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-start py-16 px-4">
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-12 space-y-4">
        <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mb-4 shadow-lg transform -rotate-6 hover:rotate-0 transition-all duration-500 ease-out group">
          <span className="text-4xl font-black text-white italic group-hover:scale-110 transition-transform">J.</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-display mb-1">
            English Tutor
          </h1>
          <p className="text-slate-700 font-medium text-lg max-w-md mx-auto leading-relaxed">
            AI-powered academic practice for Vietnamese IELTS candidates
          </p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-white/80 backdrop-blur-md rounded-2xl p-1.5 shadow-sm border border-slate-200/60 mb-10">
        <button
          onClick={() => setTab('start')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            tab === 'start' ? 'gradient-primary text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Start Session
        </button>
        <button
          onClick={() => setTab('favourites')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            tab === 'favourites' ? 'gradient-primary text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Star className="h-3.5 w-3.5" />
          Favourites
          {favourites.length > 0 && (
            <span className={`ml-1 bg-white ${tab === 'favourites' ? 'text-primary' : 'text-primary/40'} text-[10px] font-black rounded-full px-2 py-0.5`}>
              {favourites.length}
            </span>
          )}
        </button>
      </div>

      {lastSession && tab === 'start' && (
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 mb-8 flex items-center justify-between shadow-[0_18px_40px_rgba(15,23,42,0.08)] animate-in slide-in-from-top duration-500 ease-out">
          <div className="space-y-1">
            <p className="font-black text-slate-900 text-sm uppercase tracking-wider">Continue last session?</p>
            <p className="text-xs text-slate-600 font-medium italic">
              {lastSession.skillArea} · {lastSession.level} · {lastSession.messageCount} messages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/tutor/session?continue=true')} 
              className="gradient-primary text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:scale-105 transition-transform active:scale-95"
            >
              Continue
            </button>
            <button 
              onClick={() => { localStorage.removeItem('lastTutorSession'); setLastSession(null) }} 
              className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest hover:text-secondary transition-colors"
            >
              Start fresh
            </button>
          </div>
        </div>
      )}

      {tab === 'start' ? (
        <div className="bg-white rounded-[3rem] p-8 w-full max-w-md shadow-[0_18px_40px_rgba(15,23,42,0.08)] border border-slate-200">
          <h2 className="font-black text-slate-900 text-xl font-display tracking-tight mb-6">Choose your session</h2>

          {/* Level picker */}
          <div className="mb-6">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">
              Your Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  title={LEVEL_TOOLTIPS[l]}
                  className={`px-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    level === l
                      ? 'gradient-primary text-white shadow-md border-transparent'
                      : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Skill area picker */}
          <div className="mb-8">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">
              Skill Area
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SKILL_AREAS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSkill(s)}
                  className={`px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center gap-3 border ${
                    skill === s
                      ? 'gradient-primary text-white shadow-md border-transparent'
                      : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-xl ${skill === s ? '' : 'filter grayscale contrast-125 brightness-110 opacity-70'}`}>
                    {SKILL_ICONS[s]}
                  </span>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Starter prompts preview */}
          <div className="mb-8">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
              Sample starters
            </p>
            <div className="space-y-2">
              {(startersBySkill[skill] ?? []).map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 group cursor-pointer hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
                  onClick={() => handleStart(p)}
                >
                  <p className="flex-1 text-xs text-slate-700 font-medium truncate italic leading-relaxed">
                    {p}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle({ text: p, skill, level, savedAt: new Date().toISOString() })
                    }}
                    title={isFavourited(p) ? 'Remove from favourites' : 'Save to favourites'}
                    className={`shrink-0 transition-colors ${
                      isFavourited(p)
                        ? 'text-primary'
                        : 'text-on-surface-variant/20 group-hover:text-primary/40'
                    }`}
                  >
                    <Star className="h-4 w-4" fill={isFavourited(p) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleStart()}
            className="w-full py-4 gradient-secondary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98] border-none"
          >
            Start Practising →
          </button>
          <p className="text-center text-[10px] text-on-surface-variant/40 mt-4 font-black uppercase tracking-widest">
            ⏱️ Average session: 15 minutes
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-8 w-full max-w-md shadow-[0_18px_40px_rgba(15,23,42,0.08)] border border-slate-200">
          <h2 className="font-black text-slate-900 text-xl font-display tracking-tight mb-2">Saved Favourites</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 leading-relaxed">
            Click <strong>Use</strong> to jump into session
          </p>

          {favsLoading ? (
            <div className="text-center py-12 text-on-surface-variant/40 text-xs font-black uppercase tracking-widest animate-pulse">Synchronizing…</div>
          ) : favourites.length === 0 ? (
            <div className="text-center py-20">
              <Star className="h-16 w-16 mx-auto mb-6 text-on-surface-variant/10" />
              <p className="font-black text-on-surface text-lg font-display uppercase tracking-tight">No saved questions</p>
              <p className="text-xs mt-2 px-6 text-on-surface-variant/40 font-medium leading-relaxed italic">
                During a session, tap the ★ icon highlight to preserve your best prompts.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favourites.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5">
                      {f.skill} · {f.level}
                    </p>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic">{`"${f.text}"`}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleUseFavourite(f)}
                      className="text-[10px] px-3 py-1.5 gradient-primary text-white rounded-lg font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-transform"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => remove(i)}
                      className="text-[10px] px-3 py-1.5 bg-white text-on-surface-variant/40 rounded-lg hover:text-secondary hover:bg-secondary/5 transition-colors font-black uppercase tracking-widest"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
