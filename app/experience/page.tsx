'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { Badge } from "@/components/ui/badge"

const GUEST_KEY = 'jaxtina_guest'

export default function ExperiencePage() {
  const [guest, setGuest] = useState<{ name: string; email: string; phone: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  useEffect(() => {
    const init = async () => {
      const supabase = createBrowserClient()
      // Check if already logged in
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setGuest({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email ?? '',
          phone: ''
        })
        setIsLoading(false)
        return
      }
      // Check localStorage for returning guest
      const stored = localStorage.getItem(GUEST_KEY)
      if (stored) {
        try { setGuest(JSON.parse(stored)) } catch { }
      }
      setIsLoading(false)
    }
    init()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }
    setSubmitting(true)

    // CRITICAL: unlock UI immediately before API call
    localStorage.setItem(GUEST_KEY, JSON.stringify(form))
    setGuest(form)

    // Fire-and-forget API save
    fetch('/api/guest-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(console.error)

    setSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── GATE VIEW ──────────────────────────────────────────────────────────────
  if (!guest) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
          {/* Brand/Value Prop Side */}
          <div className="space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-black text-2xl italic shadow-lg">J.</div>
              <span className="text-on-surface font-black text-2xl font-display tracking-tight">Jaxtina.</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black text-on-surface leading-[1.05] tracking-tighter font-display">
                Master IELTS with <span className="text-primary italic">Clinical Accuracy.</span>
              </h1>
              <p className="text-xl text-on-surface-variant font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                Experience the world&apos;s most advanced IELTS preparation ecosystem. Start your free trial today.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface shadow-sm" />
                 ))}
              </div>
              <p className="text-xs font-black text-on-surface-variant/40 uppercase tracking-widest">
                Trusted by 12,000+ candidates
              </p>
            </div>
          </div>

          {/* Gate Card */}
          <div className="bg-white rounded-[32px] p-10 shadow-stitched border-none">
            <h2 className="text-2xl font-black text-on-surface font-display tracking-tight mb-2">Begin Experience</h2>
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-8 leading-relaxed">
              Unlock access to AI tutors or <Link href="/login" className="text-primary hover:underline decoration-2 underline-offset-4">Sign in</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full px-6 py-4 rounded-2xl bg-surface-container-low text-on-surface border-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/30 transition-all font-medium"
              />
              <input
                type="email"
                placeholder="Academic Email *"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="w-full px-6 py-4 rounded-2xl bg-surface-container-low text-on-surface border-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/30 transition-all font-medium"
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
                className="w-full px-6 py-4 rounded-2xl bg-surface-container-low text-on-surface border-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/30 transition-all font-medium"
              />

              {error && <p className="text-secondary text-[10px] font-black uppercase tracking-widest px-2">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 gradient-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
              >
                {submitting ? 'Authenticating...' : 'Enter Hub →'}
              </button>
            </form>

            <p className="text-[9px] text-on-surface-variant/20 uppercase font-black text-center mt-8 tracking-widest leading-relaxed">
              Your data is encrypted using institutional security standards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── HUB VIEW (after gate passed) ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface px-6 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Welcome header */}
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-5 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
            Welcome back, {guest.name.split(' ').pop()}!
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black text-on-surface font-display tracking-tight leading-none">
            Choose Your <span className="text-primary italic">Mode.</span>
          </h1>
          <p className="text-on-surface-variant/60 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            Practice with elite AI tutors, benchmark your level with scientific assessments, or master vocabulary with SRS logic.
          </p>
        </div>

        {/* Three experience cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* AI Tutor Card */}
          <Link href="/tutor" className="group block">
            <div className="bg-white rounded-[32px] p-10 h-full shadow-stitched border-none hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-[20px] bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-2xl font-black text-on-surface font-display tracking-tight">AI Tutor</h2>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <p className="text-on-surface-variant/60 text-sm font-medium leading-relaxed italic">
                  Instant academic feedback, grammar precision, and personalized study paths.
                </p>
                <div className="pt-6 space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> 98% Correlation Score
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Real-time Recovery
                  </div>
                </div>
              </div>

              <div className="mt-10 px-6 py-3 bg-surface rounded-xl text-primary text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                Start Masterclass
              </div>
            </div>
          </Link>

          {/* Placement Card */}
          <Link href="/placement" className="group block">
            <div className="bg-white rounded-[32px] p-10 h-full shadow-stitched border-none hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-[20px] bg-secondary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm">
                <Award className="w-8 h-8 text-secondary" />
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-2xl font-black text-on-surface font-display tracking-tight">Assessment</h2>
                </div>
                <p className="text-on-surface-variant/60 text-sm font-medium leading-relaxed italic">
                  Scientific diagnostic to pinpoint your current band score and curriculum gaps.
                </p>
                <div className="pt-6 space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-secondary" /> CEFR Integrated
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-secondary" /> Skill Radar Chart
                  </div>
                </div>
              </div>

              <div className="mt-10 px-6 py-3 bg-surface rounded-xl text-secondary text-[10px] font-black uppercase tracking-widest group-hover:bg-secondary group-hover:text-white transition-all shadow-sm">
                Begin Assessment
              </div>
            </div>
          </Link>

          {/* Vocabulary Challenge Card */}
          <Link href="/vocabulary-challenge" className="group block h-full">
            <div className="bg-white rounded-[32px] p-10 h-full shadow-stitched border-none hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-[20px] bg-on-surface-variant/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm text-on-surface-variant/40">
                <TrendingUp className="w-8 h-8" />
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-2xl font-black text-on-surface font-display tracking-tight">Vocabulary</h2>
                </div>
                <p className="text-on-surface-variant/60 text-sm font-medium leading-relaxed italic">
                  Master academic idioms using SRS logic and intelligent repetition algorithms.
                </p>
                <div className="pt-6 space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-on-surface-variant/20" /> Spaced Repetition
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-on-surface-variant/20" /> 4 Study Modes
                  </div>
                </div>
              </div>

              <div className="mt-10 px-6 py-3 bg-surface rounded-xl text-on-surface-variant/60 text-[10px] font-black uppercase tracking-widest group-hover:bg-on-surface-variant group-hover:text-white transition-all shadow-sm">
                Train Memory
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Sub-components used
function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Award({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15l-2 5l2 2l2-2l-2-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15V3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8z" />
    </svg>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" />
    </svg>
  );
}
