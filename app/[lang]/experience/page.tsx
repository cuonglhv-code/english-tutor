'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { Badge } from "@/components/ui/badge"
import { useTranslation } from '@/lib/i18n/useTranslation'
import { 
  Layout, Award, TrendingUp, CheckCircle2,
  Bot, Flame, Trophy, Globe, Crown, Zap, Activity
} from 'lucide-react'

const GUEST_KEY = 'jaxtina_guest'

export default function ExperiencePage() {
  const { dict, lang } = useTranslation()
  const [guest, setGuest] = useState<{ name: string; email: string; phone: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [quizCount, setQuizCount] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const supabase = createBrowserClient()
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
      const stored = localStorage.getItem(GUEST_KEY)
      if (stored) {
        try { setGuest(JSON.parse(stored)) } catch { }
      }
      setIsLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    const fetchCount = async () => {
      const supabase = createBrowserClient()
      const { count } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)
      setQuizCount(count)
    }
    fetchCount()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError(lang === 'vi' ? 'Vui lòng điền đầy đủ thông tin.' : 'Please fill in all fields.')
      return
    }
    setSubmitting(true)
    localStorage.setItem(GUEST_KEY, JSON.stringify(form))
    setGuest(form)
    fetch('/api/guest-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(console.error)
    setSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                {dict.landing.heroBadge}
              </div>
            </div>
            <div className="space-y-6">
              <h1 className="text-6xl xl:text-8xl font-black text-on-surface leading-[0.95] tracking-tighter font-display">
                {dict.landing.heroTitlePrefix} <span className="text-primary italic">{dict.landing.heroTitleSuffix}</span>
              </h1>
              <p className="text-xl text-on-surface-variant font-medium leading-relaxed max-w-md mx-auto lg:mx-0 opacity-70">
                {dict.landing.heroDesc}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-2xl bg-surface-container-highest border-4 border-surface shadow-sm overflow-hidden flex items-center justify-center bg-white">
                        <span className="text-[10px] font-black opacity-10">J.</span>
                    </div>
                 ))}
              </div>
              <p className="text-[10px] font-black text-on-surface-variant opacity-40 uppercase tracking-widest leading-none">
                {dict.landing.trustedBy}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-12 shadow-premium border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-on-surface font-display tracking-tight mb-3">
                {dict.landing.gateTitle}
              </h2>
              <p className="text-[10px] font-black text-on-surface-variant opacity-40 uppercase tracking-[0.2em] mb-10 leading-relaxed">
                {dict.landing.gateDesc} <Link href="/login" className="text-primary hover:text-secondary transition-colors underline decoration-2 underline-offset-4">{dict.landing.signIn}</Link>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 ml-6">{dict.landing.nameLabel}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full px-8 py-5 rounded-3xl bg-surface-container-low text-on-surface border-none focus:ring-4 focus:ring-primary/10 placeholder:text-on-surface-variant/20 transition-all font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 ml-6">{dict.landing.emailLabel}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="w-full px-8 py-5 rounded-3xl bg-surface-container-low text-on-surface border-none focus:ring-4 focus:ring-primary/10 placeholder:text-on-surface-variant/20 transition-all font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 ml-6">{dict.landing.phoneLabel}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    required
                    className="w-full px-8 py-5 rounded-3xl bg-surface-container-low text-on-surface border-none focus:ring-4 focus:ring-primary/10 placeholder:text-on-surface-variant/20 transition-all font-semibold"
                  />
                </div>

                {error && <p className="text-secondary text-[10px] font-black uppercase tracking-widest px-6 pt-2">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-6 mt-8 gradient-primary text-white font-black uppercase tracking-[0.3em] rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                >
                  {submitting ? 'Authenticating...' : dict.landing.enterHub}
                </button>
              </form>

              <p className="text-[10px] text-on-surface-variant opacity-20 uppercase font-black text-center mt-10 tracking-[0.15em] leading-relaxed max-w-xs mx-auto">
                {dict.landing.securityHint}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-none bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            {dict.landing.hubWelcome} {guest.name.split(' ').pop()}!
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black text-on-surface font-display tracking-tight leading-[0.9]">
            {dict.landing.hubTitle.split('.')[0]}<span className="text-primary italic">.</span>
          </h1>
          <p className="text-on-surface-variant opacity-50 font-medium text-xl max-w-2xl mx-auto leading-relaxed">
            {dict.landing.hubDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ExperienceCard 
            href={`/${lang}/tutor`}
            icon={<Bot className="w-10 h-10 text-cyan-400" />}
            title={dict.landing.cardTutorTitle}
            desc={dict.landing.cardTutorDesc}
            btnText={dict.landing.cardTutorBtn}
            variants={['98% Correlation Score', 'Real-time Recovery']}
            accent="cyan"
            status="ONLINE"
            chip="Skill Boost Active"
          />
          <ExperienceCard 
            href={`/${lang}/quiz`}
            icon={<Trophy className="w-10 h-10 text-pink-500" />}
            title={dict.landing.cardAssessmentTitle}
            desc={dict.landing.cardAssessmentDesc}
            btnText={dict.landing.cardAssessmentBtn}
            variants={[`${quizCount || '350+'} Questions`, 'Global Leaderboard']}
            accent="magenta"
            status="HOT"
            bonus="+450 XP"
            chip="Arena Mode"
          />
          <ExperienceCard 
            href={`/${lang}/vocabulary-challenge`}
            icon={<Activity className="w-10 h-10 text-teal-400" />}
            title={dict.landing.cardVocabTitle}
            desc={dict.landing.cardVocabDesc}
            btnText={dict.landing.cardVocabBtn}
            variants={['Spaced Repetition', '4 Study Modes']}
            accent="teal"
            chip="Combo x3"
            progress={65}
          />
        </div>
      </div>
    </div>
  );
}

