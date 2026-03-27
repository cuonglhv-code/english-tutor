import { Lightbulb, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface Step {
  title: string;
  desc: string;
  points: string[];
}

interface StepSectionProps {
  chapter: string;
  title: string;
  subtitle: string;
  steps: Step[];
  imageSrc: string;
}

export function StepSection({ chapter, title, subtitle, steps, imageSrc }: StepSectionProps) {
  return (
    <section className="mb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-jaxtina-red mb-2 block">
            {chapter}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Steps */}
        <div className="lg:col-span-7 space-y-10">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-black text-sm shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  {idx + 1}
                </div>
                {idx !== steps.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 mt-2" />
                )}
              </div>
              <div className="pb-8">
                <h4 className="text-lg font-black text-slate-900 dark:text-slate-50 mb-3 uppercase tracking-tight">
                  {step.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4">
                  {step.desc}
                </p>
                <ul className="space-y-2">
                  {step.points.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-jaxtina-red mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <div className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 flex gap-4">
            <Lightbulb className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-widest mb-1">
                Expert Tip
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                Aim for exactly 150-170 words. Quality of analysis matters more than quantity of data points. Use consistent tenses throughout your report.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Visual Placeholder */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group">
              <div className="aspect-[4/3] bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden relative shadow-inner">
                <Image 
                  src={imageSrc}
                  alt="IELTS Writing Sample Chart"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-slate-900/5 group-hover:opacity-0 transition-opacity" />
              </div>
              <div className="px-4 py-6 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Example Line Graph (Sample Chart)
                </span>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Structure Summary
              </p>
              <div className="space-y-3">
                {["Paraphrase (1 sentence)", "Overall Trend (2 sentences)", "Specific Details (4-5 sentences)"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-jaxtina-red" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
