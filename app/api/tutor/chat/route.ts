// app/api/tutor/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { buildSystemPrompt } from '@/lib/tutor/prompts'
import type { TutorChatRequest, TutorChatResponse } from '@/lib/tutor/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse body ──────────────────────────────────────────────────────────
  let body: TutorChatRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { message, history = [], level, skillArea, language = 'en' } = body

  if (!message?.trim() || !level || !skillArea) {
    return NextResponse.json(
      { error: 'message, level and skillArea are required' },
      { status: 422 },
    )
  }

  // ── 3. Build conversation for Claude ──────────────────────────────────────
  // Keep last 8 turns (4 exchanges) so the context window stays small for Haiku
  const recentHistory = history.slice(-8).map((m) => ({
    role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
    content: m.text,
  }))

  const systemPrompt = buildSystemPrompt(level, skillArea, language)

  // ── 4. Call Claude Haiku ───────────────────────────────────────────────────
  let raw: string
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...recentHistory,
        { role: 'user', content: message },
      ],
    })
    raw = response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (err) {
    console.error('[tutor/chat] Anthropic error:', err)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
  }

  // ── 5. Parse JSON response ─────────────────────────────────────────────────
  let parsed: TutorChatResponse
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch {
    console.error('[tutor/chat] Failed to parse Claude response:', raw)
    return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 })
  }

  // ── 6. Log activity to Supabase (fire-and-forget) ─────────────────────────
  supabase
    .from('user_activity_log')
    .insert({
      user_id: user.id,
      activity_type: 'tutor_message',
      metadata: { level, skillArea, accuracyScore: parsed.accuracyScore },
    })
    .then(({ error }) => {
      if (error) console.warn('[tutor/chat] activity_log insert failed:', error.message)
    })

  return NextResponse.json(parsed)
}
