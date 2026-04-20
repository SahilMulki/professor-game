export default function StatBar({ label, value, color, showDelta }) {
  return (
    <div className="stat-bar">
      <div className="stat-bar-header">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{Math.round(value)}%</span>
        {showDelta !== undefined && showDelta !== 0 && (
          <span className={`stat-delta ${showDelta > 0 ? 'delta-pos' : 'delta-neg'}`}>
            {showDelta > 0 ? '+' : ''}{Math.round(showDelta)}
          </span>
        )}
      </div>
      <div className="stat-track">
        <div
          className="stat-fill"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
        />
      </div>
    </div>
  )
}
