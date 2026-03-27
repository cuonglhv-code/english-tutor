'use client'

import { Writing101Hero } from "@/components/writing-101/Writing101Hero";
import { TaskTypeCardGrid } from "@/components/writing-101/TaskTypeCardGrid";
import { StepSection } from "@/components/writing-101/StepSection";
import { VocabPanel } from "@/components/writing-101/VocabPanel";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function WritingGuidePage() {
  const { dict } = useTranslation();

  return (
    <div className="bg-surface min-h-screen selection:bg-slate-900/10 dark:selection:bg-slate-100/10">
      <main className="max-w-5xl mx-auto pb-32">
        {/* Section 1: Hero */}
        <Writing101Hero 
          title="Task 1 Writing Guide"
          enDesc="Learn the exact structures examiners expect for Band 8.0+ in IELTS Writing Task 1. Master clarity, data selection, and lexical range."
          viDesc="Học các cấu trúc chuẩn mà giám khảo mong đợi để đạt Band 8.0+ trong IELTS Writing Task 1. Tập trung vào sự rõ ràng, lựa chọn dữ liệu và vốn từ vựng phong phú."
          practiceHref="/en/writing-101/practice"
        />

        {/* Section 2: Task Types */}
        <TaskTypeCardGrid />

        {/* Section 3: Mastering Line Graphs */}
        <StepSection 
          chapter="CHAPTER 01"
          title="Mastering line graphs"
          subtitle="The most common data visual in Task 1. Learn how to describe changes over time with precision."
          imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuDEZ7N2xMsCuf6Hqk9Gq9tv738dIepgCwmL62C_xvLEfY6Blo8lmXB7GT1JbSqOBMUCHzhN_B33VsRA3rRixhHtsXIfblE3SOKePbvlTDuZsX87ESJifSObALH9M2p98-K5Be3noB-0FrZ-UHzqLFYKzVsnCQBhjq4GYRS8Wj3Gu-CIE3ZhKjUMGxnF_pxL-V5XkYQ7FZmSE_MyKN8wGeKVCpXd-_IVJR0PjJa5bp9zihS9XkPUuTeZcrTBpsctKyWIQisfoLpoC5M"
          steps={[
            {
              title: "Introduction",
              desc: "Paraphrase the prompt precisely. Avoid copying words directly from the task.",
              points: [
                "Identify the main subject of the graph",
                "Specify the time period and units",
                "Use synonyms for 'show', 'illustrate', or 'depict'"
              ]
            },
            {
              title: "Overview",
              desc: "Capture the overall trend without listing specific numbers. This is the heart of Task 1.",
              points: [
                "Identify the highest and lowest points",
                "Mention the general direction of trends",
                "Report significant fluctuations or stability"
              ]
            },
            {
              title: "Specific Details",
              desc: "Use data points selectively to support your observations of major peaks and troughs.",
              points: [
                "Group similar data points together",
                "Use comparative language (e.g., 'more than double')",
                "Ensure accuracy of the numbers provided"
              ]
            }
          ]}
        />

        {/* Section 4: Vocabulary Blocks */}
        <div className="space-y-4 mb-16">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-8">
            Essential Vocabulary
          </h2>
          
          <VocabPanel 
            title="Verbs for upward trends"
            items={[
              { phrase: "Surged / Soared", usage: "For dramatic, rapid increases in data." },
              { phrase: "Rose steadily", usage: "Used for consistent, gradual growth." },
              { phrase: "Shot up", usage: "Informal but useful for extreme spikes." },
              { phrase: "Climbed", usage: "Generic but effective growth verb." },
              { phrase: "Peaked", usage: "To reach the highest point." },
              { phrase: "Upturn", usage: "A positive turnaround in trends." }
            ]}
            example="The graph illustrates a significant upward trend in renewable energy consumption, which peaked at 40% in 2022."
            practiceHref="/en/writing-101/practice?focus=upward-trends"
          />

          <VocabPanel 
            title="Fluctuations & Stagnation"
            items={[
              { phrase: "Oscillated", usage: "Repeated ups and downs over time." },
              { phrase: "Plateaued", usage: "Leveled out and remained stable." },
              { phrase: "Remained constant", usage: "No change over the period." },
              { phrase: "Fluctuated wildly", usage: "Frequent and extreme changes." },
              { phrase: "Stabilized", usage: "Became steady after a change." },
              { phrase: "Stagnated", usage: "Failed to show any growth." }
            ]}
            example="While numbers fluctuated wildly in the first decade, they eventually stabilized at roughly 15,000 units per year."
            practiceHref="/en/writing-101/practice?focus=fluctuations"
          />
        </div>

        {/* Section 5: Scoring Context (Simplified) */}
        <section className="bg-slate-900 dark:bg-slate-100 rounded-[3rem] p-12 md:p-20 text-white dark:text-slate-900 border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-slate-900/5 rounded-bl-full -mr-32 -mt-32" />
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Ready to test your skills?</h2>
          <p className="text-slate-400 dark:text-slate-600 font-medium text-lg max-w-xl mb-12">
            Put your knowledge into practice with our AI-powered IELTS examiner. Get instant feedback on your structure, vocabulary, and grammar.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl">
              Start Practice Session
            </button>
            <button className="px-10 py-5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 rounded-full font-black uppercase tracking-widest text-xs hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors">
              Browse More Topics
            </button>
          </div>
        </section>
      </main>

      <footer className="w-full py-16 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 px-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-display font-black text-xl tracking-tighter text-slate-900 dark:text-slate-50">
                Jaxtina<span className="text-jaxtina-red italic">Tutor.</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 -mt-1">Powered by Claude AI</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-center md:text-left">
            © 2024 Jaxtina English Group. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
