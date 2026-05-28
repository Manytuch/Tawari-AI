export default function HospitalCard({ hospital, rank }) {
  const isNearest = rank === 0;

  return (
    <div className={`
      p-4 rounded-xl border transition-colors duration-200
      ${isNearest
        ? 'bg-green-950/30 border-green-800/60 hover:border-green-600'
        : 'bg-rescue-panel border-rescue-border hover:border-gray-600'}
    `}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isNearest && (
              <span className="text-xs font-mono text-green-400 uppercase tracking-wider">
                ★ Recommended
              </span>
            )}
          </div>
          <h4 className={`font-display font-bold text-sm ${isNearest ? 'text-green-300' : 'text-white'} truncate`}>
            {hospital.name}
          </h4>
          <p className="text-xs text-rescue-muted mt-0.5">
            {hospital.city} · {hospital.type.replace('_', ' ')}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`font-display font-bold text-lg ${isNearest ? 'text-green-400' : 'text-gray-300'}`}>
            {hospital.distance_km} km
          </div>
          <div className="text-xs text-rescue-muted">~{hospital.estimated_minutes} min</div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {hospital.has_emergency && (
          <span className="px-2 py-0.5 bg-red-950/50 border border-red-900/50 text-red-400 text-xs rounded-full font-mono">
            🚨 Emergency
          </span>
        )}
        {hospital.has_surgery && (
          <span className="px-2 py-0.5 bg-blue-950/50 border border-blue-900/50 text-blue-400 text-xs rounded-full font-mono">
            ⚕ Surgery
          </span>
        )}
        {hospital.has_blood_bank && (
          <span className="px-2 py-0.5 bg-purple-950/50 border border-purple-900/50 text-purple-400 text-xs rounded-full font-mono">
            🩸 Blood Bank
          </span>
        )}
        <span className="px-2 py-0.5 bg-rescue-dark border border-rescue-border text-rescue-muted text-xs rounded-full font-mono">
          🕐 {hospital.operating_hours}
        </span>
      </div>

      {/* Phone */}
      {hospital.phone && (
        <a
          href={`tel:${hospital.phone}`}
          className={`
            mt-3 flex items-center gap-2 text-xs font-mono
            ${isNearest ? 'text-green-400 hover:text-green-300' : 'text-rescue-muted hover:text-white'}
            transition-colors
          `}
        >
          📞 {hospital.phone}
        </a>
      )}
    </div>
  );
}
