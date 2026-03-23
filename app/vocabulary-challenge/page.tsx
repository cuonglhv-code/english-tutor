'use client'

/**
 * VOCABULARY CHALLENGE PAGE
 * Senior Engineer Note: Standardized on iframe src to public/ for better performance,
 * easier CSP management, and native UTF-8 support for Vietnamese text.
 */
export default function VocabularyChallengePage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 font-sans">
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
