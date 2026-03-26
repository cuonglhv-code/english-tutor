'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { Badge } from "@/components/ui/badge"
import { useTranslation } from '@/lib/i18n/useTranslation'
import { Layout, Award, TrendingUp, CheckCircle2 } from 'lucide-react'

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
            icon={<Layout className="w-10 h-10 text-primary" />}
            title={dict.landing.cardTutorTitle}
            desc={dict.landing.cardTutorDesc}
            btnText={dict.landing.cardTutorBtn}
            variants={['98% Correlation Score', 'Real-time Recovery']}
            accent="primary"
          />
          <ExperienceCard 
            href={`/${lang}/quiz`}
            icon={<Award className="w-10 h-10 text-secondary" />}
            title={dict.landing.cardAssessmentTitle}
            desc={dict.landing.cardAssessmentDesc}
            btnText={dict.landing.cardAssessmentBtn}
            variants={[`${quizCount || '350+'} Questions`, 'Global Leaderboard']}
            accent="secondary"
          />
          <ExperienceCard 
            href={`/${lang}/vocabulary-challenge`}
            icon={<TrendingUp className="w-10 h-10 text-on-surface-variant/40" />}
            title={dict.landing.cardVocabTitle}
            desc={dict.landing.cardVocabDesc}
            btnText={dict.landing.cardVocabBtn}
            variants={['Spaced Repetition', '4 Study Modes']}
            accent="tertiary"
          />
        </div>
      </div>
    </div>
  );
}

function ExperienceCard({ href, icon, title, desc, btnText, variants, accent }: any) {
  return (
    <Link href={href} className="group block h-full">
      <div className="bg-white rounded-[40px] p-12 h-full shadow-premium border-none hover:-translate-y-3 transition-all duration-700 hover:shadow-2xl flex flex-col items-center text-center">
        <div className={`w-20 h-20 rounded-[28px] ${accent === 'primary' ? 'bg-primary/5' : accent === 'secondary' ? 'bg-secondary/5' : 'bg-surface-container-low'} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
          {icon}
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-3xl font-black text-on-surface font-display tracking-tight">{title}</h2>
            {accent === 'primary' && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/50" />}
          </div>
          <p className="text-on-surface-variant opacity-60 text-base font-medium leading-relaxed italic px-2">
            {desc}
          </p>
          <div className="pt-8 space-y-4">
            {variants.map((v: string) => (
              <div key={v} className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-on-surface-variant opacity-30">
                <CheckCircle2 className={`h-4 w-4 ${accent === 'primary' ? 'text-primary' : accent === 'secondary' ? 'text-secondary' : 'text-on-surface-variant/20'}`} /> {v}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 w-full py-4 bg-surface rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20">
          {btnText}
        </div>
      </div>
    </Link>
  )
}
