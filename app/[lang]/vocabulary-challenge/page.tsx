'use client'

/**
 * VOCABULARY CHALLENGE PAGE
 * Senior Engineer Note: Standardized on iframe src to public/ for better performance,
 * easier CSP management, and native UTF-8 support for Vietnamese text.
 */
export default function VocabularyChallengePage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAFAF8] font-sans relative">
      {/* Guest Mode Indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all hover:scale-105">
        <div className="px-5 py-2 bg-[#26A69A]/10 backdrop-blur-md border border-[#26A69A]/20 rounded-full flex items-center gap-3 shadow-lg shadow-[#26A69A]/5">
          <div className="w-2 h-2 rounded-full bg-[#26A69A] animate-pulse" />
          <span className="text-[10px] font-black text-[#26A69A] uppercase tracking-[0.2em]">Guest Mode · Practice Only</span>
        </div>
      </div>
      <iframe
        src="/vocabulary-game.html"
        className="w-full h-full border-0"
        title="Vocabulary Challenge"
        // Ensure same-origin and top-navigation are allowed for global navigation to work
        sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation"
      />
    </div>
  );
}
