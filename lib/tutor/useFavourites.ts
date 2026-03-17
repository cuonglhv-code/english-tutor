// lib/tutor/useFavourites.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { FavouritePrompt } from './types'

const TABLE = 'tutor_favourite_prompts'

interface UseFavouritesReturn {
  favourites: FavouritePrompt[]
  loading: boolean
  toggle: (prompt: FavouritePrompt) => Promise<void>
  remove: (index: number) => Promise<void>
  isFavourited: (text: string) => boolean
}

/**
 * Persists favourite prompts in Supabase.
 *
 * Supabase table (run once):
 *
 *   create table tutor_favourite_prompts (
 *     id         uuid primary key default gen_random_uuid(),
 *     user_id    uuid not null references auth.users(id) on delete cascade,
 *     text       text not null,
 *     skill      text not null,
 *     level      text not null,
 *     saved_at   timestamptz not null default now(),
 *     unique (user_id, text)            -- prevent duplicates
 *   );
 *
 *   -- RLS
 *   alter table tutor_favourite_prompts enable row level security;
 *   create policy "Users manage own favourites"
 *     on tutor_favourite_prompts
 *     for all
 *     using  (auth.uid() = user_id)
 *     with check (auth.uid() = user_id);
 */
export function useFavourites(userId: string): UseFavouritesReturn {
  const supabase = createBrowserClient()
  const [favourites, setFavourites] = useState<FavouritePrompt[]>([])
  const [loading, setLoading] = useState(true)

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    const fetch = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLE)
        .select('text, skill, level, saved_at')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })

      if (error) {
        console.error('[useFavourites] fetch error:', error.message)
      } else {
        setFavourites(
          (data ?? []).map((r) => ({
            text: r.text,
            skill: r.skill,
            level: r.level,
            savedAt: r.saved_at,
          })),
        )
      }
      setLoading(false)
    }

    fetch()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Toggle (add / remove) ──────────────────────────────────────────────────
  const toggle = useCallback(
    async (prompt: FavouritePrompt) => {
      const exists = favourites.some((f) => f.text === prompt.text)

      if (exists) {
        // Optimistic remove
        setFavourites((prev) => prev.filter((f) => f.text !== prompt.text))
        const { error } = await supabase
          .from(TABLE)
          .delete()
          .eq('user_id', userId)
          .eq('text', prompt.text)
        if (error) {
          console.error('[useFavourites] delete error:', error.message)
          // Roll back
          setFavourites((prev) => [prompt, ...prev])
        }
      } else {
        const newFav: FavouritePrompt = { ...prompt, savedAt: new Date().toISOString() }
        // Optimistic add
        setFavourites((prev) => [newFav, ...prev])
        const { error } = await supabase.from(TABLE).insert({
          user_id: userId,
          text: prompt.text,
          skill: prompt.skill,
          level: prompt.level,
          saved_at: newFav.savedAt,
        })
        if (error) {
          console.error('[useFavourites] insert error:', error.message)
          // Roll back
          setFavourites((prev) => prev.filter((f) => f.text !== prompt.text))
        }
      }
    },
    [favourites, userId, supabase],
  )

  // ── Remove by index (for the delete button in the UI) ─────────────────────
  const remove = useCallback(
    async (index: number) => {
      const target = favourites[index]
      if (!target) return
      await toggle(target)
    },
    [favourites, toggle],
  )

  const isFavourited = useCallback(
    (text: string) => favourites.some((f) => f.text === text),
    [favourites],
  )

  return { favourites, loading, toggle, remove, isFavourited }
}
