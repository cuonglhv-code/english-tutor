'use client'

/**
 * VOCABULARY CHALLENGE PAGE
 * Senior Engineer Note: Standardized on iframe src to public/ for better performance,
 * easier CSP management, and native UTF-8 support for Vietnamese text.
 */
export default function VocabularyChallengePage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 font-sans relative">
      {/* Guest Mode Indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Guest session · data not saved</span>
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
