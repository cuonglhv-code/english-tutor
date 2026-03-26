import Link from "next/link";
import { 
  BookOpen, 
  BarChart, 
  Share2, 
  Mail, 
  ArrowRight, 
  Lightbulb,
  CheckCircle2,
  Menu,
  User,
  TrendingUp,
  Layout
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WritingGuidePage() {
  return (
    <div className="bg-surface min-h-screen selection:bg-primary/10 selection:text-primary">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-on-surface-variant/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/experience" className="text-xl font-black font-display tracking-tight text-primary italic">
              Jaxtina.
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/practice" className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors">Practice</Link>
              <Link href="/writing-101" className="text-[10px] font-black uppercase tracking-widest text-primary border-b-2 border-primary pb-1">Guides</Link>
              <Link href="/tutor" className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors">Tutors</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full text-on-surface-variant/40 hover:text-primary">
              <User className="h-5 w-5" />
            </Button>
            <Button className="gradient-secondary rounded-xl text-[10px] font-black uppercase tracking-widest px-6 h-10 border-none shadow-md">
              Start Test
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        {/* Hero Header */}
        <header className="mb-20 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-8 font-black text-[10px] uppercase tracking-widest">
            <BookOpen className="h-3.5 w-3.5" /> Academic Module
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl text-on-surface tracking-tighter leading-[1.1] mb-8">
            Writing 101 <span className="text-primary italic">Guide.</span>
          </h1>
          <p className="text-xl text-on-surface-variant/70 font-medium leading-relaxed max-w-2xl">
            A masterclass in academic precision. Master the structures, vocabulary, and logic required to achieve a Band 8.0+ in your writing assessment.
          </p>
        </header>

        {/* Category Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-24">
          <div className="md:col-span-2 bg-white p-10 rounded-3xl shadow-stitched border-none group hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 text-primary shadow-sm group-hover:scale-110 transition-transform">
                  <BarChart className="h-7 w-7" />
                </div>
                <h3 className="font-display font-black text-3xl text-on-surface mb-4 tracking-tight">Data Visuals</h3>
                <p className="text-on-surface-variant/60 text-base font-medium leading-relaxed mb-8">Mastering line graphs, bar charts, and pie charts with objective analytical language.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface border-none text-on-surface-variant/40">Task 1</Badge>
                <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface border-none text-on-surface-variant/40">Trends</Badge>
                <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface border-none text-on-surface-variant/40">Comparisons</Badge>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-10 rounded-3xl border-none group hover:bg-white hover:shadow-stitched transition-all hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8 text-secondary shadow-sm">
                <Share2 className="h-7 w-7" />
              </div>
              <h3 className="font-display font-black text-2xl text-on-surface mb-4 tracking-tight">Process Maps</h3>
              <p className="text-on-surface-variant/60 text-sm font-medium leading-relaxed">Passive voice mastery for natural & industrial cycles.</p>
            </div>
            <Button variant="link" className="text-primary p-0 h-auto font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group-hover:gap-3 transition-all mt-8">
              Explore <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="bg-surface-container-low p-10 rounded-3xl border-none group hover:bg-white hover:shadow-stitched transition-all hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-on-surface-variant/10 flex items-center justify-center mb-8 text-on-surface-variant shadow-sm">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="font-display font-black text-2xl text-on-surface mb-4 tracking-tight">Letter Writing</h3>
              <p className="text-on-surface-variant/60 text-sm font-medium leading-relaxed">Formal, semi-formal, and informal tone variations.</p>
            </div>
            <Button variant="link" className="text-primary p-0 h-auto font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group-hover:gap-3 transition-all mt-8">
              Explore <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </section>

        {/* Chapter Section: Line Graphs */}
        <section className="mb-24">
          <div className="flex items-baseline justify-between mb-12 border-b border-on-surface-variant/5 pb-6">
            <h2 className="font-display font-black text-4xl text-on-surface tracking-tight">Mastering Line Graphs</h2>
            <span className="text-on-surface-variant/40 font-black uppercase tracking-widest text-[10px]">Chapter 01 — Statistical Analysis</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="aspect-video bg-white rounded-3xl overflow-hidden shadow-stitched group relative">
                <Image 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="Professional line graph example" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEZ7N2xMsCuf6Hqk9Gq9tv738dIepgCwmL62C_xvLEfY6Blo8lmXB7GT1JbSqOBMUCHzhN_B33VsRA3rRixhHtsXIfblE3SOKePbvlTDuZsX87ESJifSObALH9M2p98-K5Be3noB-0FrZ-UHzqLFYKzVsnCQBhjq4GYRS8Wj3Gu-CIE3ZhKjUMGxnF_pxL-V5XkYQ7FZmSE_MyKN8wGeKVCpXd-_IVJR0PjJa5bp9zihS9XkPUuTeZcrTBpsctKyWIQisfoLpoC5M"
                  width={800}
                  height={450}
                  unoptimized // External Google user content often lacks optimized resizing
                />
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div className="bg-surface-container-low p-8 rounded-3xl">
                <h4 className="font-display font-black text-lg text-on-surface mb-6 flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-primary" /> Structure Tips
                </h4>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <span className="text-primary font-black text-xs pt-1">01.</span>
                    <p className="text-sm text-on-surface-variant/70 font-medium leading-relaxed">
                      <strong className="text-on-surface">Introduction:</strong> Paraphrase the prompt precisely. Avoid copying words directly from the task.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-primary font-black text-xs pt-1">02.</span>
                    <p className="text-sm text-on-surface-variant/70 font-medium leading-relaxed">
                      <strong className="text-on-surface">Overview:</strong> Capture the overall trend without listing specific numbers. This is the heart of Task 1.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-primary font-black text-xs pt-1">03.</span>
                    <p className="text-sm text-on-surface-variant/70 font-medium leading-relaxed">
                      <strong className="text-on-surface">Details:</strong> Use data points selectively to support your observations of major peaks and troughs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white p-10 md:p-14 rounded-3xl shadow-stitched border-none">
              <h3 className="font-display font-black text-3xl text-on-surface mb-10 tracking-tight">Key Vocabulary</h3>
              <div className="space-y-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-6 pl-1">Upward Movements</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-surface rounded-2xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-primary/5">
                      <p className="font-black text-primary mb-1">Surged / Soared</p>
                      <p className="text-xs text-on-surface-variant/50 font-medium">For dramatic, rapid increases in data.</p>
                    </div>
                    <div className="p-5 bg-surface rounded-2xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-primary/5">
                      <p className="font-black text-primary mb-1">Rose steadily</p>
                      <p className="text-xs text-on-surface-variant/50 font-medium">Used for consistent, gradual growth.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-6 pl-1">Fluctuations & Stagnation</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-surface rounded-2xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-primary/5">
                      <p className="font-black text-primary mb-1">Oscillated</p>
                      <p className="text-xs text-on-surface-variant/50 font-medium">Repeated ups and downs over time.</p>
                    </div>
                    <div className="p-5 bg-surface rounded-2xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-primary/5">
                      <p className="font-black text-primary mb-1">Plateaued</p>
                      <p className="text-xs text-on-surface-variant/50 font-medium">Leveled out and remained stable.</p>
                    </div>
                  </div>
                </div>
                <div className="pt-8 border-t border-on-surface-variant/5">
                  <div className="p-6 bg-surface-container-low/50 rounded-2xl italic">
                    <p className="text-on-surface-variant/80 leading-relaxed font-medium">
                      &quot;The graph illustrates a <span className="text-primary font-black">significant upward trend</span> in renewable energy consumption, which <span className="text-primary font-black">peaked</span> at 40% in 2022 before <span className="text-primary font-black">declining slightly</span> towards the end of the decade.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scoring Criteria */}
        <section className="bg-surface-container-low/30 rounded-[40px] p-12 md:p-20 text-center">
          <h2 className="font-display font-black text-4xl text-on-surface mb-4 tracking-tighter">Scoring Criteria</h2>
          <p className="text-on-surface-variant/60 font-medium text-lg max-w-xl mx-auto mb-16 italic">How examiners evaluate your performance across four key dimensions.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { id: 1, title: "Task Response", desc: "Answering all parts clearly." },
              { id: 2, title: "Coherence", desc: "Logical flow and organization." },
              { id: 3, title: "Lexical Resource", desc: "Vocabulary range and accuracy." },
              { id: 4, title: "Grammar", desc: "Complex / error-free structures." }
            ].map((item) => (
              <div key={item.id} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-stitched transition-all flex flex-col items-center group">
                <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center mb-6 font-black text-sm group-hover:scale-110 transition-transform">
                  {item.id}
                </div>
                <h4 className="font-black text-on-surface text-sm mb-2 uppercase tracking-tight">{item.title}</h4>
                <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 px-8 bg-white border-t border-on-surface-variant/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-display font-black text-xl text-primary italic">Jaxtina.</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/20">
            © 2024 Jaxtina Academic Mentor.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
