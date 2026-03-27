"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Writing101Tabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/en/writing-101" },
    { name: "Guide", href: "/en/writing-101/guide" },
    { name: "Vocab", href: "/en/writing-101/vocab" },
  ];

  return (
    <nav className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap border ${
              isActive
                ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 shadow-md scale-[1.02]"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:border-slate-500"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
