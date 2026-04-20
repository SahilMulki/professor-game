export default function SpeedControls({ speed, onSpeedChange, isPaused, onPauseToggle }) {
  return (
    <div className="speed-controls">
      <button
        className={`btn btn-sm ${isPaused ? 'btn-primary' : 'btn-ghost'}`}
        onClick={onPauseToggle}
      >
        {isPaused ? '▶ Resume' : '⏸ Pause'}
      </button>
      {[1, 2, 5].map(s => (
        <button
          key={s}
          className={`btn btn-sm ${speed === s ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onSpeedChange(s)}
        >
          {s}×
        </button>
      ))}
    </div>
  )
}
