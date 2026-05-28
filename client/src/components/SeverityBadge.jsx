const CONFIG = {
  5: { label: 'CRITICAL',    bg: 'bg-red-950',    border: 'border-red-700',    text: 'text-red-400',    glow: 'shadow-red-900/60' },
  4: { label: 'SERIOUS',     bg: 'bg-orange-950', border: 'border-orange-700', text: 'text-orange-400', glow: 'shadow-orange-900/60' },
  3: { label: 'MODERATE',    bg: 'bg-yellow-950', border: 'border-yellow-700', text: 'text-yellow-400', glow: 'shadow-yellow-900/60' },
  2: { label: 'MINOR',       bg: 'bg-green-950',  border: 'border-green-700',  text: 'text-green-400',  glow: 'shadow-green-900/60' },
  1: { label: 'OBSERVATION', bg: 'bg-blue-950',   border: 'border-blue-700',   text: 'text-blue-400',   glow: 'shadow-blue-900/60' },
};

export default function SeverityBadge({ score, large = false }) {
  const c = CONFIG[score] || CONFIG[3];
  return (
    <div className={`
      inline-flex flex-col items-center justify-center
      ${large ? 'w-28 h-28 rounded-2xl' : 'w-16 h-16 rounded-xl'}
      ${c.bg} border-2 ${c.border}
      shadow-xl ${c.glow}
    `}>
      <span className={`font-display font-extrabold ${large ? 'text-5xl' : 'text-2xl'} ${c.text} severity-${score}`}>
        {score}
      </span>
      <span className={`font-mono ${large ? 'text-xs' : 'text-[9px]'} ${c.text} tracking-widest uppercase mt-0.5`}>
        {c.label}
      </span>
    </div>
  );
}
