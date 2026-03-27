"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  title: string;
  enDesc: string;
  viDesc: string;
  practiceHref: string;
}

export function Writing101Hero({ title, enDesc, viDesc, practiceHref }: HeroProps) {
  return (
    <section className="relative overflow-hidden mb-16 py-12 border-b border-slate-100 dark:border-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:items-center">
        {/* English Column */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            EN
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-50 leading-[1.1]">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-lg">
            {enDesc}
          </p>
          <Button asChild size="lg" className="rounded-full px-8 py-6 text-base font-bold shadow-xl shadow-slate-200 dark:shadow-none bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-all group">
            <a href={practiceHref} className="flex items-center gap-2">
              Start practicing now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </div>

        {/* Vietnamese Column */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group">
          <div className="absolute top-4 right-6 inline-flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-slate-800/50 rounded text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            VI
          </div>
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Hướng dẫn Writing Task 1
            </h3>
            <p className="text-base text-slate-500 dark:text-slate-400 italic leading-relaxed">
              {viDesc}
            </p>
            <div className="pt-4 flex items-center gap-2 text-sm font-semibold text-slate-400">
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-700" />
              Powered by Jaxtina Tutor
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