function ExperienceCard({ 
  href, icon, title, desc, btnText, variants, accent,
  status, bonus, chip, progress 
}: any) {
  const isCyan = accent === 'cyan'
  const isMagenta = accent === 'magenta'
  const isTeal = accent === 'teal'

  return (
    <Link href={href} className="group block h-full">
      <div className={`
        relative bg-[#02091A]/90 backdrop-blur-xl rounded-[32px] p-10 h-full
        border border-white/10 transition-all duration-500
        hover:-translate-y-4 shadow-2xl
        ${isCyan ? 'hover:shadow-[0_0_50px_rgba(34,211,238,0.25)] hover:border-cyan-400/50' : ''}
        ${isMagenta ? 'hover:shadow-[0_0_50px_rgba(236,72,153,0.3)] hover:border-pink-500/50' : ''}
        ${isTeal ? 'hover:shadow-[0_0_50px_rgba(20,184,166,0.25)] hover:border-teal-400/50' : ''}
        overflow-hidden flex flex-col items-center text-center
      `}>
        {/* Glow Effect Background */}
        <div className={`
          absolute -top-24 -right-24 w-48 h-48 blur-[100px] opacity-20 transition-opacity group-hover:opacity-40
          ${isCyan ? 'bg-cyan-500' : isMagenta ? 'bg-pink-500' : 'bg-teal-500'}
        `} />

        {/* Status Pills */}
        <div className="absolute top-6 left-6 flex gap-2">
          {status === 'ONLINE' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/5 backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
              <span className="text-[9px] font-black text-white/80 tracking-widest leading-none">ONLINE</span>
            </div>
          )}
          {status === 'HOT' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 backdrop-blur-md">
              <Flame className="w-3 h-3 text-orange-400 fill-orange-400/20" />
              <span className="text-[9px] font-black text-pink-400 tracking-widest leading-none">HOT</span>
            </div>
          )}
        </div>

        {bonus && (
          <div className="absolute top-6 right-6">
             <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-md text-[9px] font-black text-orange-400 tracking-widest leading-none shadow-[0_0_15px_rgba(249,115,22,0.15)]">
              {bonus}
            </div>
          </div>
        )}

        {/* Icon */}
        <div className={`
          w-20 h-20 rounded-[28px] flex items-center justify-center mb-10 
          bg-[#020617] border shadow-inner transition-transform duration-500 group-hover:scale-110
          ${isCyan ? 'border-cyan-400/30' : isMagenta ? 'border-pink-500/30' : 'border-teal-400/30'}
        `}>
          {icon}
        </div>

        <div className="flex-1 space-y-6 flex flex-col items-center">
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-3xl font-black text-white font-display tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.1)] uppercase">
              {title}
            </h2>
          </div>
          <p className="text-white/40 text-sm font-medium leading-relaxed italic px-2">
            {desc}
          </p>
          
          {progress !== undefined && (
            <div className="w-full py-4 space-y-3">
              <div className="flex justify-between text-[9px] font-black text-white/40 tracking-widest">
                <span>XP PROGRESS</span>
                <span className="text-teal-400">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-teal-400 to-violet-500 shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-8 space-y-4">
            {variants.map((v: string) => (
              <div key={v} className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-white/30">
                <CheckCircle2 className={`h-4 w-4 ${isCyan ? 'text-cyan-400' : isMagenta ? 'text-pink-500' : 'text-teal-400'}`} /> {v}
              </div>
            ))}
          </div>

          {chip && (
             <div className="flex justify-center pt-4">
              <div className={`
                flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border text-[9px] font-black tracking-widest uppercase
                ${isCyan ? 'border-cyan-400/20 text-cyan-400/70' : isMagenta ? 'border-pink-500/20 text-pink-500/70' : 'border-teal-400/20 text-teal-400/70'}
              `}>
                {chip === 'Arena Mode' ? <Globe className="w-3 h-3" /> : chip === 'Skill Boost Active' ? <Activity className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                {chip}
              </div>
            </div>
          )}
        </div>

        <div className={`
          mt-12 w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center
          bg-white/5 border border-white/10 text-white/50 group-hover:text-white group-hover:scale-[1.02]
          ${isCyan ? 'group-hover:bg-cyan-500 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]' : ''}
          ${isMagenta ? 'group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-orange-500 group-hover:shadow-[0_0_25px_rgba(236,72,153,0.4)]' : ''}
          ${isTeal ? 'group-hover:bg-teal-500 group-hover:shadow-[0_0_25px_rgba(20,184,166,0.4)]' : ''}
        `}>
          {btnText}
        </div>
      </div>
    </Link>
  )
}
