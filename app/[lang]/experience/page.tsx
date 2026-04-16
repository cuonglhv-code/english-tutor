'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase'
import { Badge } from "@/components/ui/badge"
import { useTranslation } from '@/lib/i18n/useTranslation'
import {
  Layout, Award, TrendingUp, CheckCircle2,
  Bot, Flame, Trophy, Globe, Crown, Zap, Activity, AlertCircle, Mic, BookOpen, Play
} from 'lucide-react'

const GUEST_KEY = 'jaxtina_guest'

export default function ExperiencePage() {
  const { dict, lang } = useTranslation()
  const [guest, setGuest] = useState<{ name: string; email: string; phone: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAF8] px-6 py-24 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#26A69A]/10 blur-[100px] pointer-events-none transition-all duration-1000" />
      <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#FF7043]/10 blur-[120px] pointer-events-none transition-all duration-1000" />
      <div className="absolute top-[40%] left-[20%] w-[20%] h-[20%] rounded-full bg-yellow-400/5 blur-[80px] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#26A69A 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }}
      />

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Guest Banner */}
        {(!guest) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex items-center justify-center gap-3 bg-[#FF7043]/10 text-[#FF7043] border border-[#FF7043]/10 rounded-full py-3.5 px-8 shadow-sm"
          >
            <AlertCircle className="w-5 h-5" />
            <p className="text-[11px] font-black uppercase tracking-widest leading-none">
              {lang === 'vi' 
                ? 'Sử dụng Jaxtina Tutor như khách — không cần tài khoản. Tiến trình của bạn sẽ không được lưu.' 
                : 'Try Jaxtina Tutor as a guest — no account required. Your progress won’t be saved.'}
            </p>
            <div className="h-4 w-px bg-[#FF7043]/20 mx-2" />
            <Link href="/login" className="text-[11px] font-black uppercase underline underline-offset-4 hover:text-[#26A69A] transition-colors">
              {lang === 'vi' ? 'Đăng nhập để lưu →' : 'Sign in to save →'}
            </Link>
          </motion.div>
        )}

        {/* Recommended Action Card */}
          {guest && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 bg-gradient-to-r from-[#26A69A] to-[#2D5A4A] rounded-3xl p-8 text-white shadow-xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-[0.2em] mb-4 border-none">
                    {dict.landing.hubWelcome} {guest.name.split(' ').pop()}!
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-display font-black mb-2">
                    {dict.landing.hubTitle}
                  </h2>
                  <p className="text-white/80 font-medium">
                    {dict.landing.hubDesc}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-8 py-4 bg-white text-[#26A69A] rounded-2xl font-bold flex items-center gap-3 hover:bg-white/90 transition-colors">
                    <Play className="w-5 h-5" />
                    {dict.landing.continuePractice}
                  </button>
                  <button className="px-8 py-4 bg-white/20 text-white rounded-2xl font-bold hover:bg-white/30 transition-colors">
                    {dict.landing.quickPractice}
                  </button>
                </div>
              </div>
              {/* Streak indicator */}
              <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/20">
                <Flame className="w-5 h-5 text-[#E8A945]" />
                <span className="text-sm font-semibold">🔥 5 {dict.landing.dailyStreak}</span>
                <span className="text-white/60 text-sm">• Band 6.5 → Target 7.0</span>
              </div>
            </motion.div>
          )}

          {!guest && (
            <div className="text-center mb-20 space-y-8">
              <Badge variant="outline" className="px-8 py-3 rounded-full border-none bg-[#26A69A]/10 text-[#26A69A] text-[11px] font-black uppercase tracking-[0.2em] shadow-sm">
                {'Welcome to the Hub!'}
              </Badge>
              <h1 className="text-6xl md:text-8xl font-display font-black text-slate-800 tracking-tight leading-[0.95] drop-shadow-sm">
                {dict.landing.hubTitle.split('.')[0]}<span className="text-[#FF7043]">.</span>
              </h1>
              <p className="text-slate-500 font-bold text-xl max-w-3xl mx-auto leading-relaxed">
                {dict.landing.hubDesc}
              </p>
            </div>
          )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          <ExperienceCard
            href={`/${lang}/tutor`}
            icon={<Bot className="w-10 h-10 text-white" />}
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
            icon={<Trophy className="w-10 h-10 text-white" />}
            title={dict.landing.cardAssessmentTitle}
            desc={dict.landing.cardAssessmentDesc}
            btnText={dict.landing.cardAssessmentBtn}
            variants={[`${quizCount || '350+'} Questions`, 'Global Leaderboard']}
            accent="orange"
            status="HOT"
            bonus="+450 XP"
            chip="Arena Mode"
          />
          <ExperienceCard
            href={`/${lang}/vocabulary-challenge`}
            icon={<Activity className="w-10 h-10 text-white" />}
            title={dict.landing.cardVocabTitle}
            desc={dict.landing.cardVocabDesc}
            btnText={dict.landing.cardVocabBtn}
            variants={['Spaced Repetition', '4 Study Modes']}
            accent="teal"
            chip="Combo x3"
            progress={65}
          />
          <ExperienceCard
            href="/jaxtinaspeak.html"
            external
            icon={<Mic className="w-10 h-10 text-white" />}
            title={dict.landing.cardSpeakTitle}
            desc={dict.landing.cardSpeakDesc}
            btnText={dict.landing.cardSpeakBtn}
            variants={['Pronunciation AI', 'Fluency Scoring']}
            accent="purple"
            status="NEW"
            chip="Beta"
          />
          <ExperienceCard
            href="/grammar/index.html"
            external
            icon={<BookOpen className="w-10 h-10 text-white" />}
            title={dict.landing.cardGrammarTitle}
            desc={dict.landing.cardGrammarDesc}
            btnText={dict.landing.cardGrammarBtn}
            variants={['B1–C2 Levels', 'XP & Leaderboard']}
            accent="green"
            status="NEW"
            chip="GrammarQuest"
          />
        </div>
      </div>
    </div>
  );
}

