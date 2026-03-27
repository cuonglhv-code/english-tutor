import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface VocabItem {
  phrase: string;
  usage: string;
}

interface VocabPanelProps {
  title: string;
  items: VocabItem[];
  example: string;
  practiceHref: string;
}

export function VocabPanel({ title, items, example, practiceHref }: VocabPanelProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800/50 mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          {title}
        </h3>
        <Button asChild variant="outline" className="rounded-full px-6 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-widest transition-all group">
          <a href={practiceHref} className="flex items-center gap-2">
            Practice this pattern
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {items.map((item, idx) => (
          <div key={idx} className="group">
            <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-black text-sm mb-3 shadow-sm group-hover:shadow-md transition-all">
              {item.phrase}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed pl-1">
              {item.usage}
            </p>
          </div>
        ))}
      </div>

      <div className="relative p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-jaxtina-red/20" />
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Model Sentence
          </span>
          <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
            &quot;{example}&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
