import { ArrowRight, BarChart, Mail, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardProps {
  label: string;
  title: string;
  desc: string;
  href: string;
  icon: React.ElementType;
}

function TaskCard({ label, title, desc, href, icon: Icon }: CardProps) {
  return (
    <div className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between">
      <div>
        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 text-slate-900 dark:text-slate-100 group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
          {label}
        </span>
        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
          {desc}
        </p>
      </div>
      <Button asChild variant="ghost" className="justify-start p-0 h-auto hover:bg-transparent text-slate-900 dark:text-slate-100 font-black uppercase tracking-[0.15em] text-[10px] group-hover:text-jaxtina-red transition-colors">
        <a href={href} className="flex items-center gap-2">
          Open guide <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
        </a>
      </Button>
    </div>
  );
}

export function TaskTypeCardGrid() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      <TaskCard
        label="Charts & graphs"
        title="Data visuals"
        desc="Mastering line graphs, bar charts, and pie charts with objective analytical language."
        href="/en/writing-101/data-visuals"
        icon={BarChart}
      />
      <TaskCard
        label="Diagrams"
        title="Process maps"
        desc="Passive voice mastery for describing natural cycles and industrial mechanical processes."
        href="/en/writing-101/process-maps"
        icon={Share2}
      />
      <TaskCard
        label="General Training"
        title="Letter writing"
        desc="Effective communication strategies for formal, semi-formal, and informal letter tasks."
        href="/en/writing-101/letters"
        icon={Mail}
      />
    </section>
  );
}
