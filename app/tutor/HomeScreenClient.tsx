// app/tutor/HomeScreenClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Star, Trash2 } from 'lucide-react'
import { useFavourites } from '@/lib/tutor/useFavourites'
import {
  LEVELS,
  SKILL_AREAS,
  SKILL_ICONS,
  LEVEL_COLORS,
  STARTER_PROMPTS,
} from '@/lib/tutor/prompts'
import type { ProficiencyLevel, SkillArea } from '@/lib/tutor/types'

interface Props {
  userId: string
}

export default function HomeScreenClient({ userId }: Props) {
  const router = useRouter()
  const { favourites, loading: favsLoading, remove, isFavourited, toggle } = useFavourites(userId)

  const [level, setLevel] = useState<ProficiencyLevel>('Pre-Intermediate')
  const [skill, setSkill] = useState<SkillArea>('Free Conversation')
  const [tab, setTab] = useState<'start' | 'favourites'>('start')

  const handleStart = (prefill = '') => {
    const params = new URLSearchParams({ level, skill })
    if (prefill) params.set('prefill', prefill)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-start py-10 px-4">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🇬🇧</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Jaxtina English Tutor</h1>
        <p className="text-gray-500 text-sm">AI-powered English practice for Vietnamese learners</p>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-white rounded-full p-1 shadow mb-6">
        <button
          onClick={() => setTab('start')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === 'start' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Start Session
        </button>
        <button
          onClick={() => setTab('favourites')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
            tab === 'favourites' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Star className="h-3.5 w-3.5" />
          Favourites
          {favourites.length > 0 && (
            <span className="ml-1 bg-yellow-400 text-white text-xs rounded-full px-1.5">
              {favourites.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'start' ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
          <h2 className="font-semibold text-gray-700 mb-4">Choose your session</h2>

          {/* Level picker */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
              Your Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                    level === l
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Skill area picker */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
              Skill Area
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SKILL_AREAS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSkill(s)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all text-left flex items-center gap-2 ${
                    skill === s
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  <span>{SKILL_ICONS[s]}</span>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Starter prompts preview */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Sample starters
            </p>
            <div className="space-y-1.5">
              {(STARTER_PROMPTS[skill]?.[level] ?? []).map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 group"
                >
                  <p className="flex-1 text-xs text-gray-500 truncate">
                    &quot;{p}&quot;
                  </p>
                  <button
                    onClick={() => toggle({ text: p, skill, level, savedAt: new Date().toISOString() })}
                    title={isFavourited(p) ? 'Remove from favourites' : 'Save to favourites'}
                    className={`shrink-0 transition-colors ${
                      isFavourited(p)
                        ? 'text-yellow-400'
                        : 'text-gray-300 group-hover:text-yellow-300'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" fill={isFavourited(p) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleStart()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Practising →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
          <h2 className="font-semibold text-gray-700 mb-1">Saved Favourite Prompts</h2>
          <p className="text-xs text-gray-400 mb-4">
            Click <strong>Use</strong> to jump straight into that session.
          </p>

          {favsLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
          ) : favourites.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No favourites yet.</p>
              <p className="text-xs mt-1">Star prompts during a session to save them here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {favourites.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-yellow-700 mb-0.5">
                      {f.skill} · {f.level}
                    </p>
                    <p className="text-sm text-gray-700 leading-snug">{f.text}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleUseFavourite(f)}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => remove(i)}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="h-3 w-3" />
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
