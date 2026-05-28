export default function FirstAidPanel({ steps = [], injuryType, aiNotes, dispatchImmediately }) {
  if (!steps.length) return null;

  const parsedSteps = typeof steps === 'string' ? JSON.parse(steps) : steps;

  return (
    <div className="bg-rescue-panel border border-rescue-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-white text-lg">First Aid Instructions</h3>
          {injuryType && (
            <p className="text-xs text-rescue-muted mt-0.5 font-mono">{injuryType}</p>
          )}
        </div>
        {dispatchImmediately && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950 border border-red-800 text-red-400 text-xs font-mono rounded-full animate-pulse-slow">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            DISPATCH NOW
          </span>
        )}
      </div>

      {/* Steps */}
      <ol className="space-y-3">
        {parsedSteps.map((step, i) => (
          <li key={i} className="flex gap-4 group">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-rescue-red/20 border border-rescue-red/40 flex items-center justify-center">
              <span className="font-mono font-bold text-rescue-red text-xs">{i + 1}</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed pt-0.5">{step}</p>
          </li>
        ))}
      </ol>

      {/* AI notes */}
      {aiNotes && (
        <div className="mt-5 p-4 bg-yellow-950/40 border border-yellow-900/60 rounded-lg">
          <p className="text-xs font-mono text-yellow-500 uppercase tracking-wider mb-1">⚠ Clinical Note</p>
          <p className="text-yellow-200/80 text-sm">{aiNotes}</p>
        </div>
      )}
    </div>
  );
}
