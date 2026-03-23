'use client'

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * VOCABULARY CHALLENGE PAGE
 * Senior Engineer Note: Standardized on iframe src to public/ for better performance,
 * easier CSP management, and native UTF-8 support for Vietnamese text.
 */
export default function VocabularyChallengePage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 font-sans">
      {/* Floating Back Button */}
      <Link
        href="/experience"
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full backdrop-blur-md transition-all text-sm font-medium border border-slate-700 shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Experience
      </Link>

      <iframe
        src="/vocabulary-game.html"
        className="w-full h-full border-0"
        title="Vocabulary Challenge"
        // Ensure same-origin is allowed for local storage/SRS logic to work
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
