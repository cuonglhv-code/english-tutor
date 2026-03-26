'use client'
import Link from "next/link";
import { 
  BookOpen, 
  BarChart, 
  Share2, 
  Mail, 
  ArrowRight, 
  Lightbulb,
  CheckCircle2,
  Layout
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function WritingGuidePage() {
  const { dict, lang } = useTranslation();

  return (
    <div className="bg-surface min-h-screen selection:bg-primary/10 selection:text-primary">
      <main className="pt-24 pb-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        {/* Hero Header */}
        <header className="mb-24 max-w-4xl">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 text-primary mb-10 font-black text-[10px] uppercase tracking-[0.2em] border border-primary/5">
            <BookOpen className="h-4 w-4" /> {dict.writing101.badge}
          </div>
          <h1 className="font-display font-black text-6xl md:text-8xl text-on-surface tracking-tighter leading-[0.9] mb-10">
            {dict.writing101.title} <span className="text-primary italic">{dict.writing101.subtitle}</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-medium leading-relaxed max-w-2xl opacity-70">
            {dict.writing101.desc}
          </p>
        </header>

        {/* Category Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-32">
          <div className="md:col-span-2 bg-white p-12 rounded-[40px] shadow-premium border-none group hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-10 text-primary shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <BarChart className="h-8 w-8" />
                </div>
                <h3 className="font-display font-black text-4xl text-on-surface mb-6 tracking-tight">Data Visuals</h3>
                <p className="text-on-surface-variant opacity-60 text-lg font-medium leading-relaxed mb-10">Mastering line graphs, bar charts, and pie charts with objective analytical language.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-surface border-none text-on-surface-variant opacity-40">Task 1</Badge>
                <Badge variant="secondary" className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-surface border-none text-on-surface-variant opacity-40">Trends</Badge>
                <Badge variant="secondary" className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-surface border-none text-on-surface-variant opacity-40">Comparisons</Badge>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-12 rounded-[40px] border-none group hover:bg-white hover:shadow-premium transition-all duration-700 hover:-translate-y-2 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-secondary/5 flex items-center justify-center mb-10 text-secondary shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="font-display font-black text-3xl text-on-surface mb-6 tracking-tight">Process Maps</h3>
              <p className="text-on-surface-variant opacity-60 text-base font-medium leading-relaxed">Passive voice mastery for natural & industrial cycles.</p>
            </div>
            <Button variant="link" className="text-primary p-0 h-auto font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 group-hover:gap-4 transition-all mt-10">
              Explore <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-surface-container-low p-12 rounded-[40px] border-none group hover:bg-white hover:shadow-premium transition-all duration-700 hover:-translate-y-2 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-on-surface-variant/5 flex items-center justify-center mb-10 text-on-surface-variant opacity-40 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="font-display font-black text-3xl text-on-surface mb-6 tracking-tight">Letter Writing</h3>
              <p className="text-on-surface-variant opacity-60 text-base font-medium leading-relaxed">Formal, semi-formal, and informal tone variations.</p>
            </div>
            <Button variant="link" className="text-primary p-0 h-auto font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 group-hover:gap-4 transition-all mt-10">
              Explore <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Chapter Section: Line Graphs */}
        <section className="mb-32">
          <div className="flex items-baseline justify-between mb-16 border-b border-on-surface-variant/5 pb-10">
            <h2 className="font-display font-black text-5xl text-on-surface tracking-tight">{dict.writing101.chapterTitle}</h2>
            <div className="flex gap-2">
                <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">{dict.writing101.chapterPrefix}</span>
                <span className="text-on-surface-variant opacity-20 font-black uppercase tracking-[0.2em] text-[10px]">— {dict.writing101.chapterSuffix}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div className="aspect-video bg-white rounded-[32px] overflow-hidden shadow-premium group relative">
                <Image 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt="Professional line graph example" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEZ7N2xMsCuf6Hqk9Gq9tv738dIepgCwmL62C_xvLEfY6Blo8lmXB7GT1JbSqOBMUCHzhN_B33VsRA3rRixhHtsXIfblE3SOKePbvlTDuZsX87ESJifSObALH9M2p98-K5Be3noB-0FrZ-UHzqLFYKzVsnCQBhjq4GYRS8Wj3Gu-CIE3ZhKjUMGxnF_pxL-V5XkYQ7FZmSE_MyKN8wGeKVCpXd-_IVJR0PjJa5bp9zihS9XkPUuTeZcrTBpsctKyWIQisfoLpoC5M"
                  width={800}
                  height={450}
                  unoptimized 
                />
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-700"></div>
              </div>
              <div className="bg-surface-container-low p-10 rounded-[40px]">
                <h4 className="font-display font-black text-2xl text-on-surface mb-10 flex items-center gap-4">
                  <Lightbulb className="h-6 w-6 text-primary" /> {dict.writing101.tipsTitle}
                </h4>
                <div className="space-y-10">
                  <div className="flex gap-6">
                    <span className="text-primary font-black text-sm pt-1">01.</span>
                    <p className="text-base text-on-surface-variant font-medium leading-relaxed opacity-70">
                      <strong className="text-on-surface font-black uppercase tracking-widest text-[10px] block mb-1">Introduction:</strong> Paraphrase the prompt precisely. Avoid copying words directly from the task.
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-primary font-black text-sm pt-1">02.</span>
                    <p className="text-base text-on-surface-variant font-medium leading-relaxed opacity-70">
                      <strong className="text-on-surface font-black uppercase tracking-widest text-[10px] block mb-1">Overview:</strong> Capture the overall trend without listing specific numbers. This is the heart of Task 1.
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-primary font-black text-sm pt-1">03.</span>
                    <p className="text-base text-on-surface-variant font-medium leading-relaxed opacity-70">
                      <strong className="text-on-surface font-black uppercase tracking-widest text-[10px] block mb-1">Details:</strong> Use data points selectively to support your observations of major peaks and troughs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white p-12 md:p-20 rounded-[48px] shadow-premium border-none relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -mr-32 -mt-32 opacity-50" />
               <div className="relative z-10">
                <h3 className="font-display font-black text-4xl text-on-surface mb-12 tracking-tight">{dict.writing101.vocabTitle}</h3>
                <div className="space-y-16">
                    <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-secondary mb-8 pl-1">Upward Movements</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-8 bg-surface rounded-3xl group hover:bg-white hover:shadow-premium transition-all duration-500 border border-transparent hover:border-primary/5">
                        <p className="font-black text-primary text-xl mb-2">Surged / Soared</p>
                        <p className="text-sm text-on-surface-variant opacity-60 font-medium leading-relaxed">For dramatic, rapid increases in data.</p>
                        </div>
                        <div className="p-8 bg-surface rounded-3xl group hover:bg-white hover:shadow-premium transition-all duration-500 border border-transparent hover:border-primary/5">
                        <p className="font-black text-primary text-xl mb-2">Rose steadily</p>
                        <p className="text-sm text-on-surface-variant opacity-60 font-medium leading-relaxed">Used for consistent, gradual growth.</p>
                        </div>
                    </div>
                    </div>
                    <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-secondary mb-8 pl-1">Fluctuations & Stagnation</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-8 bg-surface rounded-3xl group hover:bg-white hover:shadow-premium transition-all duration-500 border border-transparent hover:border-primary/5">
                        <p className="font-black text-primary text-xl mb-2">Oscillated</p>
                        <p className="text-sm text-on-surface-variant opacity-60 font-medium leading-relaxed">Repeated ups and downs over time.</p>
                        </div>
                        <div className="p-8 bg-surface rounded-3xl group hover:bg-white hover:shadow-premium transition-all duration-500 border border-transparent hover:border-primary/5">
                        <p className="font-black text-primary text-xl mb-2">Plateaued</p>
                        <p className="text-sm text-on-surface-variant opacity-60 font-medium leading-relaxed">Leveled out and remained stable.</p>
                        </div>
                    </div>
                    </div>
                    <div className="pt-12 border-t border-on-surface-variant/5">
                    <div className="p-10 bg-surface-container-low/50 rounded-[32px] italic relative group">
                        <div className="absolute left-0 top-0 w-1 h-full bg-primary/20 rounded-full" />
                        <p className="text-on-surface-variant opacity-80 text-lg leading-relaxed font-medium">
                        &quot;The graph illustrates a <span className="text-primary font-black underline decoration-primary/20 decoration-4 underline-offset-4">significant upward trend</span> in renewable energy consumption, which <span className="text-primary font-black underline decoration-primary/20 decoration-4 underline-offset-4">peaked</span> at 40% in 2022 before <span className="text-primary font-black underline decoration-primary/20 decoration-4 underline-offset-4">declining slightly</span> towards the end of the decade.&quot;
                        </p>
                    </div>
                    </div>
                </div>
               </div>
            </div>
          </div>
        </section>

        {/* Scoring Criteria */}
        <section className="bg-surface-container-low/40 rounded-[64px] p-16 md:p-32 text-center">
          <h2 className="font-display font-black text-5xl text-on-surface mb-6 tracking-tighter">{dict.writing101.scoringTitle}</h2>
          <p className="text-on-surface-variant opacity-60 font-medium text-xl max-w-2xl mx-auto mb-20 italic">{dict.writing101.scoringSubtitle}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { id: 1, title: "Task Response", desc: "Answering all parts clearly." },
              { id: 2, title: "Coherence", desc: "Logical flow and organization." },
              { id: 3, title: "Lexical Resource", desc: "Vocabulary range and accuracy." },
              { id: 4, title: "Grammar", desc: "Complex / error-free structures." }
            ].map((item) => (
              <div key={item.id} className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-premium transition-all duration-700 flex flex-col items-center group hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-8 font-black text-sm group-hover:scale-110 transition-transform duration-500">
                  {item.id}
                </div>
                <h4 className="font-black text-on-surface text-base mb-3 uppercase tracking-tight">{item.title}</h4>
                <p className="text-[10px] text-on-surface-variant opacity-40 font-black uppercase tracking-[0.2em]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full py-24 px-12 bg-white border-t border-on-surface-variant/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-display font-black text-2xl tracking-tighter text-on-surface">
                Scholar<span className="text-primary italic">AI.</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-20 -mt-1">Digital Mentor</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-20 text-center md:text-left">
            © 2024 Jaxtina English Group. All rights reserved.
          </p>
          <div className="flex gap-10">
            <Link href="#" className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-40 hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-40 hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