function ExperienceCard({
  href, icon, title, desc, btnText, variants, accent,
  status, bonus, chip, progress, external
}: any) {
  const isCyan = accent === 'cyan'
  const isOrange = accent === 'orange'
  const isTeal = accent === 'teal'
  const isPurple = accent === 'purple'
  const isGreen = accent === 'green'

  const chipIcon = chip === 'Arena Mode'
    ? <Globe className="w-3 h-3" />
    : chip === 'Skill Boost Active'
    ? <Activity className="w-3 h-3" />
    : <Zap className="w-3 h-3" />

  const inner = (
    <motion.div
      whileHover={{ y: -10 }}
      className={`
        relative bg-white/95 rounded-[3rem] p-10 h-full
        border-b-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500
        flex flex-col items-center text-center
        ${isCyan ? 'border-cyan-100 shadow-cyan-100/50' : ''}
        ${isOrange ? 'border-orange-100 shadow-orange-100/50' : ''}
        ${isTeal ? 'border-teal-100 shadow-teal-100/50' : ''}
        ${isPurple ? 'border-purple-100 shadow-purple-100/50' : ''}
        ${isGreen ? 'border-green-100 shadow-green-100/50' : ''}
      `}
    >
      {/* Status Pills */}
      <div className="absolute top-8 left-8 flex gap-2">
        {status === 'ONLINE' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-[9px] font-black text-green-600 tracking-widest leading-none border border-green-100">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            ONLINE
          </div>
        )}
        {status === 'HOT' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-[9px] font-black text-orange-600 tracking-widest leading-none border border-orange-100">
            <Flame className="w-3 h-3 text-orange-500 fill-orange-500/20" />
            HOT
          </div>
        )}
        {status === 'NEW' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-[9px] font-black text-purple-600 tracking-widest leading-none border border-purple-100">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            NEW
          </div>
        )}
      </div>

      {bonus && (
        <div className="absolute top-8 right-8">
          <div className="px-4 py-1.5 rounded-full bg-yellow-50 text-[10px] font-black text-yellow-700 tracking-widest leading-none border border-yellow-100 shadow-sm">
            {bonus}
          </div>
        </div>
      )}

      {/* Icon container */}
      <div className={`
        w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10
        shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3
        ${isCyan ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-200' : ''}
        ${isOrange ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-200' : ''}
        ${isTeal ? 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-teal-200' : ''}
        ${isPurple ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-200' : ''}
        ${isGreen ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-200' : ''}
      `}>
        {icon}
      </div>

      <div className="flex-1 space-y-6 flex flex-col items-center w-full">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-3xl font-black text-slate-800 font-display tracking-tight uppercase leading-none">
            {title}
          </h2>
          {chip && (
            <div className={`
              inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase
              ${isCyan ? 'bg-cyan-50 text-cyan-600' : isOrange ? 'bg-orange-50 text-orange-600' : isTeal ? 'bg-teal-50 text-teal-600' : isGreen ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}
            `}>
              {chipIcon}
              {chip}
            </div>
          )}
        </div>

        <p className="text-slate-400 text-sm font-bold leading-relaxed px-2">
          {desc}
        </p>

        {progress !== undefined && (
          <div className="w-full py-4 space-y-3">
            <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-widest">
              <span>QUEST EXPERIENCE</span>
              <span className="text-teal-500">{progress}%</span>
            </div>
            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 shadow-md transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="pt-6 space-y-3 w-full">
          {variants.map((v: string) => (
            <div key={v} className="flex items-center gap-3 text-[11px] font-bold text-slate-400 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-50 transition-colors group-hover:bg-slate-50">
              <div className={`p-1 rounded-full ${isCyan ? 'bg-cyan-100 text-cyan-600' : isOrange ? 'bg-orange-100 text-orange-600' : isTeal ? 'bg-teal-100 text-teal-600' : isGreen ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                <CheckCircle2 className="h-3 w-3" />
              </div>
              <span className="uppercase tracking-tight">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`
        mt-12 w-full py-5 rounded-full text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 flex items-center justify-center
        border-b-4 border-slate-200 bg-slate-100 text-slate-400 group-hover:text-white group-hover:scale-[1.03]
        ${isCyan ? 'group-hover:bg-cyan-500 group-hover:border-cyan-700 group-hover:shadow-lg group-hover:shadow-cyan-200' : ''}
        ${isOrange ? 'group-hover:bg-orange-500 group-hover:border-orange-700 group-hover:shadow-lg group-hover:shadow-orange-200' : ''}
        ${isTeal ? 'group-hover:bg-teal-500 group-hover:border-teal-700 group-hover:shadow-lg group-hover:shadow-teal-200' : ''}
        ${isPurple ? 'group-hover:bg-purple-500 group-hover:border-purple-700 group-hover:shadow-lg group-hover:shadow-purple-200' : ''}
        ${isGreen ? 'group-hover:bg-green-500 group-hover:border-green-700 group-hover:shadow-lg group-hover:shadow-green-200' : ''}
      `}>
        {btnText}
      </div>
    </motion.div>
  )

  if (external) {
    return (
      <a href={href} className="group block h-full">
        {inner}
      </a>
    )
  }

  return (
    <Link href={href} className="group block h-full">
      {inner}
    </Link>
  )
}
