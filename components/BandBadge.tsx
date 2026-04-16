export function BandBadge({ score, criterion }: { score: number, criterion: string }) {
  const colour = score >= 8 ? '#FFD700' : score >= 7 ? '#00D4B1' 
               : score >= 6 ? '#6C63FF' : score >= 5 ? '#FF8C42' 
               : '#FF4F6B';
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        style={{ 
          border: `2px solid ${colour}`,
          boxShadow: `0 0 20px ${colour}40, inset 0 0 12px ${colour}15`
        }}
        className="w-16 h-16 rounded-full flex items-center justify-center bg-surface"
      >
        <span style={{ color: colour }} className="font-mono text-2xl font-bold">{score}</span>
      </div>
      <span className="text-xs text-textMuted font-semibold uppercase tracking-widest">{criterion}</span>
    </div>
  );
}
